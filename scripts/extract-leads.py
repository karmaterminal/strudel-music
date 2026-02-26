#!/usr/bin/env python3
"""extract-leads.py — pYIN pitch tracking + per-note slicing on "other" stem.

Usage: python3 scripts/extract-leads.py <other-stem.wav> [output-dir]

Detects pitched note onsets in the Demucs "other" stem (synths, guitars,
keys, etc.), slices each note, and writes them as numbered WAVs.

Outputs:
  <output-dir>/leads/lead-NNN.wav   — individual note samples
  <output-dir>/leads-metadata.json  — pitch, onset, duration per note

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
        print("Usage: extract-leads.py <other-stem.wav> [output-dir]", file=sys.stderr)
        sys.exit(1)

    input_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else os.path.join(
        os.path.dirname(input_path) or '.', 'leads')

    leads_dir = os.path.join(output_dir, 'leads') if not output_dir.endswith('leads') else output_dir
    os.makedirs(leads_dir, exist_ok=True)

    print(f"[leads] Loading {input_path}...")
    y, sr = librosa.load(input_path, sr=None, mono=True)
    duration = librosa.get_duration(y=y, sr=sr)
    print(f"[leads] Duration: {duration:.1f}s, SR: {sr}")

    # pYIN pitch tracking — wider range for leads
    print("[leads] Running pYIN pitch tracking...")
    f0, voiced_flag, voiced_probs = librosa.pyin(
        y, fmin=librosa.note_to_hz('C2'),
        fmax=librosa.note_to_hz('C7'),
        sr=sr)

    # Onset detection
    print("[leads] Detecting onsets...")
    onset_frames = librosa.onset.onset_detect(
        y=y, sr=sr, backtrack=True, units='frames')
    onset_samples = librosa.frames_to_samples(onset_frames)

    if len(onset_samples) == 0:
        print("[leads] No onsets found — stem may be silent")
        meta_path = os.path.join(output_dir, 'leads-metadata.json')
        with open(meta_path, 'w') as f:
            json.dump({'total_notes': 0, 'notes': []}, f, indent=2)
        return

    # Determine note boundaries
    notes = []
    for i, onset in enumerate(onset_samples):
        end = onset_samples[i + 1] if i + 1 < len(onset_samples) else len(y)

        # Cap at 4 seconds for lead phrases
        max_len = int(4.0 * sr)
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

        out_path = os.path.join(leads_dir, f'lead-{i:03d}.wav')
        sf.write(out_path, segment, sr, subtype='PCM_16')

        notes.append({
            'index': i,
            'onset_sample': int(onset),
            'onset_sec': round(float(onset) / sr, 4),
            'duration_sec': round(float(end - onset) / sr, 4),
            'pitch_hz': round(pitch_hz, 2) if pitch_hz else None,
            'note': note_name,
            'midi': midi,
            'file': f'lead-{i:03d}.wav',
        })

    print(f"[leads] Extracted {len(notes)} lead notes")

    meta = {
        'total_notes': len(notes),
        'notes': notes,
    }

    meta_path = os.path.join(output_dir, 'leads-metadata.json')
    with open(meta_path, 'w') as f:
        json.dump(meta, f, indent=2)
    print(f"[leads] Wrote {meta_path}")


if __name__ == '__main__':
    main()
