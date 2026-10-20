---
description: Cartoon-video (platte 2D-poppetjes, "What IF … PART 1"-stijl) maken, met kijklink voor de iPhone
---
Nieuwe cartoon: $ARGUMENTS

De eigenaar zit NIET achter de pc: hij volgt alles op zijn iPhone. Vraag hem nooit een commando te draaien; doe alles zelf.
Alles is gratis (code-tekeningen + Chatterbox-stem op deze pc). Schrijf kort en in het Nederlands naar de eigenaar.
Lees eerst `tools/cartoon/README.md` en het voorbeeld `2026-10-20-clone-yourself/` (`script-cues.txt` + `story.js`).

1. `git pull`. Map: `<datum van vandaag>-<korte-slug>/` (bijv. `2026-10-21-become-invisible`).
   Geen onderwerp gegeven? Kies zelf een "What IF you could …?"-superkracht of situatie die nog niet in een map staat.
2. `script-cues.txt` (Engels): 9–12 scènes `{img:s1}` … , elk 1–2 korte zinnen met `[pause]` / `[long pause]`,
   ±110–130 woorden totaal (≈60–75 s). Opbouw: wat-als → het is eerst geweldig → het gaat mis → twist → laatste scène
   `Follow for part two.` Getallen voluit schrijven ("two", niet "2").
3. `story.js`: kopieer de OPBOUW van het voorbeeld (niet de scènes). Gebruik alleen functies uit `tools/cartoon/cartoon.js`
   (`char`, `bedroom`, `classroom`, `desk`, `machine`, `heart`, `word`, `bubble`, `zoom`-hulpje uit het voorbeeld, `lerp`,
   `clamp01`, `blinkAt`, `FLOOR`). Elke `{img:sN}` heeft precies één functie `sN(t, d, T)` in `STORY.scenes`.
   Wat de stem in een scène noemt, moet in die scène te zien zijn. Pas `title` aan (2 regels, elk ≤ 24 tekens).
   Nodig je een plek die er niet is (straat, bos, ruimte …)? Voeg in story.js een eigen functie toe in dezelfde platte stijl
   (rechthoeken/cirkels, 1080 x 780, vloer vanaf y 520, poppetjes op `FLOOR`).
4. `python tools/cartoon/timing.py <map> --vox-lux ..\vox-lux-alteraqon` en `node tools/cartoon/render.mjs <map> --check`.
   Fout in story.js? Herstel en opnieuw. Laat `<map>/CHECK.jpg` (één beeld per scène) beoordelen door `@beeldcontrole`:
   past elk beeld bij de zin, staat niets buiten beeld of over elkaar, is de tekst leesbaar? Herstel tot het goed is.
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
