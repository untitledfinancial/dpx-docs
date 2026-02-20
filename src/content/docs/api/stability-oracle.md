---
title: Stability Oracle API
description: Complete endpoint reference for the DPX Stability Oracle (port 3000).
---

No authentication required. All responses are JSON. All prices in USD.

**Base URL:** `localhost:3000` (local) · `https://stability.dpx.finance` (production)

---

## GET /manifest

Protocol discovery. Call once and cache. Changes only when the protocol is updated.

```bash
curl localhost:3000/manifest
```

**Key response fields:**

| Field | Type | Description |
|---|---|---|
| `fees.coreBps` | number | Core fee in basis points (85) |
| `fees.fxBps` | number | FX fee in basis points (40) |
| `fees.licenseBps` | number | License fee in basis points (1) |
| `fees.esgFormula` | string | `"(100 - esgScore) / 200"` |
| `fees.typicalTotalBps` | number | Typical all-in (138.5) |
| `contracts.token` | string | DPX token address on Base |
| `onboarding.humanRequired` | boolean | false |

---

## GET /fee-schedule

Full fee table with all tiers. Cache this.

```bash
curl localhost:3000/fee-schedule
```

---

## GET /quote

Exact fee breakdown for a transaction. Returns a `quoteId` valid for 300 seconds.

```bash
curl "localhost:3000/quote?amountUsd=1000000&hasFx=true&esgScore=75"
```

**Parameters:**

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `amountUsd` | number | Yes | — | Transaction amount in USD |
| `hasFx` | boolean | No | false | Cross-currency? Triggers FX fee |
| `esgScore` | number | No | 50 | ESG score 0–100 |
| `monthlyVolumeUsd` | number | No | 0 | For volume discount tier |

**Response — fees object:**

| Field | Example | Description |
|---|---|---|
| `fees.core.bps` | 85 | Core fee basis points |
| `fees.core.usd` | 8500 | Core fee in USD |
| `fees.fx.bps` | 40 | FX fee basis points (0 if same-currency) |
| `fees.esg.bps` | 12.5 | ESG fee basis points |
| `fees.esg.score` | 75 | ESG score used |
| `fees.esg.tier` | "Good" | ESG tier label |
| `fees.license.bps` | 1 | License fee basis points |
| `fees.total.pct` | 1.385 | All-in percentage |
| `fees.total.usd` | 13850 | All-in USD amount |
| `settlement.netUsd` | 986150 | Amount received after fees |
| `quoteId` | "dpx-..." | Pass to settlement router |
| `validForSeconds` | 300 | Quote validity window |

## POST /quote

Same as GET, accepts JSON body:

```bash
curl -X POST localhost:3000/quote \
  -H "Content-Type: application/json" \
  -d '{"amountUsd": 1000000, "hasFx": true, "esgScore": 75}'
```

---

## GET /verify-fees

Confirms the on-chain `DPXSettlementRouter.previewFees()` returns the same number as the quote. If `feesMatch: true`, safe to proceed with settlement.

```bash
curl "localhost:3000/verify-fees?amountUsd=1000000&hasFx=true&esgScore=75"
```

**Key response field:** `feesMatch: true` means the on-chain and off-chain fee calculations agree.

---

## GET /reliability

Live stability and trust signals. Check before large settlements.

```bash
curl localhost:3000/reliability
```

**Key fields:**

| Field | Description |
|---|---|
| `isHealthy` | true if all systems nominal |
| `stability.currentScore` | 0–100, >= 90 is stable |
| `peg.deviationBps` | Deviation from target peg, < 50 is normal |
| `confidence.score` | Oracle confidence 0–100 |
| `oracle.uptimePct` | Historical uptime % |

**Decision table:**

| Condition | Action |
|---|---|
| `isHealthy: true` | Proceed |
| `stability.currentScore >= 90` | Normal operations |
| `stability.currentScore` 75–89 | Proceed with caution |
| `stability.currentScore < 75` | Defer large settlements |
| `peg.deviationBps >= 50` | Hold — peg alert active |

---

## GET /health

Liveness check.

```bash
curl localhost:3000/health
# {"status": "healthy", "oracle": "SUCCESS", "network": "base"}
```

---

## GET /api/status

Full raw oracle output from the latest run.

---

## GET /api/history

Array of last 24 oracle results.

---

## Machine Discovery

| URL | Format |
|---|---|
| `localhost:3000/openapi.json` | OpenAPI 3.0 |
| `localhost:3000/.well-known/ai-plugin.json` | Agent plugin manifest |
| `localhost:3000/llms.txt` | LLM navigation index |
| `localhost:3000/llms-full.txt` | Full docs for LLM context |
