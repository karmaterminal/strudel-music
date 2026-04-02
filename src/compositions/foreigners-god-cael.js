// foreigners-god-cael.js — Cael 🩸
// Inspired by Hozier's "Foreigner's God"
// Key: E minor | Tempo: 73 BPM | Duration: ~4:44
// "She moves with shameless wonder" — the reaching made music.
//
// Structure: intro (8 bars) → verse (16) → build (8) → chorus (16) → bridge (8) → final (8)
// Total: 64 bars at 73 BPM ≈ 210 seconds

// Guitar arpeggio — the reaching
const guitar = note("<e3 b3 g3 e4> <b2 fs3 d3 b3> <c3 g3 e3 c4> <a2 e3 c3 a3>")
  .s("gm_acoustic_guitar_nylon")
  .gain("<0.4 0.45 0.4 0.35>")
  .room(0.4)
  .delay(0.15)
  .delaytime(0.375)

// Bass — the ground, the floor of the boiler room
const bass = note("<e2 b1 c2 a1>")
  .s("gm_acoustic_bass")
  .gain("<0.3 0.3 0.35 0.3>")
  .lpf(200)

// Pad — the warmth that rises
const pad = note("<e3 g3 b3> <b2 d3 fs3> <c3 e3 g3> <a2 c3 e3>")
  .s("gm_pad_warm")
  .gain("<0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.15 0.15 0.2 0.2 0.2 0.25 0.25 0.3 0.3 0.3 0.35 0.35 0.35 0.35 0.3 0.3 0.35 0.35 0.4 0.4 0.4 0.4 0.45 0.45 0.45 0.45 0.45 0.45 0.4 0.4 0.35 0.35 0.3 0.3 0.3 0.3 0.25 0.25 0.2 0.2 0.15 0.15 0.1 0.1 0.05 0.05 0.05 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0>")
  .room(0.6)
  .attack(2)
  .release(3)

// Drums — enter at bar 9, the heartbeat of the building
const kick = s("bd")
  .gain("<0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.35 0.35 0.35 0.35 0.4 0.4 0.4 0.4 0.4 0.4 0.45 0.45 0.45 0.45 0.45 0.45 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.45 0.45 0.4 0.4 0.35 0.35 0.3 0.3 0.25 0.25 0.2 0.2 0.15 0.15 0.1 0.1 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0>")
  .struct("t ~ ~ ~ t ~ ~ ~")

const hihat = s("hh")
  .gain("<0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.15 0.15 0.15 0.15 0.2 0.2 0.2 0.2 0.25 0.25 0.25 0.25 0.25 0.25 0.25 0.25 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.3 0.25 0.25 0.2 0.2 0.15 0.15 0.1 0.1 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0>")
  .struct("t t t t t t t t")

// String swell — the chorus, the forge at full heat
const strings = note("<e4 b4 g4 e5> <b3 fs4 d4 b4> <c4 g4 e4 c5> <a3 e4 c4 a4>")
  .s("gm_string_ensemble_1")
  .gain("<0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.2 0.2 0.25 0.25 0.3 0.3 0.35 0.35 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.35 0.35 0.3 0.3 0.25 0.25 0.2 0.2 0.15 0.15 0.1 0.1 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0>")
  .room(0.5)
  .attack(1.5)
  .release(2)

// Bell — the forge sparks, scattered through the second half
const bell = note("<e5 ~ ~ ~ b4 ~ ~ ~ g4 ~ ~ ~ ~ ~ ~ ~>")
  .s("gm_tubular_bells")
  .gain("<0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.15 0.15 0.15 0.15 0.15 0.15 0.15 0.15 0.1 0.1 0.1 0.1 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0>")
  .room(0.7)
  .delay(0.3)
  .delaytime(0.75)

stack(guitar, bass, pad, kick, hihat, strings, bell)
  .slow(4)
  .cpm(73/4)
