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

## The 5-step settlement loop

### Step 1 — Discover

```bash
GET https://agent.untitledfinancial.com/manifest
```

Returns everything an agent needs to transact from a cold start — capabilities, x402 payment requirements, oracle endpoints, ESG preflight URL, webhook signature algorithm, and contract addresses. Cache this — it only changes on protocol upgrades.

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

## Intelligence endpoints — free, no auth

These endpoints return meaningful data before any payment is required. Use them during evaluation, internal review, or integration scoping.

| Endpoint | Purpose |
|---|---|
| `GET /flow-estimate` | Full synthetic settlement preview with accurate fees, FX rate, and on-chain execution steps. No payment. |
| `GET /corridor-intel?from=BRL&to=USD` | Live FX rate (ECB via Frankfurter) + DPX-observed corridor signal + regulatory context for the corridor. |
| `GET /corridor-compare?corridors=BRL-USD,EUR-USD,GBP-USD` | Side-by-side multi-corridor comparison with live FX rates. |
| `GET /session` | Your own call sequence for today, keyed by anonymized IP hash. Useful for debugging integration order. |
| `GET /quote` | Binding fee quote with oracle signal — 300s TTL. |
| `GET /health` | Worker liveness. |
| `GET /manifest` | Full protocol capabilities, contract addresses, oracle endpoints. |

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

## Integration guides

- [MCP — Any MCP-compatible host](/integrations/mcp)
- [GPT Actions — Connect ChatGPT](/integrations/gpt-actions)
- [LangChain — Python tools](/integrations/langchain)
- [n8n — Workflow automation](/integrations/n8n)
- [REST API — Any TMS](/integrations/rest-api)
