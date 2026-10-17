// MOON BASE: grey cratered plain with a base (round, large and small hangars),
// satellite dishes, a rover, astronauts, rocks and craters, the Earth low in a black starry sky.
// Ground y = 0, base centre at the origin, the Earth at (-250, 260, -1400). Good for: space, the Moon, low gravity, asteroids.
import { put, sky, light, plane, rng, lam } from './kit.js';

export const cameras = {
  base:   { pos: [22, 1.8, 36], look: [-8, 6, -14] },      // eye level next to the rover, base + rocket
  earth:  { pos: [14, 1.7, 34], look: [-50, 40, -280] },    // the base low in frame, the Earth in the sky
  aerial: { pos: [70, 50, 80], look: [-5, 0, -10] },
};

export async function build(ctx) {
  const { THREE, scene } = ctx, R = rng(41);
  await sky(ctx, 'space-galaxy');
  light(ctx, { hemi: .55, sky: 0x9aa3b5, ground: 0x2a2a2e, sun: 3.0, sunColor: 0xffffff, dir: [-90, 60, 40], box: 90 });
  plane(ctx, 4000, 0x8e8c88, 0);                                                      // regolith
  // the Earth, low over the horizon
  const earth = new THREE.Mesh(new THREE.SphereGeometry(60, 32, 20), new THREE.MeshLambertMaterial({ color: 0x3b6fb6, emissive: 0x0d2240 }));
  earth.position.set(-250, 260, -1400); scene.add(earth);
  const land = new THREE.Mesh(new THREE.SphereGeometry(60.5, 12, 8), new THREE.MeshLambertMaterial({ color: 0x5f8f4e, emissive: 0x10220c, flatShading: true, transparent: true, opacity: .75 }));
  land.position.copy(earth.position); land.scale.set(1, .6, 1); land.rotation.z = .5; scene.add(land);
  // craters and rocks
  const grey = (m) => m && m.root.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.map = null; o.material.color.setHex(0x7f7d79); } });
  for (let i = 0; i < 22; i++) grey(await put(ctx, 'space-kit', i % 3 ? 'crater' : 'craterLarge', { length: 4 + R() * 14 }, [(R() - .5) * 220, 0, (R() - .5) * 220 - 30], R() * 6.28));
  for (let i = 0; i < 30; i++) grey(await put(ctx, 'space-kit', ['rocks_smallA', 'rock_largeA', 'meteor'][i % 3], { height: .4 + R() * 1.8 }, [(R() - .5) * 160, 0, (R() - .5) * 160], R() * 6.28));
  // base
  await put(ctx, 'space-kit', 'hangar_roundA', { length: 14 }, [0, 0, -12]);
  await put(ctx, 'space-kit', 'hangar_largeA', { length: 18 }, [16, 0, -16], -.4);
  await put(ctx, 'space-kit', 'hangar_smallA', { length: 9 }, [12, 0, 6], .6);
  await put(ctx, 'space-kit', 'satelliteDish_large', { height: 9 }, [10, 0, 2], 2.4);
  await put(ctx, 'space-kit', 'satelliteDish', { height: 4 }, [-14, 0, -6], .8);
  await put(ctx, 'space-kit', 'rover', { length: 4.5 }, [6, 0, 24], -.9);
  await put(ctx, 'space-kit', 'astronautA', { height: 1.8 }, [5, 0, 20], -.4);
  await put(ctx, 'space-kit', 'astronautB', { height: 1.8 }, [-2, 0, 14], .6);
  return { groundY: 0, cameras };
}
