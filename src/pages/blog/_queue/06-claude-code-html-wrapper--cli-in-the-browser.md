---
layout: ../../layouts/BlogPost.astro
title: "Put any CLI in the browser: xterm.js, node-pty, and Docker"
description: A practical recipe for bridging a browser terminal to a real CLI process in a sandboxed container — the WebSocket-to-PTY bridge, and the gotchas nobody warns you about.
banner: /assets/blog/cli-in-the-browser.svg
bannerAlt: A left-to-right pipeline from browser xterm.js through a websocket to node-pty to docker exec to a CLI process
---

I recently wrapped Claude Code in a browser. Under the project-specific parts, what I actually built was generic: a way to drive *any* interactive CLI from a browser tab, with the process sandboxed in a container. If you've ever wanted a web terminal for a tool — a REPL, a database shell, an AI coding agent — this is the recipe, including the parts that cost me time.

**The shape of it**

Four pieces in a line:

```
browser (xterm.js) ──ws──► node-pty ──► docker exec -it ──► your CLI
```

The browser renders a terminal and ships keystrokes over a WebSocket. A Node server turns that socket into a real pseudo-terminal with `node-pty`, which runs `docker exec` into a container where your CLI lives. Output streams back the same way. The trick is that it's a *transparent pipe* — you are not parsing the CLI's output or simulating a shell. You're handing a real PTY's bytes to a terminal emulator and letting it do its job.

**Step 1: The browser terminal**

[xterm.js](https://xtermjs.org/) is the same terminal component VS Code uses. Load it (a CDN is fine — no bundler required), mount it, and wire two directions: keystrokes out, bytes in.

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

Two message types go *to* the server — `input` and `resize` — and raw bytes come *back*. That asymmetry is deliberate: input needs structure (you have to distinguish a keystroke from a resize event), but output is just terminal bytes, so don't wrap them.

**Step 2: The WebSocket-to-PTY bridge**

On the server, each WebSocket connection spawns one `node-pty` process running `docker exec -it` into the user's container. Then you pipe both directions and translate the two inbound message types.

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

That's the whole core. Everything else — auth, container lifecycle, session listing — is scaffolding around this pipe.

**Step 3: The sandbox container**

The CLI runs in Docker, not on the host, so a user driving it can't reach anything you didn't give them. A minimal image:

```dockerfile
FROM node:20-slim
RUN npm install -g your-cli
WORKDIR /workspace
```

Create one container per user and mount a volume so their files survive restarts:

```js
exec(`docker run -d --name claude-user-${id} ` +
     `-v ${WORKSPACE_ROOT}/${id}:/workspace your-image tail -f /dev/null`);
```

The container runs a do-nothing `tail -f /dev/null` so it stays alive; each browser session `exec`s into it rather than starting a fresh container. One long-lived sandbox per user, many short-lived terminal sessions inside it.

Now the gotchas — the things that actually cost me time.

**Gotcha 1: Browsers can't set headers on a WebSocket upgrade**

You'll want to authenticate the socket. The natural move is an `Authorization: Bearer` header — and the browser WebSocket API simply won't let you set one. There's no headers argument.

The workaround is a query param: `wss://host/ws?token=...`, validated during the HTTP upgrade *before* you accept the socket.

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

Reject *before* `handleUpgrade`, not inside the connection handler — you don't want to complete a handshake just to close it. (A token in a URL is fine over TLS for an internal tool, but it lands in logs and history; for anything public, scope it to a short-lived single-use ticket.)

**Gotcha 2: `-it` matters, and so does the PTY**

`docker exec` without `-it` gives you a non-interactive pipe, and interactive CLIs behave completely differently when they don't think they're on a terminal — no colors, no cursor control, sometimes no prompt at all. You need `-it` *and* you need to be running it under `node-pty`. The PTY is what convinces the CLI a human is at a real terminal. Plain `child_process.spawn` won't do it; you'll get line-buffered, stripped output and spend an hour wondering why the colors vanished.

**Gotcha 3: Resize, or live with garbage**

If you skip the `resize` plumbing, the PTY stays at its spawn-time 80×24 while the browser terminal is whatever size the window is. Anything that draws a full-screen UI — an editor, a TUI, a coding agent's interface — wraps and corrupts. Send `term.resize(cols, rows)` on connect and on every window resize. It's easy to forget because a plain shell looks fine without it; the breakage only shows up once something tries to paint the whole screen.

**Gotcha 4: Don't let throws escape at the socket boundary**

A WebSocket can vanish between the moment you decide to write and the moment you write — the user closed the tab. If you let that `send()` throw, it can take down more than the one connection. Wrap writes and closes in a `try/catch` that swallows the error on purpose; the socket being gone is a normal event, not an exception worth propagating.

```js
term.onData(data => { try { ws.send(data); } catch { /* gone */ } });
```

**Gotcha 5: Reap idle containers**

One container per user means a container per user *forever* if you let it. Track last activity in memory and stop containers that have been idle past a threshold — every inbound or outbound byte bumps the timestamp; a timer sweeps the rest. The volume keeps the files, so stopping an idle container costs the user nothing but a second of startup next time. Skip this and a handful of users will quietly pin all your memory.

**What you end up with**

Put together, it's surprisingly little code — a static page with xterm.js, one upgrade handler, one connection handler bridging WebSocket and PTY, and a few `docker` commands for lifecycle. The CLI doesn't know it's in a browser; the browser doesn't know it's talking to Docker. Each side does the one thing it's good at, and the pipe in the middle is dumb on purpose.

If you want a complete, working reference, the project this came out of is at [github.com/cheneeheng/claude-code-html-wrapper](https://github.com/cheneeheng/claude-code-html-wrapper) — it wraps Claude Code specifically, but the bridge above is the reusable heart of it. Swap the CLI in the `docker exec` line and you've got a web terminal for whatever tool you like.
