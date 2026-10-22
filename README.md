# Scalvio – website

Statische one-page website voor scalvio.nl (HTML/CSS/JS, geen build-stap nodig). Upload de map naar elke webhost (bijv. Netlify, Vercel, Cloudflare Pages of je eigen hosting).

## Placeholders invullen
Zoek in de bestanden naar `PLACEHOLDER`. Op de pagina zijn ze zichtbaar met een groene stippelrand.

| Wat | Waar |
| --- | --- |
| Review(s), naam, bedrijf, foto/logo | `index.html` → sectie `#reviews` (kopieer een `review-slide` voor extra reviews; de slider verschijnt automatisch) |
| Foto en persoonlijke tekst | `index.html` → sectie `#over` |
| Contractvoorwaarden (FAQ) | `index.html` → laatste FAQ-vraag |
| E-mailadres en WhatsApp-nummer | `index.html` → sectie `#contact` |
| Reactietermijn in bedankmelding | `index.html` → `#form-success` |
| Social links, KvK-nummer | `index.html` → footer (en footer van `privacy.html` / `voorwaarden.html`) |
| Privacyverklaring / voorwaarden | `privacy.html`, `voorwaarden.html` |
| Deelafbeelding (og:image) | `index.html` → `<head>` |

## Formulier koppelen
Het formulier verstuurt pas echt iets als je in `index.html` bij `<form id="lead-form" data-endpoint="">` de URL van een formulierdienst invult (bijv. Formspree). Zonder endpoint wordt alleen de bedankmelding getoond.

Een agenda-widget (bijv. Calendly) kun je plakken in `<div id="calendar-slot">` in de bedankmelding.

## Meta Pixel en Google Analytics
Vul je ID's in bovenaan `assets/js/consent.js`. Ze worden alleen geladen nadat een bezoeker op "Accepteren" klikt in de cookiebanner. Na een succesvolle formulierinzending wordt een `Lead`- / `generate_lead`-event verstuurd.

## Lokaal bekijken
```
python3 -m http.server 8000
```
en open http://localhost:8000.
