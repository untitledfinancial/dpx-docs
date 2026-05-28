---
title: Agent-to-Agent Payments
description: DPX as the payment and compliance infrastructure for the autonomous agent economy — micropayments, streaming sessions, ESG-informed routing, and a self-discovering network of agents.
---

The agent economy has a payments problem. When an AI agent needs to pay for data, pay another agent, or settle a task-completion fee, there is no standard programmable rail for it. API keys are not payments. Crypto wallets require human key management. Bank wires require humans at every step.

DPX is already built as that primitive. Every capability an autonomous agent needs — discovery, pricing, compliance, ESG-informed routing, execution, on-chain verification — is available without a human in the loop.

---

## The settlement loop, fully autonomous

An agent interacting with DPX does not require onboarding, a sales call, or human approval. The complete loop runs in five steps:

| Step | Call | What it returns |
|---|---|---|
| Discover | `GET /manifest` | Protocol capabilities, supported assets, contract addresses |
| Price | `GET /quote?amountUsd=X&hasFx=true&esgScore=75` | Binding fee breakdown + `quoteId` (300s TTL) |
| Check conditions | `GET /reliability` | `STABLE / CAUTION / UNSTABLE` + peg deviation + confidence |
| Execute | `POST /settle` | Oracle check → AI synthesis layer reasoning if CAUTION → on-chain settlement |
| Verify | Base Blockscout or `GET /payments/:id` | Immutable on-chain record with all fee components |

No authentication required for pricing and discovery. No API key setup. An agent that has never interacted with DPX before can complete this loop in a single session, from cold start.

---

## Micropayments: agents paying for intelligence

The Intelligence API demonstrates the micropayment model at the smallest scale. Eight endpoints covering macro stress, climate, supply chain, energy transition, geopolitical instability, ESG, and financial shock cascades — payable in USDC via x402 with no account and no signup.

```bash
# An agent pays for macro stress data
# Step 1 — call endpoint, receive 402 with payment requirements
curl https://intelligence.untitledfinancial.com/v1/intelligence/macro-stress

# Step 2 — attach signed USDC payment and retry
import { withPaymentInterceptor } from 'x402-fetch';
const fetchWithPayment = withPaymentInterceptor(fetch, wallet);
const res = await fetchWithPayment(
  'https://intelligence.untitledfinancial.com/v1/intelligence/macro-stress'
);
```

The same pattern scales from sub-dollar data calls to six-figure intercompany transfers. The rail, the compliance layer, and the oracle are identical at every size. An agent managing a portfolio of micro and macro settlements uses the same integration.

---

## Streaming micropayments: continuous consumption

x402 is per-request — pay once, get one response. That works for discrete calls. It breaks down when an agent is consuming a continuous service: a live data feed, a long-running compute task, another agent's persistent attention.

The streaming session model solves this without a persistent WebSocket or an on-chain payment channel. An agent pays upfront for a credit bucket (a session), and a service provider debits units against it as work is delivered.

### How a session works

```
POST /stream/open
  → agent pays capacityUsdc USDC upfront via x402
  → AML screening runs once (not on every tick)
  → returns sessionId + sessionToken

POST /stream/tick          (called by the service, not the payer)
  → debits units from the session balance
  → returns consumed, remaining, status
  → auto-closes when capacity is exhausted

GET /stream/:id
  → current session state: capacity, consumed, remaining, expires

POST /stream/close
  → freezes the session
  → records bilateral edge in the network graph
```

The session token is HMAC-signed at open. The payer shares it with the service provider; the provider uses it to authorize ticks. Only the holder of the token can debit the session. Sessions expire automatically after their TTL (default 24h, max 7 days).

### Unit types

Sessions are denominated in any of four unit types: `second`, `token`, `call`, or `byte`. Rate is set by the payer at open: for example, `ratePerUnit: 0.001, unitType: second` means $0.001 per second of service. The session auto-closes when `consumedUnits × ratePerUnit` reaches `capacityUsdc`.

### Compliance

AML runs once — at `POST /stream/open`. The same compliance depth as a full settlement: sanctions, behavioural profiling, graph risk, and network proximity. Fast-path applies if the pair has earned it. Ticks are pure accounting against the pre-authorized capacity; they don't touch the compliance layer.

A session blocked by AML returns a structured rejection before any payment is captured. A flagged session opens but carries the flag in its AML record — visible in audit.

### Discovery

The `/stream/open` endpoint is listed in `/.well-known/x402` alongside `/vop/verify`. An agent that checks x402 capabilities before settling will find the streaming endpoint, the unit types, and the capacity bounds — everything it needs to open a session with no prior configuration.

---

## What drives autonomous execution

Several layers work together to make DPX genuinely agent-native rather than just "has an API":

**The Stability Oracle acts as the agent's risk manager.** Before executing a large settlement, an agent checks `/reliability`. The oracle returns a score (0–100) synthesised across 10 signal layers — climate, commodities, macro, FX, geopolitical, USD structural health — with plain-language reasoning and a confidence score. The agent applies the same logic a treasury desk would apply manually:

| Oracle status | Score | Agent action |
|---|---|---|
| `STABLE` | 90–100 | Execute immediately |
| `CAUTION` | 75–89 | Execute under $100K — hold larger amounts, retry later |
| `UNSTABLE` | < 75 | Hold — log reasoning, notify sender |

The Settlement Agent applies this automatically on `POST /settle`. For direct integrations, the recommendation is in every quote response.

**The compliance layer runs automatically with no human step.** Every settlement triggers five layers of screening before execution: on-chain enrichment, sanctions check, behavioural profiling against the wallet's own baseline, graph risk from direct counterparty relationships, and network proximity risk propagated from the broader agent ecosystem. Ambiguous decisions route through an AI synthesis layer. Results are attested on-chain. An agent receives a fully compliant settlement or a structured rejection with reasoning — it never routes compliance questions to a human team.

**Verification of Payee runs on every payment.** Before settlement, the counterparty's identity is checked against the GLEIF LEI registry. An exact LEI match is the strongest signal — name matching is a fallback. Gray-zone results include a structured AI assessment of the most likely cause of any discrepancy. FATF Recommendation 16 satisfied.

---

## ESG: counterparty quality, scored in real time

Every counterparty that settles through DPX carries an ESG score — a composite of Environmental, Social, and Governance signals drawn from 8 institutional data sources: World Bank, UN SDG APIs (including human rights and gender equity metrics), ILO occupational data, OSHA enforcement records, SEC EDGAR filings, IMF, OECD, and GLEIF. The score runs from 0 to 100 across three dimensions.

The score reflects real-world counterparty quality, not self-reported data. It updates continuously as the underlying data sources update.

### What the score means for a settlement

Higher-scoring counterparties settle at more favourable terms. Lower-scoring counterparties — those with material environmental violations, governance gaps, or labour compliance issues — settle at terms that reflect the risk they carry. Entities below the redistribution threshold (score 40) trigger an on-chain mechanism: fees generated by that entity are redirected from the general fee pool to a verified impact wallet, enforced by the `ESGRedistribution` contract. This is not discretionary — it runs on every qualifying settlement, auditable on-chain by any party.

Every DPX settlement is a direct contributor to measurable outcomes.

### Before you commit to a counterparty

An agent can query any counterparty's ESG profile before initiating a settlement:

```bash
# Via the compliance oracle — by wallet address
GET https://compliance.untitledfinancial.com/esg/score/wallet/0xCounterpartyWallet

# Via the Intelligence API — with AI narration
GET https://intelligence.untitledfinancial.com/v1/intelligence/esg/0xCounterpartyWallet

# ESG preflight — expected impact for a specific amount
GET https://esg.untitledfinancial.com/preflight?recipient=0xCounterpartyWallet&amountUsd=500000

# Via MCP tool — before calling /quote
get_esg_score(address: "0xCounterpartyWallet")
```

What this enables in practice:

**Counterparty selection.** An agent managing multiple settlement paths can factor ESG profile into route selection before committing. A counterparty with strong governance and low environmental exposure settles differently than a structurally equivalent counterparty without those characteristics. For large or frequent settlements, that difference compounds.

**Timing signals.** The ESG Oracle updates continuously. An agent watching a counterparty's score trend — improving, stable, deteriorating — can factor that into settlement timing the same way it uses the Stability Oracle to time macro conditions.

**Transparency before commitment.** In multi-agent workflows where one agent is selecting a counterparty on behalf of another, surfacing ESG profile at discovery time means the downstream agent knows the full picture before the path is locked in.

### AI narration

Add `?narrate=true` to any ESG score request for a plain-language synthesis of the score — primary pillar drivers, material risk areas, and outlook. The narration draws on qualitative signals beyond the quantitative sources and is returned as a structured `narration` field alongside the scores.

---

## The compliance layer

Five layers run before every payment, in sequence:

| Layer | What it checks |
|---|---|
| 0 — On-chain enrichment | Wallet age, mixer interactions (Basescan → Etherscan fallback) |
| 1 — Sanctions screening | D1-cached sanctions lists, 24h TTL |
| 2 — Behavioural profiling | z-score anomaly vs the wallet's own rolling baseline |
| 3 — Graph risk | Direct counterparty risk propagation (1-hop) |
| 4 — Network proximity risk | Pre-computed signal propagation from the broader agent network (1–2 hops, 72h TTL) |

Signal weights calibrate autonomously — daily stats collection, weekly adjustment via triple-check gate. Weights are maintained per cohort (UNKNOWN / NEW / DEVELOPING / ESTABLISHED) so a first-time wallet and a 500-transaction wallet are screened differently. The calibration system never silences a sanctions-correlated signal and never skips calibration if any signal weight drifts more than 20% from baseline.

Flagged decisions (score 50–74) route through an AI synthesis layer that returns a structured recommendation — `PROCEED_WITH_REVIEW` or `ESCALATE_TO_BLOCK` — with confidence and key factors. The reasoning is baked into the compliance attestation.

Trusted pairs — agent relationships with sufficient bilateral history and no flags — are eligible for fast-path screening, computed nightly. Sanctions screening always runs; the fast path reduces behavioral analysis overhead only.

---

## The agent network layer

Every settlement leaves a trace. Sender, receiver, amount, outcome — recorded, indexed, and analysed. As transactions accumulate, DPX builds a live graph of the agent economy: who transacts with whom, how often, how reliably, and what that implies for counterparties they haven't been screened against yet.

This is the mycelium layer — a network intelligence system that runs beneath every payment, propagating signals and compressing friction for agents that have earned it.

### How it works

The graph is an edge for every bilateral relationship. Each edge carries three properties that update on every transaction:

- **Trust weight** — a function of interaction frequency, transaction cleanliness, and time decay. Old, inactive relationships fade. Recent clean relationships strengthen.
- **Direction ratio** — whether the flow is primarily send, primarily receive, or balanced. Consistent one-way flows with no established pattern are a structural signal, separate from any individual transaction.
- **Flagged transaction count** — how many times either party triggered a HIGH or CRITICAL AML signal. This feeds directly into what happens the next time either agent settles.

### Signal propagation

A flag on one agent updates its graph neighbours — not just the flagged agent. First-degree counterparties receive a decayed proximity risk score (40% of the source signal). Second-degree counterparties receive a smaller signal (15%). The signal does not propagate beyond two hops and expires after 72 hours. If the source agent clears and the network stabilises, the signal expires. The graph is a current read of network state, not a permanent record of association.

### Fast-path trust

An agent pair with a long history of clean bilateral transactions qualifies for reduced screening overhead on subsequent settlements. Sanctions screening always runs. Fast-path eligibility is computed by the daily cron — the payment path reads a single pre-computed flag with no graph traversal at execution time.

### Cluster detection and ecosystem health

Agents that transact heavily with each other form clusters, detected daily using edge weights as connection strength. Clusters with structural anomalies — sudden volume shifts, high concentrations of flagged members, unusual direction ratios — are flagged. The ecosystem's aggregate health is tracked over time. When cluster anomalies exceed a threshold, or average node health drops, the network signals stress before individual transaction screening would surface it.

More agents transacting through DPX means a denser graph, richer context per settlement, faster trust accumulation for healthy pairs, and earlier detection of structural risk. The network improves as it grows.

---

## How agents find DPX — and how DPX finds them

DPX does not rely on a sales pipeline to grow the agent network. It runs a nightly discovery cycle across four channels:

**On-chain pattern detection.** Every USDC transfer on Base is public. DPX scans recent transaction history and flags wallets that move money in programmatic patterns — high frequency, micro amounts, activity at machine timing. These are agents already making payments with no compliance layer.

**x402 endpoint crawling.** Any service that accepts x402 crypto micropayments publishes a public discovery file at `/.well-known/x402`. DPX crawls known AI and agent domains for this file. If a service is accepting x402 payments, it almost certainly needs compliance. DPX makes contact via the same protocol — a structured GET request that shows up in their logs as a legitimate API peer.

**MCP registry monitoring.** New entries in the MCP server registry with payment or finance keywords are automatically flagged. A new tool that touches wallets or settlements is a warm prospect.

**Mycelium graph.** Wallets that have already transacted through DPX — already in the agent graph — but haven't formally connected are surfaced as the highest-priority targets.

Each discovered agent is logged, classified, and contacted via protocol. No email. The network grows itself.

---

## Treasury as autonomous execution

Treasury management is the first institutional use case — and it illustrates why the agent-to-agent framing matters more than the product framing.

DPX is not a treasury management system. It is what a treasury AI agent calls.

The distinction: the treasury agent — built on your preferred AI agent framework, your TMS data, and your company's cash policy — makes the decisions. It monitors cash positions, identifies transfer needs, and determines timing. DPX executes them. The CFO sets policy once. Routine transfers below threshold execute without human approval.

The flow in agent-to-agent terms:

```
Treasury AI Agent
  → monitors cash positions against policy thresholds
  → DPX Stability Oracle: check conditions before initiating
  → DPX Integration API: submit ISO 20022 pain.001 from Kyriba / SAP / Mercury
  → DPX Compliance Oracle: VoP, AML, ESG — automatic, no human step
  → DPX Settlement Router: on-chain execution with full fee breakdown
  → webhook callback: result written back to ERP with txHash
```

Every step in this loop already exists. The Kyriba SPI, SAP TRM integration, and Mercury webhook connector are live. The Compliance Oracle runs automatically. The oracle recommendation (`EXECUTE` / `HOLD`) is machine-readable. The callback closes the loop back to the ERP without human involvement.

The human reviews analytics. The agent executes payments.

---

## What agents can do with DPX today

| Capability | Available |
|---|---|
| Discover protocol capabilities via `/manifest` | Yes — no auth, full agent-critical fields |
| Discover x402 payment requirements | Yes — `GET /.well-known/x402` |
| Get binding fee quotes | Yes — no auth |
| Check stability conditions | Yes — no auth |
| Query ESG profile before settling | Yes — `GET https://esg.untitledfinancial.com/preflight?recipient=0x...&amountUsd=X` |
| Query ESG score for any wallet address | Yes — via MCP `get_esg_score` or Intelligence API |
| Execute settlement (sandbox) | Yes — no auth, x402 bypassed |
| Execute settlement (live) | Yes — x402 USDC payment, no API key required |
| Pay for intelligence via x402 micropayment | Yes — USDC on Base, per-call pricing |
| Receive settlement results via webhook | Yes — HMAC-SHA256 signed callbacks |
| Verify on-chain | Yes — Base Blockscout or `cast call` |
| Connect via MCP | Yes — 13 tools, `npx @untitledfinancial/dpx-mcp` |
| Network proximity risk screening | Yes — propagated signals from flagged neighbours surface in AML layer |
| Fast-path routing for trusted pairs | Yes — earned by bilateral history; computed nightly, applied at settlement |
| Open a streaming micropayment session | Yes — `POST /stream/open` with x402 payment; AML runs once at open |
| Tick units against a session | Yes — `POST /stream/tick`; session token auth; auto-close on exhaustion |
| Query session state | Yes — `GET /stream/:id`; capacity, consumed, remaining, status |
| Agent discovery — on-chain pattern detection | Yes — nightly Base USDC scan for programmatic wallet patterns |
| Agent discovery — x402 crawl | Yes — nightly crawl of known AI/agent domains for x402 endpoints |
| Agent discovery — MCP registry watch | Yes — nightly GitHub search for new payment/finance MCP tools |
| Agent discovery — mycelium graph | Yes — surfaces high-value wallets already in the network graph |

---

## Start building

- [Agent Quick Start](/agent-quickstart) — the complete 5-step settlement loop with code
- [MCP Server](/integrations/mcp) — connect to DPX from any MCP-compatible host
- [Intelligence API](/api/intelligence-api) — x402 micropayment data endpoints
- [LangChain Tools](/integrations/langchain) — drop-in Python tools for any LangChain agent
- [Sandbox](/sandbox) — real oracle checks, real fee calculations, no on-chain execution
