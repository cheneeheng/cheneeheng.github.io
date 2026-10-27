---
date: 2026-10-27
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/mlops-incident-commander
title: An on-call engineer for a model, and the scaffolding I built so it had something to watch
description: A LangGraph loop that watches a live classifier, opens incidents, and proposes fixes. Most of the repo is fake on purpose, and I wrote down which parts.
banner: /assets/blog/mlops-incident-commander--the-on-call-engineer.svg
bannerMobile: /assets/blog/mlops-incident-commander--the-on-call-engineer-mobile.svg
bannerAlt: Three concentric rings, a simulated world on the outside, a sensing layer in the middle, and the reasoning agents at the centre
---

I've watched a model degrade without anyone noticing, and that was part of where this started. The other parts were less noble. I wanted a portfolio piece, and I was curious whether a handful of agents could supervise a model the way an on-call engineer would.

The idea I wrote down on 11 July was that an ML model in production degrades in ways that are visible in its output statistics long before anyone files a ticket. Confidence sags, the class mix tilts, latency creeps. So I wanted a closed loop that watches a live model's prediction stream, decides on its own when something is wrong, investigates with read-only tools until it can cite evidence, and proposes a fix.

## Something to watch and something to break

The trouble is that I don't have a production model. The plan worked around it by building the whole world the loop would sit in. A FastAPI service serves a small CIFAR-10 CNN. A traffic generator hits it continuously. An injection harness breaks it on demand in four labelled ways: feature drift (brightness and noise on the inputs), latency degradation, a bad deploy, and label skew. Every prediction lands in Postgres, and an aggregator rolls the log into 30-second windows with latency percentiles, mean confidence, entropy, and a PSI score against a reference profile.

On top of that sits the part I actually cared about. Agents in one LangGraph process take each window. A monitor decides whether it's an incident, a diagnosis agent investigates through four MCP tool servers and writes a hypothesis with citations, a second opinion and an adjudicator step in when that hypothesis is shaky, and a remediation step proposes an action. Once the incident is resolved a postmortem gets written and embedded into pgvector so later diagnoses can recall it. Every model call is metered for tokens, dollars and latency.

The SKELETON is dated 11 July. The five iterations that built it out landed on 23 and 24 July, and v0.1.0 was tagged on the 26th.

## Three rings

Once it existed, it was obvious that it would be hard to tell later which parts to take seriously. A CIFAR-10 CNN is not a production model, and a `deploy` table where "rollback" means swapping which row is active is not a deployment system. I wrote the split down mostly for future me, so that coming back to this in six months I wouldn't mistake the demo for more than it is.

I think of it as three rings. The outer one is the simulated world: the traffic, the faults, the CNN, the deploy rows. It's scaffolding, and it exists only so the loop has something to watch and something to break. The middle one is sensing, the aggregator and the MCP servers. It's the honest boundary, because the agents see only what a real operator's telemetry would show. The inner ring is the reasoning under guardrails, everything from the monitor to the postmortem memory, and that's the part I wrote as if it were production. If this were ever pointed at real telemetry, the inner ring is what I'd expect to keep and the outer one is what I'd throw away.

The uncomfortable details go in the same list. Only `rollback` has any real effect on the running system. `retrain_trigger` and `pipeline_fix` are recorded state transitions that complete immediately, and no pipeline is touched. They're there to exercise the approval and audit path without pretending to own infrastructure the repo doesn't have.

## What I left out on purpose

Some things I left out deliberately. There's no auth on any endpoint and no rate limiting. The SSE event broker is in memory, so the control plane can't run more than one worker. There's no automated test suite, and the eval harness stands in as the quality gate. Every 30-second window costs one model call because there's no numeric pre-filter. Postmortem memory never decays and nothing prunes a bad entry. And a rejected remediation is a dead end that leaves its incident waiting for approval forever.

None of that was what the project was about. The inner ring was, and the most interesting thing in it is a split I made deliberately from the start: the model alone decides whether something is wrong, and it isn't allowed to decide what to do about it. That split is the next thing I want to write about, because I'm still not sure I drew it in the right place.
