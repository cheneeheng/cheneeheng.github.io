---
layout: ../../layouts/BlogPost.astro
title: No dependencies, two implementations, one Windows nightmare
description: Three lessons from building a zero-dependency, dual-surface developer tool — constraints, dual implementations, and the Windows path bugs that kept coming back.
banner: /assets/blog/plugin-toggler-lessons.svg
bannerAlt: Two mirrored implementations writing to one shared file, with a lowercase c-drive vs uppercase C-drive path mismatch flagged
---

When I started [`claude-code-plugin-toggler`](https://github.com/cheneeheng/claude-code-plugin-toggler), I set one constraint before writing a line: no external dependencies. The Python server would use stdlib only. The VSCode extension would have zero npm runtime packages. No pip install, no node_modules at runtime. If it couldn't be built with what ships in the box, I'd rethink the design.

That constraint shaped everything that followed.

**The cost of zero dependencies**

The upside is obvious: nothing to install, nothing to break, nothing to audit. You run `python3 server.py` and it works. Always.

The downside is that you give up the ecosystem. No path libraries. No cross-platform utilities. Every sharp edge in the OS is yours to handle personally. I didn't fully appreciate that tradeoff until Windows started teaching me.

**Two surfaces, one data contract**

The tool has two independent surfaces: a browser UI backed by the Python server, and a VSCode extension backed by a Node.js extension host. Same data contract — read from `installed_plugins.json`, write to `.claude/settings.local.json` — implemented separately in each language. No shared code, no shared runtime.

That was the right call at this size. A shared library would have required packaging, runtime coordination, and overhead that didn't make sense. Independent implementations are easier to reason about in isolation.

The cost: when a bug exists, it exists twice. When you fix it in Python, you fix it again in Node.

**Fix one layer, hit the next**

The Windows path bugs were the most instructive part of the build. They came back three times across three releases — each one uncovered only after the previous fix went in.

The first fix handled the separator issue. The second handled a hard-coded uninstall path. The third was the strangest, and I didn't catch it myself.

VSCode's `uri.fsPath` returns lowercase drive letters on Windows: `c:\Users\...` instead of `C:\Users\...`. The Claude Code CLI, meanwhile, writes uppercase. When the extension passed its working directory to `spawn()`, the path landed in `installed_plugins.json` as `c:\...`. Later, when the uninstall lookup ran, it compared against `C:\...` — same path, different letter, no match. Uninstall silently failed.

My first fix was a 29-line function that patched the JSON file before every uninstall call. It worked. It was also a band-aid over the wrong layer.

Claude Code found the root cause. It read the extension code, traced the path from `uri.fsPath` through to the JSON write, and identified the single character responsible. The real fix was 5 lines in `_projectRoot()`: detect a lowercase drive letter, uppercase it at the source, and remove the 29-line workaround entirely.

That's the kind of bug that hides because it looks right. I'd been staring at the same code and kept fixing the wrong layer.
