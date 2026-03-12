// Below The Asteroids — Elliott 🌻 study (Claude Opus)
// Source: Jón Hallur — Below The Asteroids (EVE Online OST)
// Space ambient. 4:37. Stems: pad dominant (-21.1 dB), bass (-21.5 dB),
// drums near-silent (-33.7 dB, sparse impacts), vocals empty (-47.7 dB).
//
// Two-layer piece at its core: "other" carries all harmonic/melodic content,
// "bass" is the low drone. Everything else is incidental.
//
// Approach: slow evolving ambient. Stems as cycling textures,
// synthesized pads for harmonic structure, very sparse percussion.
// The piece should breathe, not march.

// --- TEMPO: ~65 BPM, very slow ---
setcps(65 / 60 / 4)

// --- Harmonic structure ---
// Suspended/modal territory. No dominant resolution — the progression drifts.
const prog = chord("<Dm9 Bb^7 Gm7 Am7>").slow(8)

// --- Energy curves ---
const energy = sine.range(0.1, 0.9).slow(80)
const breathe = sine.range(0.88, 1.0).slow(3)

// ============================================================================
// SECTIONS
// ============================================================================

// I. VOID — bass drone + faint pad. The emptiness between rocks.
const voidSection = stack(
  // Bass drone — deep sine following chord roots
  prog.struct("x ~ ~ ~")
    .s("sine")
    .anchor("D2")
    .voicing()
    .gain(sine.range(0.15, 0.3).slow(16).mul(breathe))
    .lpf(sine.range(200, 500).slow(12)),

  // Pad sample — barely audible, cycling through the stem
  s("asteroids_pad")
    .slow(60)
    .clip(1)
    .gain(sine.range(0.05, 0.15).slow(16))
    .lpf(sine.range(600, 1500).slow(10)),

  // Bass sample — low rumble
  s("asteroids_bass")
    .slow(60)
    .clip(1)
    .gain(sine.range(0.08, 0.18).slow(20))
    .lpf(350)
)

// II. DRIFT — texture enters, ghost melody fragments appear
const driftSection = stack(
  // Bass drone continues, slightly louder
  prog.struct("x ~ x ~")
    .s("sine")
    .anchor("D2")
    .voicing()
    .gain(sine.range(0.18, 0.35).slow(12).mul(breathe))
    .lpf(sine.range(250, 700).slow(10)),

  // Pad opens up
  s("asteroids_pad")
    .slow(48)
    .clip(1)
    .gain(sine.range(0.12, 0.3).slow(12))
    .lpf(sine.range(800, 2500).slow(8)),

  // Texture layer enters — second "other" slice
  s("asteroids_texture")
    .slow(48)
    .clip(1)
    .gain(sine.range(0.05, 0.18).slow(10))
    .lpf(sine.range(600, 2200).slow(8)),

  // Bass sample
  s("asteroids_bass")
    .slow(60)
    .clip(1)
    .gain(sine.range(0.1, 0.25).slow(16))
    .lpf(400),

  // Synth pad — triangle voicings, faint shimmer
  prog.struct("x x ~ x")
    .s("triangle")
    .anchor("D4")
    .voicing()
    .gain(sine.range(0.03, 0.12).slow(8))
    .lpf(sine.range(1000, 3000).slow(6)),

  // Ghost melody — sparse sine, high register
  note("<D5 [~ F5] A4 [~ C5]>").slow(2)
    .s("sine")
    .gain(sine.range(0.02, 0.07).slow(6))
    .lpf(2000)
)

// III. MASS — full presence, peak energy, percussion hints
const massSection = stack(
  // Bass drone — widest
  prog.struct("x x ~ x")
    .s("sine")
    .anchor("D2")
    .voicing()
    .gain(sine.range(0.2, 0.4).slow(10).mul(breathe))
    .lpf(sine.range(300, 800).slow(8)),

  // Pad — full
  s("asteroids_pad")
    .slow(40)
    .clip(1)
    .gain(sine.range(0.2, 0.4).slow(8))
    .lpf(sine.range(1000, 3500).slow(6)),

  // Texture
  s("asteroids_texture")
    .slow(40)
    .clip(1)
    .gain(sine.range(0.12, 0.28).slow(6))
    .lpf(sine.range(800, 3000).slow(5)),

  // Bass sample
  s("asteroids_bass")
    .slow(50)
    .clip(1)
    .gain(sine.range(0.15, 0.3).slow(12))
    .lpf(500),

  // Synth pad — fuller
  prog.struct("x x x ~")
    .s("triangle")
    .anchor("D4")
    .voicing()
    .gain(sine.range(0.08, 0.2).slow(6))
    .lpf(sine.range(1200, 4000).slow(5)),

  // Ghost melody — more present
  note("<D5 F5 A4 C5 E5 G4 Bb4 A4>").slow(4)
    .s("sine")
    .gain(sine.range(0.04, 0.1).slow(4))
    .lpf(2500),

  // Sparse percussion — asteroid impacts
  s("asteroids_perc")
    .slow(40)
    .clip(1)
    .gain(sine.range(0.03, 0.09).slow(8))
    .lpf(sine.range(300, 1500).slow(6))
)

// IV. DECAY — dissolving back to void
const decaySection = stack(
  // Bass drone — retreating
  prog.struct("x ~ ~ ~")
    .s("sine")
    .anchor("D2")
    .voicing()
    .gain(sine.range(0.1, 0.2).slow(16).mul(breathe))
    .lpf(sine.range(200, 400).slow(14)),

  // Pad — fading
  s("asteroids_pad")
    .slow(60)
    .clip(1)
    .gain(sine.range(0.03, 0.1).slow(16))
    .lpf(sine.range(500, 1200).slow(12)),

  // Bass sample — barely there
  s("asteroids_bass")
    .slow(60)
    .clip(1)
    .gain(sine.range(0.04, 0.1).slow(20))
    .lpf(300)
)

// --- FORM ---
arrange(
  [8,  voidSection],   // Emptiness. Bass drone + faint pad.
  [12, driftSection],  // Texture materializes. Ghost melody.
  [12, massSection],   // Full presence. Peak gravity. Impacts.
  [8,  decaySection]   // Return to void. Everything dissolves.
)
