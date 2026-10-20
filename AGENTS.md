# AGENTS.md — standing rules for every IfScape3D "What if" video

These are the owner's standing rules (PART A). Read them before starting any new "What if".
The template to copy is `2026-10-04-gravity-doubled/` — read its `GRAVITY-VIDEO.md` first.

## 🌙 NACHTRUN — automatisch, elke nacht (eigenaar 19 okt 2026: "ja doe de nacht maar")

Staat er "NACHTRUN" in je opdracht, dan maak je ZELF één complete Short en zet je hem op het schema. De eigenaar slaapt:
stel NOOIT een vraag en wacht nergens op. Hier gelden GEEN STOP-momenten (de FIRST RULE en PART A punt 11 "STOP en laat zien"
gelden alleen als de eigenaar zelf in de chat zit). Alle controles gelden wél. Lukt iets echt niet na 3 pogingen: stop, schrijf
"NIET ingepland: <reden>" in het rapport, commit wat er is.
Je bouwt de scène NIET zelf in three.js: het vaste sjabloon `tools/whatif/autoscene.py` doet dat (zie de uitleg bovenin dat bestand).

Paden op de pc: deze repo = de map waarin je start; vox-lux = `..\vox-lux-alteraqon`;
Chatterbox-python = `C:\Users\rane\Documents\Standaardproject\whatif\stem-env\Scripts\python.exe`; video's = `C:\Users\rane\Videos\alteraqon\ifscape3d\`.

0. **Eenmalig** (alleen als `node_modules/three`, `node_modules/@fontsource/inter` of een ander pakket ontbreekt):
   `npm install three@0.170.0 playwright @fontsource/playfair-display @fontsource/cormorant-garamond @fontsource/inter` en `npx playwright install chromium`.
1. `git pull origin main`. **Onderwerp**: zelf kiezen, spannend en extreem ("Gripping first", fantasy mag), nooit een titel die al
   in `*/upload.json`, `*/plan.json` (question) of `..\vox-lux-alteraqon\alteraqon\*\upload.json` staat. Het onderwerp MOET passen bij
   één van de 4 effecten van het sjabloon:
   - `grow` – iets/iemand groeit of krimpt (teller = hoogte in m of cm) – bijv. een reus, een kat zo groot als een huis;
   - `water` – water stijgt over een plek (teller = waterhoogte in m) – overstroming, zee stijgt, gletsjers smelten;
   - `multiply` – iets vermenigvuldigt zich (teller = aantal, max 400) – konijnen, bomen, robots;
   - `rain` – iets valt uit de lucht en stapelt op (teller = aantal, max 400) – sneeuwpoppen, pompoenen, meteorieten.
   Plekken: `python tools/whatif/whatif.py envs`; modellen: `assets/CATALOG.md`.
   **Afwisselen** (eigenaar: "gevarieerd"): kijk naar de laatste 3 video's (`*/plan.json`, nieuwste eerst): nooit hetzelfde
   effect, dezelfde plek of hetzelfde soort onderwerp (mens, dier, natuur, ruimte, eten, voorwerp) als de vorige video.
   Wissel ook af tussen kleine en gigantische getallen, en tussen grappig en spannend.
2. `python tools/whatif/whatif.py new <yyyy-mm-dd>-<slug> --question "What if …?" --env <plek>` en vul `plan.json`
   (zoals de FIRST RULE), met deze extra regels voor het sjabloon:
   - `on_screen` alleen: het onderwerp (bijv. "you", "rabbits"), bij water het waterwoord ("sea", "water"), en dingen van de plek
     waarvan de modelnaam in `python tools/whatif/autoscene.py models <plek>` staat (die komen in `tags`). Noem in het script
     NIETS anders dat zichtbaar moet zijn.
   - `counter_matches`: grow → `{"object": "<onderwerp>", "measure": "height", "unit": "m", "hud_number": 0}`;
     water → `{"object": "<waterwoord>", "measure": "top", "unit": "m", "hud_number": 0, "from_ground": true}`;
     multiply/rain → `{"none": "aantal is niet te meten"}`. `subject` = het onderwerp-woord (niet bij water).
   - `"voice": "alteraqon"` (zet `whatif.py new` er zelf in): 115–150 woorden.
   - **Script = Alteraqon-opbouw met spanning** (eigenaar 20 okt 2026: "geen script zoals Alteraqon, geen spanning"; de reindeer-video
     is daarom verwijderd). Laat de 11 stappen ALTIJD schrijven door `@scriptschrijver` met de Script-checklist van
     `..\vox-lux-alteraqon\AGENTS.md` (hook, POV, korte spannende zinnen, echte twist met bron):
     1 "What if …?" + extreem gevolg · 2 "You are …" · 3 opbouw · 4 "Then." (witte flits) · 5-7 "After one hour." / "After …"
     (tijdstappen in woorden) · 8 climax (daarna stilte) · 9 "But here's the twist." + ECHT verrassend feit · 10 wat het betekent ·
     11 "So remember." + vraag aan de kijker. Getallen voluit, geen "Right now". `whatif.py check` controleert dit.
     Een saaie, opsommende tekst ("You count them… You give up counting…") = opnieuw laten schrijven.
   - Teller-label (`counter.label`, `second_label`) past bij DIT onderwerp, kort en in hoofdletters (bijv. "HEIGHT", "SEA LEVEL", "RABBITS").
   - Ondertitels (elke gesproken zin onderin, zoals Alteraqon) maakt het sjabloon zelf uit `voice-times.tsv`.
   - Geen `scale_checks`, geen close-ups in `shots` (het sjabloon heeft 3 shots: ooghoogte → ander standpunt vanaf stap 7 → hoog vanaf stap 9).
   - `whatif.py check` tot ALL CHECKS PASSED; daarna `@physics-review` op `STORYBOARD.md`, echte problemen oplossen, opnieuw check.
3. `scene.json` in de map (voorbeeld en alle velden: bovenin `tools/whatif/autoscene.py`). Het model van het onderwerp staat onder
   `assets/` (bijv. `kenney/mini-characters/character-female-b.glb`, `kenney/nature-kit/...`, `nasa/...`); controleer dat het bestand bestaat.
4. **Stem** (Chatterbox, gratis): kopieer `script.txt` naar `script-cues.txt` en start op de ACHTERGROND:
   `Start-Process <Chatterbox-python> -ArgumentList '..\vox-lux-alteraqon\alteraqon\tools\make_voice_local.py','<map>','..\stem-cache','--pause-ms','700','--long-pause-ms','1600','--sentence-pause-ms','600','--speed','0.92' -RedirectStandardOutput <map>\voice.log -WindowStyle Hidden`
   (precies dezelfde stem en hetzelfde rustige tempo als Alteraqon; plan.json heeft daarom `"voice": "alteraqon"`: 115–150 woorden, ±75–95 s)
   en kijk elke minuut of `voice-times.tsv` er is. Daarna opnieuw `whatif.py check` (de tijden komen nu uit de stem).
5. `python tools/whatif/autoscene.py build <map>` (een FOUT daar = plan.json/scene.json aanpassen), dan
   `node tools/whatif/scenecheck.mjs <map>` tot **ALL PICTURE CHECKS PASSED** (oplossen via scene.json: `at` = andere plek op land,
   `tags`; of via plan.json: een woord dat niet te zien is uit het script halen). Max 5 rondes.
   Laat `@beeldcontrole` `CHECK.jpg` bekijken: "Is het onderwerp in elk beeld duidelijk en groot? Is het spannend? JA/NEE + waarom". NEE: verbeter en opnieuw.
6. **Render** (op de ACHTERGROND, duurt minuten): `node tools/whatif/render.mjs <map> video 4 --gpu`
   (geeft hij fouten of zwarte beelden: zonder `--gpu`). Dan
   `python tools/whatif/finish.py <map> C:\Users\rane\Videos\alteraqon\ifscape3d\<slug>.mp4` – moet eindigen op "Klaar en gecontroleerd".
7. `upload.json` = `upload.draft.json` + `"tags"` (4 stuks: "what if", onderwerp, langere zoekterm, "3d animation") +
   `"tiktok"` (1–2 prikkelende zinnen met emoji, vraag met 👇, #whatif #fyp + 1–3 onderwerp-hashtags). Beschrijving: eerste regel
   een korte prikkelende zin + vraag met 👇, daarna de bronnen en credits zoals in de draft.
8. **Inplannen** alleen als ALLES groen is (check, physics-review zonder open echte fouten, scenecheck, @beeldcontrole JA, finish.py):
   `python ..\vox-lux-alteraqon\alteraqon\tools\upload_short.py <map> C:\Users\rane\Videos\alteraqon\ifscape3d\<slug>.mp4 --schedule`
   (kiest zelf kanaal @ifscape3d en het schema uit `channel.json` / `schedule.json`). Anders: "NIET ingepland: <reden>".
9. `PROGRESS.md` kort bijwerken, `git add <map>` (geen mp4/check/stills: staan in .gitignore), commit `"<slug>: nachtrun-short"`, `git push origin main`.
10. Rapport ONDERAAN in het rapportbestand uit je opdracht (max ±12 regels): `=== IfScape3D: <titel> ===`, ingepland op
    <datum/tijd NL> + YouTube-link (of NIET ingepland + reden), kijklink `http://<tailscale-ip>:8765/ifscape3d/<slug>.mp4`, de TikTok-tekst.

### 🌙 NACHTRUN – LANGE video (opdracht "Maak een lange IfScape3D-video"; eigenaar 19 okt 2026)
Een lange video (16:9, ±3,5–4,5 min) = **3 hoofdstukken**, elk precies gemaakt als een Short hierboven (stap 1–6), met deze verschillen:
- Eén overkoepelend onderwerp met 3 oplopende hoofdstukken, elk met een ander effect of een andere plek
  (bijv. "What if everything kept growing?" → 1: jij groeit (grow, old-town) · 2: de zee stijgt (water, harbor) · 3: konijnen
  vermenigvuldigen (multiply, forest-camp)). Hoofdstuk 3 = het spectaculairst.
- Mappen: `<datum>-<slug>-1`, `-2`, `-3` (elk een gewone `whatif.py new`) + de lange map `<datum>-<slug>` met `long.json`:
  `{"chapters": ["<datum>-<slug>-1", "<datum>-<slug>-2", "<datum>-<slug>-3"], "thumb_chapter": 3, "thumb_at": 0.7}`.
- In elke `scene.json`: `"wide": true` en `"title"`: hoofdstuk 1 = de grote vraag, 2 en 3 = `"Chapter 2: <korte titel>"` enz.
- Render per hoofdstuk: `node tools/whatif/render.mjs <hoofdstuk> video 4 --wide --gpu` en
  `python tools/whatif/finish.py <hoofdstuk> <hoofdstuk>\chapter.mp4 --wide`.
- Daarna: `python tools/whatif/make_long.py <lange-map> C:\Users\rane\Videos\alteraqon\ifscape3d\<slug>.mp4`
  (moet eindigen op "Klaar en gecontroleerd"; maakt ook `afbeeldingen/T01.png`).
- **Thumbnail**: `thumbnail.json` in de lange map, bijv. `{"image": "T01", "small": "WHAT IF EVERYTHING…", "lines": ["KEPT", "GROWING?"], "accent": "gold"}`
  (2–3 regels, max ±10 tekens, twist niet verklappen), dan `python ..\vox-lux-alteraqon\alteraqon\tools\make_thumbnail.py <lange-map>`.
  Laat `@beeldcontrole` hem beoordelen ("zou jij klikken? tekst leesbaar?").
- `upload.json` in de lange map: titel `What if …?` (zonder #shorts), beschrijving 2–4 zinnen + vraag met 👇 + bronnen/credits
  van alle hoofdstukken + 3 hashtags (geen #shorts), 4 tags, GEEN tiktok.
- Inplannen (alleen als alles groen): `python ..\vox-lux-alteraqon\alteraqon\tools\upload_short.py <lange-map> <mp4> --long --schedule`.
  Lukt de thumbnail niet (kanaal niet geverifieerd): meld in het rapport de link `http://<tailscale-ip>:8765/ifscape3d/<slug>-thumbnail.jpg`
  (kopieer thumbnail.jpg daarheen).
- Commit de 3 hoofdstukmappen + de lange map (geen mp4's).

## ⚠️ FIRST RULE — when the owner says "What if …"

Whenever the owner gives you a "What if …" (in any words, also in Dutch: "wat als …"), do exactly this, nothing else first:

1. `git pull`, then read `tools/whatif/README.md` and the example `tools/whatif/examples/sea-rose-10m.plan.json`.
2. Pick the place: `python tools/whatif/whatif.py envs` (and `environments/PLAN-100.md`).
3. `python tools/whatif/whatif.py new <yyyy-mm-dd>-<slug> --question "What if …?" --env <place>`
4. Fill in every TODO in `<folder>/plan.json` (new sentences, never copied).
5. `python tools/whatif/whatif.py check <folder>` → fix every FAIL in `plan.json` → run again, until **ALL CHECKS PASSED**.
   Never write `STORYBOARD.md` or `script.txt` by hand, and never work around a check.
6. Ask the subagent `@physics-review` (`.opencode/agent/physics-review.md`) to review `STORYBOARD.md`. Fix every real
   problem in `plan.json` and run `check` again.
7. Show the owner the generated `STORYBOARD.md` (+ the physics review) and STOP. Build nothing before the owner says "ga door".

Shortcut in OpenCode: `/whatif <question>` does all of this (`.opencode/command/whatif.md`).

## PART A — standing rules (every video, now and in the future)

Whenever the owner asks for a new "What if", make it the same way as the gravity video, adapted to the new scenario:

1. **Format.** YouTube Short, vertical 1080x1920, 30 fps, 80–90 s, English.
2. **Method.** A code-built low-poly 3D scene (three.js) rendered with `render.mjs` + ffmpeg, sound with `make_audio.py`.
   Start by copying `2026-10-04-gravity-doubled/` to a new folder `<yyyy-mm-dd>-<slug>/` (without the mp4).
   Never use paid services (no xAI, ElevenLabs, or paid image/video/voice APIs).
3. **Voice.** The owner's Chatterbox voice, calm, every sentence with fixed pauses (`[pause]` = 0.5 s, `[long pause]` = 1 s).
   Output `voice.mp3` + `voice-times.tsv`.
4. **Story.** The same 11 steps as the gravity script, with new sentences for the new topic (never copy sentences):
   1. "Imagine… in a single second/minute, <it happens>." + what that means
   2. where you are: "You are standing …" (the place on screen)
   3. the normal number → the new number (the counter on screen jumps)
   4. what you notice yourself
   5. how people react; cars, trees, things in the street
   6. one real fact with a number
   7. it escalates; one big image
   8. why it goes wrong ("… But …")
   9. climax with ≈5 s of silence (4 × `[long pause]`)
   10. aftermath: the dust settles / what is still there
   11. a closing line that stays with you

   150–200 words, "you" = the viewer, European units, facts must be correct (sources in `upload.json`).
5. **Library first.** Pick the place from `environments/PLAN-100.md` (✅ use it, 🟡 adapt it, ⬜ build it as
   `environments/<name>.js` with `kit.js` + 3 cameras, check with `node environments/preview.mjs <name>`, then mark it ✅).
   Find models in `assets/CATALOG.md`. Max 1–2 NEW things per video; reuse everything else.
6. **Picture structure.** 3 shots with hard cuts, each one slow steady forward camera move:
   shot 1 eye level in the place (≈0–46 s), shot 2 closer to where it escalates (≈46–57 s),
   shot 3 high above the whole area for the climax (≈57 s–end).
   Title large and centred 0–9 s; from 9 s a counter top left (label + big number + second line);
   3–4 short italic captions at key facts. Serif fonts (Playfair Display, Cormorant Garamond).
   NO logo, NO watermark, NO end card, NO fade to black: the last frame stays.
7. **Sync.** What the voice says, you see on screen at that moment (times = `voice-times.tsv` + 0.5 s).
8. **Sound.** No music. Normal sound of the place → the moment (a big change in sound) → sounds of everything that
   happens, placed on the events → near silence after the climax. Voice always on top, effects ducked ≈8 dB,
   final mix −14 LUFS, peak −1 dB.
9. **Safety.** No violence, nobody gets hurt, no recognisable real people, people get away safely.
10. **Licences.** Follow `assets/LICENTIE-REGELS.md`. Prefer CC0 (Kenney, Quaternius). Poly Pizza: credit creator +
    "Poly Pizza" + link in `upload.json` (credits list + end of description) from `CREDITS.csv`. Never commit
    `assets/downloads/`; copy only models used in a video to `assets/<source>/<slug>/`. NASA: no NASA logo, no endorsement.
11. **Work order.**
    1. `STORYBOARD.md` first, **always via the generator** (`tools/whatif/README.md`):
       `python tools/whatif/whatif.py new <folder> --question "What if …?" --env <env>` → fill in `<folder>/plan.json`
       → `python tools/whatif/whatif.py check <folder>` → fix every FAIL and run it again until **ALL CHECKS PASSED**.
       It then writes `STORYBOARD.md`, `script.txt` and `upload.draft.json`. Never write them by hand.
       Worked example: `tools/whatif/examples/sea-rose-10m.plan.json`. → STOP and show the owner.
    2. Build scene + Chatterbox voice. The scene must have the hooks for the picture checker: `window.renderAt(t)`,
       `window.ready`, `window.WHATIF = { THREE, scene, camera, renderer }`, `obj.userData.tag = '<on_screen word>'` on everything
       the voice names, the counter in `<div id="hud">` (example: `tools/whatif/examples/scene-hooks/scene.html`).
    3. Picture check: `node tools/whatif/scenecheck.mjs <folder>` → fix every FAIL in the scene and run it again until
       **ALL PICTURE CHECKS PASSED**. Then look at `CHECK.jpg` yourself against the VISUAL QUALITY CHECKLIST, fix, max 3
       rounds. Commit + push `CHECK.md` and `CHECK.jpg` (not `check/`) → STOP, show the owner `CHECK.jpg` and what you fixed.
    4. After "ga door": sound, full render, checks, contact sheet, `upload.json`.
12. **PROGRESS.md** in every video folder (what is done, approved, asked); read it first after a compressed or
    new session. Start every new What if in a new session.

## Current defaults on top of PART A (newest owner instructions)

Later owner instructions override PART A where they differ; check `GRAVITY-VIDEO.md` → "Wat nu anders is dan deze video":
- **Gripping first – for EVERY What if, by default (owner, 18 Oct 2026).** The video must hold viewers: big numbers, extreme escalation, something new
  on screen every ~5 s, a spectacular climax. It does NOT have to be real: fantasy is fine everywhere (set
  `"realism": "fantasy"` in plan.json; physics and fact checks then only warn).
  **What must always be right: the counter shows exactly what you SEE** (the giant that the counter calls 3.1 m is 3.1 m
  in the scene, the water the counter calls +4 m is at +4 m) – set `"counter_matches"` in plan.json, scenecheck measures it.
  Numbers in voice, counter and captions agree with each other. No blood or injuries shown.
  How to make every topic extreme: push the number far (years/size/speed) so the counter flies, escalate in steps
  (people → streets → buildings → the whole place), make the climax the biggest picture of the video, and end on one
  unforgettable image. `whatif.py new` starts with `"realism": "fantasy"`; only choose `"real"` when the owner asks.
- **3 shots with hard cuts, exactly like the gravity video (PART A, point 6)** — that stays;
- no end card and no fade to black — the last frame stays;
- European units (kg instead of pounds);
- voice: Chatterbox by default (free, on the owner's PC); xAI only if the owner asks.

## VISUAL QUALITY CHECKLIST (every image pass)

Check this before showing the owner any stills and before rendering the video:
- **Key moment clear on a phone** — subject 6–12 m from camera, big in frame; still just before and after the key moment.
- **Objects look like what they are and lie ON the surface.**
- **Nothing big in front of the camera during the title.**
- **Counter always fully visible.**
- **Every effect the voice names is visible** (start/middle/end for slow effects).
- **Something new every 8–10 s** by camera move or action, NOT by cuts.
- **3 main shots + max 2 close-ups (≈4 s)** — about 6 hard cuts per video.
- **Small lights 4–6 px.**
- **Times always from the current `voice-times.tsv`.**
- **No end card, no fade to black** — the last frame stays.

## Where things live

- Engine: repo `vox-lux`, branch `claude/whatif-machine`, folder `whatif-demo/` (places, forces, `make_whatif.py`).
- This repo holds one finished video per folder: `<yyyy-mm-dd>-<slug>/` (mp4 + scene + script + voice + sound + `upload.json`).
