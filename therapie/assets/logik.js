/* ==========================================================================
   Therapiepfad Prostatakarzinom — Regelwerk
   --------------------------------------------------------------------------
   Diese Datei enthaelt keine medizinischen Inhalte. Sie wertet nur die
   Bedingungen aus, die in daten/therapie-pca.json stehen.

   Eine Bedingung kennt drei Ausgaenge, nicht zwei:

     erfuellt  Die Angabe passt zum Anwendungsgebiet.
     nicht     Die Angabe schliesst das Anwendungsgebiet aus.
     offen     Die noetige Angabe fehlt noch oder ist unbekannt.

   Der dritte Ausgang ist der wichtige: Eine Option darf nicht verschwinden,
   nur weil ein Befund noch aussteht. Sie wird stattdessen unter
   "noch zu klaeren" gefuehrt, zusammen mit der fehlenden Angabe.
   ========================================================================== */
(function (global) {
  'use strict';

  var ERFUELLT = 'erfuellt';
  var NICHT    = 'nicht';
  var OFFEN    = 'offen';

  /* Nachschlagewerk: Frage-Kennung -> Frage, damit Texte und Optionen
     schnell zur Hand sind. */
  function index(daten) {
    var karte = {};
    (daten.fragen || []).forEach(function (frage) { karte[frage.id] = frage; });
    return karte;
  }

  function option(frage, wert) {
    if (!frage) { return null; }
    var treffer = null;
    (frage.optionen || []).forEach(function (o) { if (o.wert === wert) { treffer = o; } });
    return treffer;
  }

  /* Eine einzelne Bedingung: { frage: "...", ist: ["ja"] } */
  function pruefeAtom(atom, antworten, karte) {
    var wert = antworten[atom.frage];
    if (wert === undefined || wert === null || wert === '') { return OFFEN; }
    var gewaehlt = option(karte[atom.frage], wert);
    if (gewaehlt && gewaehlt.offen) { return OFFEN; }
    return atom.ist.indexOf(wert) !== -1 ? ERFUELLT : NICHT;
  }

  /* Alle Bedingungen muessen zutreffen. */
  function alleVon(zustaende) {
    if (zustaende.indexOf(NICHT) !== -1) { return NICHT; }
    if (zustaende.indexOf(OFFEN) !== -1) { return OFFEN; }
    return ERFUELLT;
  }

  /* Mindestens eine Bedingung muss zutreffen. */
  function eineVon(zustaende) {
    if (zustaende.indexOf(ERFUELLT) !== -1) { return ERFUELLT; }
    if (zustaende.indexOf(OFFEN) !== -1) { return OFFEN; }
    return NICHT;
  }

  function umkehren(zustand) {
    if (zustand === ERFUELLT) { return NICHT; }
    if (zustand === NICHT) { return ERFUELLT; }
    return OFFEN;
  }

  /* Ein ganzer Block: { alle: [...], eine: [...], nicht: [...] }
     Zurueck kommt der Gesamtzustand und die Liste der Bedingungen, die
     ihn verursacht haben — daraus entsteht spaeter die Begruendung. */
  function pruefeBlock(block, antworten, karte) {
    var zustaende = [];
    var ausschluss = [];
    var luecken = [];

    (block && block.alle ? block.alle : []).forEach(function (atom) {
      var z = pruefeAtom(atom, antworten, karte);
      zustaende.push(z);
      if (z === NICHT) { ausschluss.push(atom); }
      if (z === OFFEN) { luecken.push(atom); }
    });

    (block && block.nicht ? block.nicht : []).forEach(function (atom) {
      var z = umkehren(pruefeAtom(atom, antworten, karte));
      zustaende.push(z);
      if (z === NICHT) { ausschluss.push(atom); }
      if (z === OFFEN) { luecken.push(atom); }
    });

    var zustand = alleVon(zustaende);

    if (block && block.eine && block.eine.length) {
      var teil = block.eine.map(function (atom) { return pruefeAtom(atom, antworten, karte); });
      var z = eineVon(teil);
      if (z === NICHT) { block.eine.forEach(function (a) { ausschluss.push(a); }); }
      if (z === OFFEN) {
        block.eine.forEach(function (a, i) { if (teil[i] === OFFEN) { luecken.push(a); } });
      }
      zustand = alleVon([zustand, z]);
    }

    return { zustand: zustand, ausschluss: ausschluss, luecken: luecken };
  }

  /* Wird diese Frage in der aktuellen Lage ueberhaupt gestellt? */
  function frageGestellt(frage, antworten, karte) {
    if (!frage.wenn) { return true; }
    return pruefeBlock(frage.wenn, antworten, karte).zustand === ERFUELLT;
  }

  /* Alle Fragen, die zum aktuellen Stand der Antworten passen — in der
     Reihenfolge der Datei. */
  function offeneFragen(daten, antworten) {
    var karte = index(daten);
    return (daten.fragen || []).filter(function (frage) {
      return frageGestellt(frage, antworten, karte);
    });
  }

  /* Die naechste unbeantwortete Frage, oder null, wenn alles beantwortet ist. */
  function naechsteFrage(daten, antworten) {
    var passende = offeneFragen(daten, antworten);
    for (var i = 0; i < passende.length; i++) {
      if (antworten[passende[i].id] === undefined) { return passende[i]; }
    }
    return null;
  }

  /* Steht die Gesamtzahl der Fragen schon fest?

     Am Anfang sind nur zwei Fragen vorgesehen; aus deren Antworten ergeben
     sich alle weiteren. Eine Angabe wie "Frage 1 von 2" waere also falsch.
     Die Zahl steht erst fest, wenn keine weitere Frage mehr dazukommen kann.

     Dazukommen kann eine Frage nur, wenn ihre Bedingung sich noch aendert -
     also auf eine Frage verweist, die noch offen ist oder ihrerseits noch
     dazukommen kann. Diese Kette wird hier so lange verfolgt, bis sich
     nichts mehr aendert. */
  function zahlStehtFest(daten, antworten) {
    var karte = index(daten);
    var fragen = daten.fragen || [];
    var beweglich = {};

    fragen.forEach(function (frage) {
      if (frageGestellt(frage, antworten, karte) && antworten[frage.id] === undefined) {
        beweglich[frage.id] = true;
      }
    });

    var geaendert = true;
    while (geaendert) {
      geaendert = false;
      fragen.forEach(function (frage) {
        if (beweglich[frage.id]) { return; }
        if (frageGestellt(frage, antworten, karte)) { return; }
        if (!frage.wenn) { return; }
        var bezug = false;
        ['alle', 'eine', 'nicht'].forEach(function (schluessel) {
          (frage.wenn[schluessel] || []).forEach(function (atom) {
            if (beweglich[atom.frage]) { bezug = true; }
          });
        });
        if (bezug) { beweglich[frage.id] = true; geaendert = true; }
      });
    }

    var zuwachsMoeglich = false;
    fragen.forEach(function (frage) {
      if (beweglich[frage.id] && !frageGestellt(frage, antworten, karte)) {
        zuwachsMoeglich = true;
      }
    });
    return !zuwachsMoeglich;
  }

  /* Klartext einer Bedingung: "Fernmetastasen: Ja – Fernmetastasen (M1)" */
  function atomText(atom, karte) {
    var frage = karte[atom.frage];
    var texte = atom.ist.map(function (w) {
      var o = option(frage, w);
      return o ? o.text : w;
    });
    return {
      frage: frage ? frage.text : atom.frage,
      erwartet: texte.join(' oder ')
    };
  }

  /* Kernstueck: Alle Therapien gegen die Antworten pruefen. */
  function bewerte(daten, antworten) {
    var karte = index(daten);
    var ergebnis = { erfuellt: [], offen: [], nicht: [] };

    (daten.therapien || []).forEach(function (therapie) {
      var geprueft = pruefeBlock(therapie.wenn, antworten, karte);

      var warnungen = (therapie.pruefen || []).map(function (atom) {
        var z = pruefeAtom(atom, antworten, karte);
        return z === ERFUELLT ? null : { text: atom.text, zustand: z };
      }).filter(Boolean);

      var eintrag = {
        therapie: therapie,
        zustand: geprueft.zustand,
        warnungen: warnungen,
        luecken: geprueft.luecken.map(function (a) { return atomText(a, karte); }),
        ausschluss: geprueft.ausschluss.map(function (a) { return atomText(a, karte); })
      };

      if (geprueft.zustand === ERFUELLT) { ergebnis.erfuellt.push(eintrag); }
      else if (geprueft.zustand === OFFEN) { ergebnis.offen.push(eintrag); }
      else { ergebnis.nicht.push(eintrag); }
    });

    return ergebnis;
  }

  /* Das Stadium, in dem sich der Patient nach den bisherigen Antworten
     befindet — fuer die Ueberschrift des Ergebnisses. */
  function stadium(daten, antworten) {
    var m = antworten.metastasen;
    var k = antworten.kastrationsresistenz;
    if (m === undefined || k === undefined) { return null; }
    var id = null;
    if (m === 'nein' && k === 'nein') { id = 'lokal_hspc'; }
    if (m === 'ja'   && k === 'nein') { id = 'mhspc'; }
    if (m === 'nein' && k === 'ja')   { id = 'nmcrpc'; }
    if (m === 'ja'   && k === 'ja')   { id = 'mcrpc'; }
    if (!id) { return null; }
    var treffer = null;
    (daten.stadien || []).forEach(function (s) { if (s.id === id) { treffer = s; } });
    return treffer;
  }

  global.PCA = global.PCA || {};
  global.PCA.logik = {
    ERFUELLT: ERFUELLT,
    NICHT: NICHT,
    OFFEN: OFFEN,
    index: index,
    pruefeAtom: pruefeAtom,
    pruefeBlock: pruefeBlock,
    frageGestellt: frageGestellt,
    offeneFragen: offeneFragen,
    naechsteFrage: naechsteFrage,
    zahlStehtFest: zahlStehtFest,
    bewerte: bewerte,
    stadium: stadium
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = global.PCA.logik; }
})(typeof globalThis !== 'undefined' ? globalThis : this);
