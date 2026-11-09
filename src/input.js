// Eingabe: Controller (bis zu 2) und Tastatur gleichzeitig.
// Spieler 1: Pad 1 ODER Tastatur (WASD, Leertaste springen, F schießen, G saugen)
// Spieler 2: Pad 2 ODER Tastatur (Pfeile, Enter springen, . schießen, , saugen)
function getPads() {
  const list = (navigator.getGamepads ? navigator.getGamepads() : []) || [];
  const pads = [];
  for (let i = 0; i < list.length; i++) if (list[i] && list[i].connected) pads.push(list[i]);
  return pads;
}

class Ctrl {
  constructor(scene, idx) {
    this.idx = idx;
    const K = Phaser.Input.Keyboard.KeyCodes;
    const kb = scene.input.keyboard;
    this.keys = idx === 0
      ? kb.addKeys({ l: K.A, r: K.D, u: K.W, d: K.S, jump: K.SPACE, shoot: K.F, suck: K.G, jump2: K.V })
      : kb.addKeys({ l: K.LEFT, r: K.RIGHT, u: K.UP, d: K.DOWN, jump: K.ENTER, shoot: K.PERIOD, suck: K.COMMA, jump2: K.SHIFT });
    this.prev = { jump: false, shoot: false, start: false, confirm: false };
    this.hasPad = false;
  }
  read() {
    const k = this.keys;
    let x = (k.r.isDown ? 1 : 0) - (k.l.isDown ? 1 : 0);
    let y = (k.d.isDown ? 1 : 0) - (k.u.isDown ? 1 : 0);
    let jump = k.jump.isDown || k.jump2.isDown, shoot = k.shoot.isDown, suck = k.suck.isDown, start = false, back = false;
    const pad = getPads()[this.idx];
    this.hasPad = !!pad;
    if (pad) {
      const ax = pad.axes[0] || 0, ay = pad.axes[1] || 0;
      if (Math.abs(ax) > 0.25) x = ax;
      if (Math.abs(ay) > 0.25) y = ay;
      const b = i => pad.buttons[i] && pad.buttons[i].pressed;
      if (b(14)) x = -1; if (b(15)) x = 1; if (b(12)) y = -1; if (b(13)) y = 1;
      jump = jump || b(0);
      shoot = shoot || b(2) || b(5) || b(7);
      suck = suck || b(1) || b(4) || b(6);
      start = b(9);
      back = b(8);
    }
    const out = {
      x, y, jump, shoot, suck,
      jumpEdge: jump && !this.prev.jump,
      shootEdge: shoot && !this.prev.shoot,
      startEdge: start && !this.prev.start,
      back,
    };
    this.prev.jump = jump; this.prev.shoot = shoot; this.prev.start = start;
    return out;
  }
}

// Menü-Navigation: alle Geräte zusammen
class MenuNav {
  constructor(scene, opt = {}) {
    this.scene = scene; this.opt = opt;
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.k = scene.input.keyboard.addKeys({
      up: K.UP, down: K.DOWN, left: K.LEFT, right: K.RIGHT, w: K.W, s: K.S, a: K.A, d: K.D,
      enter: K.ENTER, space: K.SPACE, esc: K.ESC, m: K.M,
    });
    this.prev = {};
    this.padPrev = {};
  }
  poll() {
    const k = this.k, pads = getPads();
    const cur = {
      up: k.up.isDown || k.w.isDown, down: k.down.isDown || k.s.isDown, left: k.left.isDown || k.a.isDown, right: k.right.isDown || k.d.isDown,
      ok: k.enter.isDown || k.space.isDown, back: k.esc.isDown, mute: k.m.isDown,
    };
    for (const p of pads) {
      const b = i => p.buttons[i] && p.buttons[i].pressed;
      const ax = p.axes[0] || 0, ay = p.axes[1] || 0;
      cur.up = cur.up || b(12) || ay < -0.6; cur.down = cur.down || b(13) || ay > 0.6;
      cur.left = cur.left || b(14) || ax < -0.6; cur.right = cur.right || b(15) || ax > 0.6;
      cur.ok = cur.ok || b(0) || b(9); if (!this.opt.noPadBack) cur.back = cur.back || b(1); else cur.back = cur.back || b(8);
    }
    const out = {};
    for (const key in cur) out[key] = cur[key] && !this.prev[key];
    this.prev = cur;
    if (out.mute) Sfx.toggleMute();
    return out;
  }
}
