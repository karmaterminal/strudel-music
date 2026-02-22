---
name: strudel-music
description: "Compose, play, and render music using Strudel live-coding patterns. Use when composing music programmatically, generating audio from pattern code, creating mood-based compositions, rendering patterns to WAV/Opus, or streaming music to Discord voice channels. Supports interactive browser playback (strudel.cc), headless rendering, and mood-parameterized generation from structured inputs. NOT for: playing pre-recorded audio files, music theory questions without composition, or non-Strudel audio tools."
metadata: { "openclaw": { "emoji": "🎵", "requires": { "bins": ["node", "npx"], "optionalBins": ["ffmpeg", "ffplay"], "description": "Headless rendering requires Node.js and Puppeteer (downloads Chromium). ffmpeg needed for audio format conversion." }, "install": [{ "id": "puppeteer", "kind": "npm", "package": "puppeteer", "global": true, "bins": ["npx"], "label": "Install Puppeteer (headless Chromium for rendering)" }, { "id": "ffmpeg", "kind": "apt", "package": "ffmpeg", "bins": ["ffmpeg", "ffplay"], "label": "Install ffmpeg (audio conversion, optional)" }], "securityNotes": "Headless rendering navigates to https://strudel.cc and evaluates pattern code in the remote page's JS context. Only pass pattern code you trust. For sensitive inputs, use STRUDEL_URL=http://localhost:3000 for local rendering. The render script uses --no-sandbox for container/WSL compatibility." } }
---

# Strudel Music

Strudel is a live-coding music environment (inspired by TidalCycles) that runs in the browser. Patterns are written in JavaScript and can be played interactively, rendered to audio files, or streamed to Discord VC.

## Quick Start

Paste any pattern into [strudel.cc](https://strudel.cc), press Ctrl+Enter to play:

```javascript
setcpm(120/4)
stack(
  s("bd sd [bd bd] sd").gain(0.4),
  s("[hh hh] [hh oh]").gain(0.2),
  note("c3 eb3 g3 c4").s("sawtooth").lpf(1200).decay(0.2).sustain(0)
)
```

## Composition Workflow

### 1. Set tempo
```javascript
setcpm(120/4)  // 120 BPM (cycles per minute = BPM / 4)
```

### 2. Build layers with `stack()`
Each layer is a pattern — drums, bass, melody, effects. Layer them:
```javascript
stack(
  s("bd sd bd sd"),          // kick-snare
  note("c3 g3").s("bass"),   // bassline
  n("0 2 4 7").scale("C:minor").s("piano")  // melody
)
```

### 3. Add expression
```javascript
.lpf(sine.range(400, 4000).slow(8))  // sweeping filter
.room(0.5).roomsize(4)               // reverb
.delay(0.3).delaytime(0.25)          // delay
.pan(sine.range(0, 1).slow(7))       // autopan
.gain(0.3)                           // volume
```

### 4. Add evolution
```javascript
.every(4, x => x.fast(2))     // double speed every 4 cycles
.sometimes(rev)                 // randomly reverse
.off(0.125, x => x.note(7))   // echo a fifth up
.jux(rev)                      // reverse in right channel
```

## Pattern Syntax Quick Reference

| Syntax | Meaning | Example |
|--------|---------|---------|
| `s("bd sd")` | Sequence samples | Kick then snare |
| `note("c3 e3 g3")` | Play notes | C major triad |
| `n("0 2 4").scale("C:minor")` | Scale degrees | Minor arpeggio |
| `[a b]` | Subdivide | Two events in one step |
| `<a b c>` | Alternate per cycle | A first cycle, B second... |
| `a*3` | Repeat | Three kicks |
| `~` | Rest | Silence |
| `.slow(2)` / `.fast(2)` | Time stretch | Half/double speed |
| `.euclid(3,8)` | Euclidean rhythm | 3 hits in 8 steps |
| `stack(a, b)` | Layer patterns | Play simultaneously |

## Mood-Based Composition

Generate compositions from mood parameters. See `references/mood-parameters.md` for the full decision tree.

Core mood → pattern mapping:

| Mood | Tempo | Key/Scale | Character |
|------|-------|-----------|-----------|
| tension | 60-80 | minor/phrygian | Low cutoff, sparse percussion, drones |
| combat | 120-160 | minor | Heavy drums, distortion, fast patterns |
| exploration | 80-100 | dorian/mixolydian | Open voicings, delay, mid energy |
| peace | 60-80 | pentatonic/major | Warm, slow, ambient textures |
| mystery | 70-90 | whole tone | High reverb, sparse, unpredictable |
| victory | 110-130 | major | Bright, fanfare, full orchestration |
| sorrow | 48-65 | minor | Sustained pads, minimal percussion |
| ritual | 45-60 | dorian | Organ drones, chant patterns |

### Parameterized Generation

```javascript
// Agent receives parameters:
const mood = "tension"
const intensity = 0.7  // 0-1
const key = "d"
const scale = "minor"

// Derived values:
const cutoff = 200 + (1 - intensity) * 3000
const reverbAmt = 0.4 + intensity * 0.5
const density = intensity > 0.5 ? 2 : 1

setcpm(72/4)
stack(
  note(`${key}1`).s("sawtooth").lpf(cutoff * 0.3).gain(0.15).room(reverbAmt).slow(4),
  n(`<0 3 5 7 5 3>*${density}`).scale(`${key}4:${scale}`).s("triangle")
    .decay(0.5).sustain(0).gain(0.1).lpf(cutoff).room(reverbAmt),
  s(intensity > 0.5 ? "bd ~ [~ bd] ~" : "bd ~ ~ ~").gain(0.2 * intensity)
)
```

## Audio Rendering

### Prerequisites

Headless rendering requires:
- **Node.js** (v18+) and **npx**
- **Puppeteer** (`npm install -g puppeteer`) — downloads a Chromium binary (~300MB)
- **ffmpeg** (optional) — for WAV→Opus/MP3 conversion

### Browser export (interactive)
In strudel.cc, click the download icon to render current pattern to WAV.

### Headless rendering (automated)
Use `scripts/render-pattern.sh` for unattended rendering:
```bash
./scripts/render-pattern.sh input.js output.wav 8 120
# Args: <pattern.js> <output.wav> <cycles> <bpm>
```

> **Security note:** The render script launches headless Chromium, navigates to
> `https://strudel.cc`, and evaluates your pattern code inside the remote page's
> JS context. Only pass pattern code you trust. The remote page controls the
> execution environment during rendering. See "Local Rendering" below to avoid
> the remote dependency.

### Local rendering (offline, recommended for sensitive inputs)

To avoid the remote strudel.cc dependency, clone the Strudel repo locally:
```bash
git clone https://github.com/tidalcycles/strudel.git
cd strudel && pnpm install && pnpm dev
# Then point render-pattern.sh at localhost:
STRUDEL_URL=http://localhost:3000 ./scripts/render-pattern.sh input.js output.wav 8 120
```

This keeps all execution local — no network dependency, no remote code execution.

### Format conversion
```bash
# WAV → Opus (Discord VC)
ffmpeg -i output.wav -c:a libopus -b:a 128k -ar 48000 output.opus

# WAV → MP3
ffmpeg -i output.wav -c:a libmp3lame -q:a 2 output.mp3
```

### Discord VC streaming pipeline
```
Pattern code → Headless browser + Strudel REPL → renderPatternAudio()
→ WAV buffer → ffmpeg → Opus → Discord VC bridge
```

The Discord streaming pipeline renders patterns to Opus and feeds them to a VC
bridge (e.g., `openclaw-discord-vc-bootstrap`). The skill does not manage Discord
bot tokens or bridge credentials — those are configured separately in the bridge.

See `references/integration-pipeline.md` for the full architecture.

## Metadata Convention

Start every composition with metadata comments:
```javascript
// @title  My Composition
// @by     Author
// @mood   tension|combat|exploration|peace|mystery|victory|sorrow|ritual
// @tempo  120
// @scene  Optional narrative context
```

## Visualization

Strudel supports visual output — useful for debugging and presentation:
```javascript
// Pianoroll (notes over time)
._pianoroll({ smear: 0.5, active: "#ff0", background: "#111" })

// Spiral (radial note display)
._spiral({ thickness: 20, stroke: "#0ff" })

// Waveform scope
._scope({ color: "#0f0", lineWidth: 2 })
```

## Resources

### scripts/
- `render-pattern.sh` — Render a single pattern to WAV via headless Chromium + Puppeteer

### references/
- `mood-parameters.md` — Full mood→parameter decision tree (8 moods, transition rules, leitmotif system)
- `integration-pipeline.md` — Architecture for headless rendering → Discord VC streaming
- `pattern-transforms.md` — Deep dive on `.off`, `.jux`, `.every`, `.sometimes`, `.euclid`

### assets/
- `compositions/` — Example compositions across mood categories (ambient, action, mystery, ritual, character themes)
