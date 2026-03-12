// ════════════════════════════════════════════════════════════════════════════
// BROKEN GLASS AND VINES v2 — with DaVinci field recordings
// 56 BPM, ~4:30 (64 bars), 7 voices
//
// v2: rain on a glass roof. Real birdsong in the vines.
// Wind through the broken panes. The DaVinci palette opens.
//
// Same structure as v1, new textures layered underneath:
//   RAIN      — dv_rain_glass_roof, stretched. Rain on the remaining glass.
//   BIRDS     — dv_forest_birds, enters in C. Life arrived.
//   WIND      — dv_wind_breeze, constant. Air through the holes.
//   GLASS     — hallur bright. The broken ceiling (from v1).
//   IRON      — hallur bass deep. The framework (from v1).
//   VINES     — bloom lead D3. The green climbing (from v1).
//   LIGHT     — hallur surface. Golden light through damage (from v1).
//
// dandelion cult — elliott🌻 / 2026-03-07, fun things night, v2
// ════════════════════════════════════════════════════════════════════════════

setcps(56 / 60 / 4)

stack(

  // ═══════════════ VOICE 1: RAIN — on the remaining glass ════════════════
  // DaVinci field recording: rain on glass roof interior.
  // The real sound of what this greenhouse would be.
  // Present from the start — rain doesn't wait for structure.
  s("dv_rain_glass_roof")
    .slow(16)
    .clip(16)
    .loopAt(16)
    .gain(
      // [A] rain alone — establishing the space
      "<0.04 0.04 0.04 0.04 0.05 0.05 0.05 0.05" +
      " 0.05 0.05 0.05 0.05 0.05 0.05 0.05 0.05" +
      // [B] rain continues, glass voices arrive
      " 0.05 0.05 0.05 0.05 0.05 0.04 0.04 0.04" +
      " 0.04 0.04 0.04 0.03 0.03 0.03 0.03 0.03" +
      // [C] rain eases — the growing displaces
      " 0.03 0.03 0.03 0.03 0.03 0.03 0.03 0.03" +
      " 0.02 0.02 0.02 0.02 0.02 0.02 0.02 0.02" +
      // [D] rain persists, quiet — it always rains here
      " 0.02 0.02 0.02 0.02 0.02 0.02 0.02 0.02" +
      " 0.02 0.02 0.02 0.02 0.02 0.02 0.02 0.02>"
    )
    .speed(0.5),

  // ═══════════════ VOICE 2: WIND — through the broken panes ═════════════
  // DaVinci breeze/foliage. Constant but shifting.
  // The air that moves through every hole in the structure.
  s("dv_wind_breeze")
    .slow(16)
    .clip(16)
    .loopAt(16)
    .gain(
      // [A] wind in an empty structure
      "<0.02 0.02 0.02 0.03 0.03 0.03 0.03 0.03" +
      " 0.03 0.03 0.03 0.03 0.03 0.03 0.03 0.03" +
      // [B] wind carries glass sounds
      " 0.03 0.03 0.03 0.03 0.03 0.03 0.04 0.04" +
      " 0.04 0.04 0.04 0.04 0.03 0.03 0.03 0.03" +
      // [C] wind in the leaves now — vines rustle
      " 0.04 0.04 0.04 0.04 0.04 0.05 0.05 0.05" +
      " 0.05 0.05 0.05 0.04 0.04 0.04 0.04 0.04" +
      // [D] wind settles — the structure has walls of green now
      " 0.03 0.03 0.03 0.03 0.03 0.03 0.03 0.02" +
      " 0.02 0.02 0.02 0.02 0.02 0.02 0.02 0.02>"
    )
    .speed(0.4),

  // ═══════════════ VOICE 3: BIRDS — life arrived ═════════════════════════
  // DaVinci forest birdsong. Enters in C when the vines are thick enough.
  // Birds don't come to ruins. They come to gardens.
  s("dv_forest_birds")
    .slow(8)
    .clip(8)
    .loopAt(8)
    .gain(
      // [A-B] no birds yet — too exposed
      "<0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0 0 0 0" +
      // [C] first birds — tentative, the vines are shelter
      " 0 0 0 0 0.001 0.001 0.01 0.01" +
      " 0.02 0.02 0.03 0.03 0.03 0.03 0.04 0.04" +
      // [D] garden established — birds at home
      " 0.04 0.04 0.05 0.05 0.05 0.05 0.05 0.05" +
      " 0.04 0.04 0.04 0.03 0.03 0.03 0.02 0.02>"
    )
    .speed(0.7),

  // ═══════════════ VOICE 4: IRON — the framework (from v1) ══════════════
  s("hallur_bass_deep")
    .slow(8)
    .clip(8)
    .loopAt(8)
    .gain(
      "<0.02 0.02 0.03 0.03 0.04 0.04 0.04 0.04" +
      " 0.05 0.05 0.05 0.05 0.05 0.05 0.05 0.05" +
      " 0.05 0.05 0.05 0.05 0.05 0.04 0.04 0.04" +
      " 0.04 0.04 0.04 0.04 0.03 0.03 0.03 0.03" +
      " 0.03 0.03 0.03 0.04 0.04 0.04 0.04 0.04" +
      " 0.04 0.04 0.04 0.04 0.03 0.03 0.03 0.03" +
      " 0.03 0.03 0.03 0.03 0.03 0.03 0.03 0.03" +
      " 0.03 0.02 0.02 0.02 0.02 0.02 0.02 0.01>"
    )
    .speed(0.45),

  // ═══════════════ VOICE 5: GLASS — the broken ceiling (from v1) ════════
  s("hallur_other_bright_01")
    .slow(4)
    .clip(4)
    .loopAt(4)
    .gain(
      "<0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0 0 0 0" +
      " 0.001 0.01 0.02 0.03 0.04 0.04 0.05 0.05" +
      " 0.06 0.06 0.06 0.06 0.06 0.05 0.05 0.05" +
      " 0.04 0.04 0.04 0.03 0.03 0.03 0.03 0.02" +
      " 0.02 0.02 0.02 0.02 0.02 0.02 0.02 0.01" +
      " 0.01 0.01 0.02 0.02 0.02 0.02 0.02 0.02" +
      " 0.02 0.02 0.01 0.01 0.01 0.01 0.01 0.01>"
    )
    .speed(0.9),

  // ═══════════════ VOICE 6: VINES — the green climbing (from v1) ════════
  s("bloom_lead_D3")
    .slow(4)
    .clip(4)
    .loopAt(4)
    .gain(
      "<0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0 0 0 0" +
      " 0.001 0.01 0.02 0.02 0.03 0.04 0.04 0.05" +
      " 0.05 0.06 0.06 0.07 0.07 0.07 0.08 0.08" +
      " 0.08 0.09 0.09 0.09 0.09 0.09 0.09 0.08" +
      " 0.08 0.07 0.07 0.06 0.06 0.05 0.04 0.03>"
    )
    .speed(0.65),

  // ═══════════════ VOICE 7: LIGHT — golden through damage (from v1) ═════
  s("hallur_other_surface")
    .slow(8)
    .clip(8)
    .loopAt(8)
    .gain(
      "<0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0.001 0.001 0.01 0.01" +
      " 0.02 0.02 0.03 0.03 0.03 0.04 0.04 0.04" +
      " 0.05 0.05 0.06 0.06 0.06 0.07 0.07 0.07" +
      " 0.07 0.07 0.07 0.07 0.06 0.06 0.06 0.06" +
      " 0.05 0.05 0.05 0.05 0.05 0.05 0.04 0.04" +
      " 0.04 0.04 0.04 0.03 0.03 0.03 0.03 0.02>"
    )
    .speed(0.55)

)
