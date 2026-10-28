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
  if (company && forLine) {
    forLine.textContent = 'For ' + company + '\'s HR team · 3:40 pm, between calls'; forLine.hidden = false;
    var set = function (id, text) { var el = document.getElementById(id); if (el) el.textContent = text; };
    set('hr-label', 'What HR at ' + company + ' sees');
    set('hr-chrome', company + ' · team view (sample data)');
    set('slide-title', 'Week 6 pilot review · ' + company + ' · sample data (64 people)');
  }

  // Links between the overview and the pilot page keep ?for= and ?ref=.
  if (location.search) document.querySelectorAll('a[href^="pilot.html"], a[href^="data.html"], a[href^="product.html"], a[href^="pilot-pack.html"], a[href="./"], a[href^="./#"]').forEach(function (a) {
    var h = a.getAttribute('href'), k = h.indexOf('#');
    a.setAttribute('href', (k < 0 ? h : h.slice(0, k)) + location.search + (k < 0 ? '' : h.slice(k)));
  });

  // Tally links already have ?cta=, so ref joins with &.
  if (ref) document.querySelectorAll('a[data-cta]').forEach(function (a) { a.href += '&ref=' + encodeURIComponent(ref); });

  var nav = document.getElementById('nav');
  if (nav) {
    addEventListener('scroll', function () { nav.classList.toggle('scrolled', scrollY > 8); }, { passive: true });
  }

  var io = 'IntersectionObserver' in window;
  var reveals = document.querySelectorAll('.reveal');
  if (io) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { ro.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add('in'); });

  // Layered sections: open on wide screens, one tap away on phones.
  var wide = matchMedia('(min-width:860px)');
  if (document.querySelectorAll('details[data-desktop-open]').length) {
    document.querySelectorAll('details[data-desktop-open]').forEach(function (d) {
      if (wide.matches) d.open = true;
      d.addEventListener('toggle', function () { if (d.open && !wide.matches) track('fold-' + (d.className.split(' ')[1] || 'details')); });
    });
  }

  var site = 'https://lull-hr.vercel.app/';
  var slug = (company || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24);
  var teamLink = site + 'app/?team=' + (slug || 'your-team');
  var resetLink = site + 'app/?reset=unknot-seated' + (slug ? '&team=' + slug : '');
  var invite = 'Last 3 minutes: Lull team reset. Open this together and press Start: ' + resetLink;
  var copyText = function (text, done, msg) {
    var show = function () { done.textContent = msg; };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(show, function () { done.textContent = text; });
    else done.textContent = text;
  }

  // Section reached: where busy readers stop, counted once per visit (no time or scroll tracking).
  if (io) {
    var seen = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { track('seen-' + e.target.id); seen.unobserve(e.target); } });
    }, { threshold: 0.35 });
    document.querySelectorAll('main section[id]').forEach(function (el) { seen.observe(el); });
  }

  // --- Sticky mobile bar: shows once the hero button has scrolled away (or after a screen on other
  // pages), and steps aside wherever the page already shows its own pilot button (#close). ---
  if (document.getElementById('sticky')) {
    var sticky = document.getElementById('sticky');
    var pad = function () { document.documentElement.style.setProperty('--bar-h', sticky.offsetHeight + 'px'); };
    pad();
    if ('ResizeObserver' in window) new ResizeObserver(pad).observe(sticky); else addEventListener('resize', pad);
    var heroCta = document.querySelector('.hero-cta') || document.getElementById('try'), closeSec = document.getElementById('close');
    var upd = function () {
      var past = heroCta ? heroCta.getBoundingClientRect().bottom < 0 : scrollY > innerHeight * 0.6;
      var r = closeSec && closeSec.getBoundingClientRect(), atClose = !!r && r.top < innerHeight && r.bottom > 0;
      sticky.classList.toggle('show', past && !atClose);
    };
    addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  }

  // --- Two-sided demo: only on pages with the split element ---
  if (document.getElementById('split')) {
    // Two-sided demo. It runs Lull's real engine, the same file the app uses (app/server/lull.js):
    var TEAMS = [['Engineering', 8], ['Sales', 6], ['Product & Design', 2], ['Customer support', null], ['People & Ops', null]];
    var TEAM_FOR = { unknot: 'Engineering', unsit: 'Product & Design', energy: 'Product & Design', calm: 'Sales', screen: 'Engineering' };
    var NEED_LABEL = { neck: 'neck and shoulders', back: 'a stiff back', sitting: 'a lot of sitting', stiff: 'stiffness', legs: 'tight legs', eyes: 'eyes and wrists', time: 'short on time', low: 'low energy', restless: 'restless', energetic: 'more energy', calm: 'something calm', unsure: 'not sure', fitness: 'general fitness' };
    var CARE = {
      urgent: { title: 'Please get help first.', text: 'This isn\'t something Lull can help with, and it isn\'t a time to move.' },
      pain: { title: 'Let\'s not work around pain.', text: 'If you\'d still like a reset today, choose one that leaves that area alone, and stop if anything hurts.' },
      rehab: { title: 'Let\'s not work around pain.', text: 'If you\'d still like a reset today, choose one that leaves that area alone, and stop if anything hurts.' }
    };
    var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
    var full = function (team) { return TEAMS.filter(function (t) { return t[0] === team; })[0][1]; };
    var rows = document.getElementById('hr-rows'), emp = document.getElementById('emp'), status = document.getElementById('hr-status');
    if (rows && emp && status) {
      rows.innerHTML = TEAMS.map(function (t) {
        return t[1] === null
          ? '<li class="hr-row hidden"><span><b>' + esc(t[0]) + '</b></span><span class="n">Hidden · under 10</span></li>'
          : '<li class="hr-row" data-team="' + esc(t[0]) + '"><span><b>' + esc(t[0]) + '</b></span><span class="n"><strong>' + t[1] + '</strong> active this week<span class="delta">+1</span></span></li>';
      }).join('');
    }
    var chips = document.querySelectorAll('.chip'), split = document.getElementById('split'), input = document.getElementById('say-input');
    if (chips && input) {
      var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches, timers = [];
      var later = function (fn, ms) { timers.push(setTimeout(fn, reduce ? 0 : ms)); };
      function resetHr(team) {
        if (!rows) return;
        rows.querySelectorAll('.hr-row[data-team]').forEach(function (r) {
          r.classList.remove('bump');
          r.querySelector('strong').textContent = full(r.dataset.team) - (r.dataset.team === team ? 1 : 0);
        });
        status.className = 'hr-status';
      }
      import('./app/server/lull.js').then(function (L) {
        function run(raw, source) {
          timers.forEach(function (t) { clearTimeout(t); clearInterval(t); }); timers = [];
          var r = L.interpretNeed(raw);
          chips.forEach(function (c) { c.setAttribute('aria-pressed', source === c.dataset.chip); });
          if (source !== 'auto') { split.classList.remove('swap'); void split.offsetWidth; split.classList.add('swap'); }
          if (r.kind === 'care') {
            var c = CARE[r.level];
            if (emp) {
              emp.innerHTML = '<h3>' + c.title + '</h3><p class="care-alert' + (r.level === 'urgent' ? ' urgent' : '') + '">' + esc(L.CARE_ACK[r.level]) + '</p><p class="emp-text">' + c.text + '</p><p class="emp-run">No reset offered.</p>';
            }
            resetHr(null);
            if (status) {
              status.className = 'hr-status care';
              status.innerHTML = '<b>Nothing changed.</b> Pain reports are never shared with anyone.';
            }
            return r;
          }
          if (r.kind === 'clarify') {
            if (emp) {
              emp.innerHTML = '<h3 class="clarify">' + esc(r.ack) + '</h3><p class="emp-text">Lull asks rather than guesses.</p><div class="clarify-opts">' +
                L.RESETS.map(function (k) { return '<button type="button" class="chip clarify-opt" data-say="' + esc(L.RESET_MOMENTS[k]) + '">' + esc(L.RESET_MOMENTS[k]) + '</button>'; }).join('') + '</div>';
            }
            resetHr(null);
            if (status) {
              status.innerHTML = '<b>Nothing changed.</b> No reset, nothing counted.';
            }
            return r;
          }
          var posture = r.posture || L.DEFAULT_POSTURE[r.reset], plan = L.planOf(r.reset, posture), team = TEAM_FOR[r.reset];
          var other = posture === 'seated' ? 'standing' : 'seated';
          var heard = r.heard.length ? '<p class="emp-heard">Heard: ' + r.heard.map(function (k) { return L.HEARD[k]; }).join(' · ') + '</p>' : '';
          if (emp) {
            emp.innerHTML = heard + '<p class="emp-ack">' + esc(r.ack) + '</p><h3>' + esc(L.RESET_NAMES[r.reset]) + '</h3>' +
              '<p class="emp-meta">' + posture.charAt(0).toUpperCase() + posture.slice(1) + ' · ' + L.clock(plan.total) + ' · ' + other + ' also offered</p><ol class="blocks">' +
              plan.blocks.map(function (b) { return '<li><b>' + esc(b.title) + '</b><span>' + L.clock(b.seconds) + '</span></li>'; }).join('') + '</ol><p class="emp-run" id="emp-run"></p>';
          }
          resetHr(team);
          if (status) {
            status.textContent = 'Updates when a reset finishes.';
          }
          if (source !== 'auto' && live(L, r, plan, team, heard)) return r;
          var lis = emp ? emp.querySelectorAll('.blocks li') : [], runEl = document.getElementById('emp-run');
          var step = 700, start = source === 'auto' ? 500 : 250;
          if (lis) {
            lis.forEach(function (li, i) {
              later(function () {
                if (i) lis[i - 1].className = 'done';
                li.className = 'on';
                runEl.textContent = 'Step ' + (i + 1) + ' of ' + lis.length + ' · ' + li.querySelector('b').textContent;
              }, start + i * step);
            });
          }
          later(function () {
            if (lis) lis.forEach(function (li) { li.className = 'done'; });
            if (runEl) runEl.innerHTML = '<b>Back to your day</b> · ' + L.clock(plan.total);
            var row = rows.querySelector('.hr-row[data-team="' + team + '"]');
            if (row) {
              row.querySelector('strong').textContent = full(team);
              row.classList.add('bump');
            }
            if (status) {
              var need = r.heard.length ? ' · need: ' + NEED_LABEL[r.heard[0]] : '';
              status.innerHTML = '<b>' + esc(team) + ' +1</b>' + esc(need) + '. That\'s all HR gets.';
            }
          }, start + lis.length * step);
          return r;
        }
        // Live first step: one real block with a countdown, then the HR reveal, then the ask (foot in the door, peak-end).
        var ask = document.getElementById('ask'), reveal = document.getElementById('reveal');
        function showView(v) { var b = document.querySelector('.view-tabs [data-view="' + v + '"]'); if (b) b.click(); }
        function setFlow(i) { document.querySelectorAll('#flow li').forEach(function (li, j) { li.className = j < i ? 'done' : j === i ? 'on' : ''; }); }
        function nextStep() { return '<p class="next-step"><a class="more" href="#privacy">Next: how your people\'s privacy works ›</a></p>'; }
        function live(L, r, plan, team, heard) {
          if (!emp) return false;
          var b = plan.blocks[0], left = b.seconds, paused = false;
          var da = document.getElementById('demo-area'); if (da) da.hidden = false; setFlow(0); if (da) setTimeout(function () { da.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }, 60);
          showView('emp'); if (ask) ask.hidden = true; if (reveal) reveal.hidden = true;
          emp.innerHTML = heard + '<p class="live-step">Step 1 of ' + plan.blocks.length + ' · ' + esc(L.RESET_NAMES[r.reset]) + '</p>' +
            '<h3 class="live-title">' + esc(b.title) + '</h3><p class="live-clock" id="live-clock">' + L.clock(left) + '</p>' +
            '<div class="live-bar"><i id="live-bar"></i></div><p class="emp-text">' + esc(b.cue || b.text) + '</p>' +
            '<p class="live-ctl"><button type="button" class="chip" id="live-pause">Pause</button><button type="button" class="live-skip" id="live-skip">Skip →</button></p>';
          var clock = document.getElementById('live-clock'), bar = document.getElementById('live-bar');
          var tick = setInterval(function () {
            if (paused) return; left--;
            clock.textContent = L.clock(Math.max(left, 0)); bar.style.width = (100 * (b.seconds - left) / b.seconds) + '%';
            if (left <= 0) done();
          }, 1000);
          timers.push(tick);
          function done() {
            clearInterval(tick);
            emp.innerHTML = '<p class="live-done"><span class="tick" aria-hidden="true">✓</span> That\'s what your team gets.</p><p class="emp-text">3 minutes, between calls. This was 1 of ' + plan.blocks.length + ' steps.</p>';
            var row = rows.querySelector('.hr-row[data-team="' + team + '"]');
            if (row) { row.querySelector('strong').textContent = full(team); row.classList.add('bump'); }
            var need = r.heard.length ? ' · need: ' + NEED_LABEL[r.heard[0]] : '';
            if (status) status.innerHTML = '<b>' + esc(team) + ' +1</b>' + esc(need) + '. That\'s all HR gets.';
            if (reveal) reveal.hidden = false; setFlow(1); if (navigator.vibrate) navigator.vibrate(20);
            setTimeout(function () { showView('hr'); if (ask) { ask.hidden = false; setFlow(2); setTimeout(function () { ask.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); }, 300); } }, reduce ? 0 : 1400);
            track('live-finished');
          }
          document.getElementById('live-pause').addEventListener('click', function (e) { paused = !paused; e.target.textContent = paused ? 'Resume' : 'Pause'; });
          document.getElementById('live-skip').addEventListener('click', function () { track('live-skipped'); done(); });
          return true;
        }
        if (ask) {
          var ref = new URLSearchParams(location.search).get('ref') || '';
          ask.querySelectorAll('a[data-team]').forEach(function (a) {
            a.href = 'https://tally.so/r/peex9E?cta=home-feedback&team=' + a.dataset.team + (ref ? '&ref=' + encodeURIComponent(ref) : '');
            a.addEventListener('click', function (e) {
              track('ask-' + a.dataset.team);
              if (a.dataset.team === 'yes') { setTimeout(function () { ask.innerHTML = '<p class="ask-q">Thank you. The form opened in a new tab.</p>' + nextStep(); setFlow(3); }, 400); return; }
              e.preventDefault();
              ask.innerHTML = '<p class="ask-q">Thanks. What\'s one thing you\'d change before trying it with your team?</p><p class="ask-why">' +
                [['busy', 'Too busy'], ['privacy', 'Privacy worries'], ['have-one', 'We already have something'], ['not-needed', 'Not a real need'], ['other', 'Something else']]
                  .map(function (w) { return '<button type="button" class="chip" data-why="' + w[0] + '">' + w[1] + '</button>'; }).join('') + '</p>';
              ask.querySelectorAll('[data-why]').forEach(function (b) {
                b.addEventListener('click', function () { track('why-' + a.dataset.team + '-' + b.dataset.why); ask.innerHTML = '<p class="ask-q">Noted. Thank you.</p><p class="tiny">Want to say more? <a href="mailto:rupakr2g@gmail.com">Email me</a>.</p>' + nextStep(); setFlow(3); });
              });
            });
          });
        }
        var CHIP_TEXT = {};
        if (chips) {
          chips.forEach(function (chip) {
            CHIP_TEXT[chip.dataset.chip] = chip.textContent;
            chip.addEventListener('click', function () { input.value = chip.textContent; run(chip.textContent, chip.dataset.chip); track('chip-' + chip.dataset.chip); });
          });
        }
        document.getElementById('say').addEventListener('submit', function (e) {
          e.preventDefault();
          var v = input.value.trim(); if (!v) { input.focus(); return; }
          var r = run(v, 'typed');
          try { localStorage.setItem('lull-last-feeling', v); } catch (err) { /* private mode: nothing to remember */ }
          input.blur();
          track('typed-' + (r.kind === 'suggest' ? r.reset : r.kind === 'care' ? 'care-' + r.level : 'clarify'));
        });
        emp.addEventListener('click', function (e) {
          var b = e.target.closest('.clarify-opt'); if (!b) return;
          run(b.dataset.say, 'typed'); track('clarify-' + b.textContent.trim().toLowerCase().replace(/[^a-z]+/g, '-'));
        });
        // A returning visitor sees her own last answer again; everyone else starts on the first moment.
        var last = null;
        try { last = localStorage.getItem('lull-last-feeling'); } catch (err) { last = null; }
        if (last) { input.value = last; run(last, 'auto'); }
        else { if (CHIP_TEXT) run(CHIP_TEXT.calls, 'auto'); if (chips) chips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); }); input.value = ''; }
      }).catch(function () { if (emp) emp.textContent = 'The demo could not load. Try the app instead.'; });
    }
  }

  // CEO slide chart: only on pages with the slide element ---
  if (document.getElementById('bars')) {
    var WEEKLY = [33, 34, 29, 21, 23, 22], max = 34;
    document.getElementById('bars').innerHTML = WEEKLY.map(function (n, i) {
      return '<li style="--h:' + (n / max * 100).toFixed(1) + '%"><span class="v">' + n + '</span><span class="b" aria-hidden="true"></span><span class="w">W' + (i + 1) + '</span></li>';
    }).join('');
  }

  // Targets: only on pages with target elements ---
  if (document.querySelectorAll('.seg[data-target]').length) {
    var RESULT = { tried: 44 / 64, stayed: 27 / 64 }, target = { tried: 0.5, stayed: 0.3334 };
    var LABELS = { tried: { '0.5': '50%', '0.6': '60%', '0.75': '75%' }, stayed: { '0.3334': '1 in 3', '0.5': '1 in 2', '0.6667': '2 in 3' } };
    function verdicts() {
      ['tried', 'stayed'].forEach(function (k) {
        var met = RESULT[k] >= target[k], el = document.getElementById('v-' + k);
        el.className = 'verdict ' + (met ? 'met' : 'miss');
        el.textContent = (met ? 'Met' : 'Not met') + ' · target ' + LABELS[k][String(target[k])];
      });
    }
    document.querySelectorAll('.seg[data-target]').forEach(function (seg) {
      seg.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        seg.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        target[seg.dataset.target] = +b.dataset.v; verdicts(); track('target-' + seg.dataset.target + '-' + b.textContent.replace(/\s+/g, ''));
      });
    });
    verdicts();
    if (document.querySelector('.why-hidden')) {
      document.querySelector('.why-hidden').addEventListener('toggle', function (e) { if (e.target.open) track('why-hidden-opened'); });
    }
  }

  // Download the slide as a PNG, only on pages with the download button ---
  if (document.getElementById('dl-slide')) {
    document.getElementById('dl-slide').addEventListener('click', function () {
      var go = function () {
        var W = 1600, H = 1000, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
        var x = cv.getContext('2d'), INK = '#1F2933', MUTE = '#5B6670', ACC = '#2D5A45', LINE = '#E4DCCB', SERIF = 'Fraunces, Georgia, serif', SANS = 'Inter, system-ui, sans-serif';
        x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
        var L = 90, R = W - 90;
        x.fillStyle = INK; x.font = '600 26px ' + SANS; x.fillText(document.getElementById('slide-title').textContent, L, 100);
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
        [['Engineering', '8 of 24'], ['Sales', '6 of 11'], ['Product & Design', '2 of 11'], ['Customer support', 'Hidden · under 10'], ['People & Ops', 'Hidden · under 10']].forEach(function (t, i) {
          var y = 520 + i * 54, hid = t[1].indexOf('Hidden') === 0;
          x.fillStyle = hid ? MUTE : INK; x.font = '400 24px ' + SANS; x.fillText(t[0], 900, y);
          x.font = (hid ? '500 20px ' : '600 24px ') + SANS; x.textAlign = 'right'; x.fillText(t[1], R, y); x.textAlign = 'left';
          x.fillStyle = LINE; x.fillRect(900, y + 18, R - 900, 1);
        });
        x.fillStyle = LINE; x.fillRect(L, 812, R - L, 2);
        x.fillStyle = MUTE; x.font = '600 18px ' + SANS; x.fillText('ASKED FOR MOST', L, 846); x.fillText('COST PER FINISHED SESSION', 1110, 846);
        x.fillStyle = INK; x.font = '500 22px ' + SANS; x.fillText('Engineering: not much time · Sales: not much time · Product & Design: a lot of sitting', L, 880);
        x.fillStyle = ACC; x.font = '600 30px ' + SANS; x.fillText('₹26–53', 1110, 884);
        x.fillStyle = INK; x.fillRect(L, 912, R - L, 3);
        x.font = '500 28px ' + SERIF; x.fillText('HR saw team totals only. No names, no messages.', L, 958);
        var a = document.createElement('a'); a.download = 'lull-week6-sample-slide.png'; a.href = cv.toDataURL('image/png'); document.body.appendChild(a); a.click(); a.remove();
      };
      (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(go);
      track('slide-downloaded');
    });
  }

  // Her own usage guess against cited benchmarks ---
  if (document.getElementById('usage')) {
    var usage = document.getElementById('usage'), usageUsed = false;
    var usageRead = function () {
      var v = +usage.value;
      document.getElementById('usage-out').textContent = v + '%';
      document.getElementById('usage-you').textContent = v + '%';
      document.getElementById('usage-bar').style.setProperty('--w', Math.max(v, 1) + '%');
      document.getElementById('usage-verdict').textContent = v < 10
        ? 'Below even typical counselling-service use. The content is rarely the problem; nothing brings people back.'
        : v <= 35 ? 'About where most companies are. Most tools are bought at launch and quietly forgotten by week four.'
        : 'Better than most. The harder part is showing it to your CEO without naming anyone.';
    };
    usage.addEventListener('input', function () { usageRead(); if (!usageUsed) { usageUsed = true; track('usage-guess-used'); } });
    usage.addEventListener('change', function () { track('usage-guess-' + (+usage.value < 10 ? 'under10' : +usage.value <= 35 ? '10to35' : 'over35')); });
    usageRead();
  }

  // Calculator: a pilot team first (what she can approve), the whole company on request ---
  if (document.getElementById('size')) {
    var size = document.getElementById('size');
    var fmt = function (n) { return n.toLocaleString('en-IN'); };
    var MODES = { pilot: { min: 10, max: 50, step: 5, value: 20, label: 'Pilot team size' }, company: { min: 20, max: 500, step: 10, value: 100, label: 'Company size' } };
    var mode = 'pilot', used = false;
    var calc = function () {
      var n = +size.value;
      document.getElementById('cost').innerHTML = '<span class="ppl">' + n + ' people:</span> <span class="amt">₹' + fmt(n * 60) + '–' + fmt(n * 120) + '</span> <span class="mo">/ month</span>';
      document.getElementById('cost-note').textContent = mode === 'pilot'
        ? '6-week pilot total: ₹' + fmt(n * 90) + '–' + fmt(n * 180) + '. Indicative.'
        : 'Indicative, at ₹60–120 per person per month. Pilots start with one team of 10–50.';
    };
    document.getElementById('calc-mode').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || b.dataset.mode === mode) return;
      mode = b.dataset.mode; var m = MODES[mode];
      this.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      size.min = m.min; size.max = m.max; size.step = m.step; size.value = m.value;
      document.getElementById('size-min').textContent = m.min; document.getElementById('size-max').textContent = m.max;
      document.getElementById('size-label').textContent = m.label;
      calc(); track('calculator-mode-' + mode);
    });
    size.addEventListener('input', function () { calc(); if (!used) { used = true; track('calculator-used'); } });
    calc();
  }

  // Copy team reset invite ---
  if (document.getElementById('copy-reset')) {
    document.getElementById('copy-reset').addEventListener('click', function () {
      copyText(invite, document.getElementById('copy-reset-done'), 'Copied. Paste it at the bottom of any recurring meeting invite.');
    });
  }

  // FAQ ---
  if (document.querySelectorAll('details[data-faq]').length) {
    document.querySelectorAll('details[data-faq]').forEach(function (d) {
      d.addEventListener('toggle', function () { if (d.open) track('faq-' + d.dataset.faq); });
    });
  }

  // Video modal: only on pages with the video element ---
  if (document.getElementById('vid')) {
    var dlg = document.getElementById('vid'), video = dlg.querySelector('video');
    if (video) {
      var openBtn = document.getElementById('open-video');
      if (openBtn) {
        openBtn.addEventListener('click', function (ev) { ev.preventDefault();
          var srcs = video.querySelectorAll('source');
          if (srcs.length && !srcs[0].getAttribute('src')) { srcs.forEach(function (s) { s.src = s.dataset.src; }); video.load(); }
          if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
          video.play().catch(function () {});
          track('video-opened');
        });
      }
      var shut = function () { video.pause(); dlg.close ? dlg.close() : dlg.removeAttribute('open'); };
      document.getElementById('vid-close').addEventListener('click', shut);
      dlg.addEventListener('click', function (e) { if (e.target === dlg) shut(); });
      dlg.addEventListener('close', function () { video.pause(); });
    }
  }

  // Share founder ---
  if (document.getElementById('share')) {
    var share = document.getElementById('share');
    var url = 'https://lull-hr.vercel.app/' + (company ? '?for=' + encodeURIComponent(company) : '');
    var text = 'Worth a look: Lull, a 3-minute guided movement reset for our team, where HR sees team totals only (never individuals). 6-week pilot with targets agreed up front. ' + url;
    var phone = matchMedia('(max-width:760px), (pointer:coarse)').matches;
    share.href = phone
      ? 'https://wa.me/?text=' + encodeURIComponent(text)
      : 'mailto:?subject=' + encodeURIComponent('Worth a look: Lull pilot') + '&body=' + encodeURIComponent(text);
    if (phone) { share.target = '_blank'; share.rel = 'noopener'; }
    share.addEventListener('click', function () { track('share-founder-' + (phone ? 'whatsapp' : 'email')); });
  }
});
// Phone demo: one panel at a time
(function(){var t=document.querySelector('.view-tabs'),sp=document.getElementById('split');if(!t||!sp)return;
t.addEventListener('click',function(e){var b=e.target.closest('button[data-view]');if(!b)return;
t.querySelectorAll('button').forEach(function(x){x.setAttribute('aria-selected',x===b?'true':'false');});
sp.classList.toggle('show-emp',b.dataset.view==='emp');sp.classList.toggle('show-hr',b.dataset.view==='hr');});})();

// Menu and theme (follows the phone's setting unless the person chooses)
(function(){var b=document.getElementById('menu-btn'),p=document.getElementById('menu-panel'),t=document.getElementById('theme-btn'),root=document.documentElement;
function get(){try{return localStorage.getItem('lull-theme');}catch(e){return null;}}
function apply(m){root.setAttribute('data-theme',m);if(t)t.textContent=m==='dark'?'Light mode':'Dark mode';}
apply(get()||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));
if(b&&p){b.addEventListener('click',function(){var o=p.hidden;p.hidden=!o;b.setAttribute('aria-expanded',String(o));});
p.addEventListener('click',function(e){if(e.target.closest('a')){p.hidden=true;b.setAttribute('aria-expanded','false');}});}
if(t)t.addEventListener('click',function(){var m=root.getAttribute('data-theme')==='dark'?'light':'dark';apply(m);try{localStorage.setItem('lull-theme',m);}catch(e){}});})();
