// `download-samples.sh` must refuse arguments it doesn't know, a run that stops partway must leave
// each bank whole (the old one or the new one), and the run after one that was killed must put
// back a bank it left moved aside.
// Run with: npm run test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Stand-ins for git, cp and mv, which the script finds on PATH. Nothing is downloaded: the git
// stand-in "fetches" each sparse-checkout folder as a bank holding one new.wav. The cp stand-in
// stops halfway through copying the bank named in $FAIL_BANK, and the mv stand-in can't swap in
// the copy of the bank named in $FAIL_SWAP.
const gitShim = `#!/usr/bin/env bash
echo "$*" >> "$SHIM_LOG/git.log"
if [ "$1" = init ]; then mkdir -p "\${@: -1}"; exit 0; fi
dir="$2"
shift 2
case "$1" in
  sparse-checkout) shift 2; printf '%s\\n' "$@" > "$dir/.banks" ;;
  checkout) while read -r bank; do mkdir -p "$dir/$bank"; : > "$dir/$bank/new.wav"; done < "$dir/.banks" ;;
esac
exit 0
`;
const cpShim = `#!/usr/bin/env bash
src="\${@: -2:1}" dest="\${@: -1}"
if [ "$(basename "$src")" = "\${FAIL_BANK-}" ]; then
  [ -d "$dest" ] && dest="$dest/$(basename "$src")"
  mkdir -p "$dest" && : > "$dest/half.wav"
  exit 1
fi
PATH="\${PATH#*:}" exec cp "$@"
`;
const mvShim = `#!/usr/bin/env bash
src="\${@: -2:1}"
if [ "$(basename "$src")" = ".\${FAIL_SWAP-}.partial" ]; then exit 1; fi
PATH="\${PATH#*:}" exec mv "$@"
`;

// Runs a copy of the script whose samples/ folder starts with `banks` ({ name: [file, ...] }).
// Returns what it printed, the git commands it ran, and what samples/ then holds.
function download(args, { banks = {}, failBank = '', failSwap = '' } = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), 'strudel-download-'));
  try {
    const script = path.join(dir, 'scripts', 'download-samples.sh');
    mkdirSync(path.dirname(script));
    copyFileSync(path.join(root, 'scripts', 'download-samples.sh'), script);
    const samples = path.join(dir, 'samples');
    for (const [bank, files] of Object.entries(banks)) {
      mkdirSync(path.join(samples, bank), { recursive: true });
      for (const file of files) writeFileSync(path.join(samples, bank, file), '');
    }
    const bin = path.join(dir, 'bin');
    mkdirSync(bin);
    writeFileSync(path.join(bin, 'git'), gitShim);
    for (const [tool, shim] of [['git', gitShim], ['cp', cpShim], ['mv', mvShim]]) {
      writeFileSync(path.join(bin, tool), shim);
      chmodSync(path.join(bin, tool), 0o755);
    }
    const env = {
      ...process.env,
      PATH: `${bin}${path.delimiter}${process.env.PATH}`,
      SHIM_LOG: dir,
      FAIL_BANK: failBank,
      FAIL_SWAP: failSwap,
    };
    const run = spawnSync('bash', [script, ...args], { env, encoding: 'utf8' });
    const log = path.join(dir, 'git.log');
    return {
      status: run.status,
      output: `${run.stdout}\n${run.stderr}`,
      git: existsSync(log) ? readFileSync(log, 'utf8').split('\n').filter(Boolean) : [],
      samples: existsSync(samples)
        ? Object.fromEntries(readdirSync(samples).sort().map((bank) => [bank, readdirSync(path.join(samples, bank)).sort()]))
        : {},
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('download-samples.sh refuses an argument it does not know, and fetches nothing', () => {
  for (const args of [['--frce'], ['--force', 'extra']]) {
    const { status, output, git, samples } = download(args, { banks: { bd: ['old.wav'] } });
    assert.equal(status, 1, output);
    assert.match(output, /Usage: download-samples\.sh \[--force\]/);
    assert.deepEqual(git, [], `${args.join(' ')} ran git`);
    assert.deepEqual(samples, { bd: ['old.wav'] });
  }
});

test('download-samples.sh fetches only the banks that are missing', () => {
  const { status, output, git, samples } = download([], { banks: { bd: ['old.wav'] } });
  assert.equal(status, 0, output);
  const sparse = git.find((line) => line.includes('sparse-checkout set'));
  assert.ok(sparse && !/ bd( |$)/.test(sparse) && / sd( |$)/.test(sparse), sparse);
  assert.deepEqual(samples.bd, ['old.wav']);
  assert.deepEqual(samples.sd, ['new.wav']);
  assert.equal(Object.keys(samples).length, 21, Object.keys(samples).join(' '));
});

// bd and sd come before hh, so they are swapped in whole before hh fails.
test('a copy cut short leaves its bank as it was, and nothing half-copied', () => {
  const { status, output, samples } = download(['--force'],
    { banks: { bd: ['old.wav'], hh: ['old.wav'] }, failBank: 'hh' });
  assert.notEqual(status, 0, output);
  assert.deepEqual(samples, { bd: ['new.wav'], hh: ['old.wav'], sd: ['new.wav'] });
});

test('a swap that fails puts the old bank back', () => {
  const { status, output, samples } = download(['--force'],
    { banks: { bd: ['old.wav'], hh: ['old.wav'] }, failSwap: 'hh' });
  assert.notEqual(status, 0, output);
  assert.deepEqual(samples, { bd: ['new.wav'], hh: ['old.wav'], sd: ['new.wav'] });
});

const hidden = (samples) => Object.keys(samples).filter((name) => name.startsWith('.'));

// A run killed between the two renames leaves bd moved aside as .bd.old, its copy beside it, and
// no bd. The next run must put the old bank back before anything can fail.
test('a run after one killed mid-swap puts the old bank back first', () => {
  const { status, output, git, samples } = download([],
    { banks: { '.bd.old': ['old.wav'], '.bd.partial': ['new.wav'] }, failBank: 'bd' });
  assert.equal(status, 0, output);
  assert.deepEqual(samples.bd, ['old.wav']);
  const sparse = git.find((line) => line.includes('sparse-checkout set'));
  assert.ok(sparse && !/ bd( |$)/.test(sparse), sparse);
  assert.deepEqual(hidden(samples), []);
});

test('with --force, a copy that fails after such a run still leaves the old bank', () => {
  const { status, output, samples } = download(['--force'],
    { banks: { '.bd.old': ['old.wav'] }, failBank: 'bd' });
  assert.notEqual(status, 0, output);
  assert.deepEqual(samples, { bd: ['old.wav'] });
});

// Killed after the second rename, or partway through copying a bank that was present.
test('what a killed run leaves beside whole banks goes, and the banks stay as they are', () => {
  const { status, output, samples } = download([],
    { banks: { bd: ['new.wav'], '.bd.old': ['old.wav'], sd: ['old.wav'], '.sd.partial': ['half.wav'] } });
  assert.equal(status, 0, output);
  assert.deepEqual(samples.bd, ['new.wav']);
  assert.deepEqual(samples.sd, ['old.wav']);
  assert.deepEqual(hidden(samples), []);
});
