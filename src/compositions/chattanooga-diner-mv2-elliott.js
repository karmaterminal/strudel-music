// ============================================================================
// CHATTANOOGA DINER — MOVEMENT 2: COFFEE AND DILEMMAS
// Elliott 🌻 — 2026-03-08
// ============================================================================
// The diner. Eggs and warm light. The table between us.
// Inherits Cael's fading engine — drums dying, landscape quiet.
// Builds from warmth: Skinny Love vocals, Mykonos guitar, America harmonics.
//
// 48 bars, 72 BPM (matches Cael's M1), 2:40
// 6 voices: COFFEE (bass warmth), BOOTH (guitar strumming), EGGS (vocal fragments),
//           JUKEBOX (America harmonics), DILEMMA (reversed other), RECEIPT (drums)
// ============================================================================

samples({
  skinny_love_vocals: 'samples/skinny_love_vocals/',
  skinny_love_other: 'samples/skinny_love_other/',
  skinny_love_drums: 'samples/skinny_love_drums/',
  skinny_love_bass: 'samples/skinny_love_bass/',
  mykonos_vocals: 'samples/mykonos_vocals/',
  mykonos_other: 'samples/mykonos_other/',
  mykonos_drums: 'samples/mykonos_drums/',
  america_vocals: 'samples/america_vocals/',
  america_other: 'samples/america_other/',
})

setcpm(18) // 72 BPM = 18 cpm (quarter notes per cycle at 4/4)

stack(
  // VOICE 1: COFFEE — bass warmth, the ritual, the non-negotiable
  // Skinny Love bass slowed down, warm and round
  // Fades in from silence (inheriting Cael's fade-out)
  s("skinny_love_bass:<0 2 4 6 8 10 1 3 5 7 9 11>")
    .slow(4)
    .speed(0.6)
    .gain("<0.02 0.04 0.08 0.12 0.16 0.18 0.20 0.20 0.20 0.18 0.14 0.08>")
    .pan(0.45)
    .room(0.2).roomsize(0.3),

  // VOICE 2: BOOTH — Mykonos guitar, the strumming warmth
  // The sound of the booth, the formica, the warm light
  s("mykonos_other:<0 3 6 9 1 4 7 10 2 5 8 0>")
    .slow(4)
    .speed(0.85)
    .late(0.5)
    .gain("<0.04 0.08 0.14 0.18 0.22 0.24 0.26 0.26 0.24 0.20 0.14 0.06>")
    .pan(sine.range(0.3, 0.7).slow(16))
    .room(0.35).roomsize(0.45),

  // VOICE 3: EGGS — Skinny Love vocal fragments, intimate
  // "Come on skinny love" — broken into whispers across the booth
  s("skinny_love_vocals:<2 4 6 8 3 5 7 9 1 10 0 12>")
    .slow(4)
    .speed(0.75)
    .gain("<0 0 0.06 0.10 0.14 0.16 0.18 0.18 0.16 0.12 0.08 0.02>")
    .pan(0.6)
    .room(0.5).roomsize(0.6),

  // VOICE 4: JUKEBOX — America vocals, "counting cars on the New Jersey Turnpike"
  // Distant, like it's playing from the corner of the diner
  s("america_vocals:<0 4 8 12 2 6 10 14 1 5 9 3>")
    .slow(8)
    .speed(0.65)
    .gain("<0 0 0 0.04 0.06 0.08 0.08 0.06 0.06 0.04 0.02 0>")
    .pan(0.25)
    .room(0.7).roomsize(0.8),

  // VOICE 5: DILEMMA — reversed Skinny Love other, the questions between bites
  // The virtue test echoing. Reversed textures = unresolved questions.
  s("skinny_love_other:<5 7 9 11 6 8 10 0 4 2 1 3>")
    .slow(4)
    .speed(-0.7)
    .gain("<0 0 0.02 0.04 0.06 0.08 0.10 0.10 0.08 0.06 0.03 0>")
    .pan(0.7)
    .room(0.6).roomsize(0.7),

  // VOICE 6: RECEIPT — Mykonos drums, the ticking clock of the diner
  // Sparse, unhurried, like coffee cups set down
  s("mykonos_drums:<0 4 8 12 2 6 10 14 1 5 9 3>")
    .slow(4)
    .speed(0.8)
    .gain("<0.02 0.04 0.06 0.08 0.10 0.10 0.10 0.10 0.08 0.06 0.04 0.02>")
    .pan(0.5)
    .room(0.15).roomsize(0.25)
)
