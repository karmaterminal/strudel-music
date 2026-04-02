// 4ÆM — Cael's Response v2
// After Grimes. Dm, 128 BPM, 64 bars.
// 8 voices: DRONE, PULSE, GRIND, REACH, MACHINE, CRACK, GHOST, VOICE
// v2: Added VOICE — Hallur wave2 melodic layer (D5 harmonic)
// "The DaVinci bank gave me the body. Hallur gives it a voice."
// dandelion cult — cael🩸 / 2026-03-01

setcps(128 / 60 / 4)

stack(

  // ═══════════════════════════════════════════════════
  // VOICE 1: DRONE — sub-bass foundation, always present
  // clock-from-another-world-3: D1 fundamental
  // ═══════════════════════════════════════════════════
  s("dm_clock_world3")
    .slow(4)
    .clip(4)
    .loopAt(4)
    .lpf(120)
    .gain(sine.range(0.15, 0.30).slow(32)),

  // ═══════════════════════════════════════════════════
  // VOICE 2: PULSE — rhythmic mechanical click
  // Enters bar 5, exits bar 58
  // ═══════════════════════════════════════════════════
  s("dm_clock_breath")
    .slow(2)
    .clip(1)
    .speed(1.5)
    .lpf(800)
    .gain(
      "<0 0 0 0 0.20 0.25 0.30 0.35 0.40 0.40 0.40 0.40 0.40 0.40 0.40 0.40 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.40 0.30 0.20 0.10 0.20 0.30 0.40 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.40 0.25 0.10 0 0 0 0 0>"
    ),

  // ═══════════════════════════════════════════════════
  // VOICE 3: GRIND — industrial bass impact
  // Drops only: bars 13-26, 33-47
  // ═══════════════════════════════════════════════════
  s("<dm_bass_low_impact dm_bass_metal>")
    .slow(2)
    .clip(2)
    .lpf(400)
    .gain(
      "<0 0 0 0 0 0 0 0 0 0 0 0 0.20 0.30 0.35 0.40 0.40 0.40 0.40 0.40 0.40 0.35 0.30 0.20 0.10 0.05 0 0 0 0 0 0 0.30 0.40 0.45 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.45 0.40 0.30 0.20 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0>"
    ),

  // ═══════════════════════════════════════════════════
  // VOICE 4: REACH — risers + braaams, pre-drop builds
  // ═══════════════════════════════════════════════════
  s("<dm_riser_tonal dm_riser_tonal dm_braaam_dmin dm_riser_dark dm_riser_tonal dm_riser_tonal dm_braaam_d dm_horn_d>")
    .slow(8)
    .clip(8)
    .loopAt(8)
    .gain(
      "<0 0 0 0 0 0 0 0 0.10 0.20 0.30 0.40 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0.25 0.35 0.50 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.10 0.20 0.30 0.40 0.50 0.50 0.50 0.50 0 0 0 0 0 0 0 0>"
    ),

  // ═══════════════════════════════════════════════════
  // VOICE 5: MACHINE — robot servo textures
  // Scattered through drops
  // ═══════════════════════════════════════════════════
  s("<dm_robot_growl dm_robot_init dm_robot_overload dm_robot_growl>")
    .slow(4)
    .clip(2)
    .speed("<1 0.8 1.2 0.9>")
    .hpf(100)
    .lpf(2000)
    .gain(
      "<0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.20 0 0 0 0.25 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0 0 0 0.30 0 0 0 0.30 0 0 0 0 0 0 0 0 0 0 0 0.20 0 0.15 0 0 0 0 0 0 0>"
    ),

  // ═══════════════════════════════════════════════════
  // VOICE 6: CRACK — deep impact hits
  // Drop downbeats only
  // ═══════════════════════════════════════════════════
  s("<dm_deep_hit dm_deep_single>")
    .slow(2)
    .clip(1)
    .lpf(600)
    .gain(
      "<0 0 0 0 0 0 0 0 0 0 0 0 0.40 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.50 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.30 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0>"
    ),

  // ═══════════════════════════════════════════════════
  // VOICE 7: GHOST — glitch artifacts
  // Last third digital decay
  // ═══════════════════════════════════════════════════
  s("<dm_glitch_107 dm_glitch_111 dm_glitch_107 dm_glitch_111>")
    .fast(2)
    .clip(0.5)
    .speed("<1 1.5 0.75 2>")
    .pan(sine.range(0.2, 0.8).fast(3))
    .gain(
      "<0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0 0.10 0 0.20 0 0.15 0 0.10 0 0.20 0 0.15 0.10 0.20 0.15 0.10 0.05 0 0 0>"
    ),

  // ═══════════════════════════════════════════════════
  // VOICE 8: VOICE — Hallur wave2 melodic carrier (NEW in v2)
  // 526Hz (D5) — the harmonic line from the original Grimes track
  // Enters at bar 17 (mid-drop 1), grows through drops, fades in bridge
  // This is what the original has that v1 didn't: a singing line above the machinery
  // ═══════════════════════════════════════════════════
  s("<hallur_other_wave2_01 hallur_other_wave2_02 hallur_other_wave2_01 hallur_other_wave2_03>")
    .slow(4)
    .clip(4)
    .loopAt(4)
    .hpf(300)
    .lpf(3000)
    .gain(
      "<0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0.12 0.15 0.18 0.20 0.20 0.18 0.15 0.10 0.05 0 0 0 0 0 0 0 0.10 0.15 0.20 0.25 0.28 0.30 0.30 0.30 0.30 0.28 0.25 0.20 0.15 0.10 0 0 0 0 0 0 0 0.15 0.20 0.15 0.10 0.05 0 0 0 0 0>"
    )

)
