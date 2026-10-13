# What if a Mosasaurus appeared in the ocean? – stand (13 okt 2026)

- Eerste versie klaar: `mosasaurus.mp4` (1080x1920, 87 s, −14 LUFS) + `mosasaurus-telefoon.mp4` (22 MB). Mp4's staan niet in git.
- Bouwen: `sh make.sh` (controleert eerst `clips/CHECKED.txt`) → scenes.py (clips + beweging + ondertitels + labels)
  → ecraft.py (EffectCraft: 3D-bellen onder water, spatwater bij de sprong) → sound.py (zachte muziek + omgevingsgeluid)
  → FilmCraft (kleurpresets, lensflare, flits, filmovergangen; stem/muziek/geluid op A1–A3) → export.
- Stem: `voice.mp3` = Atlas, 10% vertraagd + langere pauzes (optie 1, gratis). Tijden in `voice-times.tsv`.
- Clips: 13 Comfy-clips (Wan 2.2 TI2V-5B), gecontroleerd volgens ../CLAUDE.md. m15 en m24 alleen het goede begin (USE).
- Labels in Alteraqon-stijl alleen bij 15 m, 2 rijen tanden, Maastricht, 1795.
- Kosten: ±$0,35 (xAI-beelden + stem).
