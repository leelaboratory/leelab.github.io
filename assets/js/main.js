(function () {
  'use strict';
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  function closeMenu(returnFocus) {
    if (!nav || !toggle) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) toggle.focus();
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      nav.classList.toggle('is-open', !open);
      toggle.setAttribute('aria-expanded', String(!open));
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) closeMenu(true);
    });
    nav.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', function () { closeMenu(false); }); });
    window.matchMedia('(min-width: 701px)').addEventListener('change', function () { closeMenu(false); });
  }

  // Search is scoped to the archive, so featured publications remain visible.
  const filters = document.querySelector('[data-pub-filters]');
  if (filters) {
    const scope = document.querySelector('[data-pub-scope]');
    const items = Array.from(scope.querySelectorAll('[data-pub]'));
    const years = Array.from(scope.querySelectorAll('[data-pub-year]'));
    const consortium = scope.querySelector('.consortium-papers');
    const search = filters.querySelector('input[type="search"]');
    const count = filters.querySelector('[data-pub-count]');
    const buttons = Array.from(filters.querySelectorAll('[data-filter]'));
    let active = 'all';
    filters.hidden = false;
    function apply() {
      const query = search.value.trim().toLowerCase();
      let shown = 0;
      items.forEach(function (item) {
        const tags = (item.dataset.tags || '').split(/\s+/);
        const matches = (active === 'all' || tags.includes(active)) && (!query || item.textContent.toLowerCase().includes(query));
        item.hidden = !matches;
        if (matches) shown++;
      });
      years.forEach(function (year) { year.hidden = !year.querySelector('[data-pub]:not([hidden])'); });
      if (consortium) {
        consortium.hidden = !consortium.querySelector('[data-pub]:not([hidden])');
        if (query || active !== 'all') consortium.open = !consortium.hidden;
      }
      count.textContent = shown ? shown + (shown === 1 ? ' publication' : ' publications') : 'No publications found. Try another search or filter.';
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        active = button.dataset.filter;
        buttons.forEach(function (other) { other.setAttribute('aria-pressed', String(other === button)); });
        apply();
      });
    });
    search.addEventListener('input', apply);
    apply();
  }

  // Time-based motion and pointer parallax give the conceptual atlas depth.
  // The inline SVG remains available if canvas is unsupported or scripts are disabled.
  const canvas = document.getElementById('cell-atlas');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  const wrapper = canvas.parentElement;
  const source = wrapper.querySelector('svg');
  const points = Array.from(source.querySelectorAll('circle[data-cell]')).map(function (circle) {
    return { x: +circle.getAttribute('cx'), y: +circle.getAttribute('cy'), r: +circle.getAttribute('r'), color: circle.getAttribute('fill'), alpha: +circle.getAttribute('opacity'), z: +circle.getAttribute('data-depth') };
  });
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, frame = 0, visible = true, phase = 0, lastTime = null, paused = false;
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const motionToggle = document.querySelector('.motion-toggle');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  function draw() {
    context.clearRect(0, 0, width, height);
    const scale = Math.min(width / 620, height / 510);
    const offsetX = (width - 620 * scale) / 2;
    const offsetY = (height - 510 * scale) / 2;
    context.save();
    context.translate(offsetX, offsetY);
    context.scale(scale, scale);
    context.strokeStyle = '#d7d9cf';
    context.lineWidth = .65;
    context.beginPath();
    context.ellipse(319, 252, 255, 205, -.23, .23, 2.95);
    context.stroke();
    context.beginPath();
    context.moveTo(70, 328); context.lineTo(35, 328); context.moveTo(491, 155); context.lineTo(540, 115); context.lineTo(575, 115);
    context.stroke();
    const currentPhase = motion.matches ? 0 : phase;
    const yaw = motion.matches ? 0 : Math.sin(currentPhase * .7) * .24 + pointer.x * .18;
    const pitch = motion.matches ? 0 : Math.sin(currentPhase * .5) * .08 + pointer.y * .12;
    const breath = 1 + Math.sin(currentPhase) * .016;
    const cosYaw = Math.cos(yaw), sinYaw = Math.sin(yaw);
    const cosPitch = Math.cos(pitch), sinPitch = Math.sin(pitch);
    context.translate(319, 252 + Math.sin(currentPhase * .8) * 4);
    context.rotate(Math.sin(currentPhase * .45) * .025);
    context.scale(breath, breath);
    points.forEach(function (p) {
      const x = p.x - 319, y = p.y - 252, z = (p.z - .5) * 160;
      const rotatedX = x * cosYaw + z * sinYaw;
      const rotatedZ = z * cosYaw - x * sinYaw;
      // Subtract each point's initial offset so the resting frame matches the SVG.
      const ripple = (Math.sin(currentPhase * 1.25 + p.y * .026) - Math.sin(p.y * .026)) * 3.2;
      context.globalAlpha = p.alpha;
      context.fillStyle = p.color;
      context.beginPath();
      context.arc(rotatedX + ripple, y * cosPitch - rotatedZ * sinPitch, p.r, 0, Math.PI * 2);
      context.fill();
    });
    context.globalAlpha = 1;
    context.restore();
  }
  function resize() {
    const rect = wrapper.getBoundingClientRect();
    width = rect.width; height = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }
  function animate(time) {
    frame = 0;
    if (!visible || document.hidden || motion.matches || paused) { lastTime = null; return; }
    if (lastTime === null) lastTime = time;
    const elapsed = time - lastTime;
    if (elapsed >= 32) {
      const seconds = Math.min(elapsed, 100) / 1000;
      phase += seconds * .65;
      const easing = 1 - Math.exp(-seconds * 5);
      pointer.x += (pointer.targetX - pointer.x) * easing;
      pointer.y += (pointer.targetY - pointer.y) * easing;
      draw();
      lastTime = time;
    }
    frame = requestAnimationFrame(animate);
  }
  function syncAnimation() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastTime = null;
    if (visible && !document.hidden && !motion.matches && !paused) frame = requestAnimationFrame(animate);
    else draw();
  }
  resize();
  wrapper.classList.add('is-animated');
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(wrapper);
  else window.addEventListener('resize', resize);
  if ('IntersectionObserver' in window) new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; syncAnimation(); }).observe(wrapper);
  document.addEventListener('visibilitychange', syncAnimation);
  wrapper.addEventListener('pointermove', function (event) {
    if (paused || motion.matches || !canHover.matches) return;
    const rect = wrapper.getBoundingClientRect();
    pointer.targetX = ((event.clientX - rect.left) / rect.width - .5) * 2;
    pointer.targetY = ((event.clientY - rect.top) / rect.height - .5) * 2;
  });
  wrapper.addEventListener('pointerleave', function () {
    pointer.targetX = 0;
    pointer.targetY = 0;
  });
  function updateMotionPreference() {
    pointer.x = pointer.y = pointer.targetX = pointer.targetY = 0;
    if (motionToggle) motionToggle.hidden = motion.matches;
    syncAnimation();
  }
  if (motionToggle) {
    motionToggle.hidden = motion.matches;
    motionToggle.addEventListener('click', function () {
      paused = !paused;
      motionToggle.setAttribute('aria-pressed', String(paused));
      motionToggle.textContent = paused ? 'Play motion' : 'Pause motion';
      syncAnimation();
    });
  }
  motion.addEventListener('change', updateMotionPreference);
  syncAnimation();
})();
