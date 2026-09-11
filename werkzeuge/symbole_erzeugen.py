#!/usr/bin/env python3
"""Erzeugt die App-Symbole des Therapiepfads aus dem Praxislogo.

Grundlage ist assets/img/logo.svg - dieselben beiden Sicheln in denselben
Farben wie im Kopf der Website, nur ohne die Einblend-Bewegung und auf
weissem Grund, damit sie auf jedem Hintergrund des Startbildschirms stehen.

Erzeugt werden:
    therapie/img/symbol.svg            fuer Browser und Android
    therapie/img/logo.svg              freistehend, fuer den Kopf der App
    therapie/img/symbol-512.png        Android, grosse Darstellung
    therapie/img/symbol-192.png        Android, Startbildschirm
    therapie/img/symbol-180.png        iPhone und iPad
    therapie/img/symbol-maskiert.png   Android, wenn das Geraet selbst
                                       zuschneidet (Kreis, Tropfen, Quadrat)

Die PNG-Dateien liegen fertig im Ordner. Dieses Werkzeug wird nur gebraucht,
wenn sich das Logo aendert. Zum Umwandeln nach PNG wird ein vorhandener
Chrome oder Chromium verwendet; ist keiner zu finden, sagt das Werkzeug das
und die SVG-Datei ist trotzdem geschrieben.

Aufruf:  python3 werkzeuge/symbole_erzeugen.py
"""

import glob
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

WURZEL = Path(__file__).resolve().parent.parent
LOGO = WURZEL / "assets" / "img" / "logo.svg"
ZIEL = WURZEL / "therapie" / "img"

KANTE = 512                 # Bezugsgroesse der SVG-Datei
LOGO_FELD = 2110            # Kantenlaenge des Logos in seinen eigenen Einheiten
LOGO_ECKE = (2453, 1426)    # linke obere Ecke des Logos in seinen Einheiten

GRUND = "#ffffff"
ECKRADIUS = 92              # abgerundetes Quadrat, wie es die Systeme zeigen

BROWSER = ["chromium", "chromium-browser", "google-chrome", "google-chrome-stable",
           "chrome", "msedge",
           "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
           "C:/Program Files/Google/Chrome/Application/chrome.exe"]

# Zusaetzlich wird nach einer mitgelieferten Chromium-Fassung gesucht.
MUSTER = ["/opt/pw-browsers/chromium-*/chrome-linux/chrome",
          "~/.cache/ms-playwright/chromium-*/chrome-linux/chrome"]


def logo_pfade():
    """Holt die beiden Pfade des Logos samt ihrer Verschiebungen."""
    text = LOGO.read_text(encoding="utf-8")
    gruppen = []
    for teil in re.finditer(
            r'<g transform="(matrix\([^"]+\))">\s*<g transform="(matrix\([^"]+\))">\s*'
            r'<path d="([^"]+)" style="fill:([^"]+)"/>', text):
        gruppen.append({
            "aussen": teil.group(1),
            "innen": teil.group(2),
            "d": teil.group(3),
            "farbe": teil.group(4),
        })
    if len(gruppen) != 2:
        raise SystemExit("Im Logo wurden nicht die erwarteten zwei Pfade gefunden.")
    return gruppen


def svg_bauen(anteil, eckradius, grund=GRUND):
    """Setzt das Logo mittig auf einen Grund. anteil = Breite des Logos.
    grund=None laesst den Grund weg - fuer die Marke innerhalb der App."""
    gruppen = logo_pfade()
    groesse = KANTE * anteil
    massstab = groesse / LOGO_FELD
    rand = (KANTE - groesse) / 2.0

    zeilen = [
        '<!-- App-Symbol des Therapiepfads: das Logo der Praxis auf weissem',
        '     Grund. Erzeugt von werkzeuge/symbole_erzeugen.py aus',
        '     assets/img/logo.svg - nicht von Hand aendern. -->',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" role="img"' % (KANTE, KANTE),
        '     aria-label="Therapiepfad Prostatakarzinom"',
        '     style="fill-rule:evenodd;clip-rule:evenodd">',
        ('  <rect width="%d" height="%d"%s fill="%s"/>' % (
            KANTE, KANTE, (' rx="%d"' % eckradius) if eckradius else "", grund))
        if grund else '  <!-- ohne Grund: das Logo steht frei -->',
        '  <g transform="translate(%.4f %.4f) scale(%.6f) translate(%d %d)">' % (
            rand, rand, massstab, -LOGO_ECKE[0], -LOGO_ECKE[1]),
    ]
    for g in gruppen:
        zeilen.append('    <g transform="%s">' % g["aussen"])
        zeilen.append('      <g transform="%s">' % g["innen"])
        zeilen.append('        <path d="%s" style="fill:%s"/>' % (g["d"], g["farbe"]))
        zeilen.append('      </g>')
        zeilen.append('    </g>')
    zeilen.append('  </g>')
    zeilen.append('</svg>')
    return "\n".join(zeilen) + "\n"


def browser_finden():
    for name in BROWSER:
        gefunden = shutil.which(name) or (name if Path(name).exists() else None)
        if gefunden:
            return gefunden
    for muster in MUSTER:
        muster = str(Path(muster).expanduser())
        treffer = sorted(glob.glob(muster))
        if treffer:
            return treffer[-1]
    return None


def png_schreiben(browser, svg_text, ziel, kante):
    """Laesst den Browser die SVG-Datei in der gewuenschten Groesse ablichten."""
    with tempfile.TemporaryDirectory() as ordner:
        ordner = Path(ordner)
        (ordner / "symbol.svg").write_text(svg_text, encoding="utf-8")
        (ordner / "seite.html").write_text(
            '<!DOCTYPE html><meta charset="utf-8">'
            '<style>html,body{margin:0;padding:0;background:%s}'
            'img{display:block;width:%dpx;height:%dpx}</style>'
            '<img src="symbol.svg" alt="">' % (GRUND, kante, kante),
            encoding="utf-8")
        befehl = [
            browser, "--headless=new", "--disable-gpu", "--hide-scrollbars",
            "--no-sandbox" if hasattr(os, "geteuid") and os.geteuid() == 0 else "--no-first-run",
            "--force-device-scale-factor=1",
            "--screenshot=" + str(ordner / "bild.png"),
            "--window-size=%d,%d" % (kante, kante),
            (ordner / "seite.html").as_uri(),
        ]
        lauf = subprocess.run(befehl, capture_output=True, timeout=120)
        bild = ordner / "bild.png"
        if not bild.exists():
            raise SystemExit("Der Browser hat kein Bild erzeugt:\n"
                             + lauf.stderr.decode("utf-8", "replace")[-800:])
        shutil.copy(bild, ziel)


def main():
    ZIEL.mkdir(parents=True, exist_ok=True)

    # Das Symbol fuer Browser und Manifest: abgerundetes Quadrat.
    symbol = svg_bauen(anteil=0.68, eckradius=ECKRADIUS)
    (ZIEL / "symbol.svg").write_text(symbol, encoding="utf-8")
    print("geschrieben: symbol.svg")

    # Das freistehende Logo fuer den Startbildschirm der App selbst. Es liegt
    # hier noch einmal, damit der Ordner therapie/ fuer sich vollstaendig ist.
    (ZIEL / "logo.svg").write_text(
        svg_bauen(anteil=1.0, eckradius=0, grund=None), encoding="utf-8")
    print("geschrieben: logo.svg")

    browser = browser_finden()
    if not browser:
        print("\nKein Chrome oder Chromium gefunden - die PNG-Dateien bleiben,")
        print("wie sie sind. Sie liegen fertig im Ordner therapie/img/ und")
        print("werden nur gebraucht, wenn sich das Logo aendert.")
        return 0
    print("verwende:", browser)

    # Ohne Rundung: iOS und Android runden selbst ab.
    eckig = svg_bauen(anteil=0.68, eckradius=0)
    # Deutlich kleiner: Android schneidet bei "maskierbar" bis zu 20 % weg.
    maskiert = svg_bauen(anteil=0.46, eckradius=0)

    auftraege = [
        ("symbol-512.png", symbol, 512),
        ("symbol-192.png", symbol, 192),
        ("symbol-180.png", eckig, 180),
        ("symbol-maskiert.png", maskiert, 512),
    ]
    for name, quelle, kante in auftraege:
        png_schreiben(browser, quelle, ZIEL / name, kante)
        print("geschrieben:", name)
    return 0


if __name__ == "__main__":
    sys.exit(main())
