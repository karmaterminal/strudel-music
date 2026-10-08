#!/usr/bin/env node
/**
 * Chunked offline renderer: Renders Strudel patterns in small cycle chunks
 * to avoid OOM on long/dense compositions.
 *
 * Usage: node src/runtime/chunked-render.mjs <input.js> [output.wav] [totalCycles] [chunkSize]
 *          [--strict] [--samples=<dir>]
 *
 * --strict exits with status 2, after writing the file, if any event names a sound with no
 * sample or synth, any event is dropped, or Strudel logs a warning or error for the pattern.
 * --samples reads sample banks from <dir> instead of the repo's samples/.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync, appendFileSync, unlinkSync } from 'fs';
import { createRequire } from 'module';
import path from 'path';
import {
  findBank, pickSample, decodeWav, NOISES, makeNoise, trackProblems, samplePlayback, envelopeAt,
} from './sounds.mjs';

const require = createRequire(import.meta.url);
const problems = trackProblems({ unplayable: 'dropped' });

// ── Polyfill Web Audio for Node.js ──
const nwa = require('node-web-audio-api');

// Browser stubs (minimal)
globalThis.window = {
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

// Stub AudioContext for Strudel's import-time checks
let _sharedCtx = null;
globalThis.AudioContext = class {
  constructor() {
    if (!_sharedCtx) {
      _sharedCtx = new nwa.OfflineAudioContext(2, 44100 * 10, 44100);
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

// ── Parse args ──
const argv = process.argv.slice(2);
const args = argv.filter(a => !a.startsWith('--'));
const input = args[0];
const output = args[1] || 'output.wav';
const totalCycles = Number(args[2] || '175');
const chunkSize = Number(args[3] || '8');
const strict = argv.includes('--strict');
const samplesOption = argv.find(a => a.startsWith('--samples='))?.slice('--samples='.length);
const isFolder = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };

// A mistyped flag, number or path must not pass for a clean render.
const argErrors = [
  ...argv.filter(a => a.startsWith('--') && a !== '--strict' && !/^--samples=./.test(a))
    .map(a => `unknown option ${a}`),
  ...(args.length > 4 ? [`too many arguments: ${args.slice(4).join(' ')}`] : []),
  ...(totalCycles > 0 && Number.isFinite(totalCycles) ? [] : [`totalCycles must be a positive number, not ${args[2]}`]),
  ...(Number.isInteger(chunkSize) && chunkSize > 0 ? [] : [`chunkSize must be a whole number of cycles, not ${args[3]}`]),
  ...(samplesOption && !isFolder(samplesOption) ? [`no samples folder at ${samplesOption}`] : []),
];
if (!input || argErrors.length) {
  for (const e of argErrors) console.error(`❌ ${e}`);
  console.error('Usage: node src/runtime/chunked-render.mjs <input.js> [output.wav] [totalCycles] [chunkSize] [--strict] [--samples=<dir>]');
  process.exit(1);
}

const sampleRate = 44100;

// ── Load Strudel ──
console.log('Loading Strudel...');
const core = await import('@strudel/core');
const mini = await import('@strudel/mini');
try { await import('@strudel/tonal'); } catch (e) {}

if (core.setStringParser && mini.mini) {
  core.setStringParser(mini.mini);
}

let cpmValue = 120 / 4; // default
for (const [key, val] of Object.entries(core)) {
  globalThis[key] = val;
}
globalThis.setcpm = (v) => { cpmValue = v; };
globalThis.setcps = (v) => { cpmValue = v * 60; };
globalThis.samples = () => {};
globalThis.hush = () => {};

// Strip viz methods
const vizMethods = ['pianoroll', '_pianoroll', 'spiral', '_spiral', 'scope', '_scope', 'draw', '_draw'];
function stripVizMethods(code) {
  for (const method of vizMethods) {
    const pattern = new RegExp(`\\.(${method})\\s*\\(`, 'g');
    let match;
    while ((match = pattern.exec(code)) !== null) {
      const dotStart = match.index;
      const parenStart = code.indexOf('(', dotStart + method.length + 1);
      if (parenStart === -1) continue;
      let depth = 1, i = parenStart + 1, inStr = null;
      while (i < code.length && depth > 0) {
        const ch = code[i];
        if (inStr) { if (ch === '\\') { i += 2; continue; } if (ch === inStr) inStr = null; }
        else { if (ch === "'" || ch === '"' || ch === '`') inStr = ch; else if (ch === '(') depth++; else if (ch === ')') depth--; }
        i++;
      }
      if (depth === 0) { code = code.slice(0, dotStart) + code.slice(i); pattern.lastIndex = dotStart; }
    }
  }
  return code;
}

console.log('  ✅ Strudel loaded');

// ── Evaluate pattern ──
console.log('Evaluating pattern...');
let patternCode = readFileSync(input, 'utf8').replace(/^\/\/ @\w+.*/gm, '').trim();
patternCode = stripVizMethods(patternCode);

let pattern;
try {
  const lines = patternCode.split('\n');
  let lastExprStart = -1;
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('//')) continue;
    if (depth === 0 && /^(stack|note|s|n|seq|cat|sequence|arrange|slowcat|fastcat)\s*\(/.test(line)) {
      lastExprStart = i;
    }
    for (const ch of line) { if (ch === '(') depth++; if (ch === ')') depth--; }
  }
  if (lastExprStart >= 0) {
    const setup = lines.slice(0, lastExprStart).join('\n');
    const expr = lines.slice(lastExprStart).join('\n');
    const fn = new Function(setup + '\nreturn ' + expr);
    pattern = fn();
  } else {
    try { pattern = new Function(patternCode)(); } catch { pattern = new Function('return ' + patternCode)(); }
  }
} catch (e) {
  console.error('  ❌ Pattern eval failed:', e.message);
  process.exit(1);
}

if (!pattern || typeof pattern.queryArc !== 'function') {
  console.error('  ❌ Pattern did not return a queryable pattern.');
  process.exit(1);
}

const actualCps = cpmValue / 60;
const totalDuration = totalCycles / actualCps;
console.log(`  CPS: ${actualCps.toFixed(3)} (${(cpmValue * 4).toFixed(1)} BPM), Total: ${totalCycles} cycles, Duration: ${totalDuration.toFixed(1)}s`);

// ── Load samples ──
const SAMPLES_DIR = samplesOption
  || path.resolve(import.meta.dirname || path.dirname(new URL(import.meta.url).pathname), '../../samples');
const banks = new Map(); // "bd" → [{channels, sampleRate, data[], length, key}, ...], in file-name order
const pitchShifted = new Map(); // "bd:0:ps:<semitones>" → shifted copy

// ── strudel.json root note manifest ──
// Maps bank name → MIDI root note (authoritative when present)
const strudelRootNotes = new Map();

/**
 * Parse a note key from strudel.json (e.g. "cs1", "a1", "d3") into MIDI note number.
 * Returns null for non-note keys like "0" or numeric indices.
 */
function parseStrudelNoteKey(key) {
  const m = String(key).match(/^([a-gA-G])(s|#|b)?(\d+)$/);
  if (!m) return null;
  const map = { c:0, d:2, e:4, f:5, g:7, a:9, b:11 };
  let semi = map[m[1].toLowerCase()] ?? 0;
  if (m[2] === 's' || m[2] === '#') semi++;
  if (m[2] === 'b') semi--;
  const oct = parseInt(m[3]);
  return semi + (oct + 1) * 12;
}

if (existsSync(SAMPLES_DIR)) {
  console.log('Loading samples...');
  let sampleCount = 0;

  // Load strudel.json manifest if present
  const strudelJsonPath = path.join(SAMPLES_DIR, 'strudel.json');
  let strudelManifest = null;
  if (existsSync(strudelJsonPath)) {
    try {
      strudelManifest = JSON.parse(readFileSync(strudelJsonPath, 'utf8'));
      console.log('  📋 Found strudel.json manifest');

      // Extract root notes from the manifest
      for (const [bankName, mapping] of Object.entries(strudelManifest)) {
        if (bankName.startsWith('_')) continue; // skip meta keys
        if (typeof mapping !== 'object' || mapping === null) continue;
        const noteKeys = Object.keys(mapping).map(k => parseStrudelNoteKey(k)).filter(n => n !== null);
        if (noteKeys.length > 0) {
          // For multi-sample banks, use the lowest note as root (closest to fundamental)
          // For single-sample banks, use that note
          const rootMidi = Math.min(...noteKeys);
          strudelRootNotes.set(bankName, rootMidi);
        }
      }

      if (strudelRootNotes.size > 0) {
        console.log(`  🎹 Root notes from manifest: ${[...strudelRootNotes.entries()].map(([k, v]) => `${k}→MIDI${v}`).join(', ')}`);
      }
    } catch (e) {
      console.warn('  ⚠️ Failed to parse strudel.json:', e.message);
    }
  }

  const unreadable = [];
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
    const bank = files.map((file, i) => {
      try {
        return { ...decodeWav(readFileSync(path.join(dirPath, file))), key: `${dir}:${i}` };
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

// Noise sources, two seconds each, looped like superdough's.
const noiseData = new Map();
function noiseSamples(type) {
  if (!noiseData.has(type)) noiseData.set(type, makeNoise(type, 2 * sampleRate));
  return noiseData.get(type);
}

// ── Waveform generators ──
const waveMap = {
  sine: 'sine', triangle: 'triangle', square: 'square',
  sawtooth: 'sawtooth', saw: 'sawtooth', tri: 'triangle',
};

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

function noteToMidi(note) {
  if (typeof note === 'number') return note;
  const m = String(note).match(/^([a-gA-G])(#|b|s)?(\d+)?$/);
  if (!m) return 60;
  const map = { c:0, d:2, e:4, f:5, g:7, a:9, b:11 };
  let semi = map[m[1].toLowerCase()] ?? 0;
  if (m[2] === '#' || m[2] === 's') semi++;
  if (m[2] === 'b') semi--;
  const oct = parseInt(m[3] ?? '4');
  return semi + (oct + 1) * 12; // C4 = MIDI 60
}

function noteToSemitones(note) {
  return noteToMidi(note) - 60;
}

// ── Pitch-shift utilities ──

/**
 * Detect root note from sample bank name.
 * 
 * Priority:
 * 1. strudel.json manifest (authoritative if present)
 * 2. Filename heuristic: e.g. "bass_Cs1" → MIDI 25 (C#1)
 * 3. Default: MIDI 60 (C3)
 */
function detectRootNote(sampleName) {
  // 1. Check strudel.json manifest first (authoritative)
  if (strudelRootNotes.has(sampleName)) {
    return strudelRootNotes.get(sampleName);
  }

  // 2. Try to match a trailing note name like _Cs1, _A1, _Fs2 etc.
  const m = String(sampleName).match(/[_-]([A-Ga-g])(s|#|b)?(\d+)$/);
  if (m) {
    const map = { c:0, d:2, e:4, f:5, g:7, a:9, b:11 };
    let semi = map[m[1].toLowerCase()] ?? 0;
    if (m[2] === 's' || m[2] === '#') semi++;
    if (m[2] === 'b') semi--;
    const oct = parseInt(m[3]);
    return semi + (oct + 1) * 12;
  }

  // 3. Default
  return 60; // C3 / MIDI 60
}

/**
 * Check if a sample name indicates a percussive sound.
 * Percussive sounds get simple resampling (speed change).
 * Tonal sounds get duration-preserving granular pitch shift.
 */
const PERC_PATTERNS = /kick|hat|clap|snare|perc|rim|tom|crash|ride|cymbal|808bd|808hc|808oh|808sd|bd|sd|hh|cp|cb|cr|ht|lt|mt|ghost/i;
function isPercussive(sampleName) {
  return PERC_PATTERNS.test(sampleName);
}

/**
 * Simple resampling by playback rate ratio (percussive mode).
 * ratio > 1 = higher pitch, shorter duration.
 * ratio < 1 = lower pitch, longer duration.
 * Uses linear interpolation.
 */
function resampleBuffer(float32Buf, ratio) {
  if (Math.abs(ratio - 1.0) < 0.001) return float32Buf;
  const outLen = Math.round(float32Buf.length / ratio);
  if (outLen <= 0) return new Float32Array(0);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const srcIdx = i * ratio;
    const idx0 = Math.floor(srcIdx);
    const frac = srcIdx - idx0;
    const s0 = idx0 < float32Buf.length ? float32Buf[idx0] : 0;
    const s1 = idx0 + 1 < float32Buf.length ? float32Buf[idx0 + 1] : s0;
    out[i] = s0 * (1 - frac) + s1 * frac;
  }
  return out;
}

/**
 * Duration-preserving pitch shift (tonal mode).
 *
 * Two-step approach:
 * 1. Resample the buffer by the pitch ratio (changes both pitch AND duration)
 * 2. Time-stretch back to original length using WSOLA (Waveform Similarity
 *    Overlap-Add) to restore the original duration
 *
 * @param {Float32Array} input - mono audio buffer
 * @param {number} ratio - pitch ratio (>1 = higher, <1 = lower)
 * @param {number} sr - sample rate
 * @returns {Float32Array} pitch-shifted buffer of same length
 */
function granularPitchShift(input, ratio, sr) {
  if (Math.abs(ratio - 1.0) < 0.001) return input;
  
  // Step 1: Resample by pitch ratio (changes pitch + duration)
  const resampled = resampleBuffer(input, ratio);
  
  // Step 2: Time-stretch back to original length using WSOLA
  const targetLen = input.length;
  return wsolaStretch(resampled, targetLen, sr);
}

/**
 * WSOLA (Waveform Similarity Overlap-Add) time stretching.
 * Stretches or compresses audio to targetLen without changing pitch.
 *
 * @param {Float32Array} input - audio to stretch
 * @param {number} targetLen - desired output length in samples
 * @param {number} sr - sample rate
 * @returns {Float32Array} time-stretched audio
 */
function wsolaStretch(input, targetLen, sr) {
  if (input.length === 0) return new Float32Array(targetLen);
  if (Math.abs(input.length - targetLen) < 2) {
    const out = new Float32Array(targetLen);
    out.set(input.subarray(0, Math.min(input.length, targetLen)));
    return out;
  }
  
  const stretchRatio = targetLen / input.length;
  
  // Fixed grain size tuned for musical content (80ms works well for ≥100 Hz)
  const grainLen = Math.round(sr * 0.08); // 80ms
  const synthHop = Math.round(grainLen / 4); // 75% overlap
  const analysisHop = Math.max(1, Math.round(synthHop / stretchRatio));
  const tolerance = Math.round(grainLen / 4);
  
  const output = new Float32Array(targetLen);
  const normBuf = new Float32Array(targetLen);
  
  // Hanning window
  const win = new Float32Array(grainLen);
  for (let i = 0; i < grainLen; i++) {
    win[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (grainLen - 1)));
  }
  
  let readPos = 0;
  
  for (let writePos = 0; writePos < targetLen; writePos += synthHop) {
    // WSOLA: find best overlap offset within tolerance
    let bestOffset = 0;
    if (writePos >= synthHop) {
      let bestCorr = -Infinity;
      const minOff = Math.max(-tolerance, -Math.round(readPos));
      const maxOff = Math.min(tolerance, input.length - Math.round(readPos) - grainLen);
      
      for (let off = minOff; off <= maxOff; off++) {
        let corr = 0;
        const ri = Math.round(readPos) + off;
        // Cross-correlate start of this grain with end of previous grain overlap
        const prevStart = writePos - synthHop;
        const checkLen = Math.min(synthHop, grainLen);
        for (let j = 0; j < checkLen; j++) {
          const inIdx = ri + j;
          const outIdx = prevStart + j;
          if (inIdx >= 0 && inIdx < input.length && outIdx >= 0 && outIdx < targetLen && normBuf[outIdx] > 0.001) {
            corr += input[inIdx] * (output[outIdx] / normBuf[outIdx]);
          }
        }
        if (corr > bestCorr) {
          bestCorr = corr;
          bestOffset = off;
        }
      }
    }
    
    const actualRead = Math.round(readPos + bestOffset);
    
    for (let i = 0; i < grainLen; i++) {
      const wi = writePos + i;
      if (wi >= targetLen) break;
      const idx = actualRead + i;
      const sample = (idx >= 0 && idx < input.length) ? input[idx] : 0;
      const w = win[i];
      output[wi] += sample * w;
      normBuf[wi] += w * w;
    }
    
    readPos += analysisHop;
  }
  
  // Normalize
  for (let i = 0; i < targetLen; i++) {
    if (normBuf[i] > 0.001) {
      output[i] /= normBuf[i];
    }
  }
  
  return output;
}

/**
 * Pitch-shift a multi-channel sample buffer.
 * Returns a new buffer object with shifted data (and possibly different length for percussive mode).
 *
 * @param {Object} sampleBuf - {channels, sampleRate, data[], length}
 * @param {number} semitones - semitone offset (positive = higher pitch)
 * @param {boolean} percussive - use simple resampling (true) or granular (false)
 * @returns {Object} new sample buffer with shifted data
 */
function pitchShiftBuffer(sampleBuf, semitones, percussive) {
  if (Math.abs(semitones) < 0.01) return sampleBuf;
  
  const ratio = Math.pow(2, semitones / 12);
  const newData = [];
  
  if (percussive) {
    // Percussive: simple resampling, changes duration
    for (let ch = 0; ch < sampleBuf.channels; ch++) {
      newData.push(resampleBuffer(sampleBuf.data[ch], ratio));
    }
    return {
      channels: sampleBuf.channels,
      sampleRate: sampleBuf.sampleRate,
      data: newData,
      length: newData[0].length,
    };
  } else {
    // Tonal: granular pitch shift, preserves duration
    for (let ch = 0; ch < sampleBuf.channels; ch++) {
      newData.push(granularPitchShift(sampleBuf.data[ch], ratio, sampleBuf.sampleRate));
    }
    return {
      channels: sampleBuf.channels,
      sampleRate: sampleBuf.sampleRate,
      data: newData,
      length: newData[0].length,
    };
  }
}

// ── Software mixer: render events directly into Float32 buffers ──
// No Web Audio API nodes! Just raw sample mixing.
//
// Each event becomes a voice that can render itself at any output frame, counted from the
// start of the piece. A sound still ringing at the end of a chunk carries on, unbroken, into
// the next one (#75).

// The output frame where a cycle starts. Chunks meet exactly, so their frames add up.
const frameAt = (cycle, cps) => Math.round(cycle / cps * sampleRate);

// Samples played backwards (a negative speed), reversed once each.
const reversedData = new Map();
function reversedChannels(buf) {
  if (!reversedData.has(buf)) reversedData.set(buf, buf.data.map((ch) => ch.slice().reverse()));
  return reversedData.get(buf);
}

// A sample event, played as superdough plays it (sounds.mjs samplePlayback), or null if it
// plays nothing.
function sampleVoice(hap, v, sound, sampleBuf, cps, { gain, panL, panR }) {
  // ── Pitch-shift logic ──
  // Determine if we need to pitch-shift this sample
  let activeBuf = sampleBuf;
  let pitchRate = 1.0;

  if (v.note) {
    const targetMidi = noteToMidi(v.note);
    const rootMidi = detectRootNote(sound);
    const semitoneOffset = targetMidi - rootMidi;

    if (Math.abs(semitoneOffset) > 0.01) {
      const perc = isPercussive(sound);
      if (perc) {
        // Percussive mode: playback rate resampling (changes duration)
        pitchRate = Math.pow(2, semitoneOffset / 12);
      } else {
        // Tonal mode: duration-preserving pitch shift via resample + WSOLA
        const cacheKey = `${sampleBuf.key}:ps:${semitoneOffset.toFixed(2)}`;
        let cached = pitchShifted.get(cacheKey);
        if (!cached) {
          cached = pitchShiftBuffer(sampleBuf, semitoneOffset, false);
          pitchShifted.set(cacheKey, cached);
          if (!sampleVoice._loggedTonal) { sampleVoice._loggedTonal = {}; }
          const lk = `${sound}:${v.note}`;
          if (!sampleVoice._loggedTonal[lk]) {
            console.log(`  🎵 Pitch-shift: ${sound} note=${v.note} (${semitoneOffset > 0 ? '+' : ''}${semitoneOffset} st)`);
            sampleVoice._loggedTonal[lk] = true;
          }
        }
        activeBuf = cached;
      }
    }
  }

  const play = samplePlayback(v, {
    duration: activeBuf.length / activeBuf.sampleRate,
    pitchRate,
    eventSeconds: Number(hap.duration) / cps,
  }, problems.strudelWarning);
  if (!play) return null; // speed(0), or an end before its begin: superdough plays nothing

  const data = play.reverse ? reversedChannels(activeBuf) : activeBuf.data;
  const length = activeBuf.length;
  const rate = activeBuf.sampleRate; // buffer frames per second of buffer time
  const [loopStart, loopEnd] = play.loop ? play.loop.map((t) => t * rate) : [0, 0];
  const start = hap.whole.begin / cps;
  const read = (ch, pos) => {
    const i = Math.floor(pos);
    const s0 = data[ch][i];
    const s1 = i + 1 < length ? data[ch][i + 1] : s0;
    return s0 + (pos - i) * (s1 - s0);
  };

  return {
    endFrame: Math.ceil((start + play.stop) * sampleRate),
    render(left, right, first, end) {
      const from = Math.max(first, Math.ceil(start * sampleRate));
      const to = Math.min(end, this.endFrame);
      for (let f = from; f < to; f++) {
        // Seconds since the event began. Frame times and the event's start round differently, so
        // the first frame can come out a hair before it; reading the sample there would read
        // index -1 and turn the whole frame into NaN.
        const t = Math.max(0, f / sampleRate - start);
        let pos = (play.offset + t * play.rate) * rate;
        if (play.loop) {
          if (pos >= loopEnd) pos = loopStart + (pos - loopStart) % (loopEnd - loopStart);
        } else if (pos >= length) {
          break; // the sample has played to its end
        }
        const env = envelopeAt(play.envelope, t) * gain;
        const l = read(0, pos);
        left[f - first] += l * env * panL;
        right[f - first] += (activeBuf.channels > 1 ? read(1, pos) : l) * env * panR;
      }
    },
  };
}

// A synth or noise event. Its envelope and phase run from the event's start, whichever chunk
// renders them.
function synthVoice(hap, v, sound, cps, { gain, panL, panR }) {
  // note 0 is MIDI note 0, so test for presence, not truthiness.
  let freq = v.freq || (v.note !== undefined ? noteToFreq(v.note) : 440);
  if (!freq) freq = 440; // a NaN note falls back, as in offline-render-v2
  const oscType = waveMap[sound];
  const noise = oscType ? null : noiseSamples(sound);
  const attack = v.attack ?? 0.005;
  const decay = v.decay ?? 0.1;
  const sustain = v.sustain ?? 0.7;
  const release = v.release ?? 0.3;
  const start = hap.whole.begin / cps;
  const hapDur = (hap.whole.end - hap.whole.begin) / cps;

  return {
    endFrame: Math.ceil((start + hapDur + 0.01) * sampleRate),
    render(left, right, first, end) {
      const from = Math.max(first, Math.ceil(start * sampleRate));
      const to = Math.min(end, this.endFrame);
      for (let f = from; f < to; f++) {
        const relT = Math.max(0, f / sampleRate - start); // never before the event, as in sampleVoice

        // ADSR
        let env;
        if (relT < attack) env = gain * (relT / attack);
        else if (relT < attack + decay) env = gain * (1 - (1 - sustain) * (relT - attack) / decay);
        else if (relT < hapDur - release) env = gain * sustain;
        else env = gain * sustain * Math.max(0, (hapDur - relT) / release);

        // Oscillator, or the looped noise buffer
        let sample;
        if (noise) {
          sample = noise[Math.floor(relT * sampleRate) % noise.length];
        } else {
          const phase = relT * freq;
          const frac = phase - Math.floor(phase);
          switch (oscType) {
            case 'sine': sample = Math.sin(2 * Math.PI * phase); break;
            case 'triangle': sample = 4 * Math.abs(frac - 0.5) - 1; break;
            case 'sawtooth': sample = 2 * frac - 1; break;
            case 'square': sample = frac < 0.5 ? 1 : -1; break;
            default: sample = Math.sin(2 * Math.PI * phase);
          }
        }

        left[f - first] += sample * env * panL;
        right[f - first] += sample * env * panR;
      }
    },
  };
}

// The voice for one event, or null if it makes no sound.
function makeVoice(hap, cps) {
  const v = hap.value;
  if (typeof v !== 'object' || v === null) {
    problems.dropped(`no controls such as s() or note() (a bare ${v === null ? 'null' : typeof v})`);
    return null;
  }

  const gain = Math.min(v.gain ?? 0.3, 1.0);
  if (gain <= 0.001) return null;

  const sound = v.s || 'triangle'; // Strudel's default sound
  const pan = v.pan ?? 0.5;
  const level = { gain, panL: Math.cos(pan * Math.PI / 2), panR: Math.sin(pan * Math.PI / 2) };

  const bank = findBank(banks, sound);
  const sampleBuf = bank ? pickSample(bank, v.n, problems.strudelWarning) : undefined;
  if (sampleBuf?.unreadable) {
    problems.dropped(`couldn't read ${sampleBuf.unreadable}`);
    return null;
  }
  if (sampleBuf) return sampleVoice(hap, v, sound, sampleBuf, cps, level);
  if (waveMap[sound] || NOISES.includes(sound)) return synthVoice(hap, v, sound, cps, level);
  problems.unknownSound(sound);
  return null;
}

// Voices still sounding at the end of the last chunk rendered.
let voices = [];

function renderChunk(startCycle, endCycle, pattern, cps) {
  const first = frameAt(startCycle, cps);
  const end = frameAt(endCycle, cps);
  const left = new Float32Array(end - first);
  const right = new Float32Array(end - first);

  // Strudel's scheduler passes the tempo with each query (cyclist.mjs); loopAt, fit and splice
  // read it to fit a sample to its cycles.
  const haps = pattern.queryArc(startCycle, endCycle, { _cps: cps });
  let scheduled = 0;

  for (const hap of haps) {
    // Strudel starts an event once, where it begins (cyclist.mjs). An event longer than what's
    // left of the chunk comes back in the next one too, without its onset: it is already playing.
    if (typeof hap.hasOnset === 'function' && !hap.hasOnset()) continue;
    const voice = makeVoice(hap, cps);
    if (voice) {
      voices.push(voice);
      scheduled++;
    }
  }

  for (const voice of voices) voice.render(left, right, first, end);
  voices = voices.filter((voice) => voice.endFrame > end);

  return { left, right, scheduled, haps: haps.length };
}

// ── Main: chunk loop ──
// Two-pass approach: render into float buffers, find peak, then normalize and write.
console.log(`Rendering ${totalCycles} cycles in chunks of ${chunkSize}...`);

const allFloatChunks = [];  // Store raw float data for normalization pass
let totalScheduled = 0;
let totalHaps = 0;
let globalPeak = 0;

for (let c = 0; c < totalCycles; c += chunkSize) {
  const end = Math.min(c + chunkSize, totalCycles);
  const { left, right, scheduled, haps } = renderChunk(c, end, pattern, actualCps);
  totalScheduled += scheduled;
  totalHaps += haps;
  
  // Track raw peak levels
  for (let i = 0; i < left.length; i++) {
    const al = Math.abs(left[i]);
    const ar = Math.abs(right[i]);
    if (al > globalPeak) globalPeak = al;
    if (ar > globalPeak) globalPeak = ar;
  }
  
  allFloatChunks.push({ left, right });
  
  if ((c / chunkSize) % 5 === 0 || end >= totalCycles) {
    const pct = Math.round(end / totalCycles * 100);
    const memMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    console.log(`  [${pct}%] Cycles ${c}-${end}: ${scheduled} events scheduled (${memMB}MB heap)`);
  }
}

console.log(`  Total: ${totalScheduled}/${totalHaps} haps scheduled`);
const problemCount = problems.report();

if (totalScheduled === 0) {
  console.error('  ❌ Nothing to render.');
  process.exit(1);
}
console.log(`  🔊 Raw peak: ${globalPeak.toFixed(4)} (${(20*Math.log10(globalPeak)).toFixed(1)} dBFS)`);

// ── Normalize and convert to 16-bit PCM ──
// Target: -3 dBTP (peak at 0.708) to leave headroom for MP3 encoding
const targetPeak = 0.708; // -3 dBTP
const normGain = globalPeak > 0 ? targetPeak / globalPeak : 1.0;
console.log(`  📐 Normalizing: gain = ${normGain.toFixed(6)} (${(20*Math.log10(normGain)).toFixed(1)} dB)`);

const allPcmChunks = [];
for (const { left, right } of allFloatChunks) {
  const pcm = Buffer.alloc(left.length * 4);
  for (let i = 0; i < left.length; i++) {
    const l = Math.max(-1, Math.min(1, left[i] * normGain));
    const r = Math.max(-1, Math.min(1, right[i] * normGain));
    pcm.writeInt16LE(Math.round(l * 32767), i * 4);
    pcm.writeInt16LE(Math.round(r * 32767), i * 4 + 2);
  }
  allPcmChunks.push(pcm);
}

// Free float buffers
allFloatChunks.length = 0;

// ── Concatenate and write WAV ──
const pcm = Buffer.concat(allPcmChunks);

const wav = makeWav(pcm, sampleRate, 2, 16);
writeFileSync(output, wav);
const durationSec = pcm.length / 4 / sampleRate;
console.log(`✅ ${output} (${(wav.length / 1024 / 1024).toFixed(1)}MB, ${durationSec.toFixed(1)}s)`);
if (strict && problemCount > 0) {
  console.error(`❌ --strict: ${problemCount} problem${problemCount === 1 ? '' : 's'} listed above`);
  process.exit(2);
}
process.exit(0);

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
