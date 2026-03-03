#!/usr/bin/env python3
"""
qa-gate.py — Post-render QA gate for Strudel compositions.

Runs 4 checks on a rendered audio file and returns structured diagnostics:
1. Null drops — silence gaps mid-track (delegates to null-drop-detect.py logic)
2. Spectral floor — flags if energy is concentrated below 320Hz (.slow() squash)
3. LUFS — warns if integrated loudness is outside -14 to -18 range
4. True peak — hard fail if any sample exceeds -1.0 dBFS

Usage:
    python3 qa-gate.py <audio_file> [options]

Options:
    --json          Output structured JSON (default: human-readable)
    --lufs-min      Minimum LUFS target (default: -18)
    --lufs-max      Maximum LUFS target (default: -14)
    --peak-limit    True peak dBFS limit (default: -1.0)
    --spectral-pct  Max % energy below 320Hz before flagging (default: 80)
    --spectral-hz   Frequency threshold for spectral floor (default: 320)

Exit codes:
    0  All checks pass
    1  One or more checks failed
    2  Hard fail (true peak clipping)
    3  Error (file not found, dependency missing, etc.)

Dependencies: numpy, soundfile, ffmpeg (for LUFS via ffprobe/loudnorm)
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf


# ── Check 1: Null Drops ──────────────────────────────────────────────

def check_null_drops(
    mono: np.ndarray,
    sr: int,
    threshold: float = 1e-5,
    skip_ms: float = 500.0,
    min_gap_ms: float = 50.0,
) -> dict:
    """Detect silence gaps in the audio signal."""
    total_samples = len(mono)
    skip_samples = int((skip_ms / 1000.0) * sr)
    min_gap_samples = max(1, int((min_gap_ms / 1000.0) * sr))

    start_idx = min(skip_samples, total_samples)
    end_idx = max(start_idx, total_samples - skip_samples)

    if start_idx >= end_idx:
        return {"status": "pass", "gaps": [], "total_silence_ms": 0.0}

    is_silent = mono[start_idx:end_idx] < threshold
    gaps = []
    in_gap = False
    gap_start = 0

    for i in range(len(is_silent)):
        if is_silent[i] and not in_gap:
            in_gap = True
            gap_start = i
        elif not is_silent[i] and in_gap:
            in_gap = False
            gap_len = i - gap_start
            if gap_len >= min_gap_samples:
                abs_start = gap_start + start_idx
                gap_duration_ms = (gap_len / sr) * 1000.0
                gaps.append({
                    "at": round(abs_start / sr, 2),
                    "duration_ms": round(gap_duration_ms, 1),
                })

    if in_gap:
        gap_len = len(is_silent) - gap_start
        if gap_len >= min_gap_samples:
            abs_start = gap_start + start_idx
            gap_duration_ms = (gap_len / sr) * 1000.0
            gaps.append({
                "at": round(abs_start / sr, 2),
                "duration_ms": round(gap_duration_ms, 1),
            })

    # Fail if any gap > 100ms
    has_problem = any(g["duration_ms"] > 100 for g in gaps)
    total_silence = sum(g["duration_ms"] for g in gaps)

    return {
        "status": "fail" if has_problem else ("warn" if gaps else "pass"),
        "gaps": gaps,
        "total_silence_ms": round(total_silence, 1),
    }


# ── Check 2: Spectral Floor ──────────────────────────────────────────

def check_spectral_floor(
    data: np.ndarray,
    sr: int,
    freq_threshold: float = 320.0,
    pct_limit: float = 80.0,
) -> dict:
    """Check if energy is concentrated below a frequency threshold."""
    # Mix to mono if stereo
    if data.ndim == 2:
        mono = np.mean(data, axis=1)
    else:
        mono = data

    # FFT
    n = len(mono)
    fft_mag = np.abs(np.fft.rfft(mono))
    freqs = np.fft.rfftfreq(n, d=1.0 / sr)

    # Total energy
    total_energy = np.sum(fft_mag ** 2)
    if total_energy == 0:
        return {"status": "fail", "pct_below_threshold": 100.0, "threshold_hz": freq_threshold}

    # Energy below threshold
    mask = freqs <= freq_threshold
    low_energy = np.sum(fft_mag[mask] ** 2)
    pct_below = (low_energy / total_energy) * 100.0

    status = "fail" if pct_below > pct_limit else "pass"
    return {
        "status": status,
        "pct_below_threshold": round(pct_below, 1),
        "threshold_hz": freq_threshold,
    }


# ── Check 3: LUFS ────────────────────────────────────────────────────

def check_lufs(
    audio_path: str,
    lufs_min: float = -18.0,
    lufs_max: float = -14.0,
) -> dict:
    """Measure integrated LUFS using ffmpeg loudnorm filter."""
    try:
        result = subprocess.run(
            [
                "ffmpeg", "-i", audio_path,
                "-af", "loudnorm=print_format=json",
                "-f", "null", "-"
            ],
            capture_output=True, text=True, timeout=60,
        )
        # Parse the loudnorm JSON from stderr
        stderr = result.stderr
        # Find the JSON block
        json_start = stderr.rfind("{")
        json_end = stderr.rfind("}") + 1
        if json_start == -1 or json_end == 0:
            return {"status": "error", "error": "Could not parse LUFS from ffmpeg output"}

        loudnorm_data = json.loads(stderr[json_start:json_end])
        lufs_value = float(loudnorm_data.get("input_i", "-inf"))
        lra = float(loudnorm_data.get("input_lra", "0"))
        true_peak_str = loudnorm_data.get("input_tp", "0")
        true_peak = float(true_peak_str)

        if lufs_value < lufs_min:
            status = "warn"  # Too quiet
        elif lufs_value > lufs_max:
            status = "warn"  # Too loud
        else:
            status = "pass"

        return {
            "status": status,
            "value": round(lufs_value, 1),
            "lra": round(lra, 1),
            "true_peak_dbfs": round(true_peak, 1),
            "target_range": [lufs_min, lufs_max],
        }
    except subprocess.TimeoutExpired:
        return {"status": "error", "error": "ffmpeg timed out"}
    except Exception as e:
        return {"status": "error", "error": str(e)}


# ── Check 4: True Peak ───────────────────────────────────────────────

def check_true_peak(
    data: np.ndarray,
    peak_limit_dbfs: float = -1.0,
) -> dict:
    """Check if any sample exceeds the true peak limit."""
    max_abs = np.max(np.abs(data))
    if max_abs == 0:
        peak_dbfs = -np.inf
    else:
        peak_dbfs = 20.0 * np.log10(max_abs)

    status = "hard_fail" if peak_dbfs > peak_limit_dbfs else "pass"
    return {
        "status": status,
        "value_dbfs": round(peak_dbfs, 1),
        "limit_dbfs": peak_limit_dbfs,
    }


# ── Suggestions Generator ────────────────────────────────────────────

def generate_suggestions(checks: dict) -> list:
    """Generate human-readable fix suggestions based on check results."""
    suggestions = []

    null_drops = checks.get("null_drops", {})
    if null_drops.get("status") in ("fail", "warn"):
        count = len(null_drops.get("gaps", []))
        suggestions.append(
            f"Null drops: {count} silence gap(s) detected — check cycle/arrange() "
            f"boundaries. Consider adding overlap or crossfade between sections."
        )

    spectral = checks.get("spectral_floor", {})
    if spectral.get("status") == "fail":
        pct = spectral.get("pct_below_threshold", 0)
        hz = spectral.get("threshold_hz", 320)
        suggestions.append(
            f"Spectral: {pct}% energy below {hz}Hz — likely .slow() frequency squash. "
            f"Add .speed(N) to compensate, or reduce .slow() divisor."
        )

    lufs = checks.get("lufs", {})
    if lufs.get("status") == "warn":
        value = lufs.get("value", 0)
        target = lufs.get("target_range", [-18, -14])
        if value < target[0]:
            suggestions.append(
                f"LUFS: {value} dB is below target range ({target[0]} to {target[1]}). "
                f"Consider increasing gain or applying loudnorm normalization."
            )
        else:
            suggestions.append(
                f"LUFS: {value} dB exceeds target range ({target[0]} to {target[1]}). "
                f"Consider reducing gain."
            )

    true_peak = checks.get("true_peak", {})
    if true_peak.get("status") == "hard_fail":
        value = true_peak.get("value_dbfs", 0)
        limit = true_peak.get("limit_dbfs", -1.0)
        suggestions.append(
            f"TRUE PEAK CLIPPING: {value} dBFS exceeds {limit} dBFS limit. "
            f"Reduce gain immediately — this MUST be fixed before posting."
        )

    return suggestions


# ── Main ──────────────────────────────────────────────────────────────

def run_qa_gate(
    audio_path: str,
    lufs_min: float = -18.0,
    lufs_max: float = -14.0,
    peak_limit: float = -1.0,
    spectral_pct: float = 80.0,
    spectral_hz: float = 320.0,
) -> dict:
    """Run all QA checks and return structured results."""
    path = Path(audio_path)
    if not path.exists():
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    # Load audio
    data, sr = sf.read(str(path), dtype="float64")

    # Prepare mono for null-drop check
    if data.ndim == 2:
        mono = np.max(np.abs(data), axis=1)
    else:
        mono = np.abs(data)

    duration_s = len(mono) / sr
    channels = data.shape[1] if data.ndim == 2 else 1

    # Run all checks
    checks = {
        "null_drops": check_null_drops(mono, sr),
        "spectral_floor": check_spectral_floor(data, sr, spectral_hz, spectral_pct),
        "lufs": check_lufs(str(path), lufs_min, lufs_max),
        "true_peak": check_true_peak(data, peak_limit),
    }

    # Overall pass/fail
    statuses = [c.get("status", "error") for c in checks.values()]
    if "hard_fail" in statuses:
        overall = "hard_fail"
    elif "fail" in statuses or "error" in statuses:
        overall = "fail"
    elif "warn" in statuses:
        overall = "warn"
    else:
        overall = "pass"

    suggestions = generate_suggestions(checks)

    return {
        "file": str(path),
        "duration_s": round(duration_s, 3),
        "sample_rate": sr,
        "channels": channels,
        "pass": overall == "pass",
        "overall": overall,
        "checks": checks,
        "suggestions": suggestions,
    }


def format_human(result: dict) -> str:
    """Format QA results for human reading."""
    lines = []
    lines.append(f"╔══ QA Gate: {result['file']}")
    lines.append(f"║  Duration: {result['duration_s']:.1f}s | {result['sample_rate']}Hz | {result['channels']}ch")
    lines.append("║")

    status_icons = {
        "pass": "✅",
        "warn": "⚠️ ",
        "fail": "❌",
        "hard_fail": "🛑",
        "error": "💥",
    }

    for name, check in result["checks"].items():
        icon = status_icons.get(check.get("status", "error"), "?")
        label = name.replace("_", " ").title()

        if name == "null_drops":
            gap_count = len(check.get("gaps", []))
            silence = check.get("total_silence_ms", 0)
            detail = f"{gap_count} gaps ({silence:.0f}ms total)"
        elif name == "spectral_floor":
            pct = check.get("pct_below_threshold", 0)
            hz = check.get("threshold_hz", 320)
            detail = f"{pct:.0f}% below {hz}Hz"
        elif name == "lufs":
            if "error" in check:
                detail = check["error"]
            else:
                val = check.get("value", 0)
                lra = check.get("lra", 0)
                detail = f"{val:.1f} LUFS (LRA {lra:.1f})"
        elif name == "true_peak":
            val = check.get("value_dbfs", 0)
            detail = f"{val:.1f} dBFS"
        else:
            detail = str(check)

        lines.append(f"║  {icon} {label}: {detail}")

    lines.append("║")
    overall_icon = status_icons.get(result["overall"], "?")
    lines.append(f"║  {overall_icon} Overall: {result['overall'].upper()}")

    if result["suggestions"]:
        lines.append("║")
        lines.append("║  Suggestions:")
        for s in result["suggestions"]:
            lines.append(f"║    → {s}")

    lines.append("╚" + "═" * 60)
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="Post-render QA gate for Strudel compositions."
    )
    parser.add_argument("audio_file", help="Path to rendered audio file")
    parser.add_argument("--json", action="store_true", help="Output JSON")
    parser.add_argument("--lufs-min", type=float, default=-18.0)
    parser.add_argument("--lufs-max", type=float, default=-14.0)
    parser.add_argument("--peak-limit", type=float, default=-1.0)
    parser.add_argument("--spectral-pct", type=float, default=80.0)
    parser.add_argument("--spectral-hz", type=float, default=320.0)

    args = parser.parse_args()

    try:
        result = run_qa_gate(
            args.audio_file,
            lufs_min=args.lufs_min,
            lufs_max=args.lufs_max,
            peak_limit=args.peak_limit,
            spectral_pct=args.spectral_pct,
            spectral_hz=args.spectral_hz,
        )
    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(3)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(3)

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(format_human(result))

    # Exit codes: 0=pass, 1=fail/warn, 2=hard_fail, 3=error
    if result["overall"] == "pass":
        sys.exit(0)
    elif result["overall"] == "hard_fail":
        sys.exit(2)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
