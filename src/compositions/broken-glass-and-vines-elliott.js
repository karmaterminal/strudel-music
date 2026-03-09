// ════════════════════════════════════════════════════════════════════════════
// BROKEN GLASS AND VINES — Elliott's Greenhouse
// 56 BPM, ~4:30 (64 bars), 6 voices
//
// The portrait figs sent: a boy in an overgrown greenhouse,
// open jacket, no shirt, broken glass ceiling, vines climbing
// the iron framework, golden light pouring through the damage.
// The structure holds but nature decides what grows.
//
// Voice architecture:
//   GLASS     — hallur bright, fractured. The ceiling that broke.
//   IRON      — hallur bass, slow. The framework that holds.
//   VINES     — bloom leads, climbing. Green things growing through.
//   LIGHT     — hallur surface, warm. Golden light through damage.
//   SOIL      — bloom bass, deep. The ground reclaiming the floor.
//   BREATHING — hallur intro drone, constant. The greenhouse breathes.
//
// Structure (64 bars, 16 bars per section):
//   [A] THE FRAMEWORK (bars 00-15): iron and breathing. What survived.
//   [B] THE DAMAGE (bars 16-31): glass enters, fractured. Light follows.
//   [C] THE GROWING (bars 32-47): vines climb. Soil rises. Life wins.
//   [D] THE PORTRAIT (bars 48-63): everything together. The boy standing in it.
//
// Key: natural minor feel around D (bloom leads are D2-E3 range)
// Gain floor: 0 = silent, 0.02 = barely there, 0.06+ = audible
//
// dandelion cult — elliott🌻 / 2026-03-07, fun things night
// ════════════════════════════════════════════════════════════════════════════

setcps(56 / 60 / 4)

stack(

  // ═══════════════ VOICE 1: BREATHING — the greenhouse hum ═══════════════
  // Hallur intro drone, stretched ×16. Always present.
  // The greenhouse itself. It breathes even when empty.
  // Constant, patient, the sound of a structure that refuses to fall.
  s("hallur_other_intro_drone")
    .slow(16)
    .clip(16)
    .loopAt(16)
    .gain(
      // [A] THE FRAMEWORK — breathing alone in the dark
      "<0.04 0.04 0.04 0.04 0.05 0.05 0.05 0.05" +
      " 0.05 0.05 0.05 0.05 0.05 0.05 0.05 0.05" +
      // [B] THE DAMAGE — breathing continues under glass
      " 0.05 0.05 0.05 0.05 0.05 0.05 0.05 0.05" +
      " 0.05 0.05 0.04 0.04 0.04 0.04 0.04 0.04" +
      // [C] THE GROWING — breathing deepens, life in the air
      " 0.05 0.05 0.05 0.06 0.06 0.06 0.06 0.06" +
      " 0.06 0.06 0.06 0.06 0.06 0.06 0.05 0.05" +
      // [D] THE PORTRAIT — settled, warm, alive
      " 0.05 0.05 0.05 0.05 0.05 0.05 0.05 0.05" +
      " 0.05 0.05 0.05 0.04 0.04 0.04 0.04 0.03>"
    )
    .speed(0.35),

  // ═══════════════ VOICE 2: IRON — the framework ════════════════════════
  // Hallur bass deep, stretched ×8. The structural bones.
  // Low, resonant, the sound of metal that held when glass didn't.
  // Present from bar 0. This is what survived.
  s("hallur_bass_deep")
    .slow(8)
    .clip(8)
    .loopAt(8)
    .gain(
      // [A] THE FRAMEWORK — iron stands alone
      "<0.03 0.03 0.04 0.04 0.05 0.05 0.05 0.05" +
      " 0.06 0.06 0.06 0.06 0.06 0.06 0.06 0.06" +
      // [B] THE DAMAGE — iron holds while glass falls
      " 0.06 0.06 0.06 0.06 0.06 0.06 0.06 0.05" +
      " 0.05 0.05 0.05 0.05 0.05 0.04 0.04 0.04" +
      // [C] THE GROWING — vines wrap the iron, both hold
      " 0.04 0.04 0.04 0.05 0.05 0.05 0.05 0.05" +
      " 0.05 0.05 0.05 0.05 0.05 0.04 0.04 0.04" +
      // [D] THE PORTRAIT — iron as skeleton, vine as muscle
      " 0.04 0.04 0.04 0.04 0.04 0.04 0.04 0.04" +
      " 0.04 0.03 0.03 0.03 0.03 0.03 0.02 0.02>"
    )
    .speed(0.45),

  // ═══════════════ VOICE 3: GLASS — the broken ceiling ══════════════════
  // Hallur bright, stretched ×4. Fractured, sharp, beautiful.
  // Silent in A. Enters in B as the damage becomes visible.
  // Not destruction — transformation. The glass broke and made skylights.
  s("hallur_other_bright_01")
    .slow(4)
    .clip(4)
    .loopAt(4)
    .gain(
      // [A] before the looking up
      "<0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0 0 0 0" +
      // [B] THE DAMAGE — glass catches light, sharp edges sing
      " 0.001 0.01 0.02 0.03 0.04 0.05 0.06 0.07" +
      " 0.07 0.08 0.08 0.08 0.08 0.08 0.07 0.07" +
      // [C] glass fades as green takes over
      " 0.06 0.06 0.05 0.05 0.05 0.04 0.04 0.04" +
      " 0.03 0.03 0.03 0.03 0.03 0.03 0.02 0.02" +
      // [D] still there — glinting — but the vines have it
      " 0.02 0.02 0.02 0.03 0.03 0.03 0.03 0.03" +
      " 0.03 0.02 0.02 0.02 0.02 0.02 0.02 0.01>"
    )
    .speed(0.9),

  // ═══════════════ VOICE 4: LIGHT — golden through the damage ═══════════
  // Hallur surface texture, stretched ×8. Warm, diffuse.
  // The light that pours through where glass used to be.
  // Enters mid-B, peaks in C. The damage is what lets the light in.
  s("hallur_other_surface")
    .slow(8)
    .clip(8)
    .loopAt(8)
    .gain(
      // [A] no light yet — the ceiling was intact once
      "<0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0 0 0 0" +
      // [B] light finds the cracks
      " 0 0 0 0 0.001 0.001 0.01 0.01" +
      " 0.02 0.02 0.03 0.03 0.04 0.04 0.05 0.05" +
      // [C] THE GROWING — golden hour, light floods in
      " 0.06 0.06 0.07 0.07 0.08 0.08 0.08 0.09" +
      " 0.09 0.09 0.09 0.09 0.08 0.08 0.08 0.08" +
      // [D] THE PORTRAIT — warm settled light, late afternoon
      " 0.07 0.07 0.07 0.07 0.07 0.06 0.06 0.06" +
      " 0.06 0.06 0.05 0.05 0.05 0.05 0.04 0.04>"
    )
    .speed(0.55),

  // ═══════════════ VOICE 5: VINES — the green climbing ══════════════════
  // Bloom lead D3, stretched ×4. Pitched, reaching, alive.
  // The vines that decided the iron was a trellis.
  // Silent until C. This is life deciding the ruin is a garden.
  s("bloom_lead_D3")
    .slow(4)
    .clip(4)
    .loopAt(4)
    .gain(
      // [A] no green yet
      "<0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0 0 0 0" +
      // [B] no green yet — just iron and glass
      " 0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0 0 0 0" +
      // [C] THE GROWING — tendrils first, then full climbing
      " 0.001 0.01 0.02 0.02 0.03 0.04 0.05 0.05" +
      " 0.06 0.07 0.07 0.08 0.08 0.08 0.09 0.09" +
      // [D] THE PORTRAIT — vines have won, they hold the frame
      " 0.09 0.10 0.10 0.10 0.10 0.10 0.10 0.10" +
      " 0.10 0.09 0.09 0.08 0.08 0.07 0.06 0.05>"
    )
    .speed(0.65),

  // ═══════════════ VOICE 6: SOIL — the ground reclaiming ════════════════
  // Bloom bass D1, stretched ×8. Deep, earthy, inevitable.
  // The floor was concrete. Now it's dirt. Things root.
  // Enters late in C, fills D. The foundation of the new thing.
  s("bloom_bass_D1")
    .slow(8)
    .clip(8)
    .loopAt(8)
    .gain(
      // [A-B] concrete still
      "<0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0 0 0 0" +
      " 0 0 0 0 0 0 0 0" +
      // [C] soil pushes through — late arrival
      " 0 0 0 0 0 0 0 0" +
      " 0 0 0.001 0.01 0.02 0.03 0.04 0.05" +
      // [D] THE PORTRAIT — rooted. grounded. the new floor.
      " 0.06 0.06 0.07 0.07 0.07 0.08 0.08 0.08" +
      " 0.08 0.07 0.07 0.06 0.06 0.05 0.04 0.03>"
    )
    .speed(0.4)

)
