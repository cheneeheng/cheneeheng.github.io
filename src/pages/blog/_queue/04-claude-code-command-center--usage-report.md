---
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/claude-code-command-center
title: CLI is all the rage, so I made one
description: I already had a usage dashboard; I built the terminal version out of pure "can I" curiosity — and it's what finally justified extracting the shared parsing into a library.
banner: /assets/blog/claude-code-command-center--usage-report.svg
bannerAlt: A terminal running usage-report, the claude-usage library feeding both the dashboard and the report as its second consumer, and a by-model breakdown
---

The dashboard already did everything I needed. The report tool exists because I wanted to know whether I could do it in the terminal instead — no browser, no server, just a command that prints the same summary and exits. CLI is all the rage nowadays, and I was curious whether the same numbers would feel different coming out of a shell.

It was easier than it should have been, for a reason I'd half set up in advance. All the transcript-reading — the walk over the JSONL files, the pricing table — had been living inside the dashboard, because the dashboard was the only thing that needed it. The report was the second thing. And the second thing is exactly when copying the code would have been the wrong move: I pulled the parsing out into a small `claude-usage` library, pointed the dashboard at it, and the report came out as a thin shell on top. Writing the report is what turned the dashboard's private code into something shared.

Do I use it? Sometimes. `usage-report --top 5` in a terminal I already have open is genuinely faster than reaching for a browser tab when all I want is the headline — total tokens, total estimated cost, the five priciest sessions. But it's the dashboard I keep going back to, and the report is content being the quieter option. It answered its own question — yes, a CLI version was doable — and then stuck around for the days I don't want a web page.
