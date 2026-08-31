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
