(function () {
  var EMAIL = 'thijmenvanhuffelen7@gmail.com';
  var nl = document.documentElement.lang === 'nl';
  function t(en, nlText) { return nl ? nlText : en; }
  var eur = function (n) { return '€' + Math.round(n).toLocaleString(nl ? 'nl-NL' : 'en-GB'); };
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
      document.getElementById('c-uren-out').textContent = uren + t(' hours', ' uur');
      var sit, schat;
      if (mode === 'omzet') {
        var nu = +(checked('c-nu') || { value: 0.04 }).value;
        var lo = round(Math.max(0, omzet * (0.20 - nu)));
        var hi = round(Math.max(0, omzet * (0.30 - nu)));
        label.textContent = t('Extra revenue from email per month', 'Extra omzet uit e-mail per maand');
        res.textContent = eur(lo) + ' – ' + eur(hi);
        year.textContent = t('That is ', 'Dat is ') + eur(lo * 12) + ' – ' + eur(hi * 12) + t(' per year.', ' per jaar.');
        note.textContent = t('An estimate based on 20 to 30% of your revenue coming from email. The real result depends on your product, your customer base and your traffic.', 'Een schatting op basis van 20 tot 30% van je omzet uit e-mail. Het echte resultaat hangt af van je product, je klantenbestand en je bezoekers.');
        sit = checked('c-nu'); schat = res.textContent + t(' extra revenue per month', ' extra omzet per maand');
        document.getElementById('h-invoer').value = eur(omzet) + t(' revenue per month', ' omzet per maand');
      } else {
        var uur = +(checked('c-uur') || { value: 40 }).value;
        var perMaand = uren * 52 / 12;
        var hLo = Math.round(perMaand * 0.4), hHi = Math.round(perMaand * 0.6);
        label.textContent = t('Hours you get back per month', 'Uren die je per maand terugkrijgt');
        res.textContent = hLo + ' – ' + hHi + t(' hours', ' uur');
        year.textContent = t('That is ', 'Dat is ') + eur(round(hLo * uur * 12)) + ' – ' + eur(round(hHi * uur * 12)) + t(' per year in working time.', ' per jaar aan werktijd.');
        note.textContent = t('An estimate based on 40 to 60% of repetitive work being automated. What is possible depends on your processes and tools.', 'Een schatting op basis van 40 tot 60% van het terugkerende werk dat geautomatiseerd wordt. Wat kan, hangt af van je processen en tools.');
        sit = checked('c-uur'); schat = res.textContent + t(' back per month', ' terug per maand');
        document.getElementById('h-invoer').value = uren + t(' hours of manual work per week', ' uur handwerk per week');
      }
      document.getElementById('h-berekening').value = mode === 'omzet' ? t('More revenue', 'Meer omzet') : t('Less manual work', 'Minder handwerk');
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
      var label = btn.textContent;
      btn.disabled = true; btn.textContent = t('Sending…', 'Versturen…');
      var body = new URLSearchParams(new FormData(form)).toString();
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
        .then(function (r) { if (!r.ok) throw new Error(r.status); })
        .then(function () {
          form.querySelectorAll('input:not([type="hidden"]),textarea').forEach(function (i) { i.disabled = true; });
          btn.hidden = true;
          msg.className = 'form-msg ok';
          msg.textContent = t('Thank you! Your request is in. Don\'t want to wait? Pick a time right away at cal.com/thijmen-scalvia.', 'Bedankt! Je aanvraag is binnen. Geen zin om te wachten? Kies meteen een tijd via cal.com/thijmen-scalvia.');
          msg.hidden = false;
        })
        .catch(function () {
          btn.disabled = false; btn.textContent = label;
          msg.className = 'form-msg err';
          msg.textContent = t('Sending failed. Email your details to ', 'Versturen is mislukt. Mail je gegevens naar ') + EMAIL + t(' and I will get back to you.', ', dan neem ik contact met je op.');
          msg.hidden = false;
        });
    });
  });
})();
