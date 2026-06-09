---
date: 2026-06-09
layout: ../../layouts/BlogPost.astro
title: I used Claude Code to build a plugin manager for Claude Code
description: How I directed Claude Code to build a plugin manager for Claude Code in eleven days — the workflow, the pace, and the Windows bug it caught before I did.
banner: /assets/blog/claude-code-builds-plugin-manager.svg
bannerAlt: A direct-and-build feedback loop between a prompt and a shipped package, over a rising release timeline from 0.0.1 to 0.6.0
---

A few weeks ago I shipped `claude-code-plugin-toggler` — a UI for managing Claude Code plugins per-project without touching the CLI. Two surfaces: a browser UI and a VSCode extension. The whole thing was written by Claude Code. I directed it; it built.

That's the part worth writing about.

**What I built**

Two surfaces — a browser UI and a VSCode extension — that let you toggle plugins per-project with a click. Changes write directly to `.claude/settings.local.json` in your project root, which is the file Claude Code already reads to determine what's active in a session. No CLI round-trips, no interface resets.

**How it actually worked**

I directed, Claude Code built. Every line of application code came from it. My job was specs and sequencing — what to build, in what order, and why.

The build moved fast. `0.0.1` through `0.4.0` in two days, `0.6.0` a week later. Not because I was racing — each version was small and immediately useful, so shipping felt obvious. You build the thing, it works, you use it, you notice what's missing, you build that. The feedback loop was tight because I was the first user.

What kept six releases from stepping on each other was planning everything upfront before writing a line of code — detailed specs for the data model, the two-surface architecture, what each iteration needed to deliver. (How those plans got written is its own story, and one I want to get into separately.)

**The moment that stood out**

A silent uninstall failure on Windows, three weeks in. I patched it once, the symptom moved, I patched it again — I kept fixing the wrong layer. Claude Code dug in and found it: VSCode's `uri.fsPath` returns lowercase drive letters on Windows (`c:\...`), while the Claude Code CLI writes uppercase (`C:\...`). Two systems, same JSON file, neither knowing the other had a different convention. It only breaks at lookup time, with no obvious trace back to the source.

My first fix was 29 lines patching the JSON before every uninstall. Claude Code replaced it with 5 lines in `_projectRoot()` and removed the workaround entirely. Catching that — reading across the call chain, identifying one character as the cause — is the kind of thing I'd have spent an afternoon on.

**What's next**

The tool is at v0.6 and does what I needed. A VSCode Marketplace release is coming so installation is one click. If you're managing Claude Code plugins across multiple projects, it's at [github.com/cheneeheng/claude-code-plugin-toggler](https://github.com/cheneeheng/claude-code-plugin-toggler).
