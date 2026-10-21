// What IF It Never Stops Raining? – PART 1. Scène-ids = de {img:..}-cues in script-cues.txt.
// Elke scène: (t = tijd in de scène, d = lengte van de scène, T = tijd in de video) → SVG van 1080 x 780.
// Eigen helpers in dezelfde platte stijl voor wat het script noemt (regen, water, eenden, doos, dakrand, regencirkel).
const YOU = HOOFDPERSOON;
const VADER = { skin: '#f6d2b0', hair: 'kort', hairCol: '#4a3a28', top: 'jas', col: '#3b82d6' };
const zoom = (z, cx, cy, svg) => `<g transform="translate(${cx},${cy}) scale(${z}) translate(${-cx},${-cy})">${svg}</g>`;

// Regen: schuine strepen + druppels op de vloer; met binnen > 0 valt alleen regen binnen die straal (regencirkel).
const regen = (k = 1, binnen = 0) => {
  let o = '';
  for (let i = 0; i < 72; i++) {
    const x = 20 + (i * 173 + 60) % 1040, y = 30 + (i * 71) % 500;
    if (binnen > 0 && Math.hypot(x - 540, y - 460) > binnen - 26) continue;
    o += `<path d="M${x},${y} L${x - 7},${y + 24 + (i % 3) * 8}" stroke="${i % 4 ? '#7db3e8' : '#b9d4f2'}" stroke-width="${1.7 + (i % 3) * 0.7}" opacity="${0.3 + (i % 5) * 0.09}" stroke-linecap="round"/>`;
    if (i % 7 === 0 && (binnen < 1 || Math.hypot(x - 540, 460 - 460) < binnen - 40)) o += `<ellipse cx="${x}" cy="690" rx="${6 + (i % 3) * 3}" ry="3" fill="#9fc8ec" opacity=".55"/>`;
  }
  return `<g opacity="${clamp01(k)}">${o}</g>`;
};

// Extra regen binnen het raamkader van s1 (dichter, zichtbaar door het glas).
const raamRegen = () => {
  let o = '';
  for (let i = 0; i < 16; i++) {
    const x = 668 + (i * 53) % 262, y = 100 + (i * 97) % 210;
    o += `<path d="M${x},${y} L${x - 6},${y + 22}" stroke="#7db3e8" stroke-width="2" opacity=".5" stroke-linecap="round"/>`;
  }
  return o;
};

// Plasje / water op de vloer; breedte groeit mee.
const plas = (x, breedte, c = '#3fa3d6') => `<ellipse cx="${x}" cy="${FLOOR + 8}" rx="${breedte}" ry="26" fill="${c}" opacity=".5"/>
  <ellipse cx="${x}" cy="${FLOOR + 4}" rx="${breedte * 0.55}" ry="8" fill="#9fc8ec" opacity=".55"/>`;

// Eend die in de straat zwemt (lichaam, kop, snavel, oog); zwiept zachtjes op en neer.
const eend = (x, y, c = '#f6d2b0', fase = 0, k = 1) => `<g transform="translate(${x},${y + Math.sin(fase) * 3}) scale(${k})">
  <ellipse cx="0" cy="-12" rx="26" ry="15" fill="${c}"/><path d="M26,-12 Q34,-6 26,-2 L20,-2Z" fill="${c}"/>
  <circle cx="16" cy="-27" r="9" fill="${c}"/><path d="M23,-29 L33,-26 L23,-22Z" fill="#f2a03c"/><circle cx="18" cy="-29" r="1.8" fill="#111"/></g>`;

// Gestapelde handdoeken voor de deur; idx = 0,1,2 (onder naar boven).
const handdoek = (x, y, idx) => `<g transform="translate(${x},${y})"><rect x="-34" y="-18" width="68" height="18" rx="7" fill="${['#ff9f68', '#8fd3ff', '#ffd95a'][idx % 3]}"/><path d="M-34,-9 H34" stroke="${shade(['#ff9f68', '#8fd3ff', '#ffd95a'][idx % 3])}" stroke-width="2.5"/></g>`;

// Doos met droge spullen, staat op de vloer.
const doos = (x) => `<g transform="translate(${x},${FLOOR})"><rect x="-55" y="-70" width="110" height="70" rx="6" fill="#c98b5a"/><rect x="-58" y="-74" width="116" height="12" rx="4" fill="#b07a4a"/><rect x="-22" y="-48" width="44" height="26" rx="4" fill="#fff"/></g>`;

// Dakrand vóór de poppetjes: zo staan ze op een plat dak.
const randje = () => `<rect x="0" y="655" width="1080" height="40" fill="#6f6a60"/><rect x="0" y="649" width="1080" height="7" fill="#8a8375"/>`;

// Gestippelde regencirkel rond het middelpunt van de stad (540, 460).
const ring = (r, k, val) => `<circle cx="540" cy="460" r="${r}" fill="none" stroke="${val}" stroke-width="7" stroke-dasharray="20 16" opacity="${clamp01(k)}"/>`;

// De stad van boven: gebouwen in het water, wolken en — buiten de cirkel — een zon.
const stadsLucht = () => place({ back: 'day', ground: 'water', items: [['building', 300, '#c9705a', 260], ['building', 540, '#e2b45a', 280], ['building', 780, '#7a9cc6', 260], ['cloud', 200, 90], ['cloud', 880, 70], ['sun', 985, 120]] });

// Het platte dak 's nachts, waar de hele straat samenkomt.
const dak = () => place({ back: 'night', ground: 'tiles', items: [['building', 130, '#7a9cc6', 260], ['building', 390, '#8fb07a', 240], ['building', 950, '#b5835a', 260]] });

const STORY = {
  title: ['What IF It Never', 'Stops Raining?'],
  part: 'PART 1',
  sfx: [{ scene: 's1', frac: 0.5, type: 'click' }, { scene: 's2', frac: 0.55, type: 'poof' },
        { scene: 's7', frac: 0.5, type: 'ding' }],
  scenes: {
    s1(t, d, T) {
      const k = clamp01(t / 1.4), over = t > 1.6;
      let g = place({ wall: true, back: '#f2e8dc', ground: 'wood', items: [['bed', 240], ['picture', 600, 130], ['window', 800, 80]] }) +
        `<defs><clipPath id="s1raam"><rect x="655" y="85" width="290" height="252"/></clipPath></defs>` +
        `<g clip-path="url(#s1raam)">${regen(1)}</g>` + raamRegen() +
        char({ ...YOU, x: 720, y: FLOOR, s: 1.25, expr: over ? 'blij' : 'slaap', blink: blinkAt(T, 1.1), look: over ? 6 : 0,
          armR: over ? Math.sin(t * 8) * 14 : 0, pop: k });
      if (over) g += word('three days', 250, 170, 60, clamp01((t - 1.6) * 3), '#9cff3a', -6);
      return g;
    },
    s2(t, d, T) {
      const k = clamp01(t / 2.4);
      let g = place({ wall: true, back: '#f2e8dc', ground: 'tiles', items: [['door', 930], ['picture', 250, 140]] }) +
        `<rect x="0" y="${FLOOR - 4 - k * 22}" width="1080" height="${22 * k + 4}" fill="#3fa3d6" opacity=".5"/>` +
        plas(930, 40 + k * 260) +
        char({ ...YOU, x: lerp(320, 640, clamp01(t / 1.9)), y: FLOOR, s: 1.25, walk: t < 1.9 ? T * 8 : 0, expr: 'bang', blink: blinkAt(T), look: 6,
          armR: t > 1.9 ? Math.sin(t * 10) * 16 : 0 });
      if (t > 1.2) g += handdoek(892, FLOOR, 0);
      if (t > 1.7) g += handdoek(892, FLOOR - 16, 1);
      if (t > 2.2) g += handdoek(892, FLOOR - 32, 2);
      return g;
    },
    s3(t, d, T) {
      let g = place({ back: 'day', ground: 'water', items: [['building', 150, '#c9705a', 330], ['building', 420, '#e2b45a', 300], ['building', 720, '#7a9cc6', 350], ['cloud', 300, 80], ['car', 630, '#3b82d6']] }) +
        regen(1) + plas(630, 200, '#2f95c9') + eend(330, 630, '#f6d2b0', t) +
        char({ ...YOU, x: 170, y: FLOOR, s: 1.2, expr: 'bang', blink: blinkAt(T), look: 6, shake: Math.sin(t * 40) * 2 });
      const z = lerp(1, 1.25, clamp01((t - d * 0.55) / (d * 0.35)));
      return zoom(z, 630, 340, g);
    },
    s4(t, d, T) {
      let g = place({ back: 'day', ground: 'water', items: [['building', 240, '#e2b45a', 320], ['building', 900, '#7a9cc6', 300], ['cloud', 540, 70]] }) +
        regen(1) +
        char({ ...YOU, x: 200, y: FLOOR, s: 1.2, expr: 'blij', blink: blinkAt(T), look: 6, hop: Math.abs(Math.sin(t * 5)) * 8 }) +
        eend(450, 620, '#f6d2b0', t) + eend(640, 650, '#e8e0c8', t + 1.2) + eend(820, 600, '#f6d2b0', t + 2.1, 0.85);
      const z = lerp(1, 1.2, clamp01((t - d * 0.5) / (d * 0.4)));
      return zoom(z, 640, 350, g);
    },
    s5(t, d, T) {
      const dood = t > d * 0.55;
      let g = place({ wall: true, back: '#f2e8dc', ground: 'carpet', items: [['table', 780], ['picture', 200, 140], ['tv', 320]] }) +
        `<rect x="0" y="${FLOOR - 34}" width="1080" height="140" fill="#3fa3d6" opacity=".45"/>`;
      if (dood) {
        g += char({ ...YOU, x: 900, y: 465, s: 0.7, lie: -90, expr: 'slaap', blink: 1, look: 0 }) +
          `<rect x="710" y="480" width="170" height="20" rx="10" fill="#ff9f68" opacity=".97"/>` +
          word('z', 620, 390, 60, clamp01((t - d * 0.55) * 3), '#fff', 0);
      } else {
        g += char({ ...YOU, x: 400, y: FLOOR, s: 1.2, expr: 'normaal', blink: blinkAt(T), look: 6, walk: t < 1.6 ? T * 8 : 0 });
      }
      return g;
    },
    s6(t, d, T) {
      const wijzig = clamp01((t - d * 0.3) / (d * 0.35));
      let g = dak() + regen(1) +
        char({ ...YOU, x: 300, y: FLOOR, s: 1.2, expr: 'normaal', blink: blinkAt(T), look: 6, armR: t > d * 0.3 ? -110 - wijzig * 30 : 0 }) +
        char({ ...VADER, x: 560, y: FLOOR, s: 1.2, expr: 'boos', blink: blinkAt(T, 0.9), look: -6, armR: t > d * 0.35 ? -108 : 0 }) +
        char({ skin: '#8a5a3b', hair: 'kort', hairCol: '#241a12', top: 'hoodie', col: '#4caf6a', x: 800, y: FLOOR, s: 1.15, expr: 'normaal', blink: blinkAt(T, 1.9), look: -6, flip: true }) +
        char({ skin: '#f6d2b0', hair: 'kort', hairCol: '#6b3f22', top: 'tshirt', col: '#8e5bd1', top2: '#fff', cap: '#e2b45a', x: 960, y: FLOOR, s: 1.0, expr: 'verdrietig', blink: blinkAt(T, 0.4), look: -6 });
      if (t > d * 0.25) g += bubble('Still raining!', 560, 220, clamp01((t - d * 0.25) * 4));
      return g + randje();
    },
    s7(t, d, T) {
      let g = stadsLucht() + ring(415, clamp01(t / 1.2), '#ffe27a') + regen(1, 415);
      const z = lerp(1.02, 1.25, clamp01(t / d));
      return zoom(z, 540, 380, g);
    },
    s8(t, d, T) {
      const groei = clamp01((t - d * 0.45) / (d * 0.35));
      let g = stadsLucht() + ring(345, 1, '#bcbfc7') + regen(1, 345 + groei * 70);
      if (t > d * 0.45) g += ring(415, clamp01(groei * 3), '#ffe27a') +
        word('yesterday', 215, 430, 44, 1, '#fff', -6) + word('today', 845, 200, 54, clamp01(groei * 3), '#ff3b3b', -6);
      return g;
    },
    s9(t, d, T) {
      const vraag = clamp01((t - d * 0.3) / (d * 0.45));
      let g = dak() + regen(1) + doos(950) +
        char({ ...VADER, x: 730, y: FLOOR, s: 1.15, expr: 'verdrietig', blink: blinkAt(T, 1.4), look: -4 }) +
        char({ ...YOU, x: 470, y: FLOOR, s: 1.2, expr: 'bang', blink: blinkAt(T), look: 6, armR: t > d * 0.3 ? -130 : 0 });
      if (vraag) g += word('where does it stop?', 520, 160, 50, clamp01(vraag * 3), '#9cff3a', -6);
      return g + randje();
    },
  },
};
