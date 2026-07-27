---
title: ESG Oracle API
description: Complete endpoint reference for the DPX ESG Oracle.
---

No authentication required. All responses are JSON.

**Base URL:** `https://esg.untitledfinancial.com`

---

## GET /manifest

ESG oracle discovery. Call once and cache.

```bash
curl https://esg.untitledfinancial.com/manifest
```

---

## GET /esg-score

Live E, S, G scores and the current ESG fee. Use `scores.average` as the `esgScore` parameter when calling `/quote` on the Stability Oracle.

```bash
curl https://esg.untitledfinancial.com/esg-score
```

**Response:**

| Field | Example | Description |
|---|---|---|
| `scores.environmental` | 78 | Environmental score 0–100 |
| `scores.social` | 72 | Social score 0–100 (composite of education, health, human rights, gender equity) |
| `scores.governance` | 81 | Governance score 0–100 |
| `scores.average` | 77 | Average of E, S, G |
| `fee.pct` | 0.115 | Current ESG fee % |
| `fee.bps` | 11.5 | Current ESG fee in basis points |
| `fee.tier` | "Good" | ESG tier label |
| `fee.formula` | `"(100 - esgScore) / 200"` | Formula used |

**AI intelligence layer** — when present, the `intelligence` object provides synthesised ESG context:

| Field | Type | Description |
|---|---|---|
| `intelligence.reasoning` | string | Plain-language explanation of primary ESG drivers, current data signals, and risk areas |
| `intelligence.confidence` | number (0–1) | AI confidence in the synthesis, reflecting data freshness and source coverage |
| `intelligence.alerts` | string[] | Up to 3 concise ESG risk items relevant to institutional counterparties |
| `intelligence.outlook` | string | `IMPROVING` / `STABLE` / `DETERIORATING` / `UNCERTAIN` |
| `intelligence.model` | string | AI model used for synthesis |
| `intelligence.generatedAt` | string | ISO 8601 timestamp of synthesis |

The `intelligence` field provides qualitative context only. Use `scores.average` as the authoritative input for fee calculations.

**Social (S) sub-dimensions** — the Social score is a proprietary composite including human rights, education, gender equity, and health indicators drawn from UN SDG and ILO data. Full methodology is available to approved partners under NDA.

---

## GET /fee-schedule

Full ESG fee table across all score tiers.

```bash
curl https://esg.untitledfinancial.com/fee-schedule
```

---

## GET /quote

ESG fee for a specific transaction. Omit `esgScore` to use the live oracle score.

```bash
# Use live ESG score
curl "https://esg.untitledfinancial.com/quote?amountUsd=1000000"

# Use a specific ESG score
curl "https://esg.untitledfinancial.com/quote?amountUsd=1000000&esgScore=75"
```

**Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `amountUsd` | number | Yes | Transaction amount in USD |
| `esgScore` | number | No | Override ESG score (uses live score if omitted) |

## POST /quote

Same as GET, accepts JSON body:

```bash
curl -X POST https://esg.untitledfinancial.com/quote \
  -H "Content-Type: application/json" \
  -d '{"amountUsd": 1000000, "esgScore": 75}'
```

---

## GET /api/adaptive/status

Adaptive layer diagnostics — current learned E/S/G weights, prediction ledger count, and circuit breaker state.

```bash
curl https://esg.untitledfinancial.com/api/adaptive/status
```

**Response:**

| Field | Description |
|---|---|
| `status` | `ACTIVE` / `DISABLED` |
| `weights` | Current adaptive E/S/G weights `{ e, s, g }` (sum = 1.0) |
| `predictions` | Total resolved prediction rows in the ledger |
| `circuitBreakers` | Array of breaker states `{ breaker_name, is_open, failure_count }` |

---

## GET /reliability

ESG oracle uptime and score history.

```bash
curl https://esg.untitledfinancial.com/reliability
```

---

## GET /health

ESG oracle liveness check.

```bash
curl https://esg.untitledfinancial.com/health
# {"status": "healthy", "esgOracle": "SUCCESS"}
```

---

## GET /widget/esg — Embeddable ESG lookup widget

Returns server-rendered HTML with a form for entering a company name or LEI and displaying E/S/G scores as a bar chart. No API key required.

```html
<iframe src="https://esg.untitledfinancial.com/widget/esg"
  width="100%" height="360" style="border:none;border-radius:8px"></iframe>
```

---

## Entity-Level Scoring

In addition to the settlement-integrated score above, the ESG Oracle provides entity-level scoring for individual counterparties, portfolios, and supply chains using GLEIF, SEC EDGAR, BLS, OSHA, and World Bank sources. This is a distinct product from the [Intelligence API's `/v1/intelligence/esg/:address`](/api/intelligence-api#get-v1intelligenceesgaddress--025) endpoint, which scores any EVM address or LEI from a different source mix (GLEIF, EPA ECHO, OSHA) and weighting model — use the endpoints below for LEI/company-name lookups against this oracle's own scoring history, and the Intelligence API endpoint for address-based due diligence.

---

### GET /esg/lookup

Resolve a company name or LEI to a full entity-level ESG score. GLEIF-resolved, cached 4 hours.

```bash
curl "https://esg.untitledfinancial.com/esg/lookup?q=Deutsche+Bank&country=DE"
```

| Parameter | Description |
|---|---|
| `q` | Company name or LEI (20-char alphanumeric) |
| `country` | ISO-2 country code to narrow GLEIF resolution (optional) |

---

### POST /esg/batch

Score up to 50 entities in one call (synchronous) or up to 500 via async job. Results ranked by composite score descending.

```bash
curl -X POST https://esg.untitledfinancial.com/esg/batch \
  -H "Content-Type: application/json" \
  -d '{ "leis": ["7LTWFZYICNSX8D621K86"], "names": ["Siemens AG"], "since": "2026-01-01" }'
```

| Field | Description |
|---|---|
| `leis` | Array of 20-char GLEIF LEIs |
| `names` | Array of company names (GLEIF-resolved) |
| `since` | ISO date — each result includes `delta` vs score at that date |
| `webhookUrl` | Provide to trigger async processing (>50 entities automatically async) |

Each result carries `confidence` (HIGH/MEDIUM/LOW based on data source coverage), `cacheAgeHours`, and `failureReason` (GLEIF_NOT_FOUND / SCORING_ERROR / LOW_COVERAGE) on failures.

**Async batches (>50 entities or `webhookUrl` provided):**
- Returns `{ jobId, pollUrl, estimatedSeconds }` with HTTP 202
- Poll `GET /esg/job/:id` for status and results
- Webhook fires on completion with full results payload

---

### POST /esg/portfolio

Score an entire counterparty portfolio (up to 200 entities). Returns portfolio composite, tier distribution, MiCA Article 72 status, SFDR PAI flags, worst offenders, and top performers.

```bash
curl -X POST https://esg.untitledfinancial.com/esg/portfolio \
  -H "Content-Type: application/json" \
  -d '{ "leis": ["...", "..."], "label": "Q2 2026 Counterparties" }'
```

---

### GET /esg/velocity/:lei

Predictive ESG deterioration signal. Analyzes recent score history and projects when the entity will cross the next tier boundary. Methodology is proprietary.

```bash
curl "https://esg.untitledfinancial.com/esg/velocity/7LTWFZYICNSX8D621K86?days=90"
```

**Response includes:** trajectory (IMPROVING / STABLE / DETERIORATING), slope in pts/month, residual standard error, confidence (HIGH/MEDIUM/LOW), and projected tier-crossing dates within 365 days.

---

### POST /esg/supply-chain

ESG exposure across a company's direct subsidiaries via GLEIF relationship records. Scores all linked entities and returns an exposure map with SFDR PAI-2 flag.

```bash
curl -X POST https://esg.untitledfinancial.com/esg/supply-chain \
  -H "Content-Type: application/json" \
  -d '{ "lei": "7LTWFZYICNSX8D621K86", "maxEntities": 50 }'
```

**Response includes:** exposureComposite, highRiskPct, SFDR PAI-2 flag, tier distribution, worst offenders, and per-subsidiary scores.

---

### GET /esg/sector-benchmark

Peer distribution (p25 / median / p75) for a sector and country, built from all entities scored through the oracle. Grows with each batch — returns a 503 with guidance if insufficient data exists for a sector.

```bash
curl "https://esg.untitledfinancial.com/esg/sector-benchmark?sector=financial_services&country=DE&days=90"
```

**Sectors:** `financial_services`, `energy`, `technology`, `healthcare`, `manufacturing`, `real_estate`, `consumer`, `logistics`, `diversified`

---

### GET /esg/controversy/:lei

30-day adverse media scan via GDELT. Returns article count, severity (LOW / MODERATE / HIGH / CRITICAL), category breakdown (REGULATORY / ENVIRONMENTAL / LABOR / GOVERNANCE / FINANCIAL), and estimated ESG score impact (0 to −15 points).

```bash
curl "https://esg.untitledfinancial.com/esg/controversy/7LTWFZYICNSX8D621K86?days=30"
```

---

### GET /esg/trend/:lei

Historical composite trend for a LEI. Returns direction, delta, and full score history.

```bash
curl "https://esg.untitledfinancial.com/esg/trend/7LTWFZYICNSX8D621K86?days=90"
```

---

### POST /esg/watch

Register an entity for ongoing monitoring. Fires a webhook when score shifts by ≥ N points.

```bash
curl -X POST https://esg.untitledfinancial.com/esg/watch \
  -H "Content-Type: application/json" \
  -d '{ "lei": "7LTWFZYICNSX8D621K86", "webhookUrl": "https://...", "thresholdPoints": 5 }'
```

Manage via `GET /esg/watch/:id` and `DELETE /esg/watch/:id`.

---

### GET /entity/:lei/profile

Single-call unified counterparty profile. Aggregates ESG score + governance score + GLEIF entity details + compliance and controversy pointers into one response. Reduces agent round-trips from 5 calls to 1.

```bash
curl "https://esg.untitledfinancial.com/entity/7LTWFZYICNSX8D621K86/profile"
```

**Response includes:** overallRisk (composite of ESG 60% + governance 40%), per-pillar ESG breakdown, governance tier and MiCA flag, GLEIF entity details, and links to compliance screen and controversy check endpoints.

---

## Machine Discovery

| URL | Format |
|---|---|
| `https://esg.untitledfinancial.com/openapi.json` | ESG Oracle OpenAPI 3.0 |
| `https://esg.untitledfinancial.com/.well-known/ai-plugin.json` | ESG Oracle plugin manifest |
| `https://esg.untitledfinancial.com/llms.txt` | ESG Oracle LLM index |
