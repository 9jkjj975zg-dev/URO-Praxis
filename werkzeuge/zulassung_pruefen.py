#!/usr/bin/env python3
"""Prueft die hinterlegten Zulassungsquellen auf Aenderungen.

Was das Werkzeug leistet
------------------------
Es ruft die in therapie/daten/zulassung-quellen.json eingetragenen Seiten der
Zulassungsbehoerde ab, reduziert sie auf den sichtbaren Text und vergleicht
eine Pruefsumme mit der zuletzt gespeicherten. Aendert sich etwas, entsteht
ein Bericht.

Was es bewusst nicht leistet
----------------------------
Es aendert keine medizinischen Angaben. Eine Zulassungsaenderung geht nur
nach aerztlicher Durchsicht in therapie/daten/therapie-pca.json ein. Das
Werkzeug sagt nur: "Hier lohnt ein Blick."

Aufruf
------
    python3 werkzeuge/zulassung_pruefen.py                 nur berichten
    python3 werkzeuge/zulassung_pruefen.py --uebernehmen   Pruefsummen neu setzen
    python3 werkzeuge/zulassung_pruefen.py --bericht b.md  Bericht in Datei

Rueckgabewert: 0, wenn nichts zu tun ist; 1, wenn der Bericht Punkte enthaelt.
Netzfehler allein fuehren nicht zum Abbruch.
"""

import argparse
import hashlib
import json
import re
import sys
import urllib.error
import urllib.request
from datetime import date, datetime
from pathlib import Path

WURZEL = Path(__file__).resolve().parent.parent
QUELLEN = WURZEL / "therapie" / "daten" / "zulassung-quellen.json"
THERAPIEN = WURZEL / "therapie" / "daten" / "therapie-pca.json"

KOPFZEILEN = {
    "User-Agent": "Mozilla/5.0 (kompatibel; Therapiepfad-Zulassungspruefung; "
                  "Urologische Gemeinschaftspraxis Rech)",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "de,en;q=0.8",
}

SKRIPT = re.compile(r"<(script|style|noscript)\b.*?</\1>", re.I | re.S)
KOMMENTAR = re.compile(r"<!--.*?-->", re.S)
TAG = re.compile(r"<[^>]+>")
LEERRAUM = re.compile(r"\s+")


def seite_holen(url, versuche=3, zeitlimit=30):
    """Holt eine Seite. Gibt (text, fehler) zurueck - eines von beiden ist None."""
    letzter = None
    for versuch in range(versuche):
        try:
            anfrage = urllib.request.Request(url, headers=KOPFZEILEN)
            with urllib.request.urlopen(anfrage, timeout=zeitlimit) as antwort:
                roh = antwort.read()
            zeichensatz = "utf-8"
            return roh.decode(zeichensatz, errors="replace"), None
        except urllib.error.HTTPError as fehler:
            letzter = "HTTP %s" % fehler.code
            if fehler.code in (403, 404, 410):
                break            # daran aendert ein weiterer Versuch nichts
        except Exception as fehler:            # Zeitueberschreitung, DNS, TLS
            letzter = type(fehler).__name__
    return None, letzter


def text_herausloesen(html):
    """Macht aus der Seite den sichtbaren Text - ohne Skripte und Auszeichnung."""
    ohne = SKRIPT.sub(" ", html)
    ohne = KOMMENTAR.sub(" ", ohne)
    ohne = TAG.sub(" ", ohne)
    ohne = ohne.replace("&nbsp;", " ")
    return LEERRAUM.sub(" ", ohne).strip().lower()


def pruefsumme(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:32]


def monate_seit(iso):
    try:
        alt = datetime.strptime(iso, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return None
    heute = date.today()
    return (heute.year - alt.year) * 12 + (heute.month - alt.month)


def pruefen(uebernehmen=False):
    daten = json.loads(QUELLEN.read_text(encoding="utf-8"))
    therapien = json.loads(THERAPIEN.read_text(encoding="utf-8"))
    heute = date.today().isoformat()

    geaendert, neu, unerreichbar, unveraendert = [], [], [], []

    for quelle in daten["quellen"]:
        html, fehler = seite_holen(quelle["url"])
        quelle["zuletzt_geprueft"] = heute

        if html is None:
            quelle["letzter_fehler"] = fehler
            unerreichbar.append((quelle, fehler))
            continue
        quelle.pop("letzter_fehler", None)

        summe = pruefsumme(text_herausloesen(html))
        vorher = quelle.get("pruefsumme")

        if not vorher:
            quelle["pruefsumme"] = summe
            neu.append(quelle)
        elif summe != vorher:
            geaendert.append(quelle)
            quelle["zuletzt_geaendert"] = heute
            if uebernehmen:
                quelle["pruefsumme"] = summe
        else:
            unveraendert.append(quelle)

    # Die erstmalige Pruefsumme wird immer gespeichert, sonst meldet der
    # naechste Lauf dieselbe Quelle erneut als neu.
    if uebernehmen or neu:
        QUELLEN.write_text(
            json.dumps(daten, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    alter = monate_seit(therapien.get("stand"))
    frist = daten.get("erinnerung_nach_monaten", 6)
    faellig = alter is not None and alter >= frist

    return {
        "geaendert": geaendert,
        "neu": neu,
        "unerreichbar": unerreichbar,
        "unveraendert": unveraendert,
        "stand": therapien.get("stand"),
        "alter_monate": alter,
        "durchsicht_faellig": faellig,
        "frist": frist,
    }


def bericht_schreiben(ergebnis):
    zeilen = []
    zeilen.append("## Zulassungspruefung vom %s" % date.today().strftime("%d.%m.%Y"))
    zeilen.append("")
    zeilen.append("Datenstand der App: **%s**" % (ergebnis["stand"] or "unbekannt"))
    zeilen.append("")

    if ergebnis["geaendert"]:
        zeilen.append("### Geaenderte Quellen – bitte durchsehen")
        zeilen.append("")
        for q in ergebnis["geaendert"]:
            zeilen.append("- [ ] **%s** (%s) – [%s](%s)" % (
                ", ".join(q["wirkstoffe"]), q["titel"], q["url"], q["url"]))
        zeilen.append("")
        zeilen.append("> Der Text dieser Seiten hat sich seit der letzten Pruefung "
                      "geaendert. Das muss keine Zulassungsaenderung sein – auch "
                      "redaktionelle Anpassungen schlagen an. Bitte den Abschnitt "
                      "\"Anwendungsgebiete\" der Fachinformation vergleichen.")
        zeilen.append("")

    if ergebnis["neu"]:
        zeilen.append("### Erstmals erfasst")
        zeilen.append("")
        for q in ergebnis["neu"]:
            zeilen.append("- %s – %s" % (", ".join(q["wirkstoffe"]), q["url"]))
        zeilen.append("")

    if ergebnis["unerreichbar"]:
        zeilen.append("### Nicht erreichbar")
        zeilen.append("")
        for q, fehler in ergebnis["unerreichbar"]:
            zeilen.append("- %s – %s (%s)" % (", ".join(q["wirkstoffe"]), q["url"], fehler))
        zeilen.append("")
        zeilen.append("> Bleibt eine Quelle mehrere Monate unerreichbar, hat sich "
                      "vermutlich die Adresse geaendert.")
        zeilen.append("")

    if ergebnis["durchsicht_faellig"]:
        zeilen.append("### Regelmaessige Durchsicht faellig")
        zeilen.append("")
        zeilen.append("Der Datenstand ist %d Monate alt (Frist: %d Monate). "
                      "Bitte die Angaben einmal insgesamt gegen die aktuellen "
                      "Fachinformationen pruefen und danach `version` und `stand` "
                      "in `therapie/daten/therapie-pca.json` heraufsetzen."
                      % (ergebnis["alter_monate"], ergebnis["frist"]))
        zeilen.append("")

    if not (ergebnis["geaendert"] or ergebnis["unerreichbar"] or ergebnis["durchsicht_faellig"]):
        zeilen.append("Keine Auffaelligkeiten. %d Quellen unveraendert."
                      % len(ergebnis["unveraendert"]))
        zeilen.append("")

    zeilen.append("---")
    zeilen.append("")
    zeilen.append("**So wird eine Aenderung eingepflegt**")
    zeilen.append("")
    zeilen.append("1. `therapie/daten/therapie-pca.json` anpassen "
                  "(Anwendungsgebiet, Kriterien, Regeln unter `wenn`).")
    zeilen.append("2. `version` und `stand` auf das heutige Datum setzen und unter "
                  "`aenderungen` einen Satz ergaenzen.")
    zeilen.append("3. `python3 werkzeuge/zulassung_pruefen.py --uebernehmen` ausfuehren, "
                  "damit die Pruefsummen den neuen Stand abbilden.")
    zeilen.append("4. Aenderung veroeffentlichen – die Geraete holen sie beim "
                  "naechsten Start von selbst.")
    return "\n".join(zeilen)


def main():
    zerleger = argparse.ArgumentParser(description=__doc__)
    zerleger.add_argument("--uebernehmen", action="store_true",
                          help="geaenderte Pruefsummen als neuen Stand speichern")
    zerleger.add_argument("--bericht", metavar="DATEI",
                          help="Bericht zusaetzlich in diese Datei schreiben")
    argumente = zerleger.parse_args()

    ergebnis = pruefen(uebernehmen=argumente.uebernehmen)
    bericht = bericht_schreiben(ergebnis)
    print(bericht)

    if argumente.bericht:
        Path(argumente.bericht).write_text(bericht + "\n", encoding="utf-8")

    etwas_zu_tun = bool(ergebnis["geaendert"] or ergebnis["unerreichbar"]
                        or ergebnis["durchsicht_faellig"])
    return 1 if etwas_zu_tun else 0


if __name__ == "__main__":
    sys.exit(main())
