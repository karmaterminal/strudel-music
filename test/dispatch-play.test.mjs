// `dispatch.sh play <name> [channel-id]` must hand the channel to vc-play.mjs.
// Run with: npm run test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dispatch = path.join(root, 'scripts/dispatch.sh');

// Stand-ins for node and ffmpeg, which dispatch.sh finds on PATH. Nothing is
// rendered and nothing joins Discord: the node stand-in only records how
// vc-play.mjs was called.
const nodeShim = `#!/usr/bin/env bash
case "$1" in
  */vc-play.mjs)
    shift
    printf '%s\\n' "$@" > "$SHIM_LOG/vc-play.args"
    printf '%s' "\${DISCORD_VC_CHANNEL_ID-}" > "$SHIM_LOG/vc-play.env"
    ;;
esac
exit 0
`;

function play(args, extraEnv = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), 'strudel-dispatch-'));
  try {
    const bin = path.join(dir, 'bin');
    mkdirSync(bin);
    writeFileSync(path.join(bin, 'node'), nodeShim);
    writeFileSync(path.join(bin, 'ffmpeg'), '#!/usr/bin/env bash\nexit 0\n');
    chmodSync(path.join(bin, 'node'), 0o755);
    chmodSync(path.join(bin, 'ffmpeg'), 0o755);
    const env = { ...process.env, ...extraEnv };
    if (!('DISCORD_VC_CHANNEL_ID' in extraEnv)) delete env.DISCORD_VC_CHANNEL_ID;
    env.PATH = `${bin}${path.delimiter}${process.env.PATH}`;
    env.STRUDEL_TMP = path.join(dir, 'renders');
    env.SHIM_LOG = dir;
    const run = spawnSync('bash', [dispatch, 'play', ...args], { cwd: root, env, encoding: 'utf8' });
    assert.equal(run.status, 0, `dispatch.sh failed:\n${run.stdout}\n${run.stderr}`);
    const argsFile = path.join(dir, 'vc-play.args');
    assert.ok(existsSync(argsFile), 'vc-play.mjs was never called');
    return {
      args: readFileSync(argsFile, 'utf8').split('\n').filter(Boolean),
      envChannel: readFileSync(path.join(dir, 'vc-play.env'), 'utf8') || undefined,
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// The channel vc-play.mjs would join: --channel <id>, else DISCORD_VC_CHANNEL_ID.
function channelSeenByVcPlay({ args, envChannel }) {
  const i = args.indexOf('--channel');
  return i >= 0 ? args[i + 1] : envChannel;
}

test('play with a channel id passes it to vc-play.mjs', () => {
  const call = play(['fog-and-starlight', '112233445566778899']);
  assert.equal(channelSeenByVcPlay(call), '112233445566778899');
  assert.match(call.args[0], /fog-and-starlight-48k\.wav$/);
});

test('play without a channel id leaves DISCORD_VC_CHANNEL_ID in charge', () => {
  const call = play(['fog-and-starlight'], { DISCORD_VC_CHANNEL_ID: '998877665544332211' });
  assert.ok(!call.args.includes('--channel'), `unexpected --channel in ${JSON.stringify(call.args)}`);
  assert.equal(channelSeenByVcPlay(call), '998877665544332211');
});
