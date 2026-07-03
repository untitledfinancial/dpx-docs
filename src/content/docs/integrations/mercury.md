---
title: Mercury
description: Route Mercury banking payments to DPX settlements automatically via webhook. ACH, domestic wire, and international wire supported.
---

import { Aside } from '@astrojs/starlight/components';

<Aside type="caution" title="Sandbox only">
The Mercury integration is currently in sandbox mode. The connector and webhook endpoint are fully built and tested. Live activation requires `MERCURY_API_KEY` and `MERCURY_WEBHOOK_SECRET` configured in the Settlement Agent.
</Aside>

DPX integrates directly with Mercury — connecting Mercury's banking layer to DPX's settlement and oracle layer. When a Mercury payment is tagged for DPX routing, it flows automatically through oracle verification, AI synthesis, and on-chain settlement authorization.

## How it works

```
Mercury transaction (ACH / wire / check)
  → DPX /mercury-webhook
    → Mercury-Signature HMAC-SHA256 verified
      → resourceType + operationType routing
        → Oracle check + AI synthesis layer
          → quoteId + execution params returned
            → Sender executes on-chain via router.settle()
```

Mercury handles the banking side (ACH, wires, balances). DPX handles the settlement intelligence side (oracle authorization, ESG scoring, on-chain execution params). DPX never holds or forwards funds — the caller executes settlement on-chain using the quoteId returned.

## Setup

### 1. Register the DPX webhook endpoint

Use the Mercury API or dashboard to register the webhook:

```bash
curl -X POST https://api.mercury.com/api/v1/webhooks \
  -H "Authorization: Bearer $MERCURY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://agent.untitledfinancial.com/mercury-webhook",
    "eventTypes": ["transaction.created", "transaction.updated"]
  }'
```

Copy the **`secretKey`** from the response — this is the webhook signing secret.

`eventTypes` is an array of strings. Omit the field entirely to receive all event types.

### 2. Add secrets to the Settlement Agent

```bash
wrangler secret put MERCURY_WEBHOOK_SECRET
# Paste the secretKey from step 1

wrangler secret put MERCURY_API_KEY
# Your Mercury API key (Read-Write, IP-whitelisted)

wrangler secret put MERCURY_DEFAULT_RECIPIENT
# Fallback on-chain wallet address for dpx_route=true payments
```

### 3. Tag payments for DPX routing

Include a DPX tag in the Mercury payment note or metadata:

| Method | Example |
|---|---|
| Note / memo | `"Intercompany Q2 dpx:0xYourWalletAddress"` |
| Payment metadata | `dpx_recipient = 0xYourWalletAddress` |
| Metadata flag | `dpx_route = true` (uses `MERCURY_DEFAULT_RECIPIENT`) |

Payments without a DPX tag are acknowledged and ignored — Mercury receives `200 OK` with `action: ignored`.

## Webhook signature verification

Mercury sends `Mercury-Signature` (title-case, single header) on every webhook delivery.

**Format:** `t=<unix_timestamp_seconds>,v1=<hmac_hex>`

**Signing algorithm:** HMAC-SHA256 of `"<timestamp>.<rawBody>"` (literal period separator between timestamp and raw request body).

```typescript
const header = request.headers.get('Mercury-Signature');
const parts  = Object.fromEntries(header.split(',').map(p => p.split('=')));
const { t: timestamp, v1: expected } = parts;

// Reject replays older than 5 minutes
if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) throw new Error('Stale');

const signedMsg = `${timestamp}.${rawBody}`;  // period separator
```

## Webhook payload structure

Mercury webhooks use **JSON Merge Patch** format. There is no `eventType` field and no `data` wrapper.

```typescript
{
  id:              string;   // webhook delivery ID
  resourceType:    string;   // "transaction" | "checkingAccount" | ...
  resourceId:      string;   // ID of the affected resource
  operationType:   string;   // "create" | "update"
  resourceVersion: number;
  occurredAt:      string;
  changedPaths:    string[];
  mergePatch:      Record<string, unknown>; // new field values (partial)
  previousValues:  Record<string, unknown>; // old field values (partial)
}
```

Route on `resourceType + operationType`. Transaction data is in `mergePatch`, not under a `data` key. For `transaction.update` events, DPX only routes when `mergePatch.status === "sent"` to avoid double-routing on pending.

**Amount in `mergePatch.amount` is in dollars** — Mercury never sends cents.

## Sending payments via the MCP proxy

The Settlement Agent includes a Mercury payment proxy at `/mercury/send`. All payments require a saved `recipientId` — Mercury's `/transactions` endpoint does not accept inline routing numbers.

### Create a recipient first

```bash
# ACH recipient
POST https://agent.untitledfinancial.com/mercury/recipients
{
  "name": "Acme Corp",
  "emails": ["ap@acme.com"],
  "electronicRoutingInfo": {
    "routingNumber": "021000021",
    "accountNumber": "123456789",
    "electronicAccountType": "businessChecking",
    "address": {
      "address1": "123 Main St",
      "city": "New York",
      "region": "NY",
      "postalCode": "10001",
      "country": "US"
    }
  }
}
```

```bash
# International wire recipient
POST https://agent.untitledfinancial.com/mercury/recipients
{
  "name": "Foreign Vendor Ltd",
  "emails": ["finance@vendor.com"],
  "defaultPaymentMethod": "internationalWire",
  "internationalWireRoutingInfo": {
    "iban": "DE89370400440532013000",
    "swiftCode": "COBADEFFXXX",
    "bankDetails": {
      "bankName": "Commerzbank",
      "bankCityState": "Frankfurt",
      "bankCountry": "DE"
    }
  }
}
```

Note: `emails` is an array of strings. `electronicRoutingInfo` is the field name for ACH (not top-level `routingNumber`/`accountNumber`).

### Send a payment

```bash
POST https://agent.untitledfinancial.com/mercury/send
{
  "accountId": "your-mercury-account-uuid",
  "recipientId": "saved-recipient-uuid",
  "amount": 15000.00,
  "paymentMethod": "ach",
  "note": "Q2 vendor payment dpx:0xYourWallet",
  "idempotencyKey": "invoice-2026-q2-001"
}
```

**Payment methods on `/transactions`:** `ach`, `domesticWire`, `check`

**`domesticWire` requires a `purpose` field:**

```json
{
  "purpose": { "category": "Vendor" }
}
```

Valid categories: `Employee`, `Landlord`, `Vendor`, `Contractor`, `Subsidiary`, `TransferToMyExternalAccount`, `FamilyMemberOrFriend`, `ForGoodsOrServices`, `AngelInvestment`, `SavingsOrInvestments`, `Expenses`, `Travel`, `Other`

`Vendor`, `Contractor`, and `Other` also require `additionalInfo` (the name or description).

**International wire** routes through `/request-send-money` (admin approval flow) and is not a valid `paymentMethod` on `/transactions`:

```json
{
  "paymentMethod": "internationalWire",
  "recipientId": "uuid-with-internationalWireRoutingInfo"
}
```

**Amount is in dollars.** Minimum $0.01. `idempotencyKey` is in the request body (not a header). Auto-generated if omitted.

## Cross-currency settlements

To route a Mercury USD payment to a EUR settlement, add `destination_currency` to the payment metadata:

```
destination_currency = EUR
```

DPX applies the FX fee and routes through EURC on Base.

## ACH compliance pre-screening

Before executing an ACH payment, run it through the DPX compliance oracle:

```bash
POST https://agent.untitledfinancial.com/mercury/ach-authorize
{
  "recipientId":   "mercury-recipient-uuid",
  "amount":        15000.00,
  "accountName":   "Acme Corp",
  "routingNumber": "021000021",
  "accountNumber": "123456789",
  "memo":          "Q2 vendor payment"
}
```

Response:

```json
{
  "decision":       "APPROVED",
  "requiresReview": false,
  "autoExecute":    true,
  "compliance": {
    "sanctionsClean":   true,
    "anomalyScore":     0.12,
    "riskTier":         "LOW"
  }
}
```

| Decision | HTTP | Meaning |
|---|---|---|
| `APPROVED` + `autoExecute: true` | 200 | ACH fires immediately |
| `FLAGGED` + `requiresReview: true` | 200 | Queued for manual review |
| `BLOCKED` | 403 | Hard stop — do not proceed |

## MCP tools

Four Mercury tools are available in the MCP server:

| Tool | What it does |
|---|---|
| `mercury.accounts` | List all Mercury accounts with live balances |
| `mercury.transactions` | List recent transactions for an account |
| `mercury.send` | Initiate a payment — ACH, wire, or international wire — with optional DPX routing |
| `mercury.ach_authorize` | Compliance pre-screening via DPX AML oracle before ACH execution |

When `mercury.send` is called with `dpxRoute: true`, the payment is tagged for DPX settlement. The Settlement Agent picks it up via webhook, runs oracle verification, and returns execution params for on-chain settlement.

**Example agent flow:**

```
User: "Pay $50,000 to our EU supplier via DPX"

Agent calls:
1. mercury.accounts → finds available balance
2. oracle.stability → confirms STABLE conditions
3. settlement.quote → binding fee quote, 300s TTL
4. mercury.send → initiates wire tagged dpx:0x...
   → DPX webhook → oracle + AI synthesis → quoteId returned
   → caller executes router.settle() on Base
```

## What happens on HOLD

If the oracle returns CAUTION or UNSTABLE, the AI synthesis layer will HOLD:

```json
{
  "settlementId": "dpx_abc123",
  "status": "held",
  "reasoning": "CAUTION conditions with $500,000 exceeds $100K threshold. Flagging for review.",
  "oracleScore": 81
}
```

The Mercury payment is already sent — DPX logs the hold. Resubmit when oracle returns STABLE, using the same `referenceId`.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `MERCURY_WEBHOOK_SECRET` | Yes (webhook) | `secretKey` returned by Mercury when registering the webhook endpoint |
| `MERCURY_API_KEY` | Yes (proxy/watcher) | Mercury API key — Read-Write, IP-whitelisted for Cloudflare Workers IPs |
| `MERCURY_DEFAULT_RECIPIENT` | Recommended | Fallback on-chain address for `dpx_route=true` payments |

## Resources

- [Mercury developer docs →](https://docs.mercury.com)
- [DPX Settlement Agent →](/protocol/settlement-router)
- [Oracle conditions →](/protocol/stability-oracle)
