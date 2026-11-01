# Review: PR #80 Claude Code plugin

**Verdict:** MAJOR — the plugin is schema-valid and the launcher is broadly safe, but its manifest version is unchanged across the plugin change, so an already-installed `0.1.0` plugin cannot receive the update.

## Named refs

| category | ref | Full SHA / identity | Equality |
|---|---|---|---|
| Product / PR head | `karmaterminal/strudel-music#80` head `claude/strudel-music-65-iq0mr4` | `474fee724078962b702404aef5e494c4f092a6dd` | local lane and `origin/pr/80/head` equal |
| Product / base | PR base `main` | `bc91d3c3025976740495db4bebac100637ed201a` | PR API baseSha and local `origin/main` equal |
| Lane | `codeagent/review-strudel-80` | `474fee724078962b702404aef5e494c4f092a6dd` | local and `origin/codeagent/review-strudel-80` equal |
| CI / workflow | `.github/workflows/ci.yml` at PR head | commit `474fee724078962b702404aef5e494c4f092a6dd`; file blob `1b11e07b72541b4ac94e60b532b3d7903d9b6ee6` | N/A for remote run; no hosted run dispatched |
| Presentation | N/A | N/A | N/A |
| Docs / proof | N/A | N/A | N/A |

The PR API supplied base `bc91d3c3025976740495db4bebac100637ed201a` and head `474fee724078962b702404aef5e494c4f092a6dd`.

## Findings

| Severity | Path | Concrete failing scenario | Confidence |
|---|---|---|---|
| MAJOR | `plugins/strudel-music/.claude-plugin/plugin.json:3`, `plugins/strudel-music/README.md:43-50`, `AGENTS.md:60-63` | An installation already at plugin version `0.1.0` runs `claude plugin update strudel-music@strudel-music` after this change: Claude Code compares the unchanged manifest version and can retain the old cache instead of replacing the launcher/plugin files. The PR's own test records this exact no-bump cache behavior. This blocks delivery of the changed launcher to every existing `0.1.0` install. | 9/10 |

## Per-property review

### Marketplace and plugin manifest

- `.claude-plugin/marketplace.json:1-17` names marketplace `strudel-music`, one plugin entry `strudel-music`, and a valid relative source `./plugins/strudel-music`.
- `plugins/strudel-music/.claude-plugin/plugin.json:1-12` names the same plugin and supplies the schema fields checked by Claude Code. The strict validator passed for both manifests.
- `test/plugin.test.mjs:36-47` verifies the marketplace source pattern, plugin name, and semantic-version shape.
- No finding: the manifest/marketplace names match, the plugin is not declared at the repository root, and the plugin folder has no extra root manifest.

### Launcher skill frontmatter and triggering

- `plugins/strudel-music/skills/strudel-music/SKILL.md:1-4` names the skill `strudel-music`, matching its folder, and describes music/theme/soundscape/beat requests plus named compositions.
- `test/plugin.test.mjs:50-62` verifies skill-folder naming and the description length/name fields.
- No finding: the trigger is specific enough to include the stated use cases and does not collide with a differently named skill.

### Setup, paths, and safety

- `plugins/strudel-music/skills/strudel-music/SKILL.md:11-18` rejects an unfilled `${CLAUDE_PLUGIN_DATA}` path and uses `set -u`.
- `plugins/strudel-music/skills/strudel-music/SKILL.md:20-48` distinguishes missing and partial working copies, requires Node 22.12 and git, quotes the clone/cd destination, and asks for approval before setup.
- `plugins/strudel-music/skills/strudel-music/SKILL.md:80-88` shows a non-native composition before rendering and forbids asking the person for a Discord token.
- `plugins/strudel-music/skills/strudel-music/SKILL.md:94-109` updates only on request, fast-forwards only, and asks before reset/checkout/clean; remove is an explicit uninstall command with `--keep-data`.
- No finding: all destructive setup/update/uninstall behavior is gated or explicit rather than a silent default, and data-path commands are quoted or guarded.

### Existing strudel workflow

- The launcher delegates runtime behavior to `${CLAUDE_PLUGIN_DATA}/strudel-music/SKILL.md` at `SKILL.md:54`, preserving the existing root instructions instead of copying a second set.
- `plugins/strudel-music/skills/strudel-music/SKILL.md:65-69` directs renders into an isolated plugin-data renders folder and invokes the QA gate.
- `test/plugin.test.mjs:71-91` ensures no root skill headings or symlinks are copied, and no second copy replaces the working-copy authority.
- No finding: the existing root smoke/render/dispatch workflow remains independent and is not modified by the plugin in this PR.

### Persistence, updates, and partial failure

- Working-copy readiness checks `.git`, so missing and partial setup are distinguished at `SKILL.md:15-29`.
- Ready copies run `npm test`; a failed test run triggers `npm ci`, sample restore, and another test before proceeding at `SKILL.md:24-29`.
- Update uses `git pull --ff-only`, then `npm ci`, samples, and smoke test at `SKILL.md:94-103`; refusal stops for human review.
- Uninstall removes the plugin data folder by default and supports `--keep-data` at `SKILL.md:106-109`.
- The MAJOR manifest-version issue above is the only update/persistence finding.

## Diff coverage

The full `bc91d3c3025976740495db4bebac100637ed201a...474fee724078962b702404aef5e494c4f092a6dd` diff adds:

- `.claude-plugin/marketplace.json`
- `plugins/strudel-music/.claude-plugin/plugin.json`
- `plugins/strudel-music/skills/strudel-music/SKILL.md`
- `plugins/strudel-music/README.md`
- `test/plugin.test.mjs`
- `test/bundle-ignore.test.mjs`
- Plugin-related README, AGENTS, CONTRIBUTING, CHANGELOG, audit, ClawHub ignore, and root SKILL/proof updates

The touched runtime/composition files are documentation or test coverage only; no existing renderer or composition behavior was changed.

## CI receipt

Commands were run at head `474fee724078962b702404aef5e494c4f092a6dd`.

- `claude plugin validate --strict .`: passed.
- `claude plugin validate --strict plugins/strudel-music`: passed; validator emitted only an expected listing icon warning (`ICON_MISSING`). It does not change validation success.
- `npm test`: 12 passed, 0 failed after downloading the repository's 21 sample banks.
- `node --test test/plugin.test.mjs`: 6 passed, 0 failed.
- `node --test test/bundle-ignore.test.mjs`: 5 passed, 0 failed when run without the lane-only dependency symlink.
- `npm run test:render`: passed; 352800 samples / 8.0 s rendered.
- `npm run test:unit`: 105 tests, 104 passed, 1 failed. The sole failure is `test/bundle-ignore.test.mjs:46`, because the lane dependency directory is a symlink and `git check-ignore` rejects `node_modules/@strudel/core/index.mjs` as “beyond a symbolic link.” The same test failed identically at base SHA `bc91d3c3025976740495db4bebac100637ed201a` under the same lane-only symlink setup (base bundle test: 3 passed, 1 failed). Running the bundle test without the symlink passes 5/5. It is therefore not a PR regression.

No hosted Mode-B run was dispatched. Per the standing lane policy, CI mode is **focused-only**: repo-local validation, focused tests, smoke, and render proofs only. The worktree lacked dependencies initially; I installed exact-head dependencies in a same-host detached clone and linked `node_modules` into the worktree. The full unit command's one symlink artifact was separately base-compared.
