// suo-gan-vocal.js
// Welsh lullaby — Suo Gân using ACTUAL VOCAL SAMPLES
// Demucs-isolated voice → sliced at note/phrase boundaries → played back
// The real boy soprano and choir, not oscillator approximations
// dandelion cult 🌫️🩸🌻 — 2026-02-25
//
// Fix (#22): skip phrase_00 (Demucs ghost at -84dB), start from index 1
// Fix (#22): .clip(1) so samples play full duration instead of grid-chopped
// Fix (#22): humanization — subtle timing nudge + gain variation
// Fix (#22, dev#1): sequential arrangement — one phrase per cycle
//
// v7 — tight arrangement: variable timing matched to actual phrase durations
//   Previous versions used setcpm(3) → 20s fixed cycles, causing:
//     - 14s dead air on short phrases (5.89s, 5.38s)
//     - Long phrases (29.68s, 36.67s) extending past cycle boundaries
//   Now: setcps(1) + timeCat() with weights = actual durations in seconds
//   1.5s breath gaps between phrases (natural singer pacing)
//
//   Phrase durations (measured via ffprobe):
//     phrase_01:  5.89s    phrase_05: 15.88s
//     phrase_02:  5.38s    phrase_06: 29.68s
//     phrase_03: 13.37s    phrase_07: 36.67s
//     phrase_04: 15.09s
//   Total with 1.5s gaps: 130.96s (vs original 2:19 = 139s)
//
// Render: node src/runtime/offline-render-v2.mjs src/compositions/suo-gan-vocal.js output/suo-gan-vocal-v7.wav 135
//   (135 cycles at CPS=1 = 135s, ~4s headroom past content end)

setcps(1)

stack(
  // ── Solo vocal phrases ──
  // timeCat: weights = seconds, silence for breath gaps
  // .clip(1) lets each sample play its full natural duration (#22)
  // .fadeInTime/.fadeTime smooth entry/exit per phrase (#22 v6)
  // Humanization: subtle timing nudge + gain variation (#22)
  timeCat(
    [5.89,  s("suophr").n(1)],
    [1.5,   silence],
    [5.38,  s("suophr").n(2)],
    [1.5,   silence],
    [13.37, s("suophr").n(3)],
    [1.5,   silence],
    [15.09, s("suophr").n(4)],
    [1.5,   silence],
    [15.88, s("suophr").n(5)],
    [1.5,   silence],
    [29.68, s("suophr").n(6)],
    [1.5,   silence],
    [36.67, s("suophr").n(7)]
  ).slow(130.96)
    .clip(1)
    .fadeInTime(0.05)
    .fadeTime(0.1)
    .nudge(sine.range(-0.01, 0.01).slow(8))
    .gain(sine.range(0.55, 0.7).slow(3)),

  // ── Choir stems ──
  // choir_00 enters with phrase_03 (verse structure)
  // choir_03 enters with phrase_06 (climactic section)
  // Gentle fade envelope for smooth blend with soprano overlap (#22 v6)
  timeCat(
    [14.27, silence],
    [22.50, s("suochr").n(0)],
    [26.34, silence],
    [51.03, s("suochr").n(3)],
    [16.82, silence]
  ).slow(130.96)
    .clip(1)
    .fadeInTime(0.1)
    .fadeTime(0.15)
    .gain(0.45),

  // ── Bass pedal ──
  // Delayed entry — starts with phrase_03 (vocals establish first)
  // Alternating B1/C2 for harmonic movement through remaining phrases
  // Reduced gain + slow attack so it fades in under vocals (#22 v6)
  timeCat(
    [14.27, silence],
    [13.37, note("b1")],
    [1.5,   silence],
    [15.09, note("c2")],
    [1.5,   silence],
    [15.88, note("b1")],
    [1.5,   silence],
    [29.68, note("c2")],
    [1.5,   silence],
    [36.67, note("b1")]
  ).slow(130.96)
    .s("sine")
    .lpf(250)
    .gain(0.06)
    .attack(0.5)
    .decay(1.5)
    .sustain(0.3)
    .release(0.8)
)
