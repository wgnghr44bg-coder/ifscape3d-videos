// node assets/showroom/showroom.mjs  -> assets/showroom/show/sNN.jpg + assets/showroom/SHOWROOM.jpg (one tile per model)
// Needs (repo root): npm install three@0.170.0 playwright ; ffmpeg on PATH. Edit showlist.json to add models.
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url'; import { spawnSync } from 'child_process';
const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(HERE, '../..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.bin': 'application/octet-stream' };
const server = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }).listen(0);
const L = JSON.parse(fs.readFileSync(path.join(HERE, 'showlist.json')));
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 480, height: 480 } }); page.on('pageerror', e => console.log('ERR', e.message));
await page.goto(`http://localhost:${server.address().port}/assets/showroom/showroom.html`); await page.waitForFunction(() => window.ready === true);
const out = path.join(HERE, 'show'); fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
let i = 0;
for (const [pack, name, label, anim, t] of L) {
  const url = pack === 'nasa' ? `/assets/nasa/${name}.glb` : `/assets/kenney/${pack}/${name}.glb`;
  if (!fs.existsSync(path.join(ROOT, url))) { console.log('missing', url); continue; }
  await page.evaluate(([u, l, a, t]) => window.show(u, l, a, t), [url, label, anim, t ?? .6]);
  await page.screenshot({ path: path.join(out, `s${String(i++).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 88 });
}
await browser.close(); server.close();
const cols = 6, rows = Math.ceil(i / cols);
spawnSync('ffmpeg', ['-v', 'error', '-y', '-framerate', '1', '-i', path.join(out, 's%02d.jpg'), '-vf', `scale=240:240,tile=${cols}x${rows}`, '-frames:v', '1', '-q:v', '3', path.join(HERE, 'SHOWROOM.jpg')], { stdio: 'inherit' });
console.log('rendered', i, '-> assets/showroom/SHOWROOM.jpg');
