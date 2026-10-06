#!/usr/bin/env bash
set -euo pipefail
# Download the Dirt-Samples banks the shipped compositions use (idempotent: fetches only
# banks that are missing).
# Usage: download-samples.sh [--force]
SAMPLES_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/samples"
if [ "$#" -gt 1 ] || { [ "$#" -eq 1 ] && [ "$1" != "--force" ]; }; then
  echo "Usage: download-samples.sh [--force]" >&2
  exit 1
fi
FORCE="${1:-}"
# Pinned, so every install gets the same files. HEAD of tidalcycles/Dirt-Samples, 2025-03-18.
DIRT_SAMPLES_COMMIT=c74fc80f8db8038f6a33648ffef5ac00a07ad402
# Strudel's oh (open hi-hat) and rim are Dirt-Samples' ho and rm; the renderers map the names.
BANKS=(bd sd hh ho cp cr rm mt lt ht cb 808bd 808sd 808hc 808oh metal chin insect wind industrial glitch)

# WAV files in the given bank folders, any case (several banks ship .WAV).
count_wavs() {
  local n=0 dir
  for dir in "$@"; do
    [ -d "$dir" ] && n=$((n + $(find "$dir" -maxdepth 1 -type f -iname '*.wav' | wc -l)))
  done
  echo "$n"
}

bank_dirs=("${BANKS[@]/#/$SAMPLES_DIR/}")
missing=()
for bank in "${BANKS[@]}"; do
  if [ "$FORCE" = "--force" ] || [ "$(count_wavs "$SAMPLES_DIR/$bank")" -eq 0 ]; then
    missing+=("$bank")
  fi
done
if [ "${#missing[@]}" -eq 0 ]; then
  echo "✅ Samples present (${#BANKS[@]} banks, $(count_wavs "${bank_dirs[@]}") files). Use --force to re-download."
  exit 0
fi

echo "Downloading from Dirt-Samples: ${missing[*]}"
TMP=$(mktemp -d)
bank= partial= old=
# On exit, drop a copy that was never swapped in, and put back a bank that was moved aside but
# never replaced.
cleanup() {
  rm -rf "$TMP"
  [ -z "$partial" ] || rm -rf "$partial"
  if [ -n "$old" ] && [ -e "$old" ] && [ ! -e "$SAMPLES_DIR/$bank" ]; then
    mv "$old" "$SAMPLES_DIR/$bank"
  fi
}
trap cleanup EXIT
git init --quiet "$TMP"
git -C "$TMP" remote add origin https://github.com/tidalcycles/Dirt-Samples.git
git -C "$TMP" sparse-checkout set "${missing[@]}"
git -C "$TMP" fetch --quiet --depth 1 --filter=blob:none origin "$DIRT_SAMPLES_COMMIT"
git -C "$TMP" checkout --quiet FETCH_HEAD
mkdir -p "$SAMPLES_DIR"
for bank in "${missing[@]}"; do
  if [ ! -d "$TMP/$bank" ]; then
    echo "❌ Dirt-Samples $DIRT_SAMPLES_COMMIT has no $bank folder" >&2
    exit 1
  fi
  # Copy beside the bank, then swap it in with two renames, so a run that stops partway leaves
  # the old bank or the new one, never part of either.
  partial="${SAMPLES_DIR:?}/.$bank.partial"
  old="${SAMPLES_DIR:?}/.$bank.old"
  rm -rf "$partial" "$old"
  cp -r "$TMP/$bank" "$partial"
  if [ -e "$SAMPLES_DIR/$bank" ]; then mv "$SAMPLES_DIR/$bank" "$old"; fi
  mv "$partial" "$SAMPLES_DIR/$bank"
  rm -rf "$old"
done
echo "✅ ${#BANKS[@]} banks, $(count_wavs "${bank_dirs[@]}") samples in $SAMPLES_DIR"
