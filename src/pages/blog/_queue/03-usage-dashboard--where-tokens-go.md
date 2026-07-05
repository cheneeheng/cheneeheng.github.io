---
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/claude-code-command-center
title: Where all my tokens actually went
description: The Claude Code status line shows the moment; I wanted the story — so I built a dashboard that breaks token usage down by project, tool, and model, with a rate-limit trajectory that tells me when I'll hit the wall.
banner: /assets/blog/usage-dashboard--where-tokens-go.svg
bannerAlt: A usage dashboard with a by-project bar chart, an activity heatmap of when Claude Code gets used, and a rate-limit trajectory line climbing toward a cap
---

The status line could tell me the moment I was in — how full the context was, how close the next reset — and nothing about the shape of any of it. It couldn't tell me that one project had quietly eaten most of my week, or that I burn tokens fastest on Sunday nights, or that a single runaway session cost more than the previous twenty combined. I wanted the story behind the live number, and one line was never going to hold a story.

So the dashboard is where the history goes. It reads the same transcripts Claude Code already writes for every session and turns them into the things I actually wanted to see: usage by project, by model, by tool; a heatmap of which hours I lean on it hardest; week-over-week deltas so I can tell whether I'm genuinely trending up or just having a loud day. I can scope the whole thing to the last 7 or 30 days, or to a single project, and watch every number recompute around the filter.

The part I check most grew straight out of the wall I kept hitting — and it's where that quiet status-line log from before comes back. The line shows the current rate-limit percentage; the dashboard reads its exported log and plots the trajectory, where the 5-hour and 7-day limits are heading and roughly when they'll cap, reset counting down beside it. It's the difference between knowing I'm at 80% and knowing I'll be at 100% by three this afternoon. That forecast is most of why I keep it open in a tab.

Cost is on there too, though I hold it a little loosely. I'm on a plan, so it's a number I'll never actually be billed, and I estimate it from tokens rather than trusting the reported figure — which, in a litellm comparison once, came out about ten percent off. There's a card that turns the counterfactual into something almost useful: give it your monthly price and it weighs the value you burned against what you pay. Am I getting my money's worth, as a gauge.

I've barely touched what's in here — the drill-downs, the per-session economics, the export, the filtering I lean on more than I expected. That's why it's getting its own series instead of one tidy post. This is the front door: I wanted to stop guessing where my usage went, and now most days I can just look.
