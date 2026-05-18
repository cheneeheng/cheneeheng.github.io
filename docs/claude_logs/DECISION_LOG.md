# Decision Log

### Entry 001

**Type:** Decision
**Mode:** Autonomous
**Timestamp:** 2026-05-18T00:00:00Z
**Task:** Implement SKELETON.md for personal Astro site.

**Context:** SKELETON specifies the Astro `site` + `base` config but the actual GitHub
username and final repo path are not stated. Email is `eeheng.chen@gmail.com` and the
working directory is `personal-github-pages`.
**Decision:** Used placeholder `site: 'https://username.github.io'` and
`base: '/personal-github-pages'` in `astro.config.mjs`, and called this out for the
user to replace. Footer social links use `eehengchen` as a best-guess username.
**Impact / Risk:** Asset paths will be wrong until the user replaces `username` and
verifies repo name. Easy fix — one config edit.
**Outcome:** Pending user replacement.

---

### Entry 002

**Type:** Decision
**Mode:** Autonomous
**Timestamp:** 2026-05-18T00:00:00Z
**Task:** Render `now.md` markdown content.

**Context:** Astro renders Markdown to HTML but without the
`@tailwindcss/typography` plugin headings/lists won't be styled. Adding a new
dependency goes beyond what SKELETON's §03 lists.
**Decision:** Used plain Tailwind utility styling on the wrapper instead of adding
`@tailwindcss/typography`. Easy to add later if the content grows complex.
**Impact / Risk:** Markdown lists / headings inside `/now` will look unstyled.
**Outcome:** Acceptable for skeleton stage.

---

### Entry 003

**Type:** Decision
**Mode:** Autonomous
**Timestamp:** 2026-05-18T00:00:00Z
**Task:** Stub content for bio, timeline, publications, projects.

**Context:** SKELETON calls for 2–3 stub entries but doesn't dictate copy.
**Decision:** Wrote placeholder copy informed by the SKELETON narrative
(academic → industry → AI agents). All entries are clearly marked or framed as
placeholders for the user to replace.
**Impact / Risk:** User must replace placeholder content before publishing.
**Outcome:** Pending.

---

### Entry 004

**Type:** Decision
**Mode:** Autonomous
**Timestamp:** 2026-05-18T00:00:00Z
**Task:** Sync deploy workflow to updated §03/§05 (Node → Bun).

**Context:** SKELETON now lists Bun as the runtime/PM and instructs
`withastro/action@v3` to be passed `package-manager: bun`. The previous
implementation passed `node-version: 20`.
**Decision:** Replaced `node-version: 20` with `package-manager: bun` in
`.github/workflows/deploy.yml`. No changes needed to `package.json`, lockfile, or
Astro/Tailwind config — those are PM-agnostic. The user can switch local dev
to `bun install` / `bun run dev` without further code changes.
**Impact / Risk:** First CI run after this change will resolve deps via Bun;
ensure `bun` is available in the runner (the action handles that).
**Outcome:** Applied.

---

### Entry 005

**Type:** Decision
**Mode:** Autonomous
**Timestamp:** 2026-05-18T00:00:00Z
**Task:** Migrate content from the previous Jekyll site (`cheneeheng.github.io_archive_260518`) into the new Astro site.

**Context:** The archive's data was incomplete:
- `_pages/about.md` was Minimal-Mistakes demo copy, not personal content.
- `_pages/projects.md` only had empty CV section headers (Optical Flow, Object Detection, Segmentation, Action Recognition, Pose Estimation, OpenCV).
- `_pages/publications.md` listed real authors + venues but **no abstracts**.
- The `Publication` interface required `abstract: string`.
- Footer linked `github.com/eehengchen` while the repo and archive `_config.yml` use `cheneeheng`.
- The Timeline had fabricated date ranges; publication years (2018–2023) suggest CV-research / PhD across that span.

**Decision:**
1. Replaced placeholder publications with the 9 real entries from the archive. Renamed `abstract` → `authors` on the `Publication` model since the archive only had authors; added optional `status` to flag "Accepted" papers.
2. Promoted the empty `_pages/projects.md` section headers into the `SkillTags` "Research areas" group (they were research themes, not projects).
3. Added a "Computer-vision PhD research" past project and an ICRA-2018 "Object-centric manipulation labeling" past project to anchor the project list with real work.
4. Timeline anchored to publication-year evidence: 2018–2023 CV-research/PhD, "~5 years" industry experience as student/PhD candidate (taken verbatim from `resume.md`), and "Now" for AI agents.
5. Migrated `_pages/cmake.md` and `_pages/git.md` as Astro Markdown pages at `/blog/cmake` and `/blog/git`, with a new `BlogPost.astro` layout. Blog index uses `import.meta.glob` to list posts.
6. Fixed footer GitHub URL `eehengchen` → `cheneeheng`. Dropped the LinkedIn link (no LinkedIn URL in the archive).
7. Updated `Hero`, `now.md`, `about.astro`, and `index.astro` copy to reflect the real bio: "Part-time coder and computer-vision researcher … making machines see and decide what to do for me." (from archive `_config.yml`), Munich location, and the CV-research → AI-agents arc.

**Impact / Risk:** Several fields (resume PDF, exact dates of PhD start/end, industry timeline, LinkedIn URL) are still missing — the user should verify. The previous resume `/assets/docs/ResumeChen230423.pdf` was not migrated (no `/public/assets` content yet); a dedicated `/resume` route can be added in a follow-up if desired.

**Outcome:** Applied on branch `feat/migrate-archive-content`.

---

### Entry 006

**Type:** Decision
**Mode:** Autonomous
**Timestamp:** 2026-05-18T00:00:00Z
**Task:** Audit Entry 005 migration; close remaining gaps.

**Context:** Re-comparing the archive against the new site surfaced five items not covered by Entry 005:
1. `assets/docs/ResumeChen230423.pdf` (resume PDF) was not copied.
2. `assets/images/cropped-head-388.jpg` (author avatar) was not copied.
3. `_pages/resume.md` route + "In a nutshell" bullet list had no equivalent page on the Astro site.
4. Avatar was never wired into any page.
5. `_pages/blog.md` excerpt ("A blog is a place...") and intro ("I have no idea what I am doing...") were not migrated.

Skipped (deliberately, not content): `_pages/about.md` (Minimal-Mistakes demo copy), `_pages/404.md` (generic), `_pages/search.md` (Lunr), `_pages/sitemap.md` (auto-generated), `_pages/terms.md` (boilerplate privacy template, not personal), `_pages/archive-layout-with-content.md` (theme demo). Stock Unsplash images in `assets/images/` were also skipped — they were placeholder hero images.

**Decision:**
1. Copied `ResumeChen230423.pdf` to `public/assets/docs/` and `cropped-head-388.jpg` to `public/assets/images/`.
2. Created `src/pages/resume.astro` with the resume musing, PDF link, and the six "In a nutshell" bullets verbatim.
3. Added `/resume` to the Nav between Projects and Now.
4. About page now renders the avatar alongside an intro paragraph naming the user as Chen Ee Heng (Munich, Germany).
5. Blog index now uses the archive's excerpt as the subtitle and the archive's intro line as a paragraph above the post list.

**Impact / Risk:** PDF and avatar are static under `public/`, so no build coupling. The resume copy uses the archive's PDF dated 2023-04-23 — the user should refresh if they have a newer CV.

**Outcome:** Applied on branch `feat/migrate-archive-content`.
