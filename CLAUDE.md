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

**Do not write new posts directly into `src/pages/blog/`.** New posts go into the **publish queue** at `src/pages/blog/_queue/` and CI publishes them on a schedule — see below. Edit a file in `src/pages/blog/` directly only to fix an *already-published* post. (The `_queue` glob is excluded by the leading-underscore directory, so queued posts don't render until moved out.)

### Blog publish queue

New posts are drafted into `src/pages/blog/_queue/` and published one at a time by `.github/workflows/publish-queued-post.yml` (cron: Tuesdays 09:00 UTC; also `workflow_dispatch`). On each run the workflow picks the **lowest-numbered** queued file, strips the `NN-` prefix, injects `date: <today>` as the second line, moves it to `src/pages/blog/`, commits, and triggers `deploy.yml`.

When queuing a post:
- Name it `NN-<repo>--<detail>.md` with a two-digit ordering prefix (`NN-` controls publish order; lowest goes first). Use the next number after the highest already in `_queue/`.
- **Omit the `date:` frontmatter field** — CI injects it on publish day. Set everything else (`layout`, `repo`, `title`, `description`, `banner`, `bannerAlt`) as normal.

The site is **not** using Astro content collections (`src/content/config.ts`) — adding one would change how `now.md` and `blog/*.md` are loaded.

### Blog voice

Write posts in a **personal** voice, not "influencer style." The blog is organized as **serials**: each project is a series, each post an episode the reader is following in order.

**Series status** (an ongoing series continues until the user explicitly declares the project finished):
- `claude-code-plugin-toggler` — **ongoing**. New episodes pick up where the last left off.
- `claude-code-html-wrapper` — **finished**. Its three-post arc is closed; no new episodes.

**Episode rules:**
- Open inside a moment or a thought — an annoyance, a realization, a scene — never a product pitch or background.
- Pick up the live thread the previous episode left ("Last time I said…"), and cross-link it.
- Endings: an **ongoing** series ends on the genuinely open thread — the unresolved question or the next thing being watched (a reserved verdict is a valid ending). A **finished** series' final post ends with closure; no manufactured cliffhangers.
- Check continuity against earlier episodes before publishing: version numbers, dates, what the reader already knows. Don't re-tell a story a previous episode owns — call back to it in a sentence and link.

**Voice rules:**
- Avoid: punchy standalone declarative one-liners as paragraphs; aphoristic closers ("The boring choice is the correct one"); imperative lessons aimed at the reader ("Don't design your own. Surface theirs."); "If you're building X, then Y" prescriptions; the tidy meta-takeaway sign-off that turns a personal story into a lecture; bold pseudo-headers as section labels ("**What it does**", "**The lesson:**"); CTA endings.
- Prefer: first person, grounded in what actually happened and was thought; connected paragraphs that carry the narrative; reflective rather than prescriptive; doubt and self-report kept in ("I shipped it anyway, because I was tired of this bug"); quieter. The reader is overhearing the reasoning, not being taught.
- Never invent scenes, feelings, or chronology. Every beat must come from the repo (changelogs, specs, commits) or from the author's own words — interview answers are quotable nearly verbatim; the author's phrasing *is* the voice. If the human beat is missing, ask for it rather than fabricating it.
- Tutorials (how-to posts) keep their full utility — real code, steps, pitfalls — but pitfalls are narrated as what they cost the author, not as warnings issued to the reader.

Each post lives in `src/pages/blog/<repo>--<detail>.md`, sets `layout: ../../layouts/BlogPost.astro`, and references a 1200×300 banner SVG in `public/assets/blog/` (dark slate `#0b1120`→`#0f172a` gradient, dots pattern, accent glow, rounded `#1e293b`/`#334155` cards).

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
