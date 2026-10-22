/* Scalvio – interactie: menu, scroll-animaties, reviews-slider, formulier */
(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: schaduw bij scrollen ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobiel menu ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('main-nav');

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
    nav.classList.toggle('is-open', open);
    if (header) header.classList.toggle('menu-open', open);
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        toggle.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
    });
    window.matchMedia('(min-width: 861px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------- Actieve navigatielink ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.main-nav a[href^="#"]'));
  if ('IntersectionObserver' in window && navLinks.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          var active = a.getAttribute('href') === '#' + entry.target.id;
          a.classList.toggle('is-active', active);
          if (active) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) sectionObserver.observe(target);
    });
  }

  /* ---------- Na ankerklik: focus naar sectie (toetsenbord/screenreader) ---------- */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href');
    if (id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    setTimeout(function () { target.focus({ preventScroll: true }); }, reduceMotion ? 0 : 500);
  });

  /* ---------- Scroll-animaties ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    // kleine vertraging voor elementen in dezelfde rij
    document.querySelectorAll('.grid, .timeline, .faq-list').forEach(function (group) {
      Array.prototype.forEach.call(group.querySelectorAll(':scope > .reveal'), function (el, i) {
        el.style.transitionDelay = (i * 80) + 'ms';
      });
    });
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Glow volgt muis op kaarten ---------- */
  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- Reviews-slider (activeert automatisch bij 2+ reviews) ---------- */
  document.querySelectorAll('[data-slider]').forEach(function (slider) {
    var slides = slider.querySelectorAll('.review-slide');
    if (slides.length < 2) return;

    var controls = slider.querySelector('.slider-controls');
    var dotsWrap = slider.querySelector('.slider-dots');
    var current = 0;
    var dots = [];

    controls.hidden = false;
    slides.forEach(function (slide, i) {
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'review');
      slide.setAttribute('aria-label', (i + 1) + ' van ' + slides.length);
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Review ' + (i + 1));
      dot.addEventListener('click', function () { go(i); });
      dotsWrap.appendChild(dot);
      dots.push(dot);
    });

    function go(i) {
      current = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) {
        var active = n === current;
        s.setAttribute('aria-hidden', String(!active));
        s.querySelectorAll('a, button').forEach(function (el) { el.tabIndex = active ? 0 : -1; });
      });
      dots.forEach(function (d, n) {
        d.setAttribute('aria-selected', String(n === current));
        d.tabIndex = n === current ? 0 : -1;
      });
    }

    slider.querySelector('[data-prev]').addEventListener('click', function () { go(current - 1); });
    slider.querySelector('[data-next]').addEventListener('click', function () { go(current + 1); });
    slider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') go(current - 1);
      if (e.key === 'ArrowRight') go(current + 1);
    });

    // swipen op mobiel
    var startX = null;
    var track = slider.querySelector('.review-track');
    track.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
      startX = null;
    });

    go(0);
  });

  /* ---------- Placeholder-links niet laten springen ---------- */
  document.querySelectorAll('[data-placeholder-link]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (a.getAttribute('href') === '#') e.preventDefault();
    });
  });

  /* ---------- Contactformulier ---------- */
  var form = document.getElementById('lead-form');
  var success = document.getElementById('form-success');

  if (form) {
    var messages = {
      naam: 'Vul je naam in.',
      bedrijf: 'Vul je bedrijfsnaam in.',
      email: 'Vul een geldig e-mailadres in.',
      telefoon: 'Vul een geldig telefoonnummer in.',
      website: 'Vul je website of webshop in.',
      budget: 'Kies je maandelijkse advertentiebudget.',
      privacy: 'Ga akkoord met de privacyverklaring om verder te gaan.'
    };

    function validateField(input) {
      var field = input.closest('.field');
      var err = document.getElementById(input.id + '-err');
      var value = (input.value || '').trim();
      var ok = true;

      if (input.type === 'checkbox') ok = input.checked;
      else if (input.required && !value) ok = false;
      else if (input.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
      else if (input.type === 'tel') ok = /^[+()\d\s-]{8,}$/.test(value);

      if (field) field.classList.toggle('has-error', !ok);
      input.setAttribute('aria-invalid', String(!ok));
      if (err) {
        err.textContent = ok ? '' : (messages[input.name] || 'Dit veld is verplicht.');
        if (!ok) input.setAttribute('aria-describedby', err.id);
      }
      return ok;
    }

    var requiredInputs = form.querySelectorAll('[required]');
    requiredInputs.forEach(function (input) {
      var evt = (input.type === 'checkbox' || input.tagName === 'SELECT') ? 'change' : 'blur';
      input.addEventListener(evt, function () { validateField(input); });
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid') === 'true') validateField(input);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form-status');
      status.textContent = '';

      var firstInvalid = null;
      requiredInputs.forEach(function (input) {
        if (!validateField(input) && !firstInvalid) firstInvalid = input;
      });
      if (firstInvalid) { firstInvalid.focus(); return; }

      // Honeypot gevuld = waarschijnlijk spam: doe alsof het gelukt is
      if (form.querySelector('[name="_gotcha"]').value) { showSuccess(); return; }

      var button = form.querySelector('button[type="submit"]');
      var label = button.querySelector('.btn-label');
      var original = label.textContent;
      button.disabled = true;
      label.textContent = 'Bezig met versturen…';

      var endpoint = form.getAttribute('data-endpoint');
      if (!endpoint) {
        // Nog geen formulierdienst gekoppeld (zie data-endpoint in index.html)
        setTimeout(showSuccess, 500);
        return;
      }

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      }).then(function (res) {
        if (!res.ok) throw new Error('Status ' + res.status);
        showSuccess();
      }).catch(function () {
        status.textContent = 'Er ging iets mis bij het versturen. Probeer het opnieuw of neem direct contact op via e-mail of WhatsApp.';
        button.disabled = false;
        label.textContent = original;
      });
    });

    function showSuccess() {
      form.hidden = true;
      success.hidden = false;
      success.focus();
      // Event voor tracking (alleen actief na cookie-toestemming, zie consent.js)
      if (window.ScalvioConsent) window.ScalvioConsent.trackLead();
    }
  }
})();
