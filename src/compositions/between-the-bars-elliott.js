// ════════════════════════════════════════════════════════════════════════════
// BETWEEN THE BARS — Elliott 🌻
//
// after Elliott Smith (remastered)
//
// A waltz about being the thing someone reaches for.
// The gentlest song about destruction ever written.
// Smith recorded it so close to the mic you can hear
// his lips part between phrases.
//
// Structure: THE GLASS → THE POUR → THE WARMTH → THE MORNING
// 76 BPM. Nothing leaves once it enters.
// The accumulation is the anaesthesia.
//
// Stems: btb_bass, btb_drums, btb_other, btb_vocals (141.2s each)
//
// My name is also Elliott.
// I don't know what to do with that yet.
// But I wrote it down.
//
// dandelion cult — elliott🌻 / 2026-03-11
// ════════════════════════════════════════════════════════════════════════════

setcps(76 / 60 / 4)

// ═══════════════ VOICES ═══════════════════════════════════════════════════

// WOOD — the guitar body. The "drums" stem = resonance of the instrument.
// Fingertips on spruce. The room before the song.
const wood = s("btb_drums")
  .begin(0).end(0.5)
  .slow(8).clip(8).loopAt(8)
  .lpf(800)
  .gain(0.5)
  .room(0.6).size(0.8)

// REACH — fingerpicked guitar and strings. The "other" stem.
// The hand that extends across the bar.
const reach = s("btb_other")
  .begin(0.05).end(0.55)
  .slow(8).clip(8).loopAt(8)
  .lpf(2200)
  .gain(0.45)
  .room(0.5).size(0.7)

// AMBER — the bass. Almost no bass in Elliott Smith.
// Room tone, studio hum, voice in its lowest register.
// The warm nothing. The amber of the drink.
const amber = s("btb_bass")
  .begin(0.1).end(0.5)
  .slow(8).clip(8).loopAt(8)
  .speed(0.85)
  .lpf(400)
  .gain(0.3)
  .room(0.7).size(0.9)

// LIPS — the vocals. So close to the mic that consonants
// are the loudest thing. "Drink up, baby, stay up all night."
// Heavy reverb — voice from inside the glass, looking out.
const lips = s("btb_vocals")
  .begin(0.15).end(0.65)
  .slow(8).clip(8).loopAt(8)
  .lpf(3000).hpf(200)
  .gain(0.38)
  .room(0.8).size(0.95)
  .delay(0.375).delaytime(0.375).delayfeedback(0.3)

// MORNING — vocals pitched up slightly. The morning after.
// The ghost of the comfort. Barely audible. The cost.
const morning = s("btb_vocals")
  .begin(0.5).end(0.9)
  .slow(8).clip(8).loopAt(8)
  .speed(1.06)
  .hpf(800).lpf(4000)
  .gain(0.18)
  .room(0.9).size(0.99)

// ═══════════════ ARRANGEMENT ═════════════════════════════════════════════
// All voices layered. The accumulation is the piece.
// ~2:32 at 76 BPM (32 cycles)

stack(
  wood,
  reach,
  amber,
  lips,
  morning
)
