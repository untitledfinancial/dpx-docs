---
title: Salesforce Agentforce
description: Connect DPX to Salesforce Agentforce via External Services and Flow Builder.
---

Add DPX settlement intelligence to Salesforce Agentforce agents via External Services (OpenAPI import) or Apex callouts.

## Option A — External Services (recommended)

Salesforce External Services imports the DPX OpenAPI spec and auto-generates invocable Apex actions — no code required.

### 1. Register DPX as an External Service

1. Setup → **External Services** → **New External Service**
2. Name: `DPXProtocol`
3. **Named Credential** → create new:
   - URL: `https://api.untitledfinancial.com`
   - Auth: **No Authentication**
4. Schema URL: `https://api.untitledfinancial.com/openapi.json`
5. **Save** — Salesforce imports all endpoints as invocable actions

### 2. Use in Flow Builder

1. **Flow Builder** → your flow → **New Action** → **External Service**
2. Select **DPXProtocol** → choose action (e.g., `getSettlementQuote`)
3. Map input variables from the flow record
4. Store the output — use in email alert, screen, or decision node

### 3. Add to Agentforce

1. **Agent Studio** → your agent → **Actions** → **Add Action**
2. Select **Flow** → your DPX flow
3. The agent can now call it from natural language: *"Get a fee quote for this settlement"*

## Option B — Apex callout

For direct integration in Apex triggers, batch jobs, or custom controllers:

```apex
public class DPXClient {

    public static Map<String, Object> getOracleStatus() {
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://stability.untitledfinancial.com/reliability');
        req.setMethod('GET');
        req.setHeader('Accept', 'application/json');
        return (Map<String, Object>) JSON.deserializeUntyped(
            new Http().send(req).getBody()
        );
    }

    public static Map<String, Object> getQuote(
            Decimal amountUsd, Boolean hasFx, Decimal esgScore) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(
            'https://stability.untitledfinancial.com/quote'
            + '?amountUsd=' + amountUsd
            + '&hasFx=' + hasFx
            + '&esgScore=' + esgScore
        );
        req.setMethod('GET');
        req.setHeader('Accept', 'application/json');
        return (Map<String, Object>) JSON.deserializeUntyped(
            new Http().send(req).getBody()
        );
    }
}
```

Add all DPX domains to **Setup → Remote Site Settings**:
- `api.untitledfinancial.com`
- `stability.untitledfinancial.com`
- `esg.untitledfinancial.com`

## Agentforce system instruction

```
You have access to DPX Protocol actions for treasury settlement intelligence.

When a user asks about settlement pricing or conditions:
1. Run DPX Oracle Check — report the stability status
2. If a counterparty wallet is known, run DPX ESG Score
3. Run DPX Settlement Quote with amount and ESG score
4. Summarise: oracle status, ESG standing, fee breakdown, net amount
```

Full setup guide and Apex samples: [github.com/untitledfinancial/dpx-integrations/tree/main/salesforce](https://github.com/untitledfinancial/dpx-integrations/tree/main/salesforce)
