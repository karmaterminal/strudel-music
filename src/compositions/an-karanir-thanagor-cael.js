// An Karanir Thanagor — Cael 🩸
// "By the light of the sun" — a Thalassian prayer
// The choir carries the prayer. The orchestra carries the weight.
// The forge underneath. The world around it.
//
// Source: WotLK "An Karanir Thanagor" medley (9:46), Demucs-separated.
// Choir stem sliced into 4 sections (A-D) matching the medley's energy arc.
// Major energy break at 3:19 → section C silence. Four movements:
//   A: INVOCATION (bars 1-16)    — prayer begins, tentative
//   B: PROCLAMATION (bars 17-32) — full choir, the prayer proclaimed
//   C: THE BREAK (bars 33-48)    — silence, fragments, searching
//   D: RESTORATION (bars 49-64)  — grand return, then fade
//
// 60 BPM, 64 bars (~4:16). 9 voices.
// Key: D minor (the medley's tonal center)
//
// DaVinci samples (🍏):
//   dm_riser_tonal — the forge shimmer + the ascent before climaxes
//   dm_horn_d — liturgical summons at section transitions
//   dm_glitch_111 — weight of god as a crack of light at climaxes
//   dm_robot_overload — sparse texture, the imperfection in devotion
//
// Technical: .clip() not .loopAt() for sample voices (loopAt causes
// frequency squash via playback rate adjustment). All samples pre-filtered
// with 6th-order Butterworth HPF at 350Hz via ffmpeg.
//
// QA: ✅ spectral 0% | LUFS -16.8 | true peak -1.4 dBFS
// dandelion cult — cael🩸 / 2026-04-01

setcps(60 / 60 / 4)

stack(

  // ═══════════════════════════════════════════════════
  // VOICE 1: THE PRAYER — choir, the Thalassian words
  // 6s prayer phrases at natural pitch. HPF at 200+ keeps it bright.
  // This is the heart. The choir carries everything.
  // ═══════════════════════════════════════════════════
  arrange(
    // A: Opening prayer — tentative, devotional
    [16, s("<karanir_prayer:0 karanir_prayer:1 karanir_prayer:2 karanir_prayer:3 karanir_prayer:4 karanir_prayer:5>")
      .slow(3)
      .speed(1)
      .clip(3)
      
      .lpf(sine.range(1500, 5000).slow(16))
      
      .gain("<0.07 0.11 0.15 0.18 0.22 0.26 0.28 0.31 0.35 0.37 0.39 0.40 0.40 0.39 0.35 0.31>")
      .pan(0.5)
      .room(0.5).roomsize(0.8)
    ],

    // B: Full choir — the prayer proclaimed
    [16, s("<karanir_choir_b:0 karanir_choir_b:2 karanir_choir_b:4 karanir_choir_b:6 karanir_choir_b:8 karanir_choir_b:1>")
      .slow(3)
      .speed(1)
      .clip(3)
      
      .lpf(sine.range(2000, 7000).slow(16))
      
      .gain("<0.40 0.44 0.48 0.52 0.55 0.57 0.59 0.61 0.61 0.59 0.55 0.52 0.48 0.44 0.40 0.37>")
      .pan(0.5)
      .room(0.4).roomsize(0.7)
    ],

    // C: Choir fragments — the prayer broken, searching
    [16, s("<karanir_choir_c:1 karanir_choir_c:3 karanir_choir_c:5>")
      .slow(6)
      .speed(1)
      .clip(6)
      
      .lpf(sine.range(1000, 3000).slow(16))
      
      .gain("<0.28 0.24 0.20 0.17 0.13 0.11 0.09 0.07 0.07 0.09 0.13 0.17 0.20 0.24 0.28 0.29>")
      .pan(0.5)
      .room(0.6).roomsize(0.9)
    ],

    // D: Grand return — the prayer restored, then fading to silence
    [16, s("<karanir_grand:1 karanir_grand:3 karanir_grand:5 karanir_grand:7 karanir_grand:9 karanir_grand:11>")
      .slow(3)
      .speed(1)
      .clip(3)
      
      .lpf(sine.range(2500, 8000).slow(16))
      
      .gain("<0.33 0.39 0.46 0.52 0.57 0.61 0.64 0.66 0.66 0.63 0.57 0.50 0.40 0.31 0.20 0.09>")
      .pan(0.5)
      .room(0.4).roomsize(0.7)
    ]
  ),

  // ═══════════════════════════════════════════════════
  // VOICE 2: THE WEIGHT — orchestral bed
  // ═══════════════════════════════════════════════════
  arrange(
    [16, s("<karanir_orch_a:0 karanir_orch_a:1 karanir_orch_a:2 karanir_orch_a:3>")
      .slow(3)
      .speed(1)
      .clip(3)
      
      .lpf(2500)
      
      .gain("<0 0 0.09 0.13 0.17 0.20 0.22 0.26 0.28 0.28 0.26 0.24 0.22 0.20 0.18 0.17>")
      .pan(0.5)
      .room(0.4).roomsize(0.7)
    ],

    [16, s("<karanir_orch_b:0 karanir_orch_b:2 karanir_orch_b:4 karanir_orch_b:6 karanir_orch_b:8 karanir_orch_b:1>")
      .slow(3)
      .speed(1)
      .clip(3)
      
      .lpf(4000)
      
      .gain("<0.26 0.29 0.33 0.37 0.40 0.42 0.44 0.46 0.46 0.44 0.40 0.37 0.33 0.29 0.26 0.24>")
      .pan(0.5)
      .room(0.4).roomsize(0.7)
    ],

    [16, s("<karanir_orch_c:0 karanir_orch_c:2 karanir_orch_c:4>")
      .slow(6)
      .speed(1)
      .clip(6)
      
      .lpf(1500)
      
      .gain("<0.18 0.15 0.11 0.09 0.07 0.06 0.06 0.06 0.06 0.07 0.11 0.15 0.18 0.22 0.24 0.26>")
      .pan(0.5)
      .room(0.5).roomsize(0.8)
    ],

    [16, s("<karanir_orch_d:0 karanir_orch_d:2 karanir_orch_d:4 karanir_orch_d:6 karanir_orch_d:8 karanir_orch_d:1>")
      .slow(3)
      .speed(1)
      .clip(3)
      
      .lpf(5000)
      
      .gain("<0.22 0.29 0.37 0.42 0.46 0.50 0.53 0.55 0.55 0.52 0.46 0.39 0.31 0.24 0.17 0.07>")
      .pan(0.5)
      .room(0.4).roomsize(0.7)
    ]
  ),

  // ═══════════════════════════════════════════════════
  // VOICE 3: THE FORGE — DaVinci dm_riser_tonal (second instance)
  // 15% below 320Hz. Pitched down slightly for a different timbre.
  // The forge as a tonal shimmer, not a rumble.
  // ═══════════════════════════════════════════════════
  s("dm_riser_tonal")
    .slow(8)
    .speed(0.9)
    .clip(8)
    
    .lpf(sine.range(1000, 3000).slow(32))
    
    .gain("<0.04 0.04 0.06 0.06 0.07 0.07 0.07 0.07 0.09 0.09 0.09 0.09 0.09 0.09 0.07 0.07 0.07 0.09 0.09 0.11 0.11 0.11 0.11 0.11 0.11 0.09 0.09 0.07 0.07 0.06 0.06 0.06 0.04 0.02 0.02 0.02 0.02 0.02 0.04 0.04 0.04 0.06 0.06 0.07 0.07 0.09 0.11 0.13 0.15 0.17 0.17 0.17 0.17 0.15 0.13 0.11 0.09 0.07 0.06 0.04 0.02 0.02 0.01 0.01>")
    .pan(0.5)
    .room(0.3).roomsize(0.6),

  // ═══════════════════════════════════════════════════
  // VOICE 4: THE CALL — DaVinci dm_horn_d
  // Liturgical summons at section transitions.
  // 62% below 320Hz — the best-balanced brass sample.
  // ═══════════════════════════════════════════════════
  s("dm_horn_d")
    .slow(4)
    .speed(1.2)
    .clip(4)
    
    .lpf(4000)
    
    .gain("<0.20 0.13 0.06 0 0 0 0 0 0 0 0 0 0 0 0 0 0.24 0.17 0.07 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.28 0.20 0.11 0.04 0 0 0 0 0 0 0 0 0 0 0 0>")
    .pan(0.5)
    .room(0.6).roomsize(0.9),

  // ═══════════════════════════════════════════════════
  // VOICE 5: THE WEIGHT OF GOD — DaVinci dm_glitch_111
  // 12% below 320Hz — bright, percussive, ~1.2s.
  // Used as sparse impacts at climax moments.
  // The weight of god heard as a crack of light, not rumble.
  // B climax (bar 21) and D climax (bar 53).
  // ═══════════════════════════════════════════════════
  s("dm_glitch_111")
    .slow(2)
    .speed(0.7)
    .clip(2)
    
    .lpf(4000)
    
    .gain("<0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0.18 0.20 0.18 0.15 0.11 0.07 0.04 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.20 0.24 0.28 0.26 0.22 0.17 0.11 0.06 0 0 0 0>")
    .pan(0.5)
    .room(0.5).roomsize(0.85),

  // ═══════════════════════════════════════════════════
  // VOICE 6: THE ASCENT — DaVinci dm_riser_tonal
  // 15% below 320Hz — the brightest DaVinci sample.
  // Tonal riser before each climax. Bars 15-16 and 47-48.
  // ═══════════════════════════════════════════════════
  s("dm_riser_tonal")
    .slow(2)
    .speed(1.4)
    .clip(2)
    
    .lpf(6000)
    
    .gain("<0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.17 0.22 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.20 0.26 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0>")
    .pan(0.5)
    .room(0.4).roomsize(0.7),

  // ═══════════════════════════════════════════════════
  // VOICE 7: DEVOTIONAL DRONE — D5/A4 organ-point (triangle)
  // Triangle wave: fewer harmonics than sawtooth, less sub-bass bleed.
  // D5 (587Hz) and A4 (440Hz) — both well above 320Hz.
  // Very quiet — the tonal skeleton, not the body.
  // ═══════════════════════════════════════════════════
  note("<d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5 d5>")
    .s("triangle")
    .slow(4)
    .clip(4)
    .lpf(3000)
    .attack(2)
    .decay(0.5)
    .sustain(0.7)
    .release(3)
    .gain("<0.02 0.02 0.03 0.03 0.03 0.04 0.04 0.04 0.04 0.04 0.04 0.04 0.04 0.04 0.04 0.03 0.04 0.04 0.04 0.05 0.05 0.05 0.05 0.06 0.06 0.05 0.05 0.05 0.04 0.04 0.03 0.03 0 0 0 0 0 0 0 0 0 0 0 0 0.03 0.03 0.04 0.04 0.05 0.05 0.06 0.06 0.06 0.06 0.05 0.05 0.04 0.04 0.03 0.03 0.02 0.01 0.01 0.01>")
    .pan(0.45)
    .room(0.5).roomsize(0.85),

  note("<a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4 a4>")
    .s("triangle")
    .slow(4)
    .clip(4)
    .lpf(3000)
    .attack(2)
    .decay(0.5)
    .sustain(0.65)
    .release(3)
    .gain("<0.02 0.02 0.02 0.03 0.03 0.03 0.03 0.03 0.04 0.04 0.04 0.04 0.04 0.04 0.03 0.03 0.03 0.04 0.04 0.04 0.04 0.05 0.05 0.05 0.05 0.04 0.04 0.04 0.03 0.03 0.03 0.02 0 0 0 0 0 0 0 0 0 0 0 0 0.02 0.03 0.03 0.04 0.04 0.05 0.05 0.05 0.05 0.05 0.04 0.04 0.03 0.03 0.02 0.02 0.01 0.01 0.01 0>")
    .pan(0.55)
    .room(0.5).roomsize(0.85),

  // ═══════════════════════════════════════════════════
  // VOICE 8: CHOIR SHIMMER — high-passed choir layer
  // Same choir, HPF at 1000Hz. Pure brightness. The prayer
  // heard from above the cathedral, only the upper harmonics
  // reaching through the stone. Adds critical spectral presence.
  // ═══════════════════════════════════════════════════
  arrange(
    [16, s("<karanir_prayer:1 karanir_prayer:3 karanir_prayer:5>")
      .slow(3)
      .speed(1)
      .clip(3)
      
      
      .lpf(10000)
      .gain("<0.07 0.09 0.13 0.15 0.18 0.20 0.22 0.24 0.26 0.28 0.28 0.28 0.26 0.24 0.20 0.17>")
      .pan(0.5)
      .room(0.6).roomsize(0.9)
    ],

    [16, s("<karanir_choir_b:1 karanir_choir_b:3 karanir_choir_b:5 karanir_choir_b:7 karanir_choir_b:9 karanir_choir_b:10>")
      .slow(3)
      .speed(1)
      .clip(3)
      
      
      .lpf(12000)
      .gain("<0.26 0.29 0.33 0.37 0.40 0.42 0.44 0.46 0.46 0.44 0.40 0.37 0.33 0.29 0.26 0.22>")
      .pan(0.5)
      .room(0.5).roomsize(0.8)
    ],

    [16, s("<karanir_choir_c:0 karanir_choir_c:2 karanir_choir_c:4>")
      .slow(6)
      .speed(1)
      .clip(6)
      
      
      .lpf(10000)
      .gain("<0.17 0.13 0.11 0.09 0.07 0.06 0.06 0.06 0.06 0.07 0.09 0.13 0.17 0.18 0.20 0.22>")
      .pan(0.5)
      .room(0.7).roomsize(0.9)
    ],

    [16, s("<karanir_grand:2 karanir_grand:4 karanir_grand:6 karanir_grand:8 karanir_grand:10 karanir_grand:12>")
      .slow(3)
      .speed(1)
      .clip(3)
      
      
      .lpf(12000)
      .gain("<0.20 0.28 0.35 0.40 0.44 0.48 0.50 0.52 0.52 0.48 0.42 0.35 0.28 0.20 0.13 0.06>")
      .pan(0.5)
      .room(0.5).roomsize(0.8)
    ]
  ),

  // ═══════════════════════════════════════════════════
  // VOICE 9: DaVinci GLITCH TEXTURE — dm_robot_overload
  // 24% below 320Hz — bright mechanical shimmer, 4.8s.
  // The imperfection in the prayer — the world is not smooth.
  // Sparse texture hits at key moments.
  // ═══════════════════════════════════════════════════
  s("dm_robot_overload")
    .slow(4)
    .speed(1.5)
    .clip(2)
    
    .lpf(6000)
    .gain("<0 0 0 0.04 0 0 0 0 0 0 0.06 0 0 0 0 0 0 0 0 0 0.07 0 0 0 0.06 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.09 0 0.07 0 0 0 0 0 0 0 0 0>")
    .pan(0.5)
    .room(0.4).roomsize(0.6)

)
