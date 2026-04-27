/* ============================================================
   render.js — hydrates the skeleton from window.PITCH
   Loaded AFTER pitch.config.js in index.html.
   ============================================================ */
(function () {
  const P = window.PITCH;
  if (!P) {
    console.error('[render] window.PITCH not found. Did pitch.config.js fail to load?');
    return;
  }

  // ── Required-field check ──
  // Cheap guardrail: log loud + bail early on a missing top-level
  // section. Saves "why is half my page blank" debugging when a new
  // pitch.config.js forgets a block.
  const REQUIRED = ['meta', 'hero', 'range', 'statement', 'cta'];
  const missing = REQUIRED.filter(k => !P[k]);
  if (missing.length) {
    console.error('[render] PITCH is missing required keys:', missing);
    return;
  }

  // ── <head> ──
  document.title = P.meta.title;
  const title = P.meta.title || '';
  const desc  = P.meta.description || '';
  const image = P.meta.image || '';
  function setMeta(sel, val) { const el = document.querySelector(sel); if (el && val) el.setAttribute('content', val); }
  setMeta('meta[name="description"]',        desc);
  setMeta('meta[property="og:title"]',       title);
  setMeta('meta[property="og:description"]', desc);
  setMeta('meta[property="og:image"]',       image);
  setMeta('meta[name="twitter:title"]',      title);
  setMeta('meta[name="twitter:description"]',desc);
  setMeta('meta[name="twitter:image"]',      image);

  // ── Hero mode ──
  // 'photo'    → cinematic image with mouse parallax (default)
  // 'shapes'   → reactive square-grid canvas (React Bits-derived)
  // 'gradient' → subtle radial fade from --bg, no asset needed
  // 'solid'    → just --bg, ultra-minimal
  // CSS hides whichever blocks aren't selected; no DOM injection.
  const VALID_MODES = ['photo', 'shapes', 'gradient', 'solid'];
  const heroMode = VALID_MODES.includes(P.hero.mode) ? P.hero.mode : 'photo';
  const heroEl = document.getElementById('hero');
  if (heroEl) {
    heroEl.classList.add(`hero--${heroMode}`);
  }

  // Per-pitch theme overrides — apply any CSS variables defined in PITCH.theme.
  if (P.theme && typeof P.theme === 'object') {
    Object.entries(P.theme).forEach(([prop, val]) => {
      document.documentElement.style.setProperty(prop, val);
    });
  }

  // ── Logo ──
  // Optional PITCH.logo overrides href and alt on both logo elements.
  // To swap the image file, replace shared/logo.svg in your fork.
  if (P.logo) {
    ['.hero-logo', '.cta-mark'].forEach(sel => {
      const a = document.querySelector(sel);
      if (!a) return;
      if (P.logo.href) { a.href = P.logo.href; a.target = '_blank'; a.rel = 'noopener'; }
      if (P.logo.alt)  { a.setAttribute('aria-label', P.logo.alt); const img = a.querySelector('img'); if (img) img.alt = P.logo.alt; }
    });
  }

  // Photo hero: set the image via CSS var so the stylesheet stays asset-agnostic.
  // Accepts either P.hero.image (string) or P.hero.photo.src (object form).
  const heroImage = P.hero.image || (P.hero.photo && P.hero.photo.src);
  if (heroImage) {
    document.documentElement.style.setProperty('--hero-image', `url("${heroImage}")`);
  }

  // ── Hero tagline ──
  const tagline = document.getElementById('heroTaglineLines') || document.getElementById('heroTagline');
  if (tagline && Array.isArray(P.hero.tagline)) {
    tagline.innerHTML = P.hero.tagline
      .map((line, i) => {
        const cls = ['ht-line', `ht-line-${i + 1}`];
        if (line.accent) cls.push('ht-accent');
        return `<p class="${cls.join(' ')}">${escapeHtml(line.text)}</p>`;
      })
      .join('');
  }

  // ── Range section ──
  const rangeIntro = document.getElementById('rangeIntro');
  if (rangeIntro) {
    rangeIntro.innerHTML = `
      <div class="section-label">${escapeHtml(P.range.label)}</div>
      <div class="range-headline">${P.range.headline}</div>
    `;
  }

  const track = document.getElementById('hTrack');
  const dotsContainer = document.getElementById('hDots');
  if (track && Array.isArray(P.range.pillars)) {
    // Wipe existing pillars while preserving the intro panel and end spacer
    track.querySelectorAll('.h-pillar').forEach(el => el.remove());
    const endSpacer = track.querySelector('.h-end');

    P.range.pillars.forEach((pillar, idx) => {
      const el = document.createElement('div');
      el.className = 'h-pillar';
      el.innerHTML = `
        <div class="pillar-circle" aria-hidden="true"></div>
        <div class="pillar-number">${escapeHtml(pillar.number)}</div>
        <div class="pillar-title">${escapeHtml(pillar.title)}</div>
        <p class="pillar-body">${pillar.body}</p>
        <div class="pillar-proof">${pillar.proof}</div>
      `;
      track.insertBefore(el, endSpacer);
    });

    // Rebuild dots: intro + 1 per pillar
    if (dotsContainer) {
      const total = P.range.pillars.length + 1;
      dotsContainer.innerHTML = '';
      for (let i = 0; i < total; i++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.dataset.dot = i;
        if (i === 0) b.classList.add('active');
        b.setAttribute('aria-label',
          i === 0 ? 'Intro' : (P.range.pillars[i - 1].title || `Section ${i}`));
        dotsContainer.appendChild(b);
      }
    }
  }

  // ── Statement ──
  const stmtLabel = document.getElementById('statementLabel');
  if (stmtLabel) stmtLabel.textContent = P.statement.label;

  const stmtText = document.getElementById('statementText');
  if (stmtText && Array.isArray(P.statement.lines)) {
    stmtText.innerHTML = P.statement.lines
      .map(l => {
        const cls = l.accent ? 'st-line accent' : 'st-line';
        return `<span class="${cls}">${escapeHtml(l.text)}</span>`;
      })
      .join('');
  }

  const stmtPara = document.getElementById('statementPara');
  if (stmtPara && Array.isArray(P.statement.paragraphs)) {
    stmtPara.innerHTML = P.statement.paragraphs.map(p => `<p>${p}</p>`).join('');
  }

  // ── CTA ──
  const ctaLabel = document.getElementById('ctaLabel');
  if (ctaLabel) ctaLabel.textContent = P.cta.label;

  const ctaHeadline = document.getElementById('ctaHeadline');
  if (ctaHeadline && Array.isArray(P.cta.headline)) {
    ctaHeadline.innerHTML = P.cta.headline
      .map(l => {
        const cls = l.accent ? 'cta-line accent' : 'cta-line';
        return `<span class="${cls}">${escapeHtml(l.text)}</span>`;
      })
      .join('');
  }

  const ctaLinks = document.getElementById('ctaLinks');
  if (ctaLinks && Array.isArray(P.cta.links)) {
    ctaLinks.innerHTML = P.cta.links
      .map(l => {
        const target = (l.href || '').startsWith('mailto:') ? '' : ' target="_blank" rel="noopener"';
        return `<a href="${escapeAttr(l.href)}"${target} class="cta-link"><span>${escapeHtml(l.label)}</span></a>`;
      })
      .join('');
  }

  const ctaName = document.getElementById('ctaName');
  if (ctaName) ctaName.textContent = P.cta.name;
  const ctaMeta = document.getElementById('ctaMeta');
  if (ctaMeta) ctaMeta.innerHTML = P.cta.meta;

  // Helpers
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, '&quot;');
  }

  // Signal that hydration is complete so behavior.js can wire up listeners
  // against the now-real DOM. Mark a flag too, in case behavior.js loads
  // AFTER this synchronous dispatch and would otherwise miss the event.
  window.__pitchHydrated = true;
  document.dispatchEvent(new CustomEvent('pitch:hydrated'));
})();
