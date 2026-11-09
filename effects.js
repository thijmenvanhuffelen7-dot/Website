(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var doc = document.documentElement;
  var nl = doc.lang === 'nl';
  function t(en, nlText) { return nl ? nlText : en; }

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
    panel.innerHTML = nav.innerHTML + '<a href="contact.html">Contact</a>';
    /* on narrow phones the language switch moves from the bar into this menu */
    var lang = document.querySelector('.top .lang');
    if (lang) { var lc = lang.cloneNode(true); lc.classList.add('in-menu'); panel.appendChild(lc); }
    document.body.appendChild(panel);
    function setOpen(o) { btn.setAttribute('aria-expanded', o); btn.setAttribute('aria-label', o ? t('Close menu', 'Menu sluiten') : t('Open menu', 'Menu openen')); panel.classList.toggle('open', o); }
    btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
    panel.addEventListener('click', function (e) { if (e.target.tagName === 'A') setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  /* Mobile: a call-to-action bar after the hero, hidden near the page's own call-to-action */
  if (!/contact\.html$/.test(location.pathname)) {
    var bar = document.createElement('div');
    bar.className = 'mobile-cta';
    bar.innerHTML = '<a class="button" href="https://cal.com/thijmen-scalvia/30min" target="_blank" rel="noopener">' + t('Book a free strategy call', 'Plan een gratis strategiegesprek') + '</a>';
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
    /* keep highlighted words (span.hl) highlighted after the split */
    var parts = [];
    h1.childNodes.forEach(function (n) {
      if (n.nodeName === 'BR') { parts.push({ br: true }); return; }
      var hl = n.nodeType === 1 && n.classList.contains('hl');
      n.textContent.trim().split(/\s+/).forEach(function (w) { if (w) parts.push({ w: w, hl: hl }); });
    });
    h1.innerHTML = parts.map(function (p, i) {
      if (p.br) return '<br>';
      return '<span class="w' + (p.hl ? ' hl' : '') + '"><span style="animation-delay:' + (i * 55) + 'ms">' + p.w + '</span></span>';
    }).join(' ');
    h1.classList.add('split');
  }

  /* Email reel: duplicate the cards once so the strip can loop without a gap */
  var reel = document.getElementById('reel');
  if (reel) {
    Array.prototype.slice.call(reel.children).forEach(function (c) {
      var d = c.cloneNode(true); d.setAttribute('aria-hidden', 'true'); reel.appendChild(d);
    });
    reel.classList.add('run');
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
    (list.closest('.tools') || list.parentElement).classList.add('marquee');
  }

  /* Count-up for the big figures */
  function countUp(el) {
    if (el.querySelector('.todo')) return; /* placeholder text, not a number */
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
    '.shot', '.mail', '.faq', '.calc-in', '.calc-out', '.pr', '.case', '.b-card', '.market .stat', '.quote', '.close-card', '.phase', '.me > *', '.reel .head', '.book', '.dl', '.about-grid > *', '.legal'
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
  var items = document.documentElement.lang === 'nl' ? [
    ['Creatives', 'Nieuwe hooks in test'],
    ['Opschalen', 'Winnende ad krijgt meer budget'],
    ['Testen', 'Zwakke ad uitgezet'],
    ['Rapportage', 'Weekoverzicht verstuurd'],
    ['UGC', 'Nieuwe UGC-video klaar voor test'],
    ['TikTok', 'Nieuwe campagne live'],
    ['Meta', 'Doelgroep bijgesteld'],
    ['Creatives', 'Variant met nieuwe opening gemaakt']
  ] : [
    ['Creatives', 'New hooks in test'],
    ['Scaling', 'Winning ad gets more budget'],
    ['Testing', 'Weak ad switched off'],
    ['Reporting', 'Weekly overview sent'],
    ['UGC', 'New UGC video ready to test'],
    ['TikTok', 'New campaign live'],
    ['Meta', 'Audience adjusted'],
    ['Creatives', 'Variant with a new opening made']
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

/* Hero envelope: click the email to read the whole campaign */
(function () {
  var modal = document.getElementById('mail-modal');
  if (!modal || typeof modal.showModal !== 'function') return;
  var opener = null;
  document.querySelectorAll('[data-open-mail]').forEach(function (b) {
    b.addEventListener('click', function () { opener = b; modal.showModal(); modal.querySelector('.scroll').scrollTop = 0; });
  });
  modal.querySelector('[data-close-mail]').addEventListener('click', function () { modal.close(); });
  /* click on the dark backdrop closes it too */
  modal.addEventListener('click', function (e) {
    if (e.target !== modal) return;
    var r = modal.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) modal.close();
  });
  modal.addEventListener('close', function () { if (opener) opener.focus(); });
})();
