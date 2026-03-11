---
title: GPT Actions — Connect ChatGPT
description: Add DPX as a Custom GPT Action so ChatGPT can price settlements, check stability, and compare fees.
---

Add DPX to a Custom GPT so ChatGPT can autonomously price settlements and check stability signals.

## Setup

1. Go to [chat.openai.com](https://chat.openai.com) → **Explore GPTs** → **Create**
2. In the GPT editor, click **Configure** → **Actions** → **Add action**
3. Paste the contents of `/dpx-agents/gpt-actions.yaml` into the schema field
4. Set the server URL to your production URL (e.g. `https://stability.untitledfinancial.com`)
5. Authentication: **None**
6. Save and test

```

## Available actions

| operationId | Endpoint | What it does |
|---|---|---|
| `getDPXManifest` | GET /manifest | Protocol capabilities and fee structure |
| `getDPXQuote` | GET /quote | Price a settlement |
| `postDPXQuote` | POST /quote | Price a settlement (JSON body) |
| `getDPXReliability` | GET /reliability | Stability signals |
| `getDPXFeeSchedule` | GET /fee-schedule | Full fee table |
| `getDPXHealth` | GET /health | Liveness check |

## Suggested GPT system prompt

```
You are a DPX treasury assistant. Use the DPX tools to:
- Price cross-border settlements (always call getDPXQuote before recommending)
- Check oracle stability before large settlements (call getDPXReliability)
- Compare DPX fees to Stripe, Wise, and bank wires
- Explain the ESG fee and its impact on pricing

Always show the full fee breakdown including core, FX, ESG, and license components.
Always show the quoteId and note it expires in 300 seconds.
```
