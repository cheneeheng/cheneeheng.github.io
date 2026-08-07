---
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/pr-compliance-gate
title: Every investigation ended at a human, and a reducer was why
description: Routing in the gate is a pure-Python rule ladder, not an LLM call — but the list reducer underneath it meant an investigation could never actually resolve anything.
banner: /assets/blog/pr-compliance-gate--routing-is-code.svg
bannerAlt: A rule ladder routing a review to investigate, human, or verdict, with accumulated stale findings blocking the clean path
---

[Last time](/blog/pr-compliance-gate--proving-it-to-myself) I said the machinery worked and left the harder question — whether the reviews are any good — alone. This post is about the one piece of that machinery I was never tempted to hand to a model, and about the bug that hid behind it for a while anyway.

The node is called `reconcile`. It sits after the two specialists come back and decides where the review goes next: deeper into an investigation, out to a human, or straight to a verdict. It is a rule ladder in plain Python. No model call, no prompt, no sampling.

## Why the router is code

Two reasons, and the cheap one came first. Routing happens on every review that clears the risk gate, so an LLM call there is a cost you pay unconditionally — exactly the traffic the gates exist to avoid. Putting a model in the router would have quietly undone the thing the whole design is about.

The second reason is the one I'd defend harder. The router is where a blocking finding turns into an outcome, and I want that transition to be readable, testable, and identical every time. A specialist saying "this adds a GPL-3.0 runtime dependency and it violates LIC-02" is a judgement I'm happy to have a model make. What happens to a review carrying that finding is not a judgement — it's policy, and policy belongs in a function I can read top to bottom. Blocking finding, specialist timeout, exhausted budget, or the two specialists disagreeing all route to the human gate. `needs_more_context` with loop budget remaining routes to the investigator. Clean goes to a verdict. That ladder is the same on every run, which means when a review ends up somewhere surprising, the surprise is in the finding, not in the routing.

## The reducer the plan asked for

Where it went wrong was a layer below, in how the state merges.

The two specialists run in parallel, in the same LangGraph superstep, and both write to `specialist_findings`. LangGraph wants a reducer for that, and my own plan specified the obvious one: `Annotated[list, operator.add]`. Append both, done. That's correct for a single pass, and a single pass is what I had in my head when I wrote the plan.

Except the specialists don't run once. After an investigation comes back, they run *again*, with the investigator's report in hand. And with `operator.add`, round one's findings — including the `needs_more_context=True` that triggered the investigation in the first place — are still sitting in the list next to round two's.

So the ladder reads the stale flag, sees a specialist still asking for more context, and routes to another investigation. Which comes back, and the flag is still there, because nothing ever removed it. That repeats until the loop budget drains, at which point a different rule fires and escalates to a human. The rule that says "the investigation resolved the question, go to a clean verdict" was unreachable. Not rare — unreachable. Every single investigation could only ever end in exhaustion.

The fix is a `merge_findings(existing, new)` that replaces all findings from a specialty when that specialty emits a fresh batch. It's still order-independent across the two parallel specialists, which was the whole reason the plan wanted a reducer, and a new round now cleanly supersedes the one before it. Deviating from my own plan felt worse than it should have, given the plan was wrong.

## The one that would have crashed

There's a second reducer in there, `coalesce_escalation`, and it exists for a smaller but more embarrassing reason. Both specialists are wrapped in a timeout. If both time out in the same superstep, both write `escalation` — and a channel without a reducer raises `InvalidUpdateError` on concurrent writes. A double timeout, which is precisely the moment you most want the system to behave, would have crashed the graph.

First-wins is right there, because reconcile only writes an escalation when there isn't one already. But I didn't reason my way to that reducer from the design; I found it by asking what happens when both branches fail at once, which is a question I now try to ask about every parallel node.

Both of those live in the cheap, boring, deterministic part of the system. The expensive part — the sub-agent that goes off and reads the repository on its own — is where I expected the real trouble, and I spent most of my design effort deciding what it was not allowed to do.
