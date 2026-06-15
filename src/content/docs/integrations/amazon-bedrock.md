---
title: Amazon Bedrock
description: Add DPX settlement tools to Amazon Bedrock agents via an Action Group.
---

Add DPX as an Action Group in any Amazon Bedrock agent. The agent receives oracle data, fee quotes, and ESG scores as structured tool results.

## Setup

### 1. Upload the OpenAPI spec to S3

Download the DPX OpenAPI spec (Bedrock requires OpenAPI 3.0):

```bash
curl -o dpx-openapi.yaml \
  https://raw.githubusercontent.com/untitledfinancial/dpx-integrations/main/amazon-bedrock/openapi-bedrock.yaml

aws s3 cp dpx-openapi.yaml s3://YOUR_BUCKET/dpx-openapi.yaml
```

Ensure your Bedrock agent's IAM role has `s3:GetObject` on that bucket.

### 2. Create the Action Group

1. AWS Console → **Amazon Bedrock** → **Agents** → your agent → **Edit**
2. **Action groups** → **Add**
3. Name: `DPXProtocol`
4. Executor: **Return control** (agent receives data, decides next step)
5. Schema: **Amazon S3 location** → your bucket and key
6. **Save** → **Prepare** → **Deploy**

### 3. Add to system prompt

```
You have access to DPX Protocol tools for treasury settlement intelligence.

For any settlement request:
1. Call getOracleReliability — confirm STABLE before proceeding
2. Call getEsgScore with the counterparty wallet address
3. Call getSettlementQuote with amount, hasFx flag, and ESG score
4. Return the fee breakdown and net recipient amount

If oracle returns CAUTION, note it and ask whether to proceed.
If UNSTABLE, advise against settling until conditions improve.
```

## Available tools

| operationId | Description |
|---|---|
| `getOracleReliability` | Stability status — STABLE / CAUTION / UNSTABLE |
| `getSettlementQuote` | Binding fee quote — core, FX, ESG, net amount |
| `getEsgScore` | Counterparty ESG score 0–100 |
| `getRailStatus` | Payment corridor health (SEPA, FedACH, PIX, etc.) |
| `getHealth` | Oracle liveness |

## Notes

- Bedrock requires OpenAPI 3.0 — the spec in the integrations repo is 3.0-compatible
- `RETURN_CONTROL` executor is recommended for production; Lambda executor also supported
- No API key required for public intelligence endpoints

Full config files: [github.com/untitledfinancial/dpx-integrations/tree/main/amazon-bedrock](https://github.com/untitledfinancial/dpx-integrations/tree/main/amazon-bedrock)
