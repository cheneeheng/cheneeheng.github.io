---
date: 2026-05-26
layout: ../../layouts/BlogPost.astro
title: Five plugins, five round trips
description: Setting up yet another project with my usual Claude Code plugins, I got annoyed enough to build a toggler — a browser UI and a VSCode panel over one JSON file.
banner: /assets/blog/claude-code-plugin-manager.svg
bannerAlt: Rows of plugin toggle switches, some on and some off, with a cursor flipping one
---

This started, like most tools I end up building, with a small annoyance I'd stopped noticing. I was setting up a new project and wanted my usual set of Claude Code plugins in it — the coding contract, the git workflow, a few others. Claude Code's plugin interface does everything one operation at a time: open the plugin view, enable one, get dropped back to the terminal, navigate back in, do the next. Five plugins, five round trips. I'd done this dance on every project for weeks before it occurred to me to be annoyed properly.

What made it feel fixable was realizing how little is actually happening underneath. All that menu navigation ends in a one-line change to `.claude/settings.local.json` in the project root — a plugin name flipped to `true` or `false`. That file is the whole contract. Claude Code reads it at session start to decide what's active. So the question became: why am I going through a terminal UI to edit a JSON file when I could just... see the file as a list of switches?

So that's what I built. [`claude-code-plugin-toggler`](https://github.com/cheneeheng/claude-code-plugin-toggler) puts every plugin you have installed in front of you as a row with a toggle, scoped to the project you're in. Flip a switch, the JSON updates, the next Claude Code session picks it up. No round trips, nothing to navigate back into.

It ended up with two faces, because I kept wanting it in two places. There's a browser UI backed by a tiny Python server, for when I just want to set up a project quickly:

```bash
cd /your/project
python3 /path/to/claude-code-plugin-toggler/html/server.py
```

And there's a VSCode extension that puts the same list in a sidebar panel, because that's where I actually live most of the day. For now the extension runs from source — open `vscode-extension/` and press `F5`, or package it with `vsce package`. A proper Marketplace release is on the list.

Along the way it grew a marketplace panel too: browse plugins from known registries and install them with the output streaming inline, instead of switching to a terminal and back. That wasn't in the original plan; it's just where the same annoyance pointed next.

I've been using it daily since the first rough version, which means I've also been finding out what's wrong with it daily. Windows in particular has opinions about file paths that have already bitten me more than once, and I don't think I've seen the last of it. Once I understand what's actually going on there, that's probably the next thing I'll write up.
