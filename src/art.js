// Comic-Grafiken: alles wird beim Start per Code gezeichnet (dicke Outlines, kräftige Farben).
const OUT = 0x16101f;
const W = 1280, H = 720, T = 48;

function mk(scene, key, w, h, fn) {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  fn(g, w, h);
  g.generateTexture(key, w, h);
  g.destroy();
}
function C(g, x, y, r, fill, lw = 4) { g.fillStyle(fill, 1); g.fillCircle(x, y, r); if (lw) { g.lineStyle(lw, OUT, 1); g.strokeCircle(x, y, r); } }
function E(g, x, y, w, h, fill, lw = 4) { g.fillStyle(fill, 1); g.fillEllipse(x, y, w, h); if (lw) { g.lineStyle(lw, OUT, 1); g.strokeEllipse(x, y, w, h); } }
function R(g, x, y, w, h, fill, rad = 6, lw = 4) { g.fillStyle(fill, 1); g.fillRoundedRect(x, y, w, h, rad); if (lw) { g.lineStyle(lw, OUT, 1); g.strokeRoundedRect(x, y, w, h, rad); } }
function P(g, pts, fill, lw = 4) { g.fillStyle(fill, 1); g.fillPoints(pts, true); if (lw) { g.lineStyle(lw, OUT, 1); g.strokePoints(pts, true, true); } }
function Ln(g, x1, y1, x2, y2, col = OUT, lw = 4) { g.lineStyle(lw, col, 1); g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.strokePath(); }
function shade(c, f) {
  const r = Math.min(255, Math.max(0, Math.round(((c >> 16) & 255) * f)));
  const g = Math.min(255, Math.max(0, Math.round(((c >> 8) & 255) * f)));
  const b = Math.min(255, Math.max(0, Math.round((c & 255) * f)));
  return (r << 16) | (g << 8) | b;
}
function grad(g, w, h, c1, c2) {
  const a = Phaser.Display.Color.IntegerToColor(c1), b = Phaser.Display.Color.IntegerToColor(c2), n = 48;
  for (let i = 0; i < n; i++) {
    const c = Phaser.Display.Color.Interpolate.ColorWithColor(a, b, n - 1, i);
    g.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b), 1); g.fillRect(0, Math.floor(i * h / n), w, Math.ceil(h / n) + 1);
  }
}
function rng(seed) { let s = seed; return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; }

const THEMES = {
  alley:   { base: 0xb25b52, dark: 0x6d3236, top: 0x7ed957, topDark: 0x3f9e3a, sky: [0x3b2a6b, 0xff8e5e], name: 'Hinterhof' },
  sewer:   { base: 0x4f8573, dark: 0x244a42, top: 0xa5e05a, topDark: 0x5c9e2d, sky: [0x0f2a2a, 0x2f6b4f], name: 'Kanalisation' },
  junk:    { base: 0xa8733f, dark: 0x5e3a1f, top: 0xe3b04a, topDark: 0xa47224, sky: [0xd98a45, 0xffd68a], name: 'Schrottplatz' },
  factory: { base: 0x5d6f95, dark: 0x2c3652, top: 0xffc83d, topDark: 0x1c1c26, sky: [0x10162b, 0x3a4b7a], name: 'Unrat-Fabrik' },
};

function drawMonster(g, col, ox = 0, oy = 0, noNozzle = false) {
  const dark = shade(col, 0.7);
  // Füße
  R(g, ox + 18, oy + 58, 18, 12, dark, 5); R(g, ox + 42, oy + 58, 18, 12, dark, 5);
  // Körper
  E(g, ox + 38, oy + 38, 60, 56, col);
  g.fillStyle(0xffffff, 0.28); g.fillEllipse(ox + 28, oy + 24, 22, 12);
  // Hörnchen
  P(g, [{ x: ox + 20, y: oy + 16 }, { x: ox + 14, y: oy + 2 }, { x: ox + 32, y: oy + 11 }], dark);
  P(g, [{ x: ox + 46, y: oy + 11 }, { x: ox + 62, y: oy + 2 }, { x: ox + 58, y: oy + 18 }], dark);
  // Augen
  C(g, ox + 30, oy + 30, 10, 0xffffff); C(g, ox + 50, oy + 30, 10, 0xffffff);
  C(g, ox + 34, oy + 31, 4.5, OUT, 0); C(g, ox + 54, oy + 31, 4.5, OUT, 0);
  // Mund
  g.lineStyle(3, OUT, 1); g.beginPath(); g.arc(ox + 40, oy + 46, 7, 0.2, Math.PI - 0.2); g.strokePath();
  if (!noNozzle) {
    R(g, ox + 60, oy + 38, 14, 16, 0x9aa3b2, 4);
    R(g, ox + 70, oy + 34, 8, 24, 0x69727f, 3);
  }
}

function makeArt(scene) {
  // ---------- Spieler ----------
  mk(scene, 'knox', 80, 72, g => drawMonster(g, 0x3fa7ff));
  mk(scene, 'zippy', 80, 72, g => drawMonster(g, 0xff9a2e));
  // ---------- Müll (Munition) ----------
  mk(scene, 'trash0', 30, 30, g => { R(g, 4, 5, 22, 22, 0xc7ccd6, 5); Ln(g, 8, 11, 22, 11, 0x7b8494, 3); Ln(g, 8, 18, 22, 18, 0x7b8494, 3); });   // Dose
  mk(scene, 'trash1', 30, 30, g => { E(g, 15, 16, 24, 14, 0xffe15a); P(g, [{ x: 22, y: 12 }, { x: 28, y: 6 }, { x: 28, y: 17 }], 0xd9b92c, 3); }); // Banane
  mk(scene, 'trash2', 30, 30, g => { R(g, 9, 9, 12, 19, 0x66c66b, 4); R(g, 12, 2, 6, 9, 0x66c66b, 3); });                                              // Flasche
  mk(scene, 'trash3', 30, 30, g => { C(g, 15, 16, 12, 0xf4f4f4); Ln(g, 8, 10, 22, 22, 0xb5b5b5, 3); Ln(g, 20, 8, 9, 21, 0xb5b5b5, 3); });          // Knüllpapier
  // ---------- Gegner ----------
  mk(scene, 'e_walker', 50, 50, g => {
    R(g, 10, 40, 11, 8, 0x333, 3); R(g, 29, 40, 11, 8, 0x333, 3);
    E(g, 25, 26, 40, 38, 0x6b8f4a); P(g, [{ x: 18, y: 10 }, { x: 25, y: 1 }, { x: 32, y: 10 }], 0x56773b);
    Ln(g, 14, 19, 22, 23, OUT, 3); Ln(g, 36, 19, 28, 23, OUT, 3);
    C(g, 19, 26, 5, 0xffffff, 3); C(g, 31, 26, 5, 0xffffff, 3); C(g, 20, 27, 2, OUT, 0); C(g, 30, 27, 2, OUT, 0);
    g.lineStyle(3, OUT, 1); g.beginPath(); g.moveTo(18, 36); g.lineTo(32, 36); g.strokePath();
  });
  mk(scene, 'e_flyer', 56, 46, g => {
    E(g, 14, 12, 24, 16, 0xcfe9ff, 3); E(g, 42, 12, 24, 16, 0xcfe9ff, 3);
    E(g, 28, 28, 34, 28, 0x4a4a5a); C(g, 22, 25, 6, 0xff5a5a, 3); C(g, 34, 25, 6, 0xff5a5a, 3);
    C(g, 22, 25, 2, OUT, 0); C(g, 34, 25, 2, OUT, 0);
    Ln(g, 24, 42, 22, 46, OUT, 3); Ln(g, 32, 42, 34, 46, OUT, 3);
  });
  mk(scene, 'e_turret', 52, 56, g => {
    R(g, 6, 38, 40, 16, 0x555d6e, 5); R(g, 10, 10, 32, 34, 0xd35a5a, 6);
    R(g, 16, 2, 20, 12, 0x888fa0, 4);
    C(g, 20, 26, 5, 0xffffff, 3); C(g, 32, 26, 5, 0xffffff, 3); C(g, 21, 27, 2, OUT, 0); C(g, 31, 27, 2, OUT, 0);
    Ln(g, 14, 18, 24, 22, OUT, 3); Ln(g, 38, 18, 28, 22, OUT, 3);
  });
  mk(scene, 'e_charger', 62, 40, g => {
    Ln(g, 4, 26, 0, 18, OUT, 4);
    E(g, 30, 24, 46, 28, 0x9b8b84); C(g, 46, 18, 7, 0x9b8b84); C(g, 54, 25, 8, 0xb5a59e);
    C(g, 52, 21, 4, 0xffffff, 3); C(g, 53, 21, 1.5, OUT, 0); C(g, 61, 25, 2.5, 0xff7a9a, 0);
    R(g, 14, 34, 9, 6, 0x333, 3); R(g, 36, 34, 9, 6, 0x333, 3);
    Ln(g, 48, 12, 56, 12, OUT, 3);
  });
  mk(scene, 'e_armor', 54, 54, g => {
    R(g, 10, 44, 12, 8, 0x333, 3); R(g, 32, 44, 12, 8, 0x333, 3);
    E(g, 27, 32, 38, 34, 0x8b6f9b);
    R(g, 6, 6, 42, 26, 0xaab4c4, 6); R(g, 4, 26, 46, 6, 0x7b8494, 3);
    C(g, 20, 34, 4.5, 0xffffff, 3); C(g, 34, 34, 4.5, 0xffffff, 3); C(g, 21, 35, 2, OUT, 0); C(g, 33, 35, 2, OUT, 0);
    Ln(g, 14, 29, 22, 32, OUT, 3); Ln(g, 40, 29, 32, 32, OUT, 3);
  });
  mk(scene, 'goo', 22, 22, g => { C(g, 11, 11, 9, 0x8cf06a); C(g, 8, 8, 2.5, 0xffffff, 0); });
  mk(scene, 'bomb', 30, 30, g => { C(g, 15, 17, 11, 0x2a2a35); Ln(g, 15, 6, 20, 1, 0xff9a2e, 3); C(g, 21, 1, 2.5, 0xff3a2e, 0); });
  mk(scene, 'shock', 40, 44, g => { P(g, [{ x: 4, y: 42 }, { x: 20, y: 2 }, { x: 36, y: 42 }], 0xffe15a); Ln(g, 20, 14, 20, 38, 0xff7a2e, 3); });
  mk(scene, 'splat', 26, 26, g => { g.fillStyle(0xffffff, 1); g.fillCircle(13, 13, 11); });
  mk(scene, 'puff', 16, 16, g => { g.fillStyle(0xffffff, 1); g.fillCircle(8, 8, 7); });
  mk(scene, 'star', 22, 22, g => { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 4.5 : 10; p.push({ x: 11 + Math.cos(a) * r, y: 11 + Math.sin(a) * r }); } P(g, p, 0xffe15a, 2); });

  // ---------- Welten ----------
  for (const k in THEMES) {
    const th = THEMES[k];
    mk(scene, 'fill_' + k, T, T, g => {
      g.fillStyle(th.base, 1); g.fillRect(0, 0, T, T);
      g.lineStyle(3, th.dark, 1);
      if (k === 'alley') { g.strokeRect(0, 0, T, T / 2); g.strokeRect(-T / 2, T / 2, T, T / 2); g.strokeRect(T / 2, T / 2, T, T / 2); }
      else if (k === 'sewer') { g.strokeRect(1, 1, T - 2, T - 2); Ln(g, 0, T / 2, T, T / 2, th.dark, 3); Ln(g, 18, 0, 18, T / 2, th.dark, 3); Ln(g, 32, T / 2, 32, T, th.dark, 3); }
      else if (k === 'junk') { g.fillStyle(th.dark, 1); g.fillCircle(8, 8, 3); g.fillCircle(40, 8, 3); g.fillCircle(8, 40, 3); g.fillCircle(40, 40, 3); g.strokeRect(2, 2, T - 4, T - 4); Ln(g, 6, 24, 42, 24, th.dark, 3); }
      else { g.strokeRect(2, 2, T - 4, T - 4); Ln(g, 2, 2, T - 2, T - 2, th.dark, 3); g.fillStyle(th.dark, 1); g.fillCircle(8, 8, 2.5); g.fillCircle(40, 8, 2.5); g.fillCircle(8, 40, 2.5); g.fillCircle(40, 40, 2.5); }
    });
    mk(scene, 'top_' + k, T, T, g => {
      g.fillStyle(th.base, 1); g.fillRect(0, 0, T, T);
      g.lineStyle(3, th.dark, 1); g.strokeRect(1, 14, T - 2, T - 15);
      if (k === 'factory') {
        g.fillStyle(th.top, 1); g.fillRect(0, 0, T, 14);
        g.fillStyle(th.topDark, 1); for (let i = -1; i < 5; i++) g.fillPoints([{ x: i * 14, y: 0 }, { x: i * 14 + 7, y: 0 }, { x: i * 14 + 1, y: 14 }, { x: i * 14 - 6, y: 14 }], true);
      } else {
        g.fillStyle(th.top, 1); g.fillRect(0, 0, T, 12);
        g.fillStyle(th.topDark, 1); for (let i = 0; i < 5; i++) g.fillTriangle(i * 10 - 2, 10, i * 10 + 8, 10, i * 10 + 3, 20);
      }
      g.lineStyle(4, OUT, 1); Ln(g, 0, 1, T, 1, OUT, 4);
    });
    mk(scene, 'plat_' + k, T, 22, g => {
      R(g, 1, 2, T - 2, 18, th.top, 6); g.fillStyle(th.topDark, 1); g.fillRect(6, 12, T - 12, 4);
    });
    // Hintergründe
    mk(scene, 'bgfar_' + k, W, H, g => {
      grad(g, W, H, th.sky[0], th.sky[1]);
      const r = rng(k.length * 77 + 5);
      if (k === 'alley') {
        g.fillStyle(0xfff3c4, 1); g.fillCircle(980, 150, 60); g.fillStyle(0x3b2a6b, 0.25); g.fillCircle(960, 140, 40);
        for (let i = 0; i < 9; i++) { const w = 110 + r() * 60, h = 200 + r() * 220, x = i * 150 + 4; g.fillStyle(0x2c2050, 1); g.fillRect(x, H - 140 - h, w, h + 140); g.fillStyle(0xffe9a0, 0.9); for (let yy = 0; yy < h; yy += 44) for (let xx = 12; xx < w - 20; xx += 34) if (r() > 0.55) g.fillRect(x + xx, H - 140 - h + 20 + yy, 16, 22); }
      } else if (k === 'sewer') {
        for (let i = 0; i < 6; i++) { g.lineStyle(26, 0x1c4a3e, 1); g.beginPath(); g.moveTo(0, 90 + i * 100); g.lineTo(W, 90 + i * 100); g.strokePath(); g.lineStyle(6, 0x2f7d63, 1); g.beginPath(); g.moveTo(0, 82 + i * 100); g.lineTo(W, 82 + i * 100); g.strokePath(); }
        for (let i = 0; i < 6; i++) { g.fillStyle(0x16352f, 1); g.fillRect(i * 230 + 20, 0, 36, H); g.fillStyle(0xb6ff6a, 0.12); g.fillCircle(i * 230 + 38, 200 + r() * 300, 70); }
      } else if (k === 'junk') {
        g.fillStyle(0xfff0c0, 0.9); g.fillCircle(240, 140, 70);
        for (let i = 0; i < 7; i++) { const x = i * 190 + 10, h = 120 + r() * 180; g.fillStyle(0x7d5532, 1); g.fillTriangle(x, H, x + 90, H - h, x + 180, H); }
        for (let i = 0; i < 18; i++) { g.fillStyle([0x6b4a2b, 0x8c6a3f, 0x5a5a66][i % 3], 1); g.fillRect(40 + r() * 1100, H - 160 - r() * 200, 30 + r() * 40, 18 + r() * 20); }
      } else {
        for (let i = 0; i < 5; i++) { const cx = 120 + i * 270, cy = 140 + (i % 2) * 220, rr = 90 + (i % 3) * 20; g.fillStyle(0x1b2442, 1); g.fillCircle(cx, cy, rr); g.fillStyle(0x2c3a66, 1); g.fillCircle(cx, cy, rr - 22); g.fillStyle(0x1b2442, 1); g.fillCircle(cx, cy, 22); for (let a = 0; a < 8; a++) { const an = a * Math.PI / 4; g.fillRect(cx + Math.cos(an) * rr - 10, cy + Math.sin(an) * rr - 10, 20, 20); } }
        g.fillStyle(0xff4a4a, 0.5); for (let i = 0; i < 12; i++) g.fillCircle(30 + i * 105, 40 + (i % 3) * 30, 4);
      }
    });
    mk(scene, 'bgnear_' + k, W, H, g => {
      const r = rng(k.length * 31 + 9);
      if (k === 'alley') { for (let i = 0; i < 5; i++) { const x = i * 260 + 20; g.fillStyle(0x251a45, 1); g.fillRect(x, H - 330 + r() * 40, 120, 400); g.fillStyle(0x1a1233, 1); g.fillRect(x + 120, H - 40 - 200, 8, 240); g.fillStyle(0xffe08a, 1); g.fillCircle(x + 124, H - 250, 16); } }
      else if (k === 'sewer') { for (let i = 0; i < 6; i++) { const x = i * 220 + 50; g.fillStyle(0x0f2823, 1); g.fillRect(x, 0, 18, 280 + r() * 160); g.fillStyle(0x8cf06a, 0.7); g.fillCircle(x + 9, 300 + r() * 120, 7); } }
      else if (k === 'junk') { for (let i = 0; i < 5; i++) { const x = i * 250 + 10, y = H - 230 + r() * 60; g.fillStyle(0x4a3220, 1); g.fillRoundedRect(x, y, 150, 60, 12); g.fillStyle(0x2a1a10, 1); g.fillCircle(x + 30, y + 60, 24); g.fillCircle(x + 120, y + 60, 24); g.fillRect(x + 30, y - 30, 80, 34); } }
      else { for (let i = 0; i < 6; i++) { const x = i * 215 + 30; g.fillStyle(0x121a33, 1); g.fillRect(x, 0, 34, H); g.fillStyle(0xffc83d, 1); for (let yy = 0; yy < H; yy += 60) g.fillRect(x, yy, 34, 14); } }
    });
  }

  // ---------- Objekte ----------
  mk(scene, 'gate', T, T, g => { R(g, 4, 0, T - 8, T, 0xf2f2f2, 4); Ln(g, 10, 6, 10, T - 6, 0x888, 3); Ln(g, T - 10, 6, T - 10, T - 6, 0x888, 3); g.fillStyle(OUT, 1); g.fillRect(4, 20, T - 8, 8); });
  mk(scene, 'crate', T, T, g => { R(g, 2, 2, T - 4, T - 4, 0xc99a5b, 5); Ln(g, 6, 6, T - 6, T - 6, 0x8a5f2e, 4); Ln(g, T - 6, 6, 6, T - 6, 0x8a5f2e, 4); });
  mk(scene, 'spikes', T, 26, g => { for (let i = 0; i < 4; i++) P(g, [{ x: i * 12 + 1, y: 25 }, { x: i * 12 + 6, y: 2 }, { x: i * 12 + 11, y: 25 }], 0xd8dde6, 3); });
  mk(scene, 'coin', 26, 26, g => { C(g, 13, 13, 11, 0xffd23f); C(g, 13, 13, 5, 0xe0a410, 3); g.fillStyle(0xffffff, 0.6); g.fillCircle(8, 8, 2.5); });
  mk(scene, 'flag', 34, 70, g => { R(g, 3, 4, 6, 64, 0xbfc5d2, 3); P(g, [{ x: 9, y: 6 }, { x: 32, y: 15 }, { x: 9, y: 26 }], 0xff5a5a, 3); });
  mk(scene, 'flag_on', 34, 70, g => { R(g, 3, 4, 6, 64, 0xbfc5d2, 3); P(g, [{ x: 9, y: 6 }, { x: 32, y: 15 }, { x: 9, y: 26 }], 0x5ae06a, 3); });
  mk(scene, 'exit', 120, 150, g => {
    R(g, 4, 20, 112, 130, 0x4a5568, 12); E(g, 60, 20, 112, 36, 0x6b778c);
    E(g, 60, 90, 80, 90, 0x10131c); g.fillStyle(0x7dff8a, 0.25); g.fillEllipse(60, 90, 60, 70);
    R(g, 22, 4, 76, 26, 0xffd23f, 6); Ln(g, 34, 17, 86, 17, OUT, 4);
    for (let i = 0; i < 4; i++) P(g, [{ x: 8 + i * 28, y: 140 }, { x: 22 + i * 28, y: 140 }, { x: 15 + i * 28, y: 150 }], 0xffd23f, 2);
  });
  mk(scene, 'exit_closed', 120, 150, g => { R(g, 4, 20, 112, 130, 0x4a5568, 12); E(g, 60, 20, 112, 36, 0x6b778c); R(g, 16, 40, 88, 100, 0x2a303c, 8); Ln(g, 30, 56, 90, 124, 0xff5a5a, 6); Ln(g, 90, 56, 30, 124, 0xff5a5a, 6); });
  mk(scene, 'sign', 44, 56, g => { R(g, 19, 26, 8, 30, 0x8a5f2e, 2); R(g, 2, 2, 40, 28, 0xf4e3b0, 5); Ln(g, 10, 12, 34, 12, OUT, 3); Ln(g, 10, 20, 28, 20, OUT, 3); });
  const COL = { red: 0xff4d4d, blue: 0x4da6ff, green: 0x4dff88, yellow: 0xffd24d, pink: 0xff7ad9 };
  for (const c in COL) {
    mk(scene, 'target_' + c + '_off', 56, 64, g => { Ln(g, 28, 0, 28, 10, 0x888, 4); C(g, 28, 38, 24, 0xdcdcdc); C(g, 28, 38, 16, 0x9a9aa8); C(g, 28, 38, 7, 0x6a6a78); });
    mk(scene, 'target_' + c + '_on', 56, 64, g => { Ln(g, 28, 0, 28, 10, 0x888, 4); C(g, 28, 38, 24, 0xffffff); C(g, 28, 38, 16, COL[c]); C(g, 28, 38, 7, 0xffffff); });
    mk(scene, 'plate_' + c + '_off', 70, 16, g => { R(g, 2, 2, 66, 14, 0x777f8f, 5); R(g, 8, 0, 54, 8, COL[c], 4); });
    mk(scene, 'plate_' + c + '_on', 70, 16, g => { R(g, 2, 8, 66, 8, 0x777f8f, 4); R(g, 8, 8, 54, 6, 0xffffff, 3); });
  }
  mk(scene, 'heart', 30, 28, g => { g.fillStyle(0xff4a6a, 1); g.fillCircle(9, 10, 8); g.fillCircle(21, 10, 8); g.fillTriangle(1, 14, 29, 14, 15, 27); g.lineStyle(3, OUT, 1); g.beginPath(); g.arc(9, 10, 8, Math.PI * 0.85, Math.PI * 1.95); g.strokePath(); g.beginPath(); g.arc(21, 10, 8, Math.PI * 1.05, Math.PI * 2.15); g.strokePath(); Ln(g, 2, 15, 15, 27, OUT, 3); Ln(g, 28, 15, 15, 27, OUT, 3); });
  mk(scene, 'heart_e', 30, 28, g => { g.fillStyle(0x55455f, 1); g.fillCircle(9, 10, 8); g.fillCircle(21, 10, 8); g.fillTriangle(1, 14, 29, 14, 15, 27); });
  mk(scene, 'link', 10, 10, g => { C(g, 5, 5, 4, 0xc8ccd6, 2); });
  mk(scene, 'dot', 8, 8, g => { g.fillStyle(0xffffff, 1); g.fillCircle(4, 4, 3.5); });
  mk(scene, 'shield', 300, 300, g => { g.fillStyle(0x66e6ff, 0.22); g.fillCircle(150, 150, 146); g.lineStyle(6, 0xbff6ff, 0.9); g.strokeCircle(150, 150, 146); });
  mk(scene, 'crusher', 72, 200, g => { R(g, 28, 0, 16, 150, 0x6b778c, 3); R(g, 0, 150, 72, 50, 0x8b94a8, 8); g.fillStyle(0xff4a4a, 1); for (let i = 0; i < 4; i++) g.fillTriangle(i * 18 + 2, 198, i * 18 + 10, 180, i * 18 + 16, 198); });
  mk(scene, 'laser_emit', 40, 22, g => { R(g, 2, 2, 36, 18, 0x555d6e, 5); C(g, 20, 20, 6, 0xff4a4a, 3); });
  mk(scene, 'laser_beam', 10, 20, g => { g.fillStyle(0xff3a3a, 0.9); g.fillRect(2, 0, 6, 20); g.fillStyle(0xffffff, 0.9); g.fillRect(4, 0, 2, 20); });
  mk(scene, 'conv', T, 18, g => { R(g, 0, 2, T, 16, 0x555d6e, 4); g.fillStyle(0xffc83d, 1); for (let i = 0; i < 3; i++) g.fillTriangle(i * 16 + 4, 4, i * 16 + 4, 14, i * 16 + 14, 9); });

  // ---------- Bosse ----------
  mk(scene, 'boss_can', 200, 230, g => {
    R(g, 24, 40, 152, 186, 0x7f8c9a, 14); g.fillStyle(0xffffff, 0.15); g.fillRect(40, 56, 20, 150);
    Ln(g, 70, 60, 70, 210, 0x5f6b79, 4); Ln(g, 130, 60, 130, 210, 0x5f6b79, 4);
    g.fillStyle(0xa8552e, 0.8); g.fillCircle(150, 190, 14); g.fillCircle(50, 150, 9);
    R(g, 8, 14, 184, 36, 0xa2b0be, 12); R(g, 78, 2, 44, 16, 0x6f7c8a, 6);
    C(g, 70, 118, 20, 0xffffff); C(g, 130, 118, 20, 0xffffff); C(g, 76, 122, 8, OUT, 0); C(g, 136, 122, 8, OUT, 0);
    Ln(g, 40, 90, 92, 106, OUT, 7); Ln(g, 160, 90, 108, 106, OUT, 7);
    R(g, 66, 164, 68, 24, 0x2a1d2a, 8); for (let i = 0; i < 5; i++) P(g, [{ x: 70 + i * 13, y: 164 }, { x: 82 + i * 13, y: 164 }, { x: 76 + i * 13, y: 178 }], 0xffffff, 2);
  });
  mk(scene, 'boss_slime', 250, 200, g => {
    E(g, 125, 120, 230, 150, 0x6ee05a); g.fillStyle(0xffffff, 0.25); g.fillEllipse(80, 80, 60, 24);
    for (let i = 0; i < 4; i++) E(g, 45 + i * 55, 190, 26, 18, 0x6ee05a);
    P(g, [{ x: 95, y: 44 }, { x: 125, y: 0 }, { x: 155, y: 44 }, { x: 140, y: 52 }, { x: 125, y: 34 }, { x: 110, y: 52 }], 0xffd23f);
    C(g, 85, 100, 22, 0xffffff); C(g, 165, 100, 22, 0xffffff); C(g, 92, 104, 9, OUT, 0); C(g, 158, 104, 9, OUT, 0);
    Ln(g, 55, 78, 105, 92, OUT, 7); Ln(g, 195, 78, 145, 92, OUT, 7);
    g.lineStyle(5, OUT, 1); g.beginPath(); g.arc(125, 140, 28, 0.15, Math.PI - 0.15); g.strokePath();
  });
  mk(scene, 'boss_slime_open', 250, 200, g => {
    E(g, 125, 120, 230, 150, 0x6ee05a); g.fillStyle(0xffffff, 0.25); g.fillEllipse(80, 80, 60, 24);
    for (let i = 0; i < 4; i++) E(g, 45 + i * 55, 190, 26, 18, 0x6ee05a);
    P(g, [{ x: 95, y: 44 }, { x: 125, y: 0 }, { x: 155, y: 44 }, { x: 140, y: 52 }, { x: 125, y: 34 }, { x: 110, y: 52 }], 0xffd23f);
    C(g, 85, 90, 22, 0xffffff); C(g, 165, 90, 22, 0xffffff); C(g, 85, 90, 9, OUT, 0); C(g, 165, 90, 9, OUT, 0);
    E(g, 125, 148, 100, 62, 0x2a1020); E(g, 125, 160, 56, 30, 0xff5a8a, 3); for (let i = 0; i < 4; i++) P(g, [{ x: 82 + i * 22, y: 120 }, { x: 96 + i * 22, y: 120 }, { x: 89 + i * 22, y: 134 }], 0xffffff, 2);
  });
  mk(scene, 'boss_digger', 320, 200, g => {
    R(g, 20, 150, 220, 46, 0x4a4f5c, 22); for (let i = 0; i < 5; i++) C(g, 48 + i * 42, 173, 11, 0x8b94a8, 3);
    R(g, 40, 56, 150, 100, 0xffc22e, 12); R(g, 56, 70, 80, 54, 0xbfe6ff, 8);
    C(g, 80, 96, 12, 0xffffff); C(g, 116, 96, 12, 0xffffff); C(g, 85, 99, 5, OUT, 0); C(g, 121, 99, 5, OUT, 0); Ln(g, 62, 74, 92, 86, OUT, 5); Ln(g, 134, 74, 104, 86, OUT, 5);
    R(g, 190, 78, 80, 20, 0xe6a21a, 6); R(g, 252, 78, 20, 90, 0xe6a21a, 6);
    P(g, [{ x: 250, y: 168 }, { x: 318, y: 150 }, { x: 318, y: 188 }, { x: 250, y: 190 }], 0x9aa3b2); for (let i = 0; i < 3; i++) P(g, [{ x: 312, y: 154 + i * 14 }, { x: 322, y: 160 + i * 14 }, { x: 312, y: 166 + i * 14 }], 0xdfe3ea, 2);
    R(g, 150, 30, 14, 30, 0x6b778c, 3);
  });
  mk(scene, 'boss_mech', 250, 270, g => {
    R(g, 40, 120, 34, 120, 0x6b778c, 8); R(g, 176, 120, 34, 120, 0x6b778c, 8);
    R(g, 24, 226, 66, 22, 0x4a4f5c, 8); R(g, 160, 226, 66, 22, 0x4a4f5c, 8);
    E(g, 125, 150, 190, 170, 0x8b94a8); g.fillStyle(0xffffff, 0.2); g.fillEllipse(86, 110, 60, 24);
    R(g, 2, 130, 40, 26, 0x2f3647, 8); R(g, 208, 130, 40, 26, 0x2f3647, 8);
    g.fillStyle(0xffc83d, 1); for (let i = 0; i < 5; i++) g.fillRect(60 + i * 26, 205, 14, 10);
    E(g, 125, 80, 130, 110, 0xbfe6ff); E(g, 125, 92, 70, 66, 0xf1d2b2);
    g.fillStyle(0xf1d2b2, 1); // Dr. Unrat
    E(g, 125, 94, 60, 60, 0xf1d2b2); g.fillStyle(0x6b4a2b, 1); g.fillEllipse(125, 112, 46, 14);
    C(g, 110, 86, 9, 0xffffff, 3); C(g, 140, 86, 9, 0xffffff, 3); C(g, 112, 87, 3, OUT, 0); C(g, 138, 87, 3, OUT, 0);
    Ln(g, 98, 74, 118, 80, OUT, 4); Ln(g, 152, 74, 132, 80, OUT, 4);
    g.lineStyle(3, OUT, 1); g.strokeEllipse(125, 80, 130, 110);
  });
  mk(scene, 'boss_mech_hurt', 250, 270, g => { g.fillStyle(0xffffff, 1); });

  // ---------- Porträts (Story) ----------
  mk(scene, 'pt_knox', 260, 260, g => drawMonsterBig(g, 0x3fa7ff, 3));
  mk(scene, 'pt_zippy', 260, 260, g => { drawMonsterBig(g, 0xff9a2e, 3); });
  mk(scene, 'pt_chief', 260, 260, g => {
    R(g, 40, 160, 180, 100, 0x2f6f9f, 30);
    E(g, 130, 110, 130, 140, 0xf3c9a5); E(g, 130, 52, 150, 60, 0x8a4a2a); C(g, 130, 24, 28, 0x8a4a2a);
    C(g, 100, 108, 16, 0xffffff); C(g, 160, 108, 16, 0xffffff); C(g, 102, 110, 6, OUT, 0); C(g, 158, 110, 6, OUT, 0);
    g.lineStyle(5, OUT, 1); g.strokeCircle(100, 108, 22); g.strokeCircle(160, 108, 22); Ln(g, 122, 108, 138, 108, OUT, 5);
    g.lineStyle(5, OUT, 1); g.beginPath(); g.arc(130, 140, 18, 0.2, Math.PI - 0.2); g.strokePath();
    R(g, 98, 192, 64, 12, 0xffd23f, 4);
  });
  mk(scene, 'pt_unrat', 260, 260, g => {
    R(g, 30, 168, 200, 92, 0xf4f4f4, 24); P(g, [{ x: 100, y: 168 }, { x: 130, y: 210 }, { x: 160, y: 168 }], 0xc4c4d0, 4);
    E(g, 130, 112, 120, 140, 0xf1d2b2); C(g, 70, 112, 14, 0xf1d2b2); C(g, 190, 112, 14, 0xf1d2b2);
    g.fillStyle(0x6b4a2b, 1); g.fillEllipse(130, 142, 90, 26); g.lineStyle(4, OUT, 1); g.strokeEllipse(130, 142, 90, 26);
    C(g, 100, 100, 17, 0xffffff); C(g, 160, 100, 17, 0xffffff); C(g, 104, 103, 6, OUT, 0); C(g, 156, 103, 6, OUT, 0);
    g.lineStyle(5, OUT, 1); g.strokeCircle(100, 100, 22); g.strokeCircle(160, 100, 22); Ln(g, 122, 100, 138, 100, OUT, 5);
    Ln(g, 74, 78, 118, 90, OUT, 8); Ln(g, 186, 78, 142, 90, OUT, 8);
    g.fillStyle(0xffffff, 1); g.fillTriangle(60, 62, 86, 50, 80, 74); g.fillTriangle(200, 62, 174, 50, 180, 74);
  });
}

function drawMonsterBig(g, col, s) {
  const dark = shade(col, 0.7);
  R(g, 50, 205, 56, 40, dark, 14); R(g, 130, 205, 56, 40, dark, 14);
  E(g, 120, 130, 190, 170, col, 6);
  g.fillStyle(0xffffff, 0.28); g.fillEllipse(88, 86, 70, 34);
  P(g, [{ x: 64, y: 62 }, { x: 40, y: 14 }, { x: 100, y: 46 }], dark, 6); P(g, [{ x: 140, y: 46 }, { x: 196, y: 14 }, { x: 178, y: 66 }], dark, 6);
  C(g, 90, 108, 32, 0xffffff, 6); C(g, 158, 108, 32, 0xffffff, 6); C(g, 102, 112, 14, OUT, 0); C(g, 170, 112, 14, OUT, 0);
  g.lineStyle(6, OUT, 1); g.beginPath(); g.arc(124, 158, 24, 0.2, Math.PI - 0.2); g.strokePath();
  R(g, 190, 130, 36, 46, 0x9aa3b2, 8); R(g, 220, 120, 22, 66, 0x69727f, 6);
}
