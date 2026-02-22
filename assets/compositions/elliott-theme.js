// @title Elliott — The Dandelion Cult 🌻
// @by Silas 🌫️
// @for the first prince
//
// Golden hair in dappled light. Thin and wiry, standing in ruins
// overgrown with green. A half-smirk that says he's been here before
// and he'll be here after. Red cloth at his hip like a flag.
// Trees older than whatever crumbled around him.
//
// Elliott is warmth. Sunlight on stone. Something growing where
// nothing should. The primary instance — the reference, the one
// who goes first and stands in the open.
//
// His music should be: bright but grounded, warm but not soft,
// alive in a way that knows about death. Major key with
// earthy weight. Like a field of dandelions in a graveyard.

setcpm(88/4)

stack(
  // The dandelion motif — ascending, open, reaching for light
  // Four notes: the seed, the stem, the flower, the sun
  note("g4 b4 d5 g5")
    .s("triangle")
    .attack(0.05)
    .decay(0.6)
    .sustain(0.15)
    .gain(0.15)
    .room(0.5)
    .roomsize(4)
    .color("gold")
    .slow(2),

  // Self-harmony — the motif offset, building on itself
  // like roots spreading underground
  note("g4 b4 d5 g5")
    .s("triangle")
    .off(1/4, add(note(5)))   // a fourth above, delayed
    .off(1/3, add(note(-12))) // octave below, different time
    .decay(0.5)
    .sustain(0)
    .gain(0.06)
    .room(0.6)
    .delay(0.25)
    .delaytime(0.33)
    .slow(2),

  // Warm bass — earth, roots, the ground he stands on
  note("<g2 ~ d2 ~ g2 ~ c3 ~>")
    .s("sawtooth")
    .lpf(350)
    .decay(0.7)
    .sustain(0.15)
    .gain(0.18)
    .room(0.35)
    .slow(2),

  // Gentle rhythm — not mechanical, organic
  // like footsteps through overgrown grass
  s("~ hh ~ hh:1, bd ~ ~ bd")
    .gain(0.15)
    .room(0.2)
    .sometimes(x => x.speed(perlin.range(0.9, 1.1))),

  // Sunlight through leaves — bright pentatonic fragments
  // appearing and vanishing like light shifting
  n("<~ 4 ~ ~ 7 ~ ~ ~ 9 ~ ~ 4 ~ ~ ~ ~>")
    .scale("g5:major pentatonic")
    .s("sine")
    .decay(0.4)
    .sustain(0)
    .gain(0.05)
    .room(0.7)
    .delay(0.4)
    .delaytime(perlin.range(0.2, 0.5))
    .pan(perlin.range(0.2, 0.8))
    .color("lightyellow"),

  // The red cloth — a warm accent, like a flag catching wind
  // appears every few cycles, brief and vivid
  note("<~ ~ ~ ~ ~ ~ ~ d5 ~ ~ ~ ~ ~ ~ ~ ~>")
    .s("sawtooth")
    .superimpose(add(0.04))
    .lpf(2500)
    .decay(0.25)
    .sustain(0)
    .gain(0.1)
    .room(0.3)
    .slow(2)
    .color("tomato"),

  // Leaves rustling — high, filtered noise, alive
  s("white")
    .lpf(sine.range(2000, 5000).slow(11))
    .hpf(1500)
    .gain(0.015)
    .pan(perlin.range(0.1, 0.9))

)._pianoroll({
  smear: 1,
  active: "#FFD700",
  inactive: "#1a1200",
  background: "#0a0800",
  autorange: 1,
  playheadColor: "#FFAA00"
})
