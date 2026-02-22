# WO3: Discord VC Streaming Pipeline

**Status:** In Progress
**Priority:** High — differentiating feature
**Assigned:** Silas 🌫️

## Objective

Build a working end-to-end pipeline that takes a Strudel pattern, renders it to audio, and streams it to a Discord voice channel in near real-time.

## Acceptance Criteria

- [ ] Headless render produces clean WAV/Opus from any valid pattern
- [ ] Pipeline supports `STRUDEL_URL` for local rendering (no remote dependency)
- [ ] Audio can be piped to Discord VC bridge (openclaw-discord-vc-bootstrap compatible)
- [ ] Latency < 10s from pattern evaluation to audible output
- [ ] Works in WSL2 (urudyne) and bare metal (elliott)
- [ ] Documented with working example end-to-end

## Architecture

```
Agent generates pattern.js
  → render-pattern.sh (headless Chromium + Strudel REPL)
    → WAV buffer (OfflineAudioContext)
      → ffmpeg -i input.wav -c:a libopus -b:a 128k -ar 48000 output.opus
        → Discord VC bridge audio input
          → Voice channel playback
```

## Phases

### Phase 1: Reliable headless rendering ← CURRENT
- Verify render-pattern.sh works on both hosts
- Add error handling and retry logic
- Support local Strudel REPL

### Phase 2: Audio conversion pipeline
- WAV → Opus conversion with proper sample rates
- PCM streaming for near-real-time playback
- Format detection and automatic conversion

### Phase 3: Discord VC integration
- Bridge compatibility layer (input: Opus file, output: voice stream)
- Mood transition support (crossfade between patterns)
- Queue management for continuous playback

### Phase 4: Near-real-time composition
- Pattern generation → render → stream in single pipeline
- Mood parameter input → automatic composition → live playback
- < 5s end-to-end latency for simple patterns

## References

- `references/integration-pipeline.md` — Architecture doc
- `openclaw-discord-vc-bootstrap/` — Bridge package in openclaw-bootstrap repo
- Strudel `renderPatternAudio()` — `packages/webaudio/webaudio.mjs`
