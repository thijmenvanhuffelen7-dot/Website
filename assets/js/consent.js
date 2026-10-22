/*
  Scalvio – cookiebanner en tracking

  Werking (volgens de Nederlandse Telecommunicatiewet / AVG):
  - Er worden GEEN tracking-scripts geladen voordat de bezoeker op "Accepteren" klikt.
  - "Weigeren" is net zo makkelijk als "Accepteren" (zelfde knopstijl, zelfde plek).
  - De keuze wordt 6 maanden onthouden en kan via "Cookie-instellingen" in de footer worden gewijzigd.

  TRACKING TOEVOEGEN:
  Vul hieronder je ID's in. Laat leeg om niets te laden.
*/
(function () {
  'use strict';

  var CONFIG = {
    GA_MEASUREMENT_ID: '', // PLACEHOLDER: bijv. 'G-XXXXXXXXXX'
    META_PIXEL_ID: '',     // PLACEHOLDER: bijv. '123456789012345'
    STORAGE_KEY: 'scalvio-consent',
    MAX_AGE_DAYS: 182
  };

  var loaded = false;

  function readConsent() {
    try {
      var raw = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      var age = (Date.now() - data.time) / 86400000;
      if (age > CONFIG.MAX_AGE_DAYS) return null;
      return data.value;
    } catch (e) { return null; }
  }

  function saveConsent(value) {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify({ value: value, time: Date.now() }));
    } catch (e) { /* opslag niet beschikbaar: keuze geldt alleen voor deze pagina */ }
  }

  function loadScript(src) {
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  }

  function loadGoogleAnalytics(id) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id, { anonymize_ip: true });
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id));
  }

  function loadMetaPixel(id) {
    /* Officiële Meta Pixel basiscode */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', id);
    window.fbq('track', 'PageView');
  }

  function loadTracking() {
    if (loaded) return;
    loaded = true;
    if (CONFIG.GA_MEASUREMENT_ID) loadGoogleAnalytics(CONFIG.GA_MEASUREMENT_ID);
    if (CONFIG.META_PIXEL_ID) loadMetaPixel(CONFIG.META_PIXEL_ID);
  }

  function init() {
    var banner = document.getElementById('cookie-banner');
    var consent = readConsent();

    if (consent === 'accepted') loadTracking();
    if (banner && !consent) banner.hidden = false;

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-consent]');
      if (btn) {
        var value = btn.getAttribute('data-consent') === 'accept' ? 'accepted' : 'rejected';
        var previous = readConsent();
        saveConsent(value);
        if (banner) banner.hidden = true;
        if (value === 'accepted') loadTracking();
        // Toestemming ingetrokken nadat scripts al geladen waren: herladen om ze te stoppen
        else if (previous === 'accepted' && loaded) window.location.reload();
        return;
      }
      if (e.target.closest('[data-cookie-settings]') && banner) {
        banner.hidden = false;
        var first = banner.querySelector('button');
        if (first) first.focus();
      }
    });
  }

  // Publieke helpers voor main.js
  window.ScalvioConsent = {
    trackLead: function () {
      if (readConsent() !== 'accepted') return;
      if (window.fbq) window.fbq('track', 'Lead');
      if (window.gtag) window.gtag('event', 'generate_lead');
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
