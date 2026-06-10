---
date: 2026-06-08
layout: ../../layouts/BlogPost.astro
title: Teal, because of the orange
description: Reskinning my Claude Code plugin manager around teal and terracotta — a palette that stays related to Claude without looking like an Anthropic product, and a VSCode panel that does the same trick against the editor.
banner: /assets/blog/claude-code-plugin-toggler--tidewater.svg
bannerAlt: A terracotta swatch and a complementary teal swatch feeding a UI card with teal controls and one terracotta enabled row
---

With the [three-scope work](/blog/claude-code-plugin-toggler--scopes) done, the toggler was finally in the shape I'd wanted it to be. The toggles did what I needed, the scopes covered how I actually work, and for the first time there was no obvious next feature nagging at me. So the next thing I reached for wasn't a feature at all. I open this tool every day, and every day it looked flat. I wanted it to look nice.

I don't have strong opinions about color. So I did the obvious thing and asked Claude for suggestions — and the first palette it came back with leaned hard into warm oranges and rusts. Which, once I actually looked at it, was recognizably Claude's own color profile. I suspect that's simply what it reaches for by default. The mockup looked like an official Anthropic product.

That accident surfaced the real design question, one I hadn't thought to ask: how much do I want this thing to look like it belongs to Claude? The answer turned out to be *somewhere in the middle*. It's a tool for Claude Code, so it shouldn't look like it came from nowhere — some visual relationship is honest. But it isn't made by Anthropic, and dressing it in their colors would imply something untrue. I wanted related, not associated.

The way out was the complement. I kept a terracotta in the palette — a nod to Claude's orange, the family resemblance — but made teal the lead. Teal sits opposite orange on the wheel, so it reads as deliberately paired with Claude rather than borrowed from it. Related by adjacency, distinct by hue. I called the theme Tidewater and made myself stop fiddling.

The one rule I held to while applying it: teal does all the work, terracotta does almost none. Every interactive thing is teal — toggles, buttons, the theme switch, hovers, badges. Terracotta is reserved for a single signal: a row that's enabled warms to it, plus the logo mark, and that's it. Because terracotta shows up rarely, it means something when it does — you scan the list and the warm rows are the ones that are on. If I'd let it onto buttons too it would have decayed into decoration.

What pleased me was how little code this took. The UI was already token-driven from an earlier pass, so most of the redesign was re-pointing CSS variables — `server.py` and the extension's logic were never opened. The enabled-row warming is pure CSS, a `:has(.toggle:checked)` rule, no JavaScript adding classes. There was one trap: the old `--accent` variable *was* the single accent, and every control read from it. If I'd just set it to terracotta, every button in the app would have turned orange — the exact opposite of the plan. So the controls all had to be re-pointed to the new teal token first, leaving `--accent` to mean only "enabled" by the time it went warm.

Then the same problem came back wearing a different host. The tool's second face is a VSCode side panel, and a panel lives *inside* someone else's editor, running whatever theme they chose. In the browser I own the whole page, so it gets the full Tidewater treatment — the real palette, web fonts, a soft background glow. A panel that imposed all of that on a stranger's editor would look like a sticker slapped on the window. So the VSCode surface is a hybrid: its neutrals — backgrounds, text, borders — derive from the editor's own `--vscode-*` variables, quietly matching whatever theme you're in, including high-contrast, while only the brand teal and terracotta stay hardcoded. The fonts fall back to the editor's, which is partly taste and partly forced — the webview's content-security-policy blocks remote fonts, so my Fraunces/Hanken Grotesk pairing was never going to load there anyway.

I noticed only afterwards that the panel and the palette are doing the same thing. The panel belongs to your editor on the neutrals and to me on the brand; the palette sits next to Claude's orange without pretending to be it. I didn't plan "adjacent without impersonating" as the theme of this redesign, but it's the decision I kept making.

So — is it any good? It's coherent, which is more than the flat blue version managed. The colors agree with each other, the depth and spacing hold together, nothing fights for attention. The tool is nicer to open, which is what I set out to get.

But I'll be honest: it still has a faint AI-generated quality I can't quite name. Something a little too even, a little too safe — the look of a palette that was reasoned into rather than felt. And that leaves me with a question I can't answer on my own. Is that evenness just what design-by-reasoning produces — the place an AI and I will always land together, because neither of us is actually *feeling* the thing — or is it a fixable gap a real designer would name in five seconds? I genuinely don't know which. I'd like to know what I'm not seeing.
