// chunked-render shifts a tonal sample's pitch by resampling it, then stretching it back to its
// own length with WSOLA. A shifted note must start at its own level: no near-silent first
// milliseconds and no click after them (#81). offline-render-v2 changes the playback rate
// instead and has no such step, so only chunked-render is tested here.
// Run with: npm run test:unit
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { encodeWav, readLeftChannel, tone } from './wav-helpers.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = mkdtempSync(path.join(tmpdir(), 'strudel-pitch-shift-'));
after(() => rmSync(dir, { recursive: true, force: true }));

// A 1 kHz tone, one second long. With no note in its name and no strudel.json, its root is C4.
const samples = path.join(dir, 'samples');
mkdirSync(path.join(samples, 'tone'), { recursive: true });
writeFileSync(path.join(samples, 'tone', '0.wav'), encodeWav([tone(1000, 1)], 44100));

for (const [note, shift] of [['g3', -5], ['a3', -3], ['d4', 2]]) {
  test(`chunked-render starts a tonal sample shifted ${shift} semitones at its own level`, () => {
    const composition = path.join(dir, `${note}.js`);
    const wav = path.join(dir, `${note}.wav`);
    // 15 cycles per minute: the note starts at 0 and has four seconds to play out.
    writeFileSync(composition, `setcpm(15)\nnote("${note}").s("tone")\n`);
    const run = spawnSync(process.execPath,
      [path.join(root, 'src/runtime/chunked-render.mjs'), composition, wav, '1', `--samples=${samples}`, '--strict'],
      { cwd: root, encoding: 'utf8' });
    assert.equal(run.status, 0, `chunked-render failed:\n${run.stdout}\n${run.stderr}`);
    assert.match(run.stdout, /Pitch-shift: tone/, 'the tone was not pitch-shifted');

    const { left, sampleRate } = readLeftChannel(wav);
    const peak = (from, to) => {
      let p = 0;
      for (let i = Math.round(from * sampleRate); i < Math.round(to * sampleRate); i++) {
        p = Math.max(p, Math.abs(left[i]));
      }
      return p;
    };
    const body = peak(0.1, 0.9);
    // 2 ms windows, each holding at least one period, from the end of superdough's 1 ms attack.
    // The first grain plays the sample at its own level; where grains of a pure tone add in
    // phase, the body comes out up to 2.5 dB louder. Before #81's fix: 40 dB down, then 26 up.
    for (let ms = 1; ms < 21; ms += 2) {
      const level = 20 * Math.log10(peak(ms / 1000, (ms + 2) / 1000) / body);
      assert.ok(Math.abs(level) <= 4,
        `${ms} to ${ms + 2} ms: ${level.toFixed(1)} dB against the note's body`);
    }
  });
}
