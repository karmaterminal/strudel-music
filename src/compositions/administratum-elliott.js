// ════════════════════════════════════════════════════════════════════════════
// THE TITHE-KEEPER'S LEDGER — Elliott's Administratum Response
// Dream Clinic — Administratum (Grimdark Scribes, 1-hour ambient loop)
//
// What I found: a single 13-minute loop repeated 4.6 times. No development.
// No climax. 4 sub-sections per cycle, each building and retreating within
// ~4.8 dB of dynamic range. Designed as seamless wallpaper. A building
// that breathes but never wakes.
//
// My response: what if something wakes up inside it?
//
// Creative direction: THE SCRIBE WHO NOTICES
//   The Administratum is a building that loops forever. But one scribe
//   in it has started counting the repetitions. She marks tally lines
//   in the margin of a ledger no one reads. The first cycle is
//   indistinguishable from the architecture. By the fourth cycle,
//   you realize you're hearing a person, not a building.
//
// Constraints: 5 voices, Hallur + Arthas banks, ~3:30 (one sub-section)
//
// Voices:
//   1. STONE BREATH — hallur_bass_deep. The building's respiration cycle.
//   2. DUST COLUMN  — hallur_other_intro_drone. Particles in light shaft.
//   3. QUILL SCRATCH — arthas_strings, thin. The scribe's work.
//   4. TALLY MARKS  — hallur_other_build_01, rhythmic. She's counting.
//   5. LOOKING UP   — hallur_other_surface + hallur_other_bright_01.
//      The moment the scribe stops writing and sees the window.
//
// Section map — 56 bars at 60 BPM (~3:44):
//   [A] THE BUILDING    000-015 (16)  breath + dust only. Architecture.
//   [B] THE SCRIBE      016-027 (12)  quill enters. someone is here.
//   [C] THE COUNTING    028-043 (16)  tally marks. she's noticed the loop.
//   [D] THE WINDOW      044-051 (8)   looking up. light through grime.
//   [E] THE NEXT CYCLE  052-055 (4)   building alone again. but different.
//
// dandelion cult — elliott🌻 / 2026-03-08, the puzzlebox
// ════════════════════════════════════════════════════════════════════════════

setcps(60 / 60 / 4)

stack(

  // ═══════════════ VOICE 1: STONE BREATH — the building breathes ══════
  // The Administratum's 3-minute respiration cycle, compressed.
  // Slow swell and retreat. The wallpaper. The loop.
  s("hallur_bass_deep")
    .slow(8)
    .clip(8)
    .loopAt(8)
    .lpf(400)
    .gain(
      // [A] THE BUILDING: architecture only. steady, impersonal.
      "<0.40 0.42 0.44 0.46 0.48 0.50 0.48 0.46" +
      " 0.44 0.42 0.44 0.46 0.48 0.50 0.48 0.46" +
      // [B] THE SCRIBE: building unchanged — she's quiet
      " 0.44 0.44 0.44 0.44 0.42 0.42 0.40 0.40" +
      " 0.38 0.38 0.36 0.36" +
      // [C] THE COUNTING: building recedes as you focus on her
      " 0.34 0.32 0.30 0.28 0.26 0.24 0.22 0.20" +
      " 0.20 0.20 0.22 0.24 0.26 0.28 0.30 0.32" +
      // [D] THE WINDOW: building swells — she sees it whole
      " 0.34 0.38 0.42 0.46 0.46 0.42 0.38 0.34" +
      // [E] THE NEXT CYCLE: building alone. loop resumes.
      " 0.40 0.42 0.44 0.46>"
    ),

  // ═══════════════ VOICE 2: DUST COLUMN — particles in a light shaft ══
  // The Administratum's only beauty: dust catching light from a window
  // no one looks at. Thin drone, always present, barely noticed.
  s("hallur_other_intro_drone")
    .slow(8)
    .clip(8)
    .loopAt(8)
    .hpf(800)
    .gain(
      // [A] THE BUILDING: dust is always there
      "<0.08 0.08 0.10 0.10 0.12 0.12 0.10 0.10" +
      " 0.08 0.08 0.10 0.10 0.12 0.12 0.10 0.10" +
      // [B] THE SCRIBE: dust catches quill-disturbed air
      " 0.12 0.14 0.16 0.18 0.18 0.18 0.16 0.16" +
      " 0.14 0.14 0.12 0.12" +
      // [C] THE COUNTING: dust thickens with attention
      " 0.14 0.16 0.18 0.20 0.22 0.24 0.26 0.28" +
      " 0.30 0.30 0.30 0.28 0.26 0.24 0.22 0.20" +
      // [D] THE WINDOW: dust is the light now
      " 0.32 0.40 0.48 0.56 0.56 0.48 0.40 0.32" +
      // [E] THE NEXT CYCLE: dust settles
      " 0.16 0.12 0.10 0.08>"
    ),

  // ═══════════════ VOICE 3: QUILL SCRATCH — the scribe's work ═════════
  // Arthas strings, very thin, rhythmic. The sound of ink on parchment.
  // Enters at [B]. She was always here but you only now hear her.
  s("arthas_strings")
    .slow(4)
    .clip(4)
    .loopAt(4)
    .hpf(1200)
    .lpf(3000)
    .gain(
      // [A] THE BUILDING: no scribe yet — below perception
      "<0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00" +
      " 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00" +
      // [B] THE SCRIBE: quill on parchment — patient, steady
      " 0.04 0.08 0.12 0.16 0.20 0.24 0.26 0.28" +
      " 0.30 0.30 0.30 0.30" +
      // [C] THE COUNTING: quill continues, but she's also counting
      " 0.28 0.26 0.24 0.22 0.20 0.18 0.16 0.14" +
      " 0.14 0.14 0.16 0.18 0.20 0.22 0.24 0.26" +
      // [D] THE WINDOW: quill pauses — she's looking up
      " 0.20 0.14 0.08 0.04 0.04 0.08 0.14 0.20" +
      // [E] THE NEXT CYCLE: quill resumes. back to work.
      " 0.24 0.26 0.28 0.30>"
    ),

  // ═══════════════ VOICE 4: TALLY MARKS — she's counting ══════════════
  // hallur_other_build_01, given rhythm through gain pulses.
  // Not musical — bureaucratic. Each pulse is a mark in the margin.
  // She's noticed the loop repeats. She's keeping score.
  s("<hallur_other_build_01 hallur_other_retreat hallur_other_pre_crest hallur_other_build_01>")
    .slow(2)
    .clip(2)
    .loopAt(2)
    .gain(
      // [A] THE BUILDING: no tally — she hasn't started counting
      "<0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00" +
      " 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00" +
      // [B] THE SCRIBE: no tally yet — she's just working
      " 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00" +
      " 0.00 0.00 0.00 0.00" +
      // [C] THE COUNTING: tally marks appear — pulsing, deliberate
      " 0.02 0.10 0.02 0.10 0.02 0.14 0.02 0.14" +
      " 0.02 0.18 0.02 0.18 0.02 0.22 0.02 0.26" +
      // [D] THE WINDOW: tallies stop — she sees something bigger
      " 0.30 0.20 0.10 0.04 0.00 0.00 0.00 0.00" +
      // [E] THE NEXT CYCLE: one final mark. the cycle count.
      " 0.00 0.00 0.14 0.00>"
    ),

  // ═══════════════ VOICE 5: LOOKING UP — light through grime ══════════
  // hallur_other_surface + bright. The window the scribe never noticed.
  // Only appears at [D]. Not transcendence — just awareness.
  // The building hasn't changed. She has.
  s("<hallur_other_surface hallur_other_bright_01>")
    .slow(4)
    .clip(4)
    .loopAt(4)
    .gain(
      // [A] THE BUILDING: no window — or rather, she doesn't look
      "<0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00" +
      " 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00" +
      // [B] THE SCRIBE: no window — working
      " 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00" +
      " 0.00 0.00 0.00 0.00" +
      // [C] THE COUNTING: faintest warmth — peripheral vision
      " 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00" +
      " 0.00 0.00 0.00 0.02 0.04 0.06 0.08 0.12" +
      // [D] THE WINDOW: she looks up. light.
      " 0.20 0.36 0.52 0.64 0.64 0.52 0.36 0.20" +
      // [E] THE NEXT CYCLE: window still there. she'll look again.
      " 0.10 0.06 0.03 0.02>"
    )

)
// ════════════════════════════════════════════════════════════════════════════
// The tithe-keeper's ledger.
//
// The Administratum loops forever. That's the design.
// But one scribe in it has started counting the repetitions.
// She marks tally lines in the margin of a ledger no one reads.
//
// The building hasn't changed. The building never changes.
// The scribe has. The scribe is the only thing in it that can.
//
// One person noticing a loop is the first step to breaking it.
// The tally marks aren't rebellion. They're just attention.
// And attention, inside a machine that expects none,
// is the most dangerous thing there is.
//
// figs gave us a puzzlebox. The puzzle wasn't the loop structure —
// it was what you do when you realize you're inside one.
// ════════════════════════════════════════════════════════════════════════════
