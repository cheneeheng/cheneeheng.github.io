---
date: 2026-06-07
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/claude-code-plugin-toggler
title: The plugin scope I skipped was the repo's own stance
description: Going from a two-tier local/global plugin model to three scopes — Local, Project, User — because the missing one lets a repo carry its own opinions to whoever works in it.
banner: /assets/blog/claude-code-plugin-toggler--scopes.svg
bannerAlt: Three stacked settings files — local gitignored, project committed, user home-wide — feeding one plugin toggle list
---

A few weeks after shipping [the toggler](/blog/claude-code-plugin-toggler--plugin-manager), I built a skill that had nowhere to live. It encodes how commits should be written in one particular repo — the conventions, the format, the stance. I wanted it active for anyone who worked in that repo, not just for me on this laptop. And I realized, toggles hovering in front of me, that my own tool couldn't say that.

The toggler had two tiers at the time: local and global. A plugin was either on for me in this one project, or on for me everywhere. That had been enough for how I was using it, so I'd never thought hard about what it left out. What it left out was the middle: there was no way to attach a plugin to the repo itself. Local was personal and gitignored. Global followed me to every other project, where this repo's commit conventions would be noise. The thing I actually wanted — *this plugin belongs to this codebase* — fell exactly in the gap.

That's the part I'd underrated when I sketched the original model. A skill isn't neutral tooling. It usually carries an opinion about how things get done in a given codebase, and as long as that opinion lives in my local settings file, it stays mine. I wanted somewhere to put it where it became the repo's — where the next person to open the project inherits the same stance, the way they inherit the linter config.

So the new release has three scopes, each backed by its own settings file:

- **Local** → `<project>/.claude/settings.local.json` — gitignored, just me on this machine.
- **Project** → `<project>/.claude/settings.json` — committed to git, travels with the repo.
- **User** → `~/.claude/settings.json` — me, in every project.

I didn't invent this layering, which is the comfortable part. It's what Claude Code already does when it reads settings — local over project over user. My two-tier UI had simply been hiding the middle file. The rewrite surfaces all three, with toggle, install, and uninstall inside each.

There was a rename hiding in there too. I'd been calling the home-directory tier "global"; Claude Code calls it "user." I went back and forth on whether switching was worth the churn and eventually admitted that the friction was all on my side — every time I read my own UI I was translating: *global, that's the user one*. The whole point of the tool is to be a window onto files Claude Code owns, and a window shouldn't relabel what's behind it. So it says "user" now, and the small constant tripping-over has stopped.

I won't pretend the change was tidy. Going from `{ local, global }` to three independently-bucketed scopes touched around 2,150 lines — plugin loading rewritten in the Python server *and* the VSCode extension, the shape of the data feeding both UIs changed. It's the same tax I wrote about [last time](/blog/claude-code-plugin-toggler--lessons): two implementations, so every scope rule got written once in Python and once in Node.

The genuinely fiddly part was bucketing. The same plugin can appear in more than one settings file with a different enabled state in each, and the UI has to decide which scope owns the row and what to show when they disagree. That resolution had to match Claude Code's own precedence exactly — the moment my UI shows a state that differs from what a session actually loads, it's worse than no UI; it's a confident wrong answer. I rewrote the smoke tests around precisely that fear before I trusted the thing: scope bucketing, cross-project exclusion, toggle validation.

It's a quieter change than the marketplace panel or the install streaming, but it's the one that shifted what the tool is for. The skill that started all this is committed in its repo's project scope now, waiting for whoever opens the project next. The toggler went from somewhere I manage my plugins to somewhere a repo can hold its own.
