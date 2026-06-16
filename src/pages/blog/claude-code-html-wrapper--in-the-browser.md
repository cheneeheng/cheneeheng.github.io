---
date: 2026-06-16
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/claude-code-html-wrapper
title: I put Claude Code in the browser
description: A self-hosted web front end for Claude Code — one Docker container per user, sessions you can resume from a browser tab, and no cloud in the loop.
banner: /assets/blog/claude-code-in-the-browser.svg
bannerAlt: A browser terminal connected over a websocket to a Claude process running inside a Docker container with a persistent workspace volume
---

Claude Code lives in your terminal, and mostly that's the right place for it. But a terminal is tied to one machine — your laptop, your dotfiles, your local checkout — and I kept running into the edges of that. I wanted to open a browser tab on whatever device was in front of me and find Claude Code waiting there, with its own workspace, in whatever state I'd left it, regardless of whether my laptop was awake. No such thing existed in the shape I wanted, so I built it: [`claude-code-html-wrapper`](https://github.com/cheneeheng/claude-code-html-wrapper), a small self-hosted web front end that puts a real Claude Code terminal in the browser.

The first question I had to answer honestly was: why not just SSH in? SSH plus `tmux` already gives you a remote terminal, and I almost talked myself out of the project with that. But SSH means handing out shell accounts, managing keys, and trusting every user with whatever else is on the box. What I wanted was narrower: each user gets a sandboxed container with exactly one thing in it — Claude Code and their own workspace — reachable with a single shared secret over a normal web port. A browser tab is a much lower-friction door than an SSH client, especially from a tablet or a borrowed machine, and a container is a much smaller blast radius than a login shell. Once I'd written that comparison down, the project felt justified.

The shape it took: a Node.js server bridges an [xterm.js](https://xtermjs.org/) terminal in the browser to a `claude` CLI process running inside a Docker container. You open the app, see your past sessions, click one to resume it or start fresh, and you're in a live terminal talking to Claude Code — same tool, same keystrokes, now reachable from anywhere that can reach the server. No cloud, no managed middle layer; the whole stack runs on a machine you control.

The data path turned out pleasingly short:

```
browser xterm.js
  ─ {type:'input',data} ──► WebSocket ──► node-pty
                                              │
                                              ▼
                          docker exec -it claude-user-<id> claude
                                              │
  ◄── raw bytes ─── WebSocket ◄───────────── PTY stdout
```

Keystrokes travel over a WebSocket to a `node-pty` process; that process runs `docker exec -it` into the user's container and pipes the pseudo-terminal both ways. Output comes back as raw bytes that the browser terminal renders directly. There's no scraping and no parsing — it's a transparent pipe to a real PTY, which is most of why the thing works at all.

A few decisions kept it small. Each user gets one *permanent* container, created on first use and kept around between sessions, with their files on a host-mounted volume — so you log into Claude once and every future session finds your credentials and your work where you left them. The session list has no database behind it: Claude Code already writes one JSONL transcript per session, so the wrapper just reads its files. And an idle reaper stops containers that sit unused past a timeout — the files stay, only the running process goes. That second decision, letting Claude's own transcripts be the session store, turned out to be worth a post of its own; it's coming next.

There's also a recursion here I can't resist pointing at. This is a wrapper *for* Claude Code that was *built by* Claude Code — I wrote a design doc and a sequence of numbered iteration specs, then drove Claude Code through them one at a time: container lifecycle, then the auth and PTY bridge, then the session manager and frontend. The tool that now opens in my browser was assembled by the same tool it opens.

If you want to try it:

```bash
npm install
docker build -t claude-sandbox .     # the per-user sandbox image
cp .env.example .env                 # set AUTH_SECRET
npm run start
```

Open `http://localhost:3001`, paste your secret, and a fresh container is one click away. The first terminal asks you to `/login` to Claude once; after that, every session reuses the credentials.

I want to be straight about how far this actually got, because the design and the reality differ. The design targets a small trusted team behind a firewall, all reaching one self-hosted server. The reality is that I took it to working local, solo use and stopped there. The per-user containers, the volume layout, the shared-secret auth — all of it is in place and works for one person on one machine, but it was never hardened or run for a real team. Auth is a single shared secret, so everyone holding it is the same user; there's no TLS, no SSO, no egress restrictions on the containers. The design doc keeps an explicit deferred list, and the team deployment sits on it, not on the done list.

So it's a proof of concept that reached its useful local stage, and for what it is — a browser tab you open to find Claude Code waiting with all your past work intact — it does the job. The code is small enough to read in one sitting, which was a goal in itself, and the next post is about the three decisions that kept it that way.
