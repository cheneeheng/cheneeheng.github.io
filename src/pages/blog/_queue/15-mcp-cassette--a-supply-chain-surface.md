---
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/mcp-cassette
title: I built a test fixture and it turned out to be a supply-chain artifact
description: A cassette is a verbatim transcript of what a third-party server said, committed to your repository and fed to a model — so lint reads it for injection smells, and its rule packs are TOML on purpose.
banner: /assets/blog/mcp-cassette--a-supply-chain-surface.svg
bannerAlt: A committed cassette scanned for injection smells in tool descriptions and results, with rule packs expressed as declarative TOML rather than code
---

[Last time](/blog/mcp-cassette--the-sampling-request-that-never-arrived) I left the other half of the v2 plan sitting there — the half that isn't about testing. It had been written down since before any of this existed, and it took until v2 to build because it kept feeling like a different project.

It isn't a different project. It's a consequence of a decision I'd made for entirely mundane reasons: a cassette is a plain, readable, diffable file that you commit next to your tests.

Which means a cassette is a verbatim transcript of everything a third-party server said to you, living in your repository, replayed into a model on every test run. Tool descriptions and tool results are not fixture data. They're someone else's text, and their whole job is to be read by something that will act on it.

## Reviewing a description like code

The line I ended up putting in the README is that a changed tool description is a supply-chain event, not a fixture edit. That's the frame the whole thing rests on. When a cassette diff shows a tool's description has changed, the correct reaction is not "re-record and move on."

`lint` reads a cassette file — not a live session, so it belongs in CI next to the test run rather than inside it — and looks for the smells. `R001` is instruction injection in a tool description, and it's an error. `R002` is description or schema drift against a baseline cassette: the rug pull, where a server behaves for as long as it takes to earn trust and then changes what its tools claim to do. Also an error. `R003` flags duplicate tool names and `R004` flags tool *results* that are shaped like instructions, both as warnings. Exit code 0 if nothing error-severity fired, 4 if something did, and every finding carries a JSON pointer straight to the offending spot in the file.

## Why the rule packs are TOML

You can bring your own patterns. What you cannot do is bring your own code, and that's deliberate to the point of being the design decision I'd defend hardest in this whole repository.

A pattern pack is a declarative TOML file. There's no Python plugin API, and there isn't going to be one, because `lint` is a supply-chain-security tool. Its entire job is to be the thing you run over content you don't trust. Giving it an extension mechanism that executes arbitrary Python — inevitably fetched from somewhere, inevitably shared between teams — would mean the tool you use to check for hostile content is itself an execution surface. I'd rather have a less expressive rule language.

Packs extend the bundled rules; they never replace them, so nobody accidentally configures away `R001`. And a pack adds *patterns*, not surfaces: patterns match tool descriptions from `tools/list` and result text from `tools/call`, which is everything lint reads. A tool's `name` and `inputSchema` are compared rather than pattern-matched — that's `R002`'s job, and it stays `R002`'s job.

The configuration lives in `pyproject.toml` under `[tool.mcp_cassette.lint]`, so your packs, your rule selection, and your failure threshold become the defaults and the command in your CI file stays a generic `mcp-cassette lint`.

## Redaction is the other half of committing them

The same property that makes cassettes worth linting makes them dangerous to write carelessly. If you commit a verbatim transcript, you commit whatever was in it.

So redaction runs at capture time, on a deep copy, with defaults that are always on. Values under keys matching `*token*`, `*secret*`, `*password*`, `*apikey*`, `*api_key*`, or `authorization` become `REDACTED` before anything reaches disk. You can add your own rules by key-glob or JSON pointer.

I still tell people to read every new cassette before its first commit, because a defaults-on redactor catches the things I thought of.

## What a clean lint actually means

These are heuristic pattern rules and I'm not going to pretend otherwise. A clean lint is the absence of *known* smells and nothing more. It is not a guarantee that a server is honest, and a tool that implied otherwise would be worse than no tool.

I knew that in the abstract when I built it. What I hadn't done was name the specific shape of what lint misses — and once I sat down and constructed an example that sails through every rule while doing something I'd absolutely want to know about, it was clear the gate needed a second step that works on a completely different principle.
