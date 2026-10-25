(function () {
  var nav = document.getElementById('nav');
  addEventListener('scroll', function () { nav.classList.toggle('scrolled', scrollY > 8); }, { passive: true });

  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else items.forEach(function (el) { el.classList.add('in'); });

  // Privacy demo. Sample data: weekly active % per team over a six-week pilot.
  var list = document.getElementById('teams');
  if (!list) return;
  var COMPANY = 103;
  var teams = [
    { name: 'Engineering', size: 38, pct: [71, 68, 60, 52, 54, 51] },
    { name: 'Sales', size: 21, pct: [62, 57, 48, 43, 45, 43] },
    { name: 'Customer Success', size: 14, pct: [79, 71, 64, 57, 64, 57] },
    { name: 'Product', size: 12, pct: [75, 75, 67, 58, 58, 58] },
    { name: 'Operations', size: 11, hidden: 'pair' },
    { name: 'Finance', size: 7, hidden: 'small' }
  ];
  var company = [69, 66, 58, 50, 52, 49];
  var TIPS = {
    small: 'Teams under 10 are hidden so no one can be identified.',
    pair: 'Also hidden: with only one small team, showing this one would let anyone work out the small team by subtraction.'
  };
  var lock = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg>';

  list.innerHTML = teams.map(function (t, i) {
    var right = t.hidden
      ? '<span class="pct"><button type="button" class="lock-tip" aria-expanded="false">' + lock + 'Hidden<span class="tip" role="tooltip">' + TIPS[t.hidden] + '</span></button></span>'
      : '<span class="pct" data-i="' + i + '">0%</span>';
    return '<li class="team' + (t.hidden ? ' hidden' : '') + '"><span class="team-name">' + t.name + '<small>' + (t.hidden === 'small' ? 'Under 10 people' : t.size + ' people') + '</small></span>' +
      '<span class="bar"><i data-i="' + i + '"></i></span>' + right + '</li>';
  }).join('');

  var weeks = document.getElementById('weeks'), week = 5;
  weeks.innerHTML = company.map(function (_, w) {
    return '<button type="button" aria-pressed="' + (w === week) + '" aria-label="Week ' + (w + 1) + '">W' + (w + 1) + '</button>';
  }).join('');

  function render() {
    teams.forEach(function (t, i) {
      if (t.hidden) return;
      list.querySelector('i[data-i="' + i + '"]').style.width = t.pct[week] + '%';
      list.querySelector('.pct[data-i="' + i + '"]').textContent = t.pct[week] + '%';
    });
    document.getElementById('total-pct').textContent = company[week] + '%';
    document.getElementById('total-txt').textContent = Math.round(company[week] * COMPANY / 100) + ' of ' + COMPANY + ' people active in week ' + (week + 1);
    weeks.querySelectorAll('button').forEach(function (b, w) { b.setAttribute('aria-pressed', w === week); });
  }

  weeks.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    week = Array.prototype.indexOf.call(weeks.children, b); render();
  });

  list.addEventListener('click', function (e) {
    var b = e.target.closest('.lock-tip'); if (!b) return;
    var open = b.getAttribute('aria-expanded') !== 'true';
    list.querySelectorAll('.lock-tip').forEach(function (x) { x.setAttribute('aria-expanded', 'false'); });
    b.setAttribute('aria-expanded', open);
  });

  var dash = document.getElementById('dash'), sw = document.getElementById('try-ind'), panel = document.getElementById('locked');
  function setLocked(on) {
    dash.classList.toggle('locked', on);
    sw.setAttribute('aria-checked', on);
    panel.setAttribute('aria-hidden', !on);
    if (on) document.getElementById('unlock-back').focus({ preventScroll: true });
  }
  sw.addEventListener('click', function () { setLocked(sw.getAttribute('aria-checked') !== 'true'); });
  document.getElementById('unlock-back').addEventListener('click', function () { setLocked(false); sw.focus(); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && dash.classList.contains('locked')) { setLocked(false); sw.focus(); } });

  render();
})();
