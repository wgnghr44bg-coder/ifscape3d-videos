"""Lange IfScape3D-video (16:9, ±3-5 min) uit 3 hoofdstukken die elk als gewone sjabloon-video zijn gemaakt.

Gebruik:  python tools/whatif/make_long.py <lange-map> <uit.mp4>
Leest <lange-map>/long.json:
  {"chapters": ["2026-10-21-ice-age-1", "2026-10-21-ice-age-2", "2026-10-21-ice-age-3"], "thumb_chapter": 3, "thumb_at": 0.7}
Elk hoofdstuk is een gewone map (plan.json + scene.json met "wide": true + stem) met <hoofdstuk>/chapter.mp4
(gemaakt met: render.mjs <hoofdstuk> video 4 --wide [--gpu]  en  finish.py <hoofdstuk> <hoofdstuk>/chapter.mp4 --wide).
Plakt ze aan elkaar met korte overgangen (0,5 s), controleert 1920x1080 / geluid / 3-5,5 min / geen decodeerfouten,
en zet een thumbnail-beeld in <lange-map>/afbeeldingen/T01.png (voor make_thumbnail.py van vox-lux).
"""
import json, os, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
long_dir, out = Path(sys.argv[1]), Path(sys.argv[2])
cfg = json.loads((long_dir / "long.json").read_text(encoding="utf-8"))
clips = [ROOT / ch / "chapter.mp4" for ch in cfg["chapters"]]
for c in clips:
    if not c.exists():
        sys.exit(f"FOUT: {c} ontbreekt (eerst render.mjs --wide + finish.py --wide voor dit hoofdstuk)")


def dur(f):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)],
                                capture_output=True, text=True, check=True).stdout)


F = .5
ins, parts = [], []
for i, c in enumerate(clips):
    d = dur(c); ins += ["-i", str(c)]
    parts.append(f"[{i}:v]fade=t=in:st=0:d={F},fade=t=out:st={d - F:.2f}:d={F},setsar=1[v{i}];"
                 f"[{i}:a]afade=t=in:st=0:d={F},afade=t=out:st={d - F:.2f}:d={F}[a{i}];")
n = len(clips)
fc = "".join(parts) + "".join(f"[v{i}][a{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=1[v][a]"
out.parent.mkdir(parents=True, exist_ok=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", fc, "-map", "[v]", "-map", "[a]",
                "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
                "-movflags", "+faststart", str(out)], check=True)

info = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type,width,height", "-of", "json",
                                  str(out)], capture_output=True, text=True).stdout)
v = next(s for s in info["streams"] if s["codec_type"] == "video")
errs = subprocess.run(["ffmpeg", "-v", "error", "-i", str(out), "-f", "null", "-"], capture_output=True, text=True).stderr
D, probs = dur(out), []
if (v["width"], v["height"]) != (1920, 1080): probs.append(f"formaat {v['width']}x{v['height']}")
if "audio" not in {s["codec_type"] for s in info["streams"]}: probs.append("geen geluid")
if not 180 <= D <= 330: probs.append(f"duur {D:.0f} s (moet 3-5,5 min)")
if errs.strip(): probs.append("decodeerfouten")
if probs:
    sys.exit("FOUT: " + ", ".join(probs))

# thumbnail-beeld uit het spannendste hoofdstuk (standaard het laatste, op 70 %)
tc = clips[int(cfg.get("thumb_chapter", n)) - 1]
(long_dir / "afbeeldingen").mkdir(exist_ok=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{dur(tc) * float(cfg.get('thumb_at', .7)):.2f}", "-i", str(tc),
                "-frames:v", "1", str(long_dir / "afbeeldingen" / "T01.png")], check=True)
print(f"Klaar en gecontroleerd: {out} (1920x1080, {D / 60:.1f} min, {n} hoofdstukken) + {long_dir}/afbeeldingen/T01.png")
