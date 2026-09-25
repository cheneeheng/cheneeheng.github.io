---
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/presidio-compliance-stack
title: Nine birthplace codes the registration department never published
description: The NRIC recognizer accepted a range of place-of-birth codes on a recall argument. Reading all 294 rows of the official table showed nine of them don't exist.
banner: /assets/blog/presidio-compliance-stack--nine-codes-jpn-never-published.svg
bannerMobile: /assets/blog/presidio-compliance-stack--nine-codes-jpn-never-published-mobile.svg
bannerAlt: A grid of two-digit NRIC place-of-birth codes from 01 to 99, with the published ones lit and nine gaps inside the foreign-country range
---

The middle two digits of a MyKad number say where the holder was born. `880101-14-5567` is someone born on 1 January 1988 in code `14`, which is Kuala Lumpur. The recognizer in `presidio-malaysia` checks those two digits against a table, because a valid date followed by a real place-of-birth code is most of what separates an NRIC from any other twelve-digit number.

[Last time](/blog/presidio-compliance-stack--a-chain-that-verifies-a-wrong-record) was about the audit side claiming more than it knew. This one is the recognizer side doing the same, in the smallest fix in the project.

## A parenthetical against a sentence

The plan glossed the table as "01–16 states, 21–59 foreign; 17–20 unassigned, reject". The same paragraph also said the code must appear in the official state, territory and foreign-country code table, and that table assigns codes above 59 too: more foreign countries, unknown state, stateless. Taking the parenthetical literally would have rejected real NRICs of people born abroad. At build time on 3 August, the call was to accept `01`–`16` and `21`–`99` and reject `00` and `17`–`20`, on a recall argument that I still think is right for a PII detector: a false negative means a real NRIC goes out unredacted, and a false positive means someone dismisses an odd number flagged in a report. The first costs a lot more than the second.

The source for that table, in the docstring, was the `mykad` package on PyPI.

## Going to the department that issues the card

On 20 August I asked for the table to be checked against the National Registration Department, JPN, which issues the MyKad and publishes the codes itself. Citing a PyPI package as the source for a government table had bothered me, and with 1.0.0 coming I was going back over every claim the packages made anyway.

The state-code page lists 17 records: `01`–`16`, `21`–`59` and `82`, and nothing in `17`–`20`. On being told that narrowing to that page alone would reject citizens born abroad, I pointed at the country-code page for the rest. It reports 294 records, and the first pass read a sample of them and concluded the two tables together span `21`–`99`. That matched the frozenset exactly, so the code didn't change, only the citation, which now names JPN instead of a secondary package.

That conclusion lasted the same day. The country table is paginated, and I asked for all 294 rows to be read instead of a sample. I don't trust a sample when the whole table is sitting right there to be read.

## Thirty codes, not forty

The full parse showed the country table uses only 30 distinct codes: `60`–`68`, `71` and `72` sharing one row labelled *Luar Negara*, `74`–`79`, `83`–`93`, `98` for stateless, and `99` for *Maklumat Tiada*, no information. Nine numbers in `60`–`99` appear in neither table: `69`, `70`, `73`, `80`, `81`, and `94` through `97`. The claim that the two tables span the range was wrong, and the docstring repeating it had been wrong with it. It never shipped on its own: the citation and the narrowing landed as two commits fifteen seconds apart, just after midnight.

So `PB_CODES` became exactly the union of the two published tables: 86 codes, down from 95, held as three constants, one per source. The recall argument still governs everything the evidence leaves open. It doesn't govern a set the issuing authority publishes in full. `880101695678`, with `69` in the middle, now fails structurally.

It was the first behaviour change to a recognizer since v1. A twelve-digit number whose middle pair is one of those nine is no longer detected as `MY_NRIC`, and 14 of the 100 possible digit pairs now fail on structure instead of 5. No corpus case used any of the nine, which I checked before the change rather than after.

A sampled read, a clean match with what the code already did, a citation upgraded to the primary source: every step of the first pass looked like diligence, and the conclusion was still off by nine. The recall argument had been doing honest work on 3 August, when there was no evidence either way. What I take from it is plain enough: I need to look more carefully next time, including at the answers that agree with me.

The risk runs the other way now. If a code JPN has retired, or never listed, still exists on real cards, the recognizer misses it, and there's no evidence either way for the nine; they're simply absent. The docstring names them and says which constant to widen if one ever turns up on a real card. I don't know whether that will ever happen, and I'm not sure how I'd find out, since the package runs on other people's infrastructure and a missed NRIC doesn't announce itself.
