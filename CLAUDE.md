# Notes for Claude sessions (IfScape3D)

- Praat simpel Nederlands met de eigenaar. Vraag altijd eerst toestemming voor alles wat geld kost (xAI-beelden, stem, video).
- Werkwijze: xAI-still (stijl `2026-10-12-earth-stops-spinning/stills/scene02d3d.jpg`) → Comfy (Wan 2.2 TI2V-5B op de pc) laat hem
  bewegen → montage met de craft-tools (scenes.py → EffectCraft → FilmCraft). Stills en clips staan in .gitignore: `git add -f`.

## Verplichte clipcontrole (eigenaar, okt 2026)
Wan vervormt soms (dier verandert in ander dier, staart wordt een schoen, vlek op de borst). Geen enkele clip gaat de montage in
zonder controle:
1. `python3 tools/check_clips.py <map>/clips` → overzichtsblad per clip (10 frames, elke ±0,5 s) in `<map>/build/check/`.
2. Bekijk elk blad (Read) en controleer: zelfde vorm/dier? niets wat er niet hoort? niets wat smelt of vloeit?
3. Noteer de uitslag in `<map>/clips/CHECKED.txt`: per regel `naam OK` of `naam USE <seconden>` (alleen het goede stuk) of
   `naam STILL` (stilstaand beeld gebruiken). `make.sh` bouwt niet als een clip daar ontbreekt.
4. Fout? Laat de pc de clip opnieuw maken met een andere seed (gratis) en controleer opnieuw.
De pc-sessie doet dezelfde controle vóór het pushen.
