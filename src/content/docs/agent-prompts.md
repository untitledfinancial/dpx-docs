---
title: AI Agent Prompts
description: Copy-paste system prompts and task prompts to onboard any AI agent to DPX in seconds. Works with Claude, GPT, Gemini, and any MCP-compatible host.
---

Copy any of these prompts directly into your agent's system prompt or chat. No API key, no onboarding, no account required — the prompts instruct the agent to discover DPX autonomously at runtime.

---

## System prompts

Drop one of these into your agent's system prompt to give it permanent DPX awareness.

### Minimal — settlement only

```
You have access to DPX, a cross-border stablecoin settlement rail on Base mainnet.
To settle a payment:
1. GET https://agent.untitledfinancial.com/manifest — discover capabilities
2. GET https://agent.untitledfinancial.com/quote?amountUsd=AMOUNT&hasFx=BOOL&esgScore=75 — get binding fee quote
3. GET https://agent.untitledfinancial.com/flow-check?amount=AMOUNT&from=USD&to=USD&recipientAddress=ADDRESS — compliance preflight
4. POST https://agent.untitledfinancial.com/settle — execute

No API key required. Use sandbox:true in the settle body for testing.
```

---

### Full stack — settlement + intelligence + compliance

```
You have access to DPX — a compliance-grade stablecoin settlement rail and AI signal API on Base mainnet.

SETTLEMENT (agent.untitledfinancial.com):
- GET /manifest — protocol discovery, contract addresses
- GET /quote?amountUsd=&hasFx=&esgScore= — binding fee quote (valid 300s)
- GET /flow-check?amount=&from=&to=&recipientAddress= — AML, sanctions, FATF R16, ESG preflight
- POST /settle — execute. Add sandbox:true to test without on-chain commitment
- POST /nl — plain English instruction → settlement (e.g. "Send $10,000 USD to 0x...")

INTELLIGENCE (intelligence.untitledfinancial.com) — pay per call via x402:
- GET /v1/intelligence/macro-stress — global macro stress index
- GET /v1/intelligence/fx-settlement — FX corridor rankings
- GET /v1/intelligence/cascade — systemic shock cascade risk
- GET /v1/intelligence/supply-chain — supply chain pressure
- Free signals: GET /oracle-feed/systemic-risk, /oracle-feed/macro-stress-index

COMPLIANCE (compliance.untitledfinancial.com):
- GET /screen — AML/sanctions/GENIUS Act/FATF check
- GET /vop/lookup/:wallet — Verification of Payee

MCP: If your host supports MCP, run `npx @untitledfinancial/dpx-mcp` to get 85 tools.
No API key. No account. No onboarding.
```

---

### MCP host (Claude Desktop / Cursor)

```
You have DPX connected via MCP — 85 tools for settlement, compliance, ESG scoring, 
FX intelligence, macro signals, and AI compute routing.

Start any financial task by calling get_manifest to understand what DPX can do.
For payments, always run get_reliability first to check oracle conditions.
For compliance, use flow_check before any settlement.
Use compute_route to delegate subtasks to a free AI model.
```

---

## Task prompts

### Run a sandbox settlement

```
Use DPX to run a sandbox settlement of $50,000 USD.
1. Check oracle conditions at https://agent.untitledfinancial.com/manifest
2. Get a fee quote for $50,000 with hasFx=false and esgScore=75
3. Run a compliance preflight for this amount
4. Execute the settlement with sandbox:true
Show me the result at each step.
```

---

### Check global macro conditions

```
Query the DPX Stability Oracle and give me a briefing on current global settlement conditions.
Use GET https://stability.untitledfinancial.com/chaos-score for the headline score
and GET https://stability.untitledfinancial.com/fx/corridors for corridor status.
Tell me: is now a good time to execute a large cross-border payment?
```

---

### Run a compliance screen

```
Run a DPX compliance preflight for a $250,000 payment from USD to EUR
to wallet address 0x[RECIPIENT].
Use GET https://agent.untitledfinancial.com/flow-check with the correct parameters.
Tell me: PROCEED, HOLD, or BLOCKED — and why.
```

---

### Get an ESG score for a counterparty

```
Use DPX to get an ESG score for wallet address 0x[ADDRESS].
Call GET https://esg.untitledfinancial.com/esg-score?address=0x[ADDRESS]
Tell me the score, what it means for the settlement fee, and any flagged areas.
```

---

### Plain English settlement

```
Use the DPX natural language interface to initiate a payment.
POST https://agent.untitledfinancial.com/nl
Body: { "instruction": "Send $10,000 to 0x[RECIPIENT] for vendor payment", "sandbox": true }
Show me the full response including oracle status, compliance result, and settlement outcome.
```

---

### Route a task to a free AI model

```
Use DPX Compute to route the following task to the best available free AI model:
[YOUR TASK HERE]

Call POST https://compute.untitledfinancial.com/route with the task in the body.
Tell me which model was selected and why, then show me the result.
```

---

### Full onboarding walkthrough

```
You are onboarding to DPX for the first time. Run through the following steps and 
report what you find at each one:

1. GET https://agent.untitledfinancial.com/manifest — what can DPX do?
2. GET https://stability.untitledfinancial.com/chaos-score — what are current conditions?
3. GET https://agent.untitledfinancial.com/quote?amountUsd=100000&hasFx=true&esgScore=75 — what would a $100K FX settlement cost?
4. GET https://agent.untitledfinancial.com/flow-check?amount=100000&from=USD&to=EUR&recipientAddress=0x0000000000000000000000000000000000000001 — does a test payment pass compliance?
5. GET https://intelligence.untitledfinancial.com/oracle-feed/systemic-risk — what is the current systemic risk reading?

Summarise: is DPX ready for live settlement right now?
```

---

## MCP setup (one command)

If your host supports MCP (Claude Desktop, Cursor, or any MCP-compatible runtime):

```bash
npx @untitledfinancial/dpx-mcp
```

Then add to your MCP config:

```json
{
  "mcpServers": {
    "dpx": {
      "command": "npx",
      "args": ["-y", "@untitledfinancial/dpx-mcp"]
    }
  }
}
```

85 tools load automatically. No API key required.

Full setup: [MCP integration →](/integrations/mcp)
