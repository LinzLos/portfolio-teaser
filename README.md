# portfolio-teaser — Lindsay Zuñiga

A static portfolio pitch template. One shared engine, one config file per pitch,
deployed to Netlify with no build step.

> **Reusable as a template.** Click "Use this template" on GitHub, or clone and replace the demo config.

## Quickstart

```bash
# 1. Clone or "Use this template" on GitHub
git clone https://github.com/<you>/<repo>.git portfolio-teaser
cd portfolio-teaser

# 2. Copy the template folder
cp -r template-pitch pitch-acme

# 3. Edit one file — pitch-acme/pitch.config.js
#    See template-pitch/README.md for the full field reference.

# 4. Preview locally
python3 -m http.server 8000
# then open http://localhost:8000/pitch-acme/

# 5. Deploy to Netlify — connect the repo, publish dir = "."
```

No build step. No HTML edits. No script edits.

## Folder structure

```
/
├── shared/                   ← The engine. Used by every pitch.
│   ├── styles.css
│   ├── render.js             ← Hydrates the skeleton from window.PITCH
│   ├── shape-grid.js         ← Reactive square-grid hero (mode: 'shapes')
│   ├── behavior.js           ← Parallax, hScroll, reveals, tweaks panel
│   ├── fonts/                ← Million-* display font (4 weights)
│   ├── hero-mountain.webp    ← Default cinematic hero image (photo mode)
│   ├── logo-zunigo.svg
│   └── favicon.png
│
├── template-pitch/           ← Canonical empty pitch — copy this.
│   ├── index.html            ← Skeleton (identical across all pitches)
│   ├── pitch.config.js       ← Blank config with every field documented
│   └── README.md             ← Field-by-field config reference
│
├── demo-shapes/              ← Live demo — hero mode: shapes
│
├── netlify.toml              ← Root deploy config (redirects, cache headers)
├── LICENSE                   ← MIT
└── README.md                 ← (this file)
```

## Hero modes

Pick per-pitch via `PITCH.hero.mode`:

| mode | look | needs |
|---|---|---|
| `'shapes'` | Reactive square-grid canvas | nothing — adapted from [React Bits](https://github.com/DavidHDev/react-bits) |
| `'photo'` | Cinematic image, mouse parallax | `hero.image` path (WebP recommended) |
| `'gradient'` | Subtle radial vignette | nothing |
| `'solid'` | Just the page bg, ultra-minimal | nothing |

## Deploy

Connect the repo to Netlify with publish dir set to `"."`. The root `netlify.toml` handles:

- Redirect `/ → /demo-shapes/`
- `no-cache` on shared JS and CSS (no manual cache-buster bumps needed)
- Long-cache `immutable` on fonts, images, and SVGs
- Security headers

## Load order

```html
<script src="pitch.config.js"></script>        <!-- defines window.PITCH -->
<script src="../shared/render.js"></script>    <!-- builds DOM, fires "pitch:hydrated" -->
<script src="../shared/shape-grid.js"></script><!-- only paints if mode === 'shapes' -->
<script src="../shared/behavior.js"></script>  <!-- listens for "pitch:hydrated" -->
```

Don't reorder these tags.

## Field reference

See **[`template-pitch/README.md`](./template-pitch/README.md)** for the full `pitch.config.js` field reference.

## Credits

- **Default hero image** — Photo by [Brice Cooper](https://unsplash.com/@brice_cooper18) on [Unsplash](https://unsplash.com/photos/a-road-with-a-mountain-in-the-background-LazyKRVBDrY)
- **Square-grid hero (`mode: 'shapes'`)** — adapted from the "Squares" component in [React Bits](https://github.com/DavidHDev/react-bits) (MIT)
- Full attribution: [`shared/CREDITS.md`](./shared/CREDITS.md)

## License

MIT. See [LICENSE](./LICENSE).

## Known follow-ups

- [x] ~~Re-export `hero-mountain.png` as WebP~~ ✓
- [x] ~~Carve out `/template-pitch/` for clean cloning~~ ✓
- [x] ~~Add `hero.mode` switch~~ ✓
- [x] ~~Add LICENSE + .gitignore~~ ✓
- [x] ~~Fix Netlify deploy model (root publish, shared cache headers)~~ ✓
- [ ] Add a JSON Schema or TS types for `PITCH` so configs validate
- [ ] Migrate to React/Vite when the multi-pitch pattern starts to chafe
