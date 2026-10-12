#!/usr/bin/env python3
"""Mosasaurus: render one clip per scene (stills or Comfy clips + slow camera motion + effects + captions) into build/.
Free (OpenCV/PIL/ffmpeg). If clips/<still>.mp4 exists (Comfy), it is used instead of the still. Run from this folder."""
import cv2, numpy as np, subprocess, math, os, sys
from PIL import Image, ImageDraw, ImageFont
W, H, FPS = 1080, 1920, 30
FB = '/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf'
FS = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
# voice lines (start, end, text) from voice-times.tsv; all scene times follow the voice
LINES = []
for r in open('voice-times.tsv').read().splitlines()[1:]:
    c = r.split('\t'); ts = lambda s: sum(float(x) * m for x, m in zip(s.split(':')[::-1], (1, 60, 3600)))
    LINES.append((ts(c[1]), ts(c[2]), c[4]))
st = lambda k: max(0.0, LINES[k - 1][0] - 0.2)         # cut just before voice line k (1-based)
BANG = st(12)                                          # flash + bang right before "The surface explodes."
CUT = LINES[10][0] - 0.05                              # silence starts just before "Then."
END = LINES[-1][1] + 0.1                               # final sting after the last line
T = END + 1.5
# (start, still, motion, effect, label, number) -> Alteraqon lower-third top-left (gold line, spaced label, big thin number)
SC = [(0.0, 'm01', 'in', 'water', None, None),
      (st(3), 'm03', 'up', 'sun', None, None),
      (st(7), 'm07', 'in', 'bob', None, None),
      (st(9), 'm09', 'in', 'water', None, None),
      (BANG, 'm12', 'out', 'shake', None, None),
      (st(13), 'm13', 'right', 'sun', 'MAXIMUM LENGTH', '15 m'),
      (st(14), 'm14', 'in', 'water', 'ROWS OF TEETH', '2'),
      (st(15), 'm15', 'in', 'water', None, None),
      (st(17), 'm17', 'up', 'bob', None, None),
      (st(19), 'm19', 'left', 'water', None, None),
      (st(22), 'm22', 'in', 'dust', 'FIRST FOUND NEAR', 'Maastricht'),
      (st(24), 'm24', 'right', 'dust', 'TAKEN AS WAR LOOT', '1795'),
      (st(25), 'm25', 'in', 'dust', None, None),
      (st(26), 'm07', 'out', 'bob', None, None),
      (st(28), 'm09', 'in', 'water', None, None)]
S = {i: s[0] for i, s in enumerate(SC)}
_fc = {}
def font(p, s):
    if (p, s) not in _fc: _fc[p, s] = ImageFont.truetype(p, s)
    return _fc[p, s]
def wrap(d, txt, f, maxw):
    out, cur = [], ''
    for w in txt.split():
        if cur and d.textlength(cur + ' ' + w, font=f) > maxw: out.append(cur); cur = w
        else: cur = (cur + ' ' + w).strip()
    return out + [cur]
def overlay_text(blocks):
    """blocks: (text, y, fontpath, size, colour, stroke) -> premultiplied BGR + alpha arrays."""
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for txt, y, fp, sz, col, st in blocks:
        f = font(fp, sz)
        for ln in wrap(d, txt, f, W - 140):
            w = d.textlength(ln, font=f)
            d.text(((W - w) / 2, y), ln, font=f, fill=col + (255,), stroke_width=st, stroke_fill=(0, 0, 0, 230)); y += int(sz * 1.2)
    a = np.asarray(im).astype(np.float32); al = a[..., 3:] / 255
    return a[..., 2::-1] * al, al
CAP = [overlay_text([(t.replace('"', '“', 1).replace('"', '”'), int(H * 0.70), FS, 62, (255, 255, 255), 6)]) for *_, t in LINES]
def caption_at(t):
    for k, (a, b, _) in enumerate(LINES):
        nxt = LINES[k + 1][0] if k + 1 < len(LINES) else T
        if a - 0.05 <= t < min(b + 0.45, nxt - 0.05): return k
    return None
FL = '/usr/share/fonts/opentype/inter/InterDisplay-Light.otf'
LX, LY = 84, 96
def lt_layer(draw_fn):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im); draw_fn(d)
    sh = np.asarray(im)[..., 3].astype(np.float32) / 255                       # soft shadow for readability
    sh = cv2.GaussianBlur(sh, (0, 0), 6)[..., None] * 0.55
    a = np.asarray(im).astype(np.float32); al = a[..., 3:] / 255
    return a[..., 2::-1] * al, al, sh
def lower_third(label, num):
    def lab(d):
        x = LX
        for ch in label: d.text((x, LY + 26), ch, font=font(FS, 30), fill=(222, 190, 130, 255)); x += d.textlength(ch, font=font(FS, 30)) + 8
    def nm(d): d.text((LX - 4, LY + 62), num, font=font(FL, 112), fill=(255, 255, 255, 255))
    return lt_layer(lab), lt_layer(nm)
LAB = {i: lower_third(s[4], s[5]) for i, s in enumerate(SC) if s[4]}
LT_ON = 2.6
_gy, _gx = np.mgrid[0:H, 0:W].astype(np.float32)
SHADE = (np.exp(-(((_gx - 260) / 520) ** 2 + ((_gy - 160) / 260) ** 2)) * 0.45)[..., None]   # soft dark patch behind the label
def draw_lt(fr, i, t):
    a_out = ss((0.3 + LT_ON + 0.35 - t) / 0.35)
    if a_out <= 0: return fr
    fr = fr * (1 - SHADE * a_out * ss((t - 0.2) / 0.4))
    w = int(280 * ss((t - 0.3) / 0.45))                                          # gold line slides in
    if w > 0: fr[LY:LY + 4, LX:LX + w] = fr[LY:LY + 4, LX:LX + w] * (1 - a_out) + np.array([130, 190, 222], np.float32) * a_out
    for k, (pre, al, sh) in enumerate(LAB[i]):
        a = ss((t - 0.45 - 0.15 * k) / 0.4) * a_out
        if a <= 0: continue
        dy = int(14 * (1 - ss((t - 0.45 - 0.15 * k) / 0.4)))
        if dy: pre, al, sh = (np.roll(x, dy, 0) for x in (pre, al, sh))
        fr = fr * (1 - sh * a); fr = fr * (1 - al * a) + pre * a
    return fr

def cover(img):
    ih, iw = img.shape[:2]; s = max(W / iw, H / ih)
    r = cv2.resize(img, (int(iw * s + .5), int(ih * s + .5)), interpolation=cv2.INTER_CUBIC)
    y, x = (r.shape[0] - H) // 2, (r.shape[1] - W) // 2; return r[y:y + H, x:x + W].astype(np.float32)
def clip_frames(path):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}',
                          '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], stdout=subprocess.PIPE)
    fr = []
    while (b := p.stdout.read(W * H * 3)) and len(b) == W * H * 3: fr.append(np.frombuffer(b, np.uint8).reshape(H, W, 3))
    return fr
ss = lambda x: (lambda c: c * c * (3 - 2 * c))(min(1, max(0, x)))
rng = np.random.default_rng(11)
PART = rng.uniform(0, 1, (90, 4))
yy, xx = np.mgrid[0:H // 8, 0:W // 8].astype(np.float32)

def frame(img, t, d, motion, eff, i):
    u = t / d
    z = 1.06 + 0.10 * u if motion == 'in' else 1.16 - 0.10 * u if motion == 'out' else 1.12
    ox = {'left': 1, 'right': -1}.get(motion, 0) * (u - .5) * 70
    oy = (u - .5) * 70 if motion == 'up' else 0
    rot = 0
    if eff == 'bob': oy += 9 * math.sin(t * 1.3); rot = 0.5 * math.sin(t * 0.9)
    if eff == 'shake':
        a = 34 * max(0, 1 - t / 1.4) + 4; ox += a * math.sin(t * 57); oy += a * math.sin(t * 43 + 1); z += 0.05 * max(0, 1 - t / 0.5)
    M = cv2.getRotationMatrix2D((W / 2 - ox, H / 2 - oy), rot, z)
    fr = cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT).astype(np.float32)
    if eff == 'water':   # moving caustic light + drifting particles
        c = (np.sin(xx * .09 + t * 1.7 + np.sin(yy * .05 + t)) * np.sin(yy * .07 - t * 1.3 + np.sin(xx * .04 - t * .7))) ** 2
        c = cv2.resize(c * np.clip(1 - yy / (H // 8) * 1.3, 0, 1), (W, H), interpolation=cv2.INTER_CUBIC)[..., None]
        fr += c * np.array([60, 45, 20], np.float32)
    if eff == 'dust':
        for x, y, sp, sz in PART:
            px, py = int((x * W + 30 * t * (sp - .5)) % W), int((y * H + 12 * t * sp) % H)
            g = fr[py, px] * .5 + 110; cv2.circle(fr, (px, py), int(1 + sz * 2.2), g.tolist(), -1, cv2.LINE_AA)
    if eff == 'sun':     # slow warm light sweep
        fr *= 1 + 0.05 * np.exp(-((np.arange(W) - (0.2 + 0.6 * u) * W) / 300) ** 2)[None, :, None]
    fr += rng.normal(0, 3.5, (H // 4, W // 4, 1)).astype(np.float32).repeat(4, 0).repeat(4, 1)   # film grain
    v = 1 - 0.35 * ((xx / (W // 8) - .5) ** 2 + (yy / (H // 8) - .5) ** 2)                         # vignette
    fr *= cv2.resize(v, (W, H))[..., None]
    return fr

def render(i):
    s, still, motion, eff, lab, _ = SC[i]
    e = SC[i + 1][0] if i + 1 < len(SC) else T
    d = e - s; n = int(round(e * FPS)) - int(round(s * FPS))
    clip = f'clips/{still}.mp4'
    src = clip_frames(clip) if os.path.exists(clip) else None
    img = None if src else cover(cv2.imread(f'stills/{still}.jpg'))
    out = f'build/s{i:02d}.mp4'
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-c:v', 'libx264', '-crf', '17', '-preset', 'fast', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
    for f in range(n):
        t = f / FPS; tg = s + t
        base = img if src is None else cover(src[min(len(src) - 1, int(f * len(src) / n))])   # stretch clip over the scene
        fr = frame(base, t, d, motion, eff, i)
        if i == 3 and tg > CUT - 0.3: fr *= max(0.15, 1 - (tg - CUT + 0.3) / 0.6)                  # darken into the silence before "Then."
        if lab: fr = draw_lt(fr, i, t)
        k = caption_at(tg)
        if k is not None: pre, al = CAP[k]; fr = fr * (1 - al) + pre
        p.stdin.write(np.clip(fr, 0, 255).astype(np.uint8).tobytes())
        if f == n // 2: cv2.imwrite(f'build/chk{i:02d}.jpg', cv2.resize(np.clip(fr, 0, 255).astype(np.uint8), (270, 480)))
    p.stdin.close(); p.wait(); print('scene', i, still, f'{d:.1f}s', flush=True)

if __name__ == '__main__':
    os.makedirs('build', exist_ok=True)
    from multiprocessing import Pool
    with Pool(4) as pool: pool.map(render, [int(a) for a in sys.argv[1:]] or range(len(SC)))
