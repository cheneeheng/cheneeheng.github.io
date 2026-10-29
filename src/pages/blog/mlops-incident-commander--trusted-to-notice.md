---
date: 2026-10-29
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/mlops-incident-commander
title: The model decides there's an incident, and a lookup table decides what to do about it
description: Detection in my incident loop has no thresholds at all, only a model's judgement. Remediation ignores the model entirely. Why I split the trust that way, and where it leaks.
banner: /assets/blog/mlops-incident-commander--trusted-to-notice.svg
bannerMobile: /assets/blog/mlops-incident-commander--trusted-to-notice-mobile.svg
bannerAlt: A model's judgement feeding the monitor on the left, and a fixed policy table gating the remediation on the right
---

[Last time](/blog/mlops-incident-commander--the-on-call-engineer) I ended on a split in the inner ring: the model alone decides whether something is wrong, and it isn't allowed to decide what to do about it. I said I wasn't sure I'd drawn it in the right place. This is the case for each half, and the places where they meet.

## No thresholds anywhere

The monitor is a cheap model, Haiku 4.5, called once per 30-second window. It gets the window's numbers and the clean baseline profile and returns three fields, `open_incident`, `severity` and `reason`, which are validated before anything is written. That's the whole detector. There is no config value for "confidence dropped by more than X", and the PSI figures it's told about (above 0.2 is notable, above 0.3 severe) are a sentence in the prompt, not a comparison in code.

That was the plan from day one, though it looks like an oversight. A window is only anomalous relative to baseline across four signals at once, latency p95/p99, mean confidence, entropy and PSI, and each fault moves a different subset of them. Latency injection leaves the class distribution untouched. Label skew leaves confidence roughly stable. A threshold ladder would need a cutoff per signal plus rules for combining them, and every new fault type would reopen the rules.

It costs things, and I knew them going in. Detection is non-deterministic, so two identical windows can be triaged differently. It can't be unit tested. Every window costs a model call, whether or not anything is happening. Haiku calls are cheap enough that the last one didn't bother me much. What bothered me more was that Haiku 4.5 was still lagging in performance, and the monitor is only as good as the model reading the window. Haiku 5.5 should do better. The only thing that can tell me whether the monitor is too jumpy or too sleepy is the eval harness, which comes up next time.

## The table outranks the model

Remediation goes the other way completely. `domain/policy.py` maps a diagnosed fault to an action and a risk level. A bad deploy is a rollback at low risk. Drift triggers a retrain at medium. Label skew and latency both get `pipeline_fix` at medium, and an unknown fault gets `pipeline_fix` at high. Two numbers sit on top: below 0.5 confidence a low-risk action is bumped to medium, and nothing auto-executes unless the risk is low and confidence is at least 0.85. Those, and the 0.6 confidence below which a second opinion and an adjudicator get called in, are the only numeric thresholds in the system, and none of them is on a metric.

Read the table and you see that in practice only one thing can ever happen without a human: rolling back a bad deploy that the diagnosis is confident about. Everything else waits for approval.

The remediation agent still runs. It's given the policy table and asked for an action, a risk and a rationale. All three are validated, and then the action and the risk are thrown away. Only the rationale is kept. For the first month it wasn't even kept. It went to a log line in the control plane's stdout and nowhere else, so an operator deciding whether to approve a rollback couldn't see why it had been proposed. A column for it arrived on 26 August.

Part of the reason for this half is auditability. Given the same diagnosis, the system takes the same action, and anyone can read the table and know why. Part of it is that I wanted the thing more controllable, more deterministic, than a model choosing its own fix would be. And part of it is simpler than either: executing model output just felt wrong.

## Where the two halves leak into each other

Writing the guide in September is where I noticed the seams. Because the model's action is discarded and the disagreement isn't recorded anywhere, the rationale on the approval card can argue for a different action from the one printed above it. I'd already hit a small version of that in the stub data, where the sample rationale named a bad deploy while the sample diagnosis beside it said feature drift. The fix there was to reword the sample. The real case is just documented: judge the action by the diagnosis and the table, not by the rationale.

The bigger seam I only saw while writing this. The 0.85 floor that gates auto-execution is on the diagnosis agent's confidence, and that confidence is a number the model reports about itself. So the table doesn't remove the model from the decision to act. It narrows it to one question, "how sure are you", and then trusts the answer. I hadn't weighed that when I built it.

Whether a self-reported 0.85 means anything is exactly the kind of thing only the scorecard could answer, and the scorecard only means something if the agents can't see the answers.
