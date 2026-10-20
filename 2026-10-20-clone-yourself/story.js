// What IF You Could Clone Yourself? – PART 1. Scène-ids = de {img:..}-cues in script-cues.txt.
// Elke scène: (t = tijd in de scène, d = lengte van de scène, T = tijd in de video) → SVG van 1080 x 780.
const YOU = '#f39a2b';
const zoom = (z, cx, cy, svg) => `<g transform="translate(${cx},${cy}) scale(${z}) translate(${-cx},${-cy})">${svg}</g>`;
const flash = (t, x, y) => t < 0.6 ? `<circle cx="${x}" cy="${y}" r="${80 + t / 0.6 * 900}" fill="#fff" opacity="${1 - t / 0.6}"/>` : '';

function s9layout(t, d, T, momDone) {
  const mk = momDone ? 1 : clamp01((t - d * 0.12) / (d * 0.6));
  const momX = lerp(1250, 470, mk), walking = mk > 0 && mk < 1;
  const sad = momDone || t > d * 0.55;
  let g = bedroom() +
    char({ x: 260, y: FLOOR, s: 1.35, ...HOOFDPERSOON, expr: 'blij', blink: blinkAt(T, 1.3), look: 6 }) +
    char({ x: 760, y: FLOOR, s: 1.35, ...HOOFDPERSOON, expr: sad ? 'verdrietig' : 'normaal', blink: blinkAt(T), look: sad ? -6 : 6 }) +
    char({ x: momX, y: FLOOR, s: 1.5, col: '#e0483e', hair: 'long', expr: 'blij', flip: true, walk: walking ? T * 8 : 0, blink: blinkAt(T, 2), look: -4 });
  if (!momDone && t < d * 0.5) g += bubble('Sweetie!', momX - 40, 140, clamp01(t * 4));
  if (mk >= 1) g += heart(360, 230 - (t % 1.2) * 60, 1.4, 1 - (t % 1.2) / 1.2) + heart(320, 280 - ((t + 0.6) % 1.2) * 60, 1, 1 - ((t + 0.6) % 1.2) / 1.2);
  return g;
}

const STORY = {
  title: ['What IF You Could Clone', 'Yourself?'],
  part: 'PART 1',
  sfx: [{ scene: 's3', at: 0, type: 'poof' }, { scene: 's5', frac: 0.45, type: 'ding' }, { scene: 's2', at: 1.0, type: 'click' },
        { scene: 's10', frac: 0.55, type: 'boom' }],
  scenes: {
    s1(t, d, T) {
      const k = clamp01(t / 2.5);
      let g = bedroom() + char({ x: lerp(-120, 420, k), y: FLOOR, s: 1.35, ...HOOFDPERSOON, walk: k < 1 ? T * 9 : 0, blink: blinkAt(T), look: 6,
        expr: t > 3 ? 'normaal' : 'blij' });
      if (t > 3) g += word('?', 470, 150 - Math.sin(t * 3) * 6, 120, clamp01((t - 3) * 4), '#fff', 8);
      const z = lerp(1, 1.35, (t - d * 0.65) / (d * 0.3));
      return zoom(z, 880, 420, g);
    },
    s2(t, d, T) {
      const k = clamp01(t / 0.9), press = t > 0.9 && t < 1.6;
      const light = t > 1 ? Math.abs(Math.sin((t - 1) * 8)) : 0;
      return zoom(1.2, 820, 420, bedroom({ light }) + char({ x: lerp(420, 800, k), y: FLOOR, s: 1.35, ...HOOFDPERSOON, walk: k < 1 ? T * 9 : 0,
        blink: blinkAt(T), look: 6, armR: press ? -75 : 0, expr: t > 1.6 ? 'bang' : 'normaal' }));
    },
    s3(t, d, T) {
      const pk = clamp01(t / 0.35), pop = pk < 1 ? 0.3 + 0.75 * Math.sin(pk * Math.PI / 2) : 1;
      const scared = t < 1.4;
      let g = bedroom() +
        char({ x: 380, y: FLOOR, s: 1.35, ...HOOFDPERSOON, expr: scared ? 'bang' : 'normaal', blink: blinkAt(T), look: 6,
          hop: scared ? Math.max(0, Math.sin(t * Math.PI / 0.6)) * 50 : 0, shake: scared ? Math.sin(t * 90) * 6 : 0 }) +
        char({ x: 720, y: FLOOR, s: 1.35, ...HOOFDPERSOON, pop, expr: t > 2.5 ? 'blij' : 'normaal', blink: blinkAt(T, 1.3), look: -6 });
      g += flash(t, 720, 400);
      if (t < 1.4) g += word('POOF!', 720, 160, 120, clamp01(t / 0.25));
      const z = lerp(1, 1.45, (t - 2.5) / 2.5);
      return zoom(z, 550, 260, g);
    },
    s4(t, d, T) {
      const sweep = Math.sin(t * 2.2);
      return bedroom({ tv: true, machineAt: 0 }) +
        char({ x: 230 + sweep * 70, y: FLOOR, s: 1.35, ...HOOFDPERSOON, expr: 'blij', hold: 'broom', walk: T * 7, blink: blinkAt(T, 1.3), look: sweep > 0 ? 6 : -6, flip: Math.cos(t * 2.2) < 0 }) +
        char({ x: 520, y: FLOOR, s: 1.35, ...HOOFDPERSOON, expr: 'blij', hold: 'controller', blink: blinkAt(T), look: 6, hop: Math.abs(Math.sin(t * 6)) * 6 });
    },
    s5(t, d, T) {
      const chalk = (txt, x, y, k) => `<text x="${x}" y="${y}" font-family="DejaVu Sans" font-weight="700" font-size="44" fill="#fff" opacity="${k}">${txt}</text>`;
      const board = chalk('2 + 2 = 4', 250, 140, clamp01(t - 0.3)) + chalk('E = mc²', 250, 210, clamp01(t - 1.2)) + chalk('7 × 8 = 56', 250, 280, clamp01(t - 2.1));
      let g = classroom(board) + char({ x: 640, y: FLOOR, s: 1.35, ...HOOFDPERSOON, expr: t > d * 0.45 ? 'blij' : 'normaal', blink: blinkAt(T, 1.3), look: -6,
        armL: t < d * 0.45 ? 140 + Math.sin(t * 12) * 8 : 0 }) + desk(160) + desk(940);
      if (t > d * 0.45) g += word('A+', 830, 230, 190, Math.min(1.1, clamp01((t - d * 0.45) / 0.2) * 1.1), '#ff3b3b', 10);
      return g;
    },
    s6(t, d, T) {
      let g = classroom(word('A+', 760, 260, 110, 1, '#ff3b3b', 10)) +
        char({ x: 190, y: FLOOR, s: 1.45, col: '#8e5bd1', hair: 'bun', glasses: true, expr: 'blij', blink: blinkAt(T, 0.7), look: 6 }) +
        char({ x: 500, y: FLOOR, s: 1.35, ...HOOFDPERSOON, expr: 'blij', hop: Math.abs(Math.sin(t * 4)) * 20, blink: blinkAt(T, 1.3) }) +
        char({ x: 790, y: FLOOR, s: 1.15, col: '#4caf6a', cap: '#e0483e', expr: 'blij', blink: blinkAt(T, 2.1), look: -6 }) +
        char({ x: 960, y: FLOOR, s: 1.1, col: '#3b82d6', hair: 'long', hairCol: '#e8b04a', expr: 'blij', blink: blinkAt(T, 0.3), look: -6 });
      for (let i = 0; i < 3; i++) { const p = (t * 0.8 + i / 3) % 1; g += heart(260 + i * 20, 300 - p * 220, 1.3, 1 - p); }
      if (t > d * 0.4) for (let i = 0; i < 3; i++) { const p = (t * 0.8 + i / 3) % 1; g += heart(850 + i * 30, 360 - p * 220, 1.2, 1 - p); }
      return g;
    },
    s7(t, d, T) {
      const k = clamp01(t / 2.6), turn = t > d * 0.5;
      return bedroom({ night: true }) +
        char({ x: 780, y: FLOOR, s: 1.35, ...HOOFDPERSOON, expr: turn ? 'boos' : 'normaal', blink: blinkAt(T), look: -6, armR: turn ? -100 : 0 }) +
        char({ x: lerp(-120, 420, k), y: FLOOR, s: 1.35, ...HOOFDPERSOON, walk: k < 1 ? T * 9 : 0, expr: turn ? 'stiekem' : 'normaal', blink: blinkAt(T, 1.3),
          look: turn ? Math.sin(t * 6) * 6 : 6 });
    },
    s8(t, d, T) {
      const z = (i) => { const p = (t * 0.6 + i / 3) % 1; return word('z', 160 + p * 80 + i * 10, 400 - p * 200, 50 + i * 15, 1, '#fff', 0).replace('opacity', 'x') + ''; };
      return bedroom({ night: true }) +
        char({ x: 450, y: 480, s: 1.0, ...HOOFDPERSOON, expr: 'slaap', lie: -90 }) +
        `<rect x="190" y="440" width="270" height="95" rx="18" fill="#5f9ad1"/>` +
        z(0) + z(1) + z(2) +
        char({ x: 760, y: FLOOR, s: 1.35, ...HOOFDPERSOON, expr: t > d * 0.5 ? 'boos' : 'bang', blink: blinkAt(T), look: -6, shake: t > d * 0.5 ? Math.sin(t * 60) * 3 : 0 });
    },
    s9(t, d, T) { return s9layout(t, d, T, false); },
    s10(t, d, T) {
      const z = lerp(1, 1.8, t / (d * 0.8));
      let g = s9layout(t, d, T, true);
      if (t > d * 0.55) g += word('COPY', 730, 470, 100, Math.min(1.1, clamp01((t - d * 0.55) / 0.2) * 1.1), '#ff3b3b', -10);
      return zoom(z, 760, 330, g) + `<rect width="1080" height="780" fill="url(#vig)" opacity="${clamp01(t / 2)}"/>`;
    },
    s11(t, d, T) {
      const k = clamp01(t / 0.3);
      return zoom(1.8, 760, 330, s9layout(9, 10, T, true) + word('COPY', 730, 470, 100, 1.1, '#ff3b3b', -10)) +
        `<rect width="1080" height="780" fill="#000" opacity=".55"/>` +
        `<g transform="translate(540,390) scale(${0.5 + 0.5 * k})"><rect x="-260" y="-80" width="520" height="160" rx="26" fill="#fff"/>
         <text x="0" y="38" text-anchor="middle" font-family="Inter Display,Arial Black,DejaVu Sans,Arial" font-weight="900" font-style="italic" font-size="110" fill="#111">PART 2?</text></g>`;
    },
  },
};
