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

// Section index state + phone reply bar.
(function(){
  var secs=[].slice.call(document.querySelectorAll('.sec-nav a[data-sec]'));
  if(secs.length && 'IntersectionObserver' in window){
    var map={},obs=new IntersectionObserver(function(entries){
      entries.forEach(function(e){map[e.target.id]=e.isIntersecting;});
      var current=null;
      secs.forEach(function(a){if(map[a.getAttribute('data-sec')])current=current||a;});
      if(!current){ // fall back to the last section passed
        var y=window.scrollY+120;
        secs.forEach(function(a){var t=document.getElementById(a.getAttribute('data-sec'));if(t&&t.offsetTop<=y)current=a;});
      }
      secs.forEach(function(a){a.classList.toggle('on',a===current);});
    },{rootMargin:'-140px 0px -55% 0px'});
    secs.forEach(function(a){var t=document.getElementById(a.getAttribute('data-sec'));if(t)obs.observe(t);});
  }

  var bar=document.getElementById('reply-bar');
  var hero=document.querySelector('.hero'),ask=document.getElementById('ask');
  if(!bar||!hero||!ask||!('IntersectionObserver' in window))return;
  var heroVisible=true,askVisible=false;
  function sync(){bar.hidden=!(window.matchMedia('(max-width:600px)').matches&&!heroVisible&&!askVisible);}
  new IntersectionObserver(function(e){heroVisible=e[0].isIntersecting;sync();},{threshold:0}).observe(hero);
  new IntersectionObserver(function(e){askVisible=e[0].isIntersecting;sync();},{threshold:0}).observe(ask);
  window.addEventListener('resize',sync);
})();

/* Reading progress: the page tells you where you are. */
(function(){
  var bar=document.getElementById('read-bar');
  if(!bar) return;
  var queued=false;
  function paint(){
    var h=document.documentElement;
    var max=h.scrollHeight-h.clientHeight;
    bar.style.width=(max>0?Math.min(100,Math.max(0,100*h.scrollTop/max)):0)+'%';
    queued=false;
  }
  addEventListener('scroll',function(){if(!queued){queued=true;requestAnimationFrame(paint);}},{passive:true});
  addEventListener('resize',paint);
  paint();
})();

/* Contents: position readout and the sections already passed. */
(function(){
  var links=[].slice.call(document.querySelectorAll('.sec-nav a[data-sec]'));
  var count=document.getElementById('sec-count');
  if(!links.length) return;
  var secs=links.map(function(a){return document.getElementById(a.getAttribute('data-sec'));});
  function paint(){
    var y=window.scrollY+170, at=0;
    secs.forEach(function(s,i){if(s&&s.offsetTop<=y)at=i;});
    links.forEach(function(a,i){
      a.classList.toggle('past',i<at);
      a.setAttribute('aria-current',i===at?'true':'false');
    });
    if(count) count.textContent=('0'+(at+1))+' / 0'+links.length;
  }
  addEventListener('scroll',paint,{passive:true});
  addEventListener('resize',paint);
  paint();
})();

/* Product menu: click, keyboard, escape, outside. Hover is CSS. */
(function(){
  var item=document.getElementById('product');
  var btn=document.getElementById('product-btn');
  if(!item||!btn) return;
  function set(open){
    item.classList.toggle('open',open);
    btn.setAttribute('aria-expanded',String(open));
  }
  btn.addEventListener('click',function(e){
    e.stopPropagation();
    set(!item.classList.contains('open'));
  });
  item.querySelectorAll('.menu-panel a').forEach(function(a){a.addEventListener('click',function(){set(false);});});
  document.addEventListener('click',function(e){if(!item.contains(e.target))set(false);});
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&item.classList.contains('open')){set(false);btn.focus();}
  });
  document.addEventListener('focusin',function(e){if(!item.contains(e.target))set(false);});
})();

/* Footer groups: columns on desktop, accordion on phones. */
(function(){
  var groups=[].slice.call(document.querySelectorAll('.foot-group'));
  if(!groups.length) return;
  var mq=window.matchMedia('(max-width:600px)');
  function sync(){groups.forEach(function(d){d.open=!mq.matches;});}
  sync();
  if(mq.addEventListener) mq.addEventListener('change',sync);
  else if(mq.addListener) mq.addListener(sync);
})();

/* Long copy folds open on desktop, stays folded on phones. */
(function(){
  var folds=[].slice.call(document.querySelectorAll('details.fold'));
  if(!folds.length) return;
  var mq=window.matchMedia('(max-width:600px)');
  function sync(){folds.forEach(function(d){d.open=!mq.matches;});}
  sync();
  if(mq.addEventListener) mq.addEventListener('change',sync);
  else if(mq.addListener) mq.addListener(sync);
})();

/* The Friday email: same data, read as HR or as Finance. */
(function(){
  var tabs=[].slice.call(document.querySelectorAll('.email-tabs [role="tab"]'));
  if(!tabs.length) return;
  var panels=[].slice.call(document.querySelectorAll('.email-body'));
  function show(id){
    tabs.forEach(function(t){
      var on=t.getAttribute('aria-controls')===id;
      t.setAttribute('aria-selected',on?'true':'false');
      t.tabIndex=on?0:-1;
    });
    panels.forEach(function(panel){
      var on=panel.id===id;
      panel.hidden=!on;
      if(on){panel.classList.remove('panel-in');void panel.offsetWidth;panel.classList.add('panel-in');}
    });
  }
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){show(t.getAttribute('aria-controls'));});
    t.addEventListener('keydown',function(e){
      if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;
      e.preventDefault();
      var n=tabs[(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length];
      show(n.getAttribute('aria-controls'));n.focus();
    });
  });
})();

/* Contents bar: active section, centered chip; nav height var */
(function(){var nav=document.getElementById('nav'),toc=document.getElementById('toc');function nh(){if(nav)document.documentElement.style.setProperty('--navh',nav.offsetHeight+'px');}nh();addEventListener('resize',nh);
if(!toc)return;var L=[].slice.call(toc.querySelectorAll('a')),S=L.map(function(a){return document.querySelector(a.getAttribute('href'));});
function upd(){var y=innerHeight*0.35,k=0;S.forEach(function(s,i){if(s&&s.getBoundingClientRect().top<y)k=i;});L.forEach(function(a,i){var on=i===k;if(on&&!a.classList.contains('on')){var c=a.parentNode;c.scrollTo({left:a.offsetLeft-c.clientWidth/2+a.clientWidth/2,behavior:'smooth'});}a.classList.toggle('on',on);});}
addEventListener('scroll',upd,{passive:true});upd();})();
/* Workspace table: label cells for phone layout */
(function(){var t=document.getElementById('ws-table');if(!t)return;var h=[].map.call(t.querySelectorAll('thead th'),function(x){return x.textContent.trim();});
function lab(){t.querySelectorAll('tbody tr').forEach(function(r){[].forEach.call(r.children,function(c,i){if(i>0&&h[i])c.setAttribute('data-label',h[i]);});});}lab();new MutationObserver(lab).observe(t,{childList:true,subtree:true});})();
/* Phones: fold long paragraphs to two lines with "More" */
(function(){if(!matchMedia('(max-width:640px)').matches)return;document.querySelectorAll('main section:not(.hero) p').forEach(function(p){if(p.closest('.email,.demo,.ws,.ask,table,.pager,.toc,.ledger,.privacy,aside,[class*=callout],[class*=card],[class*=box],[class*=note],blockquote,.pmx')||!p.parentElement.matches('.wrap,.wrap > div,section > div > div')||p.textContent.trim().length<150||p.querySelector('input,button'))return;
p.classList.add('fold');var b=document.createElement('button');b.type='button';b.className='fold-btn';b.textContent='More';b.addEventListener('click',function(){var o=p.classList.toggle('open');b.textContent=o?'Less':'More';});p.after(b);});})();

/* Product view tabs */
(function(){var pv=document.getElementById('pv');if(!pv)return;var tabs=[].slice.call(pv.querySelectorAll('.pv-tabs > [role=tab]'));
function sel(t,focus){tabs.forEach(function(x){var on=x===t;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;document.getElementById(x.getAttribute('aria-controls')).hidden=!on;});if(focus)t.focus();try{window.goatcounter&&goatcounter.count({path:'home/pv-'+t.id,event:true});}catch(e){}}
tabs.forEach(function(t,i){t.addEventListener('click',function(){sel(t);});t.addEventListener('keydown',function(e){var d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(d){e.preventDefault();sel(tabs[(i+d+tabs.length)%tabs.length],true);}});});
document.querySelectorAll('[data-pv]').forEach(function(b){b.addEventListener('click',function(){sel(document.getElementById('pvt-'+b.dataset.pv));pv.scrollIntoView({behavior:'smooth',block:'center'});});});})();
