# Müllalarm! – Zwei Saugroboter, ein Haufen Chaos

Ein lustiges **Zwei-Spieler-Abenteuer in 3D** (Kamera schräg von oben, Mario-Odyssey-Feeling) für Eltern und Kind
oder Paare. Auf dem Laptop am Fernseher mit **zwei Controllern** – oder an einer Tastatur.

## Starten
`index.html` im Browser öffnen (Chrome/Edge/Firefox) – kein Server und keine Installation nötig. Vollbild mit **F11**.

## Spielmodi
* **Abenteuer** – 6 Welten mit Story, Rätseln und je einem Endgegner: Hinterhof · Kanalisation · Schrottplatz · Eis-Müllhalde · Spuk-Friedhof · Unrat-Fabrik.
* **Minispiele** – Münzjagd, Schleim-Schießbude, Partner-Weitwurf (mit Sternen-Wertung).
* **Level wählen** – jede Welt einzeln spielen.
* **Spieler & Farben** – jede/r wählt eine von 5 Farben (Grün, Rot, Blau, Weiß, Lila) und einen Namen (Voreinstellung oder selbst tippen).
* **Kinder-Modus** – kein Herzverlust, langsamere Gegner, schwächere Bosse, mehr Zeit bei Schaltern, Munition lädt sich nach.

## Steuerung
| | Controller | Spieler 1 (Tastatur) | Spieler 2 (Tastatur) |
|---|---|---|---|
| Laufen / Zielen | Stick / Steuerkreuz | WASD | Pfeiltasten |
| Hopsen (über Gräben, auf Gegner) | A | Leertaste | Enter |
| Saugen (halten) | B / LT / LB | G | , |
| Schießen | X / RT / RB | F | . |
| Pause | Start | Esc | Esc |

* **Saugen** holt Müll als Munition – und, ganz nah davor, auch den Partner (er steckt dann im Bauch).
* **Schießen** feuert Müll in Blickrichtung. Mit dem Partner im Bauch wird er **geworfen** – über Abgründe! Ein Ring zeigt die Landung (grün = sicher).
* Ihr hängt an einer **Kette**. Zusammen löst ihr Schalter, Platten und Brücken.
* **Eis** ist rutschig, **Sprungfedern** schleudern euch weit, **Gräber** spucken Zombies aus. Gegner werfen Bomben, Pfeile und Feuerbälle – hopst drüber!

## Technik
Three.js (3D) + Phaser (Menüs, HUD, Spiellogik). Alle Modelle sind in `src/assets.js` eingebettet (`tools/build_assets.py` erzeugt die Datei aus `assets/packs`),
deshalb läuft das Spiel auch per Doppelklick. Credits & Lizenzen: [CREDITS.md](CREDITS.md).

## Neu in Phase 2
- **Springen**: senkrecht nach oben, in der Luft mit dem Stick lenkbar – auf Gegner springen = Stomp.
- **Saugen**: Müll, Münzen, Essen, Pflanzen/Kürbisse und kleine Gegner werden in die Düse gezogen, schrumpfen und verschwinden. Große Gegner verlieren beim Saugen Leben.
- **Kanister auf dem Rücken** (20 Teile, Kinder 24) dient als Munition; Saugen geht immer, überschüssiger Müll wird zu Münzen gepresst. Super-Schuss lädt sich durch Einsaugen auf.
- **Spielstand**: Level-Fortschritt und Sterne werden im Browser gespeichert (Menü: „Weiter: Level N“)., Tonnen, Essen heilt, Power-ups (Ball, Flügel, Magnet), K.O./Wiederbeleben, Plateaus mit Sprungfeldern, Bonuslevel „Der große Müllberg“.
- **Scheitern**: Wenn beide K.O. gehen, liegt der Müll seit dem letzten Checkpoint wieder da.
