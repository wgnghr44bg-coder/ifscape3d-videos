// Maakt de video van een cartoon-map: <map>/story.js + <map>/timing.json (+ voice.mp3 als die er is).
// node tools/cartoon/render.mjs <map>            → <map>/build/video.mp4 + <map>/CHECK.jpg (één beeld per scène)
// node tools/cartoon/render.mjs <map> --check    → alleen CHECK.jpg (snel)
import { spawn, execFileSync } from 'child_process';
import fs from 'fs'; import path from 'path'; import { fileURLToPath, pathToFileURL } from 'url';
// Playwright: normaal via `npm install playwright` (pc); in de cloudsessie staat hij in /opt/node-tools.
const { chromium } = await import('playwright').catch(() => import('/opt/node-tools/node_modules/playwright/index.mjs'));
const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(process.argv[2]), onlyCheck = process.argv.includes('--check'), fps = 30;
const timing = JSON.parse(fs.readFileSync(path.join(dir, 'timing.json'), 'utf8'));
fs.mkdirSync(path.join(dir, 'build'), { recursive: true });
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', e => { console.error('FOUT in story.js / cartoon.js:', e.message); process.exitCode = 1; });
await p.goto(pathToFileURL(path.join(here, 'cartoon.html')).href);
await p.addScriptTag({ path: path.join(dir, 'story.js') });
await p.evaluate(t => { window.TIMING = t; }, timing);
const shot = async T => { await p.evaluate(T => draw(T), T); return p.screenshot({ type: 'jpeg', quality: 92 }); };

// CHECK.jpg: midden van elke scène
const stills = [];
for (const s of timing.scenes) { const f = path.join(dir, 'build', `check-${s.id}.jpg`); fs.writeFileSync(f, await shot(s.start + (s.end - s.start) * 0.6)); stills.push(f); }
const cols = 6, rows = Math.ceil(stills.length / cols);
execFileSync('ffmpeg', ['-v', 'error', '-y', ...stills.flatMap(f => ['-i', f]), '-filter_complex',
  stills.map((_, i) => `[${i}]scale=270:480[v${i}]`).join(';') + ';' + stills.map((_, i) => `[v${i}]`).join('') +
  `xstack=inputs=${stills.length}:layout=${stills.map((_, i) => `${(i % cols) * 270}_${Math.floor(i / cols) * 480}`).join('|')}:fill=black`,
  path.join(dir, 'CHECK.jpg')]);
console.log('CHECK.jpg klaar');
if (onlyCheck) { await b.close(); process.exit(); }

const silent = path.join(dir, 'build', 'silent.mp4'), N = Math.round(timing.total * fps);
const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', '' + fps, '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', silent], { stdio: ['pipe', 'ignore', 'inherit'] });
for (let i = 0; i < N; i++) { const buf = await shot(i / fps); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (i % 300 === 0) console.log(`beeld ${i}/${N}`); }
ff.stdin.end(); await new Promise(r => ff.on('close', r));
const sfx = await p.evaluate(() => STORY.sfx.map(x => { const s = TIMING.scenes.find(s => s.id === x.scene); return { type: x.type, t: s.start + (x.frac != null ? x.frac * (s.end - s.start) : x.at) }; }));
await b.close();

// Geluid: stem (als die er is) + effecten, allemaal gratis met ffmpeg gemaakt.
const SFX = {
  poof: 'anoisesrc=d=0.6:c=pink:a=0.7,lowpass=f=1800,afade=t=out:st=0.05:d=0.55',
  ding: 'sine=f=1320:d=0.8,volume=0.5,afade=t=out:st=0.02:d=0.78',
  click: 'sine=f=900:d=0.06,volume=0.6',
  boom: 'sine=f=55:d=1.2,volume=1.2,afade=t=out:st=0.1:d=1.1',
};
const voice = path.join(dir, 'voice.mp3'), hasVoice = fs.existsSync(voice);
const args = ['-v', 'error', '-y', '-i', silent], parts = [];
let n = 1;
if (hasVoice) { args.push('-i', voice); parts.push(`[${n++}:a]volume=1.0[a0]`); }
sfx.forEach((x, i) => { args.push('-f', 'lavfi', '-i', SFX[x.type]); const ms = Math.round(x.t * 1000); parts.push(`[${n++}:a]adelay=${ms}|${ms},volume=0.8[s${i}]`); });
const labels = (hasVoice ? ['[a0]'] : []).concat(sfx.map((_, i) => `[s${i}]`));
parts.push(`${labels.join('')}amix=inputs=${labels.length}:normalize=0:duration=longest,apad,atrim=0:${timing.total}[a]`);
const out = path.join(dir, 'build', 'video.mp4');
execFileSync('ffmpeg', [...args, '-filter_complex', parts.join(';'), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', out], { stdio: 'inherit' });
console.log(`klaar: ${out} (${timing.total.toFixed(1)} s, ${hasVoice ? 'met stem' : 'ZONDER stem (geschatte tijden)'})`);
