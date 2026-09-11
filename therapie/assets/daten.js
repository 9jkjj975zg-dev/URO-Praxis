/* ==========================================================================
   Therapiepfad Prostatakarzinom — Datenversorgung
   --------------------------------------------------------------------------
   Die Therapiedaten stehen bewusst nicht im Programmcode, sondern in einer
   eigenen Datei (daten/therapie-pca.json). Dadurch genuegt es, diese eine
   Datei auszutauschen, wenn sich eine Zulassung aendert: Alle Geraete holen
   sie beim naechsten Start von selbst.

   Ablauf bei jedem Start:
     1. Die zuletzt gespeicherte Fassung wird sofort angezeigt — die App ist
        damit auch ohne Netz sofort benutzbar.
     2. Im Hintergrund wird die Datei frisch vom Server geholt.
     3. Ist die Fassung neuer, wird sie gespeichert und gemeldet.
   ========================================================================== */
(function (global) {
  'use strict';

  var PFAD          = 'daten/therapie-pca.json';
  var SCHLUESSEL    = 'pca-therapiedaten';
  var SCHLUESSEL_V  = 'pca-therapiedaten-version';

  /* Kleiner Schutzmantel: Im privaten Modus mancher Browser wirft schon der
     Zugriff auf den Speicher einen Fehler. Die App soll deshalb nicht
     stehenbleiben, sondern nur auf das Zwischenspeichern verzichten. */
  function speicherLesen(schluessel) {
    try { return global.localStorage.getItem(schluessel); }
    catch (e) { return null; }
  }
  function speicherSchreiben(schluessel, wert) {
    try { global.localStorage.setItem(schluessel, wert); return true; }
    catch (e) { return false; }
  }

  function gespeicherte() {
    var roh = speicherLesen(SCHLUESSEL);
    if (!roh) { return null; }
    try {
      var d = JSON.parse(roh);
      return (d && d.therapien && d.fragen) ? d : null;
    } catch (e) { return null; }
  }

  function ablegen(daten) {
    speicherSchreiben(SCHLUESSEL, JSON.stringify(daten));
    speicherSchreiben(SCHLUESSEL_V, String(daten.version || ''));
  }

  /* Holt die Datei unter Umgehung des Browser-Zwischenspeichers. */
  function vomServer() {
    return fetch(PFAD, { cache: 'no-store', credentials: 'same-origin' })
      .then(function (antwort) {
        if (!antwort.ok) { throw new Error('HTTP ' + antwort.status); }
        return antwort.json();
      })
      .then(function (daten) {
        if (!daten || !daten.therapien || !daten.fragen) {
          throw new Error('Datei unvollstaendig');
        }
        return daten;
      });
  }

  /* Fassungen werden als Zeichenkette verglichen. Die Kennung ist das
     Datum der Fassung (JJJJ-MM-TT), damit laesst sich auch "neuer als"
     einfach feststellen. */
  function istNeuer(neu, alt) {
    if (!alt) { return true; }
    return String(neu) > String(alt);
  }

  /*  laden(beiAenderung)
      Liefert sofort die beste verfuegbare Fassung und meldet spaeter ueber
      den Rueckruf, wenn vom Server etwas Neueres kam. */
  function laden(beiAenderung) {
    var alt = gespeicherte();

    var nachladen = vomServer().then(function (frisch) {
      var vorherige = alt ? alt.version : null;
      ablegen(frisch);
      if (istNeuer(frisch.version, vorherige)) {
        if (typeof beiAenderung === 'function') {
          beiAenderung(frisch, vorherige ? 'aktualisiert' : 'erstmals');
        }
      }
      return frisch;
    });

    /* Ist etwas gespeichert, wird sofort damit gearbeitet. Sonst wird auf
       den Server gewartet. */
    if (alt) {
      nachladen.catch(function () { /* ohne Netz bleibt es bei der alten Fassung */ });
      return Promise.resolve({ daten: alt, quelle: 'speicher' });
    }
    return nachladen.then(function (frisch) {
      return { daten: frisch, quelle: 'netz' };
    });
  }

  /* Ausdrueckliche Pruefung ueber den Knopf in der Ansicht "App". */
  function pruefen() {
    var alt = gespeicherte();
    return vomServer().then(function (frisch) {
      var neu = istNeuer(frisch.version, alt ? alt.version : null);
      ablegen(frisch);
      return { neu: neu, daten: frisch };
    });
  }

  global.PCA = global.PCA || {};
  global.PCA.daten = {
    laden: laden,
    pruefen: pruefen,
    gespeicherte: gespeicherte,
    istNeuer: istNeuer
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
