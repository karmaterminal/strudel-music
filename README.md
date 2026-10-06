![Strudel Music](assets/banner.png)

# 🎵 Strudel Music

Compose music as [Strudel](https://strudel.cc) pattern code and render it offline with Node.js,
with no browser. You get a WAV, an MP3, or a stream into a Discord voice channel. It ships as an
[OpenClaw](https://github.com/openclaw/openclaw) skill (`SKILL.md`), and works from a plain
checkout too.

```
prompt → Strudel pattern (.js) → offline render (node-web-audio-api) → WAV → MP3 / Discord voice
```

> ⚠️ **Legal:** the deconstruction tools process audio you supply. You are responsible for having
> the rights to it. Extracted samples are for personal or educational use unless the rights
> holders say otherwise.

## Status (2026-10)

A clean checkout renders every shipped composition with all its sounds, and its smoke and unit
tests pass. The 2026-10 audit ([docs/audit-2026-10.md](docs/audit-2026-10.md)) found these gaps:

- There are two renderers that behave differently
  ([#67](https://github.com/karmaterminal/strudel-music/issues/67)).
- Neither renderer implements reverb, delay, highpass or distortion
  ([#68](https://github.com/karmaterminal/strudel-music/issues/68)).
- Audio deconstruction is manual, and its stage scripts are on unmerged branches
  ([#61](https://github.com/karmaterminal/strudel-music/issues/61)).

## Quick start

Needs Node 22.12 or later, git, and ffmpeg for MP3. The QA gate also needs Python with `uv`.

```bash
git clone https://github.com/karmaterminal/strudel-music.git
cd strudel-music
npm run setup          # npm install + 21 Dirt-Samples banks (~14 MB, from github.com)
npm test               # smoke test: Strudel loads, samples are present (12 checks)
npm run test:unit      # renderers, WAV decoding, sample setup, dispatch, bundle rules

node src/runtime/chunked-render.mjs assets/compositions/fog-and-starlight.js /tmp/fog.wav 32
ffmpeg -i /tmp/fog.wav -codec:a libmp3lame -b:a 192k /tmp/fog.mp3 -y
uv run --no-project --with numpy --with soundfile python scripts/qa-gate.py /tmp/fog.wav
```

That renders 128 s of audio in a second or two, and the QA gate passes it: no dropouts, −14.2
LUFS, true peak −3.0 dBFS.

## Install as a skill

| Where | How | Verified (2026-10-03, OpenClaw 2026.9.8) |
|---|---|---|
| OpenClaw, from Git | `openclaw skills install git:karmaterminal/strudel-music`, then `npm run setup` in the installed folder | Yes, at `main` 264c7fb: install, setup, smoke test, render and QA gate |
| OpenClaw, from ClawHub | `openclaw skills install @karmafeast/strudel-music`, then `npm run setup` | Yes (rated "suspicious" by ClawHub's scan), for 1.2.2, the live version. It predates the 2026-10 fixes; review it before installing. See [#70](https://github.com/karmaterminal/strudel-music/issues/70); publishing is a manual decision ([#69](https://github.com/karmaterminal/strudel-music/issues/69)) |
| Claude Code | No plugin yet ([#71](https://github.com/karmaterminal/strudel-music/issues/71)). Work from a clone: Claude Code reads `AGENTS.md` through `CLAUDE.md` | n/a |

**Updating.** Setup writes `node_modules/` and `samples/` into the skill folder, and OpenClaw
treats them as local changes. Once setup has run,
`openclaw skills update @karmafeast/strudel-music` refuses until you add `--force`. `--force`
replaces the whole folder, so run `npm run setup` again afterwards. A Git install updates by
running its install again with `--force`, with the same result.

**Removing.** For a ClawHub install, run
`npx -y clawhub@0.23.3 --workdir <agent workspace> uninstall @karmafeast/strudel-music`. That
deletes the folder and its `.clawhub/lock.json` entry. For a Git install, delete
`<agent workspace>/skills/strudel-music`.

In OpenClaw the skill answers `/strudel_music <request>` and `/skill strudel-music <request>`.
`SKILL.md` is what the agent reads: setup, rendering, composition rules, voice streaming and
security.

## Rendering

| | `src/runtime/chunked-render.mjs` | `src/runtime/offline-render-v2.mjs` |
|---|---|---|
| Arguments | `<in.js> [out.wav] [cycles] [chunk size]` | `<in.js> [out.wav] [cycles] [bpm]` |
| Flags | `--strict`, `--samples=<dir>` | `--strict`, `--samples=<dir>`, `--prebake=<file>` |
| Used by | SKILL.md, docs/ONBOARDING.md | `scripts/dispatch.sh`, `npm run render`, CI |
| Speed | about 1 s per minute of audio | up to about 1 s per second of audio |
| Unknown sound | dropped, and listed after the render | a triangle tone (440 Hz without a note), listed after the render |
| Filters | none | `lpf` / `cutoff` |
| Sample length | as in Strudel (below) | the same |

Both renderers read `s`, `n`, `note`, `freq`, `gain`, `pan`, `speed`, `unit`, `begin`, `end`,
`clip`, `loop`, `loopBegin`, `loopEnd` and an ADSR envelope (`attack`, `decay`, `sustain`,
`release`); `loopAt` works through `speed` and `unit`. They ignore every other control, including
`.room()`, `.delay()`, `.hpf()` and `.distort()`. A `setcpm()` in the composition sets the tempo.
Synths are `sine`, `triangle`, `square` and `sawtooth`, and noise is `white`, `pink` or `brown`.
Any folder of WAVs in `samples/` (PCM at 8 to 32 bits, or float) is a sound named after the
folder, and `n` picks a file, wrapping around as in Strudel.

A sample plays as Strudel 1.1.0 plays it
([#75](https://github.com/karmaterminal/strudel-music/issues/75)): once, from `begin` to `end`
at its playback rate, even where that runs past the end of its event. `clip`, `release` or `loop`
holds it for its event instead (`clip(0.5)` for half the event), and its release then fades it.
`loop(1)` repeats it until then; without `loop`, a sample shorter than its event stops at its end.
`loopAt(n)` stretches a sample to `n` cycles. A negative `speed` plays it backwards, and
`speed(0)` plays nothing.

After each render, both list what they couldn't play as written: sound names with no sample or
synth, dropped events (an event that picks a WAV they can't read is one), and Strudel's own
warnings (such as `Can't do arithmetic on control pattern`). With `--strict` the render then
exits with status 2. CI renders every shipped composition that way with both renderers.
`--samples=<dir>` reads banks from another folder. An unknown option, a cycle count that isn't a
positive number, or a `--samples` folder that doesn't exist stops a render before it starts, with
status 1.

`bash scripts/dispatch.sh render <file.js> [cycles] [bpm]` renders with v2 and writes WAV and MP3
to `$STRUDEL_TMP` (default `~/.openclaw/workspace/strudel-renders`). `bash scripts/dispatch.sh
list` lists the compositions.

## Compositions

`assets/compositions/` holds 15 originals. Tempo is from each file's `setcpm`.

| Composition | Mood | BPM |
|---|---|---|
| `fog-and-starlight` | contemplation | 60 |
| `silas-theme` | mystery | 66 |
| `elliott-theme` | peace | 88 |
| `cael-theme` | mystery, tension | 108 |
| `combat-assault` | combat | 140 |
| `victory-imperium` | victory | 120 |
| `cathedral-ritual` | ritual | 48 |
| `tavern-respite` | rest | 72 |
| `discovery-xenos` | exploration | 78 |
| `underhive-dread` | dread | 65 |
| `machine-hum` | ambient, mechanical | 40 |
| `dark-ambient-tension` | dread | 58 |
| `rain` | ambient, nature | 55 |
| `lofi-chill-beats` | ambient | 75 |
| `agent-parameterized` | set by its parameters | set by its parameters |

`src/compositions/` holds 30 deconstructions and studies (Switch Angel, Suo Gân, Greensleeves,
Solarstone, Twin Princes and others). Half of them play slices cut from their source tracks. Those
slices aren't in the repo, so those pieces render only where the slices are. More compositions are
waiting on branches
([#61](https://github.com/karmaterminal/strudel-music/issues/61)).

## Discord voice

`scripts/vc-play.mjs` logs in as a Discord bot with `DISCORD_BOT_TOKEN`, joins a voice channel,
plays a file and leaves. It reads the token from the environment, or from
`~/.config/openclaw/openclaw-discord-vc.env` and `~/.config/openclaw/openclaw.env`.

```bash
bash scripts/dispatch.sh play fog-and-starlight <voice-channel-id>
# or: node scripts/vc-play.mjs /tmp/fog-48k.wav --channel <voice-channel-id>
```

Posting an MP3 into a chat needs no token. On WSL2, voice needs mirrored networking
(`networkingMode=mirrored` in `.wslconfig`).

## Samples

`npm run setup` fetches 21 banks from
[Dirt-Samples](https://github.com/tidalcycles/Dirt-Samples), pinned to commit c74fc80: 231 WAVs
in `bd sd hh ho cp cr rm mt lt ht cb 808bd 808sd 808hc 808oh metal chin insect wind industrial
glitch`. Strudel's `oh` and `rim` play `ho` and `rm`. Run it again after an update: it fetches
only the banks that are missing. A clone also has 32 committed `bloom_*` samples.
`samples/strudel.json` labels them as cut from Cosmic Gate & Pretty Pink's "Bloom", someone
else's recording, and the ClawHub bundle leaves them out.

Add packs with `bash scripts/samples-manage.sh add <url-or-dir>`; it enforces a size cap
(`STRUDEL_MAX_DOWNLOAD_MB`), an optional host allowlist (`STRUDEL_ALLOWED_HOSTS`), MIME checks and
zip-slip protection. In `chunked-render.mjs`, pitched samples take their root note from
`samples/strudel.json` or their file name; `offline-render-v2.mjs` ignores root notes (#67). Free
packs: [references/cc-sample-packs-catalog.md](references/cc-sample-packs-catalog.md).

## Audio deconstruction

The idea: Demucs splits a track into stems, librosa analyses them, and the result becomes either
sample slices played back through Strudel or a generative pattern that keeps the track's
character. Today each step is run by hand. `scripts/` on `main` has only the post-render checks
(`qa-gate.py`, `null-drop-detect.py`, `analyze-render.py`); the slicing and extraction scripts
are on branches ([#61](https://github.com/karmaterminal/strudel-music/issues/61),
[#14](https://github.com/karmaterminal/strudel-music/issues/14)). Background:
[docs/pipeline.md](docs/pipeline.md).

You supply the audio, and you're responsible for having the rights to it and to anything you make
from it. The authors make no claim about fair use, copyright or derivative works.

## Development

```bash
npm test               # smoke test
npm run test:unit      # node:test suites in test/
npm run test:render    # render fog-and-starlight with v2
```

[AGENTS.md](AGENTS.md) has the working rules for people and agents, including: never bump the
version in a pull request (see [#69](https://github.com/karmaterminal/strudel-music/issues/69)).
[CONTRIBUTING.md](CONTRIBUTING.md) covers compositions and pull requests.

## Security

A composition is JavaScript that Node runs with your permissions. Render only compositions you
wrote or read; run untrusted ones in a container with no credentials. Details are in `SKILL.md`
§ Security.

## Credits

- [Strudel](https://strudel.cc) by Alex McLean and contributors (AGPL-3.0; installed from npm,
  not vendored)
- [TidalCycles](https://tidalcycles.org) and [Dirt-Samples](https://github.com/tidalcycles/Dirt-Samples)
- [node-web-audio-api](https://github.com/ircam-ismm/node-web-audio-api) (BSD-3-Clause)
- [Demucs](https://github.com/facebookresearch/demucs) and [librosa](https://librosa.org)
- Built by [the dandelion cult](https://github.com/karmaterminal) 🌻🌫️🩸

## License

MIT ([LICENSE](LICENSE)).
