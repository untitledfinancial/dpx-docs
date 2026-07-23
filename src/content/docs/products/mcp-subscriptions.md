---
title: MCP Subscriptions
description: Monthly subscription access to all 56 DPX MCP tools — oracle queries, ESG scoring, compliance screening, settlement execution, corridor intelligence, and market analysis. For treasury teams, accounting firms, and AI-native finance workflows.
---

The DPX MCP server gives Claude Desktop, Cursor, and any MCP-compatible AI host native access to the full DPX data and settlement stack. A subscription key replaces per-call payment prompts with flat monthly access — optimized for teams running repeated oracle queries, compliance screens, or settlement flows throughout the month.

## What's included

56 tools across settlement, oracle data, ESG scoring, compliance screening, corridor intelligence, Ramp integration, Mercury banking, market intelligence, and agent identity.

| Category | Tools |
|---|---|
| Settlement & Oracle | `settlement.quote`, `settlement.execute`, `settlement.status`, `oracle.stability`, `oracle.status`, `oracle.rails`, `oracle.mycelium` |
| Compliance | `compliance.ubo_chain`, `compliance.pep_screen`, `compliance.regulatory_calendar` |
| ESG | `esg.score`, `esg.lookup`, `esg.batch`, `esg.portfolio`, `esg.watch`, `esg.trend`, `oracle.governance` |
| Corridor & Routing | `stability.corridor`, `stability.settlement_window`, `stability.stablecoin_route` |
| Agent Identity | `agent.kya_register`, `agent.mandate_create`, `agent.kya_verify` |
| Market Intelligence | `market.cascade`, `market.shipping`, `market.fx`, `oracle.mycelium`, `intelligence.tectonic`, `intelligence.aftershock`, `intelligence.contagion`, `intelligence.resonance` |
| Ramp | `ramp.connect`, `ramp.spend_analysis`, `ramp.agent_card`, `ramp.settle`, `ramp.compliance_screen` |
| Mercury | `mercury.accounts`, `mercury.transactions`, `mercury.send`, `mercury.ach_authorize`, `mercury.sweep` |
| Treasury | `treasury.yield_route`, `fees.compare`, `fees.schedule`, `fees.verify` |

Full tool reference: [MCP — Claude](/integrations/mcp).

## Tiers

| Tier | Monthly (USDC) | MCP calls/month | Compliance screens | ESG entities/month | Settlement executions |
|---|---|---|---|---|---|
| **Analyst** | 50 | 5,000 | 500 | 1,000 | 10 |
| **Professional** | 200 | 25,000 | 5,000 | 10,000 | 100 |
| **Institutional** | 800 | Unlimited | Unlimited | Unlimited | Unlimited |

All tiers include: full 56-tool access, FATF R.16 attestations, SFDR PAI indicators, corridor intelligence, and AI synthesis on oracle responses.

## Get a subscription key

```bash
curl -X POST https://compliance.untitledfinancial.com/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "professional",
    "email": "treasury@yourfirm.com",
    "paymentTxHash": "0x..."
  }'
```

**Response:**
```json
{
  "apiKey": "dpx_sub_pk_...",
  "tier": "professional",
  "expiresAt": "2026-07-30T00:00:00Z",
  "limits": {
    "mcpCallsPerMonth": 25000,
    "complianceScreensPerMonth": 5000,
    "esgEntitiesPerMonth": 10000,
    "settlementExecutions": 100
  },
  "usage": { "mcpCalls": 0, "complianceScreens": 0, "esgEntities": 0 }
}
```

**Payment:** Send USDC to the DPX settlement address on Base mainnet and include the transaction hash. Subscription activates within 60 seconds of on-chain confirmation.

| Tier | USDC amount | Address |
|---|---|---|
| Analyst | 50 USDC | `0x...` (see [contracts](/protocol/contracts)) |
| Professional | 200 USDC | `0x...` |
| Institutional | 800 USDC | `0x...` |

## Configure Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "dpx": {
      "command": "npx",
      "args": ["-y", "@untitledfinancial/dpx-mcp"],
      "env": {
        "STABILITY_ORACLE_URL": "https://stability.untitledfinancial.com",
        "SETTLEMENT_AGENT_URL": "https://agent.untitledfinancial.com",
        "MCP_API_KEY": "dpx_sub_pk_...",
        "SANDBOX_MODE": "true"
      }
    }
  }
}
```

Set `SANDBOX_MODE: "false"` only when ready for live USDC settlements.

## Configure remote MCP (no local install)

Point any MCP-compatible host directly at the remote server — no `npx`, no local Node.js:

```json
{
  "mcpServers": {
    "dpx": {
      "url": "https://mcp.untitledfinancial.com/mcp",
      "transport": "http",
      "headers": {
        "Authorization": "Bearer dpx_sub_pk_..."
      }
    }
  }
}
```


## Use cases by team

### Treasury / FX desk

```
"Check oracle stability and corridor risk for a $3M USD→EUR settlement this week"
"What's the optimal 4-hour execution window over the next 72 hours for USD/BRL?"
"Compare DPX fees to SWIFT for our monthly intercompany netting — $8M total"
```

### Accounting firm (Ramp Stack integration)

```
"Screen this vendor before I issue the Agent Card — Acme GmbH, Germany, $250K, LEI 7LTW..."
"Run ESG batch on our 40 active suppliers and flag any MiCA Article 72 issues"
"Analyse our Ramp wire volume and show me what we'd save routing through DPX"
```

### Compliance / risk team

```
"Run a UBO chain check on LEI 7LTWFZYICNSX8D621K86 and screen all beneficial owners"
"What regulatory events are coming up in Q3 that affect our SFDR Article 8 fund?"
"PEP screen Maria Santos before approving this contractor payment"
```

### Investment / research (commodity and macro)

```
"What's the current stability score and what's driving it — is this a good week to execute large settlements?"
"Model a Strait of Hormuz disruption at magnitude 70 — what cascades and when?"
"Get the full ESG portfolio report on our top 50 commodity counterparties"
```

## Check usage

```bash
curl https://compliance.untitledfinancial.com/subscribe/status \
  -H "X-API-Key: dpx_sub_pk_..."
```

```json
{
  "tier": "professional",
  "expiresAt": "2026-07-30T00:00:00Z",
  "usage": {
    "mcpCalls": 1243,
    "complianceScreens": 87,
    "esgEntities": 340,
    "settlementExecutions": 3
  },
  "limits": {
    "mcpCallsPerMonth": 25000,
    "complianceScreensPerMonth": 5000,
    "esgEntitiesPerMonth": 10000,
    "settlementExecutions": 100
  },
  "remaining": {
    "mcpCalls": 23757,
    "complianceScreens": 4913
  }
}
```

## Renew or upgrade

Send a new USDC payment with your existing API key in the memo field to extend or upgrade. Upgrades apply immediately. Renewals extend the expiry from the current expiry date (not the payment date), so paying early doesn't waste days.

## Beta Access

During beta, Institutional tier is available on request with custom limits. [Apply →](/beta)
