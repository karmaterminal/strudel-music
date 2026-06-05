#!/usr/bin/env python3
"""
Compose a short piece using the curated sample-keymap palette.

Shape: 3-4 minute piece in three movements:
  I.   "First Breath" (~60s) — solo Fiona vocal-fragments over Caseet ambient bed
  II.  "Cathedral" (~90s) — both palettes interweave, drums emerge, density build
  III. "Settle" (~60s) — collapse to sparse Fiona-vocals + single Caseet drone, fade

Note-level composition: place each sample explicitly at a time-position with
optional pitch-shift (semitones), volume, and pan. Render to single WAV.
"""

import json
from pathlib import Path
import numpy as np
import soundfile as sf
import librosa

BASE = Path(__file__).parent
PALETTE = BASE / "palette"
OUT_WAV = BASE / "render" / "every-single-cathedral.wav"
OUT_WAV.parent.mkdir(parents=True, exist_ok=True)

SR = 44100


def load_palette():
    pal = {}
    for f in sorted(PALETTE.glob("*.json")):
        data = json.loads(f.read_text())
        key = (data["track"], data["stem"])
        pal[key] = data["samples"]
    return pal


def load_sample(path: str) -> np.ndarray:
    y, _ = librosa.load(path, sr=SR, mono=True)
    return y


def pitch_shift(y: np.ndarray, semitones: float) -> np.ndarray:
    if abs(semitones) < 0.01:
        return y
    return librosa.effects.pitch_shift(y=y, sr=SR, n_steps=semitones)


def time_stretch(y: np.ndarray, rate: float) -> np.ndarray:
    if abs(rate - 1.0) < 0.01:
        return y
    return librosa.effects.time_stretch(y=y, rate=rate)


def place(canvas: np.ndarray, sample: np.ndarray, t_sec: float, gain: float = 1.0):
    """Add sample to canvas at time t_sec with gain."""
    start = int(t_sec * SR)
    end = start + len(sample)
    if end > len(canvas):
        sample = sample[:len(canvas) - start]
        end = start + len(sample)
    if start < 0 or start >= len(canvas):
        return
    canvas[start:end] += sample * gain


def envelope(y: np.ndarray, attack_ms=5, release_ms=30) -> np.ndarray:
    """Apply gentle attack/release envelope to avoid clicks."""
    a = int(attack_ms / 1000 * SR)
    r = int(release_ms / 1000 * SR)
    if a > 0 and len(y) > a:
        y[:a] *= np.linspace(0, 1, a)
    if r > 0 and len(y) > r:
        y[-r:] *= np.linspace(1, 0, r)
    return y


def main():
    pal = load_palette()
    print("Palette loaded:")
    for k, v in pal.items():
        print(f"  {k}: {len(v)} samples")

    total_sec = 210  # 3:30 total
    canvas = np.zeros(int(total_sec * SR), dtype=np.float32)

    # ============ Movement I: First Breath (0-60s) ============
    # Caseet "other" as ambient bed (slow, long sustains)
    caseet_other = pal[("caseet-show-me", "other")]
    # Pick 3 long-ish atmospheric samples, stretch them
    bed_samples = [s for s in caseet_other if s["duration_ms"] > 100][:4]
    for i, s in enumerate(bed_samples):
        y = load_sample(s["path"])
        y_stretched = time_stretch(y, 0.4)  # stretch ~2.5x
        y_quiet = envelope(y_stretched, attack_ms=500, release_ms=2000) * 0.25
        # Place each at the start of its 15s window
        place(canvas, y_quiet, i * 15.0, gain=1.0)

    # Fiona vocal-fragments sparse over the bed
    fiona_vocals = pal[("fiona-every-single-night", "vocals")]
    # Pick 5 fragments, place at 8s intervals starting at 8s
    voc_times = [8.0, 18.0, 28.0, 38.0, 50.0]
    for t, s in zip(voc_times, fiona_vocals[:5]):
        y = load_sample(s["path"])
        # Shift to a comfortable register (D minor: D, F, A)
        # If we have a midi, shift toward target_midi
        if s.get("pitch_midi"):
            target_midi = 62 + (5 * 0)  # D4 + offset
            shift = target_midi - s["pitch_midi"]
            # Constrain shift to ±7 semitones to keep voice quality
            shift = max(-7, min(7, shift))
            y = pitch_shift(y, shift)
        y = envelope(y, attack_ms=20, release_ms=150) * 0.5
        place(canvas, y, t, gain=1.0)

    # ============ Movement II: Cathedral (60-150s) ============
    # Add Fiona's drums (sparse percussive accents)
    fiona_drums = pal[("fiona-every-single-night", "drums")]
    # Sparse pulse: every 1.5s starting at 60s
    drum_times = [60 + i * 1.5 for i in range(40)]  # 40 hits over 60s
    for i, t in enumerate(drum_times):
        s = fiona_drums[i % len(fiona_drums)]
        y = load_sample(s["path"])
        y = envelope(y, attack_ms=2, release_ms=80) * 0.35
        place(canvas, y, t, gain=1.0)

    # Caseet drums add weight at 75s mark
    caseet_drums = pal[("caseet-show-me", "drums")]
    weight_times = [75 + i * 0.75 for i in range(80)]  # double-time after weight
    for i, t in enumerate(weight_times):
        s = caseet_drums[i % len(caseet_drums)]
        y = load_sample(s["path"])
        y = envelope(y, attack_ms=2, release_ms=60) * 0.25
        place(canvas, y, t, gain=1.0)

    # Bass enters at 70s — Fiona bass anchored in D
    fiona_bass = pal[("fiona-every-single-night", "bass")]
    # Place bass notes on chord changes (D, F, G, Bb pattern in D minor)
    chord_pattern_midi = [50, 53, 55, 58]  # D, F, G, Bb in low octave
    bass_times = [70 + i * 4 for i in range(20)]  # every 4s for 80s
    for i, t in enumerate(bass_times):
        target_midi = chord_pattern_midi[i % 4]
        s = fiona_bass[i % len(fiona_bass)]
        y = load_sample(s["path"])
        if s.get("pitch_midi"):
            shift = target_midi - s["pitch_midi"]
            shift = max(-12, min(12, shift))
            y = pitch_shift(y, shift)
        y = envelope(y, attack_ms=50, release_ms=400) * 0.4
        place(canvas, y, t, gain=1.0)

    # Fiona vocals continue, now ascending pitches (climbing up D minor scale)
    voc_scale_midi = [62, 65, 67, 69, 70, 72, 74]  # D minor pentatonic-ish
    voc_times_2 = [70 + i * 2.5 for i in range(30)]  # every 2.5s
    for i, t in enumerate(voc_times_2):
        target_midi = voc_scale_midi[i % len(voc_scale_midi)] + (12 if i > 15 else 0)
        s = fiona_vocals[i % len(fiona_vocals)]
        y = load_sample(s["path"])
        if s.get("pitch_midi"):
            shift = target_midi - s["pitch_midi"]
            shift = max(-12, min(12, shift))
            y = pitch_shift(y, shift)
        y = envelope(y, attack_ms=10, release_ms=200) * (0.3 + 0.005 * i)  # crescendo
        place(canvas, y, t, gain=1.0)

    # Caseet "other" textural fragments weave through the build
    caseet_other_short = [s for s in caseet_other if s["duration_ms"] < 200][:10]
    for i, s in enumerate(caseet_other_short):
        t = 90 + i * 6
        y = load_sample(s["path"])
        if s.get("pitch_midi"):
            # Pitch into the D minor world
            target_midi = chord_pattern_midi[i % 4] + 12
            shift = target_midi - s["pitch_midi"]
            shift = max(-12, min(12, shift))
            y = pitch_shift(y, shift)
        y = envelope(y, attack_ms=30, release_ms=300) * 0.35
        place(canvas, y, t, gain=1.0)

    # ============ Movement III: Settle (150-210s) ============
    # Drums fade out at 150s — done above
    # Bass softens, just root notes
    settle_bass_times = [150 + i * 6 for i in range(10)]
    for i, t in enumerate(settle_bass_times):
        s = fiona_bass[0]  # use same bass sample as anchor
        y = load_sample(s["path"])
        if s.get("pitch_midi"):
            shift = 50 - s["pitch_midi"]  # D2
            shift = max(-12, min(12, shift))
            y = pitch_shift(y, shift)
        # Stretch the tail for sustain
        y = time_stretch(y, 0.6)
        gain = 0.4 * (1.0 - i * 0.08)
        y = envelope(y, attack_ms=100, release_ms=1000) * max(0.05, gain)
        place(canvas, y, t, gain=1.0)

    # Sparse Fiona vocal fragments, fade
    settle_voc_times = [155, 168, 182, 198]
    settle_voc_pitches = [69, 67, 65, 62]  # descending in D minor
    for t, target_midi, s in zip(settle_voc_times, settle_voc_pitches, fiona_vocals[:4]):
        y = load_sample(s["path"])
        if s.get("pitch_midi"):
            shift = target_midi - s["pitch_midi"]
            shift = max(-12, min(12, shift))
            y = pitch_shift(y, shift)
        y = envelope(y, attack_ms=80, release_ms=600) * 0.45
        place(canvas, y, t, gain=1.0)

    # Caseet ambient bed continues, fading
    bed_stretched_long = load_sample(bed_samples[0]["path"])
    bed_stretched_long = time_stretch(bed_stretched_long, 0.3)  # very slow
    bed_stretched_long = envelope(bed_stretched_long, attack_ms=2000, release_ms=8000) * 0.2
    place(canvas, bed_stretched_long, 150.0, gain=1.0)

    # ============ Master ============
    # Normalize peak to -3dB
    peak = np.max(np.abs(canvas))
    if peak > 0:
        target = 10 ** (-3 / 20)
        canvas = canvas * (target / peak)

    # Gentle global fade-in and fade-out
    fade_in = int(2 * SR)
    fade_out = int(5 * SR)
    canvas[:fade_in] *= np.linspace(0, 1, fade_in) ** 2
    canvas[-fade_out:] *= np.linspace(1, 0, fade_out) ** 2

    print(f"Rendering {len(canvas) / SR:.1f}s to {OUT_WAV}...")
    sf.write(OUT_WAV, canvas, SR, subtype="PCM_16")
    print("Done.")


if __name__ == "__main__":
    main()
