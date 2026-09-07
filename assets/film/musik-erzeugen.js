/* ---------------------------------------------------------------------------
   Erzeugt die Hintergrundmusik fuer den Film als WAV-Datei.

   Die Musik ist hier ausgerechnet und nicht eingekauft: kein Lizenzthema,
   keine GEMA-Anmeldung, und sie laesst sich jederzeit aendern. Klanglich
   ist es eine ruhige Flaeche mit einem sparsamen Glockenspiel darueber –
   sie soll den Film tragen und nicht auffallen.

   Der Verlauf folgt den Szenen: freundlich am Anfang, ernster beim Kalender
   und beim Spargesetz, waermer im Sprechzimmer, ruhig zum Schluss.

       node assets/film/musik-erzeugen.js musik.wav

   Danach mit ffmpeg klein rechnen:
       ffmpeg -i musik.wav -c:a aac -b:a 112k assets/film/musik.m4a
   --------------------------------------------------------------------------- */

const fs = require("fs");

const RATE  = 44100;
const TAKT  = 3.6;                 /* Sekunden je Takt (4/4 bei rund 67 bpm) */
const ZIEL  = process.argv[2] || "musik.wav";

/* Akkorde: Bassnote, drei Toene fuer die Flaeche, vier fuer das Glockenspiel */
const AKKORD = {
  C:  { bass: 48, flaeche: [48, 55, 64], arp: [60, 64, 67, 72] },
  G:  { bass: 43, flaeche: [43, 50, 59], arp: [59, 62, 67, 71] },
  GB: { bass: 47, flaeche: [47, 55, 62], arp: [59, 62, 67, 71] },
  Am: { bass: 45, flaeche: [45, 52, 60], arp: [57, 60, 64, 69] },
  F:  { bass: 41, flaeche: [41, 48, 57], arp: [57, 60, 65, 69] },
  Dm: { bass: 38, flaeche: [38, 50, 57], arp: [57, 62, 65, 69] },
  E:  { bass: 40, flaeche: [40, 47, 56], arp: [56, 59, 64, 68] }
};

/* Ein Eintrag je Takt. Die Abschnitte decken sich mit den Filmszenen. */
const TAKTE = [
  "C",  "C",                                  /*  0:00  Titel               */
  "C",  "GB", "Am", "F",  "C",  "G",          /*  0:07  Weg und Anmeldung   */
  "Am", "F",  "Dm", "E",  "Am",               /*  0:28  Kalender            */
  "Am", "Dm", "F",  "E",  "Am", "Dm",         /*  0:47  Spargesetz          */
  "F",  "C",  "G",                            /*  1:08  Sprechzimmer        */
  "C",  "Am", "F",  "G",  "C",  "Am", "F", "G", /* 1:19  Texttafel          */
  "C",  "F",  "C"                             /*  1:48  Hinweis und Abspann */
];

/* Sparsame Melodie: Takt -> Toene als [Zaehlzeit, Note, Laenge] */
const MELODIE = {
  2:  [[0, 79, 2.4], [1.5, 76, 2.0], [2.5, 72, 2.6]],
  4:  [[0, 76, 2.2], [2, 72, 2.6]],
  6:  [[0.5, 79, 2.2], [2, 81, 2.6]],
  9:  [[0, 81, 2.0], [1, 79, 1.8], [2.5, 76, 2.6]],
  11: [[0, 76, 2.2], [2, 71, 2.8]],
  14: [[0, 72, 2.6]],
  17: [[0, 69, 2.4], [2, 72, 2.6]],
  19: [[0, 77, 2.2], [1.5, 79, 2.0], [3, 81, 2.6]],
  21: [[0, 79, 2.4], [2, 74, 2.6]],
  23: [[0, 76, 2.2], [2, 72, 2.6]],
  25: [[0.5, 77, 2.2], [2.5, 74, 2.6]],
  27: [[0, 72, 2.4], [2, 76, 2.6]],
  29: [[0, 79, 2.2], [2, 74, 2.6]],
  31: [[0, 77, 2.4], [1.5, 79, 2.2]],
  32: [[0, 84, 3.4], [1.5, 79, 3.0]]
};

const DAUER = TAKTE.length * TAKT + 4;
const LAENGE = Math.floor(DAUER * RATE);
const links = new Float64Array(LAENGE);
const rechts = new Float64Array(LAENGE);

function frequenz(note) { return 440 * Math.pow(2, (note - 69) / 12); }

function mische(ab, i, wert, seite) {
  const k = ab + i;
  if (k < 0 || k >= LAENGE) return;
  links[k]  += wert * (1 - seite);
  rechts[k] += wert * seite;
}

/* Glockenspiel: kurzer Anschlag, langes Ausklingen, hohe Teiltoene
   verklingen schneller – so klingt es weich statt blechern.            */
function glocke(start, note, dauer, staerke, seite) {
  const f = frequenz(note);
  const teile = [[1, 1, 2.4], [2, 0.4, 3.6], [3, 0.16, 5.2], [4.06, 0.07, 7.5]];
  const ab = Math.floor(start * RATE);
  const n = Math.floor(dauer * RATE);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    let w = 0;
    for (const [m, a, d] of teile) w += a * Math.sin(2 * Math.PI * f * m * t) * Math.exp(-d * t);
    mische(ab, i, w * staerke * Math.min(1, t / 0.006), seite);
  }
}

/* Flaeche: zwei leicht verstimmte Oszillatoren, sehr langsam auf und ab */
function flaeche(start, note, dauer, staerke) {
  const f = frequenz(note);
  const ab = Math.floor(start * RATE);
  const n = Math.floor(dauer * RATE);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const huelle = Math.max(0, Math.min(1, t / 1.2) * Math.min(1, (dauer - t) / 1.5));
    const w = (Math.sin(2 * Math.PI * f * t)
             + 0.85 * Math.sin(2 * Math.PI * f * 1.0016 * t + 0.7)
             + 0.20 * Math.sin(2 * Math.PI * f * 2 * t)
             + 0.06 * Math.sin(2 * Math.PI * f * 3 * t)) * 0.4;
    mische(ab, i, w * staerke * huelle * 0.98, 0.48);
    mische(ab, i, w * staerke * huelle * 0.02, 0.52);
  }
}

function bass(start, note, dauer, staerke) {
  const f = frequenz(note);
  const ab = Math.floor(start * RATE);
  const n = Math.floor(dauer * RATE);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const huelle = Math.min(1, t / 0.03) * Math.exp(-1.0 * t);
    const w = Math.sin(2 * Math.PI * f * t) + 0.22 * Math.sin(2 * Math.PI * f * 2 * t);
    mische(ab, i, w * staerke * huelle, 0.5);
  }
}

/* --- Stueck setzen ------------------------------------------------------ */
TAKTE.forEach(function (name, takt) {
  const a = AKKORD[name];
  const t0 = takt * TAKT;
  const schlag = TAKT / 4;

  a.flaeche.forEach(function (note) { flaeche(t0, note, TAKT + 0.9, 0.055); });
  bass(t0, a.bass - 12, TAKT + 0.6, 0.085);

  /* Glockenspiel: vier ruhige Schlaege, in den ernsten Takten nur zwei */
  const ernst = takt >= 13 && takt <= 18;
  const muster = ernst ? [0, 2] : [0, 1, 2, 3];
  muster.forEach(function (schritt, i) {
    const note = a.arp[(schritt + takt) % a.arp.length];
    glocke(t0 + schritt * schlag, note, 2.4, ernst ? 0.05 : 0.062, 0.62);
  });

  (MELODIE[takt] || []).forEach(function (m) {
    glocke(t0 + m[0] * schlag, m[1], m[2], 0.085, 0.38);
  });
});

/* --- Raum: zwei ueber Kreuz laufende Verzoegerungen --------------------- */
const v1 = Math.floor(0.187 * RATE), v2 = Math.floor(0.311 * RATE);
for (let i = v1; i < LAENGE; i++) links[i]  += 0.23 * rechts[i - v1];
for (let i = v2; i < LAENGE; i++) rechts[i] += 0.23 * links[i - v2];

/* --- Pegel, Anfang und Ende weich --------------------------------------- */
let spitze = 0;
for (let i = 0; i < LAENGE; i++) spitze = Math.max(spitze, Math.abs(links[i]), Math.abs(rechts[i]));
const faktor = 0.72 / (spitze || 1);
const einblenden = Math.floor(2.5 * RATE);
const ausblenden = Math.floor(5.5 * RATE);
for (let i = 0; i < LAENGE; i++) {
  let h = faktor;
  if (i < einblenden) h *= i / einblenden;
  if (i > LAENGE - ausblenden) h *= (LAENGE - i) / ausblenden;
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
console.log("Musik geschrieben: " + ZIEL + "  (" + (DAUER).toFixed(1) + " s, Spitze vorher " + spitze.toFixed(2) + ")");
