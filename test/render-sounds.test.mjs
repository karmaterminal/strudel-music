// Both renderers must play the sounds the shipped compositions name, and --strict must fail a
// render that can't. Sample banks come from a temporary --samples folder, so the results don't
// depend on what setup downloaded.
// Run with: npm run test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { autocorrelation, encodeWav, measureHz, measureRms, readLeftChannel, tone, writeToneWav } from './wav-helpers.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const renderers = ['src/runtime/offline-render-v2.mjs', 'src/runtime/chunked-render.mjs'];

// Renders `code` for `cycles` cycles with sample banks made from `banks` ({ name: [Hz, ...] }),
// `files` ({ 'bank/file.wav': bytes }) and `links` ({ name: target }). `extra` are positional
// arguments after the cycle count; `samples` replaces the --samples folder.
function render(renderer, code, { cycles = 1, extra = [], banks = {}, files = {}, links = {}, samples, flags = [] } = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), 'strudel-sounds-'));
  try {
    const folder = path.join(dir, 'samples');
    mkdirSync(folder);
    for (const [name, tones] of Object.entries(banks)) {
      mkdirSync(path.join(folder, name));
      tones.forEach((hz, i) => writeToneWav(path.join(folder, name, `${i}.wav`), hz));
    }
    for (const [file, bytes] of Object.entries(files)) {
      mkdirSync(path.join(folder, path.dirname(file)), { recursive: true });
      writeFileSync(path.join(folder, file), bytes);
    }
    for (const [name, target] of Object.entries(links)) symlinkSync(target, path.join(folder, name));
    const composition = path.join(dir, 'piece.js');
    const wav = path.join(dir, 'piece.wav');
    writeFileSync(composition, code);
    // The timeout turns a render that never ends, such as one in chunks of 0 cycles, into a failure.
    const run = spawnSync(process.execPath,
      [path.join(root, renderer), composition, wav, String(cycles), ...extra, `--samples=${samples ?? folder}`, ...flags],
      { cwd: root, encoding: 'utf8', timeout: 120_000 });
    const output = `${run.stdout}\n${run.stderr}`;
    const audio = run.status === 0 || run.status === 2 ? readLeftChannel(wav) : null;
    return { status: run.status, output, audio };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

for (const renderer of renderers) {
  const name = path.basename(renderer);

  // 15 cycles per minute: four seconds a cycle, one noise per cycle.
  test(`${name} plays white, pink and brown noise`, () => {
    const { status, output, audio } = render(renderer, 'setcpm(15)\ns("<white pink brown>")\n',
      { cycles: 3, flags: ['--strict'] });
    assert.equal(status, 0, output);
    const { left, sampleRate } = audio;
    for (const [type, from] of [['white', 0.5], ['pink', 4.5], ['brown', 8.5]]) {
      const to = from + 1;
      assert.ok(measureRms(left, sampleRate, from, to) > 0.005, `${type} is silent`);
      // Not the 440 Hz triangle an unknown sound used to get: that crosses zero 440 times a
      // second and repeats every 100 samples.
      const hz = measureHz(left, sampleRate, from, to);
      assert.ok(hz > 800, `${type}: ${hz.toFixed(0)} rising zero crossings a second`);
      const ac = autocorrelation(left, sampleRate, from, to, 100);
      assert.ok(ac < 0.6, `${type}: autocorrelation at 440 Hz is ${ac.toFixed(2)}`);
    }
  });

  test(`${name} plays Strudel's oh from Dirt-Samples' ho bank`, () => {
    const { status, output, audio } = render(renderer, 'setcpm(15)\ns("oh")\n',
      { banks: { ho: [700] }, flags: ['--strict'] });
    assert.equal(status, 0, output);
    const hz = measureHz(audio.left, audio.sampleRate, 0.5, 1.5);
    assert.ok(Math.abs(hz - 700) <= 4, `expected about 700 Hz, measured ${hz.toFixed(1)} Hz`);
  });

  test(`${name} wraps n past the end of a bank, as Strudel does`, () => {
    // Three samples, so n=4 plays the second one.
    const { status, output, audio } = render(renderer, 'setcpm(15)\ns("tone:4")\n',
      { banks: { tone: [300, 500, 700] }, flags: ['--strict'] });
    assert.equal(status, 0, output);
    const hz = measureHz(audio.left, audio.sampleRate, 0.5, 1.5);
    assert.ok(Math.abs(hz - 500) <= 4, `expected about 500 Hz, measured ${hz.toFixed(1)} Hz`);
  });

  test(`${name} plays a note with no sound as a triangle, Strudel's default`, () => {
    const { status, output, audio } = render(renderer, 'setcpm(15)\nnote("a3")\n', { flags: ['--strict'] });
    assert.equal(status, 0, output);
    const hz = measureHz(audio.left, audio.sampleRate, 0.5, 1.5);
    assert.ok(Math.abs(hz - 220) <= 4, `expected about 220 Hz, measured ${hz.toFixed(1)} Hz`);
  });

  // An unknown sound, and arithmetic Strudel refuses (it needs note(12), not 12).
  const flawed = 'setcpm(15)\nstack(s("nosuchsound"), note("c3").s("sine").add(12))\n';

  test(`${name} --strict fails on an unknown sound and on Strudel's warnings`, () => {
    const { status, output } = render(renderer, flawed, { flags: ['--strict'] });
    assert.equal(status, 2, output);
    assert.match(output, /No sample or synth named "nosuchsound": 1 event/);
    assert.match(output, /Strudel: \[warn\]: Can't do arithmetic on control pattern\./);
  });

  test(`${name} without --strict reports the same problems and still renders`, () => {
    const { status, output } = render(renderer, flawed);
    assert.equal(status, 0, output);
    assert.match(output, /No sample or synth named "nosuchsound"/);
  });

  // Dirt-Samples' sd and cb banks are stereo 32-bit float WAVs, which used to load as silence.
  test(`${name} plays a 32-bit float WAV`, () => {
    const float = encodeWav([tone(600), tone(600)], 44100, { bits: 32, float: true });
    const { status, output, audio } = render(renderer, 'setcpm(15)\ns("snare")\n',
      { files: { 'snare/0.wav': float }, flags: ['--strict'] });
    assert.equal(status, 0, output);
    const hz = measureHz(audio.left, audio.sampleRate, 0.5, 1.5);
    assert.ok(Math.abs(hz - 600) <= 4, `expected about 600 Hz, measured ${hz.toFixed(1)} Hz`);
  });

  // A file it can't read keeps its place, so tone:2 is still the third file.
  const unreadable = Buffer.from(encodeWav([tone(500)], 44100));
  unreadable.writeUInt16LE(2, 20); // ADPCM, which neither renderer decodes
  const mixedBank = {
    'tone/0.wav': encodeWav([tone(300)], 44100),
    'tone/1.wav': unreadable,
    'tone/2.wav': encodeWav([tone(700)], 44100),
  };

  test(`${name} keeps a bank with a file it can't read`, () => {
    const { status, output, audio } = render(renderer, 'setcpm(15)\ns("tone:2")\n',
      { files: mixedBank, flags: ['--strict'] });
    assert.equal(status, 0, output);
    assert.match(output, /Can't read tone\/1\.wav/);
    const hz = measureHz(audio.left, audio.sampleRate, 0.5, 1.5);
    assert.ok(Math.abs(hz - 700) <= 4, `expected about 700 Hz, measured ${hz.toFixed(1)} Hz`);
  });

  test(`${name} --strict fails on an event that picks a file it can't read`, () => {
    const { status, output } = render(renderer, 'setcpm(15)\ns("tone:1 tone:0")\n',
      { files: mixedBank, flags: ['--strict'] });
    assert.equal(status, 2, output);
    assert.match(output, /Dropped 1 event: couldn't read tone\/1\.wav \(unsupported format 2, 16-bit\)/);
  });

  test(`${name} --strict fails on an n that is not a number, as Strudel warns`, () => {
    const { status, output, audio } = render(renderer, 'setcpm(15)\ns("tone:x")\n',
      { banks: { tone: [300, 500] }, flags: ['--strict'] });
    assert.equal(status, 2, output);
    assert.match(output, /Strudel: "x" is not a number, falling back to 0/);
    const hz = measureHz(audio.left, audio.sampleRate, 0.5, 1.5);
    assert.ok(Math.abs(hz - 300) <= 4, `expected sample 0 at about 300 Hz, measured ${hz.toFixed(1)} Hz`);
  });

  test(`${name} refuses an unknown option, a bad number or a missing path instead of rendering`, () => {
    // The fourth argument is v2's BPM and chunked-render's chunk size, a whole number of cycles.
    const chunked = name.startsWith('chunked');
    const fourth = chunked ? 'chunkSize must be a whole number of cycles' : 'bpm must be a positive number';
    const missing = path.join(tmpdir(), `strudel-no-such-path-${process.pid}`);
    for (const [options, message] of [
      [{ flags: ['--strcit'] }, /unknown option --strcit/],
      [{ flags: ['--samples'] }, /unknown option --samples/],
      [{ cycles: 'abc' }, /must be a positive number, not abc/],
      [{ cycles: 0 }, /must be a positive number, not 0/],
      [{ extra: ['8', 'more'] }, /too many arguments: more/],
      ...['0', '-1', 'abc', ...(chunked ? ['2.5'] : [])].map((n) => [{ extra: [n] }, new RegExp(`${fourth}, not ${n}`)]),
      [{ samples: missing }, /no samples folder at .*strudel-no-such-path/],
      [{ flags: [`--prebake=${missing}`] }, chunked ? /unknown option --prebake=/ : /no prebake file at .*strudel-no-such-path/],
    ]) {
      const { status, output } = render(renderer, 'setcpm(15)\nnote("a3")\n', options);
      assert.equal(status, 1, `${JSON.stringify(options)}\n${output}`);
      assert.match(output, message);
    }
  });

  // macOS leaves ._name.wav beside the files it copies, and an interrupted setup leaves
  // .<bank>.partial; neither may take a place in a bank or become one.
  test(`${name} skips dot-files and hidden folders in samples/`, () => {
    const { status, output, audio } = render(renderer, 'setcpm(15)\ns("tone:1")\n', {
      banks: { tone: [300, 700] },
      files: {
        'tone/._0.wav': Buffer.from('00051607000200004d6163204f532058', 'hex'),
        '.tone.partial/0.wav': encodeWav([tone(500)], 44100),
      },
      flags: ['--strict'],
    });
    assert.equal(status, 0, output);
    assert.doesNotMatch(output, /Can't read/);
    assert.match(output, /2 samples loaded from 1 banks/);
    const hz = measureHz(audio.left, audio.sampleRate, 0.5, 1.5);
    assert.ok(Math.abs(hz - 700) <= 4, `expected tone:1 at about 700 Hz, measured ${hz.toFixed(1)} Hz`);
  });

  test(`${name} names a bank folder it can't open instead of calling the sound unknown`, () => {
    // A dangling symlink, as a bank moved away leaves behind.
    const { status, output } = render(renderer, 'setcpm(15)\ns("bd tone")\n',
      { banks: { tone: [300] }, links: { bd: 'nowhere' }, flags: ['--strict'] });
    assert.equal(status, 2, output);
    assert.match(output, /Can't read bd\//);
    assert.match(output, /Dropped 1 event: couldn't read bd\/ \(ENOENT\)/);
    assert.doesNotMatch(output, /No sample or synth named "bd"/);
  });

  test(`${name} fails when nothing plays`, () => {
    const { status, output } = render(renderer, 'setcpm(15)\ns("~ ~")\n', { flags: ['--strict'] });
    assert.equal(status, 1, output);
    assert.match(output, /Nothing to render/);
  });
}
