---
date: 2026-06-07
layout: ../../layouts/BlogPost.astro
title: The plugin scope I skipped was the repo's own stance
description: Going from a two-tier local/global plugin model to three scopes — Local, Project, User — because the missing one lets a repo carry its own opinions to whoever works in it.
banner: /assets/blog/claude-code-plugin-toggler--scopes.svg
bannerAlt: Three stacked settings files — local gitignored, project committed, user home-wide — feeding one plugin toggle list
---

When I first shipped [`claude-code-plugin-toggler`](https://github.com/cheneeheng/claude-code-plugin-toggler), it had two tiers: local and global. A plugin was either on for me in this one project, or on for me everywhere. That was enough for how I was using it at the time, so I didn't think much about what it left out.

What it left out turned up in my own work a few weeks later. I'd build a skill for a project — say, one that encodes how commits should be written here, or what the review stance is — and I'd want it to apply to anyone working in that repo, not just to me on this laptop. The two tiers couldn't say that. Local was personal and gitignored. Global followed me around to every other project. There was no way to attach a plugin to the repo itself.

That's the part I'd underrated. A skill isn't neutral tooling. It usually carries an opinion — a position on how things get done in a given codebase. When that opinion lives only in my local settings, it stays mine. I wanted a place to put it where it became the repo's, so that anyone who opened the project inherited the same stance on the things those skills cover.

**The middle tier**

So I added a third scope. There are three now, each backed by its own settings file:

- **Local** → `<project>/.claude/settings.local.json` — gitignored, just me on this machine.
- **Project** → `<project>/.claude/settings.json` — committed to git, travels with the repo.
- **User** → `~/.claude/settings.json` — me, in every project.

The Project tier is the one I'd been missing. I toggle a plugin on there, commit the file, and it's no longer a thing I have to remember to set up — it's part of the project, the same way a linter config or an editorconfig is. Whoever works in the repo next starts from the same set of opinions I left in it.

I didn't invent this layering. It's what Claude Code already does when it reads settings — local sits over project sits over user. The old two-tier UI just wasn't showing the middle file. The rewrite surfaces all three and lets me toggle, install, and uninstall inside each.

**Renaming global to user**

The smaller change in the same release was a rename. I'd been calling the home-directory tier "global." Claude Code calls it "user." So I switched to "user."

I went back and forth on whether that was worth the churn, and decided it was. When my label and the tool's label disagree, I'm the one who has to keep translating between them — "global, that's the user one." The whole point of this thing is to be a window onto files Claude Code already owns, and a window shouldn't relabel what's behind it. Borrowing the host's word was the less interesting choice and also the one that stopped tripping me up.

**What it actually took**

Going from `{ local, global }` to three independently-bucketed scopes wasn't tidy. It touched around 2,150 lines — the Python server and the VSCode extension both had their plugin-loading rewritten, and the shape of the data flowing into both UIs changed. It's the same tax I wrote about [last time](/blog/claude-code-plugin-toggler--lessons): two implementations, so every scope rule got written once in Python and once in Node.

The fiddly part was bucketing. The same plugin can show up in more than one settings file with a different enabled state in each, and the UI has to decide which scope owns the row and what to display when they conflict. That resolution had to match Claude Code's own precedence, because the moment the UI shows a state that differs from what a session actually loads, it's worse than no UI — it's a confident wrong answer. I rewrote the smoke tests around exactly that before I believed the model: scope bucketing, cross-project exclusion, toggle validation.

It's a quieter feature than the marketplace or the install streaming. But it's the one that changed what the tool is for. It went from somewhere I manage my own plugins to somewhere a repo can hold its own.
