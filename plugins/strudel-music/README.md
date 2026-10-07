# The strudel-music plugin for Claude Code

One skill, [`strudel-music`](skills/strudel-music/SKILL.md), that lets a Claude Code session
compose Strudel music and render it with this repository. The skill keeps a working copy of the
repository in the plugin's data folder, sets it up the first time you ask for music (after asking
you), and then follows the working copy's own [`SKILL.md`](../../SKILL.md). The plugin carries no
second copy of those instructions, so the two can't drift apart.

The plugin adds no tools, hooks or MCP servers.

**Needs:** Claude Code (tested with 2.1.292; the skill relies on it filling in
`${CLAUDE_PLUGIN_DATA}`), git, Node 22.12 or later, and access to github.com and the npm registry
for setup. ffmpeg for MP3 and voice, and `uv` for the QA gate. The working copy takes about
150 MB once set up.

## Install

```sh
claude plugin marketplace add karmaterminal/strudel-music
claude plugin install strudel-music@strudel-music
```

Inside a session, `/plugin marketplace add karmaterminal/strudel-music` adds the marketplace, and
`/plugin install strudel-music@strudel-music` installs the plugin. The skill loads when a request
matches its description, or by name as `/strudel-music:strudel-music`.

- **From a checkout:** `claude plugin marketplace add ./` in the repository root.
- **Pin** a branch or tag: `karmaterminal/strudel-music#<ref>`. That pins the plugin, not the
  working copy, which the skill clones from the default branch.
- **Update the plugin:** `claude plugin marketplace update strudel-music`, then
  `claude plugin update strudel-music@strudel-music`, then restart the session. To update the
  working copy, ask the skill to; it pulls and sets up again.
- **Remove:** `claude plugin uninstall strudel-music@strudel-music` deletes the plugin and its data
  folder: the working copy, and any renders the skill left there (`--keep-data` keeps the
  folder). Then `claude plugin marketplace remove strudel-music`.

Only Claude Code is tested. Other tools that read `.claude-plugin/marketplace.json` may install
the plugin, but nothing here says they do. OpenClaw installs the repository's root `SKILL.md`
instead; the [README](../../README.md#install-as-a-skill) has its commands.

## Changing the plugin

- Bump `version` in [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json) with every change
  under `plugins/`. Claude Code pins an installed plugin to that version, so without a bump
  `update` changes nothing.
- Keep the skill a launcher: no copy of the root `SKILL.md`, and no symlinks, which the plugin
  cache copy may not keep. In `SKILL.md`, Claude Code fills in `${CLAUDE_PLUGIN_DATA}`, and treats
  `$ARGUMENTS`, `$0`, `$1`... as the arguments and `` !`command` `` as a command to run when the
  skill loads, so keep those out of it. Start each bash block that uses `${CLAUDE_PLUGIN_DATA}`
  with `set -u`: if the path is ever left unfilled, the command stops instead of reaching `/`.
  `test/plugin.test.mjs` checks all of this.
- Before pushing, from the repository root:

  ```sh
  claude plugin validate --strict .
  claude plugin validate --strict plugins/strudel-music
  npm run test:unit
  ```
