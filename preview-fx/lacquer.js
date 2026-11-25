/* Lakk-doboz: rejtett hullámminta, amelyet egy lassan követő arany fény világít meg */
(() => {
  const hero = document.querySelector('.hero--text');
  if (!hero) return;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  let tx = .5, ty = .38, x = .5, y = .38;
  if (fine) addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; }, { passive: true });
  const loop = t => {
    if (!fine) { tx = .5 + Math.sin(t / 3200) * .28; ty = .42 + Math.cos(t / 4100) * .2; }
    x += (tx - x) * .045; y += (ty - y) * .045;
    hero.style.setProperty('--lx', (x * 100).toFixed(2) + '%');
    hero.style.setProperty('--ly', (y * 100).toFixed(2) + '%');
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();
