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

      var betreff = "Terminanfrage: " + (get("anliegen") || "Allgemeine Anfrage");
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

/* ==========================================================================
   Nachtrag: Erklaerbild zur Vasektomie
   Alle vier Schritte stehen im HTML. Dieses Skript blendet jeweils einen
   ein und schaltet Text, Zaehler und Punkte mit. Ohne JavaScript bleibt
   Schritt 1 sichtbar; der Fliesstext der Seite beschreibt den Ablauf
   ohnehin vollstaendig.
   ========================================================================== */
(function () {
  "use strict";

  var kasten = document.querySelector("[data-erklaer]");
  if (!kasten) return;

  var SCHRITTE = [
    { titel: "Vorher",
      text: "Die Spermien reifen im Hoden und im Nebenhoden. Über den Samenleiter gelangen " +
            "sie beim Samenerguss nach außen. Er ist der einzige Weg – und genau hier setzt " +
            "der Eingriff an." },
    { titel: "Örtliche Betäubung und Zugang",
      text: "Der Bereich wird örtlich betäubt. Über einen sehr kleinen Zugang am Hodensack " +
            "wird der Samenleiter aufgesucht. Sie sind während des Eingriffs wach und " +
            "ansprechbar." },
    { titel: "Durchtrennen und Verschließen",
      text: "Ein kurzes Stück des Samenleiters wird entfernt, die beiden Enden werden " +
            "verschlossen und voneinander getrennt. Auf der Gegenseite geschieht dasselbe. " +
            "Der Zugang ist so klein, dass meist keine Naht nötig ist." },
    { titel: "Danach",
      text: "Hoden und Hormonhaushalt arbeiten unverändert weiter, ebenso Erektion, " +
            "Orgasmus und Samenerguss. Die Spermien werden weiterhin gebildet, gelangen " +
            "aber nicht mehr in das Ejakulat und werden vom Körper abgebaut. Bis zwei " +
            "Kontrolluntersuchungen das bestätigen, müssen Sie weiter verhüten." }
  ];

  var buehne     = kasten.querySelector(".erklaer__buehne");
  var zaehler    = kasten.querySelector("[data-erklaer-zaehler]");
  var titel      = kasten.querySelector("[data-erklaer-titel]");
  var text       = kasten.querySelector("[data-erklaer-text]");
  var punkteListe = kasten.querySelector("[data-erklaer-punkte]");
  var knoepfe    = kasten.querySelectorAll("[data-erklaer-richtung]");
  var phasen     = kasten.querySelectorAll("[data-phase]");

  var aktuell = 0;

  // Punkte zum direkten Anspringen erzeugen
  SCHRITTE.forEach(function (schritt, i) {
    var li = document.createElement("li");
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", "Schritt " + (i + 1) + ": " + schritt.titel);
    b.addEventListener("click", function () { zeige(i); });
    li.appendChild(b);
    punkteListe.appendChild(li);
  });
  var punkte = punkteListe.querySelectorAll("button");

  function zeige(i) {
    aktuell = Math.max(0, Math.min(SCHRITTE.length - 1, i));

    phasen.forEach(function (g, n) {
      var an = n === aktuell;
      g.style.opacity = an ? "1" : "0";
      // Unsichtbare Schritte duerfen keine Klicks abfangen
      g.style.pointerEvents = an ? "" : "none";
    });

    zaehler.textContent = "Schritt " + (aktuell + 1) + " von " + SCHRITTE.length;
    titel.textContent = SCHRITTE[aktuell].titel;
    text.textContent = SCHRITTE[aktuell].text;

    punkte.forEach(function (b, n) {
      b.setAttribute("aria-current", n === aktuell ? "true" : "false");
    });
    knoepfe.forEach(function (b) {
      var richtung = Number(b.dataset.erklaerRichtung);
      b.disabled = richtung < 0 ? aktuell === 0 : aktuell === SCHRITTE.length - 1;
    });
  }

  knoepfe.forEach(function (b) {
    b.addEventListener("click", function () {
      zeige(aktuell + Number(b.dataset.erklaerRichtung));
    });
  });

  // Mit den Pfeiltasten blaettern, wenn die Buehne den Fokus hat
  buehne.tabIndex = 0;
  buehne.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); zeige(aktuell + 1); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); zeige(aktuell - 1); }
  });

  // Alle Phasen uebereinanderlegen, damit die Buehne nicht springt
  phasen.forEach(function (g) { g.style.transition = "opacity .35s ease"; });

  zeige(0);
})();

/* @vorschau-ende */
