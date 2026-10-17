// CONTAINER HARBOUR: a concrete quay along x with a cargo ship moored, two ship-to-shore container cranes
// (built here, the jib can be raised), stacks of containers, warehouses, trucks, a tug, a lighthouse on the pier,
// open sea behind. Day sky.  Sea level y = 0, quay top y = 3, quay edge at z = 0 (sea is z < 0).
// Good for: tsunami, sea level rises, storm, tide, aliens over the sea, the sea dries up.
import { put, sky, light, plane, rng, lam } from './kit.js';

export const cameras = {
  quay:   { pos: [62, 4.7, 26], look: [-20, 14, -30] },     // eye level on the quay, cranes and ship
  pier:   { pos: [108, 4.6, -60], look: [-10, 12, -10] },      // from the pier by the lighthouse back to the port
  aerial: { pos: [90, 70, 110], look: [0, 0, -10] },
};

// a ship-to-shore crane: legs on the quay, a girder over the water. crane.jib (pivot) can be raised: jib.rotation.x
function stsCrane(THREE, color = 0x2f6fa8) {
  const g = new THREE.Group(), m = lam(THREE, color), d = lam(THREE, 0x2a2c2e);
  for (const x of [-7, 7]) for (const z of [6, 22]) { const l = new THREE.Mesh(new THREE.BoxGeometry(1.2, 40, 1.2), m); l.position.set(x, 20, z); l.castShadow = true; g.add(l); }
  for (const z of [6, 22]) { const b = new THREE.Mesh(new THREE.BoxGeometry(15.2, 1.4, 1.4), m); b.position.set(0, 39, z); g.add(b); }
  const girder = new THREE.Mesh(new THREE.BoxGeometry(5, 2.2, 36), m); girder.position.set(0, 40.5, 12); girder.castShadow = true; g.add(girder);
  const jib = new THREE.Group(); jib.position.set(0, 40.5, -6); g.add(jib);
  const boom = new THREE.Mesh(new THREE.BoxGeometry(5, 2.2, 42), m); boom.position.set(0, 0, -21); boom.castShadow = true; jib.add(boom);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(3, 2.4, 3), lam(THREE, 0xe8e2d0)); cab.position.set(0, -2.4, -8); jib.add(cab);
  const top = new THREE.Mesh(new THREE.BoxGeometry(3, 12, 3), m); top.position.set(0, 46, 4); g.add(top);
  for (const z of [-30, 16]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, 1, 4), d); const a = new THREE.Vector3(0, 52, 4), b = new THREE.Vector3(0, 41, z - 6);
    c.scale.y = a.distanceTo(b); c.position.copy(a).add(b).multiplyScalar(.5); c.lookAt(b); c.rotateX(Math.PI / 2); g.add(c); }
  g.userData.jib = jib; return g;
}

function lighthouse(THREE) {
  const g = new THREE.Group();
  for (let k = 0; k < 6; k++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(2.2 - k * .2, 2.4 - k * .2, 3, 14), lam(THREE, k % 2 ? 0xc8302c : 0xf2efe8)); m.position.y = 1.5 + k * 3; m.castShadow = true; g.add(m); }
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 2, 10), new THREE.MeshLambertMaterial({ color: 0xfff1b0, emissive: 0x6a5a20 })); lamp.position.y = 19; g.add(lamp);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.7, 1.8, 10), lam(THREE, 0x2a2c2e)); cap.position.y = 20.9; g.add(cap);
  return g;
}

export async function build(ctx) {
  const { THREE, scene } = ctx, R = rng(71);
  await sky(ctx, 'day'); scene.fog = new THREE.Fog(0xd3e2ea, 220, 1800);
  light(ctx, { dir: [-70, 110, 80], box: 130 });
  plane(ctx, 8000, 0x2d6f86, 0);                                                     // sea
  const quay = new THREE.Mesh(new THREE.BoxGeometry(260, 6, 140), lam(THREE, 0xa8a49c)); quay.position.set(0, 0, 70); quay.receiveShadow = true; scene.add(quay);
  const edge = new THREE.Mesh(new THREE.BoxGeometry(260, .5, .6), lam(THREE, 0xe0b23a)); edge.position.set(0, 3.25, .4); scene.add(edge);
  const pier = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 70), lam(THREE, 0x9a968e)); pier.position.set(110, .5, -35); pier.receiveShadow = true; scene.add(pier);
  // ship moored along the quay + tug
  await put(ctx, 'watercraft-kit', 'ship-cargo-b', { length: 140 }, [-10, 0, -34], Math.PI / 2);
  await put(ctx, 'watercraft-kit', 'boat-tug-a', { length: 18 }, [75, 0, -40], 2.4);
  // two cranes over the ship
  for (const [x, c] of [[-40, 0x2f6fa8], [20, 0xd3542f]]) { const cr = stsCrane(THREE, c); cr.position.set(x, 3, 0); scene.add(cr); }
  // container stacks on the quay
  const cont = ['shipping-container-a', 'shipping-container-b', 'shipping-container-c'];
  for (let row = 0; row < 4; row++) for (let i = 0; i < 9; i++) {
    const h = 1 + Math.floor(R() * 4); for (let k = 0; k < h; k++)
      await put(ctx, 'city-kit-industrial', cont[Math.floor(R() * 3)], { length: 12 }, [-80 + i * 14, 3 + k * 2.6, 42 + row * 3.4], Math.PI / 2);
  }
  // warehouses and trucks
  for (const [x, n] of [[-90, 'building-c'], [-55, 'building-f'], [60, 'building-c'], [95, 'building-h']]) await put(ctx, 'city-kit-industrial', n, { length: 30 }, [x, 3, 105]);
  for (const [x, z, r] of [[-20, 30, Math.PI / 2], [40, 24, -Math.PI / 2], [5, 70, Math.PI / 2]]) await put(ctx, 'car-kit', 'truck', { length: 9 }, [x, 3, z], r);
  for (let x = -120; x <= 120; x += 30) await put(ctx, 'city-kit-roads', 'light-square-double', { height: 10 }, [x, 3, 12]);
  const lh = lighthouse(THREE); lh.position.set(110, 3, -68); scene.add(lh);
  return { groundY: 3, seaLevel: 0, cameras };
}
