#!/usr/bin/env python3
"""Earth stops spinning: assemble Comfy clips (clips/) + voice.mp3 into earth-stops-spinning.mp4.
Times come from the pauses in voice.mp3 (silencedetect). Run from this folder; needs ffmpeg + numpy."""
import subprocess, wave, numpy as np, os
W, H, FPS, T = 1080, 1920, 30, 58.6
FONT = '/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf'
# (start, end, clip, clip offset, hflip)
SEG = [(0, 3.03, 1, 0, 0), (3.03, 9.51, 2, 0, 0), (9.51, 15.38, 3, 0, 0), (15.38, 21.80, 1, 0, 0),
       (21.80, 24.86, 4, 0, 0), (24.86, 30.11, 5, 0, 0), (30.11, 36.74, 6, 0, 0), (36.74, 40.31, 5, 1.5, 1),
       (40.31, 46.17, 7, 0, 0), (46.17, 49.96, 8, 0, 0), (49.96, 55.56, 9, 0, 0), (55.56, T, 8, 1.0, 1)]
CAPS = [(0.2, 3.0, 'What if Earth\nstopped spinning?'), (11.2, 15.3, '~1,000 km/h'), (22.4, 24.8, 'STOP'),
        (26.4, 32.3, 'Wind: 1,000 km/h'), (43.0, 46.1, 'Oceans keep moving'), (49.9, 53.2, '1 day = 1 year'),
        (52.0, 55.5, '6 months day\n6 months night'), (55.6, T, 'Where would\nyou hide?')]
os.makedirs('build', exist_ok=True)
run = lambda *a: subprocess.run(a, check=True)
parts = []
for i, (s, e, c, off, flip) in enumerate(SEG):
    d, avail = e - s, 5.04 - off
    k = max(1.0, d / avail)                       # slow down if the clip is too short
    zoom = f"scale={W*1.12:.0f}:-2:flags=lanczos,crop={W}:{H}:(iw-{W})/2+{(-1)**i}*t*6:(ih-{H})/2"
    vf = f"trim=start={off},setpts=(PTS-STARTPTS)*{k:.4f},fps={FPS},{'hflip,' if flip else ''}{zoom},trim=duration={d:.3f},setsar=1"
    out = f'build/p{i:02d}.mp4'
    run('ffmpeg', '-v', 'error', '-y', '-i', f'clips/scene{c:02d}.mp4', '-vf', vf, '-an', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', out)
    parts.append(out)
open('build/list.txt', 'w').write(''.join(f"file '{os.path.basename(p)}'\n" for p in parts))
run('ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'build/list.txt', '-c', 'copy', 'build/video.mp4')

# --- sound: voice + drone + rumble at the stop + wind + waves + whooshes on cuts
sr = 48000; n = int(T * sr); tn = np.arange(n) / sr; rng = np.random.default_rng(3)
def lp(x, a):
    from scipy.signal import lfilter
    return lfilter([a], [1, a - 1], x)
env = lambda t0, t1, a=0.5: np.clip((tn - t0) / a, 0, 1) * np.clip((t1 - tn) / a, 0, 1)
L = np.zeros(n); R = np.zeros(n)
def add(sig, t, g=1.0):
    i = int(t * sr); j = min(n, i + len(sig)); L[i:j] += sig[:j - i] * g; R[i:j] += sig[:j - i] * g
drone = sum(g * np.sin(2 * np.pi * f * tn) for f, g in [(55, 1), (55.4, .7), (82.4, .4), (110, .2)])
L += drone * env(0, T, 2) * (0.03 + 0.04 * np.clip((tn - 15) / 8, 0, 1)); R += drone * env(0, T, 2) * (0.03 + 0.04 * np.clip((tn - 15) / 8, 0, 1))
birds = np.zeros(n)
for t in rng.uniform(3.2, 21, 25):
    m = int(.12 * sr); mt = np.arange(m) / sr; f = 3000 + 900 * np.sin(2 * np.pi * 18 * mt)
    add(np.sin(2 * np.pi * np.cumsum(f) / sr) * np.sin(np.pi * mt / .12) ** 2 * .02, t)
h = int(2.5 * sr); ht = np.arange(h) / sr
add((np.sin(2 * np.pi * (40 * np.exp(-ht * 1.5) + 25) * ht) * np.exp(-ht * 1.6) + lp(rng.standard_normal(h), .05) * 2 * np.exp(-ht * 2)) * .7, 22.35)
wind = lp(rng.standard_normal(n), .02) * 6 * (1 + .4 * np.sin(tn * 1.7)) * env(24.6, 41, 1.2) * (.35 + .25 * np.clip((tn - 26) / 6, 0, 1))
L += wind; R += np.roll(wind, 3000)
waves = lp(rng.standard_normal(n), .008) * 9 * env(40.1, 47, 1.5) * (.5 + .3 * np.sin(tn * .9)); L += waves; R += np.roll(waves, 5000)
for s, *_ in SEG[1:]:
    q = int(.6 * sr); qt = np.arange(q) / sr; add(lp(rng.standard_normal(q), .08) * np.sin(np.pi * qt / .6) ** 2 * .25, s - .3)
v = np.frombuffer(subprocess.check_output(['ffmpeg', '-v', 'error', '-i', 'voice.mp3', '-f', 'f32le', '-ac', '1', '-ar', str(sr), '-']), np.float32).astype(float)
v /= np.abs(v).max(); add(v, 0, 1.0)
fade = np.clip(tn / .1, 0, 1) * np.clip((T - tn) / 1.2, 0, 1); st = np.stack([L, R], 1) * fade[:, None]; st /= np.abs(st).max() * 1.12
with wave.open('build/mix.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((st * 32767).astype('<i2').tobytes())

# --- captions
dt = []
for k, (a, b, txt) in enumerate(CAPS):
    open(f'build/cap{k}.txt', 'w').write(txt)
    big = txt in ('STOP',)
    dt.append(f"drawtext=fontfile={FONT}:textfile=build/cap{k}.txt:fontsize={150 if big else 82}:fontcolor=white:borderw=7:bordercolor=black@0.85"
              f":line_spacing=12:text_align=C:x=(w-text_w)/2:y=h*0.18:enable='between(t,{a},{b})':alpha='min(1,min((t-{a})/0.25,({b}-t)/0.25))'")
run('ffmpeg', '-v', 'error', '-y', '-i', 'build/video.mp4', '-i', 'build/mix.wav', '-vf', ','.join(dt),
    '-c:v', 'libx264', '-crf', '19', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart',
    'earth-stops-spinning.mp4')
print('ok')
