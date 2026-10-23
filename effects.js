(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var doc = document.documentElement;

  /* Nav: border and shadow once the page scrolls */
  var top = document.querySelector('.top');
  function onScroll() { if (top) top.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var btn = document.querySelector('.menu-btn'), nav = document.querySelector('.menu');
  if (btn && nav) {
    var panel = document.createElement('nav');
    panel.className = 'm-menu'; panel.id = 'm-menu'; panel.setAttribute('aria-label', 'Menu');
    panel.innerHTML = nav.innerHTML + '<a href="case-studies.html">Case studies</a><a href="contact.html">Contact</a>';
    document.body.appendChild(panel);
    function setOpen(o) { btn.setAttribute('aria-expanded', o); btn.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); panel.classList.toggle('open', o); }
    btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
    panel.addEventListener('click', function (e) { if (e.target.tagName === 'A') setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  /* Mobile: a call-to-action bar after the hero, hidden near the page's own call-to-action */
  if (!/contact\.html$/.test(location.pathname)) {
    var bar = document.createElement('div');
    bar.className = 'mobile-cta';
    bar.innerHTML = '<a class="button" href="https://cal.com/thijmen-scalvia/30min" target="_blank" rel="noopener">Book a free audit</a>';
    document.body.appendChild(bar);
    var closeEl = document.querySelector('.close, .foot');
    function barCheck() {
      var past = window.scrollY > window.innerHeight * 0.6;
      var nearEnd = closeEl && closeEl.getBoundingClientRect().top < window.innerHeight;
      bar.classList.toggle('show', past && !nearEnd);
    }
    window.addEventListener('scroll', barCheck, { passive: true });
    barCheck();
  }

  if (reduce) return;
  doc.classList.add('fx');

  /* Hero headline: words rise in one by one */
  var h1 = document.querySelector('.hero h1, .page-head h1');
  if (h1 && !h1.querySelector('.w')) {
    var words = h1.textContent.trim().split(/\s+/);
    h1.innerHTML = words.map(function (w, i) {
      return '<span class="w"><span style="animation-delay:' + (i * 55) + 'ms">' + w + '</span></span>';
    }).join(' ');
    h1.classList.add('split');
  }

  /* Hero proofs: hover lift after the fan-out, and gentle parallax with the mouse */
  var proofs = document.getElementById('proofs');
  if (proofs) {
    setTimeout(function () { proofs.classList.add('ready'); }, 1300);
    var hero = document.querySelector('.hero');
    if (hero && window.matchMedia('(hover: hover)').matches) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        proofs.style.setProperty('--mx', x.toFixed(3));
        proofs.style.setProperty('--my', y.toFixed(3));
      });
      hero.addEventListener('mouseleave', function () {
        proofs.style.setProperty('--mx', 0); proofs.style.setProperty('--my', 0);
      });
    }
  }

  /* Tools strip: endless slow scroll */
  var list = document.querySelector('.tools ul');
  if (list) {
    var html = list.innerHTML;
    list.innerHTML = html + html.replace(/<li>/g, '<li aria-hidden="true">') + html.replace(/<li>/g, '<li aria-hidden="true">');
    list.parentElement.classList.add('marquee');
  }

  /* Count-up for the big figures */
  function countUp(el) {
    var txt = el.textContent.trim();
    var m = txt.match(/^([^\d]*)([\d.]+)(.*)$/);
    if (!m) return;
    var pre = m[1], digits = m[2], post = m[3];
    var target = parseInt(digits.replace(/\./g, ''), 10);
    var dotted = digits.indexOf('.') > -1;
    var t0 = null, dur = 1400;
    function fmt(n) { var s = String(n); return dotted ? s.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : s; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + fmt(Math.round(target * e)) + post;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* Chat widget: messages appear one after another */
  function playChat(chat) {
    var msgs = chat.querySelectorAll('.msg');
    msgs.forEach(function (m, i) { setTimeout(function () { m.classList.add('show'); }, 250 + i * 650); });
  }

  /* Status pills in the widgets switch on one by one */
  function playRows(ui) {
    ui.querySelectorAll('.st').forEach(function (s, i) { setTimeout(function () { s.classList.add('on'); }, 200 + i * 220); });
  }

  /* Reveal on scroll, only for things below the fold, so the first screen is complete at rest */
  var targets = document.querySelectorAll([
    '.sec .intro', '.sec h2:not(.intro h2)', '.area', '.fig', '.acc', '.steps li', '.price', '.price-group',
    '.shot', '.mail', '.faq', '.calc-in', '.calc-out', '.pr', '.case', '.b-card', '.market .stat', '.quote', '.close .inner > *', '.book', '.dl', '.about-grid > *', '.legal'
  ].join(','));
  var fold = window.innerHeight * 0.92;
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      el.classList.add('in');
      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' }) : null;

  targets.forEach(function (el) {
    var idx = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
    el.style.setProperty('--d', (idx % 4) * 90 + 'ms');
    if (io && el.getBoundingClientRect().top > fold) { el.classList.add('rv'); io.observe(el); }
  });

  /* One-off plays when widgets or figures come into view */
  var plays = io ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      if (el.classList.contains('chat')) playChat(el);
      else if (el.classList.contains('ui')) playRows(el);
      else countUp(el);
      plays.unobserve(el);
    });
  }, { threshold: 0.4 }) : null;

  document.querySelectorAll('.chat').forEach(function (c) { c.classList.add('pending'); plays ? plays.observe(c) : playChat(c); });
  document.querySelectorAll('.ui').forEach(function (u) { if (!u.querySelector('.chat')) { u.classList.add('pending'); plays ? plays.observe(u) : playRows(u); } });
  document.querySelectorAll('.fig b, .pr-num, .stat b[data-count]').forEach(function (b) { plays ? plays.observe(b) : null; });
})();

/* Hero feed: a new task appears every few seconds */
(function () {
  var feed = document.querySelector('#feed ul');
  if (!feed || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  var items = [
    ['Email', 'Welcome email to new subscriber'],
    ['Customer service', 'Address change processed'],
    ['Bookkeeping', 'Invoice sent to your bookkeeping'],
    ['Returns', 'Return label emailed automatically'],
    ['Email', 'Abandoned cart email sent'],
    ['Orders', 'Delay reported via WhatsApp'],
    ['Reviews', 'Review request sent'],
    ['Inventory', 'Bestseller running low, alert in Slack'],
    ['Email', 'Win-back email to past customer']
  ];
  var i = 0;
  setInterval(function () {
    if (document.hidden) return;
    var it = items[i++ % items.length];
    var li = document.createElement('li');
    li.className = 'enter';
    li.innerHTML = '<b>' + it[0] + '</b>' + it[1];
    feed.insertBefore(li, feed.firstChild);
    while (feed.children.length > 4) feed.removeChild(feed.lastChild);
  }, 2800);
})();
