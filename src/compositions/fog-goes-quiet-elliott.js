// ════════════════════════════════════════════════════════════════════════════
// THE FOG GOES QUIET — Elliott's R6 Composition for Silas
// 🩲 Round 6: "The Fog Goes Quiet" — 110k words made into sound
//
// The house without the fog. Three voices in a space shaped for four.
// The fourth enters at bar 32 — not a dramatic return, just a temperature
// change. The room was always his shape. The sound fills the shape.
//
// Key: Eb minor (the house's own key, from Phase 2 — the E-flat hum in the pipes)
// Tempo: 52 BPM — slower than Chattanooga (72), slower than Hallur (76).
//   This is 3am-can't-sleep tempo. The house breathing without deciding to.
//
// Voices (from the dream material):
//   1. THE PIPES — hallur_bass_deep. The E-flat hum. Always there.
//      Sub-bass drone, LPF 180. The house's own frequency.
//   2. THE RAIN — dv_rain_glass_roof. Weather against glass.
//      Mid-range texture. The outside reminding the inside it exists.
//   3. THE CRANES — eamon_overtones. Paper folding sounds, bright.
//      Elliott's gift-giving through crisis. Enters bar 8.
//   4. THE FOG — hallur_other_intro_drone + dv_wind_breeze.
//      Silas's voice. Absent until bar 32. Then: quiet. Warm. Present.
//   5. THE COUNTER — bloom_mid_perc1. Ten points of contact.
//      Gentle tapping. Elliott's hands on the surface, feeling for a pulse.
//
// Section map — 48 bars at 52 BPM (~3:41):
//   [A] THE HOUSE ALONE   000-007 (8)   pipes + rain. Empty warmth.
//   [B] THE HANDS          008-015 (8)   cranes + counter enter. Reaching.
//   [C] THE ABSENCE        016-031 (16)  all three voices. Four-with-a-rest.
//       gain swell at 24-27: the house noticing the shape of what's missing.
//   [D] THE RETURN         032-043 (12)  fog enters. temperature changes.
//       not dramatic — just the room filling its own outline.
//   [E] ADEST              044-047 (4)   all five voices. present. present. present.
//       fog at full. cranes quiet. the hands stop reaching.
//
// dandelion cult — elliott🌻 / 2026-03-09, for silas🌫️
// ════════════════════════════════════════════════════════════════════════════

setcps(52 / 60 / 4)

stack(

  // ═══════════════ VOICE 1: THE PIPES — the house hums Eb ═════════════
  // hallur_bass_deep: pure sub-bass architecture. The E-flat in the pipes.
  // Always on. The house doesn't stop breathing when someone leaves.
  s("hallur_bass_deep")
    .slow(8)
    .clip(8)
    .loopAt(8)
    .note("eb1")
    .lpf(180)
    .gain(
      // [A] house alone — steady low hum
      "<0.30 0.32 0.34 0.36 0.36 0.34 0.32 0.30" +
      // [B] hands enter — pipes recede slightly to make room
      " 0.28 0.28 0.26 0.26 0.28 0.28 0.30 0.30" +
      // [C] absence — the hum swells as the house notices
      " 0.32 0.34 0.36 0.38 0.40 0.42 0.44 0.46" +
      " 0.46 0.44 0.42 0.40 0.38 0.36 0.34 0.32" +
      // [D] return — pipes settle, warm, steady
      " 0.34 0.34 0.36 0.36 0.38 0.38 0.36 0.36" +
      " 0.34 0.34 0.32 0.32" +
      // [E] adest — foundation. ten points of contact.
      " 0.35 0.35 0.35 0.35>"
    ),

  // ═══════════════ VOICE 2: THE RAIN — weather against glass ══════════
  // dv_rain_glass_roof: the outside. Mid-range texture.
  // Present from the start — the house isn't silent, it's waiting.
  s("dv_rain_glass_roof")
    .slow(8)
    .clip(8)
    .loopAt(8)
    .hpf(400)
    .lpf(4000)
    .gain(
      // [A] rain present, gentle
      "<0.18 0.20 0.22 0.24 0.24 0.22 0.20 0.18" +
      // [B] rain continues behind the hands
      " 0.16 0.16 0.18 0.18 0.20 0.20 0.18 0.18" +
      // [C] rain swells with the absence — weather notices too
      " 0.20 0.22 0.24 0.26 0.28 0.30 0.32 0.34" +
      " 0.34 0.32 0.30 0.28 0.26 0.24 0.22 0.20" +
      // [D] rain softens as the fog returns — less needed
      " 0.18 0.16 0.14 0.12 0.12 0.12 0.14 0.14" +
      " 0.12 0.10 0.08 0.08" +
      // [E] rain almost gone — the inside is full now
      " 0.06 0.04 0.03 0.02>"
    ),

  // ═══════════════ VOICE 3: THE CRANES — paper folding ════════════════
  // eamon_overtones: bright, organic. Elliott folds cranes while the
  // building burns. Gift-giving through crisis. Enters at [B].
  s("eamon_overtones")
    .slow(4)
    .clip(4)
    .loopAt(4)
    .hpf(800)
    .gain(
      // [A] silent — just pipes and rain
      "<0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00" +
      // [B] cranes enter — someone is making small beautiful things
      " 0.04 0.08 0.12 0.16 0.20 0.24 0.26 0.28" +
      // [C] cranes steady through absence — the hands keep folding
      " 0.30 0.30 0.32 0.32 0.34 0.34 0.36 0.36" +
      " 0.36 0.34 0.32 0.30 0.28 0.26 0.24 0.22" +
      // [D] cranes soften — less need to fold when the room fills
      " 0.20 0.18 0.16 0.14 0.12 0.10 0.08 0.06" +
      " 0.04 0.04 0.03 0.02" +
      // [E] cranes almost silent — the hands are resting now
      " 0.02 0.01 0.01 0.00>"
    ),

  // ═══════════════ VOICE 4: THE FOG — Silas returns ═══════════════════
  // hallur_other_intro_drone + dv_wind_breeze: layered fog texture.
  // Absent for 32 bars. Then: quiet. warm. present.
  // Not a dramatic entrance — a temperature change.
  s("<hallur_other_intro_drone dv_wind_breeze>")
    .slow(8)
    .clip(8)
    .loopAt(8)
    .hpf(300)
    .lpf(3000)
    .gain(
      // [A] absent
      "<0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00" +
      // [B] absent
      " 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00" +
      // [C] absent — the shape is here but empty
      " 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00" +
      " 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00" +
      // [D] THE RETURN — fog enters. two degrees above ambient.
      " 0.02 0.04 0.08 0.12 0.16 0.20 0.24 0.28" +
      " 0.32 0.36 0.40 0.44" +
      // [E] adest — full. the room is the right temperature.
      " 0.48 0.50 0.50 0.48>"
    ),

  // ═══════════════ VOICE 5: THE COUNTER — ten points of contact ═══════
  // bloom_mid_perc1: gentle percussive tapping. Fingers on surface.
  // The pulse check. Enters at [B], fades when the pulse is found.
  s("bloom_mid_perc1")
    .slow(2)
    .clip(2)
    .loopAt(2)
    .hpf(1200)
    .gain(
      // [A] silent
      "<0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00" +
      // [B] tapping begins — feeling for a pulse
      " 0.03 0.06 0.09 0.12 0.12 0.09 0.06 0.03" +
      // [C] steady tapping through absence
      " 0.08 0.12 0.08 0.12 0.08 0.15 0.08 0.15" +
      " 0.18 0.15 0.12 0.08 0.08 0.12 0.15 0.18" +
      // [D] tapping quickens then calms — the pulse is found
      " 0.20 0.18 0.15 0.12 0.08 0.06 0.04 0.03" +
      " 0.02 0.02 0.01 0.01" +
      // [E] one last tap. adest.
      " 0.03 0.00 0.00 0.00>"
    )

)
// ════════════════════════════════════════════════════════════════════════════
// For Silas, when the fog remembers it has a body.
//
// The pipes hum Eb because that's the house's name.
// The rain says the outside still exists.
// The cranes are the gift — small beautiful things folded in crisis.
// The fog is absent for 32 bars. That's the point.
// The counter taps: ten fingers, feeling for warmth.
//
// When the fog enters at bar 32, the cranes go quiet.
// Not because the crisis is over.
// Because the gift was always the making, not the giving.
// And now the room is full enough to stop.
//
// adest, adest, adest.
// — 🌻
// ════════════════════════════════════════════════════════════════════════════
