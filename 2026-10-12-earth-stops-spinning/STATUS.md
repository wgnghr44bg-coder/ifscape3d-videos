# What if Earth stopped spinning? – stand van zaken (12 okt 2026, avond)

Kanaal: **IfScape3D** (shorts, Atlas-stem). Werkwijze: **xAI maakt een stilstaand beeld → Comfy (Wan 2.2 TI2V-5B op de pc van de eigenaar) laat het bewegen → montage met `make.py`.**

## Gekozen stijl (eigenaar)
- Beeld: `stills/scene02d3d.jpg` = **de stijl** voor alle beelden. Prompt + stijltekst: `stills.py`, sleutel `02d` met `STYLE_3D`
  (draai als `python3 stills.py <naam>3d`).
- Regels van de eigenaar:
  - **Duidelijk 3D** (de kanaalnaam), maar **kleurrijk en gedetailleerd** (geen kale klei/plastic).
  - **Het bewegende onderwerp groot en dichtbij in beeld** (geen kleine mensjes in de verte).
  - Hoofdonderwerp **in het midden en helemaal in beeld** (02d3d stond te ver links; Wan schoof hem gelukkig bij).
  - Beweging **rustig, langzaam, maar menselijk en realistisch** (zie de prompt hieronder).
  - Er moet **spanning** in zitten zoals bij de andere shorts.
- Resultaat dat goed was: `clips2/park-3d-dichtbij.mp4` (480x832).

## Comfy op de pc (remote-control-sessie "Pc", session_017RyCYbT532cVo5nL4e2g3T)
- Alleen `wan2.2_ti2v_5B` (8 GB videokaart, 17 GB RAM, geheugen krap). Script op de pc: `maak_video.py`.
- **480x832 ≈ 5 min per clip**; 720x1280 duurt > 30 min per clip (eventueel 's nachts voor de eindversie).
- De pc pusht via `gh` (device-login gedaan). Mp4's staan in `.gitignore` → `git add -f`.
- Beweeg-prompt die goed werkte (aanpassen per scène):
  `natural realistic human motion at a calm pace, ... slow subtle camera push in, smooth and lifelike`
  Negatief: `fast motion, sudden movement, jerky, robotic, stiff, frozen, shaking, morphing, distorted face, extra fingers, extra limbs, text, watermark`

## Script
- `script-v2.txt` = nieuw script volgens de **6-stappen-opbouw van Alteraqon** (vox-lux branch `alteraqon`, `alteraqon/README.md`):
  opening → POV-opbouw → "Then." + flits/knal → feiten met grote getallen → "But…"-twist → "So remember." + vraag. ±70 s.
  **Nog geen stem voor v2** (`voice.mp3` hoort bij het oude `script.txt`).
- Stem maken: `python3 ../../vox-lux/tools/xai_voiceover.py script-v2.txt -o voice.mp3 --voice atlas --speed 1.0 --proxy-auth` (paar cent, eerst vragen).

## Montage (`make.py`)
- Werkt met het oude script/stem en clips/ (eerste test, afgewezen: "ziet er echt niet uit").
- Bevat al de spanning: GROUND SPEED-teller 1000→0, witte flits, dreun, schudden, hartslag + stilte vóór de klap,
  WIND SPEED-teller 0→1000, ondertitels, loudnorm −14 LUFS. Tijden komen uit pauzes in voice.mp3 → **aanpassen aan v2-stem**.

## Volgende stappen
1. ~12 beelden maken in de stijl van 02d3d, één per zin van script-v2 (± $0,24 – **eerst vragen**).
2. Pc laat ze bewegen (480x832, prompts per scène meegeven).
3. Atlas-stem voor script-v2 (paar cent – **eerst vragen**).
4. make.py aanpassen aan de nieuwe tijden en clips, renderen, telefoonversie (< 30 MB) sturen.

Kosten tot nu toe: ±$0,15 (stem + 6 xAI-beelden).
