---
title: Google Vertex AI
description: Connect DPX to Gemini models via Vertex AI Extensions or Agent Builder.
---

Two paths depending on your setup: Vertex AI Extensions for Gemini model integration, or Vertex AI Agent Builder for conversational agents.

## Option A — Vertex AI Extensions

### 1. Upload the OpenAPI spec to GCS

```bash
curl -o dpx-openapi.yaml \
  https://raw.githubusercontent.com/untitledfinancial/dpx-integrations/main/amazon-bedrock/openapi-bedrock.yaml

gsutil cp dpx-openapi.yaml gs://YOUR_BUCKET/dpx-openapi.yaml
```

### 2. Deploy the extension

```bash
gcloud ai extensions create \
  --display-name="DPX Protocol" \
  --description="DPX settlement rail — oracle, quotes, ESG, rail health" \
  --manifest-name=dpx_protocol \
  --open-api-gcs-uri=gs://YOUR_BUCKET/dpx-openapi.yaml \
  --project=YOUR_PROJECT \
  --region=us-central1
```

Or import manually: **Vertex AI Studio** → **Extensions** → **Create** → **Import OpenAPI spec from GCS**

## Option B — Vertex AI Agent Builder

1. **Agent Builder** → **Create Agent** → **Conversational agent**
2. **Tools** → **Create Tool** → **OpenAPI**
3. Paste the live spec URL: `https://api.untitledfinancial.com/openapi.json`
4. Enable all tools → **Save**

## System instruction

```
You have access to DPX Protocol tools for treasury settlement intelligence.

Before processing any settlement request:
1. Call getOracleReliability — halt if UNSTABLE
2. Call getEsgScore with the counterparty wallet
3. Call getSettlementQuote with amount, FX flag, and ESG score
4. Summarise the fee breakdown and net amount clearly
```

## Available tools

| Tool | Endpoint |
|---|---|
| `getOracleReliability` | `stability.untitledfinancial.com/reliability` |
| `getSettlementQuote` | `stability.untitledfinancial.com/quote` |
| `getEsgScore` | `esg.untitledfinancial.com/esg-score` |
| `getRailStatus` | `stability.untitledfinancial.com/rail-status` |
| `getHealth` | `api.untitledfinancial.com/health` |

Agent Builder can import directly from `https://api.untitledfinancial.com/openapi.json`. No API key required.

Full config: [github.com/untitledfinancial/dpx-integrations/tree/main/google-vertex](https://github.com/untitledfinancial/dpx-integrations/tree/main/google-vertex)
