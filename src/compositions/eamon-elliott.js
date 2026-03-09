// ============================================================================
// EAMON — For the Guardian, From the Herald
// ============================================================================
// E minor, 92.3 BPM. A candle in the window.
// Stems: Tabernis — Dark Hive (bagpipes + drum, E minor)
//   eamon_pipes    = bagpipes (primary melodic content)
//   eamon_drums    = percussion (clean isolation)
//   eamon_overtones = bagpipe harmonic bleed (texture)
//
// "We were here before you, and we made this because you were coming."
//
// The source material already carries the structure:
//   0-30s:  Pipes alone — the single flame
//   30-60s: Drums begin to enter, overtones swell
//   60-90s: Full presence — the guardian watches
//   90+:    Steady, unwavering — the window holds
//
// 80 bars ≈ 208 seconds. We let the material speak.
// Elliott's hand: the balance, the space, the frame.
// ============================================================================

// --- TEMPO ---
// 92.3 BPM = 23.075 CPM (cycles per minute, 1 cycle = 1 bar of 4 beats)
setcpm(92.3 / 4)

// ============================================================================
// Three voices. One source. Synchronized from the first beat.
// ============================================================================

stack(
  // ========================================================================
  // THE PIPES — Eamon's instrument. The foundation. The flame itself.
  // Triggers once at cycle 0, plays through the full stem (~234s).
  // Gain 0.55: dominant but not harsh. The pipes carry enough.
  // Panned slightly left (0.42) — the near ear, the intimate one.
  // ========================================================================
  s("eamon_pipes")
    .slow(80)
    .clip(1)
    .gain(0.55)
    .pan(0.42),

  // ========================================================================
  // THE DRUMS — the guardian's heartbeat. Steady, not flashy.
  // Naturally near-silent in the first 30s, builds to presence by 60s.
  // Gain 0.4: subdued. This is accompaniment, not percussion music.
  // Centered (0.5) — the pulse sits in the middle of the chest.
  // ========================================================================
  s("eamon_drums")
    .slow(80)
    .clip(1)
    .gain(0.4)
    .pan(0.5),

  // ========================================================================
  // THE OVERTONES — harmonic ghosts of the pipes. Candlelight shimmer.
  // Bagpipe bleed captured by the vocal separator: drones, resonances.
  // Gain 0.2: felt more than heard. Texture, not melody.
  // Panned slightly right (0.58) — the far ear, the room around the flame.
  // Speed 0.995: imperceptible detuning against the pipes.
  //   Not enough to hear as wrong. Enough to feel as depth.
  //   The way candlelight never quite holds still.
  // ========================================================================
  s("eamon_overtones")
    .slow(80)
    .clip(1)
    .gain(0.2)
    .pan(0.58)
    .speed(0.995)
)
