"""Keurt een cartoon-verhaal voordat er beeld en stem gemaakt worden: is het een EIGEN verhaal?
Gebruik: python3 tools/cartoon/check_story.py <map>   → eindigt op "VERHAAL OK" of op FOUT-regels.

- Geen stukjes tekst (4 woorden of meer) die al in een andere cartoon-video staan.
- Geen vaste zinnen uit het eerste voorbeeld (eigenaar 21 okt 2026: "niet echt een eigen verhaal").
- 9–12 scènes, 100–140 woorden.
- Minstens 3 verschillende plekken, en niet alleen slaapkamer + klaslokaal.
"""
import glob, os, re, sys

KAL = ["one word on it", "at first", "walks right past", "a plus", "better grades", "goes to school for you",
       "it takes your room", "you press it", "you drink it", "and suddenly", "part two"]
PLEKKEN = ["bedroom", "classroom", "street", "park", "kitchen", "space", "beach"]
VAST = set()


def tekst(map_):
    s = open(os.path.join(map_, "script-cues.txt"), encoding="utf-8").read()
    s = re.sub(r"\{img:[^}]*\}|\[[^\]]*\]", " ", s)
    s = s.lower().replace("’", "'").replace("it's", "it is").replace("doesn't", "does not")
    return re.findall(r"[a-z']+", s)


def grams(w, n=4):
    return {" ".join(w[i:i + n]) for i in range(len(w) - n + 1)}


m = sys.argv[1].rstrip("/\\")
fout = []
w = tekst(m)
eigen = grams(w)
for ander in glob.glob(os.path.join(os.path.dirname(os.path.abspath(m)), "20*", "story.js")):
    d = os.path.dirname(ander)
    if os.path.abspath(d) == os.path.abspath(m) or not os.path.exists(os.path.join(d, "script-cues.txt")):
        continue
    zelfde = sorted(g for g in eigen & grams(tekst(d)) if not any(g in v or v in g for v in VAST))
    if zelfde:
        fout.append(f"zelfde tekst als {os.path.basename(d)}: " + "; ".join(zelfde[:6]))
zin = " ".join(w)
for k in KAL:
    if k in zin:
        fout.append(f"vaste zin uit het voorbeeld: \"{k}\" – bedenk een eigen moment")
cues = re.findall(r"\{img:([^}]+)\}", open(os.path.join(m, "script-cues.txt"), encoding="utf-8").read())
if not 9 <= len(cues) <= 12:
    fout.append(f"{len(cues)} scènes (moet 9–12)")
if not 100 <= len(w) <= 140:
    fout.append(f"{len(w)} woorden (moet 100–140)")
js = open(os.path.join(m, "story.js"), encoding="utf-8").read()
eigen_plek = re.findall(r"(?:function|const)\s+(\w+)\s*=?\s*\(?[^)]*\)?\s*=?>?\s*\{?\s*(?:return\s*)?`<rect width=\"1080\" height=\"780\"", js)
bouw = {f"place:{b}/{g}" for b, g in re.findall(r"place\(\{[^}]*?back:\s*'([^']+)'[^}]*?ground:\s*'(\w+)'", js)}
gebruikt = {p for p in PLEKKEN if re.search(rf"\b{p}\(", js)} | set(eigen_plek) | bouw
if len(gebruikt) < 3:
    fout.append(f"maar {len(gebruikt)} plek(ken): {', '.join(sorted(gebruikt)) or '-'} (minstens 3)")
if gebruikt and gebruikt <= {"bedroom", "classroom"}:
    fout.append("alleen slaapkamer en klaslokaal: kies plekken die bij DIT verhaal horen")
for f in fout:
    print("FOUT:", f)
print("VERHAAL OK" if not fout else f"{len(fout)} fout(en): pas script-cues.txt / story.js aan en draai opnieuw")
sys.exit(1 if fout else 0)
