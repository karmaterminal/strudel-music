---
name: strudel-music
description: >
  Audio deconstruction and composition via Strudel live-coding. Compose music
  from natural language prompts, render offline to WAV/MP3, stream to Discord VC.
  Deconstruct any audio into stems, extract samples, compose with the vocabulary.
  Usage: /strudel <prompt> | /strudel play <name> | /strudel list | /strudel samples.
version: 0.3.0
author: the dandelion cult
license: MIT
tags: [music, audio, strudel, composition, samples, trance]
user-invocable: true
requires:
  - node >= 20
  - ffmpeg
optional:
  - python3 + demucs (for stem separation)
  - python3 + librosa (for pitch/onset analysis)
metadata:
  openclaw:
    emoji: "🎵"
    requires:
      bins: [node]
      anyBins: [ffmpeg]
      node: ">=20"
    install:
      - id: setup
        kind: script
        script: "npm install && bash scripts/download-samples.sh"
        label: "Install dependencies + download drum samples (~11MB)"
      - id: ffmpeg
        kind: apt
        package: ffmpeg
        bins: [ffmpeg]
        label: "Install ffmpeg (audio format conversion)"
    securityNotes: >
      Strudel compositions are JavaScript evaluated in Node.js. Patterns CAN
      access filesystem, env vars, and network. Only run trusted compositions.
      For untrusted patterns, use a sandbox (container/VM) with no credentials.
---

# Strudel Music 🎵

Compose, render, deconstruct, and remix music using code. Takes natural language prompts → writes Strudel patterns → renders offline through real Web Audio synthesis → posts audio or streams to Discord VC. Can also reverse-engineer any audio track into stems, samples, and generative programs.

> **New here?** Read [docs/ONBOARDING.md](docs/ONBOARDING.md) for a ground-up introduction.

---

## ⚠️ SESSION SAFETY — READ THIS FIRST

**Rendering MUST run as a sub-agent or background process, never inline in your main session.**

The offline renderer (`chunked-render.mjs` / `offline-render-v2.mjs`) runs a tight audio-processing loop that blocks the Node.js event loop. If you run it in your main OpenClaw session, **it will kill the gateway after ~30 seconds** (the heartbeat timeout).

```
✅ Correct: spawn a sub-agent or use background exec
❌ Wrong:   run the renderer inline in your main conversation
```

**Always do this:**
```bash
# Background exec with timeout
exec background:true timeout:120 command:"node src/runtime/chunked-render.mjs src/compositions/my-track.js output/my-track.wav 20"
```

**Or spawn a sub-agent:**
```
sessions_spawn task:"Render strudel-music composition: node src/runtime/chunked-render.mjs ..."
```

This is the #1 way to break things. Don't skip this.

---

## Quick Start

```bash
# 1. Setup
cd ~/.openclaw/workspace/strudel-music
npm run setup              # installs deps + downloads samples (~11MB)

# 2. Verify
npm test                   # 12-point smoke test

# 3. Render
node src/runtime/chunked-render.mjs assets/compositions/fog-and-starlight.js output/fog.wav 16
ffmpeg -i output/fog.wav -codec:a libmp3lame -b:a 192k output/fog.mp3
```

## Commands

| Invocation | What it does |
|---|---|
| `/strudel <prompt>` | Compose from natural language — mood, scene, genre, instruments |
| `/strudel play <name>` | Stream a saved composition into Discord VC |
| `/strudel list` | Show available compositions with metadata |
| `/strudel samples` | Manage sample packs (list, download, add) |
| `/strudel concert <tracks...>` | Play a setlist in Discord VC |

### Composition Workflow

1. Parse prompt → select mood, key, tempo, instruments (see `references/mood-parameters.md`)
2. Write a `.js` composition using Strudel pattern syntax
3. Render (in background!):
   ```bash
   node src/runtime/chunked-render.mjs <file> <output.wav> <cycles> [chunkSize]
   ```
4. Convert to MP3:
   ```bash
   ffmpeg -i output.wav -codec:a libmp3lame -b:a 192k output.mp3
   ```
5. Post the MP3 as attachment or stream to Discord VC

### Discord VC Streaming

```bash
node src/runtime/offline-render-v2.mjs assets/compositions/combat-assault.js /tmp/track.wav 12 140
ffmpeg -i /tmp/track.wav -ar 48000 -ac 2 /tmp/track-48k.wav -y
node scripts/vc-play.mjs /tmp/track-48k.wav
```

WSL2 users: enable mirrored networking (`networkingMode=mirrored` in `.wslconfig`) or VC streaming will fail silently (NAT breaks Discord's UDP voice protocol).

## Sample Management

### Directory Layout

Samples live in `samples/`. Any directory of WAV files is auto-discovered.

```
samples/
├── strudel.json          ← sample map (pitch info, paths)
├── kick/
│   └── kick.wav
├── hat/
│   └── hat.wav
├── bass_Cs1/
│   └── bass_Cs1.wav      ← pitched sample (root: C#1)
├── synth_lead/
│   └── synth_lead.wav     ← pitched sample (root: C#3, declared in strudel.json)
└── bloom_kick/
    └── bloom_kick.wav     ← from audio deconstruction
```

### strudel.json Format

Maps sample names to files with optional root note declarations. The renderer uses this as the authoritative source for pitch detection.

```json
{
  "_base": "./",
  "kick": { "0": "kick/kick.wav" },
  "bass_Cs1": { "cs1": "bass_Cs1/bass_Cs1.wav" },
  "synth_lead": { "cs3": "synth_lead/synth_lead.wav" }
}
```

- Keys with note suffixes (`_Cs1`, `_D2`) declare the root pitch
- Unpitched samples use `"0"` as the key
- Always declare root notes for pitched samples — without it, the renderer defaults to C4, causing wrong transpositions (see [docs/KNOWN-PITFALLS.md](docs/KNOWN-PITFALLS.md#3-root-note-detection-defaults))

### Managing Packs

```bash
bash scripts/samples-manage.sh list              # show installed packs
bash scripts/samples-manage.sh add <url>          # download from URL
bash scripts/samples-manage.sh add ~/my-samples/  # add local directory
```

Ships with **dirt-samples** (153 WAVs, CC-licensed). Security: downloads enforce size limits (`STRUDEL_MAX_DOWNLOAD_MB`, default 10GB), MIME validation, optional host allowlist (`STRUDEL_ALLOWED_HOSTS`).

## Composition Guide

### Pattern Basics

```javascript
setcpm(120/4)  // 120 BPM

stack(
  s("bd sd [bd bd] sd").gain(0.4),           // drums (samples)
  s("[hh hh] [hh oh]").gain(0.2),            // hats
  note("c3 eb3 g3 c4")                       // melody
    .s("sawtooth")
    .lpf(sine.range(400, 2000).slow(8))      // filter sweep
    .attack(0.01).decay(0.3).sustain(0.2)    // ADSR envelope
    .room(0.4).delay(0.2)                    // space
    .gain(0.3)
)
```

### Mini Notation Quick Ref

| Syntax | Meaning |
|---|---|
| `"a b c d"` | Sequence (one per beat) |
| `"[a b]"` | Subdivide (two in one beat) |
| `"<a b c>"` | Alternate per cycle (slowcat) |
| `"a*3"` | Repeat |
| `"~"` | Rest / silence |
| `.slow(2)` / `.fast(2)` | Time stretch |
| `.euclid(3,8)` | Euclidean rhythm |

### Mood → Parameter Decision Tree

| Mood | Tempo | Key/Scale | Character |
|---|---|---|---|
| tension | 60-80 | minor/phrygian | Low cutoff, sparse, drones |
| combat | 120-160 | minor | Heavy drums, fast, distorted |
| peace | 60-80 | pentatonic/major | Warm, slow, ambient |
| mystery | 70-90 | whole tone | Reverb, sparse |
| victory | 110-130 | major | Bright, fanfare |
| ritual | 45-60 | dorian | Organ drones, chant |

Full tree: `references/mood-parameters.md`. Production techniques: `references/production-techniques.md`.

### ⚠️ Critical Pitfall: Gain Patterns

Use `<>` (slowcat) for sequential values, NOT spaces:

```javascript
// ❌ WRONG — all values play simultaneously, causes clipping
s("kick").gain("0.3 0.3 0.5 0.3")

// ✅ RIGHT — one value per cycle
s("kick").gain("<0.3 0.3 0.5 0.3>")
```

Full list: [docs/KNOWN-PITFALLS.md](docs/KNOWN-PITFALLS.md)

### Loudness Validation

Always check after rendering:
```bash
ffmpeg -i output.wav -af loudnorm=print_format=json -f null - 2>&1 | grep -E "input_i|input_tp"
```
Target: -16 to -10 LUFS, true peak below -1 dBTP. Above -5 LUFS = something is wrong.

## Audio Deconstruction Pipeline

Full pipeline docs: [references/integration-pipeline.md](references/integration-pipeline.md)

```
Audio → Demucs (stems) → librosa (analysis) → strudel.json → Composition → Render
```

1. **Stem separation** — Demucs splits audio into vocals, drums, bass, other
2. **Analysis** — librosa extracts pitches, onsets, rhythm patterns
3. **Sample mapping** — Results written to `strudel.json` with root notes
4. **Two paths:**
   - **Grammar extraction** (through-composed music) → generative program capturing statistical DNA
   - **Sample-based** (stanzaic/repetitive music) → stem slices played back through Strudel

Requires Python stack: `uv init && uv add demucs librosa scikit-learn soundfile`

## File Structure

```
src/runtime/
  chunked-render.mjs      — Chunked offline renderer (avoids OOM on long pieces)
  offline-render-v2.mjs    — Core offline renderer
  smoke-test.mjs           — 12-point smoke test
scripts/
  download-samples.sh      — Download dirt-samples (idempotent)
  samples-manage.sh        — Sample pack manager
  vc-play.mjs              — Stream audio to Discord VC
samples/                   — Sample packs + strudel.json (gitignored)
assets/compositions/       — 15 original compositions
src/compositions/          — Audio deconstructions
references/                — Mood trees, techniques, architecture
docs/
  KNOWN-PITFALLS.md        — Critical composition pitfalls
  ONBOARDING.md            — Machine-actor onboarding guide
```

## Renderer Internals

Uses **node-web-audio-api** (Rust-based Web Audio for Node.js). No browser, no Puppeteer.

The renderer calls `setStringParser(mini.mini)` after import because Strudel's npm dist bundles duplicate the `Pattern` class across modules — the mini notation parser registers on a different copy than the one used by `note()` and `s()`.

All synthesis is local and offline via `OfflineAudioContext`: oscillators, biquad filters, ADSR envelopes, `AudioBufferSourceNode` for samples, dynamics compression, stereo panning. Output: 16-bit stereo WAV at 44.1kHz.
