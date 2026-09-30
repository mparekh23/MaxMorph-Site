const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// Subtle pointer parallax for the hero system — deliberately lightweight for GitHub Pages.
const visual = document.querySelector('.hero-visual');
if (visual && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  visual.addEventListener('pointermove', (e) => {
    const r = visual.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    visual.style.setProperty('--mx', `${x * 12}px`);
    visual.style.setProperty('--my', `${y * 12}px`);
  });
  visual.addEventListener('pointerleave', () => {
    visual.style.setProperty('--mx', '0px');
    visual.style.setProperty('--my', '0px');
  });
}

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
