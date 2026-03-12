// ============================================================================
// BLACKBIRD ELLIOTT STUDY — Round 2 Theory Exercise
// Elliott 🌻 — Dandelion Cult
// ============================================================================
// 
// A deliberate STUDY piece exercising the Round 2 theory tools:
//   1. arrange() for macro-form (intro / build / peak / decay)
//   2. chord() + .anchor() + .voicing() for harmonic structure
//   3. Tresillo rhythm (euclid(3,8)) and Scotch snap patterns
//   4. Signal-shaped gain (sine.range().slow()) instead of per-bar strings
//   5. Energy as multi-dimensional: gain + density + spectral brightness
//
// Inspired by Martyn Bennett's Blackbird:
//   - ~85 BPM, Bb major / G minor modality
//   - Celtic/electronic fusion, driving percussion, pipe melodies
//   - Dense textural layering with ritual energy
//
// Target: 60–90 seconds (~20–28 cycles at 85 BPM, 1 cycle = 1 bar)
// ============================================================================

// --- TEMPO: 85 BPM (Blackbird's tempo) ---
setcps(85/60/4)

// ============================================================================
// THEORY CONCEPT 1: Harmonic Authority via chord() + anchor() + voicing()
// 
// One chord progression drives ALL harmonic layers.
// This prevents "random note soup" — every voice derives from the same
// harmonic spine. Using Gm → Eb → Bb → F (i → VI → III → VII in G minor),
// a progression that nods to Blackbird's Bb major / G minor tonality.
// ============================================================================

// Harmonic spine — one chord per cycle (bar)
// 4 bars per chord, 16-bar cycle, repeats across sections
const prog = chord("<Gm7 Gm7 Gm7 Gm7 Eb^7 Eb^7 Eb^7 Eb^7 Bb^7 Bb^7 Bb^7 Bb^7 F7 F7 F7 F7>")

// ============================================================================
// THEORY CONCEPT 2: Signal-Shaped Gain
//
// Instead of per-bar gain strings like "<0.3 0.4 0.5 ...>",
// we use continuous signals: sine.range(lo, hi).slow(N)
// This creates smooth, organic envelopes with zero manual value counting.
// ============================================================================

// Global energy curve: rises over 24 cycles (the whole piece)
const energy = sine.range(0.3, 1.0).slow(48)
// Secondary breathe — subtle oscillation within sections
const breathe = sine.range(0.85, 1.0).slow(4)

// ============================================================================
// SECTION DEFINITIONS — each is a pattern constructor
// ============================================================================

// --- INTRO (sparse, tresillo emerges) ---
// THEORY CONCEPT 3: Tresillo via euclid(3,8)
// The Cuban tresillo (3+3+2) as a rhythmic cell.
const intro = stack(
  // Kick on tresillo pattern — euclid(3,8) = the canonical 3+3+2
  s("808bd").euclid(3, 8)
    .gain(energy.mul(0.12)),

  // Hi-hat steady 8ths, very quiet — establishes pulse
  s("808hc*8")
    .gain(energy.mul(0.04).mul(breathe)),

  // Voiced chord pad — anchor keeps voicings in a tight register
  // THEORY: .anchor("Bb4") pins voice-leading around Bb4
  prog
    .anchor("Bb4")
    .voicing()
    .s("sawtooth")
    .clip(1)
    .lpf(800)
    .gain(energy.mul(0.04))
    .room(0.3)
    .decay(1.2)
    .sustain(0.5)
    .release(0.8)
)

// --- BUILD (density increases, melody enters) ---
// THEORY CONCEPT 4: Energy as multi-dimensional
// Not just louder — also denser (faster hats) and brighter (rising lpf)
const build = stack(
  // Kick: tresillo stays, slightly louder
  s("808bd").euclid(3, 8)
    .gain(energy.mul(0.14)),

  // Snare on beat 3 (offbeat)
  s("808sd")
    .struct("~ ~ ~ ~ x ~ ~ ~")
    .gain(energy.mul(0.08)),

  // Hats: density doubles to 16ths — energy dimension: DENSITY
  s("808hc*16")
    .gain(energy.mul(0.03).mul(breathe)),

  // Open hat on tresillo offbeats — euclid rotation
  s("808oh").euclidRot(3, 8, 2)
    .gain(energy.mul(0.05)),

  // Chord pad — brighter filter as energy rises — dimension: SPECTRAL
  // THEORY: lpf driven by energy signal = brightness tracks intensity
  prog
    .anchor("Bb4")
    .voicing()
    .s("sawtooth")
    .clip(1)
    .lpf(energy.range(600, 2400))
    .gain(energy.mul(0.05))
    .room(0.25)
    .decay(1.0)
    .sustain(0.5)
    .release(0.6),

  // Bass derived from same progression — THEORY: one harmonic authority
  // n("0") indexes chord root, keeping bass locked to progression
  n("0 ~ 0 ~")
    .set(prog)
    .voicing()
    .s("sawtooth")
    .lpf(300)
    .clip(0.7)
    .gain(energy.mul(0.10))
    .decay(0.5)
    .sustain(0.3)
    .release(0.3),

  // THEORY CONCEPT 3b: Scotch snap melody
  // Scotch snap = short-long pattern (16th + dotted 8th)
  // In Strudel: [short long] where short is much shorter
  // Melodic line using scale degrees from G minor
  n("<[0 2] [2 3] [3 5] [5 3] [3 2] [2 0] [0 ~] [~ 0]>")
    .scale("G4:minor")
    .s("triangle")
    .clip(0.4)
    .gain(energy.mul(0.05))
    .room(0.2)
    .lpf(3000)
)

// --- PEAK (maximum density, all elements) ---
// THEORY: arrange() peak section — everything at once
const peak = stack(
  // Kick: doubled density (fast(2) on tresillo = 6 hits per bar)
  s("808bd").euclid(3, 8).fast(2)
    .gain(0.13),

  // Snare on 2 and 4
  s("808sd")
    .struct("~ ~ ~ ~ x ~ ~ ~ ~ ~ ~ ~ x ~ ~ ~")
    .gain(0.10),

  // 16th hats with swing — THEORY: swing as microtiming humanization
  s("808hc*16")
    .gain(0.04)
    .swingBy(0.2, 8),

  // Open hat tresillo, louder
  s("808oh").euclidRot(3, 8, 1)
    .gain(0.06),

  // Full chord pad — wide open filter
  prog
    .anchor("Bb4")
    .voicing()
    .s("sawtooth")
    .clip(1)
    .lpf(3500)
    .gain(0.06)
    .room(0.3)
    .decay(1.0)
    .sustain(0.6)
    .release(0.8),

  // Bass — more aggressive, 8th notes
  n("0 ~ 0 ~ 0 ~ 0 ~")
    .set(prog)
    .voicing()
    .s("sawtooth")
    .lpf(400)
    .clip(0.5)
    .gain(0.11)
    .decay(0.4)
    .sustain(0.3)
    .release(0.2),

  // Melody: ascending phrases — THEORY: phrase vocabulary over chord context
  n("<[0 2 3] [2 3 5] [3 5 7] [5 7 8] [7 5 3] [5 3 2] [3 2 0] [2 0 ~]>")
    .scale("G4:minor")
    .s("triangle")
    .clip(0.3)
    .gain(0.06)
    .room(0.25)
    .lpf(4000),

  // Second texture — colotomic slow layer (THEORY: nested cycles)
  // A long-cycle drone that marks the big cycle boundary
  n("0")
    .set(prog)
    .voicing()
    .s("sine")
    .gain(0.04)
    .slow(4)
    .lpf(1200)
    .room(0.4)
    .decay(2.0)
    .sustain(0.6)
    .release(1.5)
)

// --- DECAY (strip away, return to tresillo skeleton) ---
// THEORY: arrange() decay — mirror of intro, energy falling
const decayEnv = sine.range(0.8, 0.2).slow(16)

const decay = stack(
  // Just tresillo kick, fading
  s("808bd").euclid(3, 8)
    .gain(decayEnv.mul(0.12)),

  // Quiet hats
  s("808hc*8")
    .gain(decayEnv.mul(0.03)),

  // Pad dissolving — filter closing
  prog
    .anchor("Bb4")
    .voicing()
    .s("sawtooth")
    .clip(1)
    .lpf(decayEnv.range(400, 1500))
    .gain(decayEnv.mul(0.04))
    .room(0.4)
    .decay(1.5)
    .sustain(0.5)
    .release(1.0),

  // Bass fading
  n("0 ~ ~ ~")
    .set(prog)
    .voicing()
    .s("sawtooth")
    .lpf(250)
    .clip(0.7)
    .gain(decayEnv.mul(0.06))
)

// ============================================================================
// THEORY CONCEPT 1 (MACRO): arrange() for form-as-architecture
//
// Instead of encoding form as 28 per-bar gain values across every layer,
// we define sections as patterns and assemble them with explicit cycle counts.
// This is "form first, details second" — the arrange() call IS the score.
//
// Total: 6 + 8 + 8 + 6 = 28 cycles (~79 seconds at 85 BPM)
// ============================================================================

arrange(
  [6, intro],    // Sparse tresillo + pad emerge (bars 1-6)
  [8, build],    // Density + brightness + melody build (bars 7-14)
  [8, peak],     // Full energy — all elements, maximum density (bars 15-22)
  [6, decay]     // Strip away to skeleton, filter closes (bars 23-28)
)
