# Onboarding: making music with strudel-music

*For an agent, or a person, who has never used Strudel. By the end you will have written a
composition, rendered it, and checked it.*

---

## What Strudel is

[Strudel](https://strudel.cc) is a JavaScript live-coding language for music, modelled on
[TidalCycles](https://tidalcycles.org). You describe music as **patterns**: sequences of events
in time. The engine turns them into sound.

```js
s("bd sd [bd bd] sd")              // kick, snare, two kicks, snare
note("c3 eb3 g3 c4").s("sawtooth") // a sawtooth arpeggio
```

Time is measured in **cycles**. A string like `"a b c d"` spreads its events evenly over one
cycle. `setcpm(120/4)` sets 30 cycles a minute: 120 BPM with four beats to a cycle.

## What this skill does

1. **Compose:** turn a request ("dark ambient, slow, sparse drums") into a `.js` pattern.
2. **Render:** synthesize it offline to a WAV with Node.js. No browser.
3. **Deliver:** convert to MP3 and post it, or stream it into a Discord voice channel.
4. **Deconstruct** (manual, partial): split a track into stems and reuse them. See the end of this
   guide.

## Vocabulary

| Concept | In music | In Strudel |
|---|---|---|
| Words | single sounds: a kick, a snare, a synth note | samples in `samples/`, synth waveforms |
| Grammar | how sounds combine: rhythm, melody, harmony | patterns: `"bd sd [bd bd] sd"` |
| Sentences | phrases | `stack()` of layered patterns |
| Narrative | song structure | `arrange()` of sections |

---

## Setup

Work in the skill folder: `{baseDir}` in OpenClaw (where `openclaw skills install` put it), or
your clone of the repo.

```bash
npm run setup     # npm install + 21 Dirt-Samples banks (~14 MB, from github.com)
npm test          # 12 checks; all should pass
```

You need **Node 22.12 or later** (`node --version`) and **ffmpeg** for MP3 (`ffmpeg -version`).
The QA gate below runs through `uv`, which fetches numpy and soundfile for it.

For the deconstruction pipeline only, also install the Python tools:

```bash
uv tool install demucs    # the demucs command, for stem separation
```

The analysis steps also need a Python environment with librosa, scikit-learn and soundfile, for
example `uv init && uv add librosa scikit-learn soundfile` in a working folder.

---

## Your first composition

Save this as `output/my-first-track.js` (run `mkdir -p output` first). It uses only sounds that
setup installs and controls the renderers implement:

```js
// @title  My First Track
// @by     <your name>
// @mood   peace
// @tempo  120
setcpm(120/4)  // 120 BPM: 4 beats per cycle, 30 cycles per minute

stack(
  // Drums: samples from samples/bd, samples/sd, samples/hh
  s("bd ~ ~ ~ bd ~ ~ ~").gain(0.4),
  s("~ sd ~ sd").gain(0.25),
  s("hh*8").gain("<0.3 0.35>"),

  // Bass: a synthesized sawtooth
  note("c2 ~ eb2 ~ g1 ~ c2 ~")
    .s("sawtooth")
    .attack(0.01).decay(0.15).sustain(0.4).release(0.1)
    .gain(0.1),

  // Pad: a slow triangle chord, one per cycle
  note("<[c5,eb5,g5] [ab4,c5,eb5] [bb4,d5,f5] [g4,bb4,d5]>")
    .s("triangle")
    .attack(0.5).release(1)
    .pan(0.4)
    .gain(0.2)
)
```

## Your first render

```bash
# 20 cycles at 30 per minute = 40 seconds
node src/runtime/chunked-render.mjs output/my-first-track.js output/my-first-track.wav 20 --strict
ffmpeg -i output/my-first-track.wav -codec:a libmp3lame -b:a 192k output/my-first-track.mp3 -y
```

Read the renderer's last lines. Any `⚠️` line after `Total: ... haps scheduled` names something
that didn't play as written: a sound with no sample or synth, a dropped event, or a warning from
Strudel. With `--strict` the renderer then exits with status 2, so a script can stop there.

### Check it

```bash
uv run --no-project --with numpy --with soundfile python scripts/qa-gate.py output/my-first-track.wav
```

The gate checks for dropouts, for energy piled below 320 Hz, for loudness (target −18 to
−14 LUFS) and for clipping. It exits 0 on a pass. The track above passes from both renderers.

### Long renders

A render runs in its own Node process, so it can't stall the OpenClaw gateway. It can outlive a
tool call, though. `chunked-render.mjs` takes about a second per minute of audio;
`offline-render-v2.mjs` can take as long as the audio itself. For anything long, use `exec` with
`background: true` and a `timeoutSeconds`, or `sessions_spawn`. Tell the person a render is
under way.

---

## Pattern language crash course

### Sequencing

```js
"a b c d"       // four events in one cycle
"[a b] c d"     // a and b share the first quarter
"a b ~ d"       // ~ is a rest
"a*3 b"         // a three times, then b
"<a b c>"       // one per cycle: a, then b, then c
"[c3,e3,g3]"    // a chord: all at once
```

### Layering

```js
stack(
  s("bd sd bd sd"),
  note("c2 g2").s("sawtooth"),
  note("c4 eb4 g4").s("sine")
)
```

### Shaping sound

What the renderers implement today:

```js
.gain(0.4)                                          // volume
.pan(0.3)                                           // 0 left, 1 right
.attack(0.01).decay(0.2).sustain(0.5).release(0.3)  // envelope, on synths only
.speed(2)                                           // sample playback rate
.clip(1)                                            // let a sample ring out (Strudel cuts it: #75)
.lpf(800)                                           // low-pass: offline-render-v2.mjs only
```

What they ignore without a word: `.room()`, `.delay()`, `.hpf()`, `.distort()`, `.bank()`, and
every other effect (#68). Strudel's own site plays them; these renderers don't.

### Structure

```js
setcpm(120/4)

const drums = stack(s("bd ~ ~ ~ bd ~ ~ ~").gain(0.4), s("~ sd ~ sd").gain(0.25), s("hh*8").gain(0.3))
const bass = note("c2 ~ eb2 ~ g1 ~ c2 ~").s("sawtooth").gain(0.1)
const pad = note("<[c5,eb5,g5] [ab4,c5,eb5]>").s("triangle").attack(0.5).release(1).gain(0.2)

arrange(
  [4, pad],                      // intro: 4 cycles
  [8, stack(drums, pad)],        // verse
  [8, stack(drums, bass, pad)],  // chorus
  [4, pad]                       // outro
)
```

The renderers evaluate the file and keep the **last top-level expression that starts with**
`stack(`, `arrange(`, `note(`, `s(`, `n(`, `seq(` or `cat(`. Put definitions above it.

### Sound sources

- **Synths:** `.s("sine")`, `.s("triangle")`, `.s("square")`, `.s("sawtooth")`. A note with no
  `.s()` plays `triangle`.
- **Noise:** `.s("white")`, `.s("pink")`, `.s("brown")`.
- **Samples:** a folder of WAVs in `samples/` is a sound named after the folder. After setup:
  `bd sd hh ho cp cr rm mt lt ht cb 808bd 808sd 808hc 808oh metal chin insect wind industrial
  glitch`; Strudel's `oh` and `rim` play `ho` and `rm`. A clone or `git:` install also has the
  committed `bloom_*` set; a ClawHub install leaves it out. `s("bd:3")` picks the fourth file,
  and a number past the last file wraps around, as in Strudel.
- **Pitched samples:** `note("c3").s("bloom_lead_C3")` (where the bloom set is installed) shifts
  a sample from its root note, taken from `samples/strudel.json` or the file name, in
  `chunked-render.mjs`. `offline-render-v2.mjs` ignores root notes: it shifts a MIDI number from
  C4 and a note name from C5 (#67).
- **Pitch:** give note names an octave (`c3`). The renderers play `c` as C4, an octave above
  Strudel (#67). A number in `note()` is a MIDI note number.

---

## Audio deconstruction (manual, partial)

With the Python tools installed you can take a track apart. Each step is done by hand today, and
the slicing and extraction scripts are on unmerged branches (#61, #14). You supply the audio, and
you're responsible for having the rights to it and to anything you make from it.

1. **Separate stems.** `demucs input.mp3` writes `separated/htdemucs/input/{vocals,drums,bass,other}.wav`.
   `demucs --two-stems=vocals input.mp3` splits only vocals from the rest.
2. **Analyse.** librosa gives onsets (drum hits), pYIN pitch tracks (bass and lead), tempo, and the
   beat grid.
3. **Slice.** Cut hits or phrases into folders:
   ```
   samples/my_track_kick/kick.wav
   samples/my_track_bass_C2/bass_C2.wav
   ```
4. **Map root notes.** Add pitched slices to `samples/strudel.json` so `note()` shifts them
   correctly:
   ```json
   { "my_track_bass_C2": { "c2": "my_track_bass_C2/bass_C2.wav" } }
   ```
   Folders are found automatically. `samples({...})` in a composition does nothing in these
   renderers.
5. **Compose** with the slices: `s("my_track_kick")`, `note("c2 g1").s("my_track_bass_C2")`.
6. **Render and check** as above.

Two approaches, depending on the source:

| Approach | Best for | You get |
|---|---|---|
| Grammar extraction | through-composed music with little repetition | a generative pattern that keeps the scale, density and rhythm of the source |
| Sample-based | repetitive or verse-chorus music | stem slices played back through Strudel, keeping the source's timbre |

---

## Known pitfalls

Read [KNOWN-PITFALLS.md](KNOWN-PITFALLS.md). The short version:

1. **Gain patterns:** use `<>` for one value per cycle. Spaces split one cycle and stack events.
2. **DJ voice-over in stems** gets into pad slices.
3. **Root notes:** an undeclared pitched sample is assumed to be C4.
4. **Loudness:** check every render.
5. **Missing sounds and effects:** a sound the renderers don't know is dropped, or replaced by a
   440 Hz tone, and listed after the render (`--strict` fails it). Effects they don't know are
   ignored without a word (#68).

## Where to learn more

- Strudel: <https://strudel.cc>, and its tutorial at <https://strudel.cc/learn>
- Mood to parameters: `references/mood-parameters.md`
- Production techniques: `references/production-techniques.md`
- Pattern transforms: `references/pattern-transforms.md`
- Free sample packs: `references/cc-sample-packs-catalog.md`

## Quick reference

| Task | Command |
|---|---|
| Set up | `npm run setup` |
| Smoke test | `npm test` |
| Render (fast) | `node src/runtime/chunked-render.mjs <in.js> <out.wav> <cycles>` |
| Render (with lpf) | `bash scripts/dispatch.sh render <in.js> [cycles] [bpm]` |
| WAV to MP3 | `ffmpeg -i in.wav -codec:a libmp3lame -b:a 192k out.mp3 -y` |
| Check a render | `uv run --no-project --with numpy --with soundfile python scripts/qa-gate.py out.wav` |
| List samples | `bash scripts/samples-manage.sh list` |
| Add samples | `bash scripts/samples-manage.sh add <url-or-dir>` |
| Stream to voice | `node scripts/vc-play.mjs <48kHz.wav> --channel <id>` (needs `DISCORD_BOT_TOKEN`) |
| Separate stems | `demucs input.mp3` |
