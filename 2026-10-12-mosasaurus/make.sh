#!/bin/sh
# Mosasaurus: full edit. scenes.py (beeld) + sound.py (muziek/geluid) -> FilmCraft-project -> mosasaurus.mp4 (+ telefoonversie)
set -e
cd "$(dirname "$0")"
[ -f build/s14.mp4 ] || python3 scenes.py
python3 sound.py
P=build/mosasaurus.fcproj; rm -f $P
filmcraft-cli --save-as $P exec file.newProject name=Mosasaurus >/dev/null
filmcraft-cli --project $P --save exec file.newSequence '{"name":"Mosasaurus","width":1080,"height":1920,"fps":30,"video":1,"audio":3}' >/dev/null
filmcraft-cli --project $P --save import build/s*.mp4 voice.mp3 build/music.wav build/amb.wav > build/import.json
python3 - <<'EOF'
import json, glob
files = sorted(glob.glob('build/s*.mp4')) + ['voice.mp3', 'build/music.wav', 'build/amb.wav']
r = json.load(open('build/import.json'))
if r['errors'] or len(r['items']) != len(files): raise SystemExit(r)
m = {f.split('/')[-1]: i for f, i in zip(files, r['items'])}
sc = sorted(k for k in m if k.startswith('s') and k.endswith('.mp4'))
L = [{"id": "timeline.place", "params": {"items": [m[k] for k in sc], "track": "V1", "seconds": 0, "audio": False}},
     {"id": "timeline.place", "params": {"item": m['voice.mp3'], "track": "A1", "seconds": 0}},
     {"id": "timeline.place", "params": {"item": m['music.wav'], "track": "A2", "seconds": 0}},
     {"id": "timeline.place", "params": {"item": m['amb.wav'], "track": "A3", "seconds": 0}},
     {"id": "timeline.setTrack", "params": {"track": "A1", "name": "Atlas", "volumeDb": 0}},
     {"id": "timeline.setTrack", "params": {"track": "A2", "name": "Muziek", "volumeDb": -15}},
     {"id": "timeline.setTrack", "params": {"track": "A3", "name": "Geluid", "volumeDb": -11}}]
open('build/place.jsonl', 'w').write(''.join(json.dumps(x) + '\n' for x in L))
EOF
filmcraft-cli --project $P --save run build/place.jsonl >/dev/null
filmcraft-cli --project $P export build/edit.mp4 --format h264 --settings '{"bitrateMode":"crf","crf":18,"effects":{"loudness":{"enabled":true,"target_lufs":-14.0,"true_peak_dbtp":-1.5}}}'
cp build/edit.mp4 mosasaurus.mp4
ffmpeg -v error -y -i mosasaurus.mp4 -c:v libx264 -crf 27 -preset slow -c:a aac -b:a 128k -movflags +faststart mosasaurus-telefoon.mp4
echo ok
