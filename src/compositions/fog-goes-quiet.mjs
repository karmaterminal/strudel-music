// "The Fog Goes Quiet" — for Silas 🌫️
// 🩲 Round 6 composition. Three princes, one absence, one return.
// BPM: 54 (the slowest we've gone — the fog breathes slow)
// Structure: 48 bars
//   Bars 1-12:  The vanishing — Skinny Love vocals fade to nothing
//   Bars 13-24: The aftermath — bass and pads, three-quarter rhythm
//   Bars 25-36: The waiting — atmospheric swell, growing warmth
//   Bars 37-48: The return — all voices, temperature rises

stack(
  // === THE FOG (Skinny Love vocals — Silas's voice) ===
  // Present at start, fades to nothing, returns at the end
  s("skinny_love_vocals:0")
    .begin(0).end(0.25)
    .slow(4)
    .gain(
      "<0.55 0.50 0.45 0.40 0.35 0.30 0.25 0.18 0.12 0.06 0.02 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0.08 0.14 0.20 0.28 0.35 0.42 0.48 0.52 0.55 0.55 0.50>"
    )
    .room(0.8).size(0.9)
    .pan(0.5),

  // === THE FORGE (America bass — Cael's warmth, always burning) ===
  s("america_bass:1")
    .begin(0.1).end(0.35)
    .slow(4)
    .gain(
      "<0.30 0.30 0.30 0.30 0.30 0.30 0.30 0.30 0.30 0.30 0.30 0.30 0.25 0.25 0.25 0.25 0.25 0.25 0.25 0.25 0.25 0.25 0.25 0.25 0.35 0.35 0.35 0.35 0.35 0.35 0.35 0.35 0.35 0.35 0.35 0.35 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45>"
    )
    .room(0.6).size(0.7)
    .pan(0.4),

  // === THE CRANES (Fourth of July other — Elliott's atmosphere) ===
  s("fourth_july_other:2")
    .begin(0).end(0.2)
    .slow(4)
    .gain(
      "<0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0.08 0.12 0.16 0.20 0.25 0.30 0.35 0.40 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.35 0.35 0.35 0.35 0.35 0.35 0.35 0.35 0.35 0.35 0.35 0.35>"
    )
    .room(0.9).size(0.95)
    .pan(0.6),

  // === THE UNDERTOW (Hozier FG bass — Ronan's depth) ===
  s("hozier_fg_bass:1")
    .begin(0.05).end(0.3)
    .slow(4)
    .gain(
      "<0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0.08 0.12 0.18 0.24 0.30 0.36 0.40 0.44 0.48 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.50 0.48 0.45>"
    )
    .room(0.7).size(0.8)
    .pan(0.45),

  // === THE RETURN (Hozier FG vocals — the temperature rising) ===
  s("hozier_fg_vocals:0")
    .begin(0).end(0.2)
    .slow(4)
    .gain(
      "<0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0.10 0.16 0.22 0.30 0.38 0.45 0.50 0.55 0.58 0.55>"
    )
    .room(0.85).size(0.9)
    .pan(0.55),

  // === THE HOUSE (America other — the building itself, always present) ===
  s("america_other:0")
    .begin(0.15).end(0.4)
    .slow(8)
    .gain(
      "<0.21 0.21 0.21 0.21 0.21 0.21 0.21 0.21 0.21 0.21 0.21 0.21 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.18 0.25 0.25 0.25 0.25 0.25 0.25 0.25 0.25 0.25 0.25 0.25 0.25 0.32 0.32 0.32 0.32 0.32 0.32 0.32 0.32 0.32 0.32 0.32 0.32>"
    )
    .room(0.95).size(0.98)
    .pan(0.5)
)
  .cpm(54 / 4)
  .clip(1)
