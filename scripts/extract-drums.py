#!/usr/bin/env python3
"""extract-drums.py — Onset detection + spectral band splitting + MFCC clustering.

Usage: python3 scripts/extract-drums.py <drums-stem.wav> [output-dir]

Splits the Demucs drums stem into:
  - kick/    (onsets with energy < 200 Hz)
  - snare/   (onsets with energy 200–6000 Hz)
  - hat/     (onsets with energy > 6000 Hz)

Each onset is sliced, normalized, and saved as a numbered WAV.
Outputs metadata to <output-dir>/drums-metadata.json.

Requires: librosa, numpy, scipy, scikit-learn
"""

import sys
import os
import json
import numpy as np


def main():
    import librosa
    import soundfile as sf
    from scipy.signal import butter, sosfilt
    from sklearn.cluster import KMeans

    if len(sys.argv) < 2:
        print("Usage: extract-drums.py <drums-stem.wav> [output-dir]", file=sys.stderr)
        sys.exit(1)

    input_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else os.path.join(
        os.path.dirname(input_path) or '.', 'drums')

    os.makedirs(output_dir, exist_ok=True)
    for sub in ['kick', 'snare', 'hat']:
        os.makedirs(os.path.join(output_dir, sub), exist_ok=True)

    print(f"[drums] Loading {input_path}...")
    y, sr = librosa.load(input_path, sr=None, mono=True)
    duration = librosa.get_duration(y=y, sr=sr)
    print(f"[drums] Duration: {duration:.1f}s, SR: {sr}")

    # Onset detection
    print("[drums] Detecting onsets...")
    onset_frames = librosa.onset.onset_detect(
        y=y, sr=sr, backtrack=True, units='frames')
    onset_samples = librosa.frames_to_samples(onset_frames)
    print(f"[drums] Found {len(onset_samples)} onsets")

    if len(onset_samples) == 0:
        print("[drums] No onsets found — stem may be silent")
        with open(os.path.join(output_dir, 'drums-metadata.json'), 'w') as f:
            json.dump({'total_onsets': 0, 'kick': 0, 'snare': 0, 'hat': 0}, f, indent=2)
        return

    # Classify each onset by spectral centroid into kick/snare/hat
    # Slice length: 0.15s for drum hits
    slice_len = int(0.15 * sr)
    categories = {'kick': [], 'snare': [], 'hat': []}
    metadata_entries = []

    for i, onset in enumerate(onset_samples):
        end = min(onset + slice_len, len(y))
        segment = y[onset:end]
        if len(segment) < 512:
            continue

        # Compute spectral centroid of this segment
        centroid = librosa.feature.spectral_centroid(y=segment, sr=sr)
        mean_centroid = float(np.mean(centroid))

        # Classify
        if mean_centroid < 200:
            cat = 'kick'
        elif mean_centroid < 6000:
            cat = 'snare'
        else:
            cat = 'hat'

        categories[cat].append((i, onset, segment))
        metadata_entries.append({
            'index': i,
            'onset_sample': int(onset),
            'onset_sec': round(float(onset) / sr, 4),
            'centroid_hz': round(mean_centroid, 1),
            'category': cat,
        })

    # Write sliced samples
    counts = {}
    for cat, slices in categories.items():
        counts[cat] = len(slices)
        for j, (idx, onset, segment) in enumerate(slices):
            # Normalize
            peak = np.max(np.abs(segment))
            if peak > 0:
                segment = segment / peak * 0.95

            out_path = os.path.join(output_dir, cat, f'{cat}-{j:03d}.wav')
            sf.write(out_path, segment, sr, subtype='PCM_16')

    total = sum(counts.values())
    print(f"[drums] Extracted {total} hits: "
          f"{counts.get('kick', 0)} kick, "
          f"{counts.get('snare', 0)} snare, "
          f"{counts.get('hat', 0)} hat")

    meta = {
        'total_onsets': total,
        **counts,
        'slice_duration_sec': 0.15,
        'onsets': metadata_entries,
    }

    meta_path = os.path.join(output_dir, 'drums-metadata.json')
    with open(meta_path, 'w') as f:
        json.dump(meta, f, indent=2)
    print(f"[drums] Wrote {meta_path}")


if __name__ == '__main__':
    main()
