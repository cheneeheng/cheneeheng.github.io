---
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/claude-code-command-center
title: Planning got so easy I drowned in plans
description: Planning got cheap enough to do from my phone, so plans piled up across ten repos — docket is the single board I run them all from, one at a time or batched by project.
banner: /assets/blog/docket--drowning-in-plans.svg
bannerAlt: Plans piled across many repos, gathered onto one board showing each plan's lifecycle status, then run as a batch grouped by project
---

Planning got too easy. I can sketch one almost anywhere now — in a real Claude Code session, or just typing into the web chat on my phone — and the planning skill turns it into a proper markdown plan I can drop into a repo. The trouble with a thing being easy is that you do a lot of it. I ended up with plans scattered across something like ten repos, each sitting in its own `.agents_workspace/planning/` folder, with no way to see them all at once or remember which ones I'd actually acted on.

And planning is only half of it. Once I had ten repos' worth of plans, I didn't want to walk into each repo one at a time, run the plan, wait, move to the next. I wanted to point at a stack of them and say: implement these. Batch it — let plans in different projects run at the same time and plans in the same project queue up behind each other.

So docket is a single board over all those repos. It reads a registry of where they are, surfaces every plan and where it sits in its lifecycle — ready, running, implemented — and lets me run them without leaving the tool, singly or as a batch grouped by project. It only ever reads the plans themselves; the status and history it tracks live in a separate sidecar, so the plans stay exactly as the planning skill wrote them.

That's as far as I'll take it here. Whether I actually trust docket to run a plan unattended, or still hover over every one — that's the question the rest of this series is really about, and I haven't settled it for myself yet. This first post is just the shape of the problem: planning stopped being the bottleneck, so keeping track of what I'd planned became the new one. docket is where I dropped the whole pile, so I could work through it instead of drowning in it.
