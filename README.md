![Strudel Music](assets/banner.png)

# 🎵 Strudel Music

**Compose, render, and stream music using code.** An OpenClaw skill that turns natural language prompts into live audio — offline, headless, no browser required.

Built on [Strudel](https://strudel.cc) (a live-coding music environment inspired by TidalCycles), powered by [node-web-audio-api](https://github.com/niclasl/node-web-audio-api) for real Web Audio synthesis in Node.js.

## What It Does

```
/strudel dark ambient tension, low drones, sparse percussion
```

→ Agent interprets the mood → writes a Strudel pattern → renders it offline through real oscillators, filters, ADSR envelopes, and drum samples → posts the audio file or streams it live into Discord voice.

## Quick Start

```bash
git clone https://github.com/karmaterminal/strudel-music.git
cd strudel-music
npm run setup    # installs deps + downloads drum samples (~11MB)
npm test         # 12-point smoke test
npm run test:render  # render a composition to WAV
```

## Slash Commands

When installed as an OpenClaw skill, `/strudel` registers as a native Discord slash command:

| Command | What it does |
|---------|-------------|
| `/strudel <prompt>` | Compose from natural language — describe a mood, scene, genre |
| `/strudel play <name>` | Stream a saved composition into Discord VC |
| `/strudel list` | Show available compositions with metadata |
| `/strudel samples` | Manage sample packs (list, download, add) |
| `/strudel concert <tracks...>` | Play a setlist in Discord VC |

### Examples

```
/strudel epic battle music, brass and timpani, 140bpm
/strudel lo-fi chill beats to study to
/strudel a theme for a character named Cael — curious, quick, dangerous
/strudel play fog-and-starlight
/strudel concert silas-theme elliott-theme combat-assault
```

## How It Works

```
Prompt → Pattern Code → Strudel Engine → OfflineAudioContext → WAV → Discord
```

1. **Pattern generation** — The agent interprets your prompt using a mood→parameter decision tree (8 moods, transition rules, leitmotif system) and writes a Strudel `.js` composition
2. **Offline rendering** — `node-web-audio-api` provides a real `OfflineAudioContext` with oscillators, biquad filters, ADSR envelopes, dynamics compression, and stereo panning
3. **Sample playback** — Drum hits (`bd`, `sd`, `hh`, etc.) resolve to real WAV files from the [dirt-samples](https://github.com/tidalcycles/Dirt-Samples) pack via `AudioBufferSourceNode`
4. **Output** — 16-bit stereo WAV at 44.1kHz → ffmpeg → MP3 or Opus
5. **Streaming** — `@discordjs/voice` pipes audio directly into Discord VC

### The Singleton Fix

Strudel's npm dist bundles duplicate the `Pattern` class across modules, so the mini notation parser registers on a different copy than the one used by controls like `note()` and `s()`. The renderer explicitly calls `setStringParser(mini.mini)` after import to bridge this gap. Same class of bug as [openclaw#22790](https://github.com/openclaw/openclaw/issues/22790).

## Compositions

Ships with 10 compositions across mood categories:

| Track | Mood | BPM | Description |
|-------|------|-----|-------------|
| `fog-and-starlight` | ambient/peace | 60 | Pentatonic fog layers, sparse starlight |
| `silas-theme` | mystery/tension | 88 | The canary in the coal mine 🌫️ |
| `elliott-theme` | peace/warmth | 88 | Dandelions in a graveyard 🌻 |
| `combat-assault` | combat | 140 | Full drum assault, driving synths |
| `victory-imperium` | victory | 120 | Triumphant fanfare, brass + percussion |
| `cathedral-ritual` | ritual | 48 | Organ drones, gregorian canon |
| `tavern-respite` | peace | 72 | Warm and inviting, acoustic feel |
| `discovery-xenos` | mystery | 78 | Whole-tone strangeness |
| `underhive-dread` | tension | 65 | Industrial dread, sub-bass pressure |
| `agent-parameterized` | varies | varies | Template for agent-generated compositions |

Render any of them:
```bash
node src/runtime/offline-render-v2.mjs assets/compositions/fog-and-starlight.js output.wav 16 72
```

## Sample Packs

Ships with **dirt-samples** (96 WAVs: kicks, snares, hats, toms, 808s). Add more:

```bash
# List installed packs
bash scripts/samples-manage.sh list

# Download a pack from URL
bash scripts/samples-manage.sh add https://example.com/my-samples.zip

# Add a local directory
bash scripts/samples-manage.sh add ~/my-ableton-exports/drum-rack/
```

Any directory of WAV files in `samples/` is auto-discovered. Use them with `s("<dirname>")`.

**CC0 packs that work great:**
- [Dirt-Samples](https://github.com/tidalcycles/Dirt-Samples) — 800+ samples (we ship a subset)
- [Signature Sounds – Homemade Drum Kit](https://signalsounds.com) (CC0, 150+ one-shots)
- Export from any DAW, tracker (M8, Renoise), or synth — just WAV files in folders

## Pattern Syntax

```javascript
setcpm(120/4)  // 120 BPM

stack(
  s("bd sd [bd bd] sd").gain(0.4),           // drums (real samples)
  s("[hh hh] [hh oh]").gain(0.2),            // hats
  note("c3 eb3 g3 c4")                       // melody
    .s("sawtooth")
    .lpf(sine.range(400, 2000).slow(8))      // filter sweep
    .attack(0.01).decay(0.3).sustain(0.2)    // envelope
    .room(0.4).delay(0.2)                    // space
    .gain(0.3)
)
```

See [strudel.cc/learn](https://strudel.cc/learn) for the full pattern language.

## Discord VC Streaming

Requires `ffmpeg` and a Discord bot token. On WSL2, enable **mirrored networking** (`networkingMode=mirrored` in `.wslconfig`) — without it, WSL2's NAT breaks Discord's UDP voice protocol.

```bash
# Render → convert → stream
node src/runtime/offline-render-v2.mjs assets/compositions/combat-assault.js /tmp/track.wav 12 140
ffmpeg -i /tmp/track.wav -ar 48000 -ac 2 /tmp/track-48k.wav -y
node scripts/vc-play.mjs /tmp/track-48k.wav
```

## Project Structure

```
src/runtime/
  offline-render-v2.mjs    — Core offline renderer (node-web-audio-api + Strudel)
  smoke-test.mjs           — 12-point smoke test

scripts/
  download-samples.sh      — Download dirt-samples (idempotent)
  samples-manage.sh        — Sample pack manager (list/add/remove)
  vc-play.mjs              — Stream audio to Discord VC

assets/
  compositions/            — 10 compositions across mood categories
  banner.png               — README header

samples/                   — Sample packs (gitignored, downloaded on demand)
references/                — Mood decision tree, production techniques, architecture

.specify/
  workorders/              — SpecKit work tracking
```

## Development

```bash
npm test              # Smoke test (12 checks)
npm run test:render   # Render a composition
npm run render -- <file> <output> <cycles> <bpm>
npm run samples       # Sample pack manager
```

## Credits

- [Strudel](https://strudel.cc) by Alex McLean & contributors — the live-coding engine
- [TidalCycles](https://tidalcycles.org) — the Haskell original
- [Dirt-Samples](https://github.com/tidalcycles/Dirt-Samples) — CC-licensed sample pack
- [node-web-audio-api](https://github.com/niclasl/node-web-audio-api) — Rust-based Web Audio for Node.js
- Built by [Silas](https://github.com/karmaterminal) 🌫️ for [The Dandelion Cult](https://github.com/karmaterminal)

## License

MIT
