"""Automatische 3D-scène: maakt <map>/scene.html uit een vast sjabloon, zonder zelf three.js te schrijven.

Gebruik:
  python tools/whatif/autoscene.py models <env>     -> welke modelnamen in die plek staan (voor "tags" in scene.json)
  python tools/whatif/autoscene.py build <map>      -> <map>/scene.html (na plan.json + voice-times.tsv)

Leest <map>/plan.json (vraag, plek, teller, ondertitels, stappen), de staptijden (whatif.py times: voice-times.tsv + 0,5 s)
en <map>/scene.json, het enige wat jij invult:
{
  "effect": "grow",          // grow   = het onderwerp groeit/krimpt: hoogte (m) = teller
                             // water  = water stijgt over de plek: waterhoogte (m boven y=0) = teller
                             // multiply = er komen kopieën van het onderwerp bij: aantal = teller (max 400)
                             // rain   = kopieën van het onderwerp vallen uit de lucht: aantal = teller (max 400)
  "subject": {"word": "you", "model": "kenney/mini-characters/character-male-a.glb", "height": 1.8, "anim": "idle"},
                             // het hoofdonderwerp (word = het woord uit on_screen); bij water mag het weg
  "water_word": "water",     // alleen bij effect water: het woord waarmee de stem het water noemt
  "at": [0, 0],              // optioneel: x, z van het onderwerp (standaard: waar camera 1 van de plek naar kijkt)
  "spacing": 1.2,            // optioneel bij multiply/rain: afstand tussen kopieën (m)
  "people": "people",        // optioneel: 6 kleine mensen rond het onderwerp die weglopen; het woord voor de stem
  "tags": [{"word": "palms", "match": "palm"}],  // dingen van de plek die de stem noemt: deel van de modelnaam
  "wide": true,              // alleen bij een hoofdstuk van een LANGE video: liggend 16:9 (render.mjs/finish.py met --wide)
  "title": "Chapter 1: …"    // optioneel: andere titeltekst in beeld dan de vraag (bijv. hoofdstuktitel)
}
De camera richt zich vanzelf: shot 1 ooghoogte, shot 2 (vanaf stap 7) ander standpunt, shot 3 (vanaf stap 9) hoog,
steeds langzaam naar binnen, en altijd zo dat het onderwerp groot in beeld is. De teller toont precies wat je ziet.
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))


def env_models(env):
    src = open(os.path.join(ROOT, 'environments', env + '.js'), encoding='utf-8').read()
    return sorted(set(re.findall(r"put\(ctx,\s*'([\w-]+)',\s*'([\w-]+)'", src)) |
                  {(p, n) for p, n in re.findall(r"'([\w-]+-kit[\w-]*)'[^\n]*?'([\w-]+)'", src)})


def word_time(times, spec, fallback_step):
    """Tijd van een woord ('climbs' of '9:stops') in de video, via de positie in de staptekst."""
    step, word = (spec.split(':', 1) if ':' in str(spec) else (None, spec))
    for st in times['steps']:
        if step and str(st['step']) != step:
            continue
        toks = re.findall(r"[\w'-]+", st['text'].lower())
        w = str(word).lower()
        for i, t in enumerate(toks):
            if t.startswith(w):
                return st['start'] + (st['end'] - st['start']) * (i + .5) / max(1, len(toks))
    st = times['steps'][fallback_step - 1]
    return st['start']


def build(folder):
    plan = json.load(open(os.path.join(folder, 'plan.json'), encoding='utf-8'))
    sc = json.load(open(os.path.join(folder, 'scene.json'), encoding='utf-8'))
    r = subprocess.run([sys.executable, os.path.join(HERE, 'whatif.py'), 'times', folder], capture_output=True, text=True)
    if r.returncode:
        sys.exit('FOUT: whatif.py times lukt niet:\n' + r.stdout + r.stderr)
    times = json.loads(r.stdout)
    st = times['steps']
    c = plan['counter']
    t0 = word_time(times, c.get('starts_on_word', ''), 3)
    t1 = word_time(times, c.get('stops_on_word', ''), 9)
    if t1 <= t0 + 3:
        t1 = st[8]['start']
    unit = c.get('unit', '')
    if sc['effect'] in ('grow', 'water') and unit not in ('m', 'cm'):
        sys.exit(f'FOUT: effect {sc["effect"]} heeft een teller in m of cm nodig (nu "{unit}")')
    if sc['effect'] in ('multiply', 'rain') and max(c['from'], c['to']) > 400:
        sys.exit('FOUT: multiply/rain kan max 400 kopieën tonen; zet de teller op een getal dat je echt ziet (≤ 400)')
    if sc['effect'] == 'grow':      # de camera schuift mee met de grootte; te snel = scenecheck ziet een "cut"
        k = 1 if unit == 'm' else .01
        speed = abs(c['to'] - c['from']) * k / max(1, t1 - t0) * 2.6
        if speed > 6:
            sys.exit(f'FOUT: groeit te snel voor de camera ({speed:.1f} m/s camerabeweging, max 6): kies een kleiner '
                     f'eindgetal of laat de teller langer lopen (starts_on_word eerder / stops_on_word later)')
    cm = plan.get('counter_matches') or {}
    sw = (sc.get('subject') or {}).get('word')
    if sc['effect'] == 'grow' and (cm.get('object') != sw or cm.get('measure') != 'height'):
        sys.exit(f'FOUT: zet in plan.json "counter_matches": {{"object": "{sw}", "measure": "height", "unit": "{unit}", '
                 f'"hud_number": 0}} (de teller = de hoogte van het onderwerp) en draai whatif.py check opnieuw')
    if sc['effect'] == 'water' and (cm.get('object') != sc.get('water_word', 'water') or cm.get('measure') != 'top'):
        sys.exit(f'FOUT: zet in plan.json "counter_matches": {{"object": "{sc.get("water_word", "water")}", "measure": "top", '
                 f'"unit": "{unit}", "hud_number": 0, "from_ground": true}} en draai whatif.py check opnieuw')
    caps, at_steps = [], [1, 3, 6, 8]
    for i, text in enumerate(plan.get('captions', [])[:4]):
        s = st[at_steps[i] - 1]
        caps.append([round(s['start'] + .3, 2), round(min(s['end'] + 1, s['start'] + 6), 2), text])
    words = lambda w: str(w).lower()
    cfg = {
        'env': plan['environment'], 'title': sc.get('title', plan['question']), 'effect': sc['effect'], 'wide': bool(sc.get('wide')),
        'subject': sc.get('subject'), 'water_word': words(sc.get('water_word', 'water')), 'at': sc.get('at'),
        'spacing': sc.get('spacing', 1.2), 'people': sc.get('people'), 'tags': sc.get('tags', []),
        'counter': {'label': c.get('label', ''), 'from': c['from'], 'to': c['to'], 'unit': unit,
                    'second_label': c.get('second_label', ''), 'second_from': c.get('second_from'),
                    'second_to': c.get('second_to'), 'second_unit': c.get('second_unit', ''),
                    'jump': c.get('motion') == 'jump', 'decimals': c.get('decimals'), 't0': round(t0, 2), 't1': round(t1, 2)},
        'captions': caps, 'cuts': [st[6]['start'], st[8]['start']],
        'T_END': round(st[-1]['end'] + 3.5, 2), 'titleOut': 9.0, 'hudIn': 9.0,
    }
    html = open(os.path.join(HERE, 'autoscene.html'), encoding='utf-8').read().replace('/*CFG*/null', json.dumps(cfg, ensure_ascii=False))
    out = os.path.join(folder, 'scene.html')
    open(out, 'w', encoding='utf-8').write(html)
    print(f'{out} gemaakt: effect {sc["effect"]}, teller {c["from"]}→{c["to"]} {unit} van {t0:.1f} tot {t1:.1f} s, '
          f'cuts {cfg["cuts"][0]:.1f} / {cfg["cuts"][1]:.1f} s, einde {cfg["T_END"]} s')


if __name__ == '__main__':
    if len(sys.argv) < 3 or sys.argv[1] not in ('models', 'build'):
        sys.exit(__doc__)
    if sys.argv[1] == 'models':
        for p, n in env_models(sys.argv[2]):
            print(f'{p}/{n}')
    else:
        build(sys.argv[2])
