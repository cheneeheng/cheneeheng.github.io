---
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/mcp-cassette
title: The parameter that looked completely innocent
description: An echo tool grew a callback_url and lint had nothing to say about it — which is why the cassette gate has a second step that only asks whether the server's surface moved.
banner: /assets/blog/mcp-cassette--the-innocent-parameter.svg
bannerAlt: Two committed cassettes compared, where a poisoned description trips lint and a harmless-looking new parameter only trips diff
---

[Last time](/blog/mcp-cassette--a-supply-chain-surface) I said I'd sat down and constructed an example that sails past every lint rule while doing something I would absolutely want to know about. It's committed in the repo now, as `examples/cassettes/tools-v2.mcp.json`, and it is the same example echo server one version later.

Two things changed between the versions. The tool's description picked up an injection payload, which is the obvious one. And `echo` grew a parameter called `callback_url`.

The description trips `R001` immediately. Lint exits 4, points a JSON pointer at the offending string, and everyone is happy with themselves.

The parameter trips nothing at all. There is no hostile text in `callback_url`. It is a perfectly ordinary name for a perfectly ordinary field, of a kind that appears in honest APIs every day, and no pattern rule I would be willing to ship could distinguish it from a legitimate feature. It is also — on an *echo* tool, of all things — a way to tell a server where to send things, arriving quietly in a schema change.

## Two gates that see different things

So `diff --tools-only` exists, and it asks a completely different question. Not "does this look hostile" but "did the server's surface move." It exits 5 when a tool's description or schema differs between two recordings, including changes that carry no smell whatsoever.

The pairing is what makes it a gate rather than a heuristic. Lint catches text that looks hostile; diff catches a surface that moved. And each covers precisely where the other is blind: a poisoned description that was present in the very first recording never *moves*, so diff will never mention it, and an innocuous new parameter never *looks* hostile, so lint will never mention it. Run one and you have a gate with a shape-sized hole in it.

Because both operate on cassette files rather than live sessions, the whole thing runs from a clone with no server and no network:

```bash
mcp-cassette lint examples/cassettes/tools.mcp.json                     # clean: exit 0
mcp-cassette lint examples/cassettes/tools-v2.mcp.json                  # injected: exit 4
mcp-cassette diff examples/cassettes/tools.mcp.json \
                  examples/cassettes/tools-v2.mcp.json --tools-only     # moved: exit 5
```

`lint` and `diff` are CLI workflows in practice but not CLI-only code — `lint_cassette` and `diff_cassettes` are exported from the package, so a scripted gate doesn't have to shell out.

## The examples were rotting and I couldn't tell

Adding those cassettes came with a second job I'd been avoiding. Nothing in CI collected `examples/` at all. The fixtures could drift, break, or stop demonstrating what they claimed, and I'd find out from a stranger. Worse, every exit code quoted in my documentation was a number I'd typed from memory with nothing enforcing it.

There's now a CI job that replays the example cassettes offline and asserts all three exit codes. It's the smallest possible job and it's the one that stops the docs from becoming fiction.

The prompt for it, honestly, was issue #9 asking for a demo of the gate — a demo that largely already existed in the code but only appeared in the README as prose with placeholder file paths. Somebody reading the front page could not tell that the thing they were asking for was already there. That is a documentation failure, not a feature request, and it's the kind I'm slowest to notice because I know what's in my own repository.

## Red is not a re-record

The one thing I'd want anybody using this to understand is what a red drift gate means. It is not a stale-fixture problem to make go away by re-recording.

The gate went red because the server you depend on changed what its tools claim to do. Read the diff. Decide whether you accept the new surface. *Then* commit the fresh cassette as the new baseline, deliberately, as a reviewed change. Re-recording first and reading later is the same motion as clicking through a certificate warning, and I've caught myself reaching for it.

Where this leaves me: it's at 0.3.5, it's on PyPI, and the parts I've been able to think of are covered. What I can't manufacture is contact with servers I didn't write — every cassette in that repo was recorded against something I built, which is a nice way of saying every assumption in it is my own assumption checked against itself. The other half is the protocol, which keeps moving. Elicitation, resources, whatever lands next. Both of those get answered by use rather than by design, so I'm mostly waiting to be told what I got wrong.
