/* ============================================================
   behavior.js — interaction layer
   Loaded AFTER render.js. Listens for `pitch:hydrated` so we
   wire against the real (rendered) DOM.
   ============================================================ */
function __pitchInit() {
  if (window.__pitchInitialized) return;
  window.__pitchInitialized = true;
  const isPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const noHover  = !window.matchMedia('(hover: hover)').matches;

  // ── Fade hero out on scroll ──
  (function () {
    const hero = document.getElementById('hero');
    if (!hero) return;
    function update() {
      const heroH = hero.offsetHeight || window.innerHeight;
      const raw   = Math.max(0, Math.min(1, window.scrollY / heroH));
      hero.style.opacity = raw < 0.8 ? 1 : Math.max(0, 1 - (raw - 0.8) / 0.2);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  })();

  // ── Mouse parallax ──
  if (isPointer) {
    const heroBg   = document.querySelector('.hero-bg');
    const heroText = document.querySelector('.hero-tagline');
    let bgX = 0, bgY = 0, bgTX = 0, bgTY = 0;
    let txX = 0, txY = 0, txTX = 0, txTY = 0;

    document.addEventListener('mousemove', e => {
      const nx = (e.clientX / window.innerWidth  - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      bgTX = -nx * 1;   bgTY = -ny * 0.5;
      txTX =  nx * 0.3; txTY =  ny * 0.15;
    });

    (function loop() {
      bgX += (bgTX - bgX) * 0.02;
      bgY += (bgTY - bgY) * 0.02;
      txX += (txTX - txX) * 0.02;
      txY += (txTY - txY) * 0.02;
      if (heroBg)   heroBg.style.transform   = `translate(${bgX}%, ${bgY}%)`;
      if (heroText) heroText.style.transform = `translate(${txX}%, ${txY}%)`;
      requestAnimationFrame(loop);
    })();
  }

  // ── Scroll reveals ──
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: .12 });
  document.querySelectorAll('.statement-para, .statement-label').forEach(el => io.observe(el));

  // ── Section dividers ──
  (() => {
    const dividers = document.querySelectorAll('.section-divider');
    if (!dividers.length) return;
    const travel = () => Math.min(window.innerHeight * 0.55, 520);
    let ticking = false;
    function update() {
      ticking = false;
      const tv = travel();
      const vh = window.innerHeight;
      dividers.forEach(d => {
        const r = d.getBoundingClientRect();
        const distFromBottom = vh - r.top;
        const p = Math.max(0, Math.min(1, distFromBottom / tv));
        d.style.transform = 'scaleX(' + p + ')';
      });
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  })();

  // ── Statement line reveal ──
  const stmtEl = document.getElementById('statementText');
  if (stmtEl) {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const lines = stmtEl.querySelectorAll('.st-line');
          if (noMotion) {
            lines.forEach(w => w.classList.add('visible'));
          } else {
            lines.forEach((w, i) => setTimeout(() => w.classList.add('visible'), i * 110));
          }
        }
      });
    }, { threshold: .15 }).observe(stmtEl);
  }

  // ── Decrypt interstitial ──
  (function () {
    const lines = document.querySelectorAll('#decrypt .decrypt-line');
    if (!lines.length) return;

    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const rnd = () => CHARS[Math.floor(Math.random() * CHARS.length)];

    // Per-line state so we can cancel an in-flight animation when the user
    // scrolls away and restart it cleanly when they return.
    const state = new WeakMap();
    lines.forEach(el => state.set(el, { rafId: 0, timeoutId: 0 }));

    function cancel(el) {
      const s = state.get(el);
      if (!s) return;
      if (s.rafId) { cancelAnimationFrame(s.rafId); s.rafId = 0; }
      if (s.timeoutId) { clearTimeout(s.timeoutId); s.timeoutId = 0; }
    }

    function setScrambled(el) {
      const finalText = el.dataset.final || el.textContent;
      el.textContent = Array.from(finalText, c => c === ' ' ? ' ' : rnd()).join('');
    }

    function scramble(el, finalText, durationMs) {
      const s = state.get(el);
      // Pre-fill with random chars matching length so layout is stable.
      const initial = Array.from(finalText, c => c === ' ' ? ' ' : rnd()).join('');
      el.textContent = initial;

      if (noMotion) {
        el.textContent = finalText;
        return;
      }

      const total = finalText.length;
      // Resolve word-by-word, left to right. Compute each character's lock
      // time as a normalized fraction (0..1) of the total duration based on
      // which word it belongs to, plus a small in-word jitter so the chars
      // within a word don't all snap on the same frame.
      const words = [];
      {
        let w = [];
        for (let i = 0; i < total; i++) {
          if (finalText[i] === ' ') {
            if (w.length) { words.push(w); w = []; }
          } else {
            w.push(i);
          }
        }
        if (w.length) words.push(w);
      }
      const wordCount = Math.max(1, words.length);
      // Each word gets a slot of duration; chars in that word lock within
      // the back portion of their slot so the word "snaps in" together.
      const locks = new Array(total).fill(1);
      words.forEach((indices, wi) => {
        const slotStart = wi / wordCount;
        const slotEnd = (wi + 1) / wordCount;
        const slotSpan = slotEnd - slotStart;
        // Lock window sits in the latter half of the slot.
        const lockStart = slotStart + slotSpan * 0.55;
        const lockEnd = slotStart + slotSpan * 0.98;
        indices.forEach(idx => {
          locks[idx] = lockStart + Math.random() * (lockEnd - lockStart);
        });
      });
      const start = performance.now();
      const CYCLE = 65; // ms between char re-rolls
      let lastRoll = 0;
      let rolling = initial.split('');

      function frame(now) {
        const t = (now - start) / durationMs; // 0..1
        if (now - lastRoll > CYCLE) {
          for (let i = 0; i < total; i++) {
            if (finalText[i] === ' ') { rolling[i] = ' '; continue; }
            if (t >= locks[i]) {
              rolling[i] = finalText[i];
            } else {
              rolling[i] = rnd();
            }
          }
          el.textContent = rolling.join('');
          lastRoll = now;
        }
        if (t < 1) {
          s.rafId = requestAnimationFrame(frame);
        } else {
          el.textContent = finalText;
          s.rafId = 0;
        }
      }
      s.rafId = requestAnimationFrame(frame);
    }

    let inView = false;
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !inView) {
          // Entering: start the decrypt run.
          inView = true;
          lines.forEach((el, i) => {
            const s = state.get(el);
            cancel(el);
            const finalText = el.dataset.final || el.textContent;
            // Slower, word-by-word resolve. ~2.4s for line 1, ~2.8s for line 2.
            const dur = 2400 + i * 400;
            const delay = i * 260;
            s.timeoutId = setTimeout(() => {
              s.timeoutId = 0;
              scramble(el, finalText, dur);
            }, delay);
          });
        } else if (!e.isIntersecting && inView) {
          // Leaving: cancel any in-flight animation and reset to a scrambled
          // state so the next entry replays the decrypt cleanly.
          inView = false;
          lines.forEach(el => {
            cancel(el);
            if (!noMotion) setScrambled(el);
          });
        }
      });
    }, { threshold: .35 }).observe(document.getElementById('decrypt'));

    // Pre-scramble at load so it doesn't flash final text before user scrolls.
    if (!noMotion) {
      lines.forEach(setScrambled);
    }
  })();

  // ── Horizontal scroll section ──
  (function () {
    const hScroll  = document.getElementById('hScroll');
    const hTrack   = document.getElementById('hTrack');
    const hProgress = document.getElementById('hProgress');
    const hDots    = document.getElementById('hDots');
    if (!hScroll || !hTrack) return;

    const MOBILE_MQ = window.matchMedia('(max-width: 768px)');

    let dotsWired = false;
    let trackScrollHandler = null;
    function wireDots() {
      if (dotsWired || !hDots) return;
      const dots = hDots.querySelectorAll('button');
      dots.forEach(btn => {
        btn.addEventListener('click', () => {
          const i = +btn.dataset.dot;
          const targets = hTrack.children;
          if (targets[i]) targets[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
        });
      });
      trackScrollHandler = () => {
        const vw = window.innerWidth;
        const i = Math.round(hTrack.scrollLeft / vw);
        dots.forEach((d, di) => d.classList.toggle('active', di === i));
      };
      hTrack.addEventListener('scroll', trackScrollHandler, { passive: true });
      dotsWired = true;
    }
    function unwireDots() {
      if (!dotsWired || !hDots) return;
      if (trackScrollHandler) hTrack.removeEventListener('scroll', trackScrollHandler);
      dotsWired = false;
    }

    let currentX = 0, targetX = 0, rafId = null;

    function setHeight() {
      const trackW = hTrack.scrollWidth;
      const viewW  = window.innerWidth;
      const extra  = Math.max(0, trackW - viewW);
      hScroll.style.height = (window.innerHeight + extra) + 'px';
    }
    function getProgress() {
      const trackW    = hTrack.scrollWidth;
      const viewW     = window.innerWidth;
      const maxScroll = Math.max(0, trackW - viewW);
      const raw = (window.scrollY - hScroll.offsetTop) / (hScroll.offsetHeight - window.innerHeight);
      return Math.max(0, Math.min(1, raw)) * maxScroll;
    }
    const lerp = (a, b, t) => a + (b - a) * t;

    function tick() {
      if (MOBILE_MQ.matches) return;
      targetX = getProgress();
      currentX = lerp(currentX, targetX, 0.045);
      hTrack.style.transform = 'translateX(' + (-currentX) + 'px)';

      const trackW = hTrack.scrollWidth;
      const viewW  = window.innerWidth;
      const maxX   = Math.max(1, trackW - viewW);
      if (hProgress) hProgress.style.width = (currentX / maxX * 100) + '%';

      if (Math.abs(currentX - targetX) > 0.1) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    }
    function onScroll() {
      if (MOBILE_MQ.matches) return;
      if (!rafId) rafId = requestAnimationFrame(tick);
    }
    function applyMobileMode() {
      const isMobile = MOBILE_MQ.matches;
      hScroll.classList.toggle('mobile-mode', isMobile);
      if (isMobile) {
        hScroll.style.height = '';
        hTrack.style.transform = '';
        wireDots();
      } else {
        unwireDots();
        setHeight();
        tick();
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      applyMobileMode();
      if (!MOBILE_MQ.matches) { setHeight(); tick(); }
    });
    applyMobileMode();
    if (!MOBILE_MQ.matches) { setHeight(); tick(); }
  })();

  // ── Tweaks panel ──
  (function () {
    const DEFAULTS = /*EDITMODE-BEGIN*/{
      "accent": "#F0C93A",
      "headlineScale": 1.00,
      "pillarHoverMs": 560,
      "dividerOn": true
    }/*EDITMODE-END*/;

    let state = Object.assign({}, DEFAULTS);
    try {
      const saved = JSON.parse(localStorage.getItem('lz-tweaks') || '{}');
      state = Object.assign(state, saved);
    } catch (e) {}

    const panel = document.getElementById('tweaksPanel');
    if (!panel) return;
    const $accent  = document.getElementById('twAccent');
    const $scale   = document.getElementById('twScale');
    const $scaleVal = document.getElementById('twScaleVal');
    const $hover   = document.getElementById('twHover');
    const $hoverVal = document.getElementById('twHoverVal');
    const $divider = document.getElementById('twDivider');
    const $close   = document.getElementById('twClose');

    function apply() {
      document.documentElement.style.setProperty('--accent', state.accent);
      document.documentElement.style.setProperty('--pillar-hover-ms', state.pillarHoverMs + 'ms');
      document.documentElement.style.setProperty('--headline-scale', state.headlineScale);
      document.querySelectorAll('.section-divider').forEach(div => {
        div.style.display = state.dividerOn ? '' : 'none';
      });
    }

    $accent.value  = state.accent;
    $scale.value   = state.headlineScale;
    $scaleVal.textContent = (+state.headlineScale).toFixed(2) + '×';
    $hover.value   = state.pillarHoverMs;
    $hoverVal.textContent = state.pillarHoverMs + 'ms';
    $divider.classList.toggle('on', !!state.dividerOn);

    function persist(patch) {
      Object.assign(state, patch);
      try { localStorage.setItem('lz-tweaks', JSON.stringify(state)); } catch (e) {}
      try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: patch }, '*'); } catch (e) {}
      apply();
    }

    $accent.addEventListener('input', e => persist({ accent: e.target.value }));
    $scale.addEventListener('input', e => {
      const v = parseFloat(e.target.value);
      $scaleVal.textContent = v.toFixed(2) + '×';
      persist({ headlineScale: v });
    });
    $hover.addEventListener('input', e => {
      const v = parseInt(e.target.value, 10);
      $hoverVal.textContent = v + 'ms';
      persist({ pillarHoverMs: v });
    });
    function toggleSwitch($el, key) {
      const on = !$el.classList.contains('on');
      $el.classList.toggle('on', on);
      persist({ [key]: on });
    }
    $divider.addEventListener('click', () => toggleSwitch($divider, 'dividerOn'));
    $divider.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleSwitch($divider, 'dividerOn'); }
    });

    $close.addEventListener('click', () => {
      panel.classList.remove('open');
      try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch (e) {}
    });

    window.addEventListener('message', (e) => {
      const d = e.data;
      if (!d || typeof d !== 'object') return;
      if (d.type === '__activate_edit_mode')   panel.classList.add('open');
      if (d.type === '__deactivate_edit_mode') panel.classList.remove('open');
    });
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}

    apply();
  })();
}

// Initialize as soon as the DOM is rendered. Two paths:
// 1. render.js fires "pitch:hydrated" — listen for it.
// 2. render.js already ran (cached, fast) — detect by presence of pillars.
document.addEventListener('pitch:hydrated', __pitchInit);
if (window.__pitchHydrated || document.querySelectorAll('.h-pillar').length > 0) {
  __pitchInit();
}
