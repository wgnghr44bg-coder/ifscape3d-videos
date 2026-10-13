# Software-overzicht (IfScape3D)

Het volledige overzicht staat in repo **vox-lux**: `SOFTWARE.md`. Kort voor deze repo:

| Wat | Software | Waar | Kost geld? |
|---|---|---|---|
| Afbeeldingen | ComfyUI – Z-Image Turbo (pc) | `vox-lux/tools/comfy/comfy_batch.py` | Nee |
| Bewegende clips | ComfyUI – Wan 2.2 TI2V-5B (pc) | `vox-lux/tools/comfy/comfy_batch.py`; prompts per video in `comfy-prompts.md` | Nee |
| Clipcontrole | OpenCV | `tools/check_clips.py` | Nee |
| **Stem (standaard)** | Chatterbox als bm_george, rustig (pc) | `vox-lux/tools/comfy/make_voice_local.py` | Nee |
| Stem (alleen op verzoek) | xAI Atlas | `vox-lux/tools/xai_voiceover.py` | **Ja – eerst vragen** |
| Montage / effecten | Craft-apps (FilmCraft, EffectCraft, …) | `tools/install-craft.sh`, uitleg `vox-lux/tools/craft/README.md` | Nee |

Werkwijze: still → ComfyUI (Wan) laat hem bewegen op de pc → clipcontrole → montage met de Craft-apps.
Stills en clips staan in .gitignore: `git add -f`.
