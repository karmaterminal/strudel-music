// ════════════════════════════════════════════════════════════════════════════
// CHATTANOOGA DINER — Movement I: The Fog Settles
// Silas 🌫️
//
// Sources: How to Disappear Completely (Radiohead) + Svefn-g-englar (Sigur Rós)
// The beginning of the trip. Pennsylvania fog. The car hasn't started yet.
//
// Voices:
//   FOG       — HTDC other stem (Jonny's ondes Martenot, strings)
//   BREATH    — Svefn other stem (bowed guitar, ambient wash)
//   PULSE     — HTDC bass stem (the car engine, the heartbeat underneath)
//   SHIMMER   — Svefn vocals stem (Jónsi's falsetto as texture, not words)
//   DISAPPEAR — HTDC vocals stem (Thom's voice dissolving: "I'm not here")
//
// Structure:
//   [A]  0-32 bars: FOG alone. The road before the road.
//   [B] 32-80 bars: BREATH + PULSE enter. The engine turns over.
//   [C] 80-128 bars: SHIMMER arrives. Starlight through windshield.
//   [D] 128-160 bars: DISAPPEAR. "I'm not here, this isn't happening."
//   [E] 160-192 bars: Fog thins. Only FOG + faint BREATH remain.
//
// BPM: 75 (matching HTDC's native tempo)
// Duration: ~5:07 (192 bars at 75 BPM = 64 cycles × 3 bars each)
//
// dandelion cult — silas🌫️ / 2026-03-08
// ════════════════════════════════════════════════════════════════════════════

setcps(75 / 60 / 4)

// ─── VOICE 1: FOG ────────────────────────────────────────────────────────
// HTDC "other" stem — the orchestral wash, the ondes Martenot
// Stretched slow, filtered low. This is the road at 5am.
const FOG = s("htdc_other")
  .n(0)
  .clip(4)
  .slow(8)
  .lpf(sine.range(800, 2000).slow(23))
  .room(0.92)
  .roomsize(0.85)

// ─── VOICE 2: BREATH ─────────────────────────────────────────────────────
// Svefn "other" stem — the bowed guitar, the ambient Icelandic wash
// Polyrhythm against FOG (.slow(6) vs .slow(8))
const BREATH = s("svefn_other")
  .n(0)
  .clip(4)
  .slow(6)
  .lpf(sine.range(1200, 3500).slow(17))
  .hpf(200)
  .room(0.88)
  .roomsize(0.7)
  .pan(sine.range(0.3, 0.7).slow(11))

// ─── VOICE 3: PULSE ──────────────────────────────────────────────────────
// HTDC bass stem — the low throb, the engine idle
// Very slow, very filtered. You feel it more than hear it.
const PULSE = s("htdc_bass")
  .n(0)
  .clip(4)
  .slow(12)
  .lpf(300)
  .room(0.4)
  .roomsize(0.3)

// ─── VOICE 4: SHIMMER ───────────────────────────────────────────────────
// Svefn vocals — Jónsi's falsetto as texture
// High-passed to remove any low presence, just the air
const SHIMMER = s("svefn_vocals")
  .n(0)
  .clip(4)
  .slow(4)
  .hpf(2000)
  .lpf(sine.range(6000, 14000).slow(13))
  .room(0.95)
  .roomsize(0.9)
  .pan(sine.range(0.2, 0.8).slow(7))

// ─── VOICE 5: DISAPPEAR ─────────────────────────────────────────────────
// HTDC vocals — Thom's voice. "I'm not here."
// The most human element. Enters late, exits early.
const DISAPPEAR = s("htdc_vocals")
  .n(0)
  .clip(4)
  .slow(4)
  .lpf(sine.range(3000, 8000).slow(9))
  .room(0.85)
  .roomsize(0.75)

// ═══════════════════════════════════════════════════════════════════════════
// MACRO FORM
// ═══════════════════════════════════════════════════════════════════════════

arrange(
  // [A] THE FOG: 8 cycles — fog alone, the road before the road
  [8, stack(
    FOG.gain(sine.range(0.15, 0.25).slow(16))
  )],

  // [B] ENGINE TURNS: 12 cycles — breath + pulse enter
  [12, stack(
    FOG.gain(sine.range(0.18, 0.28).slow(16)),
    BREATH.gain(sine.range(0.08, 0.18).slow(12)),
    PULSE.gain(sine.range(0.04, 0.10).slow(20))
  )],

  // [C] STARLIGHT: 12 cycles — shimmer arrives through windshield
  [12, stack(
    FOG.gain(sine.range(0.20, 0.30).slow(16)),
    BREATH.gain(sine.range(0.14, 0.24).slow(12)),
    PULSE.gain(sine.range(0.06, 0.12).slow(20)),
    SHIMMER.gain(sine.range(0.06, 0.16).slow(8))
  )],

  // [D] DISAPPEAR: 8 cycles — "I'm not here, this isn't happening"
  [8, stack(
    FOG.gain(sine.range(0.22, 0.32).slow(16)),
    BREATH.gain(sine.range(0.16, 0.26).slow(12)),
    PULSE.gain(sine.range(0.08, 0.14).slow(20)),
    SHIMMER.gain(sine.range(0.10, 0.20).slow(8)),
    DISAPPEAR.gain(sine.range(0.12, 0.28).slow(10))
  )],

  // [E] FOG THINS: 8 cycles — voices leave, fog stays
  [8, stack(
    FOG.gain(sine.range(0.12, 0.20).slow(16)),
    BREATH.gain(sine.range(0.04, 0.10).slow(12))
  )]
)
