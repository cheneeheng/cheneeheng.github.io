# Personal GitHub Pages

A personal portfolio and research site built with Astro and deployed via GitHub Pages.

## What's Inside

- **Hero landing page** — Quick introduction and recent highlights
- **Research** — Publication listings with abstracts and links
- **Projects** — Active and past project showcase
- **Now** — Current focus and initiatives
- **About** — Background and details

## Tech Stack

- **Astro 5** — Static site generation
- **Tailwind CSS 4** — Utility-first styling
- **TypeScript 5** — Type-safe code
- **GitHub Pages + Actions** — Automated deployment from `main` branch

## Quick Start

### Prerequisites
- Node.js 18+ (or use Bun, as the GitHub Actions workflow does)

### Local Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Build for production
npm build

# Preview production build locally
npm run preview
```

## Configuration

The site is configured for deployment to `https://<username>.github.io/personal-github-pages`. Edit `astro.config.mjs` to adjust:

- `site` — Your GitHub Pages root domain
- `base` — Path prefix (remove if deploying to root domain)

## Content

Edit data sources:
- `src/data/projects.ts` — Add/update projects
- `src/data/publications.ts` — Add/update publications

Edit pages directly:
- `src/pages/*.astro` — About, research, projects, /now page

## Deployment

Push to `main` branch. GitHub Actions automatically builds and deploys via the `Deploy to GitHub Pages` workflow.

Alternatively, trigger a manual deployment from the GitHub UI: **Actions** → **Deploy to GitHub Pages** → **Run workflow**.
