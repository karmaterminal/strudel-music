// Both renderers must play a synth note at the pitch Strudel means.
// Run with: npm run test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { measureHz, readLeftChannel } from './wav-helpers.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const renderers = ['src/runtime/offline-render-v2.mjs', 'src/runtime/chunked-render.mjs'];

// Strudel reads a number in note() as a MIDI note number: 57 is A3, 220 Hz.
// The note name is the control case; both must sound the same. 0 is a note too,
// MIDI note 0 at about 8.18 Hz, though it is falsy. (Strudel 1.1.0's own synth
// reads note 0 as missing and plays C2; MIDI and its sampler say note 0.)
const cases = [
  ['MIDI note number note("57")', 'note("57")', 220],
  ['note name note("a3")', 'note("a3")', 220],
  ['MIDI note number note("0")', 'note("0")', 440 * Math.pow(2, -69 / 12)],
];

for (const renderer of renderers) {
  for (const [label, expr, expected] of cases) {
    const expectedHz = +expected.toFixed(2);
    test(`${path.basename(renderer)} plays ${label} at ${expectedHz} Hz`, () => {
      const dir = mkdtempSync(path.join(tmpdir(), 'strudel-pitch-'));
      try {
        const composition = path.join(dir, 'pitch.js');
        const wav = path.join(dir, 'pitch.wav');
        // 15 cycles per minute: one cycle, one note, four seconds.
        writeFileSync(composition, `setcpm(15)\n${expr}.s("sine")\n`);
        const run = spawnSync(process.execPath, [path.join(root, renderer), composition, wav, '1'], {
          cwd: root,
          encoding: 'utf8',
        });
        assert.equal(run.status, 0, `${renderer} failed:\n${run.stdout}\n${run.stderr}`);
        const { left, sampleRate } = readLeftChannel(wav);
        // Measure inside the note, clear of the attack and of v2's master fade.
        const hz = measureHz(left, sampleRate, 0.5, 1.5);
        assert.ok(Math.abs(hz - expected) <= 4,
          `expected about ${expectedHz} Hz, measured ${hz.toFixed(1)} Hz`);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  }
}
