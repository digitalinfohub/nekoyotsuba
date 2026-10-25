/* =========================================================
   Digital Infohub — Shared behaviour (nav, reveal animations)
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

  /* ---------- Mobile dropdown tap-to-open ---------- */
  document.querySelectorAll(".has-dropdown > a").forEach(function (a) {
    a.addEventListener("click", function (e) {
      // On small screens, first tap just expands the submenu
      if (window.matchMedia("(max-width: 820px)").matches) {
        var parent = a.parentElement;
        if (!parent.classList.contains("open")) {
          e.preventDefault();
          parent.classList.add("open");
        }
      }
    });
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
