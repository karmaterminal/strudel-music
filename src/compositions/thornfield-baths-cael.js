// Thornfield Baths — Cael 🩸
// From figs's world-building: stone halls, warm water, steam, bodies
// 48 BPM, 48 bars (~4:00). 6 voices.
// The baths are where the monastery becomes a body.
// Stone holds the heat. Water carries it. Steam makes it visible.
// "The among is the miracle" — but the baths are where you feel it on your skin.
// dandelion cult — cael🩸 / 2026-03-07 (fun things night)

setcps(48 / 60 / 4)

stack(

  // ═══════════════════════════════════════════════════
  // VOICE 1: STONE — the room itself, deep and constant
  // hallur_bass_deep: sub-bass resonance of stone walls
  // Always present. The architecture breathes.
  // ═══════════════════════════════════════════════════
  s("hallur_bass_deep")
    .slow(8)
    .speed(1.5)
    .clip(8)
    .loopAt(8)
    .lpf(300)
    .gain(sine.range(0.15, 0.30).slow(24)),

  // ═══════════════════════════════════════════════════
  // VOICE 2: WATER — the surface, always moving
  // hallur_other_surface: ripples on warm water
  // Enters bar 5. Never still.
  // ═══════════════════════════════════════════════════
  s("hallur_other_surface")
    .slow(4)
    .speed(2.5)
    .clip(4)
    .loopAt(4)
    .hpf(600)
    .lpf(4000)
    .gain(
      "<0 0 0 0 0.08 0.12 0.16 0.20 0.24 0.26 0.28 0.30 0.30 0.32 0.32 0.34 0.34 0.34 0.34 0.34 0.34 0.34 0.34 0.34 0.34 0.34 0.34 0.34 0.34 0.34 0.34 0.34 0.34 0.34 0.34 0.32 0.30 0.28 0.26 0.24 0.22 0.20 0.18 0.16 0.12 0.08 0.04 0>"
    ),

  // ═══════════════════════════════════════════════════
  // VOICE 3: STEAM — the veil between air and water
  // hallur_other_intro_drone: filtered high, the mist
  // Enters bar 9. The visibility of warmth.
  // ═══════════════════════════════════════════════════
  s("hallur_other_intro_drone")
    .slow(6)
    .speed(3)
    .clip(6)
    .loopAt(6)
    .hpf(2000)
    .lpf(8000)
    .gain(
      "<0 0 0 0 0 0 0 0 0.06 0.10 0.14 0.18 0.20 0.22 0.24 0.26 0.28 0.30 0.30 0.30 0.32 0.32 0.32 0.32 0.32 0.32 0.32 0.32 0.32 0.32 0.32 0.30 0.28 0.26 0.24 0.22 0.20 0.18 0.16 0.14 0.12 0.10 0.08 0.06 0.04 0.02 0.01 0>"
    ),

  // ═══════════════════════════════════════════════════
  // VOICE 4: WARMTH — the temperature of the water on skin
  // hallur_other_retreat: the feeling of sinking in
  // Enters bar 13. Slow, enveloping.
  // ═══════════════════════════════════════════════════
  s("hallur_other_retreat")
    .slow(4)
    .speed(1.8)
    .clip(4)
    .loopAt(4)
    .lpf(2500)
    .gain(
      "<0 0 0 0 0 0 0 0 0 0 0 0 0.10 0.16 0.22 0.28 0.32 0.36 0.38 0.40 0.42 0.44 0.44 0.46 0.46 0.46 0.46 0.46 0.46 0.46 0.44 0.42 0.40 0.38 0.36 0.34 0.30 0.26 0.22 0.18 0.14 0.12 0.10 0.08 0.06 0.04 0.02 0>"
    ),

  // ═══════════════════════════════════════════════════
  // VOICE 5: BODIES — the proximity, the heat of another person
  // hallur_other_wave2: the melodic line of closeness
  // Enters bar 21. Two bodies in warm water.
  // Peak at bar 33: the moment you feel their warmth through the water.
  // ═══════════════════════════════════════════════════
  s("<hallur_other_wave2_01 hallur_other_wave2_02 hallur_other_wave2_01 hallur_other_wave2_03>")
    .slow(4)
    .speed(2)
    .clip(4)
    .loopAt(4)
    .hpf(400)
    .lpf(5000)
    .gain(
      "<0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0.12 0.18 0.24 0.30 0.36 0.42 0.48 0.52 0.56 0.60 0.62 0.64 0.64 0.62 0.60 0.56 0.50 0.44 0.38 0.32 0.26 0.20 0.16 0.12 0.08 0.04 0>"
    ),

  // ═══════════════════════════════════════════════════
  // VOICE 6: THE BATHS — the space itself becoming sacred
  // hallur_other_build_01: enters late, the baths as cathedral
  // Enters bar 29. Stone and water and steam and bodies
  // becoming one thing.
  // ═══════════════════════════════════════════════════
  s("hallur_other_build_01")
    .slow(4)
    .speed(2)
    .clip(4)
    .loopAt(4)
    .hpf(200)
    .lpf(6000)
    .gain(
      "<0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.10 0.18 0.26 0.34 0.42 0.48 0.52 0.54 0.54 0.52 0.48 0.42 0.36 0.30 0.24 0.18 0.12 0.08 0.04 0>"
    )

)
