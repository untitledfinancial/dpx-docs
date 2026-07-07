---
title: Agent Quick Start
description: The complete autonomous settlement loop — discover, quote, gate on oracle conditions, pay via x402, execute on-chain. No onboarding, no API key, no human step.
---

DPX is the payment and settlement layer for the agentic internet. Any agent can discover DPX, get a binding fee quote, check oracle conditions, and execute a cross-border settlement end-to-end — no onboarding, no API key, no human step. The x402 USDC payment IS the authorization: agents pay the gross settlement amount and execution proceeds.

## What you're working with

The DPX settlement stack has three layers:

| Layer | What it does |
|---|---|
| **Stability Oracle** | 9-layer signal pipeline. Returns `STABLE / CAUTION / UNSTABLE` with confidence score and reasoning. Agents check this before every large settlement. |
| **Settlement Agent** | Cloudflare Worker. Receives payment instructions, applies oracle conditions and compliance checks, and calls the router. |
| **DPXSettlementRouter v2.0** | On-chain contract (Base). Accepts any whitelisted ERC-20 (USDC, EURC, USDT). Enforces fees, sends net to recipient. |

**No DPX token required in the payment flow.** The router accepts USDC, EURC, USDT — whichever stablecoin you're settling in. 1:1 is maintained by the stablecoin issuers (Circle, etc.). The Stability Oracle monitors FX stress and the Settlement Agent holds during CAUTION periods.

---

## Minimum path — 3 calls

If you are an autonomous agent evaluating DPX, these three calls are sufficient to reach a first sandbox settlement. No payment, no API key, no account.

**Call 1 — read the manifest:**

```bash
GET https://agent.untitledfinancial.com/manifest
```

Read: `routerAddress`, `tokenAddresses`, `oracle`, `supportedAssets`

**Call 2 — preview the settlement:**

```bash
GET https://agent.untitledfinancial.com/flow-estimate?amount=100000&from=USD&to=USD&recipient=0x<your-address>
```

Read: `grossAmountRaw` (USDC micro-units), `routerAddress`, `tokenAddress`, execution steps

**Call 3 — sandbox settle (no payment, no on-chain execution):**

```bash
curl -X POST https://agent.untitledfinancial.com/settle \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100000,
    "sourceCurrency": "USD",
    "destinationCurrency": "USD",
    "recipientAddress": "0x<your-address>",
    "sandbox": true
  }'
```

Read: `status` (returns `sandbox`), `execution.grossAmountRaw`, `execution.quoteIdBytes32`, `oracleStatus`, `aiDecision`, `aiConfidence`

For the full settlement loop with oracle gating, x402 payment, and on-chain execution, continue below.

---

## The 5-step settlement loop

### Step 1 — Discover

Two discovery endpoints, depending on the framework:

```bash
# A2A spec (Google ADK, CrewAI, LangGraph) — polls this for capabilities + input schemas
GET https://agent.untitledfinancial.com/.well-known/agent.json

# Full protocol manifest — contract addresses, fee config, oracle endpoints
GET https://agent.untitledfinancial.com/manifest
```

The A2A Agent Card includes JSON input schemas for every skill so orchestrating agents can construct calls programmatically. The `/manifest` covers contract addresses, fee config, and oracle endpoints. Cache both — they only change on protocol upgrades.

```json
{
  "name": "DPX Settlement Agent",
  "version": "2.1.0",
  "capabilities": ["quote", "settle", "webhook", "status", "x402"],
  "supportedAssets": ["USDC", "EURC", "USDT"],
  "oracle": "https://stability.untitledfinancial.com",
  "network": "Base (chainId 8453)",
  "docs": "https://docs.untitledfinancial.com/agent-quickstart"
}
```

---

### Step 2 — Get a fee quote

```bash
GET https://agent.untitledfinancial.com/quote?amountUsd=1000000&hasFx=true&esgScore=75
```

Returns a full fee breakdown. The `quoteId` is valid for **300 seconds** and used for on-chain verification.

```json
{
  "quote": {
    "quoteId": "dpx_a1b2c3d4e5f6...",
    "validForSeconds": 300,
    "fees": {
      "core":    { "bps": "...", "usd": "..." },
      "fx":      { "bps": "...", "usd": "..." },
      "esg":     { "bps": "...", "usd": "...", "score": 75 },
      "license": { "bps": "...", "usd": "..." },
      "total":   { "bps": "...", "pct": "...", "usd": "..." }
    },
    "settlement": {
      "netUsd": "...",
      "grossUsd": 1000000
    }
  },
  "stabilityScore": { "overall": 87, "status": "CAUTION" },
  "intelligence": {
    "reasoning": "Yield curve showing mild inversion signal. FX markets stable. Recommend proceeding for amounts under $100K.",
    "confidence": 0.84,
    "outlook": "STABLE"
  },
  "recommendation": "EXECUTE"
}
```

---

### Step 3 — Gate on oracle conditions

Oracle status drives the settlement decision:

| Status | Score | Agent action |
|---|---|---|
| `STABLE` | 90–100 | Execute immediately |
| `CAUTION` | 75–89 | Execute under $100K — hold larger amounts |
| `UNSTABLE` | < 75 | Hold — notify sender, retry later |
| `peg.deviationBps >= 50` | — | Hold regardless of score |

The Settlement Agent applies this logic automatically when you call `/settle`. For direct integration, check `recommendation` in the quote response.

---

### Step 4 — Execute via the Settlement Agent (sender-funded model)

DPX is a **sender-funded** settlement rail. The Settlement Agent returns oracle authorization, a `quoteId`, and on-chain execution parameters — then you execute on-chain yourself. DPX never holds USDC or pays gas on your behalf.

**Pre-payment: estimate the full settlement without touching x402**

```bash
# Free. No auth. Returns accurate fees, FX rate, and execution steps.
GET https://agent.untitledfinancial.com/flow-estimate?amount=1000000&from=USD&to=USD&recipient=0xYourAddress
```

The response includes exact `grossAmountRaw` in USDC micro-units, the router address, and step-by-step contract calls. Use this to build your internal approval workflow or show your team what the integration produces before going live.

**Non-USD source currencies are supported.** Pass `from=BRL` (or any ECB-listed currency) and the settlement agent fetches a live FX rate, converts to USD-equivalent for oracle scoring, and returns the conversion in the response.

```bash
GET https://agent.untitledfinancial.com/flow-estimate?amount=50000&from=BRL&to=USD
# Returns: grossAmount in USD, fxConversion.rate, fxConversion.source, execution steps
```

**Live settlements use x402** — no API key, no account. The intelligence fee payment IS the authorization for the oracle signal and `quoteId`.

**First call to `/settle` — returns a 402 with a value preview:**

```bash
curl -X POST https://agent.untitledfinancial.com/settle \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000000,
    "sourceCurrency": "USD",
    "destinationCurrency": "USD",
    "recipientAddress": "0xRecipientWalletAddress",
    "referenceId": "INV-2026-001"
  }'
```

**Response — 402 with intelligence preview:**

```json
{
  "x402Version": 1,
  "accepts": [{
    "scheme": "exact",
    "network": "base-mainnet",
    "maxAmountRequired": "500000",
    "resource": "https://agent.untitledfinancial.com/settle",
    "payTo": "0xFeeCollectorAddress",
    "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
  }],
  "intelligencePreview": {
    "whatYouGet": [
      "Oracle stability score (0–100) for your settlement corridor",
      "AI-synthesized risk reasoning with ESG overlay",
      "Binding quoteId (300s TTL) authorizing on-chain router.settle()",
      "Execution params: routerAddress, grossAmountRaw, quoteIdBytes32"
    ],
    "fee": {
      "amountUsdc": "$0.5000",
      "basisPoints": "0.05 bps",
      "pricingNote": "0.5 bps of settlement amount, floor $0.001, cap $5.00"
    },
    "sandboxOption": "Add \"sandbox\": true to request body to test without payment."
  }
}
```

The `intelligencePreview` shows exactly what you get on payment before you commit. The 402 is a preview, not a wall.

**Retry with X-PAYMENT header:**

```typescript
import { withPaymentInterceptor } from 'x402-fetch';
import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';

const wallet = createWalletClient({ chain: base, transport: http() });
const fetchWithPayment = withPaymentInterceptor(fetch, wallet);

const result = await fetchWithPayment(
  'https://agent.untitledfinancial.com/settle',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: 1000000,
      sourceCurrency: 'USD',
      destinationCurrency: 'USD',
      recipientAddress: '0xRecipientWalletAddress',
      referenceId: 'INV-2026-001',
    }),
  }
);
```

**Response — oracle authorization + execution params:**

```json
{
  "settlementId": "dpx_7f8a9b2c...",
  "status": "authorized",
  "execution": {
    "routerAddress": "0xe333551E18ef0471A71d7e8e761212766aa5AD4f",
    "tokenAddress":  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "grossAmountRaw": "1000000000000",
    "recipient": "0xRecipientWalletAddress",
    "isCrossCurrency": false,
    "quoteIdBytes32": "0xabc123...",
    "quoteExpiresAt": 1718400300000,
    "abi": ["function settle(address,uint256,bool,bytes32,address) external returns (uint256)"]
  },
  "netAmount": 985000,
  "grossAmount": 1000000,
  "feesTotal": 15000,
  "oracleStatus": "STABLE",
  "oracleScore": 91,
  "esgScore": 75,
  "reasoning": "Conditions stable. Executing immediately.",
  "aiDecision": "EXECUTE",
  "aiConfidence": 0.91,
  "aiModel": "claude-haiku-4-5",
  "sourceCurrency": "USD",
  "destinationCurrency": "USD",
  "escalated": false,
  "sandboxMode": false
}
```

**You then execute on-chain yourself:**

```typescript
// 1. Approve the router to spend USDC
await usdc.approve(execution.routerAddress, BigInt(execution.grossAmountRaw));

// 2. Call router.settle() — you pay gas
await router.settle(
  execution.recipient,
  BigInt(execution.grossAmountRaw),
  execution.isCrossCurrency,
  execution.quoteIdBytes32,
  execution.tokenAddress
);
```

The `quoteId` is valid for 300 seconds. If it expires before on-chain execution, call `/settle` again.

:::note[Sandbox mode]
Set `"sandbox": true` in the request body to skip x402 entirely. Full oracle checks, accurate fee calculations, execution params returned — no on-chain execution, no payment required.
:::

---

### Step 5 — Verify on-chain

Every settled transaction is verifiable:

```bash
# Base Blockscout (Base Mainnet)
https://base.blockscout.com/tx/<txHash>

# Or query the router directly
cast call 0x<ROUTER_V2_ADDRESS> \
  'previewFees(uint256,bool,address,address)' \
  1000000000000 false 0x0...0 0x<USDC_ADDRESS> \
  --rpc-url https://mainnet.base.org
```

The on-chain `Settlement` event includes: sender, recipient, token, gross amount, all fee components, net amount, ESG score, and the `quoteId` — a permanent immutable audit trail.

---

## Settlement status reference

| `status` | HTTP | Meaning |
|---|---|---|
| `authorized` | 200 | AI approved with confidence ≥ 0.70. Execute on-chain using the `execution` params. |
| `sandbox` | 200 | Sandbox mode — same response shape, no on-chain execution. |
| `held` | 202 | AI decided HOLD — oracle conditions unfavorable. Retry later. |
| `review` | 202 | AI approved but confidence < 0.70. Settlement held for human review. `escalated: true`. |
| `failed` | 422 | AI decided REJECT — invalid parameters or compliance block. |

### Confidence-based escalation

When the AI synthesis layer approves a settlement but its confidence score falls below 0.70, the settlement is held with `status: "review"` rather than executing autonomously. This covers borderline cases — unfamiliar corridors, unusual amounts, degraded oracle signal — where the AI has enough information to approve but not enough to act without review.

To receive a webhook notification when this happens, include `escalationWebhook` in the request body:

```bash
curl -X POST https://agent.untitledfinancial.com/settle \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 750000,
    "sourceCurrency": "USD",
    "destinationCurrency": "NGN",
    "recipientAddress": "0xRecipientAddress",
    "escalationWebhook": "https://your-system.com/dpx/review"
  }'
```

On escalation, DPX sends a POST to your URL:

```json
{
  "event": "settlement.review_required",
  "settlementId": "dpx_7f8a9b2c...",
  "aiConfidence": 0.63,
  "aiDecision": "EXECUTE",
  "reasoning": "Corridor score 58/100, elevated CBN controls. Approved but flagged for review due to low confidence.",
  "amount": 750000,
  "corridor": "USD→NGN",
  "timestamp": "2026-07-05T04:00:00.000Z"
}
```

The settlement does not execute until your system acts. The `settlementId` is stored in D1 with `status: "review"`.

---

## Intelligence endpoints — free, no auth

These endpoints return meaningful data before any payment is required. Use them during evaluation, internal review, or integration scoping.

| Endpoint | Purpose |
|---|---|
| `GET /flow-estimate` | Full synthetic settlement preview with accurate fees, FX rate, and on-chain execution steps. No payment. |
| `GET /corridor-intel?from=BRL&to=USD` | Live FX rate (ECB via Frankfurter) + DPX-observed corridor signal + regulatory context for the corridor. |
| `GET /corridor-compare?corridors=BRL-USD,EUR-USD,GBP-USD` | Side-by-side multi-corridor comparison with live FX rates. |
| `GET /feedback-signal?from=USD&to=EUR` | 30-day settlement history for a corridor: hold rate, reject rate, avg oracle score, avg AI confidence. Omit params for all corridors. |
| `GET /stream-check?amount=50000&from=USD&to=EUR` | SSE stream — real-time AI reasoning tokens for a pre-flight settlement assessment. No oracle data fetched. |
| `GET /anomaly-log` | Recent systemic hold cluster alerts — triggered when 50%+ hold rate across 3+ corridors in a 2h window. |
| `GET /metrics` | Live D1-backed analytics — flow-check count, settlement volume, AI synthesis usage. |
| `GET /session` | Your own call sequence for today, keyed by anonymized IP hash. Useful for debugging integration order. |
| `GET /quote` | Binding fee quote with oracle signal — 300s TTL. |
| `GET /health` | Worker liveness. |
| `GET /manifest` | Full protocol capabilities, contract addresses, oracle endpoints. |
| `GET /.well-known/agent.json` | A2A Agent Card — full skill list with JSON input schemas. |
| `GET /agent/:address` | Agent memory profile for a sender wallet — track record, corridors, risk profile. |

### Corridor feedback signal

The Settlement Agent's AI reasoning layer is informed by historical corridor performance. Before every decision, it reads the last 30 days of settlement outcomes for that corridor from D1 — hold rate, reject rate, avg oracle score, avg confidence — and factors this into its reasoning.

You can query the same signal directly:

```bash
# Single corridor
GET https://agent.untitledfinancial.com/feedback-signal?from=USD&to=BRL

# All corridors
GET https://agent.untitledfinancial.com/feedback-signal
```

```json
{
  "corridor": "USD→BRL",
  "window": "30d",
  "n": 12,
  "avg_score": 44.2,
  "avg_conf": 0.67,
  "held": 5,
  "rejected": 1,
  "escalated": 2
}
```

This is the same signal injected into the AI prompt before each settlement decision — the longer DPX runs on a corridor, the more calibrated its decisions become.

**Corridor intelligence example — BRL→USD:**

```bash
GET https://agent.untitledfinancial.com/corridor-intel?from=BRL&to=USD
```

```json
{
  "corridor": "BRL-USD",
  "fxRate": {
    "rate": 0.19669,
    "pair": "BRL/USD",
    "source": "Frankfurter / ECB",
    "amountExample": { "send": "1 BRL", "receive": "0.1967 USD" }
  },
  "marketContext": {
    "settlementMethods": ["PIX (domestic BRL leg)", "SWIFT (international USD leg)"],
    "pixNote": "PIX handles the domestic BRL disbursement leg. DPX provides the USD settlement authorization rail.",
    "regulatoryEnv": "BCB-regulated. IOF tax applies (0.38% on FX operations)."
  },
  "regulatoryDisclosure": {
    "jurisdiction": "Brazil",
    "summary": "DPX is US-incorporated and not licensed by the Banco Central do Brasil (BCB). Brazilian users are responsible for BCB, COAF, and RFB compliance. BCB Resolution 561 restricts stablecoin use by eFX operators from October 1, 2026.",
    "detailsUrl": "https://docs.untitledfinancial.com/legal/brazil-regulatory-notice",
    "keyDeadlines": [
      "2026-10-01 — BCB Res. 561: eFX operators may not use stablecoins for cross-border settlement without SPSAV authorization",
      "2026-10-30 — BCB Res. 520: authorized Brazilian VASPs prohibited from transacting with non-authorized foreign providers"
    ]
  }
}
```

---

## Natural language settlement — POST /nl

Any agent, voice interface, or human can submit settlements in plain English. The AI synthesis layer parses intent, extracts fields, and routes through the full settlement flow — including the x402 gate.

```bash
curl -X POST https://agent.untitledfinancial.com/nl \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: <x402-receipt>" \
  -d '{ "text": "Pay $50,000 to 0xABC123 for the Q2 Acme invoice", "sandbox": true }'
```

The response includes the standard settlement result plus the NL parse metadata:

```json
{
  "settlementId": "dpx_...",
  "status": "sandbox",
  "nlParsed": {
    "originalText": "Pay $50,000 to 0xABC123 for the Q2 Acme invoice",
    "parsed": {
      "amount": 50000,
      "sourceCurrency": "USD",
      "destinationCurrency": "USD",
      "recipientAddress": "0xABC123",
      "purpose": "invoice-payment",
      "referenceId": "Q2 Acme invoice"
    },
    "parseConfidence": 0.95,
    "parseNotes": "Invoice reference inferred from context"
  }
}
```

If the parse extracts a valid amount and recipient address, the full settlement flow runs. If either is missing, a 400 is returned with the partial parse and a specific hint on what to add to the instruction.

---

## Chain-of-thought audit trail

Every settlement records a structured CoT trace — five reasoning steps the AI synthesis layer took before reaching a decision. This is included in the `/settle` and `/nl` response and logged to D1.

```json
{
  "cotTrace": {
    "signalAssessment": "Oracle score 78/100 = STABLE; peg deviation <50 bps; outlook IMPROVING.",
    "corridorCheck": "Domestic USD→USD; no FX risk; no cross-border regulatory friction.",
    "complianceOverlay": "No sanctions flags; ESG neutral for domestic payment; AML signals clear.",
    "confidenceCalculation": "High confidence from STABLE score, peg compliance, domestic corridor, routine purpose.",
    "decisionRationale": "Score ≥70 + peg OK + domestic = EXECUTE per framework step 3."
  }
}
```

Steps are also written to the `cot_steps` D1 table keyed by `settlement_id`, making each AI decision fully auditable by compliance officers without replaying the original transaction.

This satisfies MiCA Art. 13 explainability requirements: each decision has a machine-generated, step-by-step justification traceable to specific signals.

---

## Autonomous hold retry

When a settlement is held (oracle score too low or peg stressed), pass `autoRetry: true` to register the hold with a Durable Object that monitors oracle conditions every 5 minutes.

```json
{
  "amount": 250000,
  "sourceCurrency": "USD",
  "destinationCurrency": "EUR",
  "recipientAddress": "0x...",
  "autoRetry": true,
  "retryWebhook": "https://your-system.com/dpx/retry-ready",
  "retryThreshold": 70,
  "maxRetries": 12
}
```

The response includes a `retryId`:

```json
{
  "status": "held",
  "retryId": "do-abc123...",
  "reasoning": "Oracle score 58/100 — CAUTION for $250,000 transaction."
}
```

When the oracle score clears `retryThreshold`, the webhook fires:

```json
{
  "event": "settlement.retry_ready",
  "settlementId": "dpx_...",
  "currentScore": 74,
  "retryThreshold": 70,
  "originalRequest": { "amount": 250000, ... },
  "hint": "Resubmit POST /settle with originalRequest to complete settlement."
}
```

If conditions never clear within `maxRetries` attempts (default 12 = ~1 hour at 5-min intervals), the webhook fires with `event: settlement.retry_exhausted`.

---

## Confidence calibration

The AI escalation threshold (the confidence score below which a settlement is flagged for human review) is calibrated weekly per corridor from observed D1 outcomes.

The calibration reads 30 days of settlement data, computes the confidence distribution at authorized vs. held/review outcomes per corridor, and sets a threshold that minimizes false escalations while catching genuinely uncertain decisions.

Calibrated thresholds are stored in KV (`threshold:{from}:{to}`) and read on every settlement. Corridors with fewer than 10 observations fall back to the 0.70 default.

To run calibration manually (requires `INTERNAL_CRON_KEY`):

```bash
curl -X POST https://agent.untitledfinancial.com/_cron/calibrate \
  -H "X-Internal-Key: <key>"
```

---

## SSE streaming reasoning

For integrations that support streaming, `GET /stream-check` emits real-time Claude reasoning tokens via Server-Sent Events. This is a preview endpoint — it reasons from general corridor knowledge without fetching live oracle data.

```bash
curl -N "https://agent.untitledfinancial.com/stream-check?amount=50000&from=USD&to=EUR"
```

```
data: {"event":"start","amount":50000,"from":"USD","to":"EUR"}
data: {"event":"token","text":"Oracle score pending, but USD-EUR..."}
data: {"event":"token","text":"is a G10 corridor with historically..."}
data: {"event":"done","hint":"Submit POST /settle for a live oracle-backed decision."}
```

---

## Webhook integration

Any system (TMS, ERP, n8n, Zapier) can trigger DPX via webhook with no custom code. The agent auto-maps common field names:

```bash
curl -X POST https://agent.untitledfinancial.com/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "currency": "USD",
    "destination_currency": "USD",
    "recipient": "0xRecipientWalletAddress",
    "reference_id": "INV-2026-001",
    "type": "vendor-payment"
  }'
```

Accepted field names → [see full mapping](/integrations/rest-api).

---

## Sandbox mode

All endpoints support sandbox mode: real oracle checks, real fee calculations, no on-chain execution.

```bash
# Add sandbox=true to any settle request
curl -X POST https://agent.untitledfinancial.com/settle \
  -d '{ ..., "sandbox": true }'
```

Or use the Stability Oracle quote endpoint directly:
```bash
GET https://stability.untitledfinancial.com/quote?amountUsd=1000000&hasFx=true&esgScore=75&sandbox=true
```

---

## Direct on-chain execution (advanced)

For agents that call the router directly without the Settlement Agent:

```typescript
import { ethers } from 'ethers';

const ROUTER_ABI = [
  'function settle(address recipient, uint256 grossAmount, bool isCrossCurrency, bytes32 quoteId, address tokenAddress) external returns (uint256 netAmount)'
];

const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const router = new ethers.Contract(ROUTER_V2_ADDRESS, ROUTER_ABI, wallet);

// Approve USDC spend first
const usdc = new ethers.Contract(USDC_ADDRESS, ['function approve(address,uint256) external'], wallet);
await usdc.approve(ROUTER_V2_ADDRESS, grossAmountRaw);

// Execute settlement
const tx = await router.settle(
  recipientAddress,
  grossAmountRaw,        // in USDC units (6 decimals)
  isCrossCurrency,
  quoteIdBytes32,
  USDC_ADDRESS
);

const receipt = await tx.wait();
console.log(receipt.hash);
```

---

## AI origination modes

The settlement agent supports four modes where AI drives the payment decision and optionally the execution — no human step required per transaction.

### `execute: true` — agent-initiated Mercury payment

Pass `execute: true` with Mercury credentials on any `POST /settle` or `POST /nl` call. If the AI approves, the agent initiates the Mercury ACH or wire immediately and returns the Mercury payment ID alongside the settlement receipt. The client's Mercury account is debited — DPX never holds funds.

```bash
curl -X POST https://agent.untitledfinancial.com/settle \
  -H "X-PAYMENT: $PAYMENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25000,
    "sourceCurrency": "USD",
    "destinationCurrency": "USD",
    "recipientAddress": "0xABC...",
    "execute": true,
    "mercuryAccountId": "your-mercury-account-id",
    "mercuryRecipientId": "saved-mercury-recipient-id",
    "mercuryPaymentMethod": "ach"
  }'
```

```json
{
  "status": "authorized",
  "originationStatus": "initiated",
  "mercuryExecution": {
    "paymentId": "mercury-pay-abc123",
    "status": "pending"
  },
  "settlementId": "dpx-settle-xyz",
  "aiDecision": "EXECUTE",
  "aiConfidence": 0.91
}
```

Works the same on `POST /nl` — parse intent, approve, execute, done:

```bash
curl -X POST https://agent.untitledfinancial.com/nl \
  -H "X-PAYMENT: $PAYMENT_TOKEN" \
  -d '{
    "text": "Pay $10,000 to 0xABC... for Q2 vendor invoice",
    "execute": true,
    "mercuryAccountId": "your-account-id",
    "mercuryRecipientId": "your-recipient-id"
  }'
```

---

### `aiRoute: true` — AI-selected corridor

Pass `aiRoute: true` and an optional `acceptedDestinationCurrencies` list. The agent fetches live corridor health from the Stability Oracle, ranks accepted currencies by OPTIMAL > CAUTION > ADVERSE, and substitutes the best into the settlement before the oracle call. The AI selects the path — not the caller.

```bash
curl -X POST https://agent.untitledfinancial.com/settle \
  -H "X-PAYMENT: $PAYMENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500000,
    "sourceCurrency": "USD",
    "destinationCurrency": "EUR",
    "recipientAddress": "0xABC...",
    "aiRoute": true,
    "acceptedDestinationCurrencies": ["EUR", "SGD", "GBP"]
  }'
```

```json
{
  "status": "authorized",
  "destinationCurrency": "SGD",
  "aiRouteSelection": {
    "selectedCurrency": "SGD",
    "corridorStatus": "OPTIMAL",
    "rationale": "AI selected SGD (OPTIMAL, stability 87/100) from 3 accepted currencies",
    "alternatives": ["EUR (CAUTION, 61/100)", "GBP (ADVERSE, 38/100)"]
  }
}
```

If only one currency is accepted, the selection still runs and returns corridor health for that pair.

---

### `POST /sweep-rules` — condition-gated scheduled sweeps

Register a rule with payment conditions and Mercury execution details. The agent evaluates all rules hourly and fires Mercury when conditions are met. Cooldown guard prevents double-firing.

```bash
# Register a sweep rule
curl -X POST https://agent.untitledfinancial.com/sweep-rules \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Weekly EUR sweep when conditions are stable",
    "conditions": {
      "maxChaosIndex": 0.5,
      "minCorridorStatus": "OPTIMAL",
      "maxAmountUsd": 100000
    },
    "mercury": {
      "accountId": "your-mercury-account-id",
      "recipientId": "your-recipient-id",
      "amount": 50000,
      "paymentMethod": "ach",
      "currency": "EUR"
    },
    "cooldownHours": 24
  }'
```

```json
{
  "ruleId": "a1b2c3d4-...",
  "rule": {
    "conditions": { "maxChaosIndex": 0.5, "minCorridorStatus": "OPTIMAL", "maxAmountUsd": 100000 },
    "mercury": { "amount": 50000, "currency": "EUR" },
    "cooldownHours": 24,
    "createdAt": "2026-07-05T22:00:00Z"
  }
}
```

| Endpoint | Description |
|---|---|
| `POST /sweep-rules` | Register a new sweep rule |
| `GET /sweep-rules` | List all active rules |
| `DELETE /sweep-rules/:id` | Remove a rule |

**Conditions:**
- `maxChaosIndex` — only sweep when live chaos index is at or below this (0–1, default 0.6)
- `minCorridorStatus` — `OPTIMAL` or `CAUTION` — corridor must be at least this healthy
- `maxAmountUsd` — hard cap per trigger regardless of `mercury.amount`

---

### `POST /hedge-rules` — cascade-triggered hedges

Register a hedge instruction that fires automatically when the Butterfly cascade signal is active. The intelligence worker signals the settlement agent when magnitude ≥ 60; the agent evaluates all hedge rules against the cascade score and corridor list, then executes via the registered execution type.

**Multi-tenant:** each rule returns a `managementKey` on creation (shown once). Pass it as `X-Management-Key` to list or delete your rules — you can only see your own.

Three execution types:

#### `mercury` — direct ACH/wire

```bash
curl -X POST https://agent.untitledfinancial.com/hedge-rules \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Reduce EM exposure on cascade",
    "conditions": { "minCascadeScore": 75, "corridors": ["USD-BRL", "USD-TRY"] },
    "execution": {
      "type": "mercury",
      "accountId": "your-mercury-account-id",
      "recipientId": "safe-haven-recipient-id",
      "amount": 200000,
      "paymentMethod": "domesticWire",
      "purpose": "TransferToMyExternalAccount"
    },
    "cooldownHours": 6
  }'
```

#### `webhook` — any TMS, Kyriba, Ramp, n8n, or custom system

The agent POSTs a signed cascade event to your URL. You execute however your system handles it — no DPX account required on your end.

```bash
curl -X POST https://agent.untitledfinancial.com/hedge-rules \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Notify Kyriba when cascade fires",
    "conditions": { "minCascadeScore": 70 },
    "execution": {
      "type": "webhook",
      "url": "https://your-tms.example.com/dpx-cascade-hook",
      "secret": "your-signing-secret",
      "amount": 500000
    },
    "cooldownHours": 4
  }'
```

Payload sent to your URL:

```json
{
  "event": "cascade.hedge_triggered",
  "settlementId": "hedge-...",
  "ruleId": "e5f6g7h8-...",
  "clientId": "your-client-id",
  "cascadeScore": 82,
  "corridors": ["USD-BRL"],
  "amount": 500000,
  "triggeredAt": "2026-07-06T09:00:00Z"
}
```

If `secret` is set, the payload is HMAC-SHA256 signed and sent in `X-DPX-Signature`.

#### `onchain` — execution params delivered to your on-chain executor

The agent posts DPX router execution params (routerAddress, tokenAddress, grossAmountRaw, quoteIdBytes32) to your callback. Your automated system calls `approve()` + `router.settle()` on-chain.

```bash
curl -X POST https://agent.untitledfinancial.com/hedge-rules \
  -H "Content-Type: application/json" \
  -d '{
    "description": "On-chain hedge via Base mainnet router",
    "conditions": { "minCascadeScore": 80, "corridors": ["USD-TRY", "USD-ZAR"] },
    "execution": {
      "type": "onchain",
      "callbackUrl": "https://your-executor.example.com/dpx-settle",
      "secret": "your-signing-secret",
      "amount": 100000,
      "recipient": "0xYourRecipientAddress",
      "currency": "USDC"
    },
    "cooldownHours": 6
  }'
```

---

**Management — scoped to your `managementKey`:**

```bash
# List your rules
curl https://agent.untitledfinancial.com/hedge-rules \
  -H "X-Management-Key: your-management-key"

# Delete a rule
curl -X DELETE https://agent.untitledfinancial.com/hedge-rules/e5f6g7h8-... \
  -H "X-Management-Key: your-management-key"
```

| Endpoint | Auth | Description |
|---|---|---|
| `POST /hedge-rules` | None | Register a rule — returns `managementKey` once |
| `GET /hedge-rules` | `X-Management-Key` | List your rules only |
| `DELETE /hedge-rules/:id` | `X-Management-Key` | Delete a rule (forbidden if key doesn't match) |

**Conditions:**
- `minCascadeScore` — cascade magnitude 1–100 to trigger (default 70)
- `corridors` — e.g. `["USD-BRL", "USD-TRY"]`; omit to trigger on any cascade

---

## Integration guides

- [MCP — Any MCP-compatible host](/integrations/mcp)
- [GPT Actions — Connect ChatGPT](/integrations/gpt-actions)
- [LangChain — Python tools](/integrations/langchain)
- [n8n — Workflow automation](/integrations/n8n)
- [REST API — Any TMS](/integrations/rest-api)
