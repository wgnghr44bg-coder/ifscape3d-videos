# PROGRESS — What if you couldn't stop growing as a human?

Map: `2026-10-18-cant-stop-growing/`. Sessie: nieuw (AGENTS.md punt 12).
Route: **FIRST RULE** in AGENTS.md — storyboard alleen via `tools/whatif/whatif.py`, daarna `@physics-review`.

## Fantasy-herziening (18 okt 2026 — eigenaar: "Gripping first", terug naar de storyboard-stap)

- [x] `git pull` (a7f13f4 → a1d11ea: "Gripping first"-regel in AGENTS.md, `realism: fantasy` + `counter_matches`
      in `tools/whatif/*`, `scenecheck.mjs` controleert nu ook dat de teller toont wat je ziet).
- [x] `plan.json` **volledig herschreven** naar de nieuwe opdracht: `"realism": "fantasy"`, 60 jaar groeien
      (1,8 → 16,8 m), door huizen heen lopen (muren en daken breken), hoger dan de molen, over de hele stad staan,
      en aan het eind als een brug over de gracht liggen met roeibootjes onder je arm door.
      `"counter_matches": {"object": "you", "measure": "height", "unit": "m", "hud_number": 0}` toegevoegd.
- [x] Getallen: 60 × 25 cm = 15 m → 16,8 m; (16,8/1,8)³ = 813× (stem: "past eight hundred times") → 75 kg × 813 =
      **61 t** (niet ~70 t: zie critic — de eerlijke kubuswet wint van het afgeronde getal, want de teller moet
      kloppen met wat je ziet); bot 87×; last per cm² 9,3×; Wadlow 2,72 m / 199 kg; jaar 4 = wanneer je Wadlow voorbij bent.
- [x] Teller: `HEIGHT · SIXTY YEARS` 1,8 → 16,8 m · `MASS · SAME SHAPE` 75 → 61 000 kg (label zonder cijfers, want de
      beeldchecker leest het **eerste getal** in de teller).
- [x] **`check` → ✅ ALL CHECKS PASSED** (geen FAIL, geen WARN).
- [x] **`@physics-review`** op `STORYBOARD.md` — drie rondes: 11 punten → gefixt → 2 restpunten → gefixt → **OK**.
      Echte reparaties: (1) de teller is geen rechte lijn maar één curve (h = 1,8 + 15·p^0,7 over het telvenster
      17,3–65,6 s; massa = 75 kg × (h/1,8)³) — anders leest de massa op de helft 30 t waar de kubuswet 10 t zegt;
      (2) step 8 zegt nu "at the end" (800× en 87× gelden pas bij 16,8 m, niet tijdens de groei); (3) step 7 "The town
      is too small now" i.p.v. "lanes" (het beeld laat de kade zien); (4) step 9 noemt de daken ("the roofs to your
      knee") zodat de daken-check een uitgesproken zin test; (5) slotzin "And sixty years were only the beginning"
      i.p.v. "the growth has not stopped" (de teller staat bevroren op 16,8 m); (6) climax zegt "only that one boat
      drifts" i.p.v. "nothing moves"; (7) reality 7 "meer dan tien meter", reality 10 "twee en een halve meter
      speling per kade"; (8) step 6 ingekort, en shot 1 laat bij step 6 een marktkraam zien met zijn dak op je scheen
      (anders 24 s lang geen nieuw voorwerp in beeld).

## Gedaan

- [x] `git pull` (1149576 → ab35ab0: FIRST RULE + physics-review-agent + `physics-limits.json`).
- [x] `tools/whatif/README.md`, voorbeeld `tools/whatif/examples/sea-rose-10m.plan.json`, `physics-limits.json`,
      `physics-myths.json` en de recentste video (`2026-10-18-endless-rain/plan.json`) gelezen.
- [x] `python tools/whatif/whatif.py envs` → plek gekozen: **old-town** (camera's `square`, `canal`, `aerial`).
- [x] `python tools/whatif/whatif.py new 2026-10-18-cant-stop-growing --question "What if you couldn't stop growing as a human?" --env old-town`.
- [x] `plan.json` ingevuld (11 stappen, 188 woorden, 12 getallen, 8 on_screen, counter, 4 captions, 3 feiten met bron,
      5 shots, 6 afleidingen, reality 7/9/10, 9 critic-punten, 3 vragen).
- [x] **`check` → ✅ ALL CHECKS PASSED** (eerste ronde, geen FAIL/WARN).
- [x] **`@physics-review`** op `STORYBOARD.md`: 12 punten gevonden → alle echte punten in `plan.json` gefixt →
      `check` opnieuw → ✅ → tweede review-ronde: nog 4 punten → gefixt → `check` → ✅ → **derde ronde: OK**.
      Belangrijkste reparaties: step 1 laat de groei vandaag beginnen (klopte niet met 1,8 m in step 3);
      de teller labels zeggen nu dat het om de eerste 8 jaar gaat; "705 kg alleen als de vorm gelijk blijft"
      (staat ook in caption 4 en reality 9, met Wadlow's echte 199 kg ernaast); het personage staat stil met een
      hand op de fontein i.p.v. te lopen (gewrichten/spieren/hart/voedsel als eerste grens, niet het bot zelf);
      de middagschaduw-regel is weg; step 5 "thigh" i.p.v. "knee"; step 6 en de feiten nu gesourced (2,72 m, 199 kg);
      voedsel ~5× i.p.v. 9× (Kleiber 0,75).

- [x] **Eigenaar: "ga door"** → storyboard goedgekeurd → stap 2 (scène) gebouwd in `scene.html`.
- [x] **Scène** met alle hooks die `tools/whatif/scenecheck.mjs` nodig heeft: `window.renderAt(t)`, `window.ready`,
      `window.WHATIF = { THREE, scene, camera }`, `userData.tag` op alles wat de stem noemt, teller in `<div id="hud">`.
- [x] **`node tools/whatif/scenecheck.mjs 2026-10-18-cant-stop-growing` → ✅ ALL PICTURE CHECKS PASSED**
      (4 harde overgangen op 21, 25, 54, 59 s = 3 shots + 2 close-ups; geen FAIL, geen WARN).
- [x] `CHECK.jpg` + `CHECK.md` zelf tegen de VISUAL QUALITY CHECKLIST bekeken en 4 echte dingen gefixt:
      (1) de schoenscheuren waren onzichtbaar (ze lagen 1 cm ín de schoen, nu liggen ze erop en openen ze als een mond);
      (2) in de step-5 telinstantie vloog de camera bovenop de kar (de kar was niet meer te herkennen) → camera 4 m korter;
      (3) de close-up van de fonteinrand stond op een plek waar "you" uit het kader viel → nu staat de camera langs de rand
      met "you" erachter, de rand precies op kniehoogte;
      (4) de escalatiecamera iets hoger (1,9 m) zodat de fontein als bassin leest i.p.v. als platte ring.
- [x] `plan.json` bijgewerkt op de punten waar de scène eerlijk verschilt van het storyboard (2 close-up `where`-regels,
      1 `where`-regel van shot 2) → `python tools/whatif/whatif.py check` → ✅ **ALL CHECKS PASSED** (storyboard opnieuw gegenereerd).

- [x] **Eigenaar: vijf punten om het verhaal als "jij = een reus" te laten lezen** — alle vijf verwerkt:
      1) `"subject": "you"` in `plan.json` + `renderer` in `window.WHATIF`;
      2) jij bent vanaf step 5 onmiskenbaar een reus (naast gewone mensen, lantaarns en je eigen deur; je bent
      ≥300 px in elk beeld waar de stem je noemt);
      3) de climax (step 9–11) is een lage camera op de keien die naar je opkijkt, één langzame voorwaartse
      beweging, met een harde cut ervoor;
      4) step 7 zet je naast je eigen deur, en die deur is duidelijk kleiner dan jij;
      5) teller en captions staan vet op een donkere halfdoorzichtige band.
      → `plan.json` aangepast waar de scène eerlijk verschilt → `check` → ✅ **ALL CHECKS PASSED**.
- [x] **Eerste ronde van de visuele controle (van max 3)** — de contactsheet en de losse stills bekeken; zeven echte
      fouten gevonden en gefixt:
      1) `posedBox` zette nooit `skeleton.update()`: de checker mat elke figuur in bindpose (armen wijd, 1,7 m
      breed) i.p.v. in de animatiepose → nu met `m.skeleton.update()` kloppen de maten;
      2) de getagde voorbijganger had hetzelfde model als jij → kreeg `character-male-c`, zodat jij en hij nooit
      als dezelfde persoon lezen;
      3) de camera van shot 1 kroop van 5,6 m naar 3 m: op step 5 en 6 vulde jouw hoofd het hele kader en viel je
      onderlichaam weg → de creep is gehalveerd (naar 4,5 m), zodat je daar met voeten en plein in beeld staat;
      4) de camera van shot 1 stond ín de hoek van je huis (onzichtbaar door FrontSide, maar de titelcheck zag
      100 % "iets dichter dan 3 m") → camera 1 m naar het oosten, buiten de muur;
      5) de close-up van de schoenen (step 4) was een muur van armen: de camera stond naast je heup → nu staat hij
      0,3 m boven de keien recht vóór je tenen, onder je handen langs;
      6) de fontein stond op een vierkante plaat die in de climax als betonblok in beeld stond → de plaat is nu een
      ronde stenen rand (de rand blijft op kniehoogte, 0,95 m);
      7) je stond met je rug naar de climaxcamera → je kijkt nu naar je eigen deur (zuid-zuidwest), zodat shot 1 je
      gezicht houdt en de lage climaxcamera je van voren-links ziet.
      En het verhaal zelf: "A cart comes up to your thigh" kon de plaat niet eerlijk laten zien (die kar is 2,8 m
      breed: naast een lichaam van 2,4 m valt hij óf buiten het kader óf hij verstopt je), dus step 5 vergelijkt nu
      mensen: "Their heads come up to your chest" — met de voorbijganger op dezelfde diepte als jij klopt dat op de
      plaat. De kar blijft als decor op het plein staan (niet meer genoemd).
      → daarna `node tools/whatif/scenecheck.mjs` → ✅ **ALL PICTURE CHECKS PASSED**, met de nieuwe, eerlijke
      getallen: step 5 "their heads come up to your chest ✓ 74 %", step 9 "your head is above the lanterns ✓ 84 %",
      step 7 deur 227 px, step 8 fonteinrand 27 %, en 3 harde cutten op 42, 54 en 59 s.

## Staat nu

- **Wacht op de eigenaar**: `STORYBOARD.md` bekijken (opnieuw de storyboard-stap = STOP). Nog géén stem, géén geluid,
  géén scène-werk, géén volledige render.
- Schatting: ≈194 woorden, ≈91 s (definitieve tijden komen straks uit `voice-times.tsv`).
- Plek: `environments/old-town.js` (bestaat): plein met fontein/kramen/kar, kaden, smalle huizenrijen langs de gracht,
  stenen brug (±14 m), roeibootjes op het water, molen aan de rand van de stad. Custom camera's voor shot 1, shot 2,
  de twee close-ups en de hoge climax-shot.
- Teller: `HEIGHT · SIXTY YEARS` 1,8 → 16,8 m · `MASS · SAME SHAPE` 75 → 61 000 kg. Venster: van het woord "adds"
  (step 3, ≈17 s) tot "windmill" (step 9, ≈66 s). De scène stuurt **één curve** voor beide regels (zie critic).
- Shots: plein (0–19 s) → close-up schoenen (19–23 s) → plein, lichaam groeit en de kraam blijft op scheenhoogte
  → kade/escalatie als je door de huizen loopt (43–52 s) → close-up voet + roeiboot op je enkel (52–56 s) →
  hoog over de stad, molen op borsthoogte, en dan jij als brug over de gracht (61 s → eind).
- Nieuw in code (2 dingen, geen nieuwe bestanden/licenties): het personage ×9,33 laten groeien en lopen, en de
  brekende daken/muren van de huizen waar je doorheen gaat.
- Eerlijke scène-details die niet in `plan.json` horen: de molen wordt in de scène van 18 m naar 12 m geschaald
  (anders is "hoger dan de molen" onwaar); de daken op kniehoogte blijven ≤ 5 m; `check/` wordt niet gecommit.

## Aan de eigenaar gevraagd

- 3 vragen staan onderaan `STORYBOARD.md` — elk met mijn keuze. Belangrijkste: **de laatste twee stappen** (jij ligt
  als brug over de gracht) kan de beeldchecker niet goedkeuren: die meet de *hoogte* van je lichaam als je ligt
  (≈2,5 m) tegen de teller (16,8 m). Ik heb jouw einde letterlijk overgenomen en `counter_matches` precies zoals
  gevraagd gezet; als de beeldcheck daar straks op faalt kom ik terug met twee eerlijke opties (of `{"none"}` met de
  spanwijdte op de teller, of aan het eind staand met één arm over het water).
- **Nu**: `STORYBOARD.md` goedkeuren ("ga door" voor stap 2: scène + stem).


## Gepland na "ga door" (stap 2)

1. **Scène** in `scene.html`: de bestaande scène ombouwen naar de nieuwe cijfers (×9,33), de nieuwe route (plein →
   kade door de huizen → gracht) en de nieuwe beelden (brekende daken, molen op 12 m, liggend als brug).
   Hooks: `window.renderAt(t)`, `window.ready`, `window.WHATIF = { THREE, scene, camera, renderer }`,
   `userData.tag` op alles wat de stem noemt, teller in `<div id="hud">`.
2. **Beeldcheck**: `node tools/whatif/scenecheck.mjs` → ✅; daarna `CHECK.jpg` zelf tegen de VISUAL QUALITY
   CHECKLIST (max 3 rondes) → commit + push `CHECK.md` + `CHECK.jpg` → STOP.
3. **Chatterbox-stem** (gratis, pc): `voice.mp3` + `voice-times.tsv`; daarna alle tijden in de scène op de stem zetten.
4. Geluid (`make_audio.py`), volledige render (`render.mjs` + ffmpeg), contact sheet, `upload.json`.

## Notities

- Geen geweld, niemand raakt gewond: de stad is leeg vóór je erdoorheen loopt ("The last people leave"), het einde is
  stil op één rustig voorbij drijvende roeiboot na (AGENTS.md punt 9).
- Geen muziek, geen eindkaart, geen fade naar zwart; laatste beeld blijft staan.
- `assets/downloads/` blijft buiten git.
