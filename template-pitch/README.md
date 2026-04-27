# `pitch.config.js` — field reference

Every per-pitch folder owns one of these. The skeleton (`index.html`) and
all of `/shared/` are identical across pitches; only this file changes.

## Quickstart

```bash
cp -r template-pitch pitch-newco
# edit pitch-newco/pitch.config.js
# point a Netlify site at pitch-newco/ and deploy
```

## Top-level shape

```js
window.PITCH = {
  theme:     { ... },  // optional — CSS variable overrides
  meta:      { ... },
  hero:      { ... },
  range:     { ... },
  statement: { ... },
  cta:       { ... }
};
```

`meta`, `hero`, `range`, `statement`, and `cta` are required. `render.js`
logs a console error and bails if any are missing. `theme` is optional.

---

## `theme` (optional)

A flat object of CSS custom properties to override. Keys must start with `--`.
Applied to `:root` before anything else renders, so they cascade everywhere.

```js
theme: {
  '--accent':        '#91C499',          // replaces the default yellow
  '--hero-gradient': 'linear-gradient(to bottom, #17737A 0%, #C97479 100%)'
}
```

| property | effect |
|---|---|
| `--accent` | Color for tagline accents, links, underlines, interactive dots |
| `--hero-gradient` | Full `background` value for the gradient hero block |
| `--hero-tint` | Single-color tint for the default radial gradient (simpler than a full override) |
| `--bg` | Page background color |

---

## `meta`

| field         | type   | required | notes                                            |
|---------------|--------|----------|--------------------------------------------------|
| `title`       | string | yes      | `<title>` and tab name                           |
| `description` | string | yes      | `<meta name="description">`, used by link unfurls |

---

## `hero`

| field     | type     | required                         | notes                                                              |
|-----------|----------|----------------------------------|--------------------------------------------------------------------|
| `mode`    | `'photo' \| 'shapes' \| 'gradient' \| 'solid'` | yes | See modes below.                                   |
| `image`   | string   | required when `mode === 'photo'` | Path relative to the pitch's `index.html`. WebP recommended.       |
| `tagline` | array    | yes                              | 3–5 stacked headline lines.                                        |

### Hero modes

| mode       | look                              | needs                                  |
|------------|-----------------------------------|----------------------------------------|
| `'photo'`  | Cinematic image, mouse parallax   | `hero.image` path (WebP recommended)   |
| `'shapes'` | Reactive square-grid canvas       | nothing (adapted from React Bits — see [CREDITS](../shared/CREDITS.md)) |
| `'gradient'` | Subtle radial vignette          | nothing                                |
| `'solid'`  | Just the page bg, ultra-minimal   | nothing                                |

### `hero.tagline[i]`

| field    | type    | required | notes                                                  |
|----------|---------|----------|--------------------------------------------------------|
| `text`   | string  | yes      | Plain text. HTML is escaped — use `<br>` via separate lines. |
| `accent` | boolean | no       | When true, line renders in `--accent` color.           |

**Convention:** last line is the accent payoff. 3 lines is the rhythm.

---

## `range`

The horizontal-scroll section.

| field      | type   | required | notes                                                  |
|------------|--------|----------|--------------------------------------------------------|
| `label`    | string | yes      | Small section label above the headline (e.g. "The Range"). |
| `headline` | string | yes      | HTML allowed. `<em>` is the styled accent.             |
| `pillars`  | array  | yes      | 3–5 pillars. 4 is the rhythm.                          |

### `range.pillars[i]`

| field    | type   | required | notes                                                       |
|----------|--------|----------|-------------------------------------------------------------|
| `number` | string | yes      | Display number, e.g. `'01'`. Not auto-incremented — explicit. |
| `title`  | string | yes      | Pillar headline.                                            |
| `body`   | string | yes      | One paragraph. **HTML allowed** for inline links/emphasis.  |
| `proof`  | string | yes      | Receipts row. HTML allowed (use `class="pillar-link"` for inline `<a>`). |

---

## `statement`

The "You're building the X" section.

| field        | type   | required | notes                                                |
|--------------|--------|----------|------------------------------------------------------|
| `label`      | string | yes      | Small label above the statement (e.g. "For Acme").   |
| `lines`      | array  | yes      | One sentence broken into spans (one per line).       |
| `paragraphs` | array  | yes      | 2–4 paragraphs of supporting copy. HTML allowed.     |

### `statement.lines[i]`

| field    | type    | required | notes                                       |
|----------|---------|----------|---------------------------------------------|
| `text`   | string  | yes      | Plain text. Escaped on render.              |
| `accent` | boolean | no       | When true, span uses the accent color.      |

---

## `cta`

| field      | type   | required | notes                                                 |
|------------|--------|----------|-------------------------------------------------------|
| `label`    | string | yes      | Small one-liner above the headline.                   |
| `headline` | array  | yes      | Same shape as `statement.lines` — text + optional accent. |
| `links`    | array  | yes      | 1–4 contact/portfolio links.                          |
| `name`     | string | yes      | Footer name.                                          |
| `meta`     | string | yes      | Footer meta line. **HTML allowed** (use `&nbsp;` for spacing). |

### `cta.links[i]`

| field   | type   | required | notes                                                                                  |
|---------|--------|----------|----------------------------------------------------------------------------------------|
| `label` | string | yes      | Visible text.                                                                          |
| `href`  | string | yes      | URL or `mailto:`. `mailto:` links open in same tab; everything else opens in new tab. |

---

## HTML-allowed vs escaped

| Field                       | Behavior |
|-----------------------------|----------|
| `meta.title` / `description`| escaped  |
| `hero.tagline[i].text`      | escaped  |
| `range.label`               | escaped  |
| `range.headline`            | **HTML** |
| `pillars[i].title`          | escaped  |
| `pillars[i].body`           | **HTML** |
| `pillars[i].proof`          | **HTML** |
| `statement.label`           | escaped  |
| `statement.lines[i].text`   | escaped  |
| `statement.paragraphs[i]`   | **HTML** (wrapped in `<p>`) |
| `cta.label` / `name`        | escaped  |
| `cta.headline[i].text`      | escaped  |
| `cta.meta`                  | **HTML** |

Rule of thumb: short labels are escaped; long-form copy fields accept
HTML so you can embed inline links and emphasis.

---

## Adding a new pitch

```bash
cp -r template-pitch pitch-newco
```

Then edit `pitch-newco/pitch.config.js`. No HTML or script edits needed.

Deploy: point a fresh Netlify site at `pitch-newco/` as the publish dir.
The `netlify.toml` inside the folder handles the rest.
