#!/usr/bin/env node
/**
 * DEPRECATED: Legacy browser-based renderer. Not used in production.
 * Use offline-render-v2.mjs instead (node-web-audio-api, no browser needed).
 *
 * Original: Capture audio from strudel.cc by intercepting Web Audio output.
 * 
 * Approach: Monkey-patch AudioContext.destination to capture PCM,
 * then evaluate the pattern and record for N seconds.
 * 
 * Usage: node scripts/repl-capture.mjs <input.js> [output.wav] [seconds]
 */
import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const input = process.argv[2];
const output = process.argv[3] || 'output.wav';
const seconds = parseInt(process.argv[4] || '30');

if (!input) {
  console.error('Usage: node scripts/repl-capture.mjs <input.js> [output.wav] [seconds]');
  process.exit(1);
}

const patternCode = readFileSync(input, 'utf8')
  .replace(/^\/\/ @\w+.*/gm, '')
  .trim();

console.log(`REPL capture: ${input} → ${output} (${seconds}s)`);

const browser = await puppeteer.launch({
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--autoplay-policy=no-user-gesture-required',
  ]
});

const page = await browser.newPage();
page.on('console', msg => {
  const text = msg.text();
  if (msg.type() === 'error' && !text.includes('favicon')) {
    console.log(`  [browser] ${text.slice(0, 200)}`);
  }
});

console.log('Loading strudel.cc...');
await page.goto('https://strudel.cc', { waitUntil: 'networkidle2', timeout: 120000 });

console.log('Waiting for REPL...');
await page.waitForFunction(
  () => typeof globalThis.evaluate === 'function',
  { timeout: 60000 }
);

// Inject audio capture scaffolding BEFORE evaluating pattern
console.log('Injecting audio capture...');
await page.evaluate((captureSecs) => {
  const sampleRate = 44100;
  const totalSamples = sampleRate * captureSecs;
  
  // Create offline context for capture
  window.__captureData = {
    sampleRate,
    totalSamples,
    left: new Float32Array(totalSamples),
    right: new Float32Array(totalSamples),
    writePos: 0,
    done: false
  };
  
  // Monkey-patch the existing AudioContext to tap the output
  const origResume = AudioContext.prototype.resume;
  const origCreateGain = AudioContext.prototype.createGain;
  
  // We'll use a ScriptProcessorNode to capture output
  const origConnect = AudioNode.prototype.connect;
  let captureInstalled = false;
  
  AudioNode.prototype.connect = function(dest, ...args) {
    const result = origConnect.call(this, dest, ...args);
    
    // When something connects to the destination, also capture it
    if (!captureInstalled && dest === this.context.destination) {
      captureInstalled = true;
      const ctx = this.context;
      const processor = ctx.createScriptProcessor(4096, 2, 2);
      const cap = window.__captureData;
      
      processor.onaudioprocess = (e) => {
        if (cap.done) return;
        const inL = e.inputBuffer.getChannelData(0);
        const inR = e.inputBuffer.getChannelData(1);
        const outL = e.outputBuffer.getChannelData(0);
        const outR = e.outputBuffer.getChannelData(1);
        
        for (let i = 0; i < inL.length; i++) {
          if (cap.writePos < cap.totalSamples) {
            cap.left[cap.writePos] = inL[i];
            cap.right[cap.writePos] = inR[i];
            cap.writePos++;
          }
          outL[i] = inL[i];
          outR[i] = inR[i];
        }
        
        if (cap.writePos >= cap.totalSamples) {
          cap.done = true;
        }
      };
      
      // Insert processor between this node and destination
      this.disconnect(dest);
      origConnect.call(this, processor);
      origConnect.call(processor, dest);
      
      console.log('[capture] Audio capture installed');
    }
    return result;
  };
}, seconds);

// Evaluate the pattern (this starts playback)
console.log('Evaluating pattern + starting playback...');
await page.evaluate((code) => {
  evaluate(code);
}, patternCode);

// Wait for samples to load and playback to start
console.log('Waiting for audio capture...');
await new Promise(r => setTimeout(r, 3000));

// Check if playback started
const hasAudio = await page.evaluate(() => {
  return window.__captureData && window.__captureData.writePos > 0;
});

if (!hasAudio) {
  // Try clicking play button
  console.log('No audio yet, trying play button...');
  await page.evaluate((code) => {
    // Try the editor's play function
    if (typeof repl === 'object' && typeof repl.evaluate === 'function') {
      repl.evaluate(code);
    }
    // Try clicking the play button
    const playBtn = document.querySelector('[aria-label="play"]') ||
                    document.querySelector('button[title="play"]') ||
                    document.querySelector('#play-button');
    if (playBtn) playBtn.click();
  }, patternCode);
  await new Promise(r => setTimeout(r, 2000));
}

// Wait for capture to complete
const startTime = Date.now();
const timeoutMs = (seconds + 15) * 1000;

while (true) {
  const status = await page.evaluate(() => ({
    pos: window.__captureData?.writePos || 0,
    total: window.__captureData?.totalSamples || 0,
    done: window.__captureData?.done || false
  }));
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const progress = status.total > 0 ? ((status.pos / status.total) * 100).toFixed(1) : 0;
  process.stdout.write(`\r  Capturing: ${progress}% (${elapsed}s elapsed, ${status.pos} samples)`);
  
  if (status.done) {
    console.log('\n  ✅ Capture complete');
    break;
  }
  
  if (Date.now() - startTime > timeoutMs) {
    console.log(`\n  ⚠️ Timeout after ${seconds + 15}s. Got ${status.pos}/${status.total} samples.`);
    break;
  }
  
  await new Promise(r => setTimeout(r, 500));
}

// Extract PCM data
console.log('Extracting audio data...');
const audioData = await page.evaluate(() => {
  const cap = window.__captureData;
  const len = Math.min(cap.writePos, cap.totalSamples);
  // Convert to 16-bit PCM, interleaved stereo
  const pcm = new Int16Array(len * 2);
  for (let i = 0; i < len; i++) {
    pcm[i * 2] = Math.max(-32768, Math.min(32767, Math.round(cap.left[i] * 32767)));
    pcm[i * 2 + 1] = Math.max(-32768, Math.min(32767, Math.round(cap.right[i] * 32767)));
  }
  // Return as base64
  const bytes = new Uint8Array(pcm.buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return { base64: btoa(binary), samples: len, sampleRate: cap.sampleRate };
});

await browser.close();

if (audioData.samples === 0) {
  console.error('❌ No audio captured. Pattern may not have started playback.');
  process.exit(1);
}

// Write WAV file
console.log(`Writing WAV (${audioData.samples} samples, ${audioData.sampleRate}Hz)...`);
const pcmBuffer = Buffer.from(audioData.base64, 'base64');
const wavBuffer = createWav(pcmBuffer, audioData.sampleRate, 2, 16);
writeFileSync(output, wavBuffer);
console.log(`✅ Output: ${output} (${(wavBuffer.length / 1024).toFixed(0)}KB)`);

function createWav(pcmData, sampleRate, channels, bitsPerSample) {
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);
  const header = Buffer.alloc(44);
  
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcmData.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcmData.length, 40);
  
  return Buffer.concat([header, pcmData]);
}
