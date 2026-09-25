---
layout: ../../layouts/BlogPost.astro
repo: https://github.com/cheneeheng/presidio-compliance-stack
title: The half of the audit store I had never seen run
description: On release morning the Linux append path finally ran in CI and passed. Then both packages went to PyPI, and the question the project started with is still open.
banner: /assets/blog/presidio-compliance-stack--the-half-i-had-never-seen-run.svg
bannerMobile: /assets/blog/presidio-compliance-stack--the-half-i-had-never-seen-run-mobile.svg
bannerAlt: The audit store's two append paths, Windows and POSIX, both running green in CI on the way to a PyPI release
---

On the morning of 22 August I added Ubuntu to the CI matrix alongside Windows, and it failed straight away, in type-checking. The Windows append function from [the second post](/blog/presidio-compliance-stack--879-of-1000) is defined on every platform and only used on Windows, so mypy on Linux read its body and rejected `ctypes.WinDLL` and friends. The check had only ever passed because it had only ever run on Windows. An early `sys.platform` guard fixed it without a single `type: ignore`.

[Last time](/blog/presidio-compliance-stack--nine-codes-jpn-never-published) ended on nine codes the recognizer now rejects on purpose. This one goes back further, to the thread episode two left hanging: the POSIX append path, the one the plan had assumed was safe all along, had never run on any machine. I'd fixed Windows because I could measure it losing records. The branch that was supposed to need no fixing had nothing behind it except the kernel's documentation.

The tests passed. The full suite, including the test that has four processes append to one file at once and counts what comes out, now runs on every push on both Windows and Ubuntu, across Python 3.11 to 3.13 and both dependency sets. It covers each runner's local disk and nothing else. `O_APPEND` doesn't stay atomic over a network mount, so the docs say one store file per machine, on local storage, and the changelog line that used to call the POSIX path unverified now says what CI actually proves.

Both packages went to PyPI that day, `presidio-audit` first because `presidio-malaysia`'s `audit` extra requires it.

I haven't pursued it much since. Other work caught me up, and the packages have mostly sat there. So the risk the very first registry check named is still the one I haven't tested: whether Malaysian SMEs are PDPA-anxious enough to install a redaction layer, or whether they simply keep real customer data out of AI tools. Everything I built answers what happens once someone installs it, and I haven't gone looking for whether anyone has.
