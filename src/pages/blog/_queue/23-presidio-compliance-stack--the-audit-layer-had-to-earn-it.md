---
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/presidio-compliance-stack
title: Without the audit layer it was a recognizer pack with Malaysian regexes
description: Before building a Malaysian PII pack for Presidio, I made the audit layer argue for its place in both directions. It survived, on a narrower reason than the one I started with.
banner: /assets/blog/presidio-compliance-stack--the-audit-layer-had-to-earn-it.svg
bannerMobile: /assets/blog/presidio-compliance-stack--the-audit-layer-had-to-earn-it-mobile.svg
bannerAlt: A balance weighing a Malaysian recognizer pack against an audit layer that records what was redacted, from where, and when, tipped toward the audit layer
---

I was scanning Presidio's regional recognizers for a gap, and the country I checked first was Malaysia, because that's where I'm from. The registry check was done on 9 July. Presidio, Microsoft's open-source PII engine, already had a well-worn slot for regional recognizers: a Philippines tax number and a German pack had merged that June alone, and a Singapore and a Russian pack had appeared on PyPI in May. Nothing for Malaysia. No MyKad number, no SSM company registration, no Malaysian phone formats, on PyPI, npm, or GitHub. The only near miss was `mykad`, a standalone NRIC validator with no Presidio integration at all.

So the obvious project was a recognizer pack. The problem was that the obvious project was also a small one. Someone had shipped the Singapore pack in a couple of weeks, and a Malaysian one would be the same shape with different regexes. The thing I thought made it worth doing was a second piece, an audit layer that records what got redacted, from where, and when, because everything I surveyed in that space detected and redacted and nothing kept a record of having done it.

## Arguing the audit layer both ways

On 1 August, with the plans written, I noticed they treated the audit layer as the differentiator and mostly asserted the benefit instead of arguing it. So I wrote a separate note whose only job was to argue it properly, in both directions, and reach a verdict.

The case I'd been carrying was "records of processing", borrowed from GDPR Article 30. Writing it down, it fell apart. Malaysia's PDPA has an accountability principle, but I hadn't confirmed a statutory records-of-processing obligation that mirrors Article 30, and I didn't want to assume one. If the obligation doesn't exist, the artifact is voluntary hygiene, and voluntary hygiene sells badly to businesses already unsure whether any of this applies to them.

The case that held up wasn't part of the plan at all. I only found out about the breach clock along the way, and it was a nice surprise, because it was narrower and much more concrete than anything I'd been arguing. Since 1 June 2025 a Malaysian data controller has to notify the Commissioner of a breach as soon as practicable, with the guideline setting an outer limit of 72 hours, and affected data subjects within 7 days of that. Put a small company in the realistic version of that scenario: their AI vendor is breached, not them. The first question is what Malaysian personal data of theirs went into that tool, and whose. With an audit store that's an afternoon: filter the date range, read off the entity counts and the sources. Without one they can't prove a negative, so they notify worst case.

The argument in the note that carried the most weight was that this evidence can't be created retroactively. Every other item on a compliance checklist can be assembled the week before an audit. If you weren't logging at the time, there is nothing to reconstruct.

## The objections I couldn't answer

The note had to argue against it too, and two of the objections were real. The log proves the tool ran and caught 41 NRICs. It says nothing about what it missed, and Presidio explicitly disclaims completeness. That one can't be engineered away. The only response is to say it first and plainly, which is why the repo has a `COMPLIANCE.md` whose job is to list what the artifact does not evidence.

The second was that self-generated evidence is weak evidence. It's a JSONL file on the company's own disk, and anyone adversarial dismisses it in one sentence: you could have edited this. That one did have an answer, a cheap one. Each record carries the hash of the one before it, so an edit in place or a deletion from the middle shows up as a broken chain. It costs one stdlib import. It doesn't prevent tampering, doesn't catch someone truncating the tail, and doesn't stop someone regenerating a clean chain from scratch, and I wrote those limits into the note next to the claim.

The last objection I just accepted. Appending structured records around an anonymizer call is about a day's work for a competent developer, so the code isn't a moat. Whatever defensibility there is rests on adoption and on being there first when someone searches, which is slow and not certain.

## Two shapes I said no to

Two other decisions came out of the same research, and both were about where personal data crosses a network boundary. Presidio can now use an LLM as its entity recognizer, and routing detection through a cloud model would have been easy. It would also have meant sending raw PII to a third party in order to find out whether it contained PII, which undoes the only thing the package is selling. NRICs, SSM numbers and phone formats are structural anyway; a checksum is faster, free, and more reliable than a probabilistic call. The other was a hosted service. The moment customers upload raw personal data to me, I'm the data processor with the breach liability, which is a heavier business than the one I scoped and the exact thing Presidio's self-hosted model exists to avoid. So it's a library: two pip packages, everything running inside the customer's own infrastructure.

The note ended with a verdict and two conditions: add the hash chain, and don't claim the legal obligation until it's verified against the Commissioner's own guidelines. Both went into the plans that day. What I didn't know yet was how much of the rest of the plan would survive being built.
