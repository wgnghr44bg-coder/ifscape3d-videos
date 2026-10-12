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
 # --- script-v2, one still per sentence (style = 02d3d)
 'e01': "planet Earth seen from space filling most of the frame, centred, blue oceans, white swirling clouds, green and brown continents, thin glowing blue atmosphere, golden sunrise line on the edge, stars, dramatic cinematic space view",
 'e04': "close-up medium shot: a smiling boy of about ten in a yellow raincoat standing in the centre of a city park holding the string of a big red kite flying above him, large in the foreground and fully in frame, autumn leaves drifting in the breeze, colourful flower beds, autumn trees and old European apartment buildings softly blurred in the background, eye-level camera",
 'e06': "extreme close-up of a paper coffee cup standing on a wooden park bench in the centre of the frame, the dark coffee surface showing small trembling ripples, a fallen orange autumn leaf beside it, blurred park and pigeons in the background, tense quiet moment, eye-level macro shot",
 'e07': "close-up medium shot: a man in his forties wearing a navy wool coat and a beige scarf, centred and large in frame, gripping a park bench with both hands, his scarf and coat whipped hard sideways by a sudden violent wind, shocked face, leaves, coffee and pigeons blasting sideways past him, autumn trees bending in the background, dramatic",
 'e08': "a big old autumn tree in the centre of a European city street being torn out of the ground by a monstrous wind, roots ripping from the pavement, leaves, branches and debris flying sideways, apartment buildings with windows bursting, dark orange storm sky, dramatic low-angle view",
 'e09': "close-up of a weather station anemometer with spinning cups and a wind vane on a metal mast, centred and large in frame, cups spinning in a violent storm, dark storm clouds and rain behind it, dramatic",
 'e10': "a small red car tumbling through the air towards the camera in the centre of the frame, roof tiles, bicycles and street signs flying sideways around it, an old European street with dust storm behind, chaos, dramatic cinematic",
 'e11': "a gigantic ocean wave towering over a red and white lighthouse on a rocky coast, the lighthouse centred and large in frame, white foam and spray, dark stormy sky, dramatic low-angle view",
 'e12': "planet Earth seen from space, centred and filling the frame, the oceans pulled into two huge round seas at the north and south poles, a wide belt of brown and green new land wrapped around the equator, white clouds, thin blue atmosphere, stars, surreal and beautiful",
 'e13': "a lonely city street split in two by a sharp line: on the left side scorching bright sunlight with a huge sun frozen low in the sky and cracked dry ground, on the right side frozen blue darkness with snow and ice on cars and buildings and stars in the sky, centred symmetrical view, dramatic",
 'e14': "a huge full Moon rising over a calm ocean at dusk, large and centred in the frame, its light reflecting on gentle waves, a small sailboat, purple and orange sky, peaceful and mysterious",
 'e17': "a colourful ancient coral reef underwater, a large round brain coral with clearly visible growth rings centred and close in frame, small tropical fish, sun rays coming through blue water, detailed",
 'e18': "the planet Venus seen from space, large and centred in frame, thick swirling yellow and cream clouds, the bright Sun glowing behind its edge, stars, dramatic cinematic space view",
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
