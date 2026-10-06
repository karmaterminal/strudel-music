# Changelog

## Unreleased

### Fixed
- **Numeric notes render at the right pitch.** Both renderers treated a number in `note()`, such as `note(57)` or the result of `.add(note(12))`, as Hz instead of a MIDI note number. `note(57)` played at 57 Hz, not A3 (220 Hz). The echo voices in `elliott-theme` and `silas-theme` were affected. `note(0)` played 440 Hz in both; it now plays MIDI note 0. `test/render-pitch.test.mjs` covers both renderers.
- **`dispatch.sh play <name> <channel-id>` streams to that channel.** It set `DISCORD_CHANNEL_ID`, which `vc-play.mjs` never reads, so the channel was ignored. It now passes `--channel`. Covered by `test/dispatch-play.test.mjs`.
- **`samples/strudel.json` reaches the ClawHub bundle.** `.clawhubignore` and `.gitignore` ignored `samples/`, which made the `!samples/strudel.json` re-include impossible. Both now use `samples/*`. Covered by `test/bundle-ignore.test.mjs`. None of its entries resolves in a ClawHub install yet: the `bloom_*` WAVs stay out of the bundle, and the other 28 samples it names were never committed.
- `package-lock.json` carries the package version (it said 1.0.4), so `npm install` no longer rewrites it.
- CI's check for hardcoded token assignments can fail again. Its last `grep` treated `\$\{` as a broken regex and exited 2, so the check always passed.
- **Every sound the shipped compositions name now plays** (#66). Nine of the fifteen named a sound setup never installed: `chunked-render.mjs` dropped those events, and `offline-render-v2.mjs` played them as a 440 Hz triangle.
  - Setup fetches eight more Dirt-Samples banks (`ho rm metal chin insect wind industrial glitch`) and no longer asks for `oh`, `ride` and `rim`, which Dirt-Samples doesn't have.
  - Strudel's `oh` and `rim` play the `ho` and `rm` banks.
  - Both renderers play `white`, `pink` and `brown` noise, made as superdough 1.1.0 makes it, from a fixed seed.
  - `n` wraps around a bank as in Strudel: `insect:4` of three files plays `insect:1`. It used to play the first file.
  - `chunked-render.mjs` plays a note with no `.s()` as a triangle, Strudel's default. It dropped it.
  - Covered by `test/render-sounds.test.mjs` and `test/sounds.test.mjs`.
- **Corrections in three of Silas's pieces** (#66). `elliott-theme`'s octave shimmer is `x.add(note(12))`: `.add(12)` made Strudel warn and leave the pitch alone. Its pentatonic voice is `"g5:major:pentatonic"`: the space made it play G major. `victory-imperium`'s detuned copies are `add(note(0.03))` and `add(note(0.02))`; they doubled the note instead. `cathedral-ritual`'s bells, which had no sample, are `metal:1` and `metal:3`.
- **The snare and cowbell are no longer silent** (#66). Dirt-Samples' `sd` and `cb` banks are 32-bit float WAVs, and both renderers read only 16- and 24-bit PCM, so they loaded as silence. The snares in `cael-theme`, `combat-assault`, `lofi-chill-beats` and `victory-imperium` never sounded, and `--strict` passed. The renderers now share one WAV decoder, for PCM at 8, 16, 24 or 32 bits and float at 32 or 64, plain or WAVE_FORMAT_EXTENSIBLE. With the snare audible, the examples in SKILL.md and docs/ONBOARDING.md failed the QA gate in `offline-render-v2.mjs` (true peak −0.1 and −0.9 dBFS); their snare gain is now 0.25, and both pass in both renderers.
- **Bad input fails instead of passing quietly** (#66).
  - A WAV the renderers can't read no longer takes its bank with it. They name it after loading, an event that picks it is dropped (which fails `--strict`), and the bank's other files keep their places, so `n` picks the same file. A file cut short plays what it holds. A float file holding a sample that isn't a finite number counts as unreadable: one such sample silenced the whole render.
  - A bank folder the renderers can't open is named the same way. It used to pass for a sound that doesn't exist.
  - Dot-files, such as the `._name.wav` files macOS leaves beside copies, and hidden folders are skipped.
  - An unknown option, an extra argument, a cycle count or BPM that isn't a positive number, a chunk size that isn't a whole number of cycles, or a `--samples` folder or `--prebake` file that doesn't exist stops the render with exit status 1. A misspelt `--strict` used to render without it, a cycle count of `abc` crashed `offline-render-v2.mjs` and gave an empty file from `chunked-render.mjs`, and a chunk size of 0 made `chunked-render.mjs` loop forever.
  - `chunked-render.mjs` fails with exit status 1 when nothing plays, as `offline-render-v2.mjs` does. It wrote a silent file.
  - An `n` that isn't a number plays the bank's first file with Strudel's own warning, which fails `--strict`.
  - `download-samples.sh` refuses any argument but `--force`. It copies each bank beside the old one and swaps it in with two renames, so a run that stops partway leaves the old bank or the new one. A misspelt `--force` ran as a plain update, and an interrupted run could leave part of a bank that later runs took as present.
  - Covered by `test/render-sounds.test.mjs`, `test/sounds.test.mjs` and `test/download-samples.test.mjs`.

### Changed
- **SKILL.md rewritten against OpenClaw 2026.9.8 and ClawHub CLI 0.23.3.**
  - The frontmatter is `name`, `description` and one-line JSON `metadata`.
  - Installers are `brew` (ffmpeg) and `uv` (demucs). OpenClaw silently dropped the old `script` and `apt` kinds.
  - Every environment variable the scripts read is declared in `envVars`.
  - Corrected: voice streaming needs `DISCORD_BOT_TOKEN`.
  - Corrected: the command is `/strudel_music`, not `/strudel`.
  - Paths use `{baseDir}`, and the exec parameters are OpenClaw's current ones.
  - New: which sounds and controls each renderer actually implements.
  - Corrected: `offline-render-v2.mjs`'s environment scrub covers only the file's top level, not `import()` or callbacks that run during the render.
- README, docs/ONBOARDING.md and CONTRIBUTING.md match the code. The onboarding example used a sound that doesn't ship and effects neither renderer implements; it now renders cleanly and passes the QA gate.
- Added AGENTS.md and CLAUDE.md for coding agents.
- Added `docs/audit-2026-10.md`, the resurrection audit (#65).
- CI runs `npm run test:unit`.
- Stale release and integration docs are marked as such.
- **`scripts/download-samples.sh` fetches Dirt-Samples at a pinned commit** (c74fc80, 2025-03-18) and only the banks that are missing, so an install that ran the old script picks up the new banks. Its file count includes `.WAV` files and leaves out the committed `bloom_*` set (#66).
- **Both renderers list what didn't play as written** after each render: sound names with no sample or synth, dropped events, and Strudel's own warnings and errors. `--strict` makes that list fail the render with exit status 2 (#66, and part of #26). `--samples=<dir>` reads banks from another folder.
- CI renders every shipped composition with both renderers in strict mode: `offline-render-v2.mjs` for 2 cycles, `chunked-render.mjs` for 32. The old step ran only v2 and filtered its output, so missing sounds never failed it.
- README and SKILL.md say how to update and remove an installed skill. Once setup has run, `openclaw skills update` needs `--force`, which replaces the folder, so setup has to run again (#70).
- Corrected: the 1.2.2 entry says its `dispatch.sh` fix resolved ClawHub's "suspicious" rating. ClawHub's latest scan of 1.2.2, on 2026-09-10, rates it suspicious (#70).

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
