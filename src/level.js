// Level-Szene in schräger Draufsicht (Zelda-Stil): freie Bewegung, Hopsen über Gräben,
// Partner einsaugen & über Abgründe werfen, Müll schießen, Rätsel, Endgegner.
const SPEED = 235, LV = 600, FLY_T = 0.8, HOP_T = 0.46, HOP_V = 400;
const ENEMY = {
  walker:  { tex: 'e_walker',  fw: 30, fh: 18, hp: 1, speed: 78,  stomp: true,  chase: 270 },
  armor:   { tex: 'e_armor',   fw: 34, fh: 20, hp: 3, speed: 58,  stomp: false, chase: 300 },
  flyer:   { tex: 'e_flyer',   fw: 28, fh: 16, hp: 1, speed: 90,  stomp: true,  fly: true, chase: 380, bomb: true },
  archer:  { tex: 'e_walker',  fw: 30, fh: 18, hp: 2, speed: 70,  stomp: true,  chase: 560, ranged: true },
  kamikaze:{ tex: 'e_walker', fw: 30, fh: 18, hp: 1, speed: 150, stomp: true,  chase: 430, kamikaze: true },
  ghost:   { tex: 'e_flyer',   fw: 28, fh: 16, hp: 2, speed: 78,  stomp: false, fly: true, chase: 650, ghost: true },
  sawer:   { tex: 'e_walker',  fw: 40, fh: 24, hp: 999, speed: 130, stomp: false, saw: true, invuln: true },
  jumper:  { tex: 'e_walker',  fw: 30, fh: 18, hp: 2, speed: 0,   stomp: true,  chase: 440, jumper: true },
  drake:   { tex: 'e_flyer',   fw: 34, fh: 20, hp: 4, speed: 95,  stomp: false, fly: true, chase: 640, shooter: true },
  turret:  { tex: 'e_turret',  fw: 34, fh: 20, hp: 2, speed: 0,   stomp: false, still: true },
  charger: { tex: 'e_charger', fw: 44, fh: 18, hp: 2, speed: 70,  stomp: true,  charge: true, chase: 380 },
};
const ov = (a, b) => { const A = a.body, B = b.body; return A.right > B.left && A.left < B.right && A.bottom > B.top && A.top < B.bottom; };
const approach = (v, t, a) => (v < t ? Math.min(v + a, t) : Math.max(v - a, t));
const GCOL = { red: 0xff4d4d, blue: 0x4da6ff, green: 0x4dff88, yellow: 0xffd24d, pink: 0xff7ad9 };

class LevelScene extends Phaser.Scene {
  constructor() { super('Level'); }
  init(d) { this.lv = d.level; this.mode = d.mode || 'normal'; this.kids = this.mode === 'kids'; }

  // ───────────────────────── Aufbau ─────────────────────────
  create() {
    const def = this.def = LEVELS[this.lv];
    const sh = def.shift || 0; this.ox = 0;
    this.theme = def.theme; this.gw = def.size[0] + sh; this.gh = def.size[1];
    this.A = def.arena ? def.arena[0] + sh : 0; this.AY = def.arena ? def.arena[1] : 0;
    this.arenaR = { x: this.A * T, y: this.AY * T, w: 26 * T, h: 15 * T };
    this.mini = null; this.miniText = ''; this.springsA = []; this.icesA = []; this.spawners = []; this.islands = [];
    this.t0 = this.time.now; this.coinCount = 0; this.paused = false; this.done = false;
    this.coinsA = []; this.pickups = []; this.crateList = []; this.enemyList = []; this.groups = {};
    this.gates = []; this.bridges = []; this.targets = []; this.plates = []; this.spikesA = []; this.moversA = [];
    this.crushers = []; this.lasers = []; this.convs = []; this.cps = []; this.signs = []; this.zones = []; this.rings = []; this.warns = []; this.powers = [];
    this.bossObj = null; this.bossStarted = false; this.exitOpen = false; this.lockGate = null;
    this.hearts = 5; this.maxHearts = 5; this.pitSet = new Set(); this.bridged = new Set();
    this.foods = []; this.bins = []; this.hint = []; this.trashTotal = 0; this.trashGot = 0; this.cleaned = 0;
    this.grid = Array.from({ length: this.gh }, () => new Array(this.gw).fill(0)); this.elev = Array.from({ length: this.gh }, () => new Float32Array(this.gw)); this.decos = []; this.decoCells = new Set(); this.pickupsPw = [];
    this.cp = { x: def.start[0] * T, y: def.start[1] * T };

    this.physics.world.gravity.y = 0;
    this.physics.world.setBounds(0, 0, this.gw * T, this.gh * T);
    this.cameras.main.setBounds(0, 0, this.gw * T, this.gh * T).setVisible(false);

    this.wallG = this.physics.add.staticGroup(); this.gateG = this.physics.add.staticGroup();
    this.crateG = this.physics.add.staticGroup(); this.targetG = this.physics.add.staticGroup(); this.binG = this.physics.add.staticGroup();
    this.pitBlockG = this.physics.add.staticGroup();
    this.enemyG = this.physics.add.group(); this.shotG = this.physics.add.group(); this.eshotG = this.physics.add.group();
    this.gfx = this.add.graphics().setDepth(1.5);
    this.fx = this.add.graphics().setDepth(2900);
    this.chainG = this.add.graphics().setDepth(1.8);

    def.build(this); this.ox = 0;
    this.finalize();
    this.autoLitter(def.mini ? 0 : (def.litter !== undefined ? def.litter : Math.min(150, Math.round(this.floorCount / 14))));
    if (!def.mini) this.autoBins(Math.max(5, Math.round(this.floorCount / 200)));
    this.autoPlants(def.mini ? 0 : Math.min(45, Math.round(this.floorCount / 45)));
    this.autoFood(def.mini ? 0 : Math.max(2, Math.round(this.floorCount / 120)));
    this.autoPower(def.mini ? 0 : Math.max(3, Math.round(this.floorCount / 150)));
    this.trashTotal = this.pickups.length; this.time.delayedCall(200, () => this.snap());
    this.makePlayers();
    if (def.mini) this.mini = new MiniGames[def.mini](this);
    this.setupColliders();
    this.nav = new MenuNav(this, { noPadBack: true });
    this.v3 = new View3D(this);
    this.scene.launch('Hud', { level: this });
    this.hudS = this.scene.get('Hud');
    this.hudCall('fade', 'in', 500); 
    Sfx.music(def.music);
    this.time.delayedCall(250, () => this.banner(def.name, 0xffffff, 1800));
    this.events.on('shutdown', () => { Sfx.music(null); this.scene.stop('Hud'); this.v3.dispose(); });
  }

  // ── Gelände ──
  floor(x, y, w, h) { this.fill(x, y, w, h, 1); }
  pit(x, y, w, h) { this.fill(x, y, w, h, 2); }
  wall(x, y, w, h) { this.fill(x, y, w, h, 0); }
  fill(x, y, w, h, v) { this._fill(x + this.ox, y, w, h, v); }
  _fill(x, y, w, h, v) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (i >= 0 && j >= 0 && i < this.gw && j < this.gh) this.grid[j][i] = v; }
  at(x, y) { return (x < 0 || y < 0 || x >= this.gw || y >= this.gh) ? 0 : this.grid[y][x]; }
  raise(x, y, w, h, e) { x += this.ox; for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (i >= 0 && j >= 0 && i < this.gw && j < this.gh) this.elev[j][i] = e; }
  elevAt(px, py) { const cx = Math.floor(px / T), cy = Math.floor(py / T); return (cx < 0 || cy < 0 || cx >= this.gw || cy >= this.gh) ? 0 : this.elev[cy][cx]; }
  // Hindernis aus Wandzellen mit Deko-Modell (Baum, Fels, Haus …)
  deco(kind, x, y, w = 1, h = 1) {
    x += this.ox; this._fill(x, y, w, h, 0);
    this.decos.push({ kind, x, y, w, h, ry: Math.floor(Math.random() * 4) * Math.PI / 2 });
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.decoCells.add(j * this.gw + i);
  }
  // Große offene Fläche mit Bäumen, Felsen und Häusern (immer begehbar: Abstand zwischen Hindernissen mindestens 3 Kacheln)
  field(x, y, w, h, o = {}) {
    x += this.ox; this._fill(x, y, w, h, 1);
    const rnd = new Phaser.Math.RandomDataGenerator(['feld' + this.lv + ':' + x]), K = {
      alley: ['tree', 'tree', 'rock', 'house', 'tree'], sewer: ['rock', 'pipe', 'rock', 'house'], junk: ['container', 'barrel', 'rock', 'house', 'barrel'],
      winter: ['pine', 'pine', 'rock', 'house', 'pine'], grave: ['gravestone', 'deadtree', 'crypt', 'rock', 'gravestone'], factory: ['chimney', 'tank', 'container', 'house'],
    }[this.theme], kinds = o.kinds || K, taken = [];
    for (let gx = x + 3; gx < x + w - 3; gx += 4) for (let gy = y + 3; gy < y + h - 3; gy += 4) {
      const jx = gx + rnd.between(-1, 1), jy = gy + rnd.between(-1, 1);
      if (rnd.frac() > (o.density || 0.88)) continue;
      if ((o.avoid || []).some(r => jx + 3 > r[0] + this.ox && jx < r[0] + this.ox + r[2] && jy + 3 > r[1] && jy < r[1] + r[3])) continue;
      if (jy >= 11 && jy <= 18 && (jx < x + 6 || jx > x + w - 7)) continue;      // Eingänge freihalten
      const kind = kinds[rnd.between(0, kinds.length - 1)];
      const big = kind === 'house' || kind === 'crypt';
      if (big && (jx + 3 > x + w - 2 || jy + 3 > y + h - 2)) continue;
      if (big) { this.deco(kind, jx - this.ox, jy, 3, 3); this.ox = this.ox; taken.push([jx, jy, 3, 3]); }
      else if (kind === 'container') { this.deco(kind, jx - this.ox, jy, 2, 1); taken.push([jx, jy, 2, 1]); }
      else { this.deco(kind, jx - this.ox, jy, 1, 1); taken.push([jx, jy, 1, 1]); }
    }
    // zweiter Durchgang: kleine Hindernisse (Bäume, Felsen …) dazwischen, Wege bleiben frei
    const small = kinds.filter(k => k !== 'house' && k !== 'crypt' && k !== 'container');
    for (let gx = x + 5; gx < x + w - 4; gx += 4) for (let gy = y + 5; gy < y + h - 4; gy += 4) {
      const jx = gx + rnd.between(-1, 1), jy = gy + rnd.between(-1, 1);
      if (rnd.frac() > 0.5 || !small.length) continue;
      if (jy >= 11 && jy <= 18 && (jx < x + 6 || jx > x + w - 7)) continue;
      if ((o.avoid || []).some(r => jx + 1 > r[0] + this.ox && jx < r[0] + this.ox + r[2] && jy + 1 > r[1] && jy < r[1] + r[3])) continue;
      let clash = false; for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if (this.decoCells.has((jy + dy) * this.gw + (jx + dx)) || this.at(jx + dx, jy + dy) !== 1) clash = true;
      if (clash) continue;
      this.deco(small[rnd.between(0, small.length - 1)], jx - this.ox, jy, 1, 1);
    }
    const free = () => { for (let k = 0; k < 80; k++) { const cx = rnd.between(x + 2, x + w - 3), cy = rnd.between(y + 2, y + h - 3); if (this.at(cx, cy) === 1 && !this.decoCells.has(cy * this.gw + cx) && this.at(cx + 1, cy) === 1 && this.at(cx - 1, cy) === 1) return [cx - this.ox, cy]; } return null; };
    for (const [type, n] of (o.enemies || [])) for (let i = 0; i < n; i++) { const p = free(); if (p) this.enemy(type, p[0], p[1]); }
    for (let i = 0; i < (o.spawners || 0); i++) { const p = free(); if (p) this.spawner(p[0], p[1], 'walker', 7, 2); }
    for (let i = 0; i < (o.coins || 0); i++) { const p = free(); if (p) this.coin(p[0], p[1]); }
  }
  // Plateau: von Wänden umringt, Eingang nur über Trampoline (Sprung über die Wand), Ausgang über eine Rampe
  plateau(x, y, w, h, e, o = {}) {
    x += this.ox; this._fill(x - 1, y - 1, w + 2, h + 2, 0); this._fill(x, y, w, h, 1);
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.elev[j][i] = e;
    const mid = y + Math.floor(h / 2);
    for (let i = 0; i < 4; i++) for (let j = mid - 1; j <= mid + 1; j++) { const cx = x + w + i; this._fill(cx, j, 1, 1, 1); this.elev[j][cx] = e * (1 - (i + 1) / 4); }
    for (const dy of [-1, 0, 1]) { this._fill(x + w, mid + dy, 1, 1, 1); this.elev[mid + dy][x + w] = e * 0.75; }
    for (let dy = -1; dy <= 1; dy++) { const sx = x - 4, sy = mid + dy; this.springsA.push({ x: this.cx(sx), y: this.cy(sy), cd: 0, t0: -999, up: true }); }
    this.sign(x - 6 - this.ox, mid - 3, 'Trampolin! Lauf drauf zu,\ndann fliegst du aufs Plateau.');
  }
  finalize() {
    const th = this.theme, g = this.grid; this.floorCount = 0;
    const nearFloor = (x, y, r) => { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (this.at(x + dx, y + dy) !== 0) return true; return false; };
    const wallCells = [], pitCells = [];
    for (let y = 0; y < this.gh; y++) for (let x = 0; x < this.gw; x++) {
      const v = g[y][x];
      if (v === 1) this.floorCount++;
      if (v === 2) { this.pitSet.add(y * this.gw + x); pitCells.push([x, y]); }
      else if (v === 0 && nearFloor(x, y, 1)) wallCells.push([x, y]);
    }
    const runs = (cells, add) => {
      const rows = {}; cells.forEach(([x, y]) => (rows[y] = rows[y] || []).push(x));
      for (const y in rows) { const xs = rows[y].sort((a, b) => a - b); let s = xs[0], p = xs[0]; for (let i = 1; i <= xs.length; i++) { if (xs[i] !== p + 1) { add(s, +y, p - s + 1); s = xs[i]; } p = xs[i]; } }
    };
    runs(wallCells, (x, y, w) => this.addSolid(this.wallG, x * T, y * T, w * T, T));
    runs(pitCells, (x, y, w) => this.addSolid(this.pitBlockG, x * T, y * T, w * T, T));
  }
  addSolid(group, x, y, w, h) {
    const r = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0x000000, 0);
    this.physics.add.existing(r, true); group.add(r); return r;
  }
  pitAt(x, y) {
    const cx = Math.floor(x / T), cy = Math.floor(y / T);
    if (cx < 0 || cy < 0 || cx >= this.gw || cy >= this.gh) return false;
    const k = cy * this.gw + cx;
    return this.pitSet.has(k) && !this.bridged.has(k);
  }
  onMover(x, y) { for (const m of this.moversA) if (x > m.px && x < m.px + m.w && y > m.py && y < m.py + m.h) return m; return null; }
  wallPx(x, y) { return this.at(Math.floor(x / T), Math.floor(y / T)) === 0; }

  // ── Objekte (Koordinaten in Kacheln) ──
  cx(x) { return x * T + T / 2; }
  cy(y) { return y * T + T / 2; }
  coin(x, y, val = 1) { x += this.ox;
    const c = this.add.image(this.cx(x), this.cy(y) - 6, 'coin').setDepth(this.cy(y)); c.val = val; c.born = this.time.now;
    this.coinsA.push(c);
  }
  coins(x, y, n, dx = 1, dy = 0) { for (let i = 0; i < n; i++) this.coin(x + i * dx, y + i * dy); }
  trash(x, y) { x += this.ox;
    const t = this.add.image(this.cx(x), this.cy(y), 'trash' + Phaser.Math.Between(0, 3)).setDepth(this.cy(y));
    this.pickups.push(t);
  }
  crate(x, y, loot) { x += this.ox;
    const c = this.add.image(this.cx(x), this.cy(y), 'crate').setDepth(this.cy(y));
    this.physics.add.existing(c, true); this.crateG.add(c); c.loot = loot; this.crateList.push(c);
  }
  crates(x, y, w, h, loot) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.crate(x + i, y + j, loot && i === 0 && j === 0); }
  spikes(x, y, w, h) { x += this.ox;
    const s = this.add.tileSprite(x * T, y * T, w * T, h * T, 'spk').setOrigin(0).setDepth(0.8);
    this.physics.add.existing(s, true); s.body.setSize(w * T - 10, h * T - 10).setOffset(5, 5);
    this.spikesA.push(s);
  }
  enemy(type, x, y, opt) { x += this.ox; return this.spawnEnemy(type, this.cx(x), this.cy(y), opt); }
  target(id, x, y, color, dur) { x += this.ox;
    const t = this.add.image(this.cx(x), (y + 1) * T - 2, 'target_' + color + '_off').setOrigin(0.5, 1).setDepth((y + 1) * T);
    this.physics.add.existing(t, true); t.body.setSize(36, 22).setOffset(10, 42); this.targetG.add(t);
    Object.assign(t, { color, dur, until: 0, perm: false, id, isOn: false });
    this.targets.push(t); (this.groups[id] = this.groups[id] || { t: [], p: [] }).t.push(t);
  }
  plate(id, x, y, color) { x += this.ox;
    const p = this.add.image(this.cx(x), this.cy(y), 'plate_' + color + '_off').setDepth(0.9);
    this.physics.add.existing(p, true); p.body.setSize(50, 30).setOffset(10, -6);
    Object.assign(p, { color, pressed: false, ever: false, id });
    this.plates.push(p); (this.groups[id] = this.groups[id] || { t: [], p: [] }).p.push(p);
  }
  gate(id, x, y, w, h, color) { x += this.ox;
    const g = this.add.tileSprite(x * T, y * T, w * T, h * T, 'gate').setOrigin(0).setDepth(y * T + 20).setTint(GCOL[color]);
    this.physics.add.existing(g, true); this.gateG.add(g);
    Object.assign(g, { id, open: false }); this.gates.push(g);
  }
  bridge(id, x, y, w, h, color) { x += this.ox;
    const v = this.add.tileSprite(x * T, y * T, w * T, h * T, 'plank_' + this.theme).setOrigin(0).setDepth(0.7).setTint(GCOL[color]).setAlpha(0.25);
    const keys = []; for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) keys.push(j * this.gw + i);
    this.bridges.push({ id, v, keys, on: false });
  }
  mover(x, y, w, h, dx, dy, period) { x += this.ox;
    const v = this.add.tileSprite(x * T, y * T, w * T, h * T, 'plank_' + this.theme).setOrigin(0).setDepth(0.7);
    this.moversA.push({ v, bx: x * T, by: y * T, px: x * T, py: y * T, w: w * T, h: h * T, dx: dx * T, dy: dy * T, period: period * (this.kids ? 1.25 : 1) });
  }
  crusher(x, y, period, offset) { x += this.ox; // 2x2 Kacheln große Presse
    const vis = this.add.image((x + 1) * T, (y + 2) * T - 6, 'stomper').setOrigin(0.5, 1).setVisible(false);
    this.crushers.push({ x: x * T, y: y * T, w: 2 * T, h: 2 * T, per: period * (this.kids ? 1.3 : 1), off: offset, vis, dang: false, warn: 0 });
  }
  laser(x, y, len, dir, period, offset, id) { x += this.ox;
    const r = dir === 'h' ? { x: x * T, y: y * T + T / 2 - 6, w: len * T, h: 12 } : { x: x * T + T / 2 - 6, y: y * T, w: 12, h: len * T };
    const ends = dir === 'h' ? [[x * T + 10, y * T + T / 2], [(x + len) * T - 10, y * T + T / 2]] : [[x * T + T / 2, y * T + 10], [x * T + T / 2, (y + len) * T - 10]];
    for (const e of ends) this.add.image(e[0], e[1] + 10, 'laser_emit').setDepth(e[1] + 14);
    this.lasers.push({ r, per: period * (this.kids ? 1.3 : 1), off: offset, id, on: true, warn: false, dir });
  }
  conveyor(x, y, w, h, dirx, speed) { x += this.ox;
    const c = this.add.tileSprite(x * T, y * T, w * T, h * T, 'conv2').setOrigin(0).setDepth(0.6);
    if (dirx < 0) c.setFlipX(true);
    this.convs.push({ v: c, r: new Phaser.Geom.Rectangle(x * T, y * T, w * T, h * T), d: dirx, spd: speed * (this.kids ? 0.6 : 1) });
  }
  ice(x, y, w, h) { x += this.ox; this.icesA.push(new Phaser.Geom.Rectangle(x * T, y * T, w * T, h * T)); }
  spring(x, y) { x += this.ox; this.springsA.push({ x: this.cx(x), y: this.cy(y), cd: 0, t0: -999 }); }
  spawner(x, y, type, period, max) { x += this.ox; this.spawners.push({ x: this.cx(x), y: this.cy(y), type, period, max, next: 0, kids: [] }); }
  island(x, y, w, h, pts) { x += this.ox; this.floor(x, y, w, h); this.islands.push({ x: x * T, y: y * T, w: w * T, h: h * T, pts, cx: (x + w / 2) * T, cy: (y + h / 2) * T }); }
  food(x, y, kind) { x += this.ox;
    const K = { apple: 1, donut: 1, cupcake: 2, burger: 2, pizza: 2, hotdog: 2, cake: 3 }, k = kind || Object.keys(K)[Math.floor(Math.random() * 7)];
    const f = this.add.image(this.cx(x), this.cy(y), 'coin').setVisible(false); f.kind = k; f.heal = K[k]; this.foods.push(f); return f;
  }
  bin(x, y) { x += this.ox;
    const b = this.add.image(this.cx(x), this.cy(y), 'crate').setVisible(false); this.physics.add.existing(b, true); b.body.setSize(40, 40); this.binG.add(b); b.t0 = -999; this.bins.push(b);
  }
  occupied(px, py, r) {
    const near = (o, rr) => Math.abs(o.x - px) < rr && Math.abs(o.y - py) < rr;
    for (const l of [this.coinsA, this.pickups, this.crateList, this.targets, this.plates, this.foods, this.bins, this.cps, this.springsA, this.spawners, this.enemyList]) for (const o of l) if (near(o, r)) return true;
    for (const g of this.gates) if (px > g.x - 30 && px < g.x + g.displayWidth + 30 && py > g.y - 30 && py < g.y + g.displayHeight + 30) return true;
    for (const sg of this.signs) if (near(sg.s, r)) return true;
    for (const sp of this.spikesA) if (px > sp.x - 20 && px < sp.x + sp.displayWidth + 20 && py > sp.y - 20 && py < sp.y + sp.displayHeight + 20) return true;
    return false;
  }
  autoLitter(n) {
    const rnd = new Phaser.Math.RandomDataGenerator(['muell' + this.lv]); let placed = 0, tries = 0;
    while (placed < n && tries < n * 40) {
      tries++; const x = rnd.between(1, this.gw - 2), y = rnd.between(1, this.gh - 2);
      let ok = true; for (let dx = -1; dx <= 1 && ok; dx++) for (let dy = -1; dy <= 1 && ok; dy++) if (this.at(x + dx, y + dy) !== 1) ok = false;
      if (!ok || this.occupied(this.cx(x), this.cy(y), 40)) continue;
      const cluster = rnd.between(1, 3);
      for (let k = 0; k < cluster; k++) { const px = this.cx(x) + rnd.between(-18, 18) * (k ? 1 : 0), py = this.cy(y) + rnd.between(-18, 18) * (k ? 1 : 0); const t = this.add.image(px, py, 'trash' + rnd.between(0, 3)).setDepth(py); this.pickups.push(t); placed++; }
    }
  }
  autoPlants(n) {
    const L = { alley: ['p:flowers', 'p:flowers-tall', 'p:plant', 'p:mushrooms'], sewer: ['p:mushrooms', 'p:plant', 'p:mushrooms'], junk: ['p:plant', 'p:mushrooms'], factory: ['p:plant'], winter: ['p:plant', 'p:mushrooms'], grave: ['g:pumpkin', 'g:pumpkin-carved', 'p:mushrooms'] }[this.theme] || ['p:plant'];
    const rnd = new Phaser.Math.RandomDataGenerator(['gruen' + this.lv]); let placed = 0, tries = 0;
    while (placed < n && tries < n * 30) {
      tries++; const x = rnd.between(1, this.gw - 2), y = rnd.between(1, this.gh - 2);
      let ok = true; for (let dx = -1; dx <= 1 && ok; dx++) for (let dy = -1; dy <= 1 && ok; dy++) if (this.at(x + dx, y + dy) !== 1) ok = false;
      if (!ok || this.occupied(this.cx(x), this.cy(y), 30)) continue;
      const t = this.add.image(this.cx(x) + rnd.between(-14, 14), this.cy(y) + rnd.between(-14, 14), 'trash0').setDepth(this.cy(y)); t.model = L[rnd.between(0, L.length - 1)]; this.pickups.push(t); placed++;
    }
  }
  autoFood(n) {
    const rnd = new Phaser.Math.RandomDataGenerator(['essen' + this.lv]); let placed = 0, tries = 0;
    while (placed < n && tries < 600) {
      tries++; const x = rnd.between(1, this.gw - 2), y = rnd.between(1, this.gh - 2);
      let ok = true; for (let dx = -1; dx <= 1 && ok; dx++) for (let dy = -1; dy <= 1 && ok; dy++) if (this.at(x + dx, y + dy) !== 1) ok = false;
      if (!ok || this.occupied(this.cx(x), this.cy(y), 60) || x < 8) continue;
      this.food(x, y); placed++;
    }
  }
  power(x, y, kind) {
    x += this.ox; const k = kind || ['ball', 'wings', 'magnet'][Math.floor(Math.random() * 3)];
    const f = this.add.image(this.cx(x), this.cy(y), 'coin').setVisible(false); f.kind = k; this.powers.push(f); return f;
  }
  autoPower(n) {
    const rnd = new Phaser.Math.RandomDataGenerator(['kraft' + this.lv]); let placed = 0, tries = 0; const kinds = ['ball', 'wings', 'magnet'];
    while (placed < n && tries < 600) {
      tries++; const x = rnd.between(10, this.gw - 2), y = rnd.between(1, this.gh - 2);
      let ok = true; for (let dx = -1; dx <= 1 && ok; dx++) for (let dy = -1; dy <= 1 && ok; dy++) if (this.at(x + dx, y + dy) !== 1) ok = false;
      if (!ok || this.occupied(this.cx(x), this.cy(y), 80)) continue;
      const f = this.add.image(this.cx(x), this.cy(y), 'coin').setVisible(false); f.kind = kinds[placed % 3]; this.powers.push(f); placed++;
    }
  }
  givePower(p, kind) {
    const D = { ball: 9, wings: 9, magnet: 14 }, N = { ball: 'Hüpf-Ball!  Unverwundbar, schnell – rammt Gegner um', wings: 'Flügel!  Fliegt über Abgründe und Hindernisse', magnet: 'Magnet!  Müll und Münzen fliegen zu dir' };
    p.pw = { kind, until: this.time.now + D[kind] * 1000 * (this.kids ? 1.5 : 1) };
    Sfx.play('power'); this.toast(Cfg.players[p.idx].name + ': ' + N[kind], 2200); this.burst(p.x, p.y - 30, 'star', 12, 100);
    if (kind === 'ball' && p.holding) this.release(p, false);
  }
  checkpoint(x, y) { x += this.ox;
    const f = this.add.image(this.cx(x), (y + 1) * T - 4, 'flag').setOrigin(0.5, 1).setDepth((y + 1) * T);
    f.cx = this.cx(x); f.cy = this.cy(y); f.hit = false; this.cps.push(f);
  }
  sign(x, y, text) { x += this.ox;
    const s = this.add.image(this.cx(x), (y + 1) * T - 4, 'sign').setOrigin(0.5, 1).setDepth((y + 1) * T);
    const t = this.add.text(this.cx(x), (y + 1) * T - 70, text, { fontFamily: FONT, fontSize: '20px', color: '#16101f', backgroundColor: '#fff6d2', padding: { x: 12, y: 8 }, align: 'center' }).setOrigin(0.5, 1).setDepth(2950).setVisible(false);
    this.signs.push({ s, t, text });
  }
  portal(x, y) {
    x += this.ox; this.exitPos = { x: this.cx(x), y: this.cy(y) + 40 };
    this.exitSpr = this.add.image(this.exitPos.x, this.exitPos.y + 40, 'exit_closed').setOrigin(0.5, 1).setVisible(false);
    this.quota = Math.round(this.def.quota * (this.kids ? 0.7 : 1));
  }
  boss(kind) {
    const A = this.A, AY = this.AY, en = this.def.entry; // entry = [y, h] des Eingangs-Tores
    const g = this.add.tileSprite(A * T, en[0] * T, T, en[1] * T, 'gate').setOrigin(0).setDepth(en[0] * T + 20).setTint(0xff4d4d).setAlpha(0);
    this.physics.add.existing(g, true); this.gateG.add(g); g.body.enable = false; g.lock = true; this.lockGate = g;
    this.exitPos = { x: (A + 23) * T + 24, y: (AY + 7) * T + 40 };
    this.exitSpr = this.add.image(this.exitPos.x, this.exitPos.y + 40, 'exit_closed').setOrigin(0.5, 1).setDepth(this.exitPos.y + 40);
    this.bossObj = new Boss(this, kind, (A + 21) * T, (AY + 7.5) * T);
    for (let i = 0; i < 5; i++) this.trash(A + 3 + i * 5, AY + (i % 2 ? 12 : 2));
  }

  // ───────────────────────── Akteure ─────────────────────────
  actor(x, y, fw, fh, visTex, yoff = 10) {
    const key = shadowKey(this, fw + 14, fh + 8);
    const a = this.physics.add.sprite(x, y, key).setDepth(1.6);
    a.body.setSize(fw, fh).setOffset(7, 4);
    a.vis = this.add.image(x, y + yoff, visTex).setOrigin(0.5, 1); a.yoff = yoff; a.z = 0;
    return a;
  }
  syncVis(a, extra = 0) { a.vis.setPosition(Math.round(a.x), Math.round(a.y + a.yoff - (a.z || 0) - extra)); a.vis.setDepth(a.y + 10); }
  killActor(a) { if (a.vis) a.vis.destroy(); a.destroy(); }

  makePlayers() {
    this.p = [];
    const st = this.def.start;
    for (let i = 0; i < 2; i++) {
      const p = this.actor((st[0] + i * 1.3) * T + 24, st[1] * T + 24, 30, 18, i === 0 ? 'knox_t' : 'zippy_t', 10);
      p.setCollideWorldBounds(true);
      p.noz = this.add.image(p.x, p.y, 'nozzle').setOrigin(0.2, 0.5);
      p.icon = this.add.image(p.x, p.y, i === 0 ? 'zippy_t' : 'knox_t').setScale(0.42).setVisible(false);
      p.idx = i; p.ctrl = new Ctrl(this, i); p.state = 'normal'; p.aim = { x: 0, y: 1 }; p.ammo = this.kids ? 8 : 4; p.maxAmmo = this.kids ? 24 : 20; p.hp = 5; p.maxHp = 5; p.reviveT = 0; p.downAt = 0; p.fullMsg = 0;
      Object.assign(p, { inv: 0, shootCd: 0, suckSfx: 0, lockUntil: 0, holder: null, holding: null, heldAt: 0, hop: null, hopCd: 0, fly: null, noSwallow: 0, safeT: 0, ammoRegen: 0, fallT: 0, in: {}, conv: 0 });
      p.lastSafe = { x: p.x, y: p.y };
      this.p.push(p);
    }
  }
  setupColliders() {
    const ph = this.physics, np = (p) => !p.fly;
    for (const p of this.p) {
      ph.add.collider(p, this.wallG, null, (q) => !(q.hop && q.hop.ghost));
      ph.add.collider(p, this.gateG, null, np); ph.add.collider(p, this.crateG, null, np); ph.add.collider(p, this.targetG, null, np);
    }
    for (const g of [this.wallG, this.gateG, this.crateG, this.pitBlockG, this.targetG]) ph.add.collider(this.enemyG, g, null, (e) => !e.cfg.ghost && (!e.cfg.fly || g === this.wallG || g === this.gateG));
    ph.add.collider(this.shotG, this.wallG, s => this.splat(s));
    ph.add.collider(this.shotG, this.gateG, s => this.splat(s));
    ph.add.collider(this.shotG, this.crateG, (s, c) => { this.breakCrate(c); this.splat(s); });
    ph.add.collider(this.shotG, this.targetG, (s, t) => { this.hitTarget(t); this.splat(s); });
    ph.add.collider(this.shotG, this.binG, (s, b) => { this.binHit(b); this.splat(s); });
    for (const p of this.p) ph.add.collider(p, this.binG, null, np);
    ph.add.collider(this.enemyG, this.binG);
    ph.add.collider(this.eshotG, this.wallG, s => this.splat(s, 0xa0f06a));
    ph.add.collider(this.eshotG, this.gateG, s => this.splat(s, 0xa0f06a));
  }
  splat(s, tint) {
    if (!s.active) return;
    this.burst(s.x, s.y - 14, 'puff', 5, 70, tint || 0xffffff);
    // eigener Müll-Schuss: bleibt liegen und ist noch max. 2x aufsaugbar, danach weg
    if (s.owner !== undefined && !this.def.mini && (s.gen || 0) < 2 && s.vis && !this.wallPx(s.x, s.y) && !this.pitAt(s.x, s.y) && this.at(Math.floor(s.x / T), Math.floor(s.y / T)) === 1) {
      const t = this.add.image(s.x, s.y, s.vis.texture.key).setDepth(s.y); t.gen = (s.gen || 0) + 1; this.pickups.push(t);
    }
    this.killActor(s);
  }

  // ───────────────────────── HUD / Effekte (delegiert) ─────────────────────────
  hudCall(fn, ...a) { const h = this.hudS; if (h && h.ready) h[fn](...a); else this.time.delayedCall(80, () => this.hudCall(fn, ...a)); }
  banner(text, color, ms = 1600) { this.hudCall('banner', text, ms); }
  toast(text, ms = 1800) { if (text) this.hudCall('toast', text, ms); }
  burst(x, y, tex, n, speed, tint) { this.v3.burst(x, y, tex, n, speed, tint); }
  say(text, x, y, ms = 1800) { const q = this.v3.project(x, y, 2.4); this.hudCall('say', text, q.x, q.y, ms); }
  shake(d = 200, i = 0.01) { this.v3.shake(d, i); }

  // ───────────────────────── Gegner ─────────────────────────
  spawnEnemy(type, x, y, opt = {}) {
    const c = ENEMY[type];
    const e = this.actor(x, y, c.fw, c.fh, c.tex, 10);
    this.enemyG.add(e);
    e.setCollideWorldBounds(true);
    e.cfg = c; e.type = type;
    e.hp = Math.max(1, this.kids && c.hp > 2 ? c.hp - 1 : c.hp);
    Object.assign(e, { st: 'wander', stT: 600 + Math.random() * 1200, wd: new Phaser.Math.Vector2(0, 0), cool: 1500 + Math.random() * 1500, ph: Math.random() * 6, cd: new Phaser.Math.Vector2(1, 0), kb: 0 });
    if (c.still) e.body.setImmovable(true);
    if (opt.axis) e.sawAxis = opt.axis;
    if (c.fly) e.z = 34;
    this.enemyList.push(e);
    return e;
  }
  damageEnemy(e, dmg, fx, fy) {
    if (!e.active) return;
    if (e.cfg.invuln || e.vanish) { Sfx.play('empty'); this.burst(e.x, e.y - 30, 'star', 3, 40); return; }
    e.hp -= dmg; Sfx.play('hit');
    e.vis.setTintFill(0xffffff); this.time.delayedCall(90, () => e.active && e.vis.clearTint());
    if (!e.cfg.still) { const v = new Phaser.Math.Vector2(e.x - fx, e.y - fy); if (v.lengthSq() < 1) v.set(0, 1); v.normalize().scale(220); e.body.setVelocity(v.x, v.y); e.kb = this.time.now + 200; }
    if (e.hp <= 0) this.killEnemy(e);
  }
  killEnemy(e) {
    if (this.mini && this.mini.onKill) this.mini.onKill(e);
    Sfx.play('pop');
    this.burst(e.x, e.y - 20, 'puff', 8, 90, 0xdddddd); this.burst(e.x, e.y - 20, 'star', 4, 80);
    this.dropCoin(e.x, e.y, Phaser.Math.Between(1, 2));
    if (Math.random() < (this.kids ? 0.8 : 0.55)) { const t = this.add.image(e.x, e.y, 'trash' + Phaser.Math.Between(0, 3)).setDepth(e.y); this.pickups.push(t); }
    if (Math.random() < (this.kids ? 0.18 : 0.12)) { const f = this.food(0, 0, Math.random() < 0.3 ? 'burger' : 'apple'); f.x = e.x; f.y = e.y; }
    this.enemyList = this.enemyList.filter(o => o !== e);
    this.killActor(e);
  }
  binHit(b) {
    if (this.time.now - b.t0 < 120) return; b.t0 = this.time.now; this.cleaned++; this.trashGot++; this.coinCount += 2;
    Sfx.play('coin'); Sfx.play('pop'); this.burst(b.x, b.y - 30, 'star', 8, 90, 0x7dff8a); this.burst(b.x, b.y - 30, 'puff', 5, 50, 0x7dff8a);
  }
  dropCoin(x, y, n) {
    for (let i = 0; i < n; i++) {
      const c = this.add.image(x, y, 'coin').setDepth(y);
      this.tweens.add({ targets: c, x: x + Phaser.Math.Between(-50, 50), y: y + Phaser.Math.Between(-40, 40), duration: 250, ease: 'Quad.out' });
      this.coinsA.push(c);
    }
  }
  eshot(x, y, vx, vy, kind = 'goo') {
    const s = this.physics.add.sprite(x, y, 'dotp').setAlpha(0).setDepth(1.6); this.eshotG.add(s);
    s.body.setSize(14, 14); s.body.setVelocity(vx, vy);
    s.vis = this.add.image(x, y - 18, 'goo').setVisible(false); s.born = this.time.now; s.z = 18; s.kind = kind;
    return s;
  }
  // Gefahrenzonen am Boden (Bomben, Pfützen) und Schockwellen – von Gegnern und Bossen genutzt
  addZone(x, y, r, warn, life, type) { this.zones.push({ x, y, r, t0: this.time.now, warn, life, type, boom: false }); }
  addRing(x, y, max, v) { this.rings.push({ x, y, r: 30, max, v, hit: new Set() }); }
  updateZones(time, dt) {
    for (const z of this.zones.slice()) {
      const age = time - z.t0;
      if (age < z.warn) continue;
      if (age < z.warn + z.life) {
        if (z.type === 'bomb' && !z.boom) { z.boom = true; this.shake(150, 0.01); Sfx.play('boom'); this.burst(z.x, z.y, 'puff', 10, z.r, 0xffa050); this.burst(z.x, z.y, 'star', 4, z.r); }
        for (const p of this.p) if (p.state === 'normal' && p.z < 14 && Math.hypot(p.x - z.x, p.y - z.y) < z.r) this.hurtPlayer(p, z.x, z.y);
      } else this.zones.splice(this.zones.indexOf(z), 1);
    }
    for (const r of this.rings.slice()) {
      r.r += r.v * dt;
      for (const p of this.p) if (p.state === 'normal' && p.z < 14 && !r.hit.has(p) && Math.abs(Math.hypot(p.x - r.x, p.y - r.y) - r.r) < 20) { r.hit.add(p); this.hurtPlayer(p, r.x, r.y); }
      if (r.r > r.max) this.rings.splice(this.rings.indexOf(r), 1);
    }
  }
  nearest(x, y) {
    let best = null, bd = 1e9;
    for (const p of this.p) { if (p.state !== 'normal') continue; const d = Phaser.Math.Distance.Between(x, y, p.x, p.y); if (d < bd) { bd = d; best = p; } }
    return best || this.p[0];
  }
  updateEnemies(time, dt) {
    const km = this.kids ? 0.65 : 1;
    for (const e of this.enemyList.slice()) {
      if (!e.active) continue;
      const c = e.cfg, b = e.body, p = this.nearest(e.x, e.y);
      const dx = p.x - e.x, dy = p.y - e.y, dist = Math.hypot(dx, dy) || 1;
      if (c.fly) e.z = 34 + Math.sin(time / 300 + e.ph) * 6;
      let sp = c.speed * km, dirx = 0, diry = 0;
      if (e.suckT && time - e.suckT < 130) { this.syncVis(e); continue; } e.suckF = 0;
      if (time < e.kb) { this.syncVis(e); continue; }
      if (c.saw) {   // Sägeblatt: pendelt hin und her, nicht zu besiegen – drüberhopsen!
        if (!e.axis) e.axis = e.sawAxis || (Math.random() < 0.5 ? 'h' : 'v'); if (!e.sdir) e.sdir = 1;
        if (b.blocked.left || b.blocked.right || b.blocked.up || b.blocked.down) e.sdir *= -1;
        const v = e.sdir * sp; b.setVelocity(e.axis === 'h' ? v : 0, e.axis === 'v' ? v : 0); this.syncVis(e); continue;
      }
      if (c.kamikaze) {   // Rennt auf euch zu und explodiert
        if (dist < c.chase) { e.fuse = e.fuse || time; sp = 165 * km; b.setVelocity(dx / dist * sp, dy / dist * sp); e.vis.setTint(Math.floor(time / 90) % 2 ? 0xff5a5a : 0xffffff); }
        else { e.stT -= dt * 1000; if (e.stT <= 0) { e.stT = 900 + Math.random() * 1500; const a0 = Math.random() * 6.28; e.wd.set(Math.cos(a0), Math.sin(a0)); } b.setVelocity(e.wd.x * 45, e.wd.y * 45); }
        if (dist < 46 || (e.fuse && time - e.fuse > 4500)) { this.addZone(e.x, e.y, 72, 220, 260, 'bomb'); Sfx.play('shoot'); this.enemyList = this.enemyList.filter(o => o !== e); this.burst(e.x, e.y - 20, 'puff', 8, 80, 0xff9a5a); this.killActor(e); continue; }
        e.vis.setFlipX(dx > 0); this.syncVis(e); continue;
      }
      if (c.ghost) {   // Geist: schwebt durch Wände, wird regelmäßig unsichtbar (und dann unverwundbar)
        const cyc = (time + e.ph * 1000) % 5200; e.vanish = cyc > 3800;
        const gv = e.vanish ? 0 : 1; b.setVelocity(dist < c.chase ? dx / dist * sp * gv : 0, dist < c.chase ? dy / dist * sp * gv : 0);
        e.z = 34 + Math.sin(time / 260 + e.ph) * 8; this.syncVis(e); continue;
      }
      if (c.jumper) {   // Springer: kauert sich zusammen, springt dann auf eure Position
        if (e.st === 'wander' || e.st === 'idle') { if (dist < c.chase && time > (e.restT || 0)) { e.st = 'squat'; e.stT = 600 * (this.kids ? 1.4 : 1); e.squat = true; } else { b.setVelocity(0, 0); } }
        else if (e.st === 'squat') { b.setVelocity(0, 0); e.stT -= dt * 1000; if (e.stT <= 0) { e.st = 'leap'; e.squat = false; e.airborne = true; e.leapT = 0; e.land = { x: p.x, y: p.y }; e.from = { x: e.x, y: e.y }; } }
        else if (e.st === 'leap') {
          e.leapT += dt; const f = Math.min(1, e.leapT / 0.7); e.z = Math.sin(f * Math.PI) * 80;
          b.reset(e.from.x + (e.land.x - e.from.x) * f, e.from.y + (e.land.y - e.from.y) * f);
          if (f >= 1) { e.z = 0; e.airborne = false; e.st = 'idle'; e.restT = time + 900; this.burst(e.x, e.y, 'puff', 6, 60); this.shake(60, 0.004); }
        }
        this.syncVis(e); continue;
      }
      if (c.bomb) {   // Fledermaus: wirft Bomben (mit Warnkreis) auf euch
        e.cool -= dt * 1000;
        if (e.cool <= 0 && dist < 480) { e.cool = this.kids ? 4600 : 3200; this.addZone(p.x + Phaser.Math.Between(-30, 30), p.y + Phaser.Math.Between(-30, 30), 58, this.kids ? 1500 : 1100, 260, 'bomb'); Sfx.play('shoot'); }
      }
      if (c.ranged || c.shooter) {   // Bogenschütze / Drache: halten Abstand und schießen
        e.cool -= dt * 1000;
        const want = c.shooter ? 300 : 340, tx = -dy / dist, ty = dx / dist;
        let ax = 0, ay = 0;
        if (dist < want - 60) { ax = -dx / dist; ay = -dy / dist; } else if (dist > want + 90) { ax = dx / dist; ay = dy / dist; }
        ax += tx * 0.55 * Math.sin(time / 1100 + e.ph); ay += ty * 0.55 * Math.sin(time / 1100 + e.ph);
        b.setVelocity(ax * sp * 0.9, ay * sp * 0.9);
        if (e.cool <= 0 && dist < c.chase) {
          e.cool = this.kids ? 3600 : (c.shooter ? 2600 : 2100);
          if (c.shooter) { const a0 = Math.atan2(dy, dx); for (const d of [-0.25, 0, 0.25]) this.eshot(e.x, e.y, Math.cos(a0 + d) * 250, Math.sin(a0 + d) * 250, 'fire'); }
          else this.eshot(e.x, e.y, dx / dist * 340, dy / dist * 340, 'arrow');
          Sfx.play('shoot'); e.st = 'wind'; e.stT = 250;
        }
        if (e.st === 'wind' && (e.stT -= dt * 1000) <= 0) e.st = 'wander';
        this.syncVis(e); continue;
      }
      if (c.still) {
        e.cool -= dt * 1000;
        if (e.cool <= 0 && dist < 600) { e.cool = this.kids ? 3600 : 2300; this.eshot(e.x, e.y, dx / dist * 230, dy / dist * 230); Sfx.play('shoot'); }
        e.vis.setFlipX(dx > 0); this.syncVis(e); continue;
      }
      e.stT -= dt * 1000;
      const blocked = b.blocked.left || b.blocked.right || b.blocked.up || b.blocked.down;
      if (c.charge && e.st === 'wind') { sp = 0; if (e.stT <= 0) { e.st = 'dash'; e.stT = 1000; e.vis.clearTint(); } }
      else if (c.charge && e.st === 'dash') { sp = 330 * km; dirx = e.cd.x; diry = e.cd.y; if (e.stT <= 0 || blocked) { e.st = 'rest'; e.stT = 900; } }
      else if (c.charge && e.st === 'rest') { sp = 0; if (e.stT <= 0) e.st = 'wander'; }
      else if (c.charge && dist < c.chase && Math.abs(dy) < 200) { e.st = 'wind'; e.stT = 480; e.cd.set(dx / dist, dy / dist); e.vis.setTint(0xff9a9a); sp = 0; }
      else {
        if (dist < c.chase) e.st = 'chase';
        else if (e.st === 'chase' && dist > c.chase * 1.4) e.st = 'wander';
        if (e.st === 'chase') { dirx = dx / dist; diry = dy / dist; if (c.fly) dirx += Math.cos(time / 400 + e.ph) * 0.4; }
        else {
          if (e.stT <= 0 || blocked) { e.stT = 900 + Math.random() * 1600; const a = Math.random() < 0.3 ? null : Math.random() * Math.PI * 2; e.wd.set(a === null ? 0 : Math.cos(a), a === null ? 0 : Math.sin(a)); }
          dirx = e.wd.x; diry = e.wd.y; sp *= 0.6;
        }
      }
      b.setVelocity(dirx * sp, diry * sp);
      if (Math.abs(dirx) > 0.2) e.vis.setFlipX(c.tex === 'e_charger' ? dirx < 0 : dirx > 0);
      this.syncVis(e, c.fly ? 0 : (sp > 0 ? Math.abs(Math.sin(time / 120 + e.ph)) * 4 : 0));
    }
  }

  // ───────────────────────── Spieler ─────────────────────────
  hurtPlayer(p, sx, sy, force) {
    const time = this.time.now;
    if (p.state !== 'normal' || (time < p.inv && !force) || p.fly || (p.pw && p.pw.kind === 'ball' && time < p.pw.until)) return;
    p.inv = time + 1400; p.lockUntil = time + 260;
    const v = new Phaser.Math.Vector2(p.x - sx, p.y - sy); if (v.lengthSq() < 1) v.set(0, 1);
    v.normalize().scale(300); p.body.setVelocity(v.x, v.y); p.hop = null; p.z = 0;
    Sfx.play('hurt'); this.burst(p.x, p.y - 20, 'star', 5, 60);
    if (p.holding) this.release(p, false);
    if (!this.kids && !this.mini) { p.hp = Math.max(0, p.hp - 1); if (p.hp <= 0) this.knockOut(p); }
  }
  knockOut(p) {
    p.state = 'down'; p.downAt = this.time.now; p.reviveT = 0; p.hop = null; p.fly = null; p.z = 0; p.body.setVelocity(0, 0); p.noz.setVisible(false);
    if (p.holding) this.release(p, false);
    Sfx.play('hurt'); this.burst(p.x, p.y - 20, 'star', 8, 80);
    this.toast(Cfg.players[p.idx].name + ' ist K.O.!  Partner: bleib daneben, dann wird er wiederbelebt', 2200);
    if (this.p.every(q => q.state === 'down')) this.teamDown();
  }
  revive(p, hp = 2) {
    p.state = 'normal'; p.hp = Math.max(1, hp); p.inv = this.time.now + 1500; p.reviveT = 0; p.noz.setVisible(true);
    Sfx.play('heal'); this.burst(p.x, p.y - 30, 'star', 10, 90, 0xff6a8a); this.toast(Cfg.players[p.idx].name + ' ist wieder da!', 1200);
  }
  logTaken(kind, o) { (this.taken || (this.taken = [])).push({ kind, x: o.x, y: o.y, tex: o.texture && o.texture.key, model: o.model, val: o.val }); }
  snap() { this.taken = []; this.snapV = { got: this.trashGot, cleaned: this.cleaned, coins: this.coinCount, ammo: this.p.map(q => q.ammo) }; }
  restoreTrash() {   // beim Scheitern: eingesammelter Müll/Münzen seit dem Checkpoint liegen wieder da
    const sv = this.snapV; if (!sv) return;
    for (const t of this.taken || []) {
      if (t.kind === 'p') { const i = this.add.image(t.x, t.y, t.tex || 'trash0').setDepth(t.y); i.model = t.model; this.pickups.push(i); }
      else { const c = this.add.image(t.x, t.y, 'coin').setDepth(t.y); c.val = t.val || 1; c.born = this.time.now; this.coinsA.push(c); }
    }
    this.trashGot = sv.got; this.cleaned = sv.cleaned; this.coinCount = sv.coins; this.p.forEach((q, i) => { q.ammo = sv.ammo[i]; }); this.taken = [];
  }
  teamDown() {
    if (this.downing) return; this.downing = true;
    this.toast('Autsch! Zurück zum letzten Checkpoint…', 1400);
    this.hudCall('fade', 'out', 600);
    this.time.delayedCall(700, () => {
      this.p.forEach(q => { q.hp = q.maxHp; }); this.downing = false; this.restoreTrash(); this.toast('Der Müll liegt wieder da!', 1500);
      for (const p of this.p) { if (p.holding) this.release(p, false); this.placeAt(p, this.cp.x + p.idx * 40, this.cp.y); }
      if (this.bossObj && this.bossObj.started) this.resetBoss();
      this.hudCall('fade', 'in', 400);
    });
  }
  resetBoss() {
    this.bossStarted = false; this.bossObj.reset();
    if (this.lockGate) { this.lockGate.body.enable = false; this.lockGate.setAlpha(0); }
  }
  placeAt(p, x, y) {
    p.state = 'normal'; p.body.enable = true; p.vis.setVisible(true).setScale(1).setAngle(0); p.setVisible(true); p.noz.setVisible(true);
    p.fly = null; p.hop = null; p.z = 0; p.holder = null; p.holding = null;
    p.body.reset(x, y); p.inv = this.time.now + 1500; this.syncVis(p);
  }
  startFall(p) {
    p.state = 'falling'; p.fallT = 0.6; p.body.setVelocity(0, 0); p.hop = null; p.fly = null; p.z = 0; Sfx.play('hurt');
    p.noz.setVisible(false);
    this.tweens.add({ targets: p.vis, scale: 0.1, angle: 360, duration: 600 });
  }
  afterFall(p) {
    if (!this.kids && !this.mini) p.hp = Math.max(1, p.hp - 1);
    this.toast(this.kids ? 'Plumps! Weiter geht\'s.' : '', 700);
    this.placeAt(p, p.lastSafe.x, p.lastSafe.y);
  }
  swallow(h, o) {
    o.state = 'held'; o.holder = h; h.holding = o; o.heldAt = this.time.now;
    o.body.enable = false; o.setVisible(false); o.vis.setVisible(false); o.noz.setVisible(false); o.fly = null; o.hop = null;
    Sfx.play('gulp'); this.burst(h.x + h.aim.x * 30, h.y - 10, 'puff', 6, 50);
    this.toast(this.kids ? 'Jetzt X drücken: wegschießen!' : '', 1500);
  }
  release(h, launch) {
    const o = h.holding; if (!o) return;
    h.holding = null; o.holder = null; o.state = 'normal'; o.body.enable = true; o.setVisible(true); o.vis.setVisible(true); o.noz.setVisible(true);
    o.body.reset(h.x + h.aim.x * 24, h.y + h.aim.y * 24);
    o.noSwallow = this.time.now + 700; o.inv = this.time.now + 600;
    if (launch) {
      o.fly = { t: 0, vx: h.aim.x * LV, vy: h.aim.y * LV }; o.lockUntil = this.time.now + FLY_T * 1000;
      o.body.setVelocity(o.fly.vx, o.fly.vy); this.tetherOff = this.time.now + FLY_T * 1000 + 600;
      Sfx.play('shoot'); this.burst(h.x, h.y - 20, 'puff', 6, 60);
    } else { o.body.setVelocity(-h.aim.x * 140, -h.aim.y * 140); Sfx.play('pop'); }
  }
  landFly(p) {
    p.fly = null; p.z = 0; p.body.setVelocity(0, 0); p.lockUntil = 0;
    if (this.mini && this.mini.onLand) this.mini.onLand(p);
    this.burst(p.x, p.y, 'puff', 6, 50);
    for (const e of this.enemyList.slice()) if (e.active && ov(p, e)) this.damageEnemy(e, 2, p.x, p.y);
  }

  updatePlayer(p, dt, time) {
    const c = p.in, b = p.body, o = this.p[1 - p.idx];
    if (p.state === 'held') {
      p.setPosition(p.holder.x, p.holder.y); p.vis.setVisible(false);
      if ((c.jumpEdge && time - p.heldAt > 450) || time - p.heldAt > 6000) this.release(p.holder, false);
      return;
    }
    if (p.state === 'falling') { p.fallT -= dt; this.syncVis(p); if (p.fallT <= 0) this.afterFall(p); return; }
    if (p.state === 'down') {
      const o2 = this.p[1 - p.idx]; b.setVelocity(0, 0); this.syncVis(p);
      if (o2.state === 'normal' && Math.hypot(o2.x - p.x, o2.y - p.y) < 90) p.reviveT += dt; else p.reviveT = Math.max(0, p.reviveT - dt * 0.6);
      if (p.reviveT > 1.5 || time - p.downAt > 30000) this.revive(p, 2);
      return;
    }

    let mx = c.x, my = c.y; const ml = Math.hypot(mx, my);
    if (ml < 0.22) { mx = 0; my = 0; } else if (ml > 1) { mx /= ml; my /= ml; }
    if (ml >= 0.3) p.aim = { x: mx / Math.hypot(mx, my), y: my / Math.hypot(mx, my) };
    const locked = time < p.lockUntil;
    const pwk = p.pw && time < p.pw.until ? p.pw.kind : null; if (p.pw && !pwk) { p.pw = null; if (!p.fly && !p.hop) p.z = 0; Sfx.play('empty'); }
    const speed = (this.kids ? 215 : SPEED) * (pwk === 'ball' ? 1.7 : pwk === 'wings' ? 1.15 : 1);

    if (p.fly) {
      p.fly.t += dt; p.z = Math.sin(Math.min(1, p.fly.t / FLY_T) * Math.PI) * 85;
      b.setVelocity(p.fly.vx, p.fly.vy);
      if (p.fly.t >= FLY_T || b.blocked.left || b.blocked.right || b.blocked.up || b.blocked.down) this.landFly(p);
    } else if (p.hop) {
      p.hop.t += dt; p.z = Math.sin(Math.min(1, p.hop.t / p.hop.dur) * Math.PI) * p.hop.h;
      if (p.hop.fixed) b.setVelocity(p.hop.vx, p.hop.vy);
      else {   // in der Luft lenkbar (Stick nach vorn = auf Gegner zuspringen)
        const k = 1.3, a2 = 4200 * dt;
        b.setVelocity(approach(b.velocity.x, mx * speed * k, a2), approach(b.velocity.y, my * speed * k, a2));
        if (p.hop.t > p.hop.dur * 0.4) for (const e of this.enemyList) {   // beim Fallen auf einen Gegner = Stomp + Abprallen
          if (!e.active || e.vanish || e.airborne || time < (e.stompT || 0) || !ov(p, e) || p.z > 48) continue;
          e.stompT = time + 300;
          if (e.cfg.stomp && !e.cfg.invuln) { this.damageEnemy(e, 1, p.x, p.y); Sfx.play('stomp'); this.burst(e.x, e.y - 20, 'star', 4, 60); p.hop.t = p.hop.dur * 0.1; p.hop.h = 84; }
          else if (e.cfg.invuln) this.hurtPlayer(p, e.x, e.y);
          else { Sfx.play('empty'); this.burst(e.x, e.y - 30, 'star', 3, 40); p.hop.t = p.hop.dur * 0.15; }
        }
      }
      if (p.hop.t >= p.hop.dur || (p.hop.fixed && !p.hop.ghost && (b.blocked.left || b.blocked.right || b.blocked.up || b.blocked.down))) this.endHop(p);
    } else if (!locked) {
      let tx = mx * speed, ty = my * speed;
      const onConv = this.convs.find(cv => cv.r.contains(p.x, p.y));
      if (onConv) tx += onConv.d * onConv.spd;
      const onIce = this.icesA.length && this.icesA.some(r => r.contains(p.x, p.y));
      const a = (onIce ? 520 : 3400) * dt;
      b.setVelocity(approach(b.velocity.x, tx, a), approach(b.velocity.y, ty, a));
      if (c.jumpEdge && time > p.hopCd) {
        const hv = ml >= 0.3 ? { x: mx / ml, y: my / ml } : p.aim;
        p.hop = { t: 0, dur: 0.58, h: 84 }; Sfx.play('jump'); this.burst(p.x, p.y, 'puff', 3, 30);
      }
    }
    const air = p.fly || p.hop;

    const moving = !air && Math.hypot(b.velocity.x, b.velocity.y) > 40;
    p.vis.setFlipX(p.aim.x < -0.2 ? true : (p.aim.x > 0.2 ? false : p.vis.flipX));
    p.vis.setScale(1 + (p.hop ? 0.08 : 0), 1 + (p.hop ? 0.1 : (moving ? Math.sin(time / 60) * 0.03 : 0)));
    p.vis.setAngle(p.fly ? (time / 3) % 360 : (moving ? Math.sin(time / 70) * 3 : 0));
    this.syncVis(p);
    p.noz.setPosition(p.x + p.aim.x * 20, p.y - 14 - p.z + p.aim.y * 8).setRotation(Math.atan2(p.aim.y, p.aim.x)).setDepth(p.y + (p.aim.y < -0.3 ? 9 : 11)).setVisible(!p.fly);
    p.vis.setAlpha(time < p.inv ? (Math.floor(time / 70) % 2 ? 0.35 : 1) : 1);

    if (pwk === 'wings' && !air) p.z = 62 + Math.sin(time / 180) * 8; else if (pwk === 'ball' && !air) p.z = Math.abs(Math.sin(time / 150)) * 22;
    p.sucking = c.suck && !p.holding && !locked && !air && pwk !== 'ball';
    if (p.sucking) this.doSuck(p, o, time, dt);
    if (c.shootEdge && time > p.shootCd && !locked && !air && pwk !== 'ball') {
      p.shootCd = time + 200;
      if (p.holding) this.release(p, true);
      else if (p.ammo > 0) this.fireTrash(p);
      else { Sfx.play('empty'); this.toast('Kein Müll! Saug welchen ein (B halten).', 1000); }
    }
    if (this.kids && p.ammo < 3) { p.ammoRegen += dt; if (p.ammoRegen > 2.5) { p.ammo++; p.ammoRegen = 0; } }

    if (!air && pwk !== 'wings') {
      const mv = this.onMover(p.x, p.y);
      if ((this.pitAt(p.x, p.y) || this.at(Math.floor(p.x / T), Math.floor(p.y / T)) === 0) && !mv) { this.startFall(p); return; }
      if (time > p.safeT && p.state === 'normal') {
        p.safeT = time + 250;
        const ok = [[0, 0], [30, 0], [-30, 0], [0, 30], [0, -30]].every(([dx, dy]) => !this.pitAt(p.x + dx, p.y + dy)) && !mv && !this.wallPx(p.x, p.y);
        if (ok) p.lastSafe = { x: p.x, y: p.y };
      }
    }
  }
  endHop(p) {
    p.hop = null; p.z = 0; p.hopCd = this.time.now + 120; p.body.setVelocity(p.body.velocity.x * 0.3, p.body.velocity.y * 0.3);
    p.vis.setScale(1.15, 0.85); this.tweens.add({ targets: p.vis, scaleX: 1, scaleY: 1, duration: 120 });
    for (const e of this.enemyList.slice()) if (e.active && ov(p, e)) {
      if (e.cfg.stomp) { this.damageEnemy(e, 1, p.x, p.y); Sfx.play('stomp'); }
      else { Sfx.play('empty'); this.burst(e.x, e.y - 30, 'star', 3, 40); this.hurtPlayer(p, e.x, e.y); }
    }
    const bo = this.bossObj; if (bo && bo.started && !bo.dead && ov(p, bo.spr)) bo.stomp(p);
  }
  charge(p, n = 1) {   // Super-Schuss lädt sich durch Einsaugen auf
    const was = (p.charge || 0) >= p.maxAmmo; p.charge = Math.min(p.maxAmmo, (p.charge || 0) + n);
    if (!was && p.charge >= p.maxAmmo) { Sfx.play('burp'); this.toast('SUPER-SCHUSS bereit!  (X)', 1500); this.burst(p.x, p.y - 40, 'star', 8, 80); }
  }
  fireTrash(p) {
    const full = (p.charge || 0) >= p.maxAmmo, n = full ? 5 : 1;
    if (full) p.charge = 0; p.ammo = full ? Math.max(0, p.ammo - 3) : p.ammo - 1; Sfx.play(full ? 'super' : 'shoot');
    const base = Math.atan2(p.aim.y, p.aim.x);
    for (let i = 0; i < n; i++) {
      const ang = base + (n > 1 ? (i - (n - 1) / 2) * 0.2 : 0), dx = Math.cos(ang), dy = Math.sin(ang), x = p.x + dx * 30, y = p.y + dy * 20;
      const s = this.physics.add.sprite(x, y, 'dotp').setAlpha(0).setDepth(1.6); this.shotG.add(s);
      s.body.setSize(16, 16); s.body.setVelocity(dx * (full ? 780 : 700), dy * (full ? 780 : 700));
      s.vis = this.add.image(x, y - 22, 'trash' + Phaser.Math.Between(0, 3)).setVisible(false); s.z = 22; s.dmg = full ? 2 : 1; s.big = full; s.owner = p.idx;
      s.born = this.time.now; s.gen = (p.gens && p.gens.length) ? p.gens.pop() : 0;
    }
    if (full) { this.shake(120, 0.006); this.burst(p.x + p.aim.x * 30, p.y - 20, 'star', 8, 90); }
    this.burst(p.x + p.aim.x * 30, p.y - 20, 'puff', 3, 40);
  }
  doSuck(p, o, time, dt) {
    const a = p.aim, mx = p.mouth ? p.mouth.x : p.x + a.x * 26, my = p.mouth ? p.mouth.y : p.y - 6 + a.y * 14;
    const range = 185, cos = Math.cos(Phaser.Math.DegToRad(50));
    if (time > p.suckSfx) { p.suckSfx = time + 120; Sfx.play('suck'); }
    const inCone = (x, y, r) => { const dx = x - mx, dy = y - my, d = Math.hypot(dx, dy); if (d < 55) return true; if (d > r) return false; return (dx * a.x + dy * a.y) / d > cos; };
    const full = p.ammo >= p.maxAmmo;
    const pull = (t, spd, y0 = 0) => { const d = Math.hypot(mx - t.x, my - t.y) || 1; t.suckF = Math.max(0.05, Math.min(1, 1 - d / range)); t.suckT = time; const sp = spd * dt * (1 + 1.4 * t.suckF); t.x += (mx - t.x) / d * Math.min(sp, d); t.y += (my - t.y) / d * Math.min(sp, d); return Math.hypot(mx - t.x, my - t.y); };
    for (const t of this.pickups.slice()) {
      if (!t.active || !inCone(t.x, t.y, range)) continue;
      if (full) { if (time > p.fullMsg) { p.fullMsg = time + 1600; this.toast('Tank voll!  Schieß den Müll weg (X) oder in eine Tonne', 1400); Sfx.play('empty'); } continue; }
      const d = pull(t, 520); t.setDepth(t.y);
      if (d < 22) {
        p.ammo++; this.charge(p); (p.gens || (p.gens = [])).push(t.gen || 0); if (p.gens.length > 40) p.gens.shift(); Sfx.play('pickup'); this.logTaken('p', t); t.destroy(); this.pickups = this.pickups.filter(q => q !== t);
      }
    }
    for (const c of this.coinsA.slice()) {   // Münzen werden eingesaugt und verschwinden in der Düse
      if (!c.active || !inCone(c.x, c.y, range)) continue;
      if (pull(c, 560) < 22) { this.coinCount += (c.val || 1); Sfx.play('coin'); this.logTaken('c', c); c.destroy(); this.coinsA = this.coinsA.filter(q => q !== c); }
    }
    for (const f of this.foods.slice()) {
      if (!f.active || !inCone(f.x, f.y, range)) continue;
      if (!this.kids && p.hp >= p.maxHp) { if (time > p.fullMsg) { p.fullMsg = time + 1600; this.toast('Dein Leben ist schon voll – heb es dir für später auf!', 1200); } continue; }
      if (pull(f, 480) < 22) {
        if (this.kids) { this.coinCount += 3; } else p.hp = Math.min(p.maxHp, p.hp + f.heal);
        Sfx.play('heal'); this.burst(p.x, p.y - 40, 'star', 10, 90, 0xff6a8a); this.toast(this.kids ? 'Lecker! +3 Münzen' : 'Lecker! +' + f.heal + ' Leben', 900);
        f.destroy(); this.foods = this.foods.filter(q => q !== f);
      }
    }
    // Gegner: kleine werden komplett eingesaugt (Tank +2), größere verlieren beim Saugen Lebenspunkte
    for (const e of this.enemyList.slice()) {
      if (!e.active || e.cfg.invuln || e.cfg.still || e.vanish || !inCone(e.x, e.y, range)) continue;
      const c = e.cfg, small = c.walker || c.hp <= 1 || c.kamikaze || c.jumper || e.type === 'walker' || e.type === 'flyer';
      e.suckT = time;
      if (small) {
        if (p.ammo >= p.maxAmmo) { e.suckF = 0.2; continue; }
        e.body.setVelocity(0, 0); if (pull(e, 360) < 30) {
          p.ammo += 2; this.charge(p, 2); this.coinCount += 1; Sfx.play('gulp'); this.burst(mx, my - 20, 'star', 8, 80);
          this.enemyList = this.enemyList.filter(q => q !== e); this.killActor(e); this.toast('Eingesaugt! Tank +2', 700);
        }
      } else {   // große Gegner: werden festgehalten und nehmen Schaden
        e.suckF = 0.25; e.body.setVelocity(0, 0); if (time > (e.suckDmg || 0)) { e.suckDmg = time + 900; this.damageEnemy(e, 1, e.x - a.x * 10, e.y - a.y * 10); }
      }
    }
    if (o.state === 'normal' && time > o.noSwallow && !o.fly && !o.hop && inCone(o.x, o.y, 125) && Math.hypot(o.x - p.x, o.y - p.y) < 125) this.swallow(p, o);
  }

  // ───────────────────────── Rätsel-Logik ─────────────────────────
  active(id) {
    const g = this.groups[id]; if (!g || (!g.t.length && !g.p.length)) return false;
    const time = this.time.now;
    for (const t of g.t) if (!(t.perm || time < t.until)) return false;
    for (const p of g.p) if (!p.ever) return false;
    return true;
  }
  hitTarget(t) {
    if (t.perm) return;
    const was = t.isOn;
    if (t.dur === 0) t.perm = true; else t.until = this.time.now + t.dur * 1000 * (this.kids ? 1.8 : 1);
    if (!was) { Sfx.play('switch'); this.burst(t.x, t.y - 30, 'star', 6, 60); }
  }
  updatePuzzles(time, dt) {
    for (const t of this.targets) {
      const on = t.perm || time < t.until;
      if (on !== t.isOn) { t.isOn = on; t.setTexture('target_' + t.color + (on ? '_on' : '_off')); if (!on) Sfx.play('empty'); }
    }
    for (const pl of this.plates) {
      let pr = false;
      for (const q of this.p) if (q.state === 'normal' && !q.fly && q.z < 10 && ov(q, pl)) pr = true;
      if (pr !== pl.pressed) { pl.pressed = pr; pl.setTexture('plate_' + pl.color + (pr ? '_on' : '_off')); if (pr) { Sfx.play('switch'); pl.ever = true; } }
    }
    for (const g of this.gates) {
      if (g.lock) continue;
      const want = this.active(g.id);
      if (want !== g.open) {
        g.open = want; Sfx.play('gate'); g.body.enable = !want;
        this.tweens.killTweensOf(g); this.tweens.add({ targets: g, alpha: want ? 0.18 : 1, duration: 400 });
      }
    }
    for (const br of this.bridges) {
      if (this.active(br.id) && !br.on) { br.on = true; br.keys.forEach(k => this.bridged.add(k)); br.v.setAlpha(1); Sfx.play('gate'); this.burst(br.v.x + br.v.width / 2, br.v.y + br.v.height / 2, 'puff', 8, 80); }
    }
    for (const m of this.moversA) {
      const ph = (1 - Math.cos(time / 1000 * Math.PI * 2 / m.period)) / 2;
      const nx = m.bx + m.dx * ph, ny = m.by + m.dy * ph, ddx = nx - m.px, ddy = ny - m.py;
      for (const q of this.p) if (q.state === 'normal' && !q.fly && !q.hop && q.x > m.px && q.x < m.px + m.w && q.y > m.py && q.y < m.py + m.h) { q.x += ddx; q.y += ddy; }
      m.px = nx; m.py = ny; m.v.setPosition(nx, ny);
    }
    for (const c of this.crushers) {
      const ph = (((time / 1000 + c.off) % c.per) + c.per) % c.per / c.per;
      c.dang = false; c.vis.setVisible(false); c.warn = (ph > 0.45 && ph < 0.7) ? (ph - 0.45) / 0.25 : 0;
      const by = c.y + T * 2 - 6;
      if (ph >= 0.7 && ph < 0.78) c.vis.setVisible(true).setY(by - (1 - (ph - 0.7) / 0.08) * 300).setDepth(c.y + T * 2);
      else if (ph >= 0.78 && ph < 0.92) {
        c.vis.setVisible(true).setY(by).setDepth(c.y + T * 2); c.dang = true;
        if (!c.slam) { c.slam = true; this.shake(120, 0.006); Sfx.play('stomp'); this.burst(c.x + T, c.y + T * 2, 'puff', 8, 80, 0xcccccc); }
      } else if (ph >= 0.92) c.vis.setVisible(true).setY(by - (ph - 0.92) / 0.08 * 300).setDepth(c.y + T * 2);
      if (ph < 0.6) c.slam = false;
    }
    for (const l of this.lasers) {
      if (l.id) l.on = !this.active(l.id);
      else { const ph = (((time / 1000 + l.off) % l.per) + l.per) % l.per / l.per; l.on = ph < 0.5; l.warn = ph > 0.88; }
    }
    for (const cv of this.convs) cv.v.tilePositionX -= cv.d * cv.spd * dt * 0.7;
  }
  hazards(time) {
    const g = this.gfx; g.clear();
    for (const c of this.crushers) if (c.warn) { g.fillStyle(0xff3a2e, 0.15 + c.warn * 0.3); g.fillRect(c.x + 4, c.y + 4, c.w - 8, c.h - 8); g.lineStyle(4, 0xff3a2e, 0.8); g.strokeRect(c.x + 4, c.y + 4, c.w - 8, c.h - 8); }
    for (const l of this.lasers) {
      const r = l.r;
      if (l.on) { g.fillStyle(0xff3a3a, 0.9); g.fillRect(r.x, r.y, r.w, r.h); g.fillStyle(0xffffff, 0.9); if (l.dir === 'h') g.fillRect(r.x, r.y + 4, r.w, 4); else g.fillRect(r.x + 4, r.y, 4, r.h); }
      else if (l.warn || l.id) { g.fillStyle(0xff3a3a, l.id ? 0.12 : (Math.floor(time / 60) % 2 ? 0.45 : 0.1)); g.fillRect(r.x, r.y, r.w, r.h); }
    }
    for (const p of this.p) {
      if (p.state !== 'normal' || p.fly) continue;
      const pr = new Phaser.Geom.Rectangle(p.body.left, p.body.top, p.body.width, p.body.height);
      if (p.z < 14) {
        for (const s of this.spikesA) if (ov(p, s)) this.hurtPlayer(p, s.x + s.displayWidth / 2, s.y + s.displayHeight / 2);
        for (const c of this.crushers) if (c.dang && Phaser.Geom.Intersects.RectangleToRectangle(pr, new Phaser.Geom.Rectangle(c.x, c.y, c.w, c.h))) this.hurtPlayer(p, c.x + T, c.y + T);
      }
      for (const l of this.lasers) if (l.on && Phaser.Geom.Intersects.RectangleToRectangle(pr, new Phaser.Geom.Rectangle(l.r.x, l.r.y, l.r.w, l.r.h))) this.hurtPlayer(p, p.x, p.y - 20);
    }
    for (const s of this.eshotG.getChildren().slice()) {
      if (!s.active) continue;
      s.vis.setPosition(s.x, s.y - s.z).setDepth(s.y + 12);
      if (time - s.born > 3500) { this.killActor(s); continue; }
      for (const p of this.p) if (p.state === 'normal' && p.z < 22 && ov(p, s)) { this.hurtPlayer(p, s.x, s.y); this.splat(s, 0xa0f06a); break; }
    }
  }
  updateShots(time) {
    for (const s of this.shotG.getChildren().slice()) {
      if (!s.active) continue;
      s.vis.setPosition(s.x, s.y - s.z).setDepth(s.y + 12);
      if (time - s.born > 1000) { this.splat(s); continue; }
      for (const e of this.enemyList.slice()) if (e.active && ov(s, e)) { this.damageEnemy(e, s.dmg || 1, s.x - s.body.velocity.x * 0.01, s.y - s.body.velocity.y * 0.01); this.splat(s); break; }
      if (!s.active) continue;
      const bo = this.bossObj;
      if (bo && bo.started && !bo.dead && ov(s, bo.spr)) { bo.hurt(s.dmg || 1); this.splat(s); }
    }
    for (const p of this.p) if (p.fly) {
      for (const t of this.targets) if (ov(p, t)) this.hitTarget(t);
      for (const c of this.crateList.slice()) if (c.active && ov(p, c)) { this.breakCrate(c); this.landFly(p); break; }
      const bo = this.bossObj; if (p.fly && bo && bo.started && !bo.dead && ov(p, bo.spr)) { bo.hurt(2); this.landFly(p); }
    }
  }
  breakCrate(c) {
    Sfx.play('crate'); this.burst(c.x, c.y, 'puff', 8, 80, 0xc99a5b); this.shake(80, 0.004);
    if (c.loot) this.dropCoin(c.x, c.y, 3);
    if (Math.random() < 0.4) { const t = this.add.image(c.x, c.y, 'trash' + Phaser.Math.Between(0, 3)).setDepth(c.y); this.pickups.push(t); }
    this.crateList = this.crateList.filter(o => o !== c); c.destroy();
  }
  touches(time) {
    const mag = this.kids ? 120 : 80;
    for (const p of this.p) {
      if (p.state !== 'normal') continue;
      for (const c of this.coinsA.slice()) {
        if (!c.active) continue;
        const d = Math.hypot(c.x - p.x, c.y - (p.y - 16));
        if (d < mag && d > 1) { c.x += (p.x - c.x) / d * Math.min(7, d); c.y += (p.y - 16 - c.y) / d * Math.min(7, d); }
        if (d < 34) { this.coinCount += (c.val || 1); Sfx.play('coin'); this.logTaken('c', c); c.destroy(); this.coinsA = this.coinsA.filter(q => q !== c); }
      }
      for (const f of this.cps) if (!f.hit && Math.hypot(p.x - f.cx, p.y - f.cy) < 60) {
        f.hit = true; f.setTexture('flag_on'); this.cp = { x: f.cx, y: f.cy }; this.time.delayedCall(60, () => this.snap()); Sfx.play('check');
        this.p.forEach(q => { if (q.state === 'down') this.revive(q, 3); else { q.hp = Math.min(q.maxHp, q.hp + 2); q.ammo = Math.max(q.ammo, 6); } }); this.toast('Checkpoint!  Leben + Tank aufgefüllt', 1200); this.burst(f.x, f.y - 40, 'star', 8, 70);
      }
      if (p.z < 14 && !p.fly) for (const e of this.enemyList) if (e.active && !e.harmless && !e.airborne && !e.vanish && ov(p, e)) this.hurtPlayer(p, e.x, e.y);
      if (p.pw && p.pw.kind === 'ball') for (const e of this.enemyList.slice()) if (e.active && !e.vanish && ov(p, e) && time > (e.ballHit || 0)) { e.ballHit = time + 350; this.damageEnemy(e, 2, p.x, p.y); }
      if (p.fly) for (const e of this.enemyList.slice()) if (e.active && ov(p, e)) this.damageEnemy(e, 2, p.x, p.y);
    }
    for (const pw of this.powers.slice()) for (const p of this.p) if (pw.active && p.state === 'normal' && Math.hypot(p.x - pw.x, p.y - pw.y) < 38) { this.givePower(p, pw.kind); pw.destroy(); this.powers = this.powers.filter(q => q !== pw); break; }
    for (const p of this.p) if (p.state === 'normal' && p.pw && p.pw.kind === 'magnet' && time < p.pw.until) {
      const pull = (list, ok) => { for (const t of list.slice()) { if (!t.active) continue; const d = Math.hypot(p.x - t.x, p.y - t.y); if (d > 260 || d < 2 || !ok(t)) continue; const sp = 420 * 0.016; t.x += (p.x - t.x) / d * Math.min(sp, d); t.y += (p.y - t.y) / d * Math.min(sp, d); if (d < 32) { if (list === this.pickups) { p.ammo++; Sfx.play('pickup'); this.logTaken('p', t); t.destroy(); this.pickups = this.pickups.filter(q => q !== t); } } } };
      if (p.ammo < p.maxAmmo) pull(this.pickups, () => true); pull(this.coinsA, () => true);
    }
    for (const sp of this.springsA) for (const p of this.p) {
      if (p.state === 'normal' && !p.hop && !p.fly && time > sp.cd && Math.hypot(p.x - sp.x, p.y - sp.y) < 30) {
        const v = p.body.velocity, sp_ = Math.hypot(v.x, v.y), d = sp_ > 40 ? { x: v.x / sp_, y: v.y / sp_ } : p.aim;
        p.hop = { t: 0, dur: 0.8, h: sp.up ? 150 : 110, vx: d.x * 650, vy: d.y * 650, ghost: true, fixed: true }; sp.cd = time + 700; sp.t0 = time; Sfx.play('boing'); this.burst(sp.x, sp.y, 'puff', 6, 50);
      }
    }
    for (const sp of this.spawners) {
      sp.kids = sp.kids.filter(e => e.active);
      if (time > sp.next && sp.kids.length < sp.max && this.p.some(p => Math.hypot(p.x - sp.x, p.y - sp.y) < 640)) {
        sp.next = time + sp.period * 1000 * (this.kids ? 1.5 : 1);
        const e = this.spawnEnemy(sp.type, sp.x, sp.y + 34); sp.kids.push(e); sp.t0 = time; this.burst(sp.x, sp.y + 20, 'puff', 8, 60, 0x8a7a6a); Sfx.play('pop');
      }
    }
    const ns = this.signs.find(sg => this.p.some(p => Math.abs(p.x - sg.s.x) < 130 && Math.abs(p.y - sg.s.y) < 110));
    const stxt = ns ? ns.text : null; if (stxt !== this.lastSign) { this.lastSign = stxt; this.hudCall('sign', stxt); }
  }

  // ───────────────────────── Kette ─────────────────────────
  tether() {
    const [a, b] = this.p, time = this.time.now, g = this.chainG; g.clear();
    if (a.state !== 'normal' || b.state !== 'normal') return;
    const L = this.kids ? 540 : 440;
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
    if (time > (this.tetherOff || 0) && d > L && !a.fly && !b.fly) {
      const nx = dx / d, ny = dy / d;
      const va = a.body.velocity.x * nx + a.body.velocity.y * ny; if (va < 0) a.body.setVelocity(a.body.velocity.x - va * nx, a.body.velocity.y - va * ny);
      const vb = -(b.body.velocity.x * nx + b.body.velocity.y * ny); if (vb < 0) b.body.setVelocity(b.body.velocity.x + vb * nx, b.body.velocity.y + vb * ny);
      if (d > L + 120) { a.x += nx * 3; a.y += ny * 3; b.x -= nx * 3; b.y -= ny * 3; }
    }
    const n = Math.max(2, Math.floor(d / 14)), slack = Math.max(0, L - d) * 0.14;
    const px = -dy / d, py = dx / d, x1 = a.x, y1 = a.y - 8, x2 = b.x, y2 = b.y - 8;
    for (let i = 0; i <= n; i++) {
      const t = i / n, w = Math.sin(t * Math.PI) * Math.min(slack, 40);
      const x = x1 + (x2 - x1) * t + px * w, y = y1 + (y2 - y1) * t + py * w;
      g.fillStyle(0xdfe3ea, 1); g.fillCircle(x, y, 4.5); g.lineStyle(2.5, OUT, 1); g.strokeCircle(x, y, 4.5);
    }
  }

  // ───────────────────────── Hauptschleife ─────────────────────────
  deliver(time) {   // Müll in der Tonne abliefern: Kanister leert sich, Zähler steigt
    for (const p of this.p) {
      if (p.state !== 'normal' || p.ammo <= 0 || time < (p.delT || 0)) continue;
      const b = this.bins.find(q => Math.hypot(q.x - p.x, q.y - p.y) < 78); if (!b) continue;
      p.delT = time + 70; p.ammo--; this.trashGot++; this.cleaned++; if (this.cleaned % 3 === 0) this.coinCount++;
      b.t0 = time; Sfx.play('pickup'); this.burst(b.x, b.y - 36, 'star', 2, 60, 0x7dff8a);
      if (p.ammo === 0) { this.toast('Kanister geleert – weiter aufräumen!', 900); Sfx.play('pop'); }
    }
  }
  autoBins(n) {
    const rnd = new Phaser.Math.RandomDataGenerator(['tonne' + this.lv]); const spots = [];
    for (const f of this.cps) spots.push([Math.floor(f.cx / T) + 2, Math.floor(f.cy / T)]);
    for (let tries = 0; spots.length < n && tries < 4000; tries++) {
      const x = rnd.between(2, this.gw - 3), y = rnd.between(2, this.gh - 3);
      if (spots.some(q => Math.hypot(q[0] - x, q[1] - y) < 24)) continue; spots.push([x, y]);
    }
    for (const [x, y] of spots) {
      let ok = true; for (let dx = -1; dx <= 1 && ok; dx++) for (let dy = -1; dy <= 1 && ok; dy++) if (this.at(x + dx, y + dy) !== 1) ok = false;
      if (ok && !this.occupied(this.cx(x), this.cy(y), 30)) this.bin(x - this.ox, y);
    }
  }
  update(time, delta) {
    const dt = Math.min(delta, 50) / 1000; if (!this.paused && !this.done) this.deliver(time);
    const n = this.nav.poll();
    for (const p of this.p) p.in = p.ctrl.read();
    if (this.done) { if (n.ok || this.p.some(p => p.in.jumpEdge)) this.next(); return; }
    if (this.paused) {
      if (n.ok) this.setPause(false);
      if (n.back || this.p.some(q => q.in.back)) this.scene.start('Menu');
      return;
    }
    if (n.back || this.p.some(p => p.in.startEdge)) { this.setPause(true); return; }
    this.warns = [];
    this.updatePuzzles(time, dt);
    for (const p of this.p) this.updatePlayer(p, dt, time);
    this.tether();
    this.updateEnemies(time, dt);
    if (this.bossObj) this.bossObj.update(dt, time);
    this.updateZones(time, dt);
    if (this.quota && !this.exitOpen && this.trashGot >= this.quota) this.openExit();
    if (this.mini && !this.done) this.mini.update(dt, time);
    this.updateShots(time);
    this.hazards(time);
    this.touches(time);
    this.bossTrigger();
    this.drawFx(time);
    this.checkExit();
    this.v3.update(dt, time);
  }
  bossTrigger() {
    if (this.bossStarted || !this.bossObj) return;
    const lim = (this.A + 4) * T;
    if (this.p.every(p => p.state === 'normal' && p.x > lim)) {
      this.bossStarted = true; this.bossObj.start();
      const g = this.lockGate; g.body.enable = true; g.setAlpha(0.9); Sfx.play('gate');
      Sfx.music('boss'); Sfx.play('boss');
    }
  }
  drawFx(time) {
    for (const p of this.p) {
      p.prev = null;
      if (p.state !== 'normal' || !p.holding) continue;
      const a = p.aim; let d = 0; const maxD = LV * FLY_T; let lx = p.x, ly = p.y;
      while (d < maxD) { const nx = lx + a.x * 12, ny = ly + a.y * 12; if (this.wallPx(nx, ny)) break; lx = nx; ly = ny; d += 12; }
      p.prev = { lx, ly, bad: this.pitAt(lx, ly) && !this.onMover(lx, ly) };
    }
  }
  checkExit() {
    if (!this.exitOpen || this.done) return;
    const e = this.exitPos;
    const n = this.p.filter(p => p.state === 'normal' && Math.hypot(p.x - e.x, p.y - (e.y + 10)) < 80).length;
    if (n === 2) this.finish();
    else if (n === 1) this.toast('Wartet auf den Partner – beide in die Röhre!', 300);
  }
  openExit() {
    this.exitOpen = true; this.exitSpr.setTexture('exit');
    if (this.lockGate) { this.lockGate.body.enable = false; this.lockGate.setAlpha(0); }
    this.toast(this.quota ? 'Genug Müll gesammelt! Beide ins Portal!' : 'Geschafft! Beide in den Müllschlucker!', 3000);
  }

  // ───────────────────────── Pause / Ende ─────────────────────────
  setPause(on) { this.paused = on; this.physics.world.isPaused = on; this.hudCall('pause', on); }
  finish() {
    if (this.done) return; this.done = true; Sfx.music(null); Sfx.play('win');
    for (const p of this.p) p.body.setVelocity(0, 0);
    this.hudCall('sign', null); this.hudCall('finish', this.coinCount, Math.round((this.time.now - this.t0) / 1000), this.trashGot, this.trashTotal, this.cleaned);
    for (let i = 0; i < 30; i++) this.time.delayedCall(i * 40, () => this.burst(this.p[0].x + Phaser.Math.Between(-300, 300), this.p[0].y + Phaser.Math.Between(-200, 100), 'star', 3, 160));
  }
  endMini(score, stars, label) {
    if (this.done) return; this.done = true; Sfx.music(null); Sfx.play('win');
    for (const p of this.p) p.body.setVelocity(0, 0);
    this.hudCall('sign', null); this.hudCall('finishMini', this.def.name, score, stars, label);
    for (let i = 0; i < 24; i++) this.time.delayedCall(i * 45, () => this.burst(this.p[0].x + Phaser.Math.Between(-300, 300), this.p[0].y + Phaser.Math.Between(-200, 100), 'star', 3, 160));
  }
  next() {
    if (this.def.mini) { this.scene.start('Minigames'); return; }
    if (this.def.bonus) { this.scene.start('Select'); return; }
    const lv = this.lv, last = lv >= STORY_COUNT - 1;
    const after = last ? { scene: 'Menu', data: {} } : (LEVELS[lv + 1].story.pre ? { scene: 'Story', data: { id: LEVELS[lv + 1].story.pre, next: { scene: 'Level', data: { level: lv + 1, mode: this.mode } } } } : { scene: 'Level', data: { level: lv + 1, mode: this.mode } });
    this.scene.start('Story', { id: this.def.story.post, next: after });
  }
}
