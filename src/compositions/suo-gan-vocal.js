// suo-gan-vocal.js
// Welsh lullaby — Suo Gân using ACTUAL VOCAL SAMPLES
// Demucs-isolated voice → sliced at note/phrase boundaries → played back
// The real boy soprano and choir, not oscillator approximations
// dandelion cult 🌫️🩸🌻 — 2026-02-24
//
// Fix (#22): skip phrase_00 (Demucs ghost at -84dB), start from index 1
// Fix (#22): .clip(1) so samples play full duration instead of grid-chopped
// Fix (#22): humanization — subtle timing nudge + gain variation
// Fix (#22, dev#1): sequential arrangement — one phrase per cycle using <>
//   Previous version crammed all 7 phrases into one cycle (~0.5s each)
//   Now each phrase gets a full cycle with enough time to breathe
//
// Source: 2:19 (139s), ~65 BPM original
// Arrangement: 7 cycles at ~20s each = ~140s total
// setcpm(3) → 1 cycle per minute × 3 = 20s per cycle

setcpm(3)

stack(
  // Solo vocal phrases — one per cycle, sequential via <>
  // Each phrase plays its full natural duration (.clip(1))
  // Indices 1-7: phrase_00 is a Demucs ghost sample at -84dB (#22)
  s("suophr").n("<1 2 3 4 5 6 7>")
    .clip(1)
    .nudge(sine.range(-0.01, 0.01).slow(8))
    .gain(sine.range(0.55, 0.7).slow(3)),

  // Choir stems — enters on cycles 3 and 6 (matching verse structure)
  // Sequential via <> so each choir entry gets its own cycle
  s("suochr").n("<~ ~ 0 ~ ~ 3 ~>")
    .clip(1)
    .gain(0.5),

  // Bass pedal — one note per cycle, alternating B1/C2 for harmonic movement
  note("<b1 b1 b1 c2 b1 c2 b1>")
    .s("sine")
    .lpf(350)
    .gain(0.12)
    .decay(1.0)
    .sustain(0.5)
    .release(0.4)
)
