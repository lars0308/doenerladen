// Minispiele (laufen in der normalen Level-Szene, aber mit eigenen Regeln, Zeitlimit und Punkten).
const MiniGames = {};

class MiniBase {
  constructor(s, secs) {
    this.s = s; this.t = secs; this.secs = secs; this.score = 0; this.over = false;
    s.hearts = 5; this.rnd = Phaser.Math.Between;
  }
  // zufällige freie Bodenkachel (mit Abstand zu Wänden/Abgründen)
  tile(minR = 1) {
    const s = this.s;
    for (let i = 0; i < 60; i++) {
      const x = this.rnd(2, s.gw - 3), y = this.rnd(2, s.gh - 3); let ok = s.at(x, y) === 1;
      for (let dx = -minR; dx <= minR && ok; dx++) for (let dy = -minR; dy <= minR && ok; dy++) if (s.at(x + dx, y + dy) !== 1) ok = false;
      if (ok && !s.p.some(p => Math.hypot(p.x - (x * T + 24), p.y - (y * T + 24)) < 90)) return [x, y];
    }
    return [Math.floor(s.gw / 2), Math.floor(s.gh / 2)];
  }
  finish(score, stars) { if (this.over) return; this.over = true; this.s.endMini(score, stars, MINI_RANKS[stars]); }
}
const MINI_RANKS = ['Weiter üben!', 'Bronze – gut gemacht!', 'Silber – stark!', 'GOLD – Weltklasse!'];

MiniGames.coins = class extends MiniBase {
  constructor(s) { super(s, 45); this.next = 0; this.nb = 3000; this.th = [14, 26, 40]; }
  update(dt, time) {
    const s = this.s; this.t -= dt;
    if (time > this.next && s.coinsA.filter(c => c.active).length < 18) { this.next = time + 480; const [x, y] = this.tile(); s.coin(x, y, Math.random() < 0.1 ? 5 : 1); }
    for (const c of s.coinsA.slice()) if (c.active && time - c.born > 9000) { c.destroy(); s.coinsA = s.coinsA.filter(q => q !== c); }
    if (time > this.nb) {
      this.nb = time + Math.max(1300, 2800 - (this.secs - this.t) * 35);
      const p = s.p[Phaser.Math.Between(0, 1)]; s.addZone(p.x + Phaser.Math.Between(-70, 70), p.y + Phaser.Math.Between(-70, 70), 66, s.kids ? 1500 : 1100, 250, 'bomb');
      if (this.t < 22) { const [x, y] = this.tile(); s.addZone(x * T + 24, y * T + 24, 66, s.kids ? 1500 : 1100, 250, 'bomb'); }
    }
    this.score = s.coinCount;
    s.miniText = `⏱ ${Math.max(0, Math.ceil(this.t))}      ★ ${this.score}`;
    if (this.t <= 0) this.finish(this.score, this.score >= this.th[2] ? 3 : this.score >= this.th[1] ? 2 : this.score >= this.th[0] ? 1 : 0);
  }
};

MiniGames.shoot = class extends MiniBase {
  constructor(s) { super(s, 45); this.next = 0; this.th = [12, 24, 40]; }
  update(dt, time) {
    const s = this.s; this.t -= dt;
    for (const p of s.p) p.ammo = 99;
    if (time > this.next && s.enemyList.length < 8) {
      this.next = time + Math.max(450, 950 - (this.secs - this.t) * 8);
      const [x, y] = this.tile(); const e = s.enemy('walker', x, y);
      e.cfg = Object.assign({}, e.cfg, { speed: 38, chase: 0 }); e.harmless = true; e.life = time + 4300; e.gold = Math.random() < 0.12; e.st = 'wander';
      s.burst(e.x, e.y, 'puff', 8, 60, e.gold ? 0xffd23f : 0xffffff);
    }
    for (const e of s.enemyList.slice()) if (e.active && time > e.life) { s.burst(e.x, e.y, 'puff', 6, 50); s.enemyList = s.enemyList.filter(o => o !== e); s.killActor(e); }
    s.miniText = `⏱ ${Math.max(0, Math.ceil(this.t))}      ★ ${this.score}`;
    if (this.t <= 0) this.finish(this.score, this.score >= this.th[2] ? 3 : this.score >= this.th[1] ? 2 : this.score >= this.th[0] ? 1 : 0);
  }
  onKill(e) { this.score += e.gold ? 5 : 1; this.s.toast(e.gold ? '+5 Goldschleim!' : '', 500); }
};

MiniGames.throw = class extends MiniBase {
  constructor(s) { super(s, 75); this.th = [8, 16, 26]; this.throws = 0; }
  update(dt, time) {
    const s = this.s; this.t -= dt;
    for (const p of s.p) if (p.returnAt && time > p.returnAt && p.state === 'normal' && !p.fly) {
      p.returnAt = 0; const o = s.p[1 - p.idx];
      s.burst(p.x, p.y, 'puff', 8, 60); s.placeAt(p, o.x - 40, o.y + 30); Sfx.play('pop');
    }
    s.miniText = `⏱ ${Math.max(0, Math.ceil(this.t))}      ★ ${this.score}      Würfe: ${this.throws}`;
    if (this.t <= 0) this.finish(this.score, this.score >= this.th[2] ? 3 : this.score >= this.th[1] ? 2 : this.score >= this.th[0] ? 1 : 0);
  }
  onLand(p) {
    this.throws++;
    const s = this.s, isl = s.islands.find(i => p.x > i.x && p.x < i.x + i.w && p.y > i.y && p.y < i.y + i.h);
    if (isl) { this.score += isl.pts; s.say('+' + isl.pts + '!', p.x, p.y - 70, 1200); Sfx.play('coin'); s.dropCoin(p.x, p.y, Math.min(4, isl.pts)); s.burst(p.x, p.y, 'star', 8, 90); p.returnAt = s.time.now + 1800; }
    else if (!s.pitAt(p.x, p.y)) p.returnAt = 0;
  }
};
