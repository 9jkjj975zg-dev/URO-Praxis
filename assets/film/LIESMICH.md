# Kleiner Zeichentrickfilm zur Vorsorge und zum GKV-Spargesetz

## Was hier liegt

| Datei | Wozu |
|---|---|
| `gkv-spargesetz.html` | Der Film selbst – Zeichnungen, Bewegungen und Texte in einer Datei. Laeuft in jedem Browser, braucht kein Internet und laedt nichts nach. |
| `vorsorge-gkv-spargesetz.mp4` | Derselbe Film als Videodatei (1280 × 720, 1:41 Minuten, ohne Ton). Zum Weitergeben per E-Mail oder Messenger, fuer PowerPoint oder den Bildschirm im Wartezimmer. |
| `film-rendern.js` | Erzeugt die Videodatei neu, wenn am Film etwas geaendert wurde. |

## Ablauf des Films

| ab | Szene |
|---|---|
| 0:00 | Titel |
| 0:05 | Herr M. geht zur Praxis und tritt ein |
| 0:16 | Anmeldung: er bittet um einen Vorsorgetermin |
| 0:32 | Der Kalender blaettert neun Monate weiter |
| 0:48 | Die MFA erklaert das Spargesetz, dazu ein Schaubild |
| 1:10 | Texttafel: was sich geaendert hat |
| 1:33 | Abspann mit Praxisangaben |

## Texte aendern

Alle gesprochenen und geschriebenen Saetze stehen gebuendelt an zwei Stellen
in `gkv-spargesetz.html`:

* im `<script>` ganz unten in den drei Listen `SZENEN` (Zeitplan),
  `REDE` (Sprechblasen) und `UNTERTITEL`,
* in den drei `<div class="tafel">` weiter oben (Titel, Texttafel, Abspann).

An den Zeichnungen muss dafuer niemand etwas aendern. Wird ein Satz laenger,
lohnt ein Blick auf die Zeiten `von` und `bis` – etwa zwei Sekunden je Zeile
sind zum Mitlesen angenehm.

**Bitte vor der Veroeffentlichung fachlich gegenlesen:** Die Aussagen zum
Spargesetz sind bewusst allgemein gehalten. Zahlen, Fristen und die genaue
Bezeichnung des Gesetzes sollten dem Stand entsprechen, den die Praxis
vertreten moechte.

## Film im Wartezimmer

Die Seite kennt zwei Zusaetze in der Adresse:

* `?schleife=1` – der Film beginnt sofort und laeuft in Dauerschleife,
* `?pur=1` – bildschirmfuellend, ohne Bedienleiste.

Beides laesst sich kombinieren:
`gkv-spargesetz.html?pur=1&schleife=1`

## Video neu erzeugen

```sh
npm install playwright ffmpeg-static
npx playwright install chromium
npx http-server -p 8099 .          # in einem zweiten Fenster, im Projektordner
node assets/film/film-rendern.js assets/film/vorsorge-gkv-spargesetz.mp4
```

Der Film wird dabei Bild fuer Bild gesetzt und nicht abgefilmt. Deshalb ist
das Ergebnis immer gleich lang und ruckelfrei, unabhaengig vom Rechner.
Findet `ffmpeg` sich nicht im Suchpfad, hilft
`FFMPEG=$(node -e "console.log(require('ffmpeg-static'))")` davor.
