#!/usr/bin/env node
/**
 * Offline render v2: Strudel's real audio engine + node-web-audio-api
 * 
 * Evaluates pattern → queries haps → schedules via OfflineAudioContext
 * with proper oscillators, ADSR, filters, panning.
 *
 * Usage: node src/runtime/offline-render-v2.mjs <input.js> [output.wav] [cycles] [bpm]
 *          [--strict] [--samples=<dir>] [--prebake=<file>]
 *
 * --strict exits with status 2, after writing the file, if any event names a sound with no
 * sample or synth, any event is dropped, or Strudel logs a warning or error for the pattern.
 * --samples reads sample banks from <dir> instead of the repo's samples/.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { findBank, pickSample, decodeWav, NOISES, makeNoise, trackProblems, samplePlayback } from './sounds.mjs';

const require = createRequire(import.meta.url);
const problems = trackProblems({ unplayable: 'played as a triangle tone' });

// ── Polyfill Web Audio for Node.js ──
const nwa = require('node-web-audio-api');
let _sharedCtx = null;
globalThis.AudioContext = class {
  constructor() {
    if (!_sharedCtx) {
      _sharedCtx = new nwa.OfflineAudioContext(2, 44100 * 600, 44100);
      _sharedCtx.resume = async () => {};
      _sharedCtx.close = async () => {};
    }
    return _sharedCtx;
  }
};
globalThis.OfflineAudioContext = nwa.OfflineAudioContext;
globalThis.AudioBuffer = nwa.AudioBuffer;
globalThis.AudioBufferSourceNode = nwa.AudioBufferSourceNode;
globalThis.GainNode = nwa.GainNode;
globalThis.OscillatorNode = nwa.OscillatorNode;
globalThis.BiquadFilterNode = nwa.BiquadFilterNode;
globalThis.StereoPannerNode = nwa.StereoPannerNode;
globalThis.DynamicsCompressorNode = nwa.DynamicsCompressorNode;
globalThis.ConvolverNode = nwa.ConvolverNode;
globalThis.DelayNode = nwa.DelayNode;
globalThis.WaveShaperNode = nwa.WaveShaperNode;
globalThis.AnalyserNode = nwa.AnalyserNode;

// Browser stubs
globalThis.window = {
  ...globalThis,
  addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => true,
  location: { href: '', origin: '', protocol: 'https:' },
  navigator: { userAgent: 'node' },
  requestAnimationFrame: cb => setTimeout(cb, 16), cancelAnimationFrame: clearTimeout,
  innerWidth: 800, innerHeight: 600, getComputedStyle: () => ({}),
};
globalThis.document = {
  createElement: () => ({ getContext: () => null, style: {}, setAttribute: () => {}, appendChild: () => {} }),
  body: { appendChild: () => {}, removeChild: () => {} },
  addEventListener: () => {}, removeEventListener: () => {},
  // Strudel's logger reports warnings as events on document; collect them for the report.
  dispatchEvent: (event) => { problems.strudelEvent(event); return true; },
  createEvent: () => ({ initEvent: () => {} }),
  head: { appendChild: () => {} }, querySelectorAll: () => [], querySelector: () => null,
};
globalThis.addEventListener = () => {};
globalThis.removeEventListener = () => {};

// ── Parse args ──
const argv = process.argv.slice(2);
const args = argv.filter(a => !a.startsWith('--'));
const input = args[0];
const output = args[1] || 'output.wav';
const cycles = Number(args[2] || '8');
const bpm = Number(args[3] || '120');
const strict = argv.includes('--strict');
const option = (name) => argv.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const samplesOption = option('samples');
const prebakeOption = option('prebake');
const isFolder = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };

// A mistyped flag, number or path must not pass for a clean render.
const argErrors = [
  ...argv.filter(a => a.startsWith('--') && a !== '--strict' && !/^--(samples|prebake)=./.test(a))
    .map(a => `unknown option ${a}`),
  ...(args.length > 4 ? [`too many arguments: ${args.slice(4).join(' ')}`] : []),
  ...(cycles > 0 && Number.isFinite(cycles) ? [] : [`cycles must be a positive number, not ${args[2]}`]),
  ...(bpm > 0 && Number.isFinite(bpm) ? [] : [`bpm must be a positive number, not ${args[3]}`]),
  ...(samplesOption && !isFolder(samplesOption) ? [`no samples folder at ${samplesOption}`] : []),
  ...(prebakeOption && !existsSync(prebakeOption) ? [`no prebake file at ${prebakeOption}`] : []),
];
if (!input || argErrors.length) {
  for (const e of argErrors) console.error(`❌ ${e}`);
  console.error('Usage: node src/runtime/offline-render-v2.mjs <input.js> [output.wav] [cycles] [bpm] [--strict] [--samples=<dir>] [--prebake=<file>]');
  process.exit(1);
}

const cps = bpm / 60 / 4;
const duration = cycles / cps;
const sampleRate = 44100;
const totalSamples = Math.ceil(duration * sampleRate);

console.log(`Offline render: ${input} → ${output}`);
console.log(`  Cycles: ${cycles}, BPM: ${bpm}, CPS: ${cps.toFixed(3)}, Duration: ${duration.toFixed(1)}s`);

// ── Load Strudel ──
console.log('Loading Strudel...');
const core = await import('@strudel/core');
const mini = await import('@strudel/mini');
try { await import('@strudel/tonal'); } catch (e) { /* optional */ }

// CRITICAL: Manually register mini notation parser on the Pattern class.
// The dist bundles can have separate module instances, so mini's auto-registration
// may target a different Pattern. Same class of bug as openclaw/openclaw#22790.
if (core.setStringParser && mini.mini) {
  core.setStringParser(mini.mini);
}

// Register ALL Strudel exports (functions, signals, constants) on globalThis
let cpmValue = bpm / 4;
for (const [key, val] of Object.entries(core)) {
  globalThis[key] = val;
}
globalThis.setcpm = (v) => { cpmValue = v; };
globalThis.setcps = (v) => { cpmValue = v * 60; };
globalThis.samples = () => {};
globalThis.hush = () => {};

// ── Prebake support ──
// Switch Angel's prebake.strudel uses `window.*` and `strudelScope`
globalThis.window = globalThis;
globalThis.strudelScope = globalThis;
globalThis.registerFunc = (name, func) => {
  globalThis[name] = func;
};
globalThis.setGainCurve = () => {};  // WebAudio-only, no-op headless
globalThis.setDefault = () => {};    // WebAudio-only, no-op headless
globalThis.setScale = (sc) => { globalThis.SCALE = sc; };
globalThis.SCALE = 'c:minor';
globalThis.K = (fn) => fn;          // WebAudio FX placeholder
globalThis.S = (x) => x;            // Signal placeholder
globalThis.audioin = () => ({ add: () => ({ out: () => {} }), sub: () => ({ out: () => {} }) });

// Load prebake if --prebake flag or prebake.strudel exists alongside input
const prebakePath = prebakeOption
  || (() => {
    const dir = path.dirname(input);
    const candidate = path.join(dir, 'prebake.strudel');
    return existsSync(candidate) ? candidate : null;
  })();
if (prebakePath && existsSync(prebakePath)) {
  try {
    const prebakeCode = readFileSync(prebakePath, 'utf8');
    new Function(prebakeCode)();
    console.log(`  ✅ Prebake loaded: ${prebakePath}`);
  } catch (e) {
    console.warn(`  ⚠️ Prebake load failed: ${e.message}`);
  }
}

// Browser-only methods to strip from patterns before headless evaluation
const vizMethods = ['pianoroll', '_pianoroll', 'spiral', '_spiral', 'scope', '_scope', 'draw', '_draw'];

/**
 * Strip browser-only visualization methods using balanced-parenthesis scanning.
 * Handles nested parens, multi-line args, and string literals correctly.
 * e.g. `.pianoroll({ fold: 1, labels: true })` → removed
 *
 * Approach: find `.methodName(` then count balanced parens to find the close.
 * This is more reliable than regex for nested/multi-line args (fixes #4).
 */
function stripVizMethods(code) {
  for (const method of vizMethods) {
    // Match .method( or ._method( — we need to find each occurrence and remove it
    const pattern = new RegExp(`\\.(${method})\\s*\\(`, 'g');
    let match;
    while ((match = pattern.exec(code)) !== null) {
      const dotStart = match.index; // position of the '.'
      const parenStart = code.indexOf('(', dotStart + method.length + 1);
      if (parenStart === -1) continue;

      // Scan for balanced close paren, respecting strings
      let depth = 1;
      let i = parenStart + 1;
      let inStr = null; // null, "'", '"', '`'
      while (i < code.length && depth > 0) {
        const ch = code[i];
        if (inStr) {
          if (ch === '\\') { i += 2; continue; } // skip escaped chars
          if (ch === inStr) inStr = null;
        } else {
          if (ch === "'" || ch === '"' || ch === '`') inStr = ch;
          else if (ch === '(') depth++;
          else if (ch === ')') depth--;
        }
        i++;
      }
      if (depth === 0) {
        // Remove from dot to closing paren (inclusive)
        code = code.slice(0, dotStart) + code.slice(i);
        // Reset regex since string changed
        pattern.lastIndex = dotStart;
      }
    }
  }
  return code;
}

console.log('  ✅ Strudel loaded');

// ── Evaluate pattern ──
console.log('Evaluating pattern...');
let patternCode = readFileSync(input, 'utf8')
  .replace(/^\/\/ @\w+.*/gm, '')
  .trim();

// Strip visualization methods using balanced-paren scanner (fixes #4)
patternCode = stripVizMethods(patternCode);

// ── Security hardening: scrub sensitive globals before pattern eval ──
// Patterns are JS evaluated via new Function() in the current process.
// Remove access to environment variables and child_process to limit
// damage from malicious patterns. This is NOT a sandbox — patterns can
// still access fs, network, etc. For untrusted patterns, use a container.
const _savedEnv = process.env;
const _savedExec = process.execPath;
process.env = Object.freeze({ NODE_ENV: 'production' });
// Prevent require('child_process') by poisoning the module cache
const _savedCpModule = await import('module').then(m => {
  const orig = m.default._resolveFilename;
  m.default._resolveFilename = function(request, ...args) {
    if (request === 'child_process' || request === 'node:child_process') {
      throw new Error('child_process is blocked during pattern evaluation');
    }
    return orig.call(this, request, ...args);
  };
  return orig;
}).catch(() => null);

let pattern;
try {
  // Strudel patterns are typically: setcpm(...); stack(...).stuff()
  // The last expression is the pattern. We need to capture it.
  // Strategy: split into statements, wrap the last one in return.
  const lines = patternCode.split('\n');
  
  // Find the last non-empty, non-comment line that starts a pattern expression
  // Usually starts with stack(, note(, s(, n(, etc.
  let lastExprStart = -1;
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('//')) continue;
    
    // Track if this line starts a new top-level expression
    if (depth === 0 && /^(stack|note|s|n|seq|cat|sequence|arrange|slowcat|fastcat)\s*\(/.test(line)) {
      lastExprStart = i;
    }
    // Track paren depth
    for (const ch of line) {
      if (ch === '(') depth++;
      if (ch === ')') depth--;
    }
  }
  
  if (lastExprStart >= 0) {
    const setup = lines.slice(0, lastExprStart).join('\n');
    const expr = lines.slice(lastExprStart).join('\n');
    const wrapped = setup + '\nreturn ' + expr;
    const fn = new Function(wrapped);
    pattern = fn();
  } else {
    // Try as-is, then with return
    try {
      const fn = new Function(patternCode);
      pattern = fn();
    } catch {
      const fn = new Function('return ' + patternCode);
      pattern = fn();
    }
  }
} catch (e) {
  console.error('  ❌ Pattern eval failed:', e.message);
  process.env = _savedEnv;  // Restore before exit
  process.exit(1);
} finally {
  // Restore environment after pattern evaluation
  process.env = _savedEnv;
  // Restore module resolution
  if (_savedCpModule) {
    import('module').then(m => { m.default._resolveFilename = _savedCpModule; }).catch(() => {});
  }
}

if (!pattern || typeof pattern.queryArc !== 'function') {
  console.error('  ❌ Pattern did not return a queryable pattern. Got:', typeof pattern);
  process.exit(1);
}

// ── Query haps ──
const actualCps = cpmValue / 60;
const actualDuration = cycles / actualCps;
const actualSamples = Math.ceil(actualDuration * sampleRate);

console.log(`  Using CPS: ${actualCps.toFixed(3)} (${cpmValue * 4} BPM), Duration: ${actualDuration.toFixed(1)}s`);

// Strudel's scheduler passes the tempo with each query (cyclist.mjs); loopAt, fit and splice
// read it to fit a sample to its cycles.
const haps = pattern.queryArc(0, cycles, { _cps: actualCps });
console.log(`  Found ${haps.length} haps`);

if (haps.length === 0) {
  console.error('  ⚠️ No haps. Output will be silence.');
}

// ── Load samples ──
const SAMPLES_DIR = samplesOption
  || path.resolve(import.meta.dirname || path.dirname(new URL(import.meta.url).pathname), '../../samples');
const banks = new Map(); // "bd" → [AudioBuffer, ...], in file-name order

function loadWavToBuffer(filePath, ctx) {
  const wav = decodeWav(readFileSync(filePath));
  const buffer = ctx.createBuffer(wav.channels, wav.length, wav.sampleRate);
  wav.data.forEach((samples, ch) => buffer.copyToChannel(samples, ch));
  return buffer;
}

if (existsSync(SAMPLES_DIR)) {
  console.log('Loading samples...');
  let sampleCount = 0;
  const unreadable = [];
  // Preload a temporary OfflineAudioContext for buffer creation
  const tmpCtx = new nwa.OfflineAudioContext(2, 1, sampleRate);
  
  for (const dir of readdirSync(SAMPLES_DIR)) {
    // Hidden folders aren't banks: a setup run that stops early leaves `.<bank>.partial`.
    if (dir.startsWith('.')) continue;
    const dirPath = path.join(SAMPLES_DIR, dir);
    let files;
    try {
      // Nor are dot-files samples: macOS leaves `._<name>.wav` beside files it copies.
      files = readdirSync(dirPath).filter(f => /\.wav$/i.test(f) && !f.startsWith('.')).sort();
    } catch (e) {
      if (e.code === 'ENOTDIR') continue; // a file, such as strudel.json
      // A folder it can't open is still a bank, so the events that name it say why they're lost.
      unreadable.push(`${dir}/`);
      banks.set(dir, [{ unreadable: `${dir}/ (${e.code})` }]);
      continue;
    }
    // A file that can't be read keeps its place in the bank, so n still picks the same files.
    const bank = files.map((file) => {
      try {
        return loadWavToBuffer(path.join(dirPath, file), tmpCtx);
      } catch (e) {
        unreadable.push(`${dir}/${file}`);
        return { unreadable: `${dir}/${file} (${e.message})` };
      }
    });
    if (bank.length) banks.set(dir, bank);
    sampleCount += bank.filter(b => !b.unreadable).length;
  }
  console.log(`  ✅ ${sampleCount} samples loaded from ${banks.size} banks`);
  if (unreadable.length) console.warn(`  ⚠️ Can't read ${unreadable.join(', ')}`);
} else {
  console.warn(`  ⚠️ No samples folder at ${SAMPLES_DIR}: run npm run setup`);
}

// ── Render to OfflineAudioContext ──
console.log('Rendering...');
const offCtx = new nwa.OfflineAudioContext(2, actualSamples, sampleRate);

// Master compressor for clean output
// Gentler settings to avoid pumping artifacts on vocal material (#22)
const compressor = offCtx.createDynamicsCompressor();
compressor.threshold.setValueAtTime(-12, 0);
compressor.knee.setValueAtTime(10, 0);
compressor.ratio.setValueAtTime(4, 0);
compressor.connect(offCtx.destination);

// Oscillator type map (outside loop for performance)
const waveMap = {
  sine: 'sine', triangle: 'triangle', square: 'square',
  sawtooth: 'sawtooth', saw: 'sawtooth', tri: 'triangle',
  piano: 'triangle', bass: 'sawtooth', pluck: 'triangle',
  supersaw: 'sawtooth', supersquare: 'square', organ: 'sine',
};

// Samples played backwards (a negative speed), made once each.
const reversedBuffers = new Map();
function reversed(buf) {
  if (!reversedBuffers.has(buf)) {
    const copy = offCtx.createBuffer(buf.numberOfChannels, buf.length, buf.sampleRate);
    for (let ch = 0; ch < buf.numberOfChannels; ch++) copy.copyToChannel(buf.getChannelData(ch).slice().reverse(), ch);
    reversedBuffers.set(buf, copy);
  }
  return reversedBuffers.get(buf);
}

// Noise sources, made once per render and looped like superdough's.
const noiseBuffers = new Map();
function noiseBuffer(type) {
  if (!noiseBuffers.has(type)) {
    const buf = offCtx.createBuffer(1, 2 * sampleRate, sampleRate);
    buf.copyToChannel(makeNoise(type, buf.length), 0);
    noiseBuffers.set(type, buf);
  }
  return noiseBuffers.get(type);
}

let scheduled = 0;
for (const hap of haps) {
  // Strudel plays an event once, where it starts (cyclist.mjs). A query can split a long event
  // into fragments with the same whole arc; hasOnset() is true only for the first. Without this
  // filter, samples get stacked N times at the same start time (#22 v7, #75).
  if (typeof hap.hasOnset === 'function' && !hap.hasOnset()) continue;

  const startCycle = hap.whole?.begin ?? hap.part?.begin ?? 0;
  const endCycle = hap.whole?.end ?? hap.part?.end ?? startCycle + 0.25;
  const hapStart = startCycle / actualCps;
  const hapDur = (endCycle - startCycle) / actualCps;

  if (hapStart >= actualDuration || hapStart < 0) continue;

  const v = hap.value;
  if (typeof v !== 'object' || v === null) {
    problems.dropped(`no controls such as s() or note() (a bare ${v === null ? 'null' : typeof v})`);
    continue;
  }

  const gain = Math.min(v.gain ?? 0.3, 1.0);
  if (gain <= 0.001) continue; // Skip silent haps (saves memory on masked layers)
  const sound = v.s || '';
  const lpf = v.lpf ?? v.cutoff ?? 6000;
  const attack = v.attack ?? 0.005;
  const decay = v.decay ?? 0.1;
  const sustain = v.sustain ?? 0.7;
  const release = v.release ?? 0.3;
  const pan = v.pan ?? 0.5;

  // Check if this is a sample-based sound
  const bank = sound ? findBank(banks, sound) : undefined;
  const sampleBuf = bank ? pickSample(bank, v.n, problems.strudelWarning) : undefined;
  if (sampleBuf?.unreadable) {
    problems.dropped(`couldn't read ${sampleBuf.unreadable}`);
    continue;
  }

  const isSynthSound = waveMap[sound] !== undefined;
  const isNoise = NOISES.includes(sound);

  // Resolve note → frequency (for synth sounds)
  let freq = null;
  if (v.freq) freq = v.freq;
  else if (v.note !== undefined) freq = noteToFreq(v.note); // note 0 is MIDI note 0
  // TODO: resolve scale degree to freq using tonal's Scale.get() + degree mapping
  // Currently falls through to 440Hz for unresolved scale degrees
  else if (v.n !== undefined && isSynthSound) freq = 440;

  // An unknown sound plays as a triangle tone (440 Hz unless the event has a note) and goes in
  // the report.
  if (!sampleBuf && !isSynthSound && !isNoise && sound) problems.unknownSound(sound);

  try {
    const endTime = hapStart + hapDur;
    
    // Gain node
    const gn = offCtx.createGain();
    
    // Filter
    const flt = offCtx.createBiquadFilter();
    flt.type = 'lowpass';
    flt.frequency.setValueAtTime(Math.min(lpf, sampleRate / 2 - 100), hapStart);
    flt.Q.setValueAtTime(1.5, hapStart);
    
    // Panner
    const pnr = offCtx.createStereoPanner();
    pnr.pan.setValueAtTime((pan - 0.5) * 2, hapStart);

    if (sampleBuf) {
      // ── Sample playback: superdough's rules, shared with chunked-render (sounds.mjs) ──
      // Once, to its end, at its playback rate; held for the event only with clip, loop or
      // release; looped only with loop; under superdough's ADSR (#75).
      const semitones = v.note ? noteToSemitones(v.note) : 0;
      const play = samplePlayback(v, {
        duration: sampleBuf.duration,
        pitchRate: Math.pow(2, semitones / 12),
        eventSeconds: Number(hap.duration) / actualCps,
      }, problems.strudelWarning);
      if (!play) continue; // speed(0), or an end before its begin: superdough plays nothing

      const src = offCtx.createBufferSource();
      src.buffer = play.reverse ? reversed(sampleBuf) : sampleBuf;
      src.playbackRate.setValueAtTime(play.rate, hapStart);
      if (play.loop) {
        src.loop = true;
        [src.loopStart, src.loopEnd] = play.loop;
      }

      // The envelope, at the event's gain.
      const [[t0, level0], ...ramps] = play.envelope;
      gn.gain.setValueAtTime(level0 * gain, hapStart + t0);
      for (const [t, level] of ramps) gn.gain.linearRampToValueAtTime(level * gain, hapStart + t);

      src.connect(flt);
      flt.connect(gn);
      gn.connect(pnr);
      pnr.connect(compressor);

      src.start(hapStart, play.offset);
      src.stop(hapStart + play.stop);
    } else {
      // ── Oscillator synth, or noise ──
      let osc;
      if (isNoise) {
        osc = offCtx.createBufferSource();
        osc.buffer = noiseBuffer(sound);
        osc.loop = true;
      } else {
        if (!freq) freq = 440;
        const oscType = waveMap[sound] || 'triangle';

        osc = offCtx.createOscillator();
        osc.type = oscType;
        osc.frequency.setValueAtTime(freq, hapStart);

        // Slight detune for richness on saw/square
        if (oscType === 'sawtooth' || oscType === 'square') {
          osc.detune.setValueAtTime(Math.random() * 10 - 5, hapStart);
        }
      }

      // ADSR envelope
      gn.gain.setValueAtTime(0, hapStart);
      gn.gain.linearRampToValueAtTime(gain, Math.min(hapStart + attack, endTime));
      gn.gain.linearRampToValueAtTime(gain * sustain, Math.min(hapStart + attack + decay, endTime));
      if (endTime - release > hapStart + attack + decay) {
        gn.gain.setValueAtTime(gain * sustain, endTime - release);
      }
      gn.gain.linearRampToValueAtTime(0, endTime + 0.01);

      osc.connect(flt);
      flt.connect(gn);
      gn.connect(pnr);
      pnr.connect(compressor);

      osc.start(hapStart);
      osc.stop(endTime + 0.05);
    }
    
    scheduled++;
  } catch (e) {
    problems.dropped(`couldn't schedule it (${e.message})`);
  }
}

console.log(`  Scheduled ${scheduled}/${haps.length} haps`);
const problemCount = problems.report();

if (scheduled === 0) {
  console.error('  ❌ Nothing to render.');
  process.exit(1);
}

const buf = await offCtx.startRendering();
console.log(`  ✅ Rendered: ${buf.length} samples (${(buf.length / sampleRate).toFixed(1)}s)`);

// ── Master fade-out ──
// Apply 2-second linear fade-out to the end of the rendered buffer.
// Prevents the hard cliff exit heard in v7 (#22).
const fadeOutSeconds = 2;
const fadeOutSamples = Math.min(Math.ceil(fadeOutSeconds * sampleRate), buf.length);
const fadeOutStart = buf.length - fadeOutSamples;
for (let ch = 0; ch < buf.numberOfChannels; ch++) {
  const channelData = buf.getChannelData(ch);
  for (let i = 0; i < fadeOutSamples; i++) {
    const gain = 1 - (i / fadeOutSamples); // linear ramp from 1 → 0
    channelData[fadeOutStart + i] *= gain;
  }
}
console.log(`  ✅ Applied ${fadeOutSeconds}s master fade-out (${fadeOutSamples} samples)`);

// ── Write WAV ──
const left = buf.getChannelData(0);
const right = buf.numberOfChannels > 1 ? buf.getChannelData(1) : left;

const pcm = Buffer.alloc(buf.length * 4);
for (let i = 0; i < buf.length; i++) {
  pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, left[i])) * 32767), i * 4);
  pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, right[i])) * 32767), i * 4 + 2);
}

const wav = makeWav(pcm, sampleRate, 2, 16);
writeFileSync(output, wav);
console.log(`✅ ${output} (${(wav.length / 1024 / 1024).toFixed(1)}MB)`);
if (strict && problemCount > 0) {
  console.error(`❌ --strict: ${problemCount} problem${problemCount === 1 ? '' : 's'} listed above`);
  process.exit(2);
}
process.exit(0);

// ── Helpers ──
function noteToSemitones(note) {
  // Returns semitone offset from C4 (for sample pitch shifting)
  if (typeof note === 'number') return note - 60; // MIDI
  const m = String(note).match(/^([a-gA-G])(#|b|s)?(\d+)?$/);
  if (!m) return 0;
  const map = { c:0, d:2, e:4, f:5, g:7, a:9, b:11 };
  let semi = map[m[1].toLowerCase()] ?? 0;
  if (m[2] === '#' || m[2] === 's') semi++;
  if (m[2] === 'b') semi--;
  const oct = parseInt(m[3] ?? '4');
  return semi + (oct * 12) - 60; // offset from C4
}

function noteToFreq(note) {
  // A number is a MIDI note number, as in note(57) or after .add(note(5)),
  // not a frequency (use .freq() for Hz).
  if (typeof note === 'number') return 440 * Math.pow(2, (note - 69) / 12);
  const m = String(note).match(/^([a-gA-G])(#|b|s)?(\d+)?$/);
  if (!m) return 440;
  const map = { c:0, d:2, e:4, f:5, g:7, a:9, b:11 };
  let semi = map[m[1].toLowerCase()] ?? 0;
  if (m[2] === '#' || m[2] === 's') semi++;
  if (m[2] === 'b') semi--;
  const oct = parseInt(m[3] ?? '4');
  return 440 * Math.pow(2, (semi - 9 + (oct - 4) * 12) / 12);
}

function makeWav(pcm, sr, ch, bits) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write('WAVE', 8);
  h.write('fmt ', 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(ch, 22);
  h.writeUInt32LE(sr, 24);
  h.writeUInt32LE(sr * ch * bits / 8, 28);
  h.writeUInt16LE(ch * bits / 8, 32);
  h.writeUInt16LE(bits, 34);
  h.write('data', 36);
  h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}
