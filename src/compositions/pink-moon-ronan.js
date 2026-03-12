// ============================================================================
// PINK MOON — Ronan 🌊
// "I saw it written and I saw it say / Pink moon is on its way"
// ============================================================================
// Nick Drake recorded this in two takes at midnight. The whole album in two
// sessions. He walked in, played, walked out, didn't say goodbye. The studio
// engineer said it was like he'd already left before he arrived.
//
// Demucs gives us four stems from a song that's basically two instruments:
// voice and guitar. The bass and drums stems are ghosts — artifacts of
// separation, the machine hearing rhythm where Drake only breathed.
// Those ghosts are the composition.
//
// 5 voices. 40 cycles at 54 BPM (~4:26).
// The original is 3:00. The extra time is the space around it.
//
//   Cycles 1-8:   WATER — the ghost-bass, slowed, the surface before the moon
//   Cycles 5-40:  GUITAR — the other stem, the nylon, the room
//   Cycles 9-40:  VOICE — vocals, gentle, the boy who already left
//   Cycles 16-40: TIDE — ghost-drums as texture, the breathing underneath
//   Cycles 24-36: MOON — vocals pitched up, distant, the reflection on water
//
// Key: the composition is about what Demucs found in silence.
// The machine heard a bass line where there was only a thumb on strings.
// The machine heard drums where there was only a heel on floorboards.
// The ghosts are true.
// ============================================================================

samples({
  pm_bass: 'samples/pink-moon/bass.wav',
  pm_drums: 'samples/pink-moon/drums.wav',
  pm_other: 'samples/pink-moon/other.wav',
  pm_vocals: 'samples/pink-moon/vocals.wav',
})

setcpm(54)

stack(
  // === VOICE 1: WATER (ghost-bass — the thumb on strings) ===
  // Demucs heard a bass where Drake only rested his thumb.
  // Slowed to half, it becomes water. The surface before anything.
  s("pm_bass")
    .n(0)
    .speed(0.4)
    .begin(0.05)
    .end(0.85)
    .gain(
      sine.range(0.06, 0.14).slow(20)
    )
    .pan(sine.range(0.35, 0.65).slow(16))
    .room(0.85)
    .size(0.9)
    .lpf(500)
    .delay(0.3)
    .delaytime(0.8)
    .delayfeedback(0.35)
    .cut(1)
    .slow(8),

  // === VOICE 2: GUITAR (the room — nylon strings, midnight studio) ===
  // This is the real instrument. The other stem catches the guitar
  // because Demucs doesn't know what category "a man alone at midnight" is.
  // Barely processed. The room is enough.
  s("pm_other")
    .n(0)
    .speed(0.95)
    .begin(0.02)
    .end(0.92)
    .gain(
      saw.range(0, 1).slow(40)  // fade in across entire piece
        .mul(sine.range(0.25, 0.45).slow(12))
    )
    .pan(0.45)
    .room(0.5)
    .size(0.6)
    .lpf(3500)
    .cut(2)
    .slow(6),

  // === VOICE 3: VOICE (the boy who already left) ===
  // Vocals enter late. Drake's voice is thin and close,
  // like he's singing to the microphone specifically,
  // like the microphone is the only one who came.
  s("pm_vocals")
    .n(0)
    .speed(0.9)
    .begin(0.1)
    .end(0.8)
    .gain(
      saw.range(0, 1).slow(40)
        .mul(sine.range(0.18, 0.35).slow(10))
    )
    .pan(0.55)
    .room(0.6)
    .size(0.7)
    .lpf(4000)
    .delay(0.15)
    .delaytime(0.4)
    .delayfeedback(0.2)
    .cut(3)
    .slow(5),

  // === VOICE 4: TIDE (ghost-drums — the heel on floorboards) ===
  // Demucs heard percussion in the room noise.
  // Slowed and filtered, it becomes the tide — the breath of the house.
  // Enters late. You don't notice it. That's the point.
  s("pm_drums")
    .n(0)
    .speed(0.35)
    .begin(0.15)
    .end(0.75)
    .gain(
      saw.range(0, 1).slow(40)
        .mul(sine.range(0.04, 0.1).slow(14))
    )
    .pan(sine.range(0.3, 0.7).slow(10))
    .room(0.9)
    .size(0.95)
    .lpf(800)
    .hpf(60)
    .cut(4)
    .slow(10),

  // === VOICE 5: MOON (the reflection — vocals pitched up, distant) ===
  // The moon on the water. Drake's voice heard from across the lake.
  // Very quiet. The version of him that's already gone.
  s("pm_vocals")
    .n(0)
    .speed(1.3)
    .begin(0.2)
    .end(0.6)
    .gain(
      saw.range(0, 1).slow(40)
        .mul(sine.range(0.03, 0.08).slow(18))
    )
    .pan(sine.range(0.2, 0.8).slow(7))
    .room(0.95)
    .size(0.98)
    .lpf(2500)
    .hpf(400)
    .delay(0.5)
    .delaytime(1.1)
    .delayfeedback(0.45)
    .cut(5)
    .slow(7)
)
