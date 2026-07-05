---
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/claude-code-command-center
title: The smallest thing in here, and I forgot it was running
description: The smallest tool in my Claude Code monorepo — a wrapper that auto-names every unnamed session with its folder and a timestamp, so the session history is actually browsable.
banner: /assets/blog/claude-code-command-center--session-prefixer.svg
bannerAlt: A wall of identical unnamed sessions, a wrapper injecting a folder-and-timestamp name, and a browsable list of dated sessions
---

Claude Code keeps a history of your sessions, and if you never name them, that history is a wall of near-identical entries you can't tell apart. I'd go hunting for the session where I'd worked something out and have nothing to go on — nothing to search, nothing to sort by, just a list that all looked the same.

The fix is almost too small to write about. It's a wrapper that sits in front of the `claude` command on my PATH, and when I start a session without naming it, it quietly slips a name in for me — the current folder plus a timestamp. That's the whole thing. Every session I start is now tagged with where and when, and the history became browsable the day I installed it.

I set it up once and haven't thought about it since. I genuinely forgot it was running until I sat down to write this — which is about the most any tool this size should ask of you. It does one dumb, useful thing forever, and wants nothing back.

Which makes it a fitting place to stop, because it's the last of them: the small end of a shelf I've been walking down, from a dashboard that watches every token to a wrapper that just types a name so I don't have to. None of them are finished, exactly — a couple have wandered off into their own series and will keep going. But the shelf is stocked now, and I can stand back and see everything on it at once, which was the entire point of pulling them into one place to begin with.
