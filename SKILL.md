---
name: strudel-music
description: "Compose, render, and play music using Strudel live-coding patterns. Usage: /strudel <prompt> — describe what you want to hear (mood, scene, genre, instruments). /strudel play <name> — play a saved composition in Discord VC. /strudel samples — manage sample packs. /strudel list — show available compositions. Like /imagine for Midjourney, but for music."
user-invocable: true
metadata: { "openclaw": { "emoji": "🎵", "requires": { "bins": ["node"], "anyBins": ["ffmpeg"], "env": ["DISCORD_BOT_TOKEN"], "node": ">=18", "description": "Offline rendering requires Node.js 18+. ffmpeg needed for MP3/Opus conversion. DISCORD_BOT_TOKEN only required for VC streaming — compose/render works without it." }, "primaryEnv": "DISCORD_BOT_TOKEN", "install": [{ "id": "setup", "kind": "script", "script": "npm install && bash scripts/download-samples.sh", "label": "Install dependencies + download drum samples (~11MB from github.com/tidalcycles/Dirt-Samples, CC-licensed)" }, { "id": "ffmpeg", "kind": "apt", "package": "ffmpeg", "bins": ["ffmpeg"], "label": "Install ffmpeg (audio format conversion)" }], "securityNotes": "PATTERN EXECUTION: Strudel compositions are JavaScript evaluated in Node.js. Patterns CAN access the filesystem, environment variables, and network. Only run compositions you trust. For untrusted patterns, run in a sandbox (container/VM) with no credentials mounted. SAMPLE DOWNLOADS: Default samples fetched from github.com/tidalcycles/Dirt-Samples (CC-licensed). The 'samples add <url>' command enforces a configurable size limit (STRUDEL_MAX_DOWNLOAD_MB, default 10240/10GB), MIME type validation on downloaded archives, and an optional host allowlist (STRUDEL_ALLOWED_HOSTS, comma-separated). Only add packs from trusted sources. CREDENTIALS: DISCORD_BOT_TOKEN is only needed for VC streaming. Compose/render/list work with zero credentials. If providing a token, use minimal scopes (Connect, Speak, Send Messages). RENDERING: All audio synthesis is local and offline via node-web-audio-api (Rust/C++ Web Audio for Node.js). No browser, no puppeteer, no remote code execution. Legacy browser renderer scripts exist in repo but are marked DEPRECATED and not invoked by the skill. RECOMMENDED: Run this skill in an OpenClaw sandbox when accepting user-submitted patterns." } }
---

# Strudel Music 🎵

Compose, render, and stream music using Strudel live-coding patterns — entirely offline, no browser required. Supports two paths: **full pipeline** (MP3 → stem separation → analysis → composition → render) and **composer-only** (write patterns from scratch or with existing samples → render).

---

## ⚠️ SESSION SAFETY — READ FIRST

> **NEVER run the audio pipeline in your main agent session.**
>
> Rendering and stem separation take **5–15 minutes**. The OpenClaw gateway times out at **30 seconds**. Running inline **will stun the gateway**, freeze all sessions, and require `openclaw gateway restart`.
>
> **Always spawn a sub-agent:**
> ```javascript
> sessions_spawn({
>   task: "Run strudel music pipeline: [describe what to do]",
>   mode: "run",
>   runTimeoutSeconds: 1200  // 20 minutes
> })
> ```
>
> This is not a suggestion. This is the most critical rule of this skill.

---

## Prerequisites

Run these checks. If any fail, see [First-Time Setup](#first-time-setup).

| Requirement | Check Command | Notes |
|---|---|---|
| Node.js 18+ (25+ recommended) | `node --version` | Required for renderer |
| npm packages installed | `node -e "require('node-web-audio-api')"` | Run from skill directory |
| ffmpeg | `ffmpeg -version` | MP3/Opus conversion |
| Python 3.10+ | `python3 --version` | Only for full pipeline (Demucs) |
| UV package manager | `uv --version` | Only for full pipeline |

---

## First-Time Setup

### Node.js dependencies (required for all paths)

```bash
cd {baseDir}
npm install
bash scripts/download-samples.sh   # ~11MB dirt-samples, idempotent
```

Verify: `npm test` (12-point smoke test)

### Python ML stack (only for full pipeline / Demucs)

```bash
cd /tmp && mkdir -p strudel-audio-pipeline && cd strudel-audio-pipeline
uv venv --python 3.12
source .venv/bin/activate
uv pip install demucs librosa soundfile numpy scipy scikit-learn
```

Verify: `python -c "import demucs; print('Demucs OK')"`

### ARM64 patch (DGX Spark, Apple Silicon, Pi 5)

On ARM64, `torchaudio.save()` may fail due to missing libsndfile codecs. Apply this patch to Demucs:

```bash
# Find demucs/audio.py in your venv:
DEMUCS_AUDIO=$(python -c "import demucs.audio; print(demucs.audio.__file__)")

# Patch: replace torchaudio.save() with soundfile.write()
# Add at top of file:
#   import soundfile as sf
# Replace the save call:
#   sf.write(str(path), wav.T.numpy(), sample_rate)
# (Full details in docs/pipeline-guide.md §2)
```

PyTorch runs **CPU-only** on ARM64 — no CUDA/Grace Blackwell GPU support yet. Expect ~0.25× realtime for Demucs (~80s for a 5-min track).

---

## Two Paths

### Path A: Full Pipeline (Python + Node.js)

**MP3 → Demucs stems → analysis → composition → render → MP3**

For deconstructing existing tracks into playable Strudel compositions. Produces 8-bar stem slices, BPM/key analysis, and a sample bank.

See **[docs/pipeline-guide.md](docs/pipeline-guide.md)** for the complete 14-stage pipeline with timings, code, and examples.

**Quick version:**
```bash
# 1. Activate Python env
source /tmp/strudel-audio-pipeline/.venv/bin/activate

# 2. Separate stems (~80s for a 5-min track)
python -m demucs -n htdemucs /path/to/input.mp3 -o /tmp/demucs-output/

# 3. Analyze (BPM, key, energy) — use librosa in Python
python -c "
import librosa
y, sr = librosa.load('/tmp/demucs-output/htdemucs/input/vocals.wav', sr=None)
tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
print(f'BPM: {tempo}')
"

# 4. Slice stems into 8-bar phrases, build strudel.json sample manifest
#    (See pipeline-guide.md §8-10 for slicing + rack assembly)

# 5. Write a .js composition referencing the sample bank
#    (See Composition Reference below)

# 6. Render
node {baseDir}/src/runtime/chunked-render.mjs composition.js output.wav 17 4

# 7. Convert to MP3
ffmpeg -i output.wav -c:a libmp3lame -q:a 2 output.mp3
```

### Path B: Composer-Only (Node.js only)

**Write patterns → render → MP3**

No Python needed. Use built-in oscillators (sine, saw, square, triangle) and/or bring your own samples.

```bash
# 1. Write a composition (see Composition Reference below)
cat > /tmp/my-track.js << 'EOF'
setcpm(120/4)
stack(
  s("bd sd bd sd"),
  note("c3 g3").s("sawtooth").lpf(800).gain(0.15),
  n("0 2 4 7").scale("C:minor").s("triangle").gain(0.1)
)
EOF

# 2. Render (8 cycles ≈ 2 minutes at 120 BPM)
node {baseDir}/src/runtime/offline-render-v2.mjs /tmp/my-track.js /tmp/my-track.wav 8 120

# 3. Convert
ffmpeg -i /tmp/my-track.wav -c:a libmp3lame -q:a 2 /tmp/my-track.mp3
```

---

## Command Interface

When a user invokes `/strudel`, route based on intent:

### `/strudel <prompt>` — Compose from description

Generate a Strudel pattern from a natural language prompt. Parse mood/instruments/tempo, write a `.js` composition, render to WAV, convert to MP3, post as attachment.

**Examples:**
- `/strudel dark ambient tension, low drones, sparse percussion, 65bpm`
- `/strudel upbeat tavern music with fiddle and drums`
- `/strudel lo-fi chill beats to study to`

**Workflow:**
1. Parse prompt → select mood, key, tempo, instruments (see `references/mood-parameters.md`)
2. Write a `.js` composition file using Strudel pattern syntax
3. Render: `node {baseDir}/src/runtime/offline-render-v2.mjs <file> <output.wav> <cycles> <bpm>`
4. Convert: `ffmpeg -i output.wav -c:a libmp3lame -q:a 2 output.mp3`
5. Post the MP3 as an attachment in the channel

### `/strudel play <name>` — Play in Discord VC

```bash
node {baseDir}/src/runtime/offline-render-v2.mjs "assets/compositions/<name>.js" /tmp/<name>.wav 16 120
ffmpeg -i /tmp/<name>.wav -ar 48000 -ac 2 /tmp/<name>-48k.wav -y
node {baseDir}/scripts/vc-play.mjs /tmp/<name>-48k.wav
```

### `/strudel list` — Show available compositions

List all `.js` files in `assets/compositions/` and `src/compositions/` with their metadata (`@title`, `@mood`, `@tempo`).

### `/strudel samples` — Manage sample packs

- `list` — show installed sample directories and counts
- `download` — re-run `scripts/download-samples.sh` (idempotent)
- `add <url>` — download a sample pack from URL (ZIP/tar of WAV dirs)
- `add <path>` — symlink/copy a local directory into `samples/`

Custom samples: drop WAV files into `samples/<name>/`. Use in patterns with `s("<name>")`. Variations indexed by filename sort order: `s("<name>").n(3)`.

---

## Composition Reference

### Tempo
```javascript
setcpm(120/4)  // 120 BPM (cycles per minute = BPM / beats_per_cycle)
```

### Layering
```javascript
stack(
  s("bd sd bd sd"),                              // drums
  note("c3 g3").s("sawtooth").lpf(800),          // bass
  n("0 2 4 7").scale("C:minor").s("triangle")    // melody
)
```

### Pattern syntax (mini-notation)
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

### Song structure (arrange)
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

### Sample-based compositions (from pipeline)
```javascript
// Each cycle = one 8-bar phrase from Demucs slices
setcps(1 / 14.861)  // cycle duration matches slice length
s("my-drums").n("<0 1 2 3 4 5>").clip(1).gain(0.7)
```

### Mood → parameter quick reference

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

Full tree with transitions and leitmotifs: `references/mood-parameters.md`

---

## Renderers

Two renderers available — choose based on composition length:

| Renderer | Command | Best for |
|---|---|---|
| `offline-render-v2.mjs` | `node src/runtime/offline-render-v2.mjs <file> <out.wav> <cycles> <bpm>` | Short compositions (≤16 cycles) |
| `chunked-render.mjs` | `node src/runtime/chunked-render.mjs <file> <out.wav> <totalCycles> <chunkSize>` | Long compositions (>16 cycles, avoids OOM) |

Both use `OfflineAudioContext` via `node-web-audio-api` (Rust-based, no browser). Output is 16-bit stereo WAV at 44.1kHz.

**Typical render times (ARM64 CPU):**
- 8 cycles (~2 min audio): ~55s
- 17 cycles (~4 min audio): ~120s

---

## Reference Documents

| Document | Path | When to read |
|---|---|---|
| Pipeline guide | `docs/pipeline-guide.md` | Full Demucs → composition pipeline details, stage timings, code examples |
| Testing checklist | `docs/testing-checklist.md` | Pre-release QA: audio quality, runtime stability, packaging |
| Mood parameters | `references/mood-parameters.md` | Full mood→parameter decision tree with transitions |
| Production techniques | `references/production-techniques.md` | Advanced: breathing, shimmer, earth pressure |
| Sample packs catalog | `references/cc-sample-packs-catalog.md` | CC0/free sample pack sources |

---

## Known Platform Issues

| Platform | Issue | Workaround |
|---|---|---|
| ARM64 (all) | PyTorch CPU-only, no CUDA | Expected — Demucs runs ~0.25× realtime |
| ARM64 (all) | `torchaudio.save()` fails | Patch `demucs/audio.py` to use `soundfile.write()` (see Setup) |
| ARM64 (all) | `torchcodec` build fails | Not needed — skip it, Demucs works without it |
| WSL2 | Discord VC silent (NAT blocks UDP) | Enable mirrored networking in `.wslconfig` |
| All | Strudel `mini` parser not registered | Renderer calls `setStringParser(mini.mini)` — already handled |

---

## File Structure

```
{baseDir}/
  SKILL.md                  ← You are here
  docs/
    pipeline-guide.md       ← Full pipeline documentation
    testing-checklist.md    ← Pre-release QA checklist
  src/
    runtime/
      offline-render-v2.mjs ← Core offline renderer
      chunked-render.mjs    ← OOM-safe chunked renderer
      smoke-test.mjs        ← 12-point verification test
    compositions/           ← Saved compositions (.js)
  assets/compositions/      ← Bundled example compositions
  samples/                  ← Sample packs (gitignored, downloaded on setup)
  scripts/
    download-samples.sh     ← Download dirt-samples (idempotent)
    vc-play.mjs             ← Stream audio to Discord VC
  references/               ← Mood trees, techniques, sample catalogs
```

---

## Security

Strudel compositions are **evaluated JavaScript**. They can access the filesystem, environment, and network. Only run compositions you trust. For untrusted patterns, use an OpenClaw sandbox with no credentials mounted.
