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

**Do not write new posts directly into `src/pages/blog/`.** New posts go into the **publish queue** at `src/pages/blog/_queue/` and CI publishes them on a schedule — see below. Edit a file in `src/pages/blog/` directly only to fix an *already-published* post, and append a `changelog:` entry (`- date: YYYY-MM-DD` / `note: <what changed, for readers>`, oldest first) to its frontmatter. `BlogPost.astro` renders the list as a collapsed "Edited N times since publishing" panel, `[slug].md.ts` appends it to the Markdown twin, and the latest entry becomes `dateModified`. Log only edits to that post itself (its text, its own banner, its URL), not site-wide rollouts such as layout changes or adding phone banners to every post. (The `_queue` glob is excluded by the leading-underscore directory, so queued posts don't render until moved out.)

### Blog publish queue

New posts are drafted into `src/pages/blog/_queue/` and published one at a time by `.github/workflows/publish-queued-post.yml` (cron: Tuesdays and Thursdays 09:00 UTC; also `workflow_dispatch`). On each run the workflow picks the **lowest-numbered** queued file, strips the `NN-` prefix, injects `date: <today>` as the second line, moves it to `src/pages/blog/`, commits, and triggers `deploy.yml`.

When queuing a post:
- Name it `NN-<repo>--<detail>.md` with a two-digit ordering prefix (`NN-` controls publish order; lowest goes first). Use the next number after the highest already in `_queue/`.
- **Omit the `date:` frontmatter field** — CI injects it on publish day. Set everything else (`layout`, `repo`, `title`, `description`, `banner`, `bannerAlt`) as normal.
- Queuing a whole arc at once: number the episodes as one contiguous block per series, not interleaved with another series. Reordering later is just renaming files — prose back-links reference slugs, never numbers.

The site is **not** using Astro content collections (`src/content/config.ts`) — adding one would change how `now.md` and `blog/*.md` are loaded.

### Blog voice

Write posts in the **author's own** voice. The reference is `src/pages/blog/agentic-ai-journal--the-beginnings.md`, the one post the author wrote alone: read it before drafting or editing any post. Posts published before 2026-11-16 were written under older rules (quiet, repo-first, pre-planned arcs) and the author found them tiring to read, "a changelog being hyped up". They stay as published. Do not imitate them and do not rewrite them. The voice rules below apply to **every** post; the episode rules apply only to serial episodes. Two post types:

- **Serial episodes** — each project is a series, and the series is that project's journal. An episode is written when something happened that is worth telling, not planned ahead as an arc from the repo.
- **Standalone posts** — project one-offs (e.g. `figureflow--sunset`) and meta/site notes (e.g. `hello`). No cross-linking or open-thread obligations. A standalone about a project can retroactively become episode 1 if the project continues.

**Series status** (an ongoing series continues until the user explicitly declares the project finished):
- `claude-code-plugin-toggler` — **ongoing**. New episodes pick up where the last left off.
- `mcp-cassette` — **ongoing**. Six-episode arc queued (origin → stdio bugs → CI → HTTP/sampling → lint → diff); ends on real-world use and more protocol surface.
- `pr-compliance-gate` — **ongoing**. Six-episode arc queued (origin → reconcile → investigator → sandbox root → the three bugs → not publishing); ends on live GitHub intake and whether the reviews are trustworthy.
- `presidio-compliance-stack` — **ongoing**. Five-episode arc queued (audit-layer case → build findings → chain vs. true record → NRIC codes → POSIX path verified and 1.0.0 release); ends on the untested adoption question. The repo's `docs/internals/` explainers are private and stay out of the posts.
- `mlops-incident-commander` — **ongoing**. Four-episode arc queued (origin and the three rings → detection by model judgement vs. the policy table → withheld ground truth and the postmortem leak → checked by reading, then the demo ran); ends on where to take it next (CI/CD CLI, dashboards, more ML frameworks). The repo's `.agents_workspace/` and `docs/internals/` are private and stay out of the posts — quote only public commits, code, README, CHANGELOG, and `docs/guide/`.
- `claude-code-html-wrapper` — **finished**. Its three-post arc is closed; no new episodes.

**Series note (automatic).** Posts sharing a `repo` frontmatter value are one series, ordered by `date`. `src/lib/series.ts` derives this and `BlogPost.astro` renders "Part N of M in the &lt;repo&gt; series — start with part 1, &lt;title&gt;" under the header; `[slug].md.ts` emits the same line into the Markdown twin. A post whose `repo` is unique (or absent) gets nothing. A post with no repo can join a series by name with `series: <name>` (e.g. `series: journal` for the agentic AI journal posts); the name also becomes its `#tag`. So: never hand-write "part N of M" or a part-1 link in prose — set `repo` correctly and the note maintains itself as the series grows. Prose back-links to the *previous* episode are still written by hand (rule below).

**Episode rules:**
- **Every episode has a point** a reader without the repo can use: a decision checked, a question answered, a lesson, an opinion. What changed in the repo is not a point. If the only material is what was committed, there is no episode yet.
- **Episode 1 of a new series** opens at the origin itch — the annoyance or curiosity that started the project. No back-link (there is nothing to link), and no "this is the start of a series" framing.
- **Every later episode opens with a brief recap** of the posts so far, a few sentences, linking the posts it recalls. The recap covers either the big picture of the project, or the things this post touches: a decision made earlier that this post checks back on, or a question asked earlier that this post tries to answer. It is a recap for a reader who missed those posts, not a hook into "last time's" cliffhanger.
- Endings: say where things stand. An open question is a fine ending when there is a real one, and a later episode can come back to it in its recap. No manufactured cliffhangers and no teasing the next episode.
- Check continuity against earlier episodes before publishing: version numbers, dates, what the reader already knows. Don't re-tell a story a previous episode owns — the recap calls back to it in a sentence and links.

**Voice rules** (each taken from the reference post):
- Talk to the reader directly: "if you are reading this", "let's face it", "I can tell you right now".
- Ask the question and answer it on the spot: "Addicted? Yes.", "Why? Because…".
- State opinions and lessons plainly, and hedge them the way the author does: "I think", "in my opinion", "I could be wrong, but for now I am not convinced". A lesson aimed at the reader is welcome when it is the author's own.
- Plain, casual words and numerals ("2 questions", "boy", "OG", "hey"). Capitals, exclamation marks and "=D" only on a reaction the author actually gave.
- Section headings are plain labels ("The addiction", "The code tsunami"), not teasers.
- A reader without the repo must be able to follow. Code identifiers, file names, version numbers and calendar dates appear only where the point needs them.
- Avoid: compressed, literary or aphoristic sentences ("The only thing that needed any work was me"); hype; bold pseudo-headers as section labels ("**What it does**", "**The lesson:**"); CTA endings.
- Never invent scenes, feelings, opinions, or chronology. Every beat must come from the author's own words or from the repo — the author's notes and interview answers are quotable nearly verbatim; the author's phrasing *is* the voice.
- **Drafting workflow (author's take first, repo second):** do not outline a post from the commit history, the changelog or the plans. Start from the author: their rough notes, or one batch of interview questions on what happened, what they thought of it, what it taught them, and what they would tell someone else. Those answers are the skeleton of the post. Only then read the repo, to check the facts and pick the one example the point needs. Wherever a human beat is still missing — a feeling, the real reason behind a decision, a lesson — insert a `[NEEDS-BEAT: <what's missing>]` marker instead of writing around it or inventing it, then ask about all the markers in one batch. A draft with unresolved `[NEEDS-BEAT]` markers never goes into the publish queue.
- Tutorials (how-to posts) keep their full utility — real code, steps, pitfalls — but pitfalls are narrated as what they cost the author, not as warnings issued to the reader.

**Section headings.** Posts over ~700 words carry `##` headings — roughly one per two paragraphs — so the page isn't a slab. This does not license the bold pseudo-headers banned above; those sit *inside* the prose and label a claim, while a `##` is a real heading in the document outline. Rules: never a heading before the opening paragraph, and the wording is a plain label for what the section is about (see Voice rules), not a template and not a teaser. Shorter posts get none; at 400 words the labels outnumber the ideas. Paragraphs stay under ~150 words. The article keeps `max-w-none` so the post spans the same `max-w-3xl` column as the nav and every other page — uniform width is the deliberate choice here, over the narrower measure typography would otherwise want. Headings and paragraph length, not a narrower column, are what carry readability.

Each post lives in `src/pages/blog/<repo>--<detail>.md`, sets `layout: ../../layouts/BlogPost.astro`, and references a 1200×300 banner SVG in `public/assets/blog/` (dark slate `#0b1120`→`#0f172a` gradient, dots pattern, accent glow, rounded `#1e293b`/`#334155` cards). Draw banners dark only: `BlogPost.astro` flips them for light mode with `invert hue-rotate-180`, keyed on the site's theme toggle. An optional `bannerMobile:` (a narrow SVG, ~360–400 wide, any height, larger labels) is served at ≤640px via `<picture>`, and posts without one fall back to the wide banner. `BlogPost.astro` reads its size from the `viewBox` at build, so the file must exist and start its viewBox at `0 0`. Every current post has one.

### Layouts and components

- `src/layouts/Layout.astro` — root shell (Nav + main + Footer, dark mode classes baked in). Every page should wrap in this.
- `src/layouts/BlogPost.astro` — wraps `Layout` and adds a `PageHeader` + `prose` article block; used as the `layout:` for blog Markdown.
- `src/components/` — purely presentational Astro components. No client-side JS islands; everything renders to static HTML.

### SEO / AEO (discoverability for search engines and AI agents)

The site is optimized to be both indexed by search engines and cited by AI systems. Preserve these when adding pages or posts:

- **`src/components/BaseHead.astro`** emits `<title>`, meta description, canonical, Open Graph, and Twitter-card tags. It is included by `Layout.astro`; every page gets it for free. Pass `image` and `ogType` through `Layout` props to override (blog posts pass their PNG social card and `ogType="article"`). Without an `image` the page falls back to the square headshot and a `summary` Twitter card. Every page passes its own `description` (≤155 chars); the `Layout` default is a generic fallback only.
- **Social cards.** `src/pages/blog/[slug].png.ts` rasterizes each post's SVG banner with `sharp` into a 1200×630 PNG at `/blog/<slug>.png`, used for `og:image` and the JSON-LD `image`. Link-preview scrapers ignore SVG. Auto-covers new posts.
- **Redirects.** A published post whose slug changes gets an entry in `redirects` in `astro.config.mjs` (meta-refresh + canonical, the best GitHub Pages allows).
- **JSON-LD.** `BlogPost.astro` emits a `BlogPosting` per post from frontmatter (with `dateModified` falling back to `date`); `index.astro` emits a `Person` entity. Author is **Chen Ee Heng**.
- **`@astrojs/sitemap`** (in `astro.config.mjs`) generates `/sitemap-index.xml`. `public/robots.txt` references it and explicitly allows AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.).
- **`src/pages/llms.txt.ts`** generates `/llms.txt` from `import.meta.glob` of the posts — it stays in sync automatically; no manual edit needed when publishing. Its `## Pages` list is hand-written: update it when a top-level page is added. It also fails the build if a post has no `description`.
- **RSS.** `src/pages/rss.xml.ts` (`@astrojs/rss`) serves `/rss.xml` from the same post glob; `BaseHead.astro` advertises it and the footer links it. Auto-covers new posts.
- **Markdown twins.** `src/pages/blog/[slug].md.ts` serves every post's raw Markdown at `/blog/<slug>.md` (frontmatter stripped, title + description prepended) for token-efficient agent consumption. `BlogPost.astro` links to it ("View as Markdown"). This auto-covers new posts.

Optional post frontmatter for SEO: `updated:` (sets `dateModified` / freshness signal, overriding the latest `changelog:` date) and `schemaType:` (override `BlogPosting`, e.g. `HowTo`, `FAQPage`, `TechArticle`, `SoftwareSourceCode` to match the post's shape). These are read by `BlogPost.astro`; everything else about queuing/publishing is unchanged.

The full visibility playbook (rationale, content-writing rules, known gaps, open checklist) is `.agents_workspace/blog-visibility-optimization-guide.md`. For any SEO/AEO work, start from its Section 9 checklist; its Section 3 content rules yield to the Blog voice section above for serial episodes.

### Base path handling

`astro.config.mjs` sets `site: 'https://cheneeheng.github.io'` with **no `base`** — the site deploys at the user-page root. Code that builds links still reads `import.meta.env.BASE_URL` (see `index.astro`, `Layout.astro`, `blog/index.astro`) so that adding a `base` later (e.g. for a project-page deploy) does not break links. Preserve this pattern when adding internal links: `const base = import.meta.env.BASE_URL.replace(/\/$/, '')` then `href={base + '/path'}`.

### Deployment

Push to `main` → `withastro/action@v3` builds with Bun → `actions/deploy-pages@v4` publishes. The workflow has `concurrency: pages, cancel-in-progress: true`, so queued runs are dropped in favor of the latest.

## Planning artifacts

`docs/planning/SKELETON.md` is the design doc for the site (concept, content model, routes, stack). If a change crosses multiple sections (new page type, new content entity, routing change), reconcile it against the SKELETON rather than improvising.
