# AGENTS.md — standing rules for every IfScape3D "What if" video

These are the owner's standing rules (PART A). Read them before starting any new "What if".
The template to copy is `2026-10-04-gravity-doubled/` — read its `GRAVITY-VIDEO.md` first.

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
