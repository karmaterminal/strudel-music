#!/usr/bin/env python3
"""Analyze BPM and musical key of an audio file using librosa."""

import sys
import librosa
import numpy as np

def analyze(path):
    print(f"Loading: {path}")
    y, sr = librosa.load(path, sr=None)
    duration = librosa.get_duration(y=y, sr=sr)
    print(f"Duration: {duration:.1f}s ({int(duration//60)}:{int(duration%60):02d})")
    print(f"Sample rate: {sr} Hz")
    print()

    # BPM
    print("Analyzing tempo...")
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
    if hasattr(tempo, '__len__'):
        tempo = tempo[0]
    print(f"Estimated BPM: {tempo:.1f}")
    print()

    # Key detection via chroma
    print("Analyzing key...")
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    chroma_avg = np.mean(chroma, axis=1)

    pitch_classes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

    # Krumhansl-Kessler key profiles
    major_profile = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
    minor_profile = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])

    best_corr = -1
    best_key = ""
    best_mode = ""

    for i in range(12):
        major_r = np.corrcoef(chroma_avg, np.roll(major_profile, i))[0, 1]
        minor_r = np.corrcoef(chroma_avg, np.roll(minor_profile, i))[0, 1]

        if major_r > best_corr:
            best_corr = major_r
            best_key = pitch_classes[i]
            best_mode = "major"
        if minor_r > best_corr:
            best_corr = minor_r
            best_key = pitch_classes[i]
            best_mode = "minor"

    print(f"Estimated key: {best_key} {best_mode} (correlation: {best_corr:.3f})")
    print()

    # Chroma distribution
    print("Chroma energy distribution:")
    sorted_idx = np.argsort(chroma_avg)[::-1]
    for idx in sorted_idx[:6]:
        bar = '█' * int(chroma_avg[idx] / chroma_avg.max() * 30)
        print(f"  {pitch_classes[idx]:>2}: {bar} ({chroma_avg[idx]:.3f})")

    return {
        'bpm': tempo,
        'key': best_key,
        'mode': best_mode,
        'correlation': best_corr,
        'duration': duration,
        'sr': sr,
    }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: analyze-bpm-key.py <audio_file>")
        sys.exit(1)
    analyze(sys.argv[1])
