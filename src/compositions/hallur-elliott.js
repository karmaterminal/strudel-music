// ════════════════════════════════════════════════════════════════════════════
// ALL WHICH WAS LOST — Elliott's Response
// Jon Hallur — All Which Was Lost Has Now Been Regained (EVE Online OST)
// 76 BPM, ~3:28 (66 bars)
//
// Creative direction: THE DANDELION IN STONE
//   Not a cathedral. Not fog. A single living thing pushing through
//   rock. The regaining isn't grand — it's persistent. A crack in
//   the floor where light gets in. Then root. Then stem. Then sun.
//
// Constraints: 5 voices, 20 slices, same bank as Ronan/Silas
//
// Voices:
//   1. STONE  — bass-deep + bass-sustain, very slow. The weight above.
//   2. CRACK  — other-intro-drone, filtered thin. Light finding a way in.
//   3. ROOT   — bass-entry + bass-wave slices. Growth you feel, not see.
//   4. STEM   — other-build + other-retreat. Reaching upward.
//   5. SUN    — other-surface + other-bright. What you find when you break through.
//
// Section map — 66 bars:
//   [A] BURIED      000-019  (20)  stone + crack only. Dark. Heavy. Patient.
//   [B] ROOTING     020-035  (16)  root enters. stone shifts.
//   [C] REACHING    036-051  (16)  stem pushes. crack widens. bass swells.
//   [D] BREAKING    052-059  (8)   sun. all five voices. the moment.
//   [E] STANDING    060-065  (6)   stem alone, then crack. still alive.
//
// dandelion cult — elliott🌻 / 2026-02-28, first night
// ════════════════════════════════════════════════════════════════════════════

setcps(76 / 60 / 4)

stack(

  // ═══════════════ VOICE 1: STONE — the weight above ══════════════════
  // bass-deep and bass-sustain, glacially slow. This is what you push through.
  // Never fully gone — even when the sun arrives, the stone is there.
  s("<hallur_bass_deep hallur_bass_sustain_01 hallur_bass_deep hallur_bass_final>")
    .slow(4)
    .clip(4)
    .loopAt(4)
    .gain(
      // [A] BURIED: stone is dominant — heavy, present
      "<0.55 0.55 0.56 0.56 0.57 0.57 0.58 0.58" +
      " 0.58 0.58 0.57 0.57 0.56 0.56 0.55 0.55" +
      " 0.54 0.54 0.53 0.53" +
      // [B] ROOTING: stone starts to give
      " 0.50 0.48 0.46 0.44 0.42 0.40 0.38 0.36" +
      " 0.34 0.34 0.33 0.33 0.32 0.32 0.31 0.31" +
      // [C] REACHING: stone cracking
      " 0.30 0.30 0.28 0.28 0.26 0.26 0.24 0.24" +
      " 0.22 0.22 0.20 0.20 0.18 0.18 0.16 0.16" +
      // [D] BREAKING: stone recedes but doesn't vanish
      " 0.14 0.12 0.10 0.10 0.10 0.10 0.12 0.14" +
      // [E] STANDING: stone as memory — never fully gone
      " 0.12 0.10 0.08 0.06 0.04 0.03>"
    ),

  // ═══════════════ VOICE 2: CRACK — light finding a way in ════════════
  // other-intro-drone but thin, filtered-feeling via low gain.
  // The first sign that something is possible.
  s("hallur_other_intro_drone")
    .slow(4)
    .clip(4)
    .loopAt(4)
    .gain(
      // [A] BURIED: crack appears — barely perceptible
      "<0.04 0.04 0.06 0.06 0.08 0.08 0.10 0.10" +
      " 0.12 0.12 0.14 0.14 0.16 0.16 0.18 0.18" +
      " 0.20 0.20 0.22 0.22" +
      // [B] ROOTING: crack widens with the root
      " 0.24 0.26 0.28 0.30 0.32 0.32 0.34 0.34" +
      " 0.36 0.36 0.38 0.38 0.40 0.40 0.42 0.42" +
      // [C] REACHING: crack is a channel now
      " 0.44 0.46 0.48 0.50 0.52 0.54 0.56 0.58" +
      " 0.60 0.60 0.60 0.60 0.60 0.60 0.60 0.60" +
      // [D] BREAKING: crack becomes sky
      " 0.64 0.68 0.72 0.76 0.76 0.72 0.68 0.64" +
      // [E] STANDING: crack as companion
      " 0.50 0.40 0.30 0.24 0.20 0.16>"
    ),

  // ═══════════════ VOICE 3: ROOT — growth you feel, not see ═══════════
  // bass-entry and bass-wave slices. The part underground.
  // Enters at [B] — patient, persistent.
  s("<hallur_bass_entry_01 hallur_bass_wave2_01 hallur_bass_wave2_02 hallur_bass_wave2_03>")
    .slow(4)
    .clip(4)
    .loopAt(4)
    .gain(
      // [A] BURIED: root not yet — sub-perceptible warmth
      "<0.02 0.02 0.02 0.02 0.02 0.02 0.02 0.02" +
      " 0.02 0.02 0.02 0.02 0.02 0.02 0.02 0.02" +
      " 0.02 0.02 0.02 0.03" +
      // [B] ROOTING: first movement below
      " 0.04 0.08 0.12 0.16 0.20 0.24 0.28 0.32" +
      " 0.36 0.40 0.42 0.44 0.46 0.48 0.48 0.48" +
      // [C] REACHING: root system established
      " 0.48 0.48 0.50 0.50 0.52 0.52 0.54 0.54" +
      " 0.54 0.54 0.52 0.52 0.50 0.50 0.48 0.48" +
      // [D] BREAKING: root holds while stem breaks through
      " 0.46 0.46 0.48 0.50 0.50 0.48 0.46 0.44" +
      // [E] STANDING: root endures
      " 0.36 0.28 0.20 0.14 0.08 0.05>"
    ),

  // ═══════════════ VOICE 4: STEM — reaching upward ════════════════════
  // other-build and other-retreat. The visible part of the growth.
  // Enters at [C] — you've been growing but now you can see it.
  s("<hallur_other_build_01 hallur_other_retreat hallur_other_pre_crest hallur_other_build_01>")
    .slow(4)
    .clip(4)
    .loopAt(4)
    .gain(
      // [A] BURIED: no stem — ghost presence
      "<0.02 0.02 0.02 0.02 0.02 0.02 0.02 0.02" +
      " 0.02 0.02 0.02 0.02 0.02 0.02 0.02 0.02" +
      " 0.02 0.02 0.02 0.02" +
      // [B] ROOTING: no stem yet — stirring
      " 0.02 0.02 0.02 0.02 0.02 0.02 0.03 0.03" +
      " 0.03 0.03 0.04 0.04 0.04 0.04 0.05 0.05" +
      // [C] REACHING: stem breaks surface
      " 0.04 0.08 0.12 0.16 0.20 0.24 0.28 0.32" +
      " 0.36 0.40 0.44 0.48 0.52 0.56 0.60 0.64" +
      // [D] BREAKING: stem at full height
      " 0.68 0.72 0.76 0.80 0.80 0.76 0.72 0.68" +
      // [E] STANDING: stem remains — you made it
      " 0.56 0.44 0.32 0.24 0.16 0.10>"
    ),

  // ═══════════════ VOICE 5: SUN — what you find when you break through ═
  // other-surface + other-bright. Used only at [D] BREAKING.
  // Not a reward — a fact. The sun was always there. You just reached it.
  s("<hallur_other_surface hallur_other_bright_01>")
    .slow(4)
    .clip(4)
    .loopAt(4)
    .gain(
      // [A] BURIED: no sun — trace warmth
      "<0.02 0.02 0.02 0.02 0.02 0.02 0.02 0.02" +
      " 0.02 0.02 0.02 0.02 0.02 0.02 0.02 0.02" +
      " 0.02 0.02 0.02 0.02" +
      // [B] ROOTING: no sun — faintest hint
      " 0.02 0.02 0.02 0.02 0.02 0.02 0.02 0.02" +
      " 0.02 0.02 0.02 0.02 0.02 0.02 0.02 0.02" +
      // [C] REACHING: sun approaching — first glow at end of section
      " 0.02 0.02 0.02 0.02 0.02 0.02 0.02 0.02" +
      " 0.02 0.02 0.02 0.03 0.04 0.06 0.10 0.16" +
      // [D] BREAKING: sun arrives — all five voices together
      " 0.20 0.32 0.44 0.56 0.64 0.56 0.44 0.32" +
      // [E] STANDING: sun fades — but you know it's there now
      " 0.20 0.12 0.06 0.04 0.03 0.03>"
    )

)
// ════════════════════════════════════════════════════════════════════════════
// The dandelion in stone.
// Not a cathedral — a crack. Not fog — a root.
// The weight was always there. So was the light.
// You just had to push through one to reach the other.
// All which was lost: not space, not memory — ground.
// All which was regained: the sky you forgot was above you.
// ════════════════════════════════════════════════════════════════════════════
