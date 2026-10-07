---
title: Reports
description: AI-synthesized institutional reports across DPX oracle data — pay per report via x402, no API key required.
---

# DPX Reports

`reports.untitledfinancial.com` — AI-synthesized institutional-grade reports across the full DPX oracle stack. Each report aggregates live data from multiple internal data sources and produces a structured narrative via the AI synthesis layer.

Reports are gated via the [x402 micropayment protocol](/integrations/x402). Callers pay USDC on Base mainnet per request. No account or API key is required.

---

## Available reports

| Report | Endpoint | Coverage |
|---|---|---|
| Climate | `GET /report/climate` | TCFD physical risk, commodity stress, climate outlook |
| Macro | `GET /report/macro` | Stability score, macro regime, 90-day outlook |
| ESG | `GET /report/esg` | SFDR PAI indicators, ESG sub-scores, CSRD data |
| Compliance | `GET /report/compliance` | AML/sanctions screening, PEP check, Travel Rule status |
| Treasury | `GET /report/treasury` | Settlement volume, corridor performance, AI decision audit |
| Scenario | `POST /report/scenario` | Multi-position decision brief — regime, commodity, currency, sovereign, and entity signals compared across current/30d/60d/90d/tail horizons |

---

## How it works

1. Caller sends `GET /report/{type}` with no payment header → receives HTTP 402 with the x402 payment descriptor
2. Caller pays USDC on Base mainnet using the x402 descriptor
3. Caller resends the request with `X-PAYMENT: <receipt>` → receives the full report
4. Reports are cached for 60 minutes — repeated calls with a valid payment within the cache window receive the same report instantly

---

## Request format

```http
GET /report/climate HTTP/1.1
Host: reports.untitledfinancial.com
X-PAYMENT: <x402-payment-receipt>
```

Query parameters for entity-specific reports:

| Report | Parameters |
|---|---|
| `/report/esg` | `?address=0x...` (wallet address) or `?lei=...` |
| `/report/compliance` | `?lei=...` and/or `?name=...` (at least one required) |
| `/report/treasury` | `?period=YYYY-MM` (optional, defaults to current month) |

`/report/scenario` is the one `POST` report — it takes a JSON body instead of query params:

```json
{
  "positions": [
    { "type": "commodity",     "symbol": "WHEAT", "weight": 1 },
    { "type": "currency_pair", "from": "USD", "to": "BRL" },
    { "type": "sovereign",     "country": "BR" },
    { "type": "entity",        "address": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984" }
  ],
  "scenario": "la_nina_severe"
}
```

`positions` is required (max 20, each a `commodity` | `currency_pair` | `sovereign` | `sector` | `entity`). `scenario` is optional — name a [built-in commodity scenario](/api/commodity-forecast) to compare against (ignored for non-commodity positions). The report fans out to existing signal endpoints in parallel per position type — it is decision support for comparing a position/portfolio across conditions, not a prediction market or a resolution/settlement oracle.

---

## 402 preview response

Without an `X-PAYMENT` header, every endpoint returns HTTP 402 with the payment descriptor and a preview of report contents:

```json
{
  "x402Version": 1,
  "accepts": [{
    "scheme": "exact",
    "network": "base-mainnet",
    "maxAmountRequired": "2000000",
    "resource": "https://reports.untitledfinancial.com/report/climate",
    "description": "DPX Climate Report — AI-synthesized institutional analysis. Fee: $2.00 USDC.",
    "payTo": "0x<fee-collector-address>",
    "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
  }],
  "reportPreview": {
    "type": "climate",
    "whatYouGet": [
      "TCFD physical risk assessment — heat, flood, drought, supply chain",
      "Commodity stress signals across 11 markets",
      "Climate outlook: STABLE / ELEVATED / CRITICAL",
      "AI-synthesized narrative with key risk factors and action guidance"
    ],
    "fee": { "amountUsdc": "$2.00", "asset": "USDC on Base mainnet" }
  }
}
```

---

## Report response

All five single-position reports are **$2.00 USDC**. The scenario report is **$5.00 USDC** — it fans out to more signal endpoints than any other report. Its envelope adds two fields: `partial` (`true` if any signal source was unreachable) and `unavailableSignals` (which ones) — the report still synthesizes from whatever succeeded rather than failing the whole request.

All reports share a common envelope:

```json
{
  "reportType": "climate",
  "period": "2026-07",
  "generatedAt": "2026-07-05T16:30:00.000Z",
  "synthesis": {
    "summary": "Physical climate risk is elevated across agricultural corridors...",
    "keyFindings": [
      "Heat stress index in Southeast Asia at 78/100 — 12-year high",
      "Corn and soy futures showing supply-side pressure (+8.3% 30d)",
      "USD structural health score 71 — caution band"
    ],
    "riskLevel": "ELEVATED",
    "narrative": {
      "Physical Risk": "TCFD heat-adjusted risk signals indicate...",
      "Commodity Stress": "Across 11 tracked commodity markets..."
    },
    "recommendations": [
      "Review USD-denominated settlement exposure in APAC corridors",
      "Monitor SFDR PAI indicator 7 (biodiversity) for supply chain exposure"
    ],
    "dataQuality": "LIVE"
  },
  "data": { /* raw oracle data used in synthesis */ },
  "sources": ["DPX Commodity Forecast Oracle", "TCFD Physical Risk Model"]
}
```

### `riskLevel` values

| Value | Meaning |
|---|---|
| `LOW` | No material signals detected |
| `MODERATE` | Elevated signals; monitor |
| `ELEVATED` | Action recommended |
| `HIGH` | Immediate attention required |
| `CRITICAL` | System-level event underway |

### `dataQuality` values

| Value | Meaning |
|---|---|
| `LIVE` | All data sources responded |
| `PARTIAL` | One or more sources unavailable; synthesis used available data |
| `ESTIMATED` | Historical or interpolated data used |

---

## Report data sources

| Report | Sources |
|---|---|
| Climate | DPX Commodity Forecast Oracle · TCFD Physical Risk Model |
| Macro | DPX Stability Oracle v9 · Rail Status Monitor |
| ESG | DPX ESG Oracle · World Bank WGI · UN Global Compact · SFDR Annex I |
| Compliance | OpenSanctions · GLEIF LEI Registry · FATF Country Risk · DPX Compliance Oracle |
| Treasury | DPX Settlement Agent D1 · Corridor Feedback Signal |
| Scenario | DPX Intelligence API (transition-risk, causal-graph, currency-stress, sovereign-debt, supply-chain, shipping-stress, esg, financed-emissions) · DPX Commodity Forecast Oracle |

---

## A2A agent discovery

The reports worker publishes a Google A2A-compatible agent card:

```
GET https://reports.untitledfinancial.com/.well-known/agent.json
```

The card describes each report as a skill with its payment requirements, enabling agent-to-agent discovery and automated report procurement.

---

## Health check

```
GET https://reports.untitledfinancial.com/health
```

Returns `{ "status": "ok", "service": "dpx-reports", "version": "1.0.0" }`.
