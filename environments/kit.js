// Shared helpers for the environments in this folder (same flat low-poly look as scene.html).
// ctx = { THREE, scene, loadModel, base }   base = URL of assets/kenney as seen from the page (e.g. '../assets/kenney').
export const lam = (THREE, color, o = {}) => new THREE.MeshLambertMaterial({ color, flatShading: true, ...o });

// deterministic random, so every render of an environment is identical
export const rng = (seed) => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

// place a Kenney model: put(ctx, 'pirate-kit', 'palm-bend', { height: 8 }, [x, y, z], rotY)
export async function put(ctx, pack, name, size, pos = [0, 0, 0], ry = 0) {
  let m;
  try { m = await ctx.loadModel(`${ctx.base}/${pack}/${name}.glb`, size); }
  catch (e) { console.warn('missing model', pack, name); return null; }
  m.root.position.set(...pos); m.root.rotation.y = ry; ctx.scene.add(m.root); return m;
}

// equirectangular sky from assets/kenney/skyboxes (day, morning, night, space, alien, space-galaxy, …)
export async function sky(ctx, name) {
  const { THREE, scene } = ctx;
  const tex = await new THREE.TextureLoader().loadAsync(`${ctx.base}/skyboxes/skybox-${name}.png`);
  tex.mapping = THREE.EquirectangularReflectionMapping; tex.colorSpace = THREE.SRGBColorSpace;
  scene.background = tex; return tex;
}

// sun + sky light like scene.html; returns the sun so a scene can move its shadow box
export function light(ctx, { hemi = 1.5, sun = 2.4, sky = 0xe3ecf4, ground = 0x5a5448, sunColor = 0xffeedd, dir = [-60, 90, 70], box = 120 } = {}) {
  const { THREE, scene } = ctx;
  scene.add(new THREE.HemisphereLight(sky, ground, hemi));
  const s = new THREE.DirectionalLight(sunColor, sun); s.position.set(...dir); s.castShadow = true;
  s.shadow.mapSize.set(2048, 2048); s.shadow.bias = -.0006;
  Object.assign(s.shadow.camera, { left: -box, right: box, top: box, bottom: -box, near: 1, far: 600 });
  scene.add(s, s.target); return s;
}

export function plane(ctx, size, color, y = 0, o = {}) {
  const { THREE, scene } = ctx;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), lam(THREE, color, o));
  m.rotation.x = -Math.PI / 2; m.position.y = y; m.receiveShadow = true; scene.add(m); return m;
}

// far mountains / hills as flattened cones (no model needed)
export function hills(ctx, { n = 9, r = 900, h = [120, 260], color = 0x6f7d78, snow = false, seed = 3, arc = [0, Math.PI * 2] } = {}) {
  const { THREE, scene } = ctx, R = rng(seed), g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const a = arc[0] + (arc[1] - arc[0]) * (i + R() * .6) / n, hh = h[0] + R() * (h[1] - h[0]), w = hh * (.9 + R() * .6);
    const m = new THREE.Mesh(new THREE.ConeGeometry(w, hh, 6), lam(THREE, color)); m.position.set(Math.cos(a) * r, hh / 2 - 2, Math.sin(a) * r); g.add(m);
    if (snow) { const c = new THREE.Mesh(new THREE.ConeGeometry(w * .36, hh * .36, 6), lam(THREE, 0xf2f4f6)); c.position.set(m.position.x, hh - hh * .18 - 2, m.position.z); g.add(c); }
  }
  scene.add(g); return g;
}
