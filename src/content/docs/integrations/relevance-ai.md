---
title: Relevance AI
description: Add DPX settlement intelligence tools to Relevance AI agents.
---

Connect DPX oracle and pricing endpoints to any Relevance AI agent as API tools. No API key required.

## Setup

1. Relevance AI dashboard → **Tools** → **Create Tool** → **API Tool**
2. For each tool below, set the name, description, URL, method, and parameters
3. Click **Test** to verify the endpoint responds → **Save**
4. **Agents** → your agent → **Tools** tab → **Add Tool** → select each DPX tool

## Tools

### Oracle stability check

- **URL:** `https://stability.untitledfinancial.com/reliability`
- **Method:** GET
- **Description:** Check current macro stability before any settlement. Returns STABLE, CAUTION, or UNSTABLE with score and reasoning.
- **Parameters:** none

### Settlement quote

- **URL:** `https://stability.untitledfinancial.com/quote`
- **Method:** GET
- **Description:** Binding fee quote — core, FX, ESG fees, all-in rate, net recipient amount. Valid 300 seconds.
- **Parameters:**

| Name | Type | Required | Description |
|---|---|---|---|
| `amountUsd` | number | yes | Settlement amount in USD |
| `hasFx` | boolean | no | true for cross-currency |
| `esgScore` | number | no | Counterparty ESG score 0–100 |

### ESG score

- **URL:** `https://esg.untitledfinancial.com/esg-score`
- **Method:** GET
- **Description:** Live ESG score for a counterparty wallet address. Score 0–100. Scores ≤40 trigger impact pool contribution.
- **Parameters:**

| Name | Type | Required |
|---|---|---|
| `address` | string | yes |

### Rail health

- **URL:** `https://stability.untitledfinancial.com/rail-status`
- **Method:** GET
- **Description:** Health of a payment corridor: SEPA, FedACH, PIX, SWIFT, CHAPS.
- **Parameters:**

| Name | Type | Required |
|---|---|---|
| `corridor` | string | no |

## Agent system prompt addition

```
You have access to DPX Protocol tools for treasury settlement intelligence.

Standard settlement workflow:
1. Run Oracle Stability Check — pause if UNSTABLE
2. Run ESG Score for the counterparty if wallet address is known
3. Run Settlement Quote with amount, FX flag, and ESG score
4. Present the net amount and fee breakdown clearly
```

Full tool config JSON: [github.com/untitledfinancial/dpx-integrations/tree/main/relevance-ai](https://github.com/untitledfinancial/dpx-integrations/tree/main/relevance-ai)
