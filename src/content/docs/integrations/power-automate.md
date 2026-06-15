---
title: Microsoft Power Automate
description: Use DPX settlement intelligence in Power Automate flows and Microsoft Copilot Studio agents.
---

Connect DPX to Power Automate via the HTTP connector. No custom connector installation required.

## Prerequisites

Power Automate Premium plan (or Microsoft 365 E3/E5) for HTTP connector access.

## HTTP actions (no install required)

### Oracle stability check

Add an **HTTP** action:

| Field | Value |
|---|---|
| Method | GET |
| URI | `https://stability.untitledfinancial.com/reliability` |
| Headers | `Accept: application/json` |

Parse the response with **Parse JSON** using schema:
```json
{
  "type": "object",
  "properties": {
    "status": { "type": "string" },
    "score":  { "type": "number" }
  }
}
```

### Settlement quote

```
GET https://stability.untitledfinancial.com/quote
    ?amountUsd=@{variables('Amount')}
    &hasFx=@{variables('IsCrossCurrency')}
    &esgScore=@{body('ESG_Check')?['score']}
```

### ESG score

```
GET https://esg.untitledfinancial.com/esg-score
    ?address=@{triggerBody()?['counterpartyWallet']}
```

## Example flow: settlement pre-approval

**Trigger:** New row added to SharePoint list (settlement request)

1. HTTP → Oracle stability check
2. **Condition** → `status eq 'STABLE'`
   - No → Post to Teams: "Oracle CAUTION — hold settlement"
3. HTTP → ESG Score (counterparty wallet from row)
4. HTTP → Settlement quote (amount from row)
5. **Parse JSON** → extract `feeTotal`, `netAmount`
6. **Start and wait for an approval** → post to Teams with fee breakdown
7. If approved → continue to settlement execution

## Microsoft Copilot Studio

For Copilot Studio (formerly Power Virtual Agents):

1. **Topics** → your topic → **Add node** → **Call an action** → **Create a flow**
2. Inside the flow, add HTTP actions as above
3. Return `feeTotal` and `netAmount` as output variables
4. Reference in the bot message: "The net amount your counterparty receives is @{outputs('DPX_Quote')?['netAmount']}"

## Custom connector (optional)

For team-wide reuse, import the DPX OpenAPI spec as a custom connector:

1. **Data** → **Custom Connectors** → **New custom connector** → **Import an OpenAPI file**
2. Download spec: `https://api.untitledfinancial.com/openapi.json`
3. Authentication: **No authentication**
4. **Create connector** → **Test**

Full setup guide: [github.com/untitledfinancial/dpx-integrations/tree/main/power-automate](https://github.com/untitledfinancial/dpx-integrations/tree/main/power-automate)
