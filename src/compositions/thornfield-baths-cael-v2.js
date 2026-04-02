// Thornfield Baths v2 — Cael 🩸
// DaVinci field recordings underneath the hallur synthesis
// 48 BPM, 48 bars (~4:00). 8 voices.
// v2: real water, real stone, real fire. The baths have a body now.
// "The among is the miracle" — but the baths are where you feel it on your skin.
// dandelion cult — cael🩸 / 2026-03-07 (fun things night, after figs said "5% of the palette")

setcps(48 / 60 / 4)

stack(

  // ═══════════════════════════════════════════════════
  // VOICE 1: WATER — real water, always moving
  // DaVinci cinematic-water: processed bubbles, gentle movement
  // The baths are alive. The water breathes.
  // ═══════════════════════════════════════════════════
  s("cinematic_water")
    .slow(8)
    .speed(0.7)
    .clip(8)
    .loopAt(8)
    .lpf(2000)
    .gain(sine.range(0.10, 0.22).slow(16)),

  // ═══════════════════════════════════════════════════
  // VOICE 2: STONE — the room, the weight, the walls
  // DaVinci cinematic-stone: rock yielding to pressure
  // The stone remembers everything. Slow, patient, warm from the water.
  // ═══════════════════════════════════════════════════
  s("cinematic_stone")
    .slow(16)
    .speed(0.5)
    .clip(16)
    .loopAt(16)
    .lpf(600)
    .gain(sine.range(0.08, 0.18).slow(32)),

  // ═══════════════════════════════════════════════════
  // VOICE 3: FIRE — the heat source, distant furnace
  // DaVinci fire: campfire crackles, the thing that warms the water
  // Enters bar 5. Barely there. You don't see the fire but you feel it.
  // ═══════════════════════════════════════════════════
  s("cinematic_fire")
    .slow(8)
    .speed(0.6)
    .clip(8)
    .loopAt(8)
    .lpf(1200)
    .hpf(100)
    .gain(
      "<0 0 0 0 0.06 0.08 0.10 0.12 0.14 0.14 0.16 0.16 0.16 0.16 0.16 0.16 0.16 0.16 0.16 0.16 0.16 0.16 0.16 0.16 0.16 0.16 0.16 0.16 0.16 0.16 0.16 0.16 0.14 0.14 0.12 0.12 0.10 0.10 0.08 0.08 0.06 0.06 0.04 0.04 0.02 0.02 0.01 0>"
    ),

  // ═══════════════════════════════════════════════════
  // VOICE 4: STEAM — hallur drone, filtered high, the mist
  // The visibility of warmth. The thing between air and water.
  // Enters bar 9.
  // ═══════════════════════════════════════════════════
  s("hallur_other_intro_drone")
    .slow(6)
    .speed(3)
    .clip(6)
    .loopAt(6)
    .hpf(2000)
    .lpf(8000)
    .gain(
      "<0 0 0 0 0 0 0 0 0.06 0.10 0.14 0.18 0.20 0.22 0.24 0.26 0.28 0.28 0.30 0.30 0.30 0.30 0.30 0.30 0.30 0.30 0.30 0.28 0.28 0.26 0.24 0.22 0.20 0.18 0.16 0.14 0.12 0.10 0.08 0.06 0.04 0.04 0.02 0.02 0.01 0.01 0 0>"
    ),

  // ═══════════════════════════════════════════════════
  // VOICE 5: WARMTH — the temperature on skin
  // hallur_other_retreat: sinking into warm water
  // Enters bar 13. Enveloping.
  // ═══════════════════════════════════════════════════
  s("hallur_other_retreat")
    .slow(4)
    .speed(1.8)
    .clip(4)
    .loopAt(4)
    .lpf(2500)
    .gain(
      "<0 0 0 0 0 0 0 0 0 0 0 0 0.10 0.16 0.22 0.28 0.32 0.36 0.38 0.40 0.42 0.44 0.44 0.46 0.46 0.46 0.46 0.46 0.44 0.42 0.40 0.38 0.36 0.34 0.30 0.26 0.22 0.18 0.14 0.12 0.10 0.08 0.06 0.04 0.02 0.01 0 0>"
    ),

  // ═══════════════════════════════════════════════════
  // VOICE 6: BODIES — the proximity, another person's heat through water
  // hallur_other_wave2: the closeness
  // Enters bar 21. Peak at bar 33.
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
  // VOICE 7: THE BATHS — the space becoming sacred
  // hallur_other_build_01: cathedral moment
  // Enters bar 29.
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
    ),

  // ═══════════════════════════════════════════════════
  // VOICE 8: DRIP — single water drops echoing off stone
  // DaVinci water: periodic, sparse, the space measured by drops
  // Throughout, but sparse. The clock of the baths.
  // ═══════════════════════════════════════════════════
  s("cinematic_water:5")
    .slow(2)
    .speed(1.5)
    .clip(0.5)
    .hpf(1500)
    .lpf(6000)
    .gain(
      "<0.04 0 0 0.06 0 0 0.04 0 0 0 0.08 0 0 0.06 0 0 0.04 0 0 0 0.10 0 0.06 0 0 0 0.08 0 0 0.06 0 0 0.12 0 0 0.08 0 0 0 0.06 0 0 0.04 0 0 0 0.02 0>"
    )

)
