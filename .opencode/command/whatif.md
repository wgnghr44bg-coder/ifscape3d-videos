---
description: New "What if" storyboard via the generator (tools/whatif)
---
New What if: $ARGUMENTS

Follow the FIRST RULE at the top of AGENTS.md exactly:
1. `git pull origin main`, read `tools/whatif/README.md` and `tools/whatif/examples/sea-rose-10m.plan.json`.
2. `python tools/whatif/whatif.py envs`, pick the place, then `python tools/whatif/whatif.py new <yyyy-mm-dd>-<slug> --question "What if …?" --env <place>`.
3. Fill in `plan.json`: make it EXTREME and gripping ("Gripping first" in AGENTS.md, fantasy allowed), numbers that agree
   everywhere, and `counter_matches` so the counter shows what you see.
4. `python tools/whatif/whatif.py check <folder>` until ALL CHECKS PASSED.
5. Ask @physics-review to review `<folder>/STORYBOARD.md`; fix every real problem in `plan.json` and run check again.
6. Show the owner STORYBOARD.md and the physics review, then STOP.
