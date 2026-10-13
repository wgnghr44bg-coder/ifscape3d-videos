# AGENTS.md – instructies voor OpenAI Codex (IfScape3D)

Codex leest dit bestand automatisch. Zelfde afspraken als `CLAUDE.md`; houd ze gelijk.

- Praat simpel Nederlands met de eigenaar. **Vraag altijd eerst toestemming** voor alles wat geld kost (xAI-beelden, stem, video).
- **"software"** → lees `SOFTWARE.md` (welke tools er zijn en waar ze staan).
- **"comfy"** → beelden, clips en lokale stem via ComfyUI op de pc van de eigenaar, nooit via xAI.
  Scripts + uitleg staan in repo `wgnghr44bg-coder/vox-lux`: `tools/comfy/README.md` (`comfy_batch.py`, `voice_test_local.py`).
  Clipcontrole hier: `python3 tools/check_clips.py <map>/clips` → noteer `<map>/clips/CHECKED.txt` (`naam OK` / `USE <s>` / `STILL`).
- Standaardstem: Chatterbox als bm_george, rustig (gratis, pc): `vox-lux/tools/comfy/make_voice_local.py <map>`. xAI-stem alleen op verzoek.
- Craft-apps (FilmCraft, EffectCraft, …): installeren met `bash tools/install-craft.sh`;
  uitleg en voorbeelden: `vox-lux/tools/craft/README.md`.
- Structuur: per video één map `<datum>-<slug>/` (zie `README.md`). Geen mp4, stills of wav's committen.
- Render-engine: repo `vox-lux`, branch `claude/whatif-machine` (commit staat in `ENGINE.txt` per video).
- Werkwijze-uitleg ("skills") in `.claude/skills/*/SKILL.md` – gewone Markdown, ook voor Codex bruikbaar.
- Werk op een eigen branch, commit + push, PR alleen als de eigenaar dat vraagt.
