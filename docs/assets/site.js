(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('#motion-toggle');
  const slider = document.querySelector('#theta');
  const output = document.querySelector('#theta-value');
  const identity = document.querySelector('#identity-button');
  const note = document.querySelector('#identity-note');
  const canvas = document.querySelector('#hero-orbit');
  const ctx = canvas.getContext('2d');
  const hero = document.querySelector('.hero');
  const lab = document.querySelector('.euler-lab');
  let paused = reduced.matches;
  let manual = false;
  let theta = Math.PI / 2;
  let frame = 0, last = 0, lastPaint = 0, elapsed = 0;
  let heroVisible = true, labVisible = false;
  let width = 0, height = 0;
  const wave = document.querySelector('#wave-path');
  const radius = document.querySelector('#radius-line');
  const projection = document.querySelector('#projection-line');
  const point = document.querySelector('#orbit-point');
  const wavePoint = document.querySelector('#wave-point');
  function drawEquation() {
    const x = 155 + Math.cos(theta) * 90;
    const y = 125 - Math.sin(theta) * 90;
    radius.setAttribute('d', `M155 125L${x} ${y}`);
    projection.setAttribute('d', `M${x} ${y}H290`);
    point.setAttribute('cx', x); point.setAttribute('cy', y);
    wavePoint.setAttribute('cy', y);
    let path = '';
    for (let n = 0; n <= 180; n++) {
      // The horizontal axis is a phase offset u: sin(theta + u).
      const px = 290 + n / 180 * 260;
      const py = 125 - Math.sin(theta + n / 180 * 2 * Math.PI) * 90;
      path += `${n ? 'L' : 'M'}${px.toFixed(2)} ${py.toFixed(2)}`;
    }
    wave.setAttribute('d', path);
    slider.value = String(theta / Math.PI);
    output.value = `${(theta / Math.PI).toFixed(2)}π`;
    slider.setAttribute('aria-valuetext', `${(theta / Math.PI).toFixed(2)} パイラジアン`);
    const isPi = Math.abs(theta - Math.PI) < .002;
    note.textContent = isPi ? 'θ = π → eⁱπ = −1 → eⁱπ + 1 = 0' : '円の上の点と、波の高さは同じ。';
  }
  function resize() {
    const box = hero.getBoundingClientRect();
    width = box.width; height = box.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawOrbit();
  }
  function drawOrbit() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    const mobile = width < 760;
    const cx = width * (mobile ? .56 : .69), cy = mobile ? 402 : height * .43;
    const rx = Math.min(width * .24, 320), ry = rx * .73;
    ctx.save();ctx.translate(cx, cy);ctx.rotate(-.28);
    ctx.lineWidth = .7;
    ctx.strokeStyle = 'rgba(183,211,235,.15)';
    ctx.beginPath();ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);ctx.stroke();
    for (let n = 0; n < 3; n++) {
      const t = elapsed * .18 + n * Math.PI * 2 / 3;
      ctx.strokeStyle = `rgba(185,219,244,${.27 - n * .05})`;
      ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,t-.4,t);ctx.stroke();
      ctx.fillStyle = '#d5e8f8';ctx.beginPath();ctx.arc(Math.cos(t)*rx,Math.sin(t)*ry,2,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
  function animate(now) {
    frame = 0;
    if (paused || document.hidden || (!heroVisible && (!labVisible || manual))) { last = 0; return; }
    const dt = last ? Math.min((now-last)/1000,.1) : 0;
    last = now; elapsed += dt;
    if (!manual && labVisible) theta = (theta + dt * .28) % (Math.PI * 2);
    // Limit illustration work to 30 fps. No continuous loop outside visible sections.
    if (now - lastPaint > 32) {
      if (heroVisible) drawOrbit();
      if (labVisible && !manual) drawEquation();
      lastPaint = now;
    }
    frame = requestAnimationFrame(animate);
  }
  function start() { if (!frame && !paused && !document.hidden) { last=0; frame=requestAnimationFrame(animate); } }
  function updateMotion() {
    document.body.classList.toggle('motion-paused', paused);
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? '動きを再開する ▷' : '動きを止める Ⅱ';
    if (paused) { cancelAnimationFrame(frame);frame=0;last=0; }
    else start();
  }
  toggle.hidden = false;
  document.querySelector('#lab-controls').hidden = false;
  toggle.addEventListener('click', () => { paused=!paused; if (!paused) manual=false; updateMotion(); });
  slider.addEventListener('focus', () => { manual=true; });
  slider.addEventListener('input', () => { manual=true;theta=Number(slider.value)*Math.PI;drawEquation(); });
  identity.addEventListener('click', () => { manual=true;theta=Math.PI;drawEquation(); });
  reduced.addEventListener('change', () => { paused=reduced.matches;updateMotion(); });
  document.addEventListener('visibilitychange', () => { if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else start(); });
  if ('IntersectionObserver' in window) {
    const visibility = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.target === hero) heroVisible=entry.isIntersecting;
        if (entry.target === lab) labVisible=entry.isIntersecting;
      }
      start();
    });
    visibility.observe(hero);visibility.observe(lab);
    if (!reduced.matches) {
      const reveals = new IntersectionObserver(entries => {
        for (const entry of entries) if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');reveals.unobserve(entry.target);
        }
      },{threshold:0.08});
      document.querySelectorAll('[data-reveal]').forEach(el => {
        // Progressive enhancement: only opt-in once the observer is available.
        if(el.getBoundingClientRect().top > window.innerHeight) el.classList.add('reveal-ready');
        reveals.observe(el);
      });
    }
  } else { labVisible=true; }
  window.addEventListener('resize',resize,{passive:true});
  drawEquation();resize();updateMotion();
})();
