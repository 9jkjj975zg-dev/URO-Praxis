# -*- coding: utf-8 -*-
"""Baut aus dem Ordner variante-hell eine einzige, in sich geschlossene
   Vorschaudatei: alle Seiten, Stylesheet, Skript, Schriften und das Foto
   sind darin eingebettet. Keine Unterdateien, kein eingebetteter Rahmen."""
import base64, html, os, re

ORDNER = os.path.dirname(os.path.abspath(__file__))
# Gebaut wird aus dem Ordner eine Ebene darueber.
os.chdir(os.path.dirname(ORDNER))

SEITEN = [
    ("Hauptseiten", [
        ("index.html", "Startseite"),
        ("aktuelles.html", "Aktuelles"),
        ("praxis.html", "Praxis &amp; Team"),
        ("leistungen.html", "Leistungen (Übersicht)"),
        ("kontakt.html", "Kontakt &amp; Anfahrt"),
    ]),
    ("Leistungen", [
        ("leistung-vorsorge.html", "Krebsfrüherkennung &amp; Vorsorge"),
        ("leistung-prostatavergroesserung.html", "Gutartige Prostatavergrößerung"),
        ("leistung-vasektomie.html", "Vasektomie"),
        ("leistung-onkologie.html", "Onkologie &amp; Nachsorge"),
        ("leistung-sonographie.html", "Sonographie"),
        ("leistung-labordiagnostik.html", "Blut- und Urindiagnostik"),
        ("leistung-ambulante-operationen.html", "Ambulante Operationen"),
        ("leistung-kinderwunsch.html", "Kinderwunsch"),
        ("leistung-erektile-dysfunktion.html", "Erektile Dysfunktion"),
    ]),
    ("Kosten", [
        ("kassenleistung.html", "Was die Kasse zahlt"),
        ("privatpatienten.html", "Privatpatienten &amp; Beihilfe"),
        ("selbstzahler-preise.html", "Preise für Selbstzahler"),
    ]),
    ("Rechtliches", [
        ("impressum.html", "Impressum"),
        ("datenschutz.html", "Datenschutz"),
        ("404.html", "Fehlerseite"),
    ]),
]
ALLE = [d for _, g in SEITEN for d, _ in g]


def daten_uri(pfad, typ):
    with open(pfad, "rb") as f:
        return "data:%s;base64,%s" % (typ, base64.b64encode(f.read()).decode("ascii"))


# ---------------------------------------------------------------- Stylesheet
css = open("assets/css/style.css", encoding="utf-8").read()
for name in ("jost-latin", "jost-latin-ext"):
    css = css.replace('url("../fonts/%s.woff2")' % name,
                      'url(%s)' % daten_uri("assets/fonts/%s.woff2" % name, "font/woff2"))

# ------------------------------------------------------------------- Skript
zeilen = open("assets/js/main.js", encoding="utf-8").read().split("\n")


def teil(von, bis):            # 1-basiert, beide einschliesslich
    return "\n".join(zeilen[von - 1:bis])


# Was an der Kopf- und Fussleiste haengt, laeuft genau einmal.
# Was zur jeweiligen Seite gehoert, laeuft nach jedem Seitenwechsel neu.
rumpf_skript = "\n".join([
    teil(1, 39) + "\n" + teil(115, 121),      # Grundgeruest, Menue, Jahreszahl
    teil(131, 163),                           # aufklappbare Untermenues
    "(function () {\n" + teil(598, 672) + "\n})();",   # Laufband im Meldungsbalken
    teil(685, 699),                           # klebender Kopfbereich
    teil(709, 740),                           # Menueflaeche auf schmalen Schirmen
])

seiten_skript = "\n".join([
    teil(40, 114),     # Wochentag hervorheben, Kontaktformular
    teil(170, 205),    # Patientenstimmen
    teil(207, 597),    # Vorsorge-Check, Vertretung, Schema, Einblenden, Parallax, IPSS
    teil(752, 789),    # "Jetzt geoeffnet"
])

# Damit sich bei jedem Seitenwechsel nichts anhaeuft, werden die Beobachter
# und die Lauscher an window und document gemerkt und vorher geloest.
seiten_skript = (seiten_skript
                 .replace("window.addEventListener(", "MERKER.fenster(")
                 .replace("document.addEventListener(", "MERKER.dokument(")
                 .replace("new IntersectionObserver(", "MERKER.beobachter("))

# ------------------------------------------------------- Kopf- und Fussteil
index = open("index.html", encoding="utf-8").read()
rumpf_vor = index.split("<body>")[1].split('<main id="inhalt">')[0]
rumpf_nach = index.split("</main>")[1].split("</body>")[0]
rumpf_nach = re.sub(r'<script src="assets/js/main\.js" defer></script>\s*', "", rumpf_nach)
# Die Sprungmarke zeigt auf den Inhaltsbereich, der jetzt ausgetauscht wird.
rumpf_vor = rumpf_vor.replace('<a class="skip-link" href="#inhalt">',
                              '<a class="skip-link" href="#inhalt">')

# --------------------------------------------------------- Seiten einsammeln
foto = daten_uri("assets/img/team-rech.jpg", "image/jpeg")
vorlagen = []
for datei in ALLE:
    quelle = open(datei, encoding="utf-8").read()
    haupt = "<main" + quelle.split("<main", 1)[1].split("</main>")[0] + "</main>"
    # Das Foto wird eingebettet; die zweite Aufloesung braucht die Vorschau nicht.
    haupt = re.sub(r'\s*srcset="[^"]*team-rech[^"]*"', "", haupt)
    haupt = re.sub(r'\s*sizes="[^"]*"', "", haupt)
    haupt = haupt.replace("assets/img/team-rech.jpg", foto)
    titel = re.search(r"<title>(.*?)</title>", quelle, re.S).group(1).strip()
    vorlagen.append(
        '<template data-seite="%s" data-titel="%s">\n%s\n</template>'
        % (datei, html.escape(titel, quote=True), haupt))

auswahl = []
for gruppe, eintraege in SEITEN:
    auswahl.append('      <optgroup label="%s">' % gruppe)
    for datei, name in eintraege:
        auswahl.append('        <option value="%s">%s</option>' % (datei, name))
    auswahl.append("      </optgroup>")

# ------------------------------------------------------------ Zusammensetzen
schablone = open(os.path.join(ORDNER, "schablone.html"), encoding="utf-8").read()
ergebnis = (schablone
            .replace("/*STYLESHEET*/", css)
            .replace("<!--AUSWAHL-->", "\n".join(auswahl))
            .replace("<!--RUMPF-VOR-->", rumpf_vor)
            .replace("<!--RUMPF-NACH-->", rumpf_nach)
            .replace("<!--VORLAGEN-->", "\n".join(vorlagen))
            .replace("/*RUMPF-SKRIPT*/", rumpf_skript)
            .replace("/*SEITEN-SKRIPT*/", seiten_skript))

ziel = os.path.join(os.path.dirname(ORDNER), "vorschau.html")
open(ziel, "w", encoding="utf-8").write(ergebnis)
print("geschrieben:", ziel, round(len(ergebnis.encode("utf-8")) / 1024), "KB")
