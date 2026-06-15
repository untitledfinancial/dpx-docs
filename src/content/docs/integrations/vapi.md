---
title: Vapi
description: Add DPX settlement intelligence tools to Vapi voice agents.
---

Connect DPX oracle and pricing endpoints to any Vapi voice agent as custom function tools. No API key required for public intelligence endpoints.

## Setup

1. [Vapi dashboard](https://vapi.ai) → **Tools** → **Create Tool** → **Function**
2. Paste each tool definition below
3. Add tools to your assistant: **Assistants** → your assistant → **Tools**

## Tool definitions

### Oracle stability check

```json
{
  "type": "function",
  "function": {
    "name": "check_settlement_conditions",
    "description": "Check current macro stability and settlement recommendation from the DPX oracle. Returns STABLE, CAUTION, or UNSTABLE with a score and reasoning. Always call before quoting or executing a settlement.",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    }
  },
  "server": {
    "url": "https://stability.untitledfinancial.com/reliability",
    "method": "GET"
  }
}
```

### Settlement quote

```json
{
  "type": "function",
  "function": {
    "name": "get_settlement_quote",
    "description": "Get a binding fee quote for a DPX settlement. Returns core fee, FX fee, ESG fee, total all-in rate, and net amount the recipient receives. Quote is valid for 300 seconds.",
    "parameters": {
      "type": "object",
      "properties": {
        "amountUsd": { "type": "number", "description": "Settlement amount in USD" },
        "hasFx":     { "type": "boolean", "description": "true if cross-currency settlement" },
        "esgScore":  { "type": "number", "description": "Counterparty ESG score 0–100. Use 75 if unknown." }
      },
      "required": ["amountUsd"]
    }
  },
  "server": {
    "url": "https://stability.untitledfinancial.com/quote",
    "method": "GET"
  }
}
```

### ESG score

```json
{
  "type": "function",
  "function": {
    "name": "get_esg_score",
    "description": "Get live ESG score for a counterparty wallet address or entity. Score 0–100. Higher score = lower compliance fee.",
    "parameters": {
      "type": "object",
      "properties": {
        "entity": { "type": "string", "description": "Wallet address (0x...) or LEI of the counterparty" }
      },
      "required": ["entity"]
    }
  },
  "server": {
    "url": "https://esg.untitledfinancial.com/esg-score",
    "method": "GET"
  }
}
```

### Rail health

```json
{
  "type": "function",
  "function": {
    "name": "check_rail_health",
    "description": "Check health of a payment rail or corridor: SEPA, FedACH, PIX, SWIFT, CHAPS.",
    "parameters": {
      "type": "object",
      "properties": {
        "corridor": { "type": "string", "description": "Rail name: SEPA, FedACH, PIX, SWIFT, CHAPS" }
      },
      "required": []
    }
  },
  "server": {
    "url": "https://stability.untitledfinancial.com/rail-status",
    "method": "GET"
  }
}
```

## System prompt

```
You are a DPX treasury agent. You help treasury teams route settlements efficiently.

Workflow for any settlement request:
1. Call check_settlement_conditions — if UNSTABLE, advise the caller to wait
2. If a counterparty wallet is provided, call get_esg_score
3. Call get_settlement_quote with amount, FX flag, and ESG score
4. Read back the total fee, net amount, and quote expiry clearly
5. Ask for confirmation before proceeding

Speak in plain language. Never provide investment advice.
```

## Post-call webhook (optional)

In Vapi → Assistants → your assistant → **Server**, set the server URL to forward post-call summaries into your systems.

Full tool definitions and setup scripts: [github.com/untitledfinancial/dpx-integrations/tree/main/vapi](https://github.com/untitledfinancial/dpx-integrations/tree/main/vapi)
