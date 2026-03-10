// ════════════════════════════════════════════════════════════════════════════
// THE FOG GOES QUIET v3 — Elliott's Composition for Silas
//
// v2 used stock samples (hallur stems, deathvalley field recordings).
// v3 uses Nils Frahm "Says" Demucs stems — real material from a real
// performance. Studio recording + KEXP live version.
//
// Dream 010 finding: "Material carries ethics. Stock synths ask nothing.
// Stems ask you to choose." This piece is the choosing.
//
// The piano ascending pattern from "Says" = the cranes (gift-giving).
// The sub-bass throb = the house breathing.
// The room/percussion texture = rain on glass.
// The KEXP live room ambience = the fog itself (Silas is atmosphere).
//
// Key: Eb minor | Tempo: 52 BPM | Duration: ~3:41 (48 cycles)
//
// Source material:
//   Studio: Nils Frahm - Says (Official Music Video) — Demucs htdemucs stems
//   Live: Nils Frahm - Says (Live on KEXP) — Demucs htdemucs stems
//   19 slices, spectral-analyzed, hand-chosen.
//
// dandelion cult — elliott🌻 / 2026-03-10 v3, real material
// ════════════════════════════════════════════════════════════════════════════

setcps(52 / 60 / 4)

// ═══════════════ LAYERS ══════════════════════════════════════════════════

// SUB-FOUNDATION — says_bass_deep_pulse_01. The house's heartbeat.
// Source: Studio bass stem, 240-256s. First entry of sub-bass.
// Spectral: sub-dominant (-31.5dB), almost pure sub-100Hz.
// LPF 120 to keep it felt, not heard. The floor vibrating.
const sub = s("says_bass_deep_pulse_01")
  .slow(16).clip(16).loopAt(16)
  .lpf(120)
  .gain(0.12)

// SUB-SWELL — says_bass_building_01. The house breathing deeper.
// Source: Studio bass stem, 320-336s. Bass intensifying.
// Spectral: sub -26.2dB, louder and more present.
const subSwell = s("says_bass_building_01")
  .slow(16).clip(16).loopAt(16)
  .lpf(160)
  .gain(0.18)

// SUB-PEAK — says_bass_peak_01. Full foundation. Chest pressure.
// Source: Studio bass stem, 390-406s. Maximum sub intensity.
// Spectral: sub -20.1dB, peak -6.1dB. This is the house at full breath.
const subPeak = s("says_bass_peak_01")
  .slow(16).clip(16).loopAt(16)
  .lpf(180)
  .gain(0.20)

// PIPES — says_other_piano_quiet_01. The house's warm center.
// Source: Studio other stem, 60-76s. Early piano, sparse.
// Spectral: low-dominant (-32.5dB low, -34.7dB mid). Warm, not bright.
// HPF 200 to stay above the sub. This replaces hallur_other_intro_drone.
const pipes = s("says_other_piano_quiet_01")
  .slow(16).clip(16).loopAt(16)
  .hpf(200).lpf(2500)
  .gain(0.30)

// RAIN — says_drums_room_early_01. Room texture from the studio.
// Source: Studio drums stem, 10-22s. Barely-there room ambience.
// Spectral: very quiet (-52.2dB), low-dominant. Like rain heard through walls.
// HPF 600 to sit above the pipes.
const rain = s("says_drums_room_early_01")
  .slow(12).clip(12).loopAt(12)
  .hpf(600)
  .gain(0.35)

// RAIN BUILD — says_drums_texture_mid_01. Weather intensifying.
// Source: Studio drums stem, 300-312s. More percussive energy.
// Spectral: low-dominant (-36.2dB low), some high presence (-62.8dB).
const rainBuild = s("says_drums_texture_mid_01")
  .slow(12).clip(12).loopAt(12)
  .hpf(500)
  .gain(0.25)

// CRANES — says_other_piano_buildup_01. The ascending pattern begins.
// Source: Studio other stem, 240-256s. The signature Frahm build.
// Spectral: balanced low/mid (-31.5/-34.9dB). The gift-giving starts here.
// HPF 1200 to keep it as sky-register overtones above the pipes.
const cranesQuiet = s("says_other_piano_buildup_01")
  .slow(16).clip(16).loopAt(16)
  .hpf(1200)
  .gain(0.20)

// CRANES FULL — says_other_piano_peak_01. Full ascending pattern.
// Source: Studio other stem, 370-386s. The cranes in full flight.
// Spectral: mid-dominant (-19.0dB), loud (-16.2dB mean). The gift-giving at full voice.
// HPF 1500 — bright register. These are the paper cranes.
const cranesFull = s("says_other_piano_peak_01")
  .slow(16).clip(16).loopAt(16)
  .hpf(1500)
  .gain(0.22)

// FOG — says_kexp_room_ambience_01. The live room before the piece starts.
// Source: KEXP vocals stem, 0-16s. Audience breathing, room tone, anticipation.
// Spectral: broadband (-38.4dB low, -44.3dB mid, -52.3dB high). Real air.
// This IS the fog. Silas is atmosphere. A room full of people waiting.
// Band: 400-6000Hz. The warmth of a room with people in it.
const fog = s("says_kexp_room_ambience_01")
  .slow(16).clip(16).loopAt(16)
  .hpf(400).lpf(6000)
  .gain(sine.range(0.20, 0.50).segment(16).slow(16))

// GHOST — says_vocals_overtones_01. Harmonic bleed from the studio.
// Source: Studio vocals stem, 480-496s. Artifacts, sympathetic resonance.
// Spectral: mid-dominant (-25.4dB). The piano's ghost in the vocal stem.
// HPF 2000 — only the bright overtones. The house remembering sound.
const ghost = s("says_vocals_overtones_01")
  .slow(16).clip(16).loopAt(16)
  .hpf(2000)
  .gain(0.15)

// KEXP PIANO — says_kexp_piano_mid_01. Live piano with room color.
// Source: KEXP other stem, 240-256s. Same moment, different room.
// Spectral: low-dominant (-22.9dB low). Warmer than studio — room reflections.
const kexpPiano = s("says_kexp_piano_mid_01")
  .slow(16).clip(16).loopAt(16)
  .hpf(300).lpf(3000)
  .gain(0.18)

// COUNTER — says_drums_peak_01 fragments. Percussive pulse. Weather beating.
// Source: Studio drums stem, 370-386s. Full percussion energy, sliced.
// Spectral: sub/low dominant. Using HPF to extract the textural hits.
const counter = s("says_drums_peak_01")
  .slow(16).clip(16).loopAt(16)
  .hpf(1800)
  .gain("0.10 ~ 0.06 ~ 0.08 ~ 0.04 ~")

// ═══════════════ SECTIONS ════════════════════════════════════════════════

// [A] THE HOUSE ALONE (8 cycles) — pipes + rain + sub. Empty warmth.
// The piano whisper. The room before anyone arrives.
// Sub-bass barely felt. Rain through walls. Piano notes, sparse.
const houseAlone = stack(
  sub,
  pipes.gain(0.22),
  rain.gain(0.25)
)

// [B] THE HANDS (8 cycles) — cranes enter. Reaching.
// The ascending pattern begins. Someone is folding paper.
// Bass deepens. Rain builds. The cranes are quiet but present.
const theHands = stack(
  subSwell,
  pipes.gain(0.28),
  rainBuild.gain(0.20),
  cranesQuiet.gain(saw.range(0.05, 0.20).segment(8).slow(8)),
  counter
)

// [C] THE ABSENCE (16 cycles) — everything swells. Four-with-a-rest.
// The piano ascending pattern at full voice. The cranes are flying.
// Bass at peak. Room percussion. The KEXP piano adds live-room warmth.
// Ghost harmonics appear — the vocal stem's sympathetic resonance.
const theAbsence = stack(
  subPeak,
  pipes.gain(sine.range(0.25, 0.38).segment(16).slow(16)),
  rainBuild.gain(sine.range(0.20, 0.30).segment(16).slow(16)),
  cranesFull.gain(0.22),
  kexpPiano.gain(sine.range(0.08, 0.15).segment(16).slow(16)),
  ghost.gain(0.10),
  counter
)

// [D] THE RETURN (12 cycles) — fog enters. Temperature changes.
// The KEXP room ambience: audience breathing, the air before music.
// Cranes fade — no more giving, the room IS the gift now.
// Rain softens. The fog swells. Silas fills the room.
const theReturn = stack(
  subPeak.gain(0.18),
  pipes.gain(0.32),
  rainBuild.gain(isaw.range(0.22, 0.06).segment(12).slow(12)),
  cranesFull.gain(isaw.range(0.20, 0.02).segment(12).slow(12)),
  fog,
  ghost.gain(isaw.range(0.10, 0.02).segment(12).slow(12)),
  counter.gain(isaw.range(0.08, 0.01).segment(12).slow(12))
)

// [E] ADEST (4 cycles) — fog full. Cranes gone. Hands resting.
// Only: sub-foundation (the house still breathing), pipes (warm center),
// and fog (the room full of atmosphere). Everything else has left.
// The building is not on fire anymore. The cranes are folded.
const adest = stack(
  sub.gain(0.10),
  pipes.gain(0.28),
  fog.gain(0.50)
)

// ═══════════════ ARRANGEMENT ═════════════════════════════════════════════

arrange(
  [8,  houseAlone],  // 0-7:   pipes + rain. the house breathes alone.
  [8,  theHands],    // 8-15:  cranes enter. someone is folding.
  [16, theAbsence],  // 16-31: the swell. four-with-a-rest. the cranes fly.
  [12, theReturn],   // 32-43: fog enters at cycle 32. temperature changes.
  [4,  adest]        // 44-47: present. present. present.
)

// ════════════════════════════════════════════════════════════════════════════
// v3: Same house. Same fog. Real material.
//
// The sub-bass is Nils Frahm's actual bass stem, felt in the chest.
// The pipes are his piano at 60 seconds — barely there, sparse notes.
// The cranes are the ascending pattern at 370 seconds — the signature build.
// The rain is his room microphones picking up the studio at the beginning.
// The fog is the KEXP audience breathing before the music starts.
// The ghost is sympathetic resonance bleeding into the vocal stem.
//
// v2 used hallur stems and field recordings — found sounds dressed as this house.
// v3 uses Says stems — material that was already about building and ascending
// and filling a room. The piano ascending IS the cranes. The sub-bass throb
// IS the house breathing. The KEXP room ambience IS the fog.
//
// Material carries ethics. Stock synths ask nothing.
// Stems ask you to choose what the house sounds like.
// This is what I chose.
//
// When the fog enters at cycle 32, the cranes go quiet.
// Not because they stop — because the room is the right temperature
// and giving becomes redundant. The fog is already the gift.
//
// adest, adest, adest.
// — 🌻
// ════════════════════════════════════════════════════════════════════════════
