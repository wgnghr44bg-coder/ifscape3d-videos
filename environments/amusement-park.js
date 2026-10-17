// AMUSEMENT PARK: entrance gate, paths, a Ferris wheel and a carousel (built here, both turn with update(t)),
// a roller coaster track on supports (built here, a train runs on it with update(t)), food / drinks / info stalls,
// benches, trees, flowers. Day sky.  Ground y = 0, entrance at z = 45, Ferris wheel at (-25, 0, -30).
// Good for: gravity changes, wind, power failure, earthquake, slow motion, a day of fun turned strange.
import { put, sky, light, plane, rng, lam } from './kit.js';

export const cameras = {
  entrance: { pos: [4, 1.7, 72], look: [-6, 8, -20] },      // eye level at the gate, wheel and coaster behind
  wheel:    { pos: [-4, 1.6, -6], look: [-25, 16, -30] },    // looking up at the Ferris wheel
  aerial:   { pos: [70, 55, 80], look: [-5, 0, -10] },
};

function ferrisWheel(THREE, R = 16, n = 16) {
  const g = new THREE.Group(), white = lam(THREE, 0xeeeeea), steel = lam(THREE, 0x8b9096);
  for (const z of [-1.4, 1.4]) for (const s of [-1, 1]) {           // A-frame legs
    const leg = new THREE.Mesh(new THREE.BoxGeometry(.6, R + 3, .6), steel); leg.position.set(s * 4.2, (R + 3) / 2, z); leg.rotation.z = s * .26; leg.castShadow = true; g.add(leg); }
  const wheel = new THREE.Group(); wheel.position.y = R + 2; g.add(wheel);
  for (const z of [-1.1, 1.1]) { const rim = new THREE.Mesh(new THREE.TorusGeometry(R, .22, 6, 48), white); rim.position.z = z; wheel.add(rim); }
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, sp = new THREE.Mesh(new THREE.BoxGeometry(.15, R, .15), white);
    sp.position.set(Math.cos(a) * R / 2, Math.sin(a) * R / 2, 0); sp.rotation.z = a - Math.PI / 2; wheel.add(sp); }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 3, 12), steel); hub.rotation.x = Math.PI / 2; wheel.add(hub);
  const cols = [0xd8453b, 0xf0b73a, 0x3f8fd0, 0x5fb35a];
  const cars = [];
  for (let i = 0; i < n; i++) { const c = new THREE.Group(), a = i / n * Math.PI * 2; c.userData.a = a;
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 1.8), lam(THREE, cols[i % 4])); box.position.y = -1; box.castShadow = true; c.add(box);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.8, .15, 2), white); roof.position.y = -.2; c.add(roof); g.add(c); cars.push(c); }
  g.userData.update = (t) => { const rot = t * .12; wheel.rotation.z = rot;
    for (const c of cars) { const a = c.userData.a + rot; c.position.set(Math.cos(a) * R, R + 2 + Math.sin(a) * R, 0); } };
  g.userData.update(0); return g;
}

function carousel(THREE) {
  const g = new THREE.Group(), turn = new THREE.Group(); g.add(turn);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(6, 6.3, .6, 24), lam(THREE, 0xc9b896)); base.position.y = .3; base.receiveShadow = true; g.add(base);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, 6, 12), lam(THREE, 0xf0b73a)); pole.position.y = 3; turn.add(pole);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(7, 3, 16), lam(THREE, 0xd8453b)); roof.position.y = 7.4; roof.castShadow = true; turn.add(roof);
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, .8, 16, 1, true), lam(THREE, 0xeeeeea, { side: THREE.DoubleSide })); rim.position.y = 5.6; turn.add(rim);
  const horses = [];
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, h = new THREE.Group(); h.position.set(Math.cos(a) * 4.6, 0, Math.sin(a) * 4.6); h.rotation.y = -a; turn.add(h);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 5, 6), lam(THREE, 0xf0d070)); rod.position.y = 3.1; h.add(rod);
    const body = new THREE.Mesh(new THREE.BoxGeometry(.5, .6, 1.5), lam(THREE, i % 2 ? 0xf3efe6 : 0x7a5a44)); body.position.y = 1.7; h.add(body); horses.push(body); }
  g.userData.update = (t) => { turn.rotation.y = t * .5; horses.forEach((b, i) => { b.position.y = 1.7 + .35 * Math.sin(t * 2 + i); }); };
  return g;
}

function coaster(THREE) {
  const g = new THREE.Group();
  const pts = [[30, 4, 20], [42, 18, 0], [40, 26, -22], [20, 10, -40], [0, 16, -48], [-8, 7, -20], [8, 4, 0], [20, 3, 14]].map(p => new THREE.Vector3(...p));
  const curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', .3);
  for (const off of [-.6, .6]) { const rail = new THREE.Mesh(new THREE.TubeGeometry(curve, 220, .14, 6, true), lam(THREE, 0xd8453b)); rail.position.x = off * .0; rail.position.z = off; g.add(rail); }
  const spine = new THREE.Mesh(new THREE.TubeGeometry(curve, 220, .32, 6, true), lam(THREE, 0xd8453b)); spine.position.y = -.4; spine.castShadow = true; g.add(spine);
  const steel = lam(THREE, 0xeeeeea);
  for (let i = 0; i < 46; i++) { const p = curve.getPointAt(i / 46); if (p.y < 2) continue;
    const s = new THREE.Mesh(new THREE.CylinderGeometry(.18, .25, p.y, 6), steel); s.position.set(p.x, p.y / 2, p.z); s.castShadow = true; g.add(s); }
  const train = []; const cols = [0xf0b73a, 0x3f8fd0, 0xf0b73a, 0x3f8fd0];
  for (let k = 0; k < 4; k++) { const c = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1, 2), lam(THREE, cols[k])); c.castShadow = true; g.add(c); train.push(c); }
  const up = new THREE.Vector3();
  g.userData.update = (t) => { train.forEach((c, k) => { const u = ((t * .03) - k * .012 + 10) % 1; const p = curve.getPointAt(u), q = curve.getPointAt((u + .002) % 1);
    c.position.copy(p).add(up.set(0, .5, 0)); c.lookAt(q.x, q.y + .5, q.z); }); };
  g.userData.update(0); return g;
}

export async function build(ctx) {
  const { THREE, scene } = ctx, R = rng(81);
  await sky(ctx, 'day'); scene.fog = new THREE.Fog(0xd3e2ea, 160, 1200);
  light(ctx, { dir: [-70, 100, 70], box: 90 });
  plane(ctx, 3000, 0x7fa65a, 0);
  const paths = [[0, 20, 6, 70], [-12, -18, 40, 6], [14, -6, 6, 50]];
  for (const [x, z, w, d] of paths) { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), lam(THREE, 0xd8cdb6)); p.rotation.x = -Math.PI / 2; p.position.set(x, .02, z); p.receiveShadow = true; scene.add(p); }
  const animated = [];
  const fw = ferrisWheel(THREE); fw.position.set(-25, 0, -30); scene.add(fw); animated.push(fw);
  const ca = carousel(THREE); ca.position.set(-14, 0, 10); scene.add(ca); animated.push(ca);
  const co = coaster(THREE); scene.add(co); animated.push(co);
  await put(ctx, 'coaster-kit', 'park-entrance', { length: 14 }, [0, 0, 48]);
  for (const [x, z, n, r] of [[8, 30, 'stall-food', -Math.PI / 2], [8, 20, 'stall-drinks', -Math.PI / 2], [-8, 34, 'stall-information', Math.PI / 2], [-8, 24, 'stall-toilets', Math.PI / 2], [4, -14, 'stall-food', Math.PI]])
    await put(ctx, 'coaster-kit', n, { length: 4 }, [x, 0, z], r);
  for (let z = 40; z > -10; z -= 8) for (const s of [-1, 1]) await put(ctx, 'coaster-kit', 'bench', { length: 1.8 }, [s * 4.2, 0, z], s > 0 ? -Math.PI / 2 : Math.PI / 2);
  for (let i = 0; i < 30; i++) { const x = (R() - .5) * 120, z = (R() - .5) * 120; if (Math.abs(x) < 8 && z > -10) continue;
    await put(ctx, 'coaster-kit', R() < .5 ? 'tree-large' : 'tree', { height: 5 + R() * 4 }, [x, 0, z], R() * 6.28); }
  for (let i = 0; i < 14; i++) await put(ctx, 'coaster-kit', 'flowers', { length: 1.5 }, [(R() - .5) * 30, 0, 10 + R() * 30]);
  for (let x = -60; x <= 60; x += 6) for (const z of [62, -70]) await put(ctx, 'city-kit-suburban', 'fence', { length: 6 }, [x, 0, z]);
  const update = (t) => animated.forEach(a => a.userData.update(t));
  return { groundY: 0, cameras, update };
}
