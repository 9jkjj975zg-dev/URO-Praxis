# Therapiepfad Prostatakarzinom

Eine kleine Anwendung, die sich mit den Angaben zum Patienten durchklicken
lässt und am Ende zeigt, welche Systemtherapien für genau diese Konstellation
zugelassen sind. Sie lässt sich auf dem Handy als App auf den Startbildschirm
legen und arbeitet auch ohne Netz.

Adresse: `https://www.hanau-urologie.de/therapie/`

Der Ordner `therapie/` ist **in sich geschlossen**: Er greift auf keine Datei
ausserhalb zu. Zum Veroeffentlichen genuegt es, ihn als Ganzes in das
Web-Verzeichnis zu legen - gleich auf welchem Server und neben welcher
Website.

> **Nur für Fachkreise.** Die Anwendung ist bewusst nicht aus der Website
> verlinkt, steht in `robots.txt` auf „nicht indexieren“ und zeigt beim ersten
> Start eine Bestätigung. Grund ist § 10 Heilmittelwerbegesetz: Angaben zu
> verschreibungspflichtigen Arzneimitteln gehören nicht in die
> Patienteninformation.

---

## Was wo liegt

| Datei | Inhalt |
|---|---|
| `daten/therapie-pca.json` | **Alle medizinischen Inhalte.** Stadien, Fragen, Therapien, Regeln. |
| `daten/zulassung-quellen.json` | Liste der überwachten Behördenseiten mit Prüfsummen. Wird vom Werkzeug gepflegt. |
| `index.html` | Gerüst der Seite. Enthält keine Therapieangaben. |
| `assets/logik.js` | Wertet die Regeln aus. Kennt keine Wirkstoffe. |
| `assets/daten.js` | Holt und speichert die Datendatei. |
| `assets/app.js` | Oberfläche. |
| `assets/app.css` | Gestaltung. |
| `sw.js` | Sorgt dafür, dass die App ohne Netz startet. |
| `manifest.webmanifest`, `img/` | Symbol und Name auf dem Startbildschirm. |
| `assets/fonts/` | Die Schrift Jost, damit der Ordner fuer sich allein lauffaehig ist. |
| `../werkzeuge/zulassung_pruefen.py` | Monatliche Prüfung der Quellen. |
| `../werkzeuge/symbole_erzeugen.py` | Erzeugt die Symbole neu, falls das Logo sich ändert. |

Der Grundsatz dahinter: **Inhalt und Programm sind getrennt.** Für eine
geänderte Zulassung muss niemand Programmcode anfassen.

---

## Eine Zulassungsänderung einpflegen

1. `daten/therapie-pca.json` öffnen und den betroffenen Eintrag unter
   `therapien` ändern:
   * `zulassung` – der Wortlaut des Anwendungsgebiets,
   * `kriterien` – die Stichpunkte, die in der Karte erscheinen,
   * `wenn` – die Regel, nach der die Option angezeigt wird (siehe unten),
   * `hinweise` – was in der Praxis zu beachten ist.
2. Ganz oben `version` und `stand` auf das heutige Datum setzen
   (Format `JJJJ-MM-TT`).
3. Unter `aenderungen` einen Satz ergänzen, was geändert wurde.
4. Datei hochladen bzw. den Stand veröffentlichen.
5. `python3 werkzeuge/zulassung_pruefen.py --uebernehmen` ausführen, damit die
   Prüfsummen den neuen Stand abbilden.

Mehr ist nicht nötig: Jedes Gerät holt die Datei beim nächsten Start, merkt die
neue Fassung und meldet sie dem Benutzer. Eine Neuinstallation entfällt.

### Prüfen, ob die Datei noch in Ordnung ist

```
python3 -c "import json; json.load(open('therapie/daten/therapie-pca.json')); print('in Ordnung')"
```

---

## Die Regelsprache

Jede Therapie und jede Frage kann einen Block `wenn` haben. Er besteht aus
einzelnen Bedingungen der Form:

```json
{ "frage": "metastasen", "ist": ["ja"] }
```

Gelesen: „Die Frage mit der Kennung `metastasen` ist mit `ja` beantwortet.“

Diese Bedingungen lassen sich verbinden:

```json
"wenn": {
  "alle":  [ ... ],   /* jede Bedingung muss zutreffen            */
  "eine":  [ ... ],   /* mindestens eine muss zutreffen           */
  "nicht": [ ... ]    /* keine davon darf zutreffen               */
}
```

Eine Bedingung hat **drei** mögliche Ausgänge, nicht zwei:

| Ausgang | wann | Wirkung in der App |
|---|---|---|
| erfüllt | Die Angabe passt. | Therapie steht unter „Zugelassen“. |
| nicht | Die Angabe schließt aus. | Therapie steht unter „Nicht zutreffend“, mit Begründung. |
| offen | Die Angabe fehlt oder ist unbekannt. | Therapie steht unter „Möglich, sobald geklärt“. |

Der dritte Ausgang ist Absicht: Eine Option darf nicht verschwinden, nur weil
ein Befund noch aussteht. Eine Antwortmöglichkeit gilt als „unbekannt“, wenn
sie in der Frage mit `"offen": true` gekennzeichnet ist.

Zusätzlich kennt jede Therapie ein `pruefen`: Bedingungen, die **nicht**
ausschließen, aber einen Warnhinweis auf der Karte erzeugen – etwa der
Hinweis, dass ein Anwendungsgebiet präparatabhängig ist.

### Eine neue Frage aufnehmen

```json
{
  "id": "kurze_kennung",
  "text": "Die Frage, wie sie auf dem Bildschirm steht?",
  "hilfe": "Ein Satz, der die Einstufung erklärt.",
  "wenn": { "alle": [ { "frage": "metastasen", "ist": ["ja"] } ] },
  "optionen": [
    { "wert": "ja",        "text": "Ja" },
    { "wert": "nein",      "text": "Nein" },
    { "wert": "unbekannt", "text": "Noch offen", "offen": true }
  ]
}
```

`wenn` bei einer Frage steuert, ob sie überhaupt gestellt wird. Ohne `wenn`
wird sie immer gestellt. Die Reihenfolge in der Datei ist die Reihenfolge im
Fragebogen.

### Eine neue Substanz aufnehmen

Einen vorhandenen Eintrag unter `therapien` kopieren, `id` eindeutig vergeben,
`stadium` auf eine der Kennungen unter `stadien` setzen und die Regel
anpassen. Anschließend die Quelle unter `quelle` eintragen – sie wandert beim
nächsten Lauf des Prüfwerkzeugs von selbst in die Überwachung.

---

## Die automatische Prüfung

`.github/workflows/zulassung-pruefen.yml` startet am 1. jedes Monats das
Werkzeug `werkzeuge/zulassung_pruefen.py`. Dieses ruft die Seiten der
Zulassungsbehörde ab, vergleicht den sichtbaren Text mit der letzten Prüfsumme
und legt bei Auffälligkeiten eine Aufgabe (Issue) an.

Was das Werkzeug **nicht** tut: medizinische Angaben ändern. Es meldet nur,
wo ein Blick lohnt. Eine geänderte Seite ist nicht zwingend eine geänderte
Zulassung – auch eine redaktionelle Überarbeitung schlägt an. Die Entscheidung
bleibt ärztlich.

Zusätzlich erinnert das Werkzeug, wenn der Datenstand älter als sechs Monate
ist (einstellbar über `erinnerung_nach_monaten` in
`daten/zulassung-quellen.json`).

Von Hand starten:

```
python3 werkzeuge/zulassung_pruefen.py                 # nur berichten
python3 werkzeuge/zulassung_pruefen.py --uebernehmen   # Prüfsummen neu setzen
```

---

## Am Programm selbst etwas ändern

Wird eine Datei unter `assets/`, `index.html` oder `sw.js` geändert, muss in
`sw.js` die Zahl in

```js
var SPEICHER = 'therapiepfad-v1';
```

erhöht werden (`-v2`, `-v3`, …). Sonst arbeiten bereits installierte Geräte
mit den alten Dateien weiter. Die App meldet den Benutzern dann von selbst
„Eine neuere Programmfassung liegt bereit“.

### Örtlich ausprobieren

```
python3 -m http.server 8099
```

Danach `http://127.0.0.1:8099/therapie/` aufrufen. Der Service Worker läuft
auf `127.0.0.1` genauso wie über HTTPS.

---

## Datenschutz

Die Angaben zum Patienten bleiben im Arbeitsspeicher des Geräts und werden
weder gespeichert noch übertragen. Dauerhaft gespeichert werden nur die
Therapiedaten der App und die Bestätigung der Fachkreis-Abfrage. Es werden
keine Zugriffszahlen erhoben und keine fremden Dienste geladen.
