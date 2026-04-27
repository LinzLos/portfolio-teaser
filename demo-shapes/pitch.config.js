/* ============================================================
   pitch.config.js — DEMO: shapes hero mode
   Generic product-design placeholder. Replace every [bracketed]
   value with your own copy. See template-pitch/README.md for
   the full field reference.
   ============================================================ */
// EDIT ME — replace every placeholder with your own copy.
// See template-pitch/README.md for the full field reference.
window.PITCH = {

  // Logo link in hero + footer. Replace shared/logo.svg with your own mark.
  logo: {
    href: 'https://your-site.com',
    alt:  'Your Name'
  },

  meta: {
    title: '[Your Name] — Product Design',
    description: 'Product design for technical platforms. Systems thinking, craft, and code.',
    image: 'https://your-deploy-url.netlify.app/shared/portfolio-teaser-social-preview.png'
  },

  hero: {
    mode: 'shapes',
    tagline: [
      { text: 'When the system' },
      { text: 'goes opaque' },
      { text: 'show the logic.', accent: true }
    ]
  },

  range: {
    label: 'The Range',
    headline: 'Full stack.<br><em>Zero gaps.</em>',
    pillars: [
      {
        number: '01',
        title: 'Platform Design',
        body: 'Technical products for technical users. Designing for platforms where the audience knows the domain deeply — which raises the bar for design, not lowers it. State management, data-dense interfaces, progressive disclosure for expert workflows.',
        proof: '[Company] &nbsp;·&nbsp; [Platform type] &nbsp;·&nbsp; [Scale indicator]'
      },
      {
        number: '02',
        title: 'AI Workflow',
        body: 'Designing with and for AI systems. Building tooling that makes agent behavior legible, outputs trustworthy, and feedback loops tight. Familiar with the full stack of how these systems behave — not just the UI surface.',
        proof: '[Company] &nbsp;·&nbsp; [Project or tool name] &nbsp;·&nbsp; [Outcome]'
      },
      {
        number: '03',
        title: 'Prototype & Code',
        body: 'React / TypeScript. Building to think, not to hand off. When the build doesn\'t match the vision, the vision gets built anyway. No waiting on engineering to find out if an idea holds.',
        proof: '<a href="https://yourprototype.example.com" target="_blank" rel="noopener" class="pillar-link">yourprototype.example.com</a> &nbsp;·&nbsp; <a href="https://yourprototype2.example.com" target="_blank" rel="noopener" class="pillar-link">yourprototype2.example.com</a>'
      },
      {
        number: '04',
        title: 'Design Systems',
        body: 'Systems that scale past the team that built them. Tokens, components, patterns — designed to reduce decisions at the feature level so teams move faster. Built to engineering specs, not handed off as a Figma file.',
        proof: '[Company] &nbsp;·&nbsp; [N components] &nbsp;·&nbsp; [N teams or products]'
      }
    ]
  },

  statement: {
    label: 'For [Company]',
    lines: [
      { text: "You're" },
      { text: 'building' },
      { text: 'the' },
      { text: 'control', accent: true },
      { text: 'layer.',  accent: true }
    ],
    paragraphs: [
      'Between what the system does and what practitioners need to understand before they act on it. Someone has to design where that judgment happens.',
      'I\'ve built it before. [One sentence describing the most relevant prior work.] The design decisions were hard in the same ways.',
      'The kind of problem worth solving.'
    ]
  },

  cta: {
    label: 'One designer. Full stack.',
    headline: [
      { text: "Let's" },
      { text: 'Talk.', accent: true }
    ],
    links: [
      { label: 'Portfolio @ yourname.com', href: 'https://yourname.com' },
      { label: 'hello@yourname.com',       href: 'mailto:hello@yourname.com' },
      { label: 'LinkedIn',                 href: 'https://linkedin.com/in/yourhandle' }
    ],
    name: '[Your Name]',
    meta: '[City, State] &nbsp;·&nbsp; [On-site or remote preference]'
  }
};
