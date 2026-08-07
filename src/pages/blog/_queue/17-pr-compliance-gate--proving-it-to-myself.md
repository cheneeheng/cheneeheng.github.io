---
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/pr-compliance-gate
title: A pull-request reviewer I built to find out whether I could
description: A portfolio piece, plainly — a LangGraph and Agent SDK pipeline that reviews PRs against policy, built around two cost gates that keep most traffic away from the expensive models.
banner: /assets/blog/pr-compliance-gate--proving-it-to-myself.svg
bannerAlt: A review pipeline split into a cheap green path and an expensive orange path, with two gates controlling which traffic reaches the expensive one
---

The honest version is that I wanted to find out whether I could build one. Not a demo of an agent calling a tool — an actual orchestrated pipeline, with a cost gate deciding what's worth spending money on, specialists running in parallel, a sub-agent on a short leash, and a human who has to say yes before anything is final. I had read enough about production agent systems to have opinions about them. I hadn't built one end to end, and an opinion you haven't paid for isn't worth much.

So it's a portfolio piece. I'm not going to dress that up. The thing I wanted out of it was the artifact and the knowledge of whether I could produce it, in that order.

## Why a pull-request gate carried it

The vehicle had to be a real enough problem that the hard parts weren't optional, and reviewing pull requests against security, licensing, and data-handling policy turned out to be all four things I needed at once.

It forces every hard part: you can't review a PR properly without classification, retrieval, specialists that disagree, an escalation path, and someone to sign off. Nothing had to be bolted on to justify itself. It's a domain I know, so I can look at a verdict and tell whether it's any good — with a toy problem I'd have been grading my own homework in a subject I'd invented. Cost is visible in it: a README typo and a new GPL dependency are obviously not worth the same amount of compute, so cost gating has something to bite on instead of being a slide. And it's plausible as a thing a company might actually run, which mattered because a portfolio piece that only makes sense as a portfolio piece isn't demonstrating much.

## The green path and the orange path

The pipeline is a LangGraph state machine: intake, classify, retrieve policy, score risk, fan out to specialists, reconcile, verdict. What makes it interesting to me is that most reviews never touch most of it.

A Haiku classifier and a Haiku risk scorer sit at the front. If a change scores below the risk threshold, it exits at `verdict(auto_approved)` straight from the scorer, and a Sonnet specialist is never invoked at all. That's the first cost gate, and it's where the README typo goes: classified as `docs`, scored low, approved, done, for the price of two cheap calls.

Everything at or above the threshold fans out to parallel security and licensing specialists on Sonnet. Those can ask for a deeper autonomous investigation, and that investigation — an Agent SDK sub-agent with sandboxed tools — is the most expensive thing in the system. It runs only when a specialist explicitly says it can't decide from the diff alone and there's loop budget left. That's the second gate.

Splitting the diagram into a cheap green band and an expensive orange band was the clearest way I found to think about it. Both gates exist for one purpose: keep traffic out of the orange band unless it's earned its way in.

## Nothing hangs, and nothing is lost

Two decisions fell out of taking the "production-grade" framing seriously rather than as decoration.

Every node checkpoints to SQLite. Not for speed — because there's a human approval gate in the middle of this thing, and a review that stops for a human might stop for a long time. A process restart shouldn't cost a review. It resumes where it stopped.

And each specialist runs under a timeout. When one expires the review escalates to a human instead of hanging, which is the rule I kept applying everywhere afterwards: a component that can't finish should hand the decision to a person, not stall holding it.

Whether any of that actually produces reviews worth trusting is a different question from whether the machinery works, and at this point I'd only answered the second one.
