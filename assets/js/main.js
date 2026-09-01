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

/* @vorschau-ende */
