// Cartoon-engine: platte 2D-poppetjes (rond hoofd, jas, streepbenen), plekken en de beeldopmaak (titel, PART, ondertitels).
// Alles is SVG-tekst; story.js per video bepaalt per scène wat er te zien is. Zie README.md.
const DARK = '#25222b';
const ease = x => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x);
const lerp = (a, b, x) => a + (b - a) * ease(x);
const clamp01 = x => Math.max(0, Math.min(1, x));
const blinkAt = (t, off = 0) => ((t + off) % 3.1) < 0.12 ? 0.1 : 1;
const shade = c => { const n = parseInt(c.slice(1), 16), f = v => Math.round(v * 0.82);
  return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join(''); };

function face(expr, blink, look) {
  const E = (x, y, rx, ry) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff"/>`;
  const P = (x, y, r) => `<circle cx="${x + look}" cy="${y}" r="${r}" fill="#111"/>`;
  const line = (d, w = 3.5, c = '#fff') => `<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
  let eyes = '', rest = '';
  switch (expr) {
    case 'stiekem': eyes = E(-15,-298,11,8)+E(15,-298,11,8)+P(-13,-297,4.5)+P(17,-297,4.5);
      rest = line('M-30,-316 L-5,-306 M5,-306 L30,-316', 5, '#111') + line('M-12,-275 Q4,-266 16,-280'); break;
    case 'blij': rest = line('M-25,-298 Q-15,-312 -5,-298 M5,-298 Q15,-312 25,-298', 5) + `<path d="M-16,-280 Q0,-258 16,-280 Z" fill="#fff"/>`; break;
    case 'bang': eyes = E(-15,-302,13,16)+E(15,-302,13,16)+P(-15,-300,3.5)+P(15,-300,3.5);
      rest = line('M-28,-326 Q-16,-332 -5,-326 M5,-326 Q16,-332 28,-326', 4, '#111') + `<ellipse cx="0" cy="-272" rx="7" ry="9" fill="#fff"/>`; break;
    case 'boos': eyes = E(-15,-298,11,11)+E(15,-298,11,11)+P(-13,-296,5)+P(13,-296,5);
      rest = line('M-30,-320 L-5,-305 M5,-305 L30,-320', 6, '#111') + line('M-11,-270 Q0,-280 11,-270'); break;
    case 'verdrietig': eyes = E(-15,-298,11,12)+E(15,-298,11,12)+P(-15,-295,5)+P(15,-295,5);
      rest = line('M-28,-308 L-6,-318 M6,-318 L28,-308', 4, '#111') + line('M-11,-268 Q0,-278 11,-268') +
        `<path d="M-20,-284 q-4,9 0,12 q4,-3 0,-12Z" fill="#8fd3ff"/>`; break;
    case 'slaap': rest = line('M-25,-298 Q-15,-290 -5,-298 M5,-298 Q15,-290 25,-298', 4) + line('M-6,-274 Q0,-271 6,-274', 3); break;
    default: eyes = E(-15,-300,11,13)+E(15,-300,11,13)+P(-15,-299,5)+P(15,-299,5);
      rest = line('M-8,-272 Q0,-268 8,-272', 3, '#111');
  }
  return `<g transform="translate(0,-300) scale(1,${blink}) translate(0,300)">${eyes}</g>${rest}`;
}

function hairBack(h, c) {
  if (h === 'long') return `<path d="M-50,-300 Q-56,-230 -44,-205 L44,-205 Q56,-230 50,-300Z" fill="${c}"/>`;
  return '';
}
function hairFront(h, c) {
  if (h === 'long') return `<path d="M-48,-302 Q-40,-352 0,-344 Q40,-352 48,-302 Q30,-330 0,-326 Q-30,-330 -48,-302Z" fill="${c}"/>`;
  if (h === 'bun') return `<circle cx="0" cy="-352" r="20" fill="${c}"/><path d="M-46,-305 Q-40,-346 0,-342 Q40,-346 46,-305 Q20,-330 -46,-305Z" fill="${c}"/>`;
  if (h === 'kort') return `<path d="M-46,-305 Q-42,-350 0,-344 Q42,-350 46,-305 Q10,-334 -46,-305Z" fill="${c}"/>`;
  return '';
}
function prop(p) {
  if (p === 'broom') return `<g transform="translate(41,-130)"><path d="M0,-70 L0,120" stroke="#9b6b45" stroke-width="6"/><path d="M-18,120 L18,120 L24,150 L-24,150Z" fill="#e8c35a"/></g>`;
  if (p === 'phone') return `<rect x="34" y="-150" width="16" height="28" rx="3" fill="#222"/>`;
  return '';
}

// o: x, y (voeten), s (schaal), col (jaskleur), expr, blink, look (pupillen -6..6), walk (fase), hop (px), shake (px),
//    pop (0..1 verschijnen), alpha, flip, hair ('long'|'bun'|'kort'), hairCol, glasses, cap (kleur), armL/armR (graden),
//    hold ('broom'|'phone'|'controller'), lie (graden, bv. -90 = liggen)
function char(o) {
  const { x, y, s = 1, col = '#f39a2b', expr = 'normaal', blink = 1, look = 0, walk = 0, hop = 0, shake = 0, pop = 1,
    alpha = 1, flip = false, hair = '', hairCol = '#6b3f22', glasses = false, cap = '', armL = 0, armR = 0, hold = '', lie = 0 } = o;
  const sh = shade(col), a = walk ? Math.sin(walk) * 22 : 0, bob = walk ? -Math.abs(Math.sin(walk)) * 6 : 0;
  const leg = (lx, ang) => `<g transform="rotate(${ang} ${lx + 5} -122)"><rect x="${lx}" y="-125" width="11" height="125" rx="5" fill="${DARK}"/><ellipse cx="${lx + 5}" cy="-3" rx="15" ry="6" fill="${DARK}"/></g>`;
  const ctrl = hold === 'controller';
  const aL = -a * 0.6 + armL + (ctrl ? -22 : 0), aR = a * 0.6 + armR + (ctrl ? 22 : 0);
  const sc = s * pop * (flip ? -1 : 1);
  return `<g opacity="${alpha}" transform="translate(${x + shake},${y}) rotate(${lie}) scale(${sc},${s * pop})">
  ${lie ? '' : `<ellipse cx="0" cy="2" rx="${Math.max(10, 48 - hop / 4)}" ry="7" fill="rgba(0,0,0,.18)"/>`}
  <g transform="translate(0,${-hop + bob})">
  ${leg(-22, a)}${leg(11, -a)}
  ${hairBack(hair, hairCol)}
  <path d="M-38,-238 Q-42,-180 -40,-112 L40,-112 Q42,-180 38,-238 Q0,-256 -38,-238Z" fill="${col}"/>
  <path d="M2,-245 L2,-112" stroke="${sh}" stroke-width="4"/>
  <path d="M-28,-170 L-6,-170 L-6,-150 L-28,-150Z M6,-170 L28,-170 L28,-150 L6,-150Z" fill="${sh}" opacity=".7"/>
  <path d="M-34,-250 Q0,-228 34,-250 Q38,-238 30,-232 Q0,-214 -30,-232 Q-38,-238 -34,-250Z" fill="${sh}"/>
  <g transform="rotate(${aL} -41 -235)"><rect x="-50" y="-240" width="17" height="105" rx="8" fill="${col}"/><circle cx="-41" cy="-130" r="9" fill="${DARK}"/></g>
  <g transform="rotate(${aR} 41 -235)"><rect x="33" y="-240" width="17" height="105" rx="8" fill="${col}"/><circle cx="41" cy="-130" r="9" fill="${DARK}"/>${prop(hold)}</g>
  ${ctrl ? `<rect x="-26" y="-150" width="52" height="22" rx="10" fill="#333"/><circle cx="-12" cy="-139" r="4" fill="#e0483e"/><circle cx="12" cy="-139" r="4" fill="#3b82d6"/>` : ''}
  <circle cx="0" cy="-295" r="46" fill="url(#hg)"/>
  ${face(expr, blink, look)}
  ${hairFront(hair, hairCol)}
  ${glasses ? `<g stroke="#ddd" stroke-width="3" fill="none"><circle cx="-15" cy="-300" r="15"/><circle cx="15" cy="-300" r="15"/><path d="M0,-302 L0,-302"/></g>` : ''}
  ${cap ? `<path d="M-46,-312 Q0,-372 46,-312Z" fill="${cap}"/><path d="M20,-318 L72,-312 Q60,-304 20,-306Z" fill="${shade(cap)}"/>` : ''}
  </g></g>`;
}

const DEFS = `<defs><radialGradient id="hg" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#5a5566"/><stop offset=".55" stop-color="#2f2b37"/><stop offset="1" stop-color="#1c1a22"/></radialGradient>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd0f2"/><stop offset="1" stop-color="#e8f4fb"/></linearGradient>
<linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1633"/><stop offset="1" stop-color="#2a3a6b"/></linearGradient>
<radialGradient id="vig" cx="50%" cy="50%" r="70%"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#3a0000" stop-opacity=".85"/></radialGradient>
<pattern id="wood" width="1080" height="40" patternUnits="userSpaceOnUse"><rect width="1080" height="40" fill="#a8774e"/><path d="M0,39 H1080" stroke="#8d6040" stroke-width="2"/><path d="M200,0V40M640,0V40" stroke="#8d6040" stroke-width="1.5"/></pattern>
<pattern id="plank" width="180" height="1920" patternUnits="userSpaceOnUse"><rect width="180" height="1920" fill="#3a3029"/><rect x="176" width="4" height="1920" fill="#241d18"/><path d="M40,0 Q60,400 30,900 T50,1920 M120,0 Q100,600 130,1200 T110,1920" stroke="#463a31" stroke-width="3" fill="none"/></pattern>
<clipPath id="sc"><rect x="0" y="0" width="1080" height="780"/></clipPath></defs>`;

// Plekken: tekening van 1080 x 780, vloer vanaf y 520, poppetjes staan op y ≈ 680.
const FLOOR = 680;
function machine(x, light = 0) {
  return `<g transform="translate(${x},380)"><rect x="-70" y="0" width="140" height="300" rx="60" fill="#6b7a8f"/><rect x="-48" y="30" width="96" height="170" rx="40" fill="#9fe8ff" opacity="${0.7 + 0.3 * light}"/>
  <circle cx="0" cy="240" r="20" fill="${light > 0.5 ? '#ff6a5a' : '#e0483e'}"/>${light ? `<circle cx="0" cy="240" r="${20 + 30 * light}" fill="#ff6a5a" opacity="${0.4 * (1 - light)}"/>` : ''}
  <text x="0" y="-12" text-anchor="middle" font-family="Inter Display,DejaVu Sans" font-weight="900" font-size="30" fill="#6b7a8f">CLONE</text></g>`;
}
function bedroom({ night = false, tv = false, light = 0, machineAt = 960 } = {}) {
  return `<rect width="1080" height="780" fill="${night ? '#5b5470' : '#f6e7d2'}"/>
  <rect x="600" y="60" width="300" height="300" fill="url(#${night ? 'night' : 'sky'})"/>
  ${night ? `<circle cx="820" cy="130" r="34" fill="#f5f0c8"/><g fill="#fff">${[[650,110],[700,200],[860,250],[760,90]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="3"/>`).join('')}</g>`
    : `<g fill="#c9dbe8">${[0, 1, 2].map(i => `<rect x="${630 + i * 90}" y="${160 + i * 30}" width="66" height="${200 - i * 30}"/>`).join('')}</g>`}
  <rect x="585" y="50" width="28" height="330" rx="6" fill="#f2c45a"/><rect x="887" y="50" width="28" height="330" rx="6" fill="#f2c45a"/>
  <rect x="150" y="70" width="150" height="200" fill="#2f4b7c"/><circle cx="225" cy="160" r="42" fill="#f4b73a"/>
  <rect x="0" y="520" width="1080" height="260" fill="url(#wood)"/>
  <rect x="10" y="340" width="26" height="250" rx="6" fill="#6b4329"/><rect x="20" y="470" width="440" height="60" rx="14" fill="#5f9ad1"/><rect x="20" y="470" width="90" height="40" rx="12" fill="#fff"/>
  <rect x="20" y="525" width="440" height="60" fill="#7a4f33"/>
  <ellipse cx="600" cy="${FLOOR + 10}" rx="340" ry="34" fill="#e2725b" opacity=".75"/>
  ${tv ? `<rect x="690" y="560" width="200" height="40" fill="#555"/><rect x="660" y="390" width="260" height="170" rx="10" fill="#222"/><rect x="672" y="402" width="236" height="146" fill="#6ad1ff"/><path d="M700,520 L740,470 L780,500 L830,440 L880,520Z" fill="#4caf6a"/>` : ''}
  ${machineAt ? machine(machineAt, light) : ''}
  ${night ? `<rect width="1080" height="780" fill="#0a1030" opacity=".35"/>` : ''}`;
}
function classroom(board = '') {
  return `<rect width="1080" height="780" fill="#dfe8d8"/>
  <rect x="200" y="60" width="680" height="300" rx="10" fill="#7a4f33"/><rect x="215" y="75" width="650" height="270" fill="#2f5d4a"/>
  ${board}
  <rect x="0" y="520" width="1080" height="260" fill="#c9b08c"/><path d="M0,560 H1080 M0,620 H1080 M0,700 H1080" stroke="#b39874" stroke-width="2"/>
  <circle cx="980" cy="120" r="50" fill="#fff" stroke="#555" stroke-width="6"/><path d="M980,120 L980,90 M980,120 L1000,130" stroke="#333" stroke-width="5"/>`;
}
function desk(x) { return `<g transform="translate(${x},600)"><rect x="-90" y="0" width="180" height="22" fill="#b07a4a"/><rect x="-80" y="22" width="12" height="90" fill="#7a4f33"/><rect x="68" y="22" width="12" height="90" fill="#7a4f33"/></g>`; }
function heart(x, y, s = 1, o = 1) { return `<path transform="translate(${x},${y}) scale(${s})" opacity="${o}" d="M0,10 C-30,-15 -15,-35 0,-18 C15,-35 30,-15 0,10Z" fill="#ff4d6d"/>`; }
function word(txt, x, y, size, k = 1, col = '#9cff3a', rot = -8) {
  return `<text x="${x}" y="${y}" text-anchor="middle" transform="rotate(${rot} ${x} ${y})" font-family="Inter Display,DejaVu Sans" font-weight="900" font-size="${size * k}" fill="${col}" stroke="#000" stroke-width="${size / 10}" paint-order="stroke">${txt}</text>`;
}
function bubble(txt, x, y, k = 1) {
  return `<g transform="translate(${x},${y}) scale(${k})"><rect x="-150" y="-60" width="300" height="90" rx="40" fill="#fff" stroke="#111" stroke-width="5"/><path d="M-20,28 L-40,70 L10,28Z" fill="#fff" stroke="#111" stroke-width="5"/><rect x="-25" y="22" width="40" height="10" fill="#fff"/>
  <text x="0" y="2" text-anchor="middle" font-family="Inter Display,DejaVu Sans" font-weight="900" font-size="44" fill="#111">${txt}</text></g>`;
}

// Ondertitels: elke stemregel in stukjes van max. 4 woorden, tijd naar verhouding van het aantal letters.
function captionAt(T, rows) {
  for (const r of rows) {
    if (T < r.start || T > r.end + 0.6) continue;
    const w = r.text.split(' '), parts = [];
    for (let i = 0; i < w.length;) { let n = Math.min(4, w.length - i); while (n > 1 && w.slice(i, i + n).join(' ').length > 24) n--; parts.push(w.slice(i, i + n).join(' ')); i += n; }
    const tot = parts.reduce((s, p) => s + p.length + 1, 0); let t0 = r.start;
    for (const p of parts) { const d = (p.length + 1) / tot * (r.end - r.start); if (T < t0 + d || p === parts[parts.length - 1]) return { text: p, k: clamp01((T - t0) / 0.15) }; t0 += d; }
  }
  return null;
}
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Eén beeld op tijd T (seconden). STORY komt uit story.js, TIMING uit timing.json.
function draw(T) {
  const sc = TIMING.scenes.find(s => T >= s.start && T < s.end) || TIMING.scenes[TIMING.scenes.length - 1];
  const scene = STORY.scenes[sc.id](T - sc.start, sc.end - sc.start, T);
  const cap = captionAt(T, TIMING.rows);
  const F = 'font-family="Inter Display,DejaVu Sans" font-weight="900"';
  document.getElementById('s').innerHTML = DEFS + `<rect width="1080" height="1920" fill="url(#plank)"/>
  ${STORY.title.map((l, i) => { const w = l.length * 42 + 80; return `<rect x="${540 - w / 2}" y="${200 + i * 100}" width="${w}" height="${i ? 110 : 120}" rx="22" fill="#fff"/>`; }).join('')}
  ${STORY.title.map((l, i) => `<text x="540" y="${290 + i * 95}" text-anchor="middle" ${F} font-size="76" fill="#111">${esc(l)}</text>`).join('')}
  <g transform="translate(0,520)"><g clip-path="url(#sc)">${scene}</g></g>
  <rect x="390" y="1360" width="300" height="100" rx="18" fill="#fff"/>
  <text x="540" y="1432" text-anchor="middle" ${F} font-style="italic" font-size="64" fill="#111">${STORY.part}</text>
  ${cap ? `<text x="540" y="1590" text-anchor="middle" opacity="${cap.k}" ${F} font-size="62" fill="#fff" stroke="#000" stroke-width="11" paint-order="stroke">${esc(cap.text)}</text>` : ''}`;
}
