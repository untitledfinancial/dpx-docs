---
title: Crypto Card Program Settlement
description: Use DPX as the cross-border treasury settlement rail for crypto card programs — net FX positions daily, route by corridor, settle in USDC or EURC on Base.
---

Crypto card programs accumulate cross-border treasury exposure every time a cardholder spends in a currency different from their wallet's stablecoin. At end of day, the program holds net positions across multiple corridors (e.g. $2.3M net to Brazil, €450K net to Germany) and needs to settle them efficiently.

DPX handles the treasury settlement layer — compliance-gated, oracle-priced, stablecoin-routed — so card programs don't build their own cross-border stack.

---

## How it works

```
Card program daily close
    │
    │  Net positions per corridor
    │  (e.g. USD-BRL: $2.3M, USD-EUR: €450K, USD-SGD: $180K)
    ▼
POST /card/positions   ← planning call — no settlement executed
    │
    │  Returns: optimal stablecoin per corridor, settle-now vs. hold,
    │           estimated all-in fee, corridor health from Stability Oracle
    ▼
POST /card/settle      ← executes all positions via DPX batch
    │
    ├── Compliance Oracle (AML, sanctions, FATF R16 per corridor)
    ├── Stability Oracle (macro gate — holds if UNSTABLE)
    ├── ESG Oracle (counterparty scoring)
    └── On-chain settlement (USDC / EURC on Base mainnet)
```

---

## Step 1 — Plan your positions

Call `/card/positions` at the end of your settlement window. No settlement is executed — this returns the optimal plan.

```bash
POST https://agent.untitledfinancial.com/card/positions
Content-Type: application/json

{
  "settlementDate": "2026-08-09",
  "positions": [
    { "corridor": "USD-BRL", "netAmountUsd": 2300000, "recipientAddress": "0xYourBrazilWallet" },
    { "corridor": "USD-EUR", "netAmountUsd": 450000,  "recipientAddress": "0xYourEurWallet" },
    { "corridor": "USD-SGD", "netAmountUsd": 180000,  "recipientAddress": "0xYourSGDWallet" },
    { "corridor": "USD-GBP", "netAmountUsd": 320000,  "recipientAddress": "0xYourGBPWallet" }
  ]
}
```

Response:

```json
{
  "settlementDate": "2026-08-09",
  "oracleStatus": "STABLE",
  "chaosScore": 18,
  "summary": { "total": 4, "settleNow": 3, "hold": 0, "monitor": 1 },
  "plan": [
    {
      "corridor": "USD-BRL",
      "netAmountUsd": 2300000,
      "recommendedAsset": "USDC",
      "corridorStatus": "OPTIMAL",
      "recommendation": "SETTLE_NOW",
      "estimatedFee": { "total": { "usd": 46805 } },
      "quoteId": "qid_abc123",
      "quoteExpiresIn": "300s"
    },
    {
      "corridor": "USD-EUR",
      "netAmountUsd": 450000,
      "recommendedAsset": "EURC",
      "corridorStatus": "OPTIMAL",
      "recommendation": "SETTLE_NOW",
      "estimatedFee": { "total": { "usd": 9153 } }
    },
    {
      "corridor": "USD-SGD",
      "netAmountUsd": 180000,
      "recommendedAsset": "USDC",
      "corridorStatus": "CAUTION",
      "recommendation": "MONITOR"
    },
    {
      "corridor": "USD-GBP",
      "netAmountUsd": 320000,
      "recommendedAsset": "USDC",
      "corridorStatus": "OPTIMAL",
      "recommendation": "SETTLE_NOW"
    }
  ]
}
```

**`recommendation` values:**
- `SETTLE_NOW` — oracle conditions optimal, corridor healthy, proceed
- `MONITOR` — conditions acceptable but elevated risk; settle or hold based on your policy
- `HOLD` — oracle conditions UNSTABLE or corridor ADVERSE; DPX will hold automatically anyway

---

## Step 2 — Execute

Once you've reviewed the plan, call `/card/settle`. DPX fans out all positions in parallel via the batch settlement engine.

```bash
POST https://agent.untitledfinancial.com/card/settle
Content-Type: application/json

{
  "sandbox": false,
  "positions": [
    { "corridor": "USD-BRL", "netAmountUsd": 2300000, "recipientAddress": "0xYourBrazilWallet" },
    { "corridor": "USD-EUR", "netAmountUsd": 450000,  "recipientAddress": "0xYourEurWallet" },
    { "corridor": "USD-GBP", "netAmountUsd": 320000,  "recipientAddress": "0xYourGBPWallet" }
  ]
}
```

Response:

```json
{
  "cardSettle": true,
  "sandbox": false,
  "corridors": 3,
  "summary": { "total": 3, "succeeded": 3, "failed": 0 },
  "results": [
    { "index": 0, "status": 200, "data": { "settlementId": "dpx_...", "txHash": "0x..." } },
    { "index": 1, "status": 200, "data": { "settlementId": "dpx_...", "txHash": "0x..." } },
    { "index": 2, "status": 200, "data": { "settlementId": "dpx_...", "txHash": "0x..." } }
  ]
}
```

---

## Stablecoin routing

DPX automatically selects the optimal stablecoin per corridor:

| Destination | Asset | Reason |
|---|---|---|
| EUR corridors | EURC | Native euro stablecoin, no FX conversion |
| All other corridors | USDC | Dominant liquidity on Base (58% of crypto card volume) |

---

## MCP — run from any AI agent

```bash
npx @untitledfinancial/dpx-mcp
```

Two tools available:

**`card.positions`** — plan settlement (free, no payment required):
```
Plan my card program treasury settlement for today.
Positions: USD-BRL $2.3M, USD-EUR €450K, USD-SGD $180K
```

**`card.settle`** — execute:
```
Execute card treasury settlement:
USD-BRL $2.3M to 0xYourBrazilWallet
USD-EUR €450K to 0xYourEurWallet
Use sandbox mode.
```

---

## Settlement limits

| Parameter | Limit |
|---|---|
| Max corridors per call | 20 |
| Max amount per corridor | No hard limit (oracle gate applies) |
| Batch parallelism | All corridors settle simultaneously |
| Quote TTL | 300 seconds from `/card/positions` |

---

## What DPX handles automatically

- **Oracle gate** — settlement holds if Stability Oracle returns UNSTABLE
- **Compliance screen** — AML, sanctions, FATF R16 on every corridor
- **ESG scoring** — counterparty score determines ESG fee component
- **Stablecoin selection** — EURC for EUR corridors, USDC elsewhere
- **Receipts** — ISO 20022 pacs.002 returned per settlement, webhook delivery available

Register a webhook for settlement notifications: [Webhooks →](/integrations/webhooks)

---

## Sandbox

Add `"sandbox": true` to any call. Oracle checks and compliance screens run against live data; settlement returns a mock `settlementId` without on-chain execution.

```bash
POST https://agent.untitledfinancial.com/card/positions
# sandbox mode: same response, no settlement executed on /card/settle
```
