# Zweiter Entwurf: „hell“

Dieser Ordner enthält **dieselbe Website noch einmal** – gleiche Texte, gleiche
Seiten, gleiche Struktur der Inhalte, aber ein anderer Aufbau und eine andere
Gestaltung. Er ist zum Ausprobieren gedacht und **verändert das laufende
Projekt im Hauptverzeichnis an keiner Stelle**.

Beide Fassungen lassen sich nebeneinander ansehen:

```
python3 -m http.server 8000
```

* `http://localhost:8000/` – der bisherige Entwurf (Sand und Navy)
* `http://localhost:8000/variante-hell/` – dieser Entwurf

Der Ordner ist vollständig eigenständig: eigenes Stylesheet, eigenes Skript,
eigene Kopien der Bilder und Schriften. Wird er gelöscht, bleibt alles andere
unberührt.

---

## 1. Was anders ist

### Farben

| | bisher | hier |
|---|---|---|
| Grundfläche | Sandton `#f5f2ee` | Weiß `#ffffff` |
| Abgesetzte Abschnitte | Greige | sehr helles Blau `#f5f8fd` |
| Handelnde Farbe | Bronze `#5f574a` | Blau `#2a6adf` mit Türkis `#12a7a0` |
| Ein Band in Farbe | tiefes Navy | Verlauf Blau → Türkis |
| Fußbereich | dunkles Navy | hell, wie die Seite |

Das Navy des Logos bleibt – es trägt jetzt die Überschriften statt der
Flächen. Der warme Ton (`#f08a3c`) kommt nur noch an zwei Stellen vor:
bei der wichtigsten Meldung und im Vertretungskasten. Gerade weil er selten
ist, fällt er auf.

Alle Farben stehen gesammelt am Anfang von `assets/css/style.css` im Block
`:root`.

### Aufbau

* **Der Kopfbereich klebt oben** und wird beim Scrollen flacher. Bisher
  scrollte er mit weg.
* **Die Kontaktzeile** über dem Kopfbereich ist eine leise weiße Zeile
  statt eines dunklen Bandes und läuft beim Scrollen davon.
* **Das Menü auf dem Handy** fährt als Fläche von rechts herein, mit
  abgedunkeltem Grund. Bisher klappte es als Liste auf.
* **Unten am Handybildschirm** stehen zwei Schaltflächen fest: „Anrufen“
  und „Termin“. Auf dem Rechner erscheinen sie nicht.
* **Der Hero der Startseite** ist zweispaltig: links Text, rechts das
  Teamfoto mit einer Karte davor, die die Sprechzeiten zeigt – und, wenn
  gerade Sprechstunde ist, einen grünen Punkt mit „Jetzt geöffnet“.
* **Die Reihenfolge der Startseite** ist eine andere:

  | bisher | hier |
  |---|---|
  | Hero | Hero (mit Foto und Sprechzeiten-Karte) |
  | Drei Einstiegskarten | Drei Einstiegskarten |
  | Aktuelles | Das übrige Fachgebiet |
  | Das übrige Fachgebiet | Praxis & Sprechzeiten |
  | Praxis & Team | Patientenstimmen |
  | Häufige Fragen | Häufige Fragen |
  | Patientenstimmen | Aktuelles |
  | Terminband | Terminband |

  Das Teamfoto steht auf der Startseite jetzt im Hero und nicht mehr weiter
  unten – es kommt also weiterhin nur einmal vor.

### Formen

Gerundet wird nach Aufgabe, nicht nach Gefühl. Sechs Werte am Anfang von
`assets/css/style.css` steuern das für die ganze Website:

| Wert | Wofür |
|---|---|
| `--radius-xs` 8 px | Sinnbilder, Eingabefelder, kleine Kästen |
| `--radius` 12 px | Hinweise, Rahmen, Tabellen |
| `--radius-lg` 16 px | Karten und Kacheln |
| `--radius-xl` 22 px | Fotos, die Karte im Hero |
| `--radius-knopf` 10 px | Schaltflächen |
| `--radius-pille` 999 px | Marken und Etiketten |

Weicher oder härter wird alles über diese sechs Zeilen. Ein echter Kreis
bleibt nur, wo etwas wirklich rund ist: der Lichtpunkt neben „Jetzt
geöffnet“ und die Farbwolken im Hintergrund des Heros.

### Der Strich

Das wiederkehrende Zeichen dieses Entwurfs ist ein **2 Pixel hoher Strich**
in Blau-Türkis, 1,6 rem lang. Er steht überall dort, wo etwas anfängt:

| Wo | Wie |
|---|---|
| Über jeder Überschrift | Strich, dann die Kennzeile |
| In jeder Kachel, oben links | genauso wie über der Überschrift; beim Überfahren wächst er auf das Doppelte |
| Auf den Leistungskacheln | derselbe Strich, dann die Nummer: `— 01` |
| Über jeder Zwischenüberschrift | auf den langen Leistungs- und Rechtsseiten |
| Im Zahlenband | auf der Trennlinie über jeder Zahl |
| Unter dem Menüpunkt | markiert die Seite, auf der man steht |
| Unter dem Kopfband | als Lesefortschritt über die ganze Breite |

Trägt eine Kachel eine Nummer, entfällt ihr eigener Strich – sonst stünden
zwei übereinander.

### Gestaltung im Kleinen

* Getrennt wird über Haarlinien, nicht über Schatten. Schatten tragen nur
  noch, was wirklich über der Seite schwebt: das Foto im Hero, die Karte
  davor, das aufgeklappte Menü.
* Verweise im Fließtext tragen eine Unterlänge in Blau, nicht nur Farbe –
  wer Farben schlecht unterscheidet, sieht sie trotzdem.
* Zeilen in den langen Tabellen heben sich beim Überfahren.
* Markierter Text erscheint im hellen Blau der Palette.
* Kacheln einer Reihe sind gleich hoch und stehen oben wie unten bündig.
* Die Fragen im FAQ sind einzelne Karten mit einem Plus, das sich beim
  Aufklappen dreht.
* Die Haken in den Aufzählungen stehen frei, ohne Feld dahinter.
* Zwei Farbwolken im Hintergrund des Heros bewegen sich sehr langsam.
* Der Farbverlauf sitzt an drei Stellen in der Schrift selbst: in der Zeile
  „Ihre Urologen in Hanau“, in den großen Zahlen und im Anführungszeichen
  der Patientenstimmen.

### Was weggefallen ist

Der Effekt, mit dem Inhalte am oberen Bildrand verblassen, ist hier **nicht**
übernommen. Er ist die Handschrift des ersten Entwurfs; stattdessen kommt
jeder Baustein einmal sanft von unten herein, wenn er ins Bild kommt.

---

## 1a. Die Vorschau in einer Datei

`vorschau.html` im selben Ordner enthält **alle 20 Seiten in einer einzigen
Datei** – Stylesheet, Skript, Schriften und das Teamfoto sind darin
eingebettet, es wird nichts nachgeladen. Ein Doppelklick genügt, auch ohne
Webserver; die Datei lässt sich weitergeben oder verschicken.

Oben sitzt eine schmale Leiste mit einer Auswahl aller Seiten. Verweise
innerhalb der Seite schalten die Vorschau um, statt eine neue Datei zu
öffnen; sonst verhält sich alles wie auf der fertigen Website.

Die Datei ist erzeugt, nicht von Hand gepflegt. Nach jeder Änderung am
Entwurf neu bauen:

```
python3 werkzeug/bau-vorschau.py
```

Das Skript liest die Seiten dieses Ordners und setzt sie mit
`werkzeug/schablone.html` zusammen. Geändert wird immer der Entwurf, nie
`vorschau.html`.

---

## 2. Was gleich geblieben ist

* **Alle Texte** – Wort für Wort dieselben wie im Hauptverzeichnis.
* **Alle Seiten** und alle Verweise zwischen ihnen.
* **Keine externen Ressourcen**: keine Schriften, Skripte oder Bilder von
  fremden Servern, also weiterhin kein Einwilligungsbanner nötig.
* **Kein Tracking**, keine Cookies, kein Local Storage.
* **Barrierearm**: semantisches HTML, Sprungmarke, sichtbare Fokusrahmen,
  Beschriftungen an allen Formularfeldern, `prefers-reduced-motion` wird
  beachtet – alle Bewegungen stehen dann still.
* **Ohne JavaScript** funktioniert die Seite vollständig. Ohne Skript fehlen
  nur: das flacher werdende Kopfband, die Zeile „Jetzt geöffnet“, das
  laufende Meldungsband, das sanfte Einblenden und die aufklappbaren
  Untermenüs auf dem Handy (die stehen dann offen da).
* **Anders als im ersten Entwurf:** Der Fließtext steht nicht mehr in der
  Systemschrift, sondern in derselben Schrift wie die Überschriften – siehe
  Abschnitt 2a.

---

## 2a. Die Schrift der Überschriften

Alle Schriften liegen unter `assets/fonts/` auf dem
eigenen Server, alle unter der SIL Open Font License – es wird weiterhin
nichts von Google nachgeladen.

**Eingestellt ist Host Grotesk – für Überschriften *und* Fließtext.**

Der erste Entwurf setzt den Fließtext in die Systemschrift des Geräts, weil
geometrische Schriften wie Jost auf langen Strecken anstrengend werden. Host
Grotesk ist keine geometrische, sondern eine Textgrotesk mit hoher
Mittellänge und offenen Formen: Sie liest sich auch über lange Strecken
ruhig, und die Seite bekommt einen einheitlichen Auftritt. Von ihr liegen
deshalb vier Dateien bereit – Grund- und erweiterter Zeichensatz, jeweils
aufrecht und kursiv.

Die Systemschriften stehen als Rückfall dahinter: Solange die Schriftdatei
lädt – und falls sie ausfällt – erscheint der Text in der Schrift des
Geräts, nie unsichtbar.

Zehn weitere Schriften stehen zum Vergleich bereit. Sie wechseln nur die
Überschriften; der Fließtext bleibt Host Grotesk:

| Schrift | Charakter |
|---|---|
| **Host Grotesk** | redaktionell, ruhig eigenwillig – **eingestellt** |
| **Bricolage Grotesque** | ungleiche Formen, kantig und modern |
| **Familjen Grotesk** | schwedische Grotesk, sachlich mit Ecken |
| **Funnel Display** | jung, engere Formen, hohe Mittellänge |
| **Gabarito** | freundlich, offene Formen |
| **Schibsted Grotesk** | Zeitungsgrotesk, klar und geradeaus |
| **Darker Grotesque** | schmal und hoch, sehr eigen |
| **Epilogue** | ruhige Grotesk mit eigenen Endungen |
| **Jost** | geometrisch, sachlich (der erste Entwurf) |
| **Fraunces** | weiche Serifen, warm und eigenwillig |
| **Instrument Serif** | hoher Strichstärkenkontrast, schmal und elegant |

**Zum Vergleichen:** in `vorschau.html` oben rechts in der Leiste umschalten.
Die Umschaltung ändert nichts an den Dateien, sie zeigt nur.

**Zum Festlegen:** im Block `:root` am Anfang von `assets/css/style.css`
stehen vier Werte beieinander – `--font-display`, `--schrift-staerke`,
`--schrift-abstand` und `--schrift-variation`. Für jede der fünf Schriften
ist die passende Zeile als Kommentar hinterlegt; eintragen genügt, die ganze
Website zieht mit.

Von den fünf jüngsten Kandidaten liegt nur der lateinische Grundausschnitt
bereit. Er enthält Umlaute und scharfes S und reicht zum Vergleichen; fällt
die Wahl auf eine davon, fehlt noch der erweiterte Ausschnitt – wie man ihn
nachholt, steht in `assets/fonts/LIESMICH.txt`.

Steht die Entscheidung, können die übrigen Schriftdateien gelöscht werden –
zusammen mit ihren `@font-face`-Blöcken im Stylesheet. Solange sie liegen
bleiben, kosten sie nichts: Der Browser holt eine Schriftdatei erst, wenn sie
tatsächlich gebraucht wird.

---

## 3. Was noch offen ist

Alles, was in der `README.md` des Hauptverzeichnisses unter „Wichtig: Diese
Angaben bitte vor der Veröffentlichung prüfen“ steht, gilt hier genauso –
die Inhalte sind ja dieselben. Insbesondere die Preise auf
`selbstzahler-preise.html`, die Beispielmeldungen und die Praxisbilder.

Zusätzlich für diesen Entwurf:

* Alle Seiten tragen `<meta name="robots" content="noindex, nofollow">`.
  So kann der Ordner gefahrlos mit hochgeladen werden, ohne dass Suchmaschinen
  zwei Fassungen derselben Praxis finden. **Vor einem echten Livegang muss
  diese Zeile in allen Dateien wieder auf `index, follow` stehen.**
* Die `canonical`- und `og:url`-Angaben zeigen weiterhin auf die Adressen der
  Hauptfassung. Auch das ist erst zu ändern, wenn dieser Entwurf die
  Hauptfassung werden soll.
* `robots.txt`, `sitemap.xml` und `.htaccess` liegen bewusst nicht in diesem
  Ordner – sie gehören zur Veröffentlichung, nicht zum Entwurf.

---

## 4. Wenn dieser Entwurf gewinnt

Dann wandern die Dateien aus diesem Ordner ins Hauptverzeichnis, die drei
Punkte aus Abschnitt 3 werden zurückgestellt und der Ordner verschwindet.
Bis dahin kostet er nichts außer Speicherplatz.
