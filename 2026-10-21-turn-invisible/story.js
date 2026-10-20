// What IF You Could Turn Invisible? – PART 1. Scène-ids = de {img:..}-cues in script-cues.txt.
// Elke scène: (t = tijd in de scène, d = lengte van de scène, T = tijd in de video) → SVG van 1080 x 780.
const YOU = '#f39a2b';
const MG = '#e0483e';
const zoom = (z, cx, cy, svg) => `<g transform="translate(${cx},${cy}) scale(${z}) translate(${-cx},${-cy})">${svg}</g>`;
const flash = (t, x, y) => t < 0.6 ? `<circle cx="${x}" cy="${y}" r="${80 + t / 0.6 * 900}" fill="#fff" opacity="${1 - t / 0.6}"/>` : '';
const chalk = (txt, x, y, k = 1) => `<text x="${x}" y="${y}" font-family="DejaVu Sans" font-weight="700" font-size="44" fill="#fff" opacity="${clamp01(k)}">${txt}</text>`;

// Onzichtbaar poppetje: vaag lichaam + gestippelde witte omtrek (rond hoofd, jas, streepbenen).
const ghost = (o) => {
  const s = o.s || 1, x = o.x, y = o.y, p = o.pop == null ? 1 : o.pop;
  const S = n => (n * s).toFixed(1);
  const shapes = `<circle cx="${x}" cy="${y - 295 * s}" r="${S(47)}"/>
    <path d="M${x - 38 * s},${y - 250 * s} Q${x - 42 * s},${y - 180 * s} ${x - 40 * s},${y - 112 * s} L${x + 40 * s},${y - 112 * s} Q${x + 42 * s},${y - 180 * s} ${x + 38 * s},${y - 250 * s} Q${x},${y - 258 * s} ${x - 38 * s},${y - 250 * s}Z"/>
    <rect x="${x - 27 * s}" y="${y - 125 * s}" width="${S(11)}" height="${S(125)}" rx="${S(5)}"/>
    <rect x="${x + 11 * s}" y="${y - 125 * s}" width="${S(11)}" height="${S(125)}" rx="${S(5)}"/>`;
  // donkere onderslag zodat de witte stippellijn ook op de lichte vloer leesbaar blijft
  const line = `<g fill="none" stroke="#2a2530" stroke-width="9" stroke-dasharray="12 10" opacity=".35">${shapes}</g>
    <g fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="12 10" opacity=".95">${shapes}</g>`;
  return char({ ...o, alpha: 0.16 }) + `<g transform="translate(${x},${y}) scale(${p}) translate(${-x},${-y})">${line}</g>`;
};

// Flesje op een tafel (staat op de tafeltop y = tafel y).
const bottle = (x, y, k = 1) => `<g transform="translate(${x},${y}) scale(${k})">
  <rect x="-8" y="-54" width="16" height="18" rx="3" fill="#c98b5a"/>
  <path d="M-9,-36 L9,-36 L20,-16 L22,12 Q0,24 -22,12 L-20,-16Z" fill="#79d18f"/>
  <circle cx="-4" cy="-4" r="6" fill="#bdf0c9" opacity=".8"/>
  <rect x="-31" y="-18" width="62" height="26" rx="5" fill="#fff"/>
  <text x="0" y="2" text-anchor="middle" font-family="Inter Display,Arial Black,DejaVu Sans,Arial" font-weight="900" font-size="16" fill="#111">INVIS</text></g>`;

// Zwevende kleren (jasje + streepbenen, geen lichaam) voor de "je kleren zweven"-scène.
const hoodie = (x, y, s = 1, bob = 0) => `<g transform="translate(${x},${y - bob}) scale(${s})">
  <path d="M-38,-238 Q-42,-180 -40,-112 L40,-112 Q42,-180 38,-238 Q0,-256 -38,-238Z" fill="${YOU}"/>
  <path d="M2,-245 L2,-112" stroke="${shade(YOU)}" stroke-width="4"/>
  <path d="M-34,-250 Q0,-228 34,-250 Q38,-238 30,-232 Q0,-214 -30,-232 Q-38,-238 -34,-250Z" fill="${shade(YOU)}"/>
  <rect x="-50" y="-240" width="17" height="105" rx="8" fill="${YOU}"/>
  <rect x="33" y="-240" width="17" height="105" rx="8" fill="${YOU}"/>
  <circle cx="-41" cy="-130" r="9" fill="${DARK}"/><circle cx="41" cy="-130" r="9" fill="${DARK}"/>
  <rect x="-27" y="-125" width="11" height="125" rx="5" fill="${DARK}"/>
  <rect x="11" y="-125" width="11" height="125" rx="5" fill="${DARK}"/></g>`;

const STORY = {
  title: ['What IF You Could Turn', 'Invisible?'],
  part: 'PART 1',
  sfx: [{ scene: 's1', frac: 0.72, type: 'ding' }, { scene: 's3', at: 0, type: 'poof' },
        { scene: 's10', frac: 0.8, type: 'boom' }],
  scenes: {
    s1(t, d, T) {
      const k = clamp01(t / 2.4);
      let g = bedroom({ machineAt: 0 }) + desk(790) + bottle(800, 556, 1.7 + Math.sin(t * 3) * 0.05) +
        char({ x: lerp(-120, 420, k), y: FLOOR, s: 1.35, col: YOU, walk: k < 1 ? T * 9 : 0, blink: blinkAt(T), look: 6,
          expr: t > 3 ? 'blij' : 'normaal' });
      if (t > 3) g += word('INVISIBLE', 640, 150, 58, clamp01((t - 3) * 3), '#9cff3a', -6);
      const z = lerp(1, 1.35, (t - d * 0.6) / (d * 0.4));
      return zoom(z, 780, 400, g);
    },
    s2(t, d, T) {
      const up = t > 0.3 && t < 2.3, tilt = up ? -55 - Math.sin(t * 6) * 8 : 0;
      let g = bedroom({ machineAt: 0 }) + desk(900) +
        char({ x: 620, y: FLOOR, s: 1.35, col: YOU, expr: up ? 'blij' : 'normaal', blink: blinkAt(T), look: 6,
          armR: up ? -150 : 0, hop: up ? 8 : 0 });
      g += up ? `<g transform="rotate(${tilt} 660 300)">${bottle(660, 300, 0.95)}</g>` : bottle(900, 556, 1.7);
      const z = lerp(1.05, 1.3, clamp01(t / d));
      return zoom(z, 660, 380, g);
    },
    s3(t, d, T) {
      const pk = clamp01(t / 0.35), pop = pk < 1 ? 0.3 + 0.75 * Math.sin(pk * Math.PI / 2) : 1;
      const scared = t < 1.2;
      let g = bedroom({ machineAt: 0 }) +
        char({ x: 380, y: FLOOR, s: 1.35, col: YOU, expr: scared ? 'bang' : 'normaal', blink: blinkAt(T), look: 6,
          alpha: clamp01(1 - t / 1.3), hop: scared ? Math.max(0, Math.sin(t * Math.PI / 0.6)) * 45 : 0,
          shake: scared ? Math.sin(t * 90) * 5 : 0 }) +
        ghost({ x: 730, y: FLOOR, s: 1.35, col: YOU, expr: t > 2.4 ? 'blij' : 'bang', blink: blinkAt(T, 1.3), look: -6, pop });
      g += flash(t, 730, 400) + hoodie(730, FLOOR, 1.2 * pop, Math.sin(t * 2.4) * 8);
      if (t < 1.2) g += word('POOF!', 700, 150, 110, clamp01(t / 0.25));
      const z = lerp(1, 1.32, clamp01((t - 2.2) / 2.6));
      return zoom(z, 560, 300, g);
    },
    s4(t, d, T) {
      const k = clamp01(t / 3.2), walking = k > 0 && k < 1, mx = lerp(1190, 130, k);
      let g = bedroom({ machineAt: 0 }) +
        char({ x: mx, y: FLOOR, s: 1.45, col: MG, hair: 'long', expr: 'blij', flip: true,
          walk: walking ? T * 8 : 0, blink: blinkAt(T, 2), look: -4 }) +
        ghost({ x: 620, y: FLOOR, s: 1.5, col: YOU, expr: 'blij', blink: blinkAt(T, 1.3), look: 6 });
      if (t > 0.5 && t < 2.6) g += bubble('Dinner!', mx - 70, 150, clamp01((t - 0.5) * 4));
      return g;
    },
    s5(t, d, T) {
      const g = classroom(chalk('MATH TEST', 300, 140)) + desk(330) +
        char({ x: 810, y: FLOOR, s: 1.4, col: '#8e5bd1', hair: 'bun', glasses: true, expr: 'normaal',
          blink: blinkAt(T, 0.7), look: -6, armL: t > 1.4 ? Math.sin(t * 5) * 12 : 0 }) +
        ghost({ x: 330, y: FLOOR, s: 1.2, col: YOU, expr: 'stiekem', blink: blinkAt(T, 1.3), look: 6 });
      return zoom(lerp(1, 1.12, clamp01(t / d)), 540, 300, g);
    },
    s6(t, d, T) {
      const k = clamp01((t - 0.8) / 0.5);
      const g = classroom(chalk('GRADE:', 300, 140)) +
        char({ x: 850, y: FLOOR, s: 1.4, col: '#8e5bd1', hair: 'bun', glasses: true, expr: t > 1.7 ? 'bang' : 'normaal',
          blink: blinkAt(T, 0.7), look: -6, shake: t > 1.7 ? Math.sin(t * 50) * 3 : 0 }) +
        ghost({ x: lerp(380, 545, clamp01(t / 1.4)), y: FLOOR, s: 1.25, col: YOU, expr: 'stiekem', blink: blinkAt(T, 1.3), look: -6 });
      const g2 = t > 0.8 ? g + word('A+', 430, 265, 150, Math.min(1.1, k * 1.1), '#ff3b3b', -8) : g;
      return zoom(lerp(1, 1.12, clamp01(t / d)), 520, 300, g2);
    },
    s7(t, d, T) {
      const talk = t < d * 0.5;
      let g = classroom(chalk('LUNCH', 300, 140)) + desk(400) +
        char({ x: 400, y: FLOOR, s: 1.25, col: '#4caf6a', cap: '#3b82d6', expr: 'verdrietig',
          blink: blinkAt(T, 2.1), look: 6 }) +
        ghost({ x: 730, y: FLOOR, s: 1.3, col: YOU, expr: talk ? 'blij' : 'verdrietig', blink: blinkAt(T), look: -6 });
      if (talk) g += bubble('Hey!', 730, 150, clamp01(t * 4));
      else g += word('?', 470, 160, 96, clamp01((t - d * 0.5) * 4), '#fff', -6);
      return g;
    },
    s8(t, d, T) {
      const late = t > d * 0.45;
      const g = classroom(chalk('LUNCH', 300, 140)) + desk(400) +
        ghost({ x: 400, y: FLOOR, s: 1.3, col: YOU, expr: late ? 'verdrietig' : 'normaal', blink: blinkAt(T), look: 0,
          shake: late ? Math.sin(t * 40) * 2 : 0 });
      return zoom(lerp(1, 1.15, clamp01(t / d)), 480, 320,
        late ? g + word('NOBODY', 700, 200, 74, clamp01((t - d * 0.45) * 4), '#ff3b3b', -6) : g);
    },
    s9(t, d, T) {
      const k = clamp01(t / 3), walking = k > 0 && k < 1, mx = lerp(1190, 880, k);
      let g = bedroom({ night: true, machineAt: 0 }) +
        char({ x: mx, y: FLOOR, s: 1.4, col: MG, hair: 'long', expr: 'normaal', flip: true,
          walk: walking ? T * 8 : 0, blink: blinkAt(T, 2), look: -4 }) +
        ghost({ x: 500, y: FLOOR, s: 1.45, col: YOU, expr: t > d * 0.5 ? 'boos' : 'bang', blink: blinkAt(T), look: 6,
          shake: Math.sin(t * 70) * 3 });
      if (t < 1.7) g += word('HELP!', 500, 150, 96, clamp01(t * 4), '#ff3b3b', -8);
      return g;
    },
    s10(t, d, T) {
      const hy = FLOOR - 295 * 1.45, k = clamp01((t - d * 0.15) / (d * 0.4));
      const beams = `<g opacity="${0.9 * k}" stroke="#ffe27a" stroke-width="16" stroke-linecap="round" fill="none">
        <path d="M-40,${hy - 70} L1120,${hy - 25}" stroke-dasharray="34 22"/>
        <path d="M-40,${hy + 15} L1120,${hy + 60}" stroke-dasharray="34 22"/></g>`;
      const g = bedroom({ machineAt: 0 }) +
        ghost({ x: 540, y: FLOOR, s: 1.45, col: YOU, expr: 'bang', blink: blinkAt(T), look: 0 }) + beams;
      const dark = clamp01((t - d * 0.6) / (d * 0.34)) * 0.9;
      return zoom(lerp(1, 1.22, clamp01(t / d)), 540, 320, g) +
        `<rect width="1080" height="780" fill="#000" opacity="${dark}"/>`;
    },
    s11(t, d, T) {
      const k = clamp01(t / 0.3);
      const base = bedroom({ machineAt: 0 }) +
        ghost({ x: 540, y: FLOOR, s: 1.45, col: YOU, expr: 'bang', blink: blinkAt(T), look: 0 }) +
        word('BLIND?', 740, 190, 88, 1, '#ff3b3b', -8);
      return zoom(1.45, 540, 350, base) + `<rect width="1080" height="780" fill="#000" opacity=".55"/>` +
        `<g transform="translate(540,390) scale(${0.5 + 0.5 * k})"><rect x="-260" y="-80" width="520" height="160" rx="26" fill="#fff"/>
         <text x="0" y="38" text-anchor="middle" font-family="Inter Display,Arial Black,DejaVu Sans,Arial" font-weight="900" font-style="italic" font-size="110" fill="#111">PART 2?</text></g>`;
    },
  },
};
