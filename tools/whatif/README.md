# What if – generator + keurmeester

**Kort (Nederlands):** het model (DeepSeek, LongCat, …) schrijft geen storyboard meer zelf. Het vult één bestand in,
`plan.json`, en `whatif.py check` keurt het. Pas als alles goed is, maakt het script zelf `STORYBOARD.md`,
`script.txt` (met de pauzes) en `upload.draft.json`. Fouten zoals getallen die elkaar tegenspreken, dingen die de stem
noemt maar die niet in beeld zijn, of een hoogtepunt dat niet bij het verhaal past, komen dan niet meer bij jou.
Alleen Python, niets te installeren, gratis.

## For the agent (English)

```
python tools/whatif/whatif.py envs                       # places + their cameras
python tools/whatif/whatif.py new 2026-10-20-<slug> --question "What if …?" --env <env>
#   → fill in every TODO in 2026-10-20-<slug>/plan.json
python tools/whatif/whatif.py check 2026-10-20-<slug>    # repeat until ALL CHECKS PASSED
```

Rules:
- Edit only `plan.json`. Never write `STORYBOARD.md`, `script.txt` or `upload.draft.json` by hand: they are generated.
- Do not show the owner anything while `check` prints a FAIL.
- Do not work around a check (e.g. adding a fake number to the table). Fix the text instead.
- Worked example that passes: `examples/sea-rose-10m.plan.json` (copy the structure, never the sentences).

## What the plan holds and what is checked

| Field | What you write | What `check` enforces |
|---|---|---|
| `question` | the title | starts with "What if ", ends with "?", ≤ 60 characters |
| `spelling` | `metres` or `meters` | the same spelling everywhere; no feet/miles/pounds/°F/mph |
| `pace` | `slow` or `sudden` | a slow story cannot have a violent climax (surge, wave, explosion…) or a jumping counter |
| `numbers` | ONE table: `id`, `value`, `unit`, `said_as` (rounded spoken forms, e.g. 8.8 → 9), `meaning` | every number in script, title, captions and counter (digits **and** words like "two and a half thousand") must be in this table |
| `steps` | the 11 story steps, 1–3 short lines each (≤ 18 words), `pause_after` `pause`/`long` | exactly 11; 150–200 words; step 1 "Imagine", step 2 "You are", step 8 "But"; no `[pause]` tags (they are added) |
| `on_screen` | every visible thing the voice names: `word`, `model`, `looks` | if the voice says "masts", "horse", "statue"… it must be listed, with the model that shows it |
| `counter` | label/from/to/unit + second line, `motion` `steady`/`jump`, `starts_on_word`, `stops_on_word` | the words must be said exactly once (else write `step:word`, e.g. `9:stops`); stop after start |
| `captions` | 3–4 short lines | ≤ 50 characters; numbers checked |
| `facts` | `claim`, `number_ids`, `source`, `url`, `source_says` (the exact words of the source) | all filled in, url is a link |
| `shots` | 3 × `shot` (+ max 2 × `closeup`, 3–5 s): `from_step`, `camera`, `shows` | shot 1 at step 1, shot 3 at or before step 9; camera exists in `environments/<env>.js`, or `custom` + `where` |
| `climax` | `visual`, `why_it_fits_the_closing_line` | must fit `pace` |
| `models` | `name`, `source`, `path`, `new`, `licence`, `credit` | max 2 new; file exists; never `assets/downloads/`; Poly Pizza credit in the exact format of `assets/LICENTIE-REGELS.md` |
| `critic` | 3 weak points you found reading it as a critic + the fix you made | at least 3 |
| `questions` | only what the template does not decide, each with `my_choice` | max 3 |

Timing: `check` estimates the length (2.8 words/s, `[pause]` 0.5 s, `[long pause]` 1 s, ≈5 s silence after step 9,
last frame held 3.5 s) and fails outside 78–92 s. The final times always come from `voice-times.tsv`.

`--skip-files` skips the model-file check (only for testing in the cloud, where `assets/downloads/` copies are missing).
