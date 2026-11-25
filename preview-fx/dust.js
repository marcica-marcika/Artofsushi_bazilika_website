/* Arany por: a részecskék a hal-logó alakjába állnak össze, az egér szétfújja őket */
(() => {
  const hero = document.querySelector('.hero--text'), slot = document.querySelector('.ht__dust');
  if (!hero || !slot) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.createElement('canvas'); cv.className = 'ht__canvas'; hero.prepend(cv);
  const ctx = cv.getContext('2d');
  const D = slot.dataset.d.split('|');
  let W, H, dpr, P = [], start = 0, mx = -1e4, my = -1e4;
  function build() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const hr = hero.getBoundingClientRect(), r = slot.getBoundingClientRect();
    const bx = r.left - hr.left, by = r.top - hr.top, bw = r.width, bh = r.height;
    // a logó kirajzolása egy rejtett vászonra, majd pontok mintavétele
    const oc = document.createElement('canvas'); oc.width = Math.ceil(bw); oc.height = Math.ceil(bh);
    const o = oc.getContext('2d'); const s = Math.min(bw / 304, bh / 154);
    o.translate((bw - 304 * s) / 2, (bh - 154 * s) / 2); o.scale(s, s); o.translate(-276, -62);
    o.fillStyle = '#fff'; o.strokeStyle = '#fff'; o.lineWidth = 6;
    o.fill(new Path2D(D[0]));
    o.save(); o.setTransform(1,0,0,1,0,0); o.translate((bw - 304 * s) / 2, (bh - 154 * s) / 2); o.scale(s, s); o.translate(-276, -62);
    o.transform(0.999288, 0, 0, -0.999288, 519.787794, 109.892289); o.stroke(new Path2D(D[1])); o.restore();
    const img = o.getImageData(0, 0, oc.width, oc.height).data, pts = [];
    const step = W < 640 ? 2 : 2;
    for (let y = 0; y < oc.height; y += step) for (let x = 0; x < oc.width; x += step)
      if (img[(y * oc.width + x) * 4 + 3] > 128) pts.push([bx + x, by + y]);
    const want = Math.min(pts.length, W < 640 ? 1400 : 2600);
    P = [];
    for (let i = 0; i < want; i++) {
      const t = pts[Math.floor(i * pts.length / want)];
      const a = Math.random() * Math.PI * 2, rr = Math.max(W, H) * (.35 + Math.random() * .6);
      P.push({ tx: t[0] + (Math.random() - .5), ty: t[1] + (Math.random() - .5),
        x: W / 2 + Math.cos(a) * rr, y: H * .45 + Math.sin(a) * rr * .7, vx: 0, vy: 0,
        s: .5 + Math.random() * 1.1, ph: Math.random() * 6.28, d: Math.random() * 900 });
    }
    // szálló por a háttérben
    for (let i = 0; i < (W < 640 ? 70 : 160); i++)
      P.push({ free: 1, x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .12, vy: -.05 - Math.random() * .15, s: .4 + Math.random() * 1.2, ph: Math.random() * 6.28 });
    start = performance.now();
  }
  addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; }, { passive: true });
  hero.addEventListener('pointerleave', () => { mx = my = -1e4; });
  function frame(t) {
    const el = t - start, sc = Math.min(1, Math.max(0, scrollY / (H * .7)));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    for (const p of P) {
      if (p.free) {
        p.x += p.vx; p.y += p.vy; if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
        ctx.globalAlpha = .18 + .22 * Math.sin(t / 900 + p.ph);
      } else {
        const k = Math.min(1, Math.max(0, (el - p.d) / 2200)), pull = .012 + .05 * k * k;
        let tx = p.tx, ty = p.ty;
        if (sc > 0) { tx += (p.tx - W / 2) * sc * 1.6 + Math.sin(p.ph) * sc * 120; ty += -sc * H * .5 + Math.cos(p.ph) * sc * 80; }
        p.vx += (tx - p.x) * pull; p.vy += (ty - p.y) * pull;
        const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 9000) { const f = (9000 - d2) / 9000 * 2.4; const d = Math.sqrt(d2) || 1; p.vx += dx / d * f; p.vy += dy / d * f; }
        p.vx *= .82; p.vy *= .82; p.x += p.vx; p.y += p.vy;
        ctx.globalAlpha = (.55 + .45 * Math.sin(t / 600 + p.ph)) * (1 - sc * .9);
      }
      ctx.fillStyle = p.s > 1.2 ? '#e7cf9b' : '#c4a46c';
      ctx.fillRect(p.x, p.y, p.s, p.s);
    }
    requestAnimationFrame(frame);
  }
  const go = () => { build(); if (reduce) { P.forEach(p => { if (!p.free) { p.x = p.tx; p.y = p.ty; } }); } requestAnimationFrame(frame); };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(go, 300));
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 200); });
})();
