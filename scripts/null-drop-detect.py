#!/usr/bin/env python3
"""
null-drop-detect.py — Detect silence gaps (null drops) in rendered audio.

Scans a WAV/MP3/FLAC file for contiguous silence windows that indicate
composition gaps (cycle boundaries, arrange() seams, loopAt() splices).

Usage:
    python3 null-drop-detect.py <audio_file> [options]

Options:
    --window-ms     Window size in milliseconds (default: 100)
    --threshold     Max absolute amplitude to count as silence (default: 1e-5)
    --skip-ms       Skip first/last N ms for natural fade (default: 500)
    --min-gap-ms    Minimum gap duration to report (default: 50)
    --json          Output as JSON instead of human-readable
    --strict        Exit code 1 if ANY gap found (default: only if gap > 100ms)

Exit codes:
    0  No problematic null drops found
    1  Null drops detected (or --strict and any gap found)
    2  Error (file not found, unsupported format, etc.)

Examples:
    # Basic check
    python3 null-drop-detect.py output.wav

    # Strict mode for CI/QA gate
    python3 null-drop-detect.py output.wav --strict --json

    # Custom window for fine-grained detection
    python3 null-drop-detect.py output.wav --window-ms 50 --min-gap-ms 30

Dependencies: numpy, soundfile (both in strudel-music venv)
"""

import argparse
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf


def detect_null_drops(
    audio_path: str,
    window_ms: float = 100.0,
    threshold: float = 1e-5,
    skip_ms: float = 500.0,
    min_gap_ms: float = 50.0,
) -> dict:
    """
    Scan audio for silence gaps.

    Returns dict with:
        file: str — input path
        duration_s: float — total duration
        sample_rate: int
        channels: int
        gaps: list of {start_s, end_s, duration_ms, max_amplitude}
        summary: {total_gaps, total_silence_ms, longest_gap_ms}
    """
    path = Path(audio_path)
    if not path.exists():
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    # Read audio
    data, sr = sf.read(str(path), dtype="float64")

    # Mono mix if stereo (analyze combined energy)
    if data.ndim == 2:
        channels = data.shape[1]
        mono = np.max(np.abs(data), axis=1)  # peak across channels
    else:
        channels = 1
        mono = np.abs(data)

    total_samples = len(mono)
    duration_s = total_samples / sr

    # Calculate skip/window in samples
    skip_samples = int((skip_ms / 1000.0) * sr)
    window_samples = max(1, int((window_ms / 1000.0) * sr))
    min_gap_samples = max(1, int((min_gap_ms / 1000.0) * sr))

    # Define analysis region (skip head/tail)
    start_idx = min(skip_samples, total_samples)
    end_idx = max(start_idx, total_samples - skip_samples)

    if start_idx >= end_idx:
        return {
            "file": str(path),
            "duration_s": duration_s,
            "sample_rate": sr,
            "channels": channels,
            "gaps": [],
            "summary": {
                "total_gaps": 0,
                "total_silence_ms": 0.0,
                "longest_gap_ms": 0.0,
            },
        }

    # Slide through with non-overlapping windows, find silence regions
    # More efficient: find contiguous runs of below-threshold samples
    is_silent = mono[start_idx:end_idx] < threshold

    # Find contiguous silent regions using run-length encoding
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
                abs_end = i + start_idx
                gap_duration_ms = (gap_len / sr) * 1000.0
                # Get max amplitude in the gap region for diagnostics
                gap_max = float(np.max(mono[abs_start:abs_end]))
                gaps.append({
                    "start_s": round(abs_start / sr, 4),
                    "end_s": round(abs_end / sr, 4),
                    "duration_ms": round(gap_duration_ms, 1),
                    "max_amplitude": gap_max,
                })

    # Handle trailing gap
    if in_gap:
        gap_len = len(is_silent) - gap_start
        if gap_len >= min_gap_samples:
            abs_start = gap_start + start_idx
            abs_end = len(is_silent) + start_idx
            gap_duration_ms = (gap_len / sr) * 1000.0
            gap_max = float(np.max(mono[abs_start:abs_end]))
            gaps.append({
                "start_s": round(abs_start / sr, 4),
                "end_s": round(abs_end / sr, 4),
                "duration_ms": round(gap_duration_ms, 1),
                "max_amplitude": gap_max,
            })

    total_silence_ms = sum(g["duration_ms"] for g in gaps)
    longest_gap_ms = max((g["duration_ms"] for g in gaps), default=0.0)

    return {
        "file": str(path),
        "duration_s": round(duration_s, 3),
        "sample_rate": sr,
        "channels": channels,
        "gaps": gaps,
        "summary": {
            "total_gaps": len(gaps),
            "total_silence_ms": round(total_silence_ms, 1),
            "longest_gap_ms": round(longest_gap_ms, 1),
        },
    }


def format_human(result: dict) -> str:
    """Format results for human reading."""
    lines = []
    lines.append(f"File: {result['file']}")
    lines.append(
        f"Duration: {result['duration_s']:.1f}s | "
        f"{result['sample_rate']}Hz | "
        f"{result['channels']}ch"
    )
    lines.append("")

    if not result["gaps"]:
        lines.append("✅ No null drops detected.")
    else:
        s = result["summary"]
        lines.append(
            f"⚠️  {s['total_gaps']} null drop(s) found "
            f"({s['total_silence_ms']:.0f}ms total silence, "
            f"longest: {s['longest_gap_ms']:.0f}ms)"
        )
        lines.append("")
        lines.append("  Time         Duration   Max Amp")
        lines.append("  ------------ ---------- --------")
        for g in result["gaps"]:
            lines.append(
                f"  {g['start_s']:>7.2f}s     {g['duration_ms']:>6.1f}ms   "
                f"{g['max_amplitude']:.2e}"
            )

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="Detect silence gaps (null drops) in rendered audio."
    )
    parser.add_argument("audio_file", help="Path to audio file (WAV/MP3/FLAC)")
    parser.add_argument(
        "--window-ms",
        type=float,
        default=100.0,
        help="Window size in ms (default: 100)",
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=1e-5,
        help="Silence threshold (default: 1e-5)",
    )
    parser.add_argument(
        "--skip-ms",
        type=float,
        default=500.0,
        help="Skip first/last N ms (default: 500)",
    )
    parser.add_argument(
        "--min-gap-ms",
        type=float,
        default=50.0,
        help="Min gap to report in ms (default: 50)",
    )
    parser.add_argument(
        "--json", action="store_true", help="Output JSON"
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Exit 1 on ANY gap (not just >100ms)",
    )

    args = parser.parse_args()

    try:
        result = detect_null_drops(
            args.audio_file,
            window_ms=args.window_ms,
            threshold=args.threshold,
            skip_ms=args.skip_ms,
            min_gap_ms=args.min_gap_ms,
        )
    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(2)
    except Exception as e:
        print(f"Error analyzing audio: {e}", file=sys.stderr)
        sys.exit(2)

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(format_human(result))

    # Exit code logic
    if not result["gaps"]:
        sys.exit(0)

    if args.strict:
        sys.exit(1)

    # Default: exit 1 only if any gap > 100ms
    if result["summary"]["longest_gap_ms"] > 100.0:
        sys.exit(1)

    sys.exit(0)


if __name__ == "__main__":
    main()
