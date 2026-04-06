// fusion-silas.js
// Silas's take on Estes Tonne — Fusion (Live Radio Edit)
// The fog under the fingers. What the room hears between the notes.
//
// Source analysis (Essentia):
//   Key: E minor (strength 0.931)
//   BPM: 126.2
//   Chords: Em 43.8%, C 17.8%, D 11.8%, Am 5.3%
//   Centroid: 700 Hz avg (warm body territory)
//   Brightness arc: Q1 647 → Q2 688 → Q3 852 → Q4 467 Hz
//   Dissonance: 0.430 (moderate — consonant but not vanilla)
//   Onset rate: 4.07/s (dense percussive fingerpicking)
//   Loudness: -12.9 LUFS
//
// Concept: The resonance, not the attack. Tonne's fingers move fast
// but the room absorbs it into a warm blur. This piece is the blur —
// what you hear if you're standing in the back of the venue, where
// individual notes become texture and the centroid IS the melody.
//
// 4 movements matching the brightness arc:
//   WAKE (1-16):  647 Hz — Em drone, tentative harmonics emerging
//   WARM (17-32): 688 Hz — C/D color enters, the room fills
//   BURN (33-48): 852 Hz — brightness peak, all voices active
//   ASH  (49-64): 467 Hz — everything below 500 Hz, the exhale
//
// dandelion cult 🌫️ — 2026-04-05

setcps(126.2 / 60 / 4) // 126.2 BPM, 4 beats per cycle

// ═══════════════════════════════════════════════════════════════════
// PROGRESSION — the i → VI → VII float
// Em for 2 beats, then C or D for 2 beats. Never resolves through V.
// ═══════════════════════════════════════════════════════════════════
const prog = chord("<Em C Em D Em Am Em C>").slow(8)

// ═══════════════════════════════════════════════════════════════════
// LAYER 1: DRONE — the room resonance
// E2 sine, always present, gain follows the brightness arc.
// This is the floor the piece stands on.
// ═══════════════════════════════════════════════════════════════════
const drone = note("E2")
  .s("sine")
  .gain(
    sine.range(0.01, 0.03).slow(64) // breathes over the whole piece
  )
  .attack(2.0)
  .decay(1.0)
  .sustain(0.8)
  .release(3.0)
  .clip(1)
  .lpf(400)

// ═══════════════════════════════════════════════════════════════════
// LAYER 2: CHORD WASH — voice-led pads following the progression
// Triangle waves, warm and rounded. The body of the fog.
// Centroid target: ~700 Hz (LPF at 1200 to stay in zone)
// ═══════════════════════════════════════════════════════════════════
const wash = prog
  .anchor("E4")
  .voicing()
  .s("triangle")
  .gain(
    // brightness arc as amplitude: low → low → peak → drop
    sine.range(0.008, 0.025).slow(48)
  )
  .attack(1.5)
  .decay(0.5)
  .sustain(0.6)
  .release(2.0)
  .clip(1)
  .lpf(2400)
  .pan(sine.range(0.3, 0.7).slow(24))

// ═══════════════════════════════════════════════════════════════════
// LAYER 3: GHOST TEXTURE — the fingerpick blur
// Not individual notes — a rhythmic shimmer that approximates
// 4 onsets/second as a 16th-note pattern with gaps.
// Pitched to chord tones but quiet, more texture than melody.
// ═══════════════════════════════════════════════════════════════════
const ghosts = prog
  .anchor("E5")
  .voicing()
  .s("sine")
  .struct("t ~ t t ~ t ~ t t ~ t ~ t t ~ ~")
  .gain(sine.range(0.004, 0.012).slow(32))
  .attack(0.02)
  .decay(0.15)
  .sustain(0.1)
  .release(0.3)
  .clip(0.25)
  .lpf(sine.range(800, 2000).slow(64)) // filter tracks brightness arc
  .pan(sine.range(0.1, 0.9).slow(7)) // wide stereo scatter

// ═══════════════════════════════════════════════════════════════════
// LAYER 4: OVERTONE — harmonic partials from the E string
// Sine at B3 and E4, very quiet. The natural harmonics of
// an open low-E string. Present in WARM and BURN, gone in ASH.
// ═══════════════════════════════════════════════════════════════════
const overtone = note("<B4 E5>")
  .s("sine")
  .gain(sine.range(0.002, 0.008).slow(40))
  .attack(0.5)
  .decay(0.3)
  .sustain(0.3)
  .release(1.5)
  .clip(1)
  .pan(0.6)

// ═══════════════════════════════════════════════════════════════════
// LAYER 5: BREATH — filtered noise, the room air
// Very quiet pink-ish noise, LPF'd low. You feel it more
// than hear it. The venue HVAC, the audience shifting.
// ═══════════════════════════════════════════════════════════════════
const breath = note("C6")
  .s("sine")
  .gain(sine.range(0.001, 0.004).slow(56))
  .lpf(sine.range(400, 900).slow(64))
  .clip(1)
  .pan(0.5)

// ═══════════════════════════════════════════════════════════════════
// STACK — all layers, 64 cycles at 126.2 BPM ≈ 4:03
// ═══════════════════════════════════════════════════════════════════
stack(
  drone,
  wash,
  ghosts,
  overtone,
  breath
)
