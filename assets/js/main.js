/* =========================================================
   Neko-Yotsuba — Shared behaviour (nav, reveal animations)
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Mobile menu toggle ---------- */
  var toggle = document.getElementById("menuToggle");
  var links = document.getElementById("navLinks");

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "✕" : "☰";
    });
  }

  /* ---------- Dropdowns: keyboard + mobile accessible ---------- */
  var MOBILE = "(max-width: 900px)";

  function syncAria() {
    document.querySelectorAll(".has-dropdown").forEach(function (li) {
      var a = li.querySelector(":scope > a");
      if (a) a.setAttribute("aria-expanded", li.classList.contains("open") ? "true" : "false");
    });
  }

  document.querySelectorAll(".has-dropdown > a").forEach(function (a) {
    // On small screens, first tap just expands the submenu
    a.addEventListener("click", function (e) {
      if (window.matchMedia(MOBILE).matches) {
        var parent = a.parentElement;
        if (!parent.classList.contains("open")) {
          e.preventDefault();
          parent.classList.add("open");
          syncAria();
        }
      }
    });
    // Keyboard support on desktop: Enter/Space toggles the submenu
    a.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        if (!window.matchMedia(MOBILE).matches) {
          e.preventDefault();
          var parent = a.parentElement;
          parent.classList.add("open");
          syncAria();
          var first = parent.querySelector(".dropdown-menu a");
          if (first) first.focus();
        }
      }
    });
  });

  // Escape closes any open dropdown / mobile menu
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".has-dropdown.open").forEach(function (li) {
        li.classList.remove("open");
      });
      syncAria();
      if (links && links.classList.contains("open") && toggle) {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "☰";
      }
    }
  });

  // Clicking outside the nav closes open dropdowns
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".has-dropdown")) {
      document.querySelectorAll(".has-dropdown.open").forEach(function (li) {
        li.classList.remove("open");
      });
      syncAria();
    }
  });

  /* ---------- Scroll reveal animations ---------- */
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("visible");
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("footerYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
