const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// Background: drifting particle mesh. Colours flow through the brand palette (blue > cyan > gold > red)
// across the page and over time, while a slow wave raises and lowers saturation.
(function () {
  const cv = document.getElementById('bg-mesh');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STOPS = [[7, 85, 143], [79, 196, 223], [214, 154, 32], [230, 59, 46]];
  const mouse = { x: -9999, y: -9999 };
  let w, h, pts = [];

  function palette(t) {
    t = ((t % 1) + 1) % 1 * STOPS.length;
    const i = Math.floor(t), f = t - i, e = f * f * (3 - 2 * f);
    const a = STOPS[i], b = STOPS[(i + 1) % STOPS.length];
    return [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e];
  }
  function tint(c, s) {
    const g = c[0] * .3 + c[1] * .59 + c[2] * .11;
    return [Math.round(g + (c[0] - g) * s), Math.round(g + (c[1] - g) * s), Math.round(g + (c[2] - g) * s)];
  }
  const rgba = (c, a) => 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(110, Math.max(32, (w * h) / 16000)));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28,
      r: Math.random() * 1.5 + 1, hue: Math.random() * .25, c: null
    }));
  }

  function frame(ts) {
    const t = (ts || 0) / 1000, link = 150;
    ctx.clearRect(0, 0, w, h);
    for (const p of pts) {
      if (!still) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 14400) { const f = (1 - Math.sqrt(d2) / 120) * .6; p.x += dx / 120 * f; p.y += dy / 120 * f; }
      }
      const hue = p.hue + t * .02 + (p.x / w) * .45 + (p.y / h) * .3;
      const sat = .5 + .5 * (.5 + .5 * Math.sin(t * .5 - (p.x / w) * 4 + (p.y / h) * 2.5));
      p.c = tint(palette(hue), sat);
    }
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      for (let k = i + 1; k < pts.length; k++) {
        const q = pts[k], dx = p.x - q.x, dy = p.y - q.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < link) {
          const a = .3 * (1 - d / link), g = ctx.createLinearGradient(p.x, p.y, q.x, q.y);
          g.addColorStop(0, rgba(p.c, a)); g.addColorStop(1, rgba(q.c, a));
          ctx.strokeStyle = g; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      ctx.fillStyle = rgba(p.c, .7);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
    }
    if (!still) requestAnimationFrame(frame);
  }

  window.addEventListener('resize', () => { resize(); if (still) frame(0); });
  window.addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  resize(); requestAnimationFrame(frame);
})();

// Contact form: compose a readable mailto message (static site, no backend).
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const body = `Name: ${d.get('name')}\nEmail: ${d.get('email')}\nOrganisation: ${d.get('organisation') || '-'}\n\n${d.get('message')}`;
    window.location.href = `mailto:admin@max-morph.com?subject=${encodeURIComponent('MaxMorph — ' + d.get('type'))}&body=${encodeURIComponent(body)}`;
  });
}
