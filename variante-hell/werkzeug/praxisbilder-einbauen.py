# -*- coding: utf-8 -*-
"""Baut die Praxisbilder in den hellen Entwurf ein.

   Erwartet die Originale unter werkzeug/originale/ unter diesen Namen:

       anmeldung-weit.jpg   Blick ueber den Tresen in den Flur (breites Bild)
       empfang.jpg          Empfangstresen mit Eingangstuer
       wartebereich.jpg     Wartebereich
       sprechzimmer.jpg     Sprechzimmer
       eingriffsraum.jpg    Eingriffsraum

   Aus jedem Original entstehen zwei Dateien in assets/img/: eine fuer
   normale Bildschirme und eine doppelt so grosse fuer hochaufloesende.
   Die Aufnahmedaten (EXIF) werden dabei entfernt - in ihnen stehen sonst
   Kameramodell, Aufnahmezeit und unter Umstaenden der Standort.

   Fehlt ein Original, bleibt an seiner Stelle der Platzhalter stehen.
   Das Skript laesst sich beliebig oft laufen.

       python3 werkzeug/praxisbilder-einbauen.py
"""
import os
import re
import sys

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Pillow fehlt. Einmalig installieren mit:\n"
             "    python3 -m pip install pillow")

ORDNER = os.path.dirname(os.path.abspath(__file__))
os.chdir(os.path.dirname(ORDNER))

QUELLEN = os.path.join(ORDNER, "originale")
ZIEL = "assets/img"

# Seitenverhaeltnis 3:2, wie beim Teamfoto. Breiten in Bildpunkten.
BREIT = 1600          # das breite Bild oben
KACHEL = 900          # die vier Kacheln darunter

BILDER = [
    # Datei           Breite  Ueberschrift             Bildbeschreibung
    ("anmeldung-weit", BREIT, "Am Empfang",
     "Blick über den Empfangstresen in den Flur der Praxis, an der Wand das "
     "Praxislogo; eine Person in Praxiskleidung geht vorbei und ist nur als "
     "Schemen zu erkennen."),
    ("empfang", KACHEL, "Empfang und Anmeldung",
     "Empfangstresen der Praxis, dahinter die gläserne Eingangstür mit dem "
     "Praxislogo; links eine große Zimmerpflanze, rechts ein Blumenstrauß."),
    ("wartebereich", KACHEL, "Wartebereich",
     "Wartebereich mit grauen Stühlen an der Wand, einem niedrigen Tisch aus "
     "Beton mit Blumen, einer Garderobe und einer Zimmerpflanze am Fenster."),
    ("sprechzimmer", KACHEL, "Sprechzimmer",
     "Sprechzimmer mit Schreibtisch und zwei Stühlen für das Gespräch, "
     "Sideboard und einem anatomischen Modell; an der Wand ein Bild der "
     "Frankfurter Skyline, daneben ein großes Fenster."),
    ("eingriffsraum", KACHEL, "Eingriffsraum",
     "Eingriffsraum mit höhenverstellbarem Operationstisch, Operationsleuchte, "
     "Monitor und den Geräten für endoskopische Eingriffe."),
]

KAMERA_SVG = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" '
              'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" '
              'aria-hidden="true" focusable="false"><path d="M23 19a2 2 0 0 1-2 '
              '2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>'
              '<circle cx="12" cy="13" r="4"/></svg>')


def aufbereiten(name, breite):
    """Schneidet auf 3:2 und legt zwei Groessen ab. Gibt (Breite, Hoehe) der
       kleineren Fassung zurueck - oder None, wenn das Original fehlt."""
    quelle = None
    for endung in (".jpg", ".jpeg", ".JPG", ".JPEG", ".png", ".PNG"):
        pfad = os.path.join(QUELLEN, name + endung)
        if os.path.exists(pfad):
            quelle = pfad
            break
    if not quelle:
        return None

    bild = Image.open(quelle)
    # Hochkant aufgenommene Bilder stehen sonst auf dem Kopf.
    bild = ImageOps.exif_transpose(bild).convert("RGB")
    hoehe = round(breite * 2 / 3)

    for faktor, zusatz in ((1, ""), (2, "@2x")):
        fassung = ImageOps.fit(bild, (breite * faktor, hoehe * faktor),
                               method=Image.LANCZOS, centering=(0.5, 0.5))
        ziel = os.path.join(ZIEL, "praxis-%s%s.jpg" % (name, zusatz))
        # ohne exif= gespeichert: die Aufnahmedaten bleiben draussen
        fassung.save(ziel, "JPEG", quality=82, optimize=True, progressive=True)
        print("  %-34s %5d x %4d  %5.0f KB"
              % (os.path.basename(ziel), breite * faktor, hoehe * faktor,
                 os.path.getsize(ziel) / 1024))
    return breite, hoehe


def figur(name, titel, beschreibung, masse, breit=False):
    """Das Markup fuer ein fertiges Bild."""
    b, h = masse
    klasse = "foto foto--breit" if breit else "foto"
    groessen = ("(max-width: 900px) 100vw, 820px" if breit
                else "(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 340px")
    return """      <figure class="%s">
        <img src="%s/praxis-%s.jpg"
             srcset="%s/praxis-%s.jpg %dw, %s/praxis-%s@2x.jpg %dw"
             sizes="%s"
             width="%d" height="%d" loading="lazy" decoding="async"
             alt="%s">
        <figcaption>%s</figcaption>
      </figure>""" % (klasse, ZIEL, name, ZIEL, name, b, ZIEL, name, b * 2,
                      groessen, b, h, beschreibung, titel)


def platzhalter(name, titel):
    return """      <figure class="foto foto--platzhalter">
        %s
        <figcaption>
          <strong>%s</strong>
          Datei als <code>werkzeug/originale/%s.jpg</code> ablegen
        </figcaption>
      </figure>""" % (KAMERA_SVG, titel, name)


def main():
    if not os.path.isdir(QUELLEN):
        os.makedirs(QUELLEN)
    print("Bilder aufbereiten:")

    teile = []
    for name, breite, titel, beschreibung in BILDER:
        masse = aufbereiten(name, breite)
        breit = (breite == BREIT)
        if masse:
            teile.append((breit, figur(name, titel, beschreibung, masse, breit)))
        else:
            print("  %-34s fehlt - Platzhalter bleibt stehen" % (name + ".jpg"))
            teile.append((breit, platzhalter(name, titel)))

    oben = "\n".join(t for b, t in teile if b)
    kacheln = "\n".join(t for b, t in teile if not b)

    block = []
    if oben:
        block.append(oben)
    block.append('      <div class="bildergalerie">\n%s\n      </div>' % kacheln)

    seite = open("praxis.html", encoding="utf-8").read()
    anfang = seite.index("<!-- ==================== Praxisbilder: Anfang")
    anfang = seite.index("-->", anfang) + 4
    ende = seite.index("    <!-- ===================== Praxisbilder: Ende")
    seite = seite[:anfang] + "\n".join(block) + "\n" + seite[ende:]
    open("praxis.html", "w", encoding="utf-8").write(seite)
    print("praxis.html aktualisiert")


if __name__ == "__main__":
    main()
