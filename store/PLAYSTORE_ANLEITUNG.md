# Würfelgruft im Play Store veröffentlichen

Stand: Oktober 2026. Die Vorgaben von Google ändern sich, prüfe die Punkte in der Play Console.

## 1. Was bereits fertig ist
- Spiel, Android-Build (Capacitor 8, Ziel-API 36), Bundle (`Wuerfelgruft.aab`) im Workflow
- Texte: `store/listing_de.md`, `store/listing_en.md`
- Grafiken: `store/graphics/icon_512.png`, `store/graphics/feature_1024x500.png`
- Screenshots: `store/screenshots/` (1080×1920)
- Datenschutzerklärung: `docs/index.html` (Veröffentlichung siehe Schritt 3)

## 2. Eigenen Upload-Schlüssel erzeugen (einmalig, wichtig)
Der Schlüssel im Repo (`keystore.b64`) ist öffentlich und nur für Hobby-Installationen gedacht. Für den Store brauchst du einen eigenen, den **nur du** besitzt:

```bash
keytool -genkeypair -v -keystore upload.p12 -storetype PKCS12 \
  -alias wuerfelgruft -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 upload.p12 > upload.b64      # Mac: base64 -i upload.p12 -o upload.b64
```
- Sichere `upload.p12` und das Passwort an mindestens zwei Orten (Passwortmanager, Backup). Mit Play App Signing kann Google bei Verlust zwar einen neuen Upload-Schlüssel freischalten, das dauert aber.
- Trage im Repo unter *Settings → Secrets and variables → Actions* ein:
  - `ANDROID_KEYSTORE_B64` = Inhalt von `upload.b64`
  - `ANDROID_KEYSTORE_PASSWORD` = dein Passwort (Store- und Key-Passwort gleich wählen)
  - `ANDROID_KEY_ALIAS` = `wuerfelgruft`
- Beim nächsten Push auf `main` signiert der Workflow APK und AAB mit deinem Schlüssel. Das AAB findest du unter *Actions → Lauf → Artifacts → Wuerfelgruft-AAB*.

## 3. Datenschutzerklärung veröffentlichen
Play verlangt eine öffentlich erreichbare Adresse.
1. Repo → *Settings → Pages* → Branch `main`, Ordner `/docs` → Speichern.
2. Die Adresse lautet dann `https://deadfrogface.github.io/Wuerfelgruft/`. Sie trägst du in der Play Console ein.

## 4. Entwicklerkonto und App anlegen
1. Konto auf play.google.com/console anlegen (einmalig 25 $, Identitätsprüfung).
2. *App erstellen*: Name „Würfelgruft“, Standardsprache Deutsch, Spiel, kostenlos.
3. Paketname ist fest: `com.wuerfelgruft.game`.

## 5. Formulare (Vorschläge für die Antworten)
- **Datensicherheit:** Eigene Daten werden nicht erhoben. Durch Google AdMob (freiwillige Belohnungs-Werbung) werden Geräte-/Werbe-ID und ungefähre Standortdaten aus der IP an Google übermittelt: bei „Daten teilen“ Geräte- oder andere IDs (Zweck: Werbung) angeben. Käufe laufen über Google Play.
- **Werbung:** „Enthält Werbung“ = Ja.
- **Käufe in der App:** Ja (Werbefrei, Unterstützer).
- **Inhaltseinstufung:** Fragebogen ehrlich ausfüllen. Gezeichnete Fantasy-Gewalt, kein Blut-Realismus, kein Glücksspiel um echtes Geld (die Vegas-Würfel nutzen nur Spielmünzen, die man nicht kaufen kann; im Fragebogen „simuliertes Glücksspiel“ ehrlich angeben), keine Interaktion mit anderen Nutzern.
- **Zielgruppe:** Ab 13 oder älter wählen, nicht ausdrücklich an Kinder richten (vermeidet zusätzliche Auflagen).
- **Berechtigungen:** keine besonderen.
- **Store-Eintrag:** Texte aus `store/listing_de.md` und `store/listing_en.md`, Icon, Feature-Grafik, Screenshots hochladen.

## 6. Testphase (bei neuen privaten Konten Pflicht)
Neue private Entwicklerkonten müssen vor der Veröffentlichung einen geschlossenen Test mit einer Mindestzahl an Testern über einen Mindestzeitraum durchführen (zuletzt: 12 Tester, 14 Tage). Prüfe die aktuellen Zahlen in der Play Console unter *Testen und veröffentlichen*.
1. *Geschlossener Test* → Tester per E-Mail-Liste einladen → AAB hochladen.
2. Mindestdauer abwarten, dann *Produktionszugriff beantragen*.

## 7. Vor dem ersten Upload prüfen
- Auf mehreren echten Geräten spielen (klein, groß, mit Notch): Bedienung, Leistung, Akku, Ton.
- Einstellungen → „Fehlerprotokoll kopieren“ zeigt gesammelte Fehler. Schicke sie mir, wenn etwas auffällt.
- Versionscode steigt automatisch mit jedem Build (`versionCode = Lauf-Nummer`). Für den Store immer das neueste AAB nehmen.

## 8. Ziel-API
Neue Apps müssen ab 31. August 2026 Android 16 (API 36) anzielen. Der Build nutzt dafür Capacitor 8. Wenn Google die Anforderung später anhebt, genügt meist ein Update der Capacitor-Version im `package.json` und im Workflow.
