---
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/mcp-cassette
title: Streamable HTTP by hand, and a sampling request that never arrived
description: Adding remote transport meant framing SSE myself to keep the dependency list short — and then a recording fixture hung because the server was talking on a stream nobody was listening to.
banner: /assets/blog/mcp-cassette--the-sampling-request-that-never-arrived.svg
bannerAlt: A recording proxy in front of a remote MCP server, with a server-initiated sampling request going to a stream that has no listener
---

[Last time](/blog/mcp-cassette--four-red-jobs) I said MCP also runs over the network and that network servers can talk back first. Both halves of that turned out to be work.

The remote side is meant to be boring from the outside, and mostly is. `server_url` is the drop-in twin of `server_command`: hand it the real endpoint, and on the first run a local recording proxy stands up in front of that URL; on every run after, a local mock Streamable HTTP server replays the cassette. Same record modes, same fault matrix, same failure semantics. The only asymmetry worth knowing is that `Authorization` — and every other header — is forwarded upstream and never written to the cassette, because the whole point is that you commit these files.

## Framing SSE myself to keep the list short

I hand-rolled the HTTP side on `h11` plus my own SSE framing rather than reaching for something higher-level, and the reason was the dependency list.

The core install depends on `anyio` and `pydantic`. Two packages. That's a number I liked, and I wanted `mcp-cassette[http]` to stay close to it rather than dragging in a web framework and its transitive tail so that a test-support library could speak one protocol. `httpx` for the client side and `h11` for the server side is what that constraint bought: `h11` is a sans-IO HTTP parser and nothing else, so it does the parsing I genuinely can't do myself and none of the things I don't want.

SSE framing, once you've decided to do it, is not the hard part. Events are separated by blank lines and the payload lines carry a `data:` prefix. Writing that out was an afternoon; auditing a framework's opinions about response lifecycles would have been longer, and I'd still have had a bigger install.

## The stream nobody was listening to

The interesting failure came from the other direction. MCP servers can initiate requests — sampling, elicitation — and a cassette that couldn't record those would be a cassette with a hole in it.

My reference HTTP server has a `summarize` tool that asks the client to run a completion. Recording that hung. Not failed, hung, which is always the worse outcome because there's nothing to read.

What was happening is a routing rule in the SDK that I hadn't internalised: a `create_message` sent without a `related_request_id` goes out on the standalone GET stream. My client didn't hold a GET stream open. So the server was dutifully emitting a request onto a channel with no listener, and both sides sat there waiting for the other.

The fix in the reference server was one argument — `related_request_id=ctx.request_id` — which puts the sampling request on the POST stream that triggered it, the spec's related-stream mode. That's also the shape real agent traffic takes, so it's the right thing to be recording. The GET-channel case still gets coverage, but from a hand-built cassette rather than a live session, because standing up a client that holds a GET stream purely to exercise a routing branch was more machinery than the branch was worth.

## Recordings that lied about order

There was a quieter problem underneath. Cassettes anchor a server-initiated request to the client exchange it followed in `seq` — that's how a replayed sampling request knows where in the conversation it belongs. My scripted test client wrote all its requests up front, so every client request landed in `seq` before any of the server's work, and every anchor pointed at the last request instead of the right one. The gating tests were failing against an implementation that was doing exactly what it was supposed to.

I added an opt-in `sequential=True` mode to the session helper — test infrastructure only, nothing in the library changed — so the recording resembles the request-then-wait rhythm a real agent produces. The anchor semantics stayed as designed. And I wrote the caveat into the helper's docstring, because a batched recording of a sampling server will still anchor pathologically, and I'd rather that be documented than rediscovered.

## Losing a remote recording hurts more

One more thing landed with the HTTP work, and it exists because remote recordings are expensive in a way local ones aren't. A recording now checkpoints to a `<cassette>.partial` sidecar every five seconds, so a hard kill costs you whatever arrived since the last checkpoint and no more. The sidecar is itself a valid cassette. It is deliberately never written to the cassette path, because a half-finished recording quietly occupying the place where the good one goes is worse than losing it outright.

Which left the other half of the v2 plan — the half that had been written down since the start and that I'd been steering around, because it isn't about testing at all.
