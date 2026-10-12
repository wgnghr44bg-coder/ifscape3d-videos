#!/usr/bin/env python3
"""Stills for Wan image-to-video (xAI grok-imagine-image, 9:16, ~$0.02 each). Usage: python3 stills.py 02 05"""
import json, sys, time, base64, urllib.request
from pathlib import Path
STYLE = (", high quality 3D CGI render made in Blender, stylized but realistic proportions, detailed textures, "
         "varied natural colours, real clothing fabrics, crisp ray-traced shadows, warm morning sunlight, global illumination, "
         "looks like a modern 3D animated film or high-end game cutscene, no painterly texture, no text, vertical composition")
P = {
 '02': "a calm European city park on a sunny morning, a few people walking on a gravel path, leafy trees, pigeons, old apartment buildings and a church tower in the background, eye-level view",
 '02c': "close-up medium shot: a man in a coat sitting on a park bench drinking coffee, large in the foreground filling half the frame, several pigeons pecking right in front of the camera, park trees and city buildings softly in the background, eye-level camera",
 '02d': "close-up medium shot: a man in his forties wearing a navy wool coat, beige scarf and jeans, sitting on a wooden park bench holding a paper coffee cup, large in the foreground filling half the frame, several grey pigeons pecking right in front of the camera, colourful flower beds, autumn trees and old European apartment buildings softly blurred in the background, eye-level camera",
 '05': "a violent windstorm tearing through a European city street, trees bent almost flat, leaves, branches and debris flying sideways, dark dramatic sky, eye-level view",
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
STYLE_3D = (", stylized 3D animated character and set, clearly computer-generated 3D, smooth simplified shapes, "
            "slightly stylized proportions, soft subsurface skin, clean 3D modelled leaves and flowers, Blender Cycles render, "
            "same rich warm autumn colours, warm morning sunlight, crisp shadows, like a modern 3D animated film, no photo realism, no text, vertical composition")
for k in sys.argv[1:]:
    f = Path(f'stills/scene{k}.jpg')
    if f.exists(): continue
    key, st = (k[:-2], STYLE_3D) if k.endswith('3d') else (k, STYLE)
    f.write_bytes(gen(P[key] + st)); print('ok', f)
