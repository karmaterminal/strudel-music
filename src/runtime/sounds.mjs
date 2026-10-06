/**
 * Sound handling both renderers share until #67 picks one: Strudel's drum names, how a sample
 * is picked from a bank, WAV decoding, noise, and the problem report that `--strict` turns into
 * a failure.
 */

// Strudel calls its open hi-hat `oh` and its rimshot `rim`; Dirt-Samples names those banks
// `ho` and `rm`. A bank named after the Strudel name wins if there is one.
export const BANK_ALIASES = { oh: 'ho', rim: 'rm' };

export function findBank(banks, sound) {
  return banks.get(sound) ?? banks.get(BANK_ALIASES[sound]);
}

// Sample n of a bank, wrapping as Strudel does (superdough's getSoundIndex): with three
// samples, n=4 plays sample 1 and n=-1 plays sample 2. A missing n plays 0. So does an n that
// isn't a number, and `warn` gets the warning superdough logs for it.
export function pickSample(bank, n, warn = () => {}) {
  let i = Math.round(Number(n ?? 0));
  if (!Number.isFinite(i)) {
    warn(`"${n}" is not a number, falling back to 0`);
    i = 0;
  }
  return bank[((i % bank.length) + bank.length) % bank.length];
}

// A WAV file's audio as floats, one array per channel. Reads PCM at 8, 16, 24 or 32 bits and
// float at 32 or 64 bits, plain or WAVE_FORMAT_EXTENSIBLE (Dirt-Samples' sd and cb banks are
// 32-bit float). A data chunk cut short gives the frames it holds. Throws, saying why, on
// anything else, including a sample that isn't a finite number, which would silence a render.
export function decodeWav(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const id = (at) => String.fromCharCode(bytes[at], bytes[at + 1], bytes[at + 2], bytes[at + 3]);
  if (bytes.length < 12 || id(0) !== 'RIFF' || id(8) !== 'WAVE') throw new Error('not a WAV file');
  let fmt;
  for (let at = 12; at + 8 <= bytes.length; ) {
    const size = view.getUint32(at + 4, true);
    const body = at + 8;
    if (id(at) === 'fmt ') {
      if (size < 16 || body + 16 > bytes.length) throw new Error('fmt chunk too short');
      let format = view.getUint16(body, true);
      // WAVE_FORMAT_EXTENSIBLE keeps the real format in the first two bytes of its SubFormat.
      if (format === 0xfffe && size >= 40 && body + 26 <= bytes.length) format = view.getUint16(body + 24, true);
      fmt = {
        format,
        channels: view.getUint16(body + 2, true),
        sampleRate: view.getUint32(body + 4, true),
        blockAlign: view.getUint16(body + 12, true),
        bits: view.getUint16(body + 14, true),
      };
    } else if (id(at) === 'data') {
      if (!fmt) throw new Error('no fmt chunk before the audio');
      return decodeFrames(view, body, Math.min(size, bytes.length - body), fmt);
    }
    at = body + size + (size % 2);
  }
  throw new Error('no data chunk');
}

// "format:bits" → reads one sample at a byte offset, as a float.
const SAMPLE_READERS = {
  '1:8': (view, at) => (view.getUint8(at) - 128) / 128,
  '1:16': (view, at) => view.getInt16(at, true) / 32768,
  '1:24': (view, at) => (view.getUint8(at) | (view.getUint8(at + 1) << 8) | (view.getInt8(at + 2) << 16)) / 8388608,
  '1:32': (view, at) => view.getInt32(at, true) / 2147483648,
  '3:32': (view, at) => view.getFloat32(at, true),
  '3:64': (view, at) => view.getFloat64(at, true),
};

function decodeFrames(view, start, byteLength, { format, channels, sampleRate, blockAlign, bits }) {
  const read = SAMPLE_READERS[`${format}:${bits}`];
  if (!read) throw new Error(`unsupported format ${format}, ${bits}-bit`);
  if (!channels || !sampleRate) throw new Error('no channels or sample rate');
  const width = bits / 8;
  if (blockAlign !== width * channels) {
    throw new Error(`frames of ${blockAlign} bytes don't fit ${channels} × ${bits}-bit samples`);
  }
  const length = Math.floor(byteLength / blockAlign);
  if (!length) throw new Error('no audio data');
  const data = Array.from({ length: channels }, () => new Float32Array(length));
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < channels; ch++) {
      data[ch][i] = read(view, start + i * blockAlign + ch * width);
      // Checked once stored: a 64-bit float too big for 32 bits becomes Infinity.
      if (!Number.isFinite(data[ch][i])) throw new Error(`sample ${i} is not a finite number`);
    }
  }
  return { channels, sampleRate, length, data };
}

// s("white"), s("pink") and s("brown"): the noise superdough 1.1.0 plays (noise.mjs), as a
// buffer the renderers loop. A fixed seed makes every render of a piece the same.
export const NOISES = ['white', 'pink', 'brown'];

export function makeNoise(type, length) {
  const random = mulberry32(NOISES.indexOf(type) + 1);
  const out = new Float32Array(length);
  let last = 0, b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < length; i++) {
    const white = random() * 2 - 1;
    if (type === 'white') {
      out[i] = white;
    } else if (type === 'brown') {
      last = (last + 0.02 * white) / 1.02;
      out[i] = last;
    } else if (type === 'pink') {
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  }
  return out;
}

// mulberry32: a small seeded generator of floats in [0, 1).
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Strudel reports trouble through its logger, which dispatches a `strudel.log` event on
// `document` (@strudel/core logger.mjs). Typed messages that matter are 'error' or 'warning';
// `[warn]` (arithmetic on a control pattern) and `[voicing]` (unknown chord) carry no type.
export function isStrudelProblem({ message, type } = {}) {
  return type === 'error' || type === 'warning' || /^\[(warn|voicing)\]/.test(String(message));
}

/**
 * Collects what a render can't play as written: sound names with no sample or synth, events
 * the renderer drops, and Strudel's warnings. `unplayable` says what the renderer does with an
 * unknown sound, for the report.
 */
export function trackProblems({ unplayable }) {
  const sounds = new Map();   // sound name → events
  const drops = new Map();    // reason → events
  const strudel = new Set();  // Strudel messages, once each
  return {
    // The renderers' `document.dispatchEvent` stub passes every event here.
    strudelEvent(event) {
      if (event?.type === 'strudel.log' && isStrudelProblem(event.detail)) {
        strudel.add(String(event.detail.message));
      }
    },
    // A warning Strudel's audio engine would log while playing, such as a bad `n`.
    strudelWarning(message) {
      strudel.add(message);
    },
    unknownSound(sound) {
      sounds.set(sound, (sounds.get(sound) ?? 0) + 1);
    },
    dropped(reason) {
      drops.set(reason, (drops.get(reason) ?? 0) + 1);
    },
    // Prints one line per problem and returns how many kinds there were.
    report() {
      for (const [sound, n] of sounds) {
        console.warn(`  ⚠️ No sample or synth named "${sound}": ${n} event${n === 1 ? '' : 's'} ${unplayable}`);
      }
      for (const [reason, n] of drops) {
        console.warn(`  ⚠️ Dropped ${n} event${n === 1 ? '' : 's'}: ${reason}`);
      }
      for (const message of strudel) {
        console.warn(`  ⚠️ Strudel: ${message}`);
      }
      return sounds.size + drops.size + strudel.size;
    },
  };
}

// ── How long a sample sounds: superdough 1.1.0's rules (sampler.mjs onTriggerSample) ──

// The ADSR superdough gives a sample (helpers.mjs getADSRValues, then getParamADSR's
// nanFallback): what the event sets, with the rest filled in so that .decay() alone fades to
// nothing and .attack() alone holds. [attack, decay, sustain, release], seconds and 0–1.
export function sampleAdsr({ attack, decay, sustain, release }, warn = () => {}) {
  let adsr = [0.001, 0.001, 1, 0.01];
  if (attack != null || decay != null || sustain != null || release != null) {
    const s = sustain ?? ((attack != null && decay == null) || (attack == null && decay == null) ? 1 : 0.001);
    adsr = [Math.max(attack ?? 0, 0.001), Math.max(decay ?? 0, 0.001), Math.min(s, 1), Math.max(release ?? 0, 0.01)];
  }
  return adsr.map((x) => {
    if (!Number.isNaN(Number(x))) return Number(x);
    warn(`"${x}" is not a number, falling back to 0`);
    return 0;
  });
}

// The gain envelope superdough's getParamADSR draws, from 0 to 1, for an event that holds for
// `hold` seconds: [seconds, level] points joined by straight lines, 0 after the last.
export function envelopePoints([attack, decay, sustain, release], hold) {
  if (attack > hold) return [[0, 0], [hold, hold / attack], [hold + release, 0]];
  if (attack + decay > hold) {
    return [[0, 0], [attack, 1], [hold, 1 + (hold - attack) * (sustain - 1) / decay], [hold + release, 0]];
  }
  return [[0, 0], [attack, 1], [attack + decay, sustain], [hold, sustain], [hold + release, 0]];
}

// The envelope's level `t` seconds after the event starts.
export function envelopeAt(points, t) {
  if (t <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [t1, v1] = points[i];
    if (t < t1) {
      const [t0, v0] = points[i - 1];
      return v0 + (v1 - v0) * (t - t0) / (t1 - t0);
    }
  }
  return 0;
}

/**
 * How superdough 1.1.0 plays a sample event. `duration` is the buffer's length in seconds,
 * `pitchRate` the renderer's rate for the event's note (1 without one; how a note maps to a
 * rate differs between the renderers, #67), and `eventSeconds` the event's length: Strudel's
 * `hap.duration`, which counts `clip`, over cps.
 *
 * A sample plays once, to its end (or to `end`), at its playback rate. With `clip`, `loop` or
 * `release` set, it holds for the event's length instead, then releases. It loops only with
 * `loop`. `speed` multiplies the rate, plays the sample backwards when negative and silences it
 * at 0; unit "c" (set by loopAt and fit) multiplies it by the buffer's length.
 *
 * Returns null when the event plays nothing, or, in seconds from the event's start:
 * `rate`, `reverse`, `offset` (where in the buffer it starts, in buffer seconds), `loop`
 * ([start, end] in buffer seconds, or null), `hold`, `envelope` (envelopePoints) and `stop`.
 */
export function samplePlayback(v, { duration, pitchRate = 1, eventSeconds }, warn) {
  const speed = v.speed ?? 1;
  if (speed === 0) return null;
  const rate = pitchRate * Math.abs(speed) * (v.unit === 'c' ? duration : 1);
  const begin = v.begin ?? 0;
  const end = v.end ?? 1;
  const loop = String(v.s).startsWith('wt_') ? 1 : v.loop;
  const hold = v.clip == null && loop == null && v.release == null
    ? (end - begin) * duration / rate
    : eventSeconds;
  const adsr = sampleAdsr(v, warn);
  // Not a positive hold (an end before its begin, say): superdough's envelope never opens.
  if (!(hold > 0)) return null;
  // superdough passes begin to start() and counts the loop's ends from it. A loop the Web Audio
  // spec finds invalid, as with begin after loopBegin, plays the whole buffer.
  const offset = begin * duration;
  let region = null;
  if (loop) {
    const start = (v.loopBegin ?? 0) * duration - offset;
    const stop = Math.min((v.loopEnd ?? 1) * duration - offset, duration);
    region = start >= 0 && start < stop ? [start, stop] : [0, duration];
  }
  return {
    rate,
    reverse: speed < 0,
    offset: Math.min(Math.max(offset, 0), duration),
    loop: region,
    hold,
    envelope: envelopePoints(adsr, hold),
    stop: hold + adsr[3] + 0.01,
  };
}
