// HUD als eigene Szene über der 3D-Ansicht: Herzen, Münzen, Munition, Boss-Leiste, Meldungen.
class HudScene extends Phaser.Scene {
  constructor() { super('Hud'); }
  init(d) { this.L = d.level; this.ready = false; }
  create() {
    const st = (size, extra = {}) => Object.assign({ fontFamily: FONT, fontSize: size + 'px', color: '#fff', stroke: '#16101f', strokeThickness: 6 }, extra);
    this.add.image(W - 150, 34, 'coin').setScale(1.3);
    this.coinT = this.add.text(W - 128, 34, '0', st(32)).setOrigin(0, 0.5);
    this.trashT = this.add.text(30, 34, '', st(30)).setOrigin(0, 0.5);
    // Pro Spieler: Porträt, Name, Leben, Müll-Tank
    this.pl = [0, 1].map(i => {
      const w = 360, h = 112, x = i === 0 ? 20 : W - 20 - w, y = H - h - 14, col = PLAYER_COLORS.find(c => c.id === Cfg.players[i].color);
      const g = this.add.graphics(); g.fillStyle(0x140e26, 0.72); g.fillRoundedRect(x, y, w, h, 26); g.lineStyle(5, UI.hex(col.css), 1); g.strokeRoundedRect(x, y, w, h, 26);
      this.add.image(x + 54, y + 52, 'port_' + Cfg.players[i].color).setScale(0.36);
      this.add.text(x + 118, y + 8, Cfg.players[i].name, st(26, { color: col.css })).setOrigin(0, 0);
      const hearts = []; for (let k = 0; k < 5; k++) hearts.push(this.add.image(x + 134 + k * 36, y + 58, 'heart').setScale(1.05));
      this.add.image(x + 118, y + 90, 'trash0').setScale(0.7);
      const bar = this.add.graphics(), txt = this.add.text(x + 304, y + 90, '', st(22)).setOrigin(0.5);
      const ko = this.add.text(x + 250, y + 58, '', st(30, { color: '#ff6a8a' })).setOrigin(0.5);
      const pwT = this.add.text(x + w / 2, y - 18, '', st(26, { color: '#ffe15a' })).setOrigin(0.5);
      return { x, y, w, h, hearts, bar, txt, ko, pwT };
    });
    this.hintG = this.add.graphics(); this.hintT = [0, 1].map(() => this.add.text(0, 0, '', st(20)).setOrigin(0.5));
    this.bossG = this.add.graphics();
    this.bossName = this.add.text(W / 2, 62, '', st(24)).setOrigin(0.5, 0).setVisible(false);
    this.msg = this.add.text(W / 2, 150, '', st(38, { align: 'center', strokeThickness: 8 })).setOrigin(0.5).setAlpha(0);
    this.signT = this.add.text(W / 2, H - 120, '', { fontFamily: FONT, fontSize: '26px', color: '#16101f', backgroundColor: '#fff6d2', padding: { x: 18, y: 12 }, align: 'center' }).setOrigin(0.5, 1).setVisible(false);
    this.miniT = this.add.text(W / 2, 40, '', { fontFamily: FONT, fontSize: '52px', color: '#ffe15a', stroke: '#16101f', strokeThickness: 10 }).setOrigin(0.5).setVisible(false);
    this.fadeR = this.add.rectangle(0, 0, W, H, 0x000000, 1).setOrigin(0).setAlpha(0).setDepth(900);
    this.pauseG = this.add.rectangle(0, 0, W, H, 0x000000, 0.65).setOrigin(0).setVisible(false).setDepth(950);
    this.pauseT = this.add.text(W / 2, H / 2, '', st(40, { align: 'center', strokeThickness: 8 })).setOrigin(0.5).setVisible(false).setDepth(951);
    this.fin = [];
    this.ready = true;
  }
  update() {
    const L = this.L; if (!L || !L.p || !L.p[1]) return;
    this.coinT.setText(String(L.coinCount));
    this.trashT.setText(L.mini ? '' : '♻ ' + L.trashGot + ' / ' + (L.quota || L.trashTotal) + (L.quota ? ' (Ziel)' : ''));
    L.p.forEach((p, i) => {
      const u = this.pl[i];
      u.hearts.forEach((hh, k) => hh.setTexture(L.kids || k < p.hp ? 'heart' : 'heart_e').setAlpha(p.state === 'down' ? 0.4 : 1));
      const f = Math.min(1, (p.charge || 0) / p.maxAmmo), full = f >= 0.999, g = u.bar; g.clear();
      g.fillStyle(0x16101f, 1); g.fillRoundedRect(u.x + 138, u.y + 80, 130, 20, 8);
      g.fillStyle(full ? 0x7dff8a : 0xb8a56a, 1); g.fillRoundedRect(u.x + 140, u.y + 82, Math.max(6, 126 * f), 16, 6);
      u.txt.setText(full ? 'SUPER! ' + p.ammo : '' + p.ammo).setColor(full ? '#7dff8a' : '#ffffff');
      u.ko.setText(p.state === 'down' ? 'K.O.' : '');
      const left = p.pw ? Math.max(0, Math.ceil((p.pw.until - L.time.now) / 1000)) : 0;
      u.pwT.setText(left ? { ball: '⚽ Hüpf-Ball', wings: '🪽 Flügel', magnet: '🧲 Magnet' }[p.pw.kind] + '  ' + left + ' s' : '');
    });
    // Pfeile zum Partner, wenn er außerhalb des Bildes ist
    const hg = this.hintG; hg.clear(); this.hintT.forEach(t => t.setVisible(false));
    (L.hint || []).forEach((ht, i) => {
      if (!ht.off || L.p[i].state === 'held') return;
      const col = UI.hex(PLAYER_COLORS.find(c => c.id === Cfg.players[i].color).css);
      hg.fillStyle(col, 0.95); hg.lineStyle(5, OUT, 1);
      const a = ht.ang, px = ht.x, py = ht.y, r = 22, pts = [[Math.cos(a) * r, Math.sin(a) * r], [Math.cos(a + 2.5) * r, Math.sin(a + 2.5) * r], [Math.cos(a - 2.5) * r, Math.sin(a - 2.5) * r]];
      hg.beginPath(); hg.moveTo(px + pts[0][0], py + pts[0][1]); hg.lineTo(px + pts[1][0], py + pts[1][1]); hg.lineTo(px + pts[2][0], py + pts[2][1]); hg.closePath(); hg.fillPath(); hg.strokePath();
      this.hintT[i].setVisible(true).setPosition(px - Math.cos(a) * 34, py - Math.sin(a) * 34).setText(Cfg.players[i].name + ' · ' + ht.dist + ' m').setColor(PLAYER_COLORS.find(c => c.id === Cfg.players[i].color).css);
    });
    this.miniT.setVisible(!!L.mini).setText(L.miniText || '');
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
  finish(coins, secs, got, total, cleaned) {
    const pct = total ? Math.round(100 * got / total) : 0, stars = pct >= 85 ? 3 : pct >= 60 ? 2 : pct >= 30 ? 1 : 0;
    this.fin.push(this.add.rectangle(0, 0, W, H, 0x000000, 0.72).setOrigin(0).setDepth(960));
    this.fin.push(this.add.text(W / 2, 150, 'LEVEL GESCHAFFT!', { fontFamily: FONT, fontSize: '80px', color: '#ffe15a', stroke: '#16101f', strokeThickness: 14 }).setOrigin(0.5).setDepth(961));
    this.fin.push(this.add.text(W / 2, 270, `Münzen: ${coins}      Zeit: ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`, { fontFamily: FONT, fontSize: '40px', color: '#fff', stroke: '#16101f', strokeThickness: 8 }).setOrigin(0.5).setDepth(961));
    this.fin.push(this.add.text(W / 2, 345, `♻ Aufgeräumt: ${got} von ${total}  (${pct} %)      Tonnen-Treffer: ${cleaned}`, { fontFamily: FONT, fontSize: '36px', color: '#7dff8a', stroke: '#16101f', strokeThickness: 8 }).setOrigin(0.5).setDepth(961));
    this.fin.push(this.add.text(W / 2, 440, '★'.repeat(stars) + '☆'.repeat(3 - stars), { fontFamily: FONT, fontSize: '90px', color: '#ffd23f', stroke: '#16101f', strokeThickness: 12 }).setOrigin(0.5).setDepth(961));
    const hint = this.add.text(W / 2, 560, '▶ Weiter mit A / Enter', { fontFamily: FONT, fontSize: '32px', color: '#fff', stroke: '#16101f', strokeThickness: 6 }).setOrigin(0.5).setDepth(961);
    this.tweens.add({ targets: hint, alpha: 0.3, yoyo: true, repeat: -1, duration: 500 }); this.fin.push(hint);
  }
  finishMini(name, score, stars, label) {
    this.fin.push(this.add.rectangle(0, 0, W, H, 0x000000, 0.72).setOrigin(0).setDepth(960));
    this.fin.push(this.add.text(W / 2, 170, name, { fontFamily: FONT, fontSize: '70px', color: '#ffe15a', stroke: '#16101f', strokeThickness: 12 }).setOrigin(0.5).setDepth(961));
    this.fin.push(this.add.text(W / 2, 290, 'Punkte: ' + score, { fontFamily: FONT, fontSize: '64px', color: '#fff', stroke: '#16101f', strokeThickness: 10 }).setOrigin(0.5).setDepth(961));
    this.fin.push(this.add.text(W / 2, 390, '★'.repeat(stars) + '☆'.repeat(3 - stars), { fontFamily: FONT, fontSize: '96px', color: '#ffd23f', stroke: '#16101f', strokeThickness: 12 }).setOrigin(0.5).setDepth(961));
    this.fin.push(this.add.text(W / 2, 480, label, { fontFamily: FONT, fontSize: '40px', color: '#fff', stroke: '#16101f', strokeThickness: 8 }).setOrigin(0.5).setDepth(961));
    const hint = this.add.text(W / 2, 580, '▶ Weiter mit A / Enter', { fontFamily: FONT, fontSize: '32px', color: '#fff', stroke: '#16101f', strokeThickness: 6 }).setOrigin(0.5).setDepth(961);
    this.tweens.add({ targets: hint, alpha: 0.3, yoyo: true, repeat: -1, duration: 500 }); this.fin.push(hint);
  }
}
