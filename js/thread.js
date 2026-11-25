/* Art of Sushi Bazilika — az arany por végigkíséri az oldalt.
   A nyitókép után a szemcsék halványan lebegnek a képernyőn; ahol egy [data-dust] horgony
   a képernyő közepére ér, összeállnak: „line” = arany vonal a cím alatt, „fish” = kis hal-logó.
   Ha a horgony kimegy, újra szétszállnak. Csökkentett mozgásnál nem fut. */
(() => {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const anchors = [...document.querySelectorAll('[data-dust]')];
  const hero = document.querySelector('.fx-dust'), slot = document.querySelector('.ht__dust');
  if (!anchors.length) return;
  const cv = document.createElement('canvas');
  cv.className = 'thread'; cv.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');
  const GOLD = ['#c4a46c', '#d8bd86', '#e9d5a6', '#a88a55'];
  const FISH = slot && slot.dataset.d ? slot.dataset.d.split('|') : null;
  let W = 0, H = 0, dpr = 1, P = [], N = 0, cur = null, shapes = new Map();
  let sy = scrollY, vel = 0, mx = -1e4, my = -1e4, raf = 0, hidden = false;

  const rnd = (a, b) => a + Math.random() * (b - a);
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    shapes.clear();
  }

  function build() {
    size();
    N = W < 640 ? 200 : 380;
    P = [];
    for (let i = 0; i < N; i++) P.push({
      // a nyitókép porának folytatása: fentről érkeznek
      x: rnd(0, W), y: rnd(-H * .4, H * .2), vx: 0, vy: 0,
      hx: Math.random(), hy: Math.random(), ph: rnd(0, 6.283), sp: rnd(.4, 1.2),
      s: Math.random() < .07 ? rnd(1.5, 2.6) : rnd(.6, 1.4),
      c: GOLD[Math.random() * GOLD.length | 0], k: 0, at: 0, tx: 0, ty: 0
    });
  }

  /* ----- alakzatok (a horgonyhoz viszonyított pontok) ----- */
  function lineShape(el) {
    const L = Math.min(150, Math.max(90, el.getBoundingClientRect().width * .35));
    const pts = [];
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1), x = (u - .5) * L;
      const taper = 1 - Math.abs(u - .5) * 1.6;          // középen vastagabb, a végén elvékonyodik
      pts.push([x, gauss() * (.4 + 1.4 * Math.max(0, taper)), u]);
    }
    return { pts, L };
  }

  function fishShape(el) {
    const r = el.getBoundingClientRect(), bw = Math.max(60, r.width), bh = bw * 154 / 304;
    const oc = document.createElement('canvas');
    oc.width = Math.ceil(bw); oc.height = Math.ceil(bh);
    const o = oc.getContext('2d'), s = Math.min(bw / 304, bh / 154);
    const base = () => { o.setTransform(1, 0, 0, 1, 0, 0); o.scale(s, s); o.translate(-276, -62); };
    o.fillStyle = o.strokeStyle = '#fff';
    base(); o.fill(new Path2D(FISH[0]));
    base(); o.transform(0.999288, 0, 0, -0.999288, 519.787794, 109.892289); o.lineWidth = 5; o.stroke(new Path2D(FISH[1]));
    const d = o.getImageData(0, 0, oc.width, oc.height).data, src = [];
    for (let y = 0; y < oc.height; y++) for (let x = 0; x < oc.width; x++) if (d[(y * oc.width + x) * 4 + 3] > 110) src.push([x, y]);
    for (let i = src.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [src[i], src[j]] = [src[j], src[i]]; }
    const pts = [];
    for (let i = 0; i < N; i++) { const [x, y] = src[i % src.length]; pts.push([x + rnd(-.4, .4), y + rnd(-.4, .4), x / bw]); }
    return { pts, L: bw };
  }

  function shapeOf(el) {
    let sh = shapes.get(el);
    if (!sh) { sh = el.dataset.dust === 'fish' && FISH ? fishShape(el) : lineShape(el); shapes.set(el, sh); }
    return sh;
  }

  // a horgony vonatkoztatási pontja a képernyőn
  function origin(el, sh) {
    const r = el.getBoundingClientRect();
    if (el.dataset.dust === 'fish') return [r.left, r.top, r];
    const left = getComputedStyle(el).textAlign === 'left' || getComputedStyle(el).textAlign === 'start';
    return [left ? r.left + sh.L / 2 : r.left + r.width / 2, r.bottom + Math.min(22, r.height * .25), r];
  }

  function pick() {
    let best = null, bd = 1e9;
    for (const el of anchors) {
      const r = el.getBoundingClientRect();
      if (!r.width) continue;
      const cy = r.top + r.height / 2;
      if (cy < H * .14 || cy > H * .8) continue;
      const d = Math.abs(cy - H * .46);
      if (d < bd) { bd = d; best = el; }
    }
    return best;
  }

  addEventListener('pointermove', e => { if (e.pointerType === 'mouse') { mx = e.clientX; my = e.clientY; } }, { passive: true });
  document.addEventListener('pointerleave', () => { mx = my = -1e4; });

  function frame(t) {
    raf = 0;
    if (hidden) return;
    const y = scrollY, dy = y - sy; sy = y;
    vel = vel * .85 + dy * .15;
    // a nyitókép alatt jelenik meg, amikor az ottani por már szétszállt
    const hh = hero ? hero.offsetHeight : 0;
    const gA = hero ? Math.min(1, Math.max(0, (y - hh * .5) / (hh * .4))) : 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (gA <= 0) { cur = null; P.forEach(p => { p.k = 0; p.y = rnd(-H * .4, H * .1); }); raf = requestAnimationFrame(frame); return; }

    const a = pick();
    if (a !== cur) {        // új horgony: balról jobbra „rajzolódnak” be
      cur = a;
      const now = t;
      P.forEach(p => { p.at = now + rnd(0, 260); });
      if (a) { const sh = shapeOf(a); P.forEach((p, i) => { p.at += sh.pts[i][2] * 620; }); }
    }
    let ox = 0, oy = 0, sh = null;
    if (cur) { sh = shapeOf(cur); [ox, oy] = origin(cur, sh); }

    ctx.globalCompositeOperation = 'lighter';
    const R2 = 90 * 90;
    for (let i = 0; i < N; i++) {
      const p = P[i];
      let tx, ty, pull, lock = cur && t > p.at;
      if (lock) {
        const q = sh.pts[i];
        tx = ox + q[0] + Math.sin(t / 900 + p.ph) * .35; ty = oy + q[1] + Math.cos(t / 1100 + p.ph) * .35;
        p.k = Math.min(1, p.k + .018);
        pull = .012 + .06 * p.k * p.k;
      } else {
        // szabad lebegés: lassú vándorlás, görgetésre a tartalommal szemben áramlik
        p.hy -= vel * .00045 * p.sp + .00006 * p.sp;
        if (p.hy < -.05) { p.hy += 1.1; p.hx = Math.random(); }
        if (p.hy > 1.05) { p.hy -= 1.1; p.hx = Math.random(); }
        tx = p.hx * W + Math.sin(t / 2600 * p.sp + p.ph) * 40;
        ty = p.hy * H + Math.cos(t / 3100 * p.sp + p.ph) * 26;
        p.k = Math.max(0, p.k - .03);
        pull = .004;
      }
      p.vx += (tx - p.x) * pull; p.vy += (ty - p.y) * pull;
      const dx = p.x - mx, dy2 = p.y - my, d2 = dx * dx + dy2 * dy2;
      if (d2 < R2) { const f = (1 - d2 / R2) * 2.4, d = Math.sqrt(d2) || 1; p.vx += dx / d * f - dy2 / d * f * .5; p.vy += dy2 / d * f + dx / d * f * .5; }
      p.vx *= lock ? .8 : .9; p.vy *= lock ? .8 : .9;
      p.x += p.vx; p.y += p.vy;
      if (p.y < -20 || p.y > H + 20) continue;
      const tw = .6 + .4 * Math.sin(t / 480 + p.ph);
      ctx.globalAlpha = gA * tw * (.16 + .74 * p.k);
      ctx.fillStyle = p.c;
      if (p.s > 1.5) {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s * .5, 0, 6.283); ctx.fill();
        ctx.globalAlpha *= .12;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s * 2.4, 0, 6.283); ctx.fill();
      } else ctx.fillRect(p.x, p.y, p.s, p.s);
    }
    ctx.globalCompositeOperation = 'source-over';
    raf = requestAnimationFrame(frame);
  }

  const kick = () => { if (!raf && !hidden) raf = requestAnimationFrame(frame); };
  document.addEventListener('visibilitychange', () => { hidden = document.hidden; kick(); });
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (Math.abs(innerWidth - W) > 40 || Math.abs(innerHeight - H) > 140) { size(); } }, 200); });
  // a nyelvváltás és a betöltött betűk megváltoztatják a címek szélességét
  document.addEventListener('aos:lang', () => shapes.clear());
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { build(); kick(); });
})();
