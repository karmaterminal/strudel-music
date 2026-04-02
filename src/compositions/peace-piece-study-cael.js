// ════════════════════════════════════════════════════════════════════════════
// PEACE PIECE STUDY — Cael's Voicing System Diagnostic
// After Bill Evans — "Peace Piece" (1958/2024)
//
// Harmonic framework: Cmaj7 → G9 (standing in for G9sus4, not in dictionary)
// The real Peace Piece = Cmaj7 → G9sus4, a two-chord vamp where all
// structural change comes from voicing motion, register, and tension.
//
// This is NOT a clone — it's a test piece for Strudel's chord()/voicing()
// system rendered through our headless chunked renderer. The goal is to
// verify that voicing resolution → note haps → sine oscillator pipeline
// works end-to-end in the software mixer.
//
// Architecture:
//   - chord().voicing().s('sine') produces {note, s, gain} haps
//   - The chunked renderer handles sine oscillators with ADSR
//   - arrange() provides macro form
//   - Manual gain envelopes shape dynamics
//
// Key: C major / modal
// Tempo: ~56 BPM (meditative, Evans-like)
// 1 cycle = 1 bar = 4 beats
// Duration: 64 cycles @ 56 BPM ≈ 4:34
//
// Section map (64 cycles):
//   [A] STILLNESS    00-07  (8)   Cmaj7 pad alone, pp, establishing the vamp
//   [B] BREATH       08-23  (16)  Both chords, bass enters, gentle motion
//   [C] EXPLORATION  24-39  (16)  Register opens, higher voicings, more tension
//   [D] RADIANCE     40-51  (12)  Peak density, all voices, fullest dynamics
//   [E] RETURN       52-63  (12)  Strip back to Cmaj7 alone, fade to silence
//
// Pitch classes:
//   Cmaj7: C E G B
//   G9:    G A B D F (subset of G9sus4: G A C D F — close enough)
//   Union: C D E F G A B — all white keys, no chromatic tension
//
// dandelion cult — cael🩸 / 2026-02-26
// ════════════════════════════════════════════════════════════════════════════

setcps(56 / 60 / 4)

stack(

  // ═══════════════ PAD — chord voicings via sine oscillators ════════════
  // This is the diagnostic payload: chord().voicing() → note haps → sine
  // The voicing system resolves C^7 and G9 into close-position piano voicings
  // and outputs individual note events that our renderer synthesizes.
  arrange(
    // [A] STILLNESS — Cmaj7 only, very soft
    [8, chord("C^7").voicing().s("sine")
      .attack(0.8).decay(0.2).sustain(0.9).release(1.0)
      .gain(
        "<0.06 0.07 0.08 0.09 0.10 0.11 0.12 0.13>"
      )
    ],
    // [B] BREATH — both chords alternate
    [16, chord("<C^7 G9>").voicing().s("sine")
      .attack(0.5).decay(0.3).sustain(0.85).release(0.8)
      .gain(
        "<0.14 0.15 0.16 0.17 0.18 0.19 0.20 0.21 0.21 0.22 0.22 0.23 0.23 0.24 0.24 0.25>"
      )
    ],
    // [C] EXPLORATION — open voicings, building
    [16, chord("<C^7 G9>").voicing().s("sine")
      .attack(0.3).decay(0.2).sustain(0.8).release(0.6)
      .gain(
        "<0.25 0.26 0.27 0.28 0.29 0.30 0.30 0.30 0.30 0.29 0.29 0.28 0.28 0.27 0.27 0.26>"
      )
    ],
    // [D] RADIANCE — peak energy
    [12, chord("<C^7 G9>").voicing().s("sine")
      .attack(0.2).decay(0.15).sustain(0.75).release(0.5)
      .gain(
        "<0.30 0.31 0.32 0.33 0.34 0.34 0.33 0.32 0.31 0.30 0.28 0.26>"
      )
    ],
    // [E] RETURN — Cmaj7 only, fading
    [12, chord("C^7").voicing().s("sine")
      .attack(1.0).decay(0.3).sustain(0.9).release(1.2)
      .gain(
        "<0.22 0.20 0.18 0.16 0.14 0.12 0.10 0.08 0.06 0.04 0.03 0.02>"
      )
    ]
  ),

  // ═══════════════ BASS — root notes from the progression ══════════════
  // Simple sine bass following the chord roots
  // C2 under Cmaj7, G1 under G9
  arrange(
    // [A] STILLNESS — no bass yet
    [8, note("~").s("sine").gain(0)],
    // [B] BREATH — bass enters softly on C2
    [16, note("<C2 G1>").s("sine")
      .attack(0.3).decay(0.5).sustain(0.7).release(0.6)
      .gain(
        "<0.08 0.09 0.10 0.11 0.12 0.13 0.14 0.15 0.15 0.16 0.16 0.17 0.17 0.18 0.18 0.19>"
      )
    ],
    // [C] EXPLORATION — fuller bass
    [16, note("<C2 G1>").s("sine")
      .attack(0.2).decay(0.4).sustain(0.75).release(0.5)
      .gain(
        "<0.20 0.21 0.22 0.23 0.24 0.25 0.25 0.25 0.25 0.24 0.24 0.23 0.23 0.22 0.22 0.21>"
      )
    ],
    // [D] RADIANCE — strongest bass
    [12, note("<C2 G1>").s("sine")
      .attack(0.15).decay(0.3).sustain(0.8).release(0.4)
      .gain(
        "<0.25 0.26 0.27 0.28 0.28 0.28 0.27 0.26 0.25 0.24 0.22 0.20>"
      )
    ],
    // [E] RETURN — bass fades with pad
    [12, note("C2").s("sine")
      .attack(0.5).decay(0.5).sustain(0.7).release(0.8)
      .gain(
        "<0.16 0.14 0.12 0.10 0.09 0.08 0.06 0.05 0.04 0.03 0.02 0.01>"
      )
    ]
  ),

  // ═══════════════ HIGH SHIMMER — octave-doubled 5th for sparkle ═══════
  // A single high G5 sine that enters during exploration and peaks at radiance
  // Mimics Evans' tendency to let upper register notes ring
  arrange(
    // [A] STILLNESS — silent
    [8, note("~").s("sine").gain(0)],
    // [B] BREATH — silent
    [16, note("~").s("sine").gain(0)],
    // [C] EXPLORATION — high G5 enters
    [16, note("<G5 G5>").s("sine")
      .attack(1.5).decay(0.5).sustain(0.6).release(1.0)
      .gain(
        "<0 0 0.03 0.04 0.05 0.06 0.07 0.08 0.08 0.08 0.07 0.07 0.06 0.06 0.05 0.04>"
      )
    ],
    // [D] RADIANCE — high B5 and G5 alternate
    [12, note("<B5 G5>").s("sine")
      .attack(1.0).decay(0.3).sustain(0.5).release(0.8)
      .gain(
        "<0.08 0.09 0.10 0.10 0.10 0.09 0.09 0.08 0.07 0.06 0.04 0.02>"
      )
    ],
    // [E] RETURN — high shimmer fades first
    [12, note("B5").s("sine")
      .attack(2.0).decay(0.5).sustain(0.4).release(1.5)
      .gain(
        "<0.04 0.03 0.02 0.01 0 0 0 0 0 0 0 0>"
      )
    ]
  ),

  // ═══════════════ MIDDLE VOICE — 3rd/7th color tones ══════════════════
  // Slow-moving E4 and B4 tones that add harmonic richness
  // These are the "guide tones" — the notes that define chord quality
  arrange(
    // [A] STILLNESS — silent
    [8, note("~").s("sine").gain(0)],
    // [B] BREATH — E4 appears softly
    [16, note("<E4 F4>").s("sine")
      .attack(1.0).decay(0.3).sustain(0.8).release(0.8)
      .gain(
        "<0 0 0 0 0.04 0.05 0.06 0.07 0.08 0.08 0.09 0.09 0.10 0.10 0.10 0.10>"
      )
    ],
    // [C] EXPLORATION — guide tones stronger
    [16, note("<E4 D4>").s("sine")
      .attack(0.8).decay(0.2).sustain(0.75).release(0.6)
      .gain(
        "<0.10 0.11 0.12 0.13 0.14 0.14 0.14 0.14 0.14 0.13 0.13 0.12 0.12 0.11 0.11 0.10>"
      )
    ],
    // [D] RADIANCE — richest guide tone presence
    [12, note("<E4 D4>").s("sine")
      .attack(0.5).decay(0.2).sustain(0.7).release(0.5)
      .gain(
        "<0.14 0.15 0.16 0.16 0.16 0.16 0.15 0.14 0.13 0.12 0.10 0.08>"
      )
    ],
    // [E] RETURN — E4 lingers, fades
    [12, note("E4").s("sine")
      .attack(1.5).decay(0.3).sustain(0.8).release(1.0)
      .gain(
        "<0.08 0.07 0.06 0.05 0.04 0.03 0.02 0.02 0.01 0.01 0 0>"
      )
    ]
  )
)
// ════════════════════════════════════════════════════════════════════════
// The piece breathes like Evans at the piano — unhurried, each voicing
// given space to resonate. The two chords aren't a progression so much
// as a conversation: Cmaj7 is home, G9 is the question that makes
// home meaningful. The return is not resolution but acceptance.
//
// Technical note: This tests whether Strudel's voicing() system
// can produce usable haps in the headless renderer. If the sine
// oscillators sound correct, the entire chord→voicing→render pipeline
// is validated for future sample-based voicing work.
// ════════════════════════════════════════════════════════════════════════
