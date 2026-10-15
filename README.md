# DINA LAB — Blog

**Research blog of DINA LAB — Distributed Infrastructure for NextGen Applications (آزمایشگاه دینا).**

Live: [https://dina-lab-iust.github.io/blog/](https://dina-lab-iust.github.io/blog/) ·
Main site: [https://dina-lab-iust.github.io/](https://dina-lab-iust.github.io/)

A bilingual (Persian + English, full RTL support) academic blog built with
[Astro](https://astro.build). Students publish by writing Markdown and opening
a pull request — pushing to `main` deploys automatically via GitHub Actions.

[![Astro](https://img.shields.io/badge/Astro-6-FF5D01?logo=astro&logoColor=white)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Features

- **Bilingual EN / فارسی** — per-post `lang` with automatic RTL/LTR, Vazirmatn +
  Inter typography, and a site-wide language switch (menu, footer, dates, search)
- **Academic writing** — KaTeX math, Mermaid diagrams, syntax highlighting,
  Jupyter-style notebook cells, image zoom, table of contents, reading progress
- **Publications** — BibTeX bibliography with clean copyable citations
- **People** — bilingual lab member cards (Supervisor / Members / Alumni)
- **Cross-references** — link posts to each other with `refs`
- **Search** — full-text bilingual search (Pagefind + ⌘K palette)
- **Glass UI** — DINA navy/orange identity, dark + light modes, cursor glow
- **RSS + sitemap** — auto-generated every build

---

## Writing a post (for students)

Create a Markdown file in `src/content/posts/` named after your post, e.g.
`my-topic.md` (English) or `my-topic-fa.md` (Persian):

```yaml
---
title: 'My Topic'
date: 2026-10-20
description: 'One-line summary for listings and previews'
tags: [federated-learning, edge]
categories: [research]
lang: en # or: fa
authors: [your-github-username-slug] # must match a file in src/content/people/
image: /assets/img/posts/my-topic/cover.jpg # optional banner + thumbnail
math: true # enable KaTeX
toc: true # table of contents sidebar
---
Your content here. Math works: $E = mc^2$.
```

Images live next to the post: `public/assets/img/posts/<post-id>/cover.jpg`
(keep them small — JPG/WebP, max ~1600px wide, under ~300KB; the whole repo is
cloned by everyone). Without `image`, the post automatically gets an on-brand
fallback banner — thumbnails are never empty.

News items go in `src/content/announcements/` (`date` + `pinned: true`
optional). Member profiles live in `src/content/people/` (English + Persian
name/role/bio blocks). See [CUSTOMIZE.md](CUSTOMIZE.md) for the full reference,
including BibTeX, Jupyter cells, Mermaid, and the Git branching model.

```bash
yarn dev # local preview at http://localhost:4321/blog/
```

---

## Branching model

```text
main                  ← production; every push deploys to GitHub Pages
develop               ← template / design changes; merged into main via PR
<name>/<slug>         ← one post or news item; PR into main, deleted after merge
```

- **Posts & news** branch off `main`. One branch per item. CI runs a fast
  content check (frontmatter, authors, references, images) — no full build
  needed. Sync with `main` before opening the PR; delete the branch after merge.
- **Template / design changes** go through `develop` with the full gate
  (type-check, lint, unit tests, build), then PR `develop` → `main`.
- Never commit `dist/` — it is rebuilt on every deploy.

---

## Project structure

```text
src/
├── config/site.ts       ← site settings + EN/FA interface strings (start here)
├── content/
│   ├── posts/           ← blog posts (.md / .mdx, en + fa)
│   ├── people/          ← lab member profiles, bilingual
│   └── announcements/   ← news items
├── data/
│   ├── papers.bib       ← BibTeX bibliography
│   └── about.mdx        ← about page bio (EN + FA blocks)
├── components/          ← UI (cards, navbar, search, i18n engine, …)
├── layouts/             ← Base / Page / Post / Distill
├── pages/               ← routes (blog listing at `/`, posts at `/posts/`)
├── styles/              ← theme colors, typography, glass system
└── utils/               ← BibTeX parser, i18n, authors, post images
scripts/
├── check-content.ts     ← fast frontmatter validation for content PRs
└── update-citations.ts  ← citation counts from OpenAlex (prebuild + weekly)
```

---

## Scripts

```bash
yarn dev               # local dev server
yarn build             # production build + Pagefind index
yarn test              # unit tests (Vitest)
yarn lint              # ESLint (autofix)
yarn test:types        # astro check + tsc
yarn content:check     # validate post/news/people frontmatter (fast, for content PRs)
yarn citations:update  # refresh citation counts from OpenAlex
```

---

## Deployment

Live at `https://dina-lab-iust.github.io/blog/` via `.github/workflows/deploy.yml`
(Actions → Pages). Configuration is env-first:

- Local: `.env` (`ASTRO_SITE=https://dina-lab-iust.github.io`, `ASTRO_BASE=/blog`)
- CI: repository variables `ASTRO_SITE` / `ASTRO_BASE` (same values; also baked
  in as fallbacks)

Setup: **Settings → Pages → Source: GitHub Actions**, then push to `main`.

---

## Tech stack

| Layer   | Technology                                                                |
| ------- | ------------------------------------------------------------------------- |
| Framework | [Astro 6](https://astro.build) (static output)                          |
| CSS     | [Tailwind CSS v4](https://tailwindcss.com) + CSS variables                |
| Types   | TypeScript (strict)                                                       |
| Math    | KaTeX via remark-math + rehype-katex                                      |
| Search  | [Pagefind](https://pagefind.app) + [ninja-keys](https://github.com/ssleptsov/ninja-keys) |
| BibTeX  | Custom build-time parser (zero runtime deps)                              |
| Icons   | [Iconify](https://iconify.design) (Font Awesome + Academicons)            |
| CI/CD   | GitHub Actions → GitHub Pages                                             |
| Package manager | Yarn 4 (Berry)                                                  |

---

## Acknowledgements

Built on [as-folio](https://github.com/dadangnh/as-folio) and customized for
DINA LAB — bilingual support, RTL layouts, lab members, DINA visual identity,
and the content workflow above. The upstream project is MIT-licensed; this
customized version is shared under the same terms.

---

## License

MIT — see [LICENSE](LICENSE) for details (copyright retained by the upstream author per the MIT terms).
