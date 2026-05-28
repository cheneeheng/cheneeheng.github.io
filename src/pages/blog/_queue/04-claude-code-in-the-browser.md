---
layout: ../../layouts/BlogPost.astro
title: I put Claude Code in the browser
description: A self-hosted web front end for Claude Code — one Docker container per user, sessions you can resume from a browser tab, and no cloud in the loop.
banner: /assets/blog/claude-code-in-the-browser.svg
bannerAlt: A browser terminal connected over a websocket to a Claude process running inside a Docker container with a persistent workspace volume
---

Claude Code lives in your terminal. That's mostly the right place for it. But a terminal is tied to one machine — your laptop, your dotfiles, your local checkout. I wanted Claude Code to be something I could open from a browser tab on any device, with its own isolated workspace that persists whether or not my laptop is awake. So I built [`claude-code-html-wrapper`](https://github.com/cheneeheng/claude-code-html-wrapper): a small, self-hosted web front end that puts a real Claude Code terminal in the browser.

**What it is**

A Node.js server bridges an [xterm.js](https://xtermjs.org/) terminal in the browser to a `claude` CLI process running inside a Docker container. Each user gets one permanent container; their files live on a host-mounted volume and survive restarts. You open the app, you see a list of your past sessions, you click one to resume it or start a new one, and you're in a live terminal talking to Claude Code — same tool, same keystrokes, now reachable from anywhere you can reach the server.

No cloud, no managed infrastructure, no Anthropic-hosted middle layer. The whole stack runs on a machine you control.

There's a recursion here I can't resist pointing out: this is a wrapper *for* Claude Code that was *built by* Claude Code. I wrote a design doc and a sequence of numbered iteration specs, then drove Claude Code through them one at a time — container lifecycle, then the auth and PTY bridge, then the session manager and frontend, each its own iteration and its own pull request. The tool that now opens in my browser was assembled by the same tool it opens.

**Why not just SSH in?**

That was the honest first question. SSH plus `tmux` already gives you a remote terminal. But SSH means handing out shell accounts, managing keys, and trusting every user with whatever else is on the box. The wrapper gives each user a sandboxed container with exactly one thing in it — Claude Code and their workspace — reachable with a single shared secret over a normal web port. The browser is a far lower-friction door than an SSH client, especially on a tablet or a borrowed machine, and the container is a much smaller blast radius than a login shell.

**How it works**

The data path is short:

```
browser xterm.js
  ─ {type:'input',data} ──► WebSocket ──► node-pty
                                              │
                                              ▼
                          docker exec -it claude-user-<id> claude
                                              │
  ◄── raw bytes ─── WebSocket ◄───────────── PTY stdout
```

Keystrokes go from the browser over a WebSocket to a `node-pty` process; that process runs `docker exec -it` into the user's container and pipes the pseudo-terminal both ways. Output comes back as raw bytes the browser terminal renders directly. There's no scraping, no parsing — it's a transparent pipe to a real PTY.

A few deliberate choices made it small:

- **One permanent container per user.** Created on first use, named `claude-user-<id>`, kept around between sessions. Files persist via a Docker volume mounted at `/workspace`, and Claude's own credentials persist in a second mount — so you log in once and every future session reuses it.
- **Sessions come from Claude itself.** There's no database. The session list is read straight from Claude Code's own transcript files. Claude already records one JSONL per session; the wrapper just lists them. (That decision turned out to be worth its own post.)
- **An idle reaper.** Containers that sit unused get stopped after a configurable timeout, so idle users don't hold memory forever. The files stay; only the running container goes.

**Getting it running**

```bash
npm install
docker build -t claude-sandbox .     # the per-user sandbox image
cp .env.example .env                 # set AUTH_SECRET
npm run start
```

Open `http://localhost:3001`, paste your secret into the login form, and a fresh container is one click away. The first terminal prompts you to `/login` to Claude once; after that, every session reuses those credentials.

**What it is not, yet**

This is experimental, and I'm not pretending otherwise. The design targets a trusted, internal team — a small group behind a company firewall, all reaching the same self-hosted server. But I should be straight about how far it actually got: I took it to working local, solo use and stopped there. The per-user container model, the volume-per-user layout, the shared-secret auth — all of it is in place and works for one person on one machine, but it was never hardened or run for a real team. Auth is still a single shared secret, so everyone who has it is the same user. There's no TLS, no SSO, no multi-tenant hardening, no network egress restrictions on the containers. The design doc lists exactly what's deferred and why; the team deployment is on that deferred list, not the done one.

So treat it as a proof of concept that reached its useful local stage and didn't go further. For what it is — a browser you can open to find Claude Code waiting with all your past work intact — it does the job. The code is small enough to read in one sitting, which was a goal in itself.

In the next post I'll get into the design decisions that kept it small: why the session list is Claude's own transcripts instead of a database, why I shelled out to the `docker` CLI instead of using an SDK, and why the containers run with `--dangerously-skip-permissions` on purpose.
