class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  create() {
    makeArt(this); makeArt2(this);
    this.scene.start('Menu');
  }
}

class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }
  create() {
    this.nav = new MenuNav(this);
    this.sel = 0;
    Sfx.music('menu');
    this.add.tileSprite(0, 0, W, H, 'bgfar_alley').setOrigin(0);
    const near = this.add.tileSprite(0, 0, W, H, 'bgnear_alley').setOrigin(0);
    this.tweens.add({ targets: near, tilePositionX: 1280, duration: 60000, repeat: -1 });
    const g = this.add.graphics();
    g.fillStyle(0x7ed957, 1); g.fillRect(0, 640, W, 80); g.lineStyle(6, OUT, 1); g.strokeRect(-4, 640, W + 8, 90);

    this.add.text(W / 2, 90, 'KNOX & ZIPPY', { fontFamily: FONT, fontSize: '110px', fontStyle: 'bold', color: '#ffe15a', stroke: '#16101f', strokeThickness: 18 }).setOrigin(0.5);
    const sub = this.add.text(W / 2, 190, 'MÜLLALARM!', { fontFamily: FONT, fontSize: '70px', fontStyle: 'bold', color: '#ff6a6a', stroke: '#16101f', strokeThickness: 14 }).setOrigin(0.5).setAngle(-3);
    this.tweens.add({ targets: sub, scale: 1.06, yoyo: true, repeat: -1, duration: 700, ease: 'Sine.inOut' });

    // Die beiden Helden, mit Kette verbunden
    this.k = this.add.image(250, 580, 'knox').setScale(1.9);
    this.z = this.add.image(1030, 580, 'zippy').setScale(1.9).setFlipX(true);
    this.chain = this.add.graphics();
    this.items = [
      { t: 'Spielen – Normal', a: () => this.start('normal') },
      { t: 'Spielen – Kinder-Modus', a: () => this.start('kids') },
      { t: 'Level wählen', a: () => this.scene.start('Select') },
      { t: 'Steuerung', a: () => this.scene.start('Controls') },
    ];
    this.txt = this.items.map((it, i) => this.add.text(W / 2, 290 + i * 70, it.t, { fontFamily: FONT, fontSize: '46px', color: '#fff', stroke: '#16101f', strokeThickness: 10 }).setOrigin(0.5));
    this.add.text(W / 2, H - 22, 'Auswahl: Stick/Pfeile • Bestätigen: A/Enter • M = Ton aus/an', { fontFamily: FONT, fontSize: '20px', color: '#fff', stroke: '#16101f', strokeThickness: 5 }).setOrigin(0.5, 1);
    this.pads = this.add.text(W / 2, 560, '', { fontFamily: FONT, fontSize: '24px', color: '#fff', stroke: '#16101f', strokeThickness: 6 }).setOrigin(0.5);
    this.refresh();
  }
  start(mode) {
    Sfx.play('confirm');
    this.scene.start('Story', { id: 'intro', next: { scene: 'Level', data: { level: 0, mode } } });
  }
  refresh() {
    this.txt.forEach((t, i) => { t.setScale(i === this.sel ? 1.15 : 1).setColor(i === this.sel ? '#ffe15a' : '#ffffff'); t.setText((i === this.sel ? '▶ ' : '') + this.items[i].t); });
  }
  update(time) {
    const n = this.nav.poll();
    if (n.up) { this.sel = (this.sel + this.items.length - 1) % this.items.length; Sfx.play('select'); this.refresh(); }
    if (n.down) { this.sel = (this.sel + 1) % this.items.length; Sfx.play('select'); this.refresh(); }
    if (n.ok) { Sfx.unlock(); this.items[this.sel].a(); }
    this.k.y = 580 + Math.sin(time / 300) * 8; this.z.y = 580 + Math.sin(time / 300 + 2) * 8;
    const g = this.chain; g.clear();
    for (let i = 0; i <= 40; i++) { const t = i / 40, x = this.k.x + 40 + (this.z.x - this.k.x - 80) * t, y = 600 + Math.sin(t * Math.PI) * 50 + Math.sin(time / 300 + t * 3) * 3; g.fillStyle(0xdfe3ea, 1); g.fillCircle(x, y, 7); g.lineStyle(3, OUT, 1); g.strokeCircle(x, y, 7); }
    const n_ = getPads().length;
    this.pads.setText(n_ === 0 ? 'Controller anschließen & eine Taste drücken – oder zu zweit an der Tastatur' : `🎮 ${n_} Controller erkannt` + (n_ === 1 ? ' (Spieler 2 nutzt die Tastatur)' : ''));
  }
}

class SelectScene extends Phaser.Scene {
  constructor() { super('Select'); }
  create() {
    this.nav = new MenuNav(this); this.sel = 0; this.kids = false;
    this.add.tileSprite(0, 0, W, H, 'bgfar_alley').setOrigin(0);
    this.add.text(W / 2, 70, 'Level wählen', { fontFamily: FONT, fontSize: '70px', fontStyle: 'bold', color: '#ffe15a', stroke: '#16101f', strokeThickness: 14 }).setOrigin(0.5);
    this.modeT = this.add.text(W / 2, 150, '', { fontFamily: FONT, fontSize: '34px', color: '#fff', stroke: '#16101f', strokeThickness: 8 }).setOrigin(0.5);
    this.cards = LEVELS.map((lv, i) => {
      const x = 160 + i * 320, th = THEMES[lv.theme];
      const c = this.add.container(x, 420);
      const bg = this.add.graphics();
      bg.fillStyle(th.base, 1); bg.fillRoundedRect(-140, -200, 280, 400, 24); bg.fillStyle(th.top, 1); bg.fillRoundedRect(-140, -200, 280, 90, { tl: 24, tr: 24, bl: 0, br: 0 }); bg.lineStyle(8, OUT, 1); bg.strokeRoundedRect(-140, -200, 280, 400, 24);
      const n = this.add.text(0, -155, String(i + 1), { fontFamily: FONT, fontSize: '72px', fontStyle: 'bold', color: '#fff', stroke: '#16101f', strokeThickness: 12 }).setOrigin(0.5);
      const t = this.add.text(0, 10, lv.name, { fontFamily: FONT, fontSize: '30px', color: '#fff', stroke: '#16101f', strokeThickness: 7, align: 'center', wordWrap: { width: 250 } }).setOrigin(0.5);
      const b = this.add.text(0, 120, { can: 'Boss: Tonnen-Titan', slime: 'Boss: Schleimkönig', digger: 'Boss: Bagger-Bestie', mech: 'Boss: Dr. Unrat' }[lv.boss], { fontFamily: FONT, fontSize: '22px', color: '#ffe15a', stroke: '#16101f', strokeThickness: 5 }).setOrigin(0.5);
      c.add([bg, n, t, b]); return c;
    });
    this.add.text(W / 2, H - 30, '◀ ▶ Level  •  ▲ ▼ Modus  •  A/Enter Start  •  B/Esc zurück', { fontFamily: FONT, fontSize: '24px', color: '#fff', stroke: '#16101f', strokeThickness: 6 }).setOrigin(0.5, 1);
    this.refresh();
  }
  refresh() {
    this.modeT.setText(`Modus: ${this.kids ? '◀ KINDER-MODUS (leichter) ▶' : '◀ NORMAL ▶'}`);
    this.cards.forEach((c, i) => { c.setScale(i === this.sel ? 1.08 : 0.92).setAlpha(i === this.sel ? 1 : 0.7); });
  }
  update() {
    const n = this.nav.poll();
    if (n.left) { this.sel = (this.sel + LEVELS.length - 1) % LEVELS.length; Sfx.play('select'); this.refresh(); }
    if (n.right) { this.sel = (this.sel + 1) % LEVELS.length; Sfx.play('select'); this.refresh(); }
    if (n.up || n.down) { this.kids = !this.kids; Sfx.play('select'); this.refresh(); }
    if (n.ok) { Sfx.play('confirm'); this.scene.start('Level', { level: this.sel, mode: this.kids ? 'kids' : 'normal' }); }
    if (n.back) this.scene.start('Menu');
  }
}

class ControlsScene extends Phaser.Scene {
  constructor() { super('Controls'); }
  create() {
    this.nav = new MenuNav(this);
    this.add.tileSprite(0, 0, W, H, 'bgfar_sewer').setOrigin(0);
    const st = { fontFamily: FONT, fontSize: '28px', color: '#fff', stroke: '#16101f', strokeThickness: 7, lineSpacing: 10 };
    this.add.text(W / 2, 60, 'Steuerung', { fontFamily: FONT, fontSize: '70px', fontStyle: 'bold', color: '#ffe15a', stroke: '#16101f', strokeThickness: 14 }).setOrigin(0.5);
    this.add.text(60, 130, '🎮 CONTROLLER (jede/r hat einen)\n\nStick / Steuerkreuz: Laufen (Blickrichtung = Zielrichtung)\nA: Hopsen (über Gräben!)\nB / LT / LB (halten): Saugen\nX / RT / RB: Schießen\nStart: Pause', st);
    this.add.text(680, 130, '⌨ TASTATUR\n\nSpieler 1 (Knox):\nWASD • Leertaste hopsen\nG saugen • F schießen\n\nSpieler 2 (Zippy):\nPfeile • Enter hopsen\n, saugen • . schießen', st);
    this.add.text(60, 420, 'SO FUNKTIONIERT\'S', { ...st, color: '#ffe15a' });
    this.add.text(60, 460, '• Saugen (halten): Müll in der Nähe wird eingesaugt = Munition.\n• Schießen: Müll auf Gegner, Kisten und Zielscheiben feuern. Hüpfen auf Gegner geht auch!\n• Den Partner nah davor saugen = er steckt im Bauch. Schießen = er fliegt los und kann Abgründe überqueren (Ziel wird gezeigt).\n• Ihr hängt an einer Kette: nicht zu weit auseinander. Zusammenarbeit löst die Rätsel!', { ...st, fontSize: '23px' });
    this.add.text(W / 2, H - 20, 'B / Esc: zurück', st).setOrigin(0.5, 1);
  }
  update() { const n = this.nav.poll(); if (n.back || n.ok) this.scene.start('Menu'); }
}
