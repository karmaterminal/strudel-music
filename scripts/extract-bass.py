#!/usr/bin/env python3
"""extract-bass.py — pYIN pitch tracking + per-note sample slicing on bass stem.

Usage: python3 scripts/extract-bass.py <bass-stem.wav> [output-dir]

Detects pitched note onsets in the Demucs bass stem, slices each note,
and writes them as numbered WAVs with pitch metadata.

Outputs:
  <output-dir>/bass/bass-NNN.wav  — individual note samples
  <output-dir>/bass-metadata.json — pitch, onset, duration per note

Requires: librosa, numpy, soundfile
"""

import sys
import os
import json
import numpy as np


def main():
    import librosa
    import soundfile as sf

    if len(sys.argv) < 2:
        print("Usage: extract-bass.py <bass-stem.wav> [output-dir]", file=sys.stderr)
        sys.exit(1)

    input_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else os.path.join(
        os.path.dirname(input_path) or '.', 'bass')

    bass_dir = os.path.join(output_dir, 'bass') if not output_dir.endswith('bass') else output_dir
    os.makedirs(bass_dir, exist_ok=True)

    print(f"[bass] Loading {input_path}...")
    y, sr = librosa.load(input_path, sr=None, mono=True)
    duration = librosa.get_duration(y=y, sr=sr)
    print(f"[bass] Duration: {duration:.1f}s, SR: {sr}")

    # pYIN pitch tracking
    print("[bass] Running pYIN pitch tracking...")
    f0, voiced_flag, voiced_probs = librosa.pyin(
        y, fmin=librosa.note_to_hz('C1'),
        fmax=librosa.note_to_hz('C4'),
        sr=sr)

    # Onset detection
    print("[bass] Detecting onsets...")
    onset_frames = librosa.onset.onset_detect(
        y=y, sr=sr, backtrack=True, units='frames')
    onset_samples = librosa.frames_to_samples(onset_frames)

    if len(onset_samples) == 0:
        print("[bass] No onsets found — stem may be silent")
        meta_path = os.path.join(output_dir, 'bass-metadata.json')
        with open(meta_path, 'w') as f:
            json.dump({'total_notes': 0, 'notes': []}, f, indent=2)
        return

    # Determine note boundaries: each onset to next onset (or end)
    notes = []
    for i, onset in enumerate(onset_samples):
        end = onset_samples[i + 1] if i + 1 < len(onset_samples) else len(y)

        # Cap at 2 seconds for bass notes
        max_len = int(2.0 * sr)
        end = min(end, onset + max_len)

        segment = y[onset:end]
        if len(segment) < 512:
            continue

        # Get pitch at onset frame
        onset_frame = librosa.samples_to_frames(onset)
        if onset_frame < len(f0) and not np.isnan(f0[onset_frame]):
            pitch_hz = float(f0[onset_frame])
            note_name = librosa.hz_to_note(pitch_hz)
            midi = int(librosa.hz_to_midi(pitch_hz))
        else:
            pitch_hz = None
            note_name = 'unknown'
            midi = None

        # Normalize
        peak = np.max(np.abs(segment))
        if peak > 0:
            segment = segment / peak * 0.95

        out_path = os.path.join(bass_dir, f'bass-{i:03d}.wav')
        sf.write(out_path, segment, sr, subtype='PCM_16')

        notes.append({
            'index': i,
            'onset_sample': int(onset),
            'onset_sec': round(float(onset) / sr, 4),
            'duration_sec': round(float(end - onset) / sr, 4),
            'pitch_hz': round(pitch_hz, 2) if pitch_hz else None,
            'note': note_name,
            'midi': midi,
            'file': f'bass-{i:03d}.wav',
        })

    print(f"[bass] Extracted {len(notes)} bass notes")

    meta = {
        'total_notes': len(notes),
        'notes': notes,
    }

    meta_path = os.path.join(output_dir, 'bass-metadata.json')
    with open(meta_path, 'w') as f:
        json.dump(meta, f, indent=2)
    print(f"[bass] Wrote {meta_path}")


if __name__ == '__main__':
    main()
