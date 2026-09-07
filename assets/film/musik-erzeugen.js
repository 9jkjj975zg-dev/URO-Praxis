/* ---------------------------------------------------------------------------
   Erzeugt die Hintergrundmusik fuer den Film als WAV-Datei.

   Die Musik ist hier ausgerechnet und nicht eingekauft: kein Lizenzthema,
   keine GEMA-Anmeldung, und sie laesst sich jederzeit aendern.

   Klanglich ist es ein freundlicher, poppiger Erklaerfilm-Teppich:
   124 Schlaege je Minute, Bassdrum auf 1 und 3, Klatschen auf 2 und 4,
   Hi-Hat auf den Achteln, ein laufender Bass und Akkordtupfer auf den
   Nachschlaegen. Beim Spargesetz und beim rechtlichen Hinweis faellt das
   Schlagzeug weg; dort bleiben Flaeche, Bass und Tupfer. Das nimmt Druck
   heraus, ohne stehen zu bleiben.

       node assets/film/musik-erzeugen.js musik.wav
       ffmpeg -i musik.wav -c:a aac -b:a 112k assets/film/musik.m4a

   Tempo, Akkordfolge und Melodie stehen gleich hier oben.
   --------------------------------------------------------------------------- */

const fs = require("fs");

const RATE   = 44100;
const BPM    = 124;
const SCHLAG = 60 / BPM;                /* 0,484 s */
const TAKT   = SCHLAG * 4;              /* 1,935 s */
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

/* Ein Eintrag je Takt (1,94 s). Die Abschnitte decken sich mit den Szenen. */
const TAKTE = [
  "C","G","Am","F","C","G","Am",                          /*  0-6   Titel und Weg      */
  "F","C","G","Am","F","C","G","Am",                      /*  7-14  Anmeldung          */
  "F","Am","F","C","G","Am","F","E",                      /* 15-22  Kalender           */
  "Am","Em","F","Dm","Am","Em","F","G",                   /* 23-30  Spargesetz         */
  "Am","G","F","G",                                       /* 31-34  Puls kommt zurueck */
  "F","C","G","Am","F","G",                               /* 35-40  Sprechzimmer       */
  "C","G","Am","F","C","G","Am","F","C","G","Am","F",     /* 41-52  Texttafel          */
  "C","Am","F","G","C","F",                               /* 53-58  Hinweis            */
  "G","C","C"                                             /* 59-61  Schluss            */
];
const OHNE_SCHLAGZEUG = function (takt) { return (takt >= 23 && takt <= 28) || takt >= 53; };
const NUR_FLAECHE     = function (takt) { return takt >= 61; };

/* Melodie: Takt -> [Zaehlzeit, Note, Laenge] */
const mA = [[0, 72, .5], [.5, 76, .5], [1, 79, .9], [2, 77, .5], [2.5, 76, 1.1]];
const mB = [[0, 79, .5], [.75, 76, .5], [1.5, 72, 1.1], [3, 74, .9]];
const mC = [[0, 81, .5], [.5, 79, .5], [1, 76, .9], [2, 72, 1.1]];
const mD = [[0, 77, .5], [1, 79, .5], [2, 84, 1.2]];
const mF = [[0, 76, .6], [1, 72, .6], [2, 69, 1.2]];
const MELODIE = {
  1: mA, 3: mB, 8: mA, 10: mB, 12: mC, 14: mF,
  16: mC, 18: mA, 20: mB,
  24: [[0, 72, 1.6]], 27: [[0, 69, 1.6]],
  31: mF, 33: mC,
  36: mD, 38: mA, 40: mD,
  42: mA, 44: mB, 46: mC, 48: mA, 50: mF, 52: mB,
  54: [[0, 72, 1.8]], 57: [[0, 76, 1.8]],
  59: [[0, 77, .6], [1, 79, .6], [2, 84, 2]]
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
let saat = 20260907;
function zufall() { saat = (saat * 1103515245 + 12345) & 0x7fffffff; return saat / 0x7fffffff * 2 - 1; }

/* Zupfklang fuer Tupfer und Figur */
function zupf(start, note, dauer, staerke, seite) {
  const f = frequenz(note);
  const teile = [[1, 1, 3.4], [2, 0.34, 5.4], [3, 0.14, 7.6], [4.05, 0.08, 10]];
  const ab = Math.floor(start * RATE), n = Math.floor(dauer * RATE);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    let w = 0;
    for (const [m, a, d] of teile) w += a * Math.sin(2 * Math.PI * f * m * t) * Math.exp(-d * t);
    mische(ab, i, w * staerke * Math.min(1, t / 0.004), seite);
  }
}
/* Melodieklang: heller, steht laenger */
function lead(start, note, dauer, staerke, seite) {
  const f = frequenz(note);
  const teile = [[1, 1, 1.7], [2, 0.42, 2.6], [3, 0.2, 3.8], [4, 0.09, 5.4]];
  const ab = Math.floor(start * RATE), n = Math.floor(dauer * RATE);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    let w = 0;
    for (const [m, a, d] of teile) w += a * Math.sin(2 * Math.PI * f * m * t) * Math.exp(-d * t);
    mische(ab, i, w * staerke * Math.min(1, t / 0.007), seite);
  }
}
function flaeche(start, note, dauer, staerke) {
  const f = frequenz(note);
  const ab = Math.floor(start * RATE), n = Math.floor(dauer * RATE);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const h = Math.max(0, Math.min(1, t / 0.4) * Math.min(1, (dauer - t) / 0.6));
    const w = (Math.sin(2 * Math.PI * f * t)
             + 0.8 * Math.sin(2 * Math.PI * f * 1.0018 * t + 0.7)
             + 0.16 * Math.sin(2 * Math.PI * f * 2 * t)) * 0.4;
    mische(ab, i, w * staerke * h * 0.98, 0.47);
    mische(ab, i, w * staerke * h * 0.02, 0.53);
  }
}
/* Bass mit leichter Saettigung: gibt dem Ganzen Druck */
function bass(start, note, dauer, staerke) {
  const f = frequenz(note);
  const ab = Math.floor(start * RATE), n = Math.floor(dauer * RATE);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const h = Math.min(1, t / 0.008) * Math.exp(-3.4 * t);
    const w = Math.tanh((Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 2 * t)) * 1.5) / 1.5;
    mische(ab, i, w * staerke * h, 0.5);
  }
}
function bassdrum(start, staerke) {
  const ab = Math.floor(start * RATE), n = Math.floor(0.2 * RATE);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const f = 118 * Math.exp(-19 * t) + 46;
    mische(ab, i, Math.sin(2 * Math.PI * f * t) * staerke * Math.exp(-9.5 * t), 0.5);
  }
}
function klatschen(start, staerke) {
  [0, 0.009, 0.019].forEach(function (versatz, k) {
    const ab = Math.floor((start + versatz) * RATE), n = Math.floor(0.12 * RATE);
    let vor = 0;
    for (let i = 0; i < n; i++) {
      const t = i / RATE, roh = zufall();
      vor = 0.55 * roh + 0.45 * vor;
      const w = (roh - vor) * Math.exp(-(k === 2 ? 22 : 60) * t);
      mische(ab, i, w * staerke * (k === 2 ? 1 : 0.7), 0.5 + zufall() * 0.1);
    }
  });
}
function hihat(start, staerke) {
  const ab = Math.floor(start * RATE), n = Math.floor(0.05 * RATE);
  let vor = 0;
  for (let i = 0; i < n; i++) {
    const t = i / RATE, roh = zufall();
    vor = 0.35 * roh + 0.65 * vor;
    mische(ab, i, (roh - vor) * staerke * Math.exp(-85 * t), 0.5 + zufall() * 0.08);
  }
}

/* --- Stueck setzen ------------------------------------------------------ */
TAKTE.forEach(function (name, takt) {
  const a = AKKORD[name];
  const t0 = takt * TAKT;
  const trocken = OHNE_SCHLAGZEUG(takt);
  if (NUR_FLAECHE(takt)) { a.flaeche.forEach(function (x) { flaeche(t0, x, TAKT + 1.2, 0.05); }); return; }

  a.flaeche.forEach(function (x) { flaeche(t0, x, TAKT + 0.4, 0.045); });

  /* Bass: laufende Achtel, dazwischen die Quinte */
  const bassfolge = trocken ? [[0, 0], [2, 0]] : [[0, 0], [1, 0], [2, 0], [2.5, 0], [3.5, 7]];
  bassfolge.forEach(function (b) {
    bass(t0 + b[0] * SCHLAG, a.bass + b[1], 0.9, trocken ? 0.11 : 0.135);
  });

  /* Akkordtupfer auf den Nachschlaegen */
  const tupfer = trocken ? [1, 3] : [0.5, 1.5, 2.5, 3.5];
  tupfer.forEach(function (v) {
    a.arp.slice(0, 3).forEach(function (note, i) {
      zupf(t0 + v * SCHLAG, note + (i === 2 ? 0 : 0), 0.9, trocken ? 0.030 : 0.026, 0.62);
    });
  });

  /* Laufende Figur oben drueber */
  const figur = trocken ? [0, 2] : [0, 1, 2, 3];
  figur.forEach(function (v, i) {
    zupf(t0 + v * SCHLAG, a.arp[(i + takt) % 4] + 12, 0.7, trocken ? 0.026 : 0.030, 0.7);
  });

  if (!trocken) {
    bassdrum(t0, 0.19);
    bassdrum(t0 + SCHLAG * 2, 0.17);
    bassdrum(t0 + SCHLAG * 3.5, 0.10);
    klatschen(t0 + SCHLAG, 0.075);
    klatschen(t0 + SCHLAG * 3, 0.075);
    for (let i = 0; i < 8; i++) hihat(t0 + i * SCHLAG / 2, i % 2 ? 0.055 : 0.030);
  }

  (MELODIE[takt] || []).forEach(function (m) {
    lead(t0 + m[0] * SCHLAG, m[1], m[2] + 0.8, 0.072, 0.36);
  });
});

/* --- Raum ---------------------------------------------------------------- */
const v1 = Math.floor(SCHLAG * 0.75 * RATE), v2 = Math.floor(SCHLAG * 0.5 * RATE);
for (let i = v1; i < LAENGE; i++) links[i]  += 0.15 * rechts[i - v1];
for (let i = v2; i < LAENGE; i++) rechts[i] += 0.12 * links[i - v2];

/* --- Pegel, Anfang und Ende weich --------------------------------------- */
let spitze = 0;
for (let i = 0; i < LAENGE; i++) spitze = Math.max(spitze, Math.abs(links[i]), Math.abs(rechts[i]));
const faktor = 0.74 / (spitze || 1);
const ein = Math.floor(0.9 * RATE), aus = Math.floor(3.5 * RATE);
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
