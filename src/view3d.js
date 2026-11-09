// 3D-Ansicht (Three.js) für die Draufsicht-Simulation: 1 Kachel = 1 Welt-Einheit,
// Simulation-(x,y) -> 3D-(X,Z). Kamera schräg von oben hinter den Figuren (Odyssey-Stil).
// Modelle: Kenney "Starter Kit 3D Platformer" (MIT/CC0). Alles andere wird aus einfachen Formen gebaut.
const A3 = { models: {}, ready: false, shadowTex: null };

function b64ToBuf(b64) { const s = atob(b64), n = s.length, u = new Uint8Array(n); for (let i = 0; i < n; i++) u[i] = s.charCodeAt(i); return u.buffer; }
function loadAssets3D() {
  const mgr = new THREE.LoadingManager();
  mgr.setURLModifier(u => (/colormap\.png/.test(u) ? 'data:image/png;base64,' + ASSETS.png.colormap : u));
  const loader = new THREE.GLTFLoader(mgr);
  const jobs = Object.keys(ASSETS.glb).map(name => new Promise((res, rej) => {
    loader.parse(b64ToBuf(ASSETS.glb[name]), '', g => { A3.models[name] = g; res(); }, rej);
  }));
  return Promise.all(jobs).then(() => new Promise(res => {
    const img = new Image(); img.onload = () => { A3.shadowTex = new THREE.Texture(img); A3.shadowTex.needsUpdate = true; res(); };
    img.src = 'data:image/png;base64,' + ASSETS.png.blob_shadow;
  })).then(() => { A3.ready = true; });
}

const TH3 = {
  alley:   { f1: 0x9f96dc, f2: 0x9189d0, side: 0x6a5aa8, wall: 0xe58f6c, wallTop: 0xffb38e, sky: [0x6d4fb0, 0xffb07a], fog: 0xcf9a9a, liquid: null },
  sewer:   { f1: 0x86dcb6, f2: 0x76d0a8, side: 0x3f8f78, wall: 0x3f9f86, wallTop: 0x6fd1b0, sky: [0x143a3a, 0x3a9c78], fog: 0x2a6a5a, liquid: 0x8cf06a },
  junk:    { f1: 0xf6cc62, f2: 0xeabf50, side: 0xa8732e, wall: 0xb8783f, wallTop: 0xe0a265, sky: [0xe39a4d, 0xffe2a0], fog: 0xf2c88a, liquid: 0x3a2a1a },
  factory: { f1: 0x86a0d8, f2: 0x7692cc, side: 0x3c4c80, wall: 0x4e5f94, wallTop: 0xffc83d, sky: [0x10162b, 0x45589a], fog: 0x2a3560, liquid: 0xff7a22 },
};
const GATE3 = { red: 0xff4d4d, blue: 0x4da6ff, green: 0x4dff88, yellow: 0xffd24d, pink: 0xff7ad9 };

class View3D {
  constructor(scene) {
    this.s = scene; this.th = TH3[scene.theme];
    const canvas = document.getElementById('three');
    canvas.style.display = 'block';
    THREE.ColorManagement.legacyMode = false;
    if (!View3D.renderer) {
      const r = View3D.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      r.setSize(W, H, false);
      r.outputEncoding = THREE.sRGBEncoding;
    }
    this.r = View3D.renderer;
    this.scene = new THREE.Scene();
    this.cam = new THREE.PerspectiveCamera(40, W / H, 0.5, 200);
    this.mats = {}; this.map = new Map(); this.parts = []; this.shakeT = 0; this.shakeI = 0;
    this.cx = scene.p[0].x / T; this.cz = scene.p[0].y / T; this.ch = 11;
    this.build();
  }
  // ── Material-/Formhelfer ──
  M(c, o = {}) { const k = c + JSON.stringify(o); return this.mats[k] || (this.mats[k] = new THREE.MeshLambertMaterial(Object.assign({ color: c }, o))); }
  mesh(geo, c, o) { const m = new THREE.Mesh(geo, this.M(c, o)); return m; }
  box(w, h, d, c, o) { return this.mesh(new THREE.BoxGeometry(w, h, d), c, o); }
  cyl(rt, rb, h, c, seg = 20, o) { return this.mesh(new THREE.CylinderGeometry(rt, rb, h, seg), c, o); }
  sph(r, c, o, sx = 1, sy = 1, sz = 1) { const m = this.mesh(new THREE.SphereGeometry(r, 20, 14), c, o); m.scale.set(sx, sy, sz); return m; }
  cone(r, h, c, seg = 16) { return this.mesh(new THREE.ConeGeometry(r, h, seg), c); }
  place(m, x, y, z, parent) { m.position.set(x, y, z); if (parent) parent.add(m); return m; }
  gm(name) { const g = A3.models[name]; return g; }
  clone(name, scale = 1) { const o = THREE.SkeletonUtils.clone(A3.models[name].scene); o.scale.setScalar(scale); return o; }
  eyes(g, y, z, spread, r = 0.12, look = 0) {
    for (const sx of [-1, 1]) {
      this.place(this.sph(r, 0xffffff), sx * spread, y, z, g);
      this.place(this.sph(r * 0.55, 0x16101f), sx * spread + look, y, z + r * 0.8, g);
      const brow = this.box(r * 2, r * 0.35, r * 0.4, 0x16101f); brow.rotation.z = -sx * 0.4; this.place(brow, sx * spread, y + r * 1.4, z + r * 0.4, g);
    }
  }
  blob(r) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: A3.shadowTex, transparent: true, depthWrite: false, opacity: 0.55 }));
    m.rotation.x = -Math.PI / 2; m.position.y = 0.03; return m;
  }
  skyTexture(c1, c2) {
    const cv = document.createElement('canvas'); cv.width = 2; cv.height = 256; const g = cv.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#' + c1.toString(16).padStart(6, '0')); gr.addColorStop(1, '#' + c2.toString(16).padStart(6, '0'));
    g.fillStyle = gr; g.fillRect(0, 0, 2, 256); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; return t;
  }

  // ───────────────────────── Statische Welt ─────────────────────────
  build() {
    const s = this.s, th = this.th, sc = this.scene;
    sc.background = this.skyTexture(th.sky[0], th.sky[1]);
    sc.fog = new THREE.Fog(th.fog, 28, 90);
    sc.add(new THREE.HemisphereLight(0xffffff, 0xa89ad0, 0.85));
    const sun = new THREE.DirectionalLight(0xffffff, 0.8); sun.position.set(-6, 14, 9); sc.add(sun);

    const floors = [], walls = [];
    const near = (x, y) => { for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) if (s.at(x + i, y + j) !== 0) return true; return false; };
    for (let y = 0; y < s.gh; y++) for (let x = 0; x < s.gw; x++) {
      const v = s.grid[y][x];
      if (v === 1) floors.push([x, y]); else if (v === 0 && near(x, y)) walls.push([x, y]);
    }
    const inst = (geo, c, list, yy, hh) => {
      const m = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color: 0xffffff }), list.length);
      const d = new THREE.Object3D(), col = new THREE.Color();
      list.forEach(([x, y, cc], i) => { d.position.set(x + 0.5, yy, y + 0.5); d.updateMatrix(); m.setMatrixAt(i, d.matrix); m.setColorAt(i, col.setHex(cc !== undefined ? cc : c)); });
      sc.add(m); return m;
    };
    inst(new THREE.BoxGeometry(1, 0.14, 1), 0, floors.map(([x, y]) => [x, y, (x + y) % 2 ? th.f1 : th.f2]), -0.07);
    inst(new THREE.BoxGeometry(0.999, 1.6, 0.999), th.side, floors, -0.94);
    inst(new THREE.BoxGeometry(1, 1.35, 1), th.wall, walls, 0.675);
    inst(new THREE.BoxGeometry(1.02, 0.12, 1.02), th.wallTop, walls, 1.36);
    // Flüssigkeit unter den Abgründen
    if (th.liquid) {
      const liq = this.mesh(new THREE.PlaneGeometry(s.gw + 60, s.gh + 60), th.liquid, { emissive: th.liquid, emissiveIntensity: 0.55 });
      liq.rotation.x = -Math.PI / 2; liq.position.set(s.gw / 2, -1.2, s.gh / 2); sc.add(liq); this.liq = liq;
    }
    // Gras-Deko & Wolken (Kenney)
    const rnd = (() => { let q = 7 + s.lv * 31; return () => (q = (q * 1664525 + 1013904223) % 4294967296) / 4294967296; })();
    if (s.theme === 'alley' || s.theme === 'sewer') {
      floors.forEach(([x, y]) => { if (rnd() < 0.05 && (x + y) % 3) { const g = this.clone(rnd() < 0.5 ? 'grass' : 'grass-small', 1.6); g.position.set(x + 0.2 + rnd() * 0.6, 0, y + 0.2 + rnd() * 0.6); g.rotation.y = rnd() * 6; sc.add(g); } });
    }
    const ncl = th.liquid ? 8 : 34;
    for (let i = 0; i < ncl; i++) { const c = this.clone('cloud', 3 + rnd() * 4); c.position.set(rnd() * (s.gw + 20) - 10, -12 - rnd() * 8, rnd() * (s.gh + 24) - 12); sc.add(c); }

    // Objekte
    this.stat = [];
    for (const f of s.cps) { const m = this.clone('flag', 1.6); m.position.set(f.cx / T, 0, f.cy / T + 0.3); sc.add(m); f.m3 = m; }
    for (const sg of s.signs) { const g = new THREE.Group(); this.place(this.box(0.1, 0.9, 0.1, 0x8a5f2e), 0, 0.45, 0, g); this.place(this.box(0.95, 0.6, 0.1, 0xf4e3b0), 0, 1.0, 0, g); for (const k of [-0.15, 0.1]) this.place(this.box(0.6, 0.06, 0.12, 0x16101f), 0, 1.0 + k, 0.02, g); g.position.set(sg.s.x / T, 0, sg.s.y / T - 0.1); sc.add(g); }
    for (const sp of s.spikesA) {
      const g = new THREE.Group(); const cx = Math.round(sp.displayWidth / T), cy = Math.round(sp.displayHeight / T);
      this.place(this.box(cx, 0.08, cy, 0x3a3544), cx / 2, 0.04, cy / 2, g);
      for (let i = 0; i < cx * 2; i++) for (let j = 0; j < cy * 2; j++) this.place(this.cone(0.14, 0.5, 0xe4e8f0, 8), i * 0.5 + 0.25, 0.3, j * 0.5 + 0.25, g);
      g.position.set(sp.x / T, 0, sp.y / T); sc.add(g);
    }
    for (const cv of s.convs) {
      const cvn = document.createElement('canvas'); cvn.width = 64; cvn.height = 64; const g = cvn.getContext('2d');
      g.fillStyle = '#4a505e'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#ffc83d';
      g.beginPath(); g.moveTo(12, 14); g.lineTo(34, 32); g.lineTo(12, 50); g.lineTo(24, 50); g.lineTo(46, 32); g.lineTo(24, 14); g.fill();
      const tx = new THREE.CanvasTexture(cvn); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(cv.r.width / T, cv.r.height / T);
      if (cv.d < 0) tx.repeat.x *= -1;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(cv.r.width / T, cv.r.height / T), new THREE.MeshLambertMaterial({ map: tx }));
      m.rotation.x = -Math.PI / 2; m.position.set((cv.r.x + cv.r.width / 2) / T, 0.03, (cv.r.y + cv.r.height / 2) / T); sc.add(m); cv.m3 = m; cv.tx = tx;
    }
    for (const l of s.lasers) {
      const r = l.r, cx = (r.x + r.w / 2) / T, cz = (r.y + r.h / 2) / T;
      for (const e of (l.dir === 'h' ? [[r.x / T, cz], [(r.x + r.w) / T, cz]] : [[cx, r.y / T], [cx, (r.y + r.h) / T]])) { this.place(this.cyl(0.22, 0.28, 0.9, 0x555d6e), e[0], 0.45, e[1], sc); this.place(this.sph(0.15, 0xff4a4a, { emissive: 0xff2020 }), e[0], 1.0, e[1], sc); }
      const beam = this.box(l.dir === 'h' ? r.w / T : 0.14, 0.14, l.dir === 'h' ? 0.14 : r.h / T, 0xff3a3a, { emissive: 0xff2020 });
      beam.position.set(cx, 0.55, cz); sc.add(beam); l.m3 = beam;
    }
    for (const c of s.crushers) {
      const g = new THREE.Group(); this.place(this.box(1.9, 1.3, 1.9, 0x8b94a8), 0, 0.65, 0, g);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) this.place(this.cone(0.14, 0.3, 0xff4a4a, 6), -0.7 + i * 0.47, -0.05, -0.7 + j * 0.47, g).rotation.x = Math.PI;
      g.position.set((c.x + T) / T, 40, (c.y + T) / T); sc.add(g); c.m3 = g;
      const warn = this.mesh(new THREE.PlaneGeometry(2, 2), 0xff3a2e, { transparent: true, opacity: 0.4 }); warn.rotation.x = -Math.PI / 2; warn.position.set((c.x + T) / T, 0.05, (c.y + T) / T); warn.visible = false; sc.add(warn); c.w3 = warn;
    }
    for (const t of s.targets) {
      const g = new THREE.Group(); this.place(this.cyl(0.07, 0.07, 1.1, 0x8a8a98), 0, 0.55, 0, g);
      const disc = new THREE.Group(); disc.rotation.x = Math.PI / 2;
      const col = GATE3[t.color]; t.rings = [this.cyl(0.46, 0.46, 0.1, 0xdddddd), this.cyl(0.33, 0.33, 0.12, 0x8a8a98), this.cyl(0.18, 0.18, 0.14, 0x6a6a78)];
      t.rings.forEach(r => disc.add(r)); this.place(disc, 0, 1.25, 0.05, g);
      g.position.set(t.x / T, 0, (t.y - 6) / T); g.userData.col = col; sc.add(g); t.m3 = g;
    }
    for (const p of s.plates) { const m = this.cyl(0.5, 0.55, 0.12, GATE3[p.color]); m.position.set(p.x / T, 0.06, p.y / T); sc.add(m); p.m3 = m; }
    for (const g of s.gates) {
      const w = g.displayWidth / T, h = g.displayHeight / T, grp = new THREE.Group(), col = GATE3[Object.keys(GATE3).find(k => GATE3[k] === g.tintTopLeft)] || g.tintTopLeft;
      const n = Math.max(3, Math.round(Math.max(w, h) * 3));
      for (let i = 0; i < n; i++) { const bar = this.box(0.12, 1.7, 0.12, 0xf2f2f2); bar.position.set(w >= h ? (i + 0.5) / n * w : w / 2, 0.85, w >= h ? h / 2 : (i + 0.5) / n * h); grp.add(bar); }
      grp.add(this.place(this.box(w, 0.14, h, g.tintTopLeft, { transparent: true, opacity: 0.9 }), w / 2, 1.75, h / 2));
      grp.add(this.place(this.box(w, 0.14, h, g.tintTopLeft), w / 2, 0.07, h / 2));
      grp.position.set(g.x / T, 0, g.y / T); sc.add(grp); g.m3 = grp;
    }
    for (const b of s.bridges) {
      const grp = new THREE.Group(), w = b.v.width / T, h = b.v.height / T;
      for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) this.place(this.box(0.96, 0.18, 0.96, 0xb98a52, { transparent: true, opacity: 1 }), i + 0.5, -0.09, j + 0.5, grp);
      this.place(this.box(w, 0.06, h, GATE3[Object.keys(GATE3).find(k => GATE3[k] === b.v.tintTopLeft)] || b.v.tintTopLeft, { transparent: true, opacity: 0.5 }), w / 2, 0.01, h / 2, grp);
      grp.position.set(b.v.x / T, 0, b.v.y / T); sc.add(grp); b.m3 = grp; grp.children.forEach(c => { if (c.material) { c.material = c.material.clone(); } });
    }
    for (const m of s.moversA) { const w = m.w / T, h = m.h / T, g = new THREE.Group(); this.place(this.box(w - 0.04, 0.3, h - 0.04, 0xb98a52), w / 2, -0.15, h / 2, g); this.place(this.box(w - 0.3, 0.06, h - 0.3, 0xe0b878), w / 2, 0.01, h / 2, g); sc.add(g); m.m3 = g; }
    if (s.exitSpr) {
      const g = new THREE.Group(); this.place(this.cyl(0.85, 0.95, 1.5, 0x4a8f5a), 0, 0.75, 0, g); this.place(this.cyl(0.95, 0.95, 0.2, 0xffd23f), 0, 1.55, 0, g);
      this.exitDisc = this.place(this.cyl(0.62, 0.62, 0.06, 0xff4a4a, 24, { emissive: 0xaa2020 }), 0, 1.66, 0, g);
      g.position.set(s.exitPos.x / T, 0, (s.exitPos.y + 20) / T); sc.add(g); this.exit = g;
    }
    if (s.lockGate) {
      const g = s.lockGate, grp = new THREE.Group(), h = g.displayHeight / T;
      for (let i = 0; i < h * 3; i++) this.place(this.box(0.14, 1.9, 0.14, 0xff4d4d, { emissive: 0x801010 }), 0.5, 0.95, (i + 0.5) / 3, grp);
      grp.position.set(g.x / T, 0, g.y / T); grp.visible = false; sc.add(grp); this.lock = grp;
    }
    // Spieler
    this.pm = s.p.map((p, i) => this.makePlayer(i));
    // Chain, Vorschau, Sog
    this.chain = []; for (let i = 0; i < 70; i++) { const m = this.sph(0.09, 0xdfe3ea); m.visible = false; sc.add(m); this.chain.push(m); }
    this.dots = []; for (let i = 0; i < 16; i++) { const m = this.sph(0.09, 0xffffff, { emissive: 0xffffff }); m.visible = false; sc.add(m); this.dots.push(m); }
    this.ringM = [0, 1].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.55, 28), new THREE.MeshBasicMaterial({ color: 0x7dff8a, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })); m.rotation.x = -Math.PI / 2; m.position.y = 0.06; m.visible = false; sc.add(m); return m; });
    this.cone3 = [0, 1].map(() => { const m = this.suckCone(); sc.add(m); return m; });
    this.zonePool = []; this.ringPool = [];
  }
  suckCone() {
    const pts = [0, 0, 0], idx = [], N = 14, r = 3.65;
    for (let i = 0; i <= N; i++) { const a = (-50 + 100 * i / N) * Math.PI / 180; pts.push(Math.cos(a) * r, 0, Math.sin(a) * r); if (i < N) idx.push(0, i + 1, i + 2); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); g.setIndex(idx);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false }));
    m.position.y = 0.5; m.visible = false; return m;
  }
  recolor(model, hue, lightShift) {
    model.traverse(o => {
      if (!o.isMesh) return;
      const m = o.material.clone(); o.material = m;
      if (m.map && m.map.image) {
        const im = m.map.image, cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height;
        const g = cv.getContext('2d'); g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, cv.width, cv.height), a = d.data;
        const col = new THREE.Color();
        for (let i = 0; i < a.length; i += 4) {
          col.setRGB(a[i] / 255, a[i + 1] / 255, a[i + 2] / 255); const hsl = {}; col.getHSL(hsl);
          if (hsl.s < 0.18 && hsl.l > 0.72) { const tc = new THREE.Color().setHSL(hue, 0.75, 0.74); a[i] = a[i] * 0.45 + tc.r * 255 * 0.55; a[i + 1] = a[i + 1] * 0.45 + tc.g * 255 * 0.55; a[i + 2] = a[i + 2] * 0.45 + tc.b * 255 * 0.55; }
          else if (hsl.s > 0.2 && hsl.h > 0.62 && hsl.h < 0.9) { col.setHSL(hue, Math.min(1, hsl.s * 1.05), Math.min(0.85, hsl.l + lightShift)); a[i] = col.r * 255; a[i + 1] = col.g * 255; a[i + 2] = col.b * 255; }
        }
        g.putImageData(d, 0, 0);
        const t = new THREE.CanvasTexture(cv); t.flipY = false; t.encoding = THREE.sRGBEncoding; m.map = t; m.needsUpdate = true;
      }
    });
  }
  makePlayer(i) {
    const grp = new THREE.Group();
    const model = this.clone('character', 1.25);
    this.recolor(model, i === 0 ? 0.58 : 0.075, i === 0 ? 0.02 : 0.05);
    grp.add(model);
    const mixer = new THREE.AnimationMixer(model), acts = {};
    A3.models.character.animations.forEach(a => { acts[a.name] = mixer.clipAction(a); });
    const nz = new THREE.Group(); this.place(this.cyl(0.11, 0.11, 0.38, 0x9aa3b2), 0, 0, 0, nz).rotation.x = Math.PI / 2; this.place(this.cyl(0.17, 0.12, 0.14, 0x69727f), 0, 0, 0.24, nz).rotation.x = Math.PI / 2;
    nz.position.set(0, 0.4, 0.5); grp.add(nz);
    const sh = this.blob(0.6); this.scene.add(sh); this.scene.add(grp);
    const icon = this.clone('character', 0.5); this.recolor(icon, i === 0 ? 0.075 : 0.58, 0.04); icon.visible = false; this.scene.add(icon);
    return { grp, model, mixer, acts, cur: null, sh, nz, icon, yaw: 0 };
  }
  anim(pm, name) { const a = pm.acts[name]; if (!a || pm.cur === name) return; const o = pm.acts[pm.cur]; a.reset().play(); if (o) a.crossFadeFrom(o, 0.15, false); pm.cur = name; }

  // ───────────────────────── Dynamische Objekte ─────────────────────────
  trashMesh(k) {
    const g = new THREE.Group();
    if (k === 'trash0') this.place(this.cyl(0.14, 0.14, 0.3, 0xc7ccd6), 0, 0, 0, g);
    else if (k === 'trash1') { const b = this.sph(0.12, 0xffe15a, {}, 1.8, 0.8, 0.8); g.add(b); }
    else if (k === 'trash2') { this.place(this.cyl(0.1, 0.1, 0.28, 0x66c66b), 0, 0, 0, g); this.place(this.cyl(0.045, 0.045, 0.2, 0x66c66b), 0, 0.22, 0, g); }
    else this.place(new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0), this.M(0xf4f4f4)), 0, 0, 0, g);
    return g;
  }
  enemyMesh(e) {
    const g = new THREE.Group(), t = e.type;
    if (t === 'walker') {
      this.place(this.sph(0.34, 0x7cc95a, {}, 1, 0.95, 1), 0, 0.38, 0, g); this.place(this.cone(0.14, 0.3, 0x5aa03c, 8), 0, 0.82, 0, g);
      this.eyes(g, 0.45, 0.28, 0.14, 0.1); for (const sx of [-1, 1]) this.place(this.sph(0.1, 0x333333, {}, 1, 0.7, 1.3), sx * 0.15, 0.06, 0.05, g);
    } else if (t === 'armor') {
      this.place(this.sph(0.38, 0x9a7bd0, {}, 1, 0.95, 1), 0, 0.4, 0, g); this.place(this.sph(0.42, 0xb7c0d0, {}, 1, 0.7, 1), 0, 0.66, -0.02, g); this.place(this.cyl(0.44, 0.44, 0.07, 0x8a94a8), 0, 0.5, 0, g);
      this.eyes(g, 0.36, 0.3, 0.15, 0.1);
    } else if (t === 'flyer') {
      this.place(this.sph(0.28, 0x4a4a5a), 0, 0, 0, g);
      for (const sx of [-1, 1]) { const w = this.sph(0.3, 0xcfe9ff, { transparent: true, opacity: 0.85 }, 1, 0.12, 0.6); w.position.set(sx * 0.4, 0.15, 0); w.userData.wing = sx; g.add(w); }
      for (const sx of [-1, 1]) { this.place(this.sph(0.09, 0xff5a5a, { emissive: 0xaa2020 }), sx * 0.12, 0.05, 0.22, g); }
    } else if (t === 'turret') {
      this.place(this.cyl(0.4, 0.46, 0.25, 0x555d6e), 0, 0.12, 0, g); const top = new THREE.Group(); this.place(this.cyl(0.3, 0.34, 0.5, 0xd35a5a), 0, 0.5, 0, top);
      this.place(this.cyl(0.1, 0.12, 0.45, 0x888fa0), 0, 0.55, 0.38, top).rotation.x = Math.PI / 2; this.eyes(top, 0.58, 0.28, 0.12, 0.09); g.add(top); g.userData.top = top;
    } else if (t === 'charger') {
      this.place(this.sph(0.3, 0x9b8b84, {}, 0.9, 0.75, 1.5), 0, 0.3, 0, g); this.place(this.sph(0.2, 0xb5a59e), 0, 0.38, 0.38, g);
      for (const sx of [-1, 1]) { this.place(this.sph(0.12, 0xd6a7b0, {}, 1, 1, 0.4), sx * 0.15, 0.58, 0.32, g); }
      this.place(this.cyl(0.03, 0.03, 0.55, 0xb08a8a), 0, 0.28, -0.6, g).rotation.x = Math.PI / 2.4;
      this.eyes(g, 0.45, 0.52, 0.09, 0.07); this.place(this.sph(0.05, 0xff7a9a), 0, 0.34, 0.58, g);
    }
    g.scale.setScalar(1.25); return g;
  }
  bossMesh(b) {
    const g = new THREE.Group(), k = b.kind;
    if (k === 'can') {
      this.place(this.cyl(0.95, 0.9, 1.9, 0x8a97a6), 0, 0.95, 0, g);
      g.userData.lid = this.place(this.cyl(1.02, 1.02, 0.22, 0xaebbc9), 0, 2.0, 0, g); this.place(this.cyl(0.25, 0.25, 0.14, 0x6f7c8a), 0, 2.2, 0, g);
      this.eyes(g, 1.35, 0.88, 0.38, 0.24); const mouth = this.box(0.9, 0.28, 0.1, 0x2a1d2a); this.place(mouth, 0, 0.8, 0.9, g);
      for (let i = 0; i < 5; i++) this.place(this.box(0.1, 0.12, 0.06, 0xffffff), -0.36 + i * 0.18, 0.9, 0.95, g);
      for (const sx of [-1, 1]) this.place(this.cyl(0.05, 0.05, 0.9, 0x6f7c8a), sx * 0.7, 1.0, 0.7, g);
    } else if (k === 'slime') {
      this.place(this.sph(1.0, 0x6ee05a, { emissive: 0x1a5a10 }, 1.35, 0.95, 1.15), 0, 0.85, 0, g);
      const crown = this.cone(0.35, 0.55, 0xffd23f, 5); this.place(crown, 0, 1.95, 0, g);
      this.eyes(g, 1.15, 0.95, 0.42, 0.24);
      g.userData.mouth = this.place(this.sph(0.38, 0x2a1020, {}, 1.4, 0.7, 0.4), 0, 0.55, 1.05, g);
      g.userData.mouth.visible = false;
      for (let i = 0; i < 4; i++) this.place(this.sph(0.25, 0x6ee05a, {}, 1, 0.6, 1), -0.9 + i * 0.6, 0.08, 0.5, g);
    } else if (k === 'digger') {
      for (const sx of [-1, 1]) { this.place(this.box(0.55, 0.55, 2.8, 0x4a4f5c), sx * 0.9, 0.3, 0, g); for (let i = 0; i < 4; i++) this.place(this.cyl(0.24, 0.24, 0.6, 0x8b94a8), sx * 0.9, 0.3, -1.0 + i * 0.66, g).rotation.z = Math.PI / 2; }
      this.place(this.box(1.9, 0.9, 2.2, 0xffc22e), 0, 0.95, 0, g); this.place(this.box(1.5, 0.8, 1.0, 0xbfe6ff, { transparent: true, opacity: 0.85 }), 0, 1.7, -0.3, g);
      this.eyes(g, 1.75, 0.25, 0.36, 0.2);
      this.place(this.box(0.25, 0.25, 1.6, 0xe6a21a), 0, 1.1, 1.6, g); this.place(this.box(1.5, 0.7, 0.6, 0x9aa3b2), 0, 0.55, 2.5, g);
      for (let i = 0; i < 4; i++) this.place(this.cone(0.1, 0.3, 0xdfe3ea, 6), -0.55 + i * 0.37, 0.3, 2.8, g).rotation.x = Math.PI / 2;
    } else if (k === 'mech') {
      this.place(this.sph(1.15, 0x8b94a8, {}, 1.05, 1.2, 1), 0, 0, 0, g);
      const dome = this.sph(0.95, 0xbfe6ff, { transparent: true, opacity: 0.55 }); this.place(dome, 0, 1.0, 0.1, g);
      this.place(this.sph(0.42, 0xf1d2b2), 0, 0.95, 0.1, g); this.place(this.box(0.5, 0.1, 0.1, 0x6b4a2b), 0, 0.82, 0.5, g); this.eyes(g, 1.02, 0.45, 0.17, 0.1);
      for (const sx of [-1, 1]) { this.place(this.box(0.5, 0.45, 1.1, 0x2f3647), sx * 1.5, 0, 0.3, g); this.place(this.cyl(0.12, 0.12, 0.5, 0x555d6e), sx * 1.5, 0, 0.95, g).rotation.x = Math.PI / 2; }
      this.place(this.cyl(0.6, 0.35, 0.3, 0xffc83d, 16, { emissive: 0xaa7a10 }), 0, -1.2, 0, g);
    }
    return g;
  }
  flash(obj, white, red) {
    obj.traverse(o => { if (o.isMesh && o.material && o.material.emissive) { if (!o.userData.mat) { o.material = o.material.clone(); o.userData.mat = true; } o.material.emissive.setHex(white ? 0xffffff : (red ? 0x882222 : (o.userData.base || 0x000000))); } });
  }

  // ───────────────────────── Update ─────────────────────────
  update(dt, time) {
    const s = this.s, sc = this.scene, T1 = T;
    // Spieler
    s.p.forEach((p, i) => {
      const pm = this.pm[i], g = pm.grp;
      const vis = p.state !== 'held' && p.state !== 'falling' ? true : p.state === 'falling';
      g.visible = p.state !== 'held'; pm.sh.visible = p.state === 'normal';
      const h = (p.z || 0) / T1;
      let sc_ = 1; if (p.state === 'falling') sc_ = Math.max(0.05, p.fallT / 0.6);
      g.position.set(p.x / T1, h - (p.state === 'falling' ? (0.6 - p.fallT) * 3 : 0), p.y / T1);
      g.scale.setScalar(sc_);
      const target = Math.atan2(p.aim.x, p.aim.y); let d = target - pm.yaw; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; pm.yaw += d * Math.min(1, dt * 14);
      pm.model.rotation.y = pm.yaw; pm.nz.rotation.y = Math.atan2(p.aim.x, p.aim.y);
      pm.nz.position.set(Math.sin(pm.nz.rotation.y) * 0.5, 0.42, Math.cos(pm.nz.rotation.y) * 0.5);
      if (p.fly) g.rotation.z = 0, pm.model.rotation.x = (time / 160) % (Math.PI * 2); else pm.model.rotation.x = 0;
      const spd = Math.hypot(p.body.velocity.x, p.body.velocity.y);
      this.anim(pm, p.hop || p.fly ? 'jump' : (spd > 40 ? 'walk' : 'idle'));
      pm.mixer.update(dt * (spd > 40 ? Math.max(0.6, spd / 230) : 1));
      pm.sh.position.set(p.x / T1, 0.03, p.y / T1); pm.sh.material.opacity = Math.max(0.15, 0.55 - h * 0.25);
      g.traverse(o => { if (o.material && o.material.transparent !== undefined && o.userData.mat === undefined) { } });
      const blink = time < p.inv && Math.floor(time / 70) % 2; pm.model.visible = !blink;
      pm.icon.visible = !!p.holding && p.state === 'normal';
      const o = s.p[1 - i]; const hold = p.holding;
      const ic = this.pm[1 - i].icon; ic.visible = !!hold; if (hold) ic.position.set(p.x / T1, 1.9 + Math.sin(time / 120) * 0.05, p.y / T1);
      pm.icon.visible = false;
    });
    // Gegner
    const alive = new Set();
    for (const e of s.enemyList) {
      if (!e.active) continue; alive.add(e);
      let m = this.map.get(e); if (!m) { const o = this.enemyMesh(e); sc.add(o); const sh = this.blob(0.55); sc.add(sh); m = { o, sh }; this.map.set(e, m); }
      const h = (e.z || 0) / T1;
      m.o.position.set(e.x / T1, h, e.y / T1); m.sh.position.set(e.x / T1, 0.03, e.y / T1); m.sh.material.opacity = h > 0.5 ? 0.3 : 0.55;
      const v = e.body.velocity, tgt = e.cfg.still || Math.hypot(v.x, v.y) < 10 ? Math.atan2(s.nearest(e.x, e.y).x - e.x, s.nearest(e.x, e.y).y - e.y) : Math.atan2(v.x, v.y);
      m.yaw = (m.yaw === undefined ? tgt : m.yaw); let d = tgt - m.yaw; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; m.yaw += d * Math.min(1, dt * 8);
      if (e.cfg.still) { if (m.o.userData.top) m.o.userData.top.rotation.y = m.yaw; } else m.o.rotation.y = m.yaw;
      if (e.type === 'flyer') m.o.children.forEach(c => { if (c.userData.wing) c.rotation.z = c.userData.wing * Math.sin(time / 50) * 0.7; });
      else if (!e.cfg.still) m.o.position.y += Math.abs(Math.sin(time / 110 + e.ph)) * 0.1 * (Math.hypot(v.x, v.y) > 30 ? 1 : 0);
      this.flash(m.o, e.vis.isTinted && e.vis.tintFill, e.vis.isTinted && !e.vis.tintFill);
    }
    for (const [k, m] of this.map) if (!alive.has(k) && k.type) { sc.remove(m.o); sc.remove(m.sh); this.map.delete(k); }
    // Boss
    const bo = s.bossObj;
    if (bo) {
      if (!bo.m3) { bo.m3 = this.bossMesh(bo); sc.add(bo.m3); bo.sh3 = this.blob(1.6); sc.add(bo.sh3); if (bo.kind === 'mech') { bo.shield3 = this.sph(1.9, 0x66e6ff, { transparent: true, opacity: 0.25, emissive: 0x2288aa }); sc.add(bo.shield3); } }
      const sp = bo.spr, h = (sp.z || 0) / T1 + (bo.kind === 'mech' ? 0.6 : 0);
      bo.m3.visible = !bo.dead || sp.vis.visible; bo.m3.position.set(sp.x / T1, h, sp.y / T1); bo.sh3.position.set(sp.x / T1, 0.03, sp.y / T1);
      if (bo.kind === 'can') { bo.m3.rotation.y = sp.vis.flipX ? 0.5 : -0.5; bo.m3.userData.lid && (bo.m3.userData.lid.rotation.z = bo.st === 'stun' ? 0.5 : 0); }
      else if (bo.kind === 'slime') { bo.m3.rotation.y = sp.vis.flipX ? 0.4 : -0.4; bo.m3.userData.mouth.visible = bo.st === 'open'; bo.m3.scale.y = 1 + Math.sin(time / 200) * 0.04; }
      else if (bo.kind === 'digger') { const dr = bo.dir || { x: sp.vis.flipX ? -1 : 1, y: 0 }; const tg = Math.atan2(dr.x, dr.y); bo.yaw = bo.yaw === undefined ? tg : bo.yaw; let d = tg - bo.yaw; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; bo.yaw += d * Math.min(1, dt * 6); bo.m3.rotation.y = bo.yaw; }
      else if (bo.kind === 'mech') { bo.m3.rotation.y = Math.sin(time / 700) * 0.3; bo.shield3.position.copy(bo.m3.position); bo.shield3.visible = bo.started && !bo.dead && !bo.vuln; bo.shield3.scale.setScalar(1 + Math.sin(time / 120) * 0.03); }
      this.flash(bo.m3, sp.vis.isTinted && sp.vis.tintFill, false);
      if (bo.vuln && !bo.dead) bo.m3.traverse(o => { if (o.isMesh && o.material && o.material.emissive && !(sp.vis.isTinted && sp.vis.tintFill)) { if (!o.userData.mat) { o.material = o.material.clone(); o.userData.mat = true; } o.material.emissive.setHex(Math.floor(time / 180) % 2 ? 0x665500 : 0x222200); } });
      const gone = bo.dead && !sp.vis.visible; if (gone) { bo.m3.visible = false; bo.sh3.visible = false; if (bo.shield3) bo.shield3.visible = false; }
      if (bo.m3.scale && bo.dead) bo.m3.scale.setScalar(Math.max(0.01, sp.vis.scaleX));
    }
    // Schüsse
    const shots = new Set();
    for (const grp of [s.shotG, s.eshotG]) for (const e of grp.getChildren()) {
      if (!e.active) continue; shots.add(e);
      let m = this.map.get(e); if (!m) { const o = grp === s.shotG ? this.trashMesh(e.vis.texture.key) : this.sph(0.18, 0x8cf06a, { emissive: 0x2a8a20 }); if (grp === s.eshotG && e.vis.isTinted) o.material = this.M(0xff6a6a, { emissive: 0xaa2020 }); sc.add(o); m = { o }; this.map.set(e, m); }
      m.o.position.set(e.x / T1, (e.z || 20) / T1, e.y / T1); m.o.rotation.y = time / 120; m.o.rotation.x = time / 170;
    }
    // Kisten, Münzen, Müll
    const sync = (list, make, key) => {
      for (const o of list) {
        if (!o.active) continue; shots.add(o);
        let m = this.map.get(o); if (!m) { m = { o: make(o) }; sc.add(m.o); this.map.set(o, m); }
        m.o.position.set(o.x / T1, key(o, time), o.y / T1);
      }
    };
    sync(s.crateList, () => this.clone('brick', 1.0), () => 0.5);
    sync(s.coinsA, () => { const c = this.clone('coin', 1.7); return c; }, (o, t) => 0.55 + Math.sin(t / 300 + o.x) * 0.06);
    sync(s.pickups, o => this.trashMesh(o.texture.key), (o, t) => 0.3 + Math.sin(t / 250 + o.x) * 0.05);
    for (const c of s.coinsA) { const m = this.map.get(c); if (m) m.o.rotation.y = time / 300 + c.x; }
    for (const t of s.pickups) { const m = this.map.get(t); if (m) m.o.rotation.y = time / 500; }
    for (const [k, m] of this.map) if (!k.type && !shots.has(k)) { sc.remove(m.o); this.map.delete(k); }
    // Checkpoints
    for (const f of s.cps) if (f.hit && !f.done) { f.done = true; f.m3.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.emissive = new THREE.Color(0x22aa44); } }); }
    // Rätselobjekte
    for (const t of s.targets) { const on = t.isOn, col = t.m3.userData.col; t.rings[0].material = this.M(on ? 0xffffff : 0xdddddd, { emissive: on ? col : 0 }); t.rings[1].material = this.M(on ? col : 0x8a8a98, { emissive: on ? col : 0, emissiveIntensity: 0.6 }); t.rings[2].material = this.M(on ? 0xffffff : 0x6a6a78, { emissive: on ? 0xffffff : 0 }); t.m3.scale.setScalar(on ? 1 + Math.sin(time / 90) * 0.04 : 1); }
    for (const p of s.plates) { p.m3.position.y = p.pressed ? 0.02 : 0.06; p.m3.scale.y = p.pressed ? 0.4 : 1; p.m3.material = this.M(GATE3[p.color], { emissive: p.ever ? GATE3[p.color] : 0, emissiveIntensity: 0.5 }); }
    for (const g of s.gates) { const tg = g.open ? -2.2 : 0; g.m3.position.y += (tg - g.m3.position.y) * Math.min(1, dt * 6); g.m3.visible = g.m3.position.y > -2.1; }
    for (const b of s.bridges) { b.m3.children.forEach((c, i) => { if (c.material) c.material.opacity = b.on ? 1 : 0.2; c.visible = b.on || i >= b.m3.children.length - 1 || true; }); }
    for (const m of s.moversA) m.m3.position.set(m.px / T1, 0, m.py / T1);
    for (const c of s.crushers) { const vis = c.vis.visible; c.m3.visible = vis; if (vis) { const by = c.y + T * 2 - 6; c.m3.position.y = (by - c.vis.y) / T1 + 0.02; } c.w3.visible = c.warn > 0; if (c.warn) c.w3.material.opacity = 0.15 + c.warn * 0.4; }
    for (const l of s.lasers) { const on = l.on; l.m3.visible = on || l.warn || !!l.id; l.m3.material = on ? this.M(0xff3a3a, { emissive: 0xff2020 }) : this.M(0xff8080, { transparent: true, opacity: 0.18 }); }
    for (const cv of s.convs) cv.tx.offset.x = -cv.v.tilePositionX / T1 * (cv.d < 0 ? -1 : 1) * 0.0 + (cv.v.tilePositionX / T1) * (cv.d < 0 ? 1 : -1) * 0 + (cv.v.tilePositionX / T1);
    if (s.lockGate && this.lock) this.lock.visible = s.lockGate.alpha > 0.2;
    if (this.exit) { this.exitDisc.material = this.M(s.exitOpen ? 0x66ff88 : 0xff4a4a, { emissive: s.exitOpen ? 0x22aa44 : 0xaa2020 }); this.exitDisc.rotation.y = time / 300; }
    if (this.liq) this.liq.material.emissiveIntensity = 0.45 + Math.sin(time / 500) * 0.12;
    this.drawHazards3d(time);
    this.drawChain(time);
    this.drawAim(time);
    this.stepParts(dt);
    this.updateCamera(dt, time);
    this.r.render(sc, this.cam);
  }
  // Boss-Gefahren (Warnkreise, Pfützen, Schockwellen)
  pooled(pool, make, list, apply) {
    list.forEach((it, i) => { let m = pool[i]; if (!m) { m = make(); this.scene.add(m); pool[i] = m; } m.visible = true; apply(m, it); });
    for (let i = list.length; i < pool.length; i++) pool[i].visible = false;
  }
  drawHazards3d(time) {
    const bo = this.s.bossObj, zs = [], rs = [];
    if (bo && bo.started && !bo.dead) {
      for (const z of bo.zones) zs.push(z); for (const r of bo.rings) rs.push(r);
      for (const w of bo.warns || []) zs.push(w);
    }
    this.pooled(this.zonePool, () => new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide, depthWrite: false })), zs, (m, z) => {
      m.rotation.x = -Math.PI / 2; m.position.set(z.x / T, 0.07 + (z.rect ? 0 : 0), z.y / T);
      if (z.rect) { m.geometry = this.rectGeo || (this.rectGeo = new THREE.PlaneGeometry(1, 1)); m.scale.set(z.w / T, z.h / T, 1); m.position.set(z.x / T, 0.07, z.y / T); m.rotation.z = 0; m.material.color.setHex(0xff3a2e); m.material.opacity = 0.3 + 0.15 * Math.sin(time / 60); return; }
      if (m.geometry === this.rectGeo) m.geometry = this.circGeo || (this.circGeo = new THREE.CircleGeometry(1, 32));
      m.scale.set(z.r / T, z.r / T, 1);
      const age = time - (z.t0 || 0), warn = z.warn !== undefined && age < z.warn;
      if (z.leap) { m.material.color.setHex(0xff3a2e); m.material.opacity = 0.3 + 0.2 * Math.sin(time / 70); return; }
      m.material.color.setHex(z.type === 'bomb' ? (warn ? 0xff5a2e : 0xffb04a) : 0x6ee05a);
      m.material.opacity = warn ? 0.3 + 0.2 * Math.sin(time / 80) : 0.85;
    });
    this.pooled(this.ringPool, () => { const m = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 48), new THREE.MeshBasicMaterial({ color: 0xffe15a, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })); m.rotation.x = -Math.PI / 2; return m; }, rs, (m, r) => { m.position.set(r.x / T, 0.3, r.y / T); const rr = r.r / T; m.scale.set(rr, rr, 1); });
  }
  drawChain(time) {
    const s = this.s, [a, b] = s.p, ch = this.chain;
    const ok = a.state === 'normal' && b.state === 'normal';
    if (!ok) { ch.forEach(m => m.visible = false); return; }
    const dx = (b.x - a.x) / T, dz = (b.y - a.y) / T, d = Math.hypot(dx, dz) || 1, n = Math.min(ch.length - 1, Math.max(2, Math.floor(d / 0.28)));
    const L = (s.kids ? 540 : 440) / T, slack = Math.max(0, L - d) * 0.08;
    for (let i = 0; i < ch.length; i++) {
      const m = ch[i]; if (i > n) { m.visible = false; continue; }
      const t = i / n; m.visible = true;
      m.position.set(a.x / T + dx * t, 0.45 - Math.sin(t * Math.PI) * Math.min(slack, 0.5) + 0.12 * 0, a.y / T + dz * t);
    }
  }
  drawAim(time) {
    const s = this.s;
    s.p.forEach((p, i) => {
      const cone = this.cone3[i], on = p.sucking && p.state === 'normal';
      cone.visible = on;
      if (on) { cone.position.set(p.x / T + p.aim.x * 0.3, 0.5, p.y / T + p.aim.y * 0.3); cone.rotation.y = -Math.atan2(p.aim.y, p.aim.x); cone.material.opacity = 0.16 + 0.06 * Math.sin(time / 90); }
    });
    // Wurf-Vorschau
    let shown = false;
    s.p.forEach((p, i) => {
      const ring = this.ringM[i], pv = p.prev;
      if (p.holding && pv && p.state === 'normal') {
        shown = true; ring.visible = true; ring.position.set(pv.lx / T, 0.07, pv.ly / T); ring.material.color.setHex(pv.bad ? 0xff5a5a : 0x7dff8a); ring.scale.setScalar(1 + Math.sin(time / 100) * 0.08);
        for (let k = 0; k < this.dots.length; k++) { const t = (k + 1) / (this.dots.length + 1), m = this.dots[k]; m.visible = true; m.position.set((p.x + (pv.lx - p.x) * t) / T, 0.5 + Math.sin(t * Math.PI) * 1.2, (p.y + (pv.ly - p.y) * t) / T); }
      } else ring.visible = false;
    });
    if (!shown) this.dots.forEach(m => m.visible = false);
  }
  // Partikel
  burst(x, y, tex, n, speed, tint) {
    for (let i = 0; i < n; i++) {
      if (this.parts.length > 260) break;
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
  project(x, y, h = 1.2) {
    const v = new THREE.Vector3(x / T, h, y / T).project(this.cam);
    return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H };
  }
  // ───────────────────────── Kamera ─────────────────────────
  updateCamera(dt, time) {
    const s = this.s, [a, b] = s.p, c = this.cam;
    let tx, tz, h, dz;
    if (s.bossStarted && !(s.bossObj && s.bossObj.dead && false)) {
      const r = s.arenaR; tx = (r.x + r.w / 2) / T; tz = (r.y + r.h / 2) / T + 0.9; h = 20.5; dz = 12.5;
    } else {
      const sep = Math.hypot(a.x - b.x, a.y - b.y) / T;
      tx = (a.x + b.x) / 2 / T; tz = (a.y + b.y) / 2 / T; h = 11.5 + Math.min(5, sep * 0.6); dz = h * 0.7;
    }
    const k = Math.min(1, dt * (s.bossStarted ? 2.2 : 4.5));
    this.cx += (tx - this.cx) * k; this.cz += (tz - this.cz) * k; this.ch += (h - this.ch) * k; this.dz = (this.dz === undefined ? dz : this.dz + (dz - this.dz) * k);
    let ox = 0, oy = 0;
    if (this.shakeT > 0) { this.shakeT -= dt; ox = (Math.random() - 0.5) * this.shakeI * 0.05; oy = (Math.random() - 0.5) * this.shakeI * 0.05; }
    c.position.set(this.cx + ox, this.ch + oy, this.cz + this.dz);
    c.lookAt(this.cx + ox, 0, this.cz - 0.6);
  }
  dispose() {
    this.scene.traverse(o => { if (o.geometry && !o.isInstancedMesh) o.geometry.dispose && 0; });
    document.getElementById('three').style.display = 'none';
  }
}
