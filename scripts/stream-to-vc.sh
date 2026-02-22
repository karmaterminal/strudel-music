#!/usr/bin/env bash
# stream-to-vc.sh — Render a Strudel pattern then stream/emit Opus
#
# Usage: ./scripts/stream-to-vc.sh <pattern.js> [cycles] [bpm]

set -euo pipefail

INPUT="${1:?Usage: ./scripts/stream-to-vc.sh <pattern.js> [cycles] [bpm]}"
CYCLES="${2:-8}"
BPM="${3:-120}"

if [[ ! -f "$INPUT" ]]; then
  echo "Error: input file not found: $INPUT" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BASE_NAME="$(basename "$INPUT" .js)"
TEMP_WAV="$(mktemp --suffix=.wav)"
OUTPUT_OPUS="${BASE_NAME}.opus"

cleanup() {
  rm -f "$TEMP_WAV"
}
trap cleanup EXIT

echo "Rendering local WAV..."
node "$ROOT_DIR/src/runtime/render.mjs" "$INPUT" "$TEMP_WAV" "$CYCLES" "$BPM"

if [[ -n "${DISCORD_VC_PIPE:-}" ]]; then
  if [[ ! -p "$DISCORD_VC_PIPE" ]]; then
    echo "Error: DISCORD_VC_PIPE is set but is not a named pipe: $DISCORD_VC_PIPE" >&2
    exit 1
  fi

  echo "Streaming Opus to pipe: $DISCORD_VC_PIPE"
  ffmpeg -y -i "$TEMP_WAV" -c:a libopus -b:a 128k -ar 48000 -f opus pipe:1 > "$DISCORD_VC_PIPE"
else
  echo "Writing Opus file: $OUTPUT_OPUS"
  ffmpeg -y -i "$TEMP_WAV" -c:a libopus -b:a 128k -ar 48000 "$OUTPUT_OPUS"
fi

