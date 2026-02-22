#!/usr/bin/env node
/**
 * Offline render v2: Strudel's real audio engine + node-web-audio-api
 * 
 * Evaluates pattern → queries haps → schedules via OfflineAudioContext
 * with proper oscillators, ADSR, filters, panning.
 *
 * Usage: node src/runtime/offline-render-v2.mjs <input.js> [output.wav] [cycles] [bpm]
 */

import { readFileSync, writeFileSync } from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

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
  addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => true,
  createEvent: () => ({ initEvent: () => {} }),
  head: { appendChild: () => {} }, querySelectorAll: () => [], querySelector: () => null,
};
globalThis.addEventListener = () => {};
globalThis.removeEventListener = () => {};

// ── Parse args ──
const input = process.argv[2];
const output = process.argv[3] || 'output.wav';
const cycles = parseInt(process.argv[4] || '8');
const bpm = parseInt(process.argv[5] || '120');

if (!input) {
  console.error('Usage: node src/runtime/offline-render-v2.mjs <input.js> [output.wav] [cycles] [bpm]');
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

// Strip browser-only methods
const vizStubs = ['_pianoroll', '_spiral', '_scope', '_draw'];

console.log('  ✅ Strudel loaded');

// ── Evaluate pattern ──
console.log('Evaluating pattern...');
let patternCode = readFileSync(input, 'utf8')
  .replace(/^\/\/ @\w+.*/gm, '')
  .trim();

// Strip visualization methods that don't exist in headless
// These can span multiple lines with complex args
for (const viz of vizStubs) {
  // Remove ._pianoroll({...}) including multi-line
  const re = new RegExp(`\\._?${viz.replace('_', '')}\\s*\\([\\s\\S]*?\\)`, 'g');
  patternCode = patternCode.replace(re, '');
}
// Also strip the specific pattern: )._pianoroll({...multiline...})
patternCode = patternCode.replace(/\)\s*\._pianoroll\s*\(\{[\s\S]*?\}\)/g, ')');
patternCode = patternCode.replace(/\)\s*\._spiral\s*\(\{[\s\S]*?\}\)/g, ')');
patternCode = patternCode.replace(/\)\s*\._scope\s*\(\{[\s\S]*?\}\)/g, ')');
patternCode = patternCode.replace(/\._pianoroll\s*\(\{[\s\S]*?\}\)/g, '');
patternCode = patternCode.replace(/\._spiral\s*\(\{[\s\S]*?\}\)/g, '');
patternCode = patternCode.replace(/\._scope\s*\(\{[\s\S]*?\}\)/g, '');

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
  process.exit(1);
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

const haps = pattern.queryArc(0, cycles);
console.log(`  Found ${haps.length} haps`);

if (haps.length === 0) {
  console.error('  ⚠️ No haps. Output will be silence.');
}

// ── Render to OfflineAudioContext ──
console.log('Rendering...');
const offCtx = new nwa.OfflineAudioContext(2, actualSamples, sampleRate);

// Master compressor for clean output
const compressor = offCtx.createDynamicsCompressor();
compressor.threshold.setValueAtTime(-24, 0);
compressor.knee.setValueAtTime(30, 0);
compressor.ratio.setValueAtTime(12, 0);
compressor.connect(offCtx.destination);

let scheduled = 0;
for (const hap of haps) {
  const startCycle = hap.whole?.begin ?? hap.part?.begin ?? 0;
  const endCycle = hap.whole?.end ?? hap.part?.end ?? startCycle + 0.25;
  const hapStart = startCycle / actualCps;
  const hapDur = (endCycle - startCycle) / actualCps;

  if (hapStart >= actualDuration || hapStart < 0) continue;

  const v = hap.value;
  if (typeof v !== 'object' || v === null) continue;

  // Resolve note → frequency
  let freq = null;
  if (v.freq) freq = v.freq;
  else if (v.note) freq = noteToFreq(v.note);
  else if (v.n !== undefined) freq = 440; // fallback for scale degrees

  // Skip sample-only sounds with no freq
  const sampleNames = new Set(['bd','sd','hh','oh','cp','cb','mt','lt','ht','cr','ride','rim','tom','tabla','metal']);
  if (!freq && sampleNames.has(v.s)) continue;
  if (!freq) freq = 440;

  const gain = Math.min(v.gain ?? 0.3, 1.0);
  const wave = v.s || 'triangle';
  const lpf = v.lpf ?? v.cutoff ?? 6000;
  const attack = v.attack ?? 0.005;
  const decay = v.decay ?? 0.1;
  const sustain = v.sustain ?? 0.7;
  const release = v.release ?? 0.3;
  const pan = v.pan ?? 0.5;
  const room = v.room ?? 0;

  const waveMap = {
    sine: 'sine', triangle: 'triangle', square: 'square',
    sawtooth: 'sawtooth', saw: 'sawtooth', tri: 'triangle',
    piano: 'triangle', bass: 'sawtooth', pluck: 'triangle',
    supersaw: 'sawtooth', supersquare: 'square', organ: 'sine',
  };
  const oscType = waveMap[wave] || 'triangle';

  try {
    const osc = offCtx.createOscillator();
    osc.type = oscType;
    osc.frequency.setValueAtTime(freq, hapStart);

    // Slight detune for richness on saw/square
    if (oscType === 'sawtooth' || oscType === 'square') {
      osc.detune.setValueAtTime(Math.random() * 10 - 5, hapStart);
    }

    // ADSR
    const gn = offCtx.createGain();
    const endTime = hapStart + hapDur;
    gn.gain.setValueAtTime(0, hapStart);
    gn.gain.linearRampToValueAtTime(gain, Math.min(hapStart + attack, endTime));
    gn.gain.linearRampToValueAtTime(gain * sustain, Math.min(hapStart + attack + decay, endTime));
    if (endTime - release > hapStart + attack + decay) {
      gn.gain.setValueAtTime(gain * sustain, endTime - release);
    }
    gn.gain.linearRampToValueAtTime(0, endTime + 0.01);

    // Filter
    const flt = offCtx.createBiquadFilter();
    flt.type = 'lowpass';
    flt.frequency.setValueAtTime(Math.min(lpf, sampleRate / 2 - 100), hapStart);
    flt.Q.setValueAtTime(1.5, hapStart);

    // Panner
    const pnr = offCtx.createStereoPanner();
    pnr.pan.setValueAtTime((pan - 0.5) * 2, hapStart);

    // Chain
    osc.connect(flt);
    flt.connect(gn);
    gn.connect(pnr);
    pnr.connect(compressor);

    osc.start(hapStart);
    osc.stop(endTime + 0.05);
    scheduled++;
  } catch (e) {
    // Skip problematic haps
  }
}

console.log(`  Scheduled ${scheduled}/${haps.length} haps`);

if (scheduled === 0) {
  console.error('  ❌ Nothing to render.');
  process.exit(1);
}

const buf = await offCtx.startRendering();
console.log(`  ✅ Rendered: ${buf.length} samples (${(buf.length / sampleRate).toFixed(1)}s)`);

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
process.exit(0);

// ── Helpers ──
function noteToFreq(note) {
  if (typeof note === 'number') return note;
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
