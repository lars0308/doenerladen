// Level-Karten in schräger Draufsicht. Alle Maße in Kacheln (48px).
// floor(x,y,w,h) Boden · pit(...) Abgrund · wall(...) Mauerklotz · Objekte siehe level.js
const LEVELS = [
  // ───────────────────────── 1: Hinterhof ─────────────────────────
  {
    name: 'Hinterhof-Chaos', theme: 'alley', size: [131, 24], start: [4, 14], arena: [104, 6], entry: [13, 4], boss: 'can', music: 'alley',
    story: { pre: 'intro', post: 'post0' },
    build(s) {
      // Start-Hof
      s.floor(2, 8, 16, 13); s.floor(18, 13, 8, 4);
      s.sign(3, 12, 'A: Hopsen  •  B: Saugen (halten)\nX: Schießen\nGezielt wird in Laufrichtung');
      s.trash(6, 16); s.trash(8, 16); s.trash(10, 16); s.coins(5, 10, 6);
      s.enemy('walker', 13, 12);
      s.sign(15, 18, 'Auf Gegner hopsen\noder Müll auf sie schießen!');
      s.checkpoint(16, 14);
      // Hof 2: Graben zum Überhopsen
      s.floor(26, 6, 18, 17); s.pit(33, 6, 2, 17);
      s.sign(28, 12, 'Ein Graben! A = hopsen.');
      s.coins(31, 14, 5);
      s.enemy('walker', 29, 18); s.enemy('flyer', 40, 10); s.enemy('armor', 38, 18);
      s.trash(28, 8); s.trash(41, 20); s.crates(40, 7, 2, 2, true);
      // Kisten-Gang
      s.floor(44, 13, 10, 4);
      s.sign(46, 14, 'Kisten im Weg?\nSchieß sie kaputt!');
      s.trash(45, 13); s.trash(45, 16); s.crates(49, 13, 1, 4);
      // Rätsel 1: roter Schalter -> Tor
      s.floor(54, 8, 14, 13); s.floor(58, 5, 4, 3);
      s.sign(56, 18, 'Roter Schalter da hinten!\nStell dich davor, X = schießen.');
      s.trash(55, 10); s.trash(56, 10); s.target('r1', 59, 5, 'red', 0);
      s.enemy('walker', 56, 16); s.enemy('walker', 64, 12);
      s.floor(68, 13, 8, 4); s.gate('r1', 68, 13, 1, 4, 'red');
      s.checkpoint(72, 14);
      // Rätsel 2: Partner über den Abgrund werfen -> Platte -> Brücke
      s.floor(76, 6, 22, 17); s.pit(84, 6, 7, 17);
      s.sign(78, 14, 'Zu weit! Partner einsaugen (B), zielen,\nX = rüberwerfen. Grün = sicher.\nDann auf die Platte stellen!');
      s.trash(78, 10); s.trash(78, 18); s.trash(80, 20);
      s.enemy('walker', 79, 9); s.enemy('armor', 81, 18);
      s.plate('g', 94, 14, 'green'); s.bridge('g', 84, 13, 7, 4, 'green');
      s.enemy('charger', 95, 9); s.enemy('flyer', 93, 18); s.crates(96, 19, 1, 2, true);
      s.coins(92, 9, 4, 0, 1);
      s.floor(98, 13, 6, 4); s.checkpoint(100, 14);
      // Boss-Arena
      s.floor(104, 6, 26, 15);
      s.wall(109, 9, 2, 2); s.wall(122, 9, 2, 2); s.wall(109, 15, 2, 2); s.wall(122, 15, 2, 2);
      s.boss('can');
    },
  },
  // ───────────────────────── 2: Kanalisation ─────────────────────────
  {
    name: 'Unter der Stadt', theme: 'sewer', size: [127, 24], start: [4, 14], arena: [100, 5], entry: [13, 4], boss: 'slime', music: 'sewer',
    story: { pre: 'pre1', post: 'post1' },
    build(s) {
      s.floor(2, 9, 14, 12); s.floor(16, 13, 6, 4);
      s.sign(3, 12, 'Giftschleim! Nicht reinfallen.\nPlattformen bewegen sich.');
      s.trash(5, 17); s.trash(7, 17); s.enemy('walker', 11, 12); s.coins(4, 10, 5);
      // Plattform-See
      s.floor(22, 5, 22, 18); s.pit(24, 5, 18, 18); s.floor(32, 12, 4, 6);
      s.mover(24, 13, 3, 4, 5, 0, 6); s.mover(36, 13, 3, 4, 4, 0, 6);
      s.enemy('flyer', 30, 8); s.enemy('flyer', 34, 19); s.coins(33, 13, 2, 1, 1);
      s.checkpoint(42, 14);
      s.floor(44, 13, 6, 4);
      // Zwei Platten + Wurf
      s.floor(50, 6, 16, 16); s.pit(50, 9, 16, 4); s.floor(66, 13, 6, 4);
      s.sign(52, 14, 'Platte unten + Platte oben:\nEine/r wirft den Partner über\nden Schleim!');
      s.plate('p', 56, 17, 'blue'); s.plate('p', 57, 7, 'blue');
      s.bridge('p', 56, 9, 3, 4, 'blue'); s.gate('p', 66, 13, 1, 4, 'blue');
      s.trash(51, 14); s.trash(52, 18); s.trash(63, 15);
      s.enemy('walker', 52, 16); s.enemy('charger', 62, 19); s.enemy('flyer', 58, 10);
      // Stachel-Zickzack
      s.floor(72, 8, 20, 13); s.checkpoint(73, 14);
      s.spikes(78, 8, 2, 6); s.spikes(84, 15, 2, 6);
      s.enemy('charger', 80, 18); s.enemy('charger', 86, 11); s.enemy('turret', 90, 9); s.enemy('turret', 90, 19);
      s.trash(76, 18); s.trash(82, 10); s.trash(88, 14); s.coins(75, 10, 4);
      s.crates(75, 12, 1, 3, true);
      s.floor(92, 13, 8, 4); s.checkpoint(96, 14);
      s.floor(100, 5, 26, 15);
      s.wall(105, 8, 2, 2); s.wall(118, 8, 2, 2); s.wall(105, 13, 2, 2); s.wall(118, 13, 2, 2);
      s.boss('slime');
    },
  },
  // ───────────────────────── 3: Schrottplatz ─────────────────────────
  {
    name: 'Schrottplatz Süd', theme: 'junk', size: [129, 24], start: [4, 14], arena: [102, 5], entry: [13, 4], boss: 'digger', music: 'junk',
    story: { pre: 'pre2', post: 'post2' },
    build(s) {
      s.floor(2, 9, 16, 12);
      s.sign(3, 12, 'Der Schrottplatz.\nAchtung: Pressen!');
      s.crates(10, 10, 3, 2, true); s.trash(6, 17); s.trash(8, 17);
      s.enemy('walker', 13, 13); s.enemy('armor', 15, 18); s.coins(4, 10, 5);
      // Pressen-Gang: warten, bis die Presse oben ist – dann durch!
      s.floor(18, 13, 28, 4); s.checkpoint(19, 14);
      s.sign(20, 14, 'Pressen! Rotes Feld = gleich\nkracht es. Dann schnell durch.');
      for (const [x, o] of [[24, 0], [30, 1.1], [36, 2.2], [41, 0.6]]) { s.crusher(x, 13, 3.4, o); s.crusher(x, 15, 3.4, o); }
      s.coins(27, 14, 2); s.coins(33, 14, 2); s.trash(22, 13); s.trash(44, 16);
      // Förderband-Halle mit Zeitschalter
      s.floor(46, 6, 18, 17); s.conveyor(46, 12, 18, 6, -1, 100);
      s.sign(47, 10, 'Gelber Schalter: Tor öffnet\nnur kurz! Schnell hinterher!');
      s.target('c', 58, 6, 'yellow', 7);
      s.enemy('flyer', 52, 9); s.enemy('walker', 58, 19); s.enemy('armor', 54, 20); s.enemy('charger', 50, 8);
      s.trash(48, 9); s.trash(49, 9); s.trash(50, 20);
      s.floor(64, 13, 10, 4); s.gate('c', 64, 13, 1, 4, 'yellow');
      s.checkpoint(66, 14);
      s.sign(67, 14, 'Kisten-Wall! Schieß sie weg.');
      s.trash(66, 13); s.trash(66, 16); s.crates(70, 13, 2, 4);
      // Schrottkluft mit beweglicher Plattform
      s.floor(74, 5, 22, 18); s.pit(82, 5, 6, 18); s.mover(82, 13, 3, 4, 3, 0, 5);
      s.sign(76, 14, 'Die Plattform bringt euch rüber –\noder werft euch einfach!');
      s.checkpoint(77, 12);
      s.enemy('walker', 78, 10); s.enemy('armor', 78, 18); s.enemy('flyer', 90, 10); s.enemy('charger', 92, 18);
      s.enemy('turret', 94, 8); s.enemy('turret', 94, 20); s.trash(79, 14); s.trash(90, 14); s.coins(90, 12, 4, 0, 1);
      s.floor(96, 13, 6, 4); s.checkpoint(98, 14);
      s.floor(102, 5, 26, 15);
      s.wall(107, 8, 2, 2); s.wall(120, 8, 2, 2); s.wall(107, 14, 2, 2); s.wall(120, 14, 2, 2);
      s.boss('digger');
    },
  },
  // ───────────────────────── 4: Unrat-Fabrik ─────────────────────────
  {
    name: 'Die Unrat-Fabrik', theme: 'factory', size: [143, 24], start: [4, 14], arena: [116, 5], entry: [13, 4], boss: 'mech', music: 'factory',
    story: { pre: 'pre3', post: 'outro' },
    build(s) {
      s.floor(2, 9, 14, 12);
      s.sign(3, 12, 'Laser! Timing ist alles.');
      s.trash(5, 17); s.trash(7, 17); s.enemy('walker', 10, 13);
      // Laser-Gang
      s.floor(16, 13, 26, 4); s.checkpoint(18, 14);
      s.laser(22, 13, 4, 'v', 2.6, 0); s.laser(28, 13, 4, 'v', 2.6, 1.3); s.laser(34, 13, 4, 'v', 2.6, 0.6);
      s.coins(25, 14, 2); s.coins(31, 14, 2);
      // Lava + Plattform
      s.floor(42, 6, 18, 17); s.pit(48, 6, 4, 17); s.mover(48, 13, 3, 4, 1, 0, 3);
      s.enemy('turret', 45, 8); s.enemy('turret', 45, 20); s.enemy('charger', 55, 18); s.enemy('armor', 56, 10); s.enemy('flyer', 54, 14);
      s.trash(44, 14); s.trash(53, 16);
      s.floor(60, 13, 6, 4); s.checkpoint(62, 14);
      // Doppelschalter
      s.floor(66, 6, 18, 17);
      s.sign(68, 14, 'Beide Schalter gleichzeitig an!\nJede/r zielt auf einen.');
      s.target('d', 72, 7, 'red', 9); s.target('d', 78, 7, 'blue', 9);
      s.enemy('turret', 68, 19); s.enemy('turret', 80, 19); s.enemy('flyer', 75, 12);
      s.trash(70, 18); s.trash(72, 18); s.trash(76, 18);
      s.floor(84, 13, 8, 4); s.gate('d', 84, 13, 1, 4, 'red');
      // Lasermauer, die man abschalten muss
      s.sign(86, 14, 'Lasermauer! Gelben Schalter\ntreffen, dann durch.');
      s.target('k', 86, 13, 'yellow', 8); s.laser(90, 13, 4, 'v', 0, 0, 'k');
      s.checkpoint(88, 15);
      // Lavagrube: werfen -> Platte -> Brücke
      s.floor(92, 5, 18, 18); s.pit(98, 5, 7, 18);
      s.sign(94, 14, 'Noch ein Abgrund!\nPartner rüberwerfen, Platte drücken.');
      s.plate('f', 107, 14, 'pink'); s.bridge('f', 98, 13, 7, 4, 'pink');
      s.enemy('charger', 94, 9); s.enemy('armor', 94, 19); s.enemy('turret', 108, 8); s.enemy('flyer', 106, 18);
      s.trash(93, 10); s.trash(93, 18); s.trash(94, 14); s.coins(106, 9, 4, 0, 1);
      s.floor(110, 13, 6, 4); s.checkpoint(112, 14);
      s.floor(116, 5, 26, 15);
      s.wall(121, 9, 2, 2); s.wall(134, 9, 2, 2); s.wall(121, 14, 2, 2); s.wall(134, 14, 2, 2);
      s.target('c1', 119, 7, 'red', 7); s.target('c2', 138, 7, 'blue', 7);
      s.boss('mech');
    },
  },
];
