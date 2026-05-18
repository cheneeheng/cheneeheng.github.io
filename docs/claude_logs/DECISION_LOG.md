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

---

### Entry 007

**Type:** Decision
**Mode:** Autonomous
**Timestamp:** 2026-05-18T22:10:00Z
**Task:** Modernize the home page (user feedback: "looks dull and unappealing"; constraint: no emojis).

**Context:** The previous Hero was a small h1 + paragraph + two outline buttons inside the global `max-w-3xl` shell. SectionPreview was a thin "title / view all" header with a vertical stack of bordered cards. No visual identity, no motion, no accent color, no information density (no stats, no status, no contact).

**Decision:**
1. Rewrote `Hero.astro` as a full-bleed section (escapes `max-w-3xl` via an absolutely-positioned `w-screen left-1/2 -translate-x-1/2` background) with:
   - Layered background: zinc gradient + subtle 28px grid with radial mask + three floating aurora blobs (indigo / amber / fuchsia) + hairline divider.
   - Animated emerald "Open to interesting work" status dot using the built-in `animate-ping`, and two custom `@keyframes` (hero-float-a/b) with a `prefers-reduced-motion` opt-out.
   - Gradient-clipped tagline ("Teaching machines to see, decide, and ship.") via `bg-gradient-to-r ... bg-clip-text text-transparent`.
   - Primary CTA with colored shadow, secondary glassy CTA, tertiary text link.
   - Metadata strip (Munich / CET / email mailto).
   - 3-up stats grid (Publications / Years CV / Now).
2. Rewrote `SectionPreview.astro`: numbered index, uppercase eyebrow, larger h2, bottom border, and switched the children container to a 2-col grid on md+. The home page passes `index="01|02|03"` and eyebrows per section.
3. Replaced the plain Now paragraph with a custom callout card (gradient border-bg + corner glow) inlined in `index.astro` rather than using SectionPreview, because Now is a single-child block that would otherwise sit half-width on md+.
4. Added a shared hover treatment to `ProjectCard.astro` and `PublicationCard.astro`: `rounded-xl`, `transition-all`, `hover:-translate-y-0.5`, soft shadow on hover, accent gradient hairline at the top edge (amber for projects, indigo for publications) revealed on hover. These cards are also used on `/projects` and `/research` — the lift is universal and intentional.

**Considered alternatives:**
- Web fonts (Inter / display serif): skipped to keep the site fully static and offline-friendly; system sans is sufficient with the new hierarchy.
- A new `wide` slot on `Layout.astro`: rejected as over-broad — the negative-margin / full-bleed-absolute trick is contained entirely within `Hero.astro` and doesn't change how other pages render.
- `@tailwindcss/typography`: not needed for this change.

**Impact / Risk:**
- New Hero uses animations behind `prefers-reduced-motion`. No JS islands added; everything remains static HTML + CSS.
- Card markup changes are additive (extra wrapper span, more utility classes) — `/projects` and `/research` were re-checked and still render.
- Build clean (`npm run build`: 9 pages, ~2s, no warnings beyond the pre-existing node DEP0205).

**Outcome:** Applied on branch `feat/migrate-archive-content`.

---

### Entry 008

**Type:** Decision
**Mode:** Autonomous
**Timestamp:** 2026-05-18T00:00:00Z
**Task:** Strip the home page back ("Jobs pass" — user roleplayed a Steve Jobs critique, then approved).

**Context:** The Hero stacked nine competing elements (dot grid, three emerald spotlights, two corner serial-number labels, two pills, gradient name, two-tone tagline, paragraph, two CTAs, stat grid). `index.astro` then teased Research, Projects, and Now without delivering any of them. Entry 007 optimised for visual density; this pass optimises for one-message clarity.

**Decision:**
1. `Hero.astro`: dropped the dot grid; collapsed three emerald spotlights to a single subtle wash; removed the `VOL · 01` and `EE-CHEN / 2026` corner labels; removed the "Open to hard problems & bold ideas" pill; removed the three-cell stat grid; collapsed two CTAs to one ("See what I'm building"). Promoted the tagline to `<h1>`; demoted the name to a small eyebrow above it. Kept the Munich/CET pill (concrete, useful).
2. `index.astro`: removed the Research SectionPreview and the inline Now callout block. Kept only the Projects section (two active projects, full ProjectCard). Nav already exposes `/research` and `/now` so removal does not lose discoverability.

**Considered alternatives:**
- Replacing the "Open to..." pill with a concrete role label (e.g., "Open to staff/principal AI eng roles"): rejected — user has not stated a target role and inventing one would be fabrication.
- Adding screenshots to ProjectCard: out of scope; `Project` has no image field.

**Impact / Risk:** Visual density drops sharply; the home page becomes a hero + two project cards. Discoverability of Research/Now/Blog continues to come from Nav.

**Outcome:** Applied on branch `feat/migrate-archive-content`.

---

### Entry 009

**Type:** Decision
**Mode:** Autonomous
**Timestamp:** 2026-05-18T00:00:00Z
**Task:** Resolve home-page CTA / section redundancy.

**Context:** After Entry 008, the Hero CTA and the bottom Projects section both pointed to `/projects`. User flagged the conflict and proposed splitting: one for "what I'm doing now," one for "parallel/finished work."

**Decision:**
1. Hero CTA: relabel "See what I'm building" → "What I'm focused on"; retarget `/projects` → `/now`. Gives the primary narrative a single home.
2. Home `Projects` section: rename eyebrow "What I'm shipping" → "In parallel & shipped"; title "Projects" → "Other work". Selection switched from `filter(status==='active').slice(0,2)` to `projects.slice(1, 3)` — skip the first project (the implicit primary "now" work) and show the next two. Gives one parallel-active + one past on the home page; the full list still lives at `/projects`.

**Considered alternatives:**
- Adding a `featured: true` flag to `Project` to mark the primary work explicitly: rejected as scope creep — array-order-as-priority is sufficient.
- Deep-linking the Hero CTA to a specific project: rejected — projects don't have individual pages.

**Impact / Risk:** Whichever project is listed first in `src/data/projects.ts` becomes the implicit "focus" and is excluded from the home-page section. Reorder the array to change the focus.

**Outcome:** Applied on branch `feat/migrate-archive-content`.
