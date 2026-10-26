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

  // Two-sided demo. Needs are read with a copy of the app's own rules (src/server/lull.ts,
  // interpretNeed): fixed word lists, safety first, no AI. Plans and wording come from the same file.
  // HR figures come from the repo's sample company (src/shared/team.ts): a finished session moves
  // one team from one below to its week-6 active count.
  var INTENTS = {
    urgent: ['chest pain', 'chest hurts', 'chest feels tight', 'cannot breathe', 'short of breath', 'trouble breathing', 'struggling to breathe', 'faint', 'fainted', 'fainting', 'blacked out', 'passed out', 'numb', 'numbness', 'severe pain', 'sudden pain'],
    rehab: ['rehab', 'rehabilitation', 'recovering from', 'recovery from', 'post op', 'after surgery', 'surgery', 'physio', 'physiotherapy', 'physical therapy'],
    pain: ['pain', 'painful', 'dizzy', 'dizziness', 'lightheaded', 'light headed', 'nauseous', 'nausea', 'feel sick', 'feeling sick', 'felt sick', 'cramp', 'something feels wrong', 'hurt', 'hurts', 'hurting', 'injury', 'injured', 'sprain', 'sprained', 'strain', 'strained', 'torn', 'broken', 'fracture', 'swollen', 'sore knee', 'bad back', 'pulled a muscle'],
    outside: ['run', 'running', 'jog', 'jogging', 'weights', 'lift', 'lifting', 'dumbbell', 'dumbbells', 'barbell', 'swim', 'swimming', 'cycling', 'bike', 'hiit', 'jump', 'jumping', 'push ups', 'pushups', 'sit ups', 'situps', 'sprint', 'sprints'],
    fitness: ['lose weight', 'weight loss', 'losing weight', 'burn calories', 'burn fat', 'fat burning', 'calories', 'slim down', 'get fit', 'fit', 'fitness', 'fitter', 'get in shape', 'stamina', 'endurance', 'more active', 'tone up'],
    sitting: ['sitting', 'sat', 'not moved', 'sedentary', 'couch', 'sofa', 'desk', 'computer', 'laptop', 'screen all day', 'office', 'commute', 'long drive', 'long flight'],
    stiff: ['stiff', 'stiffness', 'tight', 'tightness', 'tense', 'achy', 'knots', 'hunched', 'locked up', 'loosen', 'creaky'],
    legs: ['leg', 'legs', 'hamstring', 'hamstrings', 'calf', 'calves', 'thighs'],
    time: ['quick', 'short on time', 'in a hurry', 'no time', 'not much time', 'busy', 'few minutes', 'couple of minutes', 'something short'],
    low: ['tired', 'exhausted', 'drained', 'sluggish', 'sleepy', 'no energy', 'low energy', 'low on energy', 'worn out', 'wiped', 'burnt out', 'burned out', 'foggy', 'fried', 'knackered'],
    restless: ['restless', 'fidgety', 'antsy', 'wired', 'pent up', 'cannot sit still', 'stir crazy', 'need to move', 'itching to move'],
    energetic: ['energetic', 'energised', 'energized', 'get moving', 'sweat', 'sweaty', 'harder', 'intense', 'heart rate', 'heart pumping', 'wake me up', 'pumped', 'motivated', 'challenge', 'push myself'],
    calm: ['reset', 'need a break', 'calm', 'unwind', 'relax', 'decompress', 'wind down', 'de stress', 'destress', 'stressed', 'overwhelmed', 'quiet'],
    unsure: ['do not know', 'not sure', 'no idea', 'whatever', 'anything', 'surprise me', 'you choose', 'you pick', 'you decide', 'up to you', 'get started', 'help me start', 'where to start', 'where to begin', 'feels right']
  };
  var PAT = {};
  Object.keys(INTENTS).forEach(function (k) { PAT[k] = new RegExp('(?:^| )(?:' + INTENTS[k].join('|') + ')(?= |$)'); });
  var ORDER = ['fitness', 'legs', 'sitting', 'stiff', 'time', 'low', 'restless', 'energetic', 'calm', 'unsure'];
  var HEARD = { sitting: 'a lot of sitting', stiff: 'some stiffness', legs: 'tight legs', time: 'not much time', low: 'low energy', restless: 'restless energy', energetic: 'wanting more energy', calm: 'wanting something calm', unsure: 'not sure where to start', fitness: 'general fitness' };
  var NEED_ACK = {
    fitness: 'I can help with general movement and fitness. A few minutes here isn’t a weight-loss plan, but movement you enjoy is a good thing to build on.',
    legs: 'Tight legs: a calm stretch for the backs of the legs fits.',
    sitting: 'After a lot of sitting, slow movement for the back and hips is a good fit.',
    stiff: 'For stiffness, slow and controlled range fits well.',
    time: 'Short on time is fine; every gentle session here is under three minutes on the timers.',
    low: 'Low on energy, so let’s keep it light.',
    restless: 'Restless energy does well with a bit of rhythm.',
    energetic: 'Something with more rhythm, then.',
    calm: 'Something quieter, then.',
    unsure: 'No need to know. Let’s start somewhere easy.'
  };
  var CARE = {
    urgent: { title: 'Please get help first.', alert: 'That sounds like it needs urgent medical attention, not exercise. Please stop and contact your local emergency number or urgent care now.', text: 'This isn’t something I can help with, and it isn’t a time to exercise.' },
    pain: { title: 'Let’s not work around pain.', alert: 'I can’t assess pain or injuries, so I won’t pick a session around it. Getting advice from a doctor or physiotherapist before exercising that area is the safe call.', text: 'If you’d still like to move today, choose something that leaves that area alone, and stop if anything hurts.' },
    rehab: { title: 'Let’s not work around pain.', alert: 'If you’re recovering, your clinician’s advice and restrictions come first. These sessions aren’t a rehab plan.', text: 'If you’d still like to move today, choose something that leaves that area alone, and stop if anything hurts.' }
  };
  var PATH_REPLY = { mobility: 'Mobility: slow, controlled range. No forcing.', stretching: 'Stretching: mild tension, held calmly.', cardio: 'Low-impact cardio: rhythm, not jumps. One foot always stays down.' };
  var ANOTHER_DAY = { mobility: 'a mobility reset', stretching: 'some stretching', cardio: 'a little low-impact cardio' };
  var LABEL = { mobility: 'mobility', stretching: 'stretching', cardio: 'low-impact cardio' };
  var PLANS = {
    mobility: { gentle: [['Wake the spine', 40], ['Shoulders and neck', 45], ['Downshift', 30], ['Hip hinge reach', 45]],
      steady: [['Spine CARs', 50], ['Shoulder control', 55], ['Squat-to-reach flow', 45], ['Reset the pace', 35], ['Hip hinge reach', 55]] },
    stretching: { gentle: [['Neck side stretch', 40], ['Chest opener', 40], ['Settle', 30], ['Back of the legs', 40]],
      steady: [['Dynamic warm-up', 45], ['Neck and upper back', 50], ['Front of the hips', 50], ['Settle', 30], ['Back of the legs', 50]] },
    cardio: { gentle: [['Warm-up march', 45], ['Step-touch', 45], ['Recover', 30], ['Cool-down', 30]],
      steady: [['Warm-up march', 45], ['Interval 1', 60], ['Recover', 30], ['Interval 2', 60], ['Cool-down', 45]] }
  };
  var TEAM_FOR = { mobility: 'Engineering', stretching: 'Sales', cardio: 'Product & Design' };
  var clock = function (s) { return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  var total = function (path, lvl) { return PLANS[path][lvl].reduce(function (a, b) { return a + b[1]; }, 0); };
  var single = function (t, pats) { var hits = Object.keys(pats).filter(function (k) { return pats[k].test(t); }); return hits.length === 1 ? hits[0] : null; };
  function normalise(raw) {
    return raw.toLowerCase().replace(/[’‘`]/g, "'").replace(/\bcan't\b/g, 'cannot').replace(/\bwon't\b/g, 'will not').replace(/n't\b/g, ' not')
      .replace(/\bi'm\b/g, 'i am').replace(/\bi've\b/g, 'i have').replace(/'s\b/g, ' is').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function interpret(raw) {
    var t = normalise(raw).replace(/ ?\b(a |such a |what a )?pain in the (neck|backside|butt|bum|arse|ass)\b/g, ' ').trim();
    var on = function (k) { return PAT[k].test(t); };
    var explicit = single(t, { mobility: /\bmobility\b|\bjoints?\b|\bstiff/, stretching: /\bstretch/, cardio: /\bcardio\b|\bheart rate\b|\bget moving\b|\bmarch/ });
    if (on('urgent')) return { kind: 'care', level: 'urgent' };
    if (on('rehab')) return { kind: 'care', level: 'rehab' };
    if (on('pain')) return { kind: 'care', level: 'pain' };
    var heard = ORDER.filter(function (k) { return k === 'time' ? on('time') || /\b\d+ ?(min|mins|minute|minutes)\b|\b(one|two|three|four|five|ten) (min|mins|minute|minutes)\b/.test(t) : on(k); });
    var has = function (k) { return heard.indexOf(k) > -1; }, outside = on('outside') && !explicit;
    if (has('low') && (has('energetic') || has('restless'))) return { kind: 'clarify', ack: 'Low on energy but wanting something lively? Which matters more today: easy, or a bit more energetic?' };
    var path = explicit || (outside || has('energetic') || has('fitness') || has('restless') ? 'cardio' : has('legs') && (has('stiff') || has('sitting')) ? 'stretching' : has('sitting') || has('stiff') ? 'mobility' : has('calm') || has('low') ? 'stretching' : has('unsure') || has('time') ? 'mobility' : null);
    if (!path) return { kind: 'clarify', ack: 'Tell me a little more: loosen up, stretch out, or get moving a bit?' };
    var intensity = has('time') || has('low') || has('unsure') || has('calm') ? 'gentle' : has('energetic') || outside ? 'steady'
      : single(t, { gentle: /\bgentle\b|\beasy\b|\blight\b|\bshort(er)?\b|\bcalm\b/, steady: /\bsteady\b|\bharder\b|\blonger\b|\bmore\b/ });
    var kinds = heard.filter(function (k) { return k !== 'legs' || has('stiff') || has('sitting'); });
    var lines = (outside ? ['Running, weights and jumping are outside what I can guide here; these sessions are short and equipment-free.'] : []).concat(kinds.map(function (k) { return NEED_ACK[k]; }));
    var lvl = intensity || 'gentle';
    var pick = intensity ? intensity + ' ' + LABEL[path] + ' (' + clock(total(path, lvl)) + ')' : ANOTHER_DAY[path];
    return { kind: 'suggest', path: path, intensity: intensity, lvl: lvl, heard: kinds,
      ack: lines.length ? lines.slice(0, 2).join(' ') + ' I’d suggest ' + (outside ? 'the closest fit, ' : '') + pick + '.' : PATH_REPLY[path] };
  }

  var TEAMS = [['Engineering', 8], ['Sales', 6], ['Product & Design', 2], ['Customer support', null], ['People & Ops', null]];
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var full = function (team) { return TEAMS.filter(function (t) { return t[0] === team; })[0][1]; };
  var rows = document.getElementById('hr-rows'), emp = document.getElementById('emp'), status = document.getElementById('hr-status');
  rows.innerHTML = TEAMS.map(function (t) {
    return t[1] === null
      ? '<li class="hr-row hidden"><span><b>' + esc(t[0]) + '</b></span><span class="n">Hidden · under 10</span></li>'
      : '<li class="hr-row" data-team="' + esc(t[0]) + '"><span><b>' + esc(t[0]) + '</b></span><span class="n"><strong>' + t[1] + '</strong> active this week<span class="delta">+1</span></span></li>';
  }).join('');

  var chips = document.querySelectorAll('.chip'), split = document.getElementById('split'), input = document.getElementById('say-input');
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches, timers = [];
  var later = function (fn, ms) { timers.push(setTimeout(fn, reduce ? 0 : ms)); };
  function resetHr(team) {
    rows.querySelectorAll('.hr-row[data-team]').forEach(function (r) {
      r.classList.remove('bump');
      r.querySelector('strong').textContent = full(r.dataset.team) - (r.dataset.team === team ? 1 : 0);
    });
    status.className = 'hr-status';
  }
  function run(raw, source) {
    timers.forEach(clearTimeout); timers = [];
    var r = interpret(raw);
    chips.forEach(function (c) { c.setAttribute('aria-pressed', source === c.dataset.chip); });
    if (source !== 'auto') { split.classList.remove('swap'); void split.offsetWidth; split.classList.add('swap'); }
    if (r.kind === 'care') {
      var c = CARE[r.level];
      emp.innerHTML = '<h3>' + c.title + '</h3><p class="care-alert' + (r.level === 'urgent' ? ' urgent' : '') + '">' + c.alert + '</p><p class="emp-text">' + c.text + '</p><p class="emp-run">No session offered.</p>';
      resetHr(null);
      status.className = 'hr-status care';
      status.innerHTML = '<b>Nothing changed.</b> Pain reports are never shared with anyone.';
      return r;
    }
    if (r.kind === 'clarify') {
      emp.innerHTML = '<h3 class="clarify">' + esc(r.ack) + '</h3><p class="emp-text">Lull asks rather than guesses. Try words like “stiff”, “tired” or “ten minutes”.</p>';
      resetHr(null);
      status.innerHTML = '<b>Nothing changed.</b> No session, nothing counted.';
      return r;
    }
    var plan = PLANS[r.path][r.lvl], team = TEAM_FOR[r.path], secs = total(r.path, r.lvl);
    var heard = r.heard.length ? '<p class="emp-heard">Heard: ' + r.heard.map(function (k) { return HEARD[k]; }).join(' · ') + '</p>' : '';
    var other = r.intensity ? '' : ' · ' + (r.lvl === 'gentle' ? 'steady ' + clock(total(r.path, 'steady')) : 'gentle ' + clock(total(r.path, 'gentle'))) + ' also offered';
    emp.innerHTML = heard + '<p class="emp-ack">' + esc(r.ack) + '</p><h3>' + r.lvl.charAt(0).toUpperCase() + r.lvl.slice(1) + ' ' + LABEL[r.path] + '</h3>' +
      '<p class="emp-meta">' + clock(secs) + ' on the timers' + other + '</p><ol class="blocks">' +
      plan.map(function (b) { return '<li><b>' + b[0] + '</b><span>' + clock(b[1]) + '</span></li>'; }).join('') + '</ol><p class="emp-run" id="emp-run"></p>';
    resetHr(team);
    status.textContent = 'Updates when a session finishes.';
    var lis = emp.querySelectorAll('.blocks li'), runEl = document.getElementById('emp-run');
    var step = 700, start = source === 'auto' ? 500 : 250;
    lis.forEach(function (li, i) {
      later(function () {
        if (i) lis[i - 1].className = 'done';
        li.className = 'on';
        runEl.textContent = 'Step ' + (i + 1) + ' of ' + lis.length + ' · ' + li.querySelector('b').textContent;
      }, start + i * step);
    });
    later(function () {
      lis.forEach(function (li) { li.className = 'done'; });
      runEl.innerHTML = '<b>Finished</b> · ' + clock(secs) + ' on the timers';
      var row = rows.querySelector('.hr-row[data-team="' + team + '"]');
      row.querySelector('strong').textContent = full(team);
      row.classList.add('bump');
      status.innerHTML = '<b>' + esc(team) + ' +1.</b> That’s all HR gets.';
    }, start + lis.length * step);
    return r;
  }
  var CHIP_TEXT = {};
  chips.forEach(function (chip) {
    CHIP_TEXT[chip.dataset.chip] = chip.textContent;
    chip.addEventListener('click', function () { input.value = chip.textContent; run(chip.textContent, chip.dataset.chip); track('chip-' + chip.dataset.chip); });
  });
  document.getElementById('say').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value.trim(); if (!v) { input.focus(); return; }
    var r = run(v, 'typed');
    input.blur();
    track('typed-' + (r.kind === 'suggest' ? r.path : r.kind === 'care' ? 'care-' + r.level : 'clarify'));
  });
  run(CHIP_TEXT.stiff, 'auto');
  chips[0].setAttribute('aria-pressed', 'true');

  // CEO slide chart: the sample's weekly active people.
  var WEEKLY = [33, 34, 29, 21, 23, 22], max = 34;
  document.getElementById('bars').innerHTML = WEEKLY.map(function (n, i) {
    return '<li style="--h:' + (n / max * 100).toFixed(1) + '%"><span class="v">' + n + '</span><span class="b" aria-hidden="true"></span><span class="w">W' + (i + 1) + '</span></li>';
  }).join('');

  // Targets: the sample results (44 of 64 tried, 27 of 44 still using) checked against hers.
  var RESULT = { tried: 44 / 64, stayed: 27 / 44 }, target = { tried: 0.5, stayed: 0.3334 };
  var LABELS = { tried: { '0.5': '50%', '0.6': '60%', '0.75': '75%' }, stayed: { '0.3334': '1 in 3', '0.5': '1 in 2', '0.6667': '2 in 3' } };
  function verdicts() {
    ['tried', 'stayed'].forEach(function (k) {
      var met = RESULT[k] >= target[k], el = document.getElementById('v-' + k);
      el.className = 'verdict ' + (met ? 'met' : 'miss');
      el.textContent = (met ? 'Met' : 'Not met') + ' · target ' + LABELS[k][String(target[k])];
    });
  }
  document.querySelectorAll('.seg').forEach(function (seg) {
    seg.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      seg.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      target[seg.dataset.target] = +b.dataset.v; verdicts(); track('target-' + seg.dataset.target + '-' + b.textContent.replace(/\s+/g, ''));
    });
  });
  verdicts();
  document.querySelector('.why-hidden').addEventListener('toggle', function (e) { if (e.target.open) track('why-hidden-opened'); });

  // Download the slide as a PNG, drawn on a canvas so it looks the same everywhere.
  document.getElementById('dl-slide').addEventListener('click', function () {
    var go = function () {
      var W = 1600, H = 900, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      var x = cv.getContext('2d'), INK = '#1F2933', MUTE = '#5B6670', ACC = '#2D5A45', LINE = '#E4DCCB', SERIF = 'Fraunces, Georgia, serif', SANS = 'Inter, system-ui, sans-serif';
      x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
      var L = 90, R = W - 90;
      x.fillStyle = INK; x.font = '600 26px ' + SANS; x.fillText('Week 6 pilot review · sample company (64 people)', L, 100);
      x.fillStyle = MUTE; x.font = '500 18px ' + SANS; x.textAlign = 'right'; x.fillText('SAMPLE REPORT', R, 100); x.textAlign = 'left';
      x.fillStyle = INK; x.fillRect(L, 124, R - L, 3);
      var stat = function (big, of, cap, k, sx) {
        x.fillStyle = ACC; x.font = '600 112px ' + SANS; x.fillText(big, sx, 290); var w = x.measureText(big).width;
        x.fillStyle = MUTE; x.font = '400 34px ' + SANS; x.fillText(of, sx + w + 16, 290);
        x.fillStyle = INK; x.font = '500 28px ' + SANS; x.fillText(cap, sx, 338);
        var met = RESULT[k] >= target[k]; x.fillStyle = met ? ACC : '#9A5B36'; x.font = '600 22px ' + SANS;
        x.fillText((met ? 'Met' : 'Not met') + ' · target ' + LABELS[k][String(target[k])], sx, 378);
      };
      stat('44', 'of 64', 'tried it', 'tried', L); stat('27', 'of 44', 'still using it in weeks 5–6', 'stayed', 820);
      x.fillStyle = LINE; x.fillRect(L, 412, R - L, 2);
      x.fillStyle = MUTE; x.font = '600 18px ' + SANS; x.fillText('PEOPLE ACTIVE EACH WEEK', L, 466); x.fillText('ACTIVE IN WEEK 6, BY TEAM', 900, 466);
      var bw = 92, gap = 26, base = 760, hmax = 240;
      WEEKLY.forEach(function (n, i) {
        var bx = L + i * (bw + gap), h = n / max * hmax;
        x.fillStyle = ACC; x.fillRect(bx, base - h, bw, h);
        x.fillStyle = INK; x.font = '600 22px ' + SANS; x.textAlign = 'center'; x.fillText(String(n), bx + bw / 2, base - h - 12);
        x.fillStyle = MUTE; x.font = '400 18px ' + SANS; x.fillText('W' + (i + 1), bx + bw / 2, base + 30); x.textAlign = 'left';
      });
      [['Engineering', '8 of 24'], ['Sales', '6 of 14'], ['Product & Design', '2 of 11'], ['Customer support', 'Hidden · under 10'], ['People & Ops', 'Hidden · under 10']].forEach(function (t, i) {
        var y = 520 + i * 54, hid = t[1].indexOf('Hidden') === 0;
        x.fillStyle = hid ? MUTE : INK; x.font = '400 24px ' + SANS; x.fillText(t[0], 900, y);
        x.font = (hid ? '500 20px ' : '600 24px ') + SANS; x.textAlign = 'right'; x.fillText(t[1], R, y); x.textAlign = 'left';
        x.fillStyle = LINE; x.fillRect(900, y + 18, R - 900, 1);
      });
      x.fillStyle = INK; x.fillRect(L, 812, R - L, 3);
      x.font = '500 28px ' + SERIF; x.fillText('HR saw team totals only. No names, no messages.', L, 858);
      var a = document.createElement('a'); a.download = 'lull-week6-sample-slide.png'; a.href = cv.toDataURL('image/png'); document.body.appendChild(a); a.click(); a.remove();
    };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(go);
    track('slide-downloaded');
  });

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
    var srcs = video.querySelectorAll('source');
    if (srcs.length && !srcs[0].getAttribute('src')) { srcs.forEach(function (s) { s.src = s.dataset.src; }); video.load(); }
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
  var url = 'https://lull-hr.vercel.app/' + (company ? '?for=' + encodeURIComponent(company) : '');
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
