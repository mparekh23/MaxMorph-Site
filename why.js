/* "Why MaxMorph" section: the two sliding cards (testimonials, clients).
 *
 * HOW TO ADD CONTENT
 * Add real entries to the lists below. A card stays hidden while its list is empty, and appears
 * (with auto-sliding, dots, arrows and a pause button) as soon as it has at least one entry.
 * Only add testimonials and client names that you have written permission to publish.
 *
 *   TESTIMONIALS: { quote: 'Text of the quote.', name: 'Dr. Full Name', role: 'Consultant Maxillofacial Surgeon', org: 'Hospital name' }
 *   CLIENTS:      { name: 'Hospital or clinic name', location: 'City, Country', logo: 'assets/clients/name.webp' }   // logo is optional
 */
(function () {
  'use strict';

  var TESTIMONIALS = [
  ];
  var CLIENTS = [
  ];

  var data = window.__MM_WHY_TEST || { testimonials: TESTIMONIALS, clients: CLIENTS };     // (the override is only used by automated tests)
  var INTERVAL = 6500;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function initials(name) { return (name || '').replace(/[^A-Za-z ]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase(); }

  function slideTestimonial(t) {
    var s = el('figure', 'slide slide-quote');
    s.appendChild(el('span', 'quote-mark', '“'));
    var q = el('blockquote', '', t.quote); s.appendChild(q);
    var cap = el('figcaption', '');
    cap.appendChild(el('strong', '', t.name));
    cap.appendChild(el('span', '', [t.role, t.org].filter(Boolean).join(' · ')));
    s.appendChild(cap);
    return s;
  }
  function slideClient(c) {
    var s = el('div', 'slide slide-client');
    var mark = el('div', 'client-mark');
    if (c.logo) { var i = el('img'); i.src = c.logo; i.alt = ''; i.loading = 'lazy'; i.decoding = 'async'; mark.appendChild(i); }
    else mark.appendChild(el('span', '', initials(c.name)));
    s.appendChild(mark);
    s.appendChild(el('strong', 'client-name', c.name));
    if (c.location) s.appendChild(el('span', 'client-loc', c.location));
    return s;
  }

  function build(card, items, make, noun) {
    if (!card || !items || !items.length) return;                       // nothing to show: the card stays hidden
    card.hidden = false;
    card.setAttribute('role', 'region');
    card.setAttribute('aria-roledescription', 'carousel');
    card.setAttribute('aria-label', card.querySelector('.why-label').textContent.toLowerCase());

    var viewport = el('div', 'slides'); viewport.setAttribute('aria-live', 'off');
    var slides = items.map(function (it, i) {
      var s = make(it);
      s.setAttribute('role', 'group'); s.setAttribute('aria-roledescription', 'slide'); s.setAttribute('aria-label', (i + 1) + ' of ' + items.length);
      viewport.appendChild(s); return s;
    });
    card.appendChild(viewport);

    var index = 0, timer = null, userPaused = false, hoverPaused = false, inView = true;
    var dots = [], playBtn = null;

    function show(n) {
      index = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) { var on = i === index; s.classList.toggle('is-active', on); s.setAttribute('aria-hidden', on ? 'false' : 'true'); });
      dots.forEach(function (d, i) { if (i === index) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    }
    function running() { return !still && !userPaused && !hoverPaused && inView && !document.hidden && slides.length > 1; }
    function schedule() { clearTimeout(timer); if (running()) timer = setTimeout(function () { show(index + 1); schedule(); }, INTERVAL); viewport.setAttribute('aria-live', running() ? 'off' : 'polite'); }

    if (slides.length > 1) {
      var controls = el('div', 'slider-controls');
      var prev = el('button', 'slider-btn', '←'); prev.type = 'button'; prev.setAttribute('aria-label', 'Previous ' + noun);
      var next = el('button', 'slider-btn', '→'); next.type = 'button'; next.setAttribute('aria-label', 'Next ' + noun);
      var dotWrap = el('div', 'slider-dots');
      slides.forEach(function (_, i) { var d = el('button', 'slider-dot'); d.type = 'button'; d.setAttribute('aria-label', 'Show ' + noun + ' ' + (i + 1)); d.addEventListener('click', function () { show(i); schedule(); }); dotWrap.appendChild(d); dots.push(d); });
      prev.addEventListener('click', function () { show(index - 1); schedule(); });
      next.addEventListener('click', function () { show(index + 1); schedule(); });
      controls.appendChild(prev); controls.appendChild(dotWrap); controls.appendChild(next);
      if (!still) {
        playBtn = el('button', 'slider-btn slider-play', '❚❚'); playBtn.type = 'button'; playBtn.setAttribute('aria-label', 'Pause automatic sliding');
        playBtn.addEventListener('click', function () { userPaused = !userPaused; playBtn.textContent = userPaused ? '▶' : '❚❚'; playBtn.setAttribute('aria-label', userPaused ? 'Resume automatic sliding' : 'Pause automatic sliding'); schedule(); });
        controls.appendChild(playBtn);
      }
      card.appendChild(controls);

      card.addEventListener('mouseenter', function () { hoverPaused = true; schedule(); });
      card.addEventListener('mouseleave', function () { hoverPaused = false; schedule(); });
      card.addEventListener('focusin', function () { hoverPaused = true; schedule(); });
      card.addEventListener('focusout', function () { hoverPaused = false; schedule(); });
      var x0 = null;                                                    // swipe on touch screens
      viewport.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; hoverPaused = true; schedule(); }, { passive: true });
      viewport.addEventListener('touchend', function (e) { if (x0 != null) { var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1)); } x0 = null; hoverPaused = false; schedule(); }, { passive: true });
      if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { inView = en[0].isIntersecting; schedule(); }).observe(card);
      document.addEventListener('visibilitychange', schedule);
    }
    show(0); schedule();
  }

  build(document.getElementById('why-testimonials'), data.testimonials, slideTestimonial, 'testimonial');
  build(document.getElementById('why-clients'), data.clients, slideClient, 'client');
})();
