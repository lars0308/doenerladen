// Zusätzliche Grafiken für die schräge Draufsicht: Boden, Wände, Abgründe, Schatten.
function makeArt2(scene) {
  for (const k in THEMES) {
    const th = THEMES[k];
    const FL = { alley: [0x8d89ad, 0x6f6b92], sewer: [0x5f8f7e, 0x3f6e5e], junk: [0xcb9d5d, 0xa87c40], factory: [0x7a88ac, 0x52608a] }[k];
    const PIT = { alley: [0x1a1330, 0x3a2f6b], sewer: [0x3f9a2e, 0x8cf06a], junk: [0x15100b, 0x3a2c1c], factory: [0xb83a12, 0xff9a2e] }[k];
    mk(scene, 'floor_' + k, T, T, g => {
      g.fillStyle(FL[0], 1); g.fillRect(0, 0, T, T);
      g.lineStyle(2, FL[1], 1); g.strokeRect(1, 1, T - 2, T - 2);
      const r = rng(k.length * 13 + 3);
      g.fillStyle(FL[1], 0.6); for (let i = 0; i < 5; i++) g.fillCircle(4 + r() * 40, 4 + r() * 40, 1.5 + r() * 2);
      if (k === 'factory') { g.fillStyle(FL[1], 1); g.fillCircle(6, 6, 2.5); g.fillCircle(42, 6, 2.5); g.fillCircle(6, 42, 2.5); g.fillCircle(42, 42, 2.5); }
      if (k === 'sewer') { g.lineStyle(2, FL[1], 1); g.beginPath(); g.moveTo(0, 24); g.lineTo(48, 24); g.strokePath(); }
    });
    mk(scene, 'floorb_' + k, T, T, g => {
      g.fillStyle(shade(FL[0], 0.93), 1); g.fillRect(0, 0, T, T);
      g.lineStyle(2, FL[1], 1); g.strokeRect(1, 1, T - 2, T - 2);
      const r = rng(k.length * 29 + 11);
      g.fillStyle(FL[1], 0.6); for (let i = 0; i < 4; i++) g.fillCircle(4 + r() * 40, 4 + r() * 40, 1.5 + r() * 2);
    });
    mk(scene, 'wallt_' + k, T, T, g => {
      const tc = { alley: 0x3a2b57, sewer: 0x1b3a34, junk: 0x4a3018, factory: 0x222a46 }[k];
      g.fillStyle(tc, 1); g.fillRect(0, 0, T, T);
      g.fillStyle(shade(tc, 1.25), 1); g.fillRect(3, 3, T - 6, T - 6);
      g.fillStyle(shade(tc, 1.6), 0.5); g.fillRect(3, 3, T - 6, 6);
    });
    mk(scene, 'pit_' + k, T, T, g => {
      g.fillStyle(PIT[0], 1); g.fillRect(0, 0, T, T);
      g.lineStyle(3, PIT[1], 0.7);
      for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(4, 10 + i * 15); g.lineTo(14, 6 + i * 15); g.lineTo(26, 12 + i * 15); g.lineTo(38, 7 + i * 15); g.lineTo(46, 11 + i * 15); g.strokePath(); }
    });
    mk(scene, 'pitc_' + k, T, T, g => {
      g.fillStyle(PIT[0], 1); g.fillRect(0, 0, T, T);
      g.lineStyle(3, PIT[1], 0.6); g.beginPath(); g.moveTo(4, 34); g.lineTo(18, 30); g.lineTo(32, 36); g.lineTo(44, 31); g.strokePath();
      g.fillStyle(0x5f566f, 1); g.fillRect(0, 0, T, 18); g.fillStyle(0x433b52, 1); g.fillRect(0, 14, T, 8);
      g.lineStyle(3, OUT, 1); g.beginPath(); g.moveTo(0, 22); g.lineTo(T, 22); g.strokePath();
      g.lineStyle(2, 0x433b52, 1); g.beginPath(); g.moveTo(12, 0); g.lineTo(12, 14); g.moveTo(32, 0); g.lineTo(32, 14); g.strokePath();
    });
    mk(scene, 'plank_' + k, T, T, g => {
      g.fillStyle(0xb98a52, 1); g.fillRect(0, 0, T, T);
      g.lineStyle(3, 0x7a5528, 1); for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(0, i * 12 + 1); g.lineTo(T, i * 12 + 1); g.strokePath(); }
      g.fillStyle(0x5d3f1c, 1); g.fillCircle(5, 6, 2); g.fillCircle(43, 6, 2); g.fillCircle(5, 42, 2); g.fillCircle(43, 42, 2);
      g.lineStyle(4, OUT, 1); g.strokeRect(0, 0, T, T);
    });
  }
  mk(scene, 'conv2', T, T, g => {
    g.fillStyle(0x4a505e, 1); g.fillRect(0, 0, T, T);
    g.fillStyle(0xffc83d, 1); for (let i = 0; i < 2; i++) g.fillPoints([{ x: 6 + i * 22, y: 10 }, { x: 18 + i * 22, y: 24 }, { x: 6 + i * 22, y: 38 }, { x: 14 + i * 22, y: 38 }, { x: 26 + i * 22, y: 24 }, { x: 14 + i * 22, y: 10 }], true);
    g.lineStyle(3, OUT, 1); g.beginPath(); g.moveTo(0, 2); g.lineTo(T, 2); g.moveTo(0, T - 2); g.lineTo(T, T - 2); g.strokePath();
  });
  mk(scene, 'stomper', 100, 130, g => {
    R(g, 4, 30, 92, 96, 0x8b94a8, 10); R(g, 14, 40, 72, 60, 0xa9b2c6, 8);
    g.fillStyle(0xff4a4a, 1); for (let i = 0; i < 4; i++) g.fillTriangle(10 + i * 22, 126, 22 + i * 22, 104, 32 + i * 22, 126);
    R(g, 38, 0, 24, 40, 0x6b778c, 4);
  });
  mk(scene, 'spk', T, T, g => {
    g.fillStyle(0x3a3544, 1); g.fillRect(0, 0, T, T); g.lineStyle(3, OUT, 1); g.strokeRect(1, 1, T - 2, T - 2);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const x = 6 + i * 22, y = 6 + j * 22; g.fillStyle(0xe4e8f0, 1); g.fillTriangle(x, y + 16, x + 8, y, x + 16, y + 16); g.lineStyle(2, OUT, 1); g.strokeTriangle(x, y + 16, x + 8, y, x + 16, y + 16); }
  });
  mk(scene, 'dotp', 16, 16, g => { g.fillStyle(0xffffff, 1); g.fillCircle(8, 8, 8); });
  mk(scene, 'knox_t', 80, 72, g => drawMonster(g, 0x3fa7ff, 0, 0, true));
  mk(scene, 'zippy_t', 80, 72, g => drawMonster(g, 0xff9a2e, 0, 0, true));
  mk(scene, 'nozzle', 34, 24, g => { R(g, 2, 4, 18, 16, 0x9aa3b2, 4); R(g, 18, 0, 14, 24, 0x69727f, 3); });
}

function shadowKey(scene, w, h) {
  const key = 'sh_' + w + 'x' + h;
  mk(scene, key, w, h, g => { g.fillStyle(0x000000, 0.32); g.fillEllipse(w / 2, h / 2, w - 2, h - 2); });
  return key;
}
