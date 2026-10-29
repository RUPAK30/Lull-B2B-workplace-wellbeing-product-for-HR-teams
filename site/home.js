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

/* Scroll progress + reveals */
(function(){var bar=document.createElement('div');bar.className='progress';bar.setAttribute('aria-hidden','true');document.body.appendChild(bar);
addEventListener('scroll',function(){var h=document.documentElement;bar.style.width=(100*h.scrollTop/((h.scrollHeight-h.clientHeight)||1))+'%';},{passive:true});
if(matchMedia('(prefers-reduced-motion:reduce)').matches||!('IntersectionObserver' in window))return;
var els=document.querySelectorAll('main section h2,.data-table,.move-table,.week-table,.email,.rules,.price,.app-shot,.doc-section');
els.forEach(function(e){if(e.closest('.hero'))return;e.classList.add('rv');});
var o=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');o.unobserve(x.target);}});},{rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.rv').forEach(function(e){o.observe(e);});})();

/* Chapter rail for the stacked flow */
(function(){if(!document.body.classList.contains('home'))return;
var secs=[].slice.call(document.querySelectorAll('main > section')).filter(function(s){return s.querySelector('h1,h2');});
var rail=document.createElement('nav');rail.className='rail';rail.setAttribute('aria-label','Chapters');
secs.forEach(function(s,i){if(!s.id)s.id='ch'+i;var t=(s.querySelector('.eyebrow')||s.querySelector('h1,h2')).textContent.trim().split('·')[0].slice(0,28);
var a=document.createElement('a');a.href='#'+s.id;a.innerHTML='<span>'+t+'</span><i></i>';rail.appendChild(a);});
document.body.appendChild(rail);var links=rail.querySelectorAll('a');
function upd(){var y=innerHeight*0.4,cur=0;secs.forEach(function(s,i){if(s.getBoundingClientRect().top<y)cur=i;});links.forEach(function(a,i){a.classList.toggle('on',i===cur);});}
addEventListener('scroll',upd,{passive:true});upd();})();

/* Tall chapters: stick only after their bottom is reached, so nothing is ever covered unread */
(function(){if(!document.body.classList.contains('home'))return;var secs=document.querySelectorAll('main > section:not(.hero)');
function fit(){secs.forEach(function(s){s.style.top=Math.min(0,innerHeight-s.offsetHeight)+'px';});}
fit();addEventListener('resize',fit);addEventListener('load',fit);})();

/* Chapter dock: live progress per chapter, tap to jump */
(function(){var dock=document.getElementById('dock');if(!dock)return;var box=document.getElementById('dock-ch');
var names={product:'The reset',inbox:'Friday email',pilot:'Pilot',wrong:'What fails',company:'Who'};var secs=[];
Object.keys(names).forEach(function(id){var s=document.getElementById(id);if(!s)return;secs.push(s);var a=document.createElement('a');a.href='#'+id;a.innerHTML=names[id]+'<i></i>';box.appendChild(a);});
var links=box.querySelectorAll('a'),hero=document.querySelector('.hero');
function upd(){dock.classList.toggle('show',hero.getBoundingClientRect().bottom<innerHeight*0.5);var cur=-1;
secs.forEach(function(s,i){var r=s.getBoundingClientRect();var p=Math.max(0,Math.min(1,(innerHeight*0.5-r.top)/r.height));links[i].querySelector('i').style.width=(p*100)+'%';if(r.top<innerHeight*0.5)cur=i;});
links.forEach(function(a,i){var on=i===cur;if(on&&!a.classList.contains('on'))a.scrollIntoView({inline:'center',block:'nearest'});a.classList.toggle('on',on);});}
addEventListener('scroll',upd,{passive:true});upd();})();

/* Guided answers: AI-style, but written, honest and offline */
(function(){var sheet=document.getElementById('asksheet');if(!sheet)return;var qs=document.getElementById('ask-qs'),out=document.getElementById('ask-a');
var Q=[['Can I see who used it?','No. You get one line per team: how many started and finished. Teams under 10 are hidden, and the next-smallest too, so nobody can be worked out by subtraction.','inbox'],
['What does it cost?','The first six teams are free for six weeks. After that it is ₹60–120 a person a month depending on size, with fifteen days\' notice and no annual contract.','pilot'],
['What do I have to do?','Send one link and forward one note. Fifteen minutes at kickoff, week 3 and week 6. No roster, no HRIS, no app to install.','pilot'],
['Is it safe for employees?','Four gentle seated moves. If someone mentions pain, the timer stops and points them to proper help. Nobody at your company is told, and it is never counted.','inbox'],
['What if nobody uses it?','You will see it by week 3, not at renewal. Targets are agreed on day one, and the week-6 report says "Not met" if they were not.','wrong'],
['Who is behind this?','Rupak, who runs every pilot himself. There are no customers yet, and the site says so plainly.','company']];
var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches,timer;
Q.forEach(function(q,i){var b=document.createElement('button');b.type='button';b.textContent=q[0];b.addEventListener('click',function(){answer(i,b);});qs.appendChild(b);});
function answer(i,btn){qs.querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed',x===btn?'true':'false');});clearInterval(timer);
var t=Q[i][1],n=0;out.innerHTML='<div class="bubble"><span class="txt"></span><span class="caret"></span></div>';var el=out.querySelector('.txt');
function done(){out.querySelector('.caret').remove();var g=document.createElement('button');g.className='go';g.textContent='Show me on the page →';g.addEventListener('click',function(){close();var s=document.getElementById(Q[i][2]);s.scrollIntoView({behavior:reduce?'auto':'smooth'});var w=s.querySelector('.wrap');w.classList.remove('glow');void w.offsetWidth;w.classList.add('glow');});out.appendChild(g);}
if(reduce){el.textContent=t;done();return;}
timer=setInterval(function(){n+=3;el.textContent=t.slice(0,n);if(n>=t.length){clearInterval(timer);done();}},18);
try{window.goatcounter&&window.goatcounter.count({path:'home/ask-'+i,title:'ask',event:true});}catch(e){}}
function open(){sheet.hidden=false;document.body.style.overflow='hidden';qs.querySelector('button').focus();}
function close(){sheet.hidden=true;document.body.style.overflow='';document.getElementById('ask-open').focus();}
document.getElementById('ask-open').addEventListener('click',open);document.getElementById('ask-close').addEventListener('click',close);
sheet.addEventListener('click',function(e){if(e.target===sheet)close();});document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!sheet.hidden)close();});})();

/* Pointer spotlight */
document.addEventListener('pointermove',function(e){var c=e.target.closest&&e.target.closest('.email,.rules,.price,.move-table,.week-table,.data-table');if(!c)return;var r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px');},{passive:true});

/* Canvas colour morph + headline fill, driven by scroll position */
(function(){if(!document.body.classList.contains('home'))return;var b=document.body;
var stops=[['.hero','#F3F1EA'],['#product','#F4EBDD'],['#inbox','#E3EDE6'],['#pilot','#F6E8E2'],['#wrong','#DCE6DF'],['#company','#E6EEE8']]
 .map(function(s){return {el:document.querySelector(s[0]),c:s[1]};}).filter(function(s){return s.el;});
function hex(h){return [1,3,5].map(function(i){return parseInt(h.substr(i,2),16);});}
function mix(a,b,t){a=hex(a);b=hex(b);return 'rgb('+a.map(function(v,i){return Math.round(v+(b[i]-v)*t);}).join(',')+')';}
var hs=document.querySelectorAll('main > section:not(.hero) h2'),reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
function upd(){var mid=innerHeight*0.55,i=0;for(var k=0;k<stops.length;k++){if(stops[k].el.getBoundingClientRect().top<mid)i=k;}
var cur=stops[i],nxt=stops[Math.min(i+1,stops.length-1)],t=0;if(nxt!==cur){var r=nxt.el.getBoundingClientRect();t=Math.max(0,Math.min(1,1-(r.top-mid)/(innerHeight*0.45)));}
b.style.setProperty('--canvas',mix(cur.c,nxt.c,t));var dark=(cur.el.id==='wrong'&&t<.5)||(nxt.el.id==='wrong'&&t>=.5);b.classList.toggle('ink-dark',dark);
if(!reduce)hs.forEach(function(h){var r=h.getBoundingClientRect();var p=Math.max(0,Math.min(1,(innerHeight*0.85-r.top)/(innerHeight*0.45)));h.style.setProperty('--fill',(p*100).toFixed(1)+'%');});}
addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);upd();})();

/* Make the example yours: the Friday email reacts to team name and size */
(function(){var n=document.getElementById('tune-n');if(!n)return;var nm=document.getElementById('tune-name'),out=document.getElementById('tune-n-out'),email=document.querySelector('.email'),hid=document.getElementById('t-hidden'),price=document.getElementById('t-price');
function set(id,v){var el=document.getElementById(id);if(el.textContent!==String(v)){el.textContent=v;el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');}}
function rate(k){return k<=40?120:k<=120?90:60;}
function upd(){var k=+n.value;out.textContent=k;var s=Math.round(k*0.75),f=Math.round(s*0.84);set('t-s',s);set('t-f',f);set('t-d',s-f);
var small=k<10;email.classList.toggle('is-hidden',small);hid.hidden=!small;
document.querySelectorAll('.t-name').forEach(function(e){e.textContent=nm.value.trim()||'Your team';});
if(price)price.textContent='At '+k+' people: free for six weeks, then about ₹'+(rate(k)*k).toLocaleString('en-IN')+' a month.';}
n.addEventListener('input',upd);nm.addEventListener('input',upd);upd();})();

/* Workday: the whole page is one day. Scroll = time; the light changes; at the break, the person at the desk does the four moves with your scroll. */
(function(){var day=document.getElementById('day');if(!day||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
var tEl=document.getElementById('day-time'),lEl=document.getElementById('day-label'),head=document.getElementById('fig-head'),aL=document.getElementById('fig-armL'),aR=document.getElementById('fig-armR'),torso=document.getElementById('fig-torso'),br=document.getElementById('fig-breath');
var prod=document.getElementById('product'),hero=document.querySelector('.hero');
var light=[[0,'#F6F1E6'],[.25,'#F9F4E9'],[.45,'#F4EBDD'],[.65,'#F5E6D3'],[.85,'#E9DCCB'],[1,'#DED6CE']];
function hex(h){return [1,3,5].map(function(i){return parseInt(h.substr(i,2),16);});}
function at(p){for(var i=1;i<light.length;i++){if(p<=light[i][0]){var a=light[i-1],b=light[i],t=(p-a[0])/(b[0]-a[0]),x=hex(a[1]),y=hex(b[1]);return 'rgb('+x.map(function(v,k){return Math.round(v+(y[k]-v)*t);}).join(',')+')';}}return light[light.length-1][1];}
function upd(){var h=document.documentElement,p=Math.max(0,Math.min(1,h.scrollTop/((h.scrollHeight-h.clientHeight)||1)));
var mins=9*60+Math.round(p*9*60),hh=Math.floor(mins/60),mm=mins%60;tEl.textContent=(hh>12?hh-12:hh)+':'+(mm<10?'0':'')+mm+(hh>=12?' pm':' am');
document.body.style.setProperty('--canvas',at(p));day.classList.toggle('show',hero.getBoundingClientRect().bottom<innerHeight*.6);
var r=prod.getBoundingClientRect(),q=(innerHeight*.6-r.top)/r.height;if(q>0&&q<1){var sec=Math.round(q*150);tEl.textContent='3:4'+(sec>=120?2:sec>=60?1:0)+' pm';}var hd=0,sh=0,ar=0,bb=0,lab;
if(q>0&&q<1){var m=Math.min(3,Math.floor(q*4)),f=(q*4)%1,w=Math.sin(f*Math.PI);
 if(m===0){hd=w*30*(f<.5?1:-1);lab='Neck release';}else if(m===1){sh=-w*7;lab='Shoulder rolls';}else if(m===2){ar=w;lab='Chest opener';}else{bb=w;lab='Long exhale';}}
else lab=q<=0?(p<.12?'Back-to-back calls':'Between calls'):p<.6?'Friday email':'Back to work';
lEl.textContent=lab;head.style.transform='rotate('+hd+'deg) translateY('+sh+'px)';
aL.style.transform='translate('+(-ar*9)+'px,'+(sh-ar*6)+'px)';aR.style.transform='translate('+(ar*9)+'px,'+(sh-ar*6)+'px)';torso.style.transform='scaleY('+(1+bb*.04)+')';br.setAttribute('r',(bb*16).toFixed(1));}
addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);upd();})();

/* Scene: plays on its own when in view (not tied to scroll). Tap a move to jump; pause anytime. */
(function(){var sc=document.getElementById('scene');if(!sc)return;var rows=document.querySelectorAll('.move-table tbody tr');
var H=document.getElementById('p-head'),T=document.getElementById('p-torso'),S=document.getElementById('p-shoulders'),AL=document.getElementById('p-armL'),AR=document.getElementById('p-armR'),PB=document.getElementById('p-back'),B=document.getElementById('p-breath'),ring=document.getElementById('ring'),
tm=document.getElementById('sc-time'),mv=document.getElementById('sc-move'),fill=document.getElementById('sc-fill'),scr=document.getElementById('scr-t'),btn=document.getElementById('sc-play');
var R1=document.getElementById('rip1'),R2=document.getElementById('rip2'),G=document.getElementById('glow1'),cue=document.getElementById('sc-cue'),TINT=['#DCEBE1','#E3EBDA','#EAE6D6','#D6EAE3'],CUES=['Ear toward shoulder. Mild stretch only.','Up, back and down. Reverse halfway.','Hands behind. Let the chest lift.','Breathe out a little longer each time.'];var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches,cur={h:0,s:0,a:0,b:0,x:0},names=['Neck release','Shoulder rolls','Chest opener','Long exhale'],MOVE=5000,CYCLE=MOVE*4,
pos=0,last=null,playing=!reduce,visible=false;
function pose(q){var m=Math.min(3,Math.floor(q*4)),f=(q*4)%1,w=Math.sin(f*Math.PI),t={h:0,s:0,a:0,b:0};
 t.x=0;if(m===0)t.h=Math.sin(f*Math.PI*2)*18;else if(m===1){var ang=f*Math.PI*4;t.s=(1-Math.cos(ang))/2;t.x=Math.sin(ang)*3;}else if(m===2){t.a=Math.min(1,w*1.6);t.h=-w*4;}else t.b=w;return [t,m];}
function frame(now){if(last===null)last=now;var dt=now-last;last=now;if(playing&&visible)pos=(pos+dt)%CYCLE;
var q=pos/CYCLE,pm=pose(q),t=pm[0],m=pm[1],k=0.12;for(var x in cur)cur[x]+=(t[x]-cur[x])*k;var idle=Math.sin(now/1400);
H.setAttribute('transform','rotate('+(cur.h+idle*.8).toFixed(2)+' 200 142) translate(0 '+(-cur.s*5).toFixed(2)+')');
S.setAttribute('transform','translate('+(-cur.x).toFixed(2)+' '+(-cur.s*6).toFixed(2)+')');AL.setAttribute('transform','translate(0 '+(-cur.s*9).toFixed(2)+')');AR.setAttribute('transform','translate(0 '+(-cur.s*9).toFixed(2)+')');
AL.setAttribute('opacity',(1-cur.a).toFixed(2));AR.setAttribute('opacity',(1-cur.a).toFixed(2));PB.setAttribute('opacity',cur.a.toFixed(2));
T.setAttribute('transform','translate(0 '+(idle*1.4-cur.a*3).toFixed(2)+')');B.setAttribute('r',(cur.b*70).toFixed(1));var ph=(now%2600)/2600;R1.setAttribute('r',(cur.b*(40+ph*60)).toFixed(1));R1.setAttribute('opacity',(1-ph).toFixed(2));var ph2=((now+1300)%2600)/2600;R2.setAttribute('r',(cur.b*(40+ph2*60)).toFixed(1));R2.setAttribute('opacity',(1-ph2).toFixed(2));G.setAttribute('stop-color',TINT[m]);if(cue.textContent!==CUES[m])cue.textContent=CUES[m];
var sec=Math.round(q*150),left=150-sec;tm.textContent=Math.floor(sec/60)+':'+('0'+sec%60).slice(-2)+' / 2:30';scr.textContent=Math.floor(left/60)+':'+('0'+left%60).slice(-2)+' left';
mv.textContent=names[m];fill.style.width=(q*100)+'%';ring.setAttribute('stroke-dashoffset',(741.4*(1-q)).toFixed(1));
rows.forEach(function(r,i){r.classList.toggle('now',i===m);});requestAnimationFrame(frame);}
rows.forEach(function(r,i){r.style.cursor='pointer';r.tabIndex=0;r.setAttribute('aria-label','Show '+names[i]);function go(){pos=i*MOVE+1;playing=true;btn.textContent='❚❚';btn.setAttribute('aria-label','Pause');}r.addEventListener('click',go);r.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}});});
btn.addEventListener('click',function(){playing=!playing;btn.textContent=playing?'❚❚':'▶';btn.setAttribute('aria-label',playing?'Pause':'Play');});
if(reduce){btn.textContent='▶';btn.setAttribute('aria-label','Play');}
if('IntersectionObserver' in window)new IntersectionObserver(function(es){visible=es[0].isIntersecting;},{threshold:.3}).observe(sc);else visible=true;
requestAnimationFrame(frame);})();



/* Names dissolve into a count as you reach the Friday email: the product's privacy rule, felt. */
(function(){var em=document.querySelector('.email');if(!em||matchMedia('(prefers-reduced-motion:reduce)').matches)return;var body=em.querySelector('.email-body'),stats=em.querySelector('.email-stats');
var N=['Aisha','Rohan','Meera','Kabir','Priya','Arjun','Neha','Vikram','Sana','Dev','Isha','Kunal','Tara','Rahul','Zoya','Nikhil','Ritu','Aman','Leela','Farhan','Pooja','Sid','Anya','Varun'];
var box=document.createElement('div');box.className='aggr';box.setAttribute('aria-hidden','true');var cap=document.createElement('p');cap.className='agg-cap';cap.textContent='Names in. One number out.';
var chips=N.map(function(n,i){var s=document.createElement('span');s.textContent=n;box.appendChild(s);return {el:s,x:Math.random(),y:Math.random(),r:(Math.random()-.5)*30,d:Math.random()*.25};});
body.appendChild(box);body.appendChild(cap);em.classList.add('agg-wait');var done=false;
function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
var P=0;function upd(){var p=P;
var bw=body.clientWidth,bh=body.clientHeight,sr=stats.getBoundingClientRect(),br=body.getBoundingClientRect(),tx=sr.left-br.left+sr.width*0.15,ty=sr.top-br.top+sr.height*0.3;
chips.forEach(function(c){var q=ease(Math.max(0,Math.min(1,(p-c.d)/(1-c.d)))),sx=c.x*(bw-70),sy=c.y*(bh-30),x=sx+(tx-sx)*q,y=sy+(ty-sy)*q;
c.el.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px) rotate('+(c.r*(1-q)).toFixed(1)+'deg) scale('+(1-q*0.7).toFixed(2)+')';
c.el.style.filter='blur('+(q*6).toFixed(1)+'px)';c.el.style.opacity=(q>0.92?0:1-q*0.4).toFixed(2);c.el.style.color=q>.45?'transparent':'';});
cap.style.opacity=p>0.05&&p<0.97?1:0;var fin=p>0.93;em.classList.toggle('agg-wait',!fin);if(fin&&!done){done=true;stats.querySelectorAll('strong').forEach(function(s){s.classList.remove('bump');void s.offsetWidth;s.classList.add('bump');});}if(!fin)done=false;}
var rb=document.createElement('button');rb.type='button';rb.className='agg-replay';rb.textContent='↺ Replay';rb.hidden=true;body.appendChild(rb);
var playing=false;function play(){if(playing)return;playing=true;rb.hidden=true;var t0=null,D=2600;P=0;upd();
setTimeout(function(){requestAnimationFrame(function step(t){if(t0===null)t0=t;P=Math.min(1,(t-t0)/D);upd();if(P<1)requestAnimationFrame(step);else{playing=false;rb.hidden=false;}});},500);}
rb.addEventListener('click',play);upd();
if('IntersectionObserver' in window)new IntersectionObserver(function(es){if(es[0].isIntersecting&&!playing&&P<1)play();},{threshold:0.7}).observe(em);else{P=1;upd();}})();

/* Chapter-by-chapter: each section is one screen, the page settles on it like turning a page. */
(function(){if(!document.body.classList.contains('home'))return;var secs=[].slice.call(document.querySelectorAll('main > section')).filter(function(x){return !x.classList.contains('footnotes');});
var c=document.createElement('div');c.className='chap';c.setAttribute('aria-hidden','true');c.innerHTML='<b id="chap-n">01</b><i></i><span>'+('0'+secs.length).slice(-2)+'</span>';document.body.appendChild(c);var n=c.querySelector('#chap-n'),cur=-1;
function upd(){var mid=innerHeight*0.5,k=0;secs.forEach(function(x,i){if(x.getBoundingClientRect().top<mid)k=i;});if(k!==cur){cur=k;n.textContent=('0'+(k+1)).slice(-2);n.classList.remove('flip');void n.offsetWidth;n.classList.add('flip');secs.forEach(function(x,i){x.classList.toggle('is-current',i===k);});}}
addEventListener('scroll',upd,{passive:true});upd();
/* Keyboard: arrows / PageDown move one chapter, like a deck */
addEventListener('keydown',function(e){if(e.target.closest('input,textarea,select,[contenteditable]')||!document.getElementById('asksheet').hidden)return;var d=(e.key==='ArrowDown'||e.key==='PageDown')?1:(e.key==='ArrowUp'||e.key==='PageUp')?-1:0;if(!d)return;
 var t=secs[Math.max(0,Math.min(secs.length-1,cur+d))];var r=t.getBoundingClientRect();if(d===1&&secs[cur].getBoundingClientRect().bottom>innerHeight+40&&e.key==='ArrowDown')return;e.preventDefault();t.scrollIntoView({behavior:'smooth'});});})();

/* Breath interludes: scroll through a full inhale between chapters */
(function(){var B=[].slice.call(document.querySelectorAll('.breath'));if(!B.length)return;
B.forEach(function(b){b.style.setProperty('--bc',b.dataset.col);});
function upd(){var vh=innerHeight,cover=Math.hypot(innerWidth,vh)/200*1.05;B.forEach(function(b){var r=b.getBoundingClientRect(),p=Math.max(0,Math.min(1,-r.top/(r.height-vh)));if(r.bottom<0||r.top>vh)return;
 var inh=Math.min(1,p/0.75),e=inh<.5?2*inh*inh:1-Math.pow(-2*inh+2,2)/2;b.style.setProperty('--s',(0.15+e*(cover-0.15)).toFixed(3));
 b.style.setProperty('--a',Math.max(0,1-p/0.55).toFixed(2));b.style.setProperty('--sp',e.toFixed(2));b.style.setProperty('--b',Math.max(0,Math.min(1,(p-0.55)/0.25)).toFixed(2));});}
addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);upd();})();
