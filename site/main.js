(function () {
  var params = new URLSearchParams(location.search);
  var clean = function (v, max) { return (v || '').replace(/[^\p{L}\p{N} &.,'()-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, max); };
  var company = clean(params.get('for'), 40);
  var ref = (params.get('ref') || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 60);

  // Analytics: GoatCounter events, with ref when present. Never shown on the page.
  function track(name) {
    var path = name + (ref ? '?ref=' + ref : '');
    var send = function () { window.goatcounter && window.goatcounter.count && window.goatcounter.count({ path: path, title: name, event: true }); };
    if (window.goatcounter && window.goatcounter.count) send(); else setTimeout(send, 1500);
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-ev]'); if (el) track(el.dataset.ev);
  });

  // Personal opening.
  var forLine = document.getElementById('for-line');
  if (forLine && company) {
    forLine.textContent = 'A 2-minute look at Lull, prepared for the People team at ' + company;
    forLine.hidden = false;
  }

  // Tally links carry cta (already in href) and ref.
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

  var split = document.getElementById('split');
  if (split) {
    // Sessions adapted from the app's mock content (src/server/lull.ts): the need each phrase maps to, and its gentle plan.
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
      restless: { ack: 'Restless energy does well with a bit of rhythm.', title: 'Gentle low-impact cardio', time: '2:30', team: 'Customer Success', blocks: [
        ['Warm-up march', '0:45', 'Keep one foot on the ground. Breathing should stay easy.'],
        ['Step-touch', '0:45', 'Light on your feet; no jumping.'],
        ['Recover', '0:30', 'Smaller steps. Longer exhales.'],
        ['Cool-down', '0:30', 'Slow, even steps. Notice the breath settling.']] }
    };
    var TEAMS = [['Engineering', 22, '38 people'], ['Sales', 11, '21 people'], ['Customer Success', 9, '14 people'], ['Finance', null, 'under 10']];
    var rows = document.getElementById('hr-rows');
    rows.innerHTML = TEAMS.map(function (t) {
      return t[1] === null
        ? '<li class="hr-row hidden"><span><b>' + t[0] + '</b></span><span class="n">Hidden · team under 10</span></li>'
        : '<li class="hr-row" data-team="' + t[0] + '"><span><b>' + t[0] + '</b></span><span class="n"><strong>' + t[1] + '</strong> active this week<span class="delta">+1</span></span></li>';
    }).join('');

    var chips = document.querySelectorAll('.chip');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var s = SESSIONS[chip.dataset.chip];
        chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip); });
        document.getElementById('emp-ack').textContent = s.ack;
        document.getElementById('emp-title').textContent = s.title;
        document.getElementById('emp-meta').textContent = s.time + ' on the timers · ' + s.blocks.length + ' steps';
        document.getElementById('emp-blocks').innerHTML = s.blocks.map(function (b) {
          return '<li><b>' + b[0] + '</b><span>' + b[1] + '</span><small>' + b[2] + '</small></li>';
        }).join('');
        var reopen = split.hidden, small = matchMedia('(max-width:859px)').matches;
        split.hidden = false;
        document.getElementById('try-hint').hidden = true;
        if (!reopen) { split.querySelectorAll('.side').forEach(function (el) { el.style.animation = 'none'; el.offsetWidth; el.style.animation = ''; }); }
        rows.querySelectorAll('.hr-row[data-team]').forEach(function (r) {
          var base = TEAMS.filter(function (t) { return t[0] === r.dataset.team; })[0][1];
          var hit = r.dataset.team === s.team;
          r.classList.remove('bump');
          r.querySelector('strong').textContent = base;
          if (hit) setTimeout(function () { r.querySelector('strong').textContent = base + 1; r.classList.add('bump'); }, small ? 900 : (reopen ? 650 : 350));
        });
        document.getElementById('hr-live').textContent = 'HR sees: ' + s.team + ', one more active this week. Nothing else.';
        if (matchMedia('(max-width:859px)').matches) setTimeout(function () { split.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }, 60);
        track('chip-' + chip.dataset.chip);
      });
    });
  }

  // Calculator.
  var size = document.getElementById('size');
  if (size) {
    var fmt = function (n) { return '₹' + n.toLocaleString('en-IN'); };
    var used = false;
    var calc = function () {
      var n = +size.value;
      document.getElementById('cost').innerHTML = '<span class="ppl">' + n + ' people:</span> <span class="amt">' + fmt(n * 60) + '–' + fmt(n * 120).slice(1) + '</span> <span class="mo">/ month</span>';
    };
    size.addEventListener('input', function () { calc(); if (!used) { used = true; track('calculator-used'); } });
    calc();
  }

  // FAQ.
  document.querySelectorAll('details[data-faq]').forEach(function (d) {
    d.addEventListener('toggle', function () { if (d.open) track('faq-' + d.dataset.faq); });
  });

  // Video modal: the file only loads when opened.
  var dlg = document.getElementById('vid'), openBtn = document.getElementById('open-video');
  if (dlg && openBtn) {
    var video = dlg.querySelector('video');
    openBtn.addEventListener('click', function () {
      var src = video.querySelector('source');
      if (!src.src) { src.src = src.dataset.src; video.load(); }
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
      video.play().catch(function () {});
      track('video-opened');
    });
    var shut = function () { video.pause(); dlg.close ? dlg.close() : dlg.removeAttribute('open'); };
    document.getElementById('vid-close').addEventListener('click', shut);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) shut(); });
    dlg.addEventListener('close', function () { video.pause(); });
  }

  // Send this to my founder: WhatsApp on phones, email on desktop.
  var share = document.getElementById('share');
  if (share) {
    var url = location.origin + location.pathname + (company ? '?for=' + encodeURIComponent(company) : '');
    var text = 'Worth a look: Lull, 3-minute guided movement breaks for our team, where HR sees team totals only (never individuals). 6-week pilot with targets agreed up front. ' + url;
    var phone = matchMedia('(max-width:760px), (pointer:coarse)').matches;
    share.href = phone
      ? 'https://wa.me/?text=' + encodeURIComponent(text)
      : 'mailto:?subject=' + encodeURIComponent('Worth a look: Lull pilot') + '&body=' + encodeURIComponent(text);
    if (phone) { share.target = '_blank'; share.rel = 'noopener'; }
    share.addEventListener('click', function () { track('share-founder-' + (phone ? 'whatsapp' : 'email')); });
  }

  // Sticky mobile bar: after the hero, hidden once the close is on screen.
  var sticky = document.getElementById('sticky'), hero = document.getElementById('hero'), close = document.getElementById('close');
  if (sticky && io) {
    var heroOut = false, closeIn = false;
    var upd = function () { sticky.classList.toggle('show', heroOut && !closeIn); };
    new IntersectionObserver(function (es) { heroOut = !es[0].isIntersecting; upd(); }).observe(hero);
    new IntersectionObserver(function (es) { closeIn = es[0].isIntersecting; upd(); }).observe(close);
  }
})();
