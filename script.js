// Scroll reveals. Without IntersectionObserver support everything is simply shown.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
}

// Background: a mesh of particles carried by a slowly evolving flow that crosses the whole viewport
// (they wrap around off-screen, so no area ever empties), at two depths that also shift with scroll.
// The pointer tethers nearby nodes, light pulses travel along the links, and colours flow through the
// brand palette (blue > cyan > gold > red) while a slow wave raises and lowers saturation.
(function () {
  const cv = document.getElementById('bg-mesh');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const gridLines = document.querySelector('.bg-grid div');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const TAU = Math.PI * 2, M = 140;
  const SPEED = .5;             // pace of the whole background animation (1 = full speed)
  const STOPS = [[7, 85, 143], [79, 196, 223], [214, 154, 32], [230, 59, 46]];
  // back layer: many, small, slow. front layer: fewer, larger, faster, more scroll parallax.
  const LAYERS = [
    { speed: .9, par: .1, link: 140, r: [.8, 1.4], alpha: .6, line: .24 },
    { speed: 1.6, par: .3, link: 175, r: [1.4, 2.2], alpha: .85, line: .34 }
  ];
  const DEGREE = 3.6;           // average links per node
  // Divergence-free flow built from travelling shear waves whose wave-vectors fit the wrap-around box
  // exactly (whole numbers of periods), so particles swirl and travel but the density stays even forever.
  // [periods across, periods down, speed of travel, phase, amplitude px/s]
  const WAVE_DEFS = [[1, 1, .13, 0, 22], [2, -1, -.17, 2, 18], [1, -2, .09, 4, 20], [3, 2, .21, 1, 10]];
  let waves = [];
  function setWaves() {
    waves = WAVE_DEFS.map(([m, n, om, ph, amp]) => {
      const kx = TAU * m / W, ky = TAU * n / H, k = Math.hypot(kx, ky);
      return { kx, ky, ux: amp * ky / k, uy: -amp * kx / k, om, ph };
    });
  }
  const DRIFT = [12, -6];       // px/s: a constant current so everything travels
  // large thin orbits sweeping across the page, each with a node circling it
  const RINGS = [
    { rx: .38, ry: .13, rot: -.4, rs: .010, cx: .30, cy: .30, ax: .18, ay: .14, fx: .011, fy: .015, ph: 0 },
    { rx: .30, ry: .20, rot: .9, rs: -.013, cx: .72, cy: .62, ax: .16, ay: .16, fx: .014, fy: .010, ph: 2.1 },
    { rx: .44, ry: .10, rot: .25, rs: .008, cx: .50, cy: .85, ax: .22, ay: .10, fx: .009, fy: .013, ph: 4.2 }
  ];

  const mouse = { x: -9999, y: -9999 };
  const pulses = [];
  let w, h, W, H, pts = [], last = -1, nextPulse = 0, sy = window.scrollY;

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

  function counts() {
    const n = LAYERS.map((L) => DEGREE * W * H / (Math.PI * L.link * L.link));
    const k = Math.min(1, 210 / (n[0] + n[1]));
    return n.map((v) => Math.max(14, Math.round(v * k)));
  }
  function build() {
    pts = [];
    counts().forEach((count, li) => {
      const L = LAYERS[li];
      const cols = Math.max(1, Math.round(Math.sqrt(count * W / H))), rows = Math.ceil(count / cols);
      const cells = Array.from({ length: cols * rows }, (_, i) => i);
      for (let i = cells.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cells[i], cells[j]] = [cells[j], cells[i]]; }
      for (let i = 0; i < count; i++) {
        const c = cells[i] % cols, r = Math.floor(cells[i] / cols);
        pts.push({
          x: (c + .5 + (Math.random() - .5) * .9) / cols * W, y: (r + .5 + (Math.random() - .5) * .9) / rows * H,
          vx: (Math.random() - .5) * 10, vy: (Math.random() - .5) * 10,
          r: L.r[0] + Math.random() * (L.r[1] - L.r[0]), hue: Math.random() * .25,
          L: li, dx: 0, dy: 0, c: [0, 0, 0]
        });
      }
    });
    pulses.length = 0;
  }
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = cv.clientWidth; h = cv.clientHeight; W = w + 2 * M; H = h + 2 * M;
    setWaves();
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const total = counts().reduce((a, b) => a + b, 0);
    if (!pts.length || Math.abs(total - pts.length) / total > .25) build();   // ignore small mobile toolbar resizes
  }

  function drawRing(R, t) {
    const S = Math.max(w, h);
    const cx = w * (R.cx + R.ax * Math.sin(TAU * R.fx * t + R.ph));
    const cy = h * (R.cy + R.ay * Math.cos(TAU * R.fy * t + R.ph * 1.3));
    const rx = R.rx * S, ry = R.ry * S, col = tint(palette(R.ph / TAU + t * .02), .9);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(R.rot + R.rs * t);
    ctx.strokeStyle = rgba(col, .11); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.stroke();
    const a = TAU * (t * .02 + R.ph), nx = rx * Math.cos(a), ny = ry * Math.sin(a);
    ctx.fillStyle = rgba(col, .18); ctx.beginPath(); ctx.arc(nx, ny, 7, 0, TAU); ctx.fill();
    ctx.fillStyle = rgba(col, .9); ctx.beginPath(); ctx.arc(nx, ny, 2.6, 0, TAU); ctx.fill();
    ctx.restore();
  }

  function spawnPulse(t) {
    for (let tries = 0; tries < 10; tries++) {
      const a = pts[(Math.random() * pts.length) | 0];
      if (a.dx < 0 || a.dx > w || a.dy < 0 || a.dy > h) continue;
      const reach = LAYERS[a.L].link * .85, near = [];
      for (const q of pts) {
        if (q === a || q.L !== a.L) continue;
        const d = Math.hypot(a.dx - q.dx, a.dy - q.dy);
        if (d > 40 && d < reach) near.push(q);
      }
      if (near.length) { pulses.push({ a, b: near[(Math.random() * near.length) | 0], t0: t, dur: 1.4 + Math.random() * 1.2 }); return; }
    }
  }

  function frame(ts) {
    const now = (ts || 0) / 1000;
    const rdt = still || last < 0 ? 0 : Math.min(.05, Math.max(0, now - last));   // real time: scroll + pointer
    last = now;
    const t = now * SPEED, dt = rdt * SPEED;                                        // animation clock

    if (!still) {     // eased scroll so the depth layers glide instead of snapping
      const cap = 3000 * rdt, d = window.scrollY - sy;
      sy += Math.max(-cap, Math.min(cap, d * Math.min(1, rdt * 5)));
      if (gridLines) gridLines.style.translate = '0 ' + (-(sy * .25) % 84).toFixed(2) + 'px';
    }

    for (const p of pts) {
      const L = LAYERS[p.L];
      if (dt) {
        let u = DRIFT[0] + p.vx, v = DRIFT[1] + p.vy;
        for (const k of waves) { const c = Math.cos(k.kx * p.x + k.ky * p.y + k.om * t + k.ph); u += k.ux * c; v += k.uy * c; }
        p.x = (((p.x + u * L.speed * dt) % W) + W) % W;
        p.y = (((p.y + v * L.speed * dt) % H) + H) % H;
      }
      p.dx = p.x - M;
      p.dy = (((p.y - sy * L.par) % H) + H) % H - M;
      const mx = p.dx - mouse.x, my = p.dy - mouse.y, d2 = mx * mx + my * my;
      if (rdt && d2 < 8100) {     // gentle push away from the pointer
        const d = Math.sqrt(d2) || 1, f = (1 - d / 90) * 70 * rdt;
        p.x += mx / d * f; p.y += my / d * f; p.dx += mx / d * f; p.dy += my / d * f;
      }
      const hue = p.hue + t * .02 + (p.dx / w) * .45 + (p.dy / h) * .3;
      const sat = .5 + .5 * (.5 + .5 * Math.sin(t * .5 - (p.dx / w) * 4 + (p.dy / h) * 2.5));
      p.c = tint(palette(hue), sat);
    }

    ctx.clearRect(0, 0, w, h);
    for (const R of RINGS) drawRing(R, t);

    ctx.lineWidth = 1;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], L = LAYERS[p.L];
      for (let k = i + 1; k < pts.length; k++) {
        const q = pts[k];
        if (q.L !== p.L) break;
        const dx = p.dx - q.dx, dy = p.dy - q.dy, d2 = dx * dx + dy * dy;
        if (d2 >= L.link * L.link) continue;
        const a = L.line * (1 - Math.sqrt(d2) / L.link), g = ctx.createLinearGradient(p.dx, p.dy, q.dx, q.dy);
        g.addColorStop(0, rgba(p.c, a)); g.addColorStop(1, rgba(q.c, a));
        ctx.strokeStyle = g;
        ctx.beginPath(); ctx.moveTo(p.dx, p.dy); ctx.lineTo(q.dx, q.dy); ctx.stroke();
      }
    }
    if (mouse.x > -999) {       // tether the pointer to nearby nodes
      for (const p of pts) {
        const dx = p.dx - mouse.x, dy = p.dy - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 28900) {
          ctx.strokeStyle = rgba(p.c, .42 * (1 - Math.sqrt(d2) / 170));
          ctx.beginPath(); ctx.moveTo(mouse.x, mouse.y); ctx.lineTo(p.dx, p.dy); ctx.stroke();
        }
      }
    }
    for (const p of pts) {
      ctx.fillStyle = rgba(p.c, LAYERS[p.L].alpha);
      ctx.beginPath(); ctx.arc(p.dx, p.dy, p.r, 0, TAU); ctx.fill();
    }

    if (dt && t > nextPulse && pulses.length < 8) { spawnPulse(t); nextPulse = t + .25 + Math.random() * .5; }
    for (let i = pulses.length - 1; i >= 0; i--) {
      const P = pulses[i], u = (t - P.t0) / P.dur;
      if (u >= 1 || Math.hypot(P.a.dx - P.b.dx, P.a.dy - P.b.dy) > LAYERS[P.a.L].link * 1.1) { pulses.splice(i, 1); continue; }
      const e = u * u * (3 - 2 * u), x = P.a.dx + (P.b.dx - P.a.dx) * e, y = P.a.dy + (P.b.dy - P.a.dy) * e;
      const c = [(P.a.c[0] + P.b.c[0]) / 2 | 0, (P.a.c[1] + P.b.c[1]) / 2 | 0, (P.a.c[2] + P.b.c[2]) / 2 | 0], f = Math.sin(u * Math.PI);
      const g = ctx.createRadialGradient(x, y, 0, x, y, 10);
      g.addColorStop(0, rgba(c, .55 * f)); g.addColorStop(1, rgba(c, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 10, 0, TAU); ctx.fill();
      ctx.fillStyle = rgba(c, .95 * f); ctx.beginPath(); ctx.arc(x, y, 2.4, 0, TAU); ctx.fill();
    }
  }
  function loop(ts) { frame(ts); requestAnimationFrame(loop); }

  window.addEventListener('resize', () => { resize(); if (still) frame(0); });
  window.addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') mouse.x = mouse.y = -9999; });
  document.documentElement.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });
  resize();
  if (still) frame(0); else requestAnimationFrame(loop);
})();

// Contact form: sends through FormSubmit (https://formsubmit.co) so visitors need no email app.
// If sending fails for any reason, the visitor is offered a ready-made email instead, so no enquiry is lost.
(function () {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form || !status) return;
  const btn = form.querySelector('button[type="submit"]');
  const label = btn.querySelector('.btn-label');
  const TO = 'admin@max-morph.com';

  function say(kind, html) { status.hidden = false; status.className = 'form-status is-' + kind; status.innerHTML = html; }
  function mailtoHref(d) {
    const body = 'Name: ' + d.get('name') + '\nEmail: ' + d.get('email') + '\nPhone: ' + (d.get('phone') || '-') + '\nOrganisation: ' + (d.get('organisation') || '-') + '\n\n' + d.get('message');
    return 'mailto:' + TO + '?subject=' + encodeURIComponent('MaxMorph — ' + d.get('type')) + '&body=' + encodeURIComponent(body);
  }
  function valid() {
    let first = null;
    form.querySelectorAll('input[required], textarea[required]').forEach((f) => {
      const bad = !f.value.trim() || (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim()));
      f.closest('label').classList.toggle('has-error', bad);
      f.setAttribute('aria-invalid', bad ? 'true' : 'false');
      if (bad && !first) first = f;
    });
    if (first) { say('error', 'Please fill in your name, a valid email address and a message.'); first.focus(); }
    return !first;
  }
  form.addEventListener('input', (e) => { const l = e.target.closest('label'); if (l) l.classList.remove('has-error'); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (btn.disabled) return;
    const d = new FormData(form);
    if (d.get('_honey')) { say('ok', 'Thank you — your message has been sent.'); return; }       // spam bots fill the hidden field; pretend success
    if (!valid()) return;
    btn.disabled = true; form.classList.add('is-sending'); label.textContent = 'Sending…'; status.hidden = true;
    try {
      const payload = {}; d.forEach((v, k) => { payload[k] = v; });
      payload._replyto = d.get('email');
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 15000);
      const res = await fetch('https://formsubmit.co/ajax/' + TO, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload), signal: ctl.signal });
      clearTimeout(t);
      const out = await res.json().catch(() => ({}));
      if (!res.ok || String(out.success) === 'false') throw new Error('send failed');
      form.reset(); form.classList.add('is-done');
      say('ok', '<strong>Thank you.</strong> Your message has been sent and we will get back to you at the email address you provided.');
    } catch (err) {
      say('error', 'Sorry, we could not send that just now. <a href="' + mailtoHref(d) + '">Send it by email instead</a> or write to <a href="mailto:' + TO + '">' + TO + '</a>.');
    } finally {
      btn.disabled = false; form.classList.remove('is-sending'); label.textContent = 'Send message';
    }
  });
})();

// Founder name: keep it on one line inside its card, whichever font is actually showing.
// (The CSS gives a good first size for the site font; this corrects it if a wider fallback font is used.)
(function () {
  const h = document.querySelector('.founder-card h3');
  if (!h) return;
  const head = h.closest('.founder-head'), photo = head.querySelector('.founder-photo');
  // space beside the photo = card row width, minus the photo and the gap between them
  const room = () => head.getBoundingClientRect().width - (photo ? photo.getBoundingClientRect().width : 0) - (parseFloat(getComputedStyle(head).columnGap) || 0) - 4;
  function fit() {
    h.style.fontSize = '';
    let fs = parseFloat(getComputedStyle(h).fontSize);
    const r = document.createRange(); r.selectNodeContents(h);
    for (let i = 0; i < 40 && fs > 12 && r.getBoundingClientRect().width > room(); i++) { fs -= 1; h.style.fontSize = fs + 'px'; }
  }
  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.addEventListener('load', fit);
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(head);
  else window.addEventListener('resize', fit);
})();
