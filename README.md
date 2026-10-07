# IfScape3D – bronbestanden per video

Per video één map: `<datum>-<slug>/` (bijv. `2026-10-07-sun-went-out/`).

Daarin:
- `scenario.js` (en bij lange video's alle hoofdstuk-scenario's)
- `script.txt`, `voice.mp3`, `voice-times.tsv`, `timing.json`
- `upload.json` (titel, beschrijving, tags, YouTube-link)
- `thumbnail.jpg` (lange video's)
- `ENGINE.txt`: commit van `vox-lux` (branch `claude/whatif-machine`) waarmee gerenderd is

Geen mp4 (te groot voor GitHub, staat al op YouTube), geen stills, geen wav's.
Hiermee kan elke video later opnieuw gemaakt of gerepareerd worden.
