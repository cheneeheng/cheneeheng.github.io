---
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/mcp-cassette
title: Testing an MCP server meant paying the agent every time
description: I wanted to start a project with MCP and found there was no easy way to test the interaction without calling the agent over and over — so I built the vcrpy equivalent for it.
banner: /assets/blog/mcp-cassette--paying-the-agent.svg
bannerAlt: A live agent-to-server session being recorded to a cassette file, then the cassette replayed offline in place of the server
---

I was looking to start a project with MCP, and ran into the thing that stopped me before I really started: there is no easy way to test the MCP interaction with an AI agent without calling the AI agent. Over and over. Every assertion I wanted to make about how my server behaved cost a real model call, waited on a real model call, and carried a real model's freedom to answer slightly differently the second time.

No single one of those was the breaking point. Slow I could have lived with. Expensive I could have rationalised as the cost of doing business. Non-deterministic I could have papered over with looser assertions. It was the three of them compounding that did it — a test suite that was too slow to run often, too costly to run repeatedly, and too flaky to believe when it did fail. That combination doesn't produce a bad test suite; it produces a test suite you quietly stop running.

While I was searching around for how other people had dealt with this, I came across [vcrpy](https://vcrpy.readthedocs.io/), which does the same trick for HTTP: record the real traffic once, replay it forever after. Nobody had built that for MCP. That's where the idea came from.

## Record the session, not the call

The recording unit is the entire session — every message from the moment the server launches to the moment it ends — never an individual tool call. That matters more for MCP than it does for HTTP, because an MCP session is stateful in a way a pile of independent HTTP requests isn't. There's a handshake, there are notifications flowing in both directions, and there are server-initiated requests. Recording a single `tools/call` and pretending it stands alone would give you a fixture that replays into a server that never got initialized.

So a cassette holds the whole conversation, as a structured JSON file you commit next to your tests. It's diffable, which turns out to matter later for reasons that have nothing to do with testing.

## Underneath the SDK, on purpose

mcp-cassette works at the transport level — newline-delimited JSON-RPC over stdio — and treats the messages semi-opaquely. It reads enough of each message to match a request to its recorded response and no more. Nothing gets parsed into a typed model and re-serialized on the way through.

The consequence I actually wanted from that is a dependency I don't have: mcp-cassette does not depend on the official `mcp` SDK at runtime. Which means it works with any MCP client, unmodified. Claude Code included. If it had been built on the SDK's client objects, it would only ever have worked for agents built the same way.

## The fixture hands you a command, not a patch

The pytest fixture doesn't monkeypatch anything in your agent. It hands you a command list to plug into your agent's MCP server configuration, and your agent connects to it thinking it's a server:

```python
def test_agent_summarizes_repo(mcp_cassette):
    cmd = mcp_cassette.server_command(["python", "tools/github_server.py"])
    result = run_my_agent(mcp_servers={"github": cmd})
    assert "summary" in result
```

First run, that command is a recording proxy sitting in front of the real server. Every run after, it's a mock server reading from the cassette — offline, deterministic, and fast.

## Record once, commit, replay forever

Which of those two happens is decided once per run by the mode. `once` is the default: record if there's no cassette, replay if there is. `none` forbids recording outright and fails on a missing cassette. `all` re-records. `new_episodes` replays what it has and lets misses fall through to the real server, appending them.

The mode that matters is `none`, and it belongs in CI. `MCP_CASSETTE_MODE=none` turns a missing or unmerged cassette into a red build instead of a live call against a real server with production credentials. That's the whole contract: record once locally, commit the cassette, and let CI do nothing but replay.

The first working version of all this ran on my Windows machine and made me quite pleased with myself. It had also only ever run on my Windows machine, which is a detail I'd like to say I was thinking about at the time.
