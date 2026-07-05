---
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/claude-code-command-center
title: The same file, quietly different in every repo
description: I'd copied the same CLAUDE.md and configs across a dozen repos and let them drift — Vantage is a single HTML file that surveys every repo, diffs any two files, and copies the good version across.
banner: /assets/blog/claude-code-command-center--cross-repo-diff.svg
bannerAlt: Many repos on one board, two files from two repos diffed line by line, and one copied over the other
---

I kept the same file in a lot of places. A `CLAUDE.md` I liked, a config, a little script — I'd copy it into a new repo, tweak it there, and forget the four other repos still had the older version. Months later I couldn't tell you which copy was the good one. They'd all drifted a little, and the filesystem gives you no way to see that; you can only open two of them and squint.

The other half of it was less about drift and more about memory. How did I solve this in that other project? I'd know I'd written the thing before, somewhere, and want to put the two versions side by side — this repo's against that one's — without cloning both into an editor and going hunting.

So Vantage points at the folder where all my repos live and turns each one into a card. I pick a file from one repo and a file from another, it diffs them, and if one is the version I want, I copy it over the other right there. The two repos stay highlighted on the board so I never lose track of which pair I've got loaded.

It's one HTML file. No server, no build, no install — I open it off `file://` and it works, which means I can drop it anywhere and run it. Part of that was just not wanting a thing I had to stand up every time. The other part was a challenge to myself: I wanted to find out what a plain web page can actually do now. It turns out a browser can ask for a folder on your disk and read and write inside it directly — the File System Access API — so a single HTML file really can be a repo browser that edits your files. The cost is that it only works in Chromium browsers, and I decided I could live with that.

It's deliberately manual — I'm the one deciding which copy wins, one file at a time, and for things that drifted on purpose that's exactly what I want. Where I keep catching myself is the line between this and just automating the sync outright: some of these files I don't want to think about at all, I just want the newer one to win everywhere. That's a different tool, and a different kind of trust.
