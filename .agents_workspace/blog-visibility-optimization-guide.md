# Blog Visibility Optimization Guide (SEO + GEO + AEO)

created: 2026-06-20
revised: 2026-07-04 — reconciled against the implemented repo state; Sections 1–2 are live.

> **Purpose:** A working playbook for optimizing this blog so it is discovered and cited by both traditional search engines and AI systems/agents. Written to be executed by an AI coding agent (Claude Code).
>
> **Target site:** https://cheneeheng.github.io — an [Astro](https://astro.build) 5 site on GitHub Pages. Primary topic: **Claude Code**.
>
> **How to use this file:** The technical foundation (Sections 1–2) is **implemented** — each item below records its status and the actual file, which is the source of truth (the repo deliberately diverges from the original code samples; see 1.2). Do not re-implement from the samples. Remaining work is tagged `[AGENT]` (audits, small repo tasks) or `[HUMAN]` (content authorship, off-site presence, account setup). The consolidated open checklist is in Section 9.
>
> **Architecture constraint (read before touching code):** This site does **not** use Astro content collections. Posts are standalone Markdown pages under `src/pages/blog/`, discovered via `import.meta.glob`, and published through a queue workflow (`src/pages/blog/_queue/` + `.github/workflows/publish-queued-post.yml`) that injects `date:` on publish day. Adding `src/content.config.ts` would change how `now.md` and `blog/*.md` load — see the repo `CLAUDE.md`.

---

## 0. The mental model (read first)

Three facts shape every decision below:

1. **There are two discovery games now, and they have diverged.** Traditional SEO (rank in Google/Bing) and AI citation (appear inside answers from ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews) are no longer the same. Industry analyses in 2026 put the overlap between top Google results and AI-cited sources below ~20%, down from ~70%. Optimize for both.

2. **The unit of retrieval is the chunk, not the page.** AI systems retrieve a few-hundred-token slice that matched a query — not your whole page. Every section must answer in isolation.

3. **This blog's audience is partly the agents themselves.** Content about Claude Code is consumed by Claude Code, Cursor, Cline, Aider, and the developers using them. Optimizing for machine consumption *is* optimizing for the primary use case. This creates a tight feedback loop: agents read and cite the content → developers discover it → mentions/stars rise → authority rises → more citations.

There is no single "jackpot" lever. Citation authority compounds over ~3–6 months of consistent work. The technical setup below removes friction; sustained original content and off-site presence drive the actual gains.

---

## 1. Technical foundation — **implemented**

Status per item, with the actual file as source of truth.

### 1.1 `site` + sitemap integration — done

`astro.config.mjs` sets `site: 'https://cheneeheng.github.io'` (no `base` — user-page root deploy) and registers `@astrojs/sitemap`, which emits `/sitemap-index.xml`. Link-building code still reads `import.meta.env.BASE_URL` so adding a `base` later won't break links (pattern documented in `CLAUDE.md`).

### 1.2 Metadata enforcement — **deliberately diverged**

The original plan enforced frontmatter via a content-collection Zod schema. This repo intentionally does **not** use content collections; the compensating controls are:

- The publish-queue workflow injects `date:` on publish day, so it can't be missing or wrong.
- `src/pages/blog/[slug].md.ts` and `src/pages/llms.txt.ts` read `title` non-optionally, so a missing title fails the build.

**Residual gap:** nothing build-fails on a missing `description`, which would ship a post with no meta description. Mitigation is procedural for now (the queue checklist in `CLAUDE.md` lists `description` as required). `[AGENT]` candidate: a small build-time assert in `llms.txt.ts` that every post has a non-empty `description` — cheap, catches it at PR time.

### 1.3 `BaseHead.astro` — done

`src/components/BaseHead.astro` is included by `Layout.astro`, so every page gets `<title>`, meta description, canonical, Open Graph, and Twitter-card tags for free. Two deliberate improvements over the original sample:

- `og:type` is a **prop defaulting to `website`** (the sample hardcoded `article`, which is wrong for the homepage and index pages). Blog posts pass `ogType="article"` through `Layout`.
- Twitter `title`/`description`/`image` tags are emitted explicitly alongside the OG set.

**Known gap — OG image format and ratio:** blog posts pass their banner as `og:image`, but banners are **1200×300 SVGs**. Most social/link-preview scrapers (Facebook, X, LinkedIn, Slack) do not render SVG `og:image` at all, and the expected ratio is ~1.91:1 (1200×630). Result today: post shares fall back to no image or a broken card. `[AGENT]` candidate: generate PNG twins of the banners (or a dedicated 1200×630 OG image per post) and pass those to `og:image` while keeping the SVG for on-page display.

### 1.4 robots.txt — done

`public/robots.txt` allows all, explicitly welcomes GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, PerplexityBot, and Google-Extended, and points at `https://cheneeheng.github.io/sitemap-index.xml`. Revisit the bot list ~quarterly; new answer-engine crawlers appear (e.g. check for `PerplexityBot` renames, `Bytespider`, `Amazonbot` policy decisions).

### 1.5 `llms.txt` — done

`src/pages/llms.txt.ts` generates `/llms.txt` from the same `import.meta.glob` the blog index uses, so it stays in sync automatically. URLs are **absolute** (the original sample emitted relative links, which contradicts the audit rule in 1.7 — llms.txt is fetched out of page context, so relative URLs are useless to the consumer). It also tells agents about the `.md` twin convention. (2026 data still shows major citation bots rarely fetch llms.txt; kept because the audience is developer agents and the maintenance cost is zero.)

### 1.6 Markdown twins — done (high-leverage)

`src/pages/blog/[slug].md.ts` serves every post at `/blog/<slug>.md`: raw source via a `?raw` glob, frontmatter stripped, `# title` + `> description` prepended — cleaner for agents than the original "return `post.body`" sample. `BlogPost.astro` renders a visible "View as Markdown" link on every post. Auto-covers new posts.

> **GitHub Pages constraint (still true):** no custom HTTP headers and no `Accept`-header content negotiation, so serving Markdown and HTML at the *same* URL is impossible. The separate `.md` endpoint is the correct pattern for this host.

### 1.7 Audit the deployed result — `[AGENT]` **open**

Run the agentic AEO auditor against the live site and address flagged gaps:

```
npx agentic-seo --url https://cheneeheng.github.io
```

It scores discoverability, parsability, token efficiency, capability signaling, and access control out of 100, and auto-detects Astro. Also fetch `https://cheneeheng.github.io/sitemap-index.xml` and `https://cheneeheng.github.io/llms.txt` directly and confirm the URLs inside are absolute and correct (the most common GitHub Pages SEO bug is a `site`/`base` mismatch producing wrong URLs).

### 1.8 RSS feed — `[AGENT]` **open** (added 2026-07-04)

The site has no feed. An RSS/Atom feed is a low-cost, standard discovery surface: feed readers, dev.to/Hashnode cross-post-by-RSS (Section 5), and some crawlers use it as a change signal. `@astrojs/rss` + one `src/pages/rss.xml.ts` endpoint reading the same glob as `llms.txt.ts`, plus a `<link rel="alternate" type="application/rss+xml">` in `BaseHead.astro`. New-dependency decision rests with the owner.

---

## 2. Structured data (JSON-LD) — **implemented**

### 2.1 Per post — done

`src/layouts/BlogPost.astro` emits a JSON-LD block per post from frontmatter: `@type` defaults to `BlogPosting`, `datePublished` from `date`, `dateModified` from `updated` falling back to `date` (freshness signal always present), `image` from the banner, `author`/`mainEntityOfPage` set. Author is **Chen Ee Heng**.

### 2.2 Match schema to shape — per-post authoring decision

Set `schemaType:` in frontmatter to override `BlogPosting` when the post's shape warrants it:

- **`TechArticle`** — docs-style technical posts.
- **`HowTo`** — step-by-step / procedural posts. Maps directly onto "how do I…" queries.
- **`FAQPage` / `QAPage`** — posts built around questions. Heavily used by AI answer surfaces because the Q→A pairing mirrors their output.
- **`SoftwareSourceCode`** — posts shipping reusable code/configs.

### 2.3 Homepage `Person` entity — done

`src/pages/index.astro` emits a `Person` with `sameAs` → GitHub + LinkedIn. An X/Twitter profile is not yet listed — add it once the handle is confirmed.

`[HUMAN]` Keep name, bio, and links identical across all `sameAs` platforms — consistency is itself the signal.

---

## 3. Content optimization `[HUMAN]` writes, `[AGENT]` can audit/refactor

These rules govern how posts are written. Claude Code can audit existing posts against them and flag or refactor violations; net-new content is the owner's job.

> **Precedence note (added 2026-07-04):** the repo `CLAUDE.md` defines the blog's voice — personal, serial, narrative — and it outranks this section where they pull apart. Concretely: question-phrased titles and answer-first openings (3.3) apply to **tutorial/reference posts**, not serial episodes (episodes open inside a moment, by rule). The rules that apply to *every* post regardless of voice: chunk self-containment (3.1), fact density and explicit versions (3.4), complete runnable code blocks (3.5), vocabulary coverage (3.7), recency stamps (3.8). A narrative episode can still carry two or three quotable, self-contained factual sentences (3.2) without breaking voice.

### 3.1 Chunk-level self-containment (the deepest content rule)

A retrieved chunk arrives with no surrounding context. Therefore:

- **Resolve coreference within each section.** Replace "this flag also disables that" with "the `--dangerously-skip-permissions` flag also disables the confirmation prompt." No pronoun should depend on a previous paragraph.
- **Keep a complete answer inside one chunk.** Config + its one-line explanation sit together, not split across a long page.
- **Front-load every section**, not just the page — each section's first sentence is the liftable claim.

### 3.2 Write deliberately quotable sentences

A few per post: declarative, self-contained, subject-explicit, definition-style. Example: "Claude Code reads CLAUDE.md from the project root on startup." These get extracted verbatim as citations.

### 3.3 Answer-first structure (tutorial/reference posts)

Open the post (and each section) with the direct answer in the first 1–2 sentences, then explain. Title such posts as the literal natural-language questions developers ask agents (e.g. "How do I make Claude Code run tests automatically?").

### 3.4 Fact density and citation triggers

Replace vague claims with specific numbers, dates, named entities, versions. Include statistics, cite authoritative sources, and quote named experts where relevant — these specifically lift AI-citation likelihood.

### 3.5 Self-contained, working code blocks

When an agent extracts a code block, it gets ONLY the block. Every snippet must be complete and runnable: full imports, complete config, no "…rest here." A verifiable block is far more citation-worthy than a fragment.

### 3.6 Token budgets per page

Agents read mid-task with limited context. Over-long pages get truncated, skipped, or cause hallucinated answers. Target budgets: ~15k tokens quick-start, ~20k conceptual, ~25k reference, ~30k hard ceiling. Split sprawling guides into linked, focused posts. (The `.md` twin endpoint makes a post's real token cost easy to measure — fetch it and count.)

### 3.7 Semantic / vocabulary coverage

Cover natural query variants once each ("subagent" / "sub-agent" / "custom agent"), define terms explicitly, and use Anthropic's canonical product names exactly. Disambiguate collisions (e.g. AEO = Agentic Engine Optimization vs Answer Engine Optimization). Do not keyword-stuff.

### 3.8 Recency (sharp lever for a fast-moving product)

Claude Code changes faster than docs and tutorials. A solo blog can be current when other sources are stale.

- Stamp `updated:` in frontmatter when re-verifying a post — `BlogPost.astro` maps it to `dateModified` in JSON-LD.
- State version context in-text ("As of Claude Code `<version>`, …").
- `[HUMAN]` Re-verify cornerstone posts against current behavior regularly. **Always verify factual product claims against the official docs at https://docs.claude.com before publishing — the surface changes underneath you.**

### 3.9 Document the negative space

Posts on failure modes, anti-patterns, and gotchas (e.g. "5 ways CLAUDE.md config silently breaks") are both highly original and highly citable, because official docs rarely cover them.

### 3.10 Audit task — `[AGENT]` **open**

Audit the published posts (`src/pages/blog/*.md`) against 3.1–3.9 (respecting the precedence note) and produce a refactor list: per post, the specific violations and the minimal fix. Do not rewrite serial episodes into answer-first shape.

---

## 4. Topical authority & internal linking `[AGENT]` for structure, `[HUMAN]` for content

- **Pick a narrow topic and own it completely.** Depth on one sub-topic beats shallow coverage of ten. AI builds answers from topical consensus; a focused cluster reads as authoritative.
- **Hub-and-spoke structure.** One comprehensive pillar page per topic (e.g. "Everything about CLAUDE.md") linking to/from each narrow spoke post. The link topology is itself a topical-authority signal machines read. The existing serials (`claude-code-plugin-toggler`, `claude-code-html-wrapper`) already form spoke chains via episode cross-links; a pillar/series-index page per serial would complete the topology.
- **Descriptive anchor text** that states the target's subject — never "click here."
- **Candidate cornerstone post:** the `CLAUDE.md` vs `AGENTS.md` question (Claude Code prefers CLAUDE.md; the Linux-Foundation-stewarded AGENTS.md spec has OpenAI/Google/Cursor/Aider aligned). The confusion is live and the citation upside is high. Verify the current state of both before writing — this moves.
- ~~`[AGENT]` Add a `CLAUDE.md` at the repo root~~ — **done**; the repo `CLAUDE.md` documents build commands, architecture, publish queue, and voice rules.

---

## 5. Off-site authority `[HUMAN]` (highest remaining leverage)

This is off-repo, so the agent cannot do it — but it matters more than any on-site tweak. Brand mentions across the web correlate ~3x more strongly with AI visibility than backlinks, and AI engines cite third-party sources far more than a brand's own site.

- Be genuinely useful where the audience and citing engines already are: GitHub (issues, discussions, repos), Hacker News, Reddit's Claude communities, dev.to. Reference deeper write-ups when relevant.
- Publish a **public GitHub repo of example Claude Code configs/snippets** linking back to posts — agents trust and crawl GitHub heavily. (The plugin-toggler and html-wrapper repos already exist and are linked from posts; a configs/examples repo is the missing piece.)
- Guest/cross-post on established dev platforms with a canonical link back. dev.to imports by RSS — another reason for Section 1.8.

---

## 6. Measurement `[HUMAN]`

- **Prompt audits (the core loop):** monthly, ask Claude/ChatGPT/Perplexity the exact questions your readers ask. Note which sources get cited — that list tells you precisely where to be present. Track "share of voice" (how often you appear).
- **Search Console + Bing Webmaster Tools:** register the site, submit `sitemap-index.xml` in both. Fastest path to indexing, and the only free source of query/impression data for this host. **Not yet done — highest-priority HUMAN item.**
- **AI-referral tracking:** the site currently ships **no analytics at all**. Adding GA4 (or a lighter option like GoatCounter/Plausible) is an owner decision — weigh it against the site's no-JS ethos. Without it, referral traffic from `chatgpt.com`, `perplexity.ai`, etc. is invisible; Search Console still covers Google.
- **Note:** GitHub Pages exposes no server logs, so you cannot directly observe `ClaudeBot`/`GPTBot` hits. If that data becomes important, it's a reason to consider Cloudflare Pages / Netlify.

---

## 7. The eval loop (most diagnostic single practice) `[HUMAN]` + `[AGENT]`

Your posts are context you feed to agents — so test them like prompts. Take a cornerstone post, give it to an agent as the *only* context (the `/blog/<slug>.md` twin is the exact artifact to feed it), assign the task the post should enable, and check whether the agent succeeds. If it hallucinates or gets stuck, the content failed an eval — fix that exact ambiguity. This collapses the whole checklist into one empirical question: *does my content make the agent get it right?*

---

## 8. Things NOT to do

- Don't mass-produce AI-generated filler — it hurts SEO and doesn't help GEO. Quality volume only.
- Don't treat SEO and GEO as separate projects — strong SEO feeds the live index Perplexity and AI Overviews pull from.
- Don't optimize only your own domain — most leverage is off-site (Section 5).
- Don't keyword-stuff — cover real variants naturally, once each.
- Don't let contradictions persist across posts — AI weights consensus; stale contradictions silently down-weight you. Maintain one canonical statement per fact and update all affected posts when behavior changes. A short changelog page helps.
- Don't re-implement Sections 1–2 from this guide's history — the repo is the source of truth and diverges from the original samples by design (no content collections).

---

## 9. Open checklist (revised 2026-07-04)

Done: 1.1–1.6 (technical foundation), 2.1–2.3 (JSON-LD), repo `CLAUDE.md`.

**`[AGENT]` open:**
1. Run `npx agentic-seo` against the live site; fix flagged gaps (1.7).
2. OG-image fix: PNG (1200×630) social images instead of the 1200×300 SVG banners (1.3).
3. RSS feed via `@astrojs/rss` (1.8) — owner approves the dependency first.
4. Build-time `description` assert (1.2).
5. Post audit against Section 3 → refactor list (3.10).
6. Series pillar/index pages to complete hub-and-spoke (4).

**`[HUMAN]` open (roughly in leverage order):**
1. Register site + submit sitemap in Google Search Console and Bing Webmaster Tools (6).
2. Monthly prompt audits; track share of voice (6).
3. Off-site presence: GitHub/HN/Reddit/dev.to participation; public configs/examples repo; cross-posts with canonical links (5).
4. Write cornerstone originals: CLAUDE.md-vs-AGENTS.md, gotchas/negative space (3.9, 4).
5. Decide on analytics (GA4 vs lightweight vs none) (6).
6. Confirm X handle → add to `Person.sameAs`; keep name/bio/links identical across platforms (2.3).
7. Run the eval loop on cornerstone posts (7).
8. Re-verify cornerstone posts against https://docs.claude.com regularly (3.8).

---

## Appendix: key references

- Addy Osmani, "Agentic Engine Optimization (AEO)" — the 5-layer stack (discoverability, parsability, token efficiency, capability signaling, access control). https://addyosmani.com/blog/agentic-engine-optimization/
- `agentic-seo` audit tool (auto-detects Astro). https://github.com/addyosmani/agentic-seo
- Princeton/Georgia Tech GEO research — citations, statistics, and quotes lift AI-source visibility (~up to 40%).
- llms.txt standard (originated by Jeremy Howard, fast.ai).
- Anthropic Claude Code docs (verify all product claims here). https://docs.claude.com

> Reminder: the technical layers remove friction; they do not, by themselves, produce citations. Sustained original content and genuine off-site presence are what compound. Re-audit monthly and update for recency.
