# Decision Log

### Entry 1

**Type:** Decision
**Mode:** Autonomous
**Timestamp:** 2026-06-20
**Task:** Implement the Blog Visibility Optimization Guide (SEO/GEO/AEO) — `.agents_workspace/blog-visibility-optimization-guide.md`

**Context:** The guide's `[AGENT]` code samples assume an Astro **content collection** (`getCollection('blog')`, `src/content.config.ts`, `p.id`/`p.body`). This repo deliberately does **not** use content collections — posts are standalone Markdown pages under `src/pages/blog/*.md` discovered via `import.meta.glob`, and the project CLAUDE.md explicitly warns that adding a collection would change how `now.md` and `blog/*.md` load. The guide and the repo's architecture conflict on the mechanism.

**Decision:** Keep the repo's existing non-collection architecture (higher authority: project CLAUDE.md / domain standards) and re-implement every guide task against `import.meta.glob`:
- Skipped guide §1.2 (content-collection schema) entirely — would require introducing collections. Required-frontmatter enforcement is instead documented as convention.
- `llms.txt` (`src/pages/llms.txt.ts`) and Markdown twins (`src/pages/blog/[slug].md.ts`) read posts via `import.meta.glob` instead of `getCollection`.
- Markdown twins use a `?raw` glob + frontmatter strip (robust across Astro versions) rather than `post.body`.
- Real values substituted for the guide's placeholders: domain `https://cheneeheng.github.io` (already set), author `Chen Ee Heng`, GitHub `github.com/cheneeheng`. `Person.sameAs` ships GitHub only — LinkedIn/X handles unknown, left for the owner.

**Impact / Risk:** Low. No new content-loading mechanism introduced; only additive endpoints/components and one new dependency (`@astrojs/sitemap`, official Astro integration). Build verified green; sitemap, llms.txt, 8 Markdown twins, canonical/OG/JSON-LD all generate correctly.

**Outcome:** `npm run build` succeeds. SEO/AEO foundation in place; remaining items are `[HUMAN]` (content + off-site) and one post-deploy audit (`npx agentic-seo`).
