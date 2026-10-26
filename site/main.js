document.addEventListener('DOMContentLoaded', function () {
  var params = new URLSearchParams(location.search);
  var clean = function (v, max) { return (v || '').replace(/[^\p{L}\p{N} &.,'()-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, max); };
  var company = clean(params.get('for'), 40);
  var ref = params.get('ref') || '';
  var small = function () { return matchMedia('(max-width:1024px)').matches; };

  // Analytics: GoatCounter events, with ref when present. Never shown on the page.
  function track(name) {
    var path = name + (ref ? '?ref=' + encodeURIComponent(ref) : '');
    var send = function () { window.goatcounter && window.goatcounter.count && window.goatcounter.count({ path: path, title: name, event: true }); };
    if (window.goatcounter && window.goatcounter.count) send(); else setTimeout(send, 1500);
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-ev]'); if (el) track(el.dataset.ev);
  });

  // Personal opening.
  var forLine = document.getElementById('for-line');
  if (company) { forLine.textContent = 'A 2-minute look at Lull, prepared for the People team at ' + company; forLine.hidden = false; }

  // Every Tally link already has ?cta=, so ref joins with &.
  if (ref) document.querySelectorAll('a[data-cta]').forEach(function (a) { a.href += '&ref=' + encodeURIComponent(ref); });

  var nav = document.getElementById('nav');
  addEventListener('scroll', function () { nav.classList.toggle('scrolled', scrollY > 8); }, { passive: true });

  var io = 'IntersectionObserver' in window;
  var reveals = document.querySelectorAll('.reveal');
  if (io) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { ro.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add('in'); });

  if (!document.getElementById('split')) return;

  // Two-sided demo. Sessions adapted from the app's mock content (src/server/lull.ts).
  // HR figures come from the repo's sample company (src/shared/team.ts): each chip moves one
  // team from one below to its week-6 active count.
  var SESSIONS = {
    stiff: { ack: 'Heard: some stiffness. Slow and controlled range fits well.', title: 'Gentle mobility', time: '2:40', team: 'Engineering', blocks: [
      ['Wake the spine', '0:40', 'Breathe in as the chest opens, out as the back rounds.'],
      ['Shoulders and neck', '0:45', 'Slow shoulder circles. Let each exhale lower the shoulders.'],
      ['Downshift', '0:30', 'An easy breathing reset between blocks.'],
      ['Hip hinge reach', '0:45', 'Keep the back long rather than chasing depth.']] },
    switchoff: { ack: 'Something quieter, then.', title: 'Gentle stretching', time: '2:30', team: 'Sales', blocks: [
      ['Neck side stretch', '0:40', 'Keep both shoulders relaxed and low. Mild tension only.'],
      ['Chest opener', '0:40', 'Draw the shoulders back, not up. Keep breathing slowly.'],
      ['Settle', '0:30', 'Soften the jaw. Lengthen each exhale.'],
      ['Back of the legs', '0:40', 'Lead with the chest, not the head. Mild stretch, never sharp.']] },
    restless: { ack: 'Restless energy does well with a bit of rhythm.', title: 'Gentle low-impact cardio', time: '2:30', team: 'Product & Design', blocks: [
      ['Warm-up march', '0:45', 'Keep one foot on the ground. Breathing should stay easy.'],
      ['Step-touch', '0:45', 'Light on your feet; no jumping.'],
      ['Recover', '0:30', 'Smaller steps. Longer exhales.'],
      ['Cool-down', '0:30', 'Slow, even steps. Notice the breath settling.']] }
  };
  var TEAMS = [['Engineering', 8], ['Sales', 6], ['Product & Design', 2], ['Customer support', null], ['People & Ops', null]];
  var esc = function (s) { return s.replace(/&/g, '&amp;'); };
  var rows = document.getElementById('hr-rows');
  rows.innerHTML = TEAMS.map(function (t) {
    return t[1] === null
      ? '<li class="hr-row hidden"><span><b>' + esc(t[0]) + '</b></span><span class="n">Hidden · under 10</span></li>'
      : '<li class="hr-row" data-team="' + esc(t[0]) + '"><span><b>' + esc(t[0]) + '</b></span><span class="n"><strong>' + t[1] + '</strong> active this week<span class="delta">+1</span></span></li>';
  }).join('');

  var chips = document.querySelectorAll('.chip'), split = document.getElementById('split'), timer;
  function show(key, user) {
    var s = SESSIONS[key];
    chips.forEach(function (c) { c.setAttribute('aria-pressed', c.dataset.chip === key); });
    document.getElementById('emp-ack').textContent = s.ack;
    document.getElementById('emp-title').textContent = s.title;
    document.getElementById('emp-meta').textContent = s.time + ' on the timers · ' + s.blocks.length + ' steps';
    document.getElementById('emp-blocks').innerHTML = s.blocks.map(function (b) {
      return '<li><b>' + b[0] + '</b><span>' + b[1] + '</span><small>' + b[2] + '</small></li>';
    }).join('');
    clearTimeout(timer);
    rows.querySelectorAll('.hr-row[data-team]').forEach(function (r) {
      var full = TEAMS.filter(function (t) { return t[0] === r.dataset.team; })[0][1];
      var hit = r.dataset.team === s.team;
      r.classList.remove('bump');
      r.querySelector('strong').textContent = hit ? full - 1 : full;
    });
    var target = rows.querySelector('.hr-row[data-team="' + s.team + '"]');
    timer = setTimeout(function () { target.querySelector('strong').textContent = TEAMS.filter(function (t) { return t[0] === s.team; })[0][1]; target.classList.add('bump'); }, user ? 450 : 900);
    document.getElementById('hr-live').textContent = user ? 'HR sees: ' + s.team + ', one more active this week. Nothing else.' : '';
    if (user) {
      split.classList.remove('swap'); split.offsetWidth; split.classList.add('swap');
      track('chip-' + key);
    }
  }
  chips.forEach(function (chip) { chip.addEventListener('click', function () { show(chip.dataset.chip, true); }); });
  show('stiff', false);

  // CEO slide chart: the sample's weekly active people.
  var WEEKLY = [33, 34, 29, 21, 23, 22], max = 34;
  document.getElementById('bars').innerHTML = WEEKLY.map(function (n, i) {
    return '<li style="--h:' + (n / max * 100).toFixed(1) + '%"><span class="v">' + n + '</span><span class="b" aria-hidden="true"></span><span class="w">W' + (i + 1) + '</span></li>';
  }).join('');

  // Calculator.
  var size = document.getElementById('size');
  var fmt = function (n) { return n.toLocaleString('en-IN'); };
  var used = false;
  var calc = function () {
    var n = +size.value;
    document.getElementById('cost').innerHTML = '<span class="ppl">' + n + ' people:</span> <span class="amt">₹' + fmt(n * 60) + '–' + fmt(n * 120) + '</span> <span class="mo">/ month</span>';
  };
  size.addEventListener('input', function () { calc(); if (!used) { used = true; track('calculator-used'); } });
  calc();

  // FAQ.
  document.querySelectorAll('details[data-faq]').forEach(function (d) {
    d.addEventListener('toggle', function () { if (d.open) track('faq-' + d.dataset.faq); });
  });

  // Video modal: the file only loads when opened.
  var dlg = document.getElementById('vid'), video = dlg.querySelector('video');
  document.getElementById('open-video').addEventListener('click', function () {
    var src = video.querySelector('source');
    if (!src.getAttribute('src')) { src.src = src.dataset.src; video.load(); }
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    video.play().catch(function () {});
    track('video-opened');
  });
  var shut = function () { video.pause(); dlg.close ? dlg.close() : dlg.removeAttribute('open'); };
  document.getElementById('vid-close').addEventListener('click', shut);
  dlg.addEventListener('click', function (e) { if (e.target === dlg) shut(); });
  dlg.addEventListener('close', function () { video.pause(); });

  // Send this to my founder: WhatsApp on phones, email on desktop.
  var share = document.getElementById('share');
  var url = location.origin + location.pathname + (company ? '?for=' + encodeURIComponent(company) : '');
  var text = 'Worth a look: Lull, a 3-minute guided movement reset for our team, where HR sees team totals only (never individuals). 6-week pilot with targets agreed up front. ' + url;
  var phone = matchMedia('(max-width:760px), (pointer:coarse)').matches;
  share.href = phone
    ? 'https://wa.me/?text=' + encodeURIComponent(text)
    : 'mailto:?subject=' + encodeURIComponent('Worth a look: Lull pilot') + '&body=' + encodeURIComponent(text);
  if (phone) { share.target = '_blank'; share.rel = 'noopener'; }
  share.addEventListener('click', function () { track('share-founder-' + (phone ? 'whatsapp' : 'email')); });

  // Sticky mobile bar: body padding tracks its real height, so it never covers content.
  var sticky = document.getElementById('sticky');
  var pad = function () { document.documentElement.style.setProperty('--bar-h', sticky.offsetHeight + 'px'); };
  pad();
  if ('ResizeObserver' in window) new ResizeObserver(pad).observe(sticky); else addEventListener('resize', pad);
  var heroCta = document.querySelector('.hero-cta'), closeSec = document.getElementById('close');
  var upd = function () {
    var past = heroCta.getBoundingClientRect().bottom < 0, atClose = closeSec.getBoundingClientRect().top < innerHeight;
    sticky.classList.toggle('show', past && !atClose);
  };
  addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
});
