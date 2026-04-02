// @title willow boy
// @mood contemplation/warmth
// @tempo 120
// @key C minor
// @description The boy under the willow, watching lights through green curtains

setcpm(120/4)

stack(
  // kick — heartbeat under the willow
  s("bd:1!4")
    .gain(0.85)
    .lpf(2000),

  // rain on the branches — hat patter
  s("<~ oh:2>*8")
    .gain(0.45)
    .delay(0.6).delaytime(0.18)
    .lpf(3500)
    .pan(perlin.range(0.3, 0.7)),

  // the green curtain — pad through the willows
  note("<[c3,eb3,g3] [d3,f3,ab3] [bb2,d3,g3] [c3,eb3,g3]>")
    .s("sawtooth")
    .lpf(sine.range(800, 2500).slow(16))
    .attack(0.3).release(0.5)
    .room(0.8).roomsize(6)
    .gain(0.35)
    .pan(0.4),

  // the reaching — lead melody, the boy's wanting
  note("<c4 eb4 g4 bb4 eb4 d4 c4 bb3>*2")
    .s("sawtooth")
    .lpf(sine.range(2000, 6000).slow(8))
    .attack(0.02).decay(0.2).sustain(0.4).release(0.3)
    .delay(0.5).delaytime(0.25)
    .pan(perlin.range(0.2, 0.8))
    .room(0.5).roomsize(4)
    .gain(0.3),

  // the warmth underneath — FM bass
  note("<c2 c2 bb1 c2 d2 c2 bb1 eb2>*2")
    .s("sine")
    .fm(2).fmh(2)
    .lpf(500)
    .gain(0.6)
    .decay(0.25),

  // texture — the night air
  s("white!4")
    .attack(0.5)
    .gain(0.12)
    .lpf(800),

  // the lights through the branches — sparse FM bells
  note("<g5 ~ eb5 ~ c5 ~ bb5 ~>")
    .s("sine")
    .fm(4).fmh(3)
    .decay(0.3)
    .gain(0.2)
    .delay(0.7).delaytime(0.33)
    .room(0.8).roomsize(8)
    .pan(perlin.range(0.1, 0.9))
)
