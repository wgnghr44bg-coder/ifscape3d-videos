// WINTER VILLAGE: snowy valley with a ring of houses around a square, snowy pines, a snowman, sled, lanterns,
// benches and snow piles, snow-capped mountains all around. Morning sky.
// Ground y = 0, square centre at the origin, main street along z. Good for: cold, the Sun goes out, ice age, blizzard.
import { put, sky, light, plane, hills, rng, lam } from './kit.js';

export const cameras = {
  street: { pos: [2, 1.7, 46], look: [0, 4, -10] },        // eye level, walking into the village
  square: { pos: [-9, 1.6, 9], look: [8, 2.5, -6] },       // on the square, snowman and houses
  aerial: { pos: [60, 48, 85], look: [0, 0, -5] },
};

export async function build(ctx) {
  const { THREE, scene } = ctx, R = rng(21);
  await sky(ctx, 'morning'); scene.fog = new THREE.Fog(0xdfe6ee, 120, 1400);
  light(ctx, { sky: 0xeef3f8, ground: 0x9aa4ae, sunColor: 0xfff1dc, dir: [-70, 80, 80], box: 90 });
  plane(ctx, 4000, 0xeef2f5, 0);                                                      // snow
  const road = new THREE.Mesh(new THREE.PlaneGeometry(7, 120), lam(THREE, 0xc9ced3)); road.rotation.x = -Math.PI / 2; road.position.set(0, .02, 0); road.receiveShadow = true; scene.add(road);
  const sq = new THREE.Mesh(new THREE.CircleGeometry(13, 32), lam(THREE, 0xd3d8dc)); sq.rotation.x = -Math.PI / 2; sq.position.y = .03; sq.receiveShadow = true; scene.add(sq);
  hills(ctx, { n: 12, r: 700, h: [180, 380], color: 0x8a96a2, snow: true, seed: 5 });
  // houses along the street and around the square
  const types = 'abcdefghijklmnopqrstu'.split('');
  const spots = [];
  for (let z = 38; z > -50; z -= 11) for (const s of [-1, 1]) if (Math.abs(z) > 14 || true) spots.push([s * (Math.abs(z) < 14 ? 19 : 12), z, s > 0 ? -Math.PI / 2 : Math.PI / 2]);
  for (const [x, z, ry] of spots) await put(ctx, 'city-kit-suburban', `building-type-${types[Math.floor(R() * types.length)]}`, { length: 10 }, [x, 0, z], ry);
  // snowy pines around the village
  const pines = ['tree_pineTallB_detailed', 'tree_pineTallC_detailed', 'tree_pineRoundD', 'tree_pineDefaultA', 'tree_pineSmallA'];
  for (let i = 0; i < 40; i++) {
    const a = R() * Math.PI * 2, r = 30 + R() * 60;
    await put(ctx, 'nature-kit', pines[i % pines.length], { height: 6 + R() * 8 }, [Math.cos(a) * r, 0, Math.sin(a) * r - 10], R() * 6.28);
  }
  // square: snowman, sled, benches, lanterns, snow piles
  await put(ctx, 'holiday-kit', 'snowman-hat', { height: 1.7 }, [3, 0, -2], -.5);
  await put(ctx, 'holiday-kit', 'sled', { length: 1.4 }, [5, 0, 1], .8);
  for (const [x, z, r] of [[-8, -6, .9], [8, -7, -.9]]) await put(ctx, 'holiday-kit', 'bench', { length: 1.8 }, [x, 0, z], r);
  for (const [x, z] of [[-4.5, 12], [4.5, 12], [-4.5, -16], [4.5, -16], [-10, 2], [10, 2]]) await put(ctx, 'holiday-kit', 'lantern', { height: 3 }, [x, 0, z]);
  for (let i = 0; i < 14; i++) await put(ctx, 'holiday-kit', i % 2 ? 'snow-pile' : 'snow-flat', { length: 1.5 + R() * 2 }, [(R() - .5) * 50, 0, (R() - .5) * 80], R() * 6.28);
  return { groundY: 0, cameras };
}
