#!/usr/bin/env python3
"""Mosasaurus stills (xAI grok-imagine-image, 9:16, ~$0.02 each), style = earth-stops-spinning/stills/scene02d3d.jpg.
Usage: python3 stills.py m01 m03 ..."""
import json, sys, time, base64, urllib.request
from pathlib import Path
STYLE = (", stylized 3D animated characters and set, clearly computer-generated 3D, smooth simplified shapes, "
         "slightly stylized proportions, soft subsurface skin, detailed textures, Blender Cycles render, rich vivid colours, "
         "crisp shadows, like a modern 3D animated film, main subject large, centred and fully in frame, no photo realism, no text, vertical composition")
P = {
 'm01': "a huge Mosasaurus swimming straight towards the camera in deep clear blue ocean, long crocodile-like head with rows of sharp teeth, four flippers, long tail with a fin, sun rays from the surface, small fish scattering, dramatic underwater view",
 'm03': "close-up medium shot: a happy girl of about ten holding a bright surfboard on a sunny summer beach, large in the foreground, colourful beach umbrellas, kids playing in the shallow water, seagulls flying, turquoise sea, eye-level camera",
 'm07': "a young man swimming calmly at the surface of a clear turquoise sea, seen close from the water level, head and shoulders large in frame, small waves, bright summer sun, the beach far behind him",
 'm09': "underwater view looking up at the legs of a swimmer at the bright surface, centred, and far below in the deep blue a gigantic dark shadow of a huge sea reptile gliding beneath, tense and ominous",
 'm12': "a gigantic Mosasaurus bursting out of the sea surface with its huge jaws wide open, centred and large in frame, massive splash and white spray, a surfboard flying, bright summer sky, epic dramatic moment",
 'm13': "a full-length Mosasaurus lying on a sunny beach next to a yellow city bus for scale, the reptile clearly longer than the bus, side view, centred, curious tourists at a distance, turquoise sea",
 'm14': "extreme close-up of the open jaws of a Mosasaurus, centred, rows of sharp cone-shaped teeth and a second row of teeth on the roof of its mouth, wet glistening skin, underwater light, dramatic",
 'm15': "a Mosasaurus swallowing a large fish whole in the deep blue ocean, centred and large in frame, throat bulging, bubbles and sun rays, dramatic underwater view",
 'm17': "close-up of a Mosasaurus head rising at the calm sea surface to breathe air, nostrils on top of the snout, water running off its scaly skin, golden sunset light, centred",
 'm19': "a huge Mosasaurus chasing a great white shark in the open ocean, both centred and large in frame, the shark looks tiny next to it, sun rays, bubbles, dramatic underwater action",
 'm22': "18th century quarry workers with lanterns in a chalk cave tunnel near Maastricht uncovering the fossil skull of a Mosasaurus: a very long, low, narrow reptile skull like a giant crocodile or monitor lizard skull, about 1.5 metres long, long pointed snout, long lower jaw, a row of sharp conical teeth, NOT a human skull, no round cranium, no eye sockets facing forward, lying sideways in the white rock wall, centred and large in frame, warm lantern light, dust, wonder",
 'm24': "French revolutionary soldiers in blue coats and bicorne hats in 1795 loading the fossil skull of a Mosasaurus: a very long, low, narrow reptile skull like a giant crocodile or monitor lizard skull, about 1.5 metres long, long pointed snout, long lower jaw, a row of sharp conical teeth, NOT a human skull, no round cranium, no eye sockets facing forward lengthwise onto a wooden horse cart, the long skull centred and large in frame, old Dutch town street, dramatic overcast light",
 'm25': "a giant fossil Mosasaurus skull displayed in a glass case in an old Paris natural history museum, centred and large in frame, wooden cabinets, warm museum light, a few visitors looking at it",
}
def gen(prompt):
    body = json.dumps({"model": "grok-imagine-image", "prompt": prompt, "n": 1, "aspect_ratio": "9:16",
                       "response_format": "b64_json"}).encode()
    req = urllib.request.Request("https://api.x.ai/v1/images/generations", body, {"Content-Type": "application/json"})
    for a in range(3):
        try:
            return base64.b64decode(json.load(urllib.request.urlopen(req, timeout=180))["data"][0]["b64_json"])
        except urllib.error.HTTPError as e:
            if e.code < 500 and e.code != 429: raise SystemExit(f"HTTP {e.code}: {e.read().decode()[:300]}")
            time.sleep(2 ** (a + 1))
    raise SystemExit('mislukt')
Path('stills').mkdir(exist_ok=True)
for k in sys.argv[1:]:
    f = Path(f'stills/{k}.jpg')
    if f.exists(): continue
    f.write_bytes(gen(P[k] + STYLE)); print('ok', f)
