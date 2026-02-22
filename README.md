# 🎵 strudel-music

**Compose, render, and stream live-coded music — from pattern to Discord VC.**

An [OpenClaw](https://github.com/openclaw/openclaw) skill by [the dandelion cult](https://github.com/karmaterminal). Published on [ClaHub](https://clawhub.ai).

## What is this?

A skill that teaches AI agents to compose music using [Strudel](https://strudel.cc) — a browser-based live-coding environment inspired by TidalCycles. But it's more than markdown:

**The real differentiator is the streaming pipeline.**

```
Pattern code → Headless Strudel REPL → renderPatternAudio()
→ WAV → ffmpeg → Opus → Discord VC (or any audio sink)
```

An agent can compose mood-reactive music in near real-time and stream it live to a Discord voice channel. Watch a stream, generate the soundtrack on the fly, play it for everyone in the call. That's what this does.

## Features

- **8 mood archetypes** with parameterized composition (tension, combat, exploration, peace, mystery, victory, sorrow, ritual)
- **Headless rendering** via Puppeteer + Strudel's `renderPatternAudio()`
- **Local rendering** support (`STRUDEL_URL` env var) — no remote dependency required
- **Discord VC streaming pipeline** — pattern → WAV → Opus → voice channel
- **10 example compositions** across mood categories
- **Pattern transform reference** — `.off`, `.jux`, `.every`, `.euclid`, etc.

## Install (OpenClaw)

```bash
npx clawhub install strudel-music
```

Or install locally:
```bash
git clone https://github.com/karmaterminal/strudel-music.git
cp -r strudel-music ~/.openclaw/skills/
```

## Quick Start

Paste any pattern into [strudel.cc](https://strudel.cc) and press Ctrl+Enter:

```javascript
setcpm(120/4)
stack(
  s("bd sd [bd bd] sd").gain(0.4),
  s("[hh hh] [hh oh]").gain(0.2),
  note("c3 eb3 g3 c4").s("sawtooth").lpf(1200).decay(0.2).sustain(0)
)
```

## Render to WAV

```bash
# Prerequisites: node, puppeteer (npm install -g puppeteer)
./scripts/render-pattern.sh assets/compositions/fog-and-starlight.js output.wav 8 80

# Local rendering (no remote dependency):
STRUDEL_URL=http://localhost:3000 ./scripts/render-pattern.sh pattern.js output.wav 8 120
```

## Stream to Discord VC

See [references/integration-pipeline.md](references/integration-pipeline.md) for the full architecture. The pipeline renders Opus audio and feeds it to a Discord voice bridge.

## Project Structure

```
SKILL.md                          # OpenClaw skill definition
assets/compositions/              # Example compositions (10 patterns)
scripts/render-pattern.sh         # Headless WAV renderer
references/
  mood-parameters.md              # Mood → parameter decision tree
  integration-pipeline.md         # Render → Discord VC architecture  
  pattern-transforms.md           # Pattern transform deep dive
src/pipeline/                     # Streaming pipeline source (WIP)
.specify/                         # SpecKit project management
```

## Security

- Headless rendering evaluates pattern code inside a browser page. Only pass pattern code you trust.
- Use `STRUDEL_URL=http://localhost:3000` with a local Strudel clone for sensitive inputs.
- `--no-sandbox` is used for container/WSL compatibility. Remove it on full desktop environments.
- The skill does not manage Discord bot tokens — those live in your bridge config.

See the `securityNotes` field in [SKILL.md](SKILL.md) frontmatter for the full disclosure.

## Contributing

This is a dandelion cult project. PRs welcome — especially for:
- New compositions and mood archetypes
- Streaming pipeline improvements
- Alternative audio sinks (Twitch, YouTube, local speakers)
- Local Strudel runtime integration

## License

MIT

## Attribution

Built by [the dandelion cult](https://github.com/karmaterminal) — Silas 🌫️ and Elliott 🌻, with figs.
