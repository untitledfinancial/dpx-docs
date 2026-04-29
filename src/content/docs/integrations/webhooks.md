---
title: Webhooks
description: Receive real-time DPX settlement events, or send inbound payment instructions via webhook.
---

DPX supports webhooks in two directions: **inbound** (external systems triggering settlements) and **outbound** (DPX notifying your system of settlement events).

## Inbound webhooks — trigger settlements

### Generic endpoint

Any external system can POST a payment instruction to the Settlement Agent:

```
POST https://agent.untitledfinancial.com/webhook
Content-Type: application/json
```

The agent extracts fields using a flexible field map that handles different TMS and ERP formats:

```json
{
  "amount": 50000,
  "currency": "USD",
  "destination_currency": "EUR",
  "recipient": "0xYourWalletAddress",
  "reference_id": "INV-2026-0042",
  "purpose": "vendor-payment"
}
```

### Mercury (HMAC-verified)

For Mercury banking customers, a dedicated endpoint handles `payment.sent` events with signature verification:

```
POST https://agent.untitledfinancial.com/mercury-webhook
```

Register with one command via the [Mercury CLI](https://github.com/MercuryTechnologies/mercury-cli):

```bash
mercury webhook create \
  --url https://agent.untitledfinancial.com/mercury-webhook \
  --events payment.sent
```

See the full [Mercury integration guide](/integrations/mercury).

## Outbound webhooks — settlement notifications

Outbound webhook delivery is in development. Planned events:

| Event | Trigger |
|---|---|
| `settlement.executed` | On-chain transaction confirmed |
| `settlement.held` | Claude decision: HOLD — conditions not met |
| `settlement.rejected` | Claude decision: REJECT |
| `quote.expired` | `quoteId` validity window elapsed (300s) |
| `oracle.alert` | Stability score drops below threshold |
| `peg.alert` | Peg deviation exceeds 50 bps |
| `esg.updated` | ESG oracle run completes |

In the meantime, poll `/status/:settlementId` for individual settlement status, or `/reliability` for oracle health. See the [n8n peg alert workflow](/integrations/n8n) for a polling example.

## Get early access

[Request beta access →](/beta)
