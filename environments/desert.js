// DESERT HIGHWAY: a straight two-lane road through a sand plain with dunes, red-rock mesas, cacti, rocks,
// power poles along the road, a truck and a car, a road sign. Bright day sky, heat haze colours.
// Ground y = 0, road along z through x = 0. Good for: heat, the Sun comes closer, drought, no water, sandstorm.
import { put, sky, light, plane, rng, lam } from './kit.js';

export const cameras = {
  road:   { pos: [3.5, 1.7, 40], look: [0, 3, -80] },       // eye level at the roadside, road to the horizon
  mesa:   { pos: [-30, 2, 10], look: [60, 25, -160] },      // across the sand to the mesas
  aerial: { pos: [80, 60, 90], look: [0, 0, -40] },
};

export async function build(ctx) {
  const { THREE, scene } = ctx, R = rng(51);
  await sky(ctx, 'day'); scene.fog = new THREE.Fog(0xe9dcc0, 200, 1800);
  light(ctx, { sky: 0xfff3dc, ground: 0xb38a5a, sunColor: 0xfff0d0, sun: 2.8, dir: [-50, 120, 40], box: 110 });
  plane(ctx, 6000, 0xdfc08a, 0);                                                      // sand
  const road = new THREE.Mesh(new THREE.PlaneGeometry(8, 3000), lam(THREE, 0x4a4746)); road.rotation.x = -Math.PI / 2; road.position.y = .03; road.receiveShadow = true; scene.add(road);
  for (let z = 60; z > -1400; z -= 9) { const d = new THREE.Mesh(new THREE.PlaneGeometry(.15, 4), lam(THREE, 0xe8d27a)); d.rotation.x = -Math.PI / 2; d.position.set(0, .04, z); scene.add(d); }
  // dunes: soft flattened half-spheres
  for (let i = 0; i < 40; i++) {
    const x = (R() < .5 ? -1 : 1) * (25 + R() * 400), z = 80 - R() * 900, r = 15 + R() * 45;
    const d = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), lam(THREE, R() < .5 ? 0xd9b77d : 0xe4c792));
    d.scale.y = .18 + R() * .12; d.position.set(x, 0, z); d.receiveShadow = true; scene.add(d);
  }
  // mesas: layered red rock (flat-topped)
  const layers = [0xb5643c, 0xc9774a, 0xa75535, 0xd08a5a];
  for (let i = 0; i < 9; i++) {
    const x = (R() - .5) * 1400, z = -400 - R() * 900, w = 60 + R() * 140, h = 50 + R() * 90;
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    let y = 0; for (let k = 0; k < 4; k++) { const lh = h / 4, s = 1 - k * .06;
      const m = new THREE.Mesh(new THREE.CylinderGeometry(w * s * .92, w * s, lh, 8), lam(THREE, layers[k])); m.position.y = y + lh / 2; m.castShadow = true; g.add(m); y += lh; }
  }
  // cacti, rocks, bushes near the road
  for (let i = 0; i < 70; i++) {
    const x = (R() < .5 ? -1 : 1) * (7 + R() * 90), z = 60 - R() * 300;
    const k = R(); const name = k < .35 ? 'cactus_tall' : k < .6 ? 'cactus_short' : k < .85 ? 'rock_smallC' : 'rock_largeB';
    await put(ctx, 'nature-kit', name, { height: name.startsWith('cactus') ? 2 + R() * 3.5 : .4 + R() * 1.6 }, [x, 0, z], R() * 6.28);
  }
  // power poles along the road
  for (let z = 50; z > -500; z -= 40) await put(ctx, 'city-kit-roads', 'electricity-pole', { height: 9 }, [-9, 0, z]);
  await put(ctx, 'retro-urban-kit', 'truck-grey-cargo', { length: 9 }, [2, 0, -30], Math.PI);
  await put(ctx, 'car-kit', 'suv', { length: 4.6 }, [-2, 0, 8]);
  await put(ctx, 'city-kit-roads', 'sign-highway', { height: 4 }, [6, 0, 20], -Math.PI / 2);
  return { groundY: 0, cameras };
}
