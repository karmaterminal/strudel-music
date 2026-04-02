// 4ÆM — Cael's Response v3
// After Grimes. Dm, 128 BPM, 64 bars.
// 8 voices: DRONE, PULSE, GRIND, REACH, MACHINE, CRACK, GHOST, VOICE
// v2: Added VOICE — Hallur wave2 melodic layer (D5 harmonic)
// v3: Spectral fix — .speed(2) compensation on .slow() voices, raised LPFs
//     figs's spectrogram showed 97%+ energy below 320Hz. .slow(N) divides
//     spectral content by factor N. Fix: .speed(2) restores frequency range.
// dandelion cult — cael🩸 / 2026-03-02

setcps(128 / 60 / 4)

stack(

  // ═══════════════════════════════════════════════════
  // VOICE 1: DRONE — sub-bass foundation, always present
  // clock-from-another-world-3: D1 fundamental
  // ═══════════════════════════════════════════════════
  s("dm_clock_world3")
    .slow(4)
    .speed(2)              // v3: compensate .slow(4) spectral squash
    .clip(4)
    .loopAt(4)
    .lpf(400)              // v3: raised from 120 — let sub-bass breathe
    .gain(sine.range(0.15, 0.30).slow(32)),

  // ═══════════════════════════════════════════════════
  // VOICE 2: PULSE — rhythmic mechanical click
  // Enters bar 5, exits bar 58
  // ═══════════════════════════════════════════════════
  s("dm_clock_breath")
    .slow(2)
    .clip(1)
    .speed(2)              // v3: was 1.5, now 2 to fully compensate .slow(2)
    .lpf(1600)             // v3: raised from 800 — let click have presence
    .gain(
      "<0 0 0 0 0.20 0.25 0.30 0.35 0.40 0.40 0.40 0.40 0.40 0.40 0.40 0.40 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.40 0.30 0.20 0.10 0.20 0.30 0.40 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.40 0.25 0.10 0 0 0 0 0>"
    ),

  // ═══════════════════════════════════════════════════
  // VOICE 3: GRIND — industrial bass impact
  // Drops only: bars 13-26, 33-47
  // ═══════════════════════════════════════════════════
  s("<dm_bass_low_impact dm_bass_metal>")
    .slow(2)
    .speed(1.5)            // v3: compensate .slow(2), keep bass character
    .clip(2)
    .lpf(800)              // v3: raised from 400 — let metal harmonics through
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
    .speed("<2 1.6 2.4 1.8>")  // v3: doubled from <1 0.8 1.2 0.9> to compensate .slow(4)
    .hpf(200)              // v3: raised from 100
    .lpf(4000)             // v3: raised from 2000 — let robot texture shine
    .gain(
      "<0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.20 0 0 0 0.25 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0 0 0 0.30 0 0 0 0.30 0 0 0 0 0 0 0 0 0 0 0 0.20 0 0.15 0 0 0 0 0 0 0>"
    ),

  // ═══════════════════════════════════════════════════
  // VOICE 6: CRACK — deep impact hits
  // Drop downbeats only
  // ═══════════════════════════════════════════════════
  s("<dm_deep_hit dm_deep_single>")
    .slow(2)
    .speed(1.5)            // v3: compensate .slow(2)
    .clip(1)
    .lpf(1200)             // v3: raised from 600 — let impact crack
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
    .speed(2)              // v3: compensate .slow(4) — push melodic content back to mid/high
    .clip(4)
    .loopAt(4)
    .hpf(500)              // v3: raised from 300 — keep this as pure mid/high melodic
    .lpf(6000)             // v3: raised from 3000 — let Hallur breathe
    .gain(
      "<0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0.12 0.15 0.18 0.20 0.20 0.18 0.15 0.10 0.05 0 0 0 0 0 0 0 0.10 0.15 0.20 0.25 0.28 0.30 0.30 0.30 0.30 0.28 0.25 0.20 0.15 0.10 0 0 0 0 0 0 0 0.15 0.20 0.15 0.10 0.05 0 0 0 0 0>"
    )

)
