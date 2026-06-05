#!/usr/bin/env python3
"""
Compose v2 — addresses v1 QA gate failures.

v1 fail-shape:
  ❌ 118 null gaps (159s/210s = 76% silence)
  ❌ 97% energy below 320Hz (bottom-heavy)
  ⚠️  -24.7 LUFS (target -18 to -14)

v2 fixes:
  - Bed density: stretch longest "other" samples 8-10x, overlap so the bed actually sustains
  - Drum overlap: shorter intervals + longer release tails so hits crossfade
  - Mid/high register: pitch up Fiona vocals into D4-D5 range explicitly
  - Master gain: target -16 LUFS, true-peak limiter at -1.5dB

Three movements preserved:
  I.   "First Breath" (0-60s) — Fiona vocal + Caseet sustained bed
  II.  "Cathedral" (60-150s) — interweave, drums with overlap, density build
  III. "Settle" (150-210s) — sparse fragments + drone tail
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
    start = int(t_sec * SR)
    end = start + len(sample)
    if end > len(canvas):
        sample = sample[: len(canvas) - start]
        end = start + len(sample)
    if start < 0 or start >= len(canvas):
        return
    canvas[start:end] += sample * gain


def envelope(y: np.ndarray, attack_ms=5, release_ms=30) -> np.ndarray:
    a = int(attack_ms / 1000 * SR)
    r = int(release_ms / 1000 * SR)
    if a > 0 and len(y) > a:
        y[:a] *= np.linspace(0, 1, a)
    if r > 0 and len(y) > r:
        y[-r:] *= np.linspace(1, 0, r)
    return y


def make_bed(sample_path: str, target_duration_sec: float, stretch_rate: float = 0.15) -> np.ndarray:
    """
    Take a short sample, stretch it heavily, then loop with crossfades to fill target duration.
    Returns a stereo-mono signal of length target_duration_sec.
    """
    y = load_sample(sample_path)
    y_stretched = time_stretch(y, stretch_rate)
    n_target = int(target_duration_sec * SR)
    if len(y_stretched) >= n_target:
        return y_stretched[:n_target]
    # Need to loop. Crossfade each loop into the next.
    bed = np.zeros(n_target, dtype=np.float32)
    chunk_len = len(y_stretched)
    crossfade = int(0.5 * SR)  # 500ms crossfade between loops
    pos = 0
    while pos < n_target:
        # Build crossfade in/out window
        chunk = y_stretched.copy()
        if pos > 0 and crossfade < chunk_len:
            chunk[:crossfade] *= np.linspace(0, 1, crossfade)
        if pos + chunk_len < n_target and crossfade < chunk_len:
            chunk[-crossfade:] *= np.linspace(1, 0, crossfade)
        end = min(pos + chunk_len, n_target)
        bed[pos:end] += chunk[: end - pos]
        pos += chunk_len - crossfade
    return bed


def main():
    pal = load_palette()
    print("Palette loaded:")
    for k, v in pal.items():
        print(f"  {k}: {len(v)} samples")

    total_sec = 210
    canvas = np.zeros(int(total_sec * SR), dtype=np.float32)

    # ============ Movement I: First Breath (0-60s) ============
    # Sustained bed: build from longest Caseet "other", stretch heavily, loop with crossfade
    caseet_other = pal[("caseet-show-me", "other")]
    bed_source = max(caseet_other, key=lambda s: s["duration_ms"])
    bed_m1 = make_bed(bed_source["path"], target_duration_sec=62.0, stretch_rate=0.12)
    bed_m1 = envelope(bed_m1, attack_ms=2000, release_ms=2000) * 0.45
    place(canvas, bed_m1, 0.0, gain=1.0)

    # Second bed layer: Caseet "vocals" longest, even slower, panned-feel via pitch shift up an octave
    caseet_vocals = pal[("caseet-show-me", "vocals")]
    bed2_source = max(caseet_vocals, key=lambda s: s["duration_ms"])
    bed2 = make_bed(bed2_source["path"], target_duration_sec=62.0, stretch_rate=0.18)
    # Lift register +12 semitones to fill the upper-mid that v1 missed
    bed2 = pitch_shift(bed2, 12)
    bed2 = envelope(bed2, attack_ms=4000, release_ms=4000) * 0.30
    place(canvas, bed2, 0.0, gain=1.0)

    # Fiona vocal fragments — denser, closer together
    fiona_vocals = pal[("fiona-every-single-night", "vocals")]
    # Place vocals every 4 seconds with overlap, pitched into D4-D5 range
    voc_times = [4.0, 8.0, 12.0, 16.0, 20.0, 24.0, 28.0, 32.0, 36.0, 40.0, 45.0, 50.0, 55.0]
    voc_pitches = [62, 65, 67, 69, 72, 69, 67, 65, 67, 69, 72, 74, 69]  # D minor melody arc
    for i, (t, target_midi) in enumerate(zip(voc_times, voc_pitches)):
        s = fiona_vocals[i % len(fiona_vocals)]
        y = load_sample(s["path"])
        if s.get("pitch_midi"):
            shift = target_midi - s["pitch_midi"]
            shift = max(-12, min(12, shift))
            y = pitch_shift(y, shift)
        # Stretch slightly for sustain
        y = time_stretch(y, 0.7)
        y = envelope(y, attack_ms=40, release_ms=400) * 0.55
        place(canvas, y, t, gain=1.0)

    # ============ Movement II: Cathedral (60-150s) ============
    # Sustained bed continues through cathedral
    bed_m2 = make_bed(bed_source["path"], target_duration_sec=92.0, stretch_rate=0.15)
    bed_m2 = envelope(bed_m2, attack_ms=1000, release_ms=2000) * 0.40
    place(canvas, bed_m2, 60.0, gain=1.0)

    # Bed2 (vocals-as-pad) continues, brighter
    bed2_m2 = make_bed(bed2_source["path"], target_duration_sec=92.0, stretch_rate=0.20)
    bed2_m2 = pitch_shift(bed2_m2, 12)
    bed2_m2 = envelope(bed2_m2, attack_ms=2000, release_ms=2000) * 0.28
    place(canvas, bed2_m2, 60.0, gain=1.0)

    # Drums — denser, with longer release so hits sustain into each other
    fiona_drums = pal[("fiona-every-single-night", "drums")]
    # Pulse every 0.6s for 90s = 150 hits
    drum_times = [60 + i * 0.6 for i in range(150)]
    for i, t in enumerate(drum_times):
        s = fiona_drums[i % len(fiona_drums)]
        y = load_sample(s["path"])
        # Longer release for sustain/blur
        y = envelope(y, attack_ms=2, release_ms=200) * 0.40
        place(canvas, y, t, gain=1.0)

    # Caseet drums add density mid-cathedral
    caseet_drums = pal[("caseet-show-me", "drums")]
    weight_times = [80 + i * 0.5 for i in range(120)]  # 0.5s pulse from 80-140s
    for i, t in enumerate(weight_times):
        s = caseet_drums[i % len(caseet_drums)]
        y = load_sample(s["path"])
        y = envelope(y, attack_ms=2, release_ms=180) * 0.30
        place(canvas, y, t, gain=1.0)

    # Bass — Fiona bass anchored in D minor, every 2s for sustain
    fiona_bass = pal[("fiona-every-single-night", "bass")]
    chord_pattern_midi = [38, 41, 43, 46]  # D2, F2, G2, Bb2
    bass_times = [70 + i * 2.0 for i in range(40)]  # every 2s for 80s
    for i, t in enumerate(bass_times):
        target_midi = chord_pattern_midi[i % 4]
        s = fiona_bass[i % len(fiona_bass)]
        y = load_sample(s["path"])
        if s.get("pitch_midi"):
            shift = target_midi - s["pitch_midi"]
            shift = max(-15, min(12, shift))
            y = pitch_shift(y, shift)
        # Stretch for sustain
        y = time_stretch(y, 0.6)
        y = envelope(y, attack_ms=20, release_ms=600) * 0.50
        place(canvas, y, t, gain=1.0)

    # Vocals continue, climbing — denser
    voc_scale_midi = [62, 65, 67, 69, 70, 72, 74, 77]  # D minor with high reaches
    voc_times_2 = [62 + i * 1.5 for i in range(60)]  # every 1.5s for 90s
    for i, t in enumerate(voc_times_2):
        base = voc_scale_midi[i % len(voc_scale_midi)]
        # Climb register through Movement II
        target_midi = base + (12 if i > 30 else 0)
        s = fiona_vocals[i % len(fiona_vocals)]
        y = load_sample(s["path"])
        if s.get("pitch_midi"):
            shift = target_midi - s["pitch_midi"]
            shift = max(-12, min(15, shift))
            y = pitch_shift(y, shift)
        y = envelope(y, attack_ms=8, release_ms=250) * (0.35 + 0.003 * i)
        place(canvas, y, t, gain=1.0)

    # Caseet textural fragments
    caseet_other_short = sorted(caseet_other, key=lambda s: s["duration_ms"])[:6]
    for i, s in enumerate(caseet_other_short):
        t = 85 + i * 8
        y = load_sample(s["path"])
        if s.get("pitch_midi"):
            target_midi = chord_pattern_midi[i % 4] + 24
            shift = target_midi - s["pitch_midi"]
            shift = max(-12, min(18, shift))
            y = pitch_shift(y, shift)
        y = time_stretch(y, 0.5)
        y = envelope(y, attack_ms=50, release_ms=500) * 0.40
        place(canvas, y, t, gain=1.0)

    # ============ Movement III: Settle (150-210s) ============
    # Bed continues but fades
    bed_m3 = make_bed(bed_source["path"], target_duration_sec=60.0, stretch_rate=0.10)
    bed_m3 = envelope(bed_m3, attack_ms=1000, release_ms=8000) * 0.35
    place(canvas, bed_m3, 150.0, gain=1.0)

    # Bed2 fades too, registers high one last time
    bed2_m3 = make_bed(bed2_source["path"], target_duration_sec=55.0, stretch_rate=0.15)
    bed2_m3 = pitch_shift(bed2_m3, 12)
    bed2_m3 = envelope(bed2_m3, attack_ms=2000, release_ms=8000) * 0.22
    place(canvas, bed2_m3, 150.0, gain=1.0)

    # Bass: just root D, sparse
    settle_bass_times = [150, 160, 172, 186, 200]
    settle_bass_pitches = [38, 38, 41, 38, 38]
    for t, target_midi in zip(settle_bass_times, settle_bass_pitches):
        s = fiona_bass[0]
        y = load_sample(s["path"])
        if s.get("pitch_midi"):
            shift = target_midi - s["pitch_midi"]
            shift = max(-15, min(12, shift))
            y = pitch_shift(y, shift)
        y = time_stretch(y, 0.5)
        y = envelope(y, attack_ms=80, release_ms=1500) * 0.42
        place(canvas, y, t, gain=1.0)

    # Vocal fragments descending — the final shape
    settle_voc_times = [155, 165, 175, 185, 195]
    settle_voc_pitches = [72, 69, 67, 65, 62]
    for i, (t, target_midi) in enumerate(zip(settle_voc_times, settle_voc_pitches)):
        s = fiona_vocals[i % len(fiona_vocals)]
        y = load_sample(s["path"])
        if s.get("pitch_midi"):
            shift = target_midi - s["pitch_midi"]
            shift = max(-12, min(12, shift))
            y = pitch_shift(y, shift)
        y = time_stretch(y, 0.8)
        y = envelope(y, attack_ms=60, release_ms=800) * (0.50 - i * 0.05)
        place(canvas, y, t, gain=1.0)

    # ============ Master ============
    # Soft-knee approximation: tanh saturator for gentle limiting
    # Boost first to hit target LUFS, then limit true-peak

    # First normalize to RMS-target equivalent (raise gain)
    rms = np.sqrt(np.mean(canvas ** 2))
    if rms > 0:
        # Aim for RMS ~ 0.17 (roughly -15.5 LUFS for this kind of content)
        # v2-take-1 landed at -18.8 LUFS with target_rms=0.15 → bump to land in target band
        target_rms = 0.17
        canvas = canvas * (target_rms / rms)

    # Tanh soft-clip at true-peak -1.5dB
    true_peak_target = 10 ** (-1.5 / 20)
    # Scale so tanh doesn't kick in too early; threshold at 0.85
    canvas = np.tanh(canvas / true_peak_target * 1.1) * true_peak_target * 0.95

    # Gentle global fade-in and fade-out
    fade_in = int(2 * SR)
    fade_out = int(6 * SR)
    canvas[:fade_in] *= np.linspace(0, 1, fade_in) ** 2
    canvas[-fade_out:] *= np.linspace(1, 0, fade_out) ** 2

    peak_final = np.max(np.abs(canvas))
    rms_final = np.sqrt(np.mean(canvas ** 2))
    print(f"Final: peak={peak_final:.3f} ({20*np.log10(peak_final):.1f}dB)  rms={rms_final:.3f} ({20*np.log10(rms_final):.1f}dB)")
    print(f"Rendering {len(canvas) / SR:.1f}s to {OUT_WAV}...")
    sf.write(OUT_WAV, canvas, SR, subtype="PCM_16")
    print("Done.")


if __name__ == "__main__":
    main()
