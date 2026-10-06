// The sound handling both renderers share (src/runtime/sounds.mjs).
// Run with: npm run test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findBank, pickSample, decodeWav, makeNoise, isStrudelProblem, trackProblems } from '../src/runtime/sounds.mjs';
import { encodeWav, tone } from './wav-helpers.mjs';

test('Strudel drum names find the Dirt-Samples bank, and a bank of their own wins', () => {
  const banks = new Map([['ho', ['open hat']], ['rm', ['rimshot']]]);
  assert.deepEqual(findBank(banks, 'oh'), ['open hat']);
  assert.deepEqual(findBank(banks, 'rim'), ['rimshot']);
  assert.equal(findBank(banks, 'ride'), undefined);
  banks.set('oh', ['my own open hat']);
  assert.deepEqual(findBank(banks, 'oh'), ['my own open hat']);
});

test('n wraps around the bank as in Strudel', () => {
  const bank = ['a', 'b', 'c'];
  assert.equal(pickSample(bank, undefined), 'a');
  assert.equal(pickSample(bank, 2), 'c');
  assert.equal(pickSample(bank, 4), 'b');
  assert.equal(pickSample(bank, -1), 'c');
  assert.equal(pickSample(bank, 1.6), 'c');
});

test('an n that is not a number plays sample 0, with the warning superdough logs', () => {
  const bank = ['a', 'b', 'c'];
  const warnings = [];
  assert.equal(pickSample(bank, 'x', (w) => warnings.push(w)), 'a');
  assert.equal(pickSample(bank, Infinity, (w) => warnings.push(w)), 'a');
  assert.equal(pickSample(bank, 2, (w) => warnings.push(w)), 'c');
  assert.deepEqual(warnings, ['"x" is not a number, falling back to 0', '"Infinity" is not a number, falling back to 0']);
});

test('WAV files decode as PCM at 8 to 32 bits and as 32- or 64-bit float', () => {
  // Dirt-Samples' sd and cb banks are 32-bit float; the old readers filled them with zeros.
  const left = tone(500, 0.01), right = left.map((x) => -x);
  for (const [encoding, tolerance] of [
    [{ bits: 8 }, 0.01], [{ bits: 16 }, 1e-4], [{ bits: 24 }, 1e-6], [{ bits: 32 }, 1e-6],
    [{ bits: 32, float: true }, 0], [{ bits: 64, float: true }, 0],
    [{ bits: 32, float: true, extensible: true }, 0], [{ bits: 24, extensible: true }, 1e-6],
  ]) {
    const wav = decodeWav(encodeWav([left, right], 22050, encoding));
    const label = JSON.stringify(encoding);
    assert.equal(wav.channels, 2, label);
    assert.equal(wav.sampleRate, 22050, label);
    assert.equal(wav.length, left.length, label);
    for (let i = 0; i < left.length; i++) {
      assert.ok(Math.abs(wav.data[0][i] - left[i]) <= tolerance, `${label}: left[${i}]`);
      assert.ok(Math.abs(wav.data[1][i] - right[i]) <= tolerance, `${label}: right[${i}]`);
    }
  }
});

test('a cut-short WAV gives the frames it holds; anything unreadable throws, saying why', () => {
  const bytes = encodeWav([tone(500, 0.01)], 44100);
  assert.equal(decodeWav(bytes.subarray(0, 44 + 100)).length, 50);
  assert.throws(() => decodeWav(Buffer.from('not a wav file at all')), /not a WAV file/);
  const adpcm = Buffer.from(bytes);
  adpcm.writeUInt16LE(2, 20);
  assert.throws(() => decodeWav(adpcm), /unsupported format 2, 16-bit/);
  assert.throws(() => decodeWav(bytes.subarray(0, 44)), /no audio data/);
});

test('a WAV whose header or samples would play wrong throws instead', () => {
  // A NaN or infinite sample silenced everything mixed with it, so it makes the file unreadable.
  for (const [bad, bits] of [[NaN, 32], [Infinity, 32], [-Infinity, 64]]) {
    const wav = encodeWav([Float32Array.of(0.5, bad, -0.5)], 44100, { bits, float: true });
    assert.throws(() => decodeWav(wav), /sample 1 is not a finite number/, `${bad}, ${bits}-bit`);
  }
  // A 64-bit float too big for 32 bits would turn into Infinity.
  const huge = encodeWav([Float32Array.of(0.5)], 44100, { bits: 64, float: true });
  huge.writeDoubleLE(1e300, 44);
  assert.throws(() => decodeWav(huge), /sample 0 is not a finite number/);
  // 24-bit samples in 4-byte frames: out of spec, and ambiguous about where the 3 bytes sit.
  const padded = encodeWav([tone(500, 0.01)], 44100, { bits: 24 });
  padded.writeUInt16LE(4, 32);
  assert.throws(() => decodeWav(padded), /frames of 4 bytes don't fit 1 × 24-bit samples/);
  const short = Buffer.concat([Buffer.from('RIFF\x1a\0\0\0WAVEfmt \x0e\0\0\0', 'latin1'), Buffer.alloc(14)]);
  assert.throws(() => decodeWav(short), /fmt chunk too short/);
  assert.throws(() => decodeWav(encodeWav([tone(500, 0.01)], 44100).subarray(0, 36)), /no data chunk/);
});

// Lag-1 autocorrelation: about 0 for white noise, rising as the spectrum tilts to the bass.
function lag1(x) {
  let num = 0, den = 0;
  for (let i = 0; i < x.length; i++) {
    den += x[i] * x[i];
    if (i > 0) num += x[i] * x[i - 1];
  }
  return num / den;
}

const rms = (x) => Math.sqrt(x.reduce((sum, s) => sum + s * s, 0) / x.length);

test('noise is white, pink or brown, and the same on every render', () => {
  const length = 2 * 44100;
  const white = makeNoise('white', length), pink = makeNoise('pink', length), brown = makeNoise('brown', length);
  assert.deepEqual(makeNoise('pink', length), pink);
  assert.ok(white.every((s) => s >= -1 && s <= 1));
  assert.ok(Math.abs(lag1(white)) < 0.05, `white lag-1 ${lag1(white)}`);
  assert.ok(lag1(pink) > 0.6 && lag1(pink) < 0.95, `pink lag-1 ${lag1(pink)}`);
  assert.ok(lag1(brown) > 0.95, `brown lag-1 ${lag1(brown)}`);
  // superdough's levels: brown is far quieter than white.
  assert.ok(rms(white) > 0.5 && rms(pink) > 0.1 && rms(brown) > 0.03 && rms(brown) < 0.1);
});

test('Strudel warnings and errors count as problems; its other messages do not', () => {
  assert.ok(isStrudelProblem({ message: "[warn]: Can't do arithmetic on control pattern." }));
  assert.ok(isStrudelProblem({ message: '[tonal] incomplete scale.', type: 'error' }));
  assert.ok(isStrudelProblem({ message: '"x" is not a number, falling back to 0', type: 'warning' }));
  assert.ok(isStrudelProblem({ message: '[voicing]: unknown chord "H7"' }));
  assert.ok(!isStrudelProblem({ message: '🌀 @strudel/core loaded 🌀' }));
  assert.ok(!isStrudelProblem(undefined));
});

test('the problem report counts each kind once', () => {
  const problems = trackProblems({ unplayable: 'dropped' });
  problems.unknownSound('bell');
  problems.unknownSound('bell');
  problems.dropped('no controls');
  problems.strudelEvent({ type: 'strudel.log', detail: { message: '[warn]: x' } });
  problems.strudelEvent({ type: 'strudel.log', detail: { message: '[warn]: x' } });
  problems.strudelEvent({ type: 'strudel.log', detail: { message: '🌀 loaded' } });
  problems.strudelEvent({ type: 'something.else', detail: { message: '[warn]: y' } });
  const lines = [];
  const warn = console.warn;
  console.warn = (line) => lines.push(line);
  try {
    assert.equal(problems.report(), 3);
  } finally {
    console.warn = warn;
  }
  assert.deepEqual(lines, [
    '  ⚠️ No sample or synth named "bell": 2 events dropped',
    '  ⚠️ Dropped 1 event: no controls',
    '  ⚠️ Strudel: [warn]: x',
  ]);
});
