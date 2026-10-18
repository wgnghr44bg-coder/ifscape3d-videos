# PROGRESS — What if you couldn't stop growing as a human?

Map: `2026-10-18-cant-stop-growing/`. Sessie: nieuw (AGENTS.md punt 12).
Route: **FIRST RULE** in AGENTS.md — storyboard alleen via `tools/whatif/whatif.py`, daarna `@physics-review`.

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

## Staat nu

- **Wacht op de eigenaar**: `CHECK.jpg` bekijken (stap 3 = STOP). Nog géén stem, géén geluid, géén volledige render.
- Schatting: ≈188 woorden, ≈89 s (definitieve tijden komen straks uit `voice-times.tsv`).
- Plek: `environments/old-town.js` (bestaat, 3 camera's) + custom camera's voor shot 2, de twee close-ups en de high shot.
- Teller: `HEIGHT · FIRST 8 YEARS` 1,8 → 3,8 m, tweede regel `MASS · SAME SHAPE` 75 → 705 kg.
- Shots: square (0–21 s) → close-up schoenen (21–25 s, 4 s) → square (25–42 s) → escalatie vanaf de vloer (42–54 s)
  → close-up fonteinrand (54–59 s) → high shot 34 m (59 s → eind). 4 harde overgangen = 3 shots + 2 close-ups.
- Nieuw in code (1 ding): het groeiende personage (Kenney mini-character ×1 → ×2,11). Geen nieuwe modelbestanden,
  geen nieuwe licenties (Kenney CC0 + bestaande omgeving).
- Scene-details die niet in `plan.json` horen maar wel eerlijk zijn: de `square`-tag zit op een onzichtbare
  plaat (2×8 m, dezelfde cobblekleur) midden op het plein, omdat de checker met de 70×40 m grondbox alleen punten
  buiten het kader of achter de fontein zou meten; de getagde lantaarn kreeg een 30 cm paal om zijn dunne modelpaal;
  `check/` is niet gecommit.

## Aan de eigenaar gevraagd

- 3 vragen staan onderaan `STORYBOARD.md` (personage in beeld, plek old-town, het ene nieuwe ding) — elk met mijn keuze.
- **Nu**: `CHECK.jpg` goedkeuren ("ga door" voor stap 4: stem, geluid, volledige render, contact sheet, `upload.json`).

## Gepland na het tweede "ga door" (stap 4)

1. **Chatterbox-stem** (gratis, pc): `voice.mp3` + `voice-times.tsv`; daarna alle tijden in de scène op de stem zetten.
2. Geluid (`make_audio.py`): plein→het moment→gebeurtenissen, stilte na de climax, stem erboven, −14 LUFS, piek −1 dB.
3. Volledige render (`render.mjs` + ffmpeg), checks, contact sheet, `upload.json`.

## Notities

- Geen geweld, niemand raakt gewond: het lichaam kan aan het eind alleen nog stilstaan, de markt gaat gewoon door
  (AGENTS.md punt 9).
- Geen muziek, geen eindkaart, geen fade naar zwart; laatste beeld blijft staan.
- `assets/downloads/` blijft buiten git.
