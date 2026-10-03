// What the ClawHub bundle holds. ClawHub publishes the files that neither .gitignore nor
// .clawhubignore excludes, read with gitignore rules, so git check-ignore stands in for it.
// Run with: npm run test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function git(args) {
  return spawnSync('git', args, { cwd: root, encoding: 'utf8' });
}

// Only meaningful at the top of this repo's own checkout: elsewhere git would read some other
// repository's rules, or none. CI always has the checkout, so it never skips.
const top = git(['rev-parse', '--show-toplevel']);
const skip = !process.env.CI &&
  (top.status !== 0 || realpathSync(top.stdout.trim()) !== realpathSync(root))
  ? 'needs a git checkout of this repository'
  : false;

function ignored(file) {
  // --no-index: judge committed files by the rules, as ClawHub does.
  const run = git(['-c', `core.excludesFile=${path.join(root, '.clawhubignore')}`,
    'check-ignore', '--no-index', '-q', file]);
  assert.ok(run.status === 0 || run.status === 1, `git check-ignore failed: ${run.stderr}`);
  return run.status === 0;
}

const published = (file) => assert.equal(ignored(file), false, `${file} is left out of the bundle`);
const leftOut = (file) => assert.equal(ignored(file), true, `${file} would be published`);

test('samples/strudel.json reaches the bundle', { skip }, () => {
  published('samples/strudel.json');
});

test('the skill itself reaches the bundle', { skip }, () => {
  for (const file of ['SKILL.md', 'README.md', 'package.json', 'src/runtime/chunked-render.mjs',
    'scripts/dispatch.sh', 'assets/compositions/fog-and-starlight.js']) published(file);
});

test('samples, renders and dependencies stay out', { skip }, () => {
  for (const file of ['samples/bd/BT0A0A7.wav', 'samples/bloom_kick/bloom_kick.wav',
    'output/fog.mp3', 'node_modules/@strudel/core/index.mjs']) leftOut(file);
});

test('contributor-only files stay out', { skip }, () => {
  for (const file of ['test/bundle-ignore.test.mjs', 'AGENTS.md', 'CLAUDE.md',
    'docs/audit-2026-10.md']) leftOut(file);
});
