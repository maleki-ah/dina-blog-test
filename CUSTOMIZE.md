# Customization Guide

This guide walks through every aspect of personalizing your as-folio site.

---

## Table of contents

1. [Deployment config](#1-deployment-config)
2. [Site identity](#2-site-identity)
3. [Profile photo](#3-profile-photo)
4. [Social links](#4-social-links)
5. [About page content](#5-about-page-content)
6. [Blog posts](#6-blog-posts)
7. [Publications (BibTeX)](#7-publications-bibtex) — BibTeX fields, co-author links, citation badges
8. [People / Lab members](#8-people--lab-members)
9. [Announcements](#9-announcements)
10. [Dark mode](#10-dark-mode)
11. [Comments (Giscus / Disqus)](#11-comments-giscus--disqus)
12. [Analytics](#12-analytics)
13. [Newsletter](#13-newsletter)
14. [Cookie consent](#14-cookie-consent)
15. [Search](#15-search)
16. [Deployment base path](#16-deployment-base-path)
17. [Enabling / disabling features](#17-enabling--disabling-features)
18. [Custom styles](#18-custom-styles)
19. [Footer position](#19-footer-position)

---

## 1. Deployment config

Deployment is env-first. These values flow through the app like this:

```text
ASTRO_SITE / ASTRO_BASE
→ astro.config.mjs
→ import.meta.env.SITE / import.meta.env.BASE_URL
→ src/config/site.ts
```

That means `src/config/site.ts` reads the resolved deployment values, but it is not the
source of truth for them.

### Local development

Copy `.env.example` to `.env`. For this repository (published to
`https://dina-lab-iust.github.io/blog/`), the file already contains:

```dotenv
ASTRO_SITE=https://dina-lab-iust.github.io
ASTRO_BASE=/blog
```

Rules:

- `ASTRO_SITE` should be the site origin only, with no trailing slash
- use `ASTRO_BASE=` for root deployments
- if you accidentally set `ASTRO_BASE=/`, the config normalizes it back to `''`

### GitHub Pages

In the `blog` repository, set repository variables in **Settings** → **Secrets and variables** → **Actions**:

- `ASTRO_SITE=https://dina-lab-iust.github.io`
- `ASTRO_BASE=/blog`

Then enable **Settings** → **Pages** → Source: **GitHub Actions**. Every push to
`main` builds and deploys to `https://dina-lab-iust.github.io/blog/` automatically
(see `.github/workflows/deploy.yml`; the same values are baked in as fallbacks).

The deploy workflow reads those variables and passes them to the Astro build.

---

## 2. Site identity

Edit `src/config/site.ts`:

```typescript
export const site = {
  title: 'Your Name',
  description: 'Brief description of your site',
  lang: 'en',

  author: {
    name: 'Your Name',
    email: 'you@example.com',
    subtitle: 'Professor of Physics · MIT',
    moreInfo: `
      <p>Department of Physics</p>
      <p>77 Massachusetts Avenue</p>
      <p>Cambridge, MA 02139</p>
    `,
  },
};
```

`subtitle` and `moreInfo` support HTML.

`url` and `base` in `site.ts` are derived from Astro's resolved environment, so you normally
should not edit them directly. Use `ASTRO_SITE` and `ASTRO_BASE` instead.

---

## 3. Profile photo

Replace `public/assets/img/prof_pic.jpg` (or `.svg`, `.png`, `.webp`) with your own photo.

Update the path in `site.ts`:

```typescript
author: {
  avatar: '/assets/img/prof_pic.jpg',
}
```

Recommended: square image, at least 400×400 px.

---

## 4. Social links

Set any platform to `undefined` to hide it:

```typescript
socials: {
  email: 'you@example.com',
  github_username: 'your-github',
  x_username: undefined,               // hide X/Twitter
  linkedin_username: 'your-linkedin',
  scholar_userid: 'YOUR_SCHOLAR_ID',   // part after user= in Scholar URL
  orcid_id: '0000-0000-0000-0000',
  inspire_id: undefined,
  researchgate_username: undefined,
  arxiv_id: undefined,
  youtube_id: undefined,
  instagram_username: undefined,
  mastodon_url: undefined,
  bluesky_handle: 'you.bsky.social',
  medium_username: undefined,
  cv_pdf: '/assets/pdf/cv.pdf',        // link to your CV PDF
  rss_icon: true,
},
```

---

## 5. About page content

Edit `src/pages/index.astro` to change the bio text. The About page auto-pulls from:

- **Announcements**: up to `site.announcements.limit` items from `src/content/announcements/`
- **Latest posts**: up to `site.latestPosts.limit` posts from `src/content/posts/`
- **Selected papers**: entries with `selected = {true}` in `src/data/papers.bib`

All three sections can be disabled in `site.ts`.

---

## 6. Blog posts

Create `.md` or `.mdx` files in `src/content/posts/`:

```yaml
---
title: "Post Title"
date: 2024-06-01
lastmod: 2024-09-01  # optional: last modified date — shown in header and JSON-LD
description: "Shown in listings and meta tags"
tags: [physics, math]
categories: [science]
lang: en             # "en" (LTR, Inter) or "fa" (RTL, Vazirmatn). Default: "en"
authors: [mehrdad-ashtiani]  # slugs from src/content/people/*.md — linked to profiles
refs: [other-post-id]  # manual cross-references — rendered as References/منابع
math: true           # enable KaTeX rendering
toc: true            # sidebar table of contents (default: true)
pinned: false        # pin to top of blog listing
hidden: false        # hide from listing (accessible via URL)
draft: false         # exclude from listings and search index until published
image: /assets/img/post-banner.jpg  # optional: hero banner on the post + thumbnail on cards
---

Post body in Markdown/MDX.

Inline math: $E = mc^2$

Display math:
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

### Blog listing options

Control reading-speed estimate and the empty-state message:

```typescript
blog: {
  wordsPerMinute: 200,              // used to calculate estimated reading time
  emptyMessage: 'No posts yet. Check back soon!',
},
```

Posts in the listing are grouped by year automatically.

### Bilingual posts (English + Persian)

Set `lang` in frontmatter. English posts render LTR with Inter; Persian posts
render RTL with Vazirmatn. Code blocks, KaTeX math, and Mermaid diagrams always
stay LTR, even inside RTL pages.

```yaml
---
title: "خوش آمدید"
lang: fa
authors: [mehrdad-ashtiani]
---
```

UI strings (`min read`, `Updated`, `Blog`) switch per post via `site.i18n.ui`
in `src/config/site.ts`. The dictionary covers the full post chrome: `toc`
(فهرست مطالب), related-posts headings, share labels, `loadComments`, search
placeholder, skip-link, back-to-top, copy buttons, and newsletter texts.
`TOC.astro`, `RelatedPosts.astro`, `SocialShare.astro`, `Giscus.astro`,
`Newsletter.astro`, and `Navbar.astro` all accept a `lang` prop; `Post.astro`
and `Distill.astro` pass the post language down automatically. The navbar language switcher links the default
language to the clean URL and other languages via `?lang=`.

### Cross-references between posts

Add `refs` with post ids (file names without extension):

```yaml
refs: [research-vectors, dina-talks]
```

A numbered References (منابع in Persian posts) section with title links is
rendered below the post body. Unknown ids are skipped.

### Site-wide language switch (EN / فارسی)

Everything except post bodies follows the visitor's language choice: navbar,
footer, blog listing, tags, people headings, pagination labels,
search placeholder, dates, TOC title, share labels and buttons.

How it works: chrome strings carry `data-i18n="key"` attributes and the
`LabI18n.astro` engine (included in `Base.astro`) swaps them live from the
`site.i18n.ui` dictionary, persisting to `localStorage` (`?lang=` wins for
shareable links) with a pre-paint script that prevents RTL flash. Dynamic
templates use `{placeholders}` via `data-i18n-vars` JSON; dates use
`<time data-i18n-date="ISO">`. When adding a new chrome string, add the key
to both `en` and `fa` dicts and tag the element — never hardcode it.

Add `authors` with slugs matching files in `src/content/people/`:

```yaml
authors: [mehrdad-ashtiani, ali-ahmadi]
```

Names on post pages and cards link to `/members/<slug>/`. Unknown slugs render
as plain readable text. JSON-LD `author` uses the resolved names and
`inLanguage` carries the post language.

### Post images (thumbnail + hero banner)

Set `image` to a path under `public/` (e.g. `/assets/img/my-post.jpg`):

- **Cards**: the image appears as a thumbnail beside the post on listing pages.
- **Post page**: the same image renders as a rounded hero banner above the body
  (click-to-zoom included). Omit `image` for a text-only post.

### MDX components available in posts

```mdx
import VideoEmbed from '@components/VideoEmbed.astro';
import Tabs from '@components/Tabs.astro';

<VideoEmbed src="https://www.youtube.com/watch?v=..." />
```

### Per-post CDN widgets

Enable in frontmatter:

| Flag                   | What it loads           |
| ---------------------- | ----------------------- |
| `mermaid: true`        | Mermaid diagrams (robust loader with code fallback)        |
| `chart_js: true`       | Chart.js                |
| `echarts: true`        | Apache ECharts          |
| `vega: true`           | Vega/Vega-Lite          |
| `plotly: true`         | Plotly.js               |
| `pseudocode: true`     | pseudocode.js           |
| `typograms: true`      | Typograms               |
| `tikzjax: true`        | TikzJax                 |
| `map: true`            | Leaflet maps            |
| `img_comparison: true` | Image comparison slider |
| `code_diff: true`      | Diff2Html               |
| `gallery: true`        | PhotoSwipe gallery      |

---

## 7. Publications (BibTeX)

Edit `src/data/papers.bib`. Standard BibTeX format with extra as-folio fields:

```bibtex
@article{yourkey2024,
  % ── Standard BibTeX fields ──────────────────────────────────────────────
  title    = {Your Paper Title},
  author   = {Your Name and Coauthor Name},
  journal  = {Journal of Example},
  year     = {2024},
  volume   = {42},
  pages    = {1--10},
  doi      = {10.1000/xyz123},

  % ── Display / layout ────────────────────────────────────────────────────
  selected    = {true},               % show on About page under Selected Publications
  abbr        = {J. Ex.},             % short venue badge (e.g. NeurIPS, Nature)
  abstract    = {Your abstract.},
  annotation  = {Short note shown below authors as italic tooltip.},
  additional_info = {Workshop version also presented at ICML.},
  preview     = {paper-thumb.jpg},    % relative to publications.previewDir
  award       = {Best Paper Award},
  award_name  = {Best Paper},         % short badge label (defaults to award text)
  bibtex_show = {true},               % show Bib button (copies clean BibTeX)

  % ── Links ───────────────────────────────────────────────────────────────
  html    = {https://journal.example.com/article},  % landing page
  pdf     = {https://arxiv.org/pdf/...},            % URL or local path (relative to pdfDir)
  arxiv   = {2400.00001},                           % arXiv ID — auto-links to arxiv.org
  hal     = {hal-00000000},                         % HAL ID — auto-links to hal.science
  code    = {https://github.com/you/repo},
  slides  = {/assets/pdf/talk.pdf},
  poster  = {/assets/pdf/poster.pdf},
  supp    = {/assets/pdf/supplemental.pdf},
  video   = {https://www.youtube.com/watch?v=...},
  blog    = {https://example.com/blog-post},
  website = {https://project-page.example.com},

  % ── Citation metric badges (all optional) ───────────────────────────────
  google_scholar_id = {PAPER_ID},   % paper-level Scholar ID (from citation_for_view= in URL)
  altmetric         = {true},       % {true} uses DOI; or supply an explicit Altmetric ID
  dimensions        = {true},       % {true} uses DOI
  inspirehep_id     = {12345},      % InspireHEP literature record ID
}
```

The publication page groups entries by year, newest first. BibTeX is parsed at build time — no runtime dependency.

### Author highlighting and asset paths

The publication list italicises **your name** in author lists. Configure in `site.ts`:

```typescript
publications: {
  /** Last name used to italicise your name in author lists.
   *  Defaults to the last word of site.author.name — usually correct without setting. */
  authorLastName: undefined,   // e.g. 'Einstein' — omit to auto-derive

  /** Max authors shown before "and N more..." link. undefined = always show all. */
  maxAuthorLimit: 3,

  /** Show thumbnail images when `preview` is set in BibTeX. */
  thumbnails: true,

  /** Directory prefix for thumbnail images (value of the `preview` BibTeX field). */
  previewDir: '/assets/img/publication_preview/',

  /** Directory prefix for local PDF files (value of the `pdf` BibTeX field). */
  pdfDir: '/assets/pdf/',

  /** Enable or disable metric badge types globally. */
  badges: {
    altmetric: true,
    dimensions: true,
    googleScholar: true,
    inspirehep: true,
  },

  /** UI labels — override to translate or rename buttons. */
  labels: {
    abstract: 'Abs',
    bibtex: 'Bib',
    supp: 'Supp',
    searchPlaceholder: 'Search publications…',
    noResults: 'No publications match your search.',
  },
},
```

`authorLastName` auto-derives from `site.author.name`, so most users never need to set it explicitly.

### Co-author links

Add co-author profile links to `src/data/coauthors.yml`. Any author whose last name matches a key will get a hyperlink on the publications page:

```yaml
# src/data/coauthors.yml
# Key is the author's last name as it appears in the BibTeX `author` field.
Einstein:
  url: https://en.wikipedia.org/wiki/Albert_Einstein
  scholar: qc6CJjYAAAAJ
  orcid: 0000-0000-0000-0000

Podolsky:
  url: https://en.wikipedia.org/wiki/Boris_Podolsky
```

Supported keys per entry: `url` (profile link), `scholar` (Google Scholar ID), `orcid`.

### Citation counts

Citation counts for Google Scholar badges come from `src/data/citations.yml`, keyed by the `google_scholar_id` BibTeX field:

```yaml
# src/data/citations.yml — auto-generated, do not edit by hand
qyhmnyLat1gC: 14200 # EPR paper
```

**Refreshing counts:**

```bash
yarn citations:update
```

This calls the [OpenAlex API](https://openalex.org) (free, no auth) to fetch current counts for every paper that has both `doi` and `google_scholar_id` set. Results are written back to `citations.yml`.

`citations.yml` is also refreshed automatically before every production build (`prebuild` hook) and by the weekly GitHub Actions workflow (`.github/workflows/update-citations.yml`). The workflow commits the updated file back to the repo if any counts changed.

---

## 8. People / Lab members

Create `.md` files in `src/content/people/`:

```yaml
---
name: 'Member Name'
nameFa: 'نام عضو' # Persian name (shown when chrome is فارسی)
role: 'MSc Researcher'
roleFa: 'پژوهشگر' # Persian role
photo: /assets/img/people/member.jpg # local path or https:// URL
description: 'Focus: edge computing, federated learning'
descriptionFa: 'تمرکز: رایانش لبه، یادگیری فدرال'
website: https://member-site.com
github: github-username
linkedin: https://www.linkedin.com/in/handle # or plain username
scholar: SCHOLAR_ID
orcid: 0000-0000-0000-0000
importance: 1
group: current # 'supervisor' | 'current' | 'alumni'
---
```

Cards show one language at a time (English or Persian) following the site
language switch. The `supervisor` group renders under “Supervisor / استاد راهنما”.

---

## 9. Announcements

Create `.md` files in `src/content/announcements/`:

```yaml
---
date: 2024-06-01
pinned: false
---
Announcement text here. HTML and Markdown are supported.
[Link text](https://example.com) works too.
```

Announcements appear on the About page (if `site.announcements.enabled: true`) and on the dedicated `/news` page.

---

## 10. Dark mode

Dark mode is enabled by default (`site.features.darkmode: true`). The initial theme follows the OS preference.

To default to a specific theme:

```typescript
theme: {
  default: 'light',   // 'light' | 'dark' | 'system'
},
```

Users can always toggle with the sun/moon button in the navbar.

### Theme color

Override the primary accent color (used for links, active nav items, buttons, and badges)
in `site.ts`:

```typescript
theme: {
  default: 'system',
  color: {
    light: '#b509ac',  // accent color in light mode (any CSS color string)
    dark: '#2698ba',   // accent color in dark mode
  },
},
```

Set either value to `'auto'` to keep the built-in default for that mode.

**Preset palettes:**

| Name             | `light`   | `dark`    |
| ---------------- | --------- | --------- |
| Purple (default) | `#b509ac` | `#2698ba` |
| Blue             | `#0076df` | `#68c0d9` |
| Red              | `#ff3636` | `#f29105` |
| Green            | `#009f06` | `#b7d12a` |
| Orange           | `#f29105` | `#efcc00` |

---

## 11. Comments (Giscus / Disqus)

### Giscus (GitHub Discussions — recommended)

1. Go to [giscus.app](https://giscus.app) and follow the setup instructions
2. Copy the values into `site.ts`:

```typescript
giscus: {
  enabled: true,
  repo: 'username/repo',
  repoId: 'R_...',
  category: 'Comments',
  categoryId: 'DIC_...',
  mapping: 'title',
  strict: true,
  reactionsEnabled: true,
  inputPosition: 'bottom',
  darkTheme: 'dark',
  lightTheme: 'light',
  lang: 'en',
},
```

Giscus appears on all blog posts. Enable per-project with `giscus_comments: true` in project frontmatter.

### Disqus

Set your Disqus shortname in `site.ts` (leave empty to disable):

```typescript
comments: {
  disqusShortname: 'your-disqus-shortname',
},
```

Find your shortname in your Disqus admin dashboard → Settings → General → Shortname. Disqus and Giscus can coexist — both will appear on posts if both are configured.

---

## 12. Analytics

Set any analytics provider in `site.ts` (leave others as empty string `''`):

```typescript
analytics: {
  ga4: 'G-XXXXXXXXXX',          // Google Analytics 4
  cronitor: 'YOUR_SITE_ID',     // Cronitor RUM
  pirsch: 'YOUR_CODE',          // Pirsch.io
  openpanel: 'YOUR_CLIENT_ID',  // OpenPanel
  googleVerification: '',       // Google Search Console
  bingVerification: '',         // Bing Webmaster
},
```

All analytics scripts are loaded via Partytown (web worker) to avoid blocking the main thread. Only non-empty strings are injected.

---

## 13. Newsletter

Integration with [Loops.so](https://loops.so):

1. Create a form in Loops and copy the form endpoint
2. Enable in `site.ts`:

```typescript
features: {
  newsletter: true,
},
newsletter: {
  endpoint: 'https://app.loops.so/api/newsletter-form/YOUR_ID',
},
```

The newsletter form appears in the footer.

---

## 14. Cookie consent

Enable GDPR-compliant cookie consent:

```typescript
features: {
  cookieConsent: true,
},
```

The dialog uses [vanilla-cookieconsent](https://github.com/orestbida/cookieconsent) loaded from CDN. Users must accept before analytics scripts run.

---

## 15. Search

Search is enabled by default. It's powered by [Pagefind](https://pagefind.app) (build-time index) with [ninja-keys](https://github.com/ssleptsov/ninja-keys) for the ⌘K command palette UI.

To disable:

```typescript
features: {
  search: false,
},
```

The search index is rebuilt on every `yarn build` run.

---

## 16. Deployment base path

**User/org pages** (`username.github.io`):

```dotenv
ASTRO_SITE=https://username.github.io
ASTRO_BASE=
```

**Project pages** (`username.github.io/repo-name`):

```dotenv
ASTRO_SITE=https://username.github.io
ASTRO_BASE=/repo-name
```

`ASTRO_SITE` should not include the repo path or a trailing slash.

---

## 17. Enabling / disabling features

All feature flags live in the `features` block of `site.ts`:

```typescript
features: {
  darkmode: true,       // dark/light toggle in navbar
  search: true,         // ⌘K search
  progressBar: true,    // reading progress bar on posts
  backToTop: true,      // floating back-to-top button
  masonry: true,        // auto masonry layout for projects
  mediumZoom: true,     // click-to-zoom on images
  cookieConsent: false, // GDPR cookie dialog
  newsletter: false,    // newsletter form in footer
  videoEmbedding: false,// embed video links in bib entries
},
```

---

## 18. Custom styles

All theming is done through CSS custom properties defined in `src/styles/_colors.css`. Override them to change colors, fonts, and spacing site-wide:

```css
:root {
  --global-theme-color: #b509ac; /* accent color (default: purple) */
  --global-bg-color: #ffffff;
  --global-text-color: #000000;
  /* ... see _colors.css for full list */
}

[data-theme='dark'] {
  --global-theme-color: #b509ac;
  --global-bg-color: #1a1a1a;
  --global-text-color: #e0e0e0;
}
```

The easiest way to change the accent color is via `site.ts` (see §14 — Dark mode → Theme color). For other CSS variable overrides (background, text, borders, fonts, etc.), edit `src/styles/_colors.css` directly.

---

## 19. Footer position

Control where and whether the footer appears with `site.footer.position`:

```typescript
footer: {
  lastUpdated: false,
  impressum: undefined,
  position: 'sticky',   // 'sticky' | 'normal' | 'hidden'
},
```
// The footer line itself (`© <year> <lab name>`, linked to the lab site)
// is translated automatically via the `brandName` i18n key.

| Value      | Behaviour                                                                                 |
| ---------- | ----------------------------------------------------------------------------------------- |
| `'sticky'` | Footer is always visible at the bottom of the viewport (default, matches al-folio)        |
| `'normal'` | Footer sits at the natural bottom of the page content — only visible after scrolling down |
| `'hidden'` | Footer is not rendered at all                                                             |

When `'sticky'`, the body automatically gains `padding-bottom` to prevent page content from being obscured by the footer. The back-to-top button is also repositioned to sit above it.

---

## Lab workflow (branches, posts, images)

Branch model for student collaboration:

```text
main                  ← production; every push deploys to GitHub Pages
develop               ← template / design changes; merged into main via PR
<name>/<slug>         ← one post or news item; opened as PR into main,
                        deleted after merge (e.g. sina/fedavg-notebook)
```

Rules:

- **Posts & news** branch off `main`, not `develop`. One branch per item, named
  `<github-username>/<post-id>`. Open a PR into `main`; CI runs only the fast
  content check (`yarn content:check` — frontmatter, authors, references,
  images). No full build is needed for Markdown-only changes. Delete the branch
  after merge. Never commit `dist/` — the deploy workflow rebuilds it.
- **Template/design changes** branch off `develop` (or short-lived branches into
  `develop`), then PR `develop` → `main`. These run the full gate
  (type-check → lint → unit tests → build), which must pass before merging.
  `develop` is never deleted.
- **Sync**: before opening a PR, merge (or rebase onto) the latest target branch
  (`main` for posts, `develop` for template work) so CI validates the real result.
- Students only need `yarn dev` locally; `yarn content:check` before pushing
  catches frontmatter mistakes early.

Post images:

- Put them in a per-post folder: `public/assets/img/posts/<post-id>/cover.jpg`.
  Reference as `/assets/img/posts/<post-id>/cover.jpg` in the `image` frontmatter.
  The same file becomes the card thumbnail and the post hero banner.
- Without `image`, the post automatically gets a deterministic on-brand fallback
  banner (same artwork on its card and hero — no empty thumbnails ever).
- Keep images small (JPG/WebP, max ~1600px wide, under ~300KB). The whole repo —
  images included — is cloned by every student, so oversized assets slow everyone
  down. Prefer SVG for diagrams and abstract banners.
