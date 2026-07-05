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
    "payTo": "0x160e920012fb4BAe2E465c1eD8815c5FD51B5Ce0",
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
