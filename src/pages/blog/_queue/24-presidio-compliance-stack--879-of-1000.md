---
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/presidio-compliance-stack
title: 879 of 1000 records, and no torn line to notice
description: Building the v1 plans for a Malaysian PII pack and its audit store surfaced four places the plans were wrong — the worst was an audit log that silently lost records on Windows.
banner: /assets/blog/presidio-compliance-stack--879-of-1000.svg
bannerMobile: /assets/blog/presidio-compliance-stack--879-of-1000-mobile.svg
bannerAlt: Four concurrent writers appending to one audit file, with a gap where 121 of the 1000 records were silently overwritten
---

Four processes, each appending 250 records to the same audit file, should leave 1000 lines behind. On my machine they left 879. There were no torn writes, no half-lines, nothing that looked damaged. Whole records had simply been overwritten by other whole records, and if I hadn't counted, the file would have looked fine.

[Last time](/blog/presidio-compliance-stack--the-audit-layer-had-to-earn-it) I ended with a plan that had argued its way to a verdict and hadn't been built yet. The build happened on 3 August, all four iteration plans in one go, and this was the finding I cared about most, because an audit store that loses records defeats the only reason it exists.

## The guarantee was POSIX's, not mine

The plan's concurrency story leaned on `O_APPEND`. On Linux and macOS, opening a file for append means the kernel moves to the end and writes in one step, so concurrent appenders can't land on top of each other. Windows has the flag too, but the C runtime implements it as a seek followed by a write, and two processes can seek to the same end before either writes. The plan's guarantee was a POSIX guarantee that I'd been treating as a general one, and I was building on Windows.

The fix went outside the plan's scope. The store now opens the file on Windows through `CreateFileW` with a `FILE_APPEND_DATA` handle, via `ctypes`, which gives the same kernel-level atomic append that POSIX gives. A related loss turned up next to it: if a crash left the last line without a trailing newline, the next append glued itself onto the torn line and the record was swallowed with it. Append now starts a fresh line when the file doesn't end cleanly.

None of that was obvious from 879. It took some digging to get from a missing count to the C runtime. Going outside the plan was the easy part, because the goal was clear: an audit store that drops records isn't one.

What I couldn't do was test the other branch. There was no POSIX machine to hand, so the path the plan had assumed would just work was the one path nothing had exercised. The decision log says so in as many words, and so did the changelog for a while.

## A context word that could never fire

The second finding was smaller and more embarrassing. The SSM recognizer, for Malaysian company registration numbers, had `"company no"` in its context-word list, so that a number near that phrase would get a confidence boost. It never fired. Presidio's context enhancer compares single-token lemmas, so a two-word entry can't match anything, ever. For the old-format SSM numbers, which are just digits and have nothing structural to lean on, that boost was the difference between detected and not, so the corpus positives for them were undetectable. Adding bare `"company"` alongside it fixed that, with a comment explaining why the pair is there.

## Two things I documented instead of fixing

The other two findings I left alone in code, and wrote down.

Presidio ships a UK NHS number recognizer that's enabled by default, and a Malaysian mobile number like `012-3456789` passes the NHS checksum and scores 1.0. When my `MY_PHONE` also scores 1.0 on the same span, Presidio's overlap resolution can pick `UK_NHS`, and the audit report would then say a UK health number went out when it was a Malaysian phone. The tempting fix was for my loader to quietly remove the NHS recognizer. I didn't, because that's a decision about the caller's analyzer, and the caller might have UK data. The README gives the two mitigations, scoping the analysis to the entities you care about or removing `NhsRecognizer` yourself, and the quickstart does the first one with a comment saying why.

The postcode recognizer was the one where two parts of the same plan disagreed. One section set `MY_POSTCODE`'s base score to 0.01 deliberately, so that a bare five-digit number isn't flagged as a postcode unless context words are nearby. Another section said every entity in the test corpus should reach 0.6. Presidio's context enhancer lifts a context match to exactly 0.4 and no further, so the two were unsatisfiable by construction. Raising the base score would have met the threshold and destroyed the reason the low score existed. So the threshold became per entity, 0.4 for postcode and 0.6 for the rest, and the recognizer's docstring and README now say plainly that anyone filtering at 0.6 will never see a postcode.

## Writing down where the plan was wrong

The same day I wrote a separate commit that recorded every plan claim that hadn't survived the build, and later those corrections became a patch iteration of their own. It would have been easy to let the code quietly diverge and leave the plans as they were. I wanted the next version's planning to start from what was true, and it's a habit I'd already carried through my other projects: the plan gets corrected, not quietly abandoned.

The build ended with 144 tests passing on the current Presidio release and again on the declared floor, both wheels passing `twine check`, and nothing uploaded. The POSIX append path was still the part of the store I'd never seen run, sitting behind a claim that it was the safe one.
