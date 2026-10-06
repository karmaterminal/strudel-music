// WAV reading, writing and measuring for the render tests.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';

// Left channel of the 16-bit PCM WAV the renderers write, as floats.
export function readLeftChannel(file) {
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

// A WAV file's bytes: one Float32Array per channel, written as PCM (`bits` 8, 16, 24 or 32) or
// as float (`float`, 32 or 64 bits), optionally with a WAVE_FORMAT_EXTENSIBLE header.
export function encodeWav(channels, sampleRate, { bits = 16, float = false, extensible = false } = {}) {
  const width = bits / 8;
  const frames = channels[0].length;
  const data = Buffer.alloc(frames * channels.length * width);
  for (let i = 0; i < frames; i++) {
    channels.forEach((samples, ch) => {
      const at = (i * channels.length + ch) * width;
      const x = Math.max(-1, Math.min(1, samples[i]));
      if (float && bits === 32) data.writeFloatLE(samples[i], at);
      else if (float) data.writeDoubleLE(samples[i], at);
      else if (bits === 8) data.writeUInt8(Math.round(x * 127) + 128, at);
      else if (bits === 16) data.writeInt16LE(Math.round(x * 32767), at);
      else if (bits === 24) data.writeIntLE(Math.round(x * 8388607), at, 3);
      else data.writeInt32LE(Math.round(x * 2147483647), at);
    });
  }
  const format = float ? 3 : 1;
  const fmt = Buffer.alloc(extensible ? 40 : 16);
  fmt.writeUInt16LE(extensible ? 0xfffe : format, 0);
  fmt.writeUInt16LE(channels.length, 2);
  fmt.writeUInt32LE(sampleRate, 4);
  fmt.writeUInt32LE(sampleRate * channels.length * width, 8);
  fmt.writeUInt16LE(channels.length * width, 12);
  fmt.writeUInt16LE(bits, 14);
  if (extensible) {
    fmt.writeUInt16LE(22, 16);       // cbSize
    fmt.writeUInt16LE(bits, 18);     // valid bits
    fmt.writeUInt16LE(format, 24);   // SubFormat GUID, first two bytes
  }
  const chunk = (id, body) => {
    const head = Buffer.alloc(8);
    head.write(id, 0);
    head.writeUInt32LE(body.length, 4);
    return Buffer.concat([head, body]);
  };
  const body = Buffer.concat([Buffer.from('WAVE'), chunk('fmt ', fmt), chunk('data', data)]);
  return Buffer.concat([chunk('RIFF', body).subarray(0, 8), body]);
}

// A sine at `hz`, half full scale, for sample banks the tests make.
export function tone(hz, seconds = 2, sampleRate = 44100) {
  return Float32Array.from({ length: Math.round(seconds * sampleRate) },
    (_, i) => Math.sin(2 * Math.PI * hz * i / sampleRate) * 0.5);
}

// A mono WAV holding tone(hz), 16-bit unless `encoding` says otherwise.
export function writeToneWav(file, hz, seconds = 2, sampleRate = 44100, encoding = {}) {
  writeFileSync(file, encodeWav([tone(hz, seconds, sampleRate)], sampleRate, encoding));
}

const slice = (samples, sampleRate, from, to) =>
  samples.subarray(Math.floor(from * sampleRate), Math.floor(to * sampleRate));

// Frequency from rising zero crossings between two times, in seconds.
export function measureHz(samples, sampleRate, from, to) {
  const part = slice(samples, sampleRate, from, to);
  let crossings = 0;
  for (let i = 1; i < part.length; i++) {
    if (part[i - 1] < 0 && part[i] >= 0) crossings++;
  }
  return crossings / (to - from);
}

export function measureRms(samples, sampleRate, from, to) {
  const part = slice(samples, sampleRate, from, to);
  let sum = 0;
  for (const s of part) sum += s * s;
  return Math.sqrt(sum / part.length);
}

// Normalized autocorrelation at `lag` samples: near 1 for a tone whose period is `lag`.
export function autocorrelation(samples, sampleRate, from, to, lag) {
  const part = slice(samples, sampleRate, from, to);
  let num = 0, den = 0;
  for (let i = 0; i < part.length; i++) {
    den += part[i] * part[i];
    if (i >= lag) num += part[i] * part[i - lag];
  }
  return den > 0 ? num / den : 0;
}
