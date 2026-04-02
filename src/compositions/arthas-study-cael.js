// ════════════════════════════════════════════════════════════════════════════
// ARTHAS, MY SON — STUDY (Strudel)
// Cael 🩸 / 2026-02-27
//
// Target: weighty orchestral lament (strings/choir/low brass) using only
// oscillator synthesis in the headless Strudel chunk renderer.
//
// Reference stats (track analysis): ~99 BPM, tonal center strongly F# with
// B-major / F#-mixolydian color (E natural as b7 of F#).
//
// Form (48 cycles @ 99 BPM ≈ 1:56)
//   [A] GATHERING   00–07  (8)   Drone + distant choir (pp)
//   [B] ASCENT      08–19  (12)  Harmony thickens, pulse begins
//   [C] WEIGHT      20–39  (20)  Full texture, sustained gravity
//   [D] REQUIEM     40–47  (8)   Return to B, dissolve
//
// 1 cycle = 1 bar = 4 beats
// cps = bpm / 60 / 4
// ════════════════════════════════════════════════════════════════════════════

setcps(99 / 60 / 4)

// Harmonic spine: B major with dominant-function F#7 (mixolydian b7 color)
// Slow harmonic rhythm: 2 bars per chord
const PROG = chord("<B^7 D#m7 E^7 F#7>").slow(2)

stack(

  // ═══════════════ LOW DRONE — sub string / low brass bed ════════════════
  // Sawtooth gives weight; slow retriggering avoids "bassline" feeling.
  arrange(
    [8,  note("F#1").slow(8)
      .s("saw").pan(0.45)
      .attack(2.8).decay(0.2).sustain(0.95).release(3.2)
      .gain("<0.020 0.022 0.024 0.026 0.028 0.030 0.032 0.034>")
    ],
    [12, note("<F#1 B1>").slow(6)
      .s("saw").pan(0.45)
      .attack(2.2).decay(0.2).sustain(0.92).release(2.8)
      .gain("<0.032 0.034 0.036 0.038 0.040 0.042 0.044 0.046 0.048 0.050 0.050 0.048>")
    ],
    [20, note("<F#1 F#1 B1 F#1>").slow(8)
      .s("saw").pan(0.45)
      .attack(1.8).decay(0.2).sustain(0.90).release(2.6)
      .gain("<0.050 0.052 0.054 0.056 0.058 0.060 0.060 0.060 0.060 0.060 0.060 0.060 0.058 0.056 0.054 0.052 0.050 0.048 0.046 0.044>")
    ],
    [8,  note("B1").slow(8)
      .s("saw").pan(0.45)
      .attack(3.2).decay(0.2).sustain(0.92).release(4.0)
      .gain("<0.040 0.036 0.032 0.028 0.024 0.020 0.016 0.012>")
    ]
  ),

  // ═══════════════ CHOIR PAD — triangle voicings ═════════════════════════
  // chord().anchor().voicing(): anchor pushes voicings down for gravity.
  arrange(
    [8,  PROG
      .anchor("D4")
      .voicing()
      .s("triangle")
      .attack(1.4).decay(0.4).sustain(0.85).release(2.2)
      .pan("<0.35 0.65>")
      .gain("<0.040 0.042 0.044 0.046 0.048 0.050 0.052 0.054>")
    ],
    [12, PROG
      .anchor("C4")
      .voicing()
      .s("triangle")
      .attack(1.0).decay(0.3).sustain(0.82).release(1.8)
      .pan("<0.30 0.70>")
      .gain("<0.055 0.058 0.060 0.062 0.064 0.066 0.068 0.070 0.070 0.068 0.066 0.064>")
    ],
    [20, PROG
      .anchor("C4")
      .voicing()
      .s("triangle")
      .attack(0.8).decay(0.25).sustain(0.80).release(1.6)
      .pan("<0.28 0.72>")
      .gain("<0.070 0.072 0.074 0.076 0.078 0.080 0.080 0.080 0.080 0.080 0.080 0.080 0.078 0.076 0.074 0.072 0.070 0.068 0.066 0.064>")
    ],
    [8,  chord("B^7").slow(2)
      .anchor("D4")
      .voicing()
      .s("triangle")
      .attack(1.8).decay(0.4).sustain(0.88).release(3.0)
      .pan("<0.35 0.65>")
      .gain("<0.060 0.056 0.052 0.048 0.044 0.040 0.034 0.028>")
    ]
  ),

  // ═══════════════ LOW STRINGS — sawtooth chord body ═════════════════════
  // Adds grit + mass under the triangle choir.
  arrange(
    [8,  PROG
      .anchor("A3")
      .voicing()
      .s("saw")
      .attack(0.9).decay(0.2).sustain(0.75).release(1.6)
      .pan("<0.42 0.58>")
      .gain("<0.000 0.000 0.030 0.032 0.034 0.036 0.038 0.040>")
    ],
    [12, PROG
      .anchor("G3")
      .voicing()
      .s("saw")
      .attack(0.6).decay(0.2).sustain(0.72).release(1.2)
      .pan("<0.40 0.60>")
      .gain("<0.040 0.042 0.044 0.046 0.048 0.050 0.052 0.054 0.056 0.058 0.058 0.056>")
    ],
    [20, PROG
      .anchor("G3")
      .voicing()
      .s("saw")
      .attack(0.5).decay(0.18).sustain(0.70).release(1.0)
      .pan("<0.38 0.62>")
      .gain("<0.058 0.060 0.062 0.064 0.066 0.068 0.068 0.068 0.068 0.068 0.068 0.066 0.064 0.062 0.060 0.058 0.056 0.054 0.052 0.050>")
    ],
    [8,  chord("<E^7 B^7>").slow(2)
      .anchor("A3")
      .voicing()
      .s("saw")
      .attack(0.9).decay(0.2).sustain(0.72).release(1.8)
      .pan("<0.40 0.60>")
      .gain("<0.048 0.044 0.040 0.036 0.032 0.028 0.022 0.016>")
    ]
  ),

  // ═══════════════ PULSE — muted timp/heart-beat (square) ════════════════
  // Starts subtle, becomes a grim march, then disappears.
  arrange(
    [8,  note("~").s("square").gain(0)],
    [12, note("F#2").s("square")
      .attack(0.005).decay(0.04).sustain(0.0).release(0.10)
      .gain("<0.000 0.000 0.010 0.012 0.014 0.016 0.018 0.020 0.020 0.018 0.016 0.014>")
      .pan(0.50)
      .fast(4)
    ],
    [20, note("<F#2 F#2 B1 F#2>").s("square")
      .attack(0.005).decay(0.05).sustain(0.0).release(0.12)
      .gain(0.020)
      .pan(0.50)
      .fast(4)
    ],
    [8,  note("~").s("square").gain(0)]
  ),

  // ═══════════════ MELODY — sine line (lament fragments) ═════════════════
  arrange(
    [8,  note("~").s("sine").gain(0)],

    // hesitant entrance: small falling shapes over the harmony
    [12, note("<~ ~ F#4 E4 D#4 B3 C#4 D#4 E4 F#4 ~ ~>")
      .s("sine")
      .attack(0.10).decay(0.15).sustain(0.55).release(0.35)
      .pan("<0.55 0.45>")
      .gain("<0.000 0.000 0.020 0.022 0.024 0.026 0.028 0.030 0.032 0.034 0.030 0.026>")
    ],

    // sustained grief: stepwise, with the F#7 implied by E-natural motion
    [20, note("<F#4 E4 D#4 C#4 B3 D#4 E4 F#4  E4 D#4 C#4 B3>")
      .s("sine")
      .attack(0.08).decay(0.12).sustain(0.55).release(0.30)
      .pan("<0.60 0.40>")
      .gain("<0.034 0.034 0.036 0.036 0.038 0.038 0.040 0.040 0.040 0.038 0.036 0.034>")
      .slow(1)
    ],

    // requiem: resolve upward then fade
    [8,  note("<D#4 E4 F#4 B4 A#4 F#4 E4 D#4>")
      .s("sine")
      .attack(0.12).decay(0.18).sustain(0.50).release(0.50)
      .pan("<0.58 0.42>")
      .gain("<0.030 0.028 0.026 0.024 0.020 0.016 0.012 0.008>")
    ]
  )

)
