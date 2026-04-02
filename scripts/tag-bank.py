#!/usr/bin/env python3
"""
tag-bank.py — Pitch-tag a sample bank for Strudel composition.

Analyzes WAV/MP3 slices and outputs a bank-manifest.json with:
  - rootMidi, rootName, hz (dominant pitch via autocorrelation)
  - chromaTop (top 3 chroma classes by energy)
  - confidence score (0.0-1.0)
  - type classification (bass/drums/other/vocals based on spectral profile)

Usage:
  python3 scripts/tag-bank.py <samples-dir> [--output bank-manifest.json]
  python3 scripts/tag-bank.py samples/hallur_bass_deep/hallur_bass_deep.wav  # single file

Dependencies: numpy, ffmpeg (in PATH). No librosa needed.

dandelion cult — cael🩸 / 2026-02-28
"""

import sys
import os
import json
import subprocess
import argparse
import numpy as np

# MIDI note names (sharps avoided in flat keys per convention: Eb not D#)
NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
CHROMA_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']


def read_audio(path, sr=44100):
    """Convert any audio to mono f32 PCM via ffmpeg."""
    result = subprocess.run(
        ['ffmpeg', '-hide_banner', '-i', path, '-ac', '1', '-ar', str(sr),
         '-f', 'f32le', '-'],
        capture_output=True, timeout=60
    )
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg failed on {path}: {result.stderr.decode()[:200]}")
    samples = np.frombuffer(result.stdout, dtype=np.float32)
    return samples, sr


def hz_to_midi(hz):
    """Convert frequency in Hz to MIDI note number."""
    if hz <= 0:
        return 0
    return int(round(69 + 12 * np.log2(hz / 440.0)))


def midi_to_name(midi):
    """Convert MIDI note to name like 'C3', 'Eb4'."""
    if midi <= 0:
        return '?'
    octave = (midi // 12) - 1
    note = NOTE_NAMES[midi % 12]
    return f"{note}{octave}"


def autocorrelation_pitch(samples, sr, min_hz=30, max_hz=2000):
    """
    Estimate fundamental frequency via autocorrelation.
    More robust than FFT peak for pitched audio (handles harmonics better).
    """
    # Use a chunk from the middle (avoid attack transients)
    n = len(samples)
    chunk_size = min(n, sr * 2)  # 2 seconds max
    start = max(0, (n - chunk_size) // 2)
    chunk = samples[start:start + chunk_size]

    # Window
    chunk = chunk * np.hanning(len(chunk))

    # Autocorrelation via FFT
    fft = np.fft.rfft(chunk, n=2 * len(chunk))
    acf = np.fft.irfft(fft * np.conj(fft))
    acf = acf[:len(chunk)]

    # Normalize
    if acf[0] > 0:
        acf = acf / acf[0]

    # Search for first peak in valid frequency range
    min_lag = max(1, int(sr / max_hz))
    max_lag = min(len(acf) - 1, int(sr / min_hz))

    if min_lag >= max_lag:
        return 0.0, 0.0

    search = acf[min_lag:max_lag]
    if len(search) == 0:
        return 0.0, 0.0

    # Find peaks (local maxima)
    peaks = []
    for i in range(1, len(search) - 1):
        if search[i] > search[i-1] and search[i] > search[i+1]:
            peaks.append((i + min_lag, search[i]))

    if not peaks:
        return 0.0, 0.0

    # Take the strongest peak
    best_lag, confidence = max(peaks, key=lambda x: x[1])
    hz = sr / best_lag

    return hz, max(0.0, min(1.0, confidence))


def fft_pitch(samples, sr, min_hz=30, max_hz=8000):
    """
    FFT-based pitch estimate. Less robust for fundamentals
    but good for spectral centroid and chroma analysis.
    """
    n = len(samples)
    chunk_size = min(n, sr * 2)
    start = max(0, (n - chunk_size) // 2)
    chunk = samples[start:start + chunk_size]

    windowed = chunk * np.hanning(len(chunk))
    spectrum = np.abs(np.fft.rfft(windowed))
    freqs = np.fft.rfftfreq(len(windowed), 1.0 / sr)

    # Mask to frequency range
    mask = (freqs >= min_hz) & (freqs <= max_hz)
    if not np.any(mask):
        return 0.0, 0.0

    masked_spectrum = spectrum[mask]
    masked_freqs = freqs[mask]

    peak_idx = np.argmax(masked_spectrum)
    peak_hz = masked_freqs[peak_idx]
    
    # Confidence: peak prominence relative to mean
    mean_energy = np.mean(masked_spectrum)
    if mean_energy > 0:
        confidence = min(1.0, (masked_spectrum[peak_idx] / mean_energy) / 10.0)
    else:
        confidence = 0.0

    return peak_hz, confidence


def chroma_profile(samples, sr):
    """
    Compute chroma energy distribution (12 pitch classes).
    Returns sorted list of (note_name, energy) tuples.
    """
    n = len(samples)
    chunk_size = min(n, sr * 4)  # 4 seconds
    start = max(0, (n - chunk_size) // 2)
    chunk = samples[start:start + chunk_size]

    windowed = chunk * np.hanning(len(chunk))
    spectrum = np.abs(np.fft.rfft(windowed)) ** 2  # power spectrum
    freqs = np.fft.rfftfreq(len(windowed), 1.0 / sr)

    # Accumulate energy into 12 chroma bins
    chroma = np.zeros(12)
    for i, (f, e) in enumerate(zip(freqs, spectrum)):
        if f < 20 or f > 8000:
            continue
        if f > 0:
            midi = 69 + 12 * np.log2(f / 440.0)
            bin_idx = int(round(midi)) % 12
            chroma[bin_idx] += e

    # Normalize
    total = np.sum(chroma)
    if total > 0:
        chroma = chroma / total

    # Sort by energy, return top entries
    ranked = sorted(enumerate(chroma), key=lambda x: -x[1])
    return [(CHROMA_NAMES[idx], float(energy)) for idx, energy in ranked]


def classify_type(samples, sr):
    """
    Simple type classification based on spectral profile:
    - bass: energy concentrated below 300 Hz
    - drums: broad spectrum, high transient density
    - vocals: energy concentrated 200-4000 Hz with formant-like peaks
    - other: everything else (pads, synths, etc.)
    """
    windowed = samples * np.hanning(len(samples))
    spectrum = np.abs(np.fft.rfft(windowed)) ** 2
    freqs = np.fft.rfftfreq(len(windowed), 1.0 / sr)

    # Energy in bands
    total = np.sum(spectrum) + 1e-10
    sub_300 = np.sum(spectrum[(freqs >= 20) & (freqs < 300)]) / total
    mid = np.sum(spectrum[(freqs >= 200) & (freqs < 4000)]) / total
    high = np.sum(spectrum[(freqs >= 4000) & (freqs < 12000)]) / total

    # Transient density (zero crossings as proxy)
    zc = np.sum(np.abs(np.diff(np.sign(samples))) > 0) / len(samples)

    if sub_300 > 0.6:
        return 'bass'
    elif zc > 0.3 and high > 0.1:
        return 'drums'
    elif mid > 0.5 and sub_300 < 0.3:
        return 'vocals'
    else:
        return 'other'


def analyze_file(path, sr=44100):
    """Analyze a single audio file and return manifest entry."""
    samples, sr = read_audio(path, sr)

    if len(samples) < sr * 0.1:  # less than 100ms
        return {'error': 'too short', 'duration': len(samples) / sr}

    duration = len(samples) / sr

    # Pitch detection: use autocorrelation for bass, FFT for others
    acf_hz, acf_conf = autocorrelation_pitch(samples, sr)
    fft_hz, fft_conf = fft_pitch(samples, sr)

    # Use autocorrelation if it's confident (better for fundamentals)
    if acf_conf > 0.3:
        root_hz = acf_hz
        confidence = acf_conf
        method = 'autocorrelation'
    elif fft_conf > 0.2:
        root_hz = fft_hz
        confidence = fft_conf
        method = 'fft'
    else:
        root_hz = fft_hz if fft_hz > 0 else acf_hz
        confidence = max(acf_conf, fft_conf)
        method = 'low-confidence'

    root_midi = hz_to_midi(root_hz)
    root_name = midi_to_name(root_midi)

    # Chroma analysis
    chroma = chroma_profile(samples, sr)
    chroma_top = [{'note': n, 'energy': round(e, 3)} for n, e in chroma[:3]]

    # Type classification
    stype = classify_type(samples, sr)

    # RMS level
    rms = float(np.sqrt(np.mean(samples ** 2)))
    rms_db = 20 * np.log10(rms) if rms > 1e-10 else -100.0

    return {
        'type': stype,
        'rootMidi': root_midi,
        'rootName': root_name,
        'hz': round(root_hz, 1),
        'conf': round(confidence, 2),
        'method': method,
        'chromaTop': chroma_top,
        'duration': round(duration, 2),
        'rmsDb': round(rms_db, 1),
    }


def scan_directory(dir_path, sr=44100):
    """Scan a directory of audio files and build manifest."""
    manifest = {
        'meta': {
            'generatedBy': 'tag-bank.py (cael)',
            'date': None,  # filled below
            'source': os.path.basename(dir_path),
        },
        'slices': {}
    }

    from datetime import date
    manifest['meta']['date'] = str(date.today())

    # Find audio files
    audio_exts = {'.wav', '.mp3', '.flac', '.ogg', '.aiff'}
    files = []

    for root, dirs, filenames in os.walk(dir_path):
        for fn in sorted(filenames):
            if os.path.splitext(fn)[1].lower() in audio_exts:
                files.append(os.path.join(root, fn))

    if not files:
        print(f"No audio files found in {dir_path}", file=sys.stderr)
        return manifest

    for fpath in files:
        name = os.path.splitext(os.path.basename(fpath))[0]
        print(f"  Analyzing: {name}...", file=sys.stderr)
        try:
            entry = analyze_file(fpath, sr)
            manifest['slices'][name] = entry
        except Exception as e:
            manifest['slices'][name] = {'error': str(e)}

    # Compute key center from chroma distribution
    total_chroma = np.zeros(12)
    for name, entry in manifest['slices'].items():
        if 'chromaTop' in entry:
            for ct in entry['chromaTop']:
                idx = CHROMA_NAMES.index(ct['note'])
                total_chroma[idx] += ct['energy']

    if np.sum(total_chroma) > 0:
        total_chroma /= np.sum(total_chroma)
        ranked = sorted(enumerate(total_chroma), key=lambda x: -x[1])
        top_notes = [CHROMA_NAMES[i] for i, _ in ranked[:4]]
        manifest['meta']['dominantChroma'] = top_notes
        manifest['meta']['keyCenter'] = f"{top_notes[0]}m / {top_notes[0]} (estimated)"

    return manifest


def main():
    parser = argparse.ArgumentParser(description='Pitch-tag a sample bank')
    parser.add_argument('path', help='Directory of audio files, or single audio file')
    parser.add_argument('--output', '-o', default=None, help='Output JSON path')
    parser.add_argument('--sr', type=int, default=44100, help='Sample rate for analysis')
    parser.add_argument('--pretty', action='store_true', default=True, help='Pretty-print JSON')
    args = parser.parse_args()

    if os.path.isfile(args.path):
        # Single file mode
        entry = analyze_file(args.path, args.sr)
        result = {os.path.splitext(os.path.basename(args.path))[0]: entry}
        print(json.dumps(result, indent=2 if args.pretty else None))
    elif os.path.isdir(args.path):
        # Directory mode
        manifest = scan_directory(args.path, args.sr)
        output = args.output or 'bank-manifest.json'
        with open(output, 'w') as f:
            json.dumps(manifest, f if not args.pretty else None, indent=2)
            if args.pretty:
                f.write(json.dumps(manifest, indent=2))
                # Fix: just write directly
        # Actually, let's just do it cleanly
        with open(output, 'w') as f:
            json.dump(manifest, f, indent=2)
            f.write('\n')
        print(f"Manifest written to {output}", file=sys.stderr)
        print(json.dumps(manifest, indent=2))
    else:
        print(f"Path not found: {args.path}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
