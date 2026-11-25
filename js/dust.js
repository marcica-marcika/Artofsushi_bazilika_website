/* Art of Sushi Bazilika — nyitókép: arany por, amely a hal-logóvá áll össze.
   Az egér szétfújja (örvénylik), görgetésre felfelé szétszáll. Kép nincs, csak vászon. */
(() => {
  'use strict';
  const hero = document.querySelector('.fx-dust'), slot = hero && hero.querySelector('.ht__dust');
  if (!hero || !slot) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.createElement('canvas');
  cv.className = 'ht__canvas'; cv.setAttribute('aria-hidden', 'true');
  hero.prepend(cv);
  const ctx = cv.getContext('2d');
  const [D0, D1] = slot.dataset.d.split('|');
  const GOLD = ['#c4a46c', '#d8bd86', '#e9d5a6', '#a88a55'];
  let W = 0, H = 0, dpr = 1, P = [], F = [], t0 = 0, mx = -1e4, my = -1e4, mvx = 0, mvy = 0, visible = true, raf = 0;

  function sample(bw, bh) {
    // a logót egy rejtett vászonra rajzoljuk, és a kitöltött képpontokból veszünk mintát
    const oc = document.createElement('canvas');
    oc.width = Math.ceil(bw); oc.height = Math.ceil(bh);
    const o = oc.getContext('2d'), s = Math.min(bw / 304, bh / 154);
    const base = () => { o.setTransform(1, 0, 0, 1, 0, 0); o.translate((bw - 304 * s) / 2, (bh - 154 * s) / 2); o.scale(s, s); o.translate(-276, -62); };
    o.fillStyle = o.strokeStyle = '#fff';
    base(); o.fill(new Path2D(D0));
    base(); o.transform(0.999288, 0, 0, -0.999288, 519.787794, 109.892289); o.lineWidth = 4; o.stroke(new Path2D(D1));
    const d = o.getImageData(0, 0, oc.width, oc.height).data, pts = [];
    for (let y = 0; y < oc.height; y += 1.5) for (let x = 0; x < oc.width; x += 1.5) {
      const a = d[((y | 0) * oc.width + (x | 0)) * 4 + 3];
      if (a > 110) pts.push([x, y]);
    }
    return pts;
  }

  function build() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const hr = hero.getBoundingClientRect(), r = slot.getBoundingClientRect();
    const bx = r.left - hr.left, by = r.top - hr.top;
    const pts = sample(r.width, r.height);
    const mobile = W < 640, want = Math.min(pts.length, mobile ? 1700 : 3800);
    // keverés, hogy a ritkítás egyenletes legyen
    for (let i = pts.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
    const old = P;
    P = [];
    for (let i = 0; i < want; i++) {
      const [x, y] = pts[i], tx = bx + x, ty = by + y;
      const prev = old[i];
      const a = Math.random() * Math.PI * 2, rr = Math.max(W, H) * (.45 + Math.random() * .7);
      P.push({
        tx, ty,
        x: prev ? prev.x : W / 2 + Math.cos(a) * rr, y: prev ? prev.y : H * .42 + Math.sin(a) * rr * .75,
        vx: 0, vy: 0,
        s: Math.random() < .06 ? 1.6 + Math.random() * 1.2 : .55 + Math.random() * .9,
        c: GOLD[Math.random() * GOLD.length | 0],
        ph: Math.random() * 6.283,
        d: (x / r.width) * 650 + Math.random() * 380      // balról jobbra áll össze, mintha valaki megrajzolná
      });
    }
    F = [];
    for (let i = 0; i < (mobile ? 60 : 140); i++) F.push({ x: Math.random() * W, y: Math.random() * H, vy: -.06 - Math.random() * .22, vx: (Math.random() - .5) * .1, s: .4 + Math.random() * 1.3, ph: Math.random() * 6.283 });
    if (!t0) t0 = performance.now();
    if (reduce) P.forEach(p => { p.x = p.tx; p.y = p.ty; });
  }

  addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect(), nx = e.clientX - r.left, ny = e.clientY - r.top;
    mvx = nx - mx; mvy = ny - my; mx = nx; my = ny;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { mx = my = -1e4; });

  function frame(t) {
    raf = 0;
    if (!visible) return;
    const el = t - t0, sc = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / (H * .75)));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    // lebegő por a háttérben
    for (const p of F) {
      p.x += p.vx; p.y += p.vy - sc * .8;
      if (p.y < -6) { p.y = H + 6; p.x = Math.random() * W; }
      ctx.globalAlpha = (.1 + .16 * (1 + Math.sin(t / 1100 + p.ph)) / 2);
      ctx.fillStyle = '#c4a46c';
      ctx.fillRect(p.x, p.y, p.s, p.s);
    }
    const R2 = 120 * 120;
    for (const p of P) {
      const k = reduce ? 1 : Math.min(1, Math.max(0, (el - 150 - p.d) / 1800));
      const pull = .006 + .07 * k * k;
      let tx = p.tx + Math.sin(t / 1400 + p.ph) * .6, ty = p.ty + Math.cos(t / 1700 + p.ph) * .6;
      if (sc > 0) {   // görgetésre felfelé és szét
        tx += (p.tx - W / 2) * sc * 1.2 + Math.sin(p.ph * 3) * sc * 160;
        ty -= sc * H * .7 + Math.cos(p.ph * 2) * sc * 90;
      }
      p.vx += (tx - p.x) * pull; p.vy += (ty - p.y) * pull;
      const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
      if (d2 < R2) {   // egér: taszít és kicsit megpörget
        const f = (1 - d2 / R2) * 3.2, d = Math.sqrt(d2) || 1;
        p.vx += (dx / d) * f + (-dy / d) * f * .6 + mvx * .02;
        p.vy += (dy / d) * f + (dx / d) * f * .6 + mvy * .02;
      }
      p.vx *= .84; p.vy *= .84;
      p.x += p.vx; p.y += p.vy;
      const tw = .62 + .38 * Math.sin(t / 520 + p.ph);
      ctx.globalAlpha = tw * (1 - sc * .95) * (.35 + .65 * k);
      ctx.fillStyle = p.c;
      if (p.s > 1.5) {   // néhány szikra fénykörrel
        ctx.globalAlpha *= .9;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s * .55, 0, 6.283); ctx.fill();
        ctx.globalAlpha *= .12;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s * 2.6, 0, 6.283); ctx.fill();
      } else ctx.fillRect(p.x, p.y, p.s, p.s);
    }
    mvx *= .8; mvy *= .8;
    ctx.globalCompositeOperation = 'source-over';
    raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf && visible) raf = requestAnimationFrame(frame); };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting && !document.hidden; kick(); }).observe(hero);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; kick(); });
  const go = () => { build(); kick(); };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(go, 250));
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (Math.abs(hero.clientWidth - W) > 40 || Math.abs(hero.clientHeight - H) > 120) build(); }, 220); });
})();
