#!/usr/bin/env python3
"""Mosasaurus: synthesized music (build/music.wav, ducked under the voice) and ambience/SFX (build/amb.wav).
Free, numpy only. Scene times match scenes.py."""
import numpy as np, subprocess, wave
from scenes import SC, T, BANG
sr = 48000; n = int(T * sr); tn = np.arange(n) / sr; rng = np.random.default_rng(4)
CUT = 18.85                       # everything goes silent before "Then."
END = 68.7                        # final sting after "Would you still go swimming?"
def band(m, lo, hi):              # band-limited noise via FFT
    s = np.fft.rfft(rng.standard_normal(m)); f = np.fft.rfftfreq(m, 1 / sr)
    s *= ((f > lo) & (f < hi)) / np.maximum(1, f / max(hi, 1)) ** 0.5
    x = np.fft.irfft(s, m); return x / (np.abs(x).max() + 1e-9)
env = lambda t0, t1, a=0.5, b=None: np.clip((tn - t0) / a, 0, 1) * np.clip((t1 - tn) / (b or a), 0, 1)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
class Bus:
    def __init__(s): s.L = np.zeros(n); s.R = np.zeros(n)
    def add(s, sig, t, g=1.0, pan=0.0):
        i = int(t * sr)
        if i >= n: return
        j = min(n, i + len(sig)); x = sig[:j - i] * g; s.L[i:j] += x * (1 - max(0, pan)); s.R[i:j] += x * (1 + min(0, pan))
    def bed(s, sig, g, shift=0): s.L += sig * g; s.R += np.roll(sig, shift) * g
def tone(f, d, dec=4.0, parts=((1, 1),), att=0.005):
    m = int(d * sr); t = np.arange(m) / sr
    x = sum(a * np.sin(2 * np.pi * f * k * t) for k, a in parts)
    return x * np.exp(-t * dec) * np.clip(t / att, 0, 1)
def pad(fs, d, att=0.8, rel=1.0):
    m = int(d * sr); t = np.arange(m) / sr
    x = sum(sum(np.sin(2 * np.pi * f * k * (1 + dt) * t + k) / k ** 1.6 for k in range(1, 6)) for f in fs for dt in (-0.003, 0.003))
    return x / len(fs) * np.clip(t / att, 0, 1) * np.clip((d - t) / rel, 0, 1)
def kick(d=0.6, f0=110, f1=40, dec=6):
    m = int(d * sr); t = np.arange(m) / sr; ph = 2 * np.pi * np.cumsum(f1 + (f0 - f1) * np.exp(-t * 25)) / sr
    return np.sin(ph) * np.exp(-t * dec)

# ---------------- music
mu = Bus(); B = 60 / 96
# 0-5: dark opening — boom + low drone + shimmer
mu.add(kick(3.0, 90, 30, 1.2), 0.0, 0.9)
mu.bed(sum(np.sin(2 * np.pi * f * tn) for f in (36.7, 36.9, 55.0)) * env(0, 5.3, 0.3, 0.8), 0.14)
mu.bed(band(n, 3000, 7000) * env(0.5, 5.2, 2, 0.6), 0.02, 900)
# 5.0-14.5: warm summer groove in D major
CH = [(62, 66, 69), (59, 62, 66), (55, 59, 62), (57, 61, 64)]
t0 = 5.0
for b in range(4):
    ts = t0 + b * 4 * B * 0.98
    if ts > 14.3: break
    c = CH[b % 4]; mu.add(pad([hz(m) for m in c], 4 * B + 0.8, 0.4, 0.8), ts, 0.10)
    mu.add(tone(hz(c[0] - 24), 4 * B, 1.0, ((1, 1), (2, .3))), ts, 0.22)
    for k in range(8):
        tt = ts + k * B / 2
        if tt < 14.4: mu.add(tone(hz(c[k % 3] + 12 * (k % 2)), 0.5, 7, ((1, 1), (2, .25), (3, .1))), tt, 0.10, (-.4, .4)[k % 2])
        if tt < 14.4: mu.add(band(int(.05 * sr), 6000, 12000) * np.exp(-np.arange(int(.05 * sr)) / sr * 60), tt + B / 4, 0.05)
# 14.5-18.85: tension — drone, riser, heartbeat speeding up
dr = sum(np.sin(2 * np.pi * f * tn + np.sin(tn * .7 * k)) for k, f in enumerate((36.7, 37.1, 51.9, 73.4)))
mu.bed(dr * env(14.4, CUT, 1.5, 0.05) * np.clip((tn - 14.4) / 4.4, 0.2, 1), 0.10)
mu.bed(band(n, 400, 5000) * env(15.5, CUT, 3.3, 0.03) * np.clip((tn - 15.5) / 3.3, 0, 1) ** 3, 0.10, 1500)
t = 15.0
while t < CUT - 0.2:
    mu.add(kick(.3, 70, 40, 14), t, 0.5); mu.add(kick(.3, 65, 38, 14), t + .2, 0.3); t += 60 / (70 + 45 * (t - 15) / 3.8)
# BANG at 20.0
mu.add(kick(3.5, 120, 28, 1.0), BANG, 1.0)
mu.add(band(int(3 * sr), 30, 9000) * np.exp(-np.arange(int(3 * sr)) / sr * 2.2), BANG, 0.5)
# 20.0-46.6: dark epic in D minor — bass ostinato, toms, pad
CM = [(62, 65, 69), (58, 62, 65), (55, 58, 62), (57, 61, 64)]
t, b = BANG + 0.6, 0
while t < 46.4:
    c = CM[b % 4]; mu.add(pad([hz(m - 12) for m in c] + [hz(c[0])], 4 * B + 0.6, 0.6, 0.6), t, 0.10)
    for k in range(8):
        tt = t + k * B / 2
        if tt < 46.5: mu.add(tone(hz(c[0] - 24 + (12 if k in (3, 7) else 0)), 0.3, 9, ((1, 1), (2, .5), (3, .25))), tt, 0.22)
    for k in (0, 2, 2.5): mu.add(kick(.8, 95, 45, 5), t + k * B, 0.45 if k == 0 else 0.3)
    if b % 2: mu.add(band(int(.4 * sr), 200, 3000) * np.exp(-np.arange(int(.4 * sr)) / sr * 10), t + 3 * B, 0.12)
    t += 4 * B; b += 1
mu.add(kick(2.5, 100, 30, 1.6), 46.6, 0.8)
# 47.7-62.3: "But…" — mysterious, soft pad + music-box bells
for k, c in enumerate([(50, 57, 64, 65), (46, 53, 62, 69), (43, 50, 58, 65), (45, 52, 61, 64)]):
    mu.add(pad([hz(m) for m in c], 4.2, 1.2, 1.4), 47.7 + k * 3.7, 0.08)
for k, m in enumerate([74, 77, 81, 79, 77, 74, 76, 73, 74, 69, 72, 74, 77, 76, 74, 72]):
    mu.add(tone(hz(m), 2.0, 2.2, ((1, 1), (2.76, .3), (5.4, .1))), 48.2 + k * 0.9, 0.06, (k % 3 - 1) * .3)
# 62.6-end: tension returns, heartbeat, final sting
mu.bed(dr * env(62.4, T, 2.0, 1.0) * np.clip((tn - 62.4) / 6, 0.2, 1), 0.08)
t = 63.0
while t < END - 0.3:
    mu.add(kick(.3, 70, 40, 14), t, 0.45); mu.add(kick(.3, 65, 38, 14), t + .2, 0.27); t += 0.85
mu.add(kick(3.0, 110, 28, 1.2), END, 1.0)
mu.add(pad([hz(m) for m in (62, 63, 68, 74)], 1.6, 0.01, 1.4), END, 0.12)
# duck the music under the voice
v = np.frombuffer(subprocess.check_output(['ffmpeg', '-v', 'error', '-i', 'voice.mp3', '-f', 'f32le', '-ac', '1', '-ar', str(sr), '-']), np.float32).astype(float)[:n]
ve = np.convolve(np.abs(np.pad(v, (0, n - len(v)))), np.ones(sr // 5) / (sr // 5), 'same'); ve /= ve.max()
duck = 1 - 0.45 * np.clip(ve * 6, 0, 1)
mu.L *= duck; mu.R *= duck

# ---------------- ambience + SFX
am = Bus()
def spans(effs):
    out = []
    for i, s in enumerate(SC):
        e = SC[i + 1][0] if i + 1 < len(SC) else T
        if s[3] in effs: out.append((s[0], min(e, CUT) if s[0] < CUT else e))
    return out
uw = band(n, 40, 500)
for a, b in spans({'water'}):
    am.bed(uw * env(a, b, 0.4), 0.35, 700)
    for t in rng.uniform(a, b, int((b - a) * 4)):                               # bubbles
        m = int(.05 * sr); tt = np.arange(m) / sr; f = rng.uniform(500, 900) * (1 + 6 * tt)
        am.add(np.sin(2 * np.pi * np.cumsum(f) / sr) * np.sin(np.pi * tt / .05), t, .03, rng.uniform(-.7, .7))
surf = band(n, 150, 4000) * (0.35 + 0.65 * np.sin(np.pi * ((tn / 5.5) % 1)) ** 4)
lap = band(n, 300, 2500) * (0.4 + 0.6 * np.sin(np.pi * ((tn / 2.2) % 1)) ** 2)
for a, b in spans({'sun'}):
    am.bed(surf * env(a, b, 0.4), 0.16, 2000)
    for t in np.arange(a + .4, b - .6, 1.7):                                    # seagulls
        for r in range(rng.integers(1, 3)):
            m = int(.32 * sr); tt = np.arange(m) / sr; f = 2100 - 1100 * tt / .32 + 120 * np.sin(2 * np.pi * 9 * tt)
            am.add(np.sin(2 * np.pi * np.cumsum(f) / sr) * np.sin(np.pi * tt / .32) ** 2 * (1 + .4 * np.sin(2 * np.pi * 2 * f / sr)), t + r * .38 + rng.uniform(0, .3), .035, rng.uniform(-.8, .8))
    am.bed(band(n, 300, 1800) * env(a, b, 0.4) * (1 + .5 * np.sin(tn * 3)), 0.025, 400)   # distant beach crowd
for a, b in spans({'bob'}):
    am.bed(lap * env(a, b, 0.4), 0.13, 1200)
# splash at the bang + droplets
am.add(band(int(2.2 * sr), 200, 12000) * np.exp(-np.arange(int(2.2 * sr)) / sr * 2.0), BANG, 0.6)
for t in rng.uniform(BANG + .3, BANG + 1.9, 40):
    m = int(.03 * sr); tt = np.arange(m) / sr; am.add(np.sin(2 * np.pi * rng.uniform(900, 2500) * tt) * np.exp(-tt * 120), t, .05, rng.uniform(-.8, .8))
am.add(band(int(1.0 * sr), 250, 1800) * np.sin(np.pi * np.arange(int(1.0 * sr)) / sr) ** 2, 33.6, 0.18)   # breath at the surface
# cave: drips + pick clinks
for t in np.arange(48.0, 55.0, 0.9) + rng.uniform(0, .3, 8):
    m = int(.08 * sr); tt = np.arange(m) / sr; d = np.sin(2 * np.pi * np.cumsum(1200 + 9000 * tt) / sr) * np.exp(-tt * 50)
    for e in range(4): am.add(d, t + e * .11, .07 * .45 ** e, (-.3, .3)[e % 2])
for t in np.arange(48.4, 55.0, 1.4):
    am.add(tone(2650, .5, 14, ((1, 1), (1.53, .6), (2.4, .3))) + band(int(.5 * sr), 1500, 8000) * np.exp(-np.arange(int(.5 * sr)) / sr * 40), t, .06, -.3)
am.bed(band(n, 60, 300) * env(47.7, 55.4, 0.4), 0.06)
# street: hooves + cart creak
for t in np.arange(55.6, 60.2, 0.42):
    for e in (0, .11): am.add(band(int(.06 * sr), 300, 3000) * np.exp(-np.arange(int(.06 * sr)) / sr * 80), t + e, .14)
for t in (56.2, 57.9, 59.4):
    m = int(.6 * sr); tt = np.arange(m) / sr; am.add(np.sign(np.sin(2 * np.pi * (260 + 60 * np.sin(tt * 9)) * tt)) * np.sin(np.pi * tt / .6) ** 2, t, .012, .4)
# museum: room tone + footsteps
am.bed(band(n, 80, 1500) * env(60.3, 62.6, 0.3), 0.04)
for t in np.arange(60.5, 62.5, 0.55):
    for e in range(3): am.add(band(int(.05 * sr), 400, 4000) * np.exp(-np.arange(int(.05 * sr)) / sr * 90), t + e * .09, .08 * .4 ** e)
# whoosh into every cut (not into the bang, not into the silence)
for s in SC[1:]:
    if s[0] in (BANG,): continue
    m = int(.7 * sr); tt = np.arange(m) / sr; am.add(band(m, 300, 5000) * np.sin(np.pi * tt / .7) ** 3, s[0] - .45, .12)
# silence before "Then." for everything
gate = np.where((tn > CUT) & (tn < BANG), 0.0, 1.0); gate = np.convolve(gate, np.ones(480) / 480, 'same')
for bus in (mu, am): bus.L *= gate; bus.R *= gate

def save(bus, path, peak):
    st = np.stack([bus.L, bus.R], 1); st *= peak / np.abs(st).max()
    st *= (np.clip(tn / .05, 0, 1) * np.clip((T - tn) / 1.0, 0, 1))[:, None]
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((st * 32767).astype('<i2').tobytes())
save(mu, 'build/music.wav', 0.9); save(am, 'build/amb.wav', 0.9); print('sound ok')
