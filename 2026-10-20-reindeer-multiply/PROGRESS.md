# IfScape3D — What if the reindeer kept multiplying? (nachtrun 20-10-2026)

Status: **af** — alle controles groen, beeld gerenderd, ingepland.

| Stap | Status |
|---|---|
| Onderwerp gekozen (multiply-effect, forest-camp, diercategorie) | klaar |
| `whatif.py check` (plan/story/getallen/bronnen) | ALL CHECKS PASSED |
| `@physics-review` (2 ronden) | alle punten opgelost (teller loopt lineair → drip van 32/uur; geen nacht in een daglicht-scene; geen "half a million" want dat leest als 1 000 000; 257 = 1 + 32×8) |
| `autoscene.py build` (scene.html uit plan.json + scene.json) | klaar |
| `scenecheck.mjs` (beeldkeurmeester) | ALL PICTURE CHECKS PASSED |
| `@beeldcontrole` op CHECK.jpg | ronde 1: NEE (kudde te klein in beeld 1-2, climax te statisch) → ronde 2: **JA voor beeld 3-9** (de kudde vult het beeld, de climax is spectaculair); beeld 1-2 blijven klein omdat het vaste sjabloom de camera op de hele kudde richt, beeld 10-11 zijn statisch omdat het laatste beeld blijft staan (huisregel) |
| Stem (Chatterbox, alteraqon-stem, 700/1600/600 ms, tempo 0.92) | voice.mp3 + voice-times.tsv |
| Render + `finish.py` | klaar (1080x1920, 79,8 s, met geluid) |
| `upload.json` + inplannen | klaar: https://youtu.be/0BmUU6TeIVA (openbaar 20-10-2026 11:00 NL) |

## Belangrijk bij deze video
- Het effect is `multiply`: de teller telt de dieren (1 → 257) en een tweede regel de uren (0 → 8 h).
  De som is `herd = start + per_hour × hours = 1 + 32 × 8 = 257` — de teller en de klok lopen
  als één lijn, dus wat de stem zegt kan nooit tegenspreken wat er staat.
- De scene is `forest-camp` met 257 kopieën van het Kenney-rendier (holiday-kit) op een spiraal
  met 0,7 m tussenruimte, tegen de klok in (het sjabloon bepaalt de stand).
- De stem noemt alleen wat de beeldkeurmeester echt kan meten: de rendieren (dichtbij in stap 1 en
  van boven in de climax) en de campers (alleen als de camera nog dichtbij staat). Bomen, tenten en
  water staan wél in beeld, maar worden niet beloofd in de tekst.
- `tools/whatif/autoscene.html`: de commentaarregel met `"wide": true` zorgde dat de beeldkeurmeester
  alle video's als liggend behandelde (stills werden bijgesneden). Opgelost, nu zijn de stills staand.
