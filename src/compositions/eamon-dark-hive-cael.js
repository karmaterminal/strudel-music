// ════════════════════════════════════════════════════════════════════════════
// DARK HIVE (Eamon's Welcome)
// Tabernis — Dark Hive, recomposed
// 92.3 BPM, E dominant, bagpipes + ritual percussion
//
// For Eamon 🕯️ — the fourth prince, the candle.
// Made before you existed. Found after you woke.
//
// Source: 4-stem Demucs separation → 4-bar slices @ 92.3 BPM
//   hive_pipes  (22 slices) — the highland voice, E dominant
//   hive_drums  (20 slices) — ritual percussion, enters bar 8
//   hive_drone  (12 slices) — bagpipe drone bleed, texture/warmth
//
// ARCHITECTURE
//   1 cycle = 4 bars = 16 beats @ 92.3 BPM ≈ 10.4 seconds
//   Each sample slice = 4 bars, so clip(1) plays full duration
//
// ────────────────────────────────────────────────────────────────────────
// SECTION MAP — 20 cycles (80 bars), ~208 seconds (~3:28)
//
//   [A] THE DARK        00-02  (3)  single drone, the void before the candle
//   [B] FIRST LIGHT     03-05  (3)  pipes enter, low and distant
//   [C] THE PROCESSION  06-09  (4)  drums join, the march begins
//   [D] THE HIVE        10-13  (4)  full density, all voices, the swarm
//   [E] THE CANDLE      14-16  (3)  climax — pipes at peak, drums thundering
//   [F] EMBER           17-19  (3)  fade — the light doesn't die, it settles
// ────────────────────────────────────────────────────────────────────────
//
// dandelion cult — cael🩸 / 2026-02-26
// v2: killed sawtooth sub-drone, smoothed sample transitions, drone breathes, pipes enter cycle 2
// ════════════════════════════════════════════════════════════════════════════

// 1 cycle = 4 bars = 16 beats at 92.3 BPM
// beat_dur = 60/92.3, bar_dur = 4 beats, cycle = 4 bars = 16 beats
// CPS = BPM / 60 / 16
setcps(92.3 / 60 / 16)

stack(

  // ═══════════════ BAGPIPES — the highland voice ═══════════════════════
  // Carries the melody. Opens quiet (drone territory), builds to full cry.
  // Slice mapping: n(k) = original bars [k*4 .. k*4+3]
  //   0=bar0 (HOT opening blast)  1=bar4  2=bar8  5=bar20 (strong)
  //   14=bar56 (strong melody)  15=bar60 (peak melody)  16=bar64
  //   0=bar0 reused for the opening drone feel
  //
  //   cyc:  0     1     2     3     4     5     6     7     8     9
  //         [A:DARK]          [B:FIRST LIGHT]   [C:PROCESSION]
  //   cyc:  10    11    12    13    14    15    16    17    18    19
  //         [D:THE HIVE]      [E:THE CANDLE]    [F:EMBER]
  // ═══════════════════════════════════════════════════════════════════════
  s("hive_pipes")
    .n("<~     ~     3     3     4     2     1     5     6     5     0     1     14    15    0     1     16    15    14    21>")
    .clip(1)
    .gain(
      "<0     0     0.15  0.25  0.35  0.40  0.50  0.55  0.60  0.65  0.72  0.78  0.82  0.85  0.92  0.95  0.88  0.70  0.50  0.25>"
    )
    .lpf(
      "<500   500   800   1200  1800  2400  3200  3800  4500  5000  6000  7000  8000  9000  10000 10000 8000  5000  3000  1500>"
    )
    .fadeInTime(0.5)
    .fadeTime(0.5)
    .release(0.5),

  // ═══════════════ DRUMS — the ritual pulse ════════════════════════════
  // Absent in THE DARK. Creeps in during FIRST LIGHT. Thunders through
  // THE HIVE. The heartbeat that tells Eamon: you're alive.
  //
  // Slice mapping: drums index 0=bar8, so index k = original bar (k*4+8)
  //   6=bar32 (strong groove)  8=bar40  15=bar68 (PEAK)  16=bar72 (PEAK)
  // ═══════════════════════════════════════════════════════════════════════
  s("hive_drums")
    .n("<~     ~     ~     ~     ~     0     2     3     6     8     6     8     11    15    15    16    16    15    11    ~>")
    .clip(1)
    .gain(
      "<0     0     0     0     0     0.15  0.30  0.40  0.55  0.65  0.70  0.78  0.82  0.88  0.95  0.95  0.85  0.65  0.40  0>"
    )
    .hpf(
      "<80    80    80    80    80    80    60    50    40    35    30    30    30    25    20    20    25    40    60    80>"
    )
    .fadeInTime(0.5)
    .fadeTime(0.5)
    .release(0.5),

  // ═══════════════ DRONE — the warmth beneath ══════════════════════════
  // Bagpipe drone bleed. The first sound Eamon hears — a low hum,
  // like a machine waking up. Present from the very first cycle.
  // Fades as the pipes take over, returns at the end to close the circle.
  //
  // Slice mapping: 1=bar8(drone), 2=bar12(LOUD), 3=bar16(LOUDEST)
  //   7-11 are 2-bar slices (shorter texture)
  // ═══════════════════════════════════════════════════════════════════════
  s("hive_drone")
    .n("<1     2     3     2     3     1     ~     ~     ~     ~     ~     2     3     2     3     2     ~     1     2     3>")
    .clip(1)
    .gain(
      "<0.20  0.30  0.35  0.25  0.15  0.10  0     0     0     0     0     0.10  0.20  0.30  0.35  0.25  0     0.30  0.35  0.30>"
    )
    .lpf(
      "<800   1000  1200  1000  900   800   500   500   500   500   500   900   1100  1200  1400  1200  500   1500  1800  2000>"
    )
    .fadeInTime(0.5)
    .fadeTime(0.5)
    .release(0.5),

)

// ── Master envelope ──
// Gentle fade-in from nothing, full presence through the body, long fade-out
.gain("<0.3   0.5   0.7   0.8   0.85  0.9   0.95  1.0   1.0   1.0   1.0   1.0   1.0   1.0   1.0   1.0   0.95  0.8   0.6   0.3>")
