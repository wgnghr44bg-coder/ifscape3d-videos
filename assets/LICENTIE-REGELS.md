# Licentieregels voor 3D-modellen (vast, voor elke video)

## Kort (Nederlands)
| Bron | Licentie | Naamsvermelding nodig? | Mag in de repo? |
|---|---|---|---|
| **Kenney** (`assets/kenney/`) | CC0 | Nee | Ja |
| **Quaternius** (`assets/downloads/quaternius/`) | CC0 | Nee | Ja, alleen de modellen die je gebruikt |
| **Poly Pizza** (`assets/downloads/polypizza/`) | CC0 of CC-BY + API-voorwaarden | **Ja, altijd** | **Alleen de modellen die je in een video gebruikt** |
| **NASA** | public domain | Netjes om te noemen | Ja |
| Free3D, CGTrader, BlenderKit, onbekende licentie | — | — | **Niet gebruiken** |
| AI-generatoren (Tripo, 3D AI Studio) | kost geld | — | **Alleen na toestemming van de eigenaar** |

### Poly Pizza – twee vaste voorwaarden (API-voorwaarden, akkoord gegeven op 17 okt 2026)
1. **Naamsvermelding:** voor elk Poly Pizza-model in een video staan de **maker**, **"Poly Pizza"** en de **link naar het model**
   in de YouTube-beschrijving. De tekst staat kant-en-klaar in `assets/downloads/polypizza/CREDITS.csv` (kolom `Attribution`).
2. **Niet doorgeven:** de verzameling **niet in bulk** aanbieden of delen. `assets/downloads/` gaat **nooit** in git.
   Alleen een model dat echt in een video gebruikt wordt, wordt gekopieerd naar `assets/polypizza/<model>/` en gecommit.
Verder: geen gebruik door een bedrijf met meer dan $50.000 omzet per jaar; de API geeft geen garantie dat hij werkt.

## Rules for the agent (English)
- Before using a model, check its source and licence in this file.
- **Poly Pizza model used in a video** →
  1. copy only that `.glb` from `assets/downloads/polypizza/...` to `assets/polypizza/<slug>/` and commit only that;
  2. take its `Attribution` line from `assets/downloads/polypizza/CREDITS.csv`;
  3. add it to the video's `upload.json` under `"credits"` (a list) **and** at the end of `"description"` as
     `3D models: "<Title>" by <Creator> (Poly Pizza, <licence>) <link>` — one line per model.
- **Never** commit `assets/downloads/` (it is in `.gitignore`), and never upload or share the downloaded collection.
- Quaternius / Kenney (CC0): no credit needed; you may add "3D models: Kenney / Quaternius (CC0)" to the description.
- If a model's licence is unclear or not CC0 / CC-BY: do not use it.
- Before the final check (QC), verify: every Poly Pizza model used in `scene.html` has a credit line in `upload.json`.
