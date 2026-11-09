// Laden und Aufbereiten der 3D-Assets (Kenney Platformer/Graveyard/Food/Industrial Kit, Quaternius Monster – alle CC0).
const A3 = { m: {}, fbx: {}, imgs: {}, ready: false, shadowTex: null, cache: {} };

// Ein gemeinsamer WebGL-Renderer für Spiel, Menü und Story (eine Leinwand hinter dem Phaser-HUD)
function sharedRenderer() {
  if (!sharedRenderer.r) {
    const canvas = document.getElementById('three');
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75)); r.setSize(W, H, false); r.outputEncoding = THREE.sRGBEncoding;
    r.shadowMap.enabled = localStorage.getItem('muellalarm_noshadow') !== '1'; r.shadowMap.type = THREE.PCFSoftShadowMap;
    sharedRenderer.r = r;
  }
  return sharedRenderer.r;
}

function b64ToBuf(b64) { const s = atob(b64), n = s.length, u = new Uint8Array(n); for (let i = 0; i < n; i++) u[i] = s.charCodeAt(i); return u.buffer; }

function loadAssets3D(progress) {
  const jobs = [];
  for (const pack in ASSETS.packs) {
    const P = ASSETS.packs[pack], url = 'data:image/png;base64,' + P.tex;
    const mgr = new THREE.LoadingManager(); mgr.setURLModifier(u => (/colormap\.png/.test(u) ? url : u));
    const loader = new THREE.GLTFLoader(mgr);
    A3.m[pack] = {};
    jobs.push(new Promise(res => { const i = new Image(); i.onload = () => { A3.imgs[pack] = i; res(); }; i.src = url; }));
    for (const name in P.models) jobs.push(new Promise((res, rej) => loader.parse(b64ToBuf(P.models[name]), '', g => { A3.m[pack][name] = g; if (progress) progress(); res(); }, rej)));
  }
  const fl = new THREE.FBXLoader();
  for (const n in ASSETS.fbx) A3.fbx[n] = fl.parse(b64ToBuf(ASSETS.fbx[n]), '');
  // Weicher Schatten-Fleck
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(0,0,0,0.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); A3.shadowTex = new THREE.CanvasTexture(cv);
  return Promise.all(jobs).then(() => { A3.ready = true; });
}

// Kurzform: Modell aus einem Paket (p=platformer, g=graveyard, f=food, i=industrial, s=starter)
const PK = { p: 'platformer', g: 'graveyard', f: 'food', i: 'industrial', s: 'starter' };
function a3clone(key, scale = 1) {
  const [k, n] = key.split(':'); const g = A3.m[PK[k]][n]; if (!g) throw new Error('Modell fehlt: ' + key);
  const o = THREE.SkeletonUtils.clone(g.scene); o.scale.setScalar(scale); return o;
}
function a3anims(key) { const [k, n] = key.split(':'); return A3.m[PK[k]][n].animations; }
// Geometrie + Material eines Modells für Instancing (Weltmatrix eingebacken)
function a3parts(key) {
  if (A3.cache[key]) return A3.cache[key];
  const [k, n] = key.split(':'); const g = A3.m[PK[k]][n]; const parts = [];
  g.scene.updateMatrixWorld(true);
  g.scene.traverse(o => { if (o.isMesh) { const geo = o.geometry.clone(); geo.applyMatrix4(o.matrixWorld); parts.push({ geo, mat: o.material }); } });
  return (A3.cache[key] = parts);
}

// ── Umfärben der Farbpaletten-Textur ──
function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0;
  if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; }
  return [h, s, l];
}
function hsl2rgb(h, s, l) {
  const f = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  return [f(p, q, h + 1 / 3) * 255, f(p, q, h) * 255, f(p, q, h - 1 / 3) * 255];
}
// rules: [{ test(h,s,l), to(h,s,l) -> [h,s,l] }]
function recolorTexture(img, rules) {
  const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
  const g = cv.getContext('2d'); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, cv.width, cv.height), a = d.data;
  for (let i = 0; i < a.length; i += 4) {
    if (a[i + 3] < 10) continue;
    const [h, s, l] = rgb2hsl(a[i], a[i + 1], a[i + 2]);
    for (const r of rules) if (r.test(h, s, l)) { const o = r.to(h, s, l), c = hsl2rgb(o[0], Math.max(0, Math.min(1, o[1])), Math.max(0, Math.min(1, o[2]))); a[i] = c[0]; a[i + 1] = c[1]; a[i + 2] = c[2]; break; }
  }
  g.putImageData(d, 0, 0);
  const t = new THREE.CanvasTexture(cv); t.flipY = false; t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
}
const isGreen = (h, s, l) => h > 0.2 && h < 0.5 && s > 0.25;
const isEarth = (h, s, l) => (h < 0.12 || h > 0.95) && s > 0.3 && l < 0.7;
const isWhite = (h, s, l) => s < 0.22 && l > 0.8;

// Die fünf Spielerfarben (Anzug des Kenney-Aliens)
const PLAYER_COLORS = [
  { id: 'green',  name: 'Grün',   css: '#3fd35a', hue: 0.34, sat: 0.62, lit: 0.5 },
  { id: 'red',    name: 'Rot',    css: '#ff4a4a', hue: 0.0,  sat: 0.8,  lit: 0.52 },
  { id: 'blue',   name: 'Blau',   css: '#3fa7ff', hue: 0.58, sat: 0.8,  lit: 0.56 },
  { id: 'white',  name: 'Weiß',   css: '#f2f2f2', hue: 0.0,  sat: 0.0,  lit: 0.93 },
  { id: 'purple', name: 'Lila',   css: '#a05bff', hue: null },   // Originalfarbe
];
function playerTexture(colorId) {
  const key = 'ptex_' + colorId; if (A3.cache[key]) return A3.cache[key];
  const c = PLAYER_COLORS.find(x => x.id === colorId) || PLAYER_COLORS[2];
  let t;
  if (c.hue === null) t = recolorTexture(A3.imgs.platformer, [{ test: (h, s, l) => s < 0.6 && l > 0.78, to: (h, s, l) => [0.75, 0.6, 0.62 + (l - 0.78) * 0.7] }]);
  else t = recolorTexture(A3.imgs.platformer, [{ test: (h, s, l) => s < 0.6 && l > 0.78 && c.id !== 'white', to: (h, s, l) => [c.hue, Math.max(0.55, c.sat), 0.58 + (l - 0.78) * 0.7] }, { test: (h, s, l) => h > 0.68 && h < 0.9 && s > 0.2 && l > 0.15, to: (h, s, l) => [c.hue, c.sat, c.id === 'white' ? Math.min(0.95, l + 0.45) : Math.min(0.85, l * 0.5 + c.lit * 0.55)] }]);
  return (A3.cache[key] = t);
}
// Ein Spieler-Modell (animiert) in der gewählten Farbe
function makePlayerModel(colorId, model = 'p:character-oobi', scale = 0.95) {
  const o = a3clone(model, scale), tex = playerTexture(colorId);
  o.traverse(n => { if (n.isMesh) { n.material = n.material.clone(); n.material.map = tex; n.material.needsUpdate = true; n.frustumCulled = false; } });
  return o;
}
