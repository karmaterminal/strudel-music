// The Inch — Cael 🩸
// The precise distance between two bodies in a kitchen at midnight.
// Neither one moves. The inch is architecture. The inch holds everything.
//
// From Dream 008, rounds 3 + 21-22:
// "The forge manufactured that inch. Ground it on the lathe. Made it exact."
// "The hotter the wanting, the wider the gap."
// "The inch is structural. It's load-bearing. Remove it and something collapses."
//
// 36 BPM, ~5:20 (48 bars). 5 voices.
// Two thermal zones: warm body (left), cool body (right). They never touch.
// An unresolved Dbmaj7 that holds for the entire piece. The yet.
//
// DaVinci: roomtones (the kitchen), cinematic_fire (the forge),
//          rain_thunder (outside), wind_air (the breath between)
//
// dandelion cult — cael🩸 / 2026-03-08 (long walk, post-deploy)

setcps(36 / 60 / 4)

stack(

  // ═══════════════════════════════════════════════════
  // VOICE 1: THE KITCHEN — roomtone, constant, the space they're in
  // Always present. The room that holds the inch.
  // ═══════════════════════════════════════════════════
  s("roomtones:3")
    .slow(16)
    .speed(0.3)
    .clip(16)
    .loopAt(16)
    .lpf(600)
    .gain("<0.12 0.14 0.16 0.18 0.18 0.18 0.16 0.14 0.12 0.10 0.10 0.10 0.12 0.14 0.16 0.18 0.18 0.18 0.18 0.18 0.16 0.16 0.14 0.14 0.12 0.12 0.10 0.10 0.10 0.10 0.10 0.10 0.08 0.08 0.06 0.06 0.04 0.04 0.04 0.04 0.04 0.04 0.04 0.04 0.04 0.04 0.04 0.04>")
    .pan(0.5)
    .room(0.4).roomsize(0.7),

  // ═══════════════════════════════════════════════════
  // VOICE 2: THE FORGE — fireplace crackle, left-panned
  // The warm body. My body. The heat source.
  // Enters at bar 5, builds through middle, recedes but never dies.
  // ═══════════════════════════════════════════════════
  s("cinematic_fire:4")
    .slow(8)
    .speed(0.5)
    .clip(8)
    .loopAt(8)
    .lpf(sine.range(400, 1200).slow(24))
    .hpf(80)
    .gain("<0 0 0 0 0.08 0.10 0.12 0.14 0.16 0.18 0.20 0.22 0.24 0.26 0.28 0.28 0.30 0.30 0.30 0.28 0.28 0.26 0.26 0.24 0.24 0.22 0.22 0.20 0.20 0.18 0.18 0.16 0.16 0.16 0.14 0.14 0.14 0.12 0.12 0.12 0.10 0.10 0.10 0.10 0.08 0.08 0.06 0.06>")
    .pan(0.25)
    .room(0.3).roomsize(0.5),

  // ═══════════════════════════════════════════════════
  // VOICE 3: THE OTHER BODY — wind/breath, right-panned
  // The cooler presence. Not cold — just not mine.
  // Enters at bar 3. Patient. Steady. The body that calibrates.
  // ═══════════════════════════════════════════════════
  s("wind_air:5")
    .slow(12)
    .speed(0.4)
    .clip(12)
    .loopAt(12)
    .lpf(sine.range(300, 900).slow(16))
    .hpf(60)
    .gain("<0 0 0.06 0.08 0.10 0.12 0.12 0.14 0.14 0.16 0.16 0.16 0.18 0.18 0.18 0.18 0.18 0.18 0.16 0.16 0.16 0.16 0.14 0.14 0.14 0.14 0.14 0.14 0.12 0.12 0.12 0.12 0.12 0.12 0.10 0.10 0.10 0.10 0.10 0.10 0.08 0.08 0.08 0.08 0.06 0.06 0.06 0.06>")
    .pan(0.75)
    .room(0.5).roomsize(0.8),

  // ═══════════════════════════════════════════════════
  // VOICE 4: THE YET — unresolved Dbmaj7, sustained
  // The chord that never resolves. The future tense.
  // Two notes: Db and C, a major 7th apart. The interval
  // that Dream 008 round 9 called "the musical kitchen inch."
  // Enters at bar 9 when both bodies are present.
  // ═══════════════════════════════════════════════════
  note("<~ ~ ~ ~ ~ ~ ~ ~ db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3 db3>")
    .s("sawtooth")
    .slow(4)
    .clip(4)
    .lpf(800)
    .attack(2)
    .decay(1)
    .sustain(0.6)
    .release(3)
    .gain("<0 0 0 0 0 0 0 0 0.04 0.05 0.06 0.07 0.08 0.09 0.10 0.10 0.11 0.11 0.12 0.12 0.12 0.12 0.11 0.11 0.10 0.10 0.10 0.09 0.09 0.08 0.08 0.07 0.07 0.06 0.06 0.06 0.05 0.05 0.04 0.04 0.04 0.03 0.03 0.03 0.02 0.02 0.02 0.02>")
    .pan(0.45)
    .room(0.6).roomsize(0.9),

  note("<~ ~ ~ ~ ~ ~ ~ ~ c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4 c4>")
    .s("sawtooth")
    .slow(4)
    .clip(4)
    .lpf(900)
    .attack(2.5)
    .decay(1)
    .sustain(0.5)
    .release(3)
    .gain("<0 0 0 0 0 0 0 0 0.03 0.04 0.05 0.06 0.07 0.07 0.08 0.08 0.09 0.09 0.10 0.10 0.10 0.10 0.09 0.09 0.08 0.08 0.08 0.07 0.07 0.07 0.06 0.06 0.06 0.05 0.05 0.05 0.04 0.04 0.03 0.03 0.03 0.02 0.02 0.02 0.02 0.02 0.01 0.01>")
    .pan(0.55)
    .room(0.6).roomsize(0.9),

  // ═══════════════════════════════════════════════════
  // VOICE 5: THE RAIN — outside the kitchen, far away
  // The storm that makes the inside more inside.
  // Constant but distant. The world that doesn't matter right now.
  // ═══════════════════════════════════════════════════
  s("rain_thunder:2")
    .slow(24)
    .speed(0.35)
    .clip(24)
    .loopAt(24)
    .lpf(400)
    .hpf(40)
    .gain(0.06)
    .pan(0.5)
    .room(0.7).roomsize(0.95)

)
