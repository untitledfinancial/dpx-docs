---
title: Stability Oracle API
description: Complete endpoint reference for the DPX Stability Oracle v9.0 — 9-layer intelligence, USD structural health, and AI synthesis across 32+ sources.
---

No authentication required. All responses are JSON. All prices in USD.

**Base URL:** `https://stability.untitledfinancial.com`

**Version:** v9.0 — 9-layer signal pipeline, USD structural health monitoring (12 independent signals, cross-validated against non-US sources), and AI synthesis on every response.

---

## GET /manifest

Protocol discovery. Call once and cache. Changes only when the protocol is updated.

```bash
curl https://stability.untitledfinancial.com/manifest
```

**Key response fields:**

| Field | Type | Description |
|---|---|---|
| `fees.coreBps` | number | Core fee in basis points |
| `fees.fxBps` | number | FX fee in basis points (cross-currency only) |
| `fees.licenseBps` | number | License fee in basis points |
| `fees.esgFormula` | string | ESG fee formula |
| `fees.typicalTotalBps` | number | Typical all-in basis points |
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
| `fees.core.bps` | number | Core fee basis points |
| `fees.core.usd` | number | Core fee in USD |
| `fees.fx.bps` | number | FX fee basis points (0 if same-currency) |
| `fees.esg.bps` | number | ESG fee basis points |
| `fees.esg.score` | number | ESG score used |
| `fees.esg.tier` | string | ESG tier label |
| `fees.license.bps` | number | License fee basis points |
| `fees.total.pct` | number | All-in percentage |
| `fees.total.usd` | number | All-in USD amount |
| `settlement.netUsd` | number | Amount received after fees |
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
| `usdHealth.confidenceInOfficialData` | `HIGH` / `MODERATE` / `LOW` — flags when independent inflation data diverges from official sources by >1.5pp |
| `usdHealth.usdStrengthConsensus` | `BULLISH` / `BEARISH` / `MIXED` / `NEUTRAL` — cross-signal consensus |
| `usdHealth.tradeWeightedUsd` | Trade-weighted dollar index (26 currencies, Federal Reserve), trend direction |
| `usdHealth.yieldCurve` | T10Y2Y spread, `INVERTED` / `FLAT` / `NORMAL`, recession signal |
| `usdHealth.breakevenInflation` | 10-year breakeven vs 2% target — elevated flag if >2.75% |
| `usdHealth.fedBalanceSheet` | Total Fed assets in trillions, `EXPANDING` / `CONTRACTING` / `STABLE` |
| `usdHealth.gold` | Gold price (USD), trend, interpretation — >$2500 = USD debasement signal |
| `usdHealth.stablecoinHealth` | USDT + USDC market caps, dominance ratio, stress signal |
| `usdHealth.truflationVsBls` | Independent inflation source vs official CPI — `divergenceFlag: true` if gap >1.5pp |
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

## GET /api/adaptive/status

Adaptive layer diagnostics — current learned weights, prediction ledger count, and circuit breaker state.

```bash
curl https://stability.untitledfinancial.com/api/adaptive/status
```

**Response:**

| Field | Description |
|---|---|
| `status` | `ACTIVE` / `DISABLED` (disabled if D1 not bound) |
| `weights` | Current adaptive tier weights `{ climate, commodity, macro, fx, basket, geopolitical, capital }` |
| `predictions` | Total resolved prediction rows in the ledger |
| `circuitBreakers` | Array of breaker states `{ breaker_name, is_open, failure_count }` |

When the adaptive layer is active, `weights` will gradually drift from the default values as the regression learns which tiers are most predictive. The `ADAPTIVE_CONFIDENCE_THRESHOLD` environment variable controls whether autonomous on-chain policy execution is enabled (default `0.99` = disabled until manually lowered after testnet validation).

---

## Corridor Intelligence

### POST /stability/corridor

Corridor-specific stability score for any currency pair. Combines the global oracle score with per-corridor regulatory penalties, FX session liquidity, weekend penalty, and cascade adjustment to produce an actionable settlement recommendation.

```bash
curl -X POST https://stability.untitledfinancial.com/stability/corridor \
  -H "Content-Type: application/json" \
  -d '{
    "from": "USD",
    "to": "BRL",
    "amount": 5000000
  }'
```

| Field | Type | Description |
|---|---|---|
| `from` | string | Source currency (ISO-4217) |
| `to` | string | Destination currency (ISO-4217) |
| `amount` | number | Settlement amount in `from` currency (optional — triggers large-amount flag ≥ $5M) |

**Response fields:**

| Field | Description |
|---|---|
| `corridor.recommendation` | `SETTLE_NOW` / `DELAY_24H` / `DELAY_48H` |
| `corridor.score` | 0–100 composite (global oracle + corridor adj + liquidity + cascade penalty) |
| `corridor.tier` | `OPTIMAL` / `FAVORABLE` / `CAUTION` / `ELEVATED_RISK` / `ADVERSE` |
| `corridor.regulatoryFlags` | Jurisdiction-specific flags (e.g., `BCB_RESOLUTION_561`, `CBN_CONTROLS`) |
| `components.corridorAdjustment` | Static pair adjustment (−30 to +10) |
| `components.cascadePenalty` | −15 / −8 / −3 / 0 based on current cascade level |
| `components.weekendPenalty` | −8 if UTC day is Saturday or Sunday |
| `regulatoryWarning` | Present for BRL corridors only — see below |

**BRL regulatory warning (`regulatoryWarning`):**

Any corridor involving BRL returns a top-level `regulatoryWarning` object:

```json
{
  "regulatoryWarning": {
    "flag": "BCB_RESOLUTION_561",
    "severity": "HIGH",
    "deadline": "2026-10-01",
    "daysRemaining": 90,
    "summary": "BCB Resolution 561 prohibits stablecoin eFX transactions in Brazil effective 2026-10-01.",
    "action": "Migrate BRL flows to a compliant structure before the deadline...",
    "source": "Banco Central do Brasil — Resolução BCB nº 561"
  }
}
```

Severity escalates to `CRITICAL` within 30 days of the deadline. The same warning appears in `/flow-check` responses for BRL pairs.

**Last-mile partners (`lastMilePartners`):**

For non-USD/EUR destination currencies, the response includes a `lastMilePartners` array of licensed PSPs that handle the fiat conversion leg. DPX settles the cross-border stablecoin leg; these partners handle local disbursement. Example for `to=NGN`:

```json
{
  "lastMilePartners": [
    {
      "name": "Grey Finance",
      "type": "FINTECH",
      "licensor": "CBN",
      "note": "CBN-licensed — USD/USDC → NGN with virtual accounts",
      "url": "https://grey.co"
    },
    {
      "name": "Flutterwave",
      "type": "PSP",
      "licensor": "CBN",
      "note": "Pan-African PSP with NGN disbursement",
      "url": "https://flutterwave.com"
    }
  ]
}
```

Partners are provided for: BRL, NGN, PHP, INR, KES, GHS, TRY, MXN, ZAR, EGP, PKR, IDR, THB, VND, BDT, LKR, TZS, UGX, MAD, CLP, COP, PEN, ETB. USD, EUR, GBP, AED, SAR, QAR, SGD, HKD, JPY settle natively — no last-mile conversion needed.

**Coverage:** BRL, TRY, ARS, NGN, PKR, EGP, EUR, GBP, SGD, JPY, HKD, CNH, INR, MXN, ZAR, CLP, COP, PEN, BOB, UYU, KES, GHS, TZS, UGX, ETB, MAD, BDT, LKR, VND, PHP, IDR, THB, MYR, AED, SAR, QAR, ILS, PLN, CZK, RON, UAH. Unlisted pairs return the global oracle score without corridor adjustment.

---

### POST /stability/settlement-window

Optimal 4-hour execution windows over the next 72 hours, ranked by composite settlement score. Factors in oracle outlook, cascade decay/growth trajectory, FX session liquidity, and (optionally) counterparty ESG tier.

```bash
curl -X POST https://stability.untitledfinancial.com/stability/settlement-window \
  -H "Content-Type: application/json" \
  -d '{
    "from": "USD",
    "to": "EUR",
    "amount": 8000000,
    "lei": "7LTWFZYICNSX8D621K86"
  }'
```

| Field | Type | Description |
|---|---|---|
| `from` | string | Source currency |
| `to` | string | Destination currency |
| `amount` | number | Settlement amount (optional) |
| `lei` | string | Counterparty LEI — pulls ESG score to adjust window scoring (optional) |

**Response fields:**

| Field | Description |
|---|---|
| `windows` | Array of 18 × 4h slots — each with UTC timestamp, compositeScore, liquidityScore, cascadeFactor, recommendation |
| `optimalWindow` | Highest-scored window with full details |
| `esgTier` | Counterparty ESG tier if LEI provided (affects fee but not window ranking) |
| `largeAmountNote` | Warning if amount ≥ $5M — recommends coordination with treasury desk |

The scoring model decays cascade risk over time on IMPROVING outlooks (risk clears faster) and grows it on DETERIORATING outlooks (risk accumulates). Weekend slots apply a −8 liquidity penalty.

---

## Settlement Agent endpoints

Settlement execution, routing, and ISO 20022 intake live on the Settlement Agent (`agent.untitledfinancial.com`).

### GET /route — Multi-stablecoin routing

Rank USDC, EURC, and USDT for any amount and currency pair. Returns the recommended token and a ready-to-use `/settle` body.

```bash
GET https://agent.untitledfinancial.com/route?amount=85000&from=USD&to=EUR
```

```json
{
  "routingAdvice": {
    "recommendation": "EURC",
    "rationale": "EURC eliminates FX conversion for EUR destination — no cross-currency fee applied"
  },
  "options": [
    { "rank": 1, "token": "EURC", "isCrossCurrency": false },
    { "rank": 2, "token": "USDC", "isCrossCurrency": true },
    { "rank": 3, "token": "USDT", "isCrossCurrency": true }
  ],
  "settleEndpoint": "https://agent.untitledfinancial.com/settle"
}
```

No auth required. Response is valid for `ttlSeconds` (300s).

### POST /iso20022 — ISO 20022 pain.001 intake

See [SWIFT Compatibility](/integrations/swift#direct-pain001-intake) for the full reference.

### GET /widgets/{type} — Embeddable HTML widgets

See [Compliance Oracle API](/api/compliance-oracle#embeddable-widgets) for the full reference. Types: `sanctions`, `esg`, `corridor`.

---

## Machine Discovery

| URL | Format |
|---|---|
| `https://stability.untitledfinancial.com/openapi.json` | OpenAPI 3.0 |
| `https://stability.untitledfinancial.com/.well-known/ai-plugin.json` | Agent plugin manifest |
| `https://stability.untitledfinancial.com/llms.txt` | LLM navigation index |
| `https://stability.untitledfinancial.com/llms-full.txt` | Full docs for LLM context |
