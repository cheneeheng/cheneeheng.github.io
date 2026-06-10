---
date: 2026-06-04
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/claude-code-plugin-toggler
title: The plugin manager I didn't write
description: Every line of my Claude Code plugin manager was written by Claude Code. What I actually did all those days — specs, sequencing, and being the first user — and where the model out-debugged me.
banner: /assets/blog/claude-code-builds-plugin-manager.svg
bannerAlt: A direct-and-build feedback loop between a prompt and a shipped package, over a rising release timeline from 0.0.1 to 0.6.0
---

There's a fact about [`claude-code-plugin-toggler`](https://github.com/cheneeheng/claude-code-plugin-toggler) that I've mentioned in passing across these posts but never actually looked at straight on: I haven't written a line of it. Every line of application code — the Python server, the VSCode extension, the CSS, the tests — came out of Claude Code. A plugin manager for Claude Code, written by Claude Code. At some point the recursion stops being a joke and becomes just how the project works, and I wanted to write down what my job in it actually was.

My job was deciding. Before any code existed, I sat down and wrote planning documents — a skeleton describing what the tool is, and then numbered iteration specs, each one a contract for a slice of work: what this iteration delivers, what it explicitly doesn't, what it depends on. Then I fed them to Claude Code one at a time and reviewed what came back. The numbered specs in the repo's `docs/planning/` folder keep stacking up, and reading the sequence back is the closest thing the project has to a diary.

What surprised me was the pace, and more specifically the shape of the pace. Versions 0.0.1 through 0.4.0 landed in two days; 0.6.0 a week later. Not because I was racing — because each iteration was small and immediately useful, so shipping never felt like an event. You build the slice, it works, you use it, you notice what's missing, you write the next spec. The loop stayed tight because I was the first user, sitting closer to the product than any tester could. Half my specs began life as an irritation I'd felt that same morning.

The planning-up-front part is what kept six releases from stepping on each other. When the data model and the two-surface architecture are written down before any code exists, "does this change break the other surface?" is a question you answer in the spec, on paper, cheaply. The iterations stack instead of colliding. I want to write more about that discipline separately, because I think it's most of why this workflow held together.

I should be honest about the division of labor, though, because "I directed, it built" makes it sound cleaner than it felt. Directing meant reading a lot of code I didn't write, deciding whether it matched what I meant, and frequently discovering that what I meant wasn't as precise as I thought. The model is an unforgiving mirror for a vague spec. The iterations that went smoothly were the ones where I'd done my thinking; the messy ones were mine to own.

And then there was the moment the relationship inverted. I've [written about the Windows drive-letter bug](/blog/claude-code-plugin-toggler--lessons) already — the silent uninstall failure I patched twice in the wrong layer, then smothered under a 29-line workaround. It was Claude Code that traced the whole call chain and found the single lowercase character causing it, then replaced my workaround with five lines at the source. That afternoon the usual roles flipped: I had written code (the band-aid was mine in spirit, if not in keystrokes), and the model reviewed it, found it wanting, and was right. It's the clearest case so far where the tool wasn't just faster than me — it saw something I had demonstrably failed to see across three releases.

The tool does what I built it for now, and a VSCode Marketplace release is coming so that installing it stops requiring an `F5`. But the reason I keep writing about this little project isn't really the tool. It's that the workflow — specs in, code out, me deciding and the model building — keeps producing moments I don't fully expect, and I want a record of them while they're still surprising.
