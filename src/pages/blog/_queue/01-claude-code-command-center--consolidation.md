---
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/claude-code-command-center
title: The monorepo I wouldn't have built before Claude Code
description: Why I pulled a dozen standalone Claude Code tools into one monorepo called C4 — and why that would have been a maintenance trap before Claude Code could read the whole thing.
banner: /assets/blog/claude-code-command-center--consolidation.svg
bannerAlt: From scattered standalone repos, to one monorepo called C4 split into apps, tools and libs, to Claude Code reading the whole repo and surfacing duplication
---

Three things kept happening. I'd sit down to build some small Claude Code utility and realize I'd already written half of it somewhere else — the same transcript-reading loop, copied into another repo. I'd open a folder and genuinely not be sure what I'd built the week before. And when I wanted to run one of these on another machine, I'd have to remember how I'd set it up, which I never could. Hey, there are quite some duplications. Hey, I'm not sure what I built last week. Hey, how do I set that up again.

Each of these was its own standalone repo. A repo for the statusline hook, a repo for the plugin toggler, a repo for the thing that reads token usage out of Claude Code's transcripts. The only two that already shared a home were the usage-report CLI and the usage-dashboard app, because they read the same data and I'd never bothered to separate them. Everything else lived on its own little island, and the islands were multiplying faster than I could keep a map of them.

So the consolidation was the obvious move once I said it out loud. Pull them all into one repo — apps you open in one folder, tools that do one job in another, the shared reading code in a third. I called it the Claude Code Command Center: four C's, so, C4 — because every one of these tools is built around Claude Code, and increasingly, built with it too.

That second part is the whole reason this works. I wouldn't have done it a few years ago. A monorepo of a dozen half-related utilities is exactly the kind of thing that rots: you stop knowing what's in it, the duplication just moves from across repos to across folders, and now you've got one big mess instead of twelve small ones. Back when the number of little tools I was building started to blow up, that would have been the real risk. What changed is the thing the whole repo is named after. Claude Code can see the whole repo at once — when I go to add something, it finds the loop I already wrote and tells me to reuse it. The duplication that used to hide across repo boundaries is just visible now; it's a question I can ask instead of a mistake I discover later.

I still gave it structure, because I don't trust a single big folder to stay honest on its own. Apps are destinations you open — the usage dashboard, the plugin toggler, the component browser. Tools are plumbing that does one job and gets out of the way — the statusline hook, the scheduled digests. And a shared library only earns its own folder when two real things actually use it, never one; I extract on the second consumer, not the first. That last rule is the one I'm most sure of, because I've paid for getting it wrong — a "shared" library with a single consumer is just a more complicated way to write that one consumer.

One of these, the plugin toggler, has already grown past being a folder in here and has [its own series on this blog](/blog/claude-code-plugin-toggler--plugin-manager), so I won't re-tell it. That's the pattern I expect to see again: most of these stay small entries in the catalog, and every so often one turns out to be interesting enough to walk off on its own.

For now it's better in every way I can measure. I open one repo and I can see everything I've built. The setup problem is one script. The duplication problem is a question. Back when these numbers were smaller I'd have told you a monorepo like this was a maintenance trap, and I'd have been right — the difference is entirely in the tooling I now use to maintain it. I'm confident that holds. But I've been wrong about the future before, and I can't see this one either.
