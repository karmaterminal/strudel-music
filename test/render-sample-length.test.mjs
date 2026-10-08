// Both renderers must play a sample as Strudel 1.1.0 does (#75): once, to its end, at its
// playback rate; for the event's length times `clip`, or until `release`, when one of those or
// `loop` is set; looped only with `loop`; under superdough's ADSR; and once per event, wherever
// a query or a chunk edge splits it. Sample banks come from a temporary --samples folder.
// Run with: npm run test:unit
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { availableParallelism, tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { encodeWav, measureHz, measureRms, readLeftChannel } from './wav-helpers.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const renderers = ['src/runtime/offline-render-v2.mjs', 'src/runtime/chunked-render.mjs'];
const rate = 44100;

// Test samples at half full scale: `amp` shapes the level, `hz` the pitch, over time.
const wave = (seconds, hz, amp = () => 0.5) => {
  const out = new Float32Array(Math.round(seconds * rate));
  let phase = 0;
  for (let i = 0; i < out.length; i++) {
    phase += hz(i / rate) / rate;
    out[i] = amp(i / rate) * Math.sin(2 * Math.PI * phase);
  }
  return out;
};
const banks = {
  tick: wave(0.25, () => 1000),                              // a short one-shot
  pip: wave(0.25, () => 1600),                               // a short one-shot, for loopAt
  long: wave(3, () => 1000),                                 // longer than its events
  fading: wave(3, () => 1000, (t) => 0.5 * Math.exp(-t / 2)), // so a restart shows as a jump
  steps: wave(3, (t) => 400 * (1 + Math.floor(t))),           // 400, 800 and 1200 Hz, a second each
};

const dir = mkdtempSync(path.join(tmpdir(), 'strudel-sample-length-'));
// After every render has finished, including any a --test-name-pattern run never waits for.
after(async () => {
  await Promise.all(renders.values());
  rmSync(dir, { recursive: true, force: true });
});
const samples = path.join(dir, 'samples');
for (const [name, data] of Object.entries(banks)) {
  mkdirSync(path.join(samples, name), { recursive: true });
  writeFileSync(path.join(samples, name, '0.wav'), encodeWav([data], rate));
}

// Renders run a few at a time, all started when the file loads, so the tests below only wait.
const slots = Math.max(2, availableParallelism() - 1);
let running = 0;
const waiting = [];
const renders = new Map();
let count = 0;

// Start rendering `code` for `cycles` cycles (chunked-render in its default chunks of 8), once.
// Resolves with the exit status, the output and the audio; never rejects.
function start(renderer, code, cycles) {
  const key = `${renderer}\n${cycles}\n${code}`;
  if (!renders.has(key)) {
    renders.set(key, new Promise((resolve) => {
      const go = () => {
        running++;
        const job = path.join(dir, String(count++));
        mkdirSync(job);
        writeFileSync(path.join(job, 'piece.js'), code);
        const wav = path.join(job, 'piece.wav');
        const child = spawn(process.execPath,
          [path.join(root, renderer), path.join(job, 'piece.js'), wav, String(cycles), `--samples=${samples}`, '--strict'],
          { cwd: root });
        let output = '';
        child.stdout.on('data', (d) => { output += d; });
        child.stderr.on('data', (d) => { output += d; });
        const timer = setTimeout(() => child.kill(), 120_000);
        child.on('close', (status) => {
          clearTimeout(timer);
          running--;
          waiting.shift()?.();
          resolve({ status, output, audio: status === 0 ? readLeftChannel(wav) : null });
        });
      };
      if (running < slots) go();
      else waiting.push(go);
    }));
  }
  return renders.get(key);
}

// The left channel of that render, or a failed assertion with the renderer's output.
function render(renderer, code, cycles) {
  return start(renderer, code, cycles).then(({ status, output, audio }) => {
    assert.equal(status, 0, `${renderer} failed:\n${output}`);
    return audio.left;
  });
}

const rms = (left, from, to) => measureRms(left, rate, from, to);
const hz = (left, from, to) => measureHz(left, rate, from, to);
// Sound, or near silence: 40 dB under the reference window `ref`.
function sounds(left, from, to, ref, what) {
  const level = rms(left, from, to), reference = rms(left, ...ref);
  assert.ok(level > reference / 100, `${what}: expected sound from ${from} s to ${to} s, RMS ${level.toFixed(4)} against ${reference.toFixed(4)}`);
}
function silent(left, from, to, ref, what) {
  const level = rms(left, from, to), reference = rms(left, ...ref);
  assert.ok(level < reference / 100, `${what}: expected silence from ${from} s to ${to} s, RMS ${level.toFixed(4)} against ${reference.toFixed(4)}`);
}
// Largest jump between neighbouring samples: a sine's is small, a restart's or a phase jump's large.
function maxStep(left, from, to) {
  let max = 0;
  for (let i = Math.floor(from * rate) + 1; i < Math.floor(to * rate); i++) max = Math.max(max, Math.abs(left[i] - left[i - 1]));
  return max;
}
// No frame near `at` leaves the line between its neighbours by more than a quarter of their
// level. In a steady tone only a lost frame does: a NaN, written to the WAV as 0.
function noLostFrame(left, at, what) {
  const centre = Math.round(at * rate);
  let worst = centre, off = 0;
  for (let i = centre - 3; i <= centre + 3; i++) {
    const level = Math.max(Math.abs(left[i - 1]), Math.abs(left[i + 1]));
    const d = Math.abs(left[i] - (left[i - 1] + left[i + 1]) / 2) / level;
    if (d > off) [worst, off] = [i, d];
  }
  assert.ok(off <= 0.25,
    `${what}: frame ${worst} is ${left[worst].toFixed(4)}, between ${left[worst - 1].toFixed(4)} and ${left[worst + 1].toFixed(4)}`);
}
// A steady tone for noLostFrame to hear, near its trough where the onsets below start.
const bed = 'freq(333).s("sine").attack(0.001).decay(0.01).sustain(1).gain(0.5)';

// Each case: a composition, how many cycles to render (v2 fades the last 2 s out, so every window
// ends before that) and what to check. setcpm(60) is a cycle a second; setcpm(15), four seconds.
const cases = [
  ['a sample shorter than its event plays once, not looped to fill it', 'setcpm(15)\ns("<tick ~>")', 3, (left) => {
    sounds(left, 0.05, 0.2, [0.05, 0.2], 'the tick');
    silent(left, 0.35, 3.9, [0.05, 0.2], 'after the tick');
    silent(left, 4.1, 7.9, [0.05, 0.2], 'the empty cycle');
  }],
  ['a sample longer than its event rings to its end', 'setcpm(60)\ns("<long ~ ~ ~ ~ ~>")', 6, (left) => {
    sounds(left, 1.1, 2.9, [0.1, 0.9], 'past the event');
    silent(left, 3.1, 3.9, [0.1, 0.9], 'after the sample');
  }],
  ['clip(0.5) holds it for half the event', 'setcpm(60)\ns("<long ~ ~ ~ ~ ~>").clip(0.5)', 6, (left) => {
    sounds(left, 0.05, 0.45, [0.05, 0.45], 'the first half');
    silent(left, 0.55, 3.9, [0.05, 0.45], 'after half the event');
  }],
  ['clip(2) holds it for twice the event, not to its end', 'setcpm(60)\ns("<long ~ ~ ~ ~ ~>").clip(2)', 6, (left) => {
    sounds(left, 1.1, 1.9, [0.1, 0.9], 'the second second');
    silent(left, 2.1, 3.9, [0.1, 0.9], 'after twice the event');
  }],
  ['speed(0.5).clip(8) lets the slowed sample ring its 6 s', 'setcpm(60)\ns("<long ~ ~ ~ ~ ~ ~ ~ ~ ~>").speed(0.5).clip(8)', 10, (left) => {
    sounds(left, 3.1, 5.9, [0.1, 0.9], 'the second half of the slowed sample');
    silent(left, 6.1, 7.9, [0.1, 0.9], 'after the slowed sample');
  }],
  ['loop(1) fills its event, and stops at its end', 'setcpm(15)\ns("<tick ~>").loop(1)', 3, (left) => {
    for (const from of [0.5, 1.5, 2.5, 3.5]) sounds(left, from, from + 0.4, [0.05, 0.2], 'the looped tick');
    silent(left, 4.1, 7.9, [0.05, 0.2], 'after the event');
  }],
  ["loopAt(2) stretches the sample over its two cycles at the piece's tempo", 'setcpm(15)\ns("<pip ~ ~>").loopAt(2)', 4, (left) => {
    // 0.25 cycles a second: speed 0.125 of a 0.25 s sample a second, so 1600 Hz plays at 50 Hz.
    for (const from of [0.5, 2.5, 4.5, 6.5]) sounds(left, from, from + 1, [2, 6], 'the stretched sample');
    const pitch = hz(left, 2, 6);
    assert.ok(Math.abs(pitch - 50) <= 2, `expected the sample at 50 Hz, measured ${pitch.toFixed(1)} Hz`);
    silent(left, 8.1, 13.9, [2, 6], 'after its two cycles');
  }],
  ['release holds it for the event, then fades it out', 'setcpm(60)\ns("<long ~ ~ ~ ~ ~>").release(0.5)', 6, (left) => {
    const held = rms(left, 0.5, 0.9), fading = rms(left, 1.1, 1.2);
    assert.ok(fading < held * 0.9 && fading > held * 0.5,
      `expected the release at 60–80% of the held level, measured ${(fading / held * 100).toFixed(0)}%`);
    silent(left, 1.6, 3.9, [0.5, 0.9], 'after the release');
  }],
  ['attack fades a sample in', 'setcpm(60)\ns("<long ~ ~ ~ ~ ~>").attack(0.5)', 6, (left) => {
    const start = rms(left, 0, 0.1), full = rms(left, 0.6, 0.9);
    assert.ok(start < full * 0.15, `expected the first 0.1 s under 15% of full level, measured ${(start / full * 100).toFixed(0)}%`);
    sounds(left, 2.5, 2.9, [0.6, 0.9], 'after the attack, to the end of the sample');
  }],
  ['decay alone fades a sample to nothing, as superdough fills in sustain', 'setcpm(60)\ns("<long ~ ~ ~ ~ ~>").decay(0.5)', 6, (left) => {
    silent(left, 0.6, 2.9, [0, 0.1], 'after the decay');
  }],
  ['begin and end play part of the sample', 'setcpm(60)\ns("<steps ~ ~ ~ ~ ~>").begin(0.5).end(0.75)', 6, (left) => {
    // From 1.5 s into the sample (800 Hz) to 2.25 s (1200 Hz).
    const first = hz(left, 0.1, 0.4), then = hz(left, 0.55, 0.7);
    assert.ok(Math.abs(first - 800) <= 15, `expected 800 Hz first, measured ${first.toFixed(0)} Hz`);
    assert.ok(Math.abs(then - 1200) <= 20, `expected 1200 Hz from 0.5 s, measured ${then.toFixed(0)} Hz`);
    silent(left, 0.8, 3.9, [0.1, 0.4], 'after the end');
  }],
  ['a negative speed plays the sample backwards', 'setcpm(60)\ns("<steps ~ ~ ~ ~ ~>").speed(-1)', 6, (left) => {
    const first = hz(left, 0.2, 0.8), last = hz(left, 2.2, 2.8);
    assert.ok(Math.abs(first - 1200) <= 20, `expected 1200 Hz first, measured ${first.toFixed(0)} Hz`);
    assert.ok(Math.abs(last - 400) <= 10, `expected 400 Hz last, measured ${last.toFixed(0)} Hz`);
  }],
  // A chunk edge falls at 8 s in chunked-render. The event starts at 7 s and lasts 2 s.
  ['a sample keeps playing across a chunk edge, once, and rings past its event', 'setcpm(60)\ns("~@7 fading@2 ~@5").slow(14)', 14, (left) => {
    const before = rms(left, 7.88, 7.98), after = rms(left, 8.02, 8.12);
    assert.ok(after < before, `expected the sample still fading at 8 s, RMS ${before.toFixed(4)} then ${after.toFixed(4)}`);
    sounds(left, 9.1, 9.9, [7.1, 7.3], 'past the event');
    silent(left, 10.1, 11.9, [7.1, 7.3], 'after the sample');
  }],
  ['a tail that starts before a chunk edge carries into the next chunk', 'setcpm(60)\ns("~@7 long ~@6").slow(14)', 14, (left) => {
    sounds(left, 8.1, 9.9, [7.1, 7.9], 'the tail');
    silent(left, 10.1, 11.9, [7.1, 7.9], 'after the sample');
  }],
  ["a synth's envelope and phase run on across a chunk edge", 'setcpm(60)\nnote("~@7 a3@2 ~@5").s("sine").decay(3).sustain(0).slow(14)', 14, (left) => {
    const before = rms(left, 7.9, 8), after = rms(left, 8, 8.1);
    assert.ok(after <= before * 1.01, `expected the decay to continue at 8 s, RMS ${before.toFixed(4)} then ${after.toFixed(4)}`);
    const edge = maxStep(left, 7.995, 8.005), steady = maxStep(left, 7.9, 7.99);
    assert.ok(edge <= steady * 1.2, `expected no jump at 8 s: largest step ${edge.toFixed(4)} against ${steady.toFixed(4)}`);
  }],
  // At setcpm(20) these events start at cycle 2.2, 6.6 s, between two frames. Frame times and the
  // event's start round apart there, so the first frame came out a hair before the event.
  ['a sample starting between two frames loses no frame of what else is playing', `setcpm(20)\nstack(s("~!11 tick ~!3").slow(3), ${bed})`, 3, (left) => {
    noLostFrame(left, 6.6, 'where the tick starts');
  }],
  ['noise starting between two frames loses no frame of what else is playing', `setcpm(20)\nstack(s("~!11 white ~!3").slow(3).gain(0.02), ${bed})`, 3, (left) => {
    noLostFrame(left, 6.6, 'where the noise starts');
  }],
];

for (const renderer of renderers) {
  const name = path.basename(renderer);
  for (const [label, code, cycles] of cases) start(renderer, `${code}\n`, cycles);
  // A control set after slow() splits a two-cycle event in two at the cycle boundary, both
  // halves with the same whole; Strudel plays it once. Without clip a sample rings its full
  // length whatever its event's length, so all three sound alike until 2 s.
  const one = 'setcpm(60)\ns("<fading ~ ~ ~ ~ ~>")\n';
  const split = 'setcpm(60)\ns("fading ~ ~ ~ ~ ~").slow(12).gain(0.3)\n';
  const clipped = 'setcpm(60)\ns("fading ~ ~ ~ ~ ~").slow(12).clip(1)\n';
  for (const code of [one, split, clipped]) start(renderer, code, 6);

  for (const [label, code, cycles, check] of cases) {
    test(`${name}: ${label}`, async () => check(await render(renderer, `${code}\n`, cycles)));
  }

  test(`${name}: an event split in two by a control after slow() plays once`, async () => {
    const [a, b, c] = await Promise.all([one, split, clipped].map((code) => render(renderer, code, 6)));
    const same = (x, from, to, what) => {
      const ratio = rms(x, from, to) / rms(a, from, to);
      assert.ok(Math.abs(ratio - 1) < 0.03, `${what}: from ${from} s to ${to} s at ${(ratio * 100).toFixed(0)}% of a one-cycle event`);
    };
    for (const [from, to] of [[0.1, 0.3], [0.9, 1], [1, 1.1], [1.5, 1.9]]) {
      same(b, from, to, 'the split event');
      same(c, from, to, 'the split event with clip(1)');
    }
    same(b, 2.1, 2.9, 'the split event');
    silent(c, 2.1, 3.9, [0.1, 0.3], 'after the event with clip(1)');
  });
}
