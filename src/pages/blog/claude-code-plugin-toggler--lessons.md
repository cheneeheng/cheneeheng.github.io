---
date: 2026-06-02
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/claude-code-plugin-toggler
title: The Windows bug that came back three times
description: I promised to write up the path problems once I understood them. It took three releases, a 29-line band-aid, and Claude Code finding the one character I couldn't see.
banner: /assets/blog/plugin-toggler-lessons.svg
bannerAlt: Two mirrored implementations writing to one shared file, with a lowercase c-drive vs uppercase C-drive path mismatch flagged
---

[Last time](/blog/claude-code-plugin-toggler--plugin-manager) I said Windows had opinions about file paths and that I'd write it up once I understood what was going on. It took three releases to get there, and the last step wasn't me understanding it — it was Claude Code finding the one character I'd been unable to see.

Some context first, because the bug only makes sense against a decision I made on day one. When I started [`claude-code-plugin-toggler`](https://github.com/cheneeheng/claude-code-plugin-toggler), I set myself one constraint before writing anything: no external dependencies. The Python server would be stdlib only; the VSCode extension would have zero npm runtime packages. If it couldn't be built with what ships in the box, I'd rethink the design. I liked what that bought me — you run `python3 server.py` and it just works, nothing to install or audit. What I underestimated was the bill. No path libraries, no cross-platform utilities. Every sharp edge in the OS was now mine to handle personally.

The other relevant choice: the tool has two faces, a browser UI on a Python server and a VSCode extension on a Node extension host. Same data contract — read `installed_plugins.json`, write `.claude/settings.local.json` — implemented twice, once per language, no shared code. At this size that felt right, and I still think it is. But it means that when a bug exists, it exists twice. Fix it in Python, fix it again in Node.

Windows took full advantage. The first path bug was the ordinary kind — separators — and the fix was routine. Then uninstall broke, and that turned out to be a hard-coded path, also routine once found. Each fix went in, I moved on, and a release later something path-shaped broke again. By the third round I was suspicious of the whole area but couldn't say why.

The third one was the strange one. Uninstalling a plugin from the VSCode extension would silently do nothing. No error, no log, just a plugin that stayed installed. I patched what looked like the problem; the symptom moved somewhere else. I patched that; it moved again. Eventually I wrote a 29-line function that rewrote the JSON file before every uninstall call, and the symptom finally stopped. I knew it was a band-aid. I shipped it anyway, because it worked and I was tired of this bug.

Then I pointed Claude Code at it and asked it to find the actual cause. It read the extension code, traced the path from where VSCode hands it over to where it lands in the JSON, and came back with this: `uri.fsPath` returns lowercase drive letters on Windows — `c:\Users\...`. The Claude Code CLI writes uppercase — `C:\Users\...`. The extension passed its working directory into a `spawn()` call, the lowercase path got recorded in `installed_plugins.json`, and later the uninstall lookup compared it against the CLI's uppercase version. Same path, different letter, no match, silent failure. Two programs sharing one file, each assuming its own convention, and the disagreement only surfacing at lookup time with no trace back to the source.

One character. I had been staring at these paths for three releases and my eyes slid right over the case of the drive letter every single time — it *looks* right, because it is right, on the filesystem. It's only wrong as a string.

The real fix was five lines in `_projectRoot()`: detect a lowercase drive letter, uppercase it at the source. The 29-line band-aid came out entirely. There's something a little humbling about watching your workaround get deleted because the actual problem fit in five lines you couldn't find yourself.

Would I still take the zero-dependency constraint, knowing it put me on the hook for edges like this? For this tool, yes — the bug wasn't really about missing libraries, since a path library wouldn't have normalized drive-letter case across two processes either. But I've stopped pretending the constraint is free. The tool is at 0.6.1 now, stable on Windows as far as I can tell, and I've learned to read paths with one eye on the first character.
