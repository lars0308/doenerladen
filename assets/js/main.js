/* =========================================================
   Lindhorster Grill & Dönerhaus — shared site behaviour
   Nav, Cookie-Hinweis, gemeinsame GSAP Reveal-Utilities
   ========================================================= */
(function () {
  "use strict";

  /* ---------------- Mobile nav ---------------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector("[data-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------------- Cookie-Hinweis (DSGVO) ---------------- */
  var COOKIE_KEY = "ldh_hinweis_bestaetigt_v1";
  var banner = document.querySelector("[data-cookie-banner]");
  if (banner) {
    var alreadySeen = false;
    try { alreadySeen = localStorage.getItem(COOKIE_KEY) === "1"; } catch (e) {}
    if (!alreadySeen) {
      window.setTimeout(function () { banner.classList.add("is-visible"); }, 900);
    } else {
      banner.remove();
    }
    var okBtn = banner.querySelector("[data-cookie-ok]");
    if (okBtn) {
      okBtn.addEventListener("click", function () {
        try { localStorage.setItem(COOKIE_KEY, "1"); } catch (e) {}
        banner.classList.remove("is-visible");
        window.setTimeout(function () { banner.remove(); }, 500);
      });
    }
  }

  /* ---------------- GSAP reveal-on-scroll utility ---------------- */
  window.LDH = window.LDH || {};
  window.LDH.initReveals = function () {
    if (!window.gsap) return;
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    var items = document.querySelectorAll("[data-reveal]");
    items.forEach(function (el) {
      var dir = el.getAttribute("data-reveal") || "up";
      var from = { opacity: 0 };
      if (dir === "up") from.y = 42;
      if (dir === "down") from.y = -30;
      if (dir === "left") from.x = -50;
      if (dir === "right") from.x = 50;
      if (dir === "scale") { from.scale = .92; }
      from.rotate = el.hasAttribute("data-reveal-tilt") ? (Math.random() > .5 ? -2.5 : 2.5) : 0;

      gsap.set(el, { visibility: "visible" });
      gsap.fromTo(el, from, {
        opacity: 1, y: 0, x: 0, scale: 1, rotate: el.dataset.tilt ? parseFloat(el.dataset.tilt) : 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          once: true
        }
      });
    });
  };

  /* run reveals once DOM + gsap are ready; if GSAP failed to load
     (slow network, blocked CDN, ad-blocker), fall back to showing
     the [data-reveal] content immediately instead of leaving it
     permanently hidden. */
  document.addEventListener("DOMContentLoaded", function () {
    if (window.gsap) {
      window.LDH.initReveals();
    } else {
      document.querySelectorAll("[data-reveal]").forEach(function (el) {
        el.style.visibility = "visible";
      });
    }
  });
})();
