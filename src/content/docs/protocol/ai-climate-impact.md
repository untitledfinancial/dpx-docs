---
title: AI and Climate Impact
description: What we've actually audited and fixed in the AI tooling we run, what we haven't yet, and why this is an industry-wide problem no single provider solves alone.
---

Running AI has a real, non-trivial environmental cost — energy and water, at both training and inference. That cost doesn't go away because a protocol's documentation doesn't mention it. This page is an attempt to be specific about what has actually been done, what hasn't, and why the larger question needs more than one company's answer.

## A different question from ESG scoring

DPX evaluates the climate risk of the counterparties and assets it settles for — that's the [ESG Oracle](/protocol/esg-oracle) and the climate-related endpoints in the [Intelligence API](/api/intelligence-api). This page is about something else: the environmental cost of running the AI systems that make DPX work, independent of what those systems are evaluating. Conflating the two would overstate what either one covers.

## What's actually been done

Scoped honestly: the following applies to internal operational tooling — sales, compliance monitoring, and reporting automation — not yet to every AI call the live protocol makes on a customer's or agent's behalf.

- **Usage accounting.** Every model call in that tooling now routes through a single instrumented client that tracks cumulative token usage — prompt, completion, and total — plus call counts and cache/coalesce rates. Before this, inference volume was invisible; you can't reduce what you can't see.
- **Duplicate-call elimination.** Identical requests fired concurrently — for example, a scheduled job running the same check across multiple records without waiting between them — are now coalesced into a single API call instead of one per record. A short-TTL cache also catches accidental duplicate fires from overlapping schedules or retries.
- **A real bug fix.** One hourly automation loop was regenerating an identical piece of output for the same unchanged input, every hour, indefinitely — roughly a 20x waste multiplier on that specific task, for as long as the underlying condition persisted. It's fixed: the system now records that output was already generated and skips regeneration until the input actually changes.

None of this is dramatic, and it shouldn't be presented as one. It's the kind of engineering hygiene that should have existed from the start. It's documented here because "here's exactly what was checked and fixed" is more useful than a general statement about caring about sustainability.

## What hasn't been done yet

The AI calls customers and agents actually trigger — synthesis and reasoning inside the Stability Oracle, ESG Oracle, Compliance Oracle, and Reports products — have not yet been through the same audit. That's a stated next step, not a claim being made now.

## This is an industry-wide problem

No settlement protocol, and no single AI infrastructure provider, fixes the aggregate energy and water cost of AI at industry scale by publishing a page like this one. That takes coordination the industry mostly hasn't attempted. Three concrete things worth pursuing across the industry — and worth being held to going forward:

1. **Publish real inference accounting, not sustainability language.** Token counts, call volumes, and energy-intensity estimates — not a paragraph about values in place of numbers.
2. **Treat efficiency techniques as shared infrastructure, not competitive advantage.** Caching, request coalescing, and model right-sizing aren't secrets worth keeping. Withholding them slows the whole industry down for no real benefit to anyone.
3. **Make AI's environmental cost a disclosed line item** — the way carbon accounting became a normal part of financial reporting rather than a special case reserved for sustainability reports.

This isn't fully solved, and any claim that it is should be treated with skepticism — including this one, revisited as the audit above extends further. Working on measurement standards, efficiency techniques, or disclosure norms for AI's environmental footprint and want to compare notes? [Reach out](https://untitledfinancial.com/contact.html). This is a conversation worth having in public, not something to treat as settled.
