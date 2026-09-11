/* ==========================================================================
   Therapiepfad Prostatakarzinom — Oberflaeche
   --------------------------------------------------------------------------
   Eine Seite, mehrere Ansichten. Kein Rahmenwerk, keine fremden Dateien:
   Die Seite laeuft unter derselben strengen Inhaltsrichtlinie (CSP) wie die
   uebrige Website, deshalb steht hier kein einziges Skript im HTML.
   ========================================================================== */
(function () {
  'use strict';

  var logik = window.PCA.logik;
  var quelle = window.PCA.daten;

  var daten = null;                 /* die geladenen Therapiedaten      */
  var antworten = {};               /* Angaben zum aktuellen Fall       */
  var reihenfolge = [];             /* Fragen in der Reihenfolge ihrer Beantwortung */
  var schritte = [{ ansicht: 'start' }];   /* Weg durch die App         */
  var installAufforderung = null;   /* vom Browser angebotene Installation */

  /* ---------------------------------------------------------------------
     Kleine Helfer
     --------------------------------------------------------------------- */
  function e(tag, eigenschaften, kinder) {
    var knoten = document.createElement(tag);
    Object.keys(eigenschaften || {}).forEach(function (name) {
      var wert = eigenschaften[name];
      if (name === 'text') { knoten.textContent = wert; }
      else if (name === 'klasse') { knoten.className = wert; }
      else if (name.indexOf('on') === 0) { knoten.addEventListener(name.slice(2), wert); }
      else if (wert === true) { knoten.setAttribute(name, ''); }
      else if (wert !== false && wert !== null && wert !== undefined) { knoten.setAttribute(name, wert); }
    });
    (kinder || []).forEach(function (kind) {
      if (kind) { knoten.appendChild(typeof kind === 'string' ? document.createTextNode(kind) : kind); }
    });
    return knoten;
  }

  function leeren(knoten) { while (knoten.firstChild) { knoten.removeChild(knoten.firstChild); } }

  function id(kennung) { return document.getElementById(kennung); }

  var meldungsZeit = null;
  function meldung(text, aktionText, aktion) {
    var kasten = id('meldung');
    leeren(kasten);
    kasten.appendChild(e('span', { text: text }));
    if (aktionText) {
      kasten.appendChild(e('button', { type: 'button', klasse: 'meldung__knopf', text: aktionText, onclick: aktion }));
    }
    kasten.hidden = false;
    if (meldungsZeit) { clearTimeout(meldungsZeit); }
    if (!aktionText) {
      meldungsZeit = setTimeout(function () { kasten.hidden = true; }, 6000);
    }
  }

  function datumDeutsch(iso) {
    if (!iso) { return ''; }
    var teile = String(iso).split('-');
    if (teile.length !== 3) { return iso; }
    return teile[2] + '.' + teile[1] + '.' + teile[0];
  }

  /* ---------------------------------------------------------------------
     Ansichten wechseln
     --------------------------------------------------------------------- */
  var ANSICHTEN = ['start', 'beratung', 'ergebnis', 'uebersicht', 'glossar', 'info'];

  function aktuellerSchritt() { return schritte[schritte.length - 1]; }

  function zeichnen() {
    var schritt = aktuellerSchritt();
    ANSICHTEN.forEach(function (name) {
      id('ansicht-' + name).hidden = (name !== schritt.ansicht);
    });

    var abschnitt = id('ansicht-' + schritt.ansicht);
    id('kopf-titel').textContent = abschnitt.getAttribute('data-titel');
    id('knopf-zurueck').hidden = (schritte.length < 2);

    Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (tab) {
      var eigen = tab.getAttribute('data-ansicht') ||
                  (tab.getAttribute('data-start') === 'beratung' ? 'beratung' : null);
      var aktiv = eigen === schritt.ansicht ||
                  (eigen === 'beratung' && schritt.ansicht === 'ergebnis');
      if (aktiv) { tab.setAttribute('aria-current', 'page'); }
      else { tab.removeAttribute('aria-current'); }
    });

    if (schritt.ansicht === 'beratung') { frageZeichnen(); }
    if (schritt.ansicht === 'ergebnis') { ergebnisZeichnen(); }

    window.scrollTo(0, 0);
    id('inhalt').focus({ preventScroll: true });
  }

  function vor(schritt) {
    schritte.push(schritt);
    history.pushState({ tiefe: schritte.length }, '');
    zeichnen();
  }

  function zumStart(ansicht) {
    schritte = [{ ansicht: 'start' }];
    if (ansicht && ansicht !== 'start') { schritte.push({ ansicht: ansicht }); }
    history.replaceState({ tiefe: schritte.length }, '');
    zeichnen();
  }

  window.addEventListener('popstate', function () {
    if (schritte.length > 1) { schritte.pop(); zeichnen(); }
  });

  /* ---------------------------------------------------------------------
     Fragebogen
     --------------------------------------------------------------------- */
  function beratungStarten() {
    antworten = {};
    reihenfolge = [];
    var erste = logik.naechsteFrage(daten, antworten);
    schritte = [{ ansicht: 'start' }, { ansicht: 'beratung', frage: erste ? erste.id : null }];
    history.pushState({ tiefe: 2 }, '');
    zeichnen();
  }

  /* Alles, was ab dieser Frage beantwortet wurde, wird verworfen: Eine
     geaenderte Grundangabe kann den ganzen weiteren Weg umstellen. */
  function abRaeumen(frageId) {
    var stelle = reihenfolge.indexOf(frageId);
    if (stelle === -1) { return; }
    reihenfolge.slice(stelle).forEach(function (spaeter) { delete antworten[spaeter]; });
    reihenfolge = reihenfolge.slice(0, stelle);
  }

  function antworten_setzen(frageId, wert) {
    abRaeumen(frageId);
    antworten[frageId] = wert;
    reihenfolge.push(frageId);
  }

  /* Sprung zu einer bereits beantworteten Frage, um sie zu aendern. */
  function zurFrage(frageId) {
    abRaeumen(frageId);
    vor({ ansicht: 'beratung', frage: frageId });
  }

  function frageZeichnen() {
    var behaelter = id('frage-behaelter');
    leeren(behaelter);

    /* Welche Frage steht an? Der Schritt merkt sie sich, damit "Zurueck"
       wieder bei derselben Frage landet und nicht bei der naechsten. */
    var schritt = aktuellerSchritt();
    var karteFragen = logik.index(daten);
    var frage = schritt.frage ? karteFragen[schritt.frage] : logik.naechsteFrage(daten, antworten);

    if (frage && antworten[frage.id] !== undefined) {
      /* Ueber "Zurueck" wieder hier gelandet: Die Angabe und alles
         Nachfolgende werden zurueckgenommen. */
      abRaeumen(frage.id);
    }
    if (frage && !logik.frageGestellt(frage, antworten, karteFragen)) {
      frage = logik.naechsteFrage(daten, antworten);
    }
    if (!frage) {
      schritte[schritte.length - 1] = { ansicht: 'ergebnis' };
      zeichnen();
      return;
    }
    schritt.frage = frage.id;

    /* Fortschritt: beantwortete Fragen von allen derzeit vorgesehenen. */
    var vorgesehen = logik.offeneFragen(daten, antworten);
    var erledigt = vorgesehen.filter(function (f) { return antworten[f.id] !== undefined; }).length;
    var anteil = Math.round((erledigt / Math.max(vorgesehen.length, 1)) * 100);
    id('fortschritt-balken').style.width = anteil + '%';
    id('fortschritt-text').textContent = 'Frage ' + (erledigt + 1) + ' von ' + vorgesehen.length;

    behaelter.appendChild(e('h2', { klasse: 'frage__text', text: frage.text }));
    if (frage.hilfe) {
      behaelter.appendChild(e('p', { klasse: 'frage__hilfe', text: frage.hilfe }));
    }

    var liste = e('div', { klasse: 'antwortliste' });
    frage.optionen.forEach(function (option) {
      liste.appendChild(e('button', {
        type: 'button',
        klasse: 'antwort' + (option.offen ? ' antwort--offen' : ''),
        onclick: function () {
          antworten_setzen(frage.id, option.wert);
          var naechste = logik.naechsteFrage(daten, antworten);
          if (naechste) { vor({ ansicht: 'beratung', frage: naechste.id }); }
          else { vor({ ansicht: 'ergebnis' }); }
        }
      }, [option.text]));
    });
    behaelter.appendChild(liste);

    if (reihenfolge.length) {
      behaelter.appendChild(bisherigeAngaben(true));
    }

    var ueberspringen = e('button', {
      type: 'button', klasse: 'textknopf',
      text: 'Diese Frage überspringen und Optionen ansehen',
      onclick: function () { vor({ ansicht: 'ergebnis' }); }
    });
    behaelter.appendChild(ueberspringen);
  }

  /* Die Liste der bisherigen Angaben wird schnell lang. Im Fragebogen steht
     sie offen, im Ergebnis zugeklappt — dort zaehlen zuerst die Optionen. */
  function bisherigeAngaben(offen) {
    var karte = logik.index(daten);
    var kasten = e('details', { klasse: 'angaben', open: offen === true }, [
      e('summary', { text: 'Bisherige Angaben (' + reihenfolge.length + ')' })
    ]);
    var liste = e('ul', { klasse: 'angaben__liste' });
    reihenfolge.forEach(function (frageId) {
      var frage = karte[frageId];
      if (!frage) { return; }
      var gewaehlt = null;
      frage.optionen.forEach(function (o) { if (o.wert === antworten[frageId]) { gewaehlt = o; } });
      liste.appendChild(e('li', {}, [
        e('button', {
          type: 'button', klasse: 'angabe',
          title: 'Ändern: ' + frage.text,
          onclick: function () { zurFrage(frageId); }
        }, [
          e('span', { klasse: 'angabe__frage', text: kurz(frage.text) }),
          e('span', { klasse: 'angabe__wert', text: gewaehlt ? gewaehlt.text : antworten[frageId] })
        ])
      ]));
    });
    kasten.appendChild(liste);
    return kasten;
  }

  function kurz(text) {
    return text.replace(/\?$/, '').replace(/^(Sind|Ist|Liegt|Wurde|Wann|Wie|Welche|Kommt|Betraegt|Beträgt|Bestehen)\s+/i, '');
  }

  /* ---------------------------------------------------------------------
     Ergebnis
     --------------------------------------------------------------------- */
  function ergebnisZeichnen() {
    var behaelter = id('ergebnis-behaelter');
    leeren(behaelter);

    var bewertung = logik.bewerte(daten, antworten);
    var stadium = logik.stadium(daten, antworten);

    if (stadium) {
      behaelter.appendChild(e('div', { klasse: 'stadiumkopf' }, [
        e('p', { klasse: 'stadiumkopf__kurz', text: stadium.kurz }),
        e('h2', { klasse: 'stadiumkopf__name', text: stadium.name }),
        e('p', { klasse: 'stadiumkopf__text', text: stadium.beschreibung })
      ]));
    } else {
      behaelter.appendChild(e('p', { klasse: 'warnhinweis', text:
        'Stadium noch nicht bestimmt: Ohne Angabe zu Fernmetastasen und Kastrationsresistenz lässt sich die Liste nur grob eingrenzen.' }));
    }

    behaelter.appendChild(bisherigeAngaben(false));

    /* Zugelassene Optionen */
    behaelter.appendChild(gruppe(
      'Zugelassen für diese Konstellation',
      bewertung.erfuellt,
      'gruppe--ja',
      'Nach den bisherigen Angaben passt derzeit kein Anwendungsgebiet. Offene Angaben ergänzen oder die Gesamtübersicht ansehen.'
    ));

    /* Offene Angaben */
    if (bewertung.offen.length) {
      var offenGruppe = gruppe(
        'Möglich, sobald noch offene Angaben geklärt sind',
        bewertung.offen,
        'gruppe--offen',
        ''
      );
      var naechste = logik.naechsteFrage(daten, antworten);
      if (naechste) {
        offenGruppe.appendChild(e('button', {
          type: 'button', klasse: 'knopf knopf--zweit',
          text: 'Offene Angaben jetzt ergänzen',
          onclick: function () { vor({ ansicht: 'beratung', frage: naechste.id }); }
        }));
      }
      behaelter.appendChild(offenGruppe);
    }

    /* Nicht zutreffend */
    if (bewertung.nicht.length) {
      var aufklapp = e('details', { klasse: 'gruppe gruppe--nein' });
      aufklapp.appendChild(e('summary', { text: 'Nicht zutreffend (' + bewertung.nicht.length + ') – mit Begründung' }));
      bewertung.nicht.forEach(function (eintrag) { aufklapp.appendChild(therapieKarte(eintrag)); });
      behaelter.appendChild(aufklapp);
    }

    /* Grundsaetzliches */
    if (daten.grundsaetzliches && daten.grundsaetzliches.length) {
      var grund = e('div', { klasse: 'karte karte--grund' }, [e('h3', { text: 'In jedem Stadium bedenken' })]);
      var ul = e('ul');
      daten.grundsaetzliches.forEach(function (satz) { ul.appendChild(e('li', { text: satz })); });
      grund.appendChild(ul);
      behaelter.appendChild(grund);
    }

    behaelter.appendChild(e('p', { klasse: 'warnhinweis', text:
      'Verbindlich ist allein die aktuelle Fachinformation des gewählten Präparats. Diese Liste ersetzt weder die ärztliche Prüfung im Einzelfall noch die Tumorkonferenz.' }));

    var knoepfe = e('div', { klasse: 'knopfzeile' }, [
      e('button', { type: 'button', klasse: 'knopf', text: 'Neuer Fall', onclick: beratungStarten }),
      e('button', { type: 'button', klasse: 'knopf knopf--zweit', text: 'Als Text kopieren',
        onclick: function () { kopieren(bewertung, stadium); } })
    ]);
    behaelter.appendChild(knoepfe);

    behaelter.appendChild(e('p', { klasse: 'hinweis-klein', text:
      'Datenstand ' + datumDeutsch(daten.stand) + '. Die Angaben zum Fall bleiben auf diesem Gerät und werden nicht gespeichert.' }));
  }

  function gruppe(titel, eintraege, zusatz, leerText) {
    var kasten = e('section', { klasse: 'gruppe ' + zusatz }, [
      e('h3', { klasse: 'gruppe__titel', text: titel + ' (' + eintraege.length + ')' })
    ]);
    if (!eintraege.length) {
      kasten.appendChild(e('p', { klasse: 'gruppe__leer', text: leerText }));
      return kasten;
    }
    eintraege.forEach(function (eintrag) { kasten.appendChild(therapieKarte(eintrag)); });
    return kasten;
  }

  function therapieKarte(eintrag) {
    var t = eintrag.therapie;
    var karte = e('details', { klasse: 'therapie' });

    var kopf = e('summary', {}, [
      e('span', { klasse: 'therapie__name', text: t.wirkstoff }),
      e('span', { klasse: 'therapie__klasse', text: t.klasse })
    ]);
    karte.appendChild(kopf);

    if (t.kombination) {
      karte.appendChild(e('p', { klasse: 'therapie__kombi', text: t.kombination }));
    }

    /* Warnungen zuerst — sie sind das, was leicht uebersehen wird. */
    (eintrag.warnungen || []).forEach(function (w) {
      karte.appendChild(e('p', { klasse: 'merker merker--pruefen', text: w.text }));
    });

    if (eintrag.zustand === logik.OFFEN && eintrag.luecken.length) {
      var offenKasten = e('div', { klasse: 'merker merker--offen' }, [
        e('strong', { text: 'Noch zu klären: ' })
      ]);
      var ul = e('ul');
      eintrag.luecken.forEach(function (l) {
        ul.appendChild(e('li', { text: l.frage + ' – erwartet: ' + l.erwartet }));
      });
      offenKasten.appendChild(ul);
      karte.appendChild(offenKasten);
    }

    if (eintrag.zustand === logik.NICHT && eintrag.ausschluss.length) {
      var ausKasten = e('div', { klasse: 'merker merker--aus' }, [
        e('strong', { text: 'Nicht zutreffend, weil: ' })
      ]);
      var ul2 = e('ul');
      eintrag.ausschluss.forEach(function (a) {
        ul2.appendChild(e('li', { text: a.frage + ' – nötig wäre: ' + a.erwartet }));
      });
      ausKasten.appendChild(ul2);
      karte.appendChild(ausKasten);
    }

    karte.appendChild(e('h4', { text: 'Zugelassenes Anwendungsgebiet' }));
    karte.appendChild(e('p', { klasse: 'therapie__zulassung', text: t.zulassung }));

    if (t.kriterien && t.kriterien.length) {
      var ulk = e('ul', { klasse: 'therapie__kriterien' });
      t.kriterien.forEach(function (k) { ulk.appendChild(e('li', { text: k })); });
      karte.appendChild(ulk);
    }

    if (t.hinweise && t.hinweise.length) {
      karte.appendChild(e('h4', { text: 'Hinweise für die Praxis' }));
      var ulh = e('ul', { klasse: 'therapie__hinweise' });
      t.hinweise.forEach(function (h) { ulh.appendChild(e('li', { text: h })); });
      karte.appendChild(ulh);
    }

    var fuss = e('p', { klasse: 'therapie__fuss' });
    if (t.beispiel) { fuss.appendChild(e('span', { text: t.beispiel + ' · ' })); }
    if (t.quelle && t.quelle.url) {
      fuss.appendChild(e('a', { href: t.quelle.url, rel: 'noopener noreferrer', target: '_blank', text: t.quelle.titel }));
    }
    karte.appendChild(fuss);

    return karte;
  }

  function kopieren(bewertung, stadium) {
    var karte = logik.index(daten);
    var zeilen = [];
    zeilen.push('Therapiepfad Prostatakarzinom – Datenstand ' + datumDeutsch(daten.stand));
    if (stadium) { zeilen.push('Stadium: ' + stadium.kurz + ' – ' + stadium.name); }
    zeilen.push('');
    zeilen.push('Angaben:');
    reihenfolge.forEach(function (frageId) {
      var frage = karte[frageId];
      var gewaehlt = null;
      frage.optionen.forEach(function (o) { if (o.wert === antworten[frageId]) { gewaehlt = o; } });
      zeilen.push('- ' + frage.text + ' ' + (gewaehlt ? gewaehlt.text : ''));
    });
    zeilen.push('');
    zeilen.push('Zugelassen für diese Konstellation:');
    if (!bewertung.erfuellt.length) { zeilen.push('- keine Option nach den bisherigen Angaben'); }
    bewertung.erfuellt.forEach(function (eintrag) {
      zeilen.push('- ' + eintrag.therapie.wirkstoff + ' (' + eintrag.therapie.kombination + ')');
    });
    if (bewertung.offen.length) {
      zeilen.push('');
      zeilen.push('Erst nach Klärung offener Angaben:');
      bewertung.offen.forEach(function (eintrag) {
        zeilen.push('- ' + eintrag.therapie.wirkstoff + ': ' +
          eintrag.luecken.map(function (l) { return l.frage; }).join('; '));
      });
    }
    zeilen.push('');
    zeilen.push('Verbindlich ist die jeweils aktuelle Fachinformation.');

    var text = zeilen.join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { meldung('In die Zwischenablage kopiert.'); },
        function () { meldung('Kopieren nicht möglich.'); }
      );
    } else {
      meldung('Kopieren wird von diesem Browser nicht unterstützt.');
    }
  }

  /* ---------------------------------------------------------------------
     Gesamtuebersicht
     --------------------------------------------------------------------- */
  function uebersichtZeichnen() {
    var behaelter = id('uebersicht-behaelter');
    leeren(behaelter);

    behaelter.appendChild(e('p', { klasse: 'einleitung', text:
      'Alle Stadien mit den jeweils zugelassenen Systemtherapien. Die Androgendeprivation wird in den metastasierten und kastrationsresistenten Stadien durchgehend fortgeführt.' }));

    daten.stadien.forEach(function (stadium) {
      var abschnitt = e('section', { klasse: 'stadium' });
      abschnitt.appendChild(e('p', { klasse: 'stadium__kurz', text: stadium.kurz }));
      abschnitt.appendChild(e('h2', { klasse: 'stadium__name', text: stadium.name }));
      abschnitt.appendChild(e('p', { klasse: 'stadium__text', text: stadium.beschreibung }));

      daten.therapien.filter(function (t) { return t.stadium === stadium.id; })
        .forEach(function (t) { abschnitt.appendChild(therapieKarte({ therapie: t, zustand: null, warnungen: [], luecken: [], ausschluss: [] })); });

      behaelter.appendChild(abschnitt);
    });

    behaelter.appendChild(e('p', { klasse: 'warnhinweis', text:
      'Verbindlich ist allein die aktuelle Fachinformation des gewählten Präparats.' }));
  }

  /* ---------------------------------------------------------------------
     Glossar
     --------------------------------------------------------------------- */
  function glossarZeichnen() {
    var behaelter = id('glossar-behaelter');
    leeren(behaelter);
    var liste = e('dl', { klasse: 'glossar' });
    (daten.abkuerzungen || []).forEach(function (a) {
      liste.appendChild(e('dt', { text: a.kurz }));
      liste.appendChild(e('dd', { text: a.lang }));
    });
    behaelter.appendChild(liste);
  }

  /* ---------------------------------------------------------------------
     Ansicht "Datenstand & App"
     --------------------------------------------------------------------- */
  function infoZeichnen() {
    id('stand-text').textContent =
      'Fassung ' + (daten.version || '–') + ', Stand ' + datumDeutsch(daten.stand) + '. ' +
      daten.therapien.length + ' Anwendungsgebiete in ' + daten.stadien.length + ' Stadien.';

    var grundlage = id('grundlage-karte');
    leeren(grundlage);
    grundlage.appendChild(e('p', { text: daten.grundlage || '' }));
    grundlage.appendChild(e('p', { klasse: 'hinweis-klein', text:
      'Aufbau nach dem Schema "Therapieoptionen im Krankheitsverlauf". Die Angaben wurden auf die Wirkstoffe umgestellt und mit den zugelassenen Anwendungsgebieten hinterlegt.' }));

    var aenderungen = id('aenderungen-karte');
    leeren(aenderungen);
    var ul = e('ul');
    (daten.aenderungen || []).slice().reverse().forEach(function (a) {
      ul.appendChild(e('li', {}, [
        e('strong', { text: datumDeutsch(a.datum) + ': ' }),
        document.createTextNode(a.text)
      ]));
    });
    aenderungen.appendChild(ul);
  }

  function kopfStand() {
    id('kopf-stand').textContent = 'Datenstand ' + datumDeutsch(daten.stand) +
      (navigator.onLine ? '' : ' · offline');
  }

  /* ---------------------------------------------------------------------
     Alles neu zeichnen, wenn frische Daten eingetroffen sind
     --------------------------------------------------------------------- */
  function datenUebernehmen(neue) {
    daten = neue;
    kopfStand();
    uebersichtZeichnen();
    glossarZeichnen();
    infoZeichnen();
    var schritt = aktuellerSchritt();
    if (schritt.ansicht === 'beratung' || schritt.ansicht === 'ergebnis') { zeichnen(); }
  }

  /* ---------------------------------------------------------------------
     Bestaetigung Fachkreise
     --------------------------------------------------------------------- */
  function schleusePruefen() {
    var bestaetigt = null;
    try { bestaetigt = localStorage.getItem('pca-fachkreis'); } catch (f) { bestaetigt = null; }
    if (bestaetigt) { return; }
    var schleuse = id('schleuse');
    schleuse.hidden = false;
    document.body.classList.add('gesperrt');
    id('knopf-schleuse').focus();
  }

  /* ---------------------------------------------------------------------
     Start
     --------------------------------------------------------------------- */
  function verdrahten() {
    id('knopf-zurueck').addEventListener('click', function () { history.back(); });

    Array.prototype.forEach.call(document.querySelectorAll('[data-ansicht], [data-start]'), function (knopf) {
      knopf.addEventListener('click', function () {
        if (knopf.getAttribute('data-start') === 'beratung') { beratungStarten(); return; }
        var ziel = knopf.getAttribute('data-ansicht');
        if (knopf.classList.contains('tab')) { zumStart(ziel); }
        else { vor({ ansicht: ziel }); }
      });
    });

    id('knopf-schleuse').addEventListener('click', function () {
      try { localStorage.setItem('pca-fachkreis', new Date().toISOString().slice(0, 10)); } catch (f) { /* ohne Speicher bei jedem Start erneut */ }
      id('schleuse').hidden = true;
      document.body.classList.remove('gesperrt');
      window.scrollTo(0, 0);
      id('inhalt').focus({ preventScroll: true });
    });

    id('knopf-pruefen').addEventListener('click', function () {
      var knopf = id('knopf-pruefen');
      knopf.disabled = true;
      knopf.textContent = 'Wird geprüft …';
      quelle.pruefen().then(function (ergebnis) {
        if (ergebnis.neu) {
          datenUebernehmen(ergebnis.daten);
          meldung('Neuer Datenstand vom ' + datumDeutsch(ergebnis.daten.stand) + ' geladen.');
        } else {
          meldung('Die Daten sind auf dem neuesten Stand.');
        }
      }).catch(function () {
        meldung('Der Server ist nicht erreichbar. Es gilt weiter der gespeicherte Stand.');
      }).then(function () {
        knopf.disabled = false;
        knopf.textContent = 'Jetzt auf Änderungen prüfen';
      });
    });

    window.addEventListener('online', kopfStand);
    window.addEventListener('offline', kopfStand);

    /* Android und Desktop bieten die Installation selbst an. */
    window.addEventListener('beforeinstallprompt', function (ereignis) {
      ereignis.preventDefault();
      installAufforderung = ereignis;
      var knopf = id('knopf-installieren');
      knopf.hidden = false;
      knopf.addEventListener('click', function () {
        if (!installAufforderung) { return; }
        installAufforderung.prompt();
        installAufforderung.userChoice.then(function () {
          installAufforderung = null;
          knopf.hidden = true;
        });
      });
    });
  }

  function dienstAnmelden() {
    if (!('serviceWorker' in navigator)) { return; }
    navigator.serviceWorker.register('sw.js').then(function (anmeldung) {
      anmeldung.addEventListener('updatefound', function () {
        var neuer = anmeldung.installing;
        if (!neuer) { return; }
        neuer.addEventListener('statechange', function () {
          if (neuer.state === 'installed' && navigator.serviceWorker.controller) {
            meldung('Eine neuere Programmfassung liegt bereit.', 'Jetzt laden', function () {
              neuer.postMessage({ befehl: 'uebernehmen' });
            });
          }
        });
      });
    }).catch(function () { /* ohne Service Worker laeuft die App weiter, nur nicht offline */ });

    var laedtNeu = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (laedtNeu) { return; }
      laedtNeu = true;
      window.location.reload();
    });
  }

  function starten() {
    verdrahten();
    schleusePruefen();
    history.replaceState({ tiefe: 1 }, '');

    quelle.laden(function (frisch, art) {
      datenUebernehmen(frisch);
      if (art === 'aktualisiert') {
        meldung('Neuer Datenstand vom ' + datumDeutsch(frisch.stand) + ' geladen.');
      }
    }).then(function (ergebnis) {
      datenUebernehmen(ergebnis.daten);
      zeichnen();
      /* Verknuepfung vom Startbildschirm: direkt in den Fragebogen. */
      try {
        if (new URLSearchParams(window.location.search).get('start') === 'fall') {
          beratungStarten();
        }
      } catch (f) { /* alte Browser ohne URLSearchParams */ }
    }).catch(function () {
      id('kopf-stand').textContent = 'Daten nicht verfügbar';
      var start = id('ansicht-start');
      start.insertBefore(e('p', { klasse: 'warnhinweis', text:
        'Die Therapiedaten konnten nicht geladen werden. Bitte die App einmal mit bestehender Internetverbindung öffnen.' }), start.firstChild);
    });

    dienstAnmelden();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', starten);
  } else {
    starten();
  }
})();
