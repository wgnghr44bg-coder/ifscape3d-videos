// OLD TOWN WITH A CANAL: narrow old houses along both sides of a canal (Dutch/European feel), a stone bridge,
// a cobbled square with a fountain, market stalls, a cart, lanterns, trees, rowing boats on the water,
// a windmill at the edge of town. Morning light.
// Ground y = 0 (quays), canal along z at x = 0 (water y -1.2, quay edge |x| = 6). Square at z ≈ -40.
// Good for: flood, sea level rises, cold (canal freezes), earthquake, the past (old times), night/blackout.
import { put, sky, light, plane, hills, rng, lam } from './kit.js';

export const cameras = {
  canal:  { pos: [-8.5, 1.7, 46], look: [0, 1, -20] },      // eye level on the quay, along the canal to the bridge
  square: { pos: [5, 1.7, -29], look: [-3, 2.5, -52] },       // on the square, fountain and stalls
  aerial: { pos: [55, 45, 60], look: [0, 0, -15] },
};

export async function build(ctx) {
  const { THREE, scene } = ctx, R = rng(61);
  await sky(ctx, 'morning'); scene.fog = new THREE.Fog(0xe6dccd, 120, 1100);
  light(ctx, { sky: 0xf2ece2, ground: 0x6b5d4c, sunColor: 0xffe9cc, dir: [-70, 80, 50], box: 90 });
  plane(ctx, 3000, 0x7c8a5a, -1.4);                                                   // low land around town (below the canal)
  // quays (cobbles) left and right, canal water between
  for (const s of [-1, 1]) { const q = new THREE.Mesh(new THREE.BoxGeometry(60, 1.4, 200), lam(THREE, 0x9a8f80)); q.position.set(s * 36, -.7, -10); q.receiveShadow = true; scene.add(q); }
  const water = new THREE.Mesh(new THREE.PlaneGeometry(12, 200), lam(THREE, 0x3f6f78)); water.rotation.x = -Math.PI / 2; water.position.set(0, -1.2, -10); scene.add(water);
  for (const s of [-1, 1]) { const wall = new THREE.Mesh(new THREE.BoxGeometry(.4, 1.3, 200), lam(THREE, 0x6e5a4a)); wall.position.set(s * 6, -.6, -10); scene.add(wall); }
  // square at the end of the canal
  const sq = new THREE.Mesh(new THREE.BoxGeometry(70, 1.25, 40), lam(THREE, 0xa39684)); sq.position.set(0, -.6, -48); sq.receiveShadow = true; scene.add(sq);
  // houses along both quays (narrow, tall, facing the canal)
  const houses = ['building-sample-house-a', 'building-sample-house-b', 'building-sample-house-c', 'building-sample-tower-a', 'building-sample-tower-b'];
  for (const s of [-1, 1]) for (let z = 60; z > -26; z -= 7.5)
    await put(ctx, 'modular-buildings', houses[Math.floor(R() * houses.length)], { length: 7 }, [s * 13, 0, z], s > 0 ? -Math.PI / 2 : Math.PI / 2);
  for (let x = -30; x <= 30; x += 7.5) if (Math.abs(x) > 6) await put(ctx, 'modular-buildings', houses[Math.floor(R() * houses.length)], { length: 7 }, [x, 0, -66]);
  // stone bridge over the canal
  await put(ctx, 'nature-kit', 'bridge_stoneRound', { length: 14 }, [0, -.9, 0], Math.PI / 2);
  // square: fountain, stalls, cart, lanterns, trees, benches
  await put(ctx, 'fantasy-town-kit', 'fountain-round', { length: 6 }, [0, 0, -46]);
  for (const [x, z, n, r] of [[-12, -40, 'stall-red', .3], [-16, -50, 'stall-green', .6], [12, -42, 'stall', -.4], [15, -52, 'stall-red', -.7]]) await put(ctx, 'fantasy-town-kit', n, { length: 3.2 }, [x, 0, z], r);
  await put(ctx, 'fantasy-town-kit', 'cart', { length: 2.6 }, [6, 0, -36], .9);
  for (let z = 50; z > -30; z -= 12) for (const s of [-1, 1]) await put(ctx, 'fantasy-town-kit', 'lantern', { height: 3.2 }, [s * 7, 0, z]);
  for (let z = 44; z > -24; z -= 16) for (const s of [-1, 1]) await put(ctx, 'fantasy-town-kit', 'tree-high-round', { height: 7 }, [s * 8.2, 0, z + 6]);
  for (const [x, z] of [[-8, -38], [8, -56]]) await put(ctx, 'coaster-kit', 'bench', { length: 1.8 }, [x, 0, z]);
  // boats on the canal
  for (const [z, r] of [[30, .1], [14, -.15], [-14, .2]]) await put(ctx, 'pirate-kit', 'boat-row-small', { length: 4 }, [R() < .5 ? -3.5 : 3.5, -1.2, z], r);
  // windmill at the edge of town
  await put(ctx, 'fantasy-town-kit', 'windmill', { height: 18 }, [-60, 0, -90], .5);
  hills(ctx, { n: 6, r: 800, h: [40, 90], color: 0x6f8a6a, seed: 6 });
  return { groundY: 0, waterY: -1.2, cameras };
}
