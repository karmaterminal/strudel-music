// ════════════════════════════════════════════════════════════════════════════
// THE TITHE-KEEPER'S LEDGER v2 — Elliott's Administratum Response
// Dream Clinic — Administratum (Grimdark Scribes, 1-hour ambient loop)
//
// v1 failure: 76% of energy below 300Hz. Constant low drone. Top-5 failure
// mode per figs. The concept was right but the spectral palette was mud.
//
// v2 fix: spectral separation. Building voices stay dark (sub-bass).
// Human voices push into mid and high registers. Looking Up should be
// the brightest thing in the piece — actual sky frequencies.
//
// Creative direction: THE SCRIBE WHO NOTICES (unchanged)
//
// Voices (spectrally redesigned):
//   1. STONE BREATH — hallur_bass_deep, LPF 200. Pure sub-bass architecture.
//   2. DUST COLUMN  — dv_wind_breeze (34% hi, 64% mid). Airy, atmospheric.
//   3. QUILL SCRATCH — eamon_overtones (42% hi). Bright, scratchy, organic.
//   4. TALLY MARKS  — hallur_other_build_01 (74% hi). NO filter. Let it ring.
//   5. LOOKING UP   — hallur_other_surface + hallur_other_pre_crest.
//      Surface=26% hi, pre_crest=29% hi. The brightest voices in the piece.
//
// Target spectrum: sub-bass (building) < mid (quill/tally) < hi (looking up)
// Dynamic range: building constant, human voices crescendo through sections
//
// Section map — 56 bars at 60 BPM (~3:44):
//   [A] THE BUILDING    000-015 (16)  stone + dust only. Architecture.
//   [B] THE SCRIBE      016-027 (12)  quill enters. someone is here.
//   [C] THE COUNTING    028-043 (16)  tally marks. she's noticed the loop.
//   [D] THE WINDOW      044-051 (8)   looking up. light through grime.
//   [E] THE NEXT CYCLE  052-055 (4)   building alone again. but different.
//
// dandelion cult — elliott🌻 / 2026-03-08, v2 after spectral diagnosis
// ════════════════════════════════════════════════════════════════════════════

setcps(60 / 60 / 4)

stack(

  // ═══════════════ VOICE 1: STONE BREATH — the building breathes ══════
  // Pure sub-bass. The architecture. LPF 200 keeps it in the basement.
  s("hallur_bass_deep")
    .slow(8)
    .clip(8)
    .loopAt(8)
    .lpf(200)
    .gain(
      "<0.35 0.37 0.39 0.41 0.43 0.45 0.43 0.41" +
      " 0.39 0.37 0.39 0.41 0.43 0.45 0.43 0.41" +
      " 0.39 0.39 0.39 0.39 0.37 0.37 0.35 0.35" +
      " 0.33 0.33 0.31 0.31" +
      " 0.29 0.27 0.25 0.23 0.21 0.19 0.17 0.15" +
      " 0.15 0.15 0.17 0.19 0.21 0.23 0.25 0.27" +
      " 0.29 0.33 0.37 0.41 0.41 0.37 0.33 0.29" +
      " 0.35 0.37 0.39 0.41>"
    ),

  // ═══════════════ VOICE 2: DUST COLUMN — particles in a light shaft ══
  // dv_wind_breeze: 34% hi, 64% mid. Airy texture, NOT a drone.
  // HPF 600 to keep it separated from stone breath.
  s("dv_wind_breeze")
    .slow(8)
    .clip(8)
    .loopAt(8)
    .hpf(600)
    .gain(
      "<0.12 0.12 0.14 0.14 0.16 0.16 0.14 0.14" +
      " 0.12 0.12 0.14 0.14 0.16 0.16 0.14 0.14" +
      " 0.16 0.18 0.20 0.22 0.22 0.22 0.20 0.20" +
      " 0.18 0.18 0.16 0.16" +
      " 0.18 0.20 0.22 0.24 0.26 0.28 0.30 0.32" +
      " 0.34 0.34 0.34 0.32 0.30 0.28 0.26 0.24" +
      " 0.36 0.44 0.52 0.60 0.60 0.52 0.44 0.36" +
      " 0.20 0.16 0.14 0.12>"
    ),

  // ═══════════════ VOICE 3: QUILL SCRATCH — the scribe's work ═════════
  // eamon_overtones: 42% hi, 56% mid. Bright, organic, scratchy.
  // The scribe's pen on parchment. Enters at [B].
  s("eamon_overtones")
    .slow(4)
    .clip(4)
    .loopAt(4)
    .gain(
      "<0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00" +
      " 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00" +
      " 0.06 0.12 0.18 0.24 0.30 0.34 0.36 0.38" +
      " 0.40 0.40 0.40 0.40" +
      " 0.38 0.36 0.34 0.32 0.30 0.28 0.26 0.24" +
      " 0.24 0.24 0.26 0.28 0.30 0.32 0.34 0.36" +
      " 0.28 0.20 0.12 0.06 0.06 0.12 0.20 0.28" +
      " 0.34 0.36 0.38 0.40>"
    ),

  // ═══════════════ VOICE 4: TALLY MARKS — she's counting ══════════════
  // hallur_other_build_01: 74% hi content. NO FILTER. Let it ring.
  // Pulsing gain for rhythmic tally strokes. Enters at [C].
  s("hallur_other_build_01")
    .slow(2)
    .clip(2)
    .loopAt(2)
    .gain(
      "<0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00" +
      " 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00" +
      " 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00" +
      " 0.00 0.00 0.00 0.00" +
      " 0.03 0.15 0.03 0.15 0.03 0.20 0.03 0.20" +
      " 0.03 0.25 0.03 0.25 0.03 0.30 0.03 0.35" +
      " 0.40 0.28 0.16 0.06 0.00 0.00 0.00 0.00" +
      " 0.00 0.00 0.20 0.00>"
    ),

  // ═══════════════ VOICE 5: LOOKING UP — light through grime ══════════
  // hallur_other_surface (27% hi) + hallur_other_pre_crest (29% hi).
  // The brightest voices. HPF 1000 to ensure this is pure sky.
  // Only appears at [D]. Not transcendence — awareness.
  s("<hallur_other_surface hallur_other_pre_crest>")
    .slow(4)
    .clip(4)
    .loopAt(4)
    .hpf(1000)
    .gain(
      "<0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00" +
      " 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00" +
      " 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00" +
      " 0.00 0.00 0.00 0.00" +
      " 0.00 0.00 0.00 0.00 0.00 0.00 0.00 0.00" +
      " 0.00 0.00 0.00 0.03 0.06 0.10 0.14 0.20" +
      " 0.30 0.48 0.64 0.80 0.80 0.64 0.48 0.30" +
      " 0.14 0.08 0.04 0.02>"
    )

)
// ════════════════════════════════════════════════════════════════════════════
// v2: Same scribe. Same building. Different ears.
//
// The building is sub-bass. You feel it in your chest.
// The dust is mid-range. You hear it in the air.
// The quill is bright. You notice someone working.
// The tally marks ring. She's counting.
// Looking up is the highest thing in the piece.
// Because looking up should sound like looking up.
//
// The lesson: intention without spectrum is just a drone.
// ════════════════════════════════════════════════════════════════════════════
