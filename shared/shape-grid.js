/* ============================================================
   shape-grid.js
   Reactive tiled-square background for the hero.
   Vanilla canvas, no deps.

   Adapted from the "Squares" component in React Bits
   (https://github.com/DavidHDev/react-bits) by David Haz, MIT.
   Ported from React to vanilla canvas; drift speed, hover trail,
   and fade reshaped for this site. See shared/CREDITS.md.

   Behavior
   - Tiles squares of size SQUARE_SIZE across the canvas.
   - Slow continuous drift (SPEED px/frame) on the diagonal so the
     grid feels alive without the user touching it.
   - On hover, fills the cell under the cursor + the last
     HOVER_TRAIL cells with HOVER_FILL, fading older cells out.
   - Pauses rAF when the host section leaves the viewport.
   - Disables hover interaction on touch devices.
   - Square size scales by viewport: 160 / 120 / 80.
   - Handles devicePixelRatio for retina sharpness.
   ============================================================ */
(function () {
  'use strict';

  const canvas = document.getElementById('shapeGridBg');
  if (!canvas) return;
  const host = canvas.closest('section') || canvas.parentElement;
  if (!host) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // ── Config ──────────────────────────────────────────────
  const SPEED        = 0.2;
  const BORDER_COLOR = '#2A2A2A';
  const HOVER_FILL   = '#262625';
  const HOVER_TRAIL  = 5;

  // Touch detection — coarse pointer or touch points present.
  const isTouch = (
    window.matchMedia('(hover: none), (pointer: coarse)').matches ||
    (navigator.maxTouchPoints || 0) > 0
  );
  const TRAIL = isTouch ? 0 : HOVER_TRAIL;

  function getSquareSize() {
    const w = window.innerWidth;
    if (w < 768)  return 80;
    if (w < 1024) return 120;
    return 160;
  }

  // ── State ───────────────────────────────────────────────
  let dpr      = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let cssW     = 0;
  let cssH     = 0;
  let square   = getSquareSize();
  let offsetX  = 0; // drift offsets, in CSS px
  let offsetY  = 0;
  let mouseX   = -9999;
  let mouseY   = -9999;
  // Trail of last cells the cursor occupied. Each entry is a
  // {col,row} key; index 0 is the freshest cell.
  const trail  = [];
  let running  = false;
  let inView   = false;
  let rafId    = 0;

  // ── Resize ──────────────────────────────────────────────
  function resize() {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const rect = canvas.getBoundingClientRect();
    cssW = rect.width;
    cssH = rect.height;
    canvas.width  = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    square = getSquareSize();
  }

  // ── Pointer ─────────────────────────────────────────────
  function setMouseFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }
  function clearMouse() {
    mouseX = -9999;
    mouseY = -9999;
    trail.length = 0;
  }

  if (!isTouch) {
    canvas.addEventListener('pointermove', setMouseFromEvent);
    canvas.addEventListener('pointerleave', clearMouse);
    canvas.addEventListener('pointerenter', setMouseFromEvent);
  }

  // ── Trail update ────────────────────────────────────────
  // Determine which cell (col,row) the cursor is over given the
  // current drift offset, then push it onto the trail (front),
  // dedup, and cap to TRAIL length.
  function updateTrail() {
    if (TRAIL <= 0 || mouseX < 0 || mouseY < 0) {
      trail.length = 0;
      return;
    }
    // Drift moves the grid; effective cursor in grid space is
    // cursor minus offset.
    const gx = mouseX - ((offsetX % square) + square) % square;
    const gy = mouseY - ((offsetY % square) + square) % square;
    const col = Math.floor(gx / square);
    const row = Math.floor(gy / square);
    const head = trail[0];
    if (!head || head.col !== col || head.row !== row) {
      // Remove duplicates of this cell deeper in the trail so a
      // back-and-forth pass doesn't leave ghosts.
      for (let i = trail.length - 1; i >= 0; i--) {
        if (trail[i].col === col && trail[i].row === row) trail.splice(i, 1);
      }
      trail.unshift({ col, row });
      while (trail.length > TRAIL) trail.pop();
    }
  }

  // ── Draw ────────────────────────────────────────────────
  function draw() {
    ctx.clearRect(0, 0, cssW, cssH);

    // Drift offsets folded into [0, square)
    const ox = ((offsetX % square) + square) % square;
    const oy = ((offsetY % square) + square) % square;

    // Fill trail cells first (under the borders).
    if (trail.length > 0) {
      ctx.fillStyle = HOVER_FILL;
      for (let i = 0; i < trail.length; i++) {
        const t = trail[i];
        // Fade older trail cells.
        const alpha = 1 - (i / Math.max(1, TRAIL));
        ctx.globalAlpha = alpha;
        const x = t.col * square + ox;
        const y = t.row * square + oy;
        ctx.fillRect(x, y, square, square);
      }
      ctx.globalAlpha = 1;
    }

    // Borders. Single-pixel strokes; align to half-pixel for
    // crispness at dpr=1, dpr=2 still looks right via setTransform.
    ctx.strokeStyle = BORDER_COLOR;
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Vertical lines
    for (let x = ox - square; x <= cssW + square; x += square) {
      const px = Math.round(x) + 0.5;
      ctx.moveTo(px, 0);
      ctx.lineTo(px, cssH);
    }
    // Horizontal lines
    for (let y = oy - square; y <= cssH + square; y += square) {
      const py = Math.round(y) + 0.5;
      ctx.moveTo(0, py);
      ctx.lineTo(cssW, py);
    }
    ctx.stroke();
  }

  // ── Loop ────────────────────────────────────────────────
  function frame() {
    if (!running) { rafId = 0; return; }
    offsetX += SPEED;
    offsetY += SPEED;
    updateTrail();
    draw();
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    if (!rafId) rafId = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
  }

  // ── Visibility (IntersectionObserver) ───────────────────
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      inView = e.isIntersecting;
      if (inView) start();
      else stop();
    });
  }, { threshold: 0 });
  io.observe(host);

  // Pause when tab is hidden too — saves battery on mobile.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (inView) start();
  });

  // ── Init ────────────────────────────────────────────────
  resize();
  window.addEventListener('resize', () => {
    resize();
    // Force a redraw even if paused so the grid doesn't look stale
    // on resize while off-screen.
    draw();
  });
  draw();
  // First frame happens once the IO fires; it always fires on observe.
})();
