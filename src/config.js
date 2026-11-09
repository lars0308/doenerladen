const FONT = '"Lilita One", "Comic Sans MS", "Trebuchet MS", Verdana, sans-serif';
// Spieler-Einstellungen (Namen & Farben), werden im Browser gespeichert.
const Cfg = {
  players: [{ name: 'Spieler 1', color: 'blue' }, { name: 'Spieler 2', color: 'green' }],
  load() {
    try { const d = JSON.parse(localStorage.getItem('muellalarm_cfg') || 'null'); if (d && d.players && d.players.length === 2) this.players = d.players; } catch (e) { /* ignorieren */ }
  },
  save() { try { localStorage.setItem('muellalarm_cfg', JSON.stringify({ players: this.players })); } catch (e) { /* ignorieren */ } },
};
Cfg.load();
