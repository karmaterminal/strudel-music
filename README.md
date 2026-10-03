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

A clean checkout renders, and its smoke and unit tests pass. The 2026-10 audit
([docs/audit-2026-10.md](docs/audit-2026-10.md)) found these gaps:

- 9 of the 15 shipped compositions name sounds that setup doesn't install
  ([#66](https://github.com/karmaterminal/strudel-music/issues/66)).
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
npm run setup          # npm install + Dirt-Samples drum banks (~11 MB, from github.com)
npm test               # smoke test: Strudel loads, samples are present (12 checks)
npm run test:unit      # renderer pitch, dispatch and bundle-rule tests

node src/runtime/chunked-render.mjs assets/compositions/fog-and-starlight.js /tmp/fog.wav 16
ffmpeg -i /tmp/fog.wav -codec:a libmp3lame -b:a 192k /tmp/fog.mp3 -y
uv run --no-project --with numpy --with soundfile python scripts/qa-gate.py /tmp/fog.wav
```

That renders 64 s of audio in about a second, and the QA gate passes it: no dropouts, −14.4 LUFS,
true peak −3.0 dBFS.

## Install as a skill

| Where | How | Verified |
|---|---|---|
| OpenClaw, from Git | `openclaw skills install git:karmaterminal/strudel-music`, then `npm run setup` in the installed folder | OpenClaw 2026.9.8's own parser reads `SKILL.md` correctly; the install itself is checked in [#70](https://github.com/karmaterminal/strudel-music/issues/70) |
| OpenClaw, from ClawHub | `openclaw skills install @<owner>/strudel-music`, then `npm run setup` | Not yet ([#70](https://github.com/karmaterminal/strudel-music/issues/70)). The last two automatic publishes failed, and publishing is now a manual decision ([#69](https://github.com/karmaterminal/strudel-music/issues/69)) |
| Claude Code | No plugin yet ([#71](https://github.com/karmaterminal/strudel-music/issues/71)). Work from a clone: Claude Code reads `AGENTS.md` through `CLAUDE.md` | n/a |

In OpenClaw the skill answers `/strudel_music <request>` and `/skill strudel-music <request>`.
`SKILL.md` is what the agent reads: setup, rendering, composition rules, voice streaming and
security.

## Rendering

| | `src/runtime/chunked-render.mjs` | `src/runtime/offline-render-v2.mjs` |
|---|---|---|
| Arguments | `<in.js> [out.wav] [cycles] [chunk size]` | `<in.js> [out.wav] [cycles] [bpm]` |
| Used by | SKILL.md, docs/ONBOARDING.md | `scripts/dispatch.sh`, `npm run render`, CI |
| Speed | about 1 s per minute of audio | up to about 1 s per second of audio |
| Unknown sound | dropped (`Total: X/Y haps scheduled`) | a triangle tone (440 Hz without a note) and a warning |
| Filters | none | `lpf` / `cutoff` |

Both renderers read `s`, `n`, `note`, `freq`, `gain`, `pan`, `speed`, `clip` and an ADSR envelope.
They ignore every other control, including `.room()`, `.delay()`, `.hpf()` and `.distort()`. A
`setcpm()` in the composition sets the tempo. Synths are `sine`, `triangle`, `square` and
`sawtooth`; any folder of WAVs in `samples/` is a sound named after the folder.

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

`npm run setup` sparse-clones 13 banks from
[Dirt-Samples](https://github.com/tidalcycles/Dirt-Samples), 156 WAVs: `bd sd hh cp cr mt lt ht
cb 808bd 808sd 808hc 808oh`. A clone also has 32 committed `bloom_*` samples.
`samples/strudel.json` labels them as cut from Cosmic Gate & Pretty Pink's "Bloom", someone
else's recording, and the ClawHub bundle leaves them out.

Add packs with `bash scripts/samples-manage.sh add <url-or-dir>`; it enforces a size cap
(`STRUDEL_MAX_DOWNLOAD_MB`), an optional host allowlist (`STRUDEL_ALLOWED_HOSTS`), MIME checks and
zip-slip protection. Pitched samples take their root note from `samples/strudel.json` or their
file name. Free packs: [references/cc-sample-packs-catalog.md](references/cc-sample-packs-catalog.md).

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
