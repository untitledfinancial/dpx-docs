---
title: Commodity Forecast API
description: Climate-driven commodity intelligence for 11 markets — outlook, portfolio stress testing, scenario analysis, TCFD reports, and real-time heat-check. Live at forecast.untitledfinancial.com.
---

No authentication required. All responses are JSON.

**Base URL:** `https://forecast.untitledfinancial.com`

The Commodity Forecast API produces climate-driven intelligence across 11 commodity markets. Every forecast synthesises live climate signals — temperature anomaly, drought index, wildfire activity, and extreme weather events — against current price data from FRED. Responses include structured reasoning, a confidence score, and a forward outlook.

**Supported commodities:**

| Symbol | Commodity |
|---|---|
| `WHEAT` | Wheat |
| `CORN` | Corn |
| `SOYB` | Soybeans |
| `COFFEE` | Coffee |
| `COCOA` | Cocoa |
| `COTTON` | Cotton |
| `SUGAR` | Sugar |
| `WTI` | Crude Oil (WTI) |
| `NG` | Natural Gas |
| `COPPER` | Copper |
| `LUMBER` | Lumber |

**Data sources:** Open-Meteo (temperature anomaly), USDM (US drought monitor), NASA EONET (active wildfires), GDACS (global disaster alerts), FRED (commodity prices)

---

## GET /forecast/heat-check

All 11 commodities at a glance — RED / YELLOW / GREEN status with a one-line signal summary for each. Use this for dashboards and triage.

```bash
curl https://forecast.untitledfinancial.com/forecast/heat-check
```

**Response:**

```json
{
  "asOf": "2026-07-03T17:00:00Z",
  "commodities": [
    {
      "symbol": "WHEAT",
      "status": "RED",
      "signal": "Severe drought across Black Sea production zone, yield outlook deteriorating"
    },
    {
      "symbol": "CORN",
      "status": "YELLOW",
      "signal": "Temperature anomaly elevated in US Midwest, monitoring La Niña development"
    },
    {
      "symbol": "COPPER",
      "status": "GREEN",
      "signal": "Supply stable, climate disruption risk low across primary mining corridors"
    }
  ]
}
```

| Status | Meaning |
|---|---|
| `GREEN` | Climate disruption risk low — supply chains stable |
| `YELLOW` | Elevated risk — monitor closely, hedging recommended |
| `RED` | Active disruption signal — material impact on supply or price likely |

---

## GET /forecast/commodity/:symbol

Full climate-driven outlook for a single commodity. Includes current price, climate signal stack, risk score, and AI synthesis.

```bash
curl https://forecast.untitledfinancial.com/forecast/commodity/WHEAT
curl https://forecast.untitledfinancial.com/forecast/commodity/WTI
curl https://forecast.untitledfinancial.com/forecast/commodity/COFFEE
```

**Response fields:**

| Field | Type | Description |
|---|---|---|
| `symbol` | string | Commodity symbol |
| `currentPrice` | number | Latest price from FRED |
| `climateRiskScore` | number | 0–100 composite risk score (higher = more disruption risk) |
| `status` | string | `GREEN` / `YELLOW` / `RED` |
| `signals.temperatureAnomaly` | number | Current temp anomaly vs 30-year baseline (°C) |
| `signals.droughtIndex` | number | US Drought Monitor severity index |
| `signals.wildfireActivity` | number | Active NASA EONET wildfire events in production regions |
| `signals.extremeWeatherEvents` | number | Active GDACS alerts affecting supply chains |
| `outlook` | string | `IMPROVING` / `STABLE` / `DETERIORATING` / `UNCERTAIN` |
| `reasoning` | string | AI synthesis of primary climate drivers |
| `confidence` | number | 0.0–1.0 — reflects data freshness and signal coverage |
| `productionRegions` | array | Key production regions and their current climate exposure |

---

## GET /forecast/regions

All monitored production regions ranked by current climate risk. Useful for supply chain exposure mapping and procurement decisions.

```bash
curl https://forecast.untitledfinancial.com/forecast/regions
```

**Response:** Array of regions, each with:

| Field | Description |
|---|---|
| `region` | Region name (e.g. "Black Sea Basin", "US Midwest Corn Belt") |
| `commodities` | Array of commodities produced in this region |
| `climateRiskScore` | 0–100 composite risk |
| `activeAlerts` | Count of active GDACS / NASA EONET events |
| `primaryThreat` | Dominant climate signal (drought / wildfire / flood / heat stress / storm) |
| `outlook` | `IMPROVING` / `STABLE` / `DETERIORATING` |

---

## GET /forecast/calendar

12-month seasonal climate risk calendar. Returns the primary climate events and their commodity impact windows for forward planning.

```bash
curl https://forecast.untitledfinancial.com/forecast/calendar
```

**Response:** 12 entries (one per month), each including:

| Field | Description |
|---|---|
| `month` | Month name |
| `events` | Array of seasonal climate events (e.g. "Atlantic hurricane season peak", "La Niña harvest impact — Southern Hemisphere grains") |
| `commoditiesAtRisk` | Symbols most exposed during this period |
| `historicalSeverity` | `LOW` / `MODERATE` / `HIGH` — based on historical disruption frequency |

---

## POST /forecast/portfolio

Climate stress test across a portfolio of commodity positions. Returns exposure by risk tier, worst-case scenario impact, and per-commodity breakdown.

```bash
curl -X POST https://forecast.untitledfinancial.com/forecast/portfolio \
  -H "Content-Type: application/json" \
  -d '{
    "positions": [
      { "symbol": "WHEAT", "notionalUsd": 5000000 },
      { "symbol": "CORN",  "notionalUsd": 3000000 },
      { "symbol": "WTI",   "notionalUsd": 8000000 }
    ],
    "label": "Q3 2026 Agricultural Book"
  }'
```

**Request fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `positions` | array | Yes | Array of `{ symbol, notionalUsd }` objects |
| `label` | string | No | Portfolio label for reporting |

**Response includes:**

| Field | Description |
|---|---|
| `portfolioRiskScore` | Weighted composite risk (0–100) |
| `exposureByTier` | Notional USD in GREEN / YELLOW / RED positions |
| `worstCaseDrawdown` | Estimated portfolio drawdown under active stress scenarios |
| `positions` | Per-commodity breakdown with risk score, status, and outlook |
| `recommendations` | AI-synthesised hedging and rebalancing observations |

---

## POST /forecast/scenario

What-if analysis against 9 built-in climate scenarios. Returns projected price impact and supply disruption estimates for each affected commodity.

```bash
curl -X POST https://forecast.untitledfinancial.com/forecast/scenario \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "la_nina",
    "positions": [
      { "symbol": "WHEAT", "notionalUsd": 5000000 },
      { "symbol": "SOYB",  "notionalUsd": 2000000 }
    ]
  }'
```

**Available scenarios:**

| Scenario ID | Description |
|---|---|
| `la_nina` | La Niña event — drought in Southern Hemisphere, flooding in Southeast Asia |
| `gulf_hurricane` | Category 4+ Gulf of Mexico hurricane — energy infrastructure and grain export disruption |
| `black_sea_disruption` | Black Sea corridor disruption — wheat, corn, sunflower supply shock |
| `amazon_drought` | Severe Amazon basin drought — soy, coffee, sugar production impact |
| `sahel_heatwave` | West Africa extreme heat — cocoa, coffee production stress |
| `us_midwest_drought` | US Corn Belt drought — corn, soy, wheat yield reduction |
| `arctic_blast` | Polar vortex event — natural gas demand spike, logistics disruption |
| `pacific_typhoon` | Western Pacific typhoon season escalation — copper, electronics supply chain |
| `global_heatwave` | Simultaneous multi-region heat stress — broad agricultural impact |

**Response includes:** scenario description, probability estimate, affected commodities, projected price impact range (%), supply reduction estimate (%), time horizon, and AI synthesis.

---

## POST /forecast/tcfd-report

Generates a TCFD (Task Force on Climate-related Financial Disclosures) physical risk report for a commodity portfolio. Output is formatted to the TCFD template — ready for board reporting, investor disclosure, or regulatory submission.

```bash
curl -X POST https://forecast.untitledfinancial.com/forecast/tcfd-report \
  -H "Content-Type: application/json" \
  -d '{
    "positions": [
      { "symbol": "WHEAT", "notionalUsd": 5000000 },
      { "symbol": "CORN",  "notionalUsd": 3000000 },
      { "symbol": "COPPER","notionalUsd": 4000000 }
    ],
    "entityName": "Acme Treasury Ltd",
    "reportingPeriod": "2026-Q2"
  }'
```

**Request fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `positions` | array | Yes | Commodity positions with notional exposure |
| `entityName` | string | No | Entity name for the report header |
| `reportingPeriod` | string | No | Reporting period label |

**Response structure (TCFD-aligned):**

| Section | Content |
|---|---|
| `governance` | Climate risk oversight summary (pre-populated template language) |
| `strategy.physicalRisks` | Acute and chronic physical risk exposure per commodity position |
| `strategy.scenarioAnalysis` | Two-scenario analysis (moderate and severe disruption) |
| `riskManagement.exposureByTier` | Portfolio split across GREEN / YELLOW / RED |
| `riskManagement.worstCase` | Tail risk estimate under severe scenario |
| `metrics.portfolioRiskScore` | Composite 0–100 physical risk score |
| `metrics.notionalAtRisk` | USD at elevated or high risk |
| `metrics.topRisks` | Top 3 commodity-specific risk items |
| `disclosure` | Data sources, methodology note, confidence levels |

---

## MCP tools

The Commodity Forecast API is accessible via the DPX MCP server. Five tools are available for agent use:

| Tool | Description |
|---|---|
| `commodity.heat_check` | All 11 commodities — RED / YELLOW / GREEN status at a glance |
| `commodity.forecast` | Full climate outlook for a single commodity |
| `commodity.portfolio` | Climate stress test across a position set |
| `commodity.scenario` | What-if analysis against built-in climate scenarios |
| `commodity.tcfd` | TCFD physical risk report for a portfolio |

Connect via:

```bash
npx @untitledfinancial/dpx-mcp
```

---

## Error handling

All endpoints return standard HTTP status codes. Errors include a `message` field with a plain-language description.

| Code | Meaning |
|---|---|
| `400` | Invalid symbol or malformed request body |
| `404` | Symbol not supported |
| `503` | Upstream climate data source temporarily unavailable — retry after 60s |
