// Level-Karten in schräger Draufsicht. Alle Maße in Kacheln (48px).
// floor/pit/wall/ice · Objekte: coin(s), trash, crate(s), enemy, target, plate, gate, bridge, mover, spikes, crusher, laser, conveyor, spring, spawner, checkpoint, sign, boss
const LEVELS = [
  // ───────────────────────── 1: Hinterhof ─────────────────────────
  {
    name: 'Hinterhof-Chaos', theme: 'alley', shift: 40, size: [131, 24], start: [4, 14], arena: [104, 6], entry: [13, 4], boss: 'can', music: 'alley',
    story: { pre: 'intro', post: 'post0' },
    build(s) {
      s.floor(2, 8, 16, 13); s.floor(18, 13, 8, 4);
      s.sign(3, 12, 'A: Hopsen  •  B: Saugen (halten)\nX: Schießen\nGezielt wird in Laufrichtung');
      s.trash(6, 16); s.trash(8, 16); s.trash(10, 16); s.coins(5, 10, 6);
      s.enemy('walker', 13, 12);
      s.sign(15, 18, 'Auf Gegner hopsen\noder Müll auf sie schießen!');
      s.checkpoint(16, 14);
      s.floor(26, 6, 18, 17); s.pit(33, 6, 2, 17);
      s.sign(28, 12, 'Ein Graben! A = hopsen.');
      s.coins(31, 14, 5);
      s.enemy('walker', 29, 18); s.enemy('flyer', 40, 10); s.enemy('armor', 38, 18); s.enemy('jumper', 30, 9);
      s.trash(28, 8); s.trash(41, 20); s.crates(40, 7, 2, 2, true);
      s.floor(44, 13, 10, 4);
      s.sign(46, 14, 'Kisten im Weg?\nSchieß sie kaputt!');
      s.trash(45, 13); s.trash(45, 16); s.crates(49, 13, 1, 4);
      s.floor(54, 8, 14, 13); s.floor(58, 5, 4, 3);
      s.sign(56, 18, 'Roter Schalter da hinten!\nStell dich davor, X = schießen.');
      s.trash(55, 10); s.trash(56, 10); s.target('r1', 59, 5, 'red', 0);
      s.enemy('walker', 56, 16); s.enemy('walker', 64, 12);
      s.floor(68, 13, 8, 4); s.gate('r1', 68, 13, 1, 4, 'red');
      s.checkpoint(72, 14);
      // Große offene Fläche mit Hindernissen, Plateau (nur per Trampolin erreichbar) und viel Müll
      s.field(76, 4, 40, 20, { enemies: [['walker',5],['flyer',3],['armor',2],['charger',2],['jumper',3],['kamikaze',2]], coins: 8, avoid: [[87, 6, 21, 12], [105, 13, 9, 11]] });
      s.plateau(92, 9, 10, 8, 2.2); s.coins(94, 11, 6); s.food(97, 12, 'cake'); s.checkpoint(78, 14);
      s.plateau(106, 15, 7, 7, 1.6); s.coins(107, 18, 4); s.food(109, 18, 'burger');
      s.ox = 40;
      s.floor(76, 6, 22, 17); s.pit(84, 6, 7, 17);
      s.sign(78, 14, 'Zu weit! Partner einsaugen (B), zielen,\nX = rüberwerfen. Grün = sicher.\nDann auf die Platte stellen!');
      s.trash(78, 10); s.trash(78, 18); s.trash(80, 20);
      s.enemy('walker', 79, 9); s.enemy('armor', 81, 18);
      s.plate('g', 94, 14, 'green'); s.bridge('g', 84, 13, 7, 4, 'green');
      s.enemy('charger', 95, 9); s.enemy('flyer', 93, 18); s.crates(96, 19, 1, 2, true);
      s.coins(92, 9, 4, 0, 1);
      s.floor(98, 13, 6, 4); s.checkpoint(100, 14);
      s.floor(104, 6, 26, 15);
      s.wall(109, 9, 2, 2); s.wall(122, 9, 2, 2); s.wall(109, 15, 2, 2); s.wall(122, 15, 2, 2);
      s.boss('can');
    },
  },
  // ───────────────────────── 2: Kanalisation ─────────────────────────
  {
    name: 'Unter der Stadt', theme: 'sewer', shift: 40, size: [127, 24], start: [4, 14], arena: [100, 5], entry: [13, 4], boss: 'slime', music: 'sewer',
    story: { pre: 'pre1', post: 'post1' },
    build(s) {
      s.floor(2, 9, 14, 12); s.floor(16, 13, 6, 4);
      s.sign(3, 12, 'Giftschleim! Nicht reinfallen.\nPlattformen bewegen sich.');
      s.trash(5, 17); s.trash(7, 17); s.enemy('walker', 11, 12); s.coins(4, 10, 5);
      s.floor(22, 5, 22, 18); s.pit(24, 5, 18, 18); s.floor(32, 12, 4, 6);
      s.mover(24, 13, 3, 4, 5, 0, 6); s.mover(36, 13, 3, 4, 4, 0, 6);
      s.enemy('flyer', 30, 8); s.enemy('flyer', 34, 19); s.coins(33, 13, 2, 1, 1);
      s.checkpoint(42, 14);
      s.floor(44, 13, 6, 4);
      s.floor(50, 6, 16, 16); s.pit(50, 9, 16, 4); s.floor(66, 13, 6, 4);
      s.sign(52, 14, 'Platte unten + Platte oben:\nEine/r wirft den Partner über\nden Schleim!');
      s.plate('p', 56, 17, 'blue'); s.plate('p', 57, 7, 'blue');
      s.bridge('p', 56, 9, 3, 4, 'blue'); s.gate('p', 66, 13, 1, 4, 'blue');
      s.trash(51, 14); s.trash(52, 18); s.trash(63, 15);
      s.enemy('walker', 52, 16); s.enemy('charger', 62, 19); s.enemy('flyer', 58, 10);
      s.floor(72, 8, 20, 13); s.checkpoint(73, 14);
      s.spikes(78, 8, 2, 6); s.spikes(84, 15, 2, 6);
      s.enemy('charger', 80, 18); s.enemy('archer', 86, 11); s.enemy('turret', 90, 9); s.enemy('archer', 90, 19); s.enemy('sawer', 82, 11, { axis: 'v' }); s.enemy('kamikaze', 76, 12);
      s.trash(76, 18); s.trash(82, 10); s.trash(88, 14); s.coins(75, 10, 4);
      s.crates(75, 12, 1, 3, true);

      // Große offene Fläche mit Hindernissen, Plateau (nur per Trampolin erreichbar) und viel Müll
      s.field(92, 4, 40, 20, { enemies: [['walker',4],['archer',3],['flyer',3],['charger',2],['sawer',3],['kamikaze',3],['jumper',2]], coins: 8, avoid: [[103, 6, 21, 12], [121, 13, 9, 11]] });
      s.plateau(108, 9, 10, 8, 2.2); s.coins(110, 11, 6); s.food(113, 12, 'cake'); s.checkpoint(94, 14);
      s.plateau(122, 15, 7, 7, 1.6); s.coins(123, 18, 4); s.food(125, 18, 'burger');
      s.ox = 40;
      s.floor(92, 13, 8, 4); s.checkpoint(96, 14);
      s.floor(100, 5, 26, 15);
      s.wall(105, 8, 2, 2); s.wall(118, 8, 2, 2); s.wall(105, 13, 2, 2); s.wall(118, 13, 2, 2);
      s.boss('slime');
    },
  },
  // ───────────────────────── 3: Schrottplatz ─────────────────────────
  {
    name: 'Schrottplatz Süd', theme: 'junk', shift: 40, size: [129, 24], start: [4, 14], arena: [102, 5], entry: [13, 4], boss: 'digger', music: 'junk',
    story: { pre: 'pre2', post: 'post2' },
    build(s) {
      s.floor(2, 9, 16, 12);
      s.sign(3, 12, 'Der Schrottplatz.\nAchtung: Pressen!');
      s.crates(10, 10, 3, 2, true); s.trash(6, 17); s.trash(8, 17);
      s.enemy('walker', 13, 13); s.enemy('armor', 15, 18); s.coins(4, 10, 5);
      s.floor(18, 13, 28, 4); s.checkpoint(19, 14);
      s.sign(20, 14, 'Pressen! Rotes Feld = gleich\nkracht es. Dann schnell durch.');
      for (const [x, o] of [[24, 0], [30, 1.1], [36, 2.2], [41, 0.6]]) { s.crusher(x, 13, 3.4, o); s.crusher(x, 15, 3.4, o); }
      s.coins(27, 14, 2); s.coins(33, 14, 2); s.trash(22, 13); s.trash(44, 16);
      s.floor(46, 6, 18, 17); s.conveyor(46, 12, 18, 6, -1, 100);
      s.sign(47, 10, 'Gelber Schalter: Tor öffnet\nnur kurz! Schnell hinterher!');
      s.target('c', 58, 6, 'yellow', 7);
      s.enemy('flyer', 52, 9); s.enemy('walker', 58, 19); s.enemy('armor', 54, 20); s.enemy('charger', 50, 8); s.enemy('sawer', 56, 14, { axis: 'h' });
      s.trash(48, 9); s.trash(49, 9); s.trash(50, 20);
      s.floor(64, 13, 10, 4); s.gate('c', 64, 13, 1, 4, 'yellow');
      s.checkpoint(66, 14);
      s.sign(67, 14, 'Kisten-Wall! Schieß sie weg.');
      s.trash(66, 13); s.trash(66, 16); s.crates(70, 13, 2, 4);
      s.floor(74, 5, 22, 18); s.pit(82, 5, 6, 18); s.mover(82, 13, 3, 4, 3, 0, 5);
      s.sign(76, 14, 'Die Plattform bringt euch rüber –\noder werft euch einfach!');
      s.checkpoint(77, 12);
      s.enemy('walker', 78, 10); s.enemy('armor', 78, 18); s.enemy('flyer', 90, 10); s.enemy('charger', 92, 18);
      s.enemy('archer', 94, 8); s.enemy('archer', 94, 20); s.trash(79, 14); s.trash(90, 14); s.coins(90, 12, 4, 0, 1);

      // Große offene Fläche mit Hindernissen, Plateau (nur per Trampolin erreichbar) und viel Müll
      s.field(96, 4, 40, 20, { enemies: [['walker',3],['armor',3],['archer',3],['charger',2],['flyer',3],['sawer',3],['kamikaze',3],['jumper',2]], coins: 8, avoid: [[107, 6, 21, 12], [125, 13, 9, 11]] });
      s.plateau(112, 9, 10, 8, 2.2); s.coins(114, 11, 6); s.food(117, 12, 'cake'); s.checkpoint(98, 14);
      s.plateau(126, 15, 7, 7, 1.6); s.coins(127, 18, 4); s.food(129, 18, 'burger');
      s.ox = 40;
      s.floor(96, 13, 6, 4); s.checkpoint(98, 14);
      s.floor(102, 5, 26, 15);
      s.wall(107, 8, 2, 2); s.wall(120, 8, 2, 2); s.wall(107, 14, 2, 2); s.wall(120, 14, 2, 2);
      s.boss('digger');
    },
  },
  // ───────────────────────── 4: Eis-Müllhalde (neu) ─────────────────────────
  {
    name: 'Eisige Müllhalde', theme: 'winter', shift: 40, size: [136, 24], start: [4, 14], arena: [109, 5], entry: [13, 4], boss: 'dragon', music: 'winter',
    story: { pre: 'pre3', post: 'post3' },
    build(s) {
      s.floor(2, 9, 16, 12); s.floor(18, 13, 10, 4);
      s.sign(3, 12, 'Brr! Auf dem Eis rutscht man.\nAuch Hopsen hilft beim Lenken!');
      s.trash(6, 17); s.trash(8, 17); s.coins(4, 10, 6); s.enemy('walker', 11, 13); s.enemy('walker', 14, 18);
      s.checkpoint(16, 14);
      // Eisfläche mit Stacheln und Bogenschützen
      s.floor(28, 6, 22, 17); s.ice(30, 7, 18, 15);
      s.sign(29, 14, 'Rutschig! Und Stacheln im Weg.\nBogenschützen zielen auf euch – hopst über die Pfeile!');
      s.spikes(37, 9, 2, 3); s.spikes(42, 17, 2, 3); s.spikes(33, 14, 1, 2);
      s.enemy('archer', 47, 8); s.enemy('archer', 47, 20); s.enemy('armor', 40, 13);
      s.trash(32, 8); s.trash(32, 19); s.trash(45, 13); s.coins(35, 16, 4);
      s.floor(50, 13, 10, 4); s.checkpoint(52, 14);
      // Federschlucht: Sprungfedern tragen euch über den Abgrund
      s.floor(60, 6, 24, 17); s.pit(66, 6, 9, 17);
      s.sign(62, 14, 'Sprungfeder! Lauf drauf zu –\nsie schleudert dich ganz weit.\nOder werft euch rüber.');
      for (let y = 11; y <= 18; y++) s.spring(64, y);
      s.target('d', 78, 7, 'red', 9); s.target('d', 81, 7, 'blue', 9);
      s.enemy('archer', 80, 11); s.enemy('archer', 80, 19); s.enemy('drake', 79, 14);
      s.trash(76, 9); s.trash(76, 19); s.trash(77, 14); s.coins(77, 11, 4, 0, 1);
      s.floor(84, 13, 8, 4); s.gate('d', 84, 13, 1, 4, 'red');
      s.sign(86, 14, 'Beide Schalter gleichzeitig an!\nJede/r zielt auf einen.');
      s.checkpoint(88, 15);
      // Eisbahn-Labyrinth
      s.floor(92, 6, 16, 17); s.ice(92, 6, 16, 17);
      s.wall(96, 9, 2, 4); s.wall(101, 13, 2, 4); s.wall(96, 17, 2, 4); s.wall(104, 8, 2, 3); s.wall(104, 18, 2, 3);
      s.enemy('archer', 100, 8); s.enemy('drake', 99, 19); s.enemy('charger', 94, 19); s.enemy('armor', 106, 12);
      s.trash(94, 8); s.trash(106, 20); s.trash(99, 12); s.crates(100, 19, 2, 2, true); s.coins(93, 7, 5);
      s.checkpoint(106, 15);
      // Große offene Fläche mit Hindernissen, Plateau (nur per Trampolin erreichbar) und viel Müll
      s.field(108, 4, 40, 20, { enemies: [['walker',3],['archer',4],['drake',2],['armor',2],['ghost',2],['jumper',3],['kamikaze',2]], coins: 8, avoid: [[119, 6, 21, 12], [137, 13, 9, 11]] });
      s.plateau(124, 9, 10, 8, 2.2); s.coins(126, 11, 6); s.food(129, 12, 'cake'); s.checkpoint(110, 14);
      s.plateau(138, 15, 7, 7, 1.6); s.coins(139, 18, 4); s.food(141, 18, 'burger');
      s.ox = 40;
      s.floor(108, 13, 1, 4);
      s.floor(109, 5, 26, 15);
      s.wall(114, 8, 2, 2); s.wall(127, 8, 2, 2); s.wall(114, 13, 2, 2); s.wall(127, 13, 2, 2);
      s.boss('dragon');
    },
  },
  // ───────────────────────── 5: Spuk-Friedhof (neu) ─────────────────────────
  {
    name: 'Spuk-Friedhof', theme: 'grave', shift: 40, size: [128, 24], start: [4, 14], arena: [101, 5], entry: [13, 4], boss: 'keeper', music: 'grave',
    story: { pre: 'pre4', post: 'post4' },
    build(s) {
      s.floor(2, 9, 16, 12); s.floor(18, 13, 8, 4);
      s.sign(3, 12, 'Aus den Gräbern kriechen Zombies!\nAm besten nicht stehen bleiben.');
      s.trash(6, 17); s.trash(8, 17); s.coins(4, 10, 6); s.enemy('walker', 11, 13);
      s.checkpoint(16, 14);
      // Gräberfeld: zwei Platten öffnen das Tor
      s.floor(26, 6, 22, 17);
      s.sign(28, 14, 'Zwei Platten öffnen das Tor:\neine unten links, eine oben rechts!\nDie Gräber spucken Zombies aus.');
      s.plate('a', 29, 20, 'yellow'); s.plate('a', 46, 8, 'yellow');
      s.spawner(35, 9, 'walker', 6, 2); s.spawner(40, 19, 'walker', 6, 2);
      s.enemy('flyer', 38, 13); s.enemy('archer', 44, 20); s.enemy('armor', 31, 8);
      s.trash(30, 8); s.trash(44, 19); s.trash(36, 15); s.coins(38, 11, 4, 0, 1); s.crates(33, 13, 1, 3, true);
      s.floor(48, 13, 10, 4); s.gate('a', 48, 13, 1, 4, 'yellow'); s.checkpoint(50, 14);
      // Stein-Gang mit Pressen
      s.floor(58, 13, 22, 4);
      s.sign(59, 14, 'Grabplatten fallen herab!\nWarte aufs rote Feld.');
      for (const [x, o] of [[62, 0], [68, 1.1], [74, 2.2]]) { s.crusher(x, 13, 3.4, o); s.crusher(x, 15, 3.4, o); }
      s.enemy('ghost', 65, 14); s.coins(65, 14, 2); s.coins(71, 14, 2); s.trash(60, 16); s.trash(78, 13);
      // Moor: Abgrund mit Wurf + Brücke
      s.floor(80, 6, 20, 17); s.pit(86, 6, 8, 17);
      s.sign(82, 14, 'Noch ein Abgrund!\nPartner rüberwerfen,\nPlatte drücken = Brücke.');
      s.plate('b', 97, 14, 'pink'); s.bridge('b', 86, 13, 8, 4, 'pink');
      s.trash(81, 10); s.trash(81, 18); s.trash(83, 14); s.enemy('walker', 82, 9); s.enemy('archer', 96, 9); s.enemy('archer', 96, 20);
      s.enemy('flyer', 90, 10); s.spawner(97, 17, 'walker', 7, 2); s.coins(96, 11, 3, 0, 1);
      s.checkpoint(98, 17);
      // Große offene Fläche mit Hindernissen, Plateau (nur per Trampolin erreichbar) und viel Müll
      s.field(100, 4, 40, 20, { enemies: [['archer',3],['flyer',3],['armor',2],['ghost',4],['kamikaze',3],['jumper',2]], coins: 8, avoid: [[111, 6, 21, 12], [129, 13, 9, 11]], spawners: 3 });
      s.plateau(116, 9, 10, 8, 2.2); s.coins(118, 11, 6); s.food(121, 12, 'cake'); s.checkpoint(102, 14);
      s.plateau(130, 15, 7, 7, 1.6); s.coins(131, 18, 4); s.food(133, 18, 'burger');
      s.ox = 40;
      s.floor(100, 13, 1, 4);
      s.floor(101, 5, 26, 15);
      s.wall(106, 8, 2, 2); s.wall(119, 8, 2, 2); s.wall(106, 13, 2, 2); s.wall(119, 13, 2, 2);
      s.boss('keeper');
    },
  },
  // ───────────────────────── 6: Unrat-Fabrik (Finale) ─────────────────────────
  {
    name: 'Die Unrat-Fabrik', theme: 'factory', shift: 40, size: [143, 24], start: [4, 14], arena: [116, 5], entry: [13, 4], boss: 'mech', music: 'factory',
    story: { pre: 'pre5', post: 'outro' },
    build(s) {
      s.floor(2, 9, 14, 12);
      s.sign(3, 12, 'Laser! Timing ist alles.');
      s.trash(5, 17); s.trash(7, 17); s.enemy('walker', 10, 13);
      s.floor(16, 13, 26, 4); s.checkpoint(18, 14);
      s.laser(22, 13, 4, 'v', 2.6, 0); s.laser(28, 13, 4, 'v', 2.6, 1.3); s.laser(34, 13, 4, 'v', 2.6, 0.6);
      s.coins(25, 14, 2); s.coins(31, 14, 2);
      s.floor(42, 6, 18, 17); s.pit(48, 6, 4, 17); s.mover(48, 13, 3, 4, 1, 0, 3);
      s.enemy('turret', 45, 8); s.enemy('archer', 45, 20); s.enemy('charger', 55, 18); s.enemy('armor', 56, 10); s.enemy('flyer', 54, 14);
      s.trash(44, 14); s.trash(53, 16);
      s.floor(60, 13, 6, 4); s.checkpoint(62, 14);
      s.floor(66, 6, 18, 17);
      s.sign(68, 14, 'Beide Schalter gleichzeitig an!\nJede/r zielt auf einen.');
      s.target('d', 72, 7, 'red', 9); s.target('d', 78, 7, 'blue', 9);
      s.enemy('turret', 68, 19); s.enemy('drake', 80, 19); s.enemy('flyer', 75, 12); s.enemy('sawer', 72, 14, { axis: 'v' });
      s.trash(70, 18); s.trash(72, 18); s.trash(76, 18);
      s.floor(84, 13, 8, 4); s.gate('d', 84, 13, 1, 4, 'red');
      s.sign(86, 14, 'Lasermauer! Gelben Schalter\ntreffen, dann durch.');
      s.target('k', 86, 13, 'yellow', 8); s.laser(90, 13, 4, 'v', 0, 0, 'k');
      s.checkpoint(88, 15);
      s.floor(92, 5, 18, 18); s.pit(98, 5, 7, 18);
      s.sign(94, 14, 'Noch ein Abgrund!\nPartner rüberwerfen, Platte drücken.');
      s.plate('f', 107, 14, 'pink'); s.bridge('f', 98, 13, 7, 4, 'pink');
      s.enemy('charger', 94, 9); s.enemy('armor', 94, 19); s.enemy('turret', 108, 8); s.enemy('flyer', 106, 18); s.enemy('archer', 108, 19);
      s.trash(93, 10); s.trash(93, 18); s.trash(94, 14); s.coins(106, 9, 4, 0, 1);

      // Große offene Fläche mit Hindernissen, Plateau (nur per Trampolin erreichbar) und viel Müll
      s.field(110, 4, 40, 20, { enemies: [['archer',3],['charger',3],['armor',2],['flyer',3],['drake',2],['sawer',4],['kamikaze',3],['jumper',2]], coins: 8, avoid: [[121, 6, 21, 12], [139, 13, 9, 11]] });
      s.plateau(126, 9, 10, 8, 2.2); s.coins(128, 11, 6); s.food(131, 12, 'cake'); s.checkpoint(112, 14);
      s.plateau(140, 15, 7, 7, 1.6); s.coins(141, 18, 4); s.food(143, 18, 'burger');
      s.ox = 40;
      s.floor(110, 13, 6, 4); s.checkpoint(112, 14);
      s.floor(116, 5, 26, 15);
      s.wall(121, 9, 2, 2); s.wall(134, 9, 2, 2); s.wall(121, 14, 2, 2); s.wall(134, 14, 2, 2);
      s.target('c1', 119, 7, 'red', 7); s.target('c2', 138, 7, 'blue', 7);
      s.boss('mech');
    },
  },
  // ───────────────────────── Bonus: Müllberg-Prüfung ─────────────────────────
  {
    name: 'Der große Müllberg', theme: 'junk', bonus: true, size: [84, 48], start: [5, 40], music: 'junk', quota: 100, litter: 170,
    build(s) {
      s.field(2, 2, 80, 44, { enemies: [['walker', 6], ['armor', 4], ['archer', 5], ['charger', 4], ['flyer', 5], ['kamikaze', 6], ['jumper', 4], ['sawer', 5], ['drake', 2]], spawners: 5, coins: 24, density: 0.7, avoid: [[68, 18, 14, 12], [12, 20, 22, 14]] });
      s.sign(6, 38, 'Müllberg-Prüfung! Sammelt 150 Müll,\ndann öffnet sich das Portal in der Mitte rechts.\nEs wird nicht beim ersten Mal klappen …');
      s.ice(6, 6, 16, 10); s.spikes(40, 22, 5, 2); s.spikes(26, 31, 2, 5); s.spikes(52, 38, 4, 2);
      s.laser(46, 10, 8, 'h', 2.6, 0); s.laser(46, 14, 8, 'h', 2.6, 1.3);
      s.conveyor(30, 38, 16, 3, 1, 110); s.conveyor(30, 41, 16, 3, -1, 110);
      s.crusher(56, 8, 3.4, 0); s.crusher(58, 8, 3.4, 1.1); s.crusher(60, 8, 3.4, 2.2);
      s.plateau(14, 22, 10, 8, 2.2); s.coins(16, 24, 6); s.food(19, 25, 'cake'); s.power(18, 28, 'wings');
      s.pit(60, 34, 10, 8); s.floor(63, 37, 4, 2); s.food(64, 37, 'burger'); s.coins(63, 38, 4); s.power(65, 37, 'ball');
      for (const [x, y] of [[7, 36], [9, 42], [12, 40], [14, 34], [40, 8], [76, 36]]) s.bin(x, y);
      s.checkpoint(8, 38); s.checkpoint(40, 24); s.checkpoint(70, 14);
      s.portal(74, 24);
    },
  },
  // ───────────────────────── Minispiele ─────────────────────────
  {
    mini: 'coins', name: 'Münzjagd', theme: 'alley', size: [34, 21], start: [16, 10], music: 'alley', camFixed: { x: 17, z: 10.8, h: 21, dz: 13 },
    build(s) {
      s.floor(2, 2, 30, 17);
      s.wall(8, 6, 2, 2); s.wall(24, 6, 2, 2); s.wall(8, 13, 2, 2); s.wall(24, 13, 2, 2); s.wall(15, 9, 4, 2);
      s.sign(16, 12, 'Sammelt Münzen!\nVorsicht vor den Bomben!');
    },
  },
  {
    mini: 'shoot', name: 'Schleim-Schießbude', theme: 'sewer', size: [34, 21], start: [16, 10], music: 'sewer', camFixed: { x: 17, z: 10.8, h: 21, dz: 13 },
    build(s) {
      s.floor(2, 2, 30, 17);
      s.wall(8, 6, 2, 2); s.wall(24, 6, 2, 2); s.wall(8, 13, 2, 2); s.wall(24, 13, 2, 2);
      s.sign(16, 12, 'Schleim-Monster!\nSchießen oder drauf hopsen.\nGoldene = 5 Punkte!');
    },
  },
  {
    mini: 'throw', name: 'Partner-Weitwurf', theme: 'winter', size: [40, 24], start: [5, 13], music: 'winter', camFixed: { x: 14, z: 13, h: 19, dz: 12 },
    build(s) {
      s.pit(2, 2, 36, 20);
      s.floor(2, 8, 9, 10);
      s.sign(5, 12, 'Saug deinen Partner ein\nund wirf ihn auf eine Insel!\nWeiter = mehr Punkte.');
      s.island(14, 11, 3, 4, 1);
      s.island(17, 5, 3, 3, 3); s.island(17, 18, 3, 3, 3);
      s.island(20, 12, 3, 3, 5);
      s.trash(3, 9); s.trash(3, 16);
    },
  },
];
const STORY_COUNT = LEVELS.filter(l => !l.mini && !l.bonus).length;
