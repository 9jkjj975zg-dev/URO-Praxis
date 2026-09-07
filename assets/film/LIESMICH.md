# Kleiner Zeichentrickfilm zur Vorsorge und zum GKV-Spargesetz

## Was hier liegt

| Datei | Wozu |
|---|---|
| `gkv-spargesetz.html` | Der Film selbst – Zeichnungen, Bewegungen und Texte in einer Datei. Laeuft in jedem Browser, braucht kein Internet und laedt nichts nach. |
| `vorsorge-gkv-spargesetz.mp4` | Derselbe Film als Videodatei (1280 × 720, 1:59 Minuten, mit Musik). Zum Weitergeben per E-Mail oder Messenger, fuer PowerPoint oder den Bildschirm im Wartezimmer. |
| `musik.m4a` | Die Hintergrundmusik, rund zwei Minuten. |
| `musik-erzeugen.js` | Rechnet die Musik neu aus, wenn sie anders klingen soll. |
| `film-rendern.js` | Erzeugt die Videodatei neu, wenn am Film etwas geaendert wurde. |

## Ablauf des Films

Der Film dauert 1:59 Minuten.

| ab | Szene |
|---|---|
| 0:00 | Titel |
| 0:05 | Herr M. geht zur Praxis, eine andere Patientin verlaesst sie gerade |
| 0:13 | Anmeldung: er bittet um einen Vorsorgetermin |
| 0:28 | Der Kalender blaettert neun Monate weiter |
| 0:44 | Die MFA erklaert das Spargesetz, dazu ein Schaubild |
| 1:07 | Sprechzimmer: an der Untersuchung selbst aendert sich nichts |
| 1:19 | Texttafel: was sich geaendert hat |
| 1:40 | Hinweis: der Film spricht nur ueber GKV-Leistungen |
| 1:52 | Abspann mit Praxisangaben |

Die Figuren haben Gelenke: Huefte, Knie, Fussgelenk, Schulter und Ellbogen
werden einzeln gedreht. Die Schrittlaenge ist auf die Laufgeschwindigkeit
abgestimmt, damit niemand ueber den Gehweg rutscht.

Die Gesichter haben Augen mit Pupille und Augenbrauen. Der Mund bewegt sich
nur, solange die Sprechblase derselben Figur steht. Wer spricht, sieht sein
Gegenueber an: Kopfhaltung und Blickrichtung wechseln mit. Dazu blinzeln
alle Figuren, atmen und verlagern langsam ihr Gewicht.

## Musik

Die Musik ist nicht eingekauft, sondern in `musik-erzeugen.js` ausgerechnet:
eine ruhige Flaeche mit sparsamem Glockenspiel, rund 67 Schlaege je Minute.
Damit gibt es weder Lizenzgebuehren noch eine GEMA-Anmeldung. Der Verlauf
folgt den Szenen – freundlich am Anfang, ernster beim Kalender und beim
Spargesetz, waermer im Sprechzimmer, ruhig zum Schluss.

Neu ausrechnen:

```sh
node assets/film/musik-erzeugen.js musik.wav
ffmpeg -i musik.wav -c:a aac -b:a 112k assets/film/musik.m4a
```

Die Akkordfolge steht in der Liste `TAKTE`, die Melodie in `MELODIE`.
Wer lieber eine gekaufte oder selbst eingespielte Musik moechte, legt sie
einfach als `musik.m4a` dorthin – oder loescht die Datei, dann bleibt der
Film stumm. Wie laut die Musik im Video liegt, steuert
`FILM_MUSIK_PEGEL` (Vorgabe 0,55).

Auf der Filmseite ist der Ton zunaechst aus; der Knopf **Ton an** schaltet
ihn zu, `?ton=1` in der Adresse gleich beim Laden.

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

Die vorletzte Tafel ordnet den Film rechtlich ein: Er spricht ausschliesslich
ueber Leistungen der gesetzlichen Krankenversicherung, sagt nichts ueber
Termine bei anderen Kostentraegern und wirbt nicht fuer Selbstzahlerleistungen.
Der Satz "Termine vergeben wir nach medizinischer Dringlichkeit" gehoert
inhaltlich dazu und sollte stehen bleiben. Diese Tafel bitte ebenfalls
gegenlesen lassen, bevor der Film oeffentlich laeuft.

## Film im Wartezimmer

Die Seite kennt zwei Zusaetze in der Adresse:

* `?schleife=1` – der Film beginnt sofort und laeuft in Dauerschleife,
* `?pur=1` – bildschirmfuellend, ohne Bedienleiste,
* `?ton=1` – mit Musik.

Das laesst sich kombinieren:
`gkv-spargesetz.html?pur=1&schleife=1&ton=1`

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
