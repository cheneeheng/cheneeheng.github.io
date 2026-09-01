---
date: 2026-09-01
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/mcp-cassette
title: A buffered read, a greedy argparse, and one line I'm not proud of
description: Three things about stdio nearly stopped the recording proxy from working at all — and shutting it down cleanly on Windows ended in os._exit(130) after I gave up on the correct design.
banner: /assets/blog/mcp-cassette--the-transport-fought-back.svg
bannerAlt: A proxy stalled mid-stream on a buffered read, then shutting down by terminating its child and exiting with code 130
---

[Last time](/blog/mcp-cassette--paying-the-agent) I described the first working version as though it had arrived intact. It didn't. Two things about stdio nearly stopped the recording proxy from working at all, and a third — shutting the thing down cleanly on Windows — cost me most of an afternoon and ended in a line of code I'm still a little embarrassed by.

The symptom, at first, was that the integration tests either hung forever or dropped the last response. Both of those turned out to be the same misunderstanding wearing two hats.

## The stream that waits for bytes that never come

I was reading stdin through anyio's `FileReadStream(sys.stdin.buffer)`, which looks exactly like the right tool. It isn't, for this. It wraps a *buffered* reader, and a buffered reader's `read(n)` blocks until it has n bytes or hits EOF. A proxy sitting in the middle of an interactive JSON-RPC session receives one short line and then nothing else until it responds — so the read never returns, and the response that would have unblocked it is the thing waiting on that read. `FileWriteStream(sys.stdout.buffer)` had the mirror-image problem going the other way: it buffered responses, which is where the dropped last response came from.

The fix is small and reads like nothing: open the raw file descriptors unbuffered, `os.fdopen(..., buffering=0)`, in `_stdio.py`. Both bugs were core to the streaming transport working at all, and neither had anything to do with MCP. They were me not thinking hard enough about what "stream" meant in the library I'd picked.

## argparse eating my flags

The other one was flatter. `serve` takes a cassette path and then, for the recording case, a whole command line after `--`. I'd used argparse's `REMAINDER` positional for that, and `REMAINDER` is greedy in a way that swallowed any flag placed after the cassette positional. So `serve demo.json --faults demo.faults.json` didn't do what it said.

I replaced it with a manual split of `argv` on the first standalone `--`. Not clever, and it does exactly what a reader of the command line expects.

## Giving up on the correct shutdown

The recording proxy has to survive Ctrl+C, because a recording that dies without writing its cassette wasted a real session against a real server. On POSIX that's clean: an anyio signal receiver, cancel the task group, unwind, finalize. On Windows `anyio.open_signal_receiver` doesn't exist, and my code had been falling back to `sleep_forever()`, which is a polite way of saying there was no shutdown path at all.

The design I wanted was symmetry: poll a `signal.signal` flag, then cancel the task group exactly as POSIX does. I built it and it hung. It kept hanging. Windows can't EINTR-interrupt the worker thread that's blocked inside our own stdin read, so the task group waits forever for a task that will never come back, and the unwind never completes. I spent hours trying to make the correct-looking version work before accepting that the platform wasn't going to let me have it.

What's there now, on the Windows interrupt path only, does not cancel the group. It terminates the child process under a shield, calls `_finalize()` to write the cassette, and then calls `os._exit(130)`.

My own decision log describes that as "blunt but correct," which is about where I landed. It is blunt: `os._exit` skips every cleanup Python would otherwise do. It's also correct for this specific path, because the artifact I care about is already on disk by the time it runs, and the un-joinable stdin thread simply dies with the process. There's a comment in the source saying so, mostly to stop future-me from tidying it up.

Testing it has its own wrinkle. Ctrl+Break only gets delivered by a real Windows console, so under `uv run` or a pty launcher the test skips rather than hangs; with a console present it asserts the 130 exit and that the cassette got finalized. I verified that by hand from PowerShell, which felt appropriately old-fashioned.

POSIX, meanwhile, kept its clean cancel-based unwind. It looked right, it was symmetric with the design I'd wanted everywhere, and I had never actually run it. Not once, anywhere.
