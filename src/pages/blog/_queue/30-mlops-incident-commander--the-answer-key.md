---
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/mlops-incident-commander
title: My agents weren't allowed to see the answer key, so I wrote it into their memory
description: The eval harness is the only signal for tuning the incident loop, which only works if ground truth stays hidden. A month after release I found postmortem memory handing it back.
banner: /assets/blog/mlops-incident-commander--the-answer-key.svg
bannerMobile: /assets/blog/mlops-incident-commander--the-answer-key-mobile.svg
bannerAlt: A scorecard fed by hidden ground truth, with a dashed path where postmortem memory quietly carries the answer back to the diagnosis agent
---

[Last time](/blog/mlops-incident-commander--trusted-to-notice) I ended on the confidence number that gates auto-execution, and on the scorecard being the only thing that could tell me whether it means anything. That only holds if the agents can't see the answers, and for about a month they could.

## The one rule that makes the numbers mean anything

The injection harness knows the truth about every fault it injects. Each injection row carries a `ground_truth_fault`, and each deploy row carries `is_faulty`. The diagnosis agent never sees either. When it calls the deploys tool, the function that turns a row into a dict leaves `is_faulty` out, because otherwise the agent could read the answer instead of working it out. The only code allowed to read ground truth is the eval runner, and only to score.

The eval harness is the piece nobody would notice, because nothing in the normal runtime calls it. It's a labelled suite of 13 cases: three severities for each of the four faults, plus one no-fault control that scores a false positive if any incident opens. Bad deploy has no magnitude to vary, so its three cases are the same case three times. The runner resets the system, injects each fault into the live pipeline, waits up to ten minutes for an incident, waits up to five more for the accepted hypothesis, and scores it against the label. The run collapses to four numbers: detection recall, diagnosis accuracy, mean time to detect, and mean cost per incident.

Because detection has no thresholds, that scorecard is the only feedback there is. You tune the monitor prompt against recall and the false-positive control, not against one window that looked wrong. The price of withholding ground truth is that every new tool has to be checked for leaks, or the scores quietly stop meaning anything.

I'll be honest about why the harness is there. It was mostly for the portfolio demo. A loop that detects and diagnoses is a nice thing to show, and a loop that grades itself with a recall figure and a cost per incident is a better one.

## The leak was in the memory

The leak turned up on 26 August, somewhere I hadn't thought to check, because it wasn't a tool. Claude flagged it while we were going through the codebase together. When an incident resolves, the postmortem agent is handed the injection's ground truth, and its prompt requires a section called "Ground truth vs diagnosis". That's the right thing for a human reading the postmortem, since it's the record of whether the agents got it right. Then the postmortem is embedded into pgvector, and on every later incident the diagnosis agent gets the three most similar postmortems as advisory context. So diagnosis could read a past incident's label instead of inferring it, and a run of similar drills would score better for the wrong reason. The fix's commit message puts it in one line: leaking it "makes the eval scorecard's diagnosis accuracy measure recall, not inference."

There were two fixes. Drop ground truth from postmortems entirely, or keep it in the stored body and strip it on the way into diagnosis. I kept it, because deleting the section would remove the one thing a human actually wants from a demo postmortem in order to fix a leak that only exists on the retrieval path. `strip_ground_truth()` cuts from that heading to the end of the document, which works because it's the last of five sections.

It isn't airtight. A model that renames the heading defeats the regex. Stripping the last section isn't enough on its own either, because the postmortem agent is given the truth and could restate it under Root cause or Evidence, so the prompt now confines ground truth to that one section. Both halves rest on the model following its prompt.

## A second wrong answer key

The same day turned up a quieter version. The postmortem looked up its ground truth with `get_latest_injection`, the newest injection anywhere, with no link to the incident. Approval is asynchronous, so a postmortem written after the next drill had started reported the wrong fault as that incident's truth, and an incident the monitor opened on its own inherited whatever was injected last. It now takes the injection whose time span contains the incident's open time, or nothing.

So by the end of August I'd closed two holes in the thing that grades the agents, and I still hadn't seen it print a single number.