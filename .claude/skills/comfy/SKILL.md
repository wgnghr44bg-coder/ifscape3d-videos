---
name: comfy
description: Beelden, bewegende clips en lokale stem maken via ComfyUI op de pc van de eigenaar (gratis). Gebruik als de eigenaar "comfy" of "ComfyUI" zegt, of beelden/clips wil zonder xAI.
---
Volg `vox-lux/tools/comfy/README.md` (clone vox-lux zo nodig). Kort:
1. Zet de stills en een `comfy-prompts.md` (naam | beweging) in de videomap, commit en push (`git add -f` voor stills).
2. Vraag de eigenaar de clips op zijn pc te maken met ComfyUI (Wan 2.2 TI2V-5B); ComfyUI is vanuit de cloud niet bereikbaar.
3. Na zijn push: pull, `python3 tools/check_clips.py <map>/clips`, bekijk elk blad en schrijf `<map>/clips/CHECKED.txt`.
4. Monteer met de Craft-apps. Gebruik nooit xAI voor beelden of clips als de eigenaar "comfy" zegt.
