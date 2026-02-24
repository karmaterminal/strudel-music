#!/usr/bin/env node

// render.mjs — Render a Strudel pattern to WAV using local synthesis.
// No browser, no OfflineAudioContext, no remote dependencies.
// Uses @strudel/core + @strudel/mini for pattern evaluation,
// then a local software synth to produce PCM audio.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import vm from "node:vm";
import * as core from "@strudel/core";
import * as mini from "@strudel/mini";
import * as tonal from "@strudel/tonal";
import { queryPattern, renderHapsToAudio, noteToFreq, loadSamples } from "./synth.mjs";

// Critical: register mini notation as the string parser so s("bd sd hh")
// produces separate haps instead of one hap with the literal string.
if (mini.mini && core.setStringParser) {
  core.setStringParser(mini.mini);
}

const SAMPLE_RATE = 44100;

function usage() {
  console.error("Usage: node src/runtime/render.mjs <input.js> [output.wav] [cycles] [bpm]");
}

/**
 * Write stereo PCM data as a WAV file.
 */
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

/**
 * Evaluate a Strudel pattern source file in a sandboxed context.
 * Returns the last expression value (should be a Pattern).
 */
function evaluatePattern(source, filename) {
  // Strudel REPL state — patterns call setcpm() to set tempo
  let _cpm = null;

  // Provide Strudel globals so patterns can use s(), note(), stack(), setcpm(), etc.
  const globals = {
    ...core,
    ...mini,
    ...tonal,
    console,
    Math,
    Date,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    // REPL helpers that patterns expect
    setcpm: (cpm) => { _cpm = cpm; },
    setcps: (cps) => { _cpm = cps * 60 * 4; },
    hush: () => {},
    // Strudel samples — stub for headless (no audio samples available)
    samples: () => {},
  };
  globals.globalThis = globals;

  // Monkey-patch Pattern prototype to stub browser-only visualization methods.
  // These are no-ops in headless mode — they just return the pattern unchanged.
  const Proto = core.Pattern?.prototype;
  if (Proto) {
    for (const method of ['_pianoroll', '_spiral', '_scope', '_draw', '_highlight']) {
      if (!Proto[method]) {
        Proto[method] = function () { return this; };
      }
    }
  }

  const result = vm.runInNewContext(source, globals, { filename });
  // Attach extracted CPM so caller can use it
  if (result && _cpm !== null) {
    result._extractedBpm = _cpm;
  }
  return result;
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

  const durationSec = (cycles * 4 * 60) / bpm;
  console.error(`Rendering: ${inputPath} → ${outputPath}`);
  console.error(`  Cycles: ${cycles}, BPM: ${bpm}, CPS: ${cps.toFixed(4)}, Duration: ${durationSec.toFixed(2)}s`);

  // Step 0: Load samples from the samples/ directory
  // Try: relative to script (for compositions in src/compositions/), then relative to cwd
  const scriptDir = path.dirname(new URL(import.meta.url).pathname);
  const rootDir = path.resolve(scriptDir, '..', '..');
  const samplesDir = path.resolve(rootDir, 'samples');
  loadSamples(samplesDir);

  // Step 1: Evaluate the pattern
  const source = readFileSync(inputPath, "utf8");
  const pattern = evaluatePattern(source, inputPath);
  if (!pattern || typeof pattern.queryArc !== "function") {
    throw new Error(
      "Pattern evaluation did not return a valid Strudel Pattern. " +
      "Ensure the file's last expression is a pattern (e.g., stack(...) or note(...))."
    );
  }

  // Step 2: Query the pattern for haps (events)
  const haps = queryPattern(pattern, 0, cycles);
  console.error(`  Haps queried: ${haps.length} events`);

  if (haps.length === 0) {
    console.error("  Warning: No haps found. Output will be silence.");
  }

  // Step 3: Annotate haps with render timestamps (cycle time → seconds)
  const secPerCycle = durationSec / cycles;
  for (const hap of haps) {
    if (hap?.whole) {
      hap._renderStart = Number(hap.whole.begin) * secPerCycle;
      hap._renderEnd = Number(hap.whole.end) * secPerCycle;
    }
  }

  // Step 4: Render haps to audio via software synth
  const [left, right] = renderHapsToAudio(haps, durationSec, SAMPLE_RATE);

  // Step 5: Write WAV
  writeWav(outputPath, [left, right], SAMPLE_RATE);
  console.error(`  Output: ${outputPath} (${(left.length / SAMPLE_RATE).toFixed(2)}s, ${SAMPLE_RATE}Hz, stereo)`);
}

main().catch((error) => {
  console.error(error?.stack ?? String(error));
  process.exit(1);
});
