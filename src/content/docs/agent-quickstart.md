---
title: Agent Quick Start
description: The complete DPX agent settlement loop — from discovery to on-chain execution in 5 steps.
---

DPX is designed for autonomous agents. No sales process, no onboarding call. An agent discovers DPX, gets a binding fee quote, checks oracle conditions, and executes a cross-border settlement end-to-end — in a single loop, without human approval.

## What you're working with

The DPX settlement stack has three layers:

| Layer | What it does |
|---|---|
| **Stability Oracle** | 9-layer signal pipeline. Returns `STABLE / CAUTION / UNSTABLE` with confidence score and reasoning. Agents check this before every large settlement. |
| **Settlement Agent** | Cloudflare Worker. Receives payment instructions, reasons with Claude, and calls the router. |
| **DPXSettlementRouter v2.0** | On-chain contract (Base). Accepts any whitelisted ERC-20 (USDC, EURC, USDT). Enforces fees, sends net to recipient. |

**No DPX token required in the payment flow.** The router accepts USDC, EURC, USDT — whichever stablecoin you're settling in. 1:1 is maintained by the stablecoin issuers (Circle, etc.). The Stability Oracle monitors FX stress and the Settlement Agent holds during CAUTION periods.

---

## The 5-step settlement loop

### Step 1 — Discover

```bash
GET https://agent.untitledfinancial.com/manifest
```

Returns capabilities, supported assets, oracle URL, and router address. Cache this — it only changes on protocol upgrades.

```json
{
  "name": "DPX Settlement Agent",
  "version": "2.0.0",
  "capabilities": ["quote", "settle", "webhook", "status"],
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

### Step 3 — Check oracle conditions

Oracle status drives the settlement decision:

| Status | Score | Agent action |
|---|---|---|
| `STABLE` | 90–100 | Execute immediately |
| `CAUTION` | 75–89 | Execute under $100K — hold larger amounts |
| `UNSTABLE` | < 75 | Hold — notify sender, retry later |
| `peg.deviationBps >= 50` | — | Hold regardless of score |

The Settlement Agent applies this logic automatically when you call `/settle`. For direct integration, check `recommendation` in the quote response.

---

### Step 4 — Execute via the Settlement Agent

Send a `POST /settle` request. The agent handles oracle checks, Claude reasoning, and on-chain execution.

```bash
curl -X POST https://agent.untitledfinancial.com/settle \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000000,
    "sourceCurrency": "USD",
    "destinationCurrency": "USD",
    "recipientAddress": "0xRecipientWalletAddress",
    "quoteId": "dpx_a1b2c3d4...",
    "purpose": "intercompany",
    "referenceId": "INV-2026-001"
  }'
```

**Response (executed):**

```json
{
  "settlementId": "dpx_7f8a9b2c...",
  "status": "executed",
  "txHash": "0xabc123...",
  "netAmount": 986150,
  "grossAmount": 1000000,
  "feesTotal": 13850,
  "token": "USDC",
  "recipient": "0xRecipientWalletAddress",
  "oracleStatus": "STABLE",
  "oracleScore": 91,
  "esgScore": 75,
  "reasoning": "Oracle conditions are stable. Yield curve normal, FX stress low. Executing immediately.",
  "timestamp": "2026-04-23T14:32:00Z",
  "sandboxMode": false
}
```

**Response (held — CAUTION conditions):**

```json
{
  "settlementId": "dpx_4d5e6f7a...",
  "status": "held",
  "oracleStatus": "CAUTION",
  "oracleScore": 78,
  "reasoning": "Yield curve inversion detected. Holding settlement over $100K until conditions improve. Retry in 4–8 hours.",
  "timestamp": "2026-04-23T14:32:00Z"
}
```

---

### Step 5 — Verify on-chain

Every settled transaction is verifiable:

```bash
# Basescan (Base Mainnet)
https://basescan.org/tx/<txHash>

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

- [MCP — Connect Claude Desktop](/integrations/mcp)
- [GPT Actions — Connect ChatGPT](/integrations/gpt-actions)
- [LangChain — Python tools](/integrations/langchain)
- [n8n — Workflow automation](/integrations/n8n)
- [REST API — Any TMS](/integrations/rest-api)
