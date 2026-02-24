---
name: strudel-music
description: "Compose, render, and play music using Strudel live-coding patterns. Usage: /strudel <prompt> — describe what you want to hear (mood, scene, genre, instruments). /strudel play <name> — play a saved composition in Discord VC. /strudel samples — manage sample packs. /strudel list — show available compositions. Like /imagine for Midjourney, but for music."
user-invocable: true
metadata: { "openclaw": { "emoji": "🎵", "requires": { "bins": ["node"], "anyBins": ["ffmpeg"], "env": ["DISCORD_BOT_TOKEN"], "node": ">=18", "description": "Offline rendering requires Node.js 18+. ffmpeg needed for MP3/Opus conversion. DISCORD_BOT_TOKEN only required for VC streaming — compose/render works without it." }, "primaryEnv": "DISCORD_BOT_TOKEN", "install": [{ "id": "setup", "kind": "script", "script": "npm install && bash scripts/download-samples.sh", "label": "Install dependencies + download drum samples (~11MB from github.com/tidalcycles/Dirt-Samples, CC-licensed)" }, { "id": "ffmpeg", "kind": "apt", "package": "ffmpeg", "bins": ["ffmpeg"], "label": "Install ffmpeg (audio format conversion)" }], "securityNotes": "PATTERN EXECUTION: Strudel compositions are JavaScript evaluated in Node.js. Patterns CAN access the filesystem, environment variables, and network. Only run compositions you trust. For untrusted patterns, run in a sandbox (container/VM) with no credentials mounted. SAMPLE DOWNLOADS: Default samples fetched from github.com/tidalcycles/Dirt-Samples (CC-licensed). The 'samples add <url>' command enforces a configurable size limit (STRUDEL_MAX_DOWNLOAD_MB, default 10240/10GB), MIME type validation on downloaded archives, and an optional host allowlist (STRUDEL_ALLOWED_HOSTS, comma-separated). Only add packs from trusted sources. CREDENTIALS: DISCORD_BOT_TOKEN is only needed for VC streaming. Compose/render/list work with zero credentials. If providing a token, use minimal scopes (Connect, Speak, Send Messages). RENDERING: All audio synthesis is local and offline via node-web-audio-api (Rust/C++ Web Audio for Node.js). No browser, no puppeteer, no remote code execution. Legacy browser renderer scripts exist in repo but are marked DEPRECATED and not invoked by the skill. RECOMMENDED: Run this skill in an OpenClaw sandbox when accepting user-submitted patterns." } }
---

# Strudel Music 🎵

**Like `/imagine` for Midjourney, but for music.** Compose, render, and stream music using Strudel live-coding patterns — entirely offline, no browser required.

## Command Interface

When a user invokes `/strudel`, route based on intent:

### `/strudel <prompt>` — Compose from description
Generate a Strudel pattern from a natural language prompt. The agent interprets the mood, instruments, tempo, and structure, writes a composition file, renders it to audio, and posts the result.

**Examples:**
- `/strudel dark ambient tension, low drones, sparse percussion, 65bpm`
- `/strudel upbeat tavern music with fiddle and drums`
- `/strudel lo-fi chill beats to study to`
- `/strudel epic battle music, brass and timpani, 140bpm`
- `/strudel a theme for a character named Cael — curious, quick, a little dangerous`

**Workflow:**
1. Parse prompt → select mood, key, tempo, instruments from the decision tree
2. Write a `.js` composition file using Strudel pattern syntax
3. Render via `node src/runtime/offline-render-v2.mjs <file> <output.wav> <cycles> <bpm>`
4. Convert: `ffmpeg -i output.wav -c:a libmp3lame -q:a 2 output.mp3`
5. Post the MP3 as an attachment in the channel
6. Optionally: play in Discord VC if user is in a voice channel

### `/strudel play <name>` — Play in Discord VC
Stream a saved composition into the user's Discord voice channel.

```bash
# Render + convert + stream
node src/runtime/offline-render-v2.mjs "assets/compositions/<name>.js" /tmp/<name>.wav 16 120
ffmpeg -i /tmp/<name>.wav -ar 48000 -ac 2 /tmp/<name>-48k.wav -y
node scripts/vc-play.mjs /tmp/<name>-48k.wav
```

### `/strudel list` — Show available compositions
List all `.js` files in `assets/compositions/` with their metadata (`@title`, `@mood`, `@tempo`).

### `/strudel samples` — Manage sample packs
**Subcommands:**
- `/strudel samples list` — show installed sample directories and counts
- `/strudel samples download` — re-run `scripts/download-samples.sh` (idempotent — skips if already present)
- `/strudel samples add <url>` — download a sample pack from a URL (ZIP/tar containing WAV directories)
- `/strudel samples add <path>` — symlink or copy a local directory into `samples/`

**How custom samples work:**
Drop any directory of WAV files into `samples/<name>/`. They're automatically discovered by the renderer. Use them in patterns with `s("<name>")`. Variations are indexed by filename sort order — access with `s("<name>").n(3)`.

Example: if you have an Ableton drum rack exported as WAVs:
```
samples/
  my-kit/
    kick-soft.wav    → s("my-kit").n(0)
    kick-hard.wav    → s("my-kit").n(1)
    snare-tight.wav  → s("my-kit").n(2)
    snare-loose.wav  → s("my-kit").n(3)
```

### `/strudel concert <name> [name2] [name3] ...` — Play a setlist
Render and stream multiple compositions sequentially into Discord VC.

## Setup

```bash
npm run setup
# Installs all deps + downloads dirt-samples (~11MB, CC-licensed)
```

That's it. First render: `npm run test:render`

### Adding more sample packs

The skill ships with **dirt-samples** (96 WAVs: kicks, snares, hats, toms, 808s). For richer sounds, add sample packs:

**CC0 / Free packs (just download and drop in `samples/`):**
- [Dirt-Samples](https://github.com/tidalcycles/Dirt-Samples) — 800+ samples (full pack, we ship a subset)
- [Signature Sounds – Homemade Drum Kit](https://signalsounds.com) (CC0) — 150+ one-shots
- [Looping – Synth Pack 01](https://looping.com) (CC0) — synth one-shots + loops
- [artgamesound.com](https://artgamesound.com) — CC0 searchable aggregator

**Your own packs:** Export from any DAW (Ableton, FL Studio, M8 tracker, etc.) as WAV directories. Strudel doesn't care where they came from — it's just WAV files in folders.

**Named banks** (Strudel built-in, requires CDN access):
```javascript
sound("bd sd cp hh").bank("RolandTR909")
sound("bd sd hh oh").bank("LinnDrum")
```

### WSL2 Note

If running on WSL2 and streaming to Discord VC, enable **mirrored networking**:

```ini
# %USERPROFILE%\.wslconfig
[wsl2]
networkingMode=mirrored
```

Then `wsl --shutdown` and relaunch. Without this, WSL2's NAT breaks Discord's UDP voice protocol — the bot joins the channel but no audio flows because IP discovery packets can't traverse the NAT return path. Mirrored mode eliminates the NAT by putting WSL2 directly on the host's network stack.

This only affects VC streaming. Offline rendering and file posting work in any networking mode.

## How It Works

The offline renderer uses **node-web-audio-api** (Rust-based Web Audio for Node.js) for real audio synthesis:

1. **Pattern evaluation** — `@strudel/core` + `@strudel/mini` + `@strudel/tonal` parse pattern code into timed "haps"
2. **Audio scheduling** — Each hap becomes either:
   - An **oscillator** (sine/saw/square/triangle) with ADSR envelope, biquad filter, stereo pan
   - A **sample** (AudioBufferSourceNode) from the samples directory, with pitch shifting
3. **Offline rendering** — `OfflineAudioContext.startRendering()` produces complete audio
4. **Output** — 16-bit stereo WAV at 44.1kHz → ffmpeg → MP3/Opus

**Note on mini notation:** The renderer explicitly calls `setStringParser(mini.mini)` after import because Strudel's npm dist bundles duplicate the Pattern class across modules. Same class of bug as [openclaw#22790](https://github.com/openclaw/openclaw/issues/22790).

## Composition Reference

### Tempo
```javascript
setcpm(120/4)  // 120 BPM
```

### Layering
```javascript
stack(
  s("bd sd bd sd"),                              // drums
  note("c3 g3").s("sawtooth").lpf(800),          // bass
  n("0 2 4 7").scale("C:minor").s("triangle")    // melody
)
```

### Pattern syntax
- `"a b c d"` — sequence (one per beat)
- `"[a b]"` — subdivide (two in one beat)
- `"<a b c>"` — alternate per cycle
- `"a*3"` — repeat
- `"~"` — rest/silence
- `.slow(2)` / `.fast(2)` — time stretch
- `.euclid(3,8)` — Euclidean rhythm

### Expression
```javascript
.lpf(sine.range(400, 4000).slow(8))   // filter sweep
.gain(sine.range(0.1, 0.2).slow(9))   // breathing volume
.pan(perlin.range(0.2, 0.8))          // organic stereo
.room(0.5).roomsize(4)                 // reverb
.delay(0.3).delaytime(0.25)           // delay
.attack(0.01).decay(0.2).sustain(0.5).release(0.3)  // ADSR
```

### Song structure
```javascript
let intro = stack(pad, noise)
let verse = stack(drums, bass, melody)
let chorus = stack(drums, bass, melody, lead)

arrange(
  [8, intro],
  [16, verse],
  [8, chorus]
).cpm(120/4)
```

### Mood→Parameter decision tree

| Mood | Tempo | Key/Scale | Character |
|------|-------|-----------|-----------|
| tension | 60-80 | minor/phrygian | Low cutoff, sparse, drones |
| combat | 120-160 | minor | Heavy drums, fast, distorted |
| exploration | 80-100 | dorian/mixolydian | Open, delay, mid energy |
| peace | 60-80 | pentatonic/major | Warm, slow, ambient |
| mystery | 70-90 | whole tone | Reverb, sparse, unpredictable |
| victory | 110-130 | major | Bright, fanfare, full |
| sorrow | 48-65 | minor | Sustained pads, minimal |
| ritual | 45-60 | dorian | Organ drones, chant |

See `references/mood-parameters.md` for the full tree with transitions and leitmotifs.
See `references/production-techniques.md` for advanced techniques (breathing, shimmer, earth pressure).

## File Structure

```
src/runtime/
  offline-render-v2.mjs    — Core offline renderer
  smoke-test.mjs           — 12-point verification test

scripts/
  download-samples.sh      — Download dirt-samples (idempotent)
  vc-play.mjs              — Stream audio to Discord VC

samples/                   — Sample packs (gitignored, downloaded on demand)
assets/compositions/       — Saved compositions
references/                — Mood trees, techniques, architecture docs
```
