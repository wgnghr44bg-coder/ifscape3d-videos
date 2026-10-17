// INDUSTRIAL ZONE: factory halls, tall chimneys, storage tanks, a water tower, solar panels, wind turbines,
// containers, pipes, trucks and a fence along the access road. Grey day.
// Ground y = 0, access road along z at x = 0. Good for: power failure, heat, pollution, earthquake, robots, AI.
import { put, sky, light, plane, rng, lam } from './kit.js';

export const cameras = {
  gate:   { pos: [2, 1.7, 52], look: [-4, 10, -30] },       // eye level on the access road, halls and chimneys
  tanks:  { pos: [42, 1.7, 2], look: [18, 8, -30] },        // between the tanks
  aerial: { pos: [90, 65, 100], look: [0, 0, -20] },
};

export async function build(ctx) {
  const { THREE, scene } = ctx, R = rng(91);
  await sky(ctx, 'day'); scene.fog = new THREE.Fog(0xcfd5d9, 150, 1300);
  light(ctx, { sky: 0xe4e8ec, ground: 0x5d5a55, sun: 2.0, dir: [-60, 90, 70], box: 120 });
  plane(ctx, 4000, 0x8a8c7e, 0);
  const lot = new THREE.Mesh(new THREE.PlaneGeometry(170, 150), lam(THREE, 0x6f7072)); lot.rotation.x = -Math.PI / 2; lot.position.set(0, .02, -20); lot.receiveShadow = true; scene.add(lot);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(9, 300), lam(THREE, 0x4a4b4d)); road.rotation.x = -Math.PI / 2; road.position.set(0, .03, 40); scene.add(road);
  // halls
  const halls = ['building-a', 'building-b', 'building-d', 'building-e', 'building-g', 'building-k', 'building-m', 'building-p'];
  const spots = [[-40, -10], [-40, -45], [-40, 25], [40, -50], [-70, -20], [-75, 20], [70, -10], [10, -70]];
  for (let i = 0; i < spots.length; i++) await put(ctx, 'city-kit-industrial', halls[i], { length: 26 + R() * 10 }, [spots[i][0], 0, spots[i][1]], (R() < .5 ? 0 : Math.PI / 2));
  // chimneys, tanks, water tower
  for (const [x, z, h] of [[-20, -60, 45], [-8, -62, 38], [55, -70, 50]]) await put(ctx, 'city-kit-industrial', 'chimney-large', { height: h }, [x, 0, z]);
  for (let i = 0; i < 6; i++) await put(ctx, 'city-kit-industrial', i % 2 ? 'detail-tank-large' : 'detail-tank', { height: 9 + R() * 5 }, [20 + (i % 3) * 11, 0, -20 - Math.floor(i / 3) * 12]);
  await put(ctx, 'city-kit-industrial', 'water-tower', { height: 26 }, [62, 0, 25]);
  // solar field and wind turbines
  for (let i = 0; i < 4; i++) await put(ctx, 'city-kit-industrial', 'solar-panel-landscape-group', { length: 12 }, [-75 + i * 13, 0, 60]);
  for (const [x, z] of [[-180, -200], [-120, -260], [-50, -300], [40, -280], [130, -230]]) await put(ctx, 'city-kit-industrial', 'windmill', { height: 70 }, [x, 0, z], R() * 6.28);
  // containers, pipes, trucks
  for (let i = 0; i < 10; i++) await put(ctx, 'city-kit-industrial', ['shipping-container-a', 'shipping-container-b', 'shipping-container-c'][i % 3], { length: 12 }, [30 + (i % 5) * 3.2, Math.floor(i / 5) * 2.6, 20], Math.PI / 2);
  for (let k = 0; k < 5; k++) await put(ctx, 'factory-kit', 'pipe-large-long', { length: 8 }, [-20 + k * 8, 6, -30], Math.PI / 2);
  for (const [x, z, r] of [[3, 20, Math.PI], [-12, -25, Math.PI / 2], [16, 4, 0]]) await put(ctx, 'car-kit', 'truck', { length: 9 }, [x, 0, z], r);
  for (const [x, z] of [[-6, 8], [-9, 8], [-12, 8]]) await put(ctx, 'car-kit', ['sedan', 'van', 'suv'][Math.abs(x) % 3], { length: 4.5 }, [x, 0, z], Math.PI / 2);
  for (let z = 70; z > 50; z -= 4) for (const s of [-1, 1]) await put(ctx, 'city-kit-roads', 'construction-fence', { length: 4 }, [s * 8, 0, z], Math.PI / 2);
  return { groundY: 0, cameras };
}
