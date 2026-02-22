#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";
import * as core from "@strudel/core";
import * as mini from "@strudel/mini";
import * as webaudio from "@strudel/webaudio";

const SAMPLE_RATE = 44100;
const CHANNELS = 2;

function usage() {
  console.error("Usage: node src/runtime/render.mjs <input.js> [output.wav] [cycles] [bpm]");
}

async function getOfflineAudioContextCtor() {
  if (typeof globalThis.OfflineAudioContext === "function") {
    return globalThis.OfflineAudioContext;
  }

  try {
    const webAudioApi = await import("web-audio-api");
    if (typeof webAudioApi.OfflineAudioContext === "function") {
      return webAudioApi.OfflineAudioContext;
    }
    if (typeof webAudioApi.default?.OfflineAudioContext === "function") {
      return webAudioApi.default.OfflineAudioContext;
    }
  } catch {
    // Optional package fallback.
  }

  return null;
}

function createOfflineContext(OfflineAudioContextCtor, length, sampleRate) {
  try {
    return new OfflineAudioContextCtor(CHANNELS, length, sampleRate);
  } catch {
    return new OfflineAudioContextCtor({
      numberOfChannels: CHANNELS,
      length,
      sampleRate,
    });
  }
}

function normalizeChannels(channelData, length) {
  if (!Array.isArray(channelData) || channelData.length === 0) {
    return [
      new Float32Array(length),
      new Float32Array(length),
    ];
  }

  if (channelData.length === 1) {
    const mono = channelData[0];
    return [mono, new Float32Array(mono)];
  }

  return [channelData[0], channelData[1]];
}

function channelsFromRenderResult(result, fallbackLength) {
  if (!result) {
    return null;
  }

  if (typeof result.getChannelData === "function") {
    const left = new Float32Array(result.getChannelData(0));
    if (result.numberOfChannels > 1) {
      return [left, new Float32Array(result.getChannelData(1))];
    }
    return [left, new Float32Array(left)];
  }

  if (Array.isArray(result) && result.length > 0 && result[0] instanceof Float32Array) {
    return normalizeChannels(result, result[0].length);
  }

  if (result?.channelData && Array.isArray(result.channelData)) {
    return normalizeChannels(result.channelData, result.channelData[0]?.length ?? fallbackLength);
  }

  if (result?.left instanceof Float32Array && result?.right instanceof Float32Array) {
    return [result.left, result.right];
  }

  if (result?.audioBuffer && typeof result.audioBuffer.getChannelData === "function") {
    const left = new Float32Array(result.audioBuffer.getChannelData(0));
    if (result.audioBuffer.numberOfChannels > 1) {
      return [left, new Float32Array(result.audioBuffer.getChannelData(1))];
    }
    return [left, new Float32Array(left)];
  }

  return null;
}

function writeWav(outputPath, channels, sampleRate = SAMPLE_RATE) {
  const numChannels = channels.length;
  const numSamples = channels[0]?.length ?? 0;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  let offset = 0;
  buffer.write("RIFF", offset); offset += 4;
  buffer.writeUInt32LE(36 + dataSize, offset); offset += 4;
  buffer.write("WAVE", offset); offset += 4;
  buffer.write("fmt ", offset); offset += 4;
  buffer.writeUInt32LE(16, offset); offset += 4;
  buffer.writeUInt16LE(1, offset); offset += 2;
  buffer.writeUInt16LE(numChannels, offset); offset += 2;
  buffer.writeUInt32LE(sampleRate, offset); offset += 4;
  buffer.writeUInt32LE(byteRate, offset); offset += 4;
  buffer.writeUInt16LE(blockAlign, offset); offset += 2;
  buffer.writeUInt16LE(bitsPerSample, offset); offset += 2;
  buffer.write("data", offset); offset += 4;
  buffer.writeUInt32LE(dataSize, offset); offset += 4;

  for (let i = 0; i < numSamples; i += 1) {
    for (let ch = 0; ch < numChannels; ch += 1) {
      const sample = channels[ch]?.[i] ?? 0;
      const clamped = Math.max(-1, Math.min(1, sample));
      const pcm = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
      buffer.writeInt16LE(Math.round(pcm), offset);
      offset += 2;
    }
  }

  writeFileSync(outputPath, buffer);
}

function evaluatePattern(source, filename) {
  const globals = {
    ...core,
    ...mini,
    console,
    Math,
    Date,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
  };
  globals.globalThis = globals;

  return vm.runInNewContext(source, globals, { filename });
}

async function renderPattern(pattern, cps, cycles, sampleRate) {
  const renderFn =
    webaudio.renderPatternAudio
    || webaudio.renderPattern
    || webaudio.render;

  if (typeof renderFn !== "function") {
    throw new Error("No render function found in @strudel/webaudio");
  }

  return renderFn(pattern, cps, 0, cycles, sampleRate, 64, false, "render-output");
}

async function main() {
  const [inputPath, outputPathArg, cyclesArg, bpmArg] = process.argv.slice(2);
  if (!inputPath) {
    usage();
    process.exit(1);
  }

  const outputPath = outputPathArg || `${path.basename(inputPath, ".js")}.wav`;
  const cycles = Number(cyclesArg ?? 8);
  const bpm = Number(bpmArg ?? 120);
  const cps = bpm / 60 / 4;

  if (!Number.isFinite(cycles) || cycles <= 0) {
    throw new Error(`Invalid cycles: ${cyclesArg}`);
  }
  if (!Number.isFinite(bpm) || bpm <= 0) {
    throw new Error(`Invalid bpm: ${bpmArg}`);
  }

  const source = readFileSync(inputPath, "utf8");
  const pattern = evaluatePattern(source, inputPath);
  if (!pattern) {
    throw new Error("Pattern evaluation returned no result. Ensure the final expression is your pattern.");
  }

  const durationSeconds = (cycles * 4 * 60) / bpm;
  const frameLength = Math.max(1, Math.ceil(durationSeconds * SAMPLE_RATE));

  const OfflineAudioContextCtor = await getOfflineAudioContextCtor();
  if (!OfflineAudioContextCtor) {
    throw new Error(
      "OfflineAudioContext is unavailable in this Node runtime. Use Node 22+ with WebAudio support, or install a polyfill providing OfflineAudioContext."
    );
  }

  if (typeof globalThis.window === "undefined") {
    globalThis.window = globalThis;
  }
  if (typeof globalThis.self === "undefined") {
    globalThis.self = globalThis;
  }
  if (typeof globalThis.OfflineAudioContext !== "function") {
    globalThis.OfflineAudioContext = OfflineAudioContextCtor;
  }

  createOfflineContext(OfflineAudioContextCtor, frameLength, SAMPLE_RATE);

  let rendered;
  try {
    rendered = await renderPattern(pattern, cps, cycles, SAMPLE_RATE);
  } catch (error) {
    console.error(`Strudel render failed, writing silence: ${error?.message ?? error}`);
  }

  let channels = channelsFromRenderResult(rendered, frameLength);
  if (!channels) {
    channels = [
      new Float32Array(frameLength),
      new Float32Array(frameLength),
    ];
  }

  writeWav(outputPath, channels, SAMPLE_RATE);
  console.log(`Rendered ${inputPath} -> ${outputPath} (${cycles} cycles @ ${bpm} BPM)`);
}

main().catch((error) => {
  console.error(error?.stack ?? String(error));
  process.exit(1);
});
