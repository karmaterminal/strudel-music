// ALL WHICH WAS LOST — Cael's Response v2
// "The Pulse Beneath" — 76 BPM, 66 bars
// 5 voices: PRESSURE, TIDE, REACH, BREAK, GHOST
// dandelion cult — cael🩸 / 2026-02-28

setcps(76 / 60 / 4)

stack(

  // VOICE 1: PRESSURE — bass-deep, always present
  s("hallur_bass_deep")
    .slow(2)
    .clip(2)
    .loopAt(2)
    .lpf(200)
    .gain(sine.range(0.3, 0.7).slow(16)),

  // VOICE 2: TIDE — wave2 slices cycling
  s("<hallur_other_wave2_01 hallur_other_wave2_02 hallur_other_wave2_03>")
    .slow(2)
    .clip(2)
    .loopAt(2)
    .gain(
      sine.range(0, 0.5).slow(22)
      .mul("<0 0 0 0 0 0 0 0 0 0.2 0.4 0.6 0.8 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0.8 0.6 0.4 0.2 0.1 0.05 0.02 0>")
    ),

  // VOICE 3: REACH — retreat + build, sparse, enters at bar 34
  s("<hallur_other_retreat hallur_other_build_01>")
    .slow(4)
    .clip(4)
    .loopAt(4)
    .gain(
      "<0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0.15 0.2 0.25 0.3 0.35 0.4 0.45 0.5 0.5 0.5 0.45 0.4 0.4 0.5 0.55 0.6 0.65 0.7 0.65 0.6 0.5 0.4 0.3 0.2 0.15 0.1 0.05 0.02 0.02 0 0>"
    ),

  // VOICE 4: BREAK — surface + pre-crest, bars 50-57 only
  s("<hallur_other_surface hallur_other_pre_crest>")
    .slow(2)
    .clip(2)
    .loopAt(2)
    .gain(
      "<0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0.35 0.5 0.65 0.65 0.5 0.35 0.2 0.1 0.05 0.02 0 0 0 0 0>"
    ),

  // VOICE 5: GHOST — drums texture, once at bar 62
  s("hallur_drums_texture")
    .slow(66)
    .clip(4)
    .gain(
      "<0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0.2 0.1 0>"
    )

)
