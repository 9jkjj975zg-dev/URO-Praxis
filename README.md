# Website der Urologischen Gemeinschaftspraxis Rech, Hanau

Statische Website (reines HTML, CSS und etwas JavaScript) – ohne Build-Prozess,
ohne Datenbank, ohne Framework. Die Dateien können unverändert per FTP auf jedes
gängige Webhosting-Paket hochgeladen werden.

---

## 1. Inhalt und Zielsetzung

Die Seite ist auf drei Patientengruppen ausgerichtet:

| Zielgruppe | Einstiegsseite |
|---|---|
| Privatversicherte um die 50 (Vorsorge, Männergesundheit) | `leistung-vorsorge.html` |
| Ältere Beihilfeberechtigte, Postbeamtenkrankenkasse und Krankenversorgung der Bundesbahnbeamten | `privatpatienten.html` |
| Junge Männer mit Wunsch nach einer Vasektomie | `leistung-vasektomie.html` |

Auf der Startseite führen drei hervorgehobene Einstiegskarten direkt in diese
Bereiche. Jede Seite endet mit einer Aufforderung zur Terminvereinbarung,
Telefonnummer und Terminformular sind auf jeder Seite über Kopf- und Fußbereich
erreichbar.

## 2. Seitenübersicht

| Datei | Inhalt |
|---|---|
| `index.html` | Startseite mit Zielgruppen-Einstiegen, Leistungsübersicht, Sprechzeiten, FAQ |
| `aktuelles.html` | Meldungen: Urlaub, Schließzeiten, gesetzliche Änderungen |
| `praxis.html` | Praxis und Team, Arbeitsweise, Zusammenarbeit in der Region |
| `leistungen.html` | Übersicht aller Leistungen und häufiger Behandlungsanlässe |
| `leistung-vorsorge.html` | Krebsfrüherkennung, PSA, Vorsorge ab 45 |
| `leistung-vasektomie.html` | Vasektomie: Ablauf, Risiken, Kosten, ausführliche FAQ |
| `leistung-onkologie.html` | Onkologische Therapie und Nachsorge |
| `leistung-sonographie.html` | Sonographie und Duplexsonographie |
| `leistung-labordiagnostik.html` | Blut- und Urindiagnostik |
| `leistung-ambulante-operationen.html` | Ambulante Operationen |
| `leistung-kinderwunsch.html` | Kinderwunschberatung, Spermiogramm |
| `privatpatienten.html` | Privatpatienten, Beihilfe, PBeaKK, KVB, Selbstzahler |
| `kontakt.html` | Kontaktdaten, Sprechzeiten, Terminformular, Anfahrt, Bereitschaftsdienst |
| `impressum.html` | Impressum nach § 5 DDG |
| `datenschutz.html` | Datenschutzerklärung nach DSGVO |
| `404.html` | Fehlerseite |

Weitere Dateien: `assets/css/style.css`, `assets/js/main.js`,
`assets/img/logo.svg`, `assets/img/favicon.svg`, `robots.txt`, `sitemap.xml`,
`.htaccess`.

## 3. Wichtig: Diese Angaben bitte vor der Veröffentlichung prüfen

Die Website `www.hanau-urologie.de` war aus der Entwicklungsumgebung heraus nicht
direkt abrufbar. Die Praxisdaten stammen daher aus öffentlich zugänglichen
Suchergebnissen und **müssen vor dem Livegang gegengeprüft werden**:

- [ ] **Sprechzeiten** – hinterlegt sind: Mo, Di, Do 07:30–13:00 und 14:00–16:30 Uhr;
      Mi, Fr 07:30–13:00 Uhr. Zu ändern an drei Stellen: `kontakt.html`,
      `index.html` (Tabelle und Hero-Zeile) sowie im Fußbereich **jeder** Seite.
      Zusätzlich im JSON-LD-Block in `index.html` (`openingHoursSpecification`).
- [ ] **Telefon** `06181 7033730`, **Telefax** `06181 7033739`,
      **E-Mail** `kontakt@hanau-urologie.de`
- [ ] **Anschrift** Sophie-Scholl-Platz 4a, 63452 Hanau
- [ ] **Namen und Titel** der Ärztin und des Arztes sowie deren Schwerpunkte
      (`praxis.html`, siehe `TODO`-Kommentare im Quelltext)
- [ ] **Teamfoto** – auf `praxis.html` und `index.html` ist der Platz
      reserviert; die Bilddatei fehlt noch (siehe Abschnitt „Bilder einsetzen")
- [ ] **Meldungen auf `aktuelles.html`** und der Text im **Hinweisbalken** –
      derzeit Beispieltexte, siehe Abschnitt 5
- [ ] Eine eventuelle **offene Akutsprechstunde** ist bewusst nicht aufgeführt,
      weil sie nicht verifiziert werden konnte. Falls es sie gibt, in
      `kontakt.html` und `index.html` ergänzen.

Alle Stellen, an denen noch Angaben fehlen, sind im Quelltext mit `TODO`
kommentiert und auf den Rechtsseiten sichtbar als **[bitte ergänzen]** markiert:

- `impressum.html`: Umsatzsteuer-Identifikationsnummer,
  Berufshaftpflichtversicherung (Name, Anschrift, Geltungsbereich)
- `datenschutz.html`: Datenschutzbeauftragte(r), Hosting-Anbieter,
  Speicherdauer der Server-Logdateien, Stand der Erklärung
- `kontakt.html`: Parkmöglichkeiten, nächstgelegene Haltestelle und Buslinien
- `praxis.html`: Werdegang und Zusatzbezeichnungen der Ärztin und des Arztes

> **Hinweis:** Impressum und Datenschutzerklärung sind sorgfältig erstellte
> Vorlagen, aber keine Rechtsberatung. Bitte vor der Veröffentlichung
> anwaltlich oder durch die zuständige Ärztekammer prüfen lassen.

## 4. Veröffentlichung

1. Alle Dateien und Ordner in das Web-Verzeichnis des Hosting-Pakets hochladen
   (üblicherweise `httpdocs`, `public_html` oder `www`) – einschließlich des
   Ordners `assets` und der Datei `.htaccess` (versteckte Dateien im
   FTP-Programm sichtbar schalten).
2. Im Hosting-Paket ein TLS-Zertifikat aktivieren (bei den meisten Anbietern
   kostenlos über Let's Encrypt).
3. `.htaccess` sorgt für Weiterleitung auf HTTPS, eine einheitliche Domain und
   Sicherheits-Header. Läuft der Server nicht mit Apache (z. B. nginx), kann die
   Datei entfallen; die Einstellungen sind dann in der Serverkonfiguration
   vorzunehmen.
4. In `robots.txt` und `sitemap.xml` sowie in den `canonical`- und
   `og:url`-Angaben der Seiten ist `https://www.hanau-urologie.de` hinterlegt.
   Soll die Domain ohne `www` laufen, diese Angaben anpassen und in `.htaccess`
   die entsprechende Variante aktivieren.
5. Die Seite anschließend in der Google Search Console eintragen und die
   `sitemap.xml` einreichen.

## 5. Aktuelles pflegen

Für Urlaubs- und Schließzeiten, geänderte Sprechzeiten oder Hinweise auf
gesetzliche Neuerungen gibt es zwei zusammengehörige Stellen:

**a) Der Hinweisbalken ganz oben** erscheint auf jeder Seite und nennt die
eine wichtigste Meldung. Er ist in jeder HTML-Datei zwischen den Kommentaren
`Hinweisbalken: Anfang` und `Hinweisbalken: Ende` zu finden:

```html
<div class="hinweisbalken">
  <div class="wrap hinweisbalken__inner">
    <span class="hinweisbalken__marke">Aktuell</span>
    <p>Hier steht die Meldung.</p>
    <a href="aktuelles.html">Alle Meldungen</a>
  </div>
</div>
```

- **Text ändern:** die Zeile zwischen `<p>` und `</p>` anpassen — in allen
  HTML-Dateien, am schnellsten per „In allen Dateien suchen und ersetzen".
- **Ausblenden:** wenn es gerade nichts zu melden gibt, den ganzen Block von
  `Anfang` bis `Ende` löschen oder in einen HTML-Kommentar setzen.
- **Farbe ändern:** die vier Werte `--c-hinweis-*` am Anfang von
  `assets/css/style.css`. Dort ist eine blaugraue Alternative als Kommentar
  hinterlegt, falls der Sandton nicht gefällt.

**b) Der Abschnitt „Aktuelles" auf der Startseite** zeigt die zwei neuesten
Meldungen als Kurzfassung. Er steht in `index.html` und ist im Quelltext als
`<p class="eyebrow">Aus der Praxis</p>` zu finden. Die Texte dort sind Kopien
der ersten Absätze von `aktuelles.html` — beim Aktualisieren bitte mitziehen.

**c) Die Seite `aktuelles.html`** enthält die vollständige Liste. Jede Meldung
ist ein `<article class="meldung">`-Block zwischen den Kommentaren
`Meldungen: Anfang` und `Meldungen: Ende`. Eine neue Meldung anlegen:

1. Einen bestehenden `<article>`-Block vollständig kopieren und **oben**
   einfügen — die neueste Meldung steht zuerst.
2. Datum an zwei Stellen anpassen: in `datetime="2026-12-21"` (Format
   Jahr-Monat-Tag, für Suchmaschinen) und im sichtbaren Text daneben.
3. Kategorie (`meldung__art`), Überschrift und Text anpassen.
4. Die wichtigste Meldung bekommt zusätzlich die Klasse `meldung--wichtig`
   und wird dann farblich hervorgehoben. Diese Klasse sollte immer nur eine
   Meldung tragen — und zur Meldung im Hinweisbalken passen.
5. Überholte Meldungen einfach löschen.

**Kurz gesagt:** Eine neue Meldung berührt drei Stellen — den Hinweisbalken
(in allen Dateien), den Abschnitt auf der Startseite und die Seite
`aktuelles.html`.

> Die vier Meldungen im Auslieferungszustand sind **Beispiele**. Bitte vor dem
> Livegang durch echte Meldungen ersetzen oder löschen.

## 6. Inhalte ändern

Alle Seiten sind eigenständige HTML-Dateien und können mit jedem Texteditor
bearbeitet werden. Zu beachten:

- **Kopf- und Fußbereich sind in jeder Datei enthalten.** Änderungen an
  Navigation, Telefonnummer oder Sprechzeiten im Fußbereich müssen in allen
  HTML-Dateien vorgenommen werden. Mit „Suchen und Ersetzen in allen Dateien“
  (z. B. in Visual Studio Code oder Notepad++) ist das schnell erledigt.
- **Farben und Abstände** stehen gesammelt am Anfang von
  `assets/css/style.css` im Block `:root` und lassen sich dort zentral ändern.
  Das Farbthema ist Navy-Blau (`--c-primary: #22376c`) mit hellem Grau
  (`--c-surface: #f2f4f7`), abgestimmt auf das Praxislogo.
- **Logo:** Im Kopfbereich steht derzeit nur der Schriftzug. Sobald die
  Originaldatei des Praxislogos vorliegt, sie als `assets/img/logo.svg`
  ablegen und in **jeder** HTML-Datei im Kopfbereich das vorbereitete
  Kommentarfeld im `<a class="brand">` durch
  `<img class="brand__mark" src="assets/img/logo.svg" alt="" width="40" height="40">`
  ersetzen. Außerdem ersetzen: `assets/img/favicon.svg` (Browsersymbol) sowie
  die `og:image`-Angabe und der `logo`-Eintrag in den strukturierten Daten.
- **Neue Leistungsseite:** eine bestehende `leistung-*.html` kopieren, Inhalt,
  `<title>`, `description` und `canonical` anpassen, anschließend in der
  Navigation (in allen Dateien), in `leistungen.html` und in `sitemap.xml`
  ergänzen.

## 7. Bilder einsetzen

**Teamfoto.** Auf `praxis.html` (Abschnitt „Unser Team") und auf `index.html`
(Abschnitt „Unsere Praxis") ist der Platz bereits reserviert. So setzen Sie das
Bild ein:

1. Die Bilddatei als `assets/img/team-rech.jpg` ablegen. Empfehlung: Breite
   1600–2000 Pixel, als JPEG gespeichert, Dateigröße unter 400 KB. Größere
   Dateien machen die Seite auf dem Handy unnötig langsam.
2. In beiden Dateien den Block zwischen den Kommentaren `Teamfoto: Anfang`
   und `Teamfoto: Ende` bearbeiten: das `<div class="foto foto--platzhalter">`
   samt Inhalt löschen und bei der darunter stehenden `<img>`-Zeile die
   Kommentarzeichen `<!--` und `-->` entfernen.
3. Im `alt`-Attribut steht die Bildbeschreibung für blinde Nutzerinnen und
   Nutzer sowie für Suchmaschinen — bitte stehen lassen und bei Bedarf
   anpassen.

**Weitere Bilder** (Porträts, Praxisräume) funktionieren nach demselben Muster.
Achten Sie bei Fotos von Mitarbeitenden und Patientinnen und Patienten auf eine
schriftliche Einwilligung zur Veröffentlichung.

## 8. Technische Eigenschaften

- **Keine externen Ressourcen.** Es werden keine Schriftarten, Skripte, Karten
  oder Bilder von fremden Servern geladen. Dadurch sind kein Cookie-Banner und
  keine Einwilligung nach § 25 TDDDG erforderlich.
- **Kein Tracking**, keine Cookies, kein Local Storage.
- **Responsiv** von etwa 320 Pixel Breite an, mobiles Klappmenü.
- **Barrierearm:** semantisches HTML, Sprungmarke zum Inhalt, sichtbare
  Fokusrahmen, ausreichende Farbkontraste, Beschriftungen für alle Formularfelder,
  Berücksichtigung von `prefers-reduced-motion`.
- **Suchmaschinenoptimierung:** eigene Titel und Beschreibungen je Seite,
  Open-Graph-Angaben, `canonical`-Verweise, strukturierte Daten
  (`MedicalClinic` auf der Startseite, `FAQPage` auf der Vasektomie-Seite),
  `sitemap.xml` und `robots.txt`.
- **Druckansicht:** eigene Druckformatierung; Links werden mit Zieladresse
  ausgegeben.
- Die Seite funktioniert vollständig **auch ohne JavaScript**; JavaScript
  verbessert lediglich Klappmenü, Tageshervorhebung und Formularversand.

## 9. Kontaktformular

Da es sich um eine rein statische Website ohne Server-Programm handelt, öffnet
das Formular auf `kontakt.html` das E-Mail-Programm der Besucherin oder des
Besuchers mit einer vorbereiteten Nachricht. Es werden dabei keine Daten an
einen Server übertragen, was die datenschutzrechtliche Bewertung erheblich
vereinfacht.

Soll stattdessen ein echter Formularversand erfolgen, sind zwei Schritte nötig:

1. In `kontakt.html` im `<form>`-Element ein `action`-Ziel auf ein
   serverseitiges Skript setzen (viele Hoster bieten PHP an) und das Attribut
   `data-mailto` entfernen.
2. In `assets/js/main.js` den Abschnitt 3 („Kontaktformular“) entfernen.

In diesem Fall müssen die Datenschutzerklärung ergänzt und – falls ein externer
Dienstleister eingesetzt wird – ein Vertrag zur Auftragsverarbeitung
geschlossen werden.

## 10. Lokal ansehen

Ein Doppelklick auf `index.html` genügt. Alternativ mit einem lokalen
Webserver, was näher an der späteren Auslieferung ist:

```
python3 -m http.server 8000
```

Danach im Browser `http://localhost:8000` aufrufen.
