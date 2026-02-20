---
title: ESG Oracle API
description: Complete endpoint reference for the DPX ESG Oracle (port 3001).
---

No authentication required. All responses are JSON.

**Base URL:** `localhost:3001` (local) · `https://esg.dpx.finance` (production)

---

## GET /manifest

ESG oracle discovery. Call once and cache.

```bash
curl localhost:3001/manifest
```

---

## GET /esg-score

Live E, S, G scores and the current ESG fee. Use `scores.average` as the `esgScore` parameter when calling `/quote` on the Stability Oracle.

```bash
curl localhost:3001/esg-score
```

**Response:**

| Field | Example | Description |
|---|---|---|
| `scores.environmental` | 78 | Environmental score 0–100 |
| `scores.social` | 72 | Social score 0–100 |
| `scores.governance` | 81 | Governance score 0–100 |
| `scores.average` | 77 | Average of E, S, G |
| `fee.pct` | 0.115 | Current ESG fee % |
| `fee.bps` | 11.5 | Current ESG fee in basis points |
| `fee.tier` | "Good" | ESG tier label |
| `fee.formula` | `"(100 - esgScore) / 200"` | Formula used |

---

## GET /fee-schedule

Full ESG fee table across all score tiers.

```bash
curl localhost:3001/fee-schedule
```

---

## GET /quote

ESG fee for a specific transaction. Omit `esgScore` to use the live oracle score.

```bash
# Use live ESG score
curl "localhost:3001/quote?amountUsd=1000000"

# Use a specific ESG score
curl "localhost:3001/quote?amountUsd=1000000&esgScore=75"
```

**Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `amountUsd` | number | Yes | Transaction amount in USD |
| `esgScore` | number | No | Override ESG score (uses live score if omitted) |

## POST /quote

Same as GET, accepts JSON body:

```bash
curl -X POST localhost:3001/quote \
  -H "Content-Type: application/json" \
  -d '{"amountUsd": 1000000, "esgScore": 75}'
```

---

## GET /reliability

ESG oracle uptime and score history.

```bash
curl localhost:3001/reliability
```

---

## GET /health

ESG oracle liveness check.

```bash
curl localhost:3001/health
# {"status": "healthy", "esgOracle": "SUCCESS"}
```

---

## Machine Discovery

| URL | Format |
|---|---|
| `localhost:3001/openapi.json` | ESG Oracle OpenAPI 3.0 |
| `localhost:3001/.well-known/ai-plugin.json` | ESG Oracle plugin manifest |
| `localhost:3001/llms.txt` | ESG Oracle LLM index |
