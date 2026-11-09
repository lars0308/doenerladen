
const pc = i => PLAYER_COLORS.find(c => c.id === Cfg.players[i].color) || PLAYER_COLORS[2];
const WHO = {
  knox:  { get name() { return Cfg.players[0].name; }, get color() { return pc(0).css; }, get tex() { return 'port_' + Cfg.players[0].color; }, hero: true },
  zippy: { get name() { return Cfg.players[1].name; }, get color() { return pc(1).css; }, get tex() { return 'port_' + Cfg.players[1].color; }, hero: true },
  chief: { name: 'Bürgermeisterin Kehrer', color: '#7fd1ff', tex: 'port_chief' },
  unrat: { name: 'Dr. Unrat', color: '#ff6a6a', tex: 'port_unrat' },
};

const STORY = {
  intro: { theme: 'alley', lines: [
    { who: 'chief', text: 'Müllheim, 3 Uhr morgens. Die Mülltonnen haben sich selbstständig gemacht. Das ist kein Scherz – ich habe es dreimal prüfen lassen.' },
    { who: 'knox',  text: 'Frau Kehrer, wir sind die Müllabfuhr. Wir fahren Tonnen aus. Wir kämpfen nicht gegen sie.' },
    { who: 'zippy', text: 'Doch! Ich wollte schon immer mal gegen eine Tonne kämpfen!' },
    { who: 'chief', text: 'Dann habe ich gute Nachrichten: Hier ist der Turbo-Sauger 3000. Er saugt Müll ein – und schießt ihn zurück. Er saugt übrigens auch Kollegen.' },
    { who: 'zippy', text: 'Wir sind außerdem durch eine Sicherheitskette verbunden. Frag nicht.' },
    { who: 'knox',  text: 'Warum bin ich eigentlich der Einzige, der das komisch findet?' },
    { who: 'chief', text: 'Findet den Grund für den Aufstand. Fangt im Hinterhof an. Und bitte: nichts kaputtmachen, was nicht schon wütend auf euch ist.' },
  ] },
  post0: { theme: 'alley', lines: [
    { who: 'knox',  text: 'Auf dem Deckel klebt ein Logo. „Unrat Entsorgungstechnik“. Das kommt mir bekannt vor.' },
    { who: 'zippy', text: 'Dr. Ludwig Unrat! Der wurde vor zwei Jahren von den Stadtwerken gefeuert, weil er den Müll „zu persönlich“ genommen hat.' },
    { who: 'knox',  text: 'Die Spur führt in die Kanalisation. Natürlich. Es muss immer die Kanalisation sein.' },
  ] },
  pre1: { theme: 'sewer', lines: [
    { who: 'zippy', text: 'Hier riecht es wie in deinen Sportschuhen, {p1}.' },
    { who: 'knox',  text: 'Meine Sportschuhe sind ein Naturprodukt. Bleib dicht bei mir – und denk dran: Die Kette hält nicht ewig.' },
  ] },
  post1: { theme: 'sewer', lines: [
    { who: 'zippy', text: 'Er hat Pläne hiergelassen! „Chaos-Kern lädt auf … je mehr Müll lebt, desto stärker.“' },
    { who: 'knox',  text: 'Dann ist der Reaktor das Herz des Ganzen. Und der Schlüssel dazu liegt auf dem Schrottplatz Süd.' },
    { who: 'zippy', text: 'Ich liebe Schrottplätze. Da darf man Sachen kaputtmachen!' },
  ] },
  pre2: { theme: 'junk', lines: [
    { who: 'knox',  text: 'Der Schrottplatz. Tausend Teile, die unbedingt wieder zusammen wollen.' },
    { who: 'zippy', text: 'Pass auf, wohin du trittst. Und wohin ich dich schieße.' },
  ] },
  post2: { theme: 'junk', lines: [
    { who: 'zippy', text: 'Er hat dem Bagger einen Namen gegeben: „Gnadenlos“. Das ist doch gestört.' },
    { who: 'knox',  text: 'Das ist eine Midlife-Crisis mit Hydraulik. Moment – hier liegt ein Prospekt: „Unrat Kühlanlage – Winterpark Müllberg“.' },
    { who: 'zippy', text: 'Er hat einen eigenen Skihang aus Müll?! Ich will da hin!' },
  ] },
  pre3: { theme: 'winter', lines: [
    { who: 'chief', text: '(Funk) Der Winterpark ist die Kühlung für Unrats Reaktor. Schaltet sie aus, und er wird nervös. Zieht euch warm an!' },
    { who: 'knox',  text: 'Es ist kalt. Es ist wirklich kalt.' },
    { who: 'zippy', text: 'Hopsen wärmt! Und rutschen macht Spaß. Wetten, ich kann auf dem Eis bremsen?' },
    { who: 'knox',  text: 'Das hast du auf dem Hinterhof auch behauptet. Pass auf die Bogenschützen auf.' },
  ] },
  post3: { theme: 'winter', lines: [
    { who: 'zippy', text: 'Der Drache war ein Kühlschrank-Magnet mit Flügeln! Und jetzt ist es hier wieder angenehm.' },
    { who: 'knox',  text: 'Unrats Kühlung ist ausgefallen. Die Spur führt zum alten Müllfriedhof – dort liegt sein Ersatzteillager.' },
    { who: 'zippy', text: 'Ein Friedhof. Natürlich.' },
  ] },
  pre4: { theme: 'grave', lines: [
    { who: 'knox',  text: 'Müll, der nicht in Frieden ruhen kann. Das passt zu Unrat.' },
    { who: 'zippy', text: 'Ich mag Gruselgeschichten. Aber nur, wenn du an der Kette hängst, {p1}.' },
    { who: 'knox',  text: 'Ich hänge an dir, {p2}. Im wahrsten Sinne.' },
  ] },
  post4: { theme: 'grave', lines: [
    { who: 'zippy', text: 'Der Totengräber hatte den Generalschlüssel zur Fabrik in der Tasche!' },
    { who: 'chief', text: '(Funk) Hervorragend! Der Reaktor erreicht in einer halben Stunde kritische Masse. Ich besorge schon mal Käsebrötchen.' },
    { who: 'knox',  text: 'Letzter Halt: die Unrat-Fabrik.' },
  ] },
  pre5: { theme: 'factory', lines: [
    { who: 'chief', text: '(Funk) Das ist sie: die Unrat-Fabrik. Stoppt den Reaktor – ich glaube an euch!' },
    { who: 'unrat', text: 'Ah, die Müllabfuhr. Wie nett. Ihr holt ab, was ich nie hergeben wollte.' },
    { who: 'knox',  text: 'Ludwig, es ist nur Müll.' },
    { who: 'unrat', text: 'NUR Müll?! Jahrelang habe ich ihn sortiert, getrennt, gepresst – und die Stadt dankte mir mit einer Kündigung! Jetzt hört der Müll auf MICH!' },
    { who: 'zippy', text: 'Er hat sich einen Mech gebaut. Natürlich hat er das.' },
  ] },
  outro: { theme: 'factory', lines: [
    { who: 'unrat', text: 'Mein Müll … mein Reaktor … Ich wollte doch nur, dass jemand meine Arbeit bemerkt.' },
    { who: 'knox',  text: 'Wir bemerken sie. Du hast den Müll übrigens erstaunlich gut sortiert.' },
    { who: 'chief', text: '(Funk) Wir suchen gerade einen Abteilungsleiter für Recycling. Eine Stelle, ein Dienstwagen, ein Käsebrötchen.' },
    { who: 'unrat', text: '…Mit Dienstwagen?' },
    { who: 'chief', text: 'Mit Dienstwagen.' },
    { who: 'unrat', text: 'Wann kann ich anfangen?' },
    { who: 'zippy', text: 'Das ging schneller als gedacht. Team Sauger: Müllheim ist wieder sauber!' },
    { who: 'knox',  text: 'Ich nehme das Käsebrötchen trotzdem. Ohne Kette. Bitte.' },
  ] },
};

class StoryScene extends StageScene {
  constructor() { super('Story'); }
  init(d) { this.d = d; }
  create() {
    const sc = STORY[this.d.id];
    this.lines = sc.lines; this.i = 0;
    this.stage(sc.theme, { cam: { x: 0, y: 3.3, z: 12, ly: 0.15 }, w: 21, d: 9 });
    Sfx.music('menu');
    const [c1, c2] = Cfg.players;
    this.h = { knox: this.sc3.addChar({ color: c1.color, x: -4.4, z: 0.4, yaw: 0.7, scale: 1.55 }), zippy: this.sc3.addChar({ color: c2.color, x: -2.4, z: 0.8, yaw: 0.55, scale: 1.55 }) };
    const who = new Set(sc.lines.map(l => l.who));
    this.npc = {};
    const nx = who.has('chief') && who.has('unrat') ? { chief: 2.2, unrat: 4.4 } : { chief: 3.4, unrat: 3.4 };
    if (who.has('chief')) this.npc.chief = this.sc3.addChar({ model: 'p:character-ooli', x: nx.chief, z: 0.6, yaw: -0.6, scale: 1.55 });
    if (who.has('unrat')) this.npc.unrat = this.sc3.addChar({ model: 'p:character-oodi', x: nx.unrat, z: 0.6, yaw: -0.7, scale: 1.55 });
    // Dialogfeld
    this.box = UI.glass(this, 60, 500, 1160, 190, { r: 30, alpha: 0.82 });
    this.tagBg = this.add.graphics();
    this.tag = UI.text(this, 120, 478, '', 34);
    this.txt = UI.text(this, 96, 540, '', 32, { wordWrap: { width: 1090 }, lineSpacing: 8, stroke: '#16101f', strokeThickness: 5 });
    this.hint = UI.text(this, 1190, 676, '▶ weiter', 26).setOrigin(1, 1);
    this.tweens.add({ targets: this.hint, alpha: 0.35, yoyo: true, repeat: -1, duration: 500 });
    UI.text(this, 60, 682, 'Esc / Start: überspringen', 20, { color: '#ffffffaa' }).setOrigin(0, 1);
    this.ctl = [new Ctrl(this, 0), new Ctrl(this, 1)];
    this.show();
  }
  charOf(key) { return this.h[key] || this.npc[key]; }
  show() {
    const ln = this.lines[this.i], who = WHO[ln.who];
    this.full = ln.text.replace(/\{p1\}/g, Cfg.players[0].name).replace(/\{p2\}/g, Cfg.players[1].name);
    this.shown = 0; this.typing = true; this.txt.setText('');
    this.tagBg.clear(); const col = UI.hex(who.color), w = Math.max(160, who.name.length * 20 + 50);
    this.tagBg.fillStyle(0x16101f, 0.95); this.tagBg.fillRoundedRect(96, 468, w, 54, 27); this.tagBg.lineStyle(5, col, 1); this.tagBg.strokeRoundedRect(96, 468, w, 54, 27);
    this.tag.setText(who.name).setColor(who.color).setPosition(96 + w / 2, 495).setOrigin(0.5);
    const all = Object.assign({}, this.h, this.npc);
    for (const k in all) { const talk = k === ln.who; this.sc3.play(all[k], talk ? (k === 'knox' || k === 'zippy' ? 'emote-yes' : 'interact-right') : 'idle'); }
    const sp = this.charOf(ln.who); if (sp) this.sc3.camBase.x = Phaser.Math.Clamp(sp.base.x * 0.35, -1.6, 1.6);
  }
  update(time, dt) {
    const n = this.nav.poll(); if (!this.t0) this.t0 = time; if (time - this.t0 < 500) { this.ctl.forEach(c => c.read()); this.tickStage(time, dt); return; }
    this.ctl.forEach(c => { const r = c.read(); if (r.jumpEdge || r.shootEdge) n.ok = true; if (r.startEdge) n.back = true; });
    if (this.typing) {
      this.shown += dt * 0.05; const s = Math.floor(this.shown);
      if (s > this.txt.text.length && s % 3 === 0) Sfx.play('talk');
      this.txt.setText(this.full.slice(0, s));
      if (s >= this.full.length) this.typing = false;
    }
    if (n.ok) {
      if (this.typing) { this.typing = false; this.txt.setText(this.full); Sfx.play('select'); }
      else if (++this.i >= this.lines.length) this.done();
      else { Sfx.play('select'); this.show(); }
    }
    if (n.back) this.done();
    this.tickStage(time, dt);
  }
  done() { const nx = this.d.next; this.scene.start(nx.scene, nx.data); }
}
