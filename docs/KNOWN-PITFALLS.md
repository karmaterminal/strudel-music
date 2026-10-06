# Known Pitfalls — Strudel Composition for Headless Rendering

## 1. Space-separated vs angle-bracket gain patterns (CRITICAL)

**The bug:** Using space-separated values in `.gain()` mini-notation causes Strudel to interpret ALL values as subdivisions within a SINGLE cycle — playing them simultaneously, not sequentially.

**Wrong (causes clipping/distortion):**
```js
s("kick").gain("0.3 0.3 0.5 0.3 0.3 0.5")
// All 6 values play WITHIN one cycle → 6x overlapping events
```

**Right (one value per cycle):**
```js
s("kick").gain("<0.3 0.3 0.5 0.3 0.3 0.5>")
// Angle brackets = slowcat, one value per cycle (bar)
```

**Impact:** A 175-bar composition with 13 voices, each having ~175 space-separated gain values, generated 2,400+ overlapping events per cycle instead of ~30. Raw peaks hit 587x (55dB above full scale). The tanh soft-clip compressed this into audible distortion across the entire track.

**Detection:** Check loudness with:
```bash
ffmpeg -i render.wav -af loudnorm=print_format=json -f null - 2>&1 | tail -15
```
Integrated loudness above -5 LUFS or true peak above 0 dBTP = something is wrong.
Target: -16 to -10 LUFS, true peak below -1 dBTP.

**Root cause:** Strudel mini-notation uses `<>` for slowcat (sequential, one per cycle) and spaces for subdivision (all within one cycle). When generating long gain envelopes programmatically, always wrap in `<>`.

**Applies to:** `.gain()`, `.mask()`, `.struct()`, `.n()`, any mini-notation pattern with many values intended to be sequential.

**Related pitfall (Silas's silence gap):** `.gain("<...>")` sequences at the BASE cycle rate, not the `.slow()` rate. If you use `.slow(4)`, each `<>` value covers ONE bar, not 4. To cover 170 bars with `.slow(4)`, you need 170 gain values (one per bar), not 42 (one per 4-bar phrase). Wrapping math (`bar mod numValues`) will silently map late bars to early gain values — potentially zeros from your outro section.

**Discovered:** 2026-02-25. Elliott v2 clipped at +7.41 dBTP. Silas v2 had 7.4s silence at bars 128-135.

## 2. DJ voiceover in pad slices

DJ set source material may contain voiceover in the "other" Demucs stem. 8-bar pad slices from this stem will include speech. Use studio versions when available, or manually identify and exclude contaminated slices.

**Fix:** Map voiceover timestamps before slicing, exclude those bars. Or use studio release as source (no DJ patter).

## 3. Root note detection defaults

If `detectRootNote()` cannot parse a note from the sample filename, it defaults to MIDI 60 (C4). For samples at non-standard pitches (e.g., synth_lead at C#3), this causes `.note()` to shift by the wrong interval — potentially an octave or more.

**Fix:** Always declare root notes in `strudel.json` or name samples with their pitch suffix (e.g., `synth_lead_cs3.wav`).

**Example:** Elliott v1 had synth_lead shifting -9 to -14 semitones (nearly an octave down) because the default C4 root was 11 semitones above the actual C#3. After adding root note to `strudel.json`, shifts became ±3 semitones max.

## 4. Renderer loudness — always validate

After every render, check loudness before posting:
```bash
ffmpeg -i output.wav -af loudnorm=print_format=json -f null - 2>&1 | grep -E "input_i|input_tp"
```

| Metric | Acceptable | Problem |
|--------|-----------|---------|
| Integrated (LUFS) | -20 to -10 | > -5 (too hot) or < -25 (too quiet) |
| True Peak (dBTP) | < -1 | > 0 (clipping) |
| LRA (LU) | 8-20 | < 4 (crushed dynamics) |

## 5. Sounds and effects the renderers don't implement

Strudel's website plays far more than these headless renderers do. What they don't know, they
skip or replace, and the render still succeeds unless you pass `--strict`:

- **Unknown sound names.** `chunked-render.mjs` drops the events. `offline-render-v2.mjs` plays
  them as a triangle tone, at 440 Hz unless the event has a note. Both list each name after the
  render, and `--strict` turns the list into exit status 2. Strudel names such as `rd`, `sh` and
  `bell` have no bank here; `oh` and `rim` play Dirt-Samples' `ho` and `rm`. Check with
  `bash scripts/samples-manage.sh list`.
- **Effects.** `.room()`, `.delay()`, `.hpf()`, `.distort()` and every other effect are ignored by
  both renderers. `.lpf()` works only in `offline-render-v2.mjs` (#68).
- **Octave-less note names.** `note("c e g")` renders an octave above Strudel (#67). Write `c3`.
- **Sample length.** `offline-render-v2.mjs` loops a sample that is shorter than its event, so a
  slow `s("bd")` becomes a roll. Both renderers cut a longer sample at the event's end unless
  `clip` is 1 or more. Strudel plays a sample once, to its end, and `clip` cuts it (#75).

**Fix:** use the sounds and controls listed in `SKILL.md` § Write a composition, and render with
`--strict` before posting.

**Discovered:** 2026-10 audit. 9 of the 15 shipped compositions named missing sounds (fixed in
#66), and all 15 use `.room()`.
