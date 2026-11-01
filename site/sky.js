/* Light by the visitor's own clock: sunlight by day, a sunset in the evening, moonlight at night. Decorative only. */
(function(){var q=(location.search.match(/[?&]light=(day|evening|night)/)||[])[1],d=new Date(),h=d.getHours()+d.getMinutes()/60;
var k=q||(h>=6&&h<17?'day':h>=17&&h<19.5?'evening':'night');document.documentElement.setAttribute('data-light',k);
var go=function(){if(document.querySelector('.sky'))return;var s=document.createElement('div');s.className='sky';s.setAttribute('aria-hidden','true');s.innerHTML='<i></i><b></b>';document.body.insertBefore(s,document.body.firstChild);};
if(document.body)go();else document.addEventListener('DOMContentLoaded',go);})();
