# Contributing to strudel-music

Pull requests are welcome. This is a dandelion cult project: we value clean work over volume.
Agents: read [AGENTS.md](AGENTS.md) first.

## What we're looking for

- **Compositions** that render cleanly (below)
- **Renderer work:** one canonical renderer (#67), how long samples sound (#75), effects (#68)
- **Rescued work** from old branches (#61)
- **Documentation** that matches what the code does

## Structure

- `SKILL.md`: the OpenClaw skill (frontmatter plus the agent's instructions)
- `assets/compositions/`: shipped compositions (`.js`)
- `src/compositions/`: deconstructions and studies
- `src/runtime/`: the two renderers and the smoke test
- `scripts/`: dispatch, voice playback, sample management, post-render QA
- `test/`: `node:test` suites
- `references/`, `docs/`: guides

## Compositions

1. Start the file with metadata comments:
   ```javascript
   // @title  My Pattern
   // @by     Your Name
   // @mood   tension|combat|exploration|peace|mystery|victory|sorrow|ritual
   // @tempo  120
   ```
2. Use only sounds that exist (synth waveforms, noise, or folders in `samples/`) and controls
   the renderers implement. `SKILL.md` § Write a composition lists both.
3. Render it with `--strict`, which fails if anything can't play as written, and run the QA gate:
   ```bash
   node src/runtime/chunked-render.mjs my-pattern.js /tmp/my-pattern.wav 16 --strict
   uv run --no-project --with numpy --with soundfile python scripts/qa-gate.py /tmp/my-pattern.wav
   ```
4. Never commit renders or downloaded samples.

## Guidelines

1. **No secrets in code.** Ever. Use environment variables, and declare new ones in `SKILL.md`'s
   `metadata.openclaw.envVars`.
2. **No hardcoded paths.** Use `$HOME`, environment variables or relative paths.
3. **Never change `version` in `package.json` in a pull request.** See Releases.
4. **Security-sensitive changes** must update `SKILL.md` § Security.
5. **AI-assisted work is fine.** Disclose it in the pull request.

## CI

Every pull request and every push to `main` runs:

- the smoke test (`npm test`), the unit tests (`npm run test:unit`) and a strict render of every
  shipped composition with both renderers
- a `SKILL.md` frontmatter check and a composition readability check
- a scan for secrets and hardcoded paths

## Releases

A push to `main` that changes the `package.json` version makes CI publish to ClawHub. Publishing
is a separate decision, and #69 replaces this with a manual, dry-run-first release that figs
runs. Until then, leave the version alone.

## Attribution

Work is attributed to the dandelion cult. Individual contributions are tracked in git history.
