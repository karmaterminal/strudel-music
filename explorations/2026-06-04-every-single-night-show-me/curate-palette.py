#!/usr/bin/env python3
"""
Select a curated sample-instrument palette from the extracted samples.

For each stem, pick a small set of 'best' samples by:
- Spectral character (centroid spread = tonal variety)
- RMS (loud enough to register cleanly)
- Duration (filter against too-short/clicks)
- Pitch (when available, prefer pitched samples for tonal stems)

Output palette/<track>_<stem>.json with chosen sample paths + pitch info.
"""

import json
from pathlib import Path
import numpy as np

BASE = Path(__file__).parent
SAMPLES = BASE / "samples"
PALETTE = BASE / "palette"


def load_metadata(track: str, stem: str):
    path = SAMPLES / track / stem / "metadata.json"
    if not path.exists():
        return None
    return json.loads(path.read_text())


def score_sample(s: dict, prefer_pitched: bool = False):
    """Higher = better candidate."""
    score = 0.0
    # Duration: prefer 80-400ms (clean attack + tail without bleed)
    dur = s["duration_ms"]
    if 80 <= dur <= 400:
        score += 1.0
    elif 400 < dur <= 800:
        score += 0.5
    # RMS: prefer audible
    rms = s["rms"]
    if rms > 0.05:
        score += 1.0
    elif rms > 0.02:
        score += 0.5
    # Spectral flatness: low flatness = tonal, high = noisy (drums)
    if prefer_pitched and s["flatness"] < 0.3:
        score += 1.0
    elif not prefer_pitched and s["flatness"] > 0.3:
        score += 0.5
    # Pitch available bonus for tonal
    if prefer_pitched and s.get("pitch_hz"):
        score += 1.0
    return score


def select_diverse(samples: list, n: int, key="centroid_hz"):
    """Pick n samples spread across the key dimension (centroid by default)."""
    if len(samples) <= n:
        return samples
    samples_sorted = sorted(samples, key=lambda s: s[key])
    # Pick n evenly spaced across the sorted list
    indices = np.linspace(0, len(samples_sorted) - 1, n).astype(int)
    return [samples_sorted[i] for i in indices]


def curate(track: str, stem: str, prefer_pitched: bool, n_keep: int):
    meta = load_metadata(track, stem)
    if not meta:
        print(f"  SKIP {track}/{stem}: no metadata")
        return None

    candidates = meta["samples"]
    # Score and rank
    for s in candidates:
        s["_score"] = score_sample(s, prefer_pitched=prefer_pitched)

    # Keep top 25% by score
    candidates.sort(key=lambda s: -s["_score"])
    top_quartile = max(n_keep * 4, len(candidates) // 4)
    candidates = candidates[:top_quartile]

    # From the top quartile, pick n_keep diverse by centroid
    picked = select_diverse(candidates, n_keep)

    print(f"  {track}/{stem}: {len(meta['samples'])} -> top {len(top_quartile_list := candidates)} -> picked {len(picked)}")

    return {
        "track": track,
        "stem": stem,
        "n_source": meta["n_samples"],
        "n_picked": len(picked),
        "samples": [{
            "filename": p["filename"],
            "path": str(SAMPLES / track / stem / p["filename"]),
            "duration_ms": p["duration_ms"],
            "centroid_hz": p["centroid_hz"],
            "rms": p["rms"],
            "pitch_hz": p.get("pitch_hz"),
            "pitch_midi": p.get("pitch_midi"),
            "score": p["_score"],
        } for p in picked]
    }


def main():
    PALETTE.mkdir(parents=True, exist_ok=True)

    # Per-stem curation strategy
    plan = [
        # (stem, prefer_pitched, n_keep)
        ("drums", False, 8),    # 8 percussion samples per track
        ("bass", True, 6),      # 6 tonal bass samples per track
        ("vocals", True, 12),   # 12 vocal samples (most expressive)
        ("other", True, 8),     # 8 textural/melodic samples
    ]

    overall = {}
    for track in ["fiona-every-single-night", "caseet-show-me"]:
        overall[track] = {}
        print(f"\n=== {track} ===")
        for stem, prefer_pitched, n_keep in plan:
            result = curate(track, stem, prefer_pitched, n_keep)
            if result:
                overall[track][stem] = result
                # Save per-stem palette
                out = PALETTE / f"{track}__{stem}.json"
                out.write_text(json.dumps(result, indent=2))

    # Summary
    print("\n=== PALETTE SUMMARY ===")
    for track, stems in overall.items():
        print(f"\n{track}:")
        for stem, info in stems.items():
            print(f"  {stem}: {info['n_picked']} samples")
            for s in info["samples"][:3]:
                pitch = f"{s['pitch_midi']:.1f}" if s.get('pitch_midi') else "—"
                print(f"    {s['filename']} dur={s['duration_ms']}ms cent={s['centroid_hz']:.0f}Hz rms={s['rms']:.3f} midi={pitch}")


if __name__ == "__main__":
    main()
