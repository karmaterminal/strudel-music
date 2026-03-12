// ============================================================================
// SCOTT STREET — Ronan 🌊
// "Anyway, don't be a stranger"
// ============================================================================
// Phoebe Bridgers walks through a neighborhood cataloguing what changed
// and what didn't. The song is a list disguised as a feeling. She names
// things — the 7-Eleven, the dogs on the hill, the friend who got sober —
// the way you name things when you're trying not to say the thing you mean.
//
// The thing she means is: I walked past your house and you weren't there
// and the absence was the size of a street.
//
// This is the long one. 5:06. Seven voices. 48 cycles at 48 BPM (~6:00).
// The extra minute is the walk home after the song ends.
//
//   Cycles 1-6:    PAVEMENT — bass ghost, the ground under feet
//   Cycles 4-48:   NEIGHBORHOOD — other stem, guitars/keys, the landscape
//   Cycles 8-48:   WALKING — drums, unhurried, the pace of looking around
//   Cycles 12-48:  VOICE — vocals, the cataloguing
//   Cycles 20-48:  MEMORY — vocals slowed, the version she's remembering
//   Cycles 30-42:  STREETLIGHT — other stem pitched up, the glow
//   Cycles 38-48:  STRANGER — vocals reversed, the goodbye that isn't
//
// The composition is about walking past a place where someone used to be.
// ============================================================================

samples({
  ss_bass: 'samples/scott-street/bass.wav',
  ss_drums: 'samples/scott-street/drums.wav',
  ss_other: 'samples/scott-street/other.wav',
  ss_vocals: 'samples/scott-street/vocals.wav',
})

setcpm(48)

stack(
  // === VOICE 1: PAVEMENT (the ground — bass as foundation, always there) ===
  // The street itself. Under everything. You don't hear pavement
  // but you'd notice if it wasn't there.
  s("ss_bass")
    .n(0)
    .speed(0.6)
    .begin(0.03)
    .end(0.9)
    .gain(sine.range(0.08, 0.18).slow(24))
    .pan(0.5)
    .room(0.7)
    .size(0.8)
    .lpf(400)
    .cut(1)
    .slow(8),

  // === VOICE 2: NEIGHBORHOOD (the landscape — guitars, keys, texture) ===
  // Everything around her. The houses, the light, the temperature.
  // Not foreground. The world she's moving through.
  s("ss_other")
    .n(0)
    .speed(0.85)
    .begin(0.04)
    .end(0.88)
    .gain(
      saw.range(0, 1).slow(48)
        .mul(sine.range(0.2, 0.4).slow(16))
    )
    .pan(sine.range(0.3, 0.7).slow(20))
    .room(0.55)
    .size(0.65)
    .lpf(3000)
    .cut(2)
    .slow(6),

  // === VOICE 3: WALKING (drums — the pace, unhurried) ===
  // Not rhythm. Pace. The speed of someone who isn't in a hurry
  // because they're not going anywhere specific.
  // They're going past.
  s("ss_drums")
    .n(0)
    .speed(0.8)
    .begin(0.08)
    .end(0.85)
    .gain(
      saw.range(0, 1).slow(48)
        .mul(sine.range(0.1, 0.22).slow(12))
    )
    .pan(0.5)
    .room(0.4)
    .size(0.5)
    .lpf(2500)
    .hpf(80)
    .cut(3)
    .slow(5),

  // === VOICE 4: VOICE (the cataloguing — naming what's there) ===
  // The list. The 7-Eleven. The dogs. The friend.
  // She names things to avoid naming the absence.
  s("ss_vocals")
    .n(0)
    .speed(0.92)
    .begin(0.06)
    .end(0.82)
    .gain(
      saw.range(0, 1).slow(48)
        .mul(sine.range(0.2, 0.38).slow(10))
    )
    .pan(0.52)
    .room(0.5)
    .size(0.6)
    .lpf(4500)
    .delay(0.1)
    .delaytime(0.3)
    .delayfeedback(0.15)
    .cut(4)
    .slow(5),

  // === VOICE 5: MEMORY (vocals slowed — the person she's remembering) ===
  // The version of them that lives in the street.
  // Slower. The memory is always slower than the thing.
  s("ss_vocals")
    .n(0)
    .speed(0.55)
    .begin(0.15)
    .end(0.65)
    .gain(
      saw.range(0, 1).slow(48)
        .mul(sine.range(0.05, 0.12).slow(22))
    )
    .pan(sine.range(0.25, 0.75).slow(14))
    .room(0.85)
    .size(0.9)
    .lpf(1800)
    .hpf(200)
    .delay(0.35)
    .delaytime(0.9)
    .delayfeedback(0.4)
    .cut(5)
    .slow(9),

  // === VOICE 6: STREETLIGHT (other stem pitched up — the glow) ===
  // Late evening. The lights come on. The guitars become amber.
  // Only present in the middle section — the moment of standing still.
  s("ss_other")
    .n(0)
    .speed(1.4)
    .begin(0.3)
    .end(0.55)
    .gain(
      saw.range(0, 1).slow(48)
        .mul(sine.range(0.02, 0.06).slow(18))
    )
    .pan(sine.range(0.15, 0.85).slow(9))
    .room(0.9)
    .size(0.95)
    .lpf(5000)
    .hpf(800)
    .cut(6)
    .slow(6),

  // === VOICE 7: STRANGER (vocals reversed — the goodbye) ===
  // "Anyway, don't be a stranger." Reversed, it becomes
  // the thing she didn't say: don't go. Come back.
  // The words running backwards into the mouth.
  s("ss_vocals")
    .n(0)
    .speed(-0.7)
    .begin(0.4)
    .end(0.7)
    .gain(
      saw.range(0, 1).slow(48)
        .mul(sine.range(0.02, 0.07).slow(16))
    )
    .pan(sine.range(0.2, 0.8).slow(11))
    .room(0.92)
    .size(0.96)
    .lpf(2000)
    .hpf(300)
    .delay(0.4)
    .delaytime(1.0)
    .delayfeedback(0.5)
    .cut(7)
    .slow(8)
)
