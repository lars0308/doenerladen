// HUD als eigene Szene über der 3D-Ansicht: Herzen, Münzen, Munition, Boss-Leiste, Meldungen.
class HudScene extends Phaser.Scene {
  constructor() { super('Hud'); }
  init(d) { this.L = d.level; this.ready = false; }
  create() {
    const st = (size, extra = {}) => Object.assign({ fontFamily: FONT, fontSize: size + 'px', color: '#fff', stroke: '#16101f', strokeThickness: 6 }, extra);
    this.heartI = [];
    for (let i = 0; i < 5; i++) this.heartI.push(this.add.image(34 + i * 36, 34, 'heart'));
    this.add.image(W - 150, 34, 'coin').setScale(1.3);
    this.coinT = this.add.text(W - 128, 34, '0', st(32)).setOrigin(0, 0.5);
    this.ammoT = [];
    for (let i = 0; i < 2; i++) {
      const x = i === 0 ? 34 : W - 190, y = H - 50;
      this.add.image(x + 22, y, i === 0 ? 'knox' : 'zippy').setScale(0.3);
      this.add.image(x + 70, y + 2, 'trash0').setScale(0.9);
      this.ammoT.push(this.add.text(x + 92, y, '×3', st(30)).setOrigin(0, 0.5));
    }
    this.bossG = this.add.graphics();
    this.bossName = this.add.text(W / 2, 62, '', st(24)).setOrigin(0.5, 0).setVisible(false);
    this.msg = this.add.text(W / 2, 150, '', st(38, { align: 'center', strokeThickness: 8 })).setOrigin(0.5).setAlpha(0);
    this.signT = this.add.text(W / 2, H - 120, '', { fontFamily: FONT, fontSize: '26px', color: '#16101f', backgroundColor: '#fff6d2', padding: { x: 18, y: 12 }, align: 'center' }).setOrigin(0.5, 1).setVisible(false);
    this.fadeR = this.add.rectangle(0, 0, W, H, 0x000000, 1).setOrigin(0).setAlpha(0).setDepth(900);
    this.pauseG = this.add.rectangle(0, 0, W, H, 0x000000, 0.65).setOrigin(0).setVisible(false).setDepth(950);
    this.pauseT = this.add.text(W / 2, H / 2, '', st(40, { align: 'center', strokeThickness: 8 })).setOrigin(0.5).setVisible(false).setDepth(951);
    this.fin = [];
    this.ready = true;
  }
  update() {
    const L = this.L; if (!L || !L.p || !L.p[1]) return;
    for (let i = 0; i < 5; i++) this.heartI[i].setTexture(L.kids || i < L.hearts ? 'heart' : 'heart_e');
    this.coinT.setText(String(L.coinCount));
    L.p.forEach((p, i) => this.ammoT[i].setText('×' + p.ammo));
    const bo = L.bossObj, g = this.bossG; g.clear();
    if (bo && bo.started && !bo.dead) {
      const w = 520, x = W / 2 - w / 2, y = 26;
      g.fillStyle(OUT, 1); g.fillRoundedRect(x - 5, y - 5, w + 10, 30, 12);
      g.fillStyle(0x4a2030, 1); g.fillRoundedRect(x, y, w, 20, 8);
      g.fillStyle(0xff4a5a, 1); g.fillRoundedRect(x, y, Math.max(0, w * bo.hp / bo.maxHp), 20, 8);
      this.bossName.setVisible(true).setText(bo.title);
    } else this.bossName.setVisible(false);
  }
  toast(text, ms = 1800) {
    this.msg.setText(text).setAlpha(1); this.tweens.killTweensOf(this.msg);
    this.tweens.add({ targets: this.msg, alpha: 0, delay: ms, duration: 400 });
  }
  banner(text, ms = 1600) {
    const t = this.add.text(W / 2, H / 2 - 40, text, { fontFamily: FONT, fontSize: '92px', color: '#fff', stroke: '#16101f', strokeThickness: 16 }).setOrigin(0.5).setScale(0.2).setAlpha(0);
    this.tweens.add({ targets: t, scale: 1, alpha: 1, duration: 300, ease: 'Back.out' });
    this.tweens.add({ targets: t, alpha: 0, y: t.y - 60, delay: ms, duration: 400, onComplete: () => t.destroy() });
  }
  say(text, x, y, ms = 1800) {
    x = Phaser.Math.Clamp(x, 120, W - 120); y = Phaser.Math.Clamp(y, 100, H - 100);
    const t = this.add.text(x, y, text, { fontFamily: FONT, fontSize: '26px', color: '#16101f', backgroundColor: '#ffffff', padding: { x: 12, y: 8 } }).setOrigin(0.5, 1);
    this.tweens.add({ targets: t, y: y - 24, alpha: 0, delay: ms, duration: 400, onComplete: () => t.destroy() });
  }
  sign(text) { if (text) this.signT.setText(text).setVisible(true); else this.signT.setVisible(false); }
  fade(dir, ms) { this.tweens.killTweensOf(this.fadeR); this.tweens.add({ targets: this.fadeR, alpha: dir === 'out' ? 1 : 0, duration: ms }); }
  pause(on) { this.pauseG.setVisible(on); this.pauseT.setVisible(on).setText('PAUSE\n\nA / Enter: weiter\nEsc / B: zurück zum Menü'); }
  finish(coins, secs) {
    this.fin.push(this.add.rectangle(0, 0, W, H, 0x000000, 0.7).setOrigin(0).setDepth(960));
    this.fin.push(this.add.text(W / 2, 220, 'LEVEL GESCHAFFT!', { fontFamily: FONT, fontSize: '84px', color: '#ffe15a', stroke: '#16101f', strokeThickness: 14 }).setOrigin(0.5).setDepth(961));
    this.fin.push(this.add.text(W / 2, 360, `Münzen: ${coins}     Zeit: ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`, { fontFamily: FONT, fontSize: '44px', color: '#fff', stroke: '#16101f', strokeThickness: 8 }).setOrigin(0.5).setDepth(961));
    const hint = this.add.text(W / 2, 480, '▶ Weiter mit A / Enter', { fontFamily: FONT, fontSize: '32px', color: '#fff', stroke: '#16101f', strokeThickness: 6 }).setOrigin(0.5).setDepth(961);
    this.tweens.add({ targets: hint, alpha: 0.3, yoyo: true, repeat: -1, duration: 500 }); this.fin.push(hint);
  }
}
