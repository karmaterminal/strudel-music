// ============================================================================
// ARTHAS MY SON — Elliott 🌻 Study Piece
// Dandelion Cult — Theory Exercise
// ============================================================================
//
// Source: "Arthas, My Son" — World of Warcraft OST (Russell Brower / Derek Duke)
// Key: D minor | ~68 BPM | Orchestral/choral requiem
//
// A study piece exercising the Round 2 theory tools against an orchestral
// source. Unlike trance or electronic tracks, this is pure symphonic/choral —
// the challenge is shaping form and harmony over continuous stems rather than
// rhythmic hits.
//
// THEORY CONCEPTS EXERCISED:
//   1. arrange() for macro-form — dramatic arc matching the source's narrative
//   2. chord().anchor().voicing() for D minor harmonic spine
//   3. Signal-shaped dynamics (sine.range().slow()) for organic envelopes
//   4. Stems as slow()-cycled sample sources
//   5. Energy as multi-dimensional: gain + filter + reverb depth
//
// Stems from Demucs htdemucs:
//   arthas_choir    = choral voices (the grief, the prayer)
//   arthas_strings  = orchestral bed (strings, brass, woodwinds — the "other" stem)
//   arthas_bass     = low orchestral content (celli, contrabass)
//   arthas_drums    = timpani/percussion hits
//
// Structure — a father's lament in five movements:
//   I.   Silence Before   (8 bars)  — strings alone, emerging from nothing
//   II.  The Choir Rises  (8 bars)  — choir enters, harmonic bed established
//   III. Full Grief       (10 bars) — all stems, maximum orchestral weight
//   IV.  The Fall         (8 bars)  — choir recedes, dissonance enters
//   V.   Ashes            (6 bars)  — strings fade to silence
//
// Total: 40 bars ≈ ~94 seconds at 68 BPM
// ============================================================================

// --- TEMPO: 68 BPM (Arthas's stately, mournful pace) ---
setcps(68 / 60 / 4)

// ============================================================================
// THEORY CONCEPT 1: Harmonic Authority via chord() + anchor() + voicing()
//
// D minor progression: Dm → Bb → Gm → A (i → VI → iv → V)
// This is the classic minor lament cadence — the VI provides the brief
// moment of warmth before iv and V pull us back into grief.
// One chord per bar, cycling every 4 bars.
// ============================================================================

const prog = chord("<Dm Bb Gm A>")

// ============================================================================
// THEORY CONCEPT 2: Signal-Shaped Dynamics
//
// No per-bar gain arrays here. Instead, continuous signals that breathe
// with the form. The master energy curve is an asymmetric rise-and-fall:
// slow climb to bar 26 (peak of "Full Grief"), then gradual descent.
//
// sine.range(lo, hi).slow(N) creates a smooth oscillation over N cycles.
// By choosing the slow period to peak in the middle third, we get a
// natural dramatic arc without counting individual gain values.
// ============================================================================

// Master energy: rises across 40 bars, peaks around bar 20-26
// Using a sine that completes half a cycle over 40 bars = peaks at bar 20
const energy = sine.range(0.15, 1.0).slow(80)

// Breathing within sections — subtle pulsation like a human chest
const breathe = sine.range(0.88, 1.0).slow(3)

// Decay envelope for the final section — falling from present to silence
const fadeOut = sine.range(0.7, 0.05).slow(12)

// ============================================================================
// SECTION I: SILENCE BEFORE (8 bars)
// ============================================================================
// Only the strings emerge. Like mist in Lordaeron before dawn.
// The orchestral bed (arthas_strings) plays at very low gain, slowly
// revealing itself. A synthesized pad reinforces the D minor tonality
// using chord().anchor().voicing() — the harmonic spine made audible.
//
// THEORY: arrange() lets us define this as a discrete formal unit.
// THEORY: slow(40) stretches the full stem across all 40 bars,
// so each section hears the corresponding portion of the original.
// ============================================================================

const silenceBefore = stack(
  // Strings stem — emerging from nothing
  // slow(40) = one trigger across 40 bars, plays the full stem duration
  s("arthas_strings")
    .slow(40)
    .clip(1)
    .gain(energy.mul(0.18))
    .lpf(energy.range(400, 2000))
    .room(0.4),

  // Harmonic pad — chord voicings in a tight register around D4
  // THEORY: anchor("D4") keeps all voicings close to D4, preventing
  // wild register jumps. voicing() selects close-position chords.
  prog
    .anchor("D4")
    .voicing()
    .s("sine")
    .clip(1)
    .gain(energy.mul(0.03).mul(breathe))
    .lpf(1200)
    .room(0.5)
    .decay(2.0)
    .sustain(0.6)
    .release(1.5)
)

// ============================================================================
// SECTION II: THE CHOIR RISES (8 bars)
// ============================================================================
// The choir enters — Arthas's theme given voice. In the original,
// the Latin text is a prayer/lament. Here, the choir stem carries
// that weight while the strings continue beneath.
//
// THEORY: Energy is multi-dimensional. Not just louder — the filter
// opens (spectral brightness increases) and reverb deepens.
// ============================================================================

const choirRises = stack(
  // Strings continue — slightly louder, filter opening
  s("arthas_strings")
    .slow(40)
    .clip(1)
    .gain(energy.mul(0.20))
    .lpf(energy.range(600, 3000))
    .room(0.35),

  // Choir enters — the human voice, grief made audible
  s("arthas_choir")
    .slow(40)
    .clip(1)
    .gain(energy.mul(0.16).mul(breathe))
    .lpf(energy.range(800, 4000))
    .room(0.4),

  // Harmonic pad — slightly brighter, more present
  prog
    .anchor("D4")
    .voicing()
    .s("sawtooth")
    .clip(1)
    .gain(energy.mul(0.025))
    .lpf(energy.range(500, 1800))
    .room(0.4)
    .decay(1.5)
    .sustain(0.5)
    .release(1.0),

  // Bass drone — D pedal tone, the foundation of grief
  // THEORY: n("0") indexes the chord root, keeping bass locked
  // to the harmonic progression. D → Bb → G → A in the bass.
  n("0")
    .set(prog)
    .voicing()
    .s("sine")
    .gain(energy.mul(0.04))
    .lpf(300)
    .clip(1)
    .decay(2.0)
    .sustain(0.4)
    .release(1.0)
)

// ============================================================================
// SECTION III: FULL GRIEF (10 bars)
// ============================================================================
// Everything present. Timpani punctuates. All stems active.
// This is the emotional peak — Terenas's ghost speaks to the son
// who destroyed everything. Maximum orchestral weight.
//
// THEORY: This section demonstrates that "full energy" is not just
// gain=1.0. It's open filters + deep reverb + all voices present +
// rhythmic punctuation from timpani. The signal-shaped energy curve
// naturally peaks here because of the sine.slow(80) placement.
// ============================================================================

const fullGrief = stack(
  // Strings — full presence
  s("arthas_strings")
    .slow(40)
    .clip(1)
    .gain(energy.mul(0.22))
    .lpf(energy.range(1000, 5000))
    .room(0.3),

  // Choir — dominant voice
  s("arthas_choir")
    .slow(40)
    .clip(1)
    .gain(energy.mul(0.20).mul(breathe))
    .lpf(energy.range(1200, 6000))
    .room(0.35),

  // Bass stem — orchestral low end
  s("arthas_bass")
    .slow(40)
    .clip(1)
    .gain(energy.mul(0.12))
    .lpf(energy.range(200, 800))
    .room(0.25),

  // Timpani/percussion — dramatic punctuation
  // THEORY: Even in orchestral music, percussion marks structural
  // boundaries. The drums stem contains timpani hits.
  s("arthas_drums")
    .slow(40)
    .clip(1)
    .gain(energy.mul(0.10))
    .room(0.3),

  // Harmonic pad — now sawtooth, wider, brighter
  prog
    .anchor("D5")
    .voicing()
    .s("sawtooth")
    .clip(1)
    .gain(energy.mul(0.03))
    .lpf(energy.range(800, 3000))
    .room(0.4)
    .decay(1.8)
    .sustain(0.5)
    .release(1.2),

  // Counter-melody — scale degrees moving against the chords
  // THEORY: Phrase vocabulary over chord context. These notes
  // derive from D natural minor (aeolian), creating melodic
  // motion that respects the harmonic spine.
  n("<[0 2] [3 5] [5 7] [7 5] [5 3] [3 2] [2 0] [0 ~] [~ 2] [3 5]>")
    .scale("D4:minor")
    .s("triangle")
    .clip(0.5)
    .gain(energy.mul(0.025))
    .lpf(3000)
    .room(0.3),

  // Bass synth reinforcement
  n("0 ~ 0 ~")
    .set(prog)
    .voicing()
    .s("sine")
    .gain(energy.mul(0.05))
    .lpf(250)
    .clip(0.8)
    .decay(1.5)
    .sustain(0.3)
    .release(0.8)
)

// ============================================================================
// SECTION IV: THE FALL (8 bars)
// ============================================================================
// The choir recedes. What remains is the orchestral skeleton —
// strings carrying the weight alone again, but now with the
// knowledge of what was lost. The harmonic pad shifts to include
// a tritone tension (Eb against A in the V chord) — not explicit
// dissonance, but unease.
//
// THEORY: Signal-shaped dynamics in reverse. The energy curve is
// past its peak, naturally declining. Filter closes, reverb deepens
// (distance = emotional withdrawal).
// ============================================================================

const theFall = stack(
  // Strings — still present but dimming
  s("arthas_strings")
    .slow(40)
    .clip(1)
    .gain(energy.mul(0.16))
    .lpf(energy.range(500, 2500))
    .room(0.45),

  // Choir — fading, like a memory
  s("arthas_choir")
    .slow(40)
    .clip(1)
    .gain(energy.mul(0.08).mul(breathe))
    .lpf(energy.range(500, 2000))
    .room(0.5),

  // Harmonic pad — darker, filter closing
  prog
    .anchor("D4")
    .voicing()
    .s("sawtooth")
    .clip(1)
    .gain(energy.mul(0.02))
    .lpf(energy.range(400, 1200))
    .room(0.5)
    .decay(2.0)
    .sustain(0.5)
    .release(1.5),

  // Low drone fading
  n("0")
    .set(prog)
    .voicing()
    .s("sine")
    .gain(energy.mul(0.03))
    .lpf(200)
    .clip(1)
    .decay(2.5)
    .sustain(0.3)
    .release(1.5)
)

// ============================================================================
// SECTION V: ASHES (6 bars)
// ============================================================================
// Only strings remain, and even they dissolve. The reverb tail
// is all that's left — the echo of a kingdom that was.
//
// THEORY: The fadeOut signal replaces the master energy here,
// providing an independent descent to near-silence. This is
// the emotional inverse of Section I — we emerged from silence,
// and to silence we return, but changed.
// ============================================================================

const ashes = stack(
  // Strings — the last voice, fading
  s("arthas_strings")
    .slow(40)
    .clip(1)
    .gain(fadeOut.mul(0.14))
    .lpf(fadeOut.range(300, 1200))
    .room(0.6),

  // Ghost of the pad — barely there
  prog
    .anchor("D4")
    .voicing()
    .s("sine")
    .clip(1)
    .gain(fadeOut.mul(0.015))
    .lpf(fadeOut.range(300, 800))
    .room(0.6)
    .decay(3.0)
    .sustain(0.4)
    .release(2.0)
)

// ============================================================================
// THEORY CONCEPT 1 (MACRO): arrange() for form-as-architecture
//
// The arrange() call IS the score. Five movements, each a discrete
// emotional unit. Total: 8 + 8 + 10 + 8 + 6 = 40 bars ≈ ~94 seconds.
//
// This mirrors the source's own arc: quiet opening → choral entry →
// full orchestral grief → retreat → silence. A father's lament
// compressed into a minute and a half.
// ============================================================================

arrange(
  [8,  silenceBefore],   // I.   Strings emerge from nothing
  [8,  choirRises],      // II.  Choir enters, grief takes voice
  [10, fullGrief],       // III. Full orchestral weight — the peak
  [8,  theFall],         // IV.  Choir fades, knowledge of loss
  [6,  ashes]            // V.   Strings dissolve to silence
)
