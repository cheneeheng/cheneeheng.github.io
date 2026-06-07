---
date: 2026-06-08
layout: ../../layouts/BlogPost.astro
title: Teal, because of the orange
description: Reskinning my Claude Code plugin manager around teal and terracotta — a palette that stays related to Claude without looking like an Anthropic product, and a VSCode panel that does the same trick against the editor.
banner: /assets/blog/claude-code-plugin-toggler--tidewater.svg
bannerAlt: A terracotta swatch and a complementary teal swatch feeding a UI card with teal controls and one terracotta enabled row
---

With the [three-scope work](/blog/claude-code-plugin-toggler--scopes) done, [`claude-code-plugin-toggler`](https://github.com/cheneeheng/claude-code-plugin-toggler) was finally in the shape I'd wanted it to be. The toggles did what I needed, the scopes covered how I actually work, and there wasn't an obvious next feature nagging at me. So the next thing I reached for wasn't a feature at all. I use this tool often, and it looked flat. I wanted it to look nice.

I don't have strong opinions about color. So I did the obvious thing and asked Claude for suggestions.

**The default pulled toward Anthropic**

The first palette it came back with leaned hard into warm oranges and rusts — which, once I looked at it, was recognizably Claude's own color profile. I suspect that's just what it reaches for by default. The result looked like an official Anthropic product.

That surfaced the actual design question, the one I hadn't thought to ask: how much do I want this thing to look like it belongs to Claude?

The answer is somewhere in the middle. It's a tool *for* Claude Code, so it shouldn't look like it came from nowhere — some visual relationship is honest. But it isn't made by Anthropic, and dressing it in their colors would imply something that isn't true. I wanted related, not associated.

The way out was the complement. I kept a terracotta in the palette — a nod to Claude's orange, the family resemblance — but made teal the lead. Teal sits opposite orange on the wheel, so it reads as deliberately paired with Claude rather than borrowed from it. Related by adjacency, distinct by hue. I called the theme Tidewater and stopped fiddling.

**Two colors, two jobs**

The one rule I held to: teal does all the work, terracotta does almost none.

Every interactive thing is teal — toggles, buttons, the theme switch, hovers, the badges. Terracotta is reserved for a single signal: a row that's enabled warms to it, plus the logo mark. That's it. Because terracotta shows up rarely, it actually means something when it does — you scan a list and the warm rows are the ones that are on. If I'd let it onto buttons too, it would've just been decoration.

The nice part is how little code this took. The UI was already token-driven from an earlier pass, so most of the redesign was re-pointing CSS variables, not touching components — `server.py` and the extension's logic were never opened. The enabled-row warming is pure CSS: a `:has(.toggle:checked)` rule, no JavaScript adding a class.

There was one trap. The old `--accent` variable *was* the single accent — every control read from it. If I'd just set it to terracotta, every button in the app would have turned orange, which is the exact opposite of what I wanted. So the controls all had to be re-pointed to the new teal token first, leaving `--accent` to mean only "enabled" by the time it went warm.

**The same trick, against the editor**

The tool has two surfaces — a standalone browser page and a VSCode side panel — and the "related, not associated" problem came back in the panel, just aimed at a different host.

In the browser I own the whole page, so it gets the full Tidewater treatment: the real palette, web fonts, a soft background glow. In VSCode the panel lives *inside* someone else's editor, running whatever theme they've chosen. A panel that ignored that and imposed my own light/dark would look like a sticker slapped on the window.

So the VSCode surface is a hybrid. Its neutral colors — backgrounds, text, borders — derive from the editor's own `--vscode-*` variables, so the panel quietly matches whatever theme you're in, including high-contrast. Only the brand teal and terracotta are hardcoded, so my identity still shows through. The page-glow atmosphere is off — a sidebar isn't a page. And the fonts fall back to the editor's, which is partly taste and partly forced: the webview's content-security-policy blocks remote fonts, so the Fraunces/Hanken Grotesk pairing I load in the browser would never have loaded there anyway. It's all one stylesheet; the VSCode differences are just overrides.

So the panel belongs to your editor on the neutrals and to me on the brand. Which is the same thing the whole palette is doing with Claude — sitting next to something without pretending to be it. I didn't plan for that to be the theme of the redesign, but it's the decision I kept making.

**Is it any good?**

It's coherent, which is more than the flat blue version managed — the colors agree with each other, the depth and spacing hold together, nothing fights for attention. That alone made the tool nicer to open.

I'll be honest that it still has a faint AI-generated quality I can't quite name — something a little too even, a little too safe, the look of a palette that was reasoned into rather than felt. And that leaves me with a question I can't answer on my own: is that evenness just what design-by-reasoning produces — the place an AI and I will always land together because neither of us is actually *feeling* the thing — or is it a fixable gap a real designer would name in five seconds? I genuinely don't know which. Acceptable, not distinctive. For now it's a tool I'm happy to look at every day, which is what I set out to get. But I'd like to know what I'm not seeing.
