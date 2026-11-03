# iOS: von der App zum App Store

Der Workflow `.github/workflows/ios.yml` baut die iOS-App automatisch (bei jedem Push auf `main`, bei Änderungen am Workflow und von Hand unter **Actions > iOS Build > Run workflow**).

## Was ohne Apple-Konto entsteht
- `Wuerfelgruft-store-Simulator.zip` und `Wuerfelgruft-dev-Simulator.zip`: die App für den **Xcode-Simulator** (auf einem Mac: Zip entpacken, `xcrun simctl install booted App.app`).
- `Wuerfelgruft-…-unsigned.ipa`: unsigniertes Paket. Es lässt sich **nicht** direkt auf ein iPhone installieren. Man muss es erst signieren (zum Beispiel mit AltStore oder Sideloadly und einer kostenlosen Apple-ID, 7 Tage gültig).

Die fertigen Dateien hängen als Artefakte am jeweiligen Workflow-Lauf (Actions > Lauf öffnen > ganz unten „Artifacts“).

## Was du für den App Store brauchst (nur du kannst das)
1. **Apple Developer Program** beitreten (99 US-Dollar im Jahr, Ausweisprüfung). Ohne das gibt es weder TestFlight noch den App Store.
2. **App-ID anlegen** (developer.apple.com > Identifiers): Bundle-ID `com.wuerfelgruft.game`.
3. **Distribution-Zertifikat** erstellen und als `.p12` exportieren. Dazu ein **Provisioning Profile** (App Store) für die Bundle-ID. Auf einem Mac geht das per Schlüsselbundverwaltung, ohne Mac mit einem Zertifikatsantrag per OpenSSL (ich führe dich Schritt für Schritt).
4. **App in App Store Connect anlegen** (Name, Sprache, Bundle-ID).
5. **In-App-Käufe anlegen** (App Store Connect > Funktionen): `remove_ads` (Werbefrei, 2,99 €) und `supporter` (Unterstützer-Skin, 4,99 €), beide als „nicht verbrauchbar“.
6. **AdMob iOS-App** anlegen (eigene App und Werbe-ID, nicht die von Android). Dann in den Repo-Variablen `ADMOB_IOS_APP_ID` setzen und in `src/js/meta/monetization.js` die iOS-Belohnungs-ID und `test:false` eintragen.
7. **Datenschutz-Angaben** (App Privacy) und **Altersfreigabe** ausfüllen. Hinweis: simuliertes Glücksspiel im Vegas-Event, das beeinflusst die Altersfreigabe.
8. **Screenshots** für iPhone (6,9 Zoll, 1320×2868) hochladen. Die vorhandenen Screenshots in `store/screenshots/` haben das Format 1080×1920 und müssen für Apple neu erzeugt werden.
9. Für die Werbung gilt **App Tracking Transparency** und in der EU die Einwilligungsabfrage (Google UMP). Die Beschreibung für die Abfrage steht schon in der Info.plist, die Abfrage selbst ist **noch nicht eingebaut**.

## Secrets für das signierte Paket und TestFlight (GitHub > Settings > Secrets and variables > Actions)
| Name | Inhalt |
|---|---|
| `IOS_CERT_P12_B64` | Zertifikat als `.p12`, mit `base64 -i zertifikat.p12` kodiert |
| `IOS_CERT_PASSWORD` | Passwort der `.p12` |
| `IOS_PROFILE_B64` | Provisioning Profile (`.mobileprovision`), Base64 |
| `IOS_TEAM_ID` | Team-ID aus dem Developer-Konto |
| `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_P8_B64` | App-Store-Connect-API-Schlüssel (für den Upload nach TestFlight) |

Sind die ersten vier Secrets gesetzt, entsteht `…-signed.ipa`. Mit den drei weiteren wird die Store-Variante automatisch zu TestFlight hochgeladen.

## Ehrlich: Stand und Grenzen
- Der **Workflow ist ungetestet**, bis er zum ersten Mal auf GitHub gelaufen ist. Fehler sind beim ersten Lauf zu erwarten, vor allem bei Xcode-Version, Plugins und Signierung.
- Der **signierte Pfad** (Zertifikat, Profil, TestFlight) kann ich ohne Apple-Konto nicht prüfen.
- **Nicht getestet** auf einem echten iPhone. Safe Area (Notch), Wischen, Musikstart nach der ersten Berührung und die Käufe müssen dort geprüft werden.
- Apple prüft Apps streng (Datenschutz, Käufe, Abstürze). Eine Ablehnung beim ersten Versuch ist normal.
