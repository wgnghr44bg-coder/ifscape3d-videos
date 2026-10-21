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
python3 tools/cartoon/check_story.py <map>              # eigen verhaal? (geen tekst/scènes uit andere video's, ≥ 3 plekken)
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
- `HOOFDPERSOON`: vaste hoofdpersoon (getint hoofd, zwart t-shirt) → `char({ ...HOOFDPERSOON, x, y })`.
- `char({...})`: hoofd (`skin`), shirt (`top`: jas/hoodie/tshirt/trui/pak), kleur, gezicht (`normaal`, `blij`, `bang`, `boos`, `stiekem`, `verdrietig`, `slaap`), knipperen,
  kijkrichting, lopen, springen, schudden, verschijnen (`pop`), spiegelen, haar (`long`, `bun`, `kort`), bril, pet,
  armen draaien (wijzen, knop indrukken), vasthouden (`broom`, `controller`, `phone`), liggen (`lie: -90`).
- Bouwdoos: `place({ back, wall, ground, items })` maakt een plek uit een korte beschrijving (zie `.opencode/command/cartoon.md`).
- Vaste plekken: `bedroom({night, tv, light, machineAt})`, `classroom(bordtekst)`, `street({night})`, `park()`, `kitchen()`,
  `space()`, `beach()`, plus `desk`, `machine`, `heart`, `word` (POOF!, A+),
  `bubble` (tekstballon).
- Geluidjes (gratis, ffmpeg): `poof`, `ding`, `click`, `boom` via `STORY.sfx`.
- Omgevingsgeluid (gratis, ffmpeg): `rain`, `storm`, `water`, `wind`, `crickets`, `room` via `STORY.ambient`.
  `render.mjs <map> --audio` maakt alleen het geluid opnieuw (snel, beeld blijft).
Nodig: Playwright (Chromium) en ffmpeg – staan al in de cloudsessie.

## Op de pc (Windows) – alles in één keer
`powershell -ExecutionPolicy Bypass -File tools\cartoon\maak-video.ps1 -Map <map>` doet hieronder alles
(ophalen, eenmalig installeren, stem, tijden, video, kopie naar Video's, stem terug naar GitHub).

## Op de pc (Windows) – met de hand
Eenmalig, in de map `ifscape3d-videos`: Node.js, Python en ffmpeg moeten er zijn (ffmpeg staat er al voor de stem). Dan:
```
npm install playwright
npx playwright install chromium
```
Daarna per video (vox-lux en ifscape3d-videos naast elkaar in dezelfde map):
```
cd vox-lux
python tools/comfy/make_voice_local.py ../ifscape3d-videos/<map>      # stem (stem-omgeving actief)
cd ../ifscape3d-videos
python tools/cartoon/timing.py <map>
node tools/cartoon/render.mjs <map>                                    # → <map>/build/video.mp4
```
