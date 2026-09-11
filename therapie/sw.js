/* ==========================================================================
   Therapiepfad Prostatakarzinom — Service Worker
   --------------------------------------------------------------------------
   Zwei Aufgaben:
     1. Die App muss ohne Netz starten (Visite, Keller, Bahn).
     2. Die Therapiedaten muessen trotzdem so frisch wie moeglich sein.

   Deshalb zwei unterschiedliche Strategien:
     Programmdateien  -> zuerst aus dem Zwischenspeicher (schnell und sicher)
     Therapiedaten    -> zuerst vom Netz (aktuell), Zwischenspeicher als Rueckfall

   Die Zahl in SPEICHER wird bei jeder Programmaenderung erhoeht. Dann laedt
   jedes Geraet die Dateien beim naechsten Start neu.
   ========================================================================== */
'use strict';

var SPEICHER = 'therapiepfad-v1';
var DATEN = 'daten/therapie-pca.json';

var GRUNDGERUEST = [
  './',
  'index.html',
  'assets/app.css',
  'assets/app.js',
  'assets/daten.js',
  'assets/logik.js',
  'manifest.webmanifest',
  'img/symbol.svg',
  'img/logo.svg',
  'img/symbol-180.png',
  'img/symbol-192.png',
  'img/symbol-512.png',
  'img/symbol-maskiert.png',
  '../assets/fonts/jost-latin.woff2',
  DATEN
];

self.addEventListener('install', function (ereignis) {
  ereignis.waitUntil(
    caches.open(SPEICHER).then(function (speicher) {
      /* Einzeln ablegen: Fehlt eine Nebendatei, soll nicht die ganze
         Installation scheitern. */
      return Promise.all(GRUNDGERUEST.map(function (pfad) {
        return speicher.add(new Request(pfad, { cache: 'reload' })).catch(function () { return null; });
      }));
    })
  );
});

self.addEventListener('activate', function (ereignis) {
  ereignis.waitUntil(
    caches.keys().then(function (namen) {
      return Promise.all(namen.map(function (name) {
        if (name !== SPEICHER && name.indexOf('therapiepfad-') === 0) { return caches.delete(name); }
        return null;
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* Die App meldet sich, wenn der Anwender die neue Fassung sofort will. */
self.addEventListener('message', function (ereignis) {
  if (ereignis.data && ereignis.data.befehl === 'uebernehmen') { self.skipWaiting(); }
});

function istDatendatei(url) {
  return url.pathname.indexOf('/daten/therapie-pca.json') !== -1;
}

self.addEventListener('fetch', function (ereignis) {
  var anfrage = ereignis.request;
  if (anfrage.method !== 'GET') { return; }

  var url = new URL(anfrage.url);
  if (url.origin !== self.location.origin) { return; }

  /* 1. Therapiedaten: immer zuerst vom Netz. */
  if (istDatendatei(url)) {
    ereignis.respondWith(
      fetch(anfrage).then(function (antwort) {
        var kopie = antwort.clone();
        caches.open(SPEICHER).then(function (speicher) { speicher.put(DATEN, kopie); });
        return antwort;
      }).catch(function () {
        return caches.match(DATEN).then(function (treffer) {
          return treffer || new Response('{}', { status: 503, headers: { 'Content-Type': 'application/json' } });
        });
      })
    );
    return;
  }

  /* 2. Seitenaufruf: Netz zuerst, sonst die gespeicherte Seite. */
  if (anfrage.mode === 'navigate') {
    ereignis.respondWith(
      fetch(anfrage).catch(function () {
        return caches.match('index.html').then(function (treffer) {
          return treffer || caches.match('./');
        });
      })
    );
    return;
  }

  /* 3. Alles Uebrige: Zwischenspeicher zuerst, im Hintergrund erneuern. */
  ereignis.respondWith(
    caches.match(anfrage).then(function (treffer) {
      var ausDemNetz = fetch(anfrage).then(function (antwort) {
        if (antwort && antwort.status === 200) {
          var kopie = antwort.clone();
          caches.open(SPEICHER).then(function (speicher) { speicher.put(anfrage, kopie); });
        }
        return antwort;
      }).catch(function () { return treffer; });
      return treffer || ausDemNetz;
    })
  );
});
