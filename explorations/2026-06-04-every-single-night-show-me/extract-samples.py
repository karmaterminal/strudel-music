#!/usr/bin/env python3
"""
Sample-as-instrument extraction pipeline.

For each demucs stem:
1. Onset detection (librosa)
2. Slice transients into individual wav samples
3. Compute spectral features per sample (centroid, bandwidth, MFCCs, rms)
4. Save metadata JSON for sample-keymap construction

Output:
    samples/<track>/<stem>/sample_NNN.wav (one per onset, ~50-200 per stem)
    samples/<track>/<stem>/metadata.json (features per sample)
"""

import json
import os
from pathlib import Path
import librosa
import numpy as np
import soundfile as sf

BASE = Path(__file__).parent
STEMS = BASE / "stems" / "htdemucs"
OUT = BASE / "samples"

# Per-stem onset-detection params: drums needs tighter, vocals/other gentler
STEM_PARAMS = {
    "drums": {"delta": 0.07, "wait": 5, "min_len_ms": 60, "max_len_ms": 400},
    "bass": {"delta": 0.10, "wait": 12, "min_len_ms": 120, "max_len_ms": 800},
    "vocals": {"delta": 0.10, "wait": 8, "min_len_ms": 100, "max_len_ms": 600},
    "other": {"delta": 0.08, "wait": 6, "min_len_ms": 80, "max_len_ms": 500},
}


def extract_features(y, sr):
    """Spectral fingerprint for one short sample."""
    if len(y) < 512:
        return None
    feats = {
        "duration_ms": int(1000 * len(y) / sr),
        "rms": float(np.mean(librosa.feature.rms(y=y))),
        "centroid_hz": float(np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))),
        "bandwidth_hz": float(np.mean(librosa.feature.spectral_bandwidth(y=y, sr=sr))),
        "rolloff_hz": float(np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr))),
        "flatness": float(np.mean(librosa.feature.spectral_flatness(y=y))),
        "zcr": float(np.mean(librosa.feature.zero_crossing_rate(y=y))),
    }
    # MFCC top 4 mean
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=4)
    feats["mfcc"] = [float(x) for x in np.mean(mfcc, axis=1)]
    # Pitch estimate (only meaningful for tonal samples)
    try:
        pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
        pitch_mask = magnitudes > np.median(magnitudes) * 2
        if np.any(pitch_mask):
            pitch_hz = float(np.median(pitches[pitch_mask]))
            feats["pitch_hz"] = pitch_hz
            if pitch_hz > 0:
                feats["pitch_midi"] = float(librosa.hz_to_midi(pitch_hz))
        else:
            feats["pitch_hz"] = None
            feats["pitch_midi"] = None
    except Exception:
        feats["pitch_hz"] = None
        feats["pitch_midi"] = None
    return feats


def slice_stem(stem_path: Path, out_dir: Path, params: dict):
    print(f"  loading {stem_path.name}...", flush=True)
    y, sr = librosa.load(str(stem_path), sr=None, mono=True)
    duration = len(y) / sr
    print(f"  loaded {duration:.1f}s @ {sr}Hz, detecting onsets...", flush=True)

    # Onset detection: spectral-flux-based
    onset_frames = librosa.onset.onset_detect(
        y=y,
        sr=sr,
        units="frames",
        delta=params["delta"],
        wait=params["wait"],
        pre_avg=10,
        post_avg=10,
        pre_max=5,
        post_max=5,
    )
    onset_times = librosa.frames_to_time(onset_frames, sr=sr)
    print(f"  detected {len(onset_times)} onsets", flush=True)

    min_len = int(params["min_len_ms"] / 1000 * sr)
    max_len = int(params["max_len_ms"] / 1000 * sr)

    out_dir.mkdir(parents=True, exist_ok=True)
    samples_meta = []

    for i, onset_t in enumerate(onset_times):
        start = int(onset_t * sr)
        # End is either next onset OR max_len, whichever is sooner
        if i + 1 < len(onset_times):
            next_start = int(onset_times[i + 1] * sr)
            end = min(next_start, start + max_len)
        else:
            end = min(len(y), start + max_len)
        if end - start < min_len:
            continue
        sample = y[start:end]
        # Apply a small fade-out to avoid clicks
        fade_len = min(int(0.005 * sr), len(sample) // 4)
        if fade_len > 0:
            fade = np.linspace(1, 0, fade_len)
            sample[-fade_len:] *= fade
        sample_path = out_dir / f"sample_{i:04d}.wav"
        sf.write(sample_path, sample, sr, subtype="PCM_16")
        feats = extract_features(sample, sr)
        if feats:
            feats["index"] = i
            feats["onset_time_s"] = float(onset_t)
            feats["filename"] = sample_path.name
            samples_meta.append(feats)

    # Save metadata
    meta = {
        "stem": stem_path.stem,
        "source_duration_s": duration,
        "sample_rate": sr,
        "n_samples": len(samples_meta),
        "params": params,
        "samples": samples_meta,
    }
    with open(out_dir / "metadata.json", "w") as f:
        json.dump(meta, f, indent=2)
    print(f"  wrote {len(samples_meta)} samples + metadata to {out_dir}", flush=True)
    return meta


def main():
    summary = {}
    for track_dir in sorted(STEMS.iterdir()):
        if not track_dir.is_dir():
            continue
        track_name = track_dir.name
        print(f"\n=== {track_name} ===", flush=True)
        track_summary = {}
        for stem_name, params in STEM_PARAMS.items():
            stem_path = track_dir / f"{stem_name}.wav"
            if not stem_path.exists():
                print(f"  SKIP {stem_name} (not found)", flush=True)
                continue
            out_dir = OUT / track_name / stem_name
            meta = slice_stem(stem_path, out_dir, params)
            track_summary[stem_name] = {
                "n_samples": meta["n_samples"],
                "duration_s": meta["source_duration_s"],
            }
        summary[track_name] = track_summary

    summary_path = OUT / "summary.json"
    OUT.mkdir(parents=True, exist_ok=True)
    with open(summary_path, "w") as f:
        json.dump(summary, f, indent=2)
    print(f"\n=== SUMMARY ===", flush=True)
    print(json.dumps(summary, indent=2), flush=True)


if __name__ == "__main__":
    main()
