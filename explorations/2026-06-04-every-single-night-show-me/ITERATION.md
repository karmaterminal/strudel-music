# Every Single Cathedral — Iteration Log

**Date**: 2026-06-04
**Sources**: Fiona Apple "Every Single Night" + Caseet "Show Me"
**Pipeline**: demucs htdemucs stems → curate-palette → extract-samples → compose.py (note-level placement) → ffmpeg mp3
**Form**: 3 movements, 210s (3:30), D minor
  - I. First Breath (0-60s) — Fiona vocal melody over sustained Caseet bed
  - II. Cathedral (60-150s) — interweave, drums emerge with overlap, density build
  - III. Settle (150-210s) — sparse fragments + drone tail, descending vocal D minor

## Clone-first discipline
- Stems first (demucs), then palette curation (separate step), then note-level placement.
- Both source palettes stayed isolated by track; pitch-shifted into D minor world for tonal coherence.
- Each iteration kept previous render frozen for A/B reference.

## QA iteration trail

| Take | Null gaps | Sub-320Hz | LUFS | True peak | Verdict |
|------|-----------|-----------|------|-----------|---------|
| v1   | 118 (159s/210s) | 97% | -24.7 | -3.0 | ❌ FAIL |
| v2-take-1 | 0 | 70% | -18.8 | -2.3 | ⚠ WARN |
| v2-take-2 | **0** | **68%** | **-17.9** | **-2.1** | ✅ **PASS** |

## v1 → v2 fixes
- **Null gaps**: introduced `make_bed()` helper that stretches a short sample 6-8x and loops with crossfades to actually fill the time. v1's "ambient bed" was 4 spikes of ~300ms placed at 15s intervals = 98% silence.
- **Sub-320Hz**: added a second pitched-up-octave bed layer using Caseet vocals as a pad, raised vocal melody into D4-D5 range explicitly (was floating in lower register).
- **LUFS**: replaced peak-normalize with RMS-target + tanh soft-clip at -1.5dB true-peak. v1 was using peak-normalize to -3dB which left RMS far below target.

## v2-take-1 → v2-take-2
- Single-knob: RMS target 0.15 → 0.17 (+1.1 dB). Landed at -17.9 LUFS, inside target band.

## Files
- `compose.py` — final v2-take-2 source
- `compose-v1.py` — frozen v1 source for reference
- `render/every-single-cathedral.wav` — final v2-take-2 render (PASS)
- `render/every-single-cathedral.mp3` — 192k MP3 (4.9 MB)
- `render/every-single-cathedral-v1.wav` — frozen v1 render for A/B

## What stayed
The three-movement architecture, the D minor world, the source-palette choice, the note-level placement discipline. The form was right in v1; the *execution density* needed iteration to make the form audible.

## What this taught
The QA pipeline is the cooling step. The forge made the metal in v1; the QA gate proved it didn't hold. Two more strikes with the byte-level findings as the guide and the metal held. Clone-first-discipline isn't just about source isolation — it's about iteration discipline. Each version preserved; each finding addressed at the byte that produced it, not in prose.
