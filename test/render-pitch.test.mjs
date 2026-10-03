// Both renderers must play a synth note at the pitch Strudel means.
// Run with: npm run test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const renderers = ['src/runtime/offline-render-v2.mjs', 'src/runtime/chunked-render.mjs'];

// Strudel reads a number in note() as a MIDI note number: 57 is A3, 220 Hz.
// The note name is the control case; both must sound the same.
const cases = [
  ['MIDI note number note("57")', 'note("57")'],
  ['note name note("a3")', 'note("a3")'],
];

// Left channel of the 16-bit PCM WAV the renderers write, as floats.
function readLeftChannel(file) {
  const buf = readFileSync(file);
  assert.equal(buf.toString('ascii', 0, 4), 'RIFF', 'not a WAV file');
  let channels = 0, sampleRate = 0, bits = 0;
  let offset = 12;
  while (offset + 8 <= buf.length) {
    const id = buf.toString('ascii', offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    if (id === 'fmt ') {
      channels = buf.readUInt16LE(offset + 10);
      sampleRate = buf.readUInt32LE(offset + 12);
      bits = buf.readUInt16LE(offset + 22);
    } else if (id === 'data') {
      assert.equal(bits, 16, 'expected 16-bit PCM');
      const frames = Math.floor(size / (channels * 2));
      const left = new Float32Array(frames);
      for (let i = 0; i < frames; i++) {
        left[i] = buf.readInt16LE(offset + 8 + i * channels * 2) / 32768;
      }
      return { left, sampleRate };
    }
    offset += 8 + size + (size % 2);
  }
  throw new Error(`no data chunk in ${file}`);
}

// Frequency from rising zero crossings between two times, in seconds.
function measureHz(samples, sampleRate, from, to) {
  const start = Math.floor(from * sampleRate);
  const end = Math.floor(to * sampleRate);
  let crossings = 0;
  for (let i = start + 1; i < end; i++) {
    if (samples[i - 1] < 0 && samples[i] >= 0) crossings++;
  }
  return crossings / (to - from);
}

for (const renderer of renderers) {
  for (const [label, expr] of cases) {
    test(`${path.basename(renderer)} plays ${label} at 220 Hz`, () => {
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
        assert.ok(Math.abs(hz - 220) <= 4, `expected about 220 Hz, measured ${hz.toFixed(1)} Hz`);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  }
}
