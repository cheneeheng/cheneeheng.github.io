---
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/pr-compliance-gate
title: The sandbox root came out of the request body
description: Every path the investigator resolved was checked against its sandbox. The sandbox itself was located by an unvalidated id from the POST body — so the guard was fine and the ground under it moved.
banner: /assets/blog/pr-compliance-gate--the-sandbox-root.svg
bannerAlt: A path check correctly guarding everything inside a sandbox whose root is chosen by an untrusted request field
---

[Last time](/blog/pr-compliance-gate--three-tools-and-a-budget) I said the investigator's tools guard every path they resolve within their sandbox root, and that I'd stopped thinking about it there. I found the rest of that sentence by accident, in the intake code, while looking for something completely unrelated before packaging a release.

`pr_id` arrives in the body of the request that starts a review. `load_pr` takes it and joins it onto the fixtures directory to find the pull request. It did that without validating it at all.

On its own that's the ordinary version of the bug. Someone posts an id with `..` in it and reads a directory they shouldn't. Bad, bounded, well-understood, and in a single-user local app with no auth, not especially thrilling.

## The part that made me put the coffee down

That same `pr_id` also determines the investigator sub-agent's sandbox root.

So the interesting attack isn't reading a file outside the sandbox. It's moving the sandbox. A `..` segment, or an absolute path, doesn't get past `resolve_in_sandbox` — it changes what `resolve_in_sandbox` is defending. The function keeps doing exactly what it was written to do, faithfully, on every call, around a root that the request body picked. And then an autonomous agent with three read-only tools goes exploring inside it.

I'd built the containment and then handed its coordinates to the least trusted input in the system. Both halves looked fine in isolation. `resolve_in_sandbox` is correct — I'd read it more than once and it is genuinely correct. The intake code is four lines of path joining that don't look like a security surface at all. The bug only exists in the seam, and the seam is exactly where I wasn't looking.

The fix is small, as these usually are: `load_pr` now rejects any id that isn't a plain directory name, raising a `FixtureError` that the API turns into a 422. No traversal, no absolute paths, no ambiguity about what a valid id looks like.

## What actually bothers me about it

The practical exposure here is close to zero, and I want to be straight about that rather than dress this up as a near-miss. The app is single-user, serves its UI same-origin, runs on localhost, and has no auth because it never needed any. The only person who could send that request body is me.

What bothers me is how it was found. Not by an audit, not by a checklist, not by any part of my process. I was in that file for an unrelated reason, followed `pr_id` further than I needed to, and saw where it ended up. If I'd been in a different file that afternoon it would have shipped.

And it would have shipped inside something whose entire stated purpose is demonstrating that I can build this class of system properly. A pipeline that reviews other people's code for security policy compliance, containing a sandbox that relocates on request, is a joke with a fairly obvious punchline. The severity was low; the embarrassment would not have been.

## Guards guard the inside

The thing I took from it, and have been applying since, is narrower than a lesson and more useful. A containment check answers "is this path inside the boundary". It does not answer "where is the boundary". Those are two questions, and I had only been asking one of them, because the second one doesn't look like a question at all — the root is just... there, it's a variable, it was set earlier.

So now when I find a path check I go looking for where its root was decided, and I keep going until I hit either a constant or a validated input. In this case that walk took about ninety seconds and ended somewhere I didn't like.

The release went out after that. Which is when I finally ran the whole pipeline against the real API, end to end, the way the documentation says to — and discovered that the investigator had not been working at all.
