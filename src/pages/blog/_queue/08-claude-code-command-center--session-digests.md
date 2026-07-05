---
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/claude-code-command-center
title: Harvesting lessons from sessions I'd never reopen
description: Claude sessions are disposable, so I harvest their lessons into a weekly master file on a schedule — plus a hand-run skill I built for a separate credit pot Anthropic announced but never shipped.
banner: /assets/blog/claude-code-command-center--session-digests.svg
bannerAlt: Sessions processed on a nightly schedule, their lessons funnelled into one weekly master file, runnable as either an unattended cron or an on-demand skill
---

Every Claude Code session ends the same way: I close the terminal and never look at it again. Somewhere in that scrollback was the fix I fought for, the wrong turn I took first, the small thing I finally understood about some tool — all of it sealed in a transcript I have no intention of ever reopening. It felt wasteful. Not the tokens; the learning. I was solving things and then filing the solutions straight into a drawer I never open.

So I set a small pipeline loose on those transcripts on a schedule and pointed its output at a git repo I keep for nothing else. Most of it I don't really touch. The part I do is the weekly pass — it takes everything the week's sessions taught me, throws out the project-specific noise, and boils the rest into one master file of lessons worth keeping. That file is the whole reason the pipeline exists. Once a week I actually read it, and every so often something in it changes how I work.

The nightly lessons runs feeding it are there for a boring reason: money. A week of sessions processed in one Sunday go would take an ugly bite out of my quota all at once, so I smear the work across small nightly runs instead. There's a daily summary pass too, which just narrates each session back to me — I built it, looked at it a few times, and quietly stopped. It's still running. I'm not entirely sure why.

The cron came first: nightly and weekly, firing while I sleep. Running Claude Code on a schedule like that spends my main usage pot, the same one my real work draws from, and for a while I just ate that cost. Then Anthropic announced that scheduled, programmatic use on paid plans would move to its own separate credit pot — so I built a second way to run every digest, as a skill I trigger by hand from inside a normal session, to keep these runs off that pot. Not ideal; I have to actually be sitting there. But at least it wouldn't touch the separate allowance.

The separate pot never went live. It still isn't, today. So having carefully built an escape hatch from a change that never came, I'm back to running everything on cron, exactly as I started — the skill sitting there unused, waiting for a day that keeps not arriving. When it finally does I'll be ready, assuming I remember I built the thing.
