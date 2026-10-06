# AGENTS.md

Instructions for coding agents working in this repository. People should start at
[README.md](README.md). Claude Code reads this file through [CLAUDE.md](CLAUDE.md).

## What this repository is

An OpenClaw skill that renders Strudel compositions offline with Node.js. `SKILL.md` is the file
the skill's agent reads at run time; everything else supports it. The 2026-10 audit
([docs/audit-2026-10.md](docs/audit-2026-10.md)) records what works, what is stale, and the
resurrection sequence (#65).

## Map

| Path | What |
|---|---|
| `SKILL.md` | The skill: frontmatter OpenClaw and ClawHub parse, plus the agent's instructions |
| `src/runtime/chunked-render.mjs` | Fast renderer, hand-mixed buffers. Recommended by SKILL.md |
| `src/runtime/offline-render-v2.mjs` | `OfflineAudioContext` renderer. Used by `dispatch.sh`, `npm run render` and CI |
| `src/runtime/smoke-test.mjs` | `npm test`: Strudel loads, samples are present |
| `src/runtime/synth.mjs` | Imported by nothing (#72) |
| `src/runtime/sounds.mjs` | What both renderers share: drum-name aliases, sample picking, WAV decoding, noise, how long a sample plays and its envelope (Strudel's rule), the problem report behind `--strict` |
| `src/stream/pipe-to-vc.mjs` | WAV to Opus on stdout |
| `scripts/dispatch.sh` | render, play, list, samples, concert |
| `scripts/vc-play.mjs` | Discord voice playback (needs `DISCORD_BOT_TOKEN`) |
| `scripts/download-samples.sh`, `scripts/samples-manage.sh` | Sample setup and packs |
| `scripts/qa-gate.py`, `null-drop-detect.py`, `analyze-render.py` | Post-render checks (numpy, soundfile, ffmpeg) |
| `assets/compositions/` | 15 shipped compositions |
| `src/compositions/` | Deconstructions and studies; half need slices that aren't in the repo |
| `samples/` | Downloaded banks (ignored) plus the committed `bloom_*` set and `strudel.json` |
| `test/` | `node:test` suites (`npm run test:unit`) |
| `references/`, `docs/` | Composition and pipeline guides. TESTING, testing-checklist and PROMOTION are stale (#69) |
| `.clawhubignore` | What the ClawHub bundle leaves out (ClawHub also honours `.gitignore`) |

## Set up and test

```bash
npm ci                              # npm run setup also works; it runs npm install
bash scripts/download-samples.sh    # Dirt-Samples banks into samples/
npm test                            # smoke test
npm run test:unit                   # renderers, WAV decoding, sample setup, dispatch, bundle rules (a few seconds)
npm run test:render                 # one v2 render
git status --porcelain              # tests must leave the tree clean
```

CI (`.github/workflows/ci.yml`) runs these plus a strict render of every shipped composition
with both renderers, a frontmatter check and a secret scan. A strict render fails on a sound with
no sample or synth, a dropped event or a warning from Strudel.

## Rules

- **Never change `version` in `package.json` in a pull request.** A push to `main` that changes
  it makes CI publish to ClawHub. Publishing is figs's decision, made separately (#69).
- **No plugin manifest at the repo root.** ClawHub refuses to publish a skill folder holding
  `.claude-plugin/plugin.json`, `openclaw.plugin.json`, `.codex-plugin`, `.cursor-plugin`, or a
  `package.json` with an `openclaw` key. A Claude Code plugin goes under `plugins/` (#71).
- **SKILL.md frontmatter** is `name`, `description` and `metadata`, with `metadata` as one line of
  JSON. Installer kinds are `brew`, `node`, `go` or `uv`: ClawHub's schema rejects any other kind,
  and OpenClaw silently drops anything but those and `download`. Declare every environment
  variable the scripts read in `metadata.openclaw.envVars`. When SKILL.md states a command, flag
  or default, check it against the code.
- **Keep `.clawhubignore` in step.** Contributor-only files (tests, this file, the audit) stay out
  of the bundle. `samples/*`, not `samples/`, so `!samples/strudel.json` can re-include the
  manifest; the same goes for `.gitignore`. WAVs stay out too: `samples/strudel.json` labels the
  committed `bloom_*` set as cut from someone else's recording, and ClawHub publishes every file
  as MIT-0. `test/bundle-ignore.test.mjs` checks these rules.
- **Renderer changes** go into both renderers until #67 picks one, or the pull request says why
  not. A behaviour fix comes with a test in `test/` that fails without it.
- **Compositions are code.** Node runs them with full access. offline-render-v2 hides
  `process.env` only from the file's top level; `import()`, `process.getBuiltinModule()` and
  callbacks that run during the render all get past it. Never render a composition taken from an
  issue, comment or download without reading it first.
- **Use only sounds that exist** in compositions you add: synth waveforms, noise, or folders in
  `samples/`. Render with `--strict`, which fails on anything that can't play as written, then
  run `scripts/qa-gate.py`.
- **Never commit** downloaded samples, renders (`*.wav`, `*.mp3`), keys, tokens or real Discord
  IDs. Tests use placeholder IDs.
- **Pull requests** start as drafts and merge with merge commits. Record the exact commands,
  versions and output you used as proof.

## People

The six princes, the two scribe-princes and figs (the human pet, `karmafeast` on GitHub). Cite
decisions by issue, pull request or commit, never by Discord message ID.
