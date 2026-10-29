(function () {
  var nav = document.getElementById('nav');
  var menuBtn = document.getElementById('menu-btn');

  /* Sticky nav border */
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Mobile menu */
  function setMenu(open) {
    if (!nav || !menuBtn) return;
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
    menuBtn.textContent = open ? '\u2715' : '\u2630';
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setMenu(!nav.classList.contains('open'));
    });
  }
  document.addEventListener('click', function (e) {
    if (nav && nav.classList.contains('open') && !nav.contains(e.target)) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav && nav.classList.contains('open')) {
      setMenu(false);
      if (menuBtn) menuBtn.focus();
    }
  });
  if (nav) {
    nav.querySelectorAll('.menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  }
  window.addEventListener('resize', function () {
    if (window.innerWidth > 840) setMenu(false);
  });

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
    } catch (err) { /* analytics blocked: nothing to do */ }
  });

  /* The real first move, 40 seconds, straight on the page. */
  var demo = document.getElementById('reset-live');
  if (!demo) return;
  var live = document.getElementById('demo-live');
  var doneBox = document.getElementById('demo-done');
  var doneTitle = document.getElementById('demo-done-title');
  var timeEl = document.getElementById('demo-time');
  var bar = document.getElementById('demo-bar');
  var fill = document.getElementById('demo-fill');
  var startBtn = document.getElementById('demo-start');
  var skipBtn = document.getElementById('demo-skip');
  var againBtn = document.getElementById('demo-again');
  var status = document.getElementById('demo-status');
  var total = 40;
  var remaining = total;
  var running = false;
  var done = false;
  var raf = 0;
  var last = 0;

  function announce(msg) {
    if (!status) return;
    status.textContent = '';
    window.requestAnimationFrame(function () { status.textContent = msg; });
  }

  function clock(sec) {
    sec = Math.max(0, Math.ceil(sec));
    return '0:' + String(sec).padStart(2, '0');
  }

  function paint() {
    var sec = Math.max(0, Math.ceil(remaining));
    var elapsed = total - remaining;
    timeEl.textContent = clock(sec);
    fill.style.width = ((elapsed / total) * 100).toFixed(2) + '%';
    bar.setAttribute('aria-valuenow', String(Math.round(elapsed)));
    bar.setAttribute('aria-valuetext', sec + (sec === 1 ? ' second left' : ' seconds left'));
  }

  function stopFrame() {
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
  }

  function frame(now) {
    if (!running) return;
    var delta = (now - last) / 1000;
    last = now;
    remaining -= delta;
    if (remaining <= 0) {
      remaining = 0;
      paint();
      finish();
      return;
    }
    paint();
    raf = window.requestAnimationFrame(frame);
  }

  function start() {
    if (running || done) return;
    running = true;
    last = window.performance.now();
    startBtn.textContent = 'Pause';
    announce('Step started. Forty seconds.');
    raf = window.requestAnimationFrame(frame);
  }

  function pause() {
    if (!running) return;
    running = false;
    stopFrame();
    startBtn.textContent = 'Resume';
    announce('Paused with ' + Math.ceil(remaining) + ' seconds left.');
  }

  function finish() {
    if (done) return;
    running = false;
    done = true;
    stopFrame();
    remaining = 0;
    paint();
    live.hidden = true;
    doneBox.hidden = false;
    announce('Step one complete. The full reset is two minutes thirty seconds.');
    if (doneTitle) doneTitle.focus();
  }

  function resetAll() {
    running = false;
    done = false;
    stopFrame();
    remaining = total;
    live.hidden = false;
    doneBox.hidden = true;
    startBtn.textContent = 'Start the 40-second step';
    paint();
    announce('Ready. Forty seconds.');
    startBtn.focus();
  }

  startBtn.addEventListener('click', function () {
    if (running) pause();
    else start();
  });
  skipBtn.addEventListener('click', finish);
  againBtn.addEventListener('click', resetAll);
  paint();
})();


/* Copy-address fallback for people without a mail app */
document.addEventListener('click',function(e){var b=e.target.closest('.copy-mail');if(!b)return;var t='rupakr2g@gmail.com';
function ok(){b.textContent='Copied';setTimeout(function(){b.textContent='Copy address';},2000);}
if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(ok,function(){prompt('Email address',t);});}else{prompt('Email address',t);}});
/* Funnel: taster completion and report views */
(function(){function c(n){try{window.goatcounter&&window.goatcounter.count&&window.goatcounter.count({path:'home/'+n,title:n,event:true});}catch(e){}}
var d=document.getElementById('demo-done');if(d&&'MutationObserver' in window){new MutationObserver(function(){if(!d.hidden){c('taster-finished');}}).observe(d,{attributes:true,attributeFilter:['hidden']});}
if(/report\.html$/.test(location.pathname))c('report-view');})();
