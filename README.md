# Knox & Zippy – Müllalarm!

Ein lustiges Zwei-Spieler-Abenteuer in **3D mit Kamera schräg von oben** (Mario-Odyssey-Feeling), für Eltern und Kind
oder Paare. Auf dem Laptop am Fernseher mit **zwei Controllern** (oder Tastatur).

## Starten
`index.html` im Browser öffnen (Chrome/Edge/Firefox) – fertig, kein Server und keine Installation nötig.
Vollbild: **F11**. Ton an/aus im Menü mit **M**.

## Steuerung
| | Controller | Spieler 1 (Tastatur) | Spieler 2 (Tastatur) |
|---|---|---|---|
| Laufen / Zielen | Stick / Steuerkreuz | WASD | Pfeiltasten |
| Hopsen (über Gräben, auf Gegner) | A | Leertaste | Enter |
| Saugen (halten) | B / LT / LB | G | , |
| Schießen | X / RT / RB | F | . |
| Pause | Start | Esc | Esc |

* **Saugen** holt Müll in der Nähe als Munition und – nah davor – auch den Partner (er steckt dann im Bauch).
* **Schießen** feuert Müll in Blickrichtung: auf Gegner, Kisten und Zielscheiben. Mit dem Partner im Bauch wird er **geworfen** –
  über Abgründe! Ein Ring zeigt die Landung (grün = sicher, rot = Absturz).
* Ihr hängt an einer **Kette** und könnt euch nicht beliebig weit voneinander entfernen.
* **Kinder-Modus:** keine Herzverluste, langsamere Gegner, schwächere Bosse, mehr Zeit bei Schaltern, Munition lädt sich nach.

## Inhalt
4 Welten (Hinterhof, Kanalisation, Schrottplatz, Unrat-Fabrik) mit je einem Endgegner, Rätseln, Gegnern und Story-Szenen.

## Technik & Credits
Three.js (3D) + Phaser (Menüs/HUD/Spiellogik). Siehe [CREDITS.md](CREDITS.md). Modelle: Kenney.
`tools/build_assets.py` bettet die Modelle in `src/assets.js` ein (nur nötig, wenn Assets ausgetauscht werden).
