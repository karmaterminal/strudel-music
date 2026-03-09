// ============================================================================
// EAMON v2 — One Candle
// ============================================================================
// E minor, 92.3 BPM. Revised: fewer voices, more silence, more truth.
// Stems: Tabernis — Dark Hive (bagpipes + drum, E minor)
//   eamon_pipes    = bagpipes (the flame)
//   eamon_drums    = percussion (the heartbeat)
//   eamon_overtones = bagpipe harmonic bleed (a single breath of shimmer)
//
// v1 was too busy. Three spotlights where one candle was needed.
// v2: maximum 2 voices at any point. Pipes alone for the first 14 bars.
// Drums enter gradually. Overtones appear once, briefly, then leave.
//
// 64 bars ≈ 166 seconds. One candle in a dark room.
// ============================================================================

// --- TEMPO ---
setcpm(92.3 / 4)

// ============================================================================
// Structure (64 bars):
//   Flame alone   (bars  1-14):  Pipes only. Just the candle.
//   Heartbeat     (bars 15-20):  Drums fade in beneath pipes.
//   Together      (bars 21-38):  Pipes + drums, both restrained.
//   Shimmer       (bars 39-42):  Overtones appear (drums step back).
//   Return        (bars 43-56):  Pipes + drums, settling.
//   Ember         (bars 57-64):  Pipes fade to near-silence. The window holds.
// ============================================================================

stack(
  // ========================================================================
  // THE PIPES — the flame. Present the entire time, but breathing.
  // Gain: intimate. Never above 0.4. Rises gently in the middle,
  // returns to a whisper at the end.
  // Panned slightly left (0.43) — the near ear.
  // ========================================================================
  s("eamon_pipes")
    .slow(64)
    .clip(1)
    .gain("<0.28 0.28 0.30 0.30 0.32 0.32 0.33 0.33 0.34 0.34 0.35 0.35 0.36 0.36 0.37 0.37 0.37 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.36 0.36 0.36 0.36 0.38 0.38 0.38 0.38 0.37 0.37 0.37 0.36 0.36 0.35 0.35 0.34 0.34 0.33 0.30 0.28 0.25 0.22 0.20 0.18 0.15 0.12>")
    .pan(0.43),

  // ========================================================================
  // THE DRUMS — the heartbeat. Silent for the first 14 bars.
  // Enters as a whisper at bar 15, rises to modest presence by bar 21.
  // Silent when overtones appear (bars 39-42) — max 2 voices always.
  // Never above 0.23. This is a pulse, not a performance.
  // Centered (0.5).
  // ========================================================================
  s("eamon_drums")
    .slow(64)
    .clip(1)
    .gain("<0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0.08 0.10 0.13 0.15 0.18 0.20 0.20 0.22 0.22 0.22 0.23 0.23 0.23 0.23 0.23 0.23 0.23 0.23 0.23 0.22 0.22 0.22 0.22 0 0 0 0 0.20 0.22 0.22 0.22 0.22 0.22 0.20 0.20 0.18 0.18 0.16 0.14 0.12 0.10 0.08 0.06 0.04 0.02 0 0 0 0>")
    .pan(0.50),

  // ========================================================================
  // THE OVERTONES — one breath of shimmer. Bars 39-42 only.
  // When overtones speak, drums recede. Never more than 2 real voices.
  // Gain 0.12 at peak. Felt, barely heard. Then gone.
  // Panned slightly right (0.57) — the far ear, the room itself.
  // ========================================================================
  s("eamon_overtones")
    .slow(64)
    .clip(1)
    .gain("<0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0.10 0.12 0.08 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0>")
    .pan(0.57)
)
