// Chattanooga Diner — Movement 1: The Forge's Road — Cael 🩸
// v4: Fixed sub-bass mud (70% sub → target <40%), HPF on all voices,
//     raised speed values to keep content in audible range.
//
// 72 BPM, ~2:40 (48 bars). 5 voices. Hozier FG stems (fresh slice, 11 per bank).
// dandelion cult — cael🩸 / 2026-03-08

setcps(72 / 60 / 4)

stack(

  // VOICE 1: THE HIGHWAY — drums, forward motion
  // HPF at 120Hz to cut 61.7Hz artifact (every drum slice flagged)
  s("hozier_fg_drums:<2 4 6 8 3 5 7 9 2 6 4 8>")
    .slow(4)
    .speed(1.0)
    .hpf(120)
    .gain("<0.24 0.26 0.28 0.28 0.28 0.28 0.26 0.24 0.22 0.18 0.12 0.06>")
    .pan(0.5)
    .room(0.2).roomsize(0.3),

  // VOICE 2: THE PASSENGER — vocals, half-heard
  // HPF at 100Hz, speed at 0.8 (not 0.6 — keep formants recognizable)
  s("hozier_fg_vocals:<1 3 5 7 9 2 4 6 8 10 1 5>")
    .slow(4)
    .speed(0.8)
    .late(2)
    .hpf(100)
    .gain("<0 0.10 0.16 0.22 0.26 0.28 0.28 0.26 0.22 0.16 0.08 0.02>")
    .pan(0.35)
    .room(0.5).roomsize(0.6),

  // VOICE 3: THE ENGINE — bass
  // Speed at 0.7 (not 0.45 — was pushing everything to sub-bass)
  // HPF at 60Hz to let the musical bass through but cut rumble
  s("hozier_fg_bass:<3 5 7 9 0 2 4 6 8 10 1 3>")
    .slow(4)
    .speed(0.7)
    .hpf(60)
    .gain("<0.14 0.16 0.16 0.16 0.16 0.16 0.16 0.16 0.16 0.14 0.10 0.04>")
    .pan(0.5)
    .room(0.15).roomsize(0.4),

  // VOICE 4: THE LANDSCAPE — "other" stem (guitar textures)
  // This is the treble/mid content. Speed at 0.9 to keep it bright.
  // Louder than before — this carries the spectral variety.
  s("hozier_fg_other:<0 3 6 9 1 4 7 10 2 5 8 0>")
    .slow(4)
    .speed(0.9)
    .late(1)
    .hpf(80)
    .gain("<0.16 0.20 0.24 0.26 0.28 0.26 0.24 0.22 0.20 0.16 0.08 0.02>")
    .pan(sine.range(0.2, 0.8).slow(24))
    .room(0.4).roomsize(0.5),

  // VOICE 5: THE SILENCE — reversed vocal, Arizona stretch (bars 16-32)
  s("hozier_fg_vocals:<7 9 7 9 7 9 7 9 7 9 7 9>")
    .slow(4)
    .speed(-0.5)
    .hpf(200)
    .gain("<0 0 0 0 0.04 0.06 0.07 0.06 0.04 0 0 0>")
    .pan(0.65)
    .room(0.6).roomsize(0.8)

)
