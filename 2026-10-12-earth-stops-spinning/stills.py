#!/usr/bin/env python3
"""Stills for Wan image-to-video (xAI grok-imagine-image, 9:16, ~$0.02 each). Usage: python3 stills.py 02 05"""
import json, sys, time, base64, urllib.request
from pathlib import Path
STYLE = (", clean 3D CGI render made in Blender, smooth simple geometry, low-detail stylized 3D models, "
         "matte plastic materials, crisp ray-traced shadows, global illumination, bright clean colours, "
         "isometric-like slightly high camera, looks like a 3D game scene, no painterly texture, no text, vertical composition")
P = {
 '02': "a calm European city park on a sunny morning, a few people walking on a gravel path, leafy trees, pigeons, old apartment buildings and a church tower in the background, eye-level view",
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
for k in sys.argv[1:]:
    f = Path(f'stills/scene{k}.jpg')
    if f.exists(): continue
    f.write_bytes(gen(P[k] + STYLE)); print('ok', f)
