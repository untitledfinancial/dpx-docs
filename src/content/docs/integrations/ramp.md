---
title: Ramp
description: Connect Ramp's corporate spend platform to DPX — Agent Cards fund the fiat leg of cross-border settlements; DPX settles USDC or EURC on Base mainnet in ~30 seconds. No crypto wallet pre-funding required.
---

Ramp and DPX handle different sides of the B2B payment stack. Ramp owns corporate cards, expense management, and bill pay. DPX handles cross-border stablecoin settlement when wire transfers are the wrong instrument.

```
Ramp bill pay / vendor payment
    │
    │  Cross-border or wire payment?
    ▼
DPX Settlement Rail
    │
    ├── Compliance Oracle (VoP, AML, sanctions)
    ├── Stability Oracle (macro gate)
    ├── Ramp Agent Card (fiat leg, single-use, merchant-capped)
    └── USDC / EURC settlement on Base mainnet (~30 seconds)
    │
    ▼
pacs.002 confirmation + SFDR PAI indicators
```

No crypto wallet pre-funding required. Ramp's Agent Card handles the fiat-to-stablecoin conversion leg; DPX settles on-chain and returns a pacs.002 confirmation.

---

## Integration patterns

### Pattern 1 — MCP agent (recommended)

The fastest path. Connect DPX's MCP server and Ramp's MCP server in the same AI agent. The agent identifies cross-border vendor payments, runs a DPX spend analysis on the Ramp account, and routes settlements automatically.

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

**MCP tools available:**

| Tool | Cost | What it does |
|---|---|---|
| `ramp.connect` | Free | Connect a Ramp account via OAuth 2.0 — returns authorization URL |
| `ramp.spend_analysis` | $0.001 | Analyse wire + international bill volume, surface DPX opportunity |
| `ramp.agent_card` | $0.005 | Create a scoped Ramp Agent Card (single-use, merchant-capped) |
| `ramp.settle` | $0.01 | Agent Card + DPX settlement in one call — returns pacs.002 |

**Example agent flow:**

```
User: "Route our EU vendor payments to DPX this month"

Agent calls:
1. ramp.connect → authorize Ramp account
2. ramp.spend_analysis → identify wire and international bill volume
3. For each eligible bill:
   3a. ramp.settle → Agent Card created, DPX settles EURC on Base
   3b. pacs.002 returned → update bill status in Ramp
```

---

### Pattern 2 — Direct API

For server-to-server integrations without an AI agent layer.

#### Step 1 — Connect Ramp account

Redirect your user to the DPX OAuth endpoint:

```
GET https://integration.untitledfinancial.com/ramp/oauth/connect?tenant_id=<your-tenant-id>
```

After Ramp authorization, DPX stores tokens automatically. Check connection status:

```bash
GET https://integration.untitledfinancial.com/ramp/oauth/status?tenant_id=<your-tenant-id>
```

#### Step 2 — Analyse spend

```bash
GET https://integration.untitledfinancial.com/ramp/spend-analysis?page_size=100
Authorization: Bearer <dpx-institution-key>
```

Response includes wire volume, international bill count, top vendors, and estimated annual savings at DPX rates vs. bank wire:

```json
{
  "crossBorder": {
    "wireVolume":           850000,
    "wireBillCount":        12,
    "internationalVolume":  320000
  },
  "dpxOpportunity": {
    "estimatedAnnualWireVolume":  10200000,
    "estimatedAnnualSavings":     9945,
    "estimatedAnnualDpxFees":     207570,
    "note": "Savings vs. 3.0% bank wire at DPX 2.035% all-in (ESG score 75)"
  }
}
```

#### Step 3 — Settle

```bash
POST https://integration.untitledfinancial.com/ramp/settle
Authorization: Bearer <dpx-institution-key>
Content-Type: application/json

{
  "amount":          "15000.00",
  "currency":        "USD",
  "settlementAsset": "EURC",
  "creditorWallet":  "0xSupplierWalletAddress",
  "creditorName":    "Supplier GmbH",
  "creditorLei":     "529900ODI3047E2LIV03",
  "merchantScope":   "Supplier GmbH",
  "reference":       "RAMP-BILL-2026-0042",
  "callbackUrl":     "https://your-system/dpx/callback"
}
```

Response:

```json
{
  "reference":    "RAMP-BILL-2026-0042",
  "dpxPaymentId": "93e89fe0-a29f-40a5-b204-57d3dffc8812",
  "status":       "SETTLED",
  "settlement": {
    "txHash":       "0x7f3a...",
    "network":      "base-mainnet",
    "amount":       "15000.00",
    "exchangeRate": "1.0842",
    "fee":          "30.53",
    "settlementAsset": "EURC"
  },
  "agentCard": {
    "taskId":      "card-task-uuid",
    "displayName": "DPX Settlement · Supplier GmbH · 93e89fe0"
  },
  "iso20022": {
    "format": "pacs.002.001.10",
    "status": "ACCP"
  }
}
```

---

## Agent Cards

DPX creates a Ramp Agent Card for each settlement — a single-use virtual card scoped to the exact payment amount and merchant. The card funds the fiat-to-stablecoin conversion leg without requiring a pre-funded crypto wallet.

| Property | Value |
|---|---|
| Type | Virtual card (deferred creation) |
| Scope | Single merchant, amount-capped |
| Expiry | After first authorization or 12 hours |
| MCCs blocked | Telecom, pharma, digital goods, gambling |
| Requires scope | `cards:read_agentic` (Ramp production approval required) |

**Standalone Agent Card creation** (without settlement):

```bash
POST https://integration.untitledfinancial.com/ramp/agent-card
Authorization: Bearer <dpx-institution-key>

{
  "amount":        "15000.00",
  "currency":      "USD",
  "merchantScope": "Supplier GmbH",
  "reference":     "RAMP-BILL-2026-0042"
}
```

Returns `{ taskId, statusUrl }` — poll the status URL to retrieve the card once ready:

```bash
GET https://integration.untitledfinancial.com/ramp/agent-card/<taskId>
```

---

## Webhooks

Ramp fires webhook events on bill payment, transaction clearance, and payment status updates. DPX receives and verifies these at:

```
POST https://integration.untitledfinancial.com/ramp/webhooks/events
```

**Signature verification:** Ramp sends `X-Ramp-Signature: sha256=<hex>` (HMAC-SHA256 of raw body). DPX verifies against `RAMP_WEBHOOK_SECRET`.

**Register in Ramp Dashboard → Developers → Webhooks:**

| Field | Value |
|---|---|
| URL | `https://integration.untitledfinancial.com/ramp/webhooks/events` |
| Events | `bills.paid`, `transactions.cleared`, `payments.updated` |

Events routed to DPX settlement on `bills.paid` with cross-border vendor classification.

---

## Secrets required

Set via `wrangler secret put <NAME>` in the Integration API worker:

| Secret | Required | Description |
|---|---|---|
| `RAMP_CLIENT_ID` | Yes | OAuth client ID from Ramp Developer Portal |
| `RAMP_CLIENT_SECRET` | Yes | OAuth client secret from Ramp Developer Portal |
| `RAMP_USER_ID` | Yes | Ramp user ID to assign Agent Cards to (service account) |
| `RAMP_WEBHOOK_SECRET` | Yes (webhooks) | HMAC-SHA256 secret for inbound Ramp webhook verification |
| `RAMP_OAUTH_STATE_SECRET` | Yes (OAuth) | HMAC key for CSRF state tokens — `openssl rand -hex 32` |

**Ramp environment:** set `RAMP_ENV=sandbox` in `[vars]` for sandbox; remove or set to `production` for live.

**Important:** `cards:read_agentic` scope (required for Agent Cards) requires Ramp production approval. Sandbox Agent Cards work without this scope. Register your OAuth redirect URI (`https://integration.untitledfinancial.com/ramp/oauth/callback`) with Ramp support before going live — wildcard subdomains are not supported.

---

## Health and manifest

```bash
GET https://integration.untitledfinancial.com/ramp/health
GET https://integration.untitledfinancial.com/ramp/manifest
```

---

## Further reading

- [Integration API reference](/api/integration-api)
- [MCP tools](/integrations/mcp)
- [SFDR & CSRD Compliance](/protocol/sfdr-csrd)
- [Mercury](/integrations/mercury) — banking-layer alternative to Ramp
