// MARS: a red, rocky plain with dunes and far hills under a butterscotch sky, NASA's Perseverance rover,
// the Ingenuity helicopter, the InSight lander and Viking lander, a small crewed habitat (built here) and rocks.
// Ground y = 0. NASA models: assets/nasa/ (public domain; do not use the NASA logo or suggest NASA endorses the video).
// Good for: living on Mars, terraforming, a dust storm, low gravity, Mars gets closer.
import { put, light, plane, hills, rng, lam } from './kit.js';

export const cameras = {
  rover:  { pos: [3.4, 1.2, 4.6], look: [-.5, .7, -.5] },        // eye level next to Perseverance
  base:   { pos: [-26, 1.7, 26], look: [10, 4, -16] },      // across the plain to the habitat and landers
  aerial: { pos: [50, 40, 60], look: [0, 0, -8] },
};

function habitat(THREE) {
  const g = new THREE.Group(), white = lam(THREE, 0xe9e6df), grey = lam(THREE, 0x8c8f93);
  for (const [x, z, r] of [[0, 0, 4], [10, 2, 3], [-8, 3, 3]]) {
    const d = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), white); d.position.set(x, 0, z); d.castShadow = true; g.add(d);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, .15, 6, 24), grey); ring.rotation.x = Math.PI / 2; ring.position.set(x, .2, z); g.add(ring); }
  for (const [a, b] of [[[4, 1.2, .3], [7, 1.2, 1.6]], [[-4, 1.2, 1], [-5, 1.2, 2.4]]]) { const t = new THREE.Mesh(new THREE.BoxGeometry(Math.hypot(b[0] - a[0], b[2] - a[2]) + 1, 1.6, 1.6), white);
    t.position.set((a[0] + b[0]) / 2, .8, (a[2] + b[2]) / 2); t.rotation.y = -Math.atan2(b[2] - a[2], b[0] - a[0]); g.add(t); }
  for (let i = 0; i < 4; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(3, .1, 1.6), lam(THREE, 0x2c3e66)); p.position.set(-14 + i * 3.4, 1.4, 10); p.rotation.x = -.5; g.add(p); }
  return g;
}

export async function build(ctx) {
  const { THREE, scene } = ctx, R = rng(101);
  scene.background = new THREE.Color(0xd9a77a); scene.fog = new THREE.Fog(0xd6a27a, 120, 900);
  light(ctx, { sky: 0xf0c9a0, ground: 0x7a3f24, sunColor: 0xffe2c0, sun: 2.2, hemi: 1.2, dir: [-60, 70, 50], box: 80 });
  plane(ctx, 4000, 0xb5653f, 0);
  hills(ctx, { n: 10, r: 600, h: [40, 110], color: 0x9a4f30, seed: 12 });
  for (let i = 0; i < 25; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(8 + R() * 20, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), lam(THREE, R() < .5 ? 0xc0714a : 0xa95a37));
    d.scale.y = .12 + R() * .1; d.position.set((R() - .5) * 400, 0, (R() - .5) * 400 - 60); d.receiveShadow = true; scene.add(d); }
  const rust = (m) => m && m.root.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.map = null; o.material.color.setHex([0x8e4a2c, 0x7a3f26, 0x9c5636][Math.floor(R() * 3)]); } });
  for (let i = 0; i < 60; i++) rust(await put(ctx, 'nature-kit', ['rock_largeA', 'rock_smallB', 'rock_tallC', 'rock_smallFlatA'][i % 4], { height: .2 + R() * (i % 7 ? .8 : 2.5) }, [(R() - .5) * 120, 0, (R() - .5) * 120 - 10], R() * 6.28));
  await put(ctx, 'nasa', 'mars-2020-perseverance-rover', { length: 3 }, [0, 0, 0], .5);
  await put(ctx, 'nasa', 'ingenuity-mars-helicopter', { length: 1.2 }, [4, 0, -3]);
  await put(ctx, 'nasa', 'insight-cruise-lander-panels-deployed', { length: 6 }, [18, 0, -14], .3);
  await put(ctx, 'nasa', 'viking-lander', { height: 2.1 }, [-12, 0, -8], 1);
  const hab = habitat(THREE); hab.position.set(8, 0, -30); scene.add(hab);
  return { groundY: 0, cameras };
}
