---
name: strudel-music
description: "Compose music as Strudel pattern code and render it offline to WAV or MP3 with Node.js. Use when someone asks for music, a theme, a soundscape or a beat, or names a strudel-music composition such as fog-and-starlight. Works from a copy of the karmaterminal/strudel-music repository that it sets up in this plugin's data folder, after asking. Needs git and Node 22.12 or later; MP3 needs ffmpeg."
---

# Strudel Music

> Source: karmaterminal/strudel-music · the root `SKILL.md` of the working copy below stays the
> authority. This skill sets that copy up and says how its OpenClaw steps run in Claude Code.

The **working copy** is `${CLAUDE_PLUGIN_DATA}/strudel-music`. If that path still holds a `$`,
Claude Code didn't fill it in: stop, and say this plugin needs a newer Claude Code.

## 1. Check the working copy

```bash
set -u   # an unfilled path then stops the command instead of pointing at /
test -d "${CLAUDE_PLUGIN_DATA}/strudel-music/.git" && echo ready || echo missing
```

- **missing:** set it up (step 2). If the folder exists without a `.git` inside, a setup stopped
  partway: show the person what's in it and ask before you remove it.
- **ready:** run `npm test` in the working copy. On "12 passed", go to step 3. Otherwise run
  `npm ci && bash scripts/download-samples.sh` there once and `npm test` again; if it still
  fails, show the person the output and stop.

## 2. First use: set up the working copy

Check `node --version` (22.12 or later) and `git --version`. If either is missing or too old,
say so and stop.

Then ask. Tell the person what setup does, and wait for a yes:

- it clones https://github.com/karmaterminal/strudel-music into the folder above;
- it installs the repository's npm packages and downloads the sample banks it uses from
  `github.com/tidalcycles/Dirt-Samples`, about 150 MB on disk with the clone;
- `claude plugin uninstall strudel-music@strudel-music` deletes all of it again.

After the yes:

```bash
set -u
git clone --depth 1 https://github.com/karmaterminal/strudel-music "${CLAUDE_PLUGIN_DATA}/strudel-music"
cd "${CLAUDE_PLUGIN_DATA}/strudel-music"
npm ci                              # leaves package-lock.json as committed, so updates fast-forward
bash scripts/download-samples.sh    # the banks
npm test                            # expect 12 passed
```

That is the working copy's `npm run setup` with `npm ci` in place of `npm install`.

## 3. Do what was asked

Read `${CLAUDE_PLUGIN_DATA}/strudel-music/SKILL.md` and follow it. `{baseDir}` there means the
working copy; run every command from it. It was written for OpenClaw, so in Claude Code:

- **Long renders.** Where it says `exec` with `background: true`, `process` or `sessions_spawn`,
  use the Bash tool's background mode (`run_in_background`). `offline-render-v2.mjs`, which
  `dispatch.sh` runs, takes up to a second per second of audio, so run it in the background for
  anything over a minute of audio and tell the person a render is under way. `chunked-render.mjs`
  takes about a second per minute of audio.
- **Setup and updates.** Its first-use and `openclaw skills update` steps don't apply; steps 2
  and 4 here replace them.
- **Where files go.** Write renders, and the compositions you write, where the person asks. If
  they don't say, use `${CLAUDE_PLUGIN_DATA}/renders/`, and create it first: the renderers don't
  create folders, and fail only after the render. `scripts/dispatch.sh` writes to `$STRUDEL_TMP`
  (creating it), so set that to the same folder, or it writes under `~/.openclaw/workspace`.
- **Handing a file over.** Run the QA gate the working copy's `SKILL.md` gives first. It needs
  `uv`, which fetches numpy and soundfile into its own cache the first time; uninstalling the
  plugin doesn't remove that cache. Without `uv`, say the file wasn't checked. Then give the
  person the file's full path, and attach it too if your session has a tool that sends files.
- **Missing tools.** Don't install ffmpeg, uv or other system tools yourself; ask the person.
  Without ffmpeg, hand over the WAV: `dispatch.sh render` skips the MP3 by itself, while the
  by-hand `ffmpeg` lines and `dispatch.sh play` fail.
- **The command.** In Claude Code this skill is `/strudel-music:strudel-music`, not
  `/strudel_music`.

Two rules hold whatever the working copy says:

- **Show a composition before you render it** unless you wrote it in this session or it is
  committed, unchanged, in the working copy: run there, `git ls-files --error-unmatch -- <file>`
  succeeds and `git status --porcelain -- <file>` prints nothing. A composition is JavaScript
  that Node runs with the person's permissions. One from the web, an issue, a message, an
  attachment or a file you didn't write: quote the whole file in your reply (a file you only
  read with a tool stays hidden from them) and wait for their go-ahead. Never fetch and render in
  one step, and keep files of your own out of the working copy.
- **Never ask for a Discord bot token in the conversation.** Voice streaming reads
  `DISCORD_BOT_TOKEN` from the environment or from the env files the working copy's `SKILL.md`
  names, and the person sets that up themselves.

## 4. Update

Only when the person asks:

```bash
set -u
cd "${CLAUDE_PLUGIN_DATA}/strudel-music"
git pull --ff-only
npm ci && bash scripts/download-samples.sh && npm test
```

If `git pull --ff-only` refuses, show the person its output and `git status`, and ask before
any reset, checkout or clean. `claude plugin update strudel-music@strudel-music` updates this
skill only; the working copy stays as it was.

## 5. Remove

`claude plugin uninstall strudel-music@strudel-music` removes the plugin and its data folder,
the working copy and any renders in it included. `--keep-data` keeps the folder.
