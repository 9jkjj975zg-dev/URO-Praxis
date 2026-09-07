/* ---------------------------------------------------------------------------
   Macht aus gkv-spargesetz.html eine Videodatei (MP4, 1280x720, 25 Bilder/s).

   Der Film wird dabei nicht "abgefilmt", sondern Bild fuer Bild gesetzt:
   setzeZeit(sekunde) im Film haelt jede Bewegung genau an der richtigen
   Stelle an. Deshalb ist das Ergebnis exakt so lang und so ruhig wie geplant,
   egal wie schnell der Rechner gerade ist.

   Gebraucht werden Playwright (Chromium) und ein ffmpeg mit libx264.

       npm install playwright ffmpeg-static
       npx http-server -p 8099 .            # in einem zweiten Fenster
       node assets/film/film-rendern.js vorsorge-spargesetz.mp4

   Zieldatei, Adresse und ffmpeg lassen sich ueber Umgebungsvariablen
   umstellen: FILM_URL, FFMPEG.
   --------------------------------------------------------------------------- */

const { chromium } = require("playwright");
const { spawn } = require("child_process");
const fs = require("fs");
const pfad = require("path");

const ZIEL    = process.argv[2] || "film.mp4";
const ADRESSE = process.env.FILM_URL ||
  "http://127.0.0.1:8099/assets/film/gkv-spargesetz.html?pur=1&halt=1";
const FFMPEG  = process.env.FFMPEG || "ffmpeg";
const BILDER_PRO_SEKUNDE = 25;

/* Liegt musik.m4a neben dem Film, wird sie unterlegt – sonst bleibt der
   Film stumm, bekommt aber eine leere Tonspur (manche Abspieler und
   Messenger mogen Videos ohne Ton nicht).                              */
const MUSIK  = process.env.FILM_MUSIK || pfad.join(__dirname, "musik.m4a");
const PEGEL  = process.env.FILM_MUSIK_PEGEL || "0.55";

(async () => {
  const browser = await chromium.launch();
  const seite = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  seite.on("pageerror", function (e) { console.error("Fehler im Film:", e.message); });

  await seite.goto(ADRESSE, { waitUntil: "networkidle" });
  await seite.evaluate(function () { return document.fonts.ready; });

  const gesamt = await seite.evaluate("setzeZeit(0)");
  const anzahl = Math.round(gesamt * BILDER_PRO_SEKUNDE);
  console.log("Laenge " + gesamt + " s, " + anzahl + " Einzelbilder");

  const mitMusik = fs.existsSync(MUSIK);
  console.log(mitMusik ? "mit Musik: " + MUSIK : "ohne Musik (stumme Tonspur)");

  const ff = spawn(FFMPEG, [
    "-y",
    "-f", "image2pipe", "-framerate", String(BILDER_PRO_SEKUNDE), "-i", "-"
  ].concat(
    mitMusik ? ["-i", MUSIK] : ["-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo"]
  ).concat([
    "-map", "0:v", "-map", "1:a", "-shortest",
    "-af", "volume=" + PEGEL + ",afade=t=out:st=" + (gesamt - 5).toFixed(1) + ":d=5",
    "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "128k",
    "-movflags", "+faststart",
    ZIEL
  ]), { stdio: ["pipe", "inherit", "inherit"] });

  for (let i = 0; i < anzahl; i++) {
    await seite.evaluate(function (z) { return setzeZeit(z); }, i / BILDER_PRO_SEKUNDE);
    const bild = await seite.screenshot({ type: "png" });
    if (!ff.stdin.write(bild)) {
      await new Promise(function (fertig) { ff.stdin.once("drain", fertig); });
    }
    if (i % 250 === 0) console.log("  " + Math.round(i / anzahl * 100) + " %");
  }

  ff.stdin.end();
  await new Promise(function (fertig) { ff.on("close", fertig); });
  await browser.close();
  console.log("fertig: " + ZIEL);
})();
