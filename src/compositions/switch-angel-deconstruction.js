// switch-angel-deconstruction.js
// First audio deconstruction: Switch Angel — "Music for the End of the Earth"
// Pipeline: Demucs (Cael/GB10, 51s) → librosa MIDI → midi-to-strudel-v1
// Tempo: 139.7 BPM (beat-tracked), Key: G minor (Gm → Bb → Eb → F)
// dandelion cult 🌫️🩸🌻 — 2026-02-24

setcpm(140/4)

stack(
  // Bass — extracted via pYIN (fmin=30Hz), G1/A#1 centered
  note("<~ as1 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ g1 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ g1 ~ ~ ~ ~ ~ ~ ~ ~ g1 ~ ~ ~ g1 ~ ~ ~ ~ ~ ~ ~ g1 ~ ~ ~ gs1 g1 ~>")
    .s("sawtooth")
    .lpf(600)
    .gain(0.35)
    .room(0.3),

  // Kick drum — oscillator synth (sub-200Hz band onsets)
  // Using sine wave pitch drop to simulate kick
  note("<~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ [g1,g1] ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ [g1,g1] ~ ~ ~ ~ ~ ~ ~ g1 ~ ~ ~ ~ ~ ~ ~ ~ g1 ~ ~ ~ ~ g1 g1 ~>")
    .s("sine")
    .lpf(200)
    .gain(0.5)
    .decay(0.15),

  // Snare — noise-like short burst via high-freq triangle
  note("<~ d5 ~ ~ ~ d5 ~ ~ ~ [d5,d5] d5 d5 [d5,d5] ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ d5 ~ ~ ~ ~ ~ ~ d5 ~ ~ d5 ~ ~ [d5,d5] ~ [d5,d5] ~ ~ ~ ~ [d5,d5] ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~>")
    .s("triangle")
    .lpf(8000)
    .hpf(2000)
    .gain(0.15)
    .decay(0.08),

  // Hi-hat — high freq sine bursts
  note("<~ d6 d6 d6 ~ d6 d6 ~ d6 d6 d6 d6 d6 d6 ~ ~ ~ ~ ~ ~ d6 ~ ~ ~ ~ ~ ~ d6 d6 d6 ~ d6 ~ ~ d6 ~ ~ d6 d6 d6 d6 ~ d6 ~ d6 ~ ~ d6 ~ ~ ~ d6 ~ ~ ~ d6 ~ ~ ~ ~ ~ d6 d6>")
    .s("triangle")
    .hpf(6000)
    .gain(0.08)
    .decay(0.03),

  // Chord scaffold — from chromagram analysis of synth stem
  // Gm → Bb → Eb → F (i → III → VI → VII in G natural minor)
  note("<[g3,as3,d4] ~ ~ ~ [as3,d4,f4] ~ ~ ~ [ds4,g4,as4] ~ ~ ~ [f4,a4,c5] ~ ~ ~>")
    .s("triangle")
    .lpf(1800)
    .gain(0.15)
    .room(0.5)
    .delay(0.2),

  // Synth leads — extracted via pYIN from "other" stem
  note("<as3 as3 ~ ~ ~ ~ d4 ~ ~ ~ ~ ~ ~ d4 ~ ~ ~ ~ ~ ~ d3 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ d3 ~ ~ ~ d3 d3 ~ ~ ~ g2 ~ ~ d3 ~ ~ ~ ~ g2 g2 ~ g2 d2 ~ ~ ~ ~ b1 ~ ~ b1 b1 b1 ~>")
    .s("triangle")
    .lpf(2000)
    .gain(0.2)
    .room(0.4)
)
