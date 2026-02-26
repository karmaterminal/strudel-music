#!/usr/bin/env python3
"""analyze-bpm-key.py — BPM detection + Krumhansl-Schmuckler key finding.

Usage: python3 scripts/analyze-bpm-key.py <input.wav|mp3> [output-dir]

Outputs:
  <output-dir>/analysis.json — { bpm, key, scale, confidence, duration_sec }

Requires: librosa, numpy (available in audio-pipeline-venv)
"""

import sys
import os
import json
import numpy as np

def detect_key(y, sr):
    """Krumhansl-Schmuckler key-finding algorithm via chroma correlation."""
    import librosa

    # Krumhansl-Kessler key profiles
    major_profile = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09,
                              2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
    minor_profile = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53,
                              2.54, 4.75, 3.98, 2.69, 3.34, 3.17])

    pitch_names = ['C', 'C#', 'D', 'D#', 'E', 'F',
                   'F#', 'G', 'G#', 'A', 'A#', 'B']

    # Compute mean chroma
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    chroma_mean = np.mean(chroma, axis=1)

    best_corr = -2
    best_key = 'C'
    best_scale = 'major'

    for shift in range(12):
        rotated = np.roll(chroma_mean, -shift)

        corr_major = np.corrcoef(rotated, major_profile)[0, 1]
        if corr_major > best_corr:
            best_corr = corr_major
            best_key = pitch_names[shift]
            best_scale = 'major'

        corr_minor = np.corrcoef(rotated, minor_profile)[0, 1]
        if corr_minor > best_corr:
            best_corr = corr_minor
            best_key = pitch_names[shift]
            best_scale = 'minor'

    return best_key, best_scale, float(best_corr)


def main():
    import librosa

    if len(sys.argv) < 2:
        print("Usage: analyze-bpm-key.py <input> [output-dir]", file=sys.stderr)
        sys.exit(1)

    input_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(input_path) or '.'

    os.makedirs(output_dir, exist_ok=True)

    print(f"[analyze] Loading {input_path}...")
    y, sr = librosa.load(input_path, sr=None, mono=True)
    duration = librosa.get_duration(y=y, sr=sr)

    print(f"[analyze] Duration: {duration:.1f}s, SR: {sr}")

    # BPM detection
    print("[analyze] Detecting BPM...")
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
    # librosa may return array; extract scalar
    bpm = float(np.atleast_1d(tempo)[0])
    print(f"[analyze] BPM: {bpm:.1f}")

    # Key detection
    print("[analyze] Detecting key...")
    key, scale, confidence = detect_key(y, sr)
    print(f"[analyze] Key: {key} {scale} (confidence: {confidence:.3f})")

    result = {
        'bpm': round(bpm, 1),
        'key': key,
        'scale': scale,
        'key_confidence': round(confidence, 4),
        'duration_sec': round(duration, 2),
        'sample_rate': sr,
        'beat_count': len(beat_frames),
    }

    out_path = os.path.join(output_dir, 'analysis.json')
    with open(out_path, 'w') as f:
        json.dump(result, f, indent=2)

    print(f"[analyze] Wrote {out_path}")
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
