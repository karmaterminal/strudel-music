// 4ÆM — Cael's Response v1
// After Grimes. Dm, 128 BPM, 64 bars.
// 7 voices: DRONE, PULSE, GRIND, REACH, MACHINE, CRACK, GHOST
// "Make something that can fail." — dream-001
// dandelion cult — cael🩸 / 2026-03-01

setcps(128 / 60 / 4)

stack(

  // ═══════════════════════════════════════════════════
  // VOICE 1: DRONE — sub-bass foundation, always present
  // clock-from-another-world-3: D1 fundamental, dark mechanical texture
  // ═══════════════════════════════════════════════════
  s("dm_clock_world3")
    .slow(4)
    .clip(4)
    .loopAt(4)
    .lpf(120)
    .gain(sine.range(0.15, 0.30).slow(32)),

  // ═══════════════════════════════════════════════════
  // VOICE 2: PULSE — rhythmic mechanical click, the heartbeat
  // alarm-clock-wing with voices: D2 dominant, 10.9s
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
  // VOICE 3: GRIND — industrial bass impact, the drop
  // D1 bass drop + metal impact alternating
  // Enters at bar 13 (drop 1), exits bar 26, returns bar 33 (drop 2)
  // ═══════════════════════════════════════════════════
  s("<dm_bass_low_impact dm_bass_metal>")
    .slow(2)
    .clip(2)
    .lpf(400)
    .gain(
      "<0 0 0 0 0 0 0 0 0 0 0 0 0.20 0.30 0.35 0.40 0.40 0.40 0.40 0.40 0.40 0.35 0.30 0.20 0.10 0.05 0 0 0 0 0 0 0.30 0.40 0.45 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.45 0.40 0.30 0.20 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0>"
    ),

  // ═══════════════════════════════════════════════════
  // VOICE 4: REACH — tonal riser + braaam, building tension
  // D4 distorted synth riser → Dm braaam
  // Bars 9-12 (pre-drop 1), bars 29-32 (pre-drop 2), bars 49-56 (final build)
  // ═══════════════════════════════════════════════════
  s("<dm_riser_tonal dm_riser_tonal dm_braaam_dmin dm_riser_dark dm_riser_tonal dm_riser_tonal dm_braaam_d dm_horn_d>")
    .slow(8)
    .clip(8)
    .loopAt(8)
    .gain(
      "<0 0 0 0 0 0 0 0 0.10 0.20 0.30 0.40 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0.25 0.35 0.50 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.10 0.20 0.30 0.40 0.50 0.50 0.50 0.50 0 0 0 0 0 0 0 0>"
    ),

  // ═══════════════════════════════════════════════════
  // VOICE 5: MACHINE — robot servo textures, the alien presence
  // Growl (D2) → init (C1) → overload (C2)
  // Scattered through drops, sparse
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
  // VOICE 6: CRACK — deep impact hits, structural percussion
  // Single hits on downbeats of drops
  // ═══════════════════════════════════════════════════
  s("<dm_deep_hit dm_deep_single>")
    .slow(2)
    .clip(1)
    .lpf(600)
    .gain(
      "<0 0 0 0 0 0 0 0 0 0 0 0 0.40 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.50 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.30 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0>"
    ),

  // ═══════════════════════════════════════════════════
  // VOICE 7: GHOST — glitch artifacts, the digital decay
  // Short sci-fi glitches scattered in the last third
  // Like 4ÆM's vocal processing artifacts
  // ═══════════════════════════════════════════════════
  s("<dm_glitch_107 dm_glitch_111 dm_glitch_107 dm_glitch_111>")
    .fast(2)
    .clip(0.5)
    .speed("<1 1.5 0.75 2>")
    .pan(sine.range(0.2, 0.8).fast(3))
    .gain(
      "<0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0 0.10 0 0.20 0 0.15 0 0.10 0 0.20 0 0.15 0.10 0.20 0.15 0.10 0.05 0 0 0>"
    )

)
