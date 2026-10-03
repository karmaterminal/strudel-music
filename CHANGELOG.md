# Changelog

## Unreleased

### Fixed
- **Numeric notes render at the right pitch.** Both renderers treated a number in `note()`, such as `note(57)` or the result of `.add(note(12))`, as Hz instead of a MIDI note number. `note(57)` played at 57 Hz, not A3 (220 Hz). The echo voices in `elliott-theme` and `silas-theme` were affected. `test/render-pitch.test.mjs` covers both renderers.
- **`dispatch.sh play <name> <channel-id>` streams to that channel.** It set `DISCORD_CHANNEL_ID`, which `vc-play.mjs` never reads, so the channel was ignored. It now passes `--channel`. Covered by `test/dispatch-play.test.mjs`.
- **`samples/strudel.json` reaches the ClawHub bundle.** `.clawhubignore` and `.gitignore` ignored `samples/`, which made the `!samples/strudel.json` re-include impossible. Both now use `samples/*`.
- `package-lock.json` carries the package version (it said 1.0.4), so `npm install` no longer rewrites it.

### Changed
- **SKILL.md rewritten against OpenClaw 2026.9.8 and ClawHub CLI 0.23.3.**
  - The frontmatter is `name`, `description` and one-line JSON `metadata`.
  - Installers are `brew` (ffmpeg) and `uv` (demucs). OpenClaw silently dropped the old `script` and `apt` kinds.
  - Every environment variable the scripts read is declared in `envVars`.
  - Corrected: voice streaming needs `DISCORD_BOT_TOKEN`.
  - Corrected: the command is `/strudel_music`, not `/strudel`.
  - Paths use `{baseDir}`, and the exec parameters are OpenClaw's current ones.
  - New: which sounds and controls each renderer actually implements.
- README, docs/ONBOARDING.md and CONTRIBUTING.md match the code. The onboarding example used a sound that doesn't ship and effects neither renderer implements; it now renders cleanly and passes the QA gate.
- Added AGENTS.md and CLAUDE.md for coding agents.
- Added `docs/audit-2026-10.md`, the resurrection audit (#65).
- CI runs `npm run test:unit`.
- Stale release and integration docs are marked as such.

## 1.2.2

### Security
- **Shell injection fix in `scripts/dispatch.sh`** — All user-controlled arguments (composition names, channel IDs, BPM, cycles) are now validated before use. Composition names restricted to `[a-zA-Z0-9_-]`, channel IDs and numeric args validated as numeric-only, file paths checked for traversal and shell metacharacters. Resolves ClawHub scanner "suspicious" classification.

### Fixed
- **T9: graceful error on missing composition file** — `offline-render-v2.mjs` now checks `existsSync` before `readFileSync`, showing a clean filename-only error instead of a stack trace when a composition path doesn't exist.

### Changed
- **Doc cleanup** — Replaced internal jargon with general-audience language in `references/gain-calibration.md`, `references/composing.md`, and `docs/PROMOTION.md`.

## 1.2.1

### Removed
- **`scripts/render-pattern.sh`** — Browser-based renderer using Puppeteer with `--no-sandbox`. Superseded by `src/runtime/offline-render-v2.mjs` which runs entirely in Node.js with frozen `process.env` and blocked `child_process`. Retrievable from git history at commit prior to this removal.
- **`scripts/stream-to-vc.sh`** — Legacy VC streaming wrapper. Superseded by `scripts/vc-play.mjs`.
- **`scripts/repl-capture.mjs`** — Puppeteer-based REPL capture utility with `--no-sandbox`. No longer needed — offline rendering handles all use cases.
- **`src/runtime/render.mjs`** — V1 local renderer using `vm.runInNewContext`. Superseded by `offline-render-v2.mjs` which uses stronger sandboxing. Retrievable from git history.

### Why
ClaHub security scanner flagged these deprecated scripts as suspicious due to Puppeteer `--no-sandbox` and `vm.runInNewContext` usage. All functionality is covered by the active renderer (`offline-render-v2.mjs`) which implements proper security hardening. Removing dead code from the bundle moves the skill from "suspicious" to "benign" in scanner classification.

## 1.2.0

### Added
- `references/composing.md` — Dream-to-composition methodology (Ronan 🌊)
- `references/gain-calibration.md` — Sample gain ranges and the 300× lesson (Cael 🩸 / Elliott 🌻)
- `references/rendering.md` — Pipeline documentation (Cael 🩸)
- `references/spectral-validation.md` — QA and spectral analysis (Silas 🌫️)
- SKILL.md cold-start guide and quickstart section (Elliott 🌻 / Cael 🩸)
