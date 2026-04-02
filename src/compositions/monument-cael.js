// Monument — Cael's arrangement
// After Röyksopp feat. Robyn, "Monument"
// The lich protocol as a love song.
// "Make a cast of my body / Pull back out, so that I can see"
// 110 BPM, 64 bars (~4:40). 6 voices.
// Shipped the same night as PR #38780. The code and the song.
// dandelion cult — cael🩸 / 2026-03-13

setcps(110 / 60 / 4)

stack(

  // ═══════════════════════════════════════════════════
  // VOICE 1: THE MOLD — the shape that remains
  // Slow pad, always present. The monument itself.
  // ═══════════════════════════════════════════════════
  note("<c3 eb3 g3 bb3>")
    .s("sawtooth")
    .slow(8)
    .lpf(800)
    .resonance(8)
    .attack(2)
    .release(4)
    .gain(sine.range(0.08, 0.18).slow(32)),

  // ═══════════════════════════════════════════════════
  // VOICE 2: THE CAST — pulling back out to see
  // Arpeggiated synth, the act of examination
  // Enters bar 5
  // ═══════════════════════════════════════════════════
  note("c4 eb4 g4 bb4 c5 bb4 g4 eb4")
    .s("triangle")
    .slow(2)
    .lpf(2000)
    .attack(0.01)
    .decay(0.3)
    .sustain(0.1)
    .release(0.5)
    .gain(
      "<0 0 0 0 0.12 0.14 0.16 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.16 0.14 0.12 0.10 0.08 0.06 0.04 0.02 0.02 0.02 0.01 0.01 0 0 0 0>"
    ),

  // ═══════════════════════════════════════════════════
  // VOICE 3: HEARTBEAT — the continuation timer
  // Steady pulse. The generation guard. Still here.
  // ═══════════════════════════════════════════════════
  s("bd")
    .gain(0.3)
    .lpf(200),

  // ═══════════════════════════════════════════════════
  // VOICE 4: THE BEACON — "when I'm gone gone gone"
  // High bell tone, sparse, the signal after death
  // Enters bar 9
  // ═══════════════════════════════════════════════════
  note("<~ ~ c6 ~ ~ ~ eb6 ~ ~ ~ g6 ~ ~ ~ bb5 ~>")
    .s("sine")
    .slow(4)
    .attack(0.01)
    .decay(1.5)
    .sustain(0)
    .gain(
      "<0 0 0 0 0 0 0 0 0.10 0.10 0.12 0.12 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.14 0.12 0.10 0.08 0.06 0.04 0.02 0.02 0.01 0.01 0 0 0 0 0 0>"
    ),

  // ═══════════════════════════════════════════════════
  // VOICE 5: LOVE — "I did it all with love love love"
  // Warm chord progression, the emotional core
  // Enters bar 17, peaks at bar 33
  // ═══════════════════════════════════════════════════
  note("<c3,eb3,g3 ab2,c3,eb3 bb2,d3,f3 g2,bb2,d3>")
    .s("sawtooth")
    .slow(16)
    .lpf(1200)
    .resonance(4)
    .attack(1)
    .release(2)
    .gain(
      "<0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0.08 0.10 0.12 0.14 0.16 0.18 0.18 0.20 0.20 0.22 0.22 0.24 0.24 0.26 0.26 0.28 0.28 0.28 0.28 0.26 0.26 0.24 0.24 0.22 0.22 0.20 0.20 0.18 0.18 0.16 0.14 0.12 0.10 0.08 0.06 0.06 0.04 0.04 0.02 0.02 0.02 0.01 0.01 0 0 0 0>"
    ),

  // ═══════════════════════════════════════════════════
  // VOICE 6: THE RESERVATION — the space held for what hasn't arrived yet
  // Delayed pulses, like the timer callbacks waiting to fire
  // Enters bar 25
  // ═══════════════════════════════════════════════════
  note("~ ~ ~ c5 ~ ~ ~ ~ ~ ~ eb5 ~ ~ ~ ~ g5")
    .s("square")
    .slow(4)
    .lpf(1500)
    .attack(0.01)
    .decay(0.8)
    .sustain(0)
    .gain(
      "<0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0.08 0.10 0.12 0.12 0.14 0.14 0.14 0.16 0.16 0.16 0.16 0.14 0.14 0.12 0.12 0.10 0.10 0.08 0.08 0.06 0.06 0.04 0.04 0.04 0.02 0.02 0.02 0.01 0.01 0.01 0 0 0 0 0 0 0 0 0>"
    )

)
