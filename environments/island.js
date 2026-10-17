// TROPICAL ISLAND: a sandy island (radius ≈ 45 m) in a turquoise sea, palms, rocks, a hut, a wooden dock with a
// rowing boat, a sailing boat nearby and an ocean liner on the horizon. Day sky.
// Sea level y = 0, island top y ≈ 1.2. The dock points to +z. Good for: sea level rises, tsunami, tide, heat, storm.
import { put, sky, light, plane, hills, rng, lam } from './kit.js';

export const cameras = {
  beach:  { pos: [-3, 2.4, 38], look: [12, 1.5, 80] },      // eye level on the beach, looking over the dock to the sea
  palms:  { pos: [22, 1.7, 30], look: [-6, 4, -6] },      // eye level from the waterline into the palms and the hut
  aerial: { pos: [70, 55, 110], look: [0, 0, 10] },       // high, the whole island
};

export async function build(ctx) {
  const { THREE, scene } = ctx, R = rng(11);
  await sky(ctx, 'day'); scene.fog = new THREE.Fog(0xcfe3ee, 250, 1600);
  light(ctx, { dir: [-80, 110, 60], box: 90 });
  plane(ctx, 6000, 0x2f9aa8, 0);                                                      // sea
  const shallow = new THREE.Mesh(new THREE.CircleGeometry(62, 40), lam(THREE, 0x56c2bf));
  shallow.rotation.x = -Math.PI / 2; shallow.position.y = .02; scene.add(shallow);    // light water around the island
  const sand = new THREE.Mesh(new THREE.CylinderGeometry(44, 50, 2.4, 40), lam(THREE, 0xe6d3a0));
  sand.position.y = 0; sand.receiveShadow = true; scene.add(sand);                    // top at y 1.2
  const grass = new THREE.Mesh(new THREE.CylinderGeometry(24, 28, .2, 30), lam(THREE, 0x7fa64a));
  grass.position.set(-6, 1.25, -8); grass.receiveShadow = true; scene.add(grass);
  hills(ctx, { n: 5, r: 1400, h: [60, 140], color: 0x6f8f7a, arc: [Math.PI * 1.1, Math.PI * 1.9] });
  const Y = 1.2;
  // palms around the grass
  const palms = ['palm-bend', 'palm-straight', 'palm-detailed-bend', 'palm-detailed-straight'];
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2 + R() * .3, r = 14 + R() * 20;
    await put(ctx, 'pirate-kit', palms[i % 4], { height: 7 + R() * 4 }, [Math.cos(a) * r - 6, Y, Math.sin(a) * r - 8], R() * 6.28);
  }
  for (let i = 0; i < 10; i++) {
    let a = R() * Math.PI * 2; if (Math.sin(a) > .5) a += Math.PI; const r = 40 + R() * 8;   // keep the dock side (+z) free
    await put(ctx, 'pirate-kit', ['rocks-sand-a', 'rocks-sand-b', 'rocks-sand-c'][i % 3], { height: 1 + R() * 1.6 }, [Math.cos(a) * r, Y - .4, Math.sin(a) * r], R() * 6.28);
  }
  // hut on stilts + crates
  await put(ctx, 'pirate-kit', 'structure', { height: 5 }, [-10, Y, -14], .4);
  await put(ctx, 'pirate-kit', 'structure-roof', { length: 7 }, [-10, Y + 4.4, -14], .4);
  await put(ctx, 'pirate-kit', 'crate', { height: .8 }, [-5, Y, -10], .3);
  await put(ctx, 'pirate-kit', 'barrel', { height: 1 }, [-4, Y, -11.5]);
  // dock into the sea (+z), rowing boat, sailing boat, liner far away
  for (let k = 0; k < 6; k++) await put(ctx, 'pirate-kit', 'structure-platform-dock', { length: 4 }, [6, .6, 44 + k * 4]);
  await put(ctx, 'pirate-kit', 'boat-row-small', { length: 4 }, [9.5, .1, 58], 1.4);
  await put(ctx, 'watercraft-kit', 'boat-sail-a', { length: 9 }, [40, 0, 95], -.6);
  await put(ctx, 'watercraft-kit', 'ship-ocean-liner', { length: 220 }, [-300, 0, 900], 1.3);
  return { seaLevel: 0, groundY: Y, cameras };
}
