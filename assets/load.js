// Load a free CC0 model (assets/kenney/...) into a scene, in the same flat low-poly look as scene.html.
// The page's importmap needs:  "three": "<…>/node_modules/three/build/three.module.js",
//                              "three/addons/": "<…>/node_modules/three/examples/jsm/"
//
//   import { loadModel } from '../assets/load.js';
//   const woman = await loadModel('../assets/kenney/mini-characters/character-female-a.glb', { height: 1.7, anim: 'walk' });
//   scene.add(woman.root);
//   // in renderAt(t):  woman.setTime(t)            (animation follows the VIDEO time, so any frame renders on its own)
//   //                  woman.play('pick-up', t0)   (switch animation; it starts at video time t0)
//
// Options: height (m) or length (m, longest horizontal side) to scale to real size; anim = first animation;
// flat = true (default) replaces materials by MeshLambertMaterial with flatShading (keeps the Kenney colour map).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// NASA models are Draco-compressed; the decoder ships with three (node_modules in the repo root)
const draco = new DRACOLoader().setDecoderPath(new URL('../node_modules/three/examples/jsm/libs/draco/gltf/', import.meta.url).href);
const loader = new GLTFLoader().setDRACOLoader(draco);
const cache = new Map();

export async function loadModel(url, { height, length, anim, flat = true, shadows = true } = {}) {
  if (!cache.has(url)) cache.set(url, loader.loadAsync(url));
  const gltf = await cache.get(url);
  // SkeletonUtils-free clone: animated (skinned) models are loaded fresh, static ones are cloned
  let skinned = false; gltf.scene.traverse(o => { if (o.isSkinnedMesh) skinned = true; });
  const src = skinned ? (await loader.loadAsync(url)).scene : gltf.scene.clone(true);
  const root = new THREE.Group(); root.add(src);
  src.traverse(o => {
    if (!o.isMesh) return;
    o.castShadow = shadows; o.receiveShadow = shadows; o.frustumCulled = false;
    if (flat) { const m = o.material; o.material = new THREE.MeshLambertMaterial({ map: m.map || null, color: m.map ? 0xffffff : m.color, flatShading: true }); }
  });
  // real size, standing on y = 0, centred on x/z
  src.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(src), size = box.getSize(new THREE.Vector3());
  const s = height ? height / size.y : length ? length / Math.max(size.x, size.z) : 1;
  src.scale.setScalar(s);
  src.position.set(-(box.min.x + size.x / 2) * s, -box.min.y * s, -(box.min.z + size.z / 2) * s);

  const clips = gltf.animations || [];
  const mixer = clips.length ? new THREE.AnimationMixer(src) : null;
  let action = null, start = 0;
  const play = (name, t0 = 0) => {
    if (!mixer) return;
    const clip = THREE.AnimationClip.findByName(clips, name);
    if (!clip) { console.warn('no animation', name, 'in', url, clips.map(c => c.name)); return; }
    if (action) action.stop();
    action = mixer.clipAction(clip); action.play(); start = t0;
  };
  const setTime = (t) => { if (mixer && action) mixer.setTime(Math.max(0, t - start)); };
  if (anim) play(anim);
  return { root, mixer, play, setTime, animations: clips.map(c => c.name) };
}
