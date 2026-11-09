// Vier Endgegner in der Draufsicht. Jeder hat ein Muster mit Vorwarnung (rote Markierungen)
// und ist nur in bestimmten Phasen verwundbar.
const BOSS = {
  can:    { title: 'BLECHBERT – der Tonnen-Titan',   hp: 7, tex: 'boss_can',    fw: 120, fh: 64, yoff: 40 },
  slime:  { title: 'GLIBBER – der Schleimkönig',      hp: 8, tex: 'boss_slime',  fw: 170, fh: 70, yoff: 46 },
  digger: { title: 'GNADENLOS – die Bagger-Bestie',   hp: 8, tex: 'boss_digger', fw: 210, fh: 80, yoff: 48 },
  mech:   { title: 'DR. UNRAT im ENTSORGER 9000',     hp: 9, tex: 'boss_mech',   fw: 110, fh: 56, yoff: 28 },
  dragon: { title: 'EISFUNKE – der Kühlschrank-Drache', hp: 9, tex: 'boss_can',    fw: 150, fh: 76, yoff: 44 },
  keeper: { title: 'GERD – der Totengräber',          hp: 9, tex: 'boss_can',    fw: 110, fh: 66, yoff: 40 },
};

class Boss {
  constructor(scene, kind, x, y) {
    this.s = scene; this.kind = kind; const c = BOSS[kind]; this.cfg = c; this.title = c.title;
    this.maxHp = scene.kids ? Math.ceil(c.hp * 0.65) : c.hp; this.hp = this.maxHp;
    this.k = scene.kids ? 1.45 : 1;
    this.home = { x, y };
    this.spr = scene.actor(x, y, c.fw, c.fh, c.tex, c.yoff);
    this.spr.setCollideWorldBounds(true);
    scene.physics.add.collider(this.spr, scene.wallG);
    scene.physics.add.collider(this.spr, scene.gateG);
    this.shieldS = null;
    this.reset();
  }
  reset() {
    const s = this.s, spr = this.spr;
    this.hp = this.maxHp; this.started = false; this.dead = false; this.st = 'sleep'; this.t = 0; this.vuln = false; this.n = 0;
    s.zones = []; s.rings = []; s.warns = []; this.cool = 1500; this.wasV = false;
    spr.setActive(true).setVisible(true); spr.vis.setVisible(true).setAlpha(1).clearTint().setScale(1).setAngle(0);
    spr.body.enable = true; spr.body.reset(this.home.x, this.home.y); spr.z = (this.kind === 'mech' || this.kind === 'dragon') ? 110 : 0;
    spr.setTexture(spr.texture.key);
    if (this.kind === 'slime') spr.vis.setTexture('boss_slime');
    if (this.shieldS) { this.shieldS.destroy(); this.shieldS = null; }
    if (this.kind === 'mech') this.shieldS = s.add.image(spr.x, spr.y, 'shield').setDepth(3000).setAlpha(0);
  }
  start() {
    this.started = true; this.set('intro', 1300);
    this.s.banner(this.cfg.title.split('–')[0].replace(' im ENTSORGER 9000', '').trim(), 0xffffff, 2200);
    const t = { can: 'Ich bin die Ordnung im Chaos!', slime: 'Blubb! Das ist MEIN Kanal!', digger: 'Ich wurde zum Gnadenlosen erzogen.', mech: 'Der Müll gehorcht MIR!', dragon: 'Wer stört meine Kühlung?! FAUCH!', keeper: 'Hier ruht alles. Auch ihr gleich.' }[this.kind];
    this.s.say(t, this.spr.x, this.spr.y - 200, 2400);
  }
  set(st, ms) { this.st = st; this.t = ms; this.vuln = false; this.spr.vis.clearTint(); }
  target() { return this.s.nearest(this.spr.x, this.spr.y); }
  hurt(dmg) {
    if (!this.started || this.dead) return;
    if (!this.vuln) {
      if (this.s.time.now > (this.noteT || 0)) { this.noteT = this.s.time.now + 700; this.s.say('klonk!', this.spr.x, this.spr.y - 140, 500); Sfx.play('empty'); }
      return;
    }
    this.hp -= dmg; Sfx.play('hit'); this.s.shake(120, 0.006);
    this.spr.vis.setTintFill(0xffffff); this.s.time.delayedCall(90, () => this.spr.active && this.spr.vis.clearTint());
    this.s.burst(this.spr.x, this.spr.y - 60, 'star', 6, 80);
    if (this.hp <= 0) this.die();
  }
  stomp(p) {
    // Landung auf dem Boss: nur verwundbar = Schaden, sonst abprallen
    const v = new Phaser.Math.Vector2(p.x - this.spr.x, p.y - this.spr.y).normalize().scale(300);
    p.body.setVelocity(v.x, v.y); p.lockUntil = this.s.time.now + 200;
    if (this.vuln) { this.hurt(1); Sfx.play('stomp'); } else { this.hurt(0); }
  }
  die() {
    this.dead = true; this.st = 'dead'; this.s.zones = []; this.s.rings = [];
    const s = this.s, spr = this.spr;
    Sfx.play('boom'); s.shake(900, 0.02); Sfx.music(null);
    spr.body.setVelocity(0, 0); spr.body.enable = false;
    if (this.shieldS) this.shieldS.destroy();
    for (let i = 0; i < 14; i++) s.time.delayedCall(i * 90, () => { s.burst(spr.x + Phaser.Math.Between(-80, 80), spr.y - 40 + Phaser.Math.Between(-60, 40), 'puff', 8, 100, 0xffc080); s.burst(spr.x, spr.y - 40, 'star', 3, 140); Sfx.play('pop'); });
    s.tweens.add({ targets: spr.vis, angle: 12, alpha: 0, scale: 0.6, delay: 800, duration: 700, onComplete: () => spr.vis.setVisible(false) });
    s.time.delayedCall(1700, () => { s.dropCoin(spr.x, spr.y, 14); s.openExit(); Sfx.play('win'); });
    s.eshotG.getChildren().slice().forEach(e => s.killActor(e));
    for (const e of s.enemyList.slice()) s.killEnemy(e);
  }

  // Warn- und Gefahrenzonen am Boden (Pfützen, Bomben) und Schockwellen – liegen im Level (s.zones / s.rings)
  zone(x, y, r, warn, life, type) { this.s.addZone(x, y, r, warn, life, type); }
  ring(x, y, max) { this.s.addRing(x, y, max, 330 / (this.k > 1 ? 1.25 : 1)); }
  shock() { this.s.shake(350, 0.014); Sfx.play('boom'); }

  update(dt, time) {
    const spr = this.spr, s = this.s;
    if (!this.started || this.dead) { if (!this.started) { this.idle(time); } return; }
    this.t -= dt * 1000;
    const p = this.target();
    // Berührungsschaden
    const contact = this.st !== 'intro' && (this.kind === 'dragon' ? this.st === 'dive' : !(this.vuln && this.kind !== 'mech') && this.kind !== 'mech');
    if (contact)
      for (const q of s.p) if (q.state === 'normal' && q.z < 14 && !q.fly && ov(q, spr)) s.hurtPlayer(q, spr.x, spr.y);
    ({ can: this.uCan, slime: this.uSlime, digger: this.uDigger, mech: this.uMech, dragon: this.uDragon, keeper: this.uKeeper })[this.kind].call(this, dt, time, p);
    s.syncVis(spr);
  }
  idle(time) { this.spr.z = (this.kind === 'mech' || this.kind === 'dragon') ? 110 + Math.sin(time / 400) * 8 : 0; this.s.syncVis(this.spr); if (this.shieldS) this.shieldS.setPosition(this.spr.x, this.spr.y - this.spr.z - 100); }

  // 1) Tonnen-Titan: springt auf euch zu (Zielkreis!), Schockwelle (drüber hopsen!), danach betäubt
  uCan(dt, time, p) {
    const s = this.s, spr = this.spr, b = spr.body;
    spr.vis.setFlipX(p.x > spr.x);
    if (this.st === 'intro' && this.t <= 0) this.set('idle', 800 * this.k);
    else if (this.st === 'idle' && this.t <= 0) {
      this.land = { x: p.x, y: p.y }; this.set('leap', 950 * (this.k > 1 ? 1.2 : 1)); this.leapT = this.t;
      b.setVelocity((this.land.x - spr.x) / (this.t / 1000), (this.land.y - spr.y) / (this.t / 1000));
    } else if (this.st === 'leap') {
      const f = 1 - this.t / this.leapT; spr.z = Math.sin(Math.max(0, Math.min(1, f)) * Math.PI) * 150;
      s.warns.push({ x: this.land.x, y: this.land.y, r: 80, leap: true });
      if (this.t <= 0) {
        b.setVelocity(0, 0); spr.z = 0; this.shock(); this.n++;
        this.ring(spr.x, spr.y, 460);
        s.burst(spr.x, spr.y, 'puff', 10, 120, 0xcccccc);
        if (this.hp <= this.maxHp / 2 && this.n % 2 === 0) { s.spawnEnemy('walker', spr.x - 160, spr.y); s.spawnEnemy('walker', spr.x + 160, spr.y); }
        if (this.n % 2 === 0) { this.set('stun', 3000 / (this.k > 1 ? 1.2 : 1)); this.vuln = true; spr.vis.setTint(0xffe9a0); s.say('Uff… mein Deckel!', spr.x, spr.y - 200, 1200); }
        else this.set('idle', 800 * this.k);
      }
    } else if (this.st === 'stun') {
      spr.vis.setAngle(Math.sin(time / 60) * 3);
      if (Math.floor(time / 200) % 2 === 0) s.burst(spr.x, spr.y - 170, 'star', 1, 30);
      if (this.t <= 0) { spr.vis.setAngle(0); this.set('idle', 600 * this.k); }
    }
  }

  // 2) Schleimkönig: spuckt Schleim-Fächer, legt Pfützen (Vorwarnung!), dann Maul auf = verwundbar
  uSlime(dt, time, p) {
    const s = this.s, spr = this.spr, b = spr.body;
    spr.vis.setFlipX(p.x > spr.x); spr.vis.setAngle(Math.sin(time / 200) * 1.5);
    if (this.st !== 'open') b.setVelocity(0, Math.sin(time / 1100) * 70);
    else b.setVelocity(0, 0);
    if (this.st === 'intro' && this.t <= 0) { this.set('spit', 800 * this.k); this.n = 0; }
    else if (this.st === 'spit' && this.t <= 0) {
      const sp = 250 / (this.k > 1 ? 1.25 : 1);
      for (const q of s.p) if (q.state === 'normal') {
        const a = Math.atan2(q.y - spr.y, q.x - spr.x);
        for (const d of [-0.28, 0, 0.28]) s.eshot(spr.x, spr.y, Math.cos(a + d) * sp, Math.sin(a + d) * sp);
      }
      Sfx.play('shoot');
      if (++this.n >= 3) this.set('puddle', 700); else this.t = 1100 * this.k;
    } else if (this.st === 'puddle' && this.t <= 0) {
      for (const q of s.p) if (q.state === 'normal') this.zone(q.x, q.y, 80, 1000 * this.k, 3500, 'goo');
      const r = s.arenaR; this.zone(Phaser.Math.Between(r.x + 150, r.x + r.w - 150), Phaser.Math.Between(r.y + 150, r.y + r.h - 150), 80, 1000 * this.k, 3500, 'goo');
      if (this.hp <= this.maxHp / 2) { s.spawnEnemy('walker', spr.x - 150, spr.y + 40); s.spawnEnemy('walker', spr.x + 150, spr.y + 40); }
      this.set('open', 3400 / (this.k > 1 ? 1.2 : 1)); this.vuln = true; spr.vis.setTexture('boss_slime_open'); s.say('Aaaah…', spr.x, spr.y - 200, 1000);
    } else if (this.st === 'open' && this.t <= 0) { this.vuln = false; spr.vis.setTexture('boss_slime'); this.set('spit', 800 * this.k); this.n = 0; }
  }

  // 3) Bagger: rennt in geraden Linien (Warnstreifen!) in die Wand, dann betäubt; Bomben fallen
  uDigger(dt, time, p) {
    const s = this.s, spr = this.spr, b = spr.body;
    if (this.st === 'intro' && this.t <= 0) this.set('aim', 1200 * this.k);
    else if (this.st === 'aim') {
      const dx = p.x - spr.x, dy = p.y - spr.y;
      this.dir = Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx) || 1, y: 0 } : { x: 0, y: Math.sign(dy) || 1 };
      spr.vis.setFlipX(this.dir.x < 0 || (this.dir.x === 0 && spr.vis.flipX));
      spr.vis.x += Math.sin(time / 30) * 1.5;
      const L = 900, w = 110;
      const rx = this.dir.x ? spr.x + this.dir.x * L / 2 : spr.x, ry = this.dir.y ? spr.y + this.dir.y * L / 2 : spr.y;
      s.warns.push({ x: rx, y: ry, w: this.dir.x ? L : w, h: this.dir.y ? L : w, rect: true });
      if (this.t <= 0) { this.set('charge', 3000); Sfx.play('boss'); }
    } else if (this.st === 'charge') {
      const sp = (this.hp <= this.maxHp / 2 ? 560 : 470) / (this.k > 1 ? 1.35 : 1);
      b.setVelocity(this.dir.x * sp, this.dir.y * sp);
      const hit = (this.dir.x > 0 && b.blocked.right) || (this.dir.x < 0 && b.blocked.left) || (this.dir.y > 0 && b.blocked.down) || (this.dir.y < 0 && b.blocked.up);
      if (hit || this.t <= 0) {
        b.setVelocity(0, 0); s.shake(500, 0.02); Sfx.play('boom');
        s.burst(spr.x + this.dir.x * 120, spr.y + this.dir.y * 60, 'puff', 12, 120, 0xbbbbbb);
        const r = s.arenaR, nb = this.hp <= this.maxHp / 2 ? 5 : 3;
        for (let i = 0; i < nb; i++) this.zone(Phaser.Math.Between(r.x + 120, r.x + r.w - 120), Phaser.Math.Between(r.y + 120, r.y + r.h - 120), 66, 1300 * this.k, 300, 'bomb');
        this.set('stun', 3300 / (this.k > 1 ? 1.2 : 1)); this.vuln = true; spr.vis.setTint(0xffe9a0); s.say('Mein Kopf!', spr.x, spr.y - 170, 1200);
      }
    } else if (this.st === 'stun') {
      b.setVelocity(0, 0); spr.vis.setAngle(Math.sin(time / 60) * 1.2);
      if (Math.floor(time / 220) % 2 === 0) s.burst(spr.x, spr.y - 120, 'star', 1, 30);
      if (this.t <= 0) { spr.vis.setAngle(0); this.set('aim', 1000 * this.k); }
    }
  }

  // 4) Dr. Unrat im Mech: Schutzschild – beide Kern-Schalter (rot + blau) gleichzeitig treffen!
  uMech(dt, time, p) {
    const s = this.s, spr = this.spr, sh = this.shieldS, r = s.arenaR;
    const coreOn = s.active('c1') && s.active('c2');
    const phase2 = this.hp <= this.maxHp / 2;
    if (this.st === 'intro' && this.t <= 0) this.set('fight', 1);
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    spr.body.reset(cx + Math.sin(time / (1800 / (phase2 ? 1.3 : 1))) * 360, cy + Math.cos(time / 1300) * 120);
    spr.z = 110 + Math.sin(time / 300) * 8;
    if (this.st === 'intro') { sh.setPosition(spr.x, spr.y - spr.z - 100).setAlpha(0.3); return; }
    this.vuln = coreOn;
    if (this.vuln && !this.wasV) { s.say('Der Schild! Neeein!', spr.x, spr.y - 280, 1400); Sfx.play('boom'); spr.vis.setTint(0xffd0d0); }
    if (!this.vuln && this.wasV) spr.vis.clearTint();
    this.wasV = this.vuln;
    sh.setPosition(spr.x, spr.y - spr.z - 100).setAlpha(this.vuln ? 0 : 0.6 + Math.sin(time / 120) * 0.15).setScale(0.9);
    // Schatten-Markierung unter dem Mech, damit man sieht, wohin man schießen muss
    this.cool -= dt * 1000;
    if (this.cool <= 0) {
      this.n++;
      const atk = this.n % (phase2 ? 4 : 3);
      if (atk === 0) { for (const q of s.p) if (q.state === 'normal') this.zone(q.x, q.y, 74, 1200 * this.k, 300, 'bomb'); this.zone(spr.x, spr.y + 40, 74, 1200 * this.k, 300, 'bomb'); Sfx.play('shoot'); }
      else if (atk === 3) { s.spawnEnemy('flyer', spr.x - 200, spr.y + 40); s.spawnEnemy('flyer', spr.x + 200, spr.y + 40); Sfx.play('pop'); }
      else {
        const a = Math.atan2(p.y - spr.y, p.x - spr.x), sp = 300 / (this.k * 0.7 + 0.3);
        for (let i = -1; i <= 1; i++) s.eshot(spr.x, spr.y, Math.cos(a + i * 0.24) * sp, Math.sin(a + i * 0.24) * sp, 'red');
        Sfx.play('shoot');
      }
      this.cool = (phase2 ? 1700 : 2300) * this.k;
    }
  }

  // 5) Drache: schwebt und spuckt Feuerfächer, markiert einen Punkt, stürzt hinab (Schockwelle!) – danach am Boden verwundbar
  uDragon(dt, time, p) {
    const s = this.s, spr = this.spr, r = s.arenaR, cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    const phase2 = this.hp <= this.maxHp / 2;
    if (this.st === 'intro') { if (this.t <= 0) { this.set('fly', 1); this.n = 0; this.cool = 800; } spr.z = 110 + Math.sin(time / 300) * 10; return; }
    if (this.st === 'fly') {
      spr.z = 110 + Math.sin(time / 300) * 10;
      spr.body.reset(cx + Math.sin(time / 1500) * 380, cy - 60 + Math.sin(time / 900) * 110);
      this.cool -= dt * 1000;
      if (this.cool <= 0) {
        const a0 = Math.atan2(p.y - spr.y, p.x - spr.x), sp = 250 / (this.k > 1 ? 1.2 : 1);
        for (const d of [-0.3, 0, 0.3]) s.eshot(spr.x, spr.y, Math.cos(a0 + d) * sp, Math.sin(a0 + d) * sp, 'fire');
        Sfx.play('shoot'); this.cool = (phase2 ? 1100 : 1500) * this.k;
        if (++this.n >= (phase2 ? 5 : 4)) { this.set('mark', 1000 * this.k); this.land = { x: p.x, y: p.y }; }
      }
    } else if (this.st === 'mark') {
      spr.z = 110; s.warns.push({ x: this.land.x, y: this.land.y, r: 85, leap: true });
      if (this.t <= 0) { this.set('dive', 650); this.diveFrom = { x: spr.x, y: spr.y }; Sfx.play('boss'); }
    } else if (this.st === 'dive') {
      const f = 1 - Math.max(0, this.t) / 650;
      spr.body.reset(this.diveFrom.x + (this.land.x - this.diveFrom.x) * f, this.diveFrom.y + (this.land.y - this.diveFrom.y) * f); spr.z = 110 * (1 - f);
      s.warns.push({ x: this.land.x, y: this.land.y, r: 85, leap: true });
      if (this.t <= 0) {
        spr.z = 0; this.shock(); this.ring(spr.x, spr.y, 460); s.burst(spr.x, spr.y, 'puff', 12, 130, 0xcfe8ff);
        this.set('stun', 3000 / (this.k > 1 ? 1.2 : 1)); this.vuln = true; spr.vis.setTint(0xffe9a0); s.say('Autsch… mein Kühlmittel!', spr.x, spr.y - 200, 1200);
        if (phase2) { s.spawnEnemy('flyer', spr.x - 200, spr.y); s.spawnEnemy('flyer', spr.x + 200, spr.y); }
      }
    } else if (this.st === 'stun') {
      spr.z = 0; spr.body.setVelocity(0, 0);
      if (Math.floor(time / 220) % 2 === 0) s.burst(spr.x, spr.y - 100, 'star', 1, 30);
      if (this.t <= 0) { this.set('fly', 1); this.n = 0; this.cool = 700; spr.vis.clearTint(); }
    }
  }

  // 6) Totengräber: stapft hinter euch her, Stampf-Schlag mit Warnkreis + Schockwelle, ruft Zombies, ruht danach auf dem Spaten (verwundbar)
  uKeeper(dt, time, p) {
    const s = this.s, spr = this.spr, b = spr.body, phase2 = this.hp <= this.maxHp / 2;
    if (this.st === 'intro') { if (this.t <= 0) this.set('chase', 3200 * this.k); return; }
    if (this.st === 'chase') {
      const dx = p.x - spr.x, dy = p.y - spr.y, d = Math.hypot(dx, dy) || 1, sp = (phase2 ? 150 : 120) / (this.k > 1 ? 1.3 : 1);
      b.setVelocity(dx / d * sp, dy / d * sp);
      if (this.t <= 0) { b.setVelocity(0, 0); this.set('windup', 1000 * this.k); }
    } else if (this.st === 'windup') {
      b.setVelocity(0, 0); s.warns.push({ x: spr.x, y: spr.y, r: 120, leap: true });
      if (this.t <= 0) {
        this.set('slam', 400); this.shock(); this.ring(spr.x, spr.y, 440); s.burst(spr.x, spr.y, 'puff', 10, 120, 0x8a7a6a);
        this.n++; if (phase2 || this.n % 2 === 0) { s.spawnEnemy('walker', spr.x - 180, spr.y + 40); s.spawnEnemy('walker', spr.x + 180, spr.y + 40); }
      }
    } else if (this.st === 'slam') {
      if (this.t <= 0) { this.set('rest', 3000 / (this.k > 1 ? 1.2 : 1)); this.vuln = true; spr.vis.setTint(0xffe9a0); s.say('Puh… Rücken!', spr.x, spr.y - 190, 1200); }
    } else if (this.st === 'rest') {
      b.setVelocity(0, 0);
      if (Math.floor(time / 220) % 2 === 0) s.burst(spr.x, spr.y - 90, 'star', 1, 30);
      if (this.t <= 0) { spr.vis.clearTint(); this.set('chase', 3200 * this.k); }
    }
  }
}
