// Picture checker for a What if scene ("beeldkeurmeester").
//   node tools/whatif/scenecheck.mjs <folder>
// Opens <folder>/scene.html, goes to every story step (times from voice-times.tsv, else the estimate) and MEASURES:
//   - everything the voice names in that step (plan.json on_screen) is in frame, big enough and not hidden behind something
//   - tagged things stand ON something (do not float), unless listed in plan.json "may_float" (boats, birds, a bridge)
//   - nothing big right in front of the camera during the title (0–9 s)
//   - the counter (#hud) is fully on screen from 9.5 s
//   - plan.json "scale_checks" (e.g. the cart comes up to your thigh) match the real sizes in the scene
//   - the counter shows what the picture shows (plan.json "counter_matches", e.g. the giant's real height in the scene)
//   - the main subject (plan.json "subject") is big in frame wherever the voice names it (not in close-ups)
//   - every text block (#hud, #title, .caption) has enough contrast with the picture behind it (needs WHATIF.renderer)
// Writes <folder>/check/step-NN.jpg, <folder>/CHECK.jpg (all steps on one sheet) and <folder>/CHECK.md.
// Exit code 1 when something FAILs.
//
// The scene must have (see tools/whatif/README.md):
//   window.renderAt(t), window.ready = true, window.WHATIF = { THREE, scene, camera, renderer },
//   obj.userData.tag = '<on_screen word>' on every object the voice names, and the counter in <div id="hud">.
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import { createRequire } from 'module';

const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(HERE, '..', '..');
const folderArg = process.argv[2];
if (!folderArg) { console.log('usage: node tools/whatif/scenecheck.mjs <folder>'); process.exit(2); }
const FOLDER = path.resolve(folderArg);
const REL = path.relative(ROOT, FOLDER).split(path.sep).join('/');
if (REL.startsWith('..')) { console.log('the video folder must be inside the repo'); process.exit(2); }
if (!fs.existsSync(path.join(FOLDER, 'scene.html'))) { console.log(`FAIL [scene] ${REL}/scene.html not found`); process.exit(1); }

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { ({ chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright')); }

// step times + what must be seen, from whatif.py
let times;
for (const py of ['python', 'python3']) {
  const r = spawnSync(py, [path.join(HERE, 'whatif.py'), 'times', FOLDER], { encoding: 'utf-8' });
  if (r.status === 0) { times = JSON.parse(r.stdout); break; }
}
if (!times) { console.log('FAIL [times] could not run whatif.py times – is plan.json there?'); process.exit(1); }

const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.glb': 'model/gltf-binary', '.json': 'application/json', '.woff2': 'font/woff2' };
const server = http.createServer((q, r) => {
  const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
}).listen(0);

const fails = [], warns = [], rows = [], floatSeen = new Set();
const fail = (where, msg) => fails.push(`FAIL [${where}] ${msg}`);
const warn = (where, msg) => warns.push(`WARN [${where}] ${msg}`);

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const WIDE = /"wide":\s*true/.test(fs.readFileSync(path.join(FOLDER, 'scene.html'), 'utf-8'));   // hoofdstuk van een lange video (16:9)
const page = await browser.newPage({ viewport: WIDE ? { width: 1280, height: 720 } : { width: 720, height: 1280 } });
page.on('pageerror', e => fail('scene', `JavaScript error: ${e.message}`));
await page.goto(`http://localhost:${server.address().port}/${REL}/scene.html`);
try { await page.waitForFunction(() => window.ready === true, null, { timeout: 300000 }); }
catch { fail('scene', 'window.ready never became true'); }
const hooks = await page.evaluate(() => ({ renderAt: typeof window.renderAt === 'function', renderer: !!(window.WHATIF && window.WHATIF.renderer),
  whatif: !!(window.WHATIF && window.WHATIF.scene && window.WHATIF.camera && window.WHATIF.THREE) }));
if (!hooks.renderAt) fail('scene', 'scene.html needs window.renderAt(t)');
if (!hooks.renderer) fail('scene', 'add the renderer to the hook so text contrast can be measured: window.WHATIF = { THREE, scene, camera, renderer };');
if (!hooks.whatif) fail('scene', 'scene.html needs: window.WHATIF = { THREE, scene, camera, renderer };  (one line after the scene is built)');

// ---- everything below runs inside the page
function measure({ words, scale, mayFloat, t, titleEnd, counterFrom, match }) {
  const { THREE, scene, camera, renderer } = window.WHATIF;
  // text contrast: render and read the pixels behind every visible text block in the same task
  const contrast = [];
  if (renderer) {
    window.renderAt(t);
    const gl = renderer.getContext(), cv = renderer.domElement, k = cv.width / cv.clientWidth;
    const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
      return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
    for (const el of document.querySelectorAll('#hud, #title, #caption, #captions, .caption, [data-text]')) {
      const cs = getComputedStyle(el), r = el.getBoundingClientRect();
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < .5 || !el.textContent.trim() || r.width < 2) continue;
      const w = Math.max(1, Math.round(r.width * k)), h = Math.max(1, Math.round(r.height * k));
      const x = Math.max(0, Math.round(r.left * k)), y = Math.max(0, cv.height - Math.round(r.bottom * k));
      const px = new Uint8Array(w * h * 4); gl.readPixels(x, y, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
      let sum = 0, n = 0; for (let i = 0; i < px.length; i += 16) { sum += lum([px[i], px[i + 1], px[i + 2]]); n++; }
      let bg = sum / Math.max(1, n);
      const band = (cs.backgroundColor.match(/[\d.]+/g) || []).map(Number);    // a (semi-transparent) band behind the text counts
      if (band.length >= 3) { const al = band.length > 3 ? band[3] : 1; bg = al * lum(band.slice(0, 3)) + (1 - al) * bg; }
      const fg = lum((cs.color.match(/\d+(\.\d+)?/g) || [255, 255, 255]).slice(0, 3).map(Number));
      const ratio = (Math.max(bg, fg) + .05) / (Math.min(bg, fg) + .05);
      contrast.push({ id: el.id || el.className || 'text', text: el.textContent.trim().slice(0, 30), ratio,
        shadow: cs.textShadow && cs.textShadow !== 'none', weight: +cs.fontWeight || 400 });
    }
  }
  scene.updateMatrixWorld(true); camera.updateMatrixWorld(); camera.updateProjectionMatrix();
  const norm = w => { w = String(w).toLowerCase().trim(); return w.endsWith('ss') ? w : w.replace(/(ch|sh|s|x)es$/, '$1').replace(/s$/, ''); };
  const shown = o => { for (let p = o; p; p = p.parent) if (p.visible === false) return false; return true; };
  const tagOf = o => { for (let p = o; p; p = p.parent) if (p.userData && p.userData.tag) return String(p.userData.tag); return null; };
  const groups = {}, meshes = [];
  scene.traverse(o => {
    if (o.userData && o.userData.tag && shown(o))
      for (const tg of String(o.userData.tag).split(',')) (groups[norm(tg)] = groups[norm(tg)] || []).push(o);
    if (o.isMesh && shown(o)) meshes.push(o);
  });
  const ray = new THREE.Raycaster();
  const boxOf = key => { const b = new THREE.Box3(); for (const o of groups[key] || []) b.expandByObject(o); return b; };
  const out = { objects: {}, scale: [], float: [], title: null, hud: null, tags: Object.keys(groups) };

  for (const w of words) {
    const key = norm(w);
    if (!groups[key]) { out.objects[w] = { missing: true }; continue; }
    const b = boxOf(key), c = b.getCenter(new THREE.Vector3()), s = b.getSize(new THREE.Vector3());
    // screen rectangle of the box
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, front = 0;
    for (const dx of [0, 1]) for (const dy of [0, 1]) for (const dz of [0, 1]) {
      const p = new THREE.Vector3(dx ? b.max.x : b.min.x, dy ? b.max.y : b.min.y, dz ? b.max.z : b.min.z);
      if (p.clone().applyMatrix4(camera.matrixWorldInverse).z < 0) front++;
      p.project(camera); x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y);
    }
    const full = Math.max(1e-9, (x1 - x0) * (y1 - y0));
    const cx0 = Math.max(-1, x0), cx1 = Math.min(1, x1), cy0 = Math.max(-1, y0), cy1 = Math.min(1, y1);
    const clip = Math.max(0, cx1 - cx0) * Math.max(0, cy1 - cy0);
    // can the camera actually see it? 9 sample points inside the box
    let seen = 0, tried = 0; const blockers = {};
    for (const f of [[.5, .5, .5], [.25, .3, .25], [.75, .3, .25], [.25, .3, .75], [.75, .3, .75], [.25, .75, .25], [.75, .75, .25], [.25, .75, .75], [.75, .75, .75]]) {
      const p = new THREE.Vector3(b.min.x + s.x * f[0], b.min.y + s.y * f[1], b.min.z + s.z * f[2]);
      const q = p.clone().project(camera);
      if (Math.abs(q.x) > 1 || Math.abs(q.y) > 1 || p.clone().applyMatrix4(camera.matrixWorldInverse).z >= 0) continue;
      tried++;
      ray.setFromCamera(new THREE.Vector2(q.x, q.y), camera);
      const hit = ray.intersectObjects(meshes, false)[0];
      if (!hit) continue;
      const tg = tagOf(hit.object);
      if (tg && String(tg).split(',').map(norm).includes(key)) seen++;
      else blockers[tg || hit.object.name || hit.object.parent?.name || 'something'] = 1;
    }
    out.objects[w] = { front, frac: front ? clip / full : 0, heightPx: Math.max(0, cy1 - cy0) * 640, screenShare: clip / 4,
      seen, tried, blockers: Object.keys(blockers), dist: camera.position.distanceTo(c) };
  }
  // standing on something?
  for (const key of Object.keys(groups)) {
    if (mayFloat.map(norm).includes(key)) continue;
    const b = boxOf(key); if (b.isEmpty()) continue;
    const c = b.getCenter(new THREE.Vector3());
    ray.set(new THREE.Vector3(c.x, b.min.y + .05, c.z), new THREE.Vector3(0, -1, 0));
    const own = new Set(); for (const o of groups[key]) o.traverse(m => own.add(m));
    const hit = ray.intersectObjects(meshes, false).find(h => !own.has(h.object));
    const gap = hit ? hit.distance - .05 : Infinity;
    if (gap > .4) out.float.push({ key, gap });
  }
  // sizes compared with each other
  for (const sc of scale) {
    const a = boxOf(norm(sc.object)), r = boxOf(norm(sc.compare));
    if (a.isEmpty() || r.isEmpty()) { out.scale.push({ sc, missing: true }); continue; }
    out.scale.push({ sc, ratio: (a.max.y - r.min.y) / Math.max(1e-6, r.max.y - r.min.y) });
  }
  // title: nothing big right in front of the lens
  if (t < titleEnd) {
    let near = 0, n = 0;
    for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
      ray.setFromCamera(new THREE.Vector2(-.6 + 1.2 * i / 6, -.45 + .9 * j / 6), camera); n++;
      const hit = ray.intersectObjects(meshes, false)[0];
      if (hit && hit.distance < 3) near++;
    }
    out.title = near / n;
  }
  // counter
  if (t >= counterFrom) {
    const el = document.getElementById('hud');
    if (!el) out.hud = { missing: true };
    else {
      const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      out.hud = { inside: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight && r.width > 0,
        shown: cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > .5 };
      // the counter must show what the picture shows (plan.json "counter_matches")
      if (match) {
        const nums = (el.textContent.replace(/(\d)[\s\u202f\u00a0,](?=\d{3}\b)/g, '$1').match(/[-+]?\d+(?:\.\d+)?/g) || []).map(Number);
        const b = boxOf(norm(match.object));
        const unitK = { m: 1, cm: 100, mm: 1000, km: .001 }[match.unit || 'm'] || 1;
        const ref = match.from_ground ? 0 : b.min.y;
        const sz = b.getSize(new THREE.Vector3());
        const real = b.isEmpty() ? null : (match.measure === 'top' ? b.max.y - ref
          : match.measure === 'length' ? Math.max(sz.x, sz.y, sz.z)       // standing = height, lying = length
          : sz.y) * unitK;
        out.match = { shown: nums[match.hud_number || 0], real, all: nums };
      }
    }
  }
  out.contrast = contrast;
  return out;
}

const closeupSteps = new Set(times.closeup_steps || []);
const shotDir = path.join(FOLDER, 'check'); fs.mkdirSync(shotDir, { recursive: true });
const files = [];
if (hooks.renderAt && hooks.whatif) {
  for (const st of times.steps) {
    const t = +(Math.min(st.end, st.start + Math.max(.6, (st.end - st.start) * .4))).toFixed(2);
    await page.evaluate(t => window.renderAt(t), t);
    const scale = times.scale_checks.filter(s => s.step === st.step);
    const m = await page.evaluate(measure, { words: st.must_see, scale, mayFloat: times.may_float, t, match: times.counter_matches,
      titleEnd: times.title_end, counterFrom: times.counter_from });
    const where = `step ${st.step} @${t}s`, notes = [];
    for (const [w, o] of Object.entries(m.objects)) {
      if (o.missing) { fail(where, `"${w}" is said but no object has userData.tag = '${w}' (tags in scene: ${m.tags.join(', ') || 'none'})`); notes.push(`${w}: no tag`); continue; }
      const big = o.screenShare > .3;
      if (!o.front || (!big && o.frac < .5)) { fail(where, `"${w}" is out of frame (${Math.round(o.frac * 100)} % inside)`); notes.push(`${w}: out of frame`); continue; }
      if (o.heightPx < 40) { fail(where, `"${w}" is too small on a phone: ${Math.round(o.heightPx)} px high (min 40 of 1280); bring it closer (now ${o.dist.toFixed(0)} m)`); notes.push(`${w}: too small`); continue; }
      if (o.tried && o.seen / o.tried < .25) { fail(where, `"${w}" is hidden behind ${o.blockers.join(', ')} (${o.seen}/${o.tried} points visible)`); notes.push(`${w}: hidden`); continue; }
      notes.push(`${w} ✓ ${Math.round(o.heightPx)}px`);
    }
    for (const f of m.float) if (!floatSeen.has(f.key) && floatSeen.add(f.key)) fail(where, `"${f.key}" floats ${isFinite(f.gap) ? f.gap.toFixed(1) + ' m' : 'over nothing'} above the surface below it (add it to "may_float" in plan.json if that is right, e.g. a boat, a bird)`);
    for (const s of m.scale) {
      const [lo, hi] = s.sc.top_between;
      if (s.missing) fail(where, `scale check "${s.sc.says}": "${s.sc.object}" or "${s.sc.compare}" has no tag`);
      else if (s.ratio < lo || s.ratio > hi) fail(where, `"${s.sc.says}": the top of ${s.sc.object} is at ${(s.ratio * 100).toFixed(0)} % of ${s.sc.compare}'s height, must be ${lo * 100}–${hi * 100} %`);
      else notes.push(`${s.sc.says} ✓ ${(s.ratio * 100).toFixed(0)}%`);
    }
    if (m.title !== null && m.title > .15) fail(where, `during the title ${Math.round(m.title * 100)} % of the middle of the picture is something closer than 3 m – move the camera`);
    for (const c of m.contrast) {
      const need = c.shadow ? 2.2 : 3;          // a dark text shadow/outline helps, but not on everything
      if (c.ratio < need) fail(where, `text "${c.text}" (${c.id}) is hard to read: contrast ${c.ratio.toFixed(1)} : 1 with what is behind it, needs ${need} : 1 – darker outline/shadow, a dark band behind it, or another colour`);
      else if (c.weight < 500) warn(where, `text "${c.text}" (${c.id}) is thin (font-weight ${c.weight}); bolder letters read better on a phone`);
    }
    const subj = times.subject;
    if (subj && m.objects[subj] && !m.objects[subj].missing && st.must_see.includes(subj) && !closeupSteps.has(st.step)) {
      const o = m.objects[subj];
      if (o.heightPx < times.subject_min_px)
        fail(where, `the main subject "${subj}" is only ${Math.round(o.heightPx)} px high (needs ≥ ${times.subject_min_px} of 1280): the viewer must SEE the story – bring the camera closer or lower`);
      else if (o.tried && o.seen / o.tried < .6)
        fail(where, `the main subject "${subj}" is mostly hidden behind ${o.blockers.join(', ')} (only ${o.seen}/${o.tried} points visible, needs 60 %) – nothing big between the camera and the subject`);
    }
    if (m.match) {
      const cm = times.counter_matches;
      if (m.match.real === null) fail(where, `counter_matches: no object tagged "${cm.object}"`);
      else if (m.match.shown === undefined) fail(where, `counter_matches: no number nr ${cm.hud_number || 0} in the counter (found ${m.match.all.join(', ') || 'none'})`);
      else if (Math.abs(m.match.shown - m.match.real) > Math.max(Math.abs(m.match.real) * .1, cm.unit === 'cm' ? 15 : .15))
        fail(where, `the counter says ${m.match.shown} ${cm.unit || 'm'}, but "${cm.object}" in the picture is ${m.match.real.toFixed(2)} ${cm.unit || 'm'} – what the counter says must be what you SEE`);
      else notes.push(`counter ${m.match.shown} = picture ${m.match.real.toFixed(2)} ✓`);
    }
    if (m.hud && m.hud.missing) fail(where, 'no counter: put it in <div id="hud">');
    else if (m.hud && !(m.hud.inside && m.hud.shown)) fail(where, 'the counter (#hud) is not fully on screen');
    // labelled still
    await page.evaluate(txt => { const d = document.createElement('div'); d.id = '__lab'; d.textContent = txt;
      d.style.cssText = 'position:fixed;left:0;right:0;bottom:0;padding:10px 14px;background:rgba(0,0,0,.65);color:#fff;font:600 22px sans-serif;z-index:99';
      document.body.appendChild(d); }, `${st.step} · ${t}s · ${st.text.slice(0, 70)}`);
    const f = path.join(shotDir, `step-${String(st.step).padStart(2, '0')}.jpg`);
    await page.screenshot({ path: f, type: 'jpeg', quality: 82 }); files.push(f);
    await page.evaluate(() => document.getElementById('__lab')?.remove());
    rows.push(`| ${st.step} | ${t} | ${st.text.replace(/\|/g, '/')} | ${notes.join('<br>') || '–'} |`);
    console.log(`step ${st.step} @${t}s  ${notes.join(' · ')}`);
  }
}
// camera rule: 3 shots + max 2 close-ups = max 6 hard cuts; inside a shot the camera moves slowly (no still frames, no jumps)
if (hooks.renderAt && hooks.whatif) {
  const end = Math.ceil(times.steps.at(-1).end), cams = [];
  for (let t = 0; t <= end; t += 1) {
    cams.push(await page.evaluate(t => { window.renderAt(t); const c = window.WHATIF.camera;
      return [c.position.x, c.position.y, c.position.z]; }, t));
  }
  const cuts = [], moves = [0];
  for (let i = 1; i < cams.length; i++) {
    const d = Math.hypot(...cams[i].map((v, k) => v - cams[i - 1][k]));
    if (d > 8) { cuts.push(i); moves.push(0); } else moves[moves.length - 1] += d;
  }
  if (cuts.length > 6) fail('camera', `${cuts.length} hard cuts (at ${cuts.join(', ')} s); max 6 (3 shots + 2 close-ups)`);
  if (cuts.length < 2) fail('camera', `only ${cuts.length} hard cut(s); the template has 3 shots (eye level → closer → high)`);
  const still = moves.map((m, i) => [m, i]).filter(([m]) => m < .3).map(([, i]) => i + 1);
  if (still.length) warn('camera', `the camera stands still in shot(s) ${still.join(', ')} – every shot is a slow forward move`);
  console.log(`camera: ${cuts.length} hard cuts at ${cuts.join(', ') || '–'} s`);
  rows.push('', `Camera: ${cuts.length} hard cuts at ${cuts.join(', ') || '–'} s`);
}
await browser.close(); server.close();

// contact sheet: 4 columns
if (files.length) {
  const cols = 4, w = 270, h = 480, args = ['-v', 'error', '-y'];
  files.forEach(f => args.push('-i', f));
  const ins = files.map((_, i) => `[${i}:v]scale=${w}:${h}[s${i}]`).join(';');
  const layout = files.map((_, i) => `${(i % cols) * w}_${Math.floor(i / cols) * h}`).join('|');
  args.push('-filter_complex', `${ins};${files.map((_, i) => `[s${i}]`).join('')}xstack=inputs=${files.length}:layout=${layout}:fill=black`,
    '-frames:v', '1', '-q:v', '4', path.join(FOLDER, 'CHECK.jpg'));
  const r = files.length > 1 ? spawnSync('ffmpeg', args, { stdio: 'inherit' }) : { status: 1 };
  if (r.status !== 0) warn('sheet', 'could not make CHECK.jpg (is ffmpeg on PATH?)');
}

const md = [`# Picture check – ${REL}`, '', `_Times: ${times.source}. Made by \`node tools/whatif/scenecheck.mjs\`._`, '',
  fails.length ? `❌ ${fails.length} FAIL` : '✅ ALL PICTURE CHECKS PASSED', '', ...fails.map(x => `- ${x}`), ...warns.map(x => `- ${x}`), '',
  '![check](CHECK.jpg)', '', '| step | s | voice | measured |', '|---|---|---|---|', ...rows, ''].join('\n');
fs.writeFileSync(path.join(FOLDER, 'CHECK.md'), md);
for (const x of [...fails, ...warns]) console.log(x);
console.log(fails.length ? `\n${fails.length} FAIL – fix the scene and run again. Do NOT show the owner stills yet.`
  : `\nALL PICTURE CHECKS PASSED – wrote CHECK.md + CHECK.jpg. Now look at CHECK.jpg yourself, then show the owner.`);
process.exit(fails.length ? 1 : 0);
