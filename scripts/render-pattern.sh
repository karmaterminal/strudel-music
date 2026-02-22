#!/usr/bin/env bash
# render-pattern.sh — Render a Strudel pattern to WAV
#
# Usage: ./render-pattern.sh [--local|--browser] <input.js> [output.wav] [cycles] [bpm]
#
# Default mode:
#   --local   Uses node src/runtime/offline-render-v2.mjs (default, RECOMMENDED)
#   --browser DEPRECATED — headless browser rendering via Puppeteer (not used in production)
#
# Requires:
#   Local: node (v22+ recommended for OfflineAudioContext)
#   Browser (deprecated): node (v18+), puppeteer (npm install -g puppeteer)
# Optional: ffmpeg (for format conversion)
#
# Environment variables:
#   STRUDEL_URL  — Override the Strudel REPL URL (default: https://strudel.cc)
#                  Set to http://localhost:3000 for local rendering (recommended
#                  for sensitive inputs — avoids remote code execution surface).
#
# Security notes:
#   - This script launches headless Chromium and evaluates pattern code inside
#     the target page's JS context. Only pass pattern code you trust.
#   - --no-sandbox is used for container/WSL compatibility. When running on a
#     full desktop, remove --no-sandbox from the Puppeteer args below.
#   - For maximum isolation, run in a container or dedicated VM.
#
# This script:
# 1. Starts a headless Chromium via Puppeteer
# 2. Loads the Strudel REPL (strudel.cc or local)
# 3. Injects the pattern code
# 4. Triggers renderPatternAudio() for offline WAV export
# 5. Captures the downloaded WAV file

set -euo pipefail

MODE="local"
if [[ "${1:-}" == "--local" ]]; then
  MODE="local"
  shift
elif [[ "${1:-}" == "--browser" ]]; then
  MODE="browser"
  shift
fi

INPUT="${1:?Usage: render-pattern.sh [--local|--browser] <input.js> [output.wav] [cycles] [bpm]}"
OUTPUT="${2:-$(basename "$INPUT" .js).wav}"
CYCLES="${3:-8}"
BPM="${4:-120}"

if [[ ! -f "$INPUT" ]]; then
  echo "Error: input file not found: $INPUT" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [[ "$MODE" == "local" ]]; then
  echo "Rendering locally: $INPUT -> $OUTPUT"
  node "$ROOT_DIR/src/runtime/render.mjs" "$INPUT" "$OUTPUT" "$CYCLES" "$BPM"
  echo "Render complete: $OUTPUT"
  exit 0
fi

STRUDEL_URL="${STRUDEL_URL:-https://strudel.cc}"
PATTERN_CODE=$(cat "$INPUT")
CPS=$(echo "scale=4; $BPM / 60 / 4" | bc)
SAMPLE_RATE=44100
DOWNLOAD_DIR=$(mktemp -d)

echo "Rendering in browser: $INPUT → $OUTPUT"
echo "  Cycles: $CYCLES, BPM: $BPM, CPS: $CPS"

# Generate the Puppeteer render script
RENDER_SCRIPT=$(mktemp --suffix=.mjs)
cat > "$RENDER_SCRIPT" <<'PUPPETEER_EOF'
import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import path from 'path';

const patternCode = process.env.PATTERN_CODE;
const cycles = parseInt(process.env.CYCLES);
const cps = parseFloat(process.env.CPS);
const sampleRate = parseInt(process.env.SAMPLE_RATE);
const downloadDir = process.env.DOWNLOAD_DIR;

async function render() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();

  // Set download behavior
  const client = await page.createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadDir
  });

  // Navigate to Strudel REPL (remote or local)
  const strudelUrl = process.env.STRUDEL_URL;
  console.log(`Loading ${strudelUrl}...`);
  await page.goto(strudelUrl, { waitUntil: 'networkidle2', timeout: 60000 });

  // Wait for Strudel to initialize
  await page.waitForFunction(() => typeof globalThis.evaluate === 'function', { timeout: 30000 });
  console.log('Strudel initialized.');

  // Evaluate the pattern
  console.log('Evaluating pattern...');
  await page.evaluate((code) => {
    evaluate(code);
  }, patternCode);

  // Wait for samples to load
  await new Promise(r => setTimeout(r, 3000));

  // Trigger offline render
  console.log(`Rendering ${cycles} cycles at CPS=${cps}...`);
  await page.evaluate((cycles, cps, sampleRate) => {
    // Access the internal render function
    if (typeof renderPatternAudio === 'function') {
      renderPatternAudio(
        globalThis.__pattern,  // current pattern
        cps,
        0,
        cycles,
        sampleRate,
        64,
        false,
        'render-output'
      );
    } else {
      // Fallback: use the download button if available
      const downloadBtn = document.querySelector('[title="download"]') ||
                          document.querySelector('button[aria-label="download"]');
      if (downloadBtn) downloadBtn.click();
      else throw new Error('renderPatternAudio not available and no download button found');
    }
  }, cycles, cps, sampleRate);

  // Wait for download
  console.log('Waiting for WAV download...');
  await new Promise(r => setTimeout(r, 10000));

  await browser.close();
  console.log(`Done. Check ${downloadDir} for output.`);
}

render().catch(err => {
  console.error('Render failed:', err);
  process.exit(1);
});
PUPPETEER_EOF

# Run the render
PATTERN_CODE="$PATTERN_CODE" \
  CYCLES="$CYCLES" \
  CPS="$CPS" \
  SAMPLE_RATE="$SAMPLE_RATE" \
  DOWNLOAD_DIR="$DOWNLOAD_DIR" \
  STRUDEL_URL="$STRUDEL_URL" \
  node "$RENDER_SCRIPT"

# Find and move the output WAV
WAV_FILE=$(find "$DOWNLOAD_DIR" -name "*.wav" -print -quit 2>/dev/null)
if [[ -n "$WAV_FILE" ]]; then
  mv "$WAV_FILE" "$OUTPUT"
  echo "Output: $OUTPUT"
else
  echo "Warning: No WAV file found in download directory. Render may have failed." >&2
  echo "Check $DOWNLOAD_DIR for partial output." >&2
  exit 1
fi

# Cleanup
rm -f "$RENDER_SCRIPT"
rm -rf "$DOWNLOAD_DIR"

echo "Render complete: $OUTPUT"
