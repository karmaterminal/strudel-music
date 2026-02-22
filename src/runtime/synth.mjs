// synth.mjs — Minimal software synthesizer for Strudel pattern events
// Renders pattern haps to PCM audio without any browser/WebAudio dependency.

const TWO_PI = Math.PI * 2;

/**
 * Convert a note name or MIDI number to frequency in Hz.
 */
export function noteToFreq(note) {
  if (typeof note === 'number') {
    return 440 * Math.pow(2, (note - 69) / 12);
  }
  if (typeof note === 'string') {
    const match = note.match(/^([a-gA-G])([#b]?)(\d+)$/);
    if (!match) return 440;
    const names = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
    let semitone = names[match[1].toLowerCase()] ?? 0;
    if (match[2] === '#') semitone += 1;
    if (match[2] === 'b') semitone -= 1;
    const octave = parseInt(match[3], 10);
    const midi = (octave + 1) * 12 + semitone;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }
  return 440;
}

/**
 * Oscillator functions: sample → [-1, 1]
 */
const oscillators = {
  sine: (phase) => Math.sin(TWO_PI * phase),
  square: (phase) => (phase % 1) < 0.5 ? 1 : -1,
  sawtooth: (phase) => 2 * (phase % 1) - 1,
  triangle: (phase) => {
    const p = phase % 1;
    return p < 0.5 ? 4 * p - 1 : 3 - 4 * p;
  },
};

/**
 * Simple ADSR envelope.
 */
function envelope(t, duration, attack = 0.01, decay = 0.1, sustain = 0.7, release = 0.05) {
  if (t < 0) return 0;
  if (t < attack) return t / attack;
  if (t < attack + decay) return 1 - (1 - sustain) * ((t - attack) / decay);
  if (t < duration - release) return sustain;
  if (t < duration) return sustain * (1 - (t - (duration - release)) / release);
  return 0;
}

/**
 * Simple low-pass filter (one-pole IIR).
 */
function lpfCoeff(cutoffHz, sampleRate) {
  const dt = 1 / sampleRate;
  const rc = 1 / (TWO_PI * cutoffHz);
  return dt / (rc + dt);
}

/**
 * Extract haps (events) from a Strudel pattern for a given time span.
 */
export function queryPattern(pattern, startCycle, endCycle) {
  const haps = [];
  try {
    // Strudel Pattern.queryArc returns haps
    const result = pattern.queryArc(startCycle, endCycle);
    if (Array.isArray(result)) {
      return result;
    }
    // Some versions return an iterator
    if (result && typeof result[Symbol.iterator] === 'function') {
      for (const hap of result) {
        haps.push(hap);
      }
    }
  } catch (e) {
    // Fallback: try firstCycle/lastCycle
    try {
      for (let c = Math.floor(startCycle); c < Math.ceil(endCycle); c++) {
        const cycleHaps = pattern.firstCycle?.(c) ?? [];
        haps.push(...cycleHaps);
      }
    } catch {
      // Pattern may not support this query method
    }
  }
  return haps;
}

/**
 * Render a set of haps to stereo PCM float arrays.
 *
 * @param {Array} haps - Strudel hap objects with .whole, .value
 * @param {number} durationSec - Total duration in seconds
 * @param {number} sampleRate - Sample rate (default 44100)
 * @returns {[Float32Array, Float32Array]} - [left, right] channels
 */
export function renderHapsToAudio(haps, durationSec, sampleRate = 44100) {
  const numSamples = Math.ceil(durationSec * sampleRate);
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  for (const hap of haps) {
    if (!hap?.whole) continue;

    const value = hap.value ?? {};
    const startSec = Number(hap.whole.begin) * durationSec / (Number(hap.whole.end) > 0 ? Number(hap.whole.end) : 1);
    const endSec = Number(hap.whole.end) * durationSec / (Number(hap.whole.end) > 0 ? Number(hap.whole.end) : 1);

    // Actually, hap times are in cycles. Convert properly:
    // We need the total cycles to map to total seconds.
    // This is handled by the caller passing cycleDuration.

    const hapStartSec = hap._renderStart ?? startSec;
    const hapEndSec = hap._renderEnd ?? endSec;
    const hapDuration = hapEndSec - hapStartSec;
    if (hapDuration <= 0) continue;

    // Extract synthesis parameters from hap value
    const freq = value.freq ?? noteToFreq(value.note ?? value.n ?? 60);
    const gain = value.gain ?? 0.3;
    const pan = value.pan ?? 0.5;
    const waveform = value.s ?? value.wave ?? 'sine';
    const oscFn = oscillators[waveform] ?? oscillators.sine;
    const attack = value.attack ?? 0.01;
    const decay = value.decay ?? 0.1;
    const sustain = value.sustain ?? 0.7;
    const release = value.release ?? 0.05;
    const cutoff = value.lpf ?? value.cutoff ?? 20000;

    const startSample = Math.max(0, Math.floor(hapStartSec * sampleRate));
    const endSample = Math.min(numSamples, Math.ceil(hapEndSec * sampleRate));

    const alpha = lpfCoeff(Math.min(cutoff, sampleRate / 2), sampleRate);
    let filteredL = 0;
    let filteredR = 0;
    let phase = 0;
    const phaseInc = freq / sampleRate;

    const panL = Math.cos(pan * Math.PI / 2);
    const panR = Math.sin(pan * Math.PI / 2);

    for (let i = startSample; i < endSample; i++) {
      const t = (i - startSample) / sampleRate;
      const env = envelope(t, hapDuration, attack, decay, sustain, release);
      const sample = oscFn(phase) * env * gain;
      phase += phaseInc;

      // Apply one-pole LPF
      filteredL = filteredL + alpha * (sample * panL - filteredL);
      filteredR = filteredR + alpha * (sample * panR - filteredR);

      left[i] += filteredL;
      right[i] += filteredR;
    }
  }

  // Soft clip to prevent clipping
  for (let i = 0; i < numSamples; i++) {
    left[i] = Math.tanh(left[i]);
    right[i] = Math.tanh(right[i]);
  }

  return [left, right];
}
