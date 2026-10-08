# Contributing to strudel-music

Pull requests are welcome. This is a dandelion cult project: we value clean work over volume.
Agents: read [AGENTS.md](AGENTS.md) first.

## What we're looking for

- **Compositions** that render cleanly (below)
- **Renderer work:** one canonical renderer (#67), effects (#68)
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
- `plugins/strudel-music/`: the Claude Code plugin, listed in `.claude-plugin/marketplace.json`

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
3. **Leave `version` in `package.json` alone** unless figs has asked for a release. See Releasing.
4. **Security-sensitive changes** must update `SKILL.md` § Security.
5. **AI-assisted work is fine.** Disclose it in the pull request.

## CI

Every pull request and every push to `main` runs:

- the smoke test (`npm test`), the unit tests (`npm run test:unit`) and a strict render of every
  shipped composition with both renderers
- a `SKILL.md` frontmatter check and a composition readability check
- a scan for secrets and hardcoded paths

## Releasing

CI never publishes. A release is figs's decision, and figs publishes it to ClawHub from the
`karmafeast` account. Run the ClawHub CLI through `npx`, pinned: `npx -y clawhub@0.23.3`.

These steps are for ClawHub. The Claude Code plugin has no release of its own: Claude Code
installs it from this repository, and its skill clones `main`. A change under `plugins/` reaches
plugin users once its `version` in `plugin.json` is bumped and they update the plugin; a change
anywhere else reaches them when they ask the skill to update its working copy.

1. **Bump the version** in a pull request for that release:
   `npm version <version> --no-git-tag-version` sets it in `package.json` and
   `package-lock.json`. Rename the CHANGELOG's Unreleased heading to the version. Pick a number
   ClawHub hasn't used; `npx -y clawhub@0.23.3 inspect @karmafeast/strudel-music --versions`
   lists them. They include a 2.0.0 published by hand on 2026-02-26, a higher number than
   `latest` (1.2.2); 1.2.3 or 1.3.0 is still fine.
2. **Dry-run the merge commit** of that pull request in a fresh clone, once CI has passed on it.
   ClawHub bundles every file in the folder that the top-level `.gitignore` and
   `.clawhubignore` don't exclude, tracked or not, so a working copy can add files you didn't
   mean to ship.

   ```bash
   git clone https://github.com/karmaterminal/strudel-music && cd strudel-music
   git checkout <merge commit>
   npx -y clawhub@0.23.3 skill publish . --slug strudel-music --name "Strudel Music" \
     --version <version> --source-repo karmaterminal/strudel-music \
     --source-commit "$(git rev-parse HEAD)" --dry-run --json
   ```

   It needs no login, though it does query clawhub.ai. It should report
   `"status": "would-publish"` and a `fileCount`. It checks the bundle, not the number: it says
   `would-publish` even for a version ClawHub already has. `--name` sets the name ClawHub shows;
   without it, the CLI makes one from the folder's name.
3. **Check the file list** in the same clone. The dry run counts the files but doesn't name
   them. This prints them, chosen by the same rules, one per line:

   ```bash
   git ls-files | grep -vxFf <(git ls-files -ci -X .gitignore -X .clawhubignore) | grep -v '\(^\|/\)\.'
   ```

   It should print `fileCount` lines. WAVs, `test/`, `AGENTS.md`, `CLAUDE.md` and the audit stay
   out; `samples/strudel.json` goes in. The line can't see what ClawHub also drops or refuses:
   symlinks, a top-level `skill-card.md`, a file over 10 MB or a bundle over 50 MB.
4. **figs publishes:** the same command without `--dry-run`, logged in as `karmafeast`
   (`npx -y clawhub@0.23.3 login`). Add `--changelog` with a line from the CHANGELOG; without
   it, ClawHub writes its own summary. Publishing accepts ClawHub's terms, which put every file
   under MIT-0, and it doesn't ask. This repository is MIT, so figs confirms that MIT-0 is
   acceptable before the first release after 1.2.2 (#69).
5. **Confirm it on ClawHub,** not from the publish output: the last two automatic publishes went
   red after they had published.
   - `npx -y clawhub@0.23.3 inspect @karmafeast/strudel-music --version <version> --files`
     lists the new version and its files.
   - Once ClawHub has scanned it,
     `npx -y clawhub@0.23.3 skill verify @karmafeast/strudel-music --version <version>` gives
     the verdict. 1.2.2 fails (`card.missing`, `security.status_not_clean`).
   - Install it in a scratch agent as #70 did: install, `npm run setup`, `npm test`, a render,
     the QA gate, then uninstall.
6. **Tag the commit you published:** `git tag -a v<version> -m v<version> <merge commit>`, then
   `git push origin v<version>`.

## Attribution

Work is attributed to the dandelion cult. Individual contributions are tracked in git history.
