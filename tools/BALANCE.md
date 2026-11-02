# Balance-Messung (Bot, Stand 2. November 2026)

**Messung:** 10 Läufe je Klasse, Stufe Normal, bis Etage 30, fair spielender Bot (`tools/balance.js`, Version 2).
Der Bot ist ein einfacher Spieler: Er nutzt Klassenfähigkeiten, meidet Gefahrenfelder und sammelt Verstärkungen und Händlerware, plant aber keine Boss-Taktik. Die Zahlen sind Vergleichswerte zwischen den Klassen, kein Maß für menschliche Spieler.

| Klasse | Läufe | Etage Ø | Median | Max | Gestorben | Tod vor Etage 10 | Bis Grenze oder festhängend |
|---|---|---|---|---|---|---|---|
| krieger | 10 | 8.0 | 8 | 15 | 10 | 8 | 0 |
| zauberer | 10 | 10.1 | 8 | 23 | 8 | 5 | 2 |
| jaeger | 10 | 9.8 | 8 | 20 | 10 | 6 | 0 |
| schatz | 10 | 23.0 | 23 | 31 | 3 | 0 | 7 |
| dieb | 10 | 8.6 | 8 | 20 | 10 | 6 | 0 |
| waechter | 10 | 23.1 | 26 | 31 | 0 | 0 | 10 |
| alchemist | 10 | 9.4 | 6 | 28 | 10 | 7 | 0 |

## Befunde
- **Wächter:** 0 von 10 Läufen gestorben, alle bis Etage 28 bis 31. Das ist mit Abstand die stärkste Klasse im Bot. Acht Läufe blieben durch Warten-Taktik auf einer Etage hängen, weil nichts ihn mehr gefährdete.
- **Schatzjäger:** 7 von 10 bis zur Grenze, Ø 23. Der Münzwurf (146 Einsätze pro Lauf im Mittel) trägt ihn.
- **Krieger, Zauberer, Jäger, Dieb, Alchemist:** Ø 8 bis 10, die meisten sterben vor Etage 10 (5 bis 8 von 10). Der Krieger (Standardklasse) ist am schwächsten.
- **Schaden pro Etage:** steigt von 2,0 (Etagen 1 bis 5) über 2,9 (11 bis 15) auf 4,7 (16 bis 20). Das passt zur Absicht, die Probenzahl bei Etage 21+ ist aber zu klein.

## Mögliche Anpassungen (noch nicht umgesetzt)
- Wächter: Block-Aufbau durch Warten begrenzen oder Schildstoß-Wartezeit von 3 auf 4 Züge.
- Schatzjäger: Münzwurf teurer (10 statt 8 Münzen) oder weniger Schaden bei vollem Beutel.
- Frühe Etagen für die Standardklasse etwas leichter (Etage 1 bis 9), besonders der erste Boss.

Vor jeder Änderung sollten echte Läufe auf dem Handy die Bot-Zahlen bestätigen.


## Vergleich zweier Bot-Stile (2. November 2026, 8 Läufe je Klasse, bis Etage 20, gleicher Startwert)
`basic` = einfacher Bot, `smart` = wägt jeden Zug nach Risiko und Nutzen ab (Gefahrenfelder, Schadensfenster langsamer Gegner, Kill-Chancen).

| Klasse | Etage Ø basic | Etage Ø smart | Tod vor 10 (basic / smart) |
|---|---|---|---|
| Wächter | 18,5 | 15,8 | 0 / 0 |
| Schatzjäger | 18,0 | 18,1 | 0 / 0 |
| Zauberer | 13,3 | 11,8 | 2 / 2 |
| Alchemist | 10,6 | 12,9 | 4 / 3 |
| Krieger | 7,4 | 6,6 | 5 / 6 |
| Dieb | 6,9 | 10,9 | 5 / 1 |
| Jäger | 5,6 | 9,5 | 7 / 4 |

Hängende Läufe: basic 6 von 56, smart 17 von 56 (der smart-Bot pendelt öfter zwischen Ausweichen und Ziel).

**Was daraus folgt:**
- **Beide Bots ordnen die Klassen gleich oben und unten:** Wächter und Schatzjäger vorne, Krieger hinten. Das macht die Rangfolge glaubwürdiger als eine einzelne Messung.
- **Dieb und Jäger** schneiden mit dem klügeren Bot deutlich besser ab. Ihre Schwäche im ersten Lauf lag also teils am Bot, nicht an der Klasse.
- **Der Krieger** bleibt auch mit dem klügeren Bot am schwächsten, hier wirkt der Bot nicht als Ursache.
- **Der Wächter** stirbt mit dem klügeren Bot gelegentlich, bleibt aber auf Augenhöhe mit dem Schatzjäger an der Spitze.
- Die Stichprobe ist klein (8 Läufe). Unterschiede unter etwa 2 Etagen sind Rauschen.
