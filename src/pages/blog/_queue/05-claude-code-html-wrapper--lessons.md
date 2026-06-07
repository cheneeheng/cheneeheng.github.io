---
layout: ../../layouts/BlogPost.astro
title: Three design calls that kept my Claude Code wrapper small
description: Letting Claude's own transcripts be the database, shelling out to the docker CLI instead of an SDK, and running --dangerously-skip-permissions on purpose.
banner: /assets/blog/wrapping-claude-code-lessons.svg
bannerAlt: Three design decisions — Claude's own JSONL transcripts as the source of truth, the docker CLI instead of an SDK, and the container as the security boundary
---

I built a browser front end for Claude Code, and the thing I'm most pleased with isn't a feature — it's how little code it took. The whole server is about seven files. That smallness came from three decisions where the obvious, "proper" approach would have added a database, a dependency, or a prompt, and where not doing the proper thing turned out to be correct.

It helped that the project — [`claude-code-html-wrapper`](https://github.com/cheneeheng/claude-code-html-wrapper) — was itself built by Claude Code, from a design doc and a series of numbered iteration specs I wrote up front. When the plan is written down before any code, "do we actually need this layer?" is a question you answer on paper, cheaply, instead of discovering after you've built it. All three decisions below were made in the spec, not refactored in later.

**1. Don't build a session store — Claude already has one**

The app needs to list your past sessions so you can resume them. The reflex is a database: every time a session starts, write a row; render the list from the table.

I didn't write that table. Claude Code already persists every session as a JSONL transcript on disk — one file per session, named with the session's UUID, under `~/.claude/projects/-workspace/`. That *is* the session list. So `listSessions()` just runs `find` inside the container and reads the filenames back:

```js
// one JSONL per session; the filename is the session ID
docker exec <name> find /home/claude/.claude/projects/-workspace -name '*.jsonl'
```

Resuming is then `claude --resume <id>`, where the id is a filename. No table, no write path, nothing to keep in sync.

The lesson underneath it: **before you add a store, check whether the tool you're wrapping is already the store.** A parallel registry would have given me two sources of truth that drift the first time a session is created or deleted outside my code. Deriving the list from Claude's own files means there's exactly one source of truth, and it isn't mine. The one quirk I had to respect: that `-workspace` directory name is Claude's encoding of the working directory (`/workspace` → `-workspace`), which is why the terminal always execs with its cwd pinned to `/workspace`. Break that and the transcripts land somewhere the listing can't find them.

**2. Shell out to the docker CLI instead of an SDK**

Node has `dockerode`, a perfectly good Docker SDK. I didn't use it. Every Docker interaction in the wrapper goes through `child_process` running the `docker` CLI directly:

```js
exec(`docker run -d --name claude-user-${id} -v ${vol}:/workspace ... claude-sandbox`)
```

This looks less sophisticated, and that's the point. The surface I actually use is tiny — `run`, `exec`, `stop`, a `find` here and there. Pulling in an SDK to cover that is a dependency to install, audit, version-pin, and keep current, in exchange for wrapping commands I already know how to type. The CLI is also the thing every operator already has installed and can run by hand to debug. When a container misbehaves, the fix is a `docker` command they can paste into a shell — not an SDK call buried in my code.

The lesson: **a dependency earns its place by covering surface you'd otherwise get wrong.** For broad, fiddly surfaces, an SDK is worth it. For four commands you understand completely, the CLI plus `child_process` is less code and one fewer thing that can break in a way you can't reproduce from a terminal.

**3. Run `--dangerously-skip-permissions` — on purpose**

Every container runs Claude like this:

```
docker exec -it -w /workspace <name> claude --dangerously-skip-permissions
```

That flag name is designed to make you nervous, and normally it should. Here it's deliberate, for two reasons.

First, **the container is the security boundary, not the permission prompt.** Claude is running inside a throwaway sandbox with nothing in it but the user's own workspace. The per-action approval prompt exists to protect your real machine from a tool that can touch your real files. Inside a container that *only* holds files the user already controls, that prompt guards nothing — it just adds friction to every command.

Second, a practical wrinkle: the wrapper doesn't shut Claude down gracefully when the WebSocket closes (a browser tab just disappears). Without the flag, Claude's trust-folder prompt reappears at the start of every single session, because it never got to record that you trusted the folder last time. Skipping permissions makes the sandbox behave like the disposable environment it actually is.

The lesson is the general one: **a safety default is calibrated for an assumed environment.** Claude's default assumes it's running on your laptop against your real files. Change the environment — wrap it in a sandbox whose entire contents are already the user's — and the same default is now pure friction. The honest move isn't to leave a safety flag on out of habit; it's to understand what it protects against and decide whether that threat exists in your setup. Here it doesn't. Elsewhere it absolutely might, which is exactly why I wrote down the reasoning instead of just flipping the flag.

**The thread**

All three calls are the same instinct: don't add a layer the situation doesn't need. No database, because the tool I wrapped is the database. No SDK, because the CLI covers my whole surface. No permission prompt, because the container already is the boundary. Each "missing" piece is a thing that can't break, can't drift, and can't confuse the next person reading the code. Small wasn't an accident — it was the design.

Next in this series: the generalizable version — how to put *any* CLI in the browser with xterm.js, node-pty, and Docker.
