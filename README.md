# Würfelgruft

Mini-Roguelike auf einem Würfel mit sechs Seiten. Pixelart, Musik und Effekte komplett im Code.

- `index.html`: das ganze Spiel in einer Datei
- `android.yml` (liegt in `.github/workflows/`): baut automatisch die Android-APK
- `brand.py`: erzeugt App-Icon und Ladebildschirm
- Fertige APK: unter **Releases**

Hinweis: Der Signaturschlüssel `keystore.b64` ist für ein privates Hobbyprojekt gedacht.

## Play Store
- `store/`: Beschreibungstexte (DE/EN) und Datenschutzerklärung für den Store-Eintrag
- Der Workflow baut zusätzlich ein signiertes Bundle `Wuerfelgruft.aab` (Artefakt „Wuerfelgruft-AAB“). Für den Store muss ein eigener Upload-Schlüssel in `keystore.b64` hinterlegt werden; der aktuelle ist nur für Hobby-Installationen gedacht.
- `docs/index.html`: Datenschutzerklärung (Veröffentlichung über GitHub Pages, siehe `store/PLAYSTORE_ANLEITUNG.md`)
- `store/graphics/`: Icon 512×512 und Feature-Grafik 1024×500
