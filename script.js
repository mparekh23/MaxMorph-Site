const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// Background: drifting particle mesh (navy nodes, gold accents) that reacts gently to the pointer.
(function () {
  const cv = document.getElementById('bg-mesh');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w, h, dpr, pts = [];
  const mouse = { x: -9999, y: -9999 };
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(110, Math.max(32, (w * h) / 16000)));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28,
      r: Math.random() * 1.4 + .8, gold: Math.random() < .18
    }));
  }
  function frame() {
    ctx.clearRect(0, 0, w, h);
    const link = 140;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      if (!still) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 14400) { const f = (1 - Math.sqrt(d2) / 120) * .6; p.x += dx / 120 * f; p.y += dy / 120 * f; }
      }
      for (let k = i + 1; k < pts.length; k++) {
        const q = pts[k], dx = p.x - q.x, dy = p.y - q.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < link) {
          ctx.strokeStyle = (p.gold || q.gold ? 'rgba(214,154,32,' : 'rgba(7,85,143,') + (.16 * (1 - d / link)) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      ctx.fillStyle = p.gold ? 'rgba(214,154,32,.6)' : 'rgba(7,85,143,.4)';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
    }
    if (!still) requestAnimationFrame(frame);
  }
  window.addEventListener('resize', () => { resize(); if (still) frame(); });
  window.addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  resize(); frame();
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
