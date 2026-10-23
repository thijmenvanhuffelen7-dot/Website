(function () {
  var EMAIL = 'thijmenvanhuffelen7@gmail.com';
  var eur = function (n) { return '€' + Math.round(n).toLocaleString('en-GB'); };
  var round = function (n) { return n >= 10000 ? Math.round(n / 500) * 500 : Math.round(n / 100) * 100; };

  /* ---------- calculator (two tabs: revenue and time) ---------- */
  var range = document.getElementById('c-omzet');
  if (range) {
    var hours = document.getElementById('c-uren');
    var res = document.getElementById('c-res');
    var year = document.getElementById('c-year');
    var label = document.getElementById('c-label');
    var note = document.getElementById('c-note');
    var mode = 'omzet';
    function fill(r) { r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100) + '%'); }
    function checked(name) { return document.querySelector('input[name="' + name + '"]:checked'); }
    function calc() {
      fill(range); fill(hours);
      var omzet = +range.value, uren = +hours.value;
      document.getElementById('c-omzet-out').textContent = eur(omzet);
      document.getElementById('c-uren-out').textContent = uren + ' hours';
      var sit, schat;
      if (mode === 'omzet') {
        var nu = +(checked('c-nu') || { value: 0.04 }).value;
        var lo = round(Math.max(0, omzet * (0.20 - nu)));
        var hi = round(Math.max(0, omzet * (0.30 - nu)));
        label.textContent = 'Extra revenue from email per month';
        res.textContent = eur(lo) + ' – ' + eur(hi);
        year.textContent = 'That is ' + eur(lo * 12) + ' – ' + eur(hi * 12) + ' per year.';
        note.textContent = 'An estimate based on 20 to 30% of your revenue coming from email. The real result depends on your product, your customer base and your traffic.';
        sit = checked('c-nu'); schat = res.textContent + ' extra revenue per month';
        document.getElementById('h-invoer').value = eur(omzet) + ' revenue per month';
      } else {
        var uur = +(checked('c-uur') || { value: 40 }).value;
        var perMaand = uren * 52 / 12;
        var hLo = Math.round(perMaand * 0.4), hHi = Math.round(perMaand * 0.6);
        label.textContent = 'Hours you get back per month';
        res.textContent = hLo + ' – ' + hHi + ' hours';
        year.textContent = 'That is ' + eur(round(hLo * uur * 12)) + ' – ' + eur(round(hHi * uur * 12)) + ' per year in working time.';
        note.textContent = 'An estimate based on 40 to 60% of repetitive work being automated. What is possible depends on your processes and tools.';
        sit = checked('c-uur'); schat = res.textContent + ' back per month';
        document.getElementById('h-invoer').value = uren + ' hours of manual work per week';
      }
      document.getElementById('h-berekening').value = mode === 'omzet' ? 'More revenue' : 'Less manual work';
      document.getElementById('h-situatie').value = sit ? sit.nextElementSibling.textContent : '';
      document.getElementById('h-schatting').value = schat;
    }
    [range, hours].forEach(function (r) { r.addEventListener('input', calc); });
    document.querySelectorAll('input[name="c-nu"], input[name="c-uur"]').forEach(function (r) { r.addEventListener('change', calc); });

    var tabs = document.querySelectorAll('.tabs [role="tab"]');
    function select(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      mode = tab.id === 't-tijd' ? 'tijd' : 'omzet';
      calc();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
          n.focus(); select(n);
        }
      });
    });
    calc();
  }

  /* ---------- forms: sent to Netlify Forms, which emails each submission ---------- */
  document.querySelectorAll('form.lead').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('.form-msg');
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true; btn.textContent = 'Sending…';
      var body = new URLSearchParams(new FormData(form)).toString();
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
        .then(function (r) { if (!r.ok) throw new Error(r.status); })
        .then(function () {
          form.querySelectorAll('input:not([type="hidden"]),textarea').forEach(function (i) { i.disabled = true; });
          btn.hidden = true;
          msg.className = 'form-msg ok';
          msg.textContent = 'Thank you! Your request is in. Don\'t want to wait? Pick a time right away at cal.com/thijmen-scalvia.';
          msg.hidden = false;
        })
        .catch(function () {
          btn.disabled = false; btn.textContent = 'Request the free audit';
          msg.className = 'form-msg err';
          msg.textContent = 'Sending failed. Email your details to ' + EMAIL + ' and I will get back to you.';
          msg.hidden = false;
        });
    });
  });
})();
