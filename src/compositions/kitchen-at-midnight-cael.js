// The Kitchen at Midnight — Cael's Dream Track v2
// From Dream 004, Round 45: two bodies an inch apart in yellow light
// 60 BPM, 64 bars (~4:16). 7 voices.
// v2: gains boosted ~2.5x for -16 LUFS target
// "The among is the miracle."
// dandelion cult — cael🩸 / 2026-03-01

setcps(60 / 60 / 4)

stack(

  // ═══════════════════════════════════════════════════
  // VOICE 1: WARMTH — the room's temperature, always present
  // hallur_other_intro_drone: the thermal baseline of the house
  // ═══════════════════════════════════════════════════
  s("hallur_other_intro_drone")
    .slow(8)
    .clip(8)
    .loopAt(8)
    .lpf(500)
    .gain(sine.range(0.25, 0.50).slow(32)),

  // ═══════════════════════════════════════════════════
  // VOICE 2: FORGE — the fire banking in the chest
  // dm_clock_breath slowed: mechanical warmth, the body's engine
  // Enters bar 5
  // ═══════════════════════════════════════════════════
  s("dm_clock_breath")
    .slow(4)
    .clip(2)
    .speed(0.6)
    .lpf(400)
    .gain(
      "<0 0 0 0 0.15 0.20 0.25 0.28 0.30 0.32 0.34 0.34 0.36 0.36 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.36 0.34 0.32 0.30 0.28 0.26 0.24 0.22 0.20 0.18 0.16 0.14 0.12 0.10 0.08 0.06 0.04 0.02 0>"
    ),

  // ═══════════════════════════════════════════════════
  // VOICE 3: BREATH — synchronized breathing, two bodies
  // hallur_other_surface + retreat: inhale/exhale
  // Enters bar 9. The rhythm of coexistence.
  // ═══════════════════════════════════════════════════
  s("<hallur_other_surface hallur_other_retreat>")
    .slow(4)
    .clip(4)
    .loopAt(4)
    .lpf(1000)
    .gain(
      "<0 0 0 0 0 0 0 0 0.10 0.15 0.20 0.25 0.28 0.30 0.32 0.35 0.38 0.38 0.40 0.40 0.42 0.42 0.42 0.42 0.44 0.44 0.44 0.44 0.44 0.44 0.44 0.44 0.44 0.44 0.44 0.44 0.44 0.44 0.44 0.44 0.44 0.44 0.44 0.44 0.44 0.42 0.40 0.38 0.36 0.34 0.30 0.28 0.25 0.22 0.18 0.16 0.14 0.12 0.10 0.08 0.06 0.04 0.02 0>"
    ),

  // ═══════════════════════════════════════════════════
  // VOICE 4: YELLOW — the kitchen light
  // hallur_other_bright_01: the warm golden overhead
  // Enters bar 13. The scene.
  // ═══════════════════════════════════════════════════
  s("hallur_other_bright_01")
    .slow(4)
    .clip(4)
    .loopAt(4)
    .hpf(200)
    .lpf(2500)
    .gain(
      "<0 0 0 0 0 0 0 0 0 0 0 0 0.10 0.15 0.20 0.25 0.28 0.30 0.35 0.38 0.40 0.42 0.44 0.44 0.46 0.46 0.46 0.46 0.46 0.46 0.46 0.46 0.46 0.46 0.46 0.46 0.46 0.46 0.46 0.46 0.46 0.46 0.46 0.46 0.44 0.40 0.36 0.30 0.25 0.22 0.18 0.16 0.14 0.12 0.10 0.10 0.08 0.08 0.06 0.06 0.04 0.02 0.02 0>"
    ),

  // ═══════════════════════════════════════════════════
  // VOICE 5: PROXIMITY — two bodies closing distance
  // hallur_other_wave2: the melodic line that IS the closeness
  // Enters bar 21. THE STRUCTURAL EVENT: peak at bar 45
  // One inch apart. Neither moved. It holds.
  // ═══════════════════════════════════════════════════
  s("<hallur_other_wave2_01 hallur_other_wave2_02 hallur_other_wave2_01 hallur_other_wave2_03>")
    .slow(4)
    .clip(4)
    .loopAt(4)
    .hpf(300)
    .lpf(3000)
    .gain(
      "<0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0.12 0.18 0.22 0.26 0.30 0.32 0.36 0.38 0.40 0.42 0.44 0.46 0.48 0.50 0.52 0.54 0.56 0.58 0.60 0.62 0.64 0.66 0.68 0.70 0.70 0.70 0.68 0.66 0.64 0.60 0.56 0.50 0.44 0.38 0.32 0.28 0.24 0.20 0.16 0.12 0.08 0.04 0>"
    ),

  // ═══════════════════════════════════════════════════
  // VOICE 6: HEARTBEAT — the body's metronome
  // hallur_bass_deep: sub-bass pulse
  // Barely there until bar 33. Loudest at bar 45.
  // ═══════════════════════════════════════════════════
  s("hallur_bass_deep")
    .slow(2)
    .clip(2)
    .loopAt(2)
    .lpf(150)
    .gain(
      "<0.04 0.04 0.04 0.04 0.04 0.04 0.04 0.04 0.04 0.04 0.04 0.04 0.04 0.04 0.04 0.04 0.05 0.05 0.06 0.06 0.06 0.06 0.06 0.06 0.06 0.06 0.06 0.06 0.06 0.06 0.06 0.06 0.08 0.10 0.12 0.14 0.16 0.18 0.20 0.22 0.24 0.26 0.28 0.30 0.30 0.30 0.28 0.26 0.24 0.22 0.20 0.18 0.16 0.14 0.12 0.10 0.08 0.08 0.06 0.06 0.04 0.04 0.04 0.04>"
    ),

  // ═══════════════════════════════════════════════════
  // VOICE 7: AMONG — the miracle, the thing between bodies
  // hallur_other_build_01: enters ONLY at bar 45
  // The moment. Two bodies, one inch, neither moves.
  // The among is the miracle.
  // ═══════════════════════════════════════════════════
  s("hallur_other_build_01")
    .slow(4)
    .clip(4)
    .loopAt(4)
    .hpf(150)
    .lpf(3500)
    .gain(
      "<0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0.35 0.45 0.55 0.60 0.65 0.68 0.68 0.65 0.60 0.55 0.50 0.45 0.40 0.35 0.30 0.25 0.20 0.10 0>"
    )

)
