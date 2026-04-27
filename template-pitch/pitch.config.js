/* ============================================================
   pitch.config.js — TEMPLATE
   Copy this folder to /pitch-<name>/, then edit this file.
   See ./README.md for a field-by-field reference.

   Schema (informal — JSDoc keeps editors happy):
   @typedef {Object} Pitch
   @property {{title:string, description:string}} meta
   @property {Hero}   hero
   @property {Range}  range
   @property {Statement} statement
   @property {CTA}    cta
   ============================================================ */
// EDIT ME — replace every placeholder with your own copy.
// See README.md in this folder for the full field reference.
window.PITCH = {

  // Logo link in hero + footer. Replace shared/logo.svg with your own mark.
  logo: {
    href: 'https://your-site.com',
    alt:  'Your Name'
  },

  meta: {
    title: 'Your Name — Pitch Title',
    description: 'One-line summary used for the meta description and link previews.',
    image: 'https://zunigo-portfolio-teaser.netlify.app/shared/portfolio-teaser-social-preview.png'
  },

  hero: {
    // 'photo'    → cinematic image with mouse parallax (uses .image below)
    // 'shapes'   → reactive square-grid canvas (React Bits-derived)
    // 'gradient' → subtle radial fade — no image asset needed
    // 'solid'    → just the page bg color — ultra-minimal
    mode: 'gradient',

    // Required only when mode === 'photo'. Path is relative to this index.html.
    // image: '../shared/hero-mountain.webp',

    // 3–5 stacked headline lines. Set accent: true to color a line.
    // Last line is usually the accent payoff.
    tagline: [
      { text: 'First line' },
      { text: 'second line' },
      { text: 'punchline.', accent: true }
    ]
  },

  range: {
    label: 'The Range',
    // HTML allowed (use <em>, <br>, etc.)
    headline: 'Full stack.<br><em>Zero gaps.</em>',
    pillars: [
      {
        number: '01',
        title: 'Pillar Title',
        body: 'One paragraph of substance. HTML allowed for inline emphasis or links.',
        proof: 'Receipt · Receipt · Receipt'
      },
      {
        number: '02',
        title: 'Pillar Title',
        body: '...',
        proof: '...'
      },
      {
        number: '03',
        title: 'Pillar Title',
        body: '...',
        proof: '...'
      },
      {
        number: '04',
        title: 'Pillar Title',
        body: '...',
        proof: '...'
      }
    ]
  },

  statement: {
    label: 'For [Company]',
    // Each line is a span. accent: true colors it.
    // The phrase reads as one sentence broken across lines.
    lines: [
      { text: "You're" },
      { text: 'building' },
      { text: 'the' },
      { text: 'THING.', accent: true }
    ],
    paragraphs: [
      'First paragraph: what the thing is, why it matters to their users.',
      'Second paragraph: where you have done analogous work. Receipts.',
      'Third paragraph: why this problem, why now. The "kind worth solving" close.'
    ]
  },

  cta: {
    label: 'One-line positioning statement.',
    headline: [
      { text: "Let's" },
      { text: 'Talk.', accent: true }
    ],
    links: [
      { label: 'Portfolio',  href: 'https://example.com' },
      { label: 'name@email', href: 'mailto:name@email.com' },
      { label: 'LinkedIn',   href: 'https://linkedin.com/in/you' }
    ],
    name: 'Your Name',
    meta: 'City, State &nbsp;·&nbsp; Open to opportunities'
  }
};
