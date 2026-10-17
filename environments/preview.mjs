// node environments/preview.mjs [env ...]  -> environments/previews/<env>-<camera>.jpg + environments/previews/ENVIRONMENTS.jpg
// Needs (repo root): npm install three@0.170.0 playwright ; ffmpeg on PATH.
import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url'; import { spawnSync } from 'child_process';
const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(HERE, '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.glb': 'model/gltf-binary' };
const server = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }).listen(0);
const envs = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(HERE).filter(f => f.endsWith('.js') && f !== 'kit.js').map(f => f.slice(0, -3));
const out = path.join(HERE, 'previews'); fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const shots = [];
for (const env of envs) {
  const page = await browser.newPage({ viewport: { width: 720, height: 1280 } });
  page.on('pageerror', e => console.log(env, 'ERR', e.message)); page.on('console', m => { if (m.type() === 'warning') console.log(env, m.text()); });
  await page.goto(`http://localhost:${server.address().port}/environments/preview.html?env=${env}`);
  await page.waitForFunction(() => window.ready === true, null, { timeout: 300000 });
  for (const cam of await page.evaluate(() => window.cameras)) {
    await page.evaluate(c => window.view(c), cam);
    const f = path.join(out, `${env}-${cam}.jpg`); await page.screenshot({ path: f, type: 'jpeg', quality: 88 }); shots.push(f); console.log('ok', env, cam);
  }
  await page.close();
}
await browser.close(); server.close();
const cols = 3, rows = Math.ceil(shots.length / cols), args = ['-v', 'error', '-y'];
shots.forEach(f => args.push('-i', f));
const ins = shots.map((_, i) => `[${i}:v]scale=360:640[s${i}]`).join(';');
const layout = shots.map((_, i) => `${(i % cols) * 360}_${Math.floor(i / cols) * 640}`).join('|');
args.push('-filter_complex', `${ins};${shots.map((_, i) => `[s${i}]`).join('')}xstack=inputs=${shots.length}:layout=${layout}:fill=black`, '-frames:v', '1', '-q:v', '3', path.join(out, 'ENVIRONMENTS.jpg'));
if (shots.length > 1) spawnSync('ffmpeg', args, { stdio: 'inherit' });
console.log('done ->', path.join(out, 'ENVIRONMENTS.jpg'));
