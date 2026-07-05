---
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/claude-code-command-center
title: I couldn't tell which skill would fire
description: Two skills, same name, no way to tell which one Claude Code fires — so I built a browser that lists every skill, agent, and hook on the machine, shows which one wins, and lets me read what each actually does.
banner: /assets/blog/claude-code-command-center--component-browser.svg
bannerAlt: Skills, agents and hooks scattered across plugins and loose folders, gathered into one searchable list, with a name collision resolved by striking through the shadowed loser
---

Most times I open the component browser, I'm halfway through writing a new skill. I've got a name in mind, and before I commit to it I want to see what's already on the machine — whether something loose, or something from a plugin, is already sitting on that name or close to it. I check because I've learned Claude Code won't stop me from colliding.

It stopped me once by not stopping me. I had two skills with the same name — one written loose under `.claude`, one from a plugin — and no list anywhere told me which one a session would use. The only way to find out was to run something and watch which behavior turned up.

And it wasn't just that pair. Between the plugins I'd installed and the skills and agents I'd authored loose, I'd lost track of what was even on the machine. Claude Code doesn't hand you one list of every skill, agent, and hook a session can reach — they're spread across each plugin's folders and across whatever's loose under `.claude`, at user scope and project scope. I knew roughly what I had. I couldn't see it.

So the component browser is that list. It pulls every component off the machine — plugin and loose, skill and agent and hook, user scope and project — into one searchable page (the reading underneath is the same `claude-plugins` library the [plugin toggler](/blog/claude-code-plugin-toggler--plugin-manager) runs on). The part I built for myself is the shadowing: when a loose component and a plugin one share a name, the page doesn't just show both, it picks the winner — loose over plugin, project over user — and strikes a line through the one that loses. The answer I used to get by running a session and watching what happened is sitting on the row now.

The other thing I lean on is reading the bodies. It renders a skill or agent's markdown right in the page, so I can open one and see whether it actually does anything — real instructions inside, or just a title over a stub. Scanning a pile of skills I only half-remember writing, whether one does what its name claims is a question I'd rather answer by reading it than by guessing.

What it won't tell me is *why* Claude Code resolves things the way it does — it shows the machine's answer, not the reasoning, and I'm trusting that my model of the precedence matches the real one. So far they've agreed. But I built the thing because I'd stopped being able to hold all of this in my head, so trusting my head about the last mile of it is the part I keep an eye on.
