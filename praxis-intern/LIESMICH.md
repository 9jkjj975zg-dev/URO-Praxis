# Praxisinterne Werkzeuge

**Dieser Ordner gehört nicht auf den Webserver.** Er enthält ein Werkzeug für die
Arbeit in der Praxis, nicht für Besucher der Website. Beim Hochladen der Seite per
FTP bitte den Ordner `praxis-intern/` auslassen. Zur Sicherheit sperren ihn
zusätzlich `robots.txt` und `.htaccess` – aber die verlässlichste Sperre ist,
ihn gar nicht erst hochzuladen.

---

## recall-vorsorge.html – Erinnerung an die Vorsorge

Das Praxisverwaltungssystem kann Patienten nicht nach einem eigenen Muster an die
nächste Vorsorge erinnern. Dieses Werkzeug übernimmt genau diesen Schritt: Es liest
einen Listenexport aus tomedo, rechnet aus, wer nach dem eingestellten Muster fällig
ist, und erzeugt daraus Briefe, E-Mail-Texte und eine Telefonliste.

### Wer angeschrieben wird

Bewusst eng gefasst: Patienten, die die erweiterte Vorsorge schon einmal **selbst
bezahlt** haben – als Selbstzahler- oder Privatleistung – und denen damals **kein
Kontrolltermin** genannt wurde. Sie kennen die Leistung und haben sie für sich als
sinnvoll bewertet; es fehlt nur der Anstoß, sie zu wiederholen.

Wer in geregelter Kontrolle oder Nachsorge steht, wird ausgenommen. Diese Patienten
werden ohnehin einbestellt, und eine Erinnerung an eine kostenpflichtige Leistung
wäre dort unpassend. Ebenso ausgenommen: reine Kassenvorsorgen ohne Selbstzahleranteil,
Patienten mit bereits vereinbartem Termin, Patienten ohne dokumentierte Einwilligung
und Patienten oberhalb der eingestellten Altersgrenze.

### Öffnen

Doppelklick auf `recall-vorsorge.html`. Die Datei öffnet sich im Standardbrowser und
läuft dort vollständig – ohne Installation, ohne Internet, ohne Server. Sie darf auf
den Praxisrechner kopiert werden, wohin es passt; sie braucht keine Nachbardateien.

Getestet mit Chrome, Edge und Firefox in aktuellen Fassungen.

### Der Export aus tomedo

Gebraucht wird eine CSV-Liste von Patienten mit dem Datum ihrer letzten erweiterten
Vorsorge. In tomedo entsteht sie über eine Abfrage auf die abgerechneten Leistungen –
also über die GOÄ-Ziffern oder das Rechnungspaket der Vorsorge – mit anschließendem
Export. Die Menübezeichnungen unterscheiden sich je nach Version; wenn die Abfrage
nicht auf Anhieb gelingt, hilft der tomedo-Support schneller als jedes Ausprobieren.
Die Abfrage einmal als Vorlage speichern, dann dauert der monatliche Durchgang Minuten.

Pflicht ist nur eine Spalte: **das Datum der letzten Vorsorge**. Alles andere
verbessert das Ergebnis. Die vollständige Spaltenliste steht im Werkzeug selbst unter
dem Reiter „Anleitung“.

Die Spaltenüberschriften werden automatisch erkannt und die Zuordnung gespeichert –
ab dem zweiten Durchgang ist dort nichts mehr zu tun.

### Der monatliche Ablauf

1. Abfrage in tomedo laufen lassen, als CSV exportieren.
2. `recall-vorsorge.html` öffnen, Export einlesen.
3. Reiter **3. Auswahl** durchsehen. Wichtiger als die Liste der Anzuschreibenden ist
   die Liste darunter: zu jedem übersprungenen Datensatz steht dort der Grund.
   Stimmt ein Grund nicht, gehört das Muster geändert – nicht die Liste von Hand
   nachgebessert.
4. Briefe drucken, E-Mail-Texte aus dem Praxispostfach versenden, Telefonliste an die
   Anmeldung geben.
5. Reiter **7. Rückschreiben**: Datei sichern und in tomedo einlesen oder die Daten
   von Hand nachtragen. **Ohne diesen Schritt wiederholt sich der nächste Durchgang.**
6. Exportdatei, Rückschreibedatei und Ausdrucke anschließend löschen beziehungsweise
   vernichten.

### Datenschutz

Die Datei enthält im Kopf eine Content-Security-Policy mit `connect-src 'none'` und
`form-action 'none'`. Der Browser verbietet dem Skript damit jede Netzverbindung: Es
kann nichts nachladen und nichts senden, auch nicht versehentlich. Die eingelesene
Patientenliste steht ausschließlich im Arbeitsspeicher und ist beim Schließen des
Fensters weg. Dauerhaft gespeichert werden nur Einstellungen – Muster, Textvorlagen,
Praxisangaben, Spaltenzuordnung –, niemals Patientendaten.

Wer die Datei verändert, darf die Zeile mit der Content-Security-Policy nicht
entfernen. Sie ist die technische Zusicherung, dass nichts abfließt.

### Einwilligung

Die Erinnerung an eine kostenpflichtige Vorsorge ist rechtlich Werbung für eine
Gesundheitsdienstleistung. Zulässig ist sie, wenn der Patient sie ausdrücklich
wünscht:

- **Schriftlich und ausdrücklich.** Weil es um Gesundheitsdaten geht, verlangt
  Artikel 9 Absatz 2 Buchstabe a DSGVO eine ausdrückliche Einwilligung; ein
  stillschweigendes Einverständnis genügt nicht.
- **Für E-Mail und SMS zusätzlich § 7 UWG**: vorherige ausdrückliche Einwilligung,
  und in jeder Nachricht ein Widerrufshinweis. Die mitgelieferte E-Mail-Vorlage
  enthält ihn.
- **Der Kanal gehört in die Einwilligung.** Wer nur Post wünscht, bekommt keine E-Mail.
- **Widerruf muss ankommen.** Er gehört in die Karteikarte und muss im nächsten Export
  sichtbar sein, sonst läuft er ins Leere. Das Werkzeug wertet dafür die Spalten
  „Einwilligung“ und „Werbesperre / Widerruf“ aus.

Ein Formulierungsvorschlag für die Anmeldung – **vor dem Einsatz bitte prüfen lassen**:

> **Erinnerung an die nächste Vorsorge**
>
> Ich möchte von der Urologischen Gemeinschaftspraxis Rech daran erinnert werden,
> wenn nach dem üblichen Abstand wieder eine urologische Vorsorgeuntersuchung
> ansteht. Mir ist bekannt, dass Teile dieser Untersuchung Selbstzahlerleistungen
> sind und dass mit der Erinnerung kein Termin und keine Behandlung verbunden ist.
>
> Die Erinnerung soll erfolgen per   ☐ Brief   ☐ E-Mail   ☐ Telefon
>
> Ich kann diese Einwilligung jederzeit formlos widerrufen – mündlich, telefonisch
> oder schriftlich –, ohne dass mir daraus ein Nachteil entsteht. Ab dem Widerruf
> werde ich nicht mehr erinnert.
>
> Ort, Datum, Unterschrift

Das ist eine sorgfältig erstellte Vorlage, aber keine Rechtsberatung. Wie bei
Impressum und Datenschutzerklärung gilt: einmal von der Landesärztekammer oder
anwaltlich prüfen lassen – einmal geprüft, trägt es jahrelang.

### Was das Werkzeug bewusst nicht tut

Es versendet nichts. Kein automatischer E-Mail- oder SMS-Versand, keine
Schnittstelle, kein Hintergrunddienst. Automatischer Versand bräuchte einen Server
und einen Auftragsverarbeitungsvertrag; das gehört zu einem Dienstleister oder in ein
Modul der Praxissoftware, nicht in eine Datei auf dem Praxisrechner.

Es trifft auch keine medizinischen Entscheidungen. Die Abstände sind eingestellte
Werte, keine Empfehlung – ausgeliefert wird der Jahresrhythmus, den auch
`leistung-vorsorge.html` nennt.
