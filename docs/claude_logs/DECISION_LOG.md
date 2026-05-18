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
