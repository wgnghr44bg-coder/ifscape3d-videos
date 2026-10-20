"""Tijden voor een cartoon-video: <map>/timing.json.

Is er <map>/voice-times.tsv (van vox-lux/tools/comfy/make_voice_local.py), dan komen de tijden daaruit.
Anders worden ze geschat uit <map>/script-cues.txt (2,6 woorden/s, zelfde pauzes als de lokale stem),
zodat je al een proefversie zonder stem kunt maken.
Gebruik: python3 tools/cartoon/timing.py <map> [--vox-lux ../vox-lux]
"""
import argparse, json, os, sys

ap = argparse.ArgumentParser()
ap.add_argument("map"); ap.add_argument("--vox-lux", default=os.path.join(os.path.dirname(__file__), "..", "..", "..", "vox-lux"))
ap.add_argument("--wps", type=float, default=2.6); ap.add_argument("--tail", type=float, default=2.5)
a = ap.parse_args()

rows, src = [], "voice-times.tsv"
tsv = os.path.join(a.map, "voice-times.tsv")
if os.path.exists(tsv):
    for line in open(tsv, encoding="utf-8").read().splitlines()[1:]:
        _, start, end, cue, text = line.split("\t", 4)
        rows.append({"start": float(start), "end": float(end), "cue": cue, "text": text})
else:
    src = "schatting"
    sys.path.insert(0, os.path.join(a.vox_lux, "tools"))
    import xai_voiceover as xv
    xv.PAUSE_MS, xv.LONG_PAUSE_MS, xv.SENTENCE_PAUSE_MS = 900, 1700, 600   # zelfde als make_voice_local.py
    t = 0.8
    for p in xv.split_script(open(os.path.join(a.map, "script-cues.txt"), encoding="utf-8").read()):
        text = " ".join(xv.TAG_RE.sub("", p.text).split())
        d = max(0.6, len(text.split()) / a.wps)
        rows.append({"start": round(t, 2), "end": round(t + d, 2), "cue": p.cue, "text": text})
        t += d + p.silence_after_ms / 1000

scenes, cue = [], None
for r in rows:
    if r["cue"]:
        if scenes: scenes[-1]["end"] = r["start"]
        scenes.append({"id": r["cue"], "start": 0.0 if not scenes else r["start"], "end": None})
    r["scene"] = scenes[-1]["id"]
total = round(rows[-1]["end"] + a.tail, 2)
scenes[-1]["end"] = total
json.dump({"source": src, "total": total, "scenes": scenes, "rows": rows}, open(os.path.join(a.map, "timing.json"), "w"), indent=1)
print(f"timing.json ({src}): {len(scenes)} scènes, {total:.1f} s")
