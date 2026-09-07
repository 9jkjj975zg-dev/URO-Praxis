/* ---------------------------------------------------------------------------
   Erzeugt die Hintergrundmusik fuer den Film als WAV-Datei.

   Die Musik ist hier ausgerechnet und nicht eingekauft: kein Lizenzthema,
   keine GEMA-Anmeldung, und sie laesst sich jederzeit aendern.

   Klanglich ist es ein freundlicher Erklaerfilm-Teppich: 108 Schlaege je
   Minute, eine laufende Achtelfigur auf einem weichen Zupfklang, ein
   ruhiger Bass, dazu Schuettelei und ein leiser Schlag auf 1 und 3. Beim
   Spargesetz und beim rechtlichen Hinweis faellt die Percussion weg und
   die Figur geht in Viertel – das nimmt Tempo heraus, ohne stehen zu
   bleiben.

       node assets/film/musik-erzeugen.js musik.wav
       ffmpeg -i musik.wav -c:a aac -b:a 112k assets/film/musik.m4a
   --------------------------------------------------------------------------- */

const fs = require("fs");

const RATE = 44100;
const BPM  = 108;
const SCHLAG = 60 / BPM;            /* 0,556 s */
const TAKT   = SCHLAG * 4;          /* 2,222 s */
const ZIEL   = process.argv[2] || "musik.wav";

const AKKORD = {
  C:  { bass: 36, flaeche: [48, 55, 64], arp: [60, 64, 67, 72] },
  G:  { bass: 31, flaeche: [43, 50, 59], arp: [59, 62, 67, 71] },
  Am: { bass: 33, flaeche: [45, 52, 60], arp: [57, 60, 64, 69] },
  Em: { bass: 28, flaeche: [40, 47, 59], arp: [59, 64, 67, 71] },
  F:  { bass: 29, flaeche: [41, 48, 60], arp: [57, 60, 65, 69] },
  Dm: { bass: 26, flaeche: [38, 50, 57], arp: [57, 62, 65, 69] },
  E:  { bass: 28, flaeche: [40, 47, 56], arp: [56, 59, 64, 68] }
};

/* Ein Eintrag je Takt (2,22 s). "ruhig" heisst: ohne Percussion, Figur
   in Vierteln. Die Abschnitte decken sich mit den Filmszenen.          */
const TAKTE = [
  "C","G","Am","F",  "C","G","Am","F",  "C","G","Am","F",   /*  0-11  Titel, Weg, Anmeldung */
  "Am","F","C","G",  "Am","F","Dm","E",                     /* 12-19  Kalender              */
  "Am","Em","F","Dm","Am","Em",                             /* 20-25  Spargesetz, ruhig     */
  "F","G","Am","G",                                         /* 26-29  Spargesetz, Puls zurueck */
  "F","C","G","Am",  "F","G",                               /* 30-35  Sprechzimmer          */
  "C","G","Am","F",  "C","G","Am","F",                      /* 36-43  Texttafel             */
  "C","Am","F","G",  "C","F","G",                           /* 44-50  Hinweis, ruhig        */
  "C","C","C"                                               /* 51-53  Schluss, klingt aus   */
];
const RUHIG = function (takt) { return (takt >= 20 && takt <= 25) || takt >= 45; };
const LEER  = function (takt) { return takt >= 52; };        /* nur noch Flaeche */

/* Melodie: Takt -> [Zaehlzeit, Note, Laenge] */
const MELODIE = {
  2:  [[0, 72, .7], [1.5, 76, .7], [2.5, 79, 1.1]],
  3:  [[1, 77, .7], [2.5, 72, 1.3]],
  6:  [[0, 79, .7], [1, 76, .7], [2, 72, 1.2]],
  7:  [[.5, 74, .7], [2, 77, 1.3]],
  10: [[0, 72, .7], [1.5, 69, .7], [3, 76, 1.1]],
  11: [[1, 77, .7], [2, 79, 1.3]],
  14: [[0, 81, .7], [1, 79, .7], [2.5, 76, 1.2]],
  15: [[0, 74, .7], [1.5, 71, 1.3]],
  18: [[0, 77, .8], [2, 74, 1.4]],
  19: [[0, 71, 1.6]],
  22: [[0, 72, 1.8]],
  24: [[0, 69, 1.8]],
  27: [[0, 74, .8], [2, 71, 1.2]],
  30: [[0, 77, .7], [1.5, 79, .7], [3, 81, 1.1]],
  31: [[0, 79, .8], [2, 76, 1.2]],
  34: [[0, 77, .7], [1, 79, .7], [2, 84, 1.3]],
  35: [[0, 79, .8], [2, 74, 1.2]],
  38: [[0, 72, .7], [1.5, 76, .7], [2.5, 79, 1.1]],
  39: [[1, 77, .7], [2.5, 72, 1.3]],
  42: [[0, 76, .7], [1.5, 72, .7], [3, 69, 1.1]],
  43: [[0, 74, .8], [2, 77, 1.2]],
  46: [[0, 72, 1.6]],
  48: [[0, 76, 1.4], [2, 72, 1.6]],
  50: [[0, 74, .8], [2, 79, 1.4]],
  51: [[0, 84, 2.6], [1, 79, 2.4]]
};

const DAUER  = TAKTE.length * TAKT + 3;
const LAENGE = Math.floor(DAUER * RATE);
const links  = new Float64Array(LAENGE);
const rechts = new Float64Array(LAENGE);

function frequenz(note) { return 440 * Math.pow(2, (note - 69) / 12); }

function mische(ab, i, wert, seite) {
  const k = ab + i;
  if (k < 0 || k >= LAENGE) return;
  links[k]  += wert * (1 - seite);
  rechts[k] += wert * seite;
}

/* Fester Zufall, damit jede Neuberechnung gleich klingt */
let saat = 20260907;
function zufall() { saat = (saat * 1103515245 + 12345) & 0x7fffffff; return saat / 0x7fffffff * 2 - 1; }

/* Zupfklang, marimbaartig: schneller Anschlag, kurzes Ausklingen */
function zupf(start, note, dauer, staerke, seite) {
  const f = frequenz(note);
  const teile = [[1, 1, 3.2], [2, 0.3, 5.0], [4, 0.12, 8.0], [6.1, 0.05, 12]];
  const ab = Math.floor(start * RATE);
  const n = Math.floor(dauer * RATE);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    let w = 0;
    for (const [m, a, d] of teile) w += a * Math.sin(2 * Math.PI * f * m * t) * Math.exp(-d * t);
    mische(ab, i, w * staerke * Math.min(1, t / 0.004), seite);
  }
}

/* Melodieklang: etwas laenger stehend, weicher */
function glocke(start, note, dauer, staerke, seite) {
  const f = frequenz(note);
  const teile = [[1, 1, 1.9], [2, 0.36, 3.0], [3, 0.12, 4.6]];
  const ab = Math.floor(start * RATE);
  const n = Math.floor(dauer * RATE);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    let w = 0;
    for (const [m, a, d] of teile) w += a * Math.sin(2 * Math.PI * f * m * t) * Math.exp(-d * t);
    mische(ab, i, w * staerke * Math.min(1, t / 0.008), seite);
  }
}

function flaeche(start, note, dauer, staerke) {
  const f = frequenz(note);
  const ab = Math.floor(start * RATE);
  const n = Math.floor(dauer * RATE);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const huelle = Math.max(0, Math.min(1, t / 0.5) * Math.min(1, (dauer - t) / 0.7));
    const w = (Math.sin(2 * Math.PI * f * t)
             + 0.8 * Math.sin(2 * Math.PI * f * 1.0018 * t + 0.7)
             + 0.16 * Math.sin(2 * Math.PI * f * 2 * t)) * 0.4;
    mische(ab, i, w * staerke * huelle * 0.98, 0.47);
    mische(ab, i, w * staerke * huelle * 0.02, 0.53);
  }
}

function bass(start, note, dauer, staerke) {
  const f = frequenz(note);
  const ab = Math.floor(start * RATE);
  const n = Math.floor(dauer * RATE);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const huelle = Math.min(1, t / 0.012) * Math.exp(-2.6 * t);
    const w = Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t);
    mische(ab, i, w * staerke * huelle, 0.5);
  }
}

/* Schuettelei: kurzes gefiltertes Rauschen */
function schuettel(start, staerke) {
  const ab = Math.floor(start * RATE);
  const n = Math.floor(0.055 * RATE);
  let vor = 0;
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const roh = zufall();
    vor = 0.6 * roh + 0.4 * vor;              /* etwas Hoehen wegnehmen */
    mische(ab, i, (roh - vor * 0.7) * staerke * Math.exp(-42 * t), 0.5 + zufall() * 0.06);
  }
}

/* Weicher Schlag auf 1 und 3 */
function schlag(start, staerke) {
  const ab = Math.floor(start * RATE);
  const n = Math.floor(0.16 * RATE);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const f = 95 * Math.exp(-16 * t) + 48;
    mische(ab, i, Math.sin(2 * Math.PI * f * t) * staerke * Math.exp(-11 * t), 0.5);
  }
}

/* --- Stueck setzen ------------------------------------------------------ */
const FIGUR = [0, 1, 2, 3, 2, 1, 2, 3];        /* acht Achtel je Takt */

TAKTE.forEach(function (name, takt) {
  const a = AKKORD[name];
  const t0 = takt * TAKT;
  const ruhig = RUHIG(takt);
  const leer = LEER(takt);

  a.flaeche.forEach(function (note) { flaeche(t0, note, TAKT + 0.5, 0.05); });
  if (leer) return;

  bass(t0, a.bass, 1.1, 0.13);
  if (!ruhig) bass(t0 + SCHLAG * 2.5, a.bass, 0.8, 0.09);

  if (ruhig) {
    /* nur Viertel, damit es ruhiger wird, aber weiterlaeuft */
    [0, 1, 2, 3].forEach(function (v, i) {
      zupf(t0 + v * SCHLAG, a.arp[[0, 2, 1, 3][i]], 1.4, 0.052, 0.6);
    });
  } else {
    FIGUR.forEach(function (schritt, i) {
      const betont = (i % 4 === 0);
      zupf(t0 + i * SCHLAG / 2, a.arp[schritt], 1.0,
           betont ? 0.062 : (i % 2 ? 0.032 : 0.046), 0.62);
    });
    for (let i = 0; i < 8; i++) schuettel(t0 + i * SCHLAG / 2, i % 2 ? 0.030 : 0.046);
    schlag(t0, 0.15);
    schlag(t0 + SCHLAG * 2, 0.13);
  }

  (MELODIE[takt] || []).forEach(function (m) {
    glocke(t0 + m[0] * SCHLAG, m[1], m[2] + 0.9, 0.075, 0.38);
  });
});

/* --- Raum: zwei ueber Kreuz laufende Verzoegerungen --------------------- */
const v1 = Math.floor(SCHLAG * 0.75 * RATE), v2 = Math.floor(SCHLAG * 0.5 * RATE);
for (let i = v1; i < LAENGE; i++) links[i]  += 0.16 * rechts[i - v1];
for (let i = v2; i < LAENGE; i++) rechts[i] += 0.13 * links[i - v2];

/* --- Pegel, Anfang und Ende weich --------------------------------------- */
let spitze = 0;
for (let i = 0; i < LAENGE; i++) spitze = Math.max(spitze, Math.abs(links[i]), Math.abs(rechts[i]));
const faktor = 0.72 / (spitze || 1);
const ein = Math.floor(1.2 * RATE);
const aus = Math.floor(3.5 * RATE);
for (let i = 0; i < LAENGE; i++) {
  let h = faktor;
  if (i < ein) h *= i / ein;
  if (i > LAENGE - aus) h *= (LAENGE - i) / aus;
  links[i] *= h; rechts[i] *= h;
}

/* --- WAV schreiben ------------------------------------------------------ */
const daten = Buffer.alloc(LAENGE * 4);
for (let i = 0; i < LAENGE; i++) {
  daten.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(links[i] * 32767))), i * 4);
  daten.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(rechts[i] * 32767))), i * 4 + 2);
}
const kopf = Buffer.alloc(44);
kopf.write("RIFF", 0); kopf.writeUInt32LE(36 + daten.length, 4); kopf.write("WAVE", 8);
kopf.write("fmt ", 12); kopf.writeUInt32LE(16, 16); kopf.writeUInt16LE(1, 20);
kopf.writeUInt16LE(2, 22); kopf.writeUInt32LE(RATE, 24); kopf.writeUInt32LE(RATE * 4, 28);
kopf.writeUInt16LE(4, 32); kopf.writeUInt16LE(16, 34);
kopf.write("data", 36); kopf.writeUInt32LE(daten.length, 40);
fs.writeFileSync(ZIEL, Buffer.concat([kopf, daten]));
console.log("Musik geschrieben: " + ZIEL + "  (" + DAUER.toFixed(1) + " s, " + BPM + " bpm, "
            + TAKTE.length + " Takte, Spitze vorher " + spitze.toFixed(2) + ")");
