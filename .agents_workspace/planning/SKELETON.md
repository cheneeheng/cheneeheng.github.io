---
artifact: SKELETON
status: ready
created: 2026-05-18
app: Personal Website — eeheng.dev (or similar)
stack: Astro, TypeScript, Tailwind CSS, GitHub Pages
sections: [01, 02, 03, 05]
---

# §01 · Concept

A statically-generated personal website deployed to GitHub Pages. The audience is
anyone who wants to understand who you are: recruiters, collaborators, conference
organisers, open-source users, and peers in AI research. The site covers your
academic background, your pivot into AI agents, and the projects you're actively
working on. The single most important flow: visitor lands on the homepage → reads
the one-paragraph summary → navigates to Projects or About for more depth.

---

# §02 · Architecture

## Component diagram

```
GitHub repo (main branch)
  └── GitHub Actions (on push)
        └── withastro/action  → builds dist/
              └── actions/deploy-pages → GitHub Pages
```

No API, no backend, no database. All content is authored in Markdown files or
TypeScript data files and baked into static HTML at build time.

## Content model

| Entity       | Fields                                                              |
|--------------|---------------------------------------------------------------------|
| `Project`    | title, status (active / past), tags[], summary, link (optional)    |
| `Publication`| title, venue, year, abstract (short), pdf_url (optional)           |
| `Post`       | title, date, slug, body (Markdown) — *deferred to next iteration*  |

## Pages / routes

| Route           | Page              | Notes                              |
|-----------------|-------------------|------------------------------------|
| `/`             | Home              | Hero, 2-line bio, section previews |
| `/about`        | About             | Academic → AI agents narrative     |
| `/research`     | Research          | Publications list                  |
| `/projects`     | Projects          | Active + past projects             |
| `/now`          | Now               | What you're currently doing        |
| `/blog`         | Blog index        | *Deferred — stub only in skeleton* |
| `/blog/[slug]`  | Blog post         | *Deferred*                         |

---

# §03 · Tech Stack

| Layer          | Choice              | Rationale                                                        |
|----------------|---------------------|------------------------------------------------------------------|
| Framework      | **Astro**           | File-based routing, zero JS by default, perfect for static sites |
| Language       | TypeScript          | Already in your stack                                            |
| Styling        | **Tailwind CSS v4** | Utility-first, no runtime overhead                               |
| Content        | Markdown + TS data files | `.md` for blog posts (later), `.ts` for structured data   |
| Deployment     | **GitHub Pages**    | Free, integrates with Actions                                    |
| CI             | GitHub Actions      | `withastro/action` — zero-config Astro deploy action            |
| Runtime / PM   | **Bun**             | Fast installs, single tool replaces Node + npm                   |

No component library at skeleton stage — plain Tailwind only. Add if needed in iteration.

---

# §05 · Frontend

## Page list with components

### `/` — Home
```
<Layout>
  <Hero>          ← name, one-liner, CTA buttons (About, Projects)
  <SectionPreview title="Research">   ← 2 most recent publications
  <SectionPreview title="Projects">   ← 2 active projects
  <SectionPreview title="Now">        ← 1-paragraph teaser
```

### `/about` — About
```
<Layout>
  <PageHeader title="About">
  <Timeline>      ← academic phase → industry → AI agents (text + years)
  <SkillTags>     ← research areas, languages, tools
```

### `/research` — Research
```
<Layout>
  <PageHeader title="Research">
  <PublicationList>
    <PublicationCard>  ← title, venue, year, optional PDF link
```

### `/projects` — Projects
```
<Layout>
  <PageHeader title="Projects">
  <ProjectGrid>
    <ProjectCard>  ← title, status badge, tags, summary, optional link
```

### `/now` — Now
```
<Layout>
  <PageHeader title="Now">
  <NowContent>    ← freeform Markdown, updated manually
```

### `/blog` — stub
```
<Layout>
  <PageHeader title="Blog — coming soon">
```

## Shared components
- `<Layout>` — `<head>`, nav, footer
- `<Nav>` — links to all top-level pages, active state
- `<Footer>` — GitHub, LinkedIn (or similar), email

## Data strategy at skeleton stage
- Publications and projects defined as TypeScript arrays in `src/data/publications.ts`
  and `src/data/projects.ts` — 2–3 stub entries each.
- `/now` is a single `.md` file at `src/content/now.md`.

## How to run locally
```bash
bunx create-astro@latest my-site
cd my-site
bun install
bun run dev       # http://localhost:4321
```

## Deploy to GitHub Pages
Add `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3
          with:
            package-manager: bun   # tells withastro/action to use bun install + bun run build
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```
Then in repo Settings → Pages → Source: **GitHub Actions**.

> ⚠️ **Astro base path gotcha:** if your repo is at `username.github.io/repo-name`
> (not a custom domain or `username.github.io` root), set these in `astro.config.mjs`:
> ```js
> export default defineConfig({
>   site: 'https://username.github.io',
>   base: '/repo-name',
> })
> ```
> Without `base`, all asset paths will be wrong and the site will appear broken.

> Custom domain: deferred — configure after skeleton is live.
