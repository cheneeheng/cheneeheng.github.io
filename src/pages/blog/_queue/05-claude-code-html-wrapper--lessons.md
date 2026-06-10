---
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/claude-code-html-wrapper
title: Three layers I refused to build
description: My Claude Code wrapper has no database, no Docker SDK, and no permission prompts — each absence was a decision made in the spec, and each one is why the server fits in seven files.
banner: /assets/blog/wrapping-claude-code-lessons.svg
bannerAlt: Three design decisions — Claude's own JSONL transcripts as the source of truth, the docker CLI instead of an SDK, and the container as the security boundary
---

The thing I'm most pleased with about [the browser wrapper](/blog/claude-code-html-wrapper--in-the-browser) isn't a feature — it's how little of it there is. The whole server is about seven files. Looking back at how that happened, it comes down to three moments where the obvious, "proper" approach would have added a database, a dependency, or a prompt, and where I talked myself out of the proper thing. All three calls were made in the iteration specs, before any code existed — which mattered, because "do we actually need this layer?" is a question that costs nothing to answer on paper and a refactor to answer afterwards.

The first refusal was the database. The app needs to list your past sessions so you can resume them, and my reflex was the standard one: a session starts, you write a row; the list renders from the table. I was partway into speccing that when it occurred to me to check what Claude Code already keeps. The answer: everything. It persists every session as a JSONL transcript on disk, one file per session, named with the session's UUID, under `~/.claude/projects/-workspace/`. That *is* the session list, sitting there already. So `listSessions()` became a `find` inside the container:

```js
// one JSONL per session; the filename is the session ID
docker exec <name> find /home/claude/.claude/projects/-workspace -name '*.jsonl'
```

Resuming is `claude --resume <id>`, where the id is a filename. No table, no write path, nothing to keep in sync. The version of this app with a database has two sources of truth that drift the first time a session is created or deleted outside my code; this version has one source of truth, and it isn't mine. The only tax was a quirk I had to respect: that `-workspace` directory name is Claude's own encoding of the working directory (`/workspace` becomes `-workspace`), which is why the terminal always execs with its cwd pinned to `/workspace`. Break that and the transcripts land somewhere the listing can't see.

The second refusal was the Docker SDK. Node has `dockerode`, it's perfectly good, and I didn't use it. Every Docker interaction in the wrapper is `child_process` running the `docker` CLI:

```js
exec(`docker run -d --name claude-user-${id} -v ${vol}:/workspace ... claude-sandbox`)
```

I went back and forth on this one, because shelling out looks unsophisticated and I felt the pull of doing it properly. But the surface I actually use is four commands — `run`, `exec`, `stop`, the occasional `find` — all of which I already know how to type. An SDK covering that is a dependency to install, audit, and keep current, in exchange for wrapping knowledge I already have. The argument that settled it: when a container misbehaves at 11pm, the debugging story for the CLI version is "paste the same command into a shell and look." The SDK version's debugging story involves my code. I picked the one where the operator — me — can reproduce everything by hand.

The third refusal is the one that raises eyebrows. Every container runs Claude like this:

```
docker exec -it -w /workspace <name> claude --dangerously-skip-permissions
```

That flag name is designed to make you nervous, and normally it should. Here it's deliberate, and I made myself write the reasoning into the spec rather than just flipping it. Claude's per-action permission prompt exists to protect your real machine from a tool that can touch your real files. In this setup, Claude runs inside a sandbox whose entire contents are the user's own workspace — the container is the security boundary, and the prompt would be a second lock on a door that's already inside a vault, paid for in friction on every single command. There was a practical reason stacked on top: the wrapper can't shut Claude down gracefully when a browser tab just disappears, so without the flag, the trust-this-folder prompt reappeared at the start of every session — it never got to record an answer. The flag makes the sandbox behave like the disposable environment it actually is. On a real machine I would never run it; in this container I'd be paying for protection against a threat that structurally can't occur.

Writing this up, I notice the three refusals are one instinct wearing three costumes: each layer I skipped would have duplicated something that already existed. A session store, when Claude already keeps one. An API wrapper, when the CLI already is one. A permission gate, when the container already is one. Every absent layer is a thing that can't break, can't drift, and can't confuse whoever reads the code next — probably me, in six months, having forgotten all of it.

There's one more post in this series. Underneath the Claude-specific parts, what I actually built is a generic recipe — any interactive CLI, in a browser, sandboxed in a container — and it deserves writing down with the gotchas included.
