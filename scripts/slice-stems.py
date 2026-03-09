#!/usr/bin/env python3
"""
Slice Demucs stems into 8-bar sample banks for Strudel.

For each track:
  1. Detect BPM via librosa
  2. Slice each stem (bass, drums, other, vocals) into 8-bar chunks
  3. Normalize each slice to -16 LUFS
  4. Save to samples/<trackname>_<stem>/n0.wav, n1.wav, ...
  5. Check for 61.7Hz artifact energy
  6. Output bank-manifest.json entries

Usage:
  python slice-stems.py <demucs_dir> <track_folder> <track_prefix>
  
Example:
  python slice-stems.py demucs-output/htdemucs "Skinny Love" skinny_love
"""

import sys
import os
import json
import numpy as np
import librosa
import soundfile as sf
import pyloudnorm as pyln

BEATS_PER_BAR = 4
BARS_PER_SLICE = 8
TARGET_LUFS = -16.0
ARTIFACT_HZ = 61.7
ARTIFACT_BANDWIDTH = 3.0  # ±3 Hz around 61.7
ARTIFACT_THRESHOLD_DB = -20.0  # flag if 61.7Hz bin is within this of the peak

STEMS = ['bass', 'drums', 'other', 'vocals']


def detect_bpm(track_dir):
    """Detect BPM using the drums stem (most rhythmic), falling back to other stems."""
    for stem in ['drums', 'other', 'vocals', 'bass']:
        path = os.path.join(track_dir, f'{stem}.wav')
        if os.path.exists(path):
            y, sr = librosa.load(path, sr=None, mono=True, duration=60)
            tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
            bpm = float(np.atleast_1d(tempo)[0])
            if bpm > 0:
                print(f"  BPM detected from {stem}: {bpm:.1f}")
                return bpm, sr
    raise RuntimeError(f"Could not detect BPM from any stem in {track_dir}")


def check_617hz_artifact(audio, sr):
    """Check if a slice has concentrated energy at 61.7Hz.
    Returns (flagged: bool, artifact_db: float, peak_db: float)"""
    if audio.ndim > 1:
        mono = np.mean(audio, axis=1)
    else:
        mono = audio
    
    n_fft = 8192
    S = np.abs(librosa.stft(mono.astype(np.float32), n_fft=n_fft))
    freqs = librosa.fft_frequencies(sr=sr, n_fft=n_fft)
    
    # Find bins near 61.7Hz
    mask = np.abs(freqs - ARTIFACT_HZ) <= ARTIFACT_BANDWIDTH
    if not np.any(mask):
        return False, -np.inf, -np.inf
    
    # Average magnitude across time for each freq bin
    avg_mag = np.mean(S, axis=1)
    
    artifact_mag = np.max(avg_mag[mask])
    peak_mag = np.max(avg_mag[avg_mag > 0]) if np.any(avg_mag > 0) else 1e-10
    
    artifact_db = 20 * np.log10(artifact_mag + 1e-10)
    peak_db = 20 * np.log10(peak_mag + 1e-10)
    
    # Flag if artifact is within threshold of peak
    relative_db = artifact_db - peak_db
    flagged = relative_db > ARTIFACT_THRESHOLD_DB
    
    return flagged, artifact_db, peak_db


def normalize_lufs(audio, sr, target_lufs=TARGET_LUFS):
    """Normalize audio to target LUFS. Returns normalized audio."""
    meter = pyln.Meter(sr)
    
    # pyloudnorm expects (samples, channels) for multi-channel
    if audio.ndim == 1:
        audio_for_meter = audio
    else:
        audio_for_meter = audio
    
    loudness = meter.integrated_loudness(audio_for_meter)
    
    if np.isinf(loudness) or np.isnan(loudness):
        # Silent or near-silent slice — skip normalization
        return audio
    
    try:
        normalized = pyln.normalize.loudness(audio_for_meter, loudness, target_lufs)
    except Exception:
        return audio
    
    # Clip to prevent clipping
    normalized = np.clip(normalized, -1.0, 1.0)
    return normalized


def slice_track(demucs_dir, track_folder, track_prefix, samples_dir):
    """Slice all stems of a track into 8-bar chunks."""
    track_dir = os.path.join(demucs_dir, track_folder)
    
    if not os.path.isdir(track_dir):
        print(f"ERROR: Track directory not found: {track_dir}")
        return None
    
    # Check all stems exist
    available_stems = []
    for stem in STEMS:
        path = os.path.join(track_dir, f'{stem}.wav')
        if os.path.exists(path):
            available_stems.append(stem)
        else:
            print(f"  WARNING: Missing stem {stem} in {track_folder}")
    
    if not available_stems:
        print(f"ERROR: No stems found in {track_dir}")
        return None
    
    # Detect BPM
    bpm, sr_detect = detect_bpm(track_dir)
    
    # Calculate 8-bar duration
    bar_duration = BEATS_PER_BAR * 60.0 / bpm
    slice_duration = BARS_PER_SLICE * bar_duration
    
    print(f"  Bar duration: {bar_duration:.3f}s, 8-bar slice: {slice_duration:.3f}s")
    
    results = {
        'track': track_folder,
        'prefix': track_prefix,
        'bpm': round(bpm, 1),
        'bars_per_slice': BARS_PER_SLICE,
        'slice_duration_s': round(slice_duration, 3),
        'stems': {},
        'artifact_flags': []
    }
    
    for stem in available_stems:
        stem_path = os.path.join(track_dir, f'{stem}.wav')
        audio, sr = sf.read(stem_path)
        
        slice_samples = int(slice_duration * sr)
        total_samples = len(audio)
        n_slices = int(np.ceil(total_samples / slice_samples))
        
        bank_name = f'{track_prefix}_{stem}'
        out_dir = os.path.join(samples_dir, bank_name)
        os.makedirs(out_dir, exist_ok=True)
        
        stem_info = {
            'bank': bank_name,
            'stem': stem,
            'bpm': round(bpm, 1),
            'n_slices': n_slices,
            'slice_bars': BARS_PER_SLICE,
            'sr': sr,
            'slices': []
        }
        
        for i in range(n_slices):
            start = i * slice_samples
            end = min((i + 1) * slice_samples, total_samples)
            chunk = audio[start:end]
            
            # Pad last chunk if shorter than a full slice
            if len(chunk) < slice_samples:
                if audio.ndim > 1:
                    pad_width = ((0, slice_samples - len(chunk)), (0, 0))
                else:
                    pad_width = (0, slice_samples - len(chunk))
                chunk = np.pad(chunk, pad_width)
            
            # Normalize to -16 LUFS
            chunk = normalize_lufs(chunk, sr)
            
            # Check for 61.7Hz artifact
            flagged, art_db, peak_db = check_617hz_artifact(chunk, sr)
            
            slice_name = f'n{i}'
            out_path = os.path.join(out_dir, f'{slice_name}.wav')
            sf.write(out_path, chunk, sr)
            
            slice_info = {
                'name': slice_name,
                'start_bar': i * BARS_PER_SLICE,
                'end_bar': (i + 1) * BARS_PER_SLICE,
                'artifact_61hz': flagged
            }
            stem_info['slices'].append(slice_info)
            
            if flagged:
                flag_entry = {
                    'bank': bank_name,
                    'slice': slice_name,
                    'artifact_db': round(float(art_db), 1),
                    'peak_db': round(float(peak_db), 1),
                    'relative_db': round(float(art_db - peak_db), 1)
                }
                results['artifact_flags'].append(flag_entry)
                print(f"    ⚠️  61.7Hz FLAG: {bank_name}/{slice_name} "
                      f"(artifact: {art_db:.1f}dB, peak: {peak_db:.1f}dB, "
                      f"relative: {art_db - peak_db:.1f}dB)")
        
        results['stems'][stem] = stem_info
        print(f"  ✅ {bank_name}: {n_slices} slices @ {slice_duration:.2f}s each")
    
    return results


def update_manifest(manifest_path, track_results):
    """Update bank-manifest.json with slice information."""
    if os.path.exists(manifest_path):
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)
    else:
        manifest = {}
    
    # Add/update road-trip-banks section
    if 'road_trip_banks' not in manifest:
        manifest['road_trip_banks'] = {}
    
    prefix = track_results['prefix']
    manifest['road_trip_banks'][prefix] = {
        'track': track_results['track'],
        'bpm': track_results['bpm'],
        'bars_per_slice': track_results['bars_per_slice'],
        'slice_duration_s': track_results['slice_duration_s'],
        'stems': {}
    }
    
    for stem_name, stem_info in track_results['stems'].items():
        manifest['road_trip_banks'][prefix]['stems'][stem_name] = {
            'bank': stem_info['bank'],
            'n_slices': stem_info['n_slices'],
            'sr': stem_info['sr'],
            'artifact_flags': [
                s['name'] for s in stem_info['slices'] if s['artifact_61hz']
            ]
        }
    
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"  📋 Manifest updated: {manifest_path}")


def main():
    if len(sys.argv) < 4:
        print("Usage: python slice-stems.py <demucs_dir> <track_folder> <track_prefix>")
        print("  Or: python slice-stems.py --all <demucs_dir>")
        sys.exit(1)
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(script_dir)
    samples_dir = os.path.join(root_dir, 'samples')
    manifest_path = os.path.join(root_dir, 'bank-manifest.json')
    
    if sys.argv[1] == '--all':
        demucs_dir = sys.argv[2]
        # Process all known road trip tracks
        tracks = [
            ('Skinny Love', 'skinny_love'),
            ('How to Disappear Completely', 'htdc'),
            ('Sufjan Stevens, Fourth Of July (Official Audio)', 'fourth_july'),
            ('Simon & Garfunkel - America (Audio)', 'america'),
        ]
        
        all_results = []
        total_slices = 0
        total_flags = 0
        
        for folder, prefix in tracks:
            track_path = os.path.join(demucs_dir, folder)
            if not os.path.isdir(track_path):
                print(f"\n⏳ Skipping {folder} (not yet available)")
                continue
            
            print(f"\n{'='*60}")
            print(f"Processing: {folder} → {prefix}_*")
            print(f"{'='*60}")
            
            result = slice_track(demucs_dir, folder, prefix, samples_dir)
            if result:
                all_results.append(result)
                update_manifest(manifest_path, result)
                
                track_slices = sum(
                    s['n_slices'] for s in result['stems'].values()
                )
                total_slices += track_slices
                total_flags += len(result['artifact_flags'])
        
        # Summary
        print(f"\n{'='*60}")
        print(f"SUMMARY")
        print(f"{'='*60}")
        print(f"Tracks processed: {len(all_results)}")
        print(f"Total slices: {total_slices}")
        print(f"61.7Hz flags: {total_flags}")
        
        if total_flags > 0:
            print(f"\n⚠️  Flagged slices:")
            for r in all_results:
                for flag in r['artifact_flags']:
                    print(f"  - {flag['bank']}/{flag['slice']}: "
                          f"{flag['relative_db']:+.1f}dB relative to peak")
        
        # Write summary JSON
        summary = {
            'tracks_processed': len(all_results),
            'total_slices': total_slices,
            'total_artifact_flags': total_flags,
            'tracks': []
        }
        for r in all_results:
            track_summary = {
                'name': r['track'],
                'prefix': r['prefix'],
                'bpm': r['bpm'],
                'stems': {
                    stem: info['n_slices']
                    for stem, info in r['stems'].items()
                },
                'artifact_flags': r['artifact_flags']
            }
            summary['tracks'].append(track_summary)
        
        summary_path = os.path.join(root_dir, 'slice-summary.json')
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2)
        print(f"\nSummary written to: {summary_path}")
        
    else:
        demucs_dir = sys.argv[1]
        track_folder = sys.argv[2]
        track_prefix = sys.argv[3]
        
        print(f"Processing: {track_folder} → {track_prefix}_*")
        result = slice_track(demucs_dir, track_folder, track_prefix, samples_dir)
        if result:
            update_manifest(manifest_path, result)


if __name__ == '__main__':
    main()
