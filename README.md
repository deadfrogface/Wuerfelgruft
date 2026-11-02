# Würfelgruft

Roguelike auf einem Würfel mit sechs Seiten. Du läufst auf der Außenfläche, kippst den Würfel, besiegst Gegner, löst Etagenziele und steigst 100 Etagen tief. Pixel-Art, Musik und Effekte kommen komplett aus dem Code.

## Inhalt
- 100 Etagen in 10 Zonen, Bosse, Terrain und sieben Etagenziele (Schlüssel, Schalter, Altar, Runen, Aufräumen, Elite, Überleben)
- 7 Klassen mit eigener aktiver Fähigkeit, Freischaltung über Etage oder Meisterrang
- Meta-Fortschritt: Meisterrang 1 bis 30, Titel, Skins, Kammer der Schätze, Gruftlager (zweistöckiges Haus mit Deko und laufendem Helden)
- Endgame nach dem Sieg über den Urwürfel: Abgrund (Endlos), Boss-Rush, Seelenschmiede, Zeitjagd, Wochenprüfung
- Events nach Gerätedatum (Halloween, Weihnachten, Vegas, Ostern, Valentinstag, Italien, Ungarn, Geburtstag) mit Minispielen
- Freiwillige Belohnungs-Werbung (AdMob) und zwei Käufe (Werbefrei, Unterstützer-Skin)

## Aufbau
| Pfad | Inhalt |
|---|---|
| `index.html` | das ganze Spiel in einer Datei (Logik, Grafik, Audio) |
| `package.json`, `capacitor.config.json` | Capacitor-Android-Hülle |
| `.github/workflows/android.yml` | baut bei Push auf `main` zwei Varianten: **store** (AAB und APK) und **dev** (eigenes Paket `com.wuerfelgruft.dev`, Release `dev-latest`) |
| `.github/workflows/tests.yml` | startet bei Pull Requests den Regressionstest |
| `tools/` | Test- und Hilfsskripte (siehe unten) |
| `store/` | Store-Texte (DE/EN), Screenshots, Grafiken, Anleitung |
| `docs/` | Datenschutzerklärung (GitHub Pages) |
| `brand.py` | erzeugt App-Icon und Ladebildschirm |

## Tests
Voraussetzung: Node 22, Python 3 und `npm i playwright` in `tools/` (danach `npx playwright install chromium`).

```
python3 tools/build_test.py     # erzeugt tools/.out/test.html mit window.__wg
node tools/regress.js           # Bot spielt 10 Etagen und prüft Fehler und Zustände
node tools/swipe.js             # prüft die Wischrichtungen der Titelseiten
```

Der Bot ist ein Rauchtest und prüft **keine Balance**: Er hat unendlich Leben und nutzt die Klassenfähigkeiten nicht.

## Eine Version bauen
- Jeder Push auf `main` baut beide Varianten. Die Store-APK und das AAB hängen am Release, die DEV-APK an `dev-latest`.
- Für den Play Store braucht es einen **eigenen Upload-Schlüssel** in den Repo-Secrets (`ANDROID_KEYSTORE_B64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`). Ohne diese Secrets nutzt der Workflow den Hobby-Schlüssel `keystore.b64`. Dessen Passwort steht im Workflow und ist öffentlich, **damit darf nichts im Store landen**.
- Werbung: Test-IDs stehen in `MONET` in `index.html`. Vor der Veröffentlichung echte IDs eintragen, `test:false` setzen und die Repo-Variable `ADMOB_APP_ID` anlegen.

## Spielstand und Debug
- Der Spielstand liegt in `localStorage` unter `wuerfelgruft.v1`.
- Die DEV-Variante hat ein Entwicklermenü (Etage, Klasse, Event, Ziel, Unverwundbar, „Alles auf Max“, „Neuer Spieler“). In der Store-Variante ist `DEVBUILD` falsch.

## Store
Anleitung: `store/PLAYSTORE_ANLEITUNG.md`. Texte: `store/listing_de.md`, `store/listing_en.md`.
