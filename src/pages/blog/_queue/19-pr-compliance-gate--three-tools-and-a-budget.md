---
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/pr-compliance-gate
title: Three read-only tools and a budget the model doesn't get to spend
description: The investigator is the only part of the gate that goes off and reads a repository by itself, so most of its design is a list of things it cannot do — including fail.
banner: /assets/blog/pr-compliance-gate--three-tools-and-a-budget.svg
bannerAlt: A sub-agent with three read-only tools inside a sandbox, its turn, tool-call, and byte budgets counted outside it by the harness
---

[Last time](/blog/pr-compliance-gate--routing-is-code) I said the expensive part of the pipeline was the sub-agent that goes off and reads the repository on its own, and that most of my design effort went into deciding what it was not allowed to do. This is that list.

The investigator runs when a specialist looks at a diff and says, in effect, I can't tell from this. In the demo arc that's `003_auth_change`: a session-validation refactor where the security specialist cites `SEC-03` and sets `needs_more_context`, because whether the change is safe depends on code the diff doesn't show. So an Agent SDK sub-agent goes and reads `src/acme/auth.py` and the logging config, and comes back with a report.

That is the only autonomous, open-ended, model-driven exploration in the entire system, and it made me nervous enough to write four constraints around it before writing the thing itself.

## Three tools, all read-only

It gets `read_file`, `grep_repo`, and `list_dir`, over the pull request's repository snapshot. That's the whole toolbox.

Three is not a minimalism flourish; it's what falls out of the question the investigator exists to answer. To decide whether a change is safe in context, you need to find the surrounding code, look at it, and know what else is nearby. Nothing about that requires writing, executing, or reaching the network. Every tool that could change the repository or leave it was simply never built, which is a much stronger guarantee than building one and telling the model not to use it.

The sandbox does the rest: every path the tools resolve has to land inside the pull request's own snapshot.

## Budgets counted from outside

There are hard limits on turns, tool calls, and bytes read — `GATE_INVESTIGATOR_MAX_TURNS`, `_MAX_TOOL_CALLS`, `_MAX_FILE_CHARS`. The detail that matters is that the harness counts them, not the model. The investigator is not asked to stay within a budget and trusted to have done so; the loop that drives it stops when the count is hit, whatever the model was in the middle of saying.

The same distrust shows up one level out. `GATE_MAX_CYCLES` caps how many investigations a single review can run in total, and machine-triggered investigations and human `request_info` requests draw on the same budget. A reviewer clicking "request more info" three times doesn't get three free rounds; they're spending from the same pot as the pipeline. One budget, both consumers, so there's no arrangement of clicks that turns a review into an open tab.

Tool-call count and a cost estimate show up in the UI while it runs, which sounds like a nice-to-have and mostly functions as a conscience.

## It is not allowed to fail loudly

The constraint I'm most attached to is that the investigator never raises into the graph.

If it exhausts its budget, hits an error, or simply can't reach a conclusion, it returns an inconclusive report. The graph carries on with that report in hand, reconcile reads it, and the review ends up in front of a human. What it does not do is throw an exception that unwinds a review someone was waiting on and leaves a stack trace where a verdict should be.

That's the same rule as the specialist timeout from the first post, and by this point in the build it had become the thing I checked for everywhere: when a component can't finish its job, the outcome is a person being asked, not the system falling over. A compliance gate that crashes has not failed safe. It has just failed, and someone will merge the pull request anyway.

## The gate before the gate

None of this runs unless reconcile's rule fired. That's cost gate two, and it's the reason a repository-reading sub-agent doesn't turn every review into an expensive one — a README typo never gets within two nodes of it.

What I had not thought carefully enough about was the sandbox root. The tools guard every path they resolve *within* a root, which is exactly the right guarantee, and I'd stopped thinking about it there. Where the root itself comes from turned out to be a question I only asked much later, while looking for something else entirely.
