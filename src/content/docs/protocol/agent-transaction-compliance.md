---
title: Compliance for Autonomous Agent Transactions
description: Why compliance-as-precondition, not compliance-as-audit, is the correct architecture for transactions with no human in the loop — and how DPX implements it end to end.
---

Every existing payment compliance regime — card network fraud review, bank AML screening, correspondent-banking sanctions checks — was designed around a transaction a human authorized. That design assumes recourse: a human can call their bank, dispute a charge, or have a compliance officer flag something after the fact. Most of that infrastructure runs downstream of authorization, not as a precondition of it.

An autonomous agent transaction has no equivalent recourse moment. There is no human to call. Authorization is a cryptographic mandate check, not a phone call. If compliance runs downstream of settlement the way it does on most existing rails, "downstream" for an agent-initiated payment can mean the funds already moved before anyone — human or system — had a chance to object.

**This page describes the architectural choice DPX made instead: compliance is a precondition of settlement, not an audit trail attached to it afterward.** A settlement that fails its compliance check does not happen. There is no separate step where a human reviews it later.

## Precondition vs. audit — the concrete difference

| | Compliance-as-audit (most existing rails) | Compliance-as-precondition (DPX) |
|---|---|---|
| When it runs | After authorization, often asynchronously | Before settlement executes, synchronously |
| What a failure does | Flags the transaction for review; funds may have already moved | Blocks settlement outright; funds never move |
| Who resolves a bad outcome | A human compliance officer, hours or days later | The check itself, at the moment of the attempted transaction |
| Fits an autonomous agent? | Assumes a human is available to review the flag | Designed for zero human involvement by default |

## How this is actually implemented

Every settlement DPX processes runs the counterparty through the Compliance Oracle's AML Adaptive Oracle and Verification of Payee (VoP) check **before** the settlement router executes. A `BLOCKED` result fails the settlement outright — not a flag, not a queue, a hard stop. A `REVIEW` result holds it. If the oracle itself is unreachable, the settlement fails closed rather than proceeding unscreened. None of this is optional per-integration configuration; it is wired into the settlement path itself.

Layered on top of that screening is the **KYA (Know Your Agent) mandate system** — a spend cap, counterparty whitelist, and currency-pair scope that a human principal sets once for an agent acting on their behalf. The mandate is checked at the same precondition point as the compliance screen: a settlement that would exceed a mandate's notional cap or reach an unlisted counterparty is held, regardless of what the compliance screen itself concluded.

## Making the attestation portable, not just present

A compliance check that only DPX can verify is still a form of "trust us" — useful internally, but not something a third party (another platform, another agent's own compliance layer) can independently confirm. DPX's KYA credentials are now issued in two forms:

- The original HMAC-signed attestation, verifiable only by DPX itself.
- A [W3C Verifiable Credential](https://www.w3.org/TR/vc-data-model-2.0/), signed with an asymmetric key resolvable via a real [`did:web`](https://w3c-ccg.github.io/did-method-web/) document at `compliance.untitledfinancial.com/.well-known/did.json`. Any third party can verify this credential independently — no callback to DPX required.

The same principle extends to the settlement record itself: every settlement produces a structured, independently-verifiable record — on-chain transaction hash, oracle status and score at time of settlement, ESG score, and the compliance attestation that permitted it — rather than a private log only DPX can produce on request.

## Why this matters now, not eventually

Regulators have not yet written rules specific to autonomous-agent transaction oversight — the frameworks in force today (FATF R.16, GENIUS Act, MiCA) were drafted assuming a human-initiated transaction model, the same assumption underlying the audit-based compliance systems described above. When agent-initiated volume reaches a scale that draws direct regulatory attention — it is already a measurable, fast-growing share of B2B settlement — the question "how was this transaction supervised with no human involved" will need a concrete architectural answer, not a policy statement. A synchronous, precondition-based, independently-verifiable compliance architecture is that answer. Retrofitting an audit-based system to behave this way after the fact is a materially larger undertaking than building it this way from the start.

## Further reading

- [FATF & Travel Rule](/protocol/fatf-compliance) — the specific FATF R.15/R.16 mechanics
- [Regulatory Positioning](/protocol/regulatory) — MiCA, GENIUS Act, Basel III coverage
- [Trust and Verification](/guides/trust-and-verification) — on-chain settlement receipts and how to check them yourself
