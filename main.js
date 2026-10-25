/* =========================================================
   Neko-Yotsuba — Shared scripts (nav, dropdown, footer year)
   No analytics, no cookies, no storage. See privacy.html.
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

  /* ---------- Related Projects dropdown ---------- */
  document.querySelectorAll(".has-dropdown").forEach(function (dd) {
    var btn = dd.querySelector(".dropdown-toggle");
    if (!btn) return;

    function setOpen(open) {
      dd.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    }

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!dd.classList.contains("open"));
    });

    // Close on Escape, return focus to the toggle button
    dd.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && dd.classList.contains("open")) {
        setOpen(false);
        btn.focus();
      }
    });

    // Close when focus leaves the dropdown
    dd.addEventListener("focusout", function () {
      requestAnimationFrame(function () {
        if (!dd.contains(document.activeElement)) setOpen(false);
      });
    });
  });

  // Close any open dropdown when clicking elsewhere
  document.addEventListener("click", function () {
    document.querySelectorAll(".has-dropdown.open").forEach(function (dd) {
      dd.classList.remove("open");
      var b = dd.querySelector(".dropdown-toggle");
      if (b) b.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("footerYear");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
