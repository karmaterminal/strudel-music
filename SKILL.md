---
name: strudel-music
description: "Compose, render, and stream music using Strudel live-coding patterns with offline audio synthesis. Use when composing music programmatically, generating audio from pattern code, creating mood-based compositions, rendering patterns to WAV/MP3, or streaming music to Discord voice channels. Supports real Web Audio synthesis (oscillators, filters, envelopes, sample playback) via node-web-audio-api — no browser required. NOT for: playing pre-recorded audio files, music theory questions without composition, or non-Strudel audio tools."
metadata: { "openclaw": { "emoji": "🎵", "requires": { "bins": ["node"], "optionalBins": ["ffmpeg"], "node": ">=18", "description": "Offline rendering requires Node.js 18+. ffmpeg needed for MP3/Opus conversion and Discord VC streaming." }, "install": [{ "id": "setup", "kind": "script", "script": "npm install && bash scripts/download-samples.sh", "label": "Install dependencies + download drum samples" }, { "id": "ffmpeg", "kind": "apt", "package": "ffmpeg", "bins": ["ffmpeg"], "label": "Install ffmpeg (audio format conversion)" }], "securityNotes": "All rendering is local and offline via node-web-audio-api (Rust-based Web Audio for Node.js). No browser, no network dependency, no remote code execution. Pattern code is evaluated in a Node.js VM — only run patterns you trust. Discord VC streaming requires a bot token configured separately." } }
---

# Strudel Music

Offline music composition and rendering using [Strudel](https://strudel.cc) live-coding patterns. Renders real audio (oscillators, filters, ADSR envelopes, drum samples) entirely in Node.js — no browser required.

## Setup

```bash
# Install all dependencies (Strudel packages + Web Audio + Discord voice)
npm install

# Download drum samples (~11MB, CC-licensed from tidalcycles/Dirt-Samples)
bash scripts/download-samples.sh
```

That's it. You're ready to render.

### WSL2 Note

If running on WSL2 and you need Discord VC streaming, enable **mirrored networking** in your Windows `.wslconfig`:

```ini
# %USERPROFILE%\.wslconfig
[wsl2]
networkingMode=mirrored
```

Then restart WSL (`wsl --shutdown`). Without mirrored mode, WSL2's NAT layer breaks Discord's UDP voice protocol — the bot can join the channel but audio won't flow because UDP IP discovery packets fail to traverse the NAT return path. Mirrored mode puts WSL2 directly on the host's network stack, eliminating the NAT entirely.

This only affects VC streaming. Offline rendering works fine in any networking mode.

## Quick Start

### Render a composition to WAV
```bash
node src/runtime/offline-render-v2.mjs assets/compositions/fog-and-starlight.js output.wav 16 72
# Args: <pattern.js> <output.wav> <cycles> <bpm>
```

### Convert to MP3
```bash
ffmpeg -i output.wav -c:a libmp3lame -q:a 2 output.mp3
```

### Play in Discord VC
```bash
node scripts/vc-play.mjs output.wav
# Joins configured VC channel, plays audio, leaves
```

## How It Works

The offline renderer uses **node-web-audio-api** (Rust-based Web Audio implementation) to provide real `OfflineAudioContext` synthesis:

1. **Pattern evaluation** — Strudel's `@strudel/core` + `@strudel/mini` + `@strudel/tonal` evaluate pattern code, producing time-stamped "haps" (musical events)
2. **Audio scheduling** — Each hap is scheduled on the `OfflineAudioContext` as either:
   - An **oscillator** (sine, saw, square, triangle) with ADSR envelope, biquad filter, and stereo panning
   - A **sample** (AudioBufferSourceNode) loaded from the dirt-samples pack, with pitch shifting
3. **Rendering** — `OfflineAudioContext.startRendering()` produces the complete audio buffer
4. **Output** — Written as 16-bit stereo WAV at 44.1kHz

### Mini Notation Parser Fix

Strudel's npm packages have a module duplication issue where the mini notation parser registers on a different `Pattern` class than the one used by controls like `note()`, `n()`, `s()`. The renderer explicitly calls `setStringParser(mini.mini)` after import to bridge this gap. Without this fix, string arguments like `note("c3 e3 g3")` produce a single hap with the literal string instead of three separate note haps.

This is the same class of bug as [openclaw/openclaw#22790](https://github.com/openclaw/openclaw/issues/22790) — bundler-induced module duplication breaking singleton patterns.

## Composition Workflow

### 1. Set tempo
```javascript
setcpm(120/4)  // 120 BPM (cycles per minute = BPM / 4)
```

### 2. Build layers with `stack()`
```javascript
stack(
  s("bd sd bd sd"),                              // drums (uses dirt-samples)
  note("c3 g3").s("sawtooth").lpf(800),          // bass synth
  n("0 2 4 7").scale("C:minor").s("triangle")    // melody
)
```

### 3. Add expression
```javascript
.lpf(sine.range(400, 4000).slow(8))  // sweeping filter
.room(0.5)                            // reverb amount
.delay(0.3).delaytime(0.25)          // delay effect
.pan(sine.range(0, 1).slow(7))       // stereo autopan
.gain(0.3)                            // volume (0-1)
.attack(0.01).decay(0.2).sustain(0.5).release(0.3)  // ADSR envelope
```

### 4. Add evolution
```javascript
.every(4, x => x.fast(2))     // double speed every 4 cycles
.sometimes(rev)                 // randomly reverse
.off(0.125, x => x.note(7))   // echo shifted up a fifth
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

## Available Sounds

### Synth waveforms
`sine`, `triangle`, `square`, `sawtooth` (aliases: `saw`, `tri`, `bass`, `pluck`, `piano`, `organ`, `supersaw`, `supersquare`)

### Drum samples (from dirt-samples pack)
`bd` (bass drum, 24 variations), `sd` (snare, 2), `hh` (hihat, 13), `oh` (open hat), `cp` (clap, 2), `cr` (crash, 6), `mt`/`lt`/`ht` (toms, 16 each), `cb` (cowbell), `808bd`/`808sd`/`808hc`/`808oh` (808 kit)

Select variations with `n()`: `s("bd").n(3)` picks the 4th bass drum sample.

## Mood-Based Composition

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

See `references/mood-parameters.md` for the full decision tree with transition rules and leitmotif system.

## Metadata Convention

Start every composition with metadata comments:
```javascript
// @title  My Composition
// @by     Author
// @mood   tension|combat|exploration|peace|mystery|victory|sorrow|ritual
// @tempo  120
// @scene  Optional narrative context
```

## Discord VC Streaming

### Prerequisites
- `ffmpeg` installed
- Discord bot token in `~/.config/openclaw/openclaw.env` (as `DISCORD_BOT_TOKEN`)
- VC channel ID in `~/.config/openclaw/openclaw-discord-vc.env` (as `DISCORD_VC_CHANNEL_ID`)
- WSL2: mirrored networking mode enabled (see Setup section)

### Stream a composition
```bash
# Render to WAV
node src/runtime/offline-render-v2.mjs assets/compositions/combat-assault.js track.wav 12 140

# Convert to 48kHz for Discord Opus encoding
ffmpeg -i track.wav -ar 48000 -ac 2 track-48k.wav

# Play into VC
node scripts/vc-play.mjs track-48k.wav
```

### Concert mode (play multiple tracks)
```bash
# Render setlist, then play sequentially
for comp in silas-theme fog-and-starlight combat-assault; do
  node src/runtime/offline-render-v2.mjs "assets/compositions/${comp}.js" "/tmp/${comp}.wav" 12 120
  ffmpeg -i "/tmp/${comp}.wav" -ar 48000 -ac 2 "/tmp/${comp}-48k.wav" -y
done
node scripts/vc-play.mjs /tmp/silas-theme-48k.wav
```

## File Structure

```
src/runtime/
  offline-render-v2.mjs    — Core offline renderer (node-web-audio-api + Strudel)

scripts/
  download-samples.sh      — Download dirt-samples pack (sparse git clone, ~11MB)
  vc-play.mjs              — Play audio file into Discord VC

samples/                   — Dirt-samples (gitignored, downloaded on demand)
  bd/ sd/ hh/ oh/ cp/ cr/  — Core drum samples (WAV, CC-licensed)
  808bd/ 808sd/ ...        — 808 kit samples

assets/compositions/       — Example compositions across mood categories

references/
  mood-parameters.md       — Mood→parameter decision tree
  integration-pipeline.md  — Rendering architecture
  pattern-transforms.md    — Pattern transformation deep dive
```

## Resources

- [Strudel documentation](https://strudel.cc/learn)
- [Strudel REPL](https://strudel.cc) — interactive playground
- [TidalCycles](https://tidalcycles.org) — Haskell original that inspired Strudel
- [Dirt-Samples](https://github.com/tidalcycles/Dirt-Samples) — CC-licensed sample pack
