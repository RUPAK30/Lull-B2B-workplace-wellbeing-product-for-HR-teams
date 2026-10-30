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

  if (startBtn) startBtn.addEventListener('click', function () {
    if (running) pause();
    else start();
  });
  if (skipBtn) skipBtn.addEventListener('click', finish);
  if (againBtn) againBtn.addEventListener('click', resetAll);
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

/* Scroll progress only. No reveal: content is never hidden for the sake of motion. */
(function(){
  var bar=document.getElementById('progress');
  if(!bar)return;
  var t=false;
  function paint(){var h=document.documentElement;var m=h.scrollHeight-h.clientHeight;
    bar.style.width=(m>0?Math.min(100,Math.max(0,100*h.scrollTop/m)):0)+'%';t=false;}
  addEventListener('scroll',function(){if(!t){t=true;requestAnimationFrame(paint);}},{passive:true});
  paint();
})();

/* Copy any block marked data-copy-target */
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-copy-target]');if(!b)return;
  var src=document.getElementById(b.getAttribute('data-copy-target'));if(!src)return;
  var text=src.innerText.replace(/\s+\n/g,'\n').trim();
  var old=b.textContent;
  function ok(){b.textContent='Copied';setTimeout(function(){b.textContent=old;},2000);}
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(ok,function(){prompt('Copy this',text);});}
  else{prompt('Copy this',text);}
});

// Live workspace table: type any number, the rule applies in front of you.
(function(){
  var card=document.querySelector('.ws-preview'); if(!card) return;
  var inputs=[].slice.call(card.querySelectorAll('.ws-num'));
  var startedOut=document.getElementById('ws-started');
  var finishedOut=document.getElementById('ws-finished');
  var costOut=document.getElementById('ws-cost');
  var reset=card.querySelector('.ws-reset');
  if(!inputs.length||!startedOut||!finishedOut||!costOut) return;
  var initial=inputs.map(function(i){return i.value;});
  var seats=inputs.reduce(function(n,i){return n+(parseInt(i.closest('tr').getAttribute('data-seats'),10)||0);},0);
  var rate=seats>=250?60:seats>=120?90:120;
  function render(){
    var started=0,finished=0;
    inputs.forEach(function(input){
      var max=parseInt(input.getAttribute('max'),10)||0;
      var n=parseInt(input.value,10); if(isNaN(n)) n=0;
      if(n<0) n=0; if(n>max) n=max;
      if(String(n)!==input.value) input.value=String(n);
      var shown=n>=10, fin=shown?Math.round(n*0.82):0;
      var row=input.closest('tr');
      row.classList.toggle('off',!shown);
      row.querySelector('.fin').textContent=shown?fin:'\u2014';
      var st=row.querySelector('.st');
      st.textContent=shown?'Reporting':'Not shown';
      st.className='st '+(shown?'ok':'na');
      if(shown){started+=n;finished+=fin;}
    });
    startedOut.textContent=String(started);
    finishedOut.textContent=String(finished);
    costOut.textContent=started?'\u20B9'+Math.round(seats*rate/started):'\u2014';
  }
  inputs.forEach(function(i){i.addEventListener('input',render);});
  if(reset) reset.addEventListener('click',function(){
    inputs.forEach(function(i,k){i.value=initial[k];});
    render(); inputs[0].focus();
  });
  render();
})();
