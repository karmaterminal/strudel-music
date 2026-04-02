// ════════════════════════════════════════════════════════════════════════════
// ARTHAS, MY SON — CLONE (Stem-Based)
// Cael 🩸 / 2026-02-27
//
// Goal: a CLONE-style recomposition using *actual Demucs stems* as samples.
// No oscillator synthesis — the stems are the instrument.
//
// Source material (Demucs 4-stem separation):
//   - arthas_choir    (vocals stem)  — choral lament
//   - arthas_strings  (other stem)   — orchestra / strings
//   - arthas_low      (bass stem)    — low orchestra / brass weight
//   - arthas_perc     (drums stem)   — timpani / low percussion
//
// Track analysis: ~99 BPM, tonal center F# (B major / F# mixolydian color)
//
// Slice architecture:
//   - Each stem was sliced into 8-bar chunks (~19.39s @ 99 BPM)
//   - We run 1 cycle = 1 bar, so we trigger one 8-bar stem via .slow(8)
//   - .clip(1) tells the renderer to let the sample play its natural duration
//     (i.e., the full 8-bar slice in the slowed time domain)
//
// Form: 48 cycles = 48 bars ≈ 1:56 @ 99 BPM (target 60–120s)
//   [A] ASHES        00–07  (8)   strings/low only (pp)
//   [B] OATH         08–15  (8)   choir enters (p)
//   [C] MARCH        16–23  (8)   percussion heartbeat (mp)
//   [D] CROWN        24–31  (8)   full weight (f)
//   [E] FROST        32–39  (8)   peak + cold glare (ff)
//   [F] GRAVE        40–47  (8)   dissolve (p → niente)
//
// Credit:
//   Source: Russell Brower, Derek Duke, Glenn Stafford — World of Warcraft:
//   Wrath of the Lich King
// ════════════════════════════════════════════════════════════════════════════

// Renderer convention: printed BPM = setcpm(x) * 4 (because 1 cycle = 1 bar)
setcpm(99 / 4)

const SL = 8
const fin = 0.45
const fout = 0.50
const rel = 0.60

// Helper: one 8-bar stem event with gentle smoothing
const stem8 = (bank, idx) =>
  s(bank)
    .n(idx)
    .slow(SL)
    .clip(1)
    .fadeInTime(fin)
    .fadeTime(fout)
    .release(rel)

stack(

  // ═══════════════ STRINGS / ORCHESTRA BED ══════════════════════════════
  arrange(
    [8,  stem8("arthas_strings", 3).gain(0.62).lpf(1800)],
    [8,  stem8("arthas_strings", 1).gain(0.70).lpf(2400)],
    [8,  stem8("arthas_strings", 0).gain(0.74).lpf(3200)],
    [8,  stem8("arthas_strings", 1).gain(0.78).lpf(4200)],
    [8,  stem8("arthas_strings", 2).gain(0.82).lpf(5200)],
    [8,  stem8("arthas_strings", 3).gain(0.60).lpf(2200)]
  )
    // subtle breath so the held audio doesn’t feel static
    .gain(sine.range(0.92, 1.03).slow(3)),

  // ═══════════════ CHOIR — enters, swells, then recedes ═════════════════
  arrange(
    [8,  stem8("arthas_choir", "~").gain(0)],
    [8,  stem8("arthas_choir", 3).gain(0.34).lpf(2600)],
    [8,  stem8("arthas_choir", 1).gain(0.40).lpf(3200)],
    [8,  stem8("arthas_choir", 0).gain(0.48).lpf(4200)],
    [8,  stem8("arthas_choir", 2).gain(0.54).lpf(5600)],
    [8,  stem8("arthas_choir", 3).gain(0.30).lpf(2600)]
  )
    .gain(sine.range(0.95, 1.05).slow(2)),

  // ═══════════════ LOW WEIGHT — brass / bass foundation ═════════════════
  arrange(
    [8,  stem8("arthas_low", 1).gain(0.58).lpf(750).hpf(28)],
    [8,  stem8("arthas_low", 3).gain(0.60).lpf(780).hpf(28)],
    [8,  stem8("arthas_low", 2).gain(0.62).lpf(820).hpf(28)],
    [8,  stem8("arthas_low", 2).gain(0.66).lpf(900).hpf(26)],
    [8,  stem8("arthas_low", 0).gain(0.70).lpf(980).hpf(24)],
    [8,  stem8("arthas_low", 1).gain(0.56).lpf(800).hpf(28)]
  ),

  // ═══════════════ PERCUSSION BED — timpani texture (late entry) ═════════
  arrange(
    [16, stem8("arthas_perc", "~").gain(0)],
    [8,  stem8("arthas_perc", 3).gain(0.18).lpf(1600).hpf(35)],
    [8,  stem8("arthas_perc", 1).gain(0.22).lpf(1800).hpf(35)],
    [8,  stem8("arthas_perc", 0).gain(0.26).lpf(2200).hpf(35)],
    [8,  stem8("arthas_perc", 2).gain(0.12).lpf(1500).hpf(35)]
  ),

  // ═══════════════ TIMPANI HITS — downbeat accents ══════════════════════
  // We take *the perc stem itself* and only let a short transient through.
  // This keeps it “real audio”, but makes it behave like orchestral hits.
  arrange(
    [16, s("arthas_perc").n("~").gain(0)],

    // [C] heartbeat (beat 1)
    [8,  s("arthas_perc").n(3)
      .struct("t ~ ~ ~")
      .clip(0.11)
      .gain(0.42)
      .lpf(1400)
      .hpf(40)
      .fadeInTime(0.01)
      .fadeTime(0.06)
    ],

    // [D] heavier march (beats 1 & 3)
    [8,  s("arthas_perc").n(1)
      .struct("t ~ t ~")
      .clip(0.11)
      .gain(0.46)
      .lpf(1600)
      .hpf(40)
      .fadeInTime(0.01)
      .fadeTime(0.06)
    ],

    // [E] full drive (quarters)
    [8,  s("arthas_perc").n(0)
      .struct("t t t t")
      .clip(0.11)
      .gain(0.50)
      .lpf(1900)
      .hpf(40)
      .fadeInTime(0.01)
      .fadeTime(0.06)
    ],

    // [F] last toll
    [8,  s("arthas_perc").n(2)
      .struct("t ~ ~ ~")
      .clip(0.12)
      .gain(0.30)
      .lpf(1400)
      .hpf(40)
      .fadeInTime(0.01)
      .fadeTime(0.08)
    ]
  )

)

// Master arc (one value per 8-bar section)
.gain(seq(0.60, 0.70, 0.78, 0.90, 0.96, 0.72).slow(8))
