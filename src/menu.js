// Menüs: Start, Charakterwahl (Farben + Namen), Levelwahl, Minispiele, Steuerung – alles über der 3D-Bühne.
const UI = {
  glass(scene, x, y, w, h, o = {}) {
    const g = scene.add.graphics();
    g.fillStyle(o.fill || 0x1a1430, o.alpha === undefined ? 0.72 : o.alpha); g.fillRoundedRect(x, y, w, h, o.r || 22);
    g.lineStyle(o.lw || 4, o.stroke || 0xffffff, o.sa === undefined ? 0.35 : o.sa); g.strokeRoundedRect(x, y, w, h, o.r || 22);
    return g;
  },
  text(scene, x, y, s, size = 30, o = {}) {
    return scene.add.text(x, y, s, Object.assign({ fontFamily: FONT, fontSize: size + 'px', color: '#ffffff', stroke: '#16101f', strokeThickness: Math.max(4, size / 6) }, o));
  },
  hex: css => Phaser.Display.Color.HexStringToColor(css).color,
};

class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    makeArt(this); makeArt2(this); makePortraits(this);
    this.scene.start('Menu');
  }
}

// Gemeinsame Basis: 3D-Bühne + Menüsteuerung
class StageScene extends Phaser.Scene {
  stage(theme, opts) {
    this.sc3 = new Showcase3D(theme, opts); this.nav = new MenuNav(this);
    this.events.once('shutdown', () => { this.sc3.dispose(); });
  }
  tickStage(time, dt) { this.sc3.update(Math.min(dt, 50) / 1000, time); }
}

class MenuScene extends StageScene {
  constructor() { super('Menu'); }
  create() {
    this.stage('alley', { cam: { x: -0.9, y: 3.4, z: 12.5, ly: 0.7 }, w: 17, d: 9 });
    Sfx.music('menu'); this.sel = 0;
    const [c1, c2] = Cfg.players;
    this.ch = [this.sc3.addChar({ color: c1.color, x: -3.6, z: 0.6, yaw: 0.45, scale: 1.4 }), this.sc3.addChar({ color: c2.color, x: -1.3, z: 0.6, yaw: -0.3, scale: 1.4 })];
    this.sc3.play(this.ch[0], 'emote-yes');
    const t = UI.text(this, 640, 78, 'MÜLLALARM!', 120, { color: '#ffe15a', stroke: '#2a1a4a', strokeThickness: 20 }).setOrigin(0.5);
    this.tweens.add({ targets: t, scale: 1.04, yoyo: true, repeat: -1, duration: 1400, ease: 'Sine.inOut' });
    UI.text(this, 640, 150, 'Zwei Saugroboter · ein Haufen Chaos', 34).setOrigin(0.5);
    this.items = [
      { t: 'Abenteuer starten', a: () => this.go('start') },
      { t: 'Minispiele', a: () => this.scene.start('Minigames') },
      { t: 'Level wählen', a: () => this.scene.start('Select') },
      { t: 'Spieler & Farben', a: () => this.go('edit') },
      { t: 'Steuerung', a: () => this.scene.start('Controls') },
    ];
    this.btn = this.items.map((it, i) => {
      const x = 840, y = 235 + i * 80, w = 400, h = 66;
      const g = this.add.graphics(); const tx = UI.text(this, x + w / 2, y + h / 2, it.t, 34).setOrigin(0.5);
      const hit = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0, 0).setInteractive({ useHandCursor: true });
      hit.on('pointerover', () => { this.sel = i; this.refresh(); }); hit.on('pointerdown', () => { Sfx.unlock(); it.a(); });
      return { g, tx, x, y, w, h };
    });
    this.pads = UI.text(this, 640, H - 26, '', 22).setOrigin(0.5, 1);
    UI.text(this, 40, H - 26, 'M = Ton an/aus', 20, { color: '#ffffffaa' }).setOrigin(0, 1);
    this.refresh();
  }
  go(kind) { Sfx.play('confirm'); this.scene.start('CharSelect', { next: kind }); }
  refresh() {
    this.btn.forEach((b, i) => {
      b.g.clear(); const on = i === this.sel;
      b.g.fillStyle(on ? 0x7a4cff : 0x1a1430, on ? 0.95 : 0.72); b.g.fillRoundedRect(b.x, b.y, b.w, b.h, 33);
      b.g.lineStyle(on ? 6 : 4, on ? 0xffe15a : 0xffffff, on ? 1 : 0.35); b.g.strokeRoundedRect(b.x, b.y, b.w, b.h, 33);
      b.tx.setColor(on ? '#ffe15a' : '#ffffff').setX(b.x + b.w / 2 + (on ? 8 : 0));
    });
  }
  update(time, dt) {
    const n = this.nav.poll();
    if (n.up) { this.sel = (this.sel + this.items.length - 1) % this.items.length; Sfx.play('select'); this.refresh(); }
    if (n.down) { this.sel = (this.sel + 1) % this.items.length; Sfx.play('select'); this.refresh(); }
    if (n.ok) { Sfx.unlock(); this.items[this.sel].a(); }
    const np = getPads().length;
    this.pads.setText(np === 0 ? 'Controller anschließen & eine Taste drücken – oder zu zweit an der Tastatur' : `🎮 ${np} Controller erkannt` + (np === 1 ? ' (Spieler 2 nutzt die Tastatur)' : ''));
    this.tickStage(time, dt);
  }
}

// ───────────────────────── Charakterwahl ─────────────────────────
const NAMES = ['Papa', 'Mama', 'Kleiner Held', 'Knox', 'Zippy', 'Blitz', 'Turbo', 'Funke', 'Käpt\'n Müll', 'Sternchen', 'Ninja', 'Prinzessin'];
class CharSelectScene extends StageScene {
  constructor() { super('CharSelect'); }
  init(d) { this.nextKind = d.next || 'start'; }
  create() {
    this.stage('alley', { cam: { x: 0, y: 3.2, z: 12.5, ly: 0.2 }, w: 19, d: 9 });
    Sfx.music('menu');
    this.ctrl = [new Ctrl(this, 0), new Ctrl(this, 1)];
    this.st = [0, 1].map(i => {
      const nm = Cfg.players[i].name, idx = NAMES.indexOf(nm);
      return { color: Cfg.players[i].color, row: 0, ready: false, nameIdx: idx >= 0 ? idx : NAMES.length, custom: idx >= 0 ? null : nm, prev: {} };
    });
    this.mode = Cfg.mode || 'normal'; this.typing = -1; this.typeBuf = '';
    this.chars = [0, 1].map(i => this.sc3.addChar({ color: this.st[i].color, x: i === 0 ? -2.6 : 2.6, z: 0.2, yaw: i === 0 ? 0.3 : -0.3, scale: 1.7 }));
    this.labelFor = [null, null];
    UI.text(this, 640, 44, 'Wähle deine Figur', 64, { color: '#ffe15a', stroke: '#2a1a4a', strokeThickness: 14 }).setOrigin(0.5);
    this.panels = [0, 1].map(i => this.buildPanel(i));
    this.modeT = UI.text(this, 640, 100, '', 28).setOrigin(0.5);
    UI.text(this, 640, H - 16, 'Stick / Pfeile: wählen  •  A / Enter: bereit  •  Schießen auf „Name“: eigenen Namen tippen  •  Esc: zurück', 20, { color: '#ffffffcc' }).setOrigin(0.5, 1);
    this.input.keyboard.on('keydown', e => this.onKey(e));
    this.refresh();
  }
  nameOf(i) { const s = this.st[i]; return s.nameIdx >= NAMES.length ? (s.custom || 'Spieler ' + (i + 1)) : NAMES[s.nameIdx]; }
  buildPanel(i) {
    const x = i === 0 ? 50 : 730, y = 380, w = 500, h = 290;
    const p = { x, y, w, h, g: this.add.graphics(), sw: [] };
    p.title = UI.text(this, x + w / 2, y + 14, 'Spieler ' + (i + 1), 34).setOrigin(0.5, 0);
    p.rows = ['Farbe', 'Name', 'Modus'].map((n, k) => UI.text(this, x + 22, y + 60 + k * 62, n, 20, { color: '#ffffffaa' }));
    p.name = UI.text(this, x + w / 2 + 30, y + 60 + 62 + 30, '', 32).setOrigin(0.5);
    p.mode = UI.text(this, x + w / 2 + 30, y + 60 + 124 + 30, '', 28).setOrigin(0.5);
    p.ready = UI.text(this, x + w / 2, y + h - 30, '', 32).setOrigin(0.5);
    p.sel = this.add.graphics();
    PLAYER_COLORS.forEach((c, k) => p.sw.push({ cx: x + 150 + k * 66, cy: y + 60 + 30, c }));
    return p;
  }
  refresh() {
    this.panels.forEach((p, i) => {
      const s = this.st[i], col = PLAYER_COLORS.find(c => c.id === s.color);
      p.g.clear(); p.g.fillStyle(0x1a1430, 0.8); p.g.fillRoundedRect(p.x, p.y, p.w, p.h, 28);
      p.g.lineStyle(s.ready ? 8 : 5, s.ready ? 0x59ff7a : UI.hex(col.css), 1); p.g.strokeRoundedRect(p.x, p.y, p.w, p.h, 28);
      p.sel.clear();
      p.sw.forEach(sw => {
        const taken = this.st[1 - i].color === sw.c.id, on = s.color === sw.c.id;
        p.sel.fillStyle(UI.hex(sw.c.css), taken ? 0.25 : 1); p.sel.fillCircle(sw.cx, sw.cy, on ? 29 : 22);
        p.sel.lineStyle(on ? 6 : 3, on ? 0xffe15a : 0x16101f, 1); p.sel.strokeCircle(sw.cx, sw.cy, on ? 29 : 22);
      });
      p.rows.forEach((r, k) => r.setColor(s.row === k ? '#ffe15a' : '#ffffffaa').setText((s.row === k ? '▶ ' : '') + ['Farbe', 'Name', 'Modus'][k]));
      const shown = this.typing === i ? this.typeBuf + '▌' : this.nameOf(i);
      p.name.setText('◀ ' + shown + ' ▶').setColor(s.row === 1 ? '#ffe15a' : '#ffffff');
      p.mode.setText('◀ ' + (this.mode === 'kids' ? 'Kinder-Modus' : 'Normal') + ' ▶').setColor(s.row === 2 ? '#ffe15a' : '#ffffff');
      p.ready.setText(s.ready ? '✔ BEREIT!' : 'A = bereit').setColor(s.ready ? '#59ff7a' : '#ffffffaa');
      p.title.setColor(col.css);
      const ch = this.chars[i];
      this.sc3.setColor(ch, s.color);
      if (ch.label) ch.root.remove(ch.label);
      const lab = nameSprite(this.typing === i ? this.typeBuf + '_' : this.nameOf(i), col.css); lab.position.set(0, 2.7, 0); lab.scale.set(2.8, 0.7, 1); ch.root.add(lab); ch.label = lab;
      if (ch.vac) ch.root.remove(ch.vac);
      const vac = makeVacuum(col.css); vac.scale.setScalar(1.45); ch.root.add(vac); ch.vac = vac;
      this.sc3.play(ch, s.ready ? 'emote-yes' : 'idle');
    });
    this.modeT.setText(`Spielmodus (für beide): ${this.mode === 'kids' ? '★ Kinder-Modus – leichter ★' : 'Normal'}`);
  }
  onKey(e) {
    if (this.typing < 0) return;
    const i = this.typing;
    if (e.key === 'Enter') { const t = this.typeBuf.trim(); if (t) { this.st[i].custom = t; this.st[i].nameIdx = NAMES.length; } this.typing = -1; Sfx.play('confirm'); }
    else if (e.key === 'Escape') this.typing = -1;
    else if (e.key === 'Backspace') this.typeBuf = this.typeBuf.slice(0, -1);
    else if (e.key.length === 1 && this.typeBuf.length < 12) this.typeBuf += e.key;
    this.refresh();
  }
  move(i, dx, dy) {
    const s = this.st[i];
    if (dy) { s.row = (s.row + dy + 3) % 3; Sfx.play('select'); }
    if (dx) {
      Sfx.play('select');
      if (s.row === 0) { const ids = PLAYER_COLORS.map(c => c.id); let k = ids.indexOf(s.color); do { k = (k + dx + ids.length) % ids.length; } while (ids[k] === this.st[1 - i].color); s.color = ids[k]; }
      else if (s.row === 1) { const n = NAMES.length + (s.custom ? 1 : 0); s.nameIdx = (s.nameIdx + dx + n) % n; }
      else this.mode = this.mode === 'kids' ? 'normal' : 'kids';
    }
    this.st.forEach(x => { x.ready = false; });
    this.refresh();
  }
  confirm(i) {
    const s = this.st[i]; s.ready = !s.ready; Sfx.play(s.ready ? 'confirm' : 'select'); this.refresh();
    if (this.st.every(x => x.ready)) this.start();
  }
  start() {
    Cfg.players = this.st.map((s, i) => ({ name: this.nameOf(i), color: s.color })); Cfg.mode = this.mode; Cfg.save(); Sfx.play('win');
    if (this.nextKind === 'start') this.scene.start('Story', { id: 'intro', next: { scene: 'Level', data: { level: 0, mode: this.mode } } });
    else this.scene.start('Menu');
  }
  update(time, dt) {
    const n = this.nav.poll();
    if (!this.t0) this.t0 = time;
    if (time - this.t0 < 400) { this.ctrl.forEach(c => c.read()); this.tickStage(time, dt); return; }
    this.ctrl.forEach((c, i) => {
      const r = c.read(), p = this.st[i].prev, ax = Math.abs(r.x) > 0.6 ? Math.sign(r.x) : 0, ay = Math.abs(r.y) > 0.6 ? Math.sign(r.y) : 0;
      if (this.typing < 0) {
        const dx = ax && ax !== p.ax ? ax : 0, dy = ay && ay !== p.ay ? ay : 0;
        if (dx || dy) this.move(i, dx, dy);
        if (r.jumpEdge) this.confirm(i);
        if (r.shootEdge && this.st[i].row === 1) { this.typing = i; this.typeBuf = ''; this.refresh(); }
      }
      p.ax = ax; p.ay = ay;
    });
    if (n.back && this.typing < 0) this.scene.start('Menu');
    this.tickStage(time, dt);
  }
}

// ───────────────────────── Levelwahl ─────────────────────────
class SelectScene extends StageScene {
  constructor() { super('Select'); }
  create() {
    this.stage('alley', { cam: { x: 0, y: 3, z: 12, ly: 1 }, w: 19, d: 9 });
    this.sel = 0; this.kids = (Cfg.mode === 'kids'); this.qd = false;
    UI.text(this, 640, 56, 'Level wählen', 76, { color: '#ffe15a', stroke: '#2a1a4a', strokeThickness: 14 }).setOrigin(0.5);
    this.modeT = UI.text(this, 640, 124, '', 30).setOrigin(0.5);
    this.levels = LEVELS.map((l, i) => ({ l, i })).filter(o => !o.l.mini);
    this.cards = this.levels.map(({ l: lv }, i) => {
      const col = i % 3, row = Math.floor(i / 3), x = 130 + col * 370, y = 170 + row * 255, w = 340, h = 230;
      const g = this.add.graphics(), cont = { x, y, w, h, g };
      cont.num = UI.text(this, x + 40, y + 34, String(i + 1), 64, { color: '#ffe15a' }).setOrigin(0.5);
      cont.name = UI.text(this, x + w / 2 + 22, y + 22, lv.name, 30, { wordWrap: { width: w - 110 }, align: 'center' }).setOrigin(0.5, 0);
      cont.boss = UI.text(this, x + w / 2, y + h - 36, 'Boss: ' + BOSS[lv.boss].title.split('–')[0].trim(), 22, { color: '#ffe15a' }).setOrigin(0.5);
      cont.th = UI.text(this, x + w / 2, y + 120, THEMES[lv.theme] ? THEMES[lv.theme].name : '', 26, { color: '#ffffffcc' }).setOrigin(0.5);
      const hit = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0, 0).setInteractive({ useHandCursor: true });
      hit.on('pointerover', () => { this.sel = i; this.refresh(); }); hit.on('pointerdown', () => this.play());
      return cont;
    });
    this.kQ = this.input.keyboard.addKey('Q'); this.kE = this.input.keyboard.addKey('E');
    UI.text(this, 640, H - 26, '◀ ▶ ▲ ▼ Level  •  Q / E: Modus  •  A / Enter: Start  •  Esc: zurück', 22, { color: '#ffffffcc' }).setOrigin(0.5, 1);
    this.refresh();
  }
  refresh() {
    this.modeT.setText(`Modus: ${this.kids ? '★ Kinder-Modus' : 'Normal'}   (Q / E wechselt)`);
    const base = { alley: 0x4a9a58, sewer: 0x2f8d78, junk: 0xb98a3e, factory: 0x4e5f94, winter: 0x6a9ad0, grave: 0x6a4a9a };
    this.cards.forEach((c, i) => {
      const on = i === this.sel, th = this.levels[i].l.theme;
      c.g.clear(); c.g.fillStyle(base[th] || 0x555555, 0.96); c.g.fillRoundedRect(c.x, c.y, c.w, c.h, 26); c.g.fillStyle(0xffffff, 0.16); c.g.fillRoundedRect(c.x, c.y, c.w, 84, { tl: 26, tr: 26, bl: 0, br: 0 });
      c.g.lineStyle(on ? 8 : 4, on ? 0xffe15a : 0x16101f, 1); c.g.strokeRoundedRect(c.x, c.y, c.w, c.h, 26);
      [c.num, c.name, c.boss, c.th].forEach(o => o.setScale(on ? 1.06 : 1));
    });
  }
  play() { Sfx.play('confirm'); this.scene.start('Level', { level: this.levels[this.sel].i, mode: this.kids ? 'kids' : 'normal' }); }
  update(time, dt) {
    const n = this.nav.poll(), N = this.cards.length;
    if (n.left) { this.sel = (this.sel + N - 1) % N; Sfx.play('select'); this.refresh(); }
    if (n.right) { this.sel = (this.sel + 1) % N; Sfx.play('select'); this.refresh(); }
    if (n.up) { this.sel = (this.sel + N - 3) % N; Sfx.play('select'); this.refresh(); }
    if (n.down) { this.sel = (this.sel + 3) % N; Sfx.play('select'); this.refresh(); }
    const q = this.kQ.isDown || this.kE.isDown; if (q && !this.qd) { this.kids = !this.kids; Sfx.play('select'); this.refresh(); } this.qd = q;
    if (n.ok) this.play();
    if (n.back) this.scene.start('Menu');
    this.tickStage(time, dt);
  }
}

// ───────────────────────── Minispiele ─────────────────────────
const MINIS = [
  { id: 'coins', name: 'Münzjagd', desc: 'Sammelt in 45 Sekunden so viele Münzen wie möglich – aber Vorsicht vor den Bomben!' },
  { id: 'shoot', name: 'Schleim-Schießbude', desc: 'Schleim-Monster tauchen auf: schießt oder hopst sie weg. Goldene zählen fünffach!' },
  { id: 'throw', name: 'Partner-Weitwurf', desc: 'Werft euren Partner auf die Inseln! Je weiter die Insel, desto mehr Punkte.' },
];
class MinigameScene extends StageScene {
  constructor() { super('Minigames'); }
  create() {
    this.stage('sewer', { cam: { x: 0, y: 3, z: 12, ly: 1 }, w: 19, d: 9 });
    this.sel = 0;
    UI.text(this, 640, 56, 'Minispiele', 80, { color: '#ffe15a', stroke: '#2a1a4a', strokeThickness: 14 }).setOrigin(0.5);
    this.cards = MINIS.map((m, i) => {
      const x = 80 + i * 380, y = 170, w = 360, h = 400, g = this.add.graphics();
      const t = UI.text(this, x + w / 2, y + 40, m.name, 40, { wordWrap: { width: w - 40 }, align: 'center' }).setOrigin(0.5, 0);
      UI.text(this, x + w / 2, y + 170, m.desc, 26, { wordWrap: { width: w - 50 }, align: 'center', strokeThickness: 5 }).setOrigin(0.5, 0);
      const hit = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0, 0).setInteractive({ useHandCursor: true });
      hit.on('pointerover', () => { this.sel = i; this.refresh(); }); hit.on('pointerdown', () => this.play());
      return { x, y, w, h, g, t };
    });
    UI.text(this, 640, H - 26, '◀ ▶ wählen  •  A / Enter: Start  •  Esc: zurück', 22, { color: '#ffffffcc' }).setOrigin(0.5, 1);
    this.refresh();
  }
  refresh() { this.cards.forEach((c, i) => { const on = i === this.sel; c.g.clear(); c.g.fillStyle(on ? 0x6a46d8 : 0x1a1430, on ? 0.95 : 0.78); c.g.fillRoundedRect(c.x, c.y, c.w, c.h, 28); c.g.lineStyle(on ? 8 : 4, on ? 0xffe15a : 0xffffff, on ? 1 : 0.35); c.g.strokeRoundedRect(c.x, c.y, c.w, c.h, 28); c.t.setColor(on ? '#ffe15a' : '#ffffff'); }); }
  play() { Sfx.play('confirm'); const idx = LEVELS.findIndex(l => l.mini === MINIS[this.sel].id); this.scene.start('Level', { level: idx, mode: Cfg.mode || 'normal' }); }
  update(time, dt) {
    const n = this.nav.poll();
    if (n.left) { this.sel = (this.sel + 2) % 3; Sfx.play('select'); this.refresh(); }
    if (n.right) { this.sel = (this.sel + 1) % 3; Sfx.play('select'); this.refresh(); }
    if (n.ok) this.play();
    if (n.back) this.scene.start('Menu');
    this.tickStage(time, dt);
  }
}

class ControlsScene extends StageScene {
  constructor() { super('Controls'); }
  create() {
    this.stage('winter', { cam: { x: 0, y: 3, z: 12, ly: 1 }, w: 19, d: 9 });
    UI.text(this, 640, 50, 'Steuerung', 76, { color: '#ffe15a', stroke: '#2a1a4a', strokeThickness: 14 }).setOrigin(0.5);
    UI.glass(this, 50, 120, 570, 340); UI.glass(this, 660, 120, 570, 340); UI.glass(this, 50, 480, 1180, 190);
    UI.text(this, 80, 140, '🎮 CONTROLLER', 34, { color: '#ffe15a' });
    UI.text(this, 80, 195, 'Stick / Steuerkreuz:  Laufen & Zielen\nA:  Hopsen (über Gräben, auf Gegner)\nB / LT / LB (halten):  Saugen\nX / RT / RB:  Schießen\nStart:  Pause', 28, { lineSpacing: 12 });
    UI.text(this, 690, 140, '⌨ TASTATUR', 34, { color: '#ffe15a' });
    UI.text(this, 690, 195, 'Spieler 1:  WASD · Leertaste hopsen\n                 G saugen · F schießen\nSpieler 2:  Pfeile · Enter hopsen\n                 , saugen · . schießen', 28, { lineSpacing: 12 });
    UI.text(this, 80, 495, '• Saugen holt Müll als Munition – und, ganz nah davor, auch euren Partner (er steckt dann im Bauch).\n• Schießen feuert Müll in Blickrichtung. Mit Partner im Bauch wird er geworfen – über Abgründe! Grüner Ring = sicher.\n• Ihr hängt an einer Kette. Zusammen löst ihr Schalter, Platten und Brücken.', 24, { wordWrap: { width: 1120 }, lineSpacing: 8, strokeThickness: 5 });
    UI.text(this, 640, H - 20, 'Esc / B: zurück', 22, { color: '#ffffffcc' }).setOrigin(0.5, 1);
  }
  update(time, dt) { const n = this.nav.poll(); if (n.back || n.ok) this.scene.start('Menu'); this.tickStage(time, dt); }
}
