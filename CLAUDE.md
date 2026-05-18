# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install deps (Bun also works; CI uses Bun via withastro/action)
npm run dev          # dev server at http://localhost:4321 (Astro default)
npm run build        # static build → dist/
npm run preview      # preview built site locally
```

No test suite, no linter, no formatter configured. `tsconfig.json` is the Astro-strict preset; type errors surface via `astro check` (not wired as a script — invoke `npx astro check` if needed).

## Architecture

Static Astro 5 site with Tailwind CSS 4 (via `@tailwindcss/vite`), deployed to GitHub Pages from `main` by `.github/workflows/deploy.yml`. No backend, no API, no DB — all content is baked at build time.

### Content sources (where to edit)

Content is split across three mechanisms; pick the right one:

- **`src/data/projects.ts`, `src/data/publications.ts`** — typed TS arrays. Project/Publication interfaces live in the same file. Import into pages and render with the matching `*Card.astro` / `*List.astro` / `*Grid.astro` components.
- **`src/content/now.md`** — single Markdown file imported directly by `NowContent.astro` (not a content collection). Frontmatter `updated:` is rendered as "Last updated".
- **`src/pages/blog/*.md`** — blog posts as standalone Markdown pages. The blog index (`src/pages/blog/index.astro`) discovers them with `import.meta.glob('./*.md', { eager: true })` and sorts by frontmatter `date`. Each post must set `layout: ../../layouts/BlogPost.astro` so it renders inside the site shell.

The site is **not** using Astro content collections (`src/content/config.ts`) — adding one would change how `now.md` and `blog/*.md` are loaded.

### Layouts and components

- `src/layouts/Layout.astro` — root shell (Nav + main + Footer, dark mode classes baked in). Every page should wrap in this.
- `src/layouts/BlogPost.astro` — wraps `Layout` and adds a `PageHeader` + `prose` article block; used as the `layout:` for blog Markdown.
- `src/components/` — purely presentational Astro components. No client-side JS islands; everything renders to static HTML.

### Base path handling

`astro.config.mjs` sets `site: 'https://cheneeheng.github.io'` with **no `base`** — the site deploys at the user-page root. Code that builds links still reads `import.meta.env.BASE_URL` (see `index.astro`, `Layout.astro`, `blog/index.astro`) so that adding a `base` later (e.g. for a project-page deploy) does not break links. Preserve this pattern when adding internal links: `const base = import.meta.env.BASE_URL.replace(/\/$/, '')` then `href={base + '/path'}`.

### Deployment

Push to `main` → `withastro/action@v3` builds with Bun → `actions/deploy-pages@v4` publishes. The workflow has `concurrency: pages, cancel-in-progress: true`, so queued runs are dropped in favor of the latest.

## Planning artifacts

`docs/planning/SKELETON.md` is the design doc for the site (concept, content model, routes, stack). If a change crosses multiple sections (new page type, new content entity, routing change), reconcile it against the SKELETON rather than improvising.
