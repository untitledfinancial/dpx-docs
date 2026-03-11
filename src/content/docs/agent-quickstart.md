---
title: Agent Quick Start
description: The complete DPX agent settlement loop — from discovery to on-chain execution in 5 steps.
---

DPX is designed for autonomous agents. No sales process. No onboarding call. An agent can discover DPX, get a binding fee quote, verify it on-chain, and execute a settlement in a single loop.

## Prerequisites

- For on-chain settlement: `ROUTER_ADDRESS` and `SETTLER_PRIVATE_KEY` in `.env`

## The 5-step settlement loop

### Step 1 — Discover

```bash
GET https://stability.untitledfinancial.com/manifest
```

Returns capabilities, fee structure, supported currencies, and all contract addresses. Cache this. It changes only when the protocol is updated.

**What agents look for:**

| Field | Value |
|---|---|
| `fees.typicalTotalBps` | 138.5 (1.385%) |
| `onboarding.humanRequired` | false |
| `supportedCurrencies.live` | ["USD", "EUR", "GBP"] |
| `network` | base |
| `chainId` | 8453 |

---

### Step 2 — Get live ESG score

```bash
GET https://esg.untitledfinancial.com/esg-score
```

Returns current E, S, G scores and the active ESG fee. Use `scores.average` as the `esgScore` parameter in Step 3.

---

### Step 3 — Price the transaction

```bash
GET https://stability.untitledfinancial.com/quote?amountUsd=1000000&hasFx=true&esgScore=75
```

Returns a full fee breakdown and a `quoteId` valid for 300 seconds.

```json
{
  "quoteId": "dpx-1234567890-abc123",
  "validForSeconds": 300,
  "fees": {
    "core":    { "bps": 85,   "usd": 8500 },
    "fx":      { "bps": 40,   "usd": 4000 },
    "esg":     { "bps": 12.5, "usd": 1250, "score": 75, "tier": "Good" },
    "license": { "bps": 1,    "usd": 100 },
    "total":   { "bps": 138.5, "pct": 1.385, "usd": 13850 }
  },
  "settlement": {
    "netUsd": 986150,
    "grossUsd": 1000000
  }
}
```

---

### Step 4 — Verify on-chain

```bash
GET https://stability.untitledfinancial.com/verify-fees?amountUsd=1000000&hasFx=true&esgScore=75
```

Confirms the on-chain `DPXSettlementRouter.previewFees()` returns the same number as the quote. If `feesMatch: true`, proceed.

---

### Step 5 — Check stability, then execute

```bash
GET https://stability.untitledfinancial.com/reliability
```

| Condition | Action |
|---|---|
| `isHealthy: true` | Proceed |
| `stability.currentScore >= 90` | Normal operations |
| `stability.currentScore` 75–89 | Proceed with caution |
| `stability.currentScore < 75` | Defer large settlements |
| `peg.deviationBps >= 50` | Hold — peg alert active |

**Execute in Node.js:**

```javascript
const { settle } = require('./routes/settlerClient');

const result = await settle(
  recipientAddress,           // 0x...
  1000000,                    // gross amount in DPX
  true,                       // isCrossCurrency
  'dpx-1234567890-abc123'     // quoteId from Step 3
);

console.log(result.txHash);       // transaction hash
console.log(result.explorerUrl);  // basescan link
```

---

## Integration guides

- [MCP — Connect Claude](/integrations/mcp)
- [GPT Actions — Connect ChatGPT](/integrations/gpt-actions)
- [LangChain — Python tools](/integrations/langchain)
- [n8n — Workflow automation](/integrations/n8n)
