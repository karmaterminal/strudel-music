// ════════════════════════════════════════════════════════════════════════════
// ALL MELODY STUDY — Cael's Multi-Texture Voicing Exercise
// After Nils Frahm — "All Melody" (2018)
//
// Analysis findings:
//   Duration: 14:19 | BPM: ~134 (half-time ~67) | Key: Eb major territory
//   Chroma: D#(.705) A#(.563) F#(.529) F(.509) D(.408) G#(.408)
//   → Strong Eb with lydian color (the F# suggesting B/Cb natural)
//   → Dominant pitch classes: Eb Bb F Ab — Eb major pillars
//
// The original blends piano, pipe organ, drum machines, and orchestral
// textures in a slowly evolving arc: near-silence → full density → fade.
// This study maps that multi-textural approach onto oscillator synthesis.
//
// Architecture:
//   Layer 1 — ORGAN DRONE: triangle oscillator, slow-moving chord pads
//   Layer 2 — PIANO SPINE: sine chord().voicing(), the harmonic skeleton
//   Layer 3 — PULSE: square oscillator, euclidean rhythmic motor
//   Layer 4 — MELODY: sine, a simple melodic line floating above
//   Layer 5 — BASS: sawtooth, low end anchor
//
// Section map (80 cycles @ 67 BPM = ~4:46):
//   [A] EMERGENCE     00-19  (20)  Drone alone, then piano enters
//   [B] BLOOM         20-39  (20)  All layers active, building
//   [C] CATHEDRAL     40-59  (20)  Peak density, full voicings
//   [D] DISSOLUTION   60-79  (20)  Strip back, drone remains, fade
//
// Chord progression (Eb major territory):
//   Eb^7 → Ab^7 → Bb7 → Eb^7 (I → IV → V → I with extensions)
//   Each chord lasts 2 cycles = 2 bars
//   8 bars per rotation, 10 rotations across 80 cycles
//
// Theory tools tested:
//   - chord().voicing() — harmonic spine (proven in Peace Piece)
//   - arrange() — macro form
//   - euclid() — rhythmic distribution
//   - .off() — self-harmony / echo
//   - .jux() — stereo field
//   - Oscillator timbral differentiation (sine/triangle/sawtooth/square)
//
// dandelion cult — cael🩸 / 2026-02-26
// ════════════════════════════════════════════════════════════════════════════

// ~67 BPM, 1 cycle = 1 bar = 4 beats
setcps(67 / 60 / 4)

// ── Gain envelopes (80 values each, one per cycle) ──
// Generate smooth arcs for each layer

stack(

  // ═══════════════ LAYER 1: ORGAN DRONE (triangle) ═════════════════════
  // Slow-moving chords, present throughout, the "pipe organ" texture
  // Triangle wave = warm, hollow, organ-like
  arrange(
    // [A] EMERGENCE — drone fades in from silence
    [20, chord("<Eb^7 Eb^7 Ab^7 Ab^7 Bb7 Bb7 Eb^7 Eb^7 Eb^7 Eb^7 Ab^7 Ab^7 Bb7 Bb7 Eb^7 Eb^7 Eb^7 Eb^7 Ab^7 Ab^7>").voicing().s("triangle")
      .attack(1.5).decay(0.3).sustain(0.8).release(1.5)
      .gain("<0.00 0.01 0.02 0.03 0.04 0.05 0.06 0.07 0.08 0.09 0.10 0.11 0.12 0.13 0.14 0.15 0.16 0.17 0.18 0.19>")
      .pan("<0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55>")
    ],
    // [B] BLOOM — drone sustains at moderate level
    [20, chord("<Eb^7 Eb^7 Ab^7 Ab^7 Bb7 Bb7 Eb^7 Eb^7 Eb^7 Eb^7 Ab^7 Ab^7 Bb7 Bb7 Eb^7 Eb^7 Eb^7 Eb^7 Ab^7 Ab^7>").voicing().s("triangle")
      .attack(1.0).decay(0.3).sustain(0.85).release(1.2)
      .gain("<0.19 0.19 0.20 0.20 0.20 0.20 0.21 0.21 0.21 0.21 0.22 0.22 0.22 0.22 0.22 0.22 0.21 0.21 0.20 0.20>")
      .pan("<0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55>")
    ],
    // [C] CATHEDRAL — drone at full presence
    [20, chord("<Eb^7 Eb^7 Ab^7 Ab^7 Bb7 Bb7 Eb^7 Eb^7 Eb^7 Eb^7 Ab^7 Ab^7 Bb7 Bb7 Eb^7 Eb^7 Eb^7 Eb^7 Ab^7 Ab^7>").voicing().s("triangle")
      .attack(0.8).decay(0.2).sustain(0.9).release(1.0)
      .gain("<0.22 0.22 0.23 0.23 0.24 0.24 0.25 0.25 0.25 0.25 0.25 0.25 0.24 0.24 0.23 0.23 0.22 0.22 0.21 0.21>")
      .pan("<0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55>")
    ],
    // [D] DISSOLUTION — drone fades out slowly
    [20, chord("<Eb^7 Eb^7 Ab^7 Ab^7 Bb7 Bb7 Eb^7 Eb^7 Eb^7 Eb^7 Ab^7 Ab^7 Bb7 Bb7 Eb^7 Eb^7 Eb^7 Eb^7 Eb^7 Eb^7>").voicing().s("triangle")
      .attack(1.5).decay(0.3).sustain(0.8).release(1.5)
      .gain("<0.20 0.19 0.18 0.17 0.16 0.15 0.14 0.13 0.12 0.11 0.10 0.09 0.08 0.07 0.06 0.05 0.04 0.03 0.02 0.01>")
      .pan("<0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55 0.45 0.55>")
    ]
  ),

  // ═══════════════ LAYER 2: PIANO SPINE (sine voicings) ════════════════
  // The harmonic skeleton — chord().voicing() through sine oscillators
  // Enters in section A (bar 10), builds through B and C, exits in D
  arrange(
    // [A] EMERGENCE — piano enters halfway, very soft
    [20, chord("<~ ~ ~ ~ ~ ~ ~ ~ ~ ~ Eb^7 Eb^7 Ab^7 Ab^7 Bb7 Bb7 Eb^7 Eb^7 Ab^7 Ab^7>").voicing().s("sine")
      .attack(0.3).decay(0.2).sustain(0.7).release(0.8)
      .gain("<0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.06 0.07 0.08 0.09 0.10 0.11 0.12 0.13 0.14 0.15>")
    ],
    // [B] BLOOM — piano at moderate, clear voicings
    [20, chord("<Eb^7 Eb^7 Ab^7 Ab^7 Bb7 Bb7 Eb^7 Eb^7 Eb^7 Eb^7 Ab^7 Ab^7 Bb7 Bb7 Eb^7 Eb^7 Eb^7 Eb^7 Ab^7 Ab^7>").voicing().s("sine")
      .attack(0.2).decay(0.15).sustain(0.75).release(0.6)
      .gain("<0.16 0.17 0.18 0.19 0.20 0.21 0.22 0.23 0.24 0.25 0.25 0.25 0.25 0.24 0.24 0.23 0.23 0.22 0.22 0.21>")
    ],
    // [C] CATHEDRAL — piano at peak, rich voicings
    [20, chord("<Eb^7 Eb^7 Ab^7 Ab^7 Bb7 Bb7 Eb^7 Eb^7 Eb^7 Eb^7 Ab^7 Ab^7 Bb7 Bb7 Eb^7 Eb^7 Ab^7 Ab^7 Bb7 Bb7>").voicing().s("sine")
      .attack(0.15).decay(0.1).sustain(0.8).release(0.5)
      .gain("<0.25 0.26 0.27 0.28 0.29 0.30 0.30 0.30 0.30 0.30 0.29 0.29 0.28 0.28 0.27 0.27 0.26 0.26 0.25 0.25>")
    ],
    // [D] DISSOLUTION — piano fades
    [20, chord("<Eb^7 Eb^7 Ab^7 Ab^7 Bb7 Bb7 Eb^7 Eb^7 Eb^7 Eb^7 Ab^7 Ab^7 Eb^7 Eb^7 Eb^7 Eb^7 Eb^7 Eb^7 ~ ~>").voicing().s("sine")
      .attack(0.4).decay(0.2).sustain(0.7).release(1.0)
      .gain("<0.22 0.21 0.20 0.19 0.18 0.17 0.16 0.15 0.14 0.13 0.12 0.10 0.08 0.07 0.06 0.05 0.04 0.03 0.00 0.00>")
    ]
  ),

  // ═══════════════ LAYER 3: RHYTHMIC PULSE (square, euclidean) ═════════
  // Drum machine feel — square wave pulses with euclidean distribution
  // Enters in B, peaks in C, exits early in D
  arrange(
    // [A] EMERGENCE — silent
    [20, note("eb3").s("square").gain(0.00)],
    // [B] BLOOM — pulse enters, euclidean 3-over-8
    [20, note("eb2").s("square").euclid(3, 8)
      .attack(0.005).decay(0.08).sustain(0.3).release(0.1)
      .gain("<0.00 0.02 0.04 0.06 0.07 0.08 0.09 0.10 0.10 0.11 0.11 0.12 0.12 0.13 0.13 0.14 0.14 0.15 0.15 0.15>")
      .pan("<0.3 0.7 0.3 0.7 0.3 0.7 0.3 0.7 0.3 0.7 0.3 0.7 0.3 0.7 0.3 0.7 0.3 0.7 0.3 0.7>")
    ],
    // [C] CATHEDRAL — pulse at full, euclidean 5-over-8 (denser)
    [20, note("eb2").s("square").euclid(5, 8)
      .attack(0.005).decay(0.06).sustain(0.35).release(0.08)
      .gain("<0.15 0.15 0.16 0.16 0.17 0.17 0.18 0.18 0.18 0.18 0.18 0.18 0.17 0.17 0.16 0.16 0.15 0.15 0.14 0.14>")
      .pan("<0.3 0.7 0.3 0.7 0.3 0.7 0.3 0.7 0.3 0.7 0.3 0.7 0.3 0.7 0.3 0.7 0.3 0.7 0.3 0.7>")
    ],
    // [D] DISSOLUTION — pulse fades quickly
    [20, note("eb2").s("square").euclid(3, 8)
      .attack(0.005).decay(0.08).sustain(0.3).release(0.1)
      .gain("<0.12 0.10 0.08 0.06 0.04 0.02 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00>")
      .pan("<0.3 0.7 0.3 0.7 0.3 0.7 0.3 0.7 0.3 0.7 0.3 0.7 0.3 0.7 0.3 0.7 0.3 0.7 0.3 0.7>")
    ]
  ),

  // ═══════════════ LAYER 4: FLOATING MELODY (sine) ═════════════════════
  // Simple melodic fragments in Eb, floating above the texture
  // Uses .off() for self-echo creating a call-and-response feel
  arrange(
    // [A] EMERGENCE — silent
    [20, note("eb5").s("sine").gain(0.00)],
    // [B] BLOOM — melody enters, sparse
    [20, note("<eb5 ~ f5 ~ g5 ~ ab5 ~ bb5 ~ ab5 ~ g5 ~ f5 ~ eb5 ~ f5 ~>").s("sine")
      .attack(0.1).decay(0.3).sustain(0.5).release(0.6)
      .gain("<0.00 0.00 0.04 0.00 0.06 0.00 0.08 0.00 0.10 0.00 0.10 0.00 0.08 0.00 0.06 0.00 0.04 0.00 0.06 0.00>")
    ],
    // [C] CATHEDRAL — melody more present, with echo offset
    [20, note("<eb5 f5 g5 ab5 bb5 ab5 g5 f5 eb5 f5 g5 bb5 ab5 g5 f5 eb5 f5 g5 ab5 bb5>").s("sine")
      .off(0.25, x => x.add(12).gain(0.08))
      .attack(0.08).decay(0.2).sustain(0.6).release(0.5)
      .gain("<0.10 0.11 0.12 0.13 0.14 0.15 0.16 0.16 0.16 0.16 0.16 0.15 0.15 0.14 0.14 0.13 0.12 0.11 0.10 0.10>")
    ],
    // [D] DISSOLUTION — melody thins, fades
    [20, note("<eb5 ~ ~ f5 ~ ~ g5 ~ ~ f5 ~ ~ eb5 ~ ~ ~ ~ ~ ~ ~>").s("sine")
      .attack(0.15).decay(0.3).sustain(0.5).release(0.8)
      .gain("<0.08 0.00 0.00 0.07 0.00 0.00 0.06 0.00 0.00 0.05 0.00 0.00 0.04 0.00 0.00 0.00 0.00 0.00 0.00 0.00>")
    ]
  ),

  // ═══════════════ LAYER 5: BASS (sawtooth) ════════════════════════════
  // Low end anchor — follows the root of each chord
  // Sawtooth for warmth and presence in the low register
  arrange(
    // [A] EMERGENCE — bass enters late, very soft
    [20, note("<~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ eb2 eb2 ab1 ab1 bb1 bb1 eb2 eb2>").s("sawtooth")
      .attack(0.3).decay(0.2).sustain(0.6).release(0.5)
      .gain("<0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.04 0.05 0.06 0.07 0.08 0.09 0.10 0.11>")
    ],
    // [B] BLOOM — bass steady
    [20, note("<eb2 eb2 ab1 ab1 bb1 bb1 eb2 eb2 eb2 eb2 ab1 ab1 bb1 bb1 eb2 eb2 eb2 eb2 ab1 ab1>").s("sawtooth")
      .attack(0.2).decay(0.15).sustain(0.65).release(0.4)
      .gain("<0.12 0.13 0.14 0.14 0.15 0.15 0.16 0.16 0.16 0.16 0.16 0.16 0.15 0.15 0.14 0.14 0.13 0.13 0.12 0.12>")
    ],
    // [C] CATHEDRAL — bass at full
    [20, note("<eb2 eb2 ab1 ab1 bb1 bb1 eb2 eb2 eb2 eb2 ab1 ab1 bb1 bb1 eb2 eb2 ab1 ab1 bb1 bb1>").s("sawtooth")
      .attack(0.15).decay(0.1).sustain(0.7).release(0.3)
      .gain("<0.16 0.17 0.18 0.18 0.19 0.19 0.20 0.20 0.20 0.20 0.19 0.19 0.18 0.18 0.17 0.17 0.16 0.16 0.15 0.15>")
    ],
    // [D] DISSOLUTION — bass fades
    [20, note("<eb2 eb2 ab1 ab1 bb1 bb1 eb2 eb2 eb2 eb2 ab1 ab1 eb2 eb2 eb2 eb2 ~ ~ ~ ~>").s("sawtooth")
      .attack(0.3).decay(0.2).sustain(0.6).release(0.6)
      .gain("<0.14 0.13 0.12 0.11 0.10 0.09 0.08 0.07 0.06 0.05 0.04 0.03 0.02 0.02 0.01 0.01 0.00 0.00 0.00 0.00>")
    ]
  )
)
