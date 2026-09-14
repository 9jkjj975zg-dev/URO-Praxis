/* ==========================================================================
   Urologische Gemeinschaftspraxis Rech — Skripte
   Bewusst schlank gehalten: kein Framework, keine externen Abhaengigkeiten,
   keine Tracker. Die Seite funktioniert auch vollstaendig ohne JavaScript.
   ========================================================================== */
(function () {
  "use strict";

  /* ----------------------------------------------------------------------
     1. Mobiles Navigationsmenue
     ---------------------------------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("hauptnavigation");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });

    // Menue schliessen, wenn ein Link angeklickt wird
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a") && window.innerWidth <= 1060) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      }
    });

    // Menue mit Escape schliessen
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        toggle.focus();
      }
    });
  }

  /* ----------------------------------------------------------------------
     2. Aktuellen Wochentag in den Sprechzeiten hervorheben
     ---------------------------------------------------------------------- */
  var heute = new Date().getDay(); // 0 = Sonntag
  document.querySelectorAll("[data-day]").forEach(function (row) {
    // An Samstagen und Sonntagen wird nichts hervorgehoben: Eine farbig
    // unterlegte Zeile "geschlossen" lenkt den Blick auf einen Tag, an dem
    // ohnehin niemand kommen kann.
    if (row.querySelector(".closed")) return;
    if (Number(row.getAttribute("data-day")) === heute) {
      row.classList.add("is-today");
    }
  });

  /* ----------------------------------------------------------------------
     3. Kontaktformular
     Die Website ist rein statisch und hat keinen Server im Hintergrund.
     Das Formular oeffnet daher das E-Mail-Programm mit vorbereitetem Text.
     Sobald ein serverseitiger Formular-Handler vorhanden ist, kann dieser
     Block entfernt und im <form> ein "action"-Ziel gesetzt werden.
     ---------------------------------------------------------------------- */
  var form = document.getElementById("kontaktformular");

  if (form) {
    form.addEventListener("submit", function (e) {
      // Honeypot: von Menschen nie ausgefuellt, von Bots meist schon
      var hp = form.querySelector('input[name="website"]');
      if (hp && hp.value !== "") {
        e.preventDefault();
        return;
      }

      if (!form.checkValidity()) {
        return; // Browser zeigt seine eigenen Fehlermeldungen
      }

      e.preventDefault();

      var get = function (name) {
        var el = form.elements[name];
        return el ? String(el.value).trim() : "";
      };

      var zeilen = [
        "Name: " + get("name"),
        "Telefon: " + get("telefon"),
        "E-Mail: " + get("email"),
        "Versicherung: " + get("versicherung"),
        "Anliegen: " + get("anliegen"),
        "",
        "Nachricht:",
        get("nachricht"),
        "",
        "-- gesendet ueber das Kontaktformular der Website --"
      ];

      // Versicherungsstatus in den Betreff: die Praxis sieht ihn schon im Posteingang
      var vers = get("versicherung");
      var betreff = "Terminanfrage: " + (get("anliegen") || "Allgemeine Anfrage") +
                    (vers ? " (" + vers + ")" : "");
      var ziel = form.getAttribute("data-mailto") || "kontakt@hanau-urologie.de";

      window.location.href =
        "mailto:" + ziel +
        "?subject=" + encodeURIComponent(betreff) +
        "&body=" + encodeURIComponent(zeilen.join("\n"));

      var hinweis = document.getElementById("formular-hinweis");
      if (hinweis) {
        hinweis.hidden = false;
        hinweis.focus();
      }
    });
  }

  /* ----------------------------------------------------------------------
     4. Jahreszahl im Fussbereich
     ---------------------------------------------------------------------- */
  document.querySelectorAll("[data-jahr]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();

/* @vorschau-anfang – die folgenden Bloecke uebernimmt auch die Vorschau */

/* ==========================================================================
   Nachtrag: aufklappbare Untermenues auf schmalen Schirmen
   Ohne dieses Skript bleibt der Knopf verborgen und die Untermenues offen -
   dann ist jede Seite ueber das Menue erreichbar, nur eben als lange Liste.
   Erst hier wird daraus eine Liste, die man selbst aufklappt.
   ========================================================================== */
(function () {
  "use strict";
  var nav = document.getElementById("hauptnavigation");
  if (!nav) return;

  var knoepfe = Array.prototype.slice.call(nav.querySelectorAll(".nav__auf"));
  if (!knoepfe.length) return;

  nav.classList.add("nav--klappbar");
  knoepfe.forEach(function (knopf) {
    knopf.hidden = false;
    knopf.addEventListener("click", function () {
      var punkt = knopf.closest(".nav__item");
      var offen = knopf.getAttribute("aria-expanded") === "true";
      knopf.setAttribute("aria-expanded", String(!offen));
      punkt.classList.toggle("nav__item--offen", !offen);
    });
  });

  /* Schliesst das Menue der Kopfleiste, klappen wir auch die Untermenues
     wieder ein - sonst steht es beim naechsten Oeffnen halb aufgeklappt da. */
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      if (nav.classList.contains("is-open")) return;
      knoepfe.forEach(function (knopf) {
        knopf.setAttribute("aria-expanded", "false");
        var punkt = knopf.closest(".nav__item");
        if (punkt) punkt.classList.remove("nav__item--offen");
      });
    });
  }
})();

/* ==========================================================================
   Nachtrag: seitlich scrollbare Patientenstimmen
   Das Scrollen selbst macht der Browser. Dieses Skript blendet nur die
   Pfeile ein und schaltet sie an den Enden ab.
   ========================================================================== */
(function () {
  "use strict";

  var bahn = document.querySelector("[data-stimmen]");
  var steuerung = document.querySelector("[data-stimmen-steuerung]");
  if (!bahn || !steuerung) return;

  steuerung.hidden = false;

  var zurueck = steuerung.querySelector('[data-richtung="-1"]');
  var vor = steuerung.querySelector('[data-richtung="1"]');

  function schrittweite() {
    var karte = bahn.querySelector(".stimme");
    return karte ? karte.getBoundingClientRect().width + 20 : bahn.clientWidth;
  }

  // Wegen des Innenabstands ruht die Leiste nicht exakt bei 0, daher Toleranz
  var TOLERANZ = 8;

  function knoepfeAktualisieren() {
    var rest = bahn.scrollWidth - bahn.clientWidth - bahn.scrollLeft;
    zurueck.disabled = bahn.scrollLeft <= TOLERANZ;
    vor.disabled = rest <= TOLERANZ;
  }

  steuerung.addEventListener("click", function (e) {
    var knopf = e.target.closest("button[data-richtung]");
    if (!knopf) return;
    bahn.scrollBy({ left: Number(knopf.dataset.richtung) * schrittweite() });
  });

  bahn.addEventListener("scroll", knoepfeAktualisieren, { passive: true });
  window.addEventListener("resize", knoepfeAktualisieren);
  knoepfeAktualisieren();
})();


  /* ----------------------------------------------------------------------
     6. Orientierungshilfe zur Vorsorge (nur auf leistung-vorsorge.html)

     Bewusst keine Risikoberechnung und keine Empfehlung: Die Auswertung sagt
     nur, welche Untersuchungen ueblicherweise infrage kommen und wer sie
     bezahlt. Alle Angaben bleiben im Browser.
     ---------------------------------------------------------------------- */
  var check = document.getElementById("vorsorge-check");
  var ergebnisFeld = document.getElementById("check-ergebnis");

  if (check && ergebnisFeld) {
    // wer zahlt: "kasse" = Leistung der gesetzlichen Krankenversicherung,
    //            "selbst" = keine Kassenleistung
    var bausteine = function (a) {
      var liste = [];

      liste.push({
        titel: "Tastuntersuchung von Prostata und äußerem Genitale",
        text: "Die Basisuntersuchung. Sie dauert wenige Minuten und ist der Ausgangspunkt "
            + "für alles Weitere.",
        traeger: a.alter === "u45" ? "selbst" : "kasse",
        zusatz: a.alter === "u45"
          ? "Als Kassenleistung besteht der Anspruch erst ab 45 Jahren."
          : "Einmal jährlich als Leistung der gesetzlichen Krankenversicherung."
      });

      liste.push({
        titel: "PSA-Bestimmung im Blut",
        text: "Ein Laborwert aus der Prostata. Er kann Hinweise geben, bevor sich etwas "
            + "tasten lässt – und ist auch deshalb umstritten, weil er Untersuchungen "
            + "nach sich ziehen kann, die sich später als unnötig erweisen. Genau darüber "
            + "sprechen wir mit Ihnen, bevor Sie sich entscheiden.",
        traeger: "selbst",
        zusatz: "Zur Früherkennung ohne Beschwerden keine Leistung der gesetzlichen "
              + "Krankenversicherung."
      });

      liste.push({
        titel: "Ultraschall von Prostata, Nieren und Harnblase mit Restharnbestimmung",
        text: "Ohne Röntgenstrahlen, ohne Vorbereitung, Befund sofort im Gespräch.",
        traeger: "selbst",
        zusatz: "Im Rahmen der reinen Früherkennung keine Kassenleistung. Bei einer "
              + "konkreten medizinischen Fragestellung sieht das anders aus."
      });

      if (a.alter === "ab65") {
        liste.push({
          titel: "Ultraschall der Bauchschlagader",
          text: "Einmalige Untersuchung auf eine Aussackung der Bauchaorta. Sie verläuft "
              + "lange ohne Beschwerden und lässt sich im Ultraschall gut erkennen.",
          traeger: "kasse",
          zusatz: "Für Männer ab 65 Jahren einmalig als Kassenleistung vorgesehen."
        });
      }

      if (a.alter === "u45") {
        liste.push({
          titel: "Untersuchung der Hoden und Anleitung zur Selbstuntersuchung",
          text: "Hodentumoren treten überwiegend zwischen dem 20. und 40. Lebensjahr auf. "
              + "Wer weiß, wie sich ein gesunder Hoden anfühlt, bemerkt Veränderungen früh.",
          traeger: "selbst",
          zusatz: "Ohne Beschwerden keine Kassenleistung – der Zeitaufwand ist gering."
        });
      }

      return liste;
    };

    var hinweise = function (a) {
      var texte = [];
      if (a.familie === "ja") {
        texte.push("Weil in Ihrer Familie Prostatakrebs aufgetreten ist, empfehlen die "
                 + "Fachgesellschaften, das Gespräch über die Früherkennung früher zu "
                 + "beginnen und die Abstände kürzer zu wählen. Bringen Sie bitte mit, "
                 + "wer betroffen war und in welchem Alter.");
      } else if (a.familie === "unklar") {
        texte.push("Ob in Ihrer Familie Prostatakrebs aufgetreten ist, beeinflusst, ab "
                 + "wann und wie oft eine Früherkennung sinnvoll ist. Es lohnt sich, vor "
                 + "dem Termin in der Familie nachzufragen.");
      }
      if (a.letzte === "nie") {
        texte.push("Für den ersten Termin planen wir mehr Zeit ein – bringen Sie bitte "
                 + "Vorbefunde und eine Liste Ihrer Medikamente mit.");
      } else if (a.letzte === "laenger") {
        texte.push("Üblich ist ein Abstand von einem Jahr. Frühere Befunde helfen uns, "
                 + "Veränderungen einzuordnen – bringen Sie sie gern mit.");
      }
      return texte;
    };

    var kostenText = function (traeger, kasse) {
      if (kasse === "gkv") {
        return traeger === "kasse"
          ? { wort: "Kasse", art: "kasse" }
          : { wort: "Selbstzahlerleistung", art: "selbst" };
      }
      if (kasse === "pkv") {
        return { wort: "Abrechnung nach GOÄ", art: "goae" };
      }
      return { wort: "Selbstzahlerleistung", art: "selbst" };
    };

    check.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!check.checkValidity()) {
        check.reportValidity();
        return;
      }

      var wert = function (name) {
        var el = check.querySelector('input[name="' + name + '"]:checked');
        return el ? el.value : "";
      };
      var a = {
        alter:   wert("alter"),
        familie: wert("familie"),
        letzte:  wert("letzte"),
        kasse:   wert("kasse")
      };

      var teile = [];
      teile.push("<h3>Das kommt für Sie infrage</h3>");

      if (a.kasse === "pkv") {
        teile.push('<p class="check__vorspann">Als privatversicherte oder '
                 + "beihilfeberechtigte Person rechnen wir alle folgenden Leistungen nach "
                 + "der Gebührenordnung für Ärzte ab. Ihre Versicherung erstattet sie in "
                 + "der Regel im Rahmen Ihres Tarifs.</p>");
      } else if (a.kasse === "sz") {
        teile.push('<p class="check__vorspann">Als Selbstzahler erhalten Sie vor der '
                 + "Untersuchung eine schriftliche Vereinbarung, in der die einzelnen "
                 + "Positionen aufgeführt sind.</p>");
      }

      teile.push('<ul class="check__liste">');
      bausteine(a).forEach(function (b) {
        var k = kostenText(b.traeger, a.kasse);
        teile.push('<li class="check__punkt">'
          + '<div class="check__punkt-kopf">'
          + '<h4>' + b.titel + "</h4>"
          + '<span class="marke marke--' + k.art + '">' + k.wort + "</span>"
          + "</div>"
          + "<p>" + b.text + "</p>"
          + '<p class="check__fein">' + b.zusatz + "</p>"
          + "</li>");
      });
      teile.push("</ul>");

      var extra = hinweise(a);
      if (extra.length) {
        teile.push("<h3>Für Ihren Termin</h3><ul class=\"check__merken\">");
        extra.forEach(function (t) { teile.push("<li>" + t + "</li>"); });
        teile.push("</ul>");
      }

      teile.push('<div class="note note--warn"><span class="note__title">'
        + "Diese Übersicht ersetzt kein ärztliches Gespräch</span><p>"
        + "Sie zeigt nur, welche Untersuchungen üblicherweise infrage kommen und wer sie "
        + "bezahlt. Sie ist keine Diagnose und keine Empfehlung für Ihren Einzelfall. "
        + "Was in Ihrer Situation sinnvoll ist, besprechen wir persönlich."
        + "</p></div>");

      teile.push('<p class="check__weiter"><a href="selbstzahler-preise.html">'
        + "Preise der Selbstzahlerleistungen ansehen</a></p>");

      ergebnisFeld.innerHTML = teile.join("");
      ergebnisFeld.hidden = false;
      ergebnisFeld.focus();
      ergebnisFeld.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    check.addEventListener("reset", function () {
      ergebnisFeld.hidden = true;
      ergebnisFeld.innerHTML = "";
    });
  }


  /* ----------------------------------------------------------------------
     7. Vertretung nur waehrend der Schliesszeit einblenden

     Der Kasten steht mit "hidden" im Quelltext und wird nur an den Tagen
     zwischen data-von und data-bis sichtbar (jeweils einschliesslich).
     Ohne JavaScript bleibt er verborgen - lieber keine Angabe als eine
     falsche.
     ---------------------------------------------------------------------- */
  var heuteAlsText = function () {
    var d = new Date();
    var m = String(d.getMonth() + 1);
    var t = String(d.getDate());
    return d.getFullYear() + "-" + (m.length < 2 ? "0" + m : m)
                           + "-" + (t.length < 2 ? "0" + t : t);
  };

  var heute = heuteAlsText();

  Array.prototype.forEach.call(
    document.querySelectorAll(".vertretung[data-von][data-bis]"),
    function (kasten) {
      var von = kasten.getAttribute("data-von");
      var bis = kasten.getAttribute("data-bis");
      // Datumsangaben im Format JJJJ-MM-TT lassen sich direkt vergleichen
      if (von <= heute && heute <= bis) {
        kasten.hidden = false;
      }
    }
  );

  /* ----------------------------------------------------------------------
     8. Schemazeichnung zur Vasektomie

     Die Grafik zeigt standardmaessig den Endzustand. Kommt sie ins Bild,
     laeuft die vierteilige Folge genau einmal ab. Danach laesst sie sich
     ueber den Knopf erneut starten; der Knopf erscheint erst, wenn die
     Folge ueberhaupt laufen kann. Ohne JavaScript oder ohne
     IntersectionObserver bleibt es beim Endzustand.
     ---------------------------------------------------------------------- */
  var starteFolge = function (grafik) {
    grafik.classList.remove("schema--laeuft");
    // Neuberechnung erzwingen, sonst startet die Animation nicht neu
    void grafik.getBoundingClientRect().width;
    grafik.classList.add("schema--laeuft");
  };

  Array.prototype.forEach.call(
    document.querySelectorAll(".schema"),
    function (bild) {
      var grafik = bild.querySelector("svg");
      var knopf = bild.querySelector(".schema__wieder");
      if (!grafik) { return; }

      if (knopf) {
        knopf.hidden = false;
        knopf.addEventListener("click", function () { starteFolge(grafik); });
      }

      if (window.IntersectionObserver) {
        var beobachter = new IntersectionObserver(function (eintraege, beob) {
          Array.prototype.forEach.call(eintraege, function (eintrag) {
            if (eintrag.isIntersecting) {
              starteFolge(grafik);
              beob.unobserve(eintrag.target);
            }
          });
        }, { threshold: 0.5 });
        beobachter.observe(grafik);
      }
    }
  );

  /* ----------------------------------------------------------------------
     9. Sanftes Einblenden einzelner Ueberschriften beim Scrollen

     Bewusst dezent und nur an ausgewaehlten Stellen eingesetzt. Die Klassen
     setzt ausschliesslich dieses Skript - ohne JavaScript oder ohne
     IntersectionObserver bleibt die Ueberschrift einfach normal sichtbar.
     ---------------------------------------------------------------------- */
  if (window.IntersectionObserver) {
    // Im ersten Entwurf blendete sich nur an wenigen Stellen etwas ein, dafuer
    // verschwanden die Bloecke am oberen Bildrand. Hier ist es umgekehrt: Der
    // obere Rand bleibt ruhig, dafuer kommt jeder Baustein beim Erreichen des
    // Sichtbereichs einmal sanft herein. Die Auswahl bleibt bewusst grob -
    // Fliesstext und einzelne Listenpunkte gehoeren nicht dazu, sonst flackert
    // die Seite beim Lesen.
    var EINBLENDEN = [
      "[data-reveal]", "#inhalt .section-head", "#inhalt .card", "#inhalt .zahl",
      "#inhalt .spektrum > li", "#inhalt .stimme", "#inhalt .meldung",
      "#inhalt .person", "#inhalt .foto", "#inhalt .note", "#inhalt .schema",
      "#inhalt .hero__fact", "#inhalt .map-box", "#inhalt .faq details"
    ].join(", ");

    Array.prototype.forEach.call(
      document.querySelectorAll(EINBLENDEN),
      function (element, i) {
        // Nachbarn kommen leicht versetzt herein. Mehr als vier Stufen nicht:
        // sonst wartet man bei einer Reihe aus acht Kacheln auf die letzte.
        var geschwister = element.parentElement
          ? Array.prototype.indexOf.call(element.parentElement.children, element)
          : 0;
        if (geschwister > 0) {
          element.style.transitionDelay = (Math.min(geschwister, 3) * 0.08) + "s";
        }
        element.classList.add("reveal", "reveal--ready");
        var revealBeobachter = new IntersectionObserver(function (eintraege, beob) {
          Array.prototype.forEach.call(eintraege, function (eintrag) {
            if (eintrag.isIntersecting) {
              eintrag.target.classList.add("reveal--visible");
              beob.unobserve(eintrag.target);
            }
          });
        }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
        revealBeobachter.observe(element);
      }
    );
  }

  /* ----------------------------------------------------------------------
     10. Parallax fuer das Wasserzeichen im Hero

     Rein dekorativ: das Logo-Symbol im Hintergrund bewegt sich beim
     Scrollen etwas langsamer als der Rest der Seite. Ohne JavaScript
     oder bei bevorzugter Bewegungsreduktion bleibt es einfach an Ort
     und Stelle stehen.
     ---------------------------------------------------------------------- */
  var wasserzeichen = document.querySelector("[data-parallax-bg]");
  if (wasserzeichen && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var wzTicking = false;
    var wzAktualisieren = function () {
      var y = window.scrollY || window.pageYOffset;
      wasserzeichen.style.setProperty("--wz-parallax", Math.round(y * 0.28) + "px");
      wzTicking = false;
    };
    window.addEventListener("scroll", function () {
      if (!wzTicking) {
        window.requestAnimationFrame(wzAktualisieren);
        wzTicking = true;
      }
    }, { passive: true });
  }

  /* ----------------------------------------------------------------------
     12. Selbsttest zu Beschwerden beim Wasserlassen

     Zaehlt die Punkte der sieben Fragen zusammen und ordnet sie ein. Die
     Antworten bleiben im Browser: Es gibt kein Formularziel, nichts wird
     gesendet oder gespeichert. Ohne JavaScript bleiben die Fragen lesbar
     und der Hinweistext im Ergebnisfeld stehen.
     ---------------------------------------------------------------------- */
  var ipss = document.getElementById("ipss");
  var ipssFeld = document.getElementById("ipss-ergebnis");

  if (ipss && ipssFeld) {
    var STUFEN = [
      { bis: 7,  name: "leichte Beschwerden",
        text: "In diesem Bereich ist abwartendes Beobachten der übliche Weg. Wenn Sie damit " +
              "gut zurechtkommen, muss nichts geschehen – ein Termin lohnt sich trotzdem, " +
              "um einmal zu prüfen, ob sich die Blase vollständig entleert." },
      { bis: 19, name: "mittelgradige Beschwerden",
        text: "In diesem Bereich lohnt sich eine Abklärung. Ob eine Behandlung sinnvoll ist, " +
              "hängt davon ab, wie sehr Sie die Beschwerden belasten und was der Ultraschall " +
              "zeigt – vor allem die Prostatagröße und der Restharn." },
      { bis: 35, name: "ausgeprägte Beschwerden",
        text: "In diesem Bereich sollten Sie einen Termin nicht aufschieben. Anhaltende " +
              "Beschwerden dieser Stärke gehen häufiger mit Restharn einher, und der lässt " +
              "sich nur mit Ultraschall feststellen." }
    ];

    var LEBENSTEXT = ["ausgezeichnet", "zufrieden", "überwiegend zufrieden", "teils, teils",
                      "überwiegend unzufrieden", "unglücklich", "sehr schlecht"];

    var auswerten = function () {
      var summe = 0, beantwortet = 0, i;
      for (i = 1; i <= 7; i++) {
        var gewaehlt = ipss.querySelector('input[name="f' + i + '"]:checked');
        if (gewaehlt) { summe += Number(gewaehlt.value); beantwortet++; }
      }

      if (beantwortet < 7) {
        ipssFeld.innerHTML = '<p class="check__vorspann">Noch ' + (7 - beantwortet) +
          (beantwortet === 6 ? " Frage" : " Fragen") +
          ' offen &ndash; die Auswertung erscheint hier von selbst.</p>';
        return;
      }

      var stufe = STUFEN[0];
      for (i = 0; i < STUFEN.length; i++) {
        if (summe <= STUFEN[i].bis) { stufe = STUFEN[i]; break; }
      }

      var leben = ipss.querySelector('input[name="lebensqualitaet"]:checked');
      var zusatz = "";
      if (leben) {
        zusatz = '<p>Zur Lebensqualität haben Sie &bdquo;' +
                 LEBENSTEXT[Number(leben.value)] +
                 '&ldquo; angegeben. Diese Angabe zählt nicht in die Punktzahl hinein, ist im ' +
                 'Gespräch aber oft die wichtigere: Sie entscheidet mit darüber, ob eine ' +
                 'Behandlung sich für Sie lohnt.</p>';
      }

      ipssFeld.innerHTML =
        '<p class="ipss-punkte">' + summe + ' <small>von 35 Punkten</small></p>' +
        '<p class="ipss-stufe">' + stufe.name + '</p>' +
        '<p>' + stufe.text + '</p>' + zusatz +
        '<p><a class="btn btn--accent" href="kontakt.html#termin">Termin anfragen</a></p>';
    };

    ipss.addEventListener("change", auswerten);
    ipss.addEventListener("submit", function (e) { e.preventDefault(); });
  }

  /* ----------------------------------------------------------------------
     13. Laufband im Hinweisbalken

     Die Meldung wandert gleichmaessig nach links. Damit der Uebergang ohne
     Sprung gelingt, wird sie so oft vervielfaeltigt, dass sie die Breite
     einmal fuellt; anschliessend wird der ganze Satz noch einmal gedoppelt.
     Verschoben wird dann genau um die Haelfte - in dem Moment steht wieder
     dasselbe Bild wie am Anfang.

     Die Dauer richtet sich nach der Laenge, damit kurze und lange Meldungen
     gleich schnell laufen und nicht gleich lange.

     Ohne JavaScript oder bei bevorzugter Bewegungsreduktion passiert nichts:
     Die Meldung steht dann still, wie sie im Quelltext steht.
     ---------------------------------------------------------------------- */
  var balken = document.querySelector(".hinweisbalken");

  if (balken && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var fenster = balken.querySelector(".hinweisbalken__lauf");
    var spur = balken.querySelector(".hinweisbalken__spur");
    var halt = balken.querySelector(".hinweisbalken__halt");
    var TEMPO = 41;   // Bildpunkte je Sekunde

    var aufbauen = function () {
      balken.classList.remove("hinweisbalken--laeuft");
      // auf eine einzige Meldung zuruecksetzen
      while (spur.children.length > 1) { spur.removeChild(spur.lastElementChild); }

      var meldung = spur.firstElementChild;
      if (!meldung || !fenster.clientWidth) { return; }

      // so oft wiederholen, bis die Breite einmal gefuellt ist
      var schutz = 0;
      while (spur.scrollWidth < fenster.clientWidth && schutz < 40) {
        var kopie = meldung.cloneNode(true);
        kopie.setAttribute("aria-hidden", "true");
        spur.appendChild(kopie);
        schutz++;
      }

      // den gesamten Satz einmal doppeln - das ist die zweite Haelfte
      var satz = [].slice.call(spur.children);
      var breite = spur.scrollWidth;
      satz.forEach(function (teil) {
        var kopie = teil.cloneNode(true);
        kopie.setAttribute("aria-hidden", "true");
        spur.appendChild(kopie);
      });

      // Abstand zwischen den Meldungen zaehlt zur Strecke dazu
      var luecke = parseFloat(getComputedStyle(spur).columnGap) || 0;
      var strecke = breite + luecke;
      spur.style.setProperty("--lauf-dauer", (strecke / TEMPO).toFixed(1) + "s");
      balken.classList.add("hinweisbalken--laeuft");
    };

    if (halt) {
      halt.hidden = false;
      halt.addEventListener("click", function () {
        var gehalten = balken.classList.toggle("hinweisbalken--gehalten");
        halt.setAttribute("aria-pressed", String(gehalten));
        halt.querySelector(".hinweisbalken__halt-text").textContent =
          gehalten ? "Weiter" : "Anhalten";
      });
    }

    aufbauen();

    var neuAufbauen;
    window.addEventListener("resize", function () {
      window.clearTimeout(neuAufbauen);
      neuAufbauen = window.setTimeout(aufbauen, 200);
    }, { passive: true });
  }

/* @vorschau-ende */

/* ==========================================================================
   Nachtraege des hellen Entwurfs
   ========================================================================== */

/* --------------------------------------------------------------------------
   A. Kopfbereich beim Scrollen flacher stellen
   Die Klasse schaltet nur Polsterung, Schatten und Trennlinie um. Ohne
   JavaScript bleibt der Kopfbereich in seiner hohen Fassung stehen - das
   sieht genauso richtig aus, nur eben immer gleich.
   -------------------------------------------------------------------------- */
(function () {
  "use strict";
  var kopf = document.querySelector(".site-header");
  if (!kopf) { return; }

  var laeuft = false;
  var pruefen = function () {
    kopf.classList.toggle("ist-geklebt", (window.scrollY || window.pageYOffset) > 12);
    laeuft = false;
  };
  window.addEventListener("scroll", function () {
    if (!laeuft) { window.requestAnimationFrame(pruefen); laeuft = true; }
  }, { passive: true });
  pruefen();
})();

/* --------------------------------------------------------------------------
   B. Menueflaeche auf schmalen Schirmen
   Die Flaeche selbst faehrt ueber CSS herein (Klasse "is-open", gesetzt in
   Abschnitt 1). Hier kommen nur die beiden Dinge dazu, die sich in CSS
   nicht loesen lassen: ein abdunkelnder Grund zum Antippen und das
   Feststellen der Seite darunter, damit nicht zwei Dinge gleichzeitig
   scrollen.
   -------------------------------------------------------------------------- */
(function () {
  "use strict";
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("hauptnavigation");
  if (!toggle || !nav) { return; }

  var grund = document.createElement("div");
  grund.className = "nav-grund";
  grund.hidden = true;
  document.body.appendChild(grund);

  var nachfuehren = function () {
    var offen = nav.classList.contains("is-open");
    grund.hidden = !offen;
    document.documentElement.classList.toggle("menue-offen", offen);
  };

  toggle.addEventListener("click", function () {
    // Die Klasse setzt Abschnitt 1; hier wird nur nachgezogen.
    window.setTimeout(nachfuehren, 0);
  });
  nav.addEventListener("click", nachfuehren);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { window.setTimeout(nachfuehren, 0); }
  });
  grund.addEventListener("click", function () {
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    nachfuehren();
    toggle.focus();
  });
})();

/* --------------------------------------------------------------------------
   C. "Heute geoeffnet" in der Sprechzeiten-Karte
   Zeigt an, ob gerade Sprechstunde ist. Die Zeiten stehen hier ein zweites
   Mal - werden sie geaendert, muss diese Tabelle mitgeaendert werden.
   Ohne JavaScript bleibt die Zeile leer; die Karte zeigt dann nur die
   Zeiten, und das ist die Hauptsache.

   Reihenfolge wie bei getDay(): 0 = Sonntag.
   Jede Spanne in Minuten seit Mitternacht.
   -------------------------------------------------------------------------- */
(function () {
  "use strict";
  var feld = document.querySelector("[data-jetzt]");
  if (!feld) { return; }

  var ZEITEN = {
    1: [[450, 780], [840, 990]],   // Montag     07:30-13:00, 14:00-16:30
    2: [[450, 780], [840, 990]],   // Dienstag
    3: [[450, 780]],               // Mittwoch   07:30-13:00
    4: [[450, 780], [840, 990]],   // Donnerstag
    5: [[450, 780]]                // Freitag
  };

  var jetzt = new Date();
  var spannen = ZEITEN[jetzt.getDay()] || [];
  var minute = jetzt.getHours() * 60 + jetzt.getMinutes();

  var offen = spannen.some(function (spanne) {
    return minute >= spanne[0] && minute < spanne[1];
  });

  // Die naechste Sprechstunde am selben Tag, falls gerade Mittagspause ist.
  var spaeter = spannen.filter(function (spanne) { return minute < spanne[0]; })[0];

  var text;
  if (offen) {
    text = "Jetzt geöffnet";
  } else if (spaeter) {
    var h = Math.floor(spaeter[0] / 60);
    var m = spaeter[0] % 60;
    text = "Heute wieder ab " + h + ":" + (m < 10 ? "0" : "") + m + " Uhr";
  } else {
    text = "Gerade geschlossen";
  }

  feld.className = "jetzt " + (offen ? "jetzt--offen" : "jetzt--zu");
  feld.innerHTML = '<span class="jetzt__punkt" aria-hidden="true"></span>' + text;
})();
