---
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/pr-compliance-gate
title: Three unrelated bugs, one symptom, and a fully covered test suite
description: The investigator was broken by an event loop, a missing environment variable, and a structured-output method that quietly stopped guaranteeing anything — none of which a 100%-covered suite could see.
banner: /assets/blog/pr-compliance-gate--three-ways-to-disable-a-sub-agent.svg
bannerAlt: Three separate faults — an event loop, a missing API key, and a lost structured-output guarantee — all producing the same silently broken sub-agent
---

[Last time](/blog/pr-compliance-gate--the-sandbox-root) I said the release went out and then I ran the whole pipeline against the real API for the first time, following my own documentation, and found the investigator had not been working at all. That's this post. There were three causes, they had nothing to do with each other, and any one of them alone would have been an afternoon.

## An error message with nothing after the colon

Every investigation failed with `Failed to start Claude Code:` and then no text. Not a truncated message — an empty one.

The Agent SDK drives the Claude Code CLI as a subprocess. On Windows, `uvicorn --reload` makes uvicorn select a `SelectorEventLoop`, and a `SelectorEventLoop` cannot spawn a subprocess. What it does instead is raise a `NotImplementedError` with no arguments, which propagates up and gets formatted into a message that stops at the colon because there was nothing to put after it.

The `--reload` was in my own documented start command. I'd put it there because it's what you put there, and every investigation in every demo run had been dying on it.

It's gone from every documented command now, and the investigator preflights the loop before it tries, so if this ever happens again the message names the cause instead of trailing off.

## The one component nobody gave the key to

With the loop fixed, investigations started and then failed unauthenticated — which was confusing, because every other model call in the system was working fine.

The CLI that the SDK spawns inherits `os.environ`. That's the mechanism. Meanwhile `pydantic-settings` reads `ANTHROPIC_API_KEY` out of `.env` and puts it on a settings object, which is exactly what you want and is why the classifier, the risk scorer, and both specialists were all perfectly happy. It never touches `os.environ`. So the sub-agent — alone in the entire system, precisely because it's the only component that isn't a library call — received no credentials at all.

The key is passed explicitly through `ClaudeAgentOptions.env` now. What I keep turning over is that the bug lived in the gap between two correct mechanisms, again, the same way the sandbox root did.

## A guarantee that quietly stopped applying

The third one arrived from a different direction. I'd added per-tier reasoning effort — `GATE_MODEL_SPECIALIST_EFFORT` and friends — and moved the specialists to Sonnet 5. Immediately the specialists started dying on `ValidationError`.

Setting an effort turns on adaptive thinking. The API rejects a forced tool call while thinking is on. And LangChain's `with_structured_output` defaults to the `function_calling` method, which gets its guarantee precisely from forcing a tool call. So the forcing quietly stopped applying, the model became free to answer in prose, and the parser did what parsers do when handed prose.

Nothing errored at the point where the guarantee was lost. The failure surfaced two steps later, in a validation error about a field that was missing because the whole response was the wrong kind of thing.

Effort-carrying tiers use Claude's dedicated `json_schema` structured output now; tiers without an effort keep `function_calling`. Effort is also withheld from any model id containing `haiku`, which has no effort control and rejects the parameter outright, and the effort tiers stopped pinning `temperature=0` because adaptive thinking comes with its own.

## The pile is the story

Individually these are all tractable. Read the traceback, form a hypothesis, check it. Two of them I'd have called a decent afternoon.

What made it genuinely bad was that three unrelated things all produced the same symptom — the investigator doesn't work — so every fix looked like it had failed. I'd solve the event loop and investigations would still fail, which is indistinguishable from not having solved the event loop. There's a specific unpleasantness to debugging when your feedback signal can't tell you whether you were right, and it lasted through two more layers than I expected it to.

There were two smaller ones in the same window, for completeness. LangGraph was emitting `Deserializing unregistered type` warnings on every checkpoint read, which today is only a warning and is documented to become a refusal — at which point I'd be getting bare dicts where the code expects models. And the first review after any server start showed `Review not found.` in the UI, because the review gets registered before its background run writes a checkpoint, the page polls immediately, and a 404 stopped the polling and stranded it.

The thing I can't get past is that the test suite was green through all of it. It's at 100% statement and branch coverage of `src/gate`, enforced, and it makes no API calls by design. Every one of these bugs lived exactly in the boundary that the suite stubs out — which is not a flaw in the suite so much as a reminder that coverage tells you which lines ran, not whether any of them were connected to something real.
