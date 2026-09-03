---
date: 2026-09-03
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/mcp-cassette
title: Four red jobs on my first CI run, and Windows was the one that passed
description: The clean POSIX shutdown path had never run anywhere. CI ran it on four machines at once and found two bugs the blunt Windows path had already solved.
banner: /assets/blog/mcp-cassette--four-red-jobs.svg
bannerAlt: A CI matrix with four failing POSIX jobs and one passing Windows job, and a proxy blocked waiting on a child process that is still alive
---

[Last time](/blog/mcp-cassette--the-transport-fought-back) I ended on the POSIX shutdown path — the clean, symmetric, cancel-the-task-group one I was rather fond of, and had never actually run. The first time it ran was in CI, on machines I didn't own, attached to a pull request, in front of nobody but still somehow in public.

`test_sigterm_finalizes_cassette` failed on all four POSIX jobs. Ubuntu and macOS, Python 3.12 and 3.13. Windows — the platform I'd written off as the awkward one, the platform with the `os._exit(130)` I'd apologised for in a source comment — was the only job that went green.

## Two bugs wearing one failure

The first is about who gets the signal. The test sends a targeted SIGTERM to the proxy process. The proxy is not the whole story: it spawns the real MCP server as a separate child, and that child gets nothing. So the proxy dutifully cancels its pumps, tidies up, and then blocks forever inside `process.wait()` on a child that has no idea anything happened and is perfectly happy to keep running.

The second is about how I knew a signal had arrived at all. I'd keyed the exit-130 behaviour off a cancelled exception propagating out — a flag set when the cancellation reached me. But a task group absorbs cancellation of its own scope. The exception never propagated past the group, so the flag was never set, and the code that would have written the right exit code never ran.

Both fixes were already sitting in the file. Terminate the child on the interrupt path — which is exactly what the Windows watcher had been doing all along — and key the exit off the `_signal_received` flag instead of the exception. The version I'd called blunt had the correct idea in it. The version I'd called clean was the broken one, and it looked so reasonable that I'd never questioned it.

## The red was the point

I want to be honest about the reaction, because there's a version of this story where the writer is mortified. I wasn't. I was pleased.

That CI matrix was new. It existed because I'd claimed cross-platform support and wanted something other than my own assertion behind the claim. The very first time it ran, four machines I don't have access to found a bug in a code path I could not have exercised locally no matter how carefully I'd read it. That's not CI embarrassing me. That's CI doing, on day one, the exact job I added it for — and getting the demonstration that early made every later argument with myself about whether a matrix was worth the minutes very short.

It did block the first release, which is the only part that stung. But a release that shipped a shutdown path which hangs on every non-Windows machine would have stung considerably more, and for longer.

## The number that isn't 100

There's a related compromise from around the same time that I still think about. The coverage gate is `fail_under = 99`, not 100.

The reason is structural: `proxy.py` has a handful of lines behind the anyio signal receiver that only exist on POSIX and are unreachable when the suite runs on Windows. A 100 gate would be permanently red on one OS in the matrix, and the fix for that is either deleting platform-specific code or gaming the measurement. So it's 99, which holds everywhere, and which I know masks a small future regression on whichever platform already misses those lines. I wrote that trade-off down at the time rather than letting it quietly become a number nobody remembers choosing.

With the platform surface covered on five machines, the thing I'd been avoiding came back into view. Everything so far was stdio — a local process, a pipe, one direction of trust. MCP also runs over the network, and network servers can talk back first.
