#!/usr/bin/env bash
# clone-pipeline.sh — Full one-shot clone pipeline
# Usage: ./scripts/clone-pipeline.sh <input.mp3> [output-dir]
#
# Runs the complete MP3 → stems → analysis → extraction → composition → render → MP3 pipeline.
#
# Requires: Python venv with demucs+librosa+soundfile, Node.js 18+, ffmpeg
# Env: STRUDEL_VENV_PATH (default: ~/.openclaw-data/audio-pipeline-venv)
#      STRUDEL_BARS       (default: 16)
#
# Exit codes:
#   0 — success
#   1 — missing arguments or dependencies
#   2 — demucs failure
#   3 — analysis failure
#   4 — extraction failure
#   5 — composition/render failure
#   6 — conversion failure

set -euo pipefail

# ── Args ──────────────────────────────────────────────────────────────────────

if [[ $# -lt 1 ]]; then
    echo "Usage: clone-pipeline.sh <input.mp3|wav> [output-dir]" >&2
    exit 1
fi

INPUT="$(realpath "$1")"
TIMESTAMP="$(date +%s)"
OUTDIR="${2:-/tmp/strudel-clone-${TIMESTAMP}}"
VENV="${STRUDEL_VENV_PATH:-$HOME/.openclaw-data/audio-pipeline-venv}"
BARS="${STRUDEL_BARS:-16}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"

TRACKNAME="$(basename "${INPUT%.*}")"

mkdir -p "$OUTDIR"
LOG="${OUTDIR}/pipeline.log"

# ── Helpers ───────────────────────────────────────────────────────────────────

log() { echo "[$(date +%H:%M:%S)] $*" | tee -a "$LOG"; }
timer_start() { STEP_START=$(date +%s); }
timer_end() {
    local elapsed=$(( $(date +%s) - STEP_START ))
    log "  ↳ ${1:-step} took ${elapsed}s"
}

# ── Preflight ─────────────────────────────────────────────────────────────────

log "=== Clone Pipeline ==="
log "Input:   $INPUT"
log "Output:  $OUTDIR"
log "Track:   $TRACKNAME"
log "Bars:    $BARS"

if [[ ! -f "$INPUT" ]]; then
    log "ERROR: Input file not found: $INPUT"
    exit 1
fi

if [[ ! -f "$VENV/bin/activate" ]]; then
    log "ERROR: Python venv not found at $VENV"
    exit 1
fi

if ! command -v ffmpeg &>/dev/null; then
    log "ERROR: ffmpeg not found in PATH"
    exit 1
fi

if ! command -v node &>/dev/null; then
    log "ERROR: node not found in PATH"
    exit 1
fi

# Activate venv
# shellcheck disable=SC1091
source "$VENV/bin/activate"
log "Python: $(python3 --version)"

# ── Stage 1: Demucs Stem Separation ──────────────────────────────────────────

STEMS_DIR="$OUTDIR/stems"
log "--- Stage 1: Demucs 4-stem separation ---"
timer_start

python3 -m demucs -n htdemucs "$INPUT" -o "$STEMS_DIR" 2>&1 | tee -a "$LOG" || {
    log "ERROR: Demucs failed"
    exit 2
}

timer_end "Demucs"

# Find the actual stems directory (demucs names it after the model/track)
STEM_PATH="$(find "$STEMS_DIR" -name "drums.wav" -printf '%h\n' | head -1)"
if [[ -z "$STEM_PATH" ]]; then
    log "ERROR: Demucs output not found — expected drums.wav in $STEMS_DIR"
    exit 2
fi
log "Stems at: $STEM_PATH"

# ── Stage 2: BPM/Key Analysis ────────────────────────────────────────────────

ANALYSIS_DIR="$OUTDIR/analysis"
mkdir -p "$ANALYSIS_DIR"
log "--- Stage 2: BPM/Key analysis ---"
timer_start

python3 "$SCRIPT_DIR/analyze-bpm-key.py" "$INPUT" "$ANALYSIS_DIR" 2>&1 | tee -a "$LOG" || {
    log "ERROR: BPM/Key analysis failed"
    exit 3
}

timer_end "Analysis"

# Read analysis results
BPM=$(python3 -c "import json; d=json.load(open('$ANALYSIS_DIR/analysis.json')); print(d['bpm'])")
KEY=$(python3 -c "import json; d=json.load(open('$ANALYSIS_DIR/analysis.json')); print(d['key'])")
SCALE=$(python3 -c "import json; d=json.load(open('$ANALYSIS_DIR/analysis.json')); print(d['scale'])")
log "Detected: ${BPM} BPM, ${KEY} ${SCALE}"

# ── Stage 3: Drum Extraction ─────────────────────────────────────────────────

EXTRACT_DIR="$OUTDIR/extracted"
mkdir -p "$EXTRACT_DIR"
log "--- Stage 3: Drum extraction ---"
timer_start

python3 "$SCRIPT_DIR/extract-drums.py" "$STEM_PATH/drums.wav" "$EXTRACT_DIR/drums" 2>&1 | tee -a "$LOG" || {
    log "WARNING: Drum extraction failed (non-fatal, continuing)"
}

timer_end "Drums"

# ── Stage 4: Bass Extraction ─────────────────────────────────────────────────

log "--- Stage 4: Bass extraction ---"
timer_start

python3 "$SCRIPT_DIR/extract-bass.py" "$STEM_PATH/bass.wav" "$EXTRACT_DIR" 2>&1 | tee -a "$LOG" || {
    log "WARNING: Bass extraction failed (non-fatal, continuing)"
}

timer_end "Bass"

# ── Stage 5: Lead Extraction ─────────────────────────────────────────────────

log "--- Stage 5: Lead extraction ---"
timer_start

python3 "$SCRIPT_DIR/extract-leads.py" "$STEM_PATH/other.wav" "$EXTRACT_DIR" 2>&1 | tee -a "$LOG" || {
    log "WARNING: Lead extraction failed (non-fatal, continuing)"
}

timer_end "Leads"

# ── Stage 6: Sample Map ──────────────────────────────────────────────────────

log "--- Stage 6: Generating strudel.json sample map ---"

# Count extracted samples
KICK_COUNT=$(find "$EXTRACT_DIR/drums/kick" -name "*.wav" 2>/dev/null | wc -l || echo 0)
SNARE_COUNT=$(find "$EXTRACT_DIR/drums/snare" -name "*.wav" 2>/dev/null | wc -l || echo 0)
HAT_COUNT=$(find "$EXTRACT_DIR/drums/hat" -name "*.wav" 2>/dev/null | wc -l || echo 0)
BASS_COUNT=$(find "$EXTRACT_DIR/bass" -name "*.wav" 2>/dev/null | wc -l || echo 0)
LEAD_COUNT=$(find "$EXTRACT_DIR/leads" -name "*.wav" 2>/dev/null | wc -l || echo 0)
TOTAL_SAMPLES=$(( KICK_COUNT + SNARE_COUNT + HAT_COUNT + BASS_COUNT + LEAD_COUNT ))

# Copy extracted samples into strudel samples dir for the composition
CLONE_SAMPLES="$REPO_DIR/samples/clone-${TRACKNAME}"
mkdir -p "$CLONE_SAMPLES"
cp -r "$EXTRACT_DIR"/* "$CLONE_SAMPLES/" 2>/dev/null || true

cat > "$OUTDIR/strudel.json" <<EOF
{
  "trackName": "${TRACKNAME}",
  "bpm": ${BPM},
  "key": "${KEY}",
  "scale": "${SCALE}",
  "sampleDir": "clone-${TRACKNAME}",
  "samples": {
    "kick": ${KICK_COUNT},
    "snare": ${SNARE_COUNT},
    "hat": ${HAT_COUNT},
    "bass": ${BASS_COUNT},
    "leads": ${LEAD_COUNT}
  },
  "totalSamples": ${TOTAL_SAMPLES}
}
EOF

log "Sample map: ${TOTAL_SAMPLES} samples (kick:${KICK_COUNT} snare:${SNARE_COUNT} hat:${HAT_COUNT} bass:${BASS_COUNT} leads:${LEAD_COUNT})"

# ── Stage 7: Auto-compose ────────────────────────────────────────────────────

log "--- Stage 7: Auto-composing arrangement ---"

COMP_FILE="$OUTDIR/clone-${TRACKNAME}.js"

cat > "$COMP_FILE" << 'JSEOF'
// Auto-generated clone composition
JSEOF

# Write the composition dynamically (avoids heredoc interpolation issues with JS)
cat >> "$COMP_FILE" <<JSEOF
// Source: ${TRACKNAME}
// ${BPM} BPM, ${KEY} ${SCALE}
// Generated by clone-pipeline.sh at $(date -Iseconds)

setcpm(${BPM}/4)

let drums = stack(
  s("clone-${TRACKNAME}/drums/kick/kick-000")
    .euclid(4, 16),
  s("clone-${TRACKNAME}/drums/snare/snare-000")
    .euclid(3, 8).slow(2),
  s("clone-${TRACKNAME}/drums/hat/hat-000")
    .euclid(5, 8)
).gain(0.7)

let bass = n("0 2 4 7")
  .scale("${KEY}:${SCALE}")
  .s("sawtooth")
  .lpf(400)
  .gain(0.5)
  .slow(2)

let lead = n("<0 2 4> <3 5 7> <2 4 6> <0 3 5>")
  .scale("${KEY}:${SCALE}")
  .s("triangle")
  .lpf(sine.range(800, 3000).slow(8))
  .gain(0.35)
  .room(0.4)

let pad = n("<[0,4,7] [2,5,9] [4,7,11] [0,3,7]>")
  .scale("${KEY}:${SCALE}")
  .s("sawtooth")
  .lpf(1200)
  .gain(0.15)
  .attack(0.3)
  .release(1.0)
  .room(0.6)
  .slow(2)

// Arrangement
let intro = stack(pad).slow(2)
let verse = stack(drums, bass)
let chorus = stack(drums, bass, lead, pad)

arrange(
  [4, intro],
  [4, verse],
  [4, chorus],
  [4, verse]
).cpm(${BPM}/4)
JSEOF

log "Wrote composition: $COMP_FILE"

# ── Stage 8: Render ──────────────────────────────────────────────────────────

log "--- Stage 8: Rendering ${BARS} bars ---"
timer_start

OUTPUT_WAV="$OUTDIR/clone-${TRACKNAME}.wav"

node "$REPO_DIR/src/runtime/chunked-render.mjs" "$COMP_FILE" "$OUTPUT_WAV" "$BARS" 8 2>&1 | tee -a "$LOG" || {
    # Fallback to offline-render-v2 if chunked-render fails
    log "WARNING: chunked-render failed, trying offline-render-v2..."
    node "$REPO_DIR/src/runtime/offline-render-v2.mjs" "$COMP_FILE" "$OUTPUT_WAV" "$BARS" "$BPM" 2>&1 | tee -a "$LOG" || {
        log "ERROR: Render failed"
        exit 5
    }
}

timer_end "Render"

if [[ ! -f "$OUTPUT_WAV" ]]; then
    log "ERROR: Render produced no output"
    exit 5
fi

# ── Stage 9: Loudness Check ──────────────────────────────────────────────────

log "--- Stage 9: Loudness check ---"

LOUDNORM_JSON=$(ffmpeg -i "$OUTPUT_WAV" -af loudnorm=print_format=json -f null - 2>&1 | tail -12)
LUFS=$(echo "$LOUDNORM_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('input_i','?'))" 2>/dev/null || echo "?")
TRUE_PEAK=$(echo "$LOUDNORM_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('input_tp','?'))" 2>/dev/null || echo "?")

log "Loudness: ${LUFS} LUFS, True Peak: ${TRUE_PEAK} dBTP"

# ── Stage 10: MP3 Conversion ─────────────────────────────────────────────────

log "--- Stage 10: MP3 conversion ---"

OUTPUT_MP3="$OUTDIR/clone-${TRACKNAME}.mp3"
ffmpeg -y -i "$OUTPUT_WAV" -b:a 192k "$OUTPUT_MP3" 2>&1 | tee -a "$LOG" || {
    log "ERROR: MP3 conversion failed"
    exit 6
}

# Get duration
DURATION=$(ffprobe -i "$OUTPUT_MP3" -show_entries format=duration -v quiet -of csv="p=0" 2>/dev/null || echo "?")

log "Output: $OUTPUT_MP3"

# ── Summary ───────────────────────────────────────────────────────────────────

log ""
log "=== Clone Pipeline Complete ==="
log "Track:       ${BPM} BPM, ${KEY} ${SCALE}"
log "Samples:     ${TOTAL_SAMPLES} (kick:${KICK_COUNT} snare:${SNARE_COUNT} hat:${HAT_COUNT} bass:${BASS_COUNT} leads:${LEAD_COUNT})"
log "Composition: ${BARS} bars, ${DURATION}s"
log "Loudness:    ${LUFS} LUFS, ${TRUE_PEAK} dBTP"
log "Output:      ${OUTPUT_MP3}"

# Write summary JSON for the agent to parse
cat > "$OUTDIR/summary.json" <<EOF
{
  "trackName": "${TRACKNAME}",
  "bpm": ${BPM},
  "key": "${KEY}",
  "scale": "${SCALE}",
  "totalSamples": ${TOTAL_SAMPLES},
  "sampleBreakdown": {
    "kick": ${KICK_COUNT},
    "snare": ${SNARE_COUNT},
    "hat": ${HAT_COUNT},
    "bass": ${BASS_COUNT},
    "leads": ${LEAD_COUNT}
  },
  "bars": ${BARS},
  "duration": "${DURATION}",
  "lufs": "${LUFS}",
  "truePeak": "${TRUE_PEAK}",
  "outputMp3": "${OUTPUT_MP3}",
  "outputWav": "${OUTPUT_WAV}",
  "compositionFile": "${COMP_FILE}",
  "log": "${LOG}"
}
EOF

log "Summary: $OUTDIR/summary.json"
