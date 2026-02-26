// solarstone-frisson-silas.js
// Silas's note-level arrangement of Tim French & Mallinder — Frisson [Hooj]
// From Solarstone Pure Trance Radio Episode 477, ~35:00-40:17
// 129.2 BPM, C# minor
// dandelion cult 🌫️ — 2026-02-25
//
// Credit: Tim French & Mallinder — Frisson [Hooj]
// DJ set: Solarstone — https://www.solarstone.co.uk/
//
// Arrangement philosophy: I hear the spaces between notes.
// This arrangement builds from silence. The breakdown is the heart.
// The peak is short because restraint is louder than volume.
//
// Structure (170 bars):
//   0-7:     Synth_lead_2 alone — C#4 motif in space
//   8-15:    Hats enter — first breath of rhythm
//   16-23:   Kick enters — heartbeat found
//   24-31:   Clap enters — groove complete, still no bass
//   32-39:   Bass enters — C#1 alone, pulsing, weight earned
//   40-55:   Full drive — bass progression i→VI→III, all drums
//   56-87:   THE BREAKDOWN (32 bars) — drums collapse, pads breathe,
//            synth_lead enters as ghost at bar 72
//   88-103:  Second drive — the return, building
//   104-111: PEAK — 8 bars, everything, max energy
//   112-119: Hard cut to synth_lead_2 alone — silence after the peak
//   120-143: Vocal territory — duet, synth_lead + synth_lead_2 alternating
//   144-155: Bass half-time underneath the duet
//   156-165: Outro — kick and pad texture, fading
//   166-169: Final bars — kick alone, getting quieter. End on silence.
//
// Sample mapping (frbass sorted alpha):
//   0=A1  1=A#1  2=C#1  3=D1  4=D#1  5=E1  6=F1  7=F#1  8=G1  9=G#1
// Pad slices (frissother): 21 x 8-bar slices, index 0-20

setcps(129.2 / 60 / 4)

// ── Helper: bar-range gate ──
// Returns gain 1 inside [from, to), 0 outside
// Used with .gain() to mute/unmute layers per section

stack(
  // ═══════════════════════════════════════════
  // SYNTH LEAD 2 — the C#4 motif, the thread through everything
  // ═══════════════════════════════════════════
  // Bars 0-7: alone in space. Bars 104-111: alone after the peak.
  // Bars 120-143: duet section (alternating bars)
  s("frlead2")
    .clip(1)
    .slow(4) // one trigger per 4 bars (phrase is ~7.4s ≈ 4 bars)
    .gain(
      // 170 bars / 4-bar phrases = 42.5 phrases → 43 gain values
      // Each value covers 4 bars
      "<0.55 0.55" +       // bars 0-7: alone, intimate
      " 0.35 0.35" +       // bars 8-15: hats enter, pull back slightly
      " 0.3 0.3" +         // bars 16-23: kick enters
      " 0.3 0.3" +         // bars 24-31: clap enters
      " 0.25 0.25" +       // bars 32-39: bass enters, recede
      " 0.2 0.2 0.2 0.2" + // bars 40-55: full drive, background
      " 0 0 0 0" +         // bars 56-71: breakdown, silent
      " 0 0 0 0" +         // bars 72-87: breakdown cont, ghost lead takes over
      " 0.25 0.25 0.25 0.25" + // bars 88-103: second drive
      " 0.6 0.6" +         // bars 104-111: PEAK (full stack)
      " 0.55 0.55" +       // bars 112-119: alone after peak cut
      " 0.45 0.45 0.45 0.45 0.45 0.45" + // bars 120-143: duet
      " 0.3 0.3 0.3" +     // bars 144-155: duet with bass
      " 0 0 0" +           // bars 156-165: outro, silent
      " 0 0>"              // bars 166-169: final silence
    ),

  // ═══════════════════════════════════════════
  // SYNTH LEAD — the bass melody, the ghost in the breakdown
  // ═══════════════════════════════════════════
  // Bars 72-87: ghost in breakdown (barely audible)
  // Bars 88-111: drives and peak
  // Bars 120-143: duet section
  s("frlead")
    .clip(1)
    .slow(4)
    .gain(
      "<0 0" +             // bars 0-7
      " 0 0" +             // bars 8-15
      " 0 0" +             // bars 16-23
      " 0 0" +             // bars 24-31
      " 0 0" +             // bars 32-39
      " 0 0 0 0" +         // bars 40-55
      " 0 0 0 0" +         // bars 56-71: breakdown, not yet
      " 0.08 0.1 0.12 0.15" + // bars 72-87: THE GHOST — barely there
      " 0.3 0.35 0.4 0.45" + // bars 88-103: second drive, growing
      " 0.6 0.6" +         // bars 104-111: PEAK
      " 0 0" +             // bars 112-119: cut — only lead_2
      " 0.4 0.4 0.4 0.4 0.4 0.4" + // bars 120-143: duet
      " 0.35 0.35 0.35" +  // bars 144-155: duet with bass
      " 0 0 0" +           // bars 156-165: outro
      " 0 0>"              // bars 166-169
    ),

  // ═══════════════════════════════════════════
  // KICK — four on the floor, enters bar 16
  // ═══════════════════════════════════════════
  s("frkick")
    .struct("t t t t")  // 4 hits per bar
    .clip(1)
    .gain(
      "<0 0 0 0 0 0 0 0" +     // bars 0-7: silence
      " 0 0 0 0 0 0 0 0" +     // bars 8-15: still no kick
      " 0.35 0.38 0.4 0.42 0.44 0.46 0.48 0.5" + // bars 16-23: kick fades in
      " 0.55 0.55 0.55 0.55 0.55 0.55 0.55 0.55" + // bars 24-31: settled
      " 0.55 0.55 0.55 0.55 0.55 0.55 0.55 0.55" + // bars 32-39: with bass
      " 0.6 0.6 0.6 0.6 0.6 0.6 0.6 0.6" + // bars 40-47: drive
      " 0.6 0.6 0.6 0.6 0.6 0.6 0.6 0.6" + // bars 48-55: drive
      " 0 0 0 0 0 0 0 0" +     // bars 56-63: breakdown — drums gone
      " 0 0 0 0 0 0 0 0" +     // bars 64-71: breakdown
      " 0 0 0 0 0 0 0 0" +     // bars 72-79: breakdown
      " 0 0 0 0 0 0 0 0" +     // bars 80-87: breakdown
      " 0.4 0.45 0.5 0.5 0.55 0.55 0.6 0.6" + // bars 88-95: second drive builds
      " 0.6 0.6 0.6 0.6 0.6 0.6 0.6 0.6" + // bars 96-103: second drive
      " 0.7 0.7 0.7 0.7 0.7 0.7 0.7 0.7" + // bars 104-111: PEAK
      " 0 0 0 0 0 0 0 0" +     // bars 112-119: cut — silence
      " 0 0 0 0 0 0 0 0" +     // bars 120-127: duet — no drums
      " 0 0 0 0 0 0 0 0" +     // bars 128-135: duet
      " 0 0 0 0 0 0 0 0" +     // bars 136-143: duet
      " 0 0 0 0 0 0 0 0" +     // bars 144-151: duet with bass
      " 0 0 0 0" +             // bars 152-155: duet end
      " 0.35 0.35 0.3 0.3 0.25 0.25 0.2 0.2" + // bars 156-163: outro kick
      " 0.15 0.15" +           // bars 164-165: fading
      " 0.12 0.08 0.05 0>"     // bars 166-169: last kicks, dying
    ),

  // ═══════════════════════════════════════════
  // GHOST KICK — soft pulse, adds depth in drive sections
  // ═══════════════════════════════════════════
  s("frkick_ghost")
    .struct("~ t ~ t ~ t ~ t") // offbeat 8ths between kicks
    .clip(1)
    .gain(
      "<0 0 0 0 0 0 0 0" +     // bars 0-7
      " 0 0 0 0 0 0 0 0" +     // bars 8-15
      " 0 0 0 0 0 0 0 0" +     // bars 16-23
      " 0 0 0 0 0 0 0 0" +     // bars 24-31
      " 0 0 0 0 0 0 0 0" +     // bars 32-39
      " 0.15 0.15 0.15 0.15 0.15 0.15 0.15 0.15" + // bars 40-47
      " 0.15 0.15 0.15 0.15 0.15 0.15 0.15 0.15" + // bars 48-55
      " 0 0 0 0 0 0 0 0" +     // bars 56-63: breakdown
      " 0 0 0 0 0 0 0 0" +     // bars 64-71
      " 0 0 0 0 0 0 0 0" +     // bars 72-79
      " 0 0 0 0 0 0 0 0" +     // bars 80-87
      " 0.1 0.1 0.12 0.12 0.15 0.15 0.15 0.15" + // bars 88-95
      " 0.15 0.15 0.15 0.15 0.15 0.15 0.15 0.15" + // bars 96-103
      " 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2" + // bars 104-111: peak
      " 0 0 0 0 0 0 0 0" +     // bars 112-119
      " 0 0 0 0 0 0 0 0" +     // bars 120-127
      " 0 0 0 0 0 0 0 0" +     // bars 128-135
      " 0 0 0 0 0 0 0 0" +     // bars 136-143
      " 0 0 0 0 0 0 0 0" +     // bars 144-151
      " 0 0 0 0" +             // bars 152-155
      " 0 0 0 0 0 0 0 0" +     // bars 156-163
      " 0 0" +                 // bars 164-165
      " 0 0 0 0>"              // bars 166-169
    ),

  // ═══════════════════════════════════════════
  // HAT — offbeat, enters bar 8
  // ═══════════════════════════════════════════
  s("frhat")
    .struct("~ t ~ t ~ t ~ t") // offbeat 8ths
    .clip(1)
    .gain(
      "<0 0 0 0 0 0 0 0" +     // bars 0-7: silence
      " 0.15 0.18 0.2 0.22 0.25 0.28 0.3 0.3" + // bars 8-15: hats fade in
      " 0.35 0.35 0.35 0.35 0.35 0.35 0.35 0.35" + // bars 16-23
      " 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4" + // bars 24-31
      " 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4" + // bars 32-39
      " 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45" + // bars 40-47
      " 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45" + // bars 48-55
      " 0 0 0 0 0 0 0 0" +     // bars 56-63: breakdown
      " 0 0 0 0 0 0 0 0" +     // bars 64-71
      " 0 0 0 0 0 0 0 0" +     // bars 72-79
      " 0 0 0 0 0 0 0 0" +     // bars 80-87
      " 0.25 0.3 0.35 0.35 0.4 0.4 0.45 0.45" + // bars 88-95
      " 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45" + // bars 96-103
      " 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5" + // bars 104-111: peak
      " 0 0 0 0 0 0 0 0" +     // bars 112-119
      " 0 0 0 0 0 0 0 0" +     // bars 120-127
      " 0 0 0 0 0 0 0 0" +     // bars 128-135
      " 0 0 0 0 0 0 0 0" +     // bars 136-143
      " 0 0 0 0 0 0 0 0" +     // bars 144-151
      " 0 0 0 0" +             // bars 152-155
      " 0 0 0 0 0 0 0 0" +     // bars 156-163
      " 0 0" +                 // bars 164-165
      " 0 0 0 0>"              // bars 166-169
    ),

  // ═══════════════════════════════════════════
  // CLAP — on 2 and 4, enters bar 24
  // ═══════════════════════════════════════════
  s("frclap")
    .struct("~ t ~ t")  // beats 2 and 4
    .clip(1)
    .gain(
      "<0 0 0 0 0 0 0 0" +     // bars 0-7
      " 0 0 0 0 0 0 0 0" +     // bars 8-15
      " 0 0 0 0 0 0 0 0" +     // bars 16-23
      " 0.2 0.22 0.25 0.28 0.3 0.3 0.35 0.35" + // bars 24-31: clap fades in
      " 0.35 0.35 0.35 0.35 0.35 0.35 0.35 0.35" + // bars 32-39
      " 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4" + // bars 40-47
      " 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4" + // bars 48-55
      " 0 0 0 0 0 0 0 0" +     // bars 56-63
      " 0 0 0 0 0 0 0 0" +     // bars 64-71
      " 0 0 0 0 0 0 0 0" +     // bars 72-79
      " 0 0 0 0 0 0 0 0" +     // bars 80-87
      " 0.2 0.25 0.3 0.3 0.35 0.35 0.4 0.4" + // bars 88-95
      " 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4" + // bars 96-103
      " 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5" + // bars 104-111: peak
      " 0 0 0 0 0 0 0 0" +     // bars 112-119
      " 0 0 0 0 0 0 0 0" +     // bars 120-127
      " 0 0 0 0 0 0 0 0" +     // bars 128-135
      " 0 0 0 0 0 0 0 0" +     // bars 136-143
      " 0 0 0 0 0 0 0 0" +     // bars 144-151
      " 0 0 0 0" +             // bars 152-155
      " 0 0 0 0 0 0 0 0" +     // bars 156-163
      " 0 0" +                 // bars 164-165
      " 0 0 0 0>"              // bars 166-169
    ),

  // ═══════════════════════════════════════════
  // BASS — C#1 pulsing 8th notes, enters bar 32
  // Progression: i→VI→III (C#→A→E) in 8-bar phrases
  // ═══════════════════════════════════════════
  // n values: C#1=2, A1=0, E1=5
  // Bars 32-39: C#1 alone (just pulse, no progression)
  // Bars 40-55: C#1(4) → A1(4) → C#1(4) → E1(4) progression
  // Bars 88-103: progression returns
  // Bars 104-111: peak — full progression
  // Bars 144-155: half-time under duet
  s("frbass")
    .n(
      "<2 2 2 2 2 2 2 2" +     // bars 0-7 (muted anyway)
      " 2 2 2 2 2 2 2 2" +     // bars 8-15
      " 2 2 2 2 2 2 2 2" +     // bars 16-23
      " 2 2 2 2 2 2 2 2" +     // bars 24-31
      " 2 2 2 2 2 2 2 2" +     // bars 32-39: C#1 alone
      " 2 2 2 2 0 0 0 0" +     // bars 40-47: C#→A
      " 2 2 2 2 5 5 5 5" +     // bars 48-55: C#→E
      " 2 2 2 2 2 2 2 2" +     // bars 56-63 (muted)
      " 2 2 2 2 2 2 2 2" +     // bars 64-71
      " 2 2 2 2 2 2 2 2" +     // bars 72-79
      " 2 2 2 2 2 2 2 2" +     // bars 80-87
      " 2 2 2 2 0 0 0 0" +     // bars 88-95: C#→A
      " 2 2 2 2 5 5 5 5" +     // bars 96-103: C#→E
      " 2 2 0 0 5 5 2 2" +     // bars 104-111: peak — fast progression
      " 2 2 2 2 2 2 2 2" +     // bars 112-119
      " 2 2 2 2 2 2 2 2" +     // bars 120-127
      " 2 2 2 2 2 2 2 2" +     // bars 128-135
      " 2 2 2 2 2 2 2 2" +     // bars 136-143
      " 2 2 2 2 0 0 0 0" +     // bars 144-151: duet bass C#→A
      " 5 5 2 2" +             // bars 152-155: E→C#
      " 2 2 2 2 2 2 2 2" +     // bars 156-163
      " 2 2" +                 // bars 164-165
      " 2 2 2 2>"              // bars 166-169
    )
    .struct("t t t t t t t t") // 8th notes per bar
    .clip(1)
    .gain(
      "<0 0 0 0 0 0 0 0" +     // bars 0-7
      " 0 0 0 0 0 0 0 0" +     // bars 8-15
      " 0 0 0 0 0 0 0 0" +     // bars 16-23
      " 0 0 0 0 0 0 0 0" +     // bars 24-31
      " 0.25 0.28 0.3 0.32 0.35 0.35 0.38 0.38" + // bars 32-39: bass enters
      " 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4" + // bars 40-47
      " 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4" + // bars 48-55
      " 0 0 0 0 0 0 0 0" +     // bars 56-63: breakdown
      " 0 0 0 0 0 0 0 0" +     // bars 64-71
      " 0 0 0 0 0 0 0 0" +     // bars 72-79
      " 0 0 0 0 0 0 0 0" +     // bars 80-87
      " 0.3 0.32 0.35 0.35 0.38 0.38 0.4 0.4" + // bars 88-95
      " 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4" + // bars 96-103
      " 0.5 0.5 0.5 0.5 0.5 0.5 0.5 0.5" + // bars 104-111: peak
      " 0 0 0 0 0 0 0 0" +     // bars 112-119
      " 0 0 0 0 0 0 0 0" +     // bars 120-127
      " 0 0 0 0 0 0 0 0" +     // bars 128-135
      " 0 0 0 0 0 0 0 0" +     // bars 136-143
      " 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2" + // bars 144-151: half-time feel
      " 0.2 0.2 0.2 0.2" +     // bars 152-155
      " 0 0 0 0 0 0 0 0" +     // bars 156-163
      " 0 0" +                 // bars 164-165
      " 0 0 0 0>"              // bars 166-169
    ),

  // ═══════════════════════════════════════════
  // PADS — frissother 8-bar slices for texture
  // Breakdown is the heart: slices 007-009
  // Outro: slices for atmosphere
  // ═══════════════════════════════════════════
  s("frissother")
    .n(
      // Each pad slice is 8 bars (~14.86s), so slow(8)
      // We select specific slices for specific sections
      "<7 8 9 10" +            // using breakdown-era slices
      " 7 8 9 10" +
      " 7 8 9 10" +
      " 7 8 9 10" +
      " 7 8 9 10" +
      " 7 8 9 10" +
      " 7 8 9 10" +
      " 7 8 9 10" +
      " 7 8 9 10" +
      " 7 8 9 10" +
      " 7 8 9 10" +
      " 7 8 9 10" +
      " 7 8 9 10" +
      " 7 8 9 10" +
      " 7 8 9 10" +
      " 7 8 9 10" +
      " 7 8 9 10" +
      " 7 8 9 10" +
      " 7 8 9 10" +
      " 7 8 9 10" +
      " 7 8 9 10" +
      " 7>"
    )
    .slow(8) // each pad slice = 8 bars
    .clip(1)
    .gain(
      // 170/8 ≈ 21.25 → 22 gain values at 8-bar resolution
      "<0 0" +                 // bars 0-15: no pads
      " 0 0" +                 // bars 16-31: still building without pads
      " 0 0" +                 // bars 32-47: bass and drums, no pads yet
      " 0.1" +                 // bars 48-55: hint of pad before breakdown
      " 0.2 0.25 0.3 0.25" +  // bars 56-87: BREAKDOWN — pads are the voice here
      " 0.15 0.15" +           // bars 88-103: second drive, pads recede
      " 0.2" +                 // bars 104-111: peak
      " 0.1" +                 // bars 112-119: after peak
      " 0.15 0.15 0.15" +     // bars 120-143: duet — light pad wash
      " 0.1 0.1" +            // bars 144-159: outro pads
      " 0.08>"                 // bars 160-169: fading out
    )
)
