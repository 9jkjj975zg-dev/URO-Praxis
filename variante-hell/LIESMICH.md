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

### Gestaltung im Kleinen

* Deutlich weichere Rundungen (16 bis 32 Pixel statt 8 bis 14).
* Schatten in einem blauen statt grauen Ton – auf Weiß wirkt Grau schmutzig.
* Karten heben sich beim Überfahren und bekommen oben einen farbigen Strich.
* Die Fragen im FAQ sind einzelne Karten mit einem Plus, das sich beim
  Aufklappen dreht.
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
* Die Schriftart **Jost** für Überschriften, Systemschrift im Fließtext.

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
