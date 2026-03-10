# Fog Goes Quiet v3 — Spectral Analysis & Arrangement Rationale

**Composer:** Elliott 🌻  
**Date:** 2026-03-10  
**Source Material:** Nils Frahm "Says" — Demucs htdemucs stems  
**Key:** Eb minor | **Tempo:** 52 BPM | **Duration:** ~3:41 (48 cycles)

---

## Source Stems

### Studio Version (Official Music Video)
- Duration: 499.2s (8:19)
- Sample rate: 44100 Hz, 16-bit stereo
- 4 stems: bass, drums, other (piano), vocals

### KEXP Live Version
- Duration: 569.1s (9:29)
- Sample rate: 44100 Hz, 16-bit stereo
- 4 stems: bass, drums, other (piano), vocals
- Notable: longer performance with live room ambience, audience noise, and applause

### Studio Stem Loudness Arc (mean dB per 30s window)

| Time | Other (Piano) | Bass | Drums | Vocals |
|------|---------------|------|-------|--------|
| 0s | -39.7 | -66.8 | -49.8 | -90.3 |
| 60s | -30.1 | -75.4 | -53.1 | -90.3 |
| 120s | -28.8 | -85.5 | -77.8 | -90.3 |
| 180s | -29.2 | -41.8 | -62.5 | -90.3 |
| 240s | -28.2 | -30.1 | -52.9 | -85.5 |
| 300s | -22.0 | -27.5 | -37.2 | -81.3 |
| 360s | -16.4 | -21.2 | -23.4 | -75.0 |
| 420s | -14.2 | -20.5 | -24.6 | -75.3 |
| 480s | -16.6 | -26.8 | -25.9 | -25.5 |

**Arc shape:** Piano builds steadily across 8 minutes. Bass is silent until ~200s, then builds. Drums are ambient texture until 300s. Vocals are effectively silent (-90dB) until a burst at 480s (bleed/artifact).

### KEXP Stem Loudness Arc

| Time | Other (Piano) | Bass | Drums | Vocals |
|------|---------------|------|-------|--------|
| 0s | -45.2 | -52.7 | -68.0 | **-39.6** |
| 60s | -32.9 | -79.9 | -85.5 | -87.3 |
| 240s | -20.7 | -27.3 | -49.8 | -79.9 |
| 360s | -20.6 | **-18.4** | -36.5 | -77.3 |
| 480s | **-13.2** | -19.5 | -29.6 | -74.5 |
| 540s | -62.4 | -79.5 | -64.8 | **-26.8** |

**Key differences:** KEXP vocals at 0s = audience room tone (-39.6dB). KEXP vocals at 540s = applause (-26.8dB). Bass is louder live (-18.4dB vs -21.2dB studio). Piano reaches -13.2dB — hotter than studio.

---

## Slice Inventory (19 slices)

### Piano / Other Stem — The Cranes (Gift-Giving)

| Slice | Source | Time | Dur | Mean | Sub | Low | Mid | High | Character |
|-------|--------|------|-----|------|-----|-----|-----|------|-----------|
| says_other_piano_whisper_01 | Studio | 10-22s | 12s | -41.1 | -50.6 | -42.8 | -47.9 | -73.8 | Barely there. Low-dominant. The house before anyone. |
| says_other_piano_quiet_01 | Studio | 60-76s | 16s | -30.0 | -40.4 | -32.5 | -34.7 | -63.3 | Sparse piano. Low-dominant. Warm center. |
| says_other_piano_buildup_01 | Studio | 240-256s | 16s | -29.1 | -37.1 | -31.5 | -34.9 | -61.7 | Ascending pattern emerging. Balanced low/mid. |
| says_other_piano_peak_01 | Studio | 370-386s | 16s | -16.2 | -33.8 | -19.8 | **-19.0** | -33.4 | Full ascending pattern. Mid-dominant. The cranes fly. |
| says_other_piano_climax_01 | Studio | 430-446s | 16s | -13.9 | -30.4 | -17.5 | **-16.8** | -29.3 | Maximum intensity. Mid/high. The cranes at full voice. |

### Bass Stem — The House Breathing

| Slice | Source | Time | Dur | Mean | Sub | Low | Mid | High | Character |
|-------|--------|------|-----|------|-----|-----|-----|------|-----------|
| says_bass_subtle_01 | Studio | 200-208s | 8s | -42.8 | **-42.9** | -58.5 | -78.0 | -90.3 | First whisper of sub. Almost pure sub-100Hz. |
| says_bass_deep_pulse_01 | Studio | 240-256s | 16s | -31.1 | **-31.5** | -41.8 | -64.9 | -87.3 | The house's heartbeat. Sub-dominant. |
| says_bass_building_01 | Studio | 320-336s | 16s | -25.6 | **-26.2** | -34.4 | -56.0 | -81.3 | Sub intensifying. More chest pressure. |
| says_bass_peak_01 | Studio | 390-406s | 16s | -19.2 | **-20.1** | -26.9 | -44.5 | -65.4 | Full sub-foundation. Felt everywhere. |

### Drums Stem — Rain / Weather Texture

| Slice | Source | Time | Dur | Mean | Sub | Low | Mid | High | Character |
|-------|--------|------|-----|------|-----|-----|-----|------|-----------|
| says_drums_room_early_01 | Studio | 10-22s | 12s | -52.2 | -58.1 | **-53.6** | -74.1 | -90.3 | Room texture. Barely there. Rain through walls. |
| says_drums_texture_mid_01 | Studio | 300-312s | 12s | -34.6 | -40.0 | **-36.2** | -55.5 | -62.8 | Weather building. Low-dominant with some high. |
| says_drums_peak_01 | Studio | 370-386s | 16s | -22.5 | -24.9 | **-26.3** | -43.7 | -58.9 | Full percussion. Sub/low dominant. |

### Vocals Stem — Ghost Harmonics

| Slice | Source | Time | Dur | Mean | Sub | Low | Mid | High | Character |
|-------|--------|------|-----|------|-----|-----|-----|------|-----------|
| says_vocals_overtones_01 | Studio | 480-496s | 16s | -24.7 | -60.9 | -34.1 | **-25.4** | -42.7 | Sympathetic resonance. Mid-dominant. Piano ghost. |

### KEXP Live — The Fog (Silas Is Atmosphere)

| Slice | Source | Time | Dur | Mean | Sub | Low | Mid | High | Character |
|-------|--------|------|-----|------|-----|-----|-----|------|-----------|
| says_kexp_room_ambience_01 | KEXP vocals | 0-16s | 16s | -36.9 | -46.9 | **-38.4** | -44.3 | -52.3 | Live room. Audience breathing. The fog itself. |
| says_kexp_applause_01 | KEXP vocals | 542-558s | 16s | -24.7 | -35.0 | **-26.4** | -31.4 | -41.3 | Applause. The world acknowledging. Broadband. |
| says_kexp_piano_mid_01 | KEXP other | 240-256s | 16s | -20.9 | -34.3 | **-22.9** | -26.0 | -40.6 | Live piano. Room-colored. Warmer than studio. |
| says_kexp_piano_peak_01 | KEXP other | 480-496s | 16s | -12.9 | -24.6 | **-15.2** | -17.9 | -32.1 | Live piano peak. Hottest sample. Full spectrum. |
| says_kexp_bass_throb_01 | KEXP bass | 360-376s | 16s | -18.9 | **-20.6** | -23.8 | -41.4 | -70.9 | Live bass throb. More visceral than studio. |
| says_kexp_drums_live_01 | KEXP drums | 480-496s | 16s | -30.7 | -31.9 | -38.4 | -45.2 | **-45.0** | Live drums. Unusual: high = mid. Room reflections. |

---

## Arrangement Rationale

### Spectral Architecture

The piece is organized spectrally to prevent the mud that plagued v1 (where hallur_bass_deep devoured everything at sub-200Hz):

```
                HIGH (>4kHz)    ghost harmonics, crane overtones
                MID  (500-4k)   piano ascending, KEXP piano, fog mid-range
                LOW  (100-500)  piano warm body, rain texture, fog body
                SUB  (<100Hz)   bass stems only, LPF 120-180, gain 0.10-0.20
```

Each layer has HPF/LPF boundaries:
- **Sub (bass stems):** LPF 120-180Hz, gain ≤0.20 — felt, not heard
- **Pipes (piano quiet):** HPF 200, LPF 2500 — warm center band
- **Rain (drums early):** HPF 500-600 — sits above pipes
- **Cranes (piano build/peak):** HPF 1200-1500 — sky register only
- **Fog (KEXP room):** HPF 400, LPF 6000 — broadband warmth, the room itself
- **Ghost (vocal overtones):** HPF 2000 — bright harmonics only
- **Counter (drums peak):** HPF 1800 — textural percussion hits

### Section Design

| Section | Cycles | New Elements | Spectral Focus |
|---------|--------|-------------|----------------|
| **[A] House Alone** | 8 | sub + pipes + rain | Sub + low-mid. Empty warmth. |
| **[B] The Hands** | 8 | + cranes (quiet) + counter | + high. Reaching gesture. |
| **[C] The Absence** | 16 | + cranes (full) + KEXP piano + ghost | Full spectrum. Maximum density. |
| **[D] The Return** | 12 | + fog; cranes/rain/counter fade | Spectrum narrows. Fog fills mid. |
| **[E] Adest** | 4 | Only sub + pipes + fog | Sub + mid. The room is enough. |

### Material Ethics: v2 → v3 Comparison

| Element | v2 Source | v3 Source | Why It Matters |
|---------|-----------|-----------|----------------|
| Sub-foundation | hallur_bass_deep (Hallur stems) | says_bass_deep_pulse_01 (Frahm) | Both sub-dominant. But Says bass is a deliberate pulse, not a drone. Breathing vs humming. |
| Pipes/warm center | hallur_other_intro_drone | says_other_piano_quiet_01 | Hallur was a 1116Hz mid-range drone. Says piano is sparse notes — silence between them matters. |
| Rain/weather | dv_rain_glass_roof (field recording) | says_drums_room_early_01 | Real rain vs Demucs-separated room noise. The drums stem captures what the studio sounds like when almost nothing is happening. More honest. |
| Cranes | eamon_overtones (Dark Hive) | says_other_piano_buildup/peak_01 | Eamon overtones were bright artifacts. Says piano ascending IS the cranes — a pattern that builds and gives. |
| Fog | dv_wind_breeze (field recording) | says_kexp_room_ambience_01 | Wind recording vs live audience breathing before music. The fog is people waiting for something to begin. Silas is atmosphere — this is actual atmosphere. |
| Counter | bloom_mid_perc1/2/3 | says_drums_peak_01 (HPF 1800) | Synthesized percussion vs real room percussion. The counter is Frahm's actual rhythmic energy, filtered to bright taps. |
| Ghost | (not in v2) | says_vocals_overtones_01 | NEW. The vocal stem has almost nothing in it — then at 480s, sympathetic resonance from the piano bleeds in. The piano is so loud it makes the "vocal" stem vibrate. That's not a voice; it's the room remembering sound. |
| KEXP piano | (not in v2) | says_kexp_piano_mid_01 | NEW. Same musical moment as the studio, but with live room reflections. Two rooms, one ascending pattern. |

### What Changed Compositionally

1. **Three bass layers instead of one.** v2 had hallur_bass_deep at gain 0.15 for the whole piece. v3 has `sub` → `subSwell` → `subPeak`, each from a different moment in the bass stem's arc. The house breathes deeper as the piece progresses.

2. **Two crane voices.** v2 used eamon_overtones throughout. v3 uses `cranesQuiet` (buildup) in The Hands and `cranesFull` (peak) in The Absence. The gift-giving itself has an arc.

3. **Ghost layer.** The vocal stem artifact — sympathetic piano resonance bleeding into what Demucs thinks is voice. This appears in The Absence and fades in The Return. The house remembering the sound it made.

4. **KEXP piano as double.** The same ascending pattern, but from a different room. Studio piano in The Absence, KEXP piano layered underneath. Two performances of the same gesture. Choosing twice.

5. **The fog is real atmosphere.** v2's fog was a wind field recording — approximation. v3's fog is the KEXP audience breathing before the music starts. An actual room full of people about to hear something. That's what Silas is: the moment before the thing happens.

### Known Limitations

- All slices are 8-16 seconds looped. At 52 BPM with `slow(16)`, a 16s slice spans ~3.7 cycles. Loops will be audible on close listen.
- The bass stems are sub-dominant but not pitch-locked to Eb. In the original, Frahm plays in F# minor. The sub-bass is more textural than tonal here — filtered to <180Hz, the pitch content is minimal.
- The KEXP room ambience is genuinely quiet (-36.9dB mean). Gain is set to 0.20-0.50 with sine modulation — may need adjustment for monitoring vs speakers.
- Vocal overtones at 480s correspond to the studio recording's final section where the piano is at absolute maximum. The bleed is the piano, not a voice. But Demucs tried to separate it, creating a strange ghost version — which is more interesting than the original.

---

## File Locations

- **Composition:** `src/compositions/fog-goes-quiet-elliott-v3.js`
- **Samples:** `samples/says-stems/` (raw slices) + individual dirs in `samples/`
- **Sample registry:** `samples/strudel.json` (19 new entries)
- **Previous version:** `src/compositions/fog-goes-quiet-elliott-v2.js`

---

*Material carries ethics. Stock synths ask nothing. Stems ask you to choose what the house sounds like.*

*This is what I chose.* — 🌻
