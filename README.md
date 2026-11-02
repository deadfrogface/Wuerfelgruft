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
| `src/` | **Quelltext des Spiels**, hier wird gearbeitet (siehe unten) |
| `index.html` | die fertig zusammengesetzte Datei, die in die App kommt. **Nicht von Hand ändern**, sie entsteht aus `src/` |
| `package.json`, `capacitor.config.json` | Capacitor-Android-Hülle |
| `.github/workflows/android.yml` | baut bei Push auf `main` zwei Varianten: **store** (AAB und APK) und **dev** (eigenes Paket `com.wuerfelgruft.dev`, Release `dev-latest`) |
| `.github/workflows/tests.yml` | prüft bei Pull Requests, dass `index.html` zu `src/` passt, und startet die Tests |
| `tools/` | Bau- und Testskripte (siehe unten) |
| `store/` | Store-Texte (DE/EN), Screenshots, Grafiken, Anleitung |
| `docs/` | Datenschutzerklärung (GitHub Pages) |
| `brand.py` | erzeugt App-Icon und Ladebildschirm |

## Quelltext (`src/`)
Das Spiel ist in kleine Dateien nach Thema aufgeteilt. `tools/build.py` setzt sie in der Reihenfolge aus `src/manifest.json` zu `index.html` zusammen. Die Reihenfolge zählt, denn alle Skripte laufen in einem gemeinsamen Gültigkeitsbereich.

```
src/
  template.html        Rahmen der Seite mit Platzhaltern
  manifest.json        Reihenfolge der Dateien
  css/                 Stile (Grundlagen, Titel, Brett, Fenster, Zonen, Lager, Pixel-Szenen, Animationen)
  html/                Markup (Sprites, Titel, Intro, Spiel, Fenster)
  js/
    core/              Helfer, Spielstand, Sprache (i18n), Build-Schalter
    world/             Würfel-Geometrie und Levelgenerator
    content/           Daten: Gegner, Zonen, Verstärkungen, Items, Schwierigkeiten, Held
    audio/             Audio-Motor und Musik
    game/              Spielregeln: Zustand, Kampf, Ziele, Gelände, Gegner-KI, Zugablauf, Klassen, Händler, Zeitjagd
    render/            Spielfeld, Effekte, Feinschliff, Pixel-Engine
    meta/              Fortschritt: Sammlung, Meisterschaft, Anreize, Freischaltungen, Endgame, Kammer, Monetarisierung
    events/            Events, Minispiele, Event-Kulissen
    lodge/             Gruftlager (Daten und Pixel-Haus)
    ui/                Titel, Pager, Story, Einstellungen, Eingaben, Zonen-Hintergründe
    dev/               Entwicklermenü (nur DEV-Version)
    main.js            Start
```

**So änderst du etwas:**
1. Datei in `src/` bearbeiten (jede beginnt mit einem Kommentar, was darin steckt).
2. `python3 tools/build.py` ausführen. Das schreibt `index.html` neu.
3. `index.html` und die geänderten Dateien aus `src/` gemeinsam einchecken. Die Workflows prüfen mit `python3 tools/build.py --check`, dass beides zusammenpasst.

**Neue Datei anlegen:** Datei unter `src/js/<Ordner>/` erstellen, mit einem Kopfkommentar versehen und in `src/manifest.json` an der richtigen Stelle eintragen. Dateien weiter oben dürfen nur zur Laufzeit auf Dinge weiter unten zugreifen, nicht beim Laden.

## Tests
Voraussetzung: Node 22, Python 3 und `npm i playwright` in `tools/` (danach `npx playwright install chromium`).

```
python3 tools/build_test.py     # baut index.html aus src/ und erzeugt tools/.out/test.html mit window.__wg
node tools/regress.js           # Bot spielt 10 Etagen und prüft Fehler und Zustände
node tools/swipe.js             # prüft die Wischrichtungen der Titelseiten
node tools/balance.js --runs=8 --maxdepth=20 --skill=basic   # Balance-Bot (--skill=smart für den vorsichtigeren Stil, --seed=N für reproduzierbare Läufe), Bericht in tools/.out/balance.md; Ergebnisse stehen in tools/BALANCE.md
```

`regress.js` ist ein Rauchtest mit unendlich Leben. `balance.js` spielt ganze Läufe fair (kein Dauer-Leben, mit Klassenfähigkeiten, Verstärkungen und Händler) und zeigt je Klasse, wie tief der Bot kommt und woran er stirbt. Er ist ein einfacher Spieler und kein Mensch, die Zahlen sind Vergleichswerte zwischen Klassen und Stufen und keine Spielerstatistik.

## Eine Version bauen
- Jeder Push auf `main` baut beide Varianten. Die Store-APK und das AAB hängen am Release, die DEV-APK an `dev-latest`.
- Für den Play Store braucht es einen **eigenen Upload-Schlüssel** in den Repo-Secrets (`ANDROID_KEYSTORE_B64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`). Ohne diese Secrets nutzt der Workflow den Hobby-Schlüssel `keystore.b64`. Dessen Passwort steht im Workflow und ist öffentlich, **damit darf nichts im Store landen**.
- Werbung: Test-IDs stehen in `MONET` in `index.html`. Vor der Veröffentlichung echte IDs eintragen, `test:false` setzen und die Repo-Variable `ADMOB_APP_ID` anlegen.

## Spielstand und Debug
- Der Spielstand liegt in `localStorage` unter `wuerfelgruft.v1`.
- Die DEV-Variante hat ein Entwicklermenü (Etage, Klasse, Event, Ziel, Unverwundbar, „Alles auf Max“, „Neuer Spieler“). In der Store-Variante ist `DEVBUILD` falsch.

## Store
Anleitung: `store/PLAYSTORE_ANLEITUNG.md`. Texte: `store/listing_de.md`, `store/listing_en.md`.
