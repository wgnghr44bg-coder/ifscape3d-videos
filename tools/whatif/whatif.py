#!/usr/bin/env python3
"""IfScape3D "What if" generator + checker.

  python tools/whatif/whatif.py envs
      list the environments and their cameras
  python tools/whatif/whatif.py new <folder> --question "What if ...?" --env <environment>
      make <folder>/plan.json: the template with every field to fill in (TODO)
  python tools/whatif/whatif.py check <folder>
      check plan.json against the house rules. Only when everything passes it writes
      STORYBOARD.md, script.txt and upload.draft.json in <folder>.

The agent only edits plan.json and runs `check` until it says ALL CHECKS PASSED.
Never write STORYBOARD.md or script.txt by hand. See tools/whatif/README.md.
"""
import argparse, json, math, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ENV_DIR = os.path.join(ROOT, 'environments')

WORDS_PER_S = 2.8          # gravity voice: 187 words in 64 s of speech = 2.9 words/s; Chatterbox is a bit calmer
PAUSE, LONG = 0.5, 1.0      # [pause], [long pause]
VO_OFFSET = 0.5             # voice starts at 0.5 s
SILENCE = 4                 # 4 x [long pause] after the climax step (≈5 s with the line pause)
END_HOLD = 3.5              # last frame stays after the last word

STEP_ROLES = [
    'Imagine… in a single second/minute/night, <it happens>. + what that means',
    'Where you are: "You are standing …" (the place on screen)',
    'The normal number → the new number (the counter jumps or starts)',
    'What you notice yourself',
    'How people react; vehicles, animals, things in the street',
    'One real fact with a number',
    'It escalates; one big image',
    'Why it goes wrong: "… But …"',
    'Climax (the generator adds ≈5 s of silence after this step)',
    'Aftermath: what is still there',
    'A closing line that stays with you',
]

# Concrete things a viewer expects to SEE when the voice names them.
VISIBLE = set('''
boat ship mast sail oar rowboat yacht ferry canoe kayak raft buoy anchor
window door doorstep roof rooftop chimney balcony cellar wall fence gate step stair staircase
house building tower skyscraper church mill windmill castle bridge crane quay pier harbour harbor dock lighthouse
street road square fountain statue monument bench lamp lantern sign flag umbrella awning stall market cart wagon
crate barrel box bag basket suitcase
car bus truck lorry van taxi train tram bike bicycle motorbike plane helicopter rocket satellite rover
tree palm pine forest flower bush grass rock stone cliff mountain hill volcano dune cactus
horse dog cat bird cow sheep pig chicken fish whale shark dinosaur
person people man men woman women child children kid trader worker driver farmer astronaut soldier crowd
moon sun star planet comet asteroid meteor meteorite crater
fire campfire smoke tent hut lake river island beach wave
'''.split())
PLURAL = {'people': 'person', 'men': 'man', 'women': 'woman', 'children': 'child', 'stairs': 'stair', 'feet': 'foot'}

def visible_base(tok):
    """'boats' -> 'boat', 'people' -> 'person'; None when it is not a visible thing."""
    tok = tok.lower()
    for cand in (PLURAL.get(tok), tok, tok[:-1] if tok.endswith('s') else None, tok[:-2] if tok.endswith('es') else None):
        if cand in VISIBLE:
            return cand
    return None


# a unit only counts after a number ('over your feet' is fine, 'thirty feet' is not)
BAD_UNITS = (r'(?:\d|\b(?:one|two|three|four|five|six|seven|eight|nine|ten|twenty|thirty|forty|fifty|hundred|thousand|million|half|a))\s+'
             r'(feet|foot|ft|inch|inches|mile|miles|pound|pounds|gallons?|yards?|ounces?)\b|\b(mph|lbs?|fahrenheit)\b|°F')

NUM = {w: i for i, w in enumerate('zero one two three four five six seven eight nine ten eleven twelve thirteen '
                                    'fourteen fifteen sixteen seventeen eighteen nineteen'.split())}
NUM.update({w: 10 * (i + 2) for i, w in enumerate('twenty thirty forty fifty sixty seventy eighty ninety'.split())})
SCALE = {'hundred': 100, 'thousand': 1000, 'million': 10 ** 6, 'billion': 10 ** 9}
FRACTION = {'third': 3, 'thirds': 3, 'quarter': 4, 'quarters': 4, 'fifth': 5, 'fifths': 5, 'tenth': 10, 'tenths': 10}


def numbers_in(text):
    """All numbers in a text, from digits ('2 500', '8.8') and from words ('two and a half thousand')."""
    out = []
    low = text.lower().replace(' ', ' ').replace(' ', ' ')
    for m in re.finditer(r'\d{1,3}(?: \d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?', low):
        out.append((float(m.group().replace(' ', '').replace(',', '.')), m.group()))
    toks = re.findall(r"[a-z]+", low)
    i = 0
    while i < len(toks):
        if toks[i] not in NUM and toks[i] not in SCALE:
            i += 1; continue
        group, j = [], i
        while j < len(toks):
            t = toks[j]
            nxt = toks[j + 1] if j + 1 < len(toks) else ''
            if t in NUM or t in SCALE or t == 'point':
                group.append(t); j += 1
            elif t == 'and' and group and (nxt in NUM or nxt == 'a'):
                j += 1
            elif t == 'a' and group and nxt == 'half':
                group.append('half'); j += 2
            else:
                break
        i = j
        if group == ['one']:      # "this one", "one of them" – not a number
            continue
        total, cur, dec, k = 0.0, 0.0, None, 0
        while k < len(group):
            w = group[k]
            if w == 'point':
                dec = ''
            elif dec is not None and w in NUM:
                dec += str(NUM[w])
            elif w in NUM:
                cur += NUM[w]
            elif w == 'half':
                cur += 0.5
            elif w == 'hundred':
                cur = (cur or 1) * 100
            elif w in SCALE:
                total += (cur or 1) * SCALE[w]; cur = 0
            k += 1
        val = total + cur
        if dec:
            val = float(f'{int(val)}.{dec}')
        if i < len(toks) and toks[i] in FRACTION:      # "two thirds" = 0.667
            val = round(val / FRACTION[toks[i]], 2)
        out.append((val, ' '.join(group)))
    return out


def env_cameras(env):
    p = os.path.join(ENV_DIR, env + '.js')
    if not os.path.exists(p):
        return None
    src = open(p, encoding='utf-8').read()
    block = re.search(r'export const cameras\s*=\s*\{(.*?)\n\};', src, re.S)
    return re.findall(r'^\s*(\w+)\s*:\s*\{\s*pos', block.group(1), re.M) if block else []


def list_envs():
    return sorted(f[:-3] for f in os.listdir(ENV_DIR) if f.endswith('.js') and f != 'kit.js')


def template(question, env, folder):
    cams = env_cameras(env) or []
    slug = re.sub(r'^\d{4}-\d{2}-\d{2}-', '', os.path.basename(os.path.normpath(folder)))
    return {
        '_help': 'Fill in every TODO, then run: python tools/whatif/whatif.py check <folder>. See tools/whatif/README.md.',
        'question': question,
        'slug': slug,
        'spelling': 'metres',
        'environment': env,
        'pace': 'TODO slow | sudden  (how fast the change happens in the story)',
        'numbers': [
            {'id': 'TODO', 'value': 0, 'unit': 'TODO', 'said_as': [], 'meaning': 'TODO what this number is'},
        ],
        'steps': [{'step': i + 1, 'role': r, 'lines': ['TODO'], 'pause_after': 'long'} for i, r in enumerate(STEP_ROLES)],
        'on_screen': [
            {'word': 'TODO word the voice says', 'model': 'TODO which model/object shows it', 'looks': 'TODO what the viewer sees'},
        ],
        'counter': {
            'label': 'TODO', 'from': 0, 'to': 0, 'unit': 'TODO',
            'second_label': 'TODO', 'second_from': 0, 'second_to': 0, 'second_unit': 'TODO',
            'motion': 'TODO steady | jump', 'starts_on_word': 'TODO', 'stops_on_word': 'TODO',
        },
        'captions': ['TODO', 'TODO', 'TODO'],
        'facts': [
            {'claim': 'TODO', 'number_ids': ['TODO'], 'source': 'TODO', 'url': 'TODO', 'source_says': 'TODO exact words of the source'},
        ],
        'shots': [
            {'type': 'shot', 'from_step': 1, 'camera': cams[0] if cams else 'TODO', 'shows': 'TODO'},
            {'type': 'shot', 'from_step': 7, 'camera': cams[1] if len(cams) > 1 else 'TODO', 'shows': 'TODO'},
            {'type': 'shot', 'from_step': 9, 'camera': cams[2] if len(cams) > 2 else 'TODO', 'shows': 'TODO'},
        ],
        'climax': {'visual': 'TODO', 'why_it_fits_the_closing_line': 'TODO'},
        'models': [
            {'name': 'TODO', 'source': 'kenney | quaternius | polypizza | nasa | environment', 'path': 'TODO',
             'new': False, 'licence': 'CC0', 'credit': ''},
        ],
        'reality': [{'step': n, 'why_it_really_happens': 'TODO physics/biology in one or two sentences; '
                     'if it would not really happen, change the step'} for n in (7, 9, 10)],
        'critic': [{'weak_point': 'TODO', 'fix': 'TODO'} for _ in range(3)],
        'questions': [],
    }


# ---------------------------------------------------------------- check

class Report:
    def __init__(self):
        self.fails, self.warns = [], []

    def fail(self, area, msg):
        self.fails.append(f'FAIL [{area}] {msg}')

    def warn(self, area, msg):
        self.warns.append(f'WARN [{area}] {msg}')


def has_todo(x):
    if isinstance(x, str):
        return 'TODO' in x
    if isinstance(x, list):
        return any(has_todo(v) for v in x)
    if isinstance(x, dict):
        return any(has_todo(v) for k, v in x.items() if k != '_help')
    return False


def timing(plan):
    """Estimated video time for every step start, the stop word, and the end."""
    t = VO_OFFSET
    starts, words_at = [], []
    for st in plan['steps']:
        starts.append(t)
        for li, line in enumerate(st['lines']):
            n = len(line.split())
            words_at.append((t, t + n / WORDS_PER_S, line, st['step']))
            t += n / WORDS_PER_S
            if li < len(st['lines']) - 1:
                t += PAUSE
        t += LONG if st.get('pause_after') == 'long' else PAUSE
        if st['step'] == 9:
            t += SILENCE * LONG
    return starts, words_at, t - LONG + END_HOLD


def find_word(words_at, spec):
    """spec 'stops' or '9:stops' (word in step 9) -> list of (time, step) where it is said."""
    step, _, word = spec.rpartition(':')
    hits = []
    for a, b, line, st in words_at:
        if step and str(st) != step:
            continue
        toks = re.findall(r"[\w']+", line.lower())
        for k, tok in enumerate(toks):
            if tok == word.lower():
                hits.append((a + (b - a) * k / max(1, len(toks)), st))
    return hits


def check(plan, folder, skip_files=False):
    R = Report()
    if has_todo(plan):
        R.fail('todo', 'plan.json still has TODO fields – fill in everything.')

    # title
    q = plan.get('question', '')
    if not (q.startswith('What if ') and q.endswith('?')):
        R.fail('title', f'question must start with "What if " and end with "?": {q!r}')
    if len(q) > 60:
        R.fail('title', f'question is {len(q)} characters, max 60.')

    # steps
    steps = plan.get('steps', [])
    if [s.get('step') for s in steps] != list(range(1, 12)):
        R.fail('story', 'there must be exactly 11 steps, numbered 1–11 (see AGENTS.md PART A point 4).')
        return R, None
    lines = [l for s in steps for l in s['lines']]
    script_text = ' '.join(lines)
    nwords = len(script_text.split())
    if not 150 <= nwords <= 200:
        R.fail('story', f'{nwords} words; must be 150–200.')
    for s in steps:
        if not 1 <= len(s['lines']) <= 3:
            R.fail('story', f'step {s["step"]}: 1–3 lines, not {len(s["lines"])}.')
        if s.get('pause_after') not in ('pause', 'long'):
            R.fail('story', f'step {s["step"]}: pause_after must be "pause" or "long".')
        for l in s['lines']:
            if '[' in l:
                R.fail('story', f'step {s["step"]}: no [pause] tags in lines – the generator adds them. Use a new line instead.')
            if len(l.split()) > 18:
                R.fail('story', f'step {s["step"]}: line too long ({len(l.split())} words, max 18): {l!r}')
    if not steps[0]['lines'][0].startswith('Imagine'):
        R.fail('story', 'step 1 must start with "Imagine".')
    if not re.search(r'\bYou are\b', ' '.join(steps[1]['lines'])):
        R.fail('story', 'step 2 must say where you are: "You are standing …".')
    if not re.search(r'\bBut\b', ' '.join(steps[7]['lines'])):
        R.fail('story', 'step 8 must explain why it goes wrong with "… But …".')

    # units + spelling
    alltext = ' '.join([q, script_text] + plan.get('captions', []) +
                       [plan['counter'].get('label', ''), plan['counter'].get('second_label', '')])
    for m in re.finditer(BAD_UNITS, alltext, re.I):
        R.fail('units', f'non-European unit "{m.group()}" – use m, km, kg, °C, km/h.')
    sp = plan.get('spelling')
    other = {'metres': r'\b\w*meters?\b', 'meters': r'\b\w*metres?\b'}.get(sp)
    if other is None:
        R.fail('units', 'spelling must be "metres" or "meters".')
    else:
        for m in re.finditer(other, alltext, re.I):
            R.fail('units', f'"{m.group()}" – spelling is "{sp}", use it everywhere (title, script, captions).')

    # numbers: one table, everything else must match it
    table = plan.get('numbers', [])
    ids = {n.get('id') for n in table}
    allowed = []
    for n in table:
        allowed.append(n['value'])
        allowed += n.get('said_as', [])
    def known(v):
        return any(math.isclose(v, a, rel_tol=1e-6, abs_tol=1e-9) for a in allowed)
    for where, txt in [('script', script_text), ('title', q)] + [(f'caption {i+1}', c) for i, c in enumerate(plan.get('captions', []))]:
        for v, raw in numbers_in(txt):
            if not known(v):
                R.fail('numbers', f'{where} says "{raw}" (= {v:g}), which is not in the numbers table. '
                                  f'Add it (or "said_as" of an existing number), or change the text so all numbers agree.')
    c = plan.get('counter', {})
    for k in ('from', 'to', 'second_from', 'second_to'):
        if isinstance(c.get(k), (int, float)) and c[k] != 0 and not known(c[k]):
            R.fail('numbers', f'counter {k} = {c[k]} is not in the numbers table.')

    # on screen: every visible thing the voice names must be in the scene
    declared = {}
    for o in plan.get('on_screen', []):
        w = o.get('word', '').lower()
        declared[visible_base(w) or w] = o
        if not o.get('model') or not o.get('looks'):
            R.fail('on screen', f'"{w}": give "model" (what shows it) and "looks" (what the viewer sees).')
        if w and not re.search(r'\b' + re.escape(w), script_text, re.I):
            R.warn('on screen', f'"{w}" is in on_screen but the voice never says it.')
    for tok in sorted(set(re.findall(r"[a-z]+", script_text.lower()))):
        base = visible_base(tok)
        if base and base not in declared:
            R.fail('on screen', f'the voice says "{tok}" – add it to on_screen with the model that shows it '
                                f'and what it looks like, or take it out of the text.')

    # counter
    for k in ('label', 'unit', 'second_label', 'second_unit'):
        if not str(c.get(k, '')).strip():
            R.fail('counter', f'counter "{k}" is empty.')
    if c.get('motion') not in ('steady', 'jump'):
        R.fail('counter', 'motion must be "steady" or "jump".')
    starts, words_at, end = timing(plan)
    hit = {}
    for k in ('starts_on_word', 'stops_on_word'):
        w = c.get(k, '')
        found = find_word(words_at, w)
        if not found:
            R.fail('counter', f'{k} "{w}" is not a word in the script (use "word" or "step:word", e.g. "9:stops").')
        elif len(found) > 1:
            R.fail('counter', f'{k} "{w}" is said {len(found)} times (steps {", ".join(str(x[1]) for x in found)}); '
                              f'write "step:word", e.g. "{found[-1][1]}:{w}".')
        else:
            hit[k] = found[0]
    if len(hit) == 2 and hit['stops_on_word'][0] <= hit['starts_on_word'][0]:
        R.fail('counter', 'the counter must stop after it starts.')
    if c.get('motion') == 'jump' and plan.get('pace') == 'slow':
        R.fail('counter', 'pace is "slow" but the counter jumps – make it steady, or make the story sudden.')

    # climax must fit the pace
    vis = plan.get('climax', {}).get('visual', '')
    if plan.get('pace') not in ('slow', 'sudden'):
        R.fail('climax', 'pace must be "slow" or "sudden".')
    if plan.get('pace') == 'slow' and re.search(r'surge|wave|tsunami|explo|crash|smash|burst|slam', vis, re.I):
        R.fail('climax', f'pace is "slow" but the climax is violent ({vis!r}). '
                         'A slow story needs a slow climax (the big reveal is the high shot), or change pace to "sudden".')
    if len(plan.get('climax', {}).get('why_it_fits_the_closing_line', '')) < 20:
        R.fail('climax', 'explain in a sentence why the climax fits the closing line.')

    # captions
    caps = plan.get('captions', [])
    if not 3 <= len(caps) <= 4:
        R.fail('captions', f'{len(caps)} captions; must be 3–4.')
    for cap in caps:
        if len(cap) > 50:
            R.fail('captions', f'too long ({len(cap)} chars, max 50): {cap!r}')

    # facts
    facts = plan.get('facts', [])
    if not facts:
        R.fail('facts', 'at least one real fact with a number and a source (step 6).')
    for f in facts:
        for k in ('claim', 'source', 'url', 'source_says'):
            if not f.get(k):
                R.fail('facts', f'fact {f.get("claim", "?")!r}: "{k}" is empty.')
        if f.get('url') and not f['url'].startswith('http'):
            R.fail('facts', f'url must be a link: {f["url"]!r}')
        for nid in f.get('number_ids', []):
            if nid not in ids:
                R.fail('facts', f'number id "{nid}" is not in the numbers table.')

    # shots: 3 main shots + max 2 close-ups (3–5 s)
    cams = env_cameras(plan.get('environment', ''))
    if cams is None:
        R.fail('place', f'environments/{plan.get("environment")}.js does not exist. Choose one of: {", ".join(list_envs())}')
        cams = []
    shots = plan.get('shots', [])
    mains = [s for s in shots if s.get('type') == 'shot']
    closes = [s for s in shots if s.get('type') == 'closeup']
    if len(mains) != 3:
        R.fail('shots', f'{len(mains)} main shots; must be exactly 3 (hard cuts, see GRAVITY-VIDEO.md).')
    if len(closes) > 2:
        R.fail('shots', f'{len(closes)} close-ups; max 2.')
    if [s.get('from_step') for s in shots] != sorted(s.get('from_step', 0) for s in shots):
        R.fail('shots', 'shots must be in order of from_step.')
    if mains and mains[0].get('from_step') != 1:
        R.fail('shots', 'shot 1 starts at step 1.')
    if len(mains) == 3 and mains[2].get('from_step', 99) > 9:
        R.fail('shots', 'shot 3 (high, the whole area) must start at the climax (step 9) or earlier.')
    for s in shots:
        cam = s.get('camera')
        if cam != 'custom' and cam not in cams:
            R.fail('shots', f'camera "{cam}" is not in {plan.get("environment")}.js ({", ".join(cams)}); '
                            'or use "custom" with "where".')
        if cam == 'custom' and not s.get('where'):
            R.fail('shots', 'a "custom" camera needs "where" (height, distance, what it looks at).')
        if s.get('type') == 'closeup' and not 3 <= s.get('seconds', 0) <= 5:
            R.fail('shots', 'a close-up lasts 3–5 s ("seconds").')

    # models + licences
    models = plan.get('models', [])
    if sum(1 for m in models if m.get('new')) > 2:
        R.fail('models', 'max 2 NEW models/things per video (AGENTS.md PART A point 5).')
    for m in models:
        p, src = m.get('path', ''), m.get('source')
        if src not in ('kenney', 'quaternius', 'polypizza', 'nasa', 'environment'):
            R.fail('models', f'{m.get("name")}: source must be kenney, quaternius, polypizza, nasa or environment.')
        want = 'environments/' if src == 'environment' else f'assets/{src}/'
        if src and p and not p.replace('\\', '/').startswith(want) and 'assets/downloads' not in p:
            R.fail('models', f'{m.get("name")}: a {src} model must be in {want}… (path is {p}).')
        if 'assets/downloads' in p.replace('\\', '/'):
            R.fail('models', f'{m.get("name")}: copy the .glb to assets/{src}/<slug>/ first; never use assets/downloads/ in a video.')
        elif not skip_files and p and not os.path.exists(os.path.join(ROOT, p)):
            R.fail('models', f'{m.get("name")}: file not found: {p}')
        if src == 'polypizza':
            if not re.match(r'^3D models: ".+" by .+ \(Poly Pizza, .+\) https://poly\.pizza/m/\w+$', m.get('credit', '')):
                R.fail('models', f'{m.get("name")}: Poly Pizza needs credit exactly like: '
                                 '3D models: "<Title>" by <Creator> (Poly Pizza, <licence>) https://poly.pizza/m/<id>')
        elif m.get('licence') not in ('CC0', 'CC0 1.0', 'public domain'):
            R.fail('models', f'{m.get("name")}: licence {m.get("licence")!r} – only CC0/public domain here (Poly Pizza may be CC-BY).')

    # reality: escalation, climax and aftermath must be physically right
    done = {r.get('step') for r in plan.get('reality', []) if len(r.get('why_it_really_happens', '')) >= 40}
    for n in (7, 9, 10):
        if n not in done:
            R.fail('reality', f'step {n}: explain in "reality" why this would really happen (≥ 40 characters). '
                              'If you cannot, the step is wrong – change it.')

    # self-critique + questions
    crit = [x for x in plan.get('critic', []) if x.get('weak_point') and x.get('fix')]
    if len(crit) < 3:
        R.fail('critic', 'read the script as a critic: give 3 weak points AND the fix you already made.')
    qs = plan.get('questions', [])
    if len(qs) > 3:
        R.fail('questions', f'{len(qs)} questions; max 3. Decide the rest yourself from the template.')
    for x in qs:
        if not x.get('my_choice'):
            R.fail('questions', f'question {x.get("question")!r}: give "my_choice".')

    # timing
    if not 78 <= end <= 92:
        R.fail('timing', f'estimated length {end:.0f} s; must be 80–90 s. Add or remove words.')
    if not 52 <= starts[8] <= 68:
        R.warn('timing', f'climax (step 9) starts at ≈{starts[8]:.0f} s; in the template it is ≈57–64 s.')
    return R, (starts, words_at, end)


# ---------------------------------------------------------------- write outputs

def script_txt(plan):
    out = []
    for s in plan['steps']:
        body = ' [pause] '.join(s['lines'])
        out.append(body + (' [long pause]' if s['pause_after'] == 'long' else ' [pause]'))
        if s['step'] == 9:
            out.append(' '.join(['[long pause]'] * SILENCE))
    out[-1] = re.sub(r' \[(long )?pause\]$', '', out[-1])
    return '\n'.join(out) + '\n'


def storyboard_md(plan, tim, warns):
    starts, words_at, end = tim
    c = plan['counter']
    t_start = find_word(words_at, c['starts_on_word'])[0][0]
    t_stop = find_word(words_at, c['stops_on_word'])[0][0]
    shots = plan['shots']
    L = [f'# {plan["question"]}', '',
         '_Generated by `tools/whatif/whatif.py check` – edit `plan.json`, not this file._', '',
         f'**Place:** `environments/{plan["environment"]}.js` · **pace:** {plan["pace"]} · '
         f'**≈{sum(len(l.split()) for s in plan["steps"] for l in s["lines"])} words, ≈{end:.0f} s** '
         '(estimate; final times from `voice-times.tsv`)', '',
         '## Script', '', '| step | ≈ s | text |', '|---|---|---|']
    for s, t in zip(plan['steps'], starts):
        txt = ' · '.join(s['lines']) + (' **[≈5 s silence]**' if s['step'] == 9 else '')
        L.append(f'| {s["step"]} | {t:.0f} | {txt} |')
    L += ['', '## Numbers (one table – everything uses these)', '', '| number | value | said as | meaning |', '|---|---|---|---|']
    for n in plan['numbers']:
        L.append(f'| {n["id"]} | {n["value"]:g} {n["unit"]} | {", ".join(f"{x:g}" for x in n.get("said_as", [])) or "–"} | {n["meaning"]} |')
    L += ['', '## Counter', '',
          f'`{c["label"]}` {c["from"]:g} → {c["to"]:g} {c["unit"]} · second line `{c["second_label"]}` '
          f'{c["second_from"]:g} → {c["second_to"]:g} {c["second_unit"]} · **{c["motion"]}**',
          f'starts on "{c["starts_on_word"]}" (≈{t_start:.1f} s), stops on "{c["stops_on_word"]}" (≈{t_stop:.1f} s)', '',
          '## Shots', '', '| ≈ s | type | camera | shows |', '|---|---|---|---|']
    t_prev = 0
    for s in shots:
        cam = s['camera'] + (f' – {s["where"]}' if s['camera'] == 'custom' else '')
        typ = s['type'] + (f' ({s["seconds"]} s)' if s['type'] == 'closeup' else '')
        t_shot = max(starts[s['from_step'] - 1], t_prev)       # a shot right after a close-up starts when it ends
        t_prev = t_shot + s.get('seconds', 0)
        L.append(f'| {t_shot:.0f} | {typ} | {cam} | {s["shows"]} |')
    L += ['', f'**Climax:** {plan["climax"]["visual"]}  ', f'_Why it fits the closing line:_ {plan["climax"]["why_it_fits_the_closing_line"]}',
          '', '## On screen (everything the voice names)', '', '| word | model | looks |', '|---|---|---|']
    L += [f'| {o["word"]} | {o["model"]} | {o["looks"]} |' for o in plan['on_screen']]
    L += ['', '## Captions', ''] + [f'{i+1}. {x}' for i, x in enumerate(plan['captions'])]
    L += ['', '## Facts', '']
    L += [f'- **{f["claim"]}** – {f["source"]} ({f["url"]}): "{f["source_says"]}"' for f in plan['facts']]
    L += ['', '## Models', '', '| model | source | path | new | credit |', '|---|---|---|---|---|']
    L += [f'| {m["name"]} | {m["source"]} | `{m["path"]}` | {"⭐" if m.get("new") else ""} | {m.get("credit") or "–"} |' for m in plan['models']]
    L += ['', '## Reality check', '']
    L += [f'- step {r["step"]}: {r["why_it_really_happens"]}' for r in plan['reality']]
    L += ['', '## Critic (weak points already fixed)', '']
    L += [f'- {x["weak_point"]} → {x["fix"]}' for x in plan['critic']]
    if plan.get('questions'):
        L += ['', '## Questions for the owner', '']
        L += [f'{i+1}. {x["question"]} – **my choice:** {x["my_choice"]}' for i, x in enumerate(plan['questions'])]
    L += ['', '## Check', '', '✅ ALL CHECKS PASSED (`whatif.py check`)']
    L += [f'- {w}' for w in warns]
    return '\n'.join(L) + '\n'


def upload_draft(plan):
    credits = [m['credit'] for m in plan['models'] if m.get('credit')]
    desc = [plan['question'], '', 'Sources:'] + [f'- {f["claim"]}: {f["source"]} {f["url"]}' for f in plan['facts']]
    desc += ['', '3D models: Kenney / Quaternius (CC0)'] + credits
    return {'title': plan['question'] + ' #shorts', 'question': plan['question'], 'slug': plan['slug'],
            'description': '\n'.join(desc), 'credits': credits,
            'sources': [{'claim': f['claim'], 'source': f['source'], 'url': f['url']} for f in plan['facts']]}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    sub.add_parser('envs')
    n = sub.add_parser('new'); n.add_argument('folder'); n.add_argument('--question', required=True); n.add_argument('--env', required=True)
    c = sub.add_parser('check'); c.add_argument('folder'); c.add_argument('--skip-files', action='store_true', help='do not check model paths')
    a = ap.parse_args()

    if a.cmd == 'envs':
        for e in list_envs():
            print(f'{e:16} cameras: {", ".join(env_cameras(e))}')
        return 0
    if a.cmd == 'new':
        if env_cameras(a.env) is None:
            sys.exit(f'environments/{a.env}.js does not exist. Choose one of: {", ".join(list_envs())}')
        os.makedirs(a.folder, exist_ok=True)
        p = os.path.join(a.folder, 'plan.json')
        if os.path.exists(p):
            sys.exit(f'{p} already exists – edit it, then run check.')
        json.dump(template(a.question, a.env, a.folder), open(p, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
        print(f'made {p} – fill in every TODO, then: python tools/whatif/whatif.py check {a.folder}')
        return 0

    p = a.folder if a.folder.endswith('.json') else os.path.join(a.folder, 'plan.json')
    folder = os.path.dirname(p) or '.'
    try:
        plan = json.load(open(p, encoding='utf-8'))
    except (OSError, json.JSONDecodeError) as e:
        sys.exit(f'FAIL [json] cannot read {p}: {e}')
    R, tim = check(plan, folder, a.skip_files)
    for line in R.fails + R.warns:
        print(line)
    if R.fails:
        print(f'\n{len(R.fails)} FAIL – fix plan.json and run check again. Do NOT show the owner anything yet.')
        return 1
    stem = os.path.splitext(os.path.basename(p))[0]
    prefix = '' if stem == 'plan' else stem + '.'
    open(os.path.join(folder, prefix + 'STORYBOARD.md'), 'w', encoding='utf-8').write(storyboard_md(plan, tim, R.warns))
    open(os.path.join(folder, prefix + 'script.txt'), 'w', encoding='utf-8').write(script_txt(plan))
    json.dump(upload_draft(plan), open(os.path.join(folder, prefix + 'upload.draft.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print(f'\nALL CHECKS PASSED – wrote {prefix}STORYBOARD.md, {prefix}script.txt, {prefix}upload.draft.json. Show STORYBOARD.md to the owner and stop.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
