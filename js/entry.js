/* Art of Sushi Bazilika — kezdőlap: nyitás, egér-parallaxis, átmenet a Bazilika oldalra */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const img = document.querySelector('.stage__media img');

  // nyitó animáció: a fontok és a homlokzat képe után indul
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      root.classList.add('ready');
      setTimeout(() => root.classList.add('settled'), reduce ? 0 : 3600);
    }));
  };
  Promise.all([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    img.complete ? Promise.resolve() : new Promise(r => { img.onload = img.onerror = r; })
  ]).then(start);
  setTimeout(start, 2500);

  // finom egér-parallaxis a képen
  if (fine && !reduce) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    addEventListener('pointermove', e => {
      tx = (e.clientX / innerWidth - .5) * -16;
      ty = (e.clientY / innerHeight - .5) * -10;
    }, { passive: true });
    const loop = () => {
      cx += (tx - cx) * .05; cy += (ty - cy) * .05;
      img.style.setProperty('--px', `${cx.toFixed(2)}px`);
      img.style.setProperty('--py', `${cy.toFixed(2)}px`);
      requestAnimationFrame(loop);
    };
    loop();
  }

  // a Bazilika oldal előtöltése (egér a gombon, vagy mobilon pár mp után)
  let prefetched = false;
  const prefetch = () => {
    if (prefetched) return;
    prefetched = true;
    const l = document.createElement('link');
    l.rel = 'prefetch'; l.href = 'bazilika.html';
    document.head.appendChild(l);
  };
  document.querySelectorAll('[data-go]').forEach(a => a.addEventListener('pointerenter', prefetch));
  setTimeout(prefetch, 4000);

  // kattintás: a kép közelebb jön, elsötétül, majd továbblép
  document.querySelectorAll('[data-go]').forEach(a => a.addEventListener('click', e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    if (root.classList.contains('leaving')) return;
    const href = a.getAttribute('href');
    if (reduce) { location.href = href; return; }
    root.classList.add('leaving');
    setTimeout(() => { location.href = href; }, 1150);
  }));

  // vissza gombnál (bfcache) álljon vissza a kezdőállapot
  addEventListener('pageshow', e => { if (e.persisted) root.classList.remove('leaving'); });
})();
