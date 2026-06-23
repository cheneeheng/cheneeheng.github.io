---
date: 2026-06-23
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/claude-code-html-wrapper
title: "Put any CLI in the browser: xterm.js, node-pty, and Docker"
description: The generic recipe underneath my Claude Code wrapper — a WebSocket-to-PTY bridge into a container, written down with the five things that actually cost me time.
banner: /assets/blog/cli-in-the-browser.svg
bannerAlt: A left-to-right pipeline from browser xterm.js through a websocket to node-pty to docker exec to a CLI process
---

When I peeled the Claude-specific parts off [the wrapper I built](/blog/claude-code-html-wrapper--in-the-browser), what was left turned out to be generic: a way to drive *any* interactive CLI from a browser tab, with the process sandboxed in a container. I went looking for a writeup like this before I built mine and didn't find one that included the failure modes, so this is the version I wish I'd had — the recipe, plus the five places I lost time.

The whole thing is four pieces in a line:

```
browser (xterm.js) ──ws──► node-pty ──► docker exec -it ──► your CLI
```

The browser renders a terminal and ships keystrokes over a WebSocket. A Node server turns that socket into a real pseudo-terminal with `node-pty`, which runs `docker exec` into a container where the CLI lives. Output streams back the same way. The insight that makes it all work: this is a *transparent pipe*. You are not parsing the CLI's output or simulating a shell — you're handing a real PTY's bytes to a terminal emulator and letting each side do the one thing it's good at.

**The browser end.** [xterm.js](https://xtermjs.org/) is the same terminal component VS Code uses. Load it (a CDN is fine — no bundler required), mount it, and wire two directions: keystrokes out, bytes in.

```js
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

const term = new Terminal({ cursorBlink: true });
const fit = new FitAddon();
term.loadAddon(fit);
term.open(document.getElementById('terminal'));
fit.fit();

const ws = new WebSocket(`wss://${location.host}/ws?token=${TOKEN}`);

// keystrokes -> server
term.onData(data => ws.send(JSON.stringify({ type: 'input', data })));

// server bytes -> screen
ws.onmessage = ev => term.write(ev.data);

// keep the PTY's size in sync with the visible terminal
const sendSize = () =>
  ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
ws.onopen = sendSize;
window.addEventListener('resize', () => { fit.fit(); sendSize(); });
```

Note the asymmetry: two structured message types go *to* the server — `input` and `resize` — but raw bytes come *back*. That's deliberate. Input needs structure because a keystroke and a resize event have to be distinguishable; output is just terminal bytes, and wrapping them buys nothing.

**The bridge.** On the server, each WebSocket connection spawns one `node-pty` process running `docker exec -it` into the user's container, and then it's piping in both directions:

```js
const pty = require('node-pty');

wss.on('connection', (ws, req) => {
  const term = pty.spawn('docker', [
    'exec', '-it', '-w', '/workspace', containerName,
    'your-cli', '--whatever-flags',
  ], { name: 'xterm-color', cols: 80, rows: 24 });

  // PTY -> browser (raw bytes)
  term.onData(data => {
    try { ws.send(data); } catch { /* socket may be gone */ }
  });

  // browser -> PTY (typed messages)
  ws.on('message', raw => {
    const msg = JSON.parse(raw);
    if (msg.type === 'input') term.write(msg.data);
    else if (msg.type === 'resize') term.resize(msg.cols, msg.rows);
  });

  ws.on('close', () => term.kill());
});
```

That's the entire core. Everything else I built — auth, container lifecycle, session listing — is scaffolding around this one pipe.

**The sandbox.** The CLI runs in Docker, not on the host, so whoever drives it can't reach anything you didn't give them. A minimal image:

```dockerfile
FROM node:20-slim
RUN npm install -g your-cli
WORKDIR /workspace
```

I create one container per user and mount a volume so files survive restarts:

```js
exec(`docker run -d --name claude-user-${id} ` +
     `-v ${WORKSPACE_ROOT}/${id}:/workspace your-image tail -f /dev/null`);
```

The container runs a do-nothing `tail -f /dev/null` to stay alive; each browser session `exec`s into it rather than starting fresh. One long-lived sandbox per user, many short-lived terminals inside it.

Now the five things that actually cost me time.

**Browsers can't set headers on a WebSocket upgrade.** I wanted to authenticate the socket with an `Authorization: Bearer` header, and spent a while confused about why I couldn't: the browser WebSocket API simply has no headers argument. The workaround everyone lands on is a query param — `wss://host/ws?token=...` — validated during the HTTP upgrade, *before* accepting the socket:

```js
server.on('upgrade', (req, socket, head) => {
  if (!validToken(new URL(req.url, 'http://x').searchParams.get('token'))) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws, req));
});
```

Reject before `handleUpgrade`, not inside the connection handler — completing a handshake just to close it is wasted work and a worse security posture. (A token in a URL is fine over TLS for an internal tool, but it lands in logs and history; for anything public, make it a short-lived single-use ticket.)

**`-it` matters, and so does the PTY.** My first attempt used plain `child_process.spawn`, and the CLI came back with no colors, line-buffered output, and sometimes no prompt at all. Interactive CLIs behave completely differently when they don't believe a human is at a terminal. You need `docker exec -it` *and* you need `node-pty` on top — the PTY is what convinces the CLI it's on a real terminal. I lost a genuinely embarrassing hour to the missing colors before I understood this.

**Resize, or live with garbage.** Skip the `resize` plumbing and the PTY stays at its spawn-time 80×24 while the browser terminal is whatever size the window is. A plain shell hides this — prompts are short — so everything looks fine until something draws a full-screen UI, at which point the output wraps and corrupts. Claude Code's interface is exactly such a UI, which is how I found out. Send `term.resize(cols, rows)` on connect and on every window resize.

**Don't let throws escape at the socket boundary.** A WebSocket can vanish between the moment you decide to write and the moment you write — the user closed the tab, which from the server's perspective is no event at all until the next send. If that `send()` throws uncaught, it can take down more than the one connection. The socket being gone is a normal occurrence, not an exception worth propagating:

```js
term.onData(data => { try { ws.send(data); } catch { /* gone */ } });
```

**Reap idle containers.** One permanent container per user means a container per user *forever* if you let it. I track last activity in memory — every byte in either direction bumps a timestamp — and a timer stops containers idle past a threshold. The volume keeps the files, so the user pays nothing but a second of startup next time. I added this after watching a handful of test containers quietly hold memory for days.

What you end up with is surprisingly little code: a static page with xterm.js, one upgrade handler, one connection handler bridging WebSocket and PTY, a few `docker` commands for lifecycle. The CLI doesn't know it's in a browser; the browser doesn't know it's talking to Docker; the pipe in the middle is dumb on purpose. The complete working version is at [github.com/cheneeheng/claude-code-html-wrapper](https://github.com/cheneeheng/claude-code-html-wrapper) — it wraps Claude Code specifically, but swap the CLI in the `docker exec` line and it's a web terminal for whatever tool you reach for instead.
