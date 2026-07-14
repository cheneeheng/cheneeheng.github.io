---
date: 2026-07-14
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/claude-code-command-center
title: I couldn't see the wall until I hit it
description: My Claude Code status line started as a context gauge back in the 200k days, grew rate limits and a cost figure — and why I trust two of those three and squint at the third.
banner: /assets/blog/claude-code-command-center--statusline.svg
bannerAlt: A Claude Code status line growing from a context-window bar, to 5-hour and 7-day rate-limit gauges, to a cost figure marked as one to squint at
---

For a while the only warning I got that a session was running low on context was the compaction kicking in. Back then the default window was 200k, and I'd be mid-flow when Claude Code would quietly stop and compact the conversation to make room — and only then would I register how close to the edge I'd been. I wanted to see it coming: a bar somewhere that told me how full the window was before it forced the issue.

So the first version of the statusline hook was exactly that — a context gauge. Claude Code lets a `StatusLine` hook print a line each turn, and mine printed one thing: how full the window was.

The usage limits were a second wall, and I found that one the hard way too. Mid-session, no warning, just a stop. Then Claude Code started handing the hook the 5-hour and 7-day rate-limit numbers for free, so I bolted those on. Now the line carried the context bar and both limits with their reset times. The alternative was opening the Claude web dashboard to check, and going to a web page to find out how much runway I had left is not something I wanted in my loop.

The last thing I added was cost. I'm on a paid plan, so I don't actually pay per token — but I was curious what I'd be paying if I did. The line started showing a dollar figure per session, a number that meant nothing to my bill and everything to my curiosity.

Which is where this line and money stopped getting along. Claude Code's own docs call that cost field an estimate computed client-side that may differ from your real bill, and I'd come to trust it about that little. The context bar and the rate limits I'd bet on; the dollar figure I'd started to squint at. The hook can also append each turn to a small log — off by default — and that log is the thread I picked up next, because a number I could actually believe, with any history behind it, was never going to fit on one line.
