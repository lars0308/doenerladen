const FONT = '"Lilita One", "Comic Sans MS", "Trebuchet MS", Verdana, sans-serif';
// Spieler-Einstellungen (Namen & Farben), werden im Browser gespeichert.
const Cfg = {
  players: [{ name: 'Spieler 1', color: 'blue' }, { name: 'Spieler 2', color: 'green' }],
  mode: 'normal', prog: { next: 0, stars: {}, coins: 0 },
  load() {
    try { const d = JSON.parse(localStorage.getItem('muellalarm_cfg') || 'null'); if (d && d.players && d.players.length === 2) this.players = d.players; if (d && d.mode) this.mode = d.mode; if (d && d.prog) this.prog = Object.assign({ next: 0, stars: {}, coins: 0 }, d.prog); } catch (e) { /* ignorieren */ }
  },
  save() { try { localStorage.setItem('muellalarm_cfg', JSON.stringify({ players: this.players, mode: this.mode, prog: this.prog })); } catch (e) { /* ignorieren */ } },
  // Spielstand: Level geschafft -> merken (Sterne, nächstes Level)
  record(lv, stars, coins) {
    const p = this.prog, def = LEVELS[lv]; if (!def || def.mini) return;
    p.stars[lv] = Math.max(p.stars[lv] || 0, stars); p.coins = (p.coins || 0) + (coins || 0);
    if (!def.bonus) p.next = Math.max(p.next || 0, lv + 1);
    this.save();
  },
};
Cfg.load();
