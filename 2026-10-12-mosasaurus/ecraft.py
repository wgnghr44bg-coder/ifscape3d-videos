#!/usr/bin/env python3
"""Mosasaurus: EffectCraft pass on the scene clips from scenes.py.
Underwater scenes get CC Bubbles, the bang gets CC Particle World spray. Output build/e<NN>.mp4 (others are copied)."""
import os, shutil, subprocess, sys
from scenes import SC, CUT
HERE = os.path.abspath('.')
BUBBLES = '''var s = c.layers.addSolid([0.75, 0.9, 1.0], "bubbles", 1080, 1920, 1, f.duration);
var b = s.property("ADBE Effect Parade").addProperty("CC Bubbles");
b.property("Bubble Amount").setValue(25); b.property("Bubble Speed").setValue(0.35);
b.property("Bubble Size").setValue(0.45); b.property("Wobble Amplitude").setValue(12);
s.blendingMode = BlendingMode.SCREEN; var op = s.property("ADBE Transform Group").property("ADBE Opacity"); op.setValue(40);'''
SPRAY = '''var s = c.layers.addSolid([0, 0, 0], "spray", 1080, 1920, 1, f.duration);
var p = s.property("ADBE Effect Parade").addProperty("CC Particle World");
function P(path, v, t) { var x = p; for (var i = 0; i < path.length; i++) x = x.property(path[i]); if (t === undefined) x.setValue(v); else x.setValueAtTime(t, v); }
P(["Birth Rate"], 6, 0); P(["Birth Rate"], 2, 0.8); P(["Birth Rate"], 0, 1.4); P(["Longevity (sec)"], 2.5);
P(["Producer", "Position Y"], 0.18); P(["Producer", "Radius X"], 0.45); P(["Producer", "Radius Y"], 0.04);
P(["Physics", "Animation"], 1); P(["Physics", "Velocity"], 3.5); P(["Physics", "Gravity"], 1.0); P(["Physics", "Extra Angle"], 140); P(["Physics", "Resistance"], 4);
P(["Particle", "Particle Type"], 2); P(["Particle", "Birth Size"], 0.05); P(["Particle", "Death Size"], 0.02); P(["Particle", "Size Variation"], 60);
P(["Particle", "Birth Color"], [0.9, 0.97, 1, 1]); P(["Particle", "Death Color"], [0.6, 0.85, 1, 1]); P(["Particle", "Max Opacity"], 70);
s.blendingMode = BlendingMode.SCREEN;'''
def run(i):
    src, out = f'{HERE}/build/s{i:02d}.mp4', f'build/e{i:02d}.mp4'
    fx = BUBBLES if SC[i][3] == 'water' else SPRAY if SC[i][3] == 'shake' else None
    if fx is None: shutil.copy(src, out); return
    if SC[i][0] < CUT < (SC[i + 1][0] if i + 1 < len(SC) else 1e9) and fx is BUBBLES:   # fade out with the picture before "Then."
        t0 = CUT - 0.3 - SC[i][0]; fx += f'\nop.setValueAtTime({t0:.2f}, 40); op.setValueAtTime({t0 + 0.6:.2f}, 0);'
    proj, jsx = f'{HERE}/build/e{i:02d}.ecproj', f'build/e{i:02d}.jsx'
    open(jsx, 'w').write(f'''var f = app.project.importFile(new ImportOptions(new File("{src}")));
var c = app.project.items.addComp("scene", 1080, 1920, 1, f.duration, 30);
c.layers.add(f);
{fx}
app.project.save(new File("{proj}"));''')
    subprocess.run(['effectcraft-cli', '--empty', 'script', jsx], check=True, capture_output=True)
    subprocess.run(['effectcraft-cli', '--project', proj, 'render', '--comp', 'scene', '--out', out, '--format', 'h264',
                    '--audio', 'off', '--rate-control', 'quality', '--video-quality', '90'], check=True, capture_output=True)
    print('effectcraft', i, SC[i][1], flush=True)
if __name__ == '__main__':
    for i in [int(a) for a in sys.argv[1:]] or range(len(SC)): run(i)
