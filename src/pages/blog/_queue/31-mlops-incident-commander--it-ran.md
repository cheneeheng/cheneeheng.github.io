---
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/mlops-incident-commander
title: Two months of fixes checked against the source, and then the loop finally ran
description: Every fix to my incident loop after release was found and verified by reading code. When the demo finally ran end to end, it worked, and that changed what I think it's for.
banner: /assets/blog/mlops-incident-commander--it-ran.svg
bannerMobile: /assets/blog/mlops-incident-commander--it-ran-mobile.svg
bannerAlt: A stack of audit passes marked compiled and inspected, above a control plane that has finally been switched on
---

[Last time](/blog/mlops-incident-commander--the-answer-key) I ended with two holes closed in the scorecard and no number from it yet. For a while that described the whole repo.

## Compile-checked only

The build commits say it themselves. The one that wired the monitor and diagnosis agents on 24 July ends with "Not validated: LLM/MCP/LangGraph wiring is compile-checked only (no API key, DB, or deps here) — needs a runtime smoke test." The one that finished v1 with the eval harness says the full loop and eval "need a live smoke test", and lists the make targets to run it. v0.1.0 was tagged two days later with a changelog that lists every component as added. Running it wasn't important to me then, and I didn't.

## What reading found

Everything after that was found by reading, and some of it was real. The same week, comparing the code against the iteration plans turned up that the dashboard's live updates had never landed. Pages polled, and the event feed listened for event names the backend didn't emit, so most events were silently dropped. One look at a running dashboard would have shown that in seconds. Instead it was found by comparing strings.

On 26 August came the two answer-key bugs from [the last post](/blog/mlops-incident-commander--the-answer-key). On 27 August I revised the user guide by re-deriving every command, path, env var, log event and UI label from source. Most of it held. What didn't was worse than a typo. Rejecting a remediation is terminal: `reject()` changes no incident status, and `approve()` then raises a conflict, so the incident sits in `awaiting_approval` with nothing that will ever re-diagnose it. The guide had said only that it "is not resolved". The same pass found that if embedding a postmortem fails, the postmortem drops out of memory with nothing to show for it except a `postmortem_embed_failed` log line, which makes that the one event in the system worth alerting on. That commit ends: "Nothing was executed to verify this: the procedures are checked against source, not by running the stack."

I don't mind that it went this way. For a design exercise it was a fine trade-off, and the reading found real bugs.

## Then it ran

The guide revision was the last of it in August. After that I was busy with other projects, and the repo sat until the beginning of October, when I finally brought the stack up: Postgres, migrations, seeded weights, serving, the control plane, the dashboard. Then I ran the demos. All of them worked as intended, and none needed an edit. The only thing that needed any work was me. Some of the examples took explanation before I understood what they were showing, even though they're scripts in my own repo, written in the same July sessions as everything else.

So the bugs reading found were real, the fixes held, and the loop that had only ever been compile-checked did what the commit messages said it would.

## How far it could go

Seeing it run changed what I think the repo is for. I built it as a portfolio piece with a careful line around what was scaffolding, and now that I know what it can do, I think I can go further than that line. The ideas I have so far are a sneak peek more than a plan: package it as a CLI tool that can sit in a CI/CD pipeline, build better dashboards, and integrate directly with more ML frameworks than one CIFAR-10 CNN behind FastAPI. Each of those would pull pieces from the outer ring inward, and I don't know yet which of the three I'll start with.
