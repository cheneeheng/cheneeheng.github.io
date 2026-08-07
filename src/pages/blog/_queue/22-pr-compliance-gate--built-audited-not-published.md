---
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/pr-compliance-gate
title: The wheel is built, audited, and parked
description: Packaging the gate for PyPI found four real bugs and produced a release workflow that has never run — committed as publish.yml.disabled, because a package on PyPI is a claim I can't make yet.
banner: /assets/blog/pr-compliance-gate--built-audited-not-published.svg
bannerAlt: A finished wheel and a complete publish workflow sitting behind a disabled file extension, waiting on live GitHub intake
---

[Last time](/blog/pr-compliance-gate--three-ways-to-disable-a-sub-agent) I ended on coverage telling you which lines ran rather than whether any of them were connected to anything real. This one is about a different kind of gap between finished and finished.

The project is packaged. `uv build` produces a wheel, and that wheel is not a shell — the policy corpus, the PR fixtures, and the UI are all bundled into it, so an installed copy can ingest, serve, and run the demo without a repository checkout anywhere near it. There's Apache-2.0 licensing, trove classifiers, project URLs, and a `gate.__version__` read from the installed distribution metadata so the version string exists in exactly one place.

There's also a complete publish workflow. Build, `pip-audit` the locked runtime dependencies, then Trusted Publishing — TestPyPI on `workflow_dispatch`, PyPI on a published release, with a check that the release tag matches the distribution that was actually built.

It has never run. It is committed as `publish.yml.disabled`, because GitHub only registers `.yml` and `.yaml` files, so nothing in it can fire until somebody renames it.

## Why it's parked

Putting a package on PyPI is a claim. It says this is worth installing for real work.

The gate reads pull requests from local fixtures. That's fine for what it is — a portfolio artifact demonstrating orchestration, cost gating, and failure modes, which is what I said it was from the start. But an installable package that reviews pull requests, where the pull requests have to be JSON files you place in a directory, is going to disappoint whoever installs it, and it should. Live GitHub intake is the gate for publishing. That lands first, then the package ships.

What makes this genuinely annoying rather than a comfortable principle is that the remaining work to publish is renaming a file. Everything is ready. The audit is done, the wheel is verified standalone, the workflow is written. Restraint would be much easier if it were also difficult.

## The packaging was worth it anyway

I nearly didn't do the packaging work, on the reasoning that I wasn't going to publish. Doing it anyway found four things that had nothing to do with distribution.

`gate.paths` resolved its asset directories two levels above the package — which is exactly right in a source checkout and meaningless anywhere else. An installed copy simply could not locate `data/` or `static/`. That bug can only surface if you install the thing, and I'd never installed the thing.

`pytest -m llm` was silently selecting zero tests. The system evals are named `eval_*.py`, and pytest's default `python_files` doesn't match that pattern, so all four eval modules were uncollectable. They were documented in the README, in `CLAUDE.md`, and in the operator guide. Anyone following any of those three would have run a command that reported success and did nothing at all, which is the worst possible failure mode for a test command and had been true the entire time.

The UI's navigation links were `<a>` elements without `href`. They looked and clicked like links, and they took no focus and could not be reached by keyboard.

And the install guide told a `pip install` reader to skip ahead to the step that copies `.env.example` — a file no wheel ships, because why would it.

None of those needed publishing. They needed me to leave the checkout, which packaging forced me to do.

## What I actually don't know

The plumbing question I set out to answer is answered. I can build the orchestration: the graph holds, the gates keep spend where it belongs, the human gate resumes across a restart, the sub-agent stays in its budget, and failure lands on a person rather than a stack trace. That was the thing I wanted to find out about myself, and I found it out.

The question I can't answer from here is whether the reviews are any good. Every pull request the system has ever seen is one I wrote, chosen to exercise a path I designed — `002_new_dependency` raises a license block because I put a GPL-3.0 dependency in it. That proves the wiring. It proves nothing about judgement. Whether a Sonnet specialist reading a real diff against a retrieved policy chunk produces a verdict I'd stake an actual merge on is a different question entirely, and fixtures I wrote myself are structurally incapable of answering it.

The system evals exist and are deliberately outside the coverage gate, because that number was never going to mean anything here. They're the part I'd want to grow, and they only get interesting once there are pull requests in front of them that I didn't write — which puts live intake on both sides of the same door.
