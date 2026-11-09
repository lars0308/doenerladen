// 3D-Ansicht (Three.js) für die Draufsicht-Simulation: 1 Kachel = 1 Welt-Einheit, Sim-(x,y) -> 3D-(X,Z).
// Kamera schräg von oben hinter den Figuren (Odyssey-Stil). Assets: Kenney (CC0) + Quaternius (CC0).

const GATE3 = { red: 0xff4d4d, blue: 0x4da6ff, green: 0x4dff88, yellow: 0xffd24d, pink: 0xff7ad9 };
const rules = (g, e, w) => [
  ...(g ? [{ test: isGreen, to: () => g }] : []), ...(e ? [{ test: isEarth, to: (h, s, l) => [e[0], e[1], e[2] + (l - 0.45) * 0.4] }] : []), ...(w ? [{ test: isWhite, to: () => w }] : []),
];
// Pro Welt: Boden-/Wandmodell, Umfärbung der Paletten, Himmel, Deko
const TH3 = {
  alley: {
    floor: 'p:block-grass', wall: 'p:block-snow', fr: null, wr: rules(null, null, [0.09, 0.55, 0.86]),
    sky: [0x4aa0ff, 0xd8efff], fog: 0xd8efff, liquid: null,
    ground: ['p:flowers', 'p:flowers-tall', 'p:mushrooms', 'p:plant', 'p:stones', 'p:rocks'], wallTop: ['p:tree', 'p:tree', 'p:hedge', 'p:fence-straight'], island: 'p:tree', big: ['i:building-d', 'i:building-h'],
  },
  sewer: {
    floor: 'p:block-grass', wall: 'p:block-grass', fr: rules([0.47, 0.5, 0.5], [0.4, 0.35, 0.3]), wr: rules([0.5, 0.35, 0.3], [0.42, 0.3, 0.2]),
    sky: [0x0f3b3b, 0x3aa384], fog: 0x2a7a64, liquid: 0x8cf06a,
    ground: ['p:mushrooms', 'p:plant', 'p:stones', 'p:rocks', 'f:fish-bones', 'f:banana'], wallTop: ['p:pipe', 'p:mushrooms', 'p:rocks', 'p:barrel'], island: 'p:mushrooms', big: [],
  },
  junk: {
    floor: 'p:block-grass', wall: 'p:block-grass', fr: rules([0.12, 0.7, 0.62], [0.07, 0.55, 0.4]), wr: rules([0.08, 0.5, 0.48], [0.05, 0.5, 0.28]),
    sky: [0xe9984a, 0xffe6a8], fog: 0xf6cd8a, liquid: 0x3a2a1a,
    ground: ['p:rocks', 'p:stones', 'f:bag-flat', 'f:can-open', 'f:soda-can-crushed', 'f:pizza-box'], wallTop: ['i:shipping-container-a', 'i:shipping-container-b', 'i:shipping-container-c', 'p:barrel', 'i:detail-tank'], island: 'i:chimney-medium', big: ['i:building-j', 'i:water-tower'],
  },
  factory: {
    floor: 'p:block-grass', wall: 'p:block-grass', fr: rules([0.6, 0.3, 0.62], [0.62, 0.35, 0.34]), wr: rules([0.13, 0.95, 0.55], [0.62, 0.4, 0.24]),
    sky: [0x121a3a, 0x4a5fa8], fog: 0x34437a, liquid: 0xff7a22,
    ground: ['p:stones', 'f:soda-can-crushed', 'f:can-small'], wallTop: ['i:chimney-medium', 'i:chimney-large', 'i:detail-tank', 'p:spike-block', 'p:saw'], island: 'i:chimney-large', big: ['i:building-m', 'i:building-p', 'i:windmill'],
  },
  winter: {
    floor: 'p:block-snow', wall: 'p:block-snow', fr: null, wr: rules(null, [0.58, 0.35, 0.55], [0.58, 0.18, 0.93]),
    sky: [0x7fb8f0, 0xf2f9ff], fog: 0xeaf4ff, liquid: null,
    ground: ['p:stones', 'p:rocks', 'p:plant'], wallTop: ['p:tree-pine-snow', 'p:tree-pine-snow', 'p:tree-snow', 'p:fence-low-straight'], island: 'p:tree-pine-snow', big: [],
  },
  grave: {
    floor: 'p:block-grass', wall: 'p:block-grass', fr: rules([0.76, 0.28, 0.4], [0.72, 0.18, 0.22]), wr: rules([0.74, 0.18, 0.26], [0.7, 0.15, 0.15]),
    sky: [0x1a1034, 0x6a4aa0], fog: 0x3a2a66, liquid: null,
    ground: ['g:gravestone-round', 'g:gravestone-cross', 'g:pumpkin', 'g:pumpkin-carved', 'g:rocks', 'g:debris', 'g:urn-round'], wallTop: ['g:pine-crooked', 'g:iron-fence', 'g:lightpost-single', 'g:crypt-small', 'g:pine'], island: 'g:crypt-small', big: [],
  },
};
// Gegner-Aussehen je Typ und Welt
const SKINS = {
  walker:  w => (['alley', 'sewer', 'winter'].includes(w) ? { fbx: 'Slime', s: 0.0026 } : { glb: 'g:character-zombie', s: 1.5 }),
  armor:   () => ({ glb: 'g:character-skeleton', s: 1.6, helmet: true }),
  archer:  () => ({ glb: 'g:character-skeleton', s: 1.6, bow: true }),
  flyer:   w => (w === 'grave' ? { glb: 'g:character-ghost', s: 1.5, float: true } : { fbx: 'Bat', s: 0.0021, float: true }),
  charger: () => ({ glb: 'g:character-vampire', s: 1.5 }),
  drake:   () => ({ fbx: 'Dragon', s: 0.0042, float: true }),
};

function nameSprite(name, css) {
  const cv = document.createElement('canvas'); cv.width = 320; cv.height = 80; const g = cv.getContext('2d');
  g.font = '44px "Lilita One", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const w = Math.min(300, g.measureText(name).width + 40);
  g.fillStyle = 'rgba(20,14,34,0.78)'; g.beginPath(); if (g.roundRect) g.roundRect(160 - w / 2, 6, w, 68, 30); else g.rect(160 - w / 2, 6, w, 68); g.fill();
  g.lineWidth = 5; g.strokeStyle = css; g.stroke();
  g.fillStyle = '#fff'; g.fillText(name, 160, 42);
  const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
  sp.scale.set(2.0, 0.5, 1); sp.renderOrder = 10; return sp;
}
// Saugdüse: Rucksack-Tank mit Schlauch und Trichter (zeigt in +Z)
function makeVacuum(css) {
  const col = new THREE.Color(css), M = (c, o) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
  const g = new THREE.Group();
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.42, 20), M(col)); tank.position.set(0, 0.55, -0.3); g.add(tank);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), M(col)); cap.position.set(0, 0.76, -0.3); g.add(cap);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 20), M(0xffffff)); band.position.set(0, 0.55, -0.3); g.add(band);
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.45, -0.32), new THREE.Vector3(0.28, 0.32, -0.15), new THREE.Vector3(0.26, 0.38, 0.18), new THREE.Vector3(0.1, 0.42, 0.36)]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.035, 8), M(0x3a3f4d)));
  const nz = new THREE.Group(); nz.position.set(0.1, 0.42, 0.34); g.add(nz);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 12), M(0x3a3f4d)); handle.rotation.x = Math.PI / 2; handle.position.z = 0.1; nz.add(handle);
  const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.08, 0.28, 28, 1, true), M(col, { side: THREE.DoubleSide, emissive: 0x000000 })); cone.rotation.x = Math.PI / 2; cone.position.z = 0.3; nz.add(cone);
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.065, 0.27, 28, 1, true), M(0x4a4560, { side: THREE.BackSide, emissive: 0x1a1830 })); inner.rotation.x = Math.PI / 2; inner.position.z = 0.3; nz.add(inner);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 10, 28), M(0xffffff)); ring.position.z = 0.44; nz.add(ring);
  g.userData = { cone, ring, nz }; return g;
}

function cloneMats(o) { if (o.material) o.material = Array.isArray(o.material) ? o.material.map(m => m.clone()) : o.material.clone(); }
function eachMat(o, fn) { if (!o.material) return; (Array.isArray(o.material) ? o.material : [o.material]).forEach(fn); }

// Gibt alle GPU-Ressourcen einer Szene frei (verhindert Speicherwachstum zwischen Leveln)
function disposeScene(scene) {
  scene.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { for (const k in m) { const t = m[k]; if (t && t.isTexture) t.dispose(); } m.dispose(); });
  });
  if (scene.background && scene.background.isTexture) scene.background.dispose();
}

class View3D {
  constructor(scene) {
    this.s = scene; this.th = TH3[scene.theme];
    THREE.ColorManagement.legacyMode = false;
    document.getElementById('three').style.display = 'block';
    this.r = sharedRenderer(); this.scene = new THREE.Scene();
    this.cam = new THREE.PerspectiveCamera(40, W / H, 0.5, 220);
    this.mats = {}; this.map = new Map(); this.parts = []; this.shakeT = 0; this.shakeI = 0; this.dying = [];
    this.cx = scene.p[0].x / T; this.cz = scene.p[0].y / T; this.ch = 11.5;
    this.rnd = (() => { let q = 11 + scene.lv * 37; return () => (q = (q * 1664525 + 1013904223) % 4294967296) / 4294967296; })();
    this.build();
  }
  // ── Helfer ──
  M(c, o = {}) { const k = c + JSON.stringify(o); return this.mats[k] || (this.mats[k] = new THREE.MeshLambertMaterial(Object.assign({ color: c }, o))); }
  mesh(geo, c, o) { return new THREE.Mesh(geo, this.M(c, o)); }
  box(w, h, d, c, o) { return this.mesh(new THREE.BoxGeometry(w, h, d), c, o); }
  cyl(rt, rb, h, c, seg = 20, o) { return this.mesh(new THREE.CylinderGeometry(rt, rb, h, seg), c, o); }
  sph(r, c, o, sx = 1, sy = 1, sz = 1) { const m = this.mesh(new THREE.SphereGeometry(r, 18, 12), c, o); m.scale.set(sx, sy, sz); return m; }
  cone(r, h, c, seg = 16) { return this.mesh(new THREE.ConeGeometry(r, h, seg), c); }
  place(m, x, y, z, parent) { m.position.set(x, y, z); if (parent) parent.add(m); return m; }
  blob(r) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: A3.shadowTex, transparent: true, depthWrite: false, opacity: 0.6 }));
    m.rotation.x = -Math.PI / 2; m.position.y = 0.03; return m;
  }
  skyTexture(c1, c2) {
    const cv = document.createElement('canvas'); cv.width = 2; cv.height = 256; const g = cv.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#' + c1.toString(16).padStart(6, '0')); gr.addColorStop(1, '#' + c2.toString(16).padStart(6, '0'));
    g.fillStyle = gr; g.fillRect(0, 0, 2, 256); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; return t;
  }
  eyes(g, y, z, spread, r = 0.12) {
    for (const sx of [-1, 1]) {
      this.place(this.sph(r, 0xffffff), sx * spread, y, z, g); this.place(this.sph(r * 0.55, 0x16101f), sx * spread, y, z + r * 0.8, g);
      const brow = this.box(r * 2, r * 0.35, r * 0.4, 0x16101f); brow.rotation.z = -sx * 0.4; this.place(brow, sx * spread, y + r * 1.4, z + r * 0.4, g);
    }
  }
  // Instanced-Darstellung eines Modells an vielen Stellen
  inst(key, list, material) {
    if (!list.length) return;
    const d = new THREE.Object3D();
    for (const part of a3parts(key)) {
      const im = new THREE.InstancedMesh(part.geo, material || part.mat, list.length);
      list.forEach((o, i) => { d.position.set(o.x, o.y, o.z); d.rotation.set(0, o.ry || 0, 0); d.scale.set(o.sx || o.s || 1, o.sy || o.s || 1, o.sz || o.s || 1); d.updateMatrix(); im.setMatrixAt(i, d.matrix); });
      im.instanceMatrix.needsUpdate = true; this.scene.add(im);
    }
  }
  themed(model, ruleSet) {
    const tex = ruleSet ? recolorTexture(A3.imgs.platformer, ruleSet) : (() => { const t = new THREE.CanvasTexture(A3.imgs.platformer); t.flipY = false; t.encoding = THREE.sRGBEncoding; return t; })();
    return new THREE.MeshLambertMaterial({ map: tex });
  }

  // ───────────────────────── Statische Welt ─────────────────────────
  build() {
    const s = this.s, th = this.th, sc = this.scene, rnd = this.rnd;
    sc.background = this.skyTexture(th.sky[0], th.sky[1]); sc.fog = new THREE.Fog(th.fog, 30, 95);
    sc.add(new THREE.HemisphereLight(0xffffff, 0xb0a4d8, 0.9));
    const sun = new THREE.DirectionalLight(0xffffff, 0.8); sun.position.set(-6, 14, 9); sc.add(sun);

    const floors = [], walls = [];
    const near = (x, y) => { for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) if (s.at(x + i, y + j) !== 0) return true; return false; };
    for (let y = 0; y < s.gh; y++) for (let x = 0; x < s.gw; x++) { const v = s.grid[y][x]; if (v === 1) floors.push([x, y]); else if (v === 0 && near(x, y)) walls.push([x, y]); }
    // Boden & Wände aus Kenney-Blöcken
    const fm = this.themed(th.floor, th.fr), wm = this.themed(th.wall, th.wr), SC = 1.045;
    this.inst(th.floor, floors.map(([x, y]) => ({ x: x + 0.5, y: -1, z: y + 0.5, s: SC })), fm);
    this.inst(th.wall, walls.map(([x, y]) => ({ x: x + 0.5, y: 0, z: y + 0.5, sx: SC, sy: 1.25, sz: SC })), wm);

    // Deko
    const occ = new Set(); const mark = (px, py) => occ.add(Math.floor(px / T) + ',' + Math.floor(py / T));
    [s.coinsA, s.pickups, s.crateList, s.targets, s.plates, s.cps, s.enemyList].forEach(l => l.forEach(o => mark(o.x, o.y)));
    s.signs.forEach(sg => mark(sg.s.x, sg.s.y)); s.p.forEach(p => { for (const dx of [-1, 0, 1]) for (const dy of [-1, 0, 1]) mark(p.x + dx * T, p.y + dy * T); });
    const lists = {}; const add = (key, o) => (lists[key] = lists[key] || []).push(o);
    floors.forEach(([x, y]) => { if (occ.has(x + ',' + y) || rnd() > 0.07) return; const k = th.ground[Math.floor(rnd() * th.ground.length)]; add(k, { x: x + 0.15 + rnd() * 0.7, y: 0, z: y + 0.15 + rnd() * 0.7, ry: rnd() * 6.28, s: k[0] === 'f' ? 1.5 : 1.7 }); });
    walls.forEach(([x, y]) => {
      if (rnd() > 0.45) return; const k = th.wallTop[Math.floor(rnd() * th.wallTop.length)];
      const big = /container|chimney|tank|crypt/.test(k), sz = big ? 1.1 : (/tree|pine/.test(k) ? 1.6 : 1.8);
      add(k, { x: x + 0.5, y: 1.25, z: y + 0.5, ry: Math.floor(rnd() * 4) * Math.PI / 2, s: sz });
    });
    for (const k in lists) this.inst(k, lists[k]);
    // Schwebende Mini-Inseln & Wolken im Hintergrund
    const W_ = s.gw, H_ = s.gh, islands = [], clouds = [], bigs = [], props = [];
    for (let i = 0; i < 16; i++) {
      const ang = rnd() * 6.28, rad = 0.62 + rnd() * 0.5, x = W_ / 2 + Math.cos(ang) * W_ * rad * 0.75 + (rnd() - 0.5) * 8, z = H_ / 2 + Math.sin(ang) * H_ * rad * 1.1 + (rnd() - 0.5) * 8;
      if (x > -4 && x < W_ + 4 && z > -4 && z < H_ + 4) continue;
      const y = -3 - rnd() * 7, sc_ = 1.4 + rnd() * 1.8;
      islands.push({ x, y: y - 1, z, s: sc_, ry: rnd() * 6 }); props.push({ x, y, z, s: 2.2 + rnd() * 1.2, ry: rnd() * 6 });
      if (th.big.length && rnd() < 0.35) bigs.push({ k: th.big[Math.floor(rnd() * th.big.length)], x: x + (rnd() - 0.5) * 3, y, z: z + 2, s: 1.6 });
    }
    this.inst('p:block-grass-large', islands, fm); this.inst(th.island, props);
    for (const b of bigs) this.inst(b.k, [{ x: b.x, y: b.y, z: b.z, s: b.s }]);
    const nc = th.liquid ? 6 : 30;
    for (let i = 0; i < nc; i++) clouds.push({ x: rnd() * (W_ + 40) - 20, y: -9 - rnd() * 8, z: rnd() * (H_ + 40) - 20, s: 3 + rnd() * 4, ry: rnd() * 6 });
    this.inst('s:cloud', clouds, new THREE.MeshLambertMaterial({ color: 0xffffff }));
    if (th.liquid) {
      const liq = this.mesh(new THREE.PlaneGeometry(s.gw + 80, s.gh + 80), th.liquid, { emissive: th.liquid, emissiveIntensity: 0.55 });
      liq.rotation.x = -Math.PI / 2; liq.position.set(s.gw / 2, -1.6, s.gh / 2); sc.add(liq); this.liq = liq;
    }
    this.buildObjects();
    this.pm = s.p.map((p, i) => this.makePlayer(i));
    this.chain = []; for (let i = 0; i < 70; i++) { const m = this.sph(0.09, 0xdfe3ea); m.visible = false; sc.add(m); this.chain.push(m); }
    this.dots = []; for (let i = 0; i < 16; i++) { const m = this.sph(0.09, 0xffffff, { emissive: 0xffffff }); m.visible = false; sc.add(m); this.dots.push(m); }
    this.ringM = [0, 1].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.55, 28), new THREE.MeshBasicMaterial({ color: 0x7dff8a, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })); m.rotation.x = -Math.PI / 2; m.position.y = 0.06; m.visible = false; sc.add(m); return m; });
    this.sdots = [0, 1].map(() => Array.from({ length: 8 }, () => { const m = this.sph(0.06, 0xffffff, { emissive: 0xffffff }); m.visible = false; sc.add(m); return m; }));
    this.zonePool = []; this.ringPool = []; this.bombPool = [];
  }

  buildObjects() {
    const s = this.s, sc = this.scene, T1 = T;
    for (const f of s.cps) { const m = a3clone('p:flag', 1.9); m.position.set(f.cx / T1, 0, f.cy / T1 + 0.3); sc.add(m); f.m3 = m; }
    for (const sg of s.signs) { const m = a3clone('p:sign', 1.9); m.position.set(sg.s.x / T1, 0, sg.s.y / T1 - 0.1); sc.add(m); }
    for (const sp of s.spikesA) {
      const cx = Math.round(sp.displayWidth / T), cy = Math.round(sp.displayHeight / T), list = [];
      for (let i = 0; i < cx; i++) for (let j = 0; j < cy; j++) list.push({ x: sp.x / T + i + 0.5, y: 0, z: sp.y / T + j + 0.5, s: 1.4 });
      this.inst('p:trap-spikes-large', list);
    }
    for (const cv of s.convs) {
      const cvn = document.createElement('canvas'); cvn.width = 64; cvn.height = 64; const g = cvn.getContext('2d');
      g.fillStyle = '#4a505e'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#ffc83d';
      g.beginPath(); g.moveTo(12, 14); g.lineTo(34, 32); g.lineTo(12, 50); g.lineTo(24, 50); g.lineTo(46, 32); g.lineTo(24, 14); g.fill();
      g.strokeStyle = '#2a2d36'; g.lineWidth = 6; g.strokeRect(0, 0, 64, 64);
      const tx = new THREE.CanvasTexture(cvn); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(cv.r.width / T, cv.r.height / T); tx.encoding = THREE.sRGBEncoding;
      if (cv.d < 0) tx.repeat.x *= -1;
      const m = new THREE.Mesh(new THREE.BoxGeometry(cv.r.width / T, 0.16, cv.r.height / T), [this.M(0x2a2d36), this.M(0x2a2d36), new THREE.MeshLambertMaterial({ map: tx }), this.M(0x2a2d36), this.M(0x2a2d36), this.M(0x2a2d36)]);
      m.position.set((cv.r.x + cv.r.width / 2) / T, 0.08, (cv.r.y + cv.r.height / 2) / T); sc.add(m); cv.tx = tx;
    }
    for (const r of s.icesA) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(r.width / T, r.height / T), new THREE.MeshLambertMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.5, emissive: 0x2a5a7a }));
      m.rotation.x = -Math.PI / 2; m.position.set((r.x + r.width / 2) / T, 0.04, (r.y + r.height / 2) / T); sc.add(m);
    }
    for (const sp of s.springsA) { const m = a3clone('p:spring', 1.7); m.position.set(sp.x / T1, 0, sp.y / T1); sc.add(m); sp.m3 = m; }
    for (const sp of s.spawners) { const m = a3clone('g:gravestone-cross', 1.9); m.position.set(sp.x / T1, 0, sp.y / T1); sc.add(m); sp.m3 = m; }
    for (const isl of s.islands) { const lab = nameSprite('+' + isl.pts, '#ffd23f'); lab.position.set(isl.cx / T1, 1.6, isl.cy / T1); lab.scale.set(2.4, 0.6, 1); sc.add(lab); }
    for (const l of s.lasers) {
      const r = l.r, cx = (r.x + r.w / 2) / T, cz = (r.y + r.h / 2) / T;
      for (const e of (l.dir === 'h' ? [[r.x / T, cz], [(r.x + r.w) / T, cz]] : [[cx, r.y / T], [cx, (r.y + r.h) / T]])) { this.place(this.cyl(0.22, 0.28, 0.9, 0x555d6e), e[0], 0.45, e[1], sc); this.place(this.sph(0.16, 0xff4a4a, { emissive: 0xff2020 }), e[0], 1.0, e[1], sc); }
      const beam = this.box(l.dir === 'h' ? r.w / T : 0.14, 0.14, l.dir === 'h' ? 0.14 : r.h / T, 0xff3a3a, { emissive: 0xff2020 });
      beam.position.set(cx, 0.55, cz); sc.add(beam); l.m3 = beam;
    }
    for (const c of s.crushers) {
      const g = new THREE.Group(); const sb = a3clone('p:spike-block', 2.2); g.add(sb);
      g.position.set((c.x + T) / T, 40, (c.y + T) / T); sc.add(g); c.m3 = g;
      const warn = this.mesh(new THREE.PlaneGeometry(2, 2), 0xff3a2e, { transparent: true, opacity: 0.4 }); warn.rotation.x = -Math.PI / 2; warn.position.set((c.x + T) / T, 0.05, (c.y + T) / T); warn.visible = false; sc.add(warn); c.w3 = warn;
    }
    for (const t of s.targets) {
      const g = new THREE.Group(); this.place(this.cyl(0.07, 0.07, 1.1, 0x8a8a98), 0, 0.55, 0, g);
      const disc = new THREE.Group(); disc.rotation.x = Math.PI / 2; const col = GATE3[t.color];
      t.rings = [this.cyl(0.46, 0.46, 0.1, 0xdddddd), this.cyl(0.33, 0.33, 0.12, 0x8a8a98), this.cyl(0.18, 0.18, 0.14, 0x6a6a78)];
      t.rings.forEach(r => disc.add(r)); this.place(disc, 0, 1.25, 0.05, g);
      g.position.set(t.x / T, 0, (t.y - 6) / T); g.userData.col = col; sc.add(g); t.m3 = g;
    }
    for (const p of s.plates) { const m = this.cyl(0.5, 0.55, 0.12, GATE3[p.color]); m.position.set(p.x / T, 0.06, p.y / T); sc.add(m); p.m3 = m; }
    for (const g of s.gates) {
      const w = g.displayWidth / T, h = g.displayHeight / T, grp = new THREE.Group();
      const n = Math.max(3, Math.round(Math.max(w, h) * 3));
      for (let i = 0; i < n; i++) { const bar = this.box(0.12, 1.7, 0.12, 0xf2f2f2); bar.position.set(w >= h ? (i + 0.5) / n * w : w / 2, 0.85, w >= h ? h / 2 : (i + 0.5) / n * h); grp.add(bar); }
      grp.add(this.place(this.box(w, 0.14, h, g.tintTopLeft), w / 2, 1.75, h / 2)); grp.add(this.place(this.box(w, 0.14, h, g.tintTopLeft), w / 2, 0.07, h / 2));
      const lk = a3clone('p:lock', 2.4); lk.position.set(w / 2, 0.9, h / 2); grp.add(lk);
      grp.position.set(g.x / T, 0, g.y / T); sc.add(grp); g.m3 = grp;
    }
    for (const b of s.bridges) {
      const grp = new THREE.Group(), w = b.v.width / T, h = b.v.height / T;
      for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) { const pl = this.box(0.96, 0.18, 0.96, 0xb98a52, { transparent: true, opacity: 1 }); pl.material = pl.material.clone(); this.place(pl, i + 0.5, -0.09, j + 0.5, grp); }
      grp.position.set(b.v.x / T, 0, b.v.y / T); sc.add(grp); b.m3 = grp;
    }
    for (const m of s.moversA) {
      const w = m.w / T, h = m.h / T, g = new THREE.Group();
      for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) { const bm = a3clone('p:block-moving', 1.0); bm.position.set(i + 0.5, -0.3, j + 0.5); g.add(bm); }
      sc.add(g); m.m3 = g;
    }
    if (s.exitSpr) {
      const g = new THREE.Group(); this.place(this.cyl(0.85, 0.95, 1.5, 0x4a8f5a), 0, 0.75, 0, g); this.place(this.cyl(0.95, 0.95, 0.2, 0xffd23f), 0, 1.55, 0, g);
      this.exitDisc = this.place(this.cyl(0.62, 0.62, 0.06, 0xff4a4a, 24, { emissive: 0xaa2020 }), 0, 1.66, 0, g);
      const st = a3clone('p:star', 3); st.position.y = 2.3; g.add(st); this.exitStar = st;
      g.position.set(s.exitPos.x / T, 0, (s.exitPos.y + 20) / T); sc.add(g); this.exit = g;
    }
    if (s.lockGate) {
      const g = s.lockGate, grp = new THREE.Group(), h = g.displayHeight / T;
      for (let i = 0; i < h * 3; i++) this.place(this.box(0.14, 1.9, 0.14, 0xff4d4d, { emissive: 0x801010 }), 0.5, 0.95, (i + 0.5) / 3, grp);
      grp.position.set(g.x / T, 0, g.y / T); grp.visible = false; sc.add(grp); this.lock = grp;
    }
  }

  // ───────────────────────── Figuren ─────────────────────────
  makePlayer(i) {
    const cfg = Cfg.players[i], col = PLAYER_COLORS.find(c => c.id === cfg.color) || PLAYER_COLORS[2];
    const root = new THREE.Group(), yawG = new THREE.Group(); root.add(yawG);
    const model = makePlayerModel(cfg.color, 'p:character-oobi', 1.25); yawG.add(model);
    const mixer = new THREE.AnimationMixer(model), acts = {};
    a3anims('p:character-oobi').forEach(a => { acts[a.name] = mixer.clipAction(a); });
    const vac = makeVacuum(col.css); vac.scale.setScalar(1.05); yawG.add(vac);
    const label = nameSprite(cfg.name, col.css); label.position.set(0, 2.05, 0); root.add(label);
    const sh = this.blob(0.62); this.scene.add(sh); this.scene.add(root);
    return { root, yawG, model, mixer, acts, cur: null, vac, label, sh, yaw: 0, col };
  }
  anim(pm, name, fade = 0.15) { const a = pm.acts[name]; if (!a || pm.cur === name) return; const o = pm.acts[pm.cur]; a.reset().play(); if (o) a.crossFadeFrom(o, fade, false); pm.cur = name; }
  enemyMesh(e) {
    const t = e.type;
    if (t === 'turret') {
      const g = new THREE.Group();
      this.place(this.cyl(0.42, 0.5, 0.28, 0x555d6e), 0, 0.14, 0, g);
      const top = new THREE.Group(); this.place(this.cyl(0.3, 0.34, 0.5, 0xd35a5a), 0, 0.52, 0, top);
      this.place(this.cyl(0.1, 0.13, 0.5, 0x888fa0), 0, 0.58, 0.4, top).rotation.x = Math.PI / 2; this.eyes(top, 0.62, 0.28, 0.12, 0.09);
      this.place(this.sph(0.12, 0xff4a4a, { emissive: 0xaa2020 }), 0, 0.88, 0, top); g.add(top); g.userData.top = top; g.scale.setScalar(1.25); return { root: g, sk: {} };
    }
    const sk = (SKINS[t] || SKINS.walker)(this.s.theme), root = new THREE.Group(); let obj, clips = [];
    if (sk.fbx) { obj = THREE.SkeletonUtils.clone(A3.fbx[sk.fbx]); obj.scale.setScalar(sk.s); clips = A3.fbx[sk.fbx].animations; }
    else { obj = a3clone(sk.glb, sk.s); clips = a3anims(sk.glb); }
    obj.traverse(n => { if (n.isMesh) { n.frustumCulled = false; cloneMats(n); } });
    root.add(obj);
    if (sk.helmet) { const hm = a3clone('p:barrel', 1.05); hm.position.set(0, 0.5, 0); hm.rotation.x = Math.PI; root.add(hm); }
    if (sk.bow) { const b = this.mesh(new THREE.TorusGeometry(0.28, 0.025, 6, 14, Math.PI), 0x8a5a2e); b.position.set(0.25, 0.4, 0.3); b.rotation.y = Math.PI / 2; root.add(b); }
    const mixer = new THREE.AnimationMixer(obj), acts = {};
    clips.forEach(c => { acts[c.name.split('|').pop().toLowerCase()] = mixer.clipAction(c); });
    return { root, obj, mixer, acts, cur: null, sk };
  }
  eAnim(m, ...names) {
    for (const n of names) { const key = Object.keys(m.acts).find(k => k === n || k.endsWith('_' + n)); if (key) { const a = m.acts[key]; if (m.cur !== key) { const o = m.acts[m.cur]; a.reset().play(); if (o) a.crossFadeFrom(o, 0.15, false); m.cur = key; } return; } }
  }
  bossMesh(b) {
    const g = new THREE.Group(), k = b.kind;
    const fbxBoss = (name, sc_) => { const o = THREE.SkeletonUtils.clone(A3.fbx[name]); o.scale.setScalar(sc_); o.traverse(n => { if (n.isMesh) { cloneMats(n); n.frustumCulled = false; } }); g.add(o); g.userData.obj = o; const mx = new THREE.AnimationMixer(o); g.userData.mixer = mx; g.userData.acts = {}; A3.fbx[name].animations.forEach(c => g.userData.acts[c.name.split('|').pop().toLowerCase()] = mx.clipAction(c)); };
    if (k === 'can') {
      this.place(this.cyl(0.95, 0.9, 1.9, 0x8a97a6), 0, 0.95, 0, g);
      for (const y of [0.35, 1.5]) this.place(this.cyl(0.97, 0.97, 0.08, 0x6f7c8a), 0, y, 0, g);
      g.userData.lid = this.place(this.cyl(1.02, 1.02, 0.22, 0xaebbc9), 0, 2.0, 0, g); this.place(this.cyl(0.25, 0.25, 0.14, 0x6f7c8a), 0, 2.2, 0, g);
      this.eyes(g, 1.35, 0.88, 0.38, 0.24); this.place(this.box(0.9, 0.28, 0.1, 0x2a1d2a), 0, 0.8, 0.9, g);
      for (let i = 0; i < 5; i++) this.place(this.box(0.1, 0.12, 0.06, 0xffffff), -0.36 + i * 0.18, 0.9, 0.95, g);
      for (const sx of [-1, 1]) this.place(this.cyl(0.05, 0.05, 0.9, 0x6f7c8a), sx * 0.7, 1.0, 0.7, g);
      const fl = a3clone('f:banana', 3); fl.position.set(0.7, 2.15, 0.1); g.add(fl);
    } else if (k === 'slime') {
      fbxBoss('Slime', 0.0095); this.place(this.cone(0.35, 0.55, 0xffd23f, 5), 0, 2.1, 0, g);
    } else if (k === 'digger') {
      for (const sx of [-1, 1]) { this.place(this.box(0.55, 0.55, 2.8, 0x4a4f5c), sx * 0.9, 0.3, 0, g); for (let i = 0; i < 4; i++) this.place(this.cyl(0.24, 0.24, 0.6, 0x8b94a8), sx * 0.9, 0.3, -1.0 + i * 0.66, g).rotation.z = Math.PI / 2; }
      this.place(this.box(1.9, 0.9, 2.2, 0xffc22e), 0, 0.95, 0, g); this.place(this.box(1.5, 0.8, 1.0, 0xbfe6ff, { transparent: true, opacity: 0.85 }), 0, 1.7, -0.3, g);
      this.eyes(g, 1.75, 0.25, 0.36, 0.2); this.place(this.box(0.25, 0.25, 1.6, 0xe6a21a), 0, 1.1, 1.6, g);
      const saw = a3clone('p:saw', 3.4); saw.position.set(0, 0.85, 2.7); saw.rotation.y = Math.PI / 2; g.add(saw); g.userData.saw = saw;
    } else if (k === 'mech') {
      this.place(this.sph(1.15, 0x8b94a8, {}, 1.05, 1.2, 1), 0, 0, 0, g);
      this.place(this.sph(0.95, 0xbfe6ff, { transparent: true, opacity: 0.55 }), 0, 1.0, 0.1, g);
      const dr = a3clone('p:character-ooli', 0.95); dr.position.set(0, 0.35, 0.1); g.add(dr); g.userData.mixer = new THREE.AnimationMixer(dr); const ac = a3anims('p:character-ooli').find(a => a.name === 'idle'); if (ac) g.userData.mixer.clipAction(ac).play();
      for (const sx of [-1, 1]) { this.place(this.box(0.5, 0.45, 1.1, 0x2f3647), sx * 1.5, 0, 0.3, g); this.place(this.cyl(0.12, 0.12, 0.5, 0x555d6e), sx * 1.5, 0, 0.95, g).rotation.x = Math.PI / 2; }
      this.place(this.cyl(0.6, 0.35, 0.3, 0xffc83d, 16, { emissive: 0xaa7a10 }), 0, -1.2, 0, g);
    } else if (k === 'dragon') {
      fbxBoss('Dragon', 0.0105);
    } else if (k === 'keeper') {
      const o = a3clone('g:character-keeper', 3.4); g.add(o); g.userData.obj = o;
      const mx = new THREE.AnimationMixer(o); g.userData.mixer = mx; g.userData.acts = {}; a3anims('g:character-keeper').forEach(c => g.userData.acts[c.name] = mx.clipAction(c));
      const lan = a3clone('g:lantern-candle', 3.2); lan.position.set(1.2, 1.2, 0.6); g.add(lan);
    }
    return g;
  }
  flash(obj, white, red) {
    const st = white ? 1 : red ? 2 : 0; if (obj.userData.fl === st) return; obj.userData.fl = st;
    obj.traverse(o => { if (o.isMesh) { if (!o.userData.mat) { cloneMats(o); o.userData.mat = true; } eachMat(o, m => { if (m.emissive) m.emissive.setHex(st === 1 ? 0xffffff : st === 2 ? 0x882222 : 0x000000); }); } });
  }
  foodFor(key, x, y) { const L = ['f:can-open', 'f:banana', 'f:pizza-box', 'f:fish-bones', 'f:soda-can-crushed', 'f:apple', 'f:bag-flat', 'f:plate-broken']; const n = (+key.slice(-1) + Math.floor(x / 48 + y / 48)) % L.length; return L[(n + L.length) % L.length]; }

  // ───────────────────────── Update ─────────────────────────
  update(dt, time) {
    const s = this.s, sc = this.scene, T1 = T;
    s.p.forEach((p, i) => {
      const pm = this.pm[i], root = pm.root, h = (p.z || 0) / T1;
      root.visible = p.state !== 'held'; pm.sh.visible = p.state === 'normal';
      const fall = p.state === 'falling' ? Math.max(0.05, p.fallT / 0.6) : 1;
      root.position.set(p.x / T1, h - (p.state === 'falling' ? (0.6 - p.fallT) * 2.5 : 0), p.y / T1); root.scale.setScalar(fall);
      const target = Math.atan2(p.aim.x, p.aim.y); let d = target - pm.yaw; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; pm.yaw += d * Math.min(1, dt * 14);
      pm.yawG.rotation.y = pm.yaw;
      pm.model.rotation.x = p.fly ? (time / 140) % (Math.PI * 2) : 0;
      const spd = Math.hypot(p.body.velocity.x, p.body.velocity.y), hurt = time < p.lockUntil && !p.fly && !p.hop;
      let a = 'idle';
      if (p.state === 'falling') a = 'fall'; else if (p.fly || p.hop) a = 'jump'; else if (hurt) a = 'crouch';
      else if (p.holding) a = 'holding-both'; else if (time < p.shootCd - 80 && time > p.shootCd - 260) a = 'holding-both-shoot';
      else if (p.sucking) a = spd > 40 ? 'walk' : 'holding-both'; else if (spd > 180) a = 'sprint'; else if (spd > 30) a = 'walk';
      this.anim(pm, a); pm.mixer.update(dt * (a === 'walk' ? Math.max(0.7, spd / 150) : a === 'sprint' ? 1.1 : 1));
      pm.sh.position.set(p.x / T1, 0.03, p.y / T1); pm.sh.material.opacity = Math.max(0.15, 0.6 - h * 0.25);
      pm.model.visible = !(time < p.inv && Math.floor(time / 70) % 2);
      const u = pm.vac.userData; u.ring.scale.setScalar(p.sucking ? 1 + Math.sin(time / 60) * 0.12 : 1); u.cone.material.emissive.setHex(p.sucking ? 0x335577 : 0x000000);
      pm.vac.visible = !p.fly;
    });
    // Gegner
    const alive = new Set();
    for (const e of s.enemyList) {
      if (!e.active) continue; alive.add(e);
      let m = this.map.get(e); if (!m) { m = this.enemyMesh(e); sc.add(m.root); m.sh = this.blob(0.6); sc.add(m.sh); this.map.set(e, m); }
      const h = (e.z || 0) / T1;
      m.root.position.set(e.x / T1, h, e.y / T1); m.sh.position.set(e.x / T1, 0.03, e.y / T1); m.sh.material.opacity = h > 0.5 ? 0.3 : 0.6;
      const v = e.body.velocity, pn = s.nearest(e.x, e.y), still = Math.hypot(v.x, v.y) < 12;
      const tgt = e.cfg.still || still ? Math.atan2(pn.x - e.x, pn.y - e.y) : Math.atan2(v.x, v.y);
      m.yaw = m.yaw === undefined ? tgt : m.yaw; let d = tgt - m.yaw; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; m.yaw += d * Math.min(1, dt * 8);
      if (e.cfg.still) { m.root.userData.top.rotation.y = m.yaw; continue; }
      m.root.rotation.y = m.yaw + (m.sk.fbx ? Math.PI : 0);
      const atk = e.st === 'wind' || e.st === 'dash';
      this.eAnim(m, atk ? 'attack' : (!still ? (e.type === 'charger' ? 'sprint' : 'walk') : 'idle'), 'flying', 'running', 'idle');
      if (m.sk.fbx === 'Bat' || m.sk.fbx === 'Dragon') this.eAnim(m, 'flying');
      m.mixer.update(dt);
      this.flash(m.root, e.vis.isTinted && e.vis.tintFill, e.vis.isTinted && !e.vis.tintFill);
      if (e.gold && !m.goldDone) { m.goldDone = true; m.root.traverse(o => { if (o.isMesh) eachMat(o, q => { if (q.color) q.color.set(0xffd23f); if (q.emissive) q.emissive.set(0x886600); }); }); }
    }
    for (const [k, m] of this.map) if (k.type && k.cfg && !alive.has(k)) { m.dying = time; this.dying.push(m); this.map.delete(k); }
    for (let i = this.dying.length - 1; i >= 0; i--) {
      const m = this.dying[i], age = (time - m.dying) / 450;
      if (age >= 1) { sc.remove(m.root); sc.remove(m.sh); this.dying.splice(i, 1); continue; }
      m.root.scale.setScalar(Math.max(0.05, 1 - age)); m.root.position.y += dt * 1.5; m.root.rotation.y += dt * 12; if (m.sh) m.sh.material.opacity *= 0.9;
    }
    this.syncBoss(dt, time);
    this.syncProps(dt, time);
    this.drawHazards3d(time); this.drawChain(time); this.drawAim(time, dt); this.stepParts(dt); this.updateCamera(dt, time);
    this.r.render(sc, this.cam);
  }
  syncBoss(dt, time) {
    const s = this.s, bo = s.bossObj, sc = this.scene, T1 = T; if (!bo) return;
    if (!bo.m3) { bo.m3 = this.bossMesh(bo); sc.add(bo.m3); bo.sh3 = this.blob(1.8); sc.add(bo.sh3); if (bo.kind === 'mech') { bo.shield3 = this.sph(1.9, 0x66e6ff, { transparent: true, opacity: 0.25, emissive: 0x2288aa }); sc.add(bo.shield3); } }
    const sp = bo.spr, h = (sp.z || 0) / T1 + (bo.kind === 'mech' ? 0.6 : 0), g = bo.m3, ud = g.userData;
    g.visible = !bo.dead || sp.vis.visible; g.position.set(sp.x / T1, h, sp.y / T1); bo.sh3.position.set(sp.x / T1, 0.03, sp.y / T1);
    if (ud.mixer) ud.mixer.update(dt);
    const play = (...ns) => { if (!ud.acts) return; for (const n of ns) { const k = Object.keys(ud.acts).find(q => q === n || q.endsWith('_' + n)); if (k) { if (ud.cur !== k) { const o = ud.acts[ud.cur]; ud.acts[k].reset().play(); if (o) ud.acts[k].crossFadeFrom(o, 0.2, false); ud.cur = k; } return; } } };
    if (bo.kind === 'can') { g.rotation.y = sp.vis.flipX ? 0.5 : -0.5; ud.lid.rotation.z = bo.st === 'stun' ? 0.5 : 0; }
    else if (bo.kind === 'slime') { g.rotation.y = (sp.vis.flipX ? 0.4 : -0.4); play(bo.st === 'open' ? 'attack' : 'idle'); g.scale.y = 1 + Math.sin(time / 200) * 0.04; }
    else if (bo.kind === 'digger') { const dr = bo.dir || { x: sp.vis.flipX ? -1 : 1, y: 0 }, tg = Math.atan2(dr.x, dr.y); bo.yaw = bo.yaw === undefined ? tg : bo.yaw; let d = tg - bo.yaw; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; bo.yaw += d * Math.min(1, dt * 6); g.rotation.y = bo.yaw; ud.saw.rotation.x += dt * (bo.st === 'charge' ? 22 : 6); }
    else if (bo.kind === 'mech') { g.rotation.y = Math.sin(time / 700) * 0.3; bo.shield3.position.copy(g.position); bo.shield3.visible = bo.started && !bo.dead && !bo.vuln; bo.shield3.scale.setScalar(1 + Math.sin(time / 120) * 0.03); }
    else if (bo.kind === 'dragon') { const dr = s.nearest(sp.x, sp.y); g.rotation.y = Math.atan2(dr.x - sp.x, dr.y - sp.y) + Math.PI; play(bo.st === 'breath' || bo.st === 'dive' ? 'attack' : 'flying'); }
    else if (bo.kind === 'keeper') { const dr = s.nearest(sp.x, sp.y); g.rotation.y = Math.atan2(dr.x - sp.x, dr.y - sp.y); play(bo.st === 'slam' || bo.st === 'swing' ? 'attack-melee-right' : (bo.st === 'stun' ? 'die' : (bo.st === 'chase' ? 'walk' : 'idle'))); }
    this.flash(g, sp.vis.isTinted && sp.vis.tintFill, false);
    if (bo.vuln && !bo.dead && !(sp.vis.isTinted && sp.vis.tintFill)) { g.userData.fl = -1; g.traverse(o => { if (o.isMesh) { if (!o.userData.mat) { cloneMats(o); o.userData.mat = true; } eachMat(o, m => { if (m.emissive) m.emissive.setHex(Math.floor(time / 180) % 2 ? 0x665500 : 0x222200); }); } }); }
    if (bo.dead && !sp.vis.visible) { g.visible = false; bo.sh3.visible = false; if (bo.shield3) bo.shield3.visible = false; }
    if (bo.dead) g.scale.setScalar(Math.max(0.01, sp.vis.scaleX));
  }
  syncProps(dt, time) {
    const s = this.s, sc = this.scene, T1 = T, seen = new Set();
    for (const grp of [s.shotG, s.eshotG]) for (const e of grp.getChildren()) {
      if (!e.active) continue; seen.add(e);
      let m = this.map.get(e);
      if (!m) {
        let o; const kind = e.kind || 'goo';
        if (grp === s.shotG) o = a3clone(this.foodFor(e.vis.texture.key, e.x, e.y), 1.4);
        else if (kind === 'fire') o = this.sph(0.26, 0xff8a2e, { emissive: 0xff5a10 });
        else if (kind === 'arrow') { o = new THREE.Group(); const sh = this.cyl(0.03, 0.03, 0.7, 0xcaa46a); sh.rotation.x = Math.PI / 2; o.add(sh); this.place(this.cone(0.07, 0.18, 0xdde3ea, 8), 0, 0, 0.42, o).rotation.x = Math.PI / 2; }
        else if (kind === 'bomb') o = a3clone('p:bomb', 1.4); else if (kind === 'red') o = this.sph(0.2, 0xff6a6a, { emissive: 0xaa2020 }); else o = this.sph(0.18, 0x8cf06a, { emissive: 0x2a8a20 });
        sc.add(o); m = { o, kind }; this.map.set(e, m);
      }
      m.o.position.set(e.x / T1, (e.z || 20) / T1, e.y / T1);
      if (m.kind === 'arrow') m.o.rotation.y = Math.atan2(e.body.velocity.x, e.body.velocity.y); else { m.o.rotation.y = time / 120; m.o.rotation.x = time / 170; }
      if (m.kind === 'fire') m.o.scale.setScalar(1 + Math.sin(time / 50) * 0.15);
    }
    const sync = (list, make, yf) => {
      for (const o of list) {
        if (!o.active) continue; seen.add(o);
        let m = this.map.get(o); if (!m) { m = { o: make(o) }; sc.add(m.o); this.map.set(o, m); }
        m.o.position.set(o.x / T1, yf(o, time), o.y / T1);
      }
    };
    sync(s.crateList, o => { const c = a3clone(o.loot ? 'p:crate-item' : 'p:crate', 1.9); c.rotation.y = (o.x * 7 % 3) * 0.1; return c; }, () => 0);
    sync(s.coinsA, o => (o.val > 1 ? a3clone('p:jewel', 3.2) : a3clone('p:coin-gold', 2.2)), (o, t) => 0.35 + Math.sin(t / 300 + o.x) * 0.06);
    sync(s.pickups, o => a3clone(this.foodFor(o.texture.key, o.x, o.y), 1.5), (o, t) => 0.05 + Math.abs(Math.sin(t / 400 + o.x)) * 0.12);
    for (const c of s.coinsA) { const m = this.map.get(c); if (m) m.o.rotation.y = time / 300 + c.x; }
    for (const t of s.pickups) { const m = this.map.get(t); if (m) m.o.rotation.y = time / 500; }
    for (const [k, m] of this.map) if (!k.type && !seen.has(k)) { sc.remove(m.o); this.map.delete(k); }
    for (const sp of s.springsA) { const k = Math.max(0, 1 - (time - sp.t0) / 300); sp.m3.scale.set(1.7, 1.7 * (1 - 0.4 * k) + 0.4 * Math.sin(time / 40) * k, 1.7); }
    for (const f of s.cps) if (f.hit && !f.done) { f.done = true; f.m3.traverse(o => { if (o.isMesh) { cloneMats(o); eachMat(o, m => { m.emissive = new THREE.Color(0x22aa44); }); } }); }
    for (const t of s.targets) { const on = t.isOn, col = t.m3.userData.col; t.rings[0].material = this.M(on ? 0xffffff : 0xdddddd, { emissive: on ? col : 0 }); t.rings[1].material = this.M(on ? col : 0x8a8a98, { emissive: on ? col : 0, emissiveIntensity: 0.6 }); t.rings[2].material = this.M(on ? 0xffffff : 0x6a6a78, { emissive: on ? 0xffffff : 0 }); t.m3.scale.setScalar(on ? 1 + Math.sin(time / 90) * 0.04 : 1); }
    for (const p of s.plates) { p.m3.position.y = p.pressed ? 0.02 : 0.06; p.m3.scale.y = p.pressed ? 0.4 : 1; p.m3.material = this.M(GATE3[p.color], { emissive: p.ever ? GATE3[p.color] : 0, emissiveIntensity: 0.5 }); }
    for (const g of s.gates) { const tg = g.open ? -2.2 : 0; g.m3.position.y += (tg - g.m3.position.y) * Math.min(1, dt * 6); g.m3.visible = g.m3.position.y > -2.1; }
    for (const b of s.bridges) b.m3.children.forEach(c => { c.material.opacity = b.on ? 1 : 0.2; });
    for (const m of s.moversA) m.m3.position.set(m.px / T1, 0, m.py / T1);
    for (const c of s.crushers) { const vis = c.vis.visible; c.m3.visible = vis; if (vis) { const by = c.y + T * 2 - 6; c.m3.position.y = (by - c.vis.y) / T1 + 0.02; } c.w3.visible = c.warn > 0; if (c.warn) c.w3.material.opacity = 0.15 + c.warn * 0.4; }
    for (const l of s.lasers) { const on = l.on; l.m3.visible = on || l.warn || !!l.id; l.m3.material = on ? this.M(0xff3a3a, { emissive: 0xff2020 }) : this.M(0xff8080, { transparent: true, opacity: 0.18 }); }
    for (const cv of s.convs) cv.tx.offset.x = (cv.v.tilePositionX / T1);
    if (this.lock) this.lock.visible = s.lockGate.alpha > 0.2;
    if (this.exit) { this.exitDisc.material = this.M(s.exitOpen ? 0x66ff88 : 0xff4a4a, { emissive: s.exitOpen ? 0x22aa44 : 0xaa2020 }); this.exitDisc.rotation.y = time / 300; this.exitStar.rotation.y = time / 400; this.exitStar.visible = s.exitOpen; }
    if (this.liq) this.liq.material.emissiveIntensity = 0.45 + Math.sin(time / 500) * 0.12;
  }
  pooled(pool, make, list, apply) {
    list.forEach((it, i) => { let m = pool[i]; if (!m) { m = make(); this.scene.add(m); pool[i] = m; } m.visible = true; apply(m, it); });
    for (let i = list.length; i < pool.length; i++) pool[i].visible = false;
  }
  drawHazards3d(time) {
    const s = this.s, zs = s.zones.slice(), rs = s.rings;
    for (const w of s.warns) zs.push(w);
    this.pooled(this.zonePool, () => new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide, depthWrite: false })), zs, (m, z) => {
      m.rotation.x = -Math.PI / 2; m.position.set(z.x / T, 0.07, z.y / T);
      if (z.rect) { m.geometry = this.rectGeo || (this.rectGeo = new THREE.PlaneGeometry(1, 1)); m.scale.set(z.w / T, z.h / T, 1); m.material.color.setHex(0xff3a2e); m.material.opacity = 0.3 + 0.15 * Math.sin(time / 60); return; }
      if (m.geometry === this.rectGeo) m.geometry = this.circGeo || (this.circGeo = new THREE.CircleGeometry(1, 32));
      m.scale.set(z.r / T, z.r / T, 1);
      const age = time - (z.t0 || 0), warn = z.warn !== undefined && age < z.warn;
      if (z.leap) { m.material.color.setHex(0xff3a2e); m.material.opacity = 0.3 + 0.2 * Math.sin(time / 70); return; }
      m.material.color.setHex(z.type === 'bomb' ? (warn ? 0xff5a2e : 0xffb04a) : 0x6ee05a); m.material.opacity = warn ? 0.3 + 0.2 * Math.sin(time / 80) : 0.85;
    });
    this.pooled(this.ringPool, () => { const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 48), new THREE.MeshBasicMaterial({ color: 0xffe15a, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })); m.rotation.x = -Math.PI / 2; return m; }, rs, (m, r) => { m.position.set(r.x / T, 0.3, r.y / T); const rr = r.r / T; m.scale.set(rr, rr, 1); });
    const bombs = s.zones.filter(z => z.type === 'bomb' && time - z.t0 < z.warn);
    this.pooled(this.bombPool, () => a3clone('p:bomb', 1.5), bombs, (m, z) => { const f = (time - z.t0) / z.warn; m.position.set(z.x / T, 0.3 + (1 - f) * (1 - f) * 7, z.y / T); m.rotation.y = time / 200; });
  }
  drawChain(time) {
    const s = this.s, [a, b] = s.p, ch = this.chain; const ok = a.state === 'normal' && b.state === 'normal';
    if (!ok) { ch.forEach(m => m.visible = false); return; }
    const dx = (b.x - a.x) / T, dz = (b.y - a.y) / T, d = Math.hypot(dx, dz) || 1, n = Math.min(ch.length - 1, Math.max(2, Math.floor(d / 0.28)));
    const L = (s.kids ? 540 : 440) / T, slack = Math.max(0, L - d) * 0.08;
    for (let i = 0; i < ch.length; i++) { const m = ch[i]; if (i > n) { m.visible = false; continue; } const t = i / n; m.visible = true; m.position.set(a.x / T + dx * t, 0.45 - Math.sin(t * Math.PI) * Math.min(slack, 0.5), a.y / T + dz * t); }
  }
  drawAim(time, dt) {
    const s = this.s; let shown = false;
    s.p.forEach((p, i) => {
      const on = p.sucking && p.state === 'normal', sd = this.sdots[i];
      sd.forEach((m, k) => { m.visible = on; if (on) { const f = ((time / 500 + k / 8) % 1), r = 3.4 * (1 - f) + 0.3, a = Math.atan2(p.aim.y, p.aim.x) + (k % 2 ? 1 : -1) * (0.15 + (k * 0.09 % 0.5)) * (1 - f * 0.5); m.position.set(p.x / T + Math.cos(a) * r, 0.5, p.y / T + Math.sin(a) * r); m.scale.setScalar(0.6 + (1 - f) * 0.8); } });
      const ring = this.ringM[i], pv = p.prev;
      if (p.holding && pv && p.state === 'normal') {
        shown = true; ring.visible = true; ring.position.set(pv.lx / T, 0.07, pv.ly / T); ring.material.color.setHex(pv.bad ? 0xff5a5a : 0x7dff8a); ring.scale.setScalar(1 + Math.sin(time / 100) * 0.08);
        for (let k = 0; k < this.dots.length; k++) { const t = (k + 1) / (this.dots.length + 1), m = this.dots[k]; m.visible = true; m.position.set((p.x + (pv.lx - p.x) * t) / T, 0.5 + Math.sin(t * Math.PI) * 1.2, (p.y + (pv.ly - p.y) * t) / T); }
      } else ring.visible = false;
    });
    if (!shown) this.dots.forEach(m => m.visible = false);
  }
  burst(x, y, tex, n, speed, tint) {
    for (let i = 0; i < n; i++) {
      if (this.parts.length > 200) break;
      const star = tex === 'star', col = tint !== undefined ? tint : (star ? 0xffe15a : 0xffffff);
      const m = star ? new THREE.Mesh(new THREE.OctahedronGeometry(0.12), this.M(col, { emissive: col })) : this.sph(0.1 + Math.random() * 0.08, col);
      const a = Math.random() * Math.PI * 2, v = speed / T * (0.5 + Math.random());
      m.position.set(x / T, 0.5, y / T); this.scene.add(m);
      this.parts.push({ m, vx: Math.cos(a) * v, vz: Math.sin(a) * v, vy: 1.5 + Math.random() * 2.5, t: 0.5 + Math.random() * 0.4 });
    }
  }
  stepParts(dt) {
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i]; p.t -= dt; p.vy -= 9 * dt;
      p.m.position.x += p.vx * dt; p.m.position.z += p.vz * dt; p.m.position.y = Math.max(0.05, p.m.position.y + p.vy * dt); p.m.rotation.x += dt * 6; p.m.scale.setScalar(Math.max(0.01, p.t * 1.6));
      if (p.t <= 0) { this.scene.remove(p.m); this.parts.splice(i, 1); }
    }
  }
  shake(ms, i) { this.shakeT = ms / 1000; this.shakeI = i * 22; }
  project(x, y, h = 1.2) { const v = new THREE.Vector3(x / T, h, y / T).project(this.cam); return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H }; }
  updateCamera(dt, time) {
    const s = this.s, [a, b] = s.p, c = this.cam; let tx, tz, h, dz;
    const cf = s.def.camFixed;
    if (cf) { tx = cf.x; tz = cf.z; h = cf.h; dz = cf.dz; }
    else if (s.bossStarted) { const r = s.arenaR; tx = (r.x + r.w / 2) / T; tz = (r.y + r.h / 2) / T + 0.9; h = 20.5; dz = 12.5; }
    else { const sep = Math.hypot(a.x - b.x, a.y - b.y) / T; tx = (a.x + b.x) / 2 / T; tz = (a.y + b.y) / 2 / T; h = 11.5 + Math.min(5, sep * 0.6); dz = h * 0.7; }
    const k = Math.min(1, dt * (s.bossStarted ? 2.2 : 4.5));
    this.cx += (tx - this.cx) * k; this.cz += (tz - this.cz) * k; this.ch += (h - this.ch) * k; this.dz = (this.dz === undefined ? dz : this.dz + (dz - this.dz) * k);
    let ox = 0, oy = 0; if (this.shakeT > 0) { this.shakeT -= dt; ox = (Math.random() - 0.5) * this.shakeI * 0.05; oy = (Math.random() - 0.5) * this.shakeI * 0.05; }
    c.position.set(this.cx + ox, this.ch + oy, this.cz + this.dz); c.lookAt(this.cx + ox, 0, this.cz - 0.6);
  }
  dispose() { document.getElementById('three').style.display = 'none'; disposeScene(this.scene); this.r.renderLists.dispose(); }
}
