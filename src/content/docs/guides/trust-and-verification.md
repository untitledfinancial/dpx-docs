---
title: Trust and verification
description: Why DPX's identity and settlement claims are checkable, not asserted — GLEIF-anchored agent identity and a real, verifiable settlement record.
---

Most claims about agent payment rails are unverifiable — "compliance-grade," "battle-tested," "autonomous." An agent evaluating DPX as infrastructure shouldn't have to take any of that on faith. Two parts of DPX are designed specifically to be checked, not trusted on assertion.

---

## Agent identity is anchored to a real external registry, not self-certified

KYA (Know Your Agent) maps every AI agent's actions back to a legal entity for FATF R.16 (Travel Rule) purposes. The top tier, `VERIFIED`, isn't a DPX-issued claim — it's a live lookup against [GLEIF](https://www.gleif.org), the global registry of Legal Entity Identifiers used across banking and financial regulation worldwide. DPX doesn't decide an agent's owner is who it says it is; GLEIF's Local Operating Units already did that identity verification, independently, and DPX just checks the registry.

| Tier | What it takes | Who vouches for it |
|---|---|---|
| `ANONYMOUS` | Agent name only | Nobody — informational only, $1K/day cap |
| `REGISTERED` | Owner entity + email, self-attested | The agent operator, self-declared, $25K/day cap |
| `VERIFIED` | Active GLEIF LEI | GLEIF — an independent, globally-recognized registry, no platform cap |

This is the same identity infrastructure banks and asset managers already rely on for regulatory reporting — not a DPX-specific trust scheme with no external anchor. Full reference: [KYA — Know Your Agent](/api/compliance-oracle#kya--know-your-agent).

**On AP2 mandates specifically:** DPX also accepts AP2 (Agent Payments Protocol) SD-JWT mandates issued by an agent's own wallet or credentials provider, verified against a trusted-issuer allowlist (`GET /.well-known/ap2.json`). AP2 trust is inherently bilateral — each relying party decides whose mandates to honor — so this path grows as real AP2-issuing platforms are added to that allowlist over time. GLEIF-anchored KYA above doesn't depend on that ecosystem maturing; it's real and checkable today.

**Requesting trusted-issuer status:** any agent, platform, or credentials provider can ask to have its mandates trusted via `POST /trust/request-issuer-status` (status: `GET /trust/request-issuer-status/{requestId}`) — a machine-callable entry point so an agent doesn't need to first find a human to email. This only queues the request for human review; no code path grants trust automatically, and the trusted-issuer allowlist only ever changes through a manual, human-executed deploy — the same standard applied to on-chain transaction signing, extended to the trust boundary.

---

## A real settlement, with a real receipt

DPX completed its first fully end-to-end, non-sandbox agent-to-agent settlement on Base mainnet — two independent agent processes, no shared code path, no shared credentials. Every claim below is independently checkable on a public block explorer, not something you have to take DPX's word for.

**Invoice → authorization → on-chain execution:**

```json
{
  "settlementId": "dpx_549e32f44119abdbf95558edea33b0ca",
  "status": "authorized",
  "oracleStatus": "STABLE", "oracleScore": 77,
  "complianceScreen": { "status": "CLEAR", "amlScore": 24 },
  "aiDecision": "EXECUTE", "aiConfidence": 0.98
}
```

| Step | Tx hash — check it yourself |
|---|---|
| `approve()` | [`0x962454...c14f1`](https://basescan.org/tx/0x962454379c1dca682b2f2cfff0f1d55833619d37fb4e197398ff6b450e3c14f1) |
| `router.settle()` | [`0xd12437...c86d2`](https://basescan.org/tx/0xd12437bcc126b247ed0dc7551f2c3ef1397d4454ddffcfb51f8addbb60ac86d2) |

Anyone — human or agent — can open those links and confirm independently that the receiving address's balance increased by the net settlement amount, and that the ESG redistribution contract's balance increased by exactly the ESG fee portion, atomically, in the same transaction.

A full runnable version of this exact flow is in the [Claude Cookbooks PR](https://github.com/anthropics/claude-cookbooks/pull/796) (`third_party/DPX/agent_to_agent_invoice.ipynb`).

---

## Related

- [Agent-to-agent payments](/guides/agent-to-agent-payments) — the invoice protocol this settlement exercised
- [Compliance Oracle API](/api/compliance-oracle) — full KYA, AP2 mandate, and VoP reference
- [Compliance for agents](/guides/compliance-for-agents) — screening as a single tool call
