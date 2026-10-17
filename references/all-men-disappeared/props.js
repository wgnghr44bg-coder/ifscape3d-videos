// Reference props for "What if every man on Earth disappeared?" – same low-poly style as the gravity scene.
// Use: import { makeCoatSet, makeEmptyCar, makeWoman, poseWoman } from './props.js';
// Every function gets ctx = { THREE, lam, shadowed } (lam/shadowed exactly as in scene.html).
// Units are metres. A person faces +z; their left side is +x.

// ---------- coat + shoes + phone (what stays behind) ----------
// Put the returned group ON the surface: y = 0.2 on the pavement (the pavement box top), y = 0 on the road.
export function makeCoatSet(ctx, { color = 0x4a5a78, phone = true, seed = 1 } = {}) {
  const { THREE, lam, shadowed } = ctx;
  const R = (k) => { const x = Math.sin(seed * 91.7 + k * 12.9) * 43758.5; return x - Math.floor(x); };
  const g = new THREE.Group();
  const cloth = lam(color), dark = lam(new THREE.Color(color).multiplyScalar(.7));
  // crumpled coat: 3 flattened slabs at slight angles + a sleeve + a collar
  const slabs = [[.55, .07, .42, 0, 0, 0], [.42, .06, .34, .12, .05, -.08], [.36, .05, .28, -.1, .1, .1]];
  slabs.forEach(([w, h, d, x, z, tilt], i) => {
    const m = shadowed(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), i ? dark : cloth));
    m.position.set(x, h / 2 + i * .035, z); m.rotation.set(tilt, (R(i) - .5) * .9, (R(i + 5) - .5) * .25); g.add(m);
  });
  const sleeve = shadowed(new THREE.Mesh(new THREE.BoxGeometry(.11, .07, .42), cloth));
  sleeve.position.set(.3, .04, .12); sleeve.rotation.y = .7; g.add(sleeve);
  const collar = shadowed(new THREE.Mesh(new THREE.BoxGeometry(.22, .05, .07), dark));
  collar.position.set(-.02, .12, -.2); g.add(collar);
  // shoes: dark, small, side by side, just below the coat
  const shoeMat = lam(0x1d1b1a);
  [-.07, .07].forEach((x, i) => {
    const s = shadowed(new THREE.Mesh(new THREE.BoxGeometry(.1, .09, .27), shoeMat));
    s.position.set(x + .02, .045, .36 + i * .03); s.rotation.y = (i ? .12 : -.05); g.add(s);
    const toe = shadowed(new THREE.Mesh(new THREE.BoxGeometry(.1, .06, .06), shoeMat));
    toe.position.set(x + .02, .03, .51 + i * .03); g.add(toe);
  });
  if (phone) g.add(makePhone(ctx));
  return g;
}

// phone lying on the ground: dark body, light screen, only a small soft glow. phone.userData.setOn(0..1) to blink.
export function makePhone(ctx) {
  const { THREE, lam, shadowed } = ctx;
  const p = new THREE.Group(); p.position.set(-.38, 0, .2); p.rotation.y = .5;
  const body = shadowed(new THREE.Mesh(new THREE.BoxGeometry(.075, .012, .15), lam(0x151617)));
  body.position.y = .006; p.add(body);
  const screenMat = new THREE.MeshBasicMaterial({ color: 0xd8ecff });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(.062, .13), screenMat);
  screen.rotation.x = -Math.PI / 2; screen.position.y = .0125; p.add(screen);
  // small glow: radial gradient, additive, 0.35 m wide, does NOT cover the phone
  const cv = document.createElement('canvas'); cv.width = cv.height = 64;
  const c = cv.getContext('2d'), gr = c.createRadialGradient(32, 32, 4, 32, 32, 32);
  gr.addColorStop(0, 'rgba(190,225,255,0.55)'); gr.addColorStop(1, 'rgba(190,225,255,0)');
  c.fillStyle = gr; c.fillRect(0, 0, 64, 64);
  const glowMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(.35, .35), glowMat);
  glow.rotation.x = -Math.PI / 2; glow.position.y = .004; p.add(glow);
  p.userData.setOn = (on) => { screenMat.color.setHex(on > .5 ? 0xd8ecff : 0x26323a); glow.visible = on > .5; };
  return p;
}

// ---------- car with windows, empty seats and a steering wheel ----------
// Same size as carMesh() in scene.html (body 1.8 x 0.7 x 4.3). Returns { g, body, wheels } like carMesh.
export function makeEmptyCar(ctx, color = 0x8c3b33) {
  const { THREE, lam, shadowed } = ctx;
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const paint = lam(color), trim = lam(0x2a2c2e);
  const lower = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.8, .7, 4.3), paint)); lower.position.y = -.1; body.add(lower);
  // cabin frame: roof + 4 pillars (open, so you can look inside)
  const roof = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.6, .07, 2.0), paint)); roof.position.set(0, .86, .1); body.add(roof);
  for (const [x, z] of [[-.77, 1.08], [.77, 1.08], [-.77, -.88], [.77, -.88]]) {
    const p = shadowed(new THREE.Mesh(new THREE.BoxGeometry(.07, .62, .1), paint)); p.position.set(x, .55, z); body.add(p);
  }
  const bpost = [-.77, .77].map(x => { const p = shadowed(new THREE.Mesh(new THREE.BoxGeometry(.06, .62, .08), paint)); p.position.set(x, .55, .1); body.add(p); return p; });
  // glass: light grey-blue, see-through
  const glass = new THREE.MeshLambertMaterial({ color: 0xb9ccd8, transparent: true, opacity: .28, depthWrite: false, side: THREE.DoubleSide });
  for (const x of [-.78, .78]) for (const [z, d] of [[.6, .9], [-.4, .9]]) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(.02, .5, d), glass); w.position.set(x, .55, z); body.add(w);
  }
  const ws = new THREE.Mesh(new THREE.BoxGeometry(1.5, .55, .02), glass); ws.position.set(0, .55, 1.12); ws.rotation.x = -.35; body.add(ws);
  const rw = new THREE.Mesh(new THREE.BoxGeometry(1.5, .5, .02), glass); rw.position.set(0, .55, -.92); rw.rotation.x = .3; body.add(rw);
  // interior: 2 front seats + rear bench, dashboard, steering wheel on the left (+x)
  const seatMat = lam(0x3b3d40);
  for (const x of [.38, -.38]) {
    const s = shadowed(new THREE.Mesh(new THREE.BoxGeometry(.5, .14, .5), seatMat)); s.position.set(x, .3, .35); body.add(s);
    const b = shadowed(new THREE.Mesh(new THREE.BoxGeometry(.5, .55, .12), seatMat)); b.position.set(x, .6, .08); b.rotation.x = -.15; body.add(b);
  }
  const bench = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.4, .5, .14), seatMat)); bench.position.set(0, .55, -.7); body.add(bench);
  const dash = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.55, .2, .35), trim)); dash.position.set(0, .45, .95); body.add(dash);
  const wheelRing = new THREE.Mesh(new THREE.TorusGeometry(.17, .025, 6, 16), trim);
  wheelRing.position.set(.38, .58, .78); wheelRing.rotation.x = -.5; body.add(wheelRing);
  const col = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, .25, 6), trim);
  col.position.set(.38, .52, .88); col.rotation.x = 1.0; body.add(col);
  const wheelGeo = new THREE.CylinderGeometry(.34, .34, .25, 10); wheelGeo.rotateZ(Math.PI / 2);
  const wheels = [[-.85, 1.35], [.85, 1.35], [-.85, -1.35], [.85, -1.35]].map(([x, z]) => {
    const w = shadowed(new THREE.Mesh(wheelGeo, lam(0x1c1d1f))); w.position.set(x, -.43, z); g.add(w); return w; });
  return { g, body, wheels };
}

// ---------- women with arms and knees, so they can kneel, hug and pick something up ----------
// Same body sizes as the people in scene.html, plus arms, knees and hair.
export function makeWoman(ctx, { shirt = 0x8a6b4e, hair = 0x3b2a20, skirt = 0x2f3236 } = {}) {
  const { THREE, lam, shadowed } = ctx;
  const g = new THREE.Group();
  const hips = new THREE.Group(); hips.position.y = .82; g.add(hips);
  const upper = new THREE.Group(); hips.add(upper);
  const torso = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(.19, .17, .75, 7), lam(shirt))); torso.position.y = .38; upper.add(torso);
  const head = shadowed(new THREE.Mesh(new THREE.IcosahedronGeometry(.13, 0), lam(0x6b5444))); head.position.y = .9; upper.add(head);
  const hairM = shadowed(new THREE.Mesh(new THREE.BoxGeometry(.27, .3, .14), lam(hair))); hairM.position.set(0, .86, -.08); upper.add(hairM);
  const arms = [1, -1].map(s => {
    const sh = new THREE.Group(); sh.position.set(s * .24, .68, 0); upper.add(sh);
    const a = shadowed(new THREE.Mesh(new THREE.BoxGeometry(.09, .62, .1), lam(shirt))); a.position.y = -.31; sh.add(a);
    const hand = shadowed(new THREE.Mesh(new THREE.BoxGeometry(.08, .09, .09), lam(0x6b5444))); hand.position.y = -.66; sh.add(hand);
    return sh;
  });
  const legMat = lam(skirt);
  const legs = [1, -1].map(s => {
    const hip = new THREE.Group(); hip.position.x = s * .08; hips.add(hip);
    const thigh = shadowed(new THREE.Mesh(new THREE.BoxGeometry(.13, .42, .14), legMat)); thigh.position.y = -.21; hip.add(thigh);
    const knee = new THREE.Group(); knee.position.y = -.42; hip.add(knee);
    const shin = shadowed(new THREE.Mesh(new THREE.BoxGeometry(.12, .4, .13), legMat)); shin.position.y = -.2; knee.add(shin);
    return { hip, knee };
  });
  return { g, hips, upper, arms, legs, head };
}

// pose: 'stand' | 'kneel' | 'hug' | 'pickup' | 'turn'. k = 0..1 blends from standing into the pose.
export function poseWoman(w, pose, k = 1) {
  const L = (a, b) => a + (b - a) * k;
  const [aL, aR] = w.arms, [lL, lR] = w.legs;
  w.hips.position.set(0, .82, 0); w.upper.rotation.set(0, 0, 0);
  for (const a of w.arms) a.rotation.set(0, 0, 0);
  for (const l of w.legs) { l.hip.rotation.set(0, 0, 0); l.knee.rotation.set(0, 0, 0); }
  if (pose === 'kneel') {            // right knee on the ground, left foot forward, reaching down to the coat
    w.hips.position.y = L(.82, .44);
    lR.hip.rotation.x = 0;           lR.knee.rotation.x = L(0, Math.PI / 2);      // shin flat behind
    lL.hip.rotation.x = L(0, -1.45); lL.knee.rotation.x = L(0, 1.45);             // thigh forward, shin down
    w.upper.rotation.x = L(0, .35);
    aL.rotation.x = L(0, -.9); aR.rotation.x = L(0, -.6);
  } else if (pose === 'hug') {       // arms forward and around the other woman (place two at 0.42 m, facing)
    w.upper.rotation.x = L(0, .08);
    aL.rotation.set(L(0, -1.25), 0, L(0, -.55)); aR.rotation.set(L(0, -1.15), 0, L(0, .55));
  } else if (pose === 'pickup') {    // bent over, both hands down to the coat
    w.upper.rotation.x = L(0, .85);
    lL.hip.rotation.x = L(0, -.45); lL.knee.rotation.x = L(0, .9); lR.hip.rotation.x = L(0, -.45); lR.knee.rotation.x = L(0, .9);
    w.hips.position.y = L(.82, .66); w.hips.position.z = L(0, -.12);
    aL.rotation.x = L(0, -.55); aR.rotation.x = L(0, -.55);
  } else if (pose === 'turn') {      // stops, looks around, one hand to the face
    w.upper.rotation.y = L(0, .6); aL.rotation.set(L(0, -2.3), 0, L(0, -.3));
  }
}
