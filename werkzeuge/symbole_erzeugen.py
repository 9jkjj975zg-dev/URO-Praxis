#!/usr/bin/env python3
"""Erzeugt die App-Symbole fuer den Startbildschirm.

Das Zeichen greift die beiden ineinanderliegenden Sicheln des Praxislogos
auf: eine Kreisflaeche, aus der ein linsenfoermiger Ausschnitt herausgenommen
ist. Gezeichnet wird vierfach vergroessert und danach verkleinert, damit die
Raender glatt werden - dafuer braucht es keine Bildbibliothek.

Aufruf:  python3 werkzeuge/symbole_erzeugen.py
"""

import struct
import zlib
from pathlib import Path

NAVY = (0x1b, 0x2a, 0x4e)
WEISS = (0xff, 0xff, 0xff)
GOLD = (0xba, 0xb2, 0xa2)

ZIEL = Path(__file__).resolve().parent.parent / "therapie" / "img"


def png_schreiben(pfad, breite, hoehe, pixel):
    """Schreibt eine RGB-PNG-Datei ohne fremde Bibliotheken."""
    roh = bytearray()
    for y in range(hoehe):
        roh.append(0)                      # Filtertyp 0 je Zeile
        for x in range(breite):
            roh.extend(pixel[y * breite + x])

    def block(kennung, daten):
        teil = kennung + daten
        return (struct.pack(">I", len(daten)) + teil
                + struct.pack(">I", zlib.crc32(teil) & 0xffffffff))

    kopf = struct.pack(">IIBBBBB", breite, hoehe, 8, 2, 0, 0, 0)
    datei = (b"\x89PNG\r\n\x1a\n"
             + block(b"IHDR", kopf)
             + block(b"IDAT", zlib.compress(bytes(roh), 9))
             + block(b"IEND", b""))
    pfad.write_bytes(datei)


def zeichnen(kante, anteil, ecke):
    """Zeichnet das Symbol in vierfacher Groesse und verkleinert es danach.

    anteil  Durchmesser des Zeichens im Verhaeltnis zur Kantenlaenge
    ecke    Eckenradius im Verhaeltnis zur Kantenlaenge (0 = eckig)
    """
    f = 4
    gross = kante * f
    mitte = gross / 2.0
    r = gross * anteil / 2.0
    versatz = r * 0.5 / (2 ** 0.5)         # 0,5 r unter 45 Grad
    eckradius = gross * ecke

    pixel = []
    for y in range(gross):
        for x in range(gross):
            px, py = x + 0.5, y + 0.5

            # Hintergrund: abgerundetes Quadrat
            dx = max(eckradius - px, px - (gross - eckradius), 0.0)
            dy = max(eckradius - py, py - (gross - eckradius), 0.0)
            if dx * dx + dy * dy > eckradius * eckradius:
                pixel.append(None)         # ausserhalb: durchsichtig -> spaeter weiss
                continue

            farbe = NAVY
            im_kreis = (px - mitte) ** 2 + (py - mitte) ** 2 <= r * r
            if im_kreis:
                oben = (px - (mitte - versatz)) ** 2 + (py - (mitte - versatz)) ** 2 <= r * r
                unten = (px - (mitte + versatz)) ** 2 + (py - (mitte + versatz)) ** 2 <= r * r
                if not unten:
                    farbe = WEISS          # Sichel nach oben links
                elif not oben:
                    farbe = GOLD           # Sichel nach unten rechts
            pixel.append(farbe)

    # Verkleinern: Mittelwert ueber f x f Punkte ergibt weiche Kanten.
    klein = []
    for y in range(kante):
        for x in range(kante):
            summe = [0, 0, 0]
            for sy in range(f):
                for sx in range(f):
                    p = pixel[(y * f + sy) * gross + (x * f + sx)]
                    if p is None:
                        p = NAVY if eckradius == 0 else (0xf5, 0xf2, 0xee)
                    summe[0] += p[0]
                    summe[1] += p[1]
                    summe[2] += p[2]
            anzahl = f * f
            klein.append(bytes((summe[0] // anzahl, summe[1] // anzahl, summe[2] // anzahl)))
    return klein


def main():
    ZIEL.mkdir(parents=True, exist_ok=True)
    auftraege = [
        ("symbol-512.png", 512, 0.62, 0.18),
        ("symbol-192.png", 192, 0.62, 0.18),
        ("symbol-180.png", 180, 0.62, 0.0),      # iOS rundet selbst ab
        ("symbol-maskiert.png", 512, 0.46, 0.0),  # Android maskiert selbst
    ]
    for name, kante, anteil, ecke in auftraege:
        png_schreiben(ZIEL / name, kante, kante, zeichnen(kante, anteil, ecke))
        print("geschrieben:", name)


if __name__ == "__main__":
    main()
