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

## Machine Discovery

| URL | Format |
|---|---|
| `https://esg.untitledfinancial.com/openapi.json` | ESG Oracle OpenAPI 3.0 |
| `https://esg.untitledfinancial.com/.well-known/ai-plugin.json` | ESG Oracle plugin manifest |
| `https://esg.untitledfinancial.com/llms.txt` | ESG Oracle LLM index |
