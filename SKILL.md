---
name: strudel-music
description: "Compose music as Strudel pattern code and render it offline to WAV or MP3 with Node.js, then post the file or stream it into a Discord voice channel. Use when someone asks for music, a theme, a soundscape or a beat, or names a composition in assets/compositions. Needs node; MP3 and voice need ffmpeg; voice also needs a Discord bot token."
metadata: {"openclaw": {"emoji": "🎵", "homepage": "https://github.com/karmaterminal/strudel-music", "requires": {"bins": ["node"]}, "install": [{"id": "ffmpeg", "kind": "brew", "formula": "ffmpeg", "bins": ["ffmpeg"], "label": "Install ffmpeg (MP3 conversion, voice streaming)"}, {"id": "demucs", "kind": "uv", "package": "demucs", "bins": ["demucs"], "label": "Optional: Demucs stem separator (audio deconstruction only)"}], "envVars": [{"name": "DISCORD_BOT_TOKEN", "required": false, "description": "Voice streaming only: scripts/vc-play.mjs logs in as this Discord bot. Read from the environment or the two env files below."}, {"name": "DISCORD_VC_CHANNEL_ID", "required": false, "description": "Voice channel scripts/vc-play.mjs joins when no --channel is given."}, {"name": "OPENCLAW_DISCORD_VC_ENV_FILE", "required": false, "description": "Env file vc-play.mjs loads first. Default ~/.config/openclaw/openclaw-discord-vc.env."}, {"name": "OPENCLAW_ENV_FILE", "required": false, "description": "Env file vc-play.mjs loads second. Default ~/.config/openclaw/openclaw.env."}, {"name": "STRUDEL_TMP", "required": false, "description": "Where scripts/dispatch.sh writes renders. Default $OPENCLAW_WORKSPACE/strudel-renders."}, {"name": "OPENCLAW_WORKSPACE", "required": false, "description": "Base for the default render folder. Default ~/.openclaw/workspace."}, {"name": "STRUDEL_MAX_DOWNLOAD_MB", "required": false, "description": "Size cap for scripts/samples-manage.sh downloads. Default 10240."}, {"name": "STRUDEL_ALLOWED_HOSTS", "required": false, "description": "Comma-separated hosts samples-manage.sh may download from. Empty allows any."}, {"name": "DISCORD_VC_BRIDGE_ENDPOINT", "required": false, "description": "Printed by src/stream/pipe-to-vc.mjs, which only encodes Opus to stdout; no bridge ships here."}]}}
---

# Strudel Music 🎵

Write a [Strudel](https://strudel.cc) pattern as a `.js` file, render it offline with Node.js
(no browser), convert it to MP3, and post it or stream it into a Discord voice channel.

> **Paths:** `{baseDir}` is this skill's folder, the one holding this `SKILL.md`. Every command
> below runs from it.

> ⚠️ **Legal:** the deconstruction tools process audio you supply. You are responsible for having
> the rights to it.

## First use: set up the folder

Installing the skill copies files only. Before the first render, in `{baseDir}`:

```bash
npm run setup     # npm install + download 21 sample banks (Dirt-Samples, ~14 MB, from github.com)
npm test          # 12 checks: Strudel loads, samples are present
```

Node 22.12 or later (`@discordjs/voice` needs it; CI runs 22). `ffmpeg` is needed for MP3 and
voice, not for WAV.

Updating the skill replaces this folder. Once setup has run, `openclaw skills update` needs
`--force`, and `npm run setup` has to run again afterwards.

## Render

Two renderers ship, and they differ (#67 picks one):

| | `chunked-render.mjs` (use this to compose) | `offline-render-v2.mjs` (`dispatch.sh`, `npm run render`, CI) |
|---|---|---|
| Speed | about 1 s per minute of audio | up to about 1 s per second of audio |
| Unknown sound name | dropped, and listed after the render | played as a triangle tone (440 Hz unless the event has a note), and listed after the render |
| `.lpf()` / `.cutoff()` | ignored | works |
| `note()` on a sample | shifted from the sample's root note (`samples/strudel.json`, the file name, or else C4) | root notes ignored: a MIDI number shifts from C4, a note name from C5 (`note("c4")` plays an octave down) |
| Level | peak-normalized | compressor, 2 s fade-out |
| Sample length | as in Strudel (§ Write a composition) | the same |

```bash
# Compose and iterate: argument order is input, output, cycles, chunk size.
node src/runtime/chunked-render.mjs assets/compositions/fog-and-starlight.js /tmp/fog.wav 32 --strict
ffmpeg -i /tmp/fog.wav -codec:a libmp3lame -b:a 192k /tmp/fog.mp3 -y

# Filter-heavy pieces, through offline-render-v2.mjs: input, cycles, BPM. A setcpm() in the
# file wins over the BPM.
bash scripts/dispatch.sh render assets/compositions/fog-and-starlight.js 16 72
# → fog-and-starlight.wav and .mp3 in $STRUDEL_TMP (default ~/.openclaw/workspace/strudel-renders)
```

`--strict` (either renderer) still writes the file, then exits with status 2 if anything didn't
play as written. The list it prints after the render names each sound with no sample or synth,
each kind of dropped event, and every warning Strudel logged, such as `[warn]: Can't do arithmetic
on control pattern.` (write `.add(note(12))`, not `.add(12)`) or `[tonal] incomplete scale`
(write `"c:major:pentatonic"`, with colons). Fix those before you post.

Length is cycles divided by cycles per second. fog-and-starlight's `setcpm(60/4)` plays 15 cycles
a minute, so each cycle is 4 s and 16 cycles make 64 s. A check before posting:

```bash
uv run --no-project --with numpy --with soundfile python scripts/qa-gate.py /tmp/fog.wav
# exit 0 pass, 1 fail, 2 clipping, 3 error
```

### Long renders

The renderer runs as its own process, so it can't stall the gateway. A long one can outlive the
tool call, though. OpenClaw's `exec` moves a command to the background after `yieldMs` (10 s by
default). For anything longer than a quick preview:

- `exec` with `background: true` and a `timeoutSeconds` that fits (600 is generous), then poll
  with `process`; or
- `sessions_spawn` with `mode: "run"` and `runTimeoutSeconds`, and post the file when it's done.

Tell the person a render is under way. Run one render at a time: two renders with the same name
write the same output file.

## Write a composition

```javascript
// @title  Night Shift
// @by     <who asked>
// @mood   tension
// @tempo  90
setcpm(90/4)                       // 90 BPM, 4 beats per cycle

stack(
  s("bd ~ ~ bd ~ ~ bd ~").gain(0.3),
  s("hh*8").gain("<0.3 0.35>"),
  s("~ sd ~ sd").gain(0.25),
  note("<c2 c2 eb2 g1>").s("sawtooth")
    .attack(0.01).decay(0.2).sustain(0.3).release(0.2).gain(0.1),
  note("<[c4 eb4 g4] [bb3 d4 f4]>").s("triangle")
    .attack(0.4).release(1.5).pan(0.3).gain(0.35)
)
```

Rendered for 16 cycles, this passes `scripts/qa-gate.py` from both renderers.

Rules that keep a render honest:

- **End the file with the pattern.** Both renderers return the last top-level expression that
  starts with `stack(`, `note(`, `s(`, `n(`, `seq(`, `cat(`, `sequence(`, `arrange(`, `slowcat(`
  or `fastcat(`. Lines before it are setup.
- **Use only sounds that exist.** Synths: `sine`, `triangle`/`tri`, `square`, `sawtooth`/`saw`;
  a note with no `.s()` plays `triangle`, as in Strudel. Noise: `white`, `pink`, `brown`.
  (`offline-render-v2.mjs` also maps `piano`, `pluck`, `organ`, `bass`, `supersaw` and
  `supersquare` onto the synths; `chunked-render.mjs` drops them.) Samples: any folder in
  `samples/` holding WAVs. After setup that's `bd sd hh ho cp cr rm mt lt ht cb 808bd 808sd 808hc
  808oh metal chin insect wind industrial glitch`, and Strudel's `oh` and `rim` play `ho` and
  `rm`. `n` picks a file and wraps around: `insect:4` of three files plays `insect:1`. A clone or
  `git:` install also has the committed `bloom_*` set; a ClawHub install leaves it out. Other
  Strudel names (`rd`, `sh`, `bell` and so on) have no bank. `bash scripts/samples-manage.sh list`
  shows what's there.
- **Use only controls that render:** `s`, `n`, `note`, `freq`, `gain`, `pan`, `speed`, `begin`,
  `end`, `clip`, `loop`, `loopBegin`, `loopEnd`, `loopAt`, and `attack`, `decay`, `sustain`,
  `release`; also `lpf`/`cutoff` in `offline-render-v2.mjs`. `.room()`, `.delay()`, `.hpf()`,
  `.distort()` and every other effect are silently ignored (#68). `.bank()` and `samples()` do
  nothing.
- **A sample plays once, as in Strudel** (#75): from `begin` to `end` at its playback rate, even
  past the end of its event, so a short sample in a long event is a short sound. To fill the event,
  add `.loop(1)`. `.clip(1)` cuts a sample at the end of its event and `.clip(0.5)` halfway;
  neither makes it longer. `.release(t)` holds it for its event, then fades it over `t` seconds.
- **Pitch synths with `note()`**, or `n()` followed by `.scale()`. A bare `n()` on a synth plays
  440 Hz in both renderers.
- **Give note names an octave** (`c3`, not `c`). Without one, both renderers play octave 4, an
  octave above Strudel (#67). A number in `note()` is a MIDI note number (`note(57)` is A3).
- **Sequence gains with `<>`, not spaces.** `.gain("<0.3 0.5>")` changes per cycle;
  `.gain("0.3 0.5")` splits each cycle in two. Long space-separated lists pile up events and clip.
  More traps: `docs/KNOWN-PITFALLS.md`.

Mood, key and tempo choices: `references/mood-parameters.md`. Techniques:
`references/production-techniques.md`, `references/pattern-transforms.md`,
`docs/composition-guide.md`.

## Post or stream it

**Post:** attach the MP3 through the channel the request came from. That needs no extra
credentials.

**Stream into a voice channel:** `scripts/vc-play.mjs` logs in as a Discord bot, joins the
channel, plays the file and leaves. It needs `DISCORD_BOT_TOKEN`. It reads the token, and every
other line of the two env files named in this skill's metadata, into its own process.

```bash
bash scripts/dispatch.sh play fog-and-starlight [channel-id]   # 16 cycles, 48 kHz, then streams
# or by hand:
ffmpeg -i /tmp/fog.wav -ar 48000 -ac 2 /tmp/fog-48k.wav -y
node scripts/vc-play.mjs /tmp/fog-48k.wav --channel <voice-channel-id>
```

Without `--channel`, it uses `DISCORD_VC_CHANNEL_ID`. On WSL2, voice needs mirrored networking
(`networkingMode=mirrored` in `%USERPROFILE%\.wslconfig`); behind NAT the bot joins but no audio
arrives.

## Helper commands

| Command | Does |
|---|---|
| `bash scripts/dispatch.sh render <file.js> [cycles] [bpm]` | Render with `offline-render-v2.mjs`, then MP3 if ffmpeg is present |
| `bash scripts/dispatch.sh play <name> [channel-id]` | Render a composition from `assets/compositions/` and stream it |
| `bash scripts/dispatch.sh list` | List compositions with their `@title`, `@mood` and `@tempo` |
| `bash scripts/dispatch.sh concert <name> [name...]` | Play several in a row |
| `bash scripts/samples-manage.sh list \| add <url-or-dir>` | Show or add sample packs |

In OpenClaw the skill answers `/strudel_music <request>` or `/skill strudel-music <request>`.

## Sample packs

Any folder of WAV files under `samples/` becomes a sound named after the folder:
`samples/kick/kick.wav` plays as `s("kick")`. In `chunked-render.mjs`, pitched samples need a
root note, from `samples/strudel.json` or the file name (`bass_Cs1.wav` is C♯1); otherwise it
assumes MIDI 60 (C4). `offline-render-v2.mjs` ignores root notes (the table under Render).

```json
{ "_base": "./", "kick": { "0": "kick/kick.wav" }, "bass_Cs1": { "cs1": "bass_Cs1/bass_Cs1.wav" } }
```

`samples-manage.sh add` enforces `STRUDEL_MAX_DOWNLOAD_MB`, an optional `STRUDEL_ALLOWED_HOSTS`
allowlist, MIME checks and zip-slip protection. Catalog of free packs:
`references/cc-sample-packs-catalog.md`.

## Audio deconstruction (manual, partial)

Separating a track into stems and turning them into samples or a generative pattern is manual
today. Demucs (`uv tool install demucs`), librosa analysis, slicing, then a composition that uses
the slices. The stage scripts live on unmerged branches (#61, #14). Read `docs/pipeline.md`
before promising one. Expect minutes per track; run it with `sessions_spawn`, never in the
request's own turn.

The person asking supplies the audio and is responsible for having the rights to it, and to
anything made from it. The authors make no claim about fair use, copyright or derivative works.

## Security

- A composition is JavaScript that Node runs with your permissions: files, network, everything.
  `offline-render-v2.mjs` hides `process.env` while the file's top level runs, and that's all it
  does. Its `child_process` block hooks `require`, which a composition can't call anyway;
  `import('node:child_process')` and `process.getBuiltinModule()` still work, and callbacks that
  run during the render, such as `.fmap()`, see the whole environment. `chunked-render.mjs` hides
  nothing. Render only compositions you wrote or read first. For untrusted ones, use a container
  or VM with no credentials.
- `npm run setup` runs `npm install` (no lifecycle scripts in this package) and fetches 21
  folders of `github.com/tidalcycles/Dirt-Samples` at a pinned commit.
- Voice streaming is the only part that holds a credential (above).
