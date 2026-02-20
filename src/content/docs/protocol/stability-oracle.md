---
title: Stability Oracle
description: How the DPX 6-tier stability oracle works — from climate signals to on-chain settlement confidence.
---

The DPX Stability Oracle is a 6-tier signal pipeline that aggregates real-world data into a single confidence score used to gate settlements. It runs continuously and exposes its output at `localhost:3000/reliability`.

## The 6 tiers

| Tier | Name | What it measures |
|---|---|---|
| 1 | Climate | Environmental stability signals |
| 2 | Commodities | Raw material and energy market conditions |
| 3 | Macro | Interest rates, inflation, and GDP signals |
| 4 | FX | Currency pair volatility and liquidity |
| 5 | Basket Verification | DPX basket composition verification |
| 6 | Causal / Predictive | Forward-looking signal synthesis |

Each tier feeds into the next. The final output is a composite `stability.currentScore` between 0 and 100.

## Peg monitoring

The oracle continuously tracks `peg.deviationBps` — the deviation of the DPX basket from its target value. Normal operation is below 50 bps. At 50 bps or above, the oracle raises a peg alert and agents should hold large settlements.

## Output fields

```json
{
  "isHealthy": true,
  "stability": {
    "currentScore": 94,
    "trend": "stable"
  },
  "peg": {
    "deviationBps": 12,
    "alert": false
  },
  "confidence": {
    "score": 91
  },
  "oracle": {
    "uptimePct": 99.7,
    "lastRunAt": "2025-01-15T14:32:00Z"
  }
}
```

## Score thresholds

| Score | Status | Agent action |
|---|---|---|
| >= 90 | Stable | Normal operations |
| 75–89 | Caution | Proceed, monitor closely |
| < 75 | Degraded | Defer large settlements |

## History

The oracle stores the last 24 runs at `/api/history`. This gives agents a window into recent stability trends before committing to a settlement.

## Architecture

The oracle runs as a Node.js server. The oracle logic is in `oracle.js` (the computation module). The HTTP server is in `server.js`. Routes are in `routes/agentEndpoints.js`.

```
stability-oracle/
  server.js           ← HTTP server, port 3000
  oracle.js           ← 6-tier computation module
  routes/
    agentEndpoints.js ← /manifest, /quote, /reliability, /verify-fees
    settlerClient.js  ← ethers.js bridge to DPXSettlementRouter
```
