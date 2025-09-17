# UWRO Static i18n Build

This repo builds a fully static, multi-locale site from a single `index.html`.

- Localized outputs: `dist/<locale>/index.html` (e.g., `dist/en/`, `dist/es/` …)
- Shared assets copied once into `dist/` (`style.css`, `js/`, `images/`, `logos/`, `svg/`, `Religion-icons/`)
- SEO: per-locale `html[lang]`, `dir` for RTL, `hreflang` alternates, optional canonical via `SITE_BASE_URL`

## Prerequisites

- Node 18+ recommended

## Install

```
npm install
```

## Develop

1. Edit content in `index.html` as the source of truth (English).
2. Add or update translations in `locales/<code>.json`.
   - Use the `selectors` map to target nodes with CSS selectors and replace:
     - `text`: sets textContent
     - `html`: sets innerHTML (use sparingly)
     - `attr`: sets attributes (e.g., placeholders, aria-labels)
   - Prefer precise selectors (scoped with section IDs, `nth-of-type`) to avoid accidental matches.
3. Build and preview:

```
npm run build
npm run preview
# Open http://localhost:4173/en/ or /es/, /fr/, etc.
```

Tip: the root `dist/index.html` auto-redirects to the best-matching locale (falling back to `en`).

## Build

```
# Optional canonical base URL (used to inject <link rel=canonical>)
SITE_BASE_URL="https://your-domain.com" npm run build
```

Outputs structure:

```
dist/
  en/index.html
  es/index.html
  fr/index.html
  de/index.html
  ar/index.html
  zh/index.html
  ru/index.html
  pt/index.html
  hi/index.html
  ja/index.html
  style.css
  js/
  images/
  logos/
  svg/
  Religion-icons/
```

## Adding/Editing Translations

- Files: `locales/<locale>.json`
- Minimal shape:

```
{
  "_meta": { "dir": "ltr" },
  "document.title": "Localized Title",
  "selectors": {
    "h1.hero-title": { "text": "..." },
    ".hero-text": { "text": "..." },
    "input[type='email']": { "attr": { "placeholder": "...", "aria-label": "..." } }
  }
}
```

- RTL languages: set `"_meta": { "dir": "rtl" }`. The builder sets `<html dir>` accordingly.
- If a string is missing in a locale, the original English from `index.html` will remain.

## Deployment (DigitalOcean or any static host)

- Point your web server (Nginx, DO App Platform Static Site, etc.) to serve the `dist/` folder as the document root.
- No server code is required.
- All paths are relative; locales are subfolders (e.g., `/es/`, `/ar/`).

## Notes

- We currently transform strings by CSS selectors. Keep HTML structure stable or adjust selectors in `locales/*.json`.
- For strings inside JS/JSX, either:
  - keep English initially, or
  - expose `window.__LOCALE__` / `window.__I18N__` from the localized HTML and have scripts read translated values.

## Troubleshooting

- After HTML structure changes, rebuild (`npm run build`) and verify selectors still match.
- If `canonical` is missing, ensure `SITE_BASE_URL` is set when building.
- RTL: check for layout quirks; add small CSS overrides if needed.
