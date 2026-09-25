---
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/presidio-compliance-stack
title: The hash chain verifies, and the record is still wrong
description: Measuring my own audit store turned up a concurrency claim that didn't hold, and a case where a record names a recognizer that found nothing while the chain still verifies.
banner: /assets/blog/presidio-compliance-stack--a-chain-that-verifies-a-wrong-record.svg
bannerMobile: /assets/blog/presidio-compliance-stack--a-chain-that-verifies-a-wrong-record-mobile.svg
bannerAlt: A hash-chained audit log where every link verifies green while one record's recognizer label points at a detection that was discarded
---

The claim was that `segments=4` in a verify result meant four concurrent workers had written to the store. It sounded like a mechanism, and I'd been treating it as one. When I actually ran four workers against a file on 20 August and looked at the number, it didn't come out as four.

[Last time](/blog/presidio-compliance-stack--879-of-1000) the store stopped losing records on Windows. This is the part after that, where it keeps every record and I found out I'd misdescribed what the records prove.

## Segments were never four

The hash chain from [the first post](/blog/presidio-compliance-stack--the-audit-layer-had-to-earn-it) isn't one global sequence. Each record names the hash of a record before it, and `verify_chain` accepts any link back to a record it has already seen, so several writers can append without a file lock and the chain splits into segments rather than breaking. I'd kept locking out on purpose, because the anonymize call is the hot path and lock contention there is a cost every caller pays.

What I'd believed about segments was a guess. Measured over five trials of four processes appending 250 records each, the segment count came out 1 or 2, never 4, and adding workers to a file that already had records added none. What concurrency actually produces is forks: two records naming the same previous hash. `verify_chain` accepts them silently and nothing reports them. Segments do grow, but from crash restarts, not from workers. The point that mattered, that a segment count isn't a tamper signal, survived. The mechanics under it were wrong, and the figures come from a race, so they differ run to run.

## A record that names the wrong recognizer

The worse finding was in the records themselves, and it got worse again when I measured it on 21 August.

Presidio's anonymizer takes a list of analyzer results and returns a list of what it actually did, and the two lists don't always line up. My `join_results` pairs them back together so each audit record can say which recognizer found the span and at what confidence. When Presidio's conflict resolution discards a result, the pairing for that entity type runs one position ahead, and every later record of that type names a recognizer that produced nothing, at a score that was never applied. The chain still verifies. It proves nobody edited the line after it was written. It doesn't prove the line was true.

I'd first recorded the trigger as a result contained inside another of the same type, which sounds rare. Measuring it showed Presidio collapses any overlap into one operator result: contained, partial, identical, and across entity types. Anyone who'd reasoned "my recognizers don't nest, so I'm safe" would have been wrong, and my first description would have told them they were right.

Finding that was a relief more than anything, because it was before 1.0.0 and not after. Nothing had shipped that claimed more than it should.

## What the fix wasn't

I didn't fix the pairing. The change I could see, a per-type count comparison that turns a silent misattribution into an honest `None`, would alter records the report already consumes, and the obvious fix, matching on start offsets, is wrong because the two lists use different offset spaces. So the fact went in at the level of its blast radius instead: a new invariant in the repo's `CLAUDE.md` saying `recognizer_name` and `confidence` are best-effort attribution while `entity_type`, `operator` and the span are always sound, docstrings at the three places a maintainer actually reads, and a line in the 1.0.0 changelog.

The same pass caught a second behaviour that was only half written down. `deanonymize(entities=...)` looks like a filter and is actually an instruction list: every span passed gets decrypted, so passing a span that was replaced rather than encrypted raises inside Presidio, and the whole call fails with no span restored and no record written. That's consistent with the rule the store follows everywhere, log what happened rather than what was attempted, but a caller reading the signature would never guess it.

The chain answers the objection I'd designed it for, you could have edited this, and says nothing about a record that was wrong when it was written. `COMPLIANCE.md` already said the log records what the recognizers caught and not what they missed. Now there's a second, narrower gap next to it, inside the records it does keep, and it's documented rather than closed. Whether anyone relying on the report reads that far is something I can't see from here.
