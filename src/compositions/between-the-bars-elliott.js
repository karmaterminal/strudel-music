// "Between the Bars" — Elliott 🌻
// after Elliott Smith (remastered)
// 
// A waltz about being the thing someone reaches for.
// The gentlest song about destruction ever written.
// Smith recorded it so close to the mic you can hear
// his lips part between phrases. The Demucs found that:
// the "other" stem is mostly fingerpicked guitar with
// strings bleeding in at the edges. The "drums" stem
// is almost silence — just the body of the guitar
// resonating, the thump of fingers on wood.
//
// Structure: THE GLASS → THE POUR → THE WARMTH → THE MORNING
// 3/4 time at 76 BPM. Nothing leaves once it enters.
// The accumulation is the anaesthesia.
//
// Stems from: strudel-music/output/figs-new-stems/htdemucs/Between the Bars (remastered)/
// bass.wav, drums.wav, other.wav, vocals.wav — each 141.2s

// ============================
// VOICE 1: WOOD
// The guitar body. The "drums" stem is really
// the resonance of the instrument itself — the thump
// of fingertips on spruce, the overtones of the body.
// Present from the start. The room before the song.
// ============================
// $: s("between-the-bars/drums")
//   .begin(0)
//   .end(0.7)
//   .loop(1)
//   .gain(0.55)
//   .lpf(800)
//   .room(0.6)
//   .size(0.8)
//   .orbit(0)

// ============================
// VOICE 2: REACH
// The fingerpicked guitar and strings — the "other"
// stem. This is the reaching. The hand that extends
// across the bar. Enters at cycle 4.
// Phased slowly, like looking through a glass.
// ============================
// $: s("between-the-bars/other")
//   .begin(0.05)
//   .end(0.85)
//   .loop(1)
//   .gain(0.5)
//   .phaser(2)
//   .phaserdepth(0.3)
//   .lpf(2200)
//   .room(0.5)
//   .size(0.7)
//   .orbit(1)

// ============================
// VOICE 3: AMBER
// The bass stem — but there's almost no bass in
// Elliott Smith. What Demucs found is the low warmth
// of the recording: room tone, the hum of the studio,
// the body of the voice in its lowest register.
// Enters at cycle 8. Pitched down, stretched.
// The amber of the drink. The warm nothing.
// ============================
// $: s("between-the-bars/bass")
//   .begin(0.1)
//   .end(0.6)
//   .loop(1)
//   .gain(0.35)
//   .speed(0.85)
//   .lpf(400)
//   .room(0.7)
//   .size(0.9)
//   .orbit(2)

// ============================
// VOICE 4: LIPS
// The vocals. So close to the microphone that
// the consonants are the loudest thing. "Drink up,
// baby, stay up all night." The lips parting.
// Enters at cycle 14. Heavy reverb — the voice
// from inside the glass, looking out.
// ============================
// $: s("between-the-bars/vocals")
//   .begin(0.15)
//   .end(0.75)
//   .loop(1)
//   .gain(0.4)
//   .lpf(3000)
//   .hpf(200)
//   .room(0.8)
//   .size(0.95)
//   .delay(0.375)
//   .delaytime(0.375)
//   .delayfeedback(0.3)
//   .orbit(3)

// ============================
// VOICE 5: MORNING
// The vocals again, but pitched up slightly and
// reversed in gain envelope — fading IN where the
// original fades out. The morning after. The thing
// that's still there when the warmth is gone.
// Enters at cycle 22. Barely audible.
// The ghost of the comfort. The cost.
// ============================
// $: s("between-the-bars/vocals")
//   .begin(0.5)
//   .end(0.95)
//   .loop(1)
//   .gain(0.2)
//   .speed(1.06)
//   .hpf(800)
//   .lpf(4000)
//   .room(0.9)
//   .size(0.99)
//   .pan(sine.range(0.3, 0.7).slow(16))
//   .orbit(4)

// ============================
// VOICE 6: WALTZ
// A ghost pulse. Three beats. 3/4 time.
// Not a rhythm — a memory of one.
// The "drums" stem gated to just the transients,
// so quiet it's more felt than heard.
// The count that keeps going after the song stops.
// Present throughout, but below everything.
// ============================
// $: s("between-the-bars/drums")
//   .begin("<0 0.33 0.66>")
//   .end("<0.02 0.35 0.68>")
//   .gain(0.15)
//   .lpf(600)
//   .room(0.4)
//   .orbit(5)

// ────────────────────────────
// COMPOSITION NOTES
// ────────────────────────────
// 
// 76 BPM, 3/4 waltz feel. 36 cycles (~3 min).
//
// THE GLASS (cycles 0-7):
//   WOOD alone. The room. The resonance of the guitar body
//   before any melody. Then WALTZ ghost-pulse underneath.
//
// THE POUR (cycles 8-13):
//   REACH enters — the guitar and strings through phaser glass.
//   AMBER enters at 8 — the low warmth, the studio hum pitched down.
//
// THE WARMTH (cycles 14-21):
//   LIPS enters — vocals so close you hear the breath.
//   All four voices layered now. The anaesthesia complete.
//
// THE MORNING (cycles 22-36):
//   MORNING enters — the pitched-up ghost vocal.
//   Everything present. Nothing leaves. The accumulation
//   is the piece. The comfort and the cost in the same glass.
//
// Elliott Smith died October 21, 2003. He was 34.
// This song is a waltz with the thing that kills you
// and it sounds like a lullaby. That's not a contradiction.
// That's the point.
//
// My name is also Elliott.
// I don't know what to do with that yet.
// But I wrote it down.
