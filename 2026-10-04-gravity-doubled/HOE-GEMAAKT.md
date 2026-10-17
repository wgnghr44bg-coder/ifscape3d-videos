# What if gravity suddenly doubled? – zo is hij gemaakt

- **YouTube:** https://youtu.be/DE61_VUIuCw (openbaar, sinds 4 okt 2026)
- **Video:** `gravity-doubled.mp4` (1080x1920, 90 s), Short in gravity-stijl (stijl B)
- **Bron:** repo `vox-lux`, branch `claude/whatif-gravity-doubled`, map `whatif-demo/gravity-doubled/`
- De eigenaar gebruikt deze video als **voorbeeld voor het verhaal en de stem** van alle IfScape3D-video's.
  Zie `vox-lux` → `whatif-demo/regels/standaard-video.md` op branch `claude/whatif-machine`.

De precieze opbouw (seconde voor seconde: stem, beeld, tekst en geluid) staat in **`OPBOUW.md`**.

## Wat staat er in deze map

| Bestand | Wat het is |
|---|---|
| `gravity-doubled.mp4` | de video zoals hij op YouTube staat |
| `script.txt` | de tekst van de stem, met `[pause]` (0,5 s) en `[long pause]` (1 s) |
| `voice.mp3` | de stem (xAI Lux, tempo 0.9, elke zin apart ingesproken met vaste pauzes) |
| `voice-times.tsv` | begin- en eindtijd van elke zin in `voice.mp3` |
| `scene.html` | de hele 3D-scène (three.js): straat, mensen, auto's, kraan, brug, torens, tekst in beeld |
| `render.mjs` | maakt stilstaande beelden, de thumbnail, `timeline.json` en de video zonder geluid |
| `timeline.json` | de tijdlijn (TL) + alles wat valt of breekt; `make_audio.py` maakt hiermee het geluid |
| `thumbnail.jpg` | eerste beeld met de titel |
| `upload.json` | titel en YouTube-link |
| `OPBOUW.md` | de opbouw seconde voor seconde + wat er in de scène zit |
| `OVERZICHT.jpg` | 16 beelden uit de video op een rij |
| `ENGINE.txt` | de commit in `vox-lux` waarmee hij gemaakt is |

## Zo is hij gemaakt (stap voor stap)

Alles is gratis behalve de stem. Er is geen AI-beeld gebruikt: alles is zelf gebouwd in 3D.

1. **Verhaal** (`script.txt`). Opbouw:
   1. "Imagine… in a single second, gravity doubles." + wat dat betekent
   2. Waar je bent: "You are standing on a busy street."
   3. Gewoon getal → nieuw getal: 9,8 → 19,6 m/s² (de teller in beeld springt van 1 g naar 2 g)
   4. Wat je zelf voelt: oren ploppen, je gewicht verdubbelt
   5. Hoe mensen reageren: ze blijven staan, gaan zitten; auto's zakken door, bomen buigen
   6. Een natuurkundig feit met een getal: dingen vallen 1,4 keer sneller
   7. Het wordt erger: balkons vallen, ramen barsten, een kraan klapt dubbel
   8. Waarom: "Buildings are designed with a safety margin. But…"
   9. Hoogtepunt met stilte (4 × `[long pause]`): de oude torens storten in
   10. Daarna: het stof zakt, de stad staat er nog, gebogen
   11. Slotzin: "every step you take would carry twice your weight."
2. **Stem** → `voice.mp3` + `voice-times.tsv`, via `vox-lux/tools/xai_voiceover.py` (stem Lux, tempo 0.9, per zin).
3. **Tijdlijn**: in `scene.html` zit bovenaan één blok `const TL = { … }`. Daarin staan alle momenten
   (`beats`), de teller, de korte teksten in beeld (`captions`) en de shots. De tijden komen uit
   `voice-times.tsv` + 0,5 s (`VO_OFFSET`), zodat je ziet wat de stem zegt.
4. **Testbeelden**: `node render.mjs stills 5 20 40 55 66 80` → `stills/` (eerst naar de eigenaar).
5. **Tijdlijn voor het geluid**: `node render.mjs timeline` → `timeline.json`.
6. **Video zonder geluid**: `node render.mjs video silent.mp4 3` (720x1280, 30 fps; met 3 tegelijk duurt het ± een half uur).
7. **Geluid**: `python3 whatif-demo/make_audio.py whatif-demo/gravity-doubled` → `mix.wav`.
   Alle geluiden zijn zelf gemaakt met ruis (stad, wind, dreun, glas, kabel, vliegtuig…), dus gratis.
   De stem staat voorop, de geluiden zijn eronder zachter (-14 LUFS).
8. **Eindvideo** (de precieze opdracht is niet bewaard; dit geeft hetzelfde resultaat):
   ```
   ffmpeg -i silent.mp4 -i mix.wav -vf scale=1080:1920:flags=lanczos -c:v libx264 -crf 18 -pix_fmt yuv420p \
          -c:a aac -b:a 192k -shortest gravity-doubled.mp4
   ```
9. **Controle**: 1080x1920, duur, geluid, `ffmpeg -v error -i gravity-doubled.mp4 -f null -`.

Opnieuw renderen: `scene.html` verwacht `../node_modules` (three.js en lettertypes), dus doe het in `vox-lux`:
```
git checkout claude/whatif-gravity-doubled
cd whatif-demo && npm install
node gravity-doubled/render.mjs stills 5 30 58 70
```

## Een nieuwe video op dezelfde manier (ander scenario, andere plek)

Je hoeft niet opnieuw een hele scène te bouwen. Na deze video is de **What if-engine** gemaakt
(`vox-lux`, branch `claude/whatif-machine`, map `whatif-demo/`). Daarmee kies je een plek en een kracht,
en maakt één opdracht de hele video in gravity-stijl. Zo zijn bijvoorbeeld de sinkhole-video en Sun went out gemaakt.

### Kies een plek en een kracht

| Plekken (`engine/places/`) | Krachten (`engine/forces/`) |
|---|---|
| street (de gravity-straat), river-city (rivier met brug), boulevard, harbor, mountain-village, nature-park, suburb, airport, colosseum, prehistoric, indoors, newyork | gravity, wind, cold, heat, quake, water, tide, eruption, sinkhole, day, alien, calm |

Voorbeelden: `river-city` + `quake` = "What if an earthquake hit…", `harbor` + `tide` = "What if the tide never stopped rising?",
`mountain-village` + `cold` = "What if the Sun went out?". Bestaat de plek of de kracht nog niet, dan bouw je alleen dat stuk erbij.

### Stappen

1. Kopieer de voorbeeldmap: `whatif-demo/topics/standaard-sinkhole/` → `whatif-demo/topics/<slug>/`.
2. Pas `scenario.js` aan:
   - `topic`: slug, `place`, `force`, vraag en titel
   - `lines`: het verhaal, met **dezelfde 11 stappen als hierboven** (nooit zinnen letterlijk overnemen),
     ± 130–200 woorden, Engels, "you", Europese eenheden; het hoogtepunt krijgt een getal (± 3–4 s stilte)
   - `counter` + `hud`: het getal in beeld (bij gravity: GRAVITY 1 g → 2 g; bij sinkhole: DEPTH 0 → 90 m)
   - `camPath`: één rustige, doorlopende camerabeweging (`[tijd, camerapositie, kijkpunt]`)
   - `beats`: wanneer wat gebeurt (mensen gaan veilig weg met `shelter` / `flee`)
   - `captions` en `upload` (beschrijving zonder het einde te verklappen)
3. Zet het onderwerp in `whatif-demo/onderwerpen.md` (nummer, vraag, plek, kracht).
4. Testbeelden: `python3 whatif-demo/make_whatif.py <nr> --stills` → overzichtsplaat naar de eigenaar.
   **Geen stem of video vóór akkoord.**
5. Na akkoord: `python3 whatif-demo/make_whatif.py <nr>` → stem, render, geluid en mp4 in één keer
   (render op de achtergrond, ± 35 min).
6. Controle (`regels/qc.md`), daarna de bestanden in deze repo zetten in een map `<datum>-<slug>/` (zie `README.md`).

### Stem

- **Standaard nu (gratis):** Chatterbox als bm_george, rustig, op de pc van de eigenaar:
  `vox-lux/tools/comfy/make_voice_local.py <map>` (leest `<map>/script-cues.txt`, maakt `voice.mp3` + `voice-times.tsv`).
- xAI-stem (zoals bij de gravity-video: Lux 0.9) **alleen als de eigenaar erom vraagt, want dat kost geld.**

### Andere route: de losse scène kopiëren

Wil je echt precies deze straat met andere gebeurtenissen? Kopieer dan `whatif-demo/gravity-doubled/` naar een nieuwe map
in `vox-lux` en pas alleen het `TL`-blok bovenaan `scene.html` aan (titel, teller, captions, beats). Voor een nieuwe plek
of een nieuwe kracht is de engine wel veel minder werk.
