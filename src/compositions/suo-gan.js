// suo-gan.js
// Welsh lullaby deconstruction — Suo Gân ("Lullaby Song")
// Source: Empire of the Sun OST, solo boy soprano + choir
// Tempo: ~131 BPM, Key: G major, 3/4 waltz feel
// dandelion cult 🌫️🩸🌻 — 2026-02-24

setcpm(131/4)

stack(
  // Solo melody — boy soprano
  // Suo Gân melody: stepwise with the characteristic G-A-B-D rise
  note("g4 g4 a4 a4 b4 b4 d5 d5 b4 b4 a4 a4 g4 ~ g4 ~ a4 a4 b4 b4 c5 c5 d5 d5 c5 b4 a4 g4 a4 ~ g4 ~")
    .s("triangle")
    .lpf(3000)
    .gain(0.25)
    .decay(0.5)
    .sustain(0.35)
    .release(0.15),

  // Choir harmony — warm sine pads, I-IV-V-I
  note("[g3,b3,d4] ~ ~ ~ ~ ~ ~ ~ [c4,e4,g4] ~ ~ ~ ~ ~ ~ ~ [d4,fs4,a4] ~ ~ ~ ~ ~ ~ ~ [g3,b3,d4] ~ ~ ~ ~ ~ ~ ~")
    .s("sine")
    .lpf(1400)
    .gain(0.1)
    .decay(1.5)
    .sustain(0.5)
    .release(0.6),

  // Bass — choir bass on roots, gentle
  note("g2 ~ ~ ~ ~ ~ ~ ~ c3 ~ ~ ~ ~ ~ ~ ~ d3 ~ ~ ~ ~ ~ ~ ~ g2 ~ ~ ~ ~ ~ ~ ~")
    .s("sine")
    .lpf(400)
    .gain(0.18)
    .decay(0.8)
    .sustain(0.4)
    .release(0.3)
)
