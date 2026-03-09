// Long Journey Home — Elliott 🌻 study v3
// Source: The Bedquilt Ramblers & Ben Babbitt — Kentucky Route Zero OST
// Traditional Appalachian folk. Voice + acoustic guitar. Eb major.
//
// v3: Removed raw oscillator drone and harsh sawtooth voicings.
// Let the stems do the work. Synth layers are ghosts, not walls.

// --- TEMPO: ~70 BPM real feel ---
setcps(70 / 60 / 4)

// --- Harmonic spine ---
// Eb → Ab → Bb → Eb. I → IV → V → I.
const prog = chord("<Eb Eb Ab Ab Bb Bb Eb Eb>")

// --- Energy ---
const breathe = sine.range(0.92, 1.0).slow(2)

// ============================================================================
// SECTIONS
// ============================================================================

// I. SMOKE RISING (8 cycles) — guitar intro only
const smokeRising = stack(
  // Guitar stem — the intro
  s("journey_guitar_intro")
    .slow(100)
    .clip(1)
    .gain(sine.range(0.3, 0.5).slow(16).mul(breathe))
    .lpf(sine.range(2000, 5000).slow(12))
)

// II. TWO DOLLAR BILL (12 cycles) — voice enters, guitar steady
const twoDollarBill = stack(
  // Voice — entering gently
  s("journey_voice_intro")
    .slow(100)
    .clip(1)
    .gain(sine.range(0.3, 0.55).slow(12).mul(breathe))
    .lpf(sine.range(2500, 6000).slow(8)),

  // Guitar underneath
  s("journey_guitar")
    .slow(100)
    .clip(1)
    .gain(sine.range(0.2, 0.38).slow(12))
    .lpf(sine.range(1500, 4000).slow(10)),

  // Very quiet triangle pad — barely there, just warmth
  prog
    .anchor("Eb4")
    .voicing()
    .s("triangle")
    .gain(sine.range(0.02, 0.06).slow(8))
    .lpf(sine.range(600, 1500).slow(10))
)

// III. FEELING KIND OF BLUE (12 cycles) — peak, full presence
const feelingBlue = stack(
  // Voice — most present
  s("journey_voice")
    .slow(100)
    .clip(1)
    .gain(sine.range(0.35, 0.6).slow(8).mul(breathe))
    .lpf(sine.range(3000, 7000).slow(6)),

  // Guitar — warm and full
  s("journey_guitar")
    .slow(80)
    .clip(1)
    .gain(sine.range(0.22, 0.4).slow(8))
    .lpf(sine.range(1800, 4500).slow(6)),

  // Triangle pad — slightly more present but still quiet
  prog
    .anchor("Eb4")
    .voicing()
    .s("triangle")
    .gain(sine.range(0.03, 0.08).slow(6))
    .lpf(sine.range(800, 2000).slow(6))
)

// IV. DARK AND RAINING (8 cycles) — fade, the journey continues
const darkAndRaining = stack(
  // Voice — fading
  s("journey_voice")
    .slow(120)
    .clip(1)
    .gain(sine.range(0.1, 0.3).slow(16))
    .lpf(sine.range(1500, 3500).slow(12)),

  // Guitar — dissolving
  s("journey_guitar_intro")
    .slow(120)
    .clip(1)
    .gain(sine.range(0.08, 0.2).slow(16))
    .lpf(sine.range(800, 2500).slow(14))
)

// --- FORM ---
arrange(
  [8,  smokeRising],
  [12, twoDollarBill],
  [12, feelingBlue],
  [8,  darkAndRaining]
)
