// ════════════════════════════════════════════════════════════════════════════
// LONG JOURNEY HOME — CLONE
// Cael 🩸 / 2026-02-27
//
// Credit: Bedquilt Ramblers & Ben Babbitt — "Long Journey Home"
// From the Kentucky Route Zero OST
//
// A gift from figs. Appalachian folk — guitar and voice, nothing more.
// "Black smoke's a-rising and it surely is a train"
//
// 70 BPM, Eb major. 4-bar phrase slices (~13.71s each).
// 15 phrases × 2 stems (vocals, guitar). Total: 58 bars (~199s).
//
// Structure (from bar-level RMS analysis):
//   Phrase 00-01  (bars 00-07):  Guitar intro — voice silent
//   Phrase 02-05  (bars 08-23):  Verse 1 — voice enters
//   Phrase 06-07  (bars 24-31):  Guitar interlude
//   Phrase 08-09  (bars 32-39):  Verse 2
//   Phrase 10-11  (bars 40-47):  Guitar interlude
//   Phrase 12-13  (bars 48-55):  Verse 3
//   Phrase 14     (bars 56-59):  Tail / fade
//
// dandelion cult 🌻🌫️🩸
// ════════════════════════════════════════════════════════════════════════════

// 1 cycle = 1 bar at 70 BPM
setcpm(70 / 4)

// Each phrase = 4 bars, so .slow(4) stretches one trigger across a full phrase
const SL = 4

// Stem helper: play one 4-bar phrase slice
const phrase = (bank, idx) =>
  s(bank)
    .n(idx)
    .slow(SL)
    .clip(1)

stack(

  // ═══════════════ GUITAR (other stem) ══════════════════════════════════
  // Plays continuously through the entire song
  arrange(
    [4,  phrase("ljh_other", 0).gain(0.82)],
    [4,  phrase("ljh_other", 1).gain(0.85)],
    [4,  phrase("ljh_other", 2).gain(0.80)],
    [4,  phrase("ljh_other", 3).gain(0.80)],
    [4,  phrase("ljh_other", 4).gain(0.78)],
    [4,  phrase("ljh_other", 5).gain(0.78)],
    [4,  phrase("ljh_other", 6).gain(0.82)],
    [4,  phrase("ljh_other", 7).gain(0.85)],
    [4,  phrase("ljh_other", 8).gain(0.78)],
    [4,  phrase("ljh_other", 9).gain(0.82)],
    [4,  phrase("ljh_other", 10).gain(0.85)],
    [4,  phrase("ljh_other", 11).gain(0.85)],
    [4,  phrase("ljh_other", 12).gain(0.80)],
    [4,  phrase("ljh_other", 13).gain(0.80)],
    [4,  phrase("ljh_other", 14).gain(0.70)]
  ),

  // ═══════════════ VOCALS ═══════════════════════════════════════════════
  // Silent during intro and interludes, present during verses
  arrange(
    [8,  phrase("ljh_vocals", "~").gain(0)],
    [4,  phrase("ljh_vocals", 2).gain(0.85)],
    [4,  phrase("ljh_vocals", 3).gain(0.85)],
    [4,  phrase("ljh_vocals", 4).gain(0.85)],
    [4,  phrase("ljh_vocals", 5).gain(0.88)],
    [8,  phrase("ljh_vocals", "~").gain(0)],
    [4,  phrase("ljh_vocals", 8).gain(0.85)],
    [4,  phrase("ljh_vocals", 9).gain(0.85)],
    [8,  phrase("ljh_vocals", "~").gain(0)],
    [4,  phrase("ljh_vocals", 12).gain(0.85)],
    [4,  phrase("ljh_vocals", 13).gain(0.88)],
    [4,  phrase("ljh_vocals", 14).gain(0.60)]
  )

)
