"""Video afmaken: stille render + stem -> eind-mp4 (1080x1920, 30 fps, -14 LUFS), gratis (alleen ffmpeg).

Gebruik:  python tools/whatif/finish.py <map> <uit.mp4>
Leest <map>/render.mp4 (node tools/whatif/render.mjs <map> video) en <map>/voice.mp3.
Geluid: zachte omgevingsruis (geen muziek, AGENTS.md punt 8) die na de stem bijna stil wordt, stem erbovenop,
eindmix -14 LUFS / piek -1 dB. Heeft de map een eigen sfx-bed.wav (make_audio.py), dan wordt dat gebruikt.
Controleert daarna: formaat, geluid, duur 60-95 s, geen decodeerfouten.
"""
import json, subprocess, sys
from pathlib import Path

vid, out = Path(sys.argv[1]), Path(sys.argv[2])
render, voice = vid / "render.mp4", vid / "voice.mp3"
for f in (render, voice):
    if not f.exists():
        sys.exit(f"FOUT: {f} ontbreekt")


def dur(f):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)],
                                capture_output=True, text=True, check=True).stdout)


D, V = dur(render), dur(voice)
bed = vid / "sfx-bed.wav"
if bed.exists():
    ins = ["-i", str(bed)]
    bedf = "[2:a]volume=0.4,apad[bed]"
else:   # bruine ruis als wind/stad, onder de stem; na de stem langzaam naar bijna stil
    ins = ["-f", "lavfi", "-i", f"anoisesrc=color=brown:amplitude=0.5:duration={D:.2f}:sample_rate=44100"]
    bedf = (f"[2:a]lowpass=f=700,highpass=f=60,volume=0.10,"
            f"afade=t=out:st={max(V - 2, 1):.2f}:d=4,apad[bed]")
out.parent.mkdir(parents=True, exist_ok=True)
fc = (f"[0:v]scale=1080:1920:flags=lanczos,setsar=1[v];"
      f"[1:a]aresample=44100,apad[vo];{bedf};"
      f"[bed][vo]sidechaincompress=threshold=0.05:ratio=6:attack=20:release=400[duck];"
      f"[duck][vo]amix=inputs=2:normalize=0,atrim=0:{D:.2f},loudnorm=I=-14:TP=-1:LRA=11[a]")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(render), "-i", str(voice), *ins, "-filter_complex", fc,
                "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-movflags", "+faststart", "-t", f"{D:.2f}", str(out)],
               check=True)

info = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type,width,height", "-of", "json",
                                  str(out)], capture_output=True, text=True).stdout)
kinds = {s["codec_type"] for s in info["streams"]}
v = next(s for s in info["streams"] if s["codec_type"] == "video")
errs = subprocess.run(["ffmpeg", "-v", "error", "-i", str(out), "-f", "null", "-"], capture_output=True, text=True).stderr
probs = []
if (v["width"], v["height"]) != (1080, 1920): probs.append(f"formaat {v['width']}x{v['height']}")
if "audio" not in kinds: probs.append("geen geluid")
if not 60 <= dur(out) <= 95: probs.append(f"duur {dur(out):.1f} s")
if errs.strip(): probs.append("decodeerfouten")
if V > D: probs.append(f"stem ({V:.1f} s) langer dan beeld ({D:.1f} s)")
if probs:
    sys.exit("FOUT: " + ", ".join(probs))
print(f"Klaar en gecontroleerd: {out} (1080x1920, {dur(out):.1f} s, met geluid)")
