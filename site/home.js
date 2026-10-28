(function () {
  var root = document.documentElement;

  /* Theme */
  var themeBtn = document.getElementById('theme-btn');
  function label() {
    if (themeBtn) themeBtn.textContent = root.getAttribute('data-theme') === 'dark' ? 'Light mode' : 'Dark mode';
  }
  label();
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('lull-theme', next); } catch (e) {}
    label();
  });

  /* Menu */
  var nav = document.getElementById('nav');
  var menuBtn = document.getElementById('menu-btn');
  function close() {
    if (!nav) return;
    nav.classList.remove('open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
  }
  if (menuBtn) menuBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', function (e) {
    if (nav && nav.classList.contains('open') && !nav.contains(e.target)) close();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  if (nav) nav.querySelectorAll('.h-panel a').forEach(function (a) { a.addEventListener('click', close); });

  /* Sticky nav border */
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Reveal on scroll */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var blocks = document.querySelectorAll('.h-sec > .h-wrap, .h-hero > .h-wrap');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    blocks.forEach(function (b) { b.classList.add('h-reveal'); io.observe(b); });
  }

  /* Year */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* Anonymous product events. No text, no identifiers. */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-ev]');
    if (!el) return;
    var name = el.getAttribute('data-ev');
    try {
      if (window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path: 'home/' + name, title: name, event: true });
      }
    } catch (err) {}
  });
})();
