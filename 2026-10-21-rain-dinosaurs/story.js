// What IF It Never Stopped Raining? – PART 1. Scène-ids = de {img:..}-cues in script-cues.txt.
const zoom = (z, cx, cy, svg) => `<g transform="translate(${cx},${cy}) scale(${z}) translate(${-cx},${-cy})">${svg}</g>`;
const GREY = '#9fb0c0';
const town = (back = GREY) => place({ back, ground: 'grass', items: [['house', 200, '#e0483e'], ['tree', 470], ['house', 760, '#3b82d6'], ['pine', 1010]] });
const wetStreet = (back = GREY) => place({ back, ground: 'road', items: [['building', 120, '#c9705a', 360], ['building', 340, '#e2b45a', 280],
  ['building', 760, '#7a9cc6', 400], ['building', 980, '#8fb07a', 320], ['lamp', 560]] });
const floatCar = (x, T, c, tilt) => `<g transform="translate(0,${-95 + Math.sin(T * 2 + x) * 6}) rotate(${tilt + Math.sin(T * 1.5) * 3} ${x} 600)">${ITEMS.car(x, c)}</g>`;
const roofRim = `<rect x="430" y="362" width="220" height="14" rx="4" fill="#c8d3e0"/>`;
const pop = (t, at = 0) => Math.min(1, clamp01((t - at) / 0.2) * 1.1);

const STORY = {
  title: ['What IF It Never', 'Stopped Raining?'],
  part: 'PART 1',
  sfx: [{ scene: 's8', at: 0, type: 'boom' }, { scene: 's10', frac: 0.5, type: 'ding' }],
  ambient: [{ from: 's1', to: 's2', type: 'rain', vol: 0.6, at: 0.8 }, { from: 's3', to: 's7', type: 'storm', vol: 0.7 },
            { from: 's3', to: 's7', type: 'water', vol: 0.6 }, { from: 's7', to: 's8', type: 'crickets', vol: 0.3 },
            { from: 's9', to: 's9', type: 'rain', vol: 0.6 }, { from: 's10', to: 's11', type: 'wind', vol: 0.5 }],
  scenes: {
    s1(t, d, T) {
      const k = clamp01((t - 0.8) / 1.5);
      return zoom(lerp(1.2, 1, t / d), 540, 400, wetStreet(k > 0.5 ? GREY : 'day') +
        char({ ...HOOFDPERSOON, x: 540, y: FLOOR, s: 1.35, look: 0, blink: blinkAt(T), expr: t > 2 ? 'bang' : 'blij', hold: t > 2.5 ? 'umbrella' : '' }) +
        rain(T, k));
    },
    s2(t, d, T) {
      const hop = Math.max(0, Math.sin(t * 4)) * 70, x = 300 + (t / d) * 480;
      let g = place({ back: GREY, ground: 'grass', items: [['tree', 120], ['tree', 950], ['bush', 600]] }) + tag('DAY 1', pop(t));
      g += [260, 540, 820].map(px => `<ellipse cx="${px}" cy="${FLOOR + 5}" rx="110" ry="20" fill="#5aa6d6"/>`).join('');
      g += char({ ...HOOFDPERSOON, x, y: FLOOR, s: 1.35, expr: 'blij', hop, blink: blinkAt(T), look: 6 });
      if (hop < 8) g += [-1, 1].map(sd => `<path d="M${x + sd * 40},${FLOOR - 5} l${sd * 30},-40" stroke="#bfe3ff" stroke-width="7" stroke-linecap="round"/>`).join('');
      return g + rain(T, 0.8);
    },
    s3(t, d, T) {
      return wetStreet() + ITEMS.sign(900, 'CLOSED') + tag('DAY 7', pop(t)) +
        char({ ...HOOFDPERSOON, x: lerp(250, 560, t / d), y: FLOOR, s: 1.35, walk: T * 5, expr: t > d * 0.4 ? 'bang' : 'normaal', blink: blinkAt(T), look: 6 }) +
        flood(600, T) + rain(T);
    },
    s4(t, d, T) {
      const bx = lerp(-150, 640, t / d);
      return wetStreet() + tag('DAY 30', pop(t)) + floatCar(800, T, '#e0483e', -8) + floatCar(260, T, '#f2c45a', 6) +
        flood(500, T) +
        char({ x: bx, y: 575, s: 0.9, skin: '#f6d2b0', hair: 'kort', hairCol: '#7a4f33', top: 'trui', col: '#3b82d6', expr: 'blij', look: 6, armR: -40 + Math.sin(T * 4) * 25 }) +
        boat(bx, 505) + `<path d="M${bx + 30},430 L${bx + 120},${540 + Math.sin(T * 4) * 15}" stroke="#7a4f33" stroke-width="7"/>` + rain(T);
    },
    s5(t, d, T) {
      const lvl = lerp(700, 470, t / (d * 0.8));
      return place({ back: '#fbe9c6', wall: true, ground: 'tiles', items: [['window', 300, 70], ['fridge', 900], ['door', 640]] }) +
        ITEMS.table(540) + char({ ...HOOFDPERSOON, x: 540, y: 440, s: 1.1, expr: t > d * 0.4 ? 'bang' : 'normaal', blink: blinkAt(T), look: Math.sin(t * 2) * 6 }) +
        flood(lvl, T);
    },
    s6(t, d, T) {
      return zoom(lerp(1, 1.15, t / d), 540, 300, town() + flood(lerp(380, 330, t / d), T) + rain(T)) + tag('DAY 100', pop(t));
    },
    s7(t, d, T) {
      return place({ back: 'night', ground: 'water', items: [['building', 540, '#7a9cc6', 150]] }) + roofRim +
        char({ ...HOOFDPERSOON, x: 540, y: 372, s: 0.85, expr: 'verdrietig', blink: blinkAt(T), look: Math.sin(t) * 5, hold: 'umbrella' }) +
        flood(420, T) + rain(T);
    },
    s8(t, d, T) {
      return zoom(lerp(1, 1.9, t / 0.6), 540, 160, place({ back: 'night', ground: 'water', items: [['building', 540, '#7a9cc6', 150]] }) + roofRim +
        char({ ...HOOFDPERSOON, x: 540, y: 372, s: 0.85, expr: 'bang', blink: blinkAt(T), hold: 'umbrella', shake: t < 0.6 ? Math.sin(t * 80) * 3 : 0 }) +
        flood(420, T) + rain(T)) + word('WAIT…', 540, 700, 120, pop(t, 0.3), '#ffd95a', -6);
    },
    s9(t, d, T) {
      return place({ back: '#7f9a86', ground: 'grass', items: [['pine', 90], ['pine', 300], ['mountain', 800, '#6b7f72'], ['pine', 1000]] }) +
        `<ellipse cx="560" cy="690" rx="360" ry="40" fill="#4f8fb8" opacity=".8"/>` +
        dino(lerp(200, 520, t / d), FLOOR, 0.9, '#4caf6a', T * 6) + rain(T) +
        tag('230 MILLION YEARS AGO', pop(t, 1)) ;
    },
    s10(t, d, T) {
      const k = clamp01(t / 1.2);
      return place({ back: 'day', ground: 'sand', items: [['sun', 880, 120], ['mountain', 300, '#c9a37a'], ['rock', 900]] }) +
        dino(lerp(100, 380, t / d), FLOOR, 1, '#4caf6a', T * 7) + dino(lerp(-200, 120, t / d), FLOOR + 30, 0.7, '#e2b45a', T * 8) +
        dino(lerp(600, 760, t / d), FLOOR - 20, 0.6, '#d0704a', T * 7) + rain(T, 1 - k);
    },
    s11(t, d, T) {
      const k = clamp01(t / 0.3);
      return STORY.scenes.s10(6, 6, T) + `<rect width="1080" height="780" fill="#000" opacity=".55"/>` +
        `<g transform="translate(540,390) scale(${0.5 + 0.5 * k})"><rect x="-260" y="-80" width="520" height="160" rx="26" fill="#fff"/>
         <text x="0" y="38" text-anchor="middle" font-family="Inter Display,Arial Black,DejaVu Sans,Arial" font-weight="900" font-style="italic" font-size="110" fill="#111">PART 2?</text></g>`;
    },
  },
};
