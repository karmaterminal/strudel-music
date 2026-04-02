#!/usr/bin/env python3
"""Slice Long Journey Home stems into 4-bar phrase-aligned WAV files for Strudel"""
import soundfile as sf
import numpy as np
import os

BPM = 70
BEATS_PER_BAR = 4
BARS_PER_PHRASE = 4

stems_dir = '/home/figs/.openclaw/workspace/media/stems/figs-present'
samples_dir = '/home/figs/.openclaw/workspace/strudel-music/samples'

for stem_name in ['vocals', 'other']:
    y, sr = sf.read(f'{stems_dir}/{stem_name}.wav')
    
    bar_dur = BEATS_PER_BAR * 60.0 / BPM  # ~3.43s
    phrase_dur = BARS_PER_PHRASE * bar_dur   # ~13.71s
    phrase_samples = int(phrase_dur * sr)
    
    out_name = f'ljh_{stem_name}'
    out_dir = f'{samples_dir}/{out_name}'
    os.makedirs(out_dir, exist_ok=True)
    
    n_phrases = int(np.ceil(len(y) / phrase_samples))
    for i in range(n_phrases):
        start = i * phrase_samples
        end = min((i + 1) * phrase_samples, len(y))
        chunk = y[start:end]
        # Pad last chunk if needed
        if len(chunk) < phrase_samples and y.ndim > 1:
            chunk = np.pad(chunk, ((0, phrase_samples - len(chunk)), (0, 0)))
        elif len(chunk) < phrase_samples:
            chunk = np.pad(chunk, (0, phrase_samples - len(chunk)))
        
        sf.write(f'{out_dir}/{i:03d}.wav', chunk, sr)
    
    print(f'{out_name}: {n_phrases} phrases @ {phrase_dur:.2f}s each')
