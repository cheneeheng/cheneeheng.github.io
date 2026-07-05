---
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/claude-code-command-center
title: I let a copy win, and it ate my status line
description: file-sync keeps my Claude config in step across two folders, newer wins either way — until a raw copy clobbered a machine-specific statusLine.command and taught me why settings.json needs a merge, not a copy.
banner: /assets/blog/claude-code-command-center--file-sync.svg
bannerAlt: Two folders kept in sync newer-wins in both directions, a raw copy clobbering a machine-specific settings key, and a merge that keeps that key while newer values win
---

Last time I wrote about reconciling files across repos by hand, and admitted the thing I really wanted for some of them was to stop deciding at all — just let the newer copy win, everywhere, automatically. This is that tool. It's smaller than the manual one, and more dangerous.

The setup is that I keep my Claude config in two places and I'm careless about which one I edit. I'll tweak a `CLAUDE.md` in whichever folder I happen to be sitting in and not give the other a thought. So file-sync watches both and, on a timer, copies whichever one I touched last over the one I didn't. No canonical copy, no source of truth — whichever is newer wins, in either direction.

That worked fine right up until I pointed it at `settings.json`, where it promptly ate my status line. The two configs weren't actually identical: one machine's `settings.json` had a `statusLine.command` pointing at a path that only existed on that machine. Newer-wins copied the whole file across, path and all, and the other side went looking for a status line script that wasn't there.

So `settings.json` doesn't get the raw treatment anymore. It gets a merge: the newer file's values win, but a short list of machine-specific keys — `statusLine.command` first among them — are held back and left exactly as each side had them. `CLAUDE.md` is plain text with nothing machine-local in it, so it still just gets copied whole. One engine, two strategies, and the gap between them is a lesson I only learned by breaking something.

It runs in the background now and I've mostly stopped noticing it — which is either the mark of a tool that works or the precise condition under which it'll quietly do something I don't want. A bidirectional newer-wins sync has no undo; if I ever save garbage in one copy, the timer will faithfully carry it to the other before I look up. I know this. I keep it running anyway, because typing the same edit into two folders was the thing I genuinely couldn't stand.
