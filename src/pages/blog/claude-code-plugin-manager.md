---
layout: ../../layouts/BlogPost.astro
title: I built a plugin manager for Claude Code
date: 2026-05-26
description: A browser UI and VSCode extension for toggling Claude Code plugins per-project — built because managing them one-at-a-time in the CLI is painful.
---

Claude Code's plugin management has one real friction point: everything happens one operation at a time. Install a plugin, get dropped back to the terminal, navigate back into the plugin view, do the next one. If you're setting up a project with five plugins, that's five round-trips. I got tired of it, so I built a UI.

**What it does**

`claude-code-plugin-toggler` gives you two surfaces — a browser UI and a VSCode sidebar panel — to toggle plugins on or off per project with a single click. Changes write directly to `.claude/settings.local.json` in your project root, which is the file Claude Code already reads to determine what's active in a session. No CLI round-trips, no interface resets.

There's also a marketplace panel: browse plugins from known registries and stream install output inline without switching to a terminal.

**Getting started**

HTML version — run from the root of the project you want to configure:

```bash
cd /your/project
python3 /path/to/claude-code-plugin-toggler/html/server.py
```

VSCode: open `vscode-extension/` and press `F5` in dev mode, or package it with `vsce package`. A Marketplace release is coming.

Full docs and source at [github.com/cheneeheng/claude-code-plugin-toggler](https://github.com/cheneeheng/claude-code-plugin-toggler). Open it once, set your plugin profile for the project, and never think about it again.
