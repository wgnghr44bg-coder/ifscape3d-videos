// FOREST CAMP BY A LAKE: a clearing in a mixed forest with tents, a campfire, logs, a signpost, rocks,
// a small lake with lily pads and a jetty, hills behind. Day sky.
// Ground y = 0, campfire at the origin, the lake to -z (water y 0.05). Good for: wildlife, wildfire, storm, survival, aliens.
import { put, sky, light, plane, hills, rng, lam } from './kit.js';

export const cameras = {
  camp:   { pos: [9, 1.8, 19], look: [-2, 1.2, -6] },      // eye level at the camp, lake behind the tents
  lake:   { pos: [-16, 1.7, -14], look: [4, 1.5, 4] },        // from the jetty back to the camp
  aerial: { pos: [55, 45, 70], look: [0, 0, -10] },
};

export async function build(ctx) {
  const { THREE, scene } = ctx, R = rng(31);
  await sky(ctx, 'day'); scene.fog = new THREE.Fog(0xcfdce6, 90, 900);
  light(ctx, { ground: 0x4f5a3a, dir: [-60, 90, 60], box: 80 });
  plane(ctx, 3000, 0x6c8a4a, 0);                                                      // grass
  const lake = new THREE.Mesh(new THREE.CircleGeometry(22, 36), lam(THREE, 0x3d7f8f)); lake.rotation.x = -Math.PI / 2; lake.position.set(0, .05, -30); scene.add(lake);
  const shore = new THREE.Mesh(new THREE.RingGeometry(22, 24.5, 36), lam(THREE, 0xb8a77a)); shore.rotation.x = -Math.PI / 2; shore.position.set(0, .04, -30); scene.add(shore);
  hills(ctx, { n: 8, r: 600, h: [90, 200], color: 0x4f6b45, seed: 9, arc: [Math.PI, Math.PI * 2] });
  // forest ring (keep the clearing and the lake free)
  const trees = ['tree_oak', 'tree_default', 'tree_detailed', 'tree_fat', 'tree_pineTallB_detailed', 'tree_pineRoundD', 'tree_cone'];
  for (let i = 0; i < 90; i++) {
    const x = (R() - .5) * 160, z = (R() - .5) * 160 - 10;
    if (Math.hypot(x, z) < 16 || Math.hypot(x, z + 30) < 27) continue;
    await put(ctx, 'nature-kit', trees[i % trees.length], { height: 7 + R() * 9 }, [x, 0, z], R() * 6.28);
  }
  // camp
  await put(ctx, 'nature-kit', 'campfire_stones', { length: 1.4 }, [0, 0, 0]);
  await put(ctx, 'nature-kit', 'tent_detailedOpen', { length: 3.2 }, [-5, 0, -4], .5);
  await put(ctx, 'nature-kit', 'tent_smallClosed', { length: 2.4 }, [4, 0, -5], -.4);
  await put(ctx, 'nature-kit', 'log_large', { length: 2.6 }, [-2.2, 0, 2.2], .3);
  await put(ctx, 'nature-kit', 'log', { length: 2 }, [2.4, 0, 1.8], -.6);
  await put(ctx, 'nature-kit', 'log_stackLarge', { length: 2 }, [7, 0, 1], 1.2);
  await put(ctx, 'survival-kit', 'signpost', { height: 1.8 }, [9, 0, 6], -.8);
  for (let i = 0; i < 8; i++) await put(ctx, 'nature-kit', ['rock_smallB', 'rock_tallC', 'plant_bushLarge', 'plant_bush'][i % 4], { height: .4 + R() * .8 }, [(R() - .5) * 30, 0, (R() - .5) * 20 + 4], R() * 6.28);
  // lake: jetty, canoe, lilies
  for (let k = 0; k < 4; k++) await put(ctx, 'pirate-kit', 'structure-platform-dock-small', { length: 2.5 }, [-4, .3, -9 - k * 2.5]);
  await put(ctx, 'nature-kit', 'canoe', { length: 4 }, [-1.5, .1, -16], .3);
  for (let i = 0; i < 10; i++) await put(ctx, 'nature-kit', i % 2 ? 'lily_large' : 'lily_small', { length: .8 }, [(R() - .5) * 26, .07, -30 + (R() - .5) * 26]);
  return { groundY: 0, waterY: .05, cameras };
}
