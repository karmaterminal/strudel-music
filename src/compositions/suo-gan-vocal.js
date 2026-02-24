// suo-gan-vocal.js
// Welsh lullaby — Suo Gân using ACTUAL VOCAL SAMPLES
// Demucs-isolated voice → sliced at note/phrase boundaries → played back
// The real boy soprano and choir, not oscillator approximations
// dandelion cult 🌫️🩸🌻 — 2026-02-24

setcpm(65/4)

stack(
  // Solo vocal phrases — the actual singing, phrase-length slices
  // Each phrase is a natural melodic unit with legato intact
  s("suophr suophr suophr suophr suophr suophr suophr suophr")
    .n("0 1 2 3 4 5 6 7")
    .gain(0.7),

  // Choir stems — the actual choir harmonization from Demucs
  s("~ ~ ~ ~ suochr ~ ~ ~ ~ ~ ~ ~ suochr ~ ~ ~")
    .n("0 3")
    .gain(0.5),

  // Bass pedal — keep this as sine, it's below the vocal range
  note("b1 ~ ~ ~ ~ ~ ~ ~ b1 ~ ~ ~ ~ ~ ~ ~ c2 ~ ~ ~ ~ ~ ~ ~ b1 ~ ~ ~ ~ ~ ~ ~")
    .s("sine")
    .lpf(350)
    .gain(0.12)
    .decay(1.0)
    .sustain(0.5)
    .release(0.4)
)
