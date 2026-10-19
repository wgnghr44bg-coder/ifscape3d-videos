// Algemene renderer voor elke video-map met een scene.html (hooks: window.renderAt(t), window.ready, window.T_END).
//   node tools/whatif/render.mjs <map> video [workers=2] [--gpu]   -> <map>/render.mp4 (stil, 720x1280, 30 fps)
//   node tools/whatif/render.mjs <map> stills 5 30 60 [--gpu]       -> <map>/stills/still-<t>.jpg
//   node tools/whatif/render.mjs <map> part <van> <tot> [--gpu]     -> <map>/render-part.mp4 (stukje om te testen)
// --wide: liggend 1280x720 (hoofdstuk van een lange video; scene.json "wide": true)
// Serveert de repo-root (scene.html laadt ../node_modules/three, ../assets, ../environments).
// --gpu: gebruik de videokaart (pc van de eigenaar, veel sneller); zonder: swiftshader (CPU, werkt overal).
import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { ({ chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright')); }

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const argv = process.argv.slice(2);
const GPU = argv.includes('--gpu'), WIDE = argv.includes('--wide');
const [dir, mode, ...rest] = argv.filter(a => a !== '--gpu' && a !== '--wide');
const VID = path.resolve(dir);
const PAGE = '/' + path.relative(ROOT, path.join(VID, 'scene.html')).split(path.sep).join('/');
const FPS = 30, W = WIDE ? 1280 : 720, H = WIDE ? 720 : 1280;   // --wide: liggend (hoofdstuk van een lange video)
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.woff2': 'font/woff2', '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer((q, r) => {
  const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': types[path.extname(f).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(r);
}).listen(0, '127.0.0.1');
const port = await new Promise(r => server.on('listening', () => r(server.address().port)));

async function open() {
  const args = GPU ? ['--ignore-gpu-blocklist', '--enable-gpu-rasterization']
                   : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
  const browser = await chromium.launch({ args });
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('pageerror', e => console.log('PAGINAFOUT', e.message));
  await page.goto(`http://127.0.0.1:${port}${PAGE}`);
  await page.waitForFunction(() => window.ready === true, null, { timeout: 300000 });
  return { browser, page };
}

async function renderRange(a, b, out, label) {
  const { browser, page } = await open();
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = a; i < b; i++) {
    await page.evaluate(t => window.renderAt(t), i / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((i - a) % 150 === 0) console.log(`${label} beeld ${i - a}/${b - a}  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await browser.close();
}

if (mode === 'stills') {
  const { browser, page } = await open();
  fs.mkdirSync(path.join(VID, 'stills'), { recursive: true });
  for (const t of rest) {
    await page.evaluate(t => window.renderAt(+t), t);
    await page.screenshot({ path: path.join(VID, 'stills', `still-${t}.jpg`), type: 'jpeg', quality: 88 });
    console.log('still', t);
  }
  await browser.close();
} else if (mode === 'part') {
  await renderRange(Math.round(+rest[0] * FPS), Math.round(+rest[1] * FPS), path.join(VID, 'render-part.mp4'), 'deel');
  console.log('klaar', path.join(VID, 'render-part.mp4'));
} else if (mode === 'video') {
  const workers = +(rest[0] || 2);
  const probe = await open();
  const tEnd = await probe.page.evaluate(() => window.T_END || (window.TL && window.TL.T_END));
  await probe.browser.close();
  if (!tEnd) { console.log('FOUT: scene.html zet geen window.T_END'); process.exit(1); }
  const frames = Math.round(tEnd * FPS), per = Math.ceil(frames / workers), out = path.join(VID, 'render.mp4');
  const segs = Array.from({ length: workers }, (_, w) => `${out}.part${w}.mp4`);
  await Promise.all(segs.map((s, w) => renderRange(w * per, Math.min(frames, (w + 1) * per), s, `w${w}`)));
  fs.writeFileSync(`${out}.list`, segs.map(s => `file '${s.replace(/\\/g, '/')}'`).join('\n'));
  await new Promise(r => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', `${out}.list`,
    '-c', 'copy', out], { stdio: 'inherit' }).on('close', r));
  segs.forEach(s => fs.unlinkSync(s)); fs.unlinkSync(`${out}.list`);
  console.log('klaar', out, `${tEnd} s`);
} else {
  console.log('Gebruik: node tools/whatif/render.mjs <map> video|stills|part ...');
}
server.close();
