---
title: Stability Oracle API
description: Complete endpoint reference for the DPX Stability Oracle v9.0 — 7-tier intelligence, USD structural health, and AI synthesis across 32+ sources.
---

No authentication required. All responses are JSON. All prices in USD.

**Base URL:** `https://stability.untitledfinancial.com`

**Version:** v9.0 — 7-tier signal pipeline, USD structural health monitoring (12 independent signals, cross-validated against non-US sources), and AI synthesis on every response.

---

## GET /manifest

Protocol discovery. Call once and cache. Changes only when the protocol is updated.

```bash
curl https://stability.untitledfinancial.com/manifest
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
curl https://stability.untitledfinancial.com/fee-schedule
```

---

## GET /quote

Exact fee breakdown for a transaction. Returns a `quoteId` valid for 300 seconds.

```bash
curl "https://stability.untitledfinancial.com/quote?amountUsd=1000000&hasFx=true&esgScore=75"
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
curl -X POST https://stability.untitledfinancial.com/quote \
  -H "Content-Type: application/json" \
  -d '{"amountUsd": 1000000, "hasFx": true, "esgScore": 75}'
```

---

## GET /verify-fees

Confirms the on-chain `DPXSettlementRouter.previewFees()` returns the same number as the quote. If `feesMatch: true`, safe to proceed with settlement.

```bash
curl "https://stability.untitledfinancial.com/verify-fees?amountUsd=1000000&hasFx=true&esgScore=75"
```

**Key response field:** `feesMatch: true` means the on-chain and off-chain fee calculations agree.

---

## GET /reliability

Live stability and trust signals. Check before large settlements.

```bash
curl https://stability.untitledfinancial.com/reliability
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

**AI intelligence layer** — when present, the `intelligence` object provides a synthesised view across all 32+ signals:

| Field | Type | Description |
|---|---|---|
| `intelligence.reasoning` | string | Plain-language explanation of primary stability drivers and key risks |
| `intelligence.confidence` | number (0–1) | AI confidence in the synthesis, reflecting signal clarity and data quality |
| `intelligence.alerts` | string[] | Up to 3 concise action items for treasury and risk teams |
| `intelligence.outlook` | string | `IMPROVING` / `STABLE` / `DETERIORATING` / `UNCERTAIN` |
| `intelligence.model` | string | AI model used for synthesis |
| `intelligence.generatedAt` | string | ISO 8601 timestamp of synthesis |

The `intelligence` field augments but does not replace the quantitative scores. Always use `stability.currentScore` and `peg.deviationBps` as the authoritative inputs for settlement decisions.

**USD structural health** — v9.0 adds a `usdHealth` object with 12 independent signals watching the US dollar's structural trajectory:

| Field | Description |
|---|---|
| `usdHealth.score` | 0–100 composite USD structural confidence (higher = more stable) |
| `usdHealth.structuralOutlook` | `WEAKENING` / `STABLE` / `STRENGTHENING` / `UNCERTAIN` |
| `usdHealth.confidenceInOfficialData` | `HIGH` / `MODERATE` / `LOW` — flags when Truflation diverges from BLS by >1.5pp |
| `usdHealth.usdStrengthConsensus` | `BULLISH` / `BEARISH` / `MIXED` / `NEUTRAL` — cross-signal consensus |
| `usdHealth.tradeWeightedUsd` | FRED DTWEXBGS — trade-weighted dollar index (26 currencies), trend direction |
| `usdHealth.yieldCurve` | T10Y2Y spread, `INVERTED` / `FLAT` / `NORMAL`, recession signal |
| `usdHealth.breakevenInflation` | 10-year breakeven vs 2% target — elevated flag if >2.75% |
| `usdHealth.fedBalanceSheet` | Total Fed assets in trillions, `EXPANDING` / `CONTRACTING` / `STABLE` |
| `usdHealth.gold` | Gold price (USD), trend, interpretation — >$2500 = USD debasement signal |
| `usdHealth.stablecoinHealth` | USDT + USDC market caps, dominance ratio, stress signal |
| `usdHealth.truflationVsBls` | Independent inflation vs BLS-derived — `divergenceFlag: true` if gap >1.5pp |
| `usdHealth.divergenceAlerts` | String array — populated when independent sources depart from official data |
| `usdHealth.alerts` | Active USD risk alerts (yield curve inversion, gold elevated, Fed expanding, etc.) |

---

## GET /health

Liveness check.

```bash
curl https://stability.untitledfinancial.com/health
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
| `https://stability.untitledfinancial.com/openapi.json` | OpenAPI 3.0 |
| `https://stability.untitledfinancial.com/.well-known/ai-plugin.json` | Agent plugin manifest |
| `https://stability.untitledfinancial.com/llms.txt` | LLM navigation index |
| `https://stability.untitledfinancial.com/llms-full.txt` | Full docs for LLM context |
