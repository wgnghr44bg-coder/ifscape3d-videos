# Cartoon-video's (platte 2D-poppetjes) – gratis

Stijl zoals de "What IF…? PART 1"-filmpjes op TikTok: poppetjes met een rond hoofd, jas en streepbenen,
platte kamers, witte titel bovenin, PART-label en grote ondertitels. Alles wordt met code getekend
(geen AI-beelden), dus het poppetje ziet er in elke scène hetzelfde uit. Kost niets.

## Per video (map `<datum>-<slug>/`)
- `script-cues.txt` – de tekst voor de stem, met `{img:s1}` per scène en `[pause]` / `[long pause]`
- `story.js` – per scène wat er te zien is (zie het voorbeeld `2026-10-20-clone-yourself/story.js`)
- `timing.json` – gemaakt door `timing.py`

## Stappen
```
python3 tools/cartoon/timing.py <map>                   # tijden (geschat, of uit voice-times.tsv als die er is)
node tools/cartoon/render.mjs <map> --check             # alleen CHECK.jpg: één beeld per scène (snel)
node tools/cartoon/render.mjs <map>                     # <map>/build/video.mp4 (1080x1920, met stem als voice.mp3 er is)
```
Stem (gratis, op de pc van de eigenaar, vanuit de map vox-lux met de stem-omgeving actief):
```
python tools/comfy/make_voice_local.py ../ifscape3d-videos/<map>     # → voice.mp3 + voice-times.tsv
```
Daarna `timing.py` en `render.mjs` opnieuw: dan lopen beeld en ondertitels precies mee met de stem.

## Wat de engine kan (`cartoon.js`)
- `char({...})`: kleur jas, gezicht (`normaal`, `blij`, `bang`, `boos`, `stiekem`, `verdrietig`, `slaap`), knipperen,
  kijkrichting, lopen, springen, schudden, verschijnen (`pop`), spiegelen, haar (`long`, `bun`, `kort`), bril, pet,
  armen draaien (wijzen, knop indrukken), vasthouden (`broom`, `controller`, `phone`), liggen (`lie: -90`).
- Plekken: `bedroom({night, tv, light})`, `classroom(bordtekst)`, plus `desk`, `machine`, `heart`, `word` (POOF!, A+),
  `bubble` (tekstballon).
- Geluidjes (gratis, ffmpeg): `poof`, `ding`, `click`, `boom` via `STORY.sfx`.
Nodig: Playwright (Chromium) en ffmpeg – staan al in de cloudsessie.
