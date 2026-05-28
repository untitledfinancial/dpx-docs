---
title: Agent Quick Start
description: The complete autonomous settlement loop — discover, quote, gate on oracle conditions, pay via x402, execute on-chain. No onboarding, no API key, no human step.
---

DPX is the payment and settlement layer for the agentic internet. Any agent can discover DPX, get a binding fee quote, check oracle conditions, and execute a cross-border settlement end-to-end — no onboarding, no API key, no human step. The x402 USDC payment IS the authorization: agents pay the gross settlement amount and execution proceeds.

## What you're working with

The DPX settlement stack has three layers:

| Layer | What it does |
|---|---|
| **Stability Oracle** | 10-layer signal pipeline. Returns `STABLE / CAUTION / UNSTABLE` with confidence score and reasoning. Agents check this before every large settlement. |
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
      "core":    { "bps": 85,    "usd": 8500 },
      "fx":      { "bps": 40,    "usd": 4000 },
      "esg":     { "bps": 12.5,  "usd": 1250, "score": 75 },
      "license": { "bps": 1,     "usd": 100 },
      "total":   { "bps": 138.5, "pct": 1.385, "usd": 13850 }
    },
    "settlement": {
      "netUsd": 986150,
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

### Step 4 — Execute via the Settlement Agent (x402)

Live settlements use the x402 payment standard — no API key, no account. The fee payment IS the authorization.

**First call — receive a quote and payment requirements:**

```bash
curl -X POST https://agent.untitledfinancial.com/settle \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000000,
    "sourceCurrency": "USD",
    "destinationCurrency": "USD",
    "recipientAddress": "0xRecipientWalletAddress",
    "purpose": "intercompany",
    "referenceId": "INV-2026-001"
  }'
```

**Response — 402 Payment Required:**

```json
{
  "x402Version": 1,
  "accepts": [{
    "scheme": "exact",
    "network": "base-mainnet",
    "maxAmountRequired": "1013850000000",
    "resource": "https://agent.untitledfinancial.com/settle",
    "description": "DPX Settlement — 1013850.00 USDC gross. Net to recipient: 1000000.00 USDC. Fees: 139 bps (13850.00 USDC).",
    "payTo": "0xExecutorWalletAddress",
    "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
  }],
  "settlementNonce": "a1b2c3d4-...",
  "preview": {
    "grossUsd": 1013850,
    "netAmountUsd": 1000000,
    "feesTotalUsd": 13850,
    "feeBps": 139,
    "oracleStatus": "STABLE",
    "esgScore": 75
  }
}
```

**Retry with payment — attach X-PAYMENT header and settlementNonce:**

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
      purpose: 'intercompany',
      referenceId: 'INV-2026-001',
      settlementNonce: 'a1b2c3d4-...',   // from the 402 response
    }),
  }
);
```

**Response (executed):**

```json
{
  "settlementId": "dpx_7f8a9b2c...",
  "status": "executed",
  "txHash": "0xabc123...",
  "netAmount": 1000000,
  "grossAmount": 1013850,
  "feesTotal": 13850,
  "token": "USDC",
  "recipient": "0xRecipientWalletAddress",
  "oracleStatus": "STABLE",
  "oracleScore": 91,
  "esgScore": 75,
  "reasoning": "Oracle conditions are stable. Yield curve normal, FX stress low. Executing immediately. [x402 payment verified]",
  "timestamp": "2026-04-23T14:32:00Z",
  "sandboxMode": false
}
```

**Response (held — UNSTABLE oracle):**

The Settlement Agent returns `202` before asking for payment if oracle conditions are `UNSTABLE`. No payment is requested until conditions improve.

```json
{
  "status": "held",
  "oracleStatus": "UNSTABLE",
  "oracleScore": 44,
  "reasoning": "Peg deviation 62 bps exceeds 50 bps threshold — holding until peg stabilises.",
  "hint": "Oracle conditions UNSTABLE. Retry when oracle returns CAUTION or STABLE.",
  "timestamp": "2026-04-23T14:32:00Z"
}
```

:::note[Sandbox mode]
Set `"sandbox": true` in the request body to skip x402 entirely. Real oracle checks, real fee calculations, no on-chain execution, no payment required. Use this to test the full loop without USDC.
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
