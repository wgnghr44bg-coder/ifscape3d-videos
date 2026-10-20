---
description: Cartoon-video (platte 2D-poppetjes, "What IF … PART 1"-stijl) maken, met kijklink voor de iPhone
---
Nieuwe cartoon: $ARGUMENTS

De eigenaar zit NIET achter de pc: hij volgt alles op zijn iPhone. Vraag hem nooit een commando te draaien; doe alles zelf.
Alles is gratis (code-tekeningen + Chatterbox-stem op deze pc). Schrijf kort en in het Nederlands naar de eigenaar.
Lees eerst `tools/cartoon/README.md` en het voorbeeld `2026-10-20-clone-yourself/` (`script-cues.txt` + `story.js`).

1. `git pull`. Map: `<datum van vandaag>-<korte-slug>/` (bijv. `2026-10-21-become-invisible`).
   Geen onderwerp gegeven? Kies zelf een "What IF you could …?"-superkracht of situatie die nog niet in een map staat.
2. EIGEN VERHAAL eerst (eigenaar 21 okt 2026: "niet echt een eigen verhaal"). Schrijf `<map>/idee.md` (5 regels):
   - de kracht/situatie in één zin;
   - 3 momenten die ALLEEN bij dit onderwerp kunnen (bij onzichtbaar bv. door een feest sluipen, een hond die je wél ruikt);
   - 3–5 plekken die bij dit verhaal horen. Bouw ze ZELF uit het script met de bouwdoos `place({...})` (zie hieronder);
     de vaste plekken (`bedroom`, `classroom`, `street`, `park`, `kitchen`, `space`, `beach`) alleen als ze echt passen;
   - het einde/de twist, eigen voor dit onderwerp.
   VERBODEN (komt uit het eerste voorbeeld): een voorwerp met "één woord erop", "at first it's amazing", school/cijfers/A+,
   mama die langs je loopt, "you are the copy". Kopieer GEEN zinnen of scènes uit andere mappen; alleen de opbouw van story.js.
   `script-cues.txt` (Engels): 9–12 scènes `{img:s1}` …, elk 1–2 korte zinnen met `[pause]` / `[long pause]`,
   100–140 woorden totaal (≈60–75 s). Laatste zin mag `Follow for part two.` zijn. Getallen voluit ("two", niet "2").
3. `story.js`: kopieer de OPBOUW van `2026-10-20-clone-yourself/story.js` (niet de scènes). Gebruik functies uit
   `tools/cartoon/cartoon.js` (`char`, de plekken hierboven, `desk`, `machine`, `heart`, `word`, `bubble`, `lerp`,
   `clamp01`, `blinkAt`, `FLOOR`). Elke `{img:sN}` heeft precies één functie `sN(t, d, T)` in `STORY.scenes`.
   De hoofdpersoon ("you") is ALTIJD `char({ ...HOOFDPERSOON, x, y, ... })` (vaste keuze eigenaar).
   Andere mensen: `skin` (bv. '#f6d2b0', '#d9a273', '#8a5a3b'), `hair`, `top` ('jas', 'hoodie', 'tshirt', 'trui', 'pak').
   BOUWDOOS (plek uit het script, zonder zelf SVG te tekenen), bijvoorbeeld een bos 's nachts:
   `place({ back: 'night', ground: 'grass', items: [['moon'], ['pine', 100], ['tree', 330], ['bush', 480]] })`
   - `back`: 'day' | 'night' | 'sunset' | 'space' | een kleur; `wall: true` = binnen (back = muurkleur, bv. '#e8dcc8').
   - `ground`: 'wood' | 'grass' | 'road' | 'tiles' | 'sand' | 'snow' | 'water' | 'carpet' | 'moon'.
   - `items` (x = midden, 0–1080; volgorde = van achter naar voor): sun, moon, cloud(x,y), mountain(x,kleur),
     building(x,kleur,hoogte), house(x,kleur), tree(x), pine(x), bush(x), fence(x,breedte), lamp(x), car(x,kleur),
     window(x,y), door(x), picture(x,y), shelf(x,y), table(x), sofa(x,kleur), bed(x), tv(x), fridge(x), counter(x),
     board(x,tekst), rug(x,kleur), rock(x), sign(x,tekst), text(x,y,tekst,kleur).
   Ontbreekt er iets wat het script noemt? Voeg het toe als eigen functie in story.js in dezelfde platte stijl.
   Wat de stem in een scène noemt, moet in die scène te zien zijn. Pas `title` aan (2 regels, elk ≤ 24 tekens).
   Controle: `python tools/cartoon/check_story.py <map>` tot er `VERHAAL OK` staat. Nooit omzeilen: herschrijf het verhaal.
4. `python tools/cartoon/timing.py <map> --vox-lux ..\vox-lux-alteraqon` en `node tools/cartoon/render.mjs <map> --check`.
   Fout in story.js? Herstel en opnieuw. Laat `<map>/CHECK.jpg` (één beeld per scène) beoordelen door `@beeldcontrole`:
   past elk beeld bij de zin, staat niets buiten beeld of over elkaar, is de tekst leesbaar? Herstel tot het goed is.
   (Bestaat `@beeldcontrole` niet: bekijk CHECK.jpg zelf en meld in het rapport "beelden niet door @beeldcontrole bekeken".)
5. Stem + video op de ACHTERGROND (duurt minuten; je shell zou het afkappen):
   `Start-Process powershell -ArgumentList '-ExecutionPolicy','Bypass','-File','tools\cartoon\maak-video.ps1','-Map','<map>','-GeenOphalen','-GeenPush' -RedirectStandardOutput <map>\maak.log -RedirectStandardError <map>\maak.err -WindowStyle Hidden`
   Kijk elke minuut in `<map>\maak.log` tot er `KLAAR` staat (of FOUT: lees maak.err, herstel, start opnieuw;
   de stem wordt niet opnieuw gemaakt zolang voice.mp3 bestaat). De video staat dan in `C:\Users\rane\Videos\alteraqon\cartoon\<slug>.mp4`.
6. Kijklink (Tailscale), zoals in `..\vox-lux-alteraqon\AGENTS.md` stap "Kijklink voor de iPhone": draait `serve_videos.py` nog niet
   op `<tailscale-ip>:8765`, start hem (map `C:\Users\rane\Videos\alteraqon`). Links (controleer elk met `curl -I` → 200):
   - Bekijken: `http://<ip>:8765/cartoon/<slug>.mp4`
   - Downloaden: `http://<ip>:8765/cartoon/<slug>.mp4?download=1`
7. `git add <map>/script-cues.txt <map>/story.js <map>/timing.json <map>/CHECK.jpg <map>/voice.mp3 <map>/voice-times.tsv`, commit, push.
8. Rapport aan de eigenaar, met de twee links BOVENAAN, dan: titel, duur, korte samenvatting van het verhaal, kosten (0).
