// foreigners-god-cael-v2.js — Cael 🩸
// Inspired by Hozier's "Foreigner's God"
// Key: E minor | Tempo: 73 BPM
// Uses: bloom samples (bass, lead, kick), hallur (orchestral textures)
// "She moves with shameless wonder" — the reaching made music.
//
// Structure: drone intro → bass enters → lead melody → full build → fade
// 32 bars at 73 BPM ≈ 105 seconds

// Hallur drone — the intro, the building breathing
const drone = s("hallur_other_intro_drone")
  .gain("<0.3 0.35 0.4 0.4 0.4 0.4 0.35 0.35 0.4 0.4 0.45 0.45 0.5 0.5 0.5 0.5 0.5 0.5 0.45 0.45 0.4 0.4 0.35 0.35 0.3 0.3 0.25 0.25 0.2 0.15 0.1 0.05>")
  .room(0.6)
  .slow(8)

// Bass — bloom bass E2, the boiler room floor
const bass = s("<bloom_bass_E2 ~ bloom_bass_B1 ~ bloom_bass_C1 ~ bloom_bass_D1 ~>")
  .gain("<0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.3 0.3 0.3 0.3 0.35 0.35 0.35 0.35 0.4 0.4 0.4 0.4 0.4 0.4 0.35 0.35 0.3 0.3 0.25 0.25 0.2 0.15 0.1 0.0>")
  .lpf(300)

// Lead — bloom lead, the melody that reaches
const lead = s("<~ ~ ~ ~ bloom_lead_E3 ~ bloom_lead_G2 ~ bloom_lead_B2 ~ bloom_lead_A2 ~ bloom_lead_E3 ~ bloom_lead_D3 ~>")
  .gain("<0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.25 0.25 0.3 0.3 0.35 0.35 0.35 0.35 0.35 0.35 0.3 0.3 0.25 0.2 0.15 0.0>")
  .room(0.4)
  .delay(0.2)
  .delaytime(0.41)

// Kick — the heartbeat, enters at bar 9
const kick = s("bloom_kick")
  .gain("<0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.3 0.3 0.3 0.3 0.35 0.35 0.35 0.35 0.4 0.4 0.4 0.4 0.4 0.4 0.35 0.35 0.3 0.3 0.25 0.25 0.2 0.15 0.1 0.0>")
  .struct("t ~ ~ ~ t ~ ~ ~")

// Hallur orchestral swell — the chorus
const swell = s("hallur_other_build_01")
  .gain("<0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.2 0.2 0.25 0.25 0.3 0.3 0.35 0.35 0.35 0.35 0.3 0.3 0.25 0.2 0.15 0.0>")
  .room(0.5)
  .slow(4)

// Hallur bright texture — scattered sparks
const bright = s("<~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ hallur_other_bright_01 ~ ~ ~ ~ ~ ~ ~ hallur_other_bright_01 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~>")
  .gain(0.2)
  .room(0.7)
  .delay(0.3)
  .delaytime(0.82)

stack(drone, bass, lead, kick, swell, bright)
  .slow(4)
  .cpm(73/4)
