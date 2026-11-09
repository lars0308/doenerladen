const FONT = '"Comic Sans MS", "Chalkboard SE", "Comic Neue", "Trebuchet MS", Verdana, sans-serif';

const WHO = {
  knox:  { name: 'Knox',  color: '#3fa7ff', tex: 'pt_knox',  hero: true },
  zippy: { name: 'Zippy', color: '#ff9a2e', tex: 'pt_zippy', hero: true },
  chief: { name: 'Bürgermeisterin Kehrer', color: '#7fd1ff', tex: 'pt_chief' },
  unrat: { name: 'Dr. Unrat', color: '#ff6a6a', tex: 'pt_unrat' },
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
    { who: 'zippy', text: 'Hier riecht es wie in deinen Sportschuhen, Knox.' },
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
    { who: 'knox',  text: 'Das ist eine Midlife-Crisis mit Hydraulik. Aber wir haben die Zugangskarte: Fabrik, Sektor 9.' },
  ] },
  pre3: { theme: 'factory', lines: [
    { who: 'chief', text: '(Funk) Der Reaktor erreicht in einer halben Stunde kritische Masse! Ihr müsst Unrat stoppen. Ich besorge schon mal Käsebrötchen für danach.' },
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

class StoryScene extends Phaser.Scene {
  constructor() { super('Story'); }
  init(data) { this.data_ = data; }
  create() {
    const d = this.data_;
    const sc = STORY[d.id];
    this.lines = sc.lines;
    this.i = 0;
    this.nav = new MenuNav(this);
    Sfx.music('menu');
    const th = THEMES[sc.theme];

    // Hintergrund im Comic-Stil
    this.add.image(0, 0, 'bgfar_' + sc.theme).setOrigin(0);
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.25); g.fillRect(0, 0, W, H);
    g.fillStyle(0xffffff, 0.08);
    for (let y = 0; y < H; y += 28) for (let x = (y / 28) % 2 ? 14 : 0; x < W; x += 28) g.fillCircle(x, y, 6);
    g.lineStyle(10, OUT, 1); g.strokeRect(14, 14, W - 28, H - 28);

    this.slots = { left: null, right: null };
    this.portL = this.add.image(280, 520, 'pt_knox').setVisible(false);
    this.portR = this.add.image(1000, 520, 'pt_chief').setVisible(false).setFlipX(true);

    // Sprechblase
    this.bubble = this.add.graphics();
    this.tag = this.add.text(0, 0, '', { fontFamily: FONT, fontSize: '28px', fontStyle: 'bold', color: '#fff', stroke: '#16101f', strokeThickness: 7 });
    this.txt = this.add.text(190, 70, '', { fontFamily: FONT, fontSize: '32px', color: '#16101f', wordWrap: { width: 840 }, lineSpacing: 8 });
    this.hint = this.add.text(W - 40, H - 36, '▶ weiter', { fontFamily: FONT, fontSize: '24px', color: '#ffffff', stroke: '#16101f', strokeThickness: 5 }).setOrigin(1, 1);
    this.tweens.add({ targets: this.hint, alpha: 0.3, yoyo: true, repeat: -1, duration: 500 });
    this.add.text(40, H - 36, 'Start/Esc: überspringen', { fontFamily: FONT, fontSize: '20px', color: '#ffffffaa', stroke: '#16101f', strokeThickness: 4 }).setOrigin(0, 1);
    this.show();
  }
  show() {
    const ln = this.lines[this.i], who = WHO[ln.who];
    this.full = ln.text; this.shown = 0; this.typing = true;
    if (who.hero) { this.slots.left = ln.who; } else { this.slots.right = ln.who; }
    const setP = (img, key, active) => {
      if (!key) { img.setVisible(false); return; }
      img.setVisible(true).setTexture(WHO[key].tex);
      img.setAlpha(active ? 1 : 0.55).setScale(active ? 1.05 : 0.85).setTint(active ? 0xffffff : 0x9a9aa8);
      img.y = active ? 505 : 540;
    };
    setP(this.portL, this.slots.left, this.slots.left === ln.who);
    setP(this.portR, this.slots.right, this.slots.right === ln.who);
    // Bubble zeichnen
    const g = this.bubble; g.clear();
    const bx = 150, by = 40, bw = 980, bh = 200;
    g.fillStyle(0x16101f, 0.3); g.fillRoundedRect(bx + 8, by + 10, bw, bh, 30);
    g.fillStyle(0xffffff, 1); g.fillRoundedRect(bx, by, bw, bh, 30);
    g.lineStyle(7, OUT, 1); g.strokeRoundedRect(bx, by, bw, bh, 30);
    const tx = who.hero ? 300 : 980;
    g.fillStyle(0xffffff, 1); g.fillTriangle(tx - 30, by + bh - 4, tx + 30, by + bh - 4, tx + (who.hero ? -20 : 20), by + bh + 60);
    g.lineStyle(7, OUT, 1); g.beginPath(); g.moveTo(tx - 30, by + bh); g.lineTo(tx + (who.hero ? -20 : 20), by + bh + 60); g.lineTo(tx + 30, by + bh); g.strokePath();
    g.fillStyle(0xffffff, 1); g.fillRect(tx - 28, by + bh - 8, 56, 12);
    this.tag.setText(who.name).setColor(who.color).setPosition(bx + 30, by - 20);
    this.txt.setText('').setPosition(bx + 36, by + 36);
  }
  update(t, dt) {
    const n = this.nav.poll();
    if (this.typing) {
      this.shown += dt * 0.045;
      const s = Math.floor(this.shown);
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
  }
  done() {
    const nx = this.data_.next;
    this.scene.start(nx.scene, nx.data);
  }
}
