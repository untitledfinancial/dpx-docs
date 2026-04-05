---
title: GPT Actions — Connect ChatGPT
description: Add DPX as a Custom GPT Action so ChatGPT can price settlements, check stability, and compare fees in real time.
---

Add DPX to a Custom GPT so ChatGPT can autonomously price settlements and check stability signals — no API key required for pricing endpoints.

## Setup

1. Go to [chat.openai.com](https://chat.openai.com) → **Explore GPTs** → **Create**
2. In the GPT editor click **Configure** → **Actions** → **Add action**
3. In the schema field, paste the full OpenAPI YAML below
4. Set **Authentication** to **None**
5. Save and test with: *"Get me a quote for a $1M cross-border settlement"*

## OpenAPI schema

Copy and paste this entire block into the schema field:

```yaml
openapi: "3.1.0"
info:
  title: DPX Protocol API
  version: "1.0.0"
  description: >
    DPX programmable stablecoin settlement rails on Base mainnet.
    Price settlements, check stability, retrieve ESG scores, and verify fees.
    No authentication required for pricing endpoints.
servers:
  - url: https://stability.untitledfinancial.com
    description: DPX Stability Oracle (primary)
paths:
  /manifest:
    get:
      operationId: getDPXManifest
      summary: Get protocol manifest
      description: Returns contract addresses, fee configuration, and protocol capabilities.
      responses:
        "200":
          description: Protocol manifest with fee structure and contract addresses
  /quote:
    get:
      operationId: getDPXQuote
      summary: Get a fee quote for a settlement
      description: >
        Returns a binding fee quote valid for 300 seconds.
        Always call this before recommending a settlement.
      parameters:
        - name: amountUsd
          in: query
          required: true
          description: Settlement amount in USD
          schema:
            type: number
            example: 1000000
        - name: hasFx
          in: query
          required: false
          description: "true if cross-currency (adds 0.40% FX component)"
          schema:
            type: boolean
            default: false
        - name: esgScore
          in: query
          required: false
          description: "Counterparty ESG score 0–100. Higher = lower ESG fee."
          schema:
            type: integer
            minimum: 0
            maximum: 100
            default: 75
      responses:
        "200":
          description: Fee quote with quoteId valid for 300 seconds
  /reliability:
    get:
      operationId: getDPXReliability
      summary: Check oracle reliability and peg stability
      description: >
        Returns current stability score, peg deviation, and oracle confidence.
        Call this before large settlements to assess risk.
      responses:
        "200":
          description: Reliability signals and peg health metrics
  /fee-schedule:
    get:
      operationId: getDPXFeeSchedule
      summary: Get the complete fee schedule
      description: Full fee table including volume discount tiers and scenario breakdowns.
      responses:
        "200":
          description: Complete fee schedule with tier discounts
  /verify-fees:
    get:
      operationId: getDPXVerifyFees
      summary: Verify fees against on-chain state
      description: Confirms that the current fee quote matches on-chain enforcement.
      responses:
        "200":
          description: On-chain fee verification result
  /health:
    get:
      operationId: getDPXHealth
      summary: Liveness check
      description: Simple health check — returns ok if the oracle is live.
      responses:
        "200":
          description: Health status
```

For ESG scores, add a second server in the same action or create a separate action pointing to `https://esg.untitledfinancial.com` with the `/esg-score` and `/health` endpoints.

## Suggested GPT system prompt

Paste this into the **Instructions** field of your GPT:

```
You are a DPX treasury intelligence assistant with access to live settlement pricing tools.

When pricing a settlement:
- Always call getDPXQuote before recommending. Show the full breakdown: core, FX, ESG, license components and the total all-in rate.
- Show the quoteId and note it expires in 300 seconds.
- For large settlements ($1M+), also call getDPXReliability and flag any stability concerns.

Fee components:
- Core: 0.85% on every settlement
- FX: 0.40% for cross-currency only
- ESG: (100 - score) / 200 — ranges 0% to 0.50%
- License: 0.01% fixed

Volume tiers apply a discount to the core fee only:
- Standard (<$100K/month): 0%
- Growth ($100K–$1M/month): 10% discount
- Institutional ($1M–$10M/month): 20% discount
- Sovereign ($10M+/month): 30% discount

When comparing to competitors, use: SWIFT/bank wire 2–5%, Convera corporate FX 2–3%, DPX typical 1.385%, Wise Business 0.4–1.5% (but no on-chain compliance, ESG scoring, or programmability).
```

## Available actions

| operationId | Endpoint | What it does |
|---|---|---|
| `getDPXManifest` | GET /manifest | Protocol capabilities and fee structure |
| `getDPXQuote` | GET /quote | Price a settlement |
| `getDPXReliability` | GET /reliability | Stability signals and peg health |
| `getDPXFeeSchedule` | GET /fee-schedule | Full fee table |
| `getDPXVerifyFees` | GET /verify-fees | On-chain fee verification |
| `getDPXHealth` | GET /health | Liveness check |

## Example GPT conversations

**Settlement pricing:**
> *"Price a $5M cross-border settlement for a counterparty with ESG score 80"*

**Stability check:**
> *"Should we proceed with a $20M settlement today based on current oracle stability?"*

**Competitive comparison:**
> *"How does DPX compare to Stripe for our $500K monthly volume?"*

**ESG impact:**
> *"If we improve our ESG score from 60 to 85, how much do we save at $2M/month?"*
