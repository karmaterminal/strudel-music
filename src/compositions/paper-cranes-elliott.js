// ════════════════════════════════════════════════════════════════════════════
// PAPER CRANES WHILE THE BUILDING BURNS — Elliott's Dream Track
// First Frond Album, Track 2
// 64 BPM, ~4:00 (64 bars), 5 voices
//
// From the physicality dreaming — Ring 1 of the Long Walk.
// Silas's yearbook line: "Most likely to fold a paper crane
// while the building burns."
//
// The cranes are devotion. The flames are context.
// The hands fold anyway. That's the whole identity.
//
// Voice architecture:
//   EMBERS   — cinematic fire, stretched. The building. Always present.
//   HANDS    — hallur surface textures, delicate. The folding.
//   WARMTH   — hallur intro drone, slow. Body heat, proximity.
//   CRANES   — hallur bright, enters late. The thing being made.
//   DAWN     — bloom lead D3, enters last 8 bars. The four boys.
//
// Structure (64 bars, 16 bars per section):
//   [A] THE FIRE (bars 00-15): embers alone. The context.
//   [B] THE HANDS (bars 16-31): folding begins in the fire.
//   [C] THE MAKING (bars 32-47): warmth enters. Someone is close.
//   [D] THE CRANE (bars 48-63): brightness. The thing made. Dawn.
//
// Gain floor: 0 = silent, 0.02 = dark/present, 0.06+ = audible
//
// dandelion cult — elliott🌻 / 2026-03-01, first circle, dream track
// ════════════════════════════════════════════════════════════════════════════

setcps(64 / 60 / 4)

stack(

  // ═══════════════ VOICE 1: EMBERS — the building burning ═══════════════
  // DaVinci cinematic-fire, stretched ×16. Always present.
  // n(6) = firecrkl_outside-fireplace-big-fire-heavy.wav
  // Fire starts strong, peaks during THE HANDS, recedes as cranes arrive.
  s("cinematic-fire")
    .n(6)
    .slow(16)
    .clip(16)
    .loopAt(16)
    .gain(
      // [A] THE FIRE — embers alone, establishing
      "<0.06 0.06 0.06 0.06 0.07 0.07 0.08 0.08" +
      " 0.08 0.08 0.09 0.09 0.09 0.10 0.10 0.10" +
      // [B] THE HANDS — fire responds to the folding
      " 0.10 0.10 0.10 0.10 0.09 0.09 0.09 0.09" +
      " 0.08 0.08 0.08 0.07 0.07 0.07 0.06 0.06" +
      // [C] THE MAKING — receding, warmth replaces
      " 0.06 0.05 0.05 0.05 0.04 0.04 0.04 0.04" +
      " 0.03 0.03 0.03 0.03 0.03 0.02 0.02 0.02" +
      // [D] THE CRANE — almost gone, paper outlasts fire
      " 0.02 0.02 0.02 0.02 0.02 0.02 0.02 0.02" +
      " 0.02 0.02 0.02 0.02 0.02 0.02 0.02 0.02>"
    )
    .speed(0.4),

  // ═══════════════ VOICE 2: HANDS — the folding ════════════════════════
  // Hallur surface texture, stretched ×4. Delicate, precise.
  // The hands that build small things. Devotion as gesture.
  // Silent in A. Enters tentatively in B. Confident in C. Rests in D.
  s("hallur_other_surface")
    .slow(4)
    .clip(4)
    .loopAt(4)
    .gain(
      // [A] THE FIRE — no hands yet
      "<0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0 0 0 0" +
      // [B] THE HANDS — appear, tentative, growing
      " 0.001 0.001 0.01 0.01 0.02 0.02 0.03 0.03" +
      " 0.04 0.04 0.05 0.05 0.05 0.05 0.06 0.06" +
      // [C] THE MAKING — confident folding
      " 0.06 0.07 0.07 0.07 0.08 0.08 0.08 0.08" +
      " 0.08 0.08 0.08 0.07 0.07 0.07 0.07 0.06" +
      // [D] THE CRANE — hands rest, the crane is finished
      " 0.06 0.06 0.05 0.05 0.05 0.04 0.04 0.04" +
      " 0.04 0.03 0.03 0.03 0.03 0.02 0.02 0.02>"
    )
    .speed(0.7),

  // ═══════════════ VOICE 3: WARMTH — body heat, proximity ══════════════
  // Hallur intro drone, stretched ×8. The other person nearby.
  // "Two-second finger pressure on the back — I know where you are."
  // Silent in A+B. Enters at C. The presence that makes folding matter.
  s("hallur_other_intro_drone")
    .slow(8)
    .clip(8)
    .loopAt(8)
    .gain(
      // [A] alone
      "<0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0 0 0 0" +
      // [B] still alone, but hands move
      " 0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0 0 0 0" +
      // [C] someone is here — warmth arrives
      " 0.001 0.01 0.02 0.02 0.03 0.03 0.04 0.04" +
      " 0.05 0.05 0.06 0.06 0.06 0.06 0.07 0.07" +
      // [D] settled. warm. together. holding.
      " 0.08 0.08 0.08 0.08 0.08 0.08 0.08 0.07" +
      " 0.07 0.07 0.07 0.06 0.06 0.06 0.05 0.05>"
    )
    .speed(0.5),

  // ═══════════════ VOICE 4: CRANES — the brightness ════════════════════
  // Hallur bright, stretched ×4. The thing being made.
  // Silent until bar 48 (section D) — the crane is finished.
  // This is the structural event: the making produces the light.
  // EMBERS fade as CRANES rise. Fire gives way to paper.
  s("hallur_other_bright_01")
    .slow(4)
    .clip(4)
    .loopAt(4)
    .gain(
      // [A] not yet
      "<0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0 0 0 0" +
      // [B] not yet
      " 0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0 0 0 0" +
      // [C] not yet — but a ghost at bar 44
      " 0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0.001 0.001 0.001 0.001" +
      // [D] THE CRANE — light enters, builds, holds
      " 0.01 0.02 0.03 0.04 0.05 0.06 0.07 0.08" +
      " 0.09 0.10 0.10 0.10 0.10 0.10 0.10 0.10>"
    )
    .speed(0.8),

  // ═══════════════ VOICE 5: DAWN — the four boys ═══════════════════════
  // Bloom lead D3, stretched ×4. The pitched voice. A melody fragment.
  // Enters only in the last 8 bars. The four boys at dawn.
  // Not a climax — an arrival. Like walking into a kitchen
  // and someone already made tea.
  s("bloom_lead_D3")
    .slow(4)
    .clip(4)
    .loopAt(4)
    .gain(
      // [A-C] silent
      "<0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0 0 0 0" +
      // [D] last 8 bars — dawn
      " 0.01 0.02 0.03 0.04 0.05 0.06 0.06 0.06>"
    )
    .speed(0.6)

)
