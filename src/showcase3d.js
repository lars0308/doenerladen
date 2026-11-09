// 3D-Bühne für Menü, Charakterwahl und Story: eine kleine schwebende Insel mit animierten Figuren.
class Showcase3D {
  constructor(theme = 'alley', opts = {}) {
    this.r = sharedRenderer(); document.getElementById('three').style.display = 'block';
    const th = this.th = TH3[theme]; this.theme = theme;
    this.scene = new THREE.Scene(); const sc = this.scene;
    sc.background = View3D.prototype.skyTexture.call({}, th.sky[0], th.sky[1]); sc.fog = new THREE.Fog(th.fog, 20, 70);
    sc.add(new THREE.HemisphereLight(0xffffff, 0xb0a4d8, 0.95));
    const sun = new THREE.DirectionalLight(0xffffff, 0.9); sun.position.set(-4, 9, 7); sc.add(sun);
    this.cam = new THREE.PerspectiveCamera(opts.fov || 34, W / H, 0.5, 200);
    this.camBase = opts.cam || { x: 0, y: 2.6, z: 9.5, ly: 1.1 };
    this.chars = []; this.t = 0; this.shotT = 0;
    this.buildIsland(opts.w || 13, opts.d || 9);
  }
  buildIsland(w, d) {
    const sc = this.scene, th = this.th, mat = (m, r) => { const t = r ? recolorTexture(A3.imgs.platformer, r) : (() => { const q = new THREE.CanvasTexture(A3.imgs.platformer); q.flipY = false; q.encoding = THREE.sRGBEncoding; return q; })(); return new THREE.MeshLambertMaterial({ map: t }); };
    const fm = mat(th.floor, th.fr), wm = mat(th.wall, th.wr);
    let q = 5; const rnd = () => (q = (q * 1664525 + 1013904223) % 4294967296) / 4294967296;
    const view = Object.create(View3D.prototype); view.scene = sc;
    const fl = [], wl = [];
    for (let i = 0; i < w; i++) for (let j = 0; j < d; j++) fl.push({ x: i - w / 2 + 0.5, y: -1, z: j - d / 2 + 0.5, s: 0.97 });
    for (let i = -1; i <= w; i++) { wl.push({ x: i - w / 2 + 0.5, y: 0, z: -d / 2 - 0.5, sx: 0.97, sy: 1.25, sz: 0.97 }); }
    view.inst(th.floor, fl, fm); view.inst(th.wall, wl, wm);
    const props = {};
    for (let i = 0; i < w; i++) for (let j = 0; j < d - 2; j++) if (rnd() < 0.07 && Math.abs(i - w / 2 + 0.5) > 2.5) { const k = th.ground[Math.floor(rnd() * th.ground.length)]; (props[k] = props[k] || []).push({ x: i - w / 2 + 0.5 + (rnd() - 0.5) * 0.6, y: 0, z: j - d / 2 + 0.5 + 1 + (rnd() - 0.5) * 0.6, ry: rnd() * 6, s: 1.7 }); }
    for (let i = -1; i <= w; i += 2) { const k = th.wallTop[Math.floor(rnd() * th.wallTop.length)]; (props[k] = props[k] || []).push({ x: i - w / 2 + 0.5, y: 1.25, z: -d / 2 - 0.5, ry: 0, s: /container|chimney|tank|crypt/.test(k) ? 1.1 : 1.7 }); }
    for (const k in props) view.inst(k, props[k]);
    // Insel-Unterseite + Wolken
    const under = []; for (let i = 0; i < 5; i++) under.push({ x: (rnd() - 0.5) * w * 0.6, y: -3.2 - rnd(), z: (rnd() - 0.5) * d * 0.5, s: 1.2 + rnd() * 1.4, ry: rnd() * 6 });
    view.inst('p:block-grass-large', under, fm);
    const cl = []; for (let i = 0; i < 16; i++) cl.push({ x: (rnd() - 0.5) * 60, y: -6 - rnd() * 8, z: (rnd() - 0.5) * 50 - 6, s: 3 + rnd() * 4, ry: rnd() * 6 });
    view.inst('s:cloud', cl, new THREE.MeshLambertMaterial({ color: 0xffffff }));
    this.view = view;
  }
  // type: 'player' (color) oder Modellschlüssel für NPCs
  addChar(o) {
    const root = new THREE.Group();
    const model = o.model ? a3clone(o.model, o.scale || 1.5) : makePlayerModel(o.color, 'p:character-oobi', o.scale || 1.5);
    root.add(model); root.position.set(o.x || 0, 0, o.z || 0); root.rotation.y = o.yaw || 0;
    const mixer = new THREE.AnimationMixer(model), acts = {}; a3anims(o.model || 'p:character-oobi').forEach(a => { acts[a.name] = mixer.clipAction(a); });
    const ch = { root, model, mixer, acts, cur: null, base: { x: o.x || 0, z: o.z || 0 } };
    if (o.color) { const col = PLAYER_COLORS.find(c => c.id === o.color); const vac = makeVacuum(col.css); root.add(vac); ch.vac = vac; vac.scale.setScalar(o.scale ? o.scale * 0.84 : 1.2); }
    if (o.name) { const lab = nameSprite(o.name, (PLAYER_COLORS.find(c => c.id === o.color) || { css: '#fff' }).css); lab.position.set(0, (o.scale || 1.5) * 1.35 + 0.3, 0); lab.scale.set(2.6, 0.65, 1); root.add(lab); ch.label = lab; }
    this.scene.add(root); this.chars.push(ch); this.play(ch, o.anim || 'idle'); return ch;
  }
  setColor(ch, colorId) { const tex = playerTexture(colorId); ch.model.traverse(n => { if (n.isMesh) { n.material.map = tex; n.material.needsUpdate = true; } }); }
  play(ch, name) { const a = ch.acts[name]; if (!a || ch.cur === name) return; const o = ch.acts[ch.cur]; a.reset().play(); if (o) a.crossFadeFrom(o, 0.2, false); ch.cur = name; }
  clear() { this.chars.forEach(c => this.scene.remove(c.root)); this.chars = []; }
  update(dt, time, orbit = 0.25) {
    this.t += dt; const b = this.camBase;
    const a = Math.sin(time / 4000) * orbit;
    this.cam.position.set(b.x + Math.sin(a) * 4, b.y + Math.sin(time / 3000) * 0.15, b.z * Math.cos(a)); this.cam.lookAt(b.x, b.ly, 0);
    this.chars.forEach(c => { c.mixer.update(dt); if (c.vac) { handLocal(c.model, c.root, _hv); updateVac(c.vac, _hv, time, false, 0.45); } });
    this.r.render(this.scene, this.cam);
  }
  dispose() { document.getElementById('three').style.display = 'none'; disposeScene(this.scene); }
}

// Porträt-Bilder (transparent) für HUD und Dialoge: alle fünf Farben + Bürgermeisterin + Dr. Unrat
function makePortraits(phaserScene) {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true });
  r.setSize(256, 256, false); r.setClearColor(0x000000, 0); r.outputEncoding = THREE.sRGBEncoding;
  const sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight(0xffffff, 0xa89ad0, 1.0)); const dl = new THREE.DirectionalLight(0xffffff, 0.85); dl.position.set(-2, 4, 5); sc.add(dl);
  const cam = new THREE.PerspectiveCamera(26, 1, 0.1, 20); cam.position.set(0.3, 0.75, 3.6); cam.lookAt(0, 0.42, 0);
  const jobs = [...PLAYER_COLORS.map(c => ['port_' + c.id, () => makePlayerModel(c.id, 'p:character-oobi', 1.5)]), ['port_chief', () => a3clone('p:character-ooli', 1.5)], ['port_unrat', () => a3clone('p:character-oodi', 1.5)]];
  for (const [key, mk] of jobs) {
    const m = mk(); m.rotation.y = 0.35; sc.add(m); r.render(sc, cam);
    const out = document.createElement('canvas'); out.width = 256; out.height = 256; out.getContext('2d').drawImage(cv, 0, 0);
    if (phaserScene.textures.exists(key)) phaserScene.textures.remove(key); phaserScene.textures.addCanvas(key, out); sc.remove(m);
  }
  r.dispose(); r.forceContextLoss && r.forceContextLoss();
}
