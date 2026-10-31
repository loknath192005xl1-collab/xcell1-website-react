/* Xcell1 website behaviour. Plain JavaScript, no framework. Settings live in /assets/js/config.js. */
export function initSite() {
  "use strict";
  var __off = [];
  function on(t, e, f, o) { t.addEventListener(e, f, o); __off.push(function () { t.removeEventListener(e, f, o); }); }
  var CFG = window.XL1_CONFIG || {};
  var WA = CFG.whatsapp || "919080681711";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function track(name, params) {
    try {
      if (typeof window.gtag === "function") window.gtag("event", name, params || {});
      else (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, params || {}));
    } catch (e) {}
  }

  /* Theme (same storage key as the existing site) */
  function onThemeClick() {
    var dark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem("xcell1-theme", dark ? "dark" : "light"); } catch (e) {}
    $$(".xl-theme").forEach(function (x) { x.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme"); });
  }
  $$(".xl-theme").forEach(function (b) {
    on(b, "click", onThemeClick);
    b.setAttribute("aria-label", document.documentElement.classList.contains("dark") ? "Switch to light theme" : "Switch to dark theme");
  });

  /* Header shrink on scroll */
  var header = $(".xl-header");
  function onScroll() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 12); }
  on(window, "scroll", onScroll, { passive: true }); onScroll();

  /* Desktop dropdown menus */
  var items = $$(".xl-nav-item");
  function closeAll(except) {
    items.forEach(function (it) {
      if (it === except) return;
      it.classList.remove("is-open");
      var a = it.querySelector("a"); if (a) a.setAttribute("aria-expanded", "false");
    });
  }
  function open(it) { closeAll(it); it.classList.add("is-open"); it.querySelector("a").setAttribute("aria-expanded", "true"); }
  items.forEach(function (it) {
    var t, trigger = it.querySelector("a");
    if (canHover) {
      it.addEventListener("mouseenter", function () { clearTimeout(t); open(it); });
      it.addEventListener("mouseleave", function () { t = setTimeout(function () { it.classList.remove("is-open"); trigger.setAttribute("aria-expanded", "false"); }, 160); });
    }
    trigger.addEventListener("click", function (e) {
      if (!it.classList.contains("is-open")) { e.preventDefault(); open(it); }
    });
    trigger.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); open(it); var f = it.querySelector(".xl-dd a"); if (f) setTimeout(function () { f.focus(); }, 30); }
    });
    it.addEventListener("focusout", function (e) { if (!it.contains(e.relatedTarget)) { it.classList.remove("is-open"); trigger.setAttribute("aria-expanded", "false"); } });
  });
  on(document, "click", function (e) { if (!e.target.closest(".xl-nav-item")) closeAll(); });

  /* Mobile menu */
  var mob = $("#xl-mobile");
  $$(".xl-burger").forEach(function (b) {
    b.addEventListener("click", function () {
      var openNow = mob.hasAttribute("hidden");
      if (openNow) mob.removeAttribute("hidden"); else mob.setAttribute("hidden", "");
      $$(".xl-burger").forEach(function (x) { x.setAttribute("aria-expanded", String(openNow)); x.setAttribute("aria-label", openNow ? "Close menu" : "Open menu"); });
    });
  });

  /* Dialogs: demo sign-in and "still working on this page" */
  function bindDialog(d) {
    if (!d) return;
    d.addEventListener("click", function (e) { if (e.target === d || e.target.closest("[data-close]")) d.close(); });
  }
  var login = $("#xl-login"), soon = $("#xl-soon");
  bindDialog(login); bindDialog(soon);
  $$("[data-open-login]").forEach(function (b) {
    b.addEventListener("click", function () { if (mob && !mob.hasAttribute("hidden")) mob.setAttribute("hidden", ""); login.showModal(); var i = login.querySelector("input"); if (i) i.focus(); });
  });
  var lf = $(".xl-login-form");
  if (lf) lf.addEventListener("submit", function (e) {
    var msg = lf.querySelector(".xl-login-msg");
    if (CFG.demoLoginAction) { lf.action = CFG.demoLoginAction; lf.method = "post"; return; }
    e.preventDefault();
    msg.textContent = "Demo sign-in is handled by the Xcell1 team. Request a demo and we will share your access details.";
    msg.classList.remove("hidden");
  });

  var NOT_READY = CFG.notReady || [];
  function norm(p) { return p.endsWith("/") || /\.[a-z0-9]+$/i.test(p) ? p : p + "/"; }
  function openSoon(name, from) {
    $(".xl-soon-name", soon).textContent = name || "This page";
    soon.showModal();
    soon.addEventListener("close", function f() { soon.removeEventListener("close", f); if (from) from.focus(); });
    track("page_not_ready", { page: name || "" });
  }
  on(document, "click", function (e) {
    var a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey) return;
    var u; try { u = new URL(a.getAttribute("href"), location.href); } catch (x) { return; }
    if (u.origin !== location.origin) return;
    if (NOT_READY.indexOf(norm(u.pathname)) >= 0) { e.preventDefault(); openSoon((a.textContent || "").trim(), a); }
  });
  if (document.body.dataset.notReady) openSoon(document.body.dataset.notReady, null);

  /* CTA tracking */
  on(document, "click", function (e) {
    var c = e.target.closest("[data-cta]"); if (c) track("demo_cta_click", { cta_location: c.getAttribute("data-cta") });
  });

  /* Floating demo tab and drawer */
  var tab = $(".xl-tab"), drawer = $("#xl-drawer"), scrim = $(".xl-scrim"), lastFocus = null, hoverOpened = false, leaveT;
  function engaged() { return drawer.contains(document.activeElement) || drawer.matches(":hover") || drawer.dataset.dirty === "1"; }
  function openDrawer(viaHover) {
    if (!drawer.hasAttribute("hidden")) return;
    lastFocus = document.activeElement; hoverOpened = !!viaHover;
    drawer.removeAttribute("hidden"); scrim.removeAttribute("hidden");
    requestAnimationFrame(function () { drawer.classList.add("is-open"); scrim.classList.add("is-open"); });
    tab.setAttribute("aria-expanded", "true"); document.documentElement.classList.add("xl-lock");
    if (!viaHover) { var f = drawer.querySelector("input"); if (f) f.focus(); }
    track("demo_form_open", { via: viaHover ? "hover" : "click" });
  }
  function closeDrawer() {
    if (drawer.hasAttribute("hidden")) return;
    drawer.classList.remove("is-open"); scrim.classList.remove("is-open");
    tab.setAttribute("aria-expanded", "false"); document.documentElement.classList.remove("xl-lock");
    setTimeout(function () { drawer.setAttribute("hidden", ""); scrim.setAttribute("hidden", ""); }, 250);
    if (lastFocus && !hoverOpened) lastFocus.focus();
  }
  if (tab && drawer) {
    tab.addEventListener("click", function () { drawer.hasAttribute("hidden") ? openDrawer(false) : closeDrawer(); });
    if (canHover) {
      tab.addEventListener("mouseenter", function () { clearTimeout(leaveT); openDrawer(true); });
      drawer.addEventListener("mouseleave", function () { if (!hoverOpened) return; leaveT = setTimeout(function () { if (!engaged()) closeDrawer(); }, 450); });
      drawer.addEventListener("mouseenter", function () { clearTimeout(leaveT); });
    }
    scrim.addEventListener("click", closeDrawer);
    drawer.addEventListener("click", function (e) { if (e.target.closest("[data-close-drawer]")) closeDrawer(); });
    on(document, "keydown", function (e) {
      if (e.key === "Escape") { if (!drawer.hasAttribute("hidden")) closeDrawer(); closeAll(); }
      if (e.key === "Tab" && !drawer.hasAttribute("hidden") && !hoverOpened) {
        var f = $$("a[href],button,input,select,textarea", drawer).filter(function (x) { return !x.disabled && x.offsetParent !== null; });
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    drawer.addEventListener("input", function () { drawer.dataset.dirty = "1"; hoverOpened = false; });
  }

  /* Demo forms */
  var params = new URLSearchParams(location.search);
  $$(".xl-demo-form").forEach(function (form) {
    var sol = params.get("solution");
    if (sol) { var s = form.querySelector('select[name="solution"]'); $$("option", s).forEach(function (o) { if (o.textContent === sol) s.value = sol; }); }
    var tried = false;
    function val(n) { var el = form.elements[n]; return el ? (el.type === "checkbox" ? el.checked : el.value.trim()) : ""; }
    function check() {
      var errs = {};
      if (val("name").length < 2) errs.name = "Enter your name, at least 2 letters.";
      if (val("institution").length < 2) errs.institution = "Enter your institution's name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val("email"))) errs.email = "Enter a valid email, like name@school.edu.in.";
      if (val("phone").replace(/\D/g, "").length < 10) errs.phone = "Enter a phone number with at least 10 digits.";
      if (!val("institutionType")) errs.institutionType = "Choose your institution type.";
      if (!val("solution")) errs.solution = "Choose the solution you want to see.";
      if (!val("consent")) errs.consent = "Tick the box so we can contact you about the demo.";
      ["name", "institution", "email", "phone", "institutionType", "solution"].forEach(function (n) {
        var el = form.elements[n], p = el.closest(".flex-col").querySelector(".xl-err");
        el.setAttribute("aria-invalid", errs[n] ? "true" : "false");
        el.classList.toggle("xl-invalid", !!errs[n]);
        if (p) { p.textContent = errs[n] || ""; p.classList.toggle("hidden", !errs[n]); }
      });
      var pc = form.querySelector(".xl-err-consent"); pc.textContent = errs.consent || ""; pc.classList.toggle("hidden", !errs.consent);
      return errs;
    }
    form.addEventListener("input", function () { if (tried) check(); });
    form.addEventListener("change", function () { if (tried) check(); });
    form.addEventListener("submit", function (e) {
      e.preventDefault(); tried = true;
      if (form.elements.website && form.elements.website.value) return; // honeypot
      var errs = check(), keys = Object.keys(errs);
      if (keys.length) { var first = form.elements[keys[0]]; if (first) first.focus(); return; }
      var data = { name: val("name"), institution: val("institution"), email: val("email"), phone: val("phone"),
        institutionType: val("institutionType"), solution: val("solution"), message: val("message"),
        source: form.dataset.source, page: location.href };
      var status = form.querySelector(".xl-form-status"), btn = form.querySelector('button[type="submit"]');
      function show(html, ok) {
        status.innerHTML = html; status.classList.remove("hidden");
        status.className = "xl-form-status rounded-xl p-4 text-[14px] " + (ok ? "xl-ok" : "xl-bad"); status.focus();
      }
      if (CFG.leadEndpoint) {
        btn.disabled = true; var label = btn.innerHTML; btn.textContent = "Sending…";
        fetch(CFG.leadEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
          .then(function (r) {
            if (!r.ok) throw new Error(r.status);
            track("generate_lead", { form_location: data.source, solution_interest: data.solution, method: "form" });
            form.reset(); if (drawer) drawer.dataset.dirty = "";
            if (CFG.thankYouPage) { location.href = CFG.thankYouPage; return; }
            show("<strong>Thank you, we have received your request.</strong><br>Our team will call you within one working day to fix a time.", true);
          })
          .catch(function () { show("<strong>We could not send your request.</strong><br>Please try again, or message us on WhatsApp at +91 90806 81711. Your details are still in the form.", false); })
          .then(function () { btn.disabled = false; btn.innerHTML = label; });
        return;
      }
      var text = ["Hi Xcell1, I'd like to book a demo.", "Name: " + data.name, "Institution: " + data.institution,
        "Institution type: " + data.institutionType, "Interested in: " + data.solution, "Email: " + data.email, "Phone: " + data.phone]
        .concat(data.message ? ["Message: " + data.message] : []).join("\n");
      var link = "https://wa.me/" + WA + "?text=" + encodeURIComponent(text);
      window.open(link, "_blank", "noopener");
      track("generate_lead", { form_location: data.source, solution_interest: data.solution, method: "whatsapp_handoff" });
      show("<strong>Your request is ready in WhatsApp.</strong><br>Press Send in WhatsApp to reach our team. If it did not open, <a class='font-semibold underline' target='_blank' rel='noopener' href='" + link + "'>open WhatsApp here</a> or email <a class='font-semibold underline' href='mailto:info@xcellsoftware.in'>info@xcellsoftware.in</a>.", true);
    });
  });

  /* Scroll reveal (AOS-compatible classes already styled by the site CSS) */
  var aos = $$("[data-aos]");
  aos.forEach(function (el) { el.classList.add("aos-init"); });
  if (reduce || !("IntersectionObserver" in window)) aos.forEach(function (el) { el.classList.add("aos-animate"); });
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("aos-animate"); io.unobserve(en.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    aos.forEach(function (el) { io.observe(el); });
  }
  return function () { __off.forEach(function (f) { f(); }); document.documentElement.classList.remove("xl-lock"); };
}
