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
      if (e.target.closest("a") && window.innerWidth <= 1040) {
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
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-reveal]"),
      function (element) {
        element.classList.add("reveal", "reveal--ready");
        var revealBeobachter = new IntersectionObserver(function (eintraege, beob) {
          Array.prototype.forEach.call(eintraege, function (eintrag) {
            if (eintrag.isIntersecting) {
              eintrag.target.classList.add("reveal--visible");
              beob.unobserve(eintrag.target);
            }
          });
        }, { threshold: 0.3 });
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
     11. Inhalte am oberen Bildrand ausblenden

     Waehrend ein Block unter der Kopfleiste verschwindet, nimmt seine
     Deckkraft ab und er zieht ein Stueck nach oben davon.

     Der Effekt gilt fuer den gesamten Inhaltsbereich jeder Seite, damit er
     sich ueberall gleich verhaelt: Ueberschriften, Absaetze, einzelne
     Listenpunkte, Karten, Hinweiskaesten, Abbildungen, Tabellen und
     aufklappbare Antworten. Ausgenommen bleibt, was ausserhalb von <main>
     steht - Kopfleiste, Meldungsband und Fussbereich.

     Wichtig ist, dass sich die Bloecke nicht verschachteln: Waeren ein
     Kasten und der Absatz darin gleichzeitig gewaehlt, wuerden sich beide
     Deckkraefte multiplizieren und der Absatz doppelt so schnell
     verschwinden. Deshalb faellt jeder Kandidat heraus, der bereits in
     einem gewaehlten Block liegt - der aeussere gewinnt.

     Gemessen wird die Unterkante: Solange sie unter dem Uebergangsbereich
     liegt, bleibt der Block unveraendert. Text, den man gerade liest, wird
     also nie blass.

     Die Lage im Dokument aendert sich beim Scrollen nicht, deshalb wird sie
     einmal gemessen und nur bei Groessenaenderungen neu bestimmt. Pro Bild
     bleibt dann reine Rechenarbeit.

     Ohne JavaScript oder bei bevorzugter Bewegungsreduktion bleibt alles
     unveraendert sichtbar.
     ---------------------------------------------------------------------- */
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var AUSWAHL = [
      ".section-head", ".card", ".note", ".vertretung", ".meldung",
      "figure", "details", ".tabelle-rahmen", ".btn-row", ".person",
      "h1", "h2", "h3", "h4", "p", "li", "blockquote"
    ].map(function (w) { return "#inhalt " + w; }).join(", ");

    var bloecke = [];
    Array.prototype.forEach.call(document.querySelectorAll(AUSWAHL), function (el) {
      // Kandidaten in Dokumentreihenfolge: ein bereits gewaehlter Vorfahr
      // traegt die Klasse schon, dann bleibt dieser Block aussen vor.
      if (el.parentElement && el.parentElement.closest(".ausblenden")) { return; }
      el.classList.add("ausblenden");
      bloecke.push(el);
    });

    if (bloecke.length) {
      var lagen = [];
      var kopfhoehe = 76;
      // Der Uebergang beginnt spaet und dicht an der Kopfleiste: Was noch
      // im Lesebereich steht, bleibt unveraendert scharf.
      var STRECKE = 150;   // Hoehe des Uebergangs in Pixeln
      var WEG = 30;        // wie weit der Block dabei nach oben zieht

      var vermessen = function () {
        var kopf = document.querySelector(".site-header");
        kopfhoehe = kopf ? kopf.getBoundingClientRect().height : 76;
        var oben = window.scrollY || window.pageYOffset;
        lagen = bloecke.map(function (block) {
          // ohne eigene Verschiebung messen, sonst wandert der Bezugspunkt
          block.style.transform = "";
          var mass = block.getBoundingClientRect();
          // Nicht dargestellte Bloecke haben keine Ausdehnung. Ihre Lage waere
          // nur eine Null, aus der spaeter faelschlich "laengst oben hinaus"
          // wuerde - deshalb bleiben sie vorerst unbeschrieben.
          if (mass.width === 0 && mass.height === 0) { return null; }
          return mass.bottom + oben;
        });
        letzte = [];
      };

      var letzte = [];
      var rahmenLaeuft = false;

      var zeichnen = function () {
        var oben = window.scrollY || window.pageYOffset;
        var ende = kopfhoehe + 6;          // ab hier vollstaendig verschwunden
        var start = ende + STRECKE;        // bis hierhin unveraendert
        for (var i = 0; i < bloecke.length; i++) {
          // Solange ein Block noch auf sein Einblenden wartet (Abschnitt 9),
          // gehoert er diesem und wird hier nicht angefasst.
          if (bloecke[i].classList.contains("reveal--ready") &&
              !bloecke[i].classList.contains("reveal--visible")) { continue; }
          if (lagen[i] === null) {          // war beim Messen nicht dargestellt
            if (letzte[i] !== 1) {
              bloecke[i].style.opacity = "";
              bloecke[i].style.transform = "";
              letzte[i] = 1;
            }
            continue;
          }
          var unterkante = lagen[i] - oben;
          var wert = (unterkante - ende) / (start - ende);
          if (wert > 1) { wert = 1; } else if (wert < 0) { wert = 0; }
          wert = wert * wert * (3 - 2 * wert);   // weicher Verlauf
          if (letzte[i] !== undefined && Math.abs(letzte[i] - wert) < 0.01) { continue; }
          letzte[i] = wert;
          if (wert === 1) {
            bloecke[i].style.opacity = "";
            bloecke[i].style.transform = "";
          } else {
            bloecke[i].style.opacity = String(wert);
            bloecke[i].style.transform =
              "translateY(" + ((1 - wert) * -WEG).toFixed(1) + "px)";
          }
        }
        rahmenLaeuft = false;
      };

      var anstossen = function () {
        if (!rahmenLaeuft) {
          window.requestAnimationFrame(zeichnen);
          rahmenLaeuft = true;
        }
      };

      vermessen();
      zeichnen();
      window.addEventListener("scroll", anstossen, { passive: true });

      var neuVermessen;
      window.addEventListener("resize", function () {
        window.clearTimeout(neuVermessen);
        neuVermessen = window.setTimeout(function () { vermessen(); anstossen(); }, 150);
      }, { passive: true });

      // Aufklappbare Antworten aendern die Hoehe der Seite
      document.addEventListener("toggle", function () {
        vermessen(); anstossen();
      }, true);

      // Aendert sich der Inhalt selbst - etwa weil in der Einzeldatei-Vorschau
      // eine andere Seite eingeblendet wird -, stimmen die gemerkten Lagen
      // nicht mehr. Dann wird neu gemessen.
      if (window.ResizeObserver) {
        var inhaltsbereich = document.getElementById("inhalt");
        if (inhaltsbereich) {
          new ResizeObserver(function () {
            vermessen(); anstossen();
          }).observe(inhaltsbereich);
        }
      }
    }
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
    var TEMPO = 55;   // Bildpunkte je Sekunde

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
