# Opbouw van de gravity-video – precies, seconde voor seconde

Alles hieronder komt uit `scene.html` (beeld), `timeline.json` (tijdlijn), `voice-times.tsv` (stem) en
`make_audio.py` in `vox-lux` (geluid). Tijden zijn **videoseconden**: de stem begint op 0,5 s, dus
videotijd = tijd in `voice-times.tsv` + 0,5.

![overzicht](OVERZICHT.jpg)

## 1. In het kort

| | |
|---|---|
| Lengte | 90 s, staand 1080x1920, 30 beelden/s |
| Delen | 3 shots met harde overgangen: **straat** (0–46,4 s), **dichterbij in de straat** (46,4–57,3 s), **hoog boven de stad** (57,3–90 s) |
| Het moment | op **15,9 s** springt de zwaartekracht in 1 seconde van 1 g naar 2 g |
| Hoogtepunt | 64–73 s: vier oude torens storten in, met ± 5 s zonder stem |
| Einde | stof zakt, laatste zin, eindkaart (86 s), uitfaden naar zwart (88,6–90 s) |
| Tekst in beeld | titel (0–9 s), teller linksboven (9,2–80 s), 4 korte zinnen (captions) |
| Stem | 28 zinnen, xAI Lux, tempo 0.9, elke zin apart, vaste pauzes |
| Geluid | alles zelf gemaakt van ruis (geen opnames), stem staat voorop |

## 2. Tijdlijn seconde voor seconde

| Tijd (s) | Stem | Beeld | Tekst in beeld | Geluid |
|---|---|---|---|---|
| 0–9 | "Imagine… in a single second, gravity doubles. Everything on Earth becomes twice as heavy." | Shot 1: ooghoogte (3,2 m) midden op een brede laan met palmen, winkels en verkeer; de camera schuift heel langzaam naar voren. Vanaf 3 s staat het licht op rood en steken 7 mensen over bij het zebrapad. | Titel groot in het midden: *What if gravity suddenly doubled?* (weg op 9 s) | stadsgeluid, auto's die langsrijden, getik van het voetgangerslicht, ver vliegtuig |
| 9–15,6 | "You are standing on a busy street." / "Gravity pulls on you at nine point eight meters per second squared." | Normaal leven: mensen lopen, fietser fietst, vogels cirkelen, vliegtuig hoog in de lucht, fontein spuit. | Teller verschijnt (9,2 s): GRAVITY **1.00 g**, 9.8 m/s², YOUR WEIGHT 160 lb | stad |
| **15,9** | (stilte vóór de volgende zin) | **De klap.** Teller loopt in 1 s naar 2.00 g. Camera zakt een stukje en veert na. Auto's veren door en remmen, palmen en bomen buigen en veren, vogels gaan omlaag, vliegtuig zakt, fontein spuit half zo hoog. Mensen lopen trager en blijven staan. | 2.00 g, 19.6 m/s², 320 lb | grote dreun; daarna klinkt alles dof (oren dicht); gekraak en metaal |
| 16,6–20,2 | "Now, it is nineteen point six." | idem | caption: *Everything, twice as heavy.* | dof |
| 20,6–22,2 | "Your ears pop." | | | ploppend oor: het geluid wordt weer helder |
| 22,7–26,2 | "The air at the ground would press down almost twice as hard." | lucht wordt waziger (meer nevel) | | lage drukdreun eronder |
| 26,7–36,2 | gewicht 160 → 320 pond / "Your heart would have to pump blood…" | mensen lopen gebogen, stoppen | | gekraak van veren en takken |
| 36,7–38,8 | "People stop. Some sit down." | mensen gaan zitten, leunen tegen een muur of blijven gebogen staan; fietser zet zijn voet neer | | |
| 39,8–45,4 | "Cars sink on their springs. Tires flatten. Trees bend toward the ground." | banden worden plat (40 s), bomen buigen verder door (43,5 s), stroomdraden boven de straat zakken | | gesis van banden, kraken van bomen |
| **46,4** | "Anything that falls would hit the ground about one point four times faster." | **Shot 2:** dichter bij de bouwplaats, stof hangt laag. Zonneschermen scheuren af, stukken gevel en dakrand vallen, lantaarnpalen en borden knikken, een stroomkabel knapt (49,3 s). | caption: *1.4 times faster.* | klappen van vallende stukken (berekend), metaal, kabel die knapt, gerommel begint |
| 51–52,3 | "Balconies break off." | 8 balkons breken af en vallen recht naar beneden | | gekraak + klappen + puin |
| 52,6–54,5 | "Windows crack in their frames." | ramen krijgen barsten, 200 glasscherven vallen | | glasgerinkel in 9 golfjes |
| 54,8–56,5 | "A crane folds in half." | de gele bouwkraan (58 m) knikt op 36 m hoogte en klapt dubbel | | metaalgekraak, grote klap + puin |
| **57,3** | "Buildings are designed with a safety margin. But very few were built to carry twice their own weight." | **Shot 3:** hoog boven de stad (100 m), kijkend over de laan naar de baai met een boogbrug; camera drijft langzaam vooruit. De middenoverspanning van de brug zakt 15 m door (58–63 s). | caption: *Not built for twice their weight.* | brug: diep metaal en kraken |
| 64–68 | "The older towers give up first." / "One floor onto the next." | 4 oude torens storten recht in, verdieping op verdieping (64,3 / 66,5 / 68,3 / 69,9 s); stofwolk rolt over de stad; vliegtuig zakt en vecht terug (65,5–72,5 s); lucht kleurt bruin | | lang laag gerommel, een klap per verdieping, zware klap op de grond; camera schudt alleen hier |
| 68–72,9 | **stilte** (4 × lange pauze, ± 5 s) | torens 3 en 4 vallen, stof overal | | alleen het instorten |
| 72,9–75,7 | "Then, the dust begins to settle." | stof wordt dunner | | al het geluid zakt weg (− 93 %): verre wind, lage toon, wat los puin |
| 76,2–80,3 | "Much of the city is still standing. Bent. Holding on." | de stad staat er nog, met stompen waar de torens stonden | caption: *Bent. Holding on.*; teller weg (80 s) | stil |
| 81,3–85,7 | "But from now on, every step you take would carry twice your weight." | beeld wordt donkerder (81 s) | | stil |
| 86–90 | – | eindkaart, op 88,6 s uitfaden naar zwart | *What if gravity suddenly doubled?* + "You would weigh twice as much. Every building would carry twice its own weight." | uitfaden |

## 3. Wat er in de 3D-scène zit (`scene.html`)

Alles is gebouwd uit simpele blokken en kegels (low-poly), met vlakke kleuren en zachte schaduwen. Geen modellen van buiten.

- **Straat:** laan van 20 m breed, 4 rijstroken, dubbele gele middenstreep, stoepen, zebrapad, 2 verkeerslichten.
- **Gebouwen langs de straat:** winkels op de begane grond (gekleurde zonneschermen), 3–9 verdiepingen met ramen, balkons,
  zijstraten, een tweede rij erachter. Eén bouwplaats met open verdiepingen en een **gele torenkraan**.
- **Skyline:** 16 torens (86–182 m) + 140 lage blokken. 4 torens zijn "oud" (zandkleur) en storten in: ze zijn opgebouwd
  uit plakken van 3,5 m. Op ± 2/3 hoogte geeft een verdieping het op, het blok erboven valt recht naar beneden en er
  blijft een stomp van 2 verdiepingen + een puinhoop over.
- **Achtergrond:** baai met blauwgroen water, een boulevard, een boogbrug van 300 m en heuvels aan de overkant.
- **Straatdingen:** palmen en kegelboompjes (buigen en veren), lantaarnpalen en borden (kunnen knikken),
  5 stroomdraden over de straat (zakken; één knapt), fontein (spuit half zo hoog bij 2 g).
- **Leven:** 33 poppetjes (26 lopers, 7 overstekers) die stoppen en gaan zitten, leunen of gebogen staan;
  1 fietser; 16 auto's (4 rijstroken, stoppen voor rood, houden afstand, remmen bij de klap); 8 vogels; 1 vliegtuig.
  Geen geweld: niemand raakt gewond, er wordt niemand geraakt.
- **Natuurkunde:** alles wat valt (34 stukken gevel, 200 glasscherven, zonneschermen, 8 balkons) wordt echt
  doorgerekend met de zwaartekracht van de teller (4 stapjes per beeld). Elke klap op de grond wordt een
  "gebeurtenis" in `timeline.json`, en daar komt later precies op dat moment een geluid.
- **Licht en lucht:** de lucht gaat van helder blauw (begin) via grijs naar stoffig bruin (70–80 s). De nevel wordt
  dikker en het zonlicht zwakker naarmate er meer kapotgaat.
- **Camera:** per shot één rustige, rechte beweging (geen draaien). Bij de klap zakt de camera 22 cm en veert na.
  Schudden alleen bij de grootste klappen (instorten, kraan, de klap zelf).

## 4. Tekst in beeld

Gemaakt in 720x1280 en daarna 1,5× groter gemaakt naar 1080x1920.

| Wat | Waar | Letter |
|---|---|---|
| Titel (0–9 s) | midden, 400 px van boven | Playfair Display 600, 62 px, met zachte schaduw |
| Teller (9,2–80 s) | linksboven (40 px van links, 150 px van boven) | label GRAVITY in Cormorant Garamond 24 px met brede letterafstand; getal **2.00 g** in Playfair 64 px; daaronder m/s² en YOUR WEIGHT … lb |
| Captions | midden, 760 px van boven | Playfair 600 cursief, 42 px, faden in en uit (0,6 s) |
| Eindkaart (86 s) | midden | titel Playfair cursief 54 px + 2 regels Cormorant 27 px |

## 5. Geluid (`make_audio.py`, deel `build_gravity`)

Alles is gemaakt van gefilterde ruis, dus gratis en zonder auteursrecht. Lagen:

1. **Straat:** stadsgeluid (− 15 dB, na de klap − 25 dB), 4 auto's die langsrijden, getik van het voetgangerslicht, ver vliegtuig.
2. **De klap (15,9 s):** grote dreun. Daarna wordt alles **dof** (alsof je oren dichtzitten) tot de oorplop op 20,6 s.
   Lage drukdreun eronder.
3. **Kraken:** 12 kraakjes (veren, takken, gebouwen) tussen de klap en shot 2, gesis van platte banden, kraken van bomen.
4. **Escalatie:** gerommel vanaf shot 2. Voor elke gebeurtenis uit de simulatie een eigen geluid: klap (vallende stukken, links/rechts
   op de plek waar het valt), metaal (zonneschermen, palen), kabel die knapt, glas (9 golfjes), kraan (metaal + grote klap + puin),
   brug (laag metaal + kraken), torens (lang laag gerommel + een klap per verdieping + zware klap op de grond), vliegtuig.
5. **Na het hoogtepunt (72,9 s):** alles zakt 93 % weg; verre wind, lage toon en een paar stukjes puin. Op het eind uitfaden.
6. **Mix:** de stem gaat voor. Het geluid wordt ± 8 dB zachter zodra er gepraat wordt (sidechain), daarna op − 14 LUFS
   (YouTube-niveau), piek − 1 dB.

## 6. Hoe het in elkaar is gezet

```
script.txt ──► stem (per zin) ──► voice.mp3 + voice-times.tsv
                                        │
                                        ▼
              TL-blok bovenaan scene.html (tijden = stem + 0,5 s)
                                        │
          ┌─────────────────────────────┼──────────────────────────────┐
          ▼                             ▼                              ▼
 node render.mjs stills        node render.mjs timeline      node render.mjs video silent.mp4 3
 (testbeelden)                 → timeline.json               (720x1280, 30 fps, 3 browsers tegelijk)
                                        │                              │
                                        ▼                              │
                     python3 make_audio.py gravity-doubled             │
                     → sfx-bed.wav + mix.wav (stem + geluid)           │
                                        └──────────────┬───────────────┘
                                                       ▼
                         ffmpeg: beeld 1080x1920 + mix.wav → gravity-doubled.mp4
```

- **Beeld:** `render.mjs` opent `scene.html` in een onzichtbare Chromium-browser (Playwright). Voor elk beeld roept hij
  `renderAt(t)` aan, maakt een screenshot (JPEG) en stuurt die naar ffmpeg (x264, crf 17). Het werk wordt verdeeld over
  3 browsers; de stukken worden daarna aan elkaar geplakt.
- **Alles staat vast:** de scène gebruikt vaste "toevalsgetallen" (seeds) en de natuurkunde wordt vooraf voor alle
  beelden uitgerekend. Elke render geeft dus precies hetzelfde beeld.
- **Eindbestand:** H.264 1080x1920, 30 fps, ± 2,5 Mbit/s; geluid AAC 192 kbit/s stereo, 44,1 kHz; 31 MB.

## 7. Wat nu anders is dan deze video (standaard sinds 11 okt 2026)

De eigenaar houdt het **verhaal en de opbouw** van deze video aan, maar voor nieuwe video's geldt nu (`regels/standaard-video.md`):
- géén eindkaart en géén zwart eindscherm: het laatste beeld blijft staan;
- één doorlopende camerabeweging in plaats van 3 harde shots;
- Europese eenheden (kg in plaats van pond);
- stem: standaard Chatterbox (gratis, pc); xAI alleen op verzoek.
