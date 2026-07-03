---
title: Finastra (Fusion Treasury)
description: DPX integrates with Finastra's FusionFabric.cloud open banking platform — register as a marketplace app so European banks using Fusion Treasury can route international payments to the DPX settlement rail without changing their core system.
---

Finastra is the third-largest fintech by revenue, dominant in European bank treasury and payments. Fusion Treasury and Fusion Payments are used by mid-to-large banks across the UK, Germany, France, Benelux, and the Nordics.

DPX integrates via **FusionFabric.cloud** — Finastra's open API marketplace. DPX registers as a FusionFabric app. Banks already running Fusion Treasury install the DPX app from the marketplace. When a treasury team initiates a cross-border payment, DPX appears as an alternative settlement channel alongside SWIFT.

```
Fusion Treasury payment run (bank-side)
    │
    │  Cross-border payment selected for DPX routing
    │  FusionFabric app call → DPX Payment International endpoint
    ▼
POST https://integration.untitledfinancial.com/payments/initiate
    │
    ├── Compliance Oracle (VoP, AML, sanctions)
    ├── Stability Oracle (macro gate)
    ├── ESG Oracle (SFDR PAI indicators)
    └── Settlement → DPX rail (USDC / EURC on Base)
    │
    ▼
ISO 20022 pacs.002 → FusionFabric → Fusion Treasury write-back
```

No bank core system change required. DPX appears alongside SWIFT as a settlement option in the Fusion Treasury payment workflow.

---

## Integration model

Finastra's FusionFabric.cloud marketplace operates differently from a direct API connection:

| Step | Who does it | What happens |
|---|---|---|
| App registration | DPX | Register at [developer.fusionfabric.cloud](https://developer.fusionfabric.cloud) |
| App listing | DPX | Submit DPX app to FusionFabric marketplace for bank discovery |
| App installation | Bank | Bank's tech team installs DPX from Finastra marketplace |
| OAuth authorization | Bank | Bank authorizes DPX to receive payment events from Fusion Treasury |
| Payment routing | Bank treasury team | Selects DPX as the rail for eligible cross-border payments |
| Settlement | DPX | Oracle gating + on-chain settlement + pacs.002 returned |

---

## Registration — FusionFabric.cloud

To list DPX on the FusionFabric marketplace:

1. Register at [developer.fusionfabric.cloud](https://developer.fusionfabric.cloud)
2. Create a new application under **FusionCreator → My Apps → New App**
3. Subscribe to the **Payment International API** (`payment-international-v1`)
4. Configure your OAuth redirect URI: `https://integration.untitledfinancial.com/finastra/oauth/callback`
5. Submit for Finastra marketplace review

**Credentials received:**

| Credential | Where used |
|---|---|
| `FFDC_CLIENT_ID` | OAuth client credentials grant |
| `FFDC_CLIENT_SECRET` | OAuth client credentials grant |
| `FFDC_TENANT_ID` | Per-bank identifier passed in API calls |

---

## Authentication

FusionFabric uses OAuth 2.0 client credentials:

```bash
POST https://identity.fusionfabric.cloud/oidc/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id=<FFDC_CLIENT_ID>
&client_secret=<FFDC_CLIENT_SECRET>
&scope=payment-international-v1
```

Token response:
```json
{
  "access_token": "eyJ...",
  "token_type":   "Bearer",
  "expires_in":   3600
}
```

Include the token on all subsequent requests:
```
Authorization: Bearer <access_token>
```

---

## Payment flow

### 1. Receive payment initiation from Fusion Treasury

When a bank treasury team routes a payment to DPX via FusionFabric, Finastra delivers the payment instruction to DPX's registered webhook:

```
POST https://integration.untitledfinancial.com/finastra/payment-events
```

Payload is ISO 20022 pain.001 — same format accepted by the Integration API:

```json
{
  "paymentId":   "FFDC-2026-00421",
  "tenantId":    "<bank-ffdc-tenant-id>",
  "format":      "pain.001.001.09",
  "payment": {
    "amount":    "250000.00",
    "currency":  "USD",
    "creditor": {
      "name":    "Recipient GmbH",
      "lei":     "529900ODI3047E2LIV03",
      "iban":    "DE89370400440532013000"
    },
    "debtor": {
      "name":    "Sending Bank Corp",
      "lei":     "7LTWFZYICNSX8D621K86"
    },
    "remittanceInfo": "Invoice FFDC-2026-00421"
  }
}
```

### 2. DPX processes via Integration API

DPX maps the Finastra payment to the Integration API and returns:

```json
{
  "dpxPaymentId": "93e89fe0-...",
  "status":       "SETTLED",
  "settlement": {
    "txHash":          "0x7f3a...",
    "network":         "base-mainnet",
    "settlementAsset": "EURC",
    "amount":          "250000.00",
    "fee":             "508.75"
  },
  "esg": {
    "score":  74,
    "sfdr": { "article8Compatible": true, "paiIndicators": { "..." } }
  },
  "compliance": {
    "fatfR16Compliant": true,
    "micaCompliant":    true
  },
  "iso20022": {
    "format":  "pacs.002.001.10",
    "status":  "ACCP",
    "payload": "<base64-encoded pacs.002>"
  }
}
```

### 3. pacs.002 returned to Fusion Treasury

DPX POSTs the pacs.002 back to the bank's FusionFabric callback URL. Fusion Treasury receives the settlement confirmation and updates the payment status in the bank's core system.

---

## Direct API path (without marketplace)

For banks that want a direct H2H connection before the marketplace listing is live, or for private deployments:

```bash
POST https://integration.untitledfinancial.com/payments/initiate
Authorization: Bearer <dpx-institution-key>
Content-Type: application/json

{
  "tmsReference":   "FFDC-2026-00421",
  "amount":         "250000.00",
  "currency":       "USD",
  "settlementAsset": "EURC",
  "creditor": {
    "name":          "Recipient GmbH",
    "lei":           "529900ODI3047E2LIV03",
    "walletAddress": "0x..."
  },
  "debtor": {
    "name": "Sending Bank Corp",
    "lei":  "7LTWFZYICNSX8D621K86"
  },
  "callbackUrl": "https://bank-finastra-instance/dpx/callback"
}
```

Contact [case@untitledfinancial.com](mailto:case@untitledfinancial.com) to receive an institution key for direct access.

---

## Secrets required

Set via `wrangler secret put <NAME>` in the Integration API worker:

| Secret | Description |
|---|---|
| `FFDC_CLIENT_ID` | FusionFabric OAuth client ID |
| `FFDC_CLIENT_SECRET` | FusionFabric OAuth client secret |
| `FFDC_WEBHOOK_SECRET` | HMAC key for verifying inbound Finastra webhook events |

---

## Who uses Finastra in Europe

| Market | Product | Common in |
|---|---|---|
| UK banks | Fusion Payments, Fusion Treasury | Clearing banks, mid-tier |
| DACH | Fusion Corporate Channels | Corporate banking arms |
| France | Fusion Trade Innovation | Trade finance desks |
| Benelux | Fusion Treasury | Corporate treasury, asset managers |
| Nordics | Fusion Essence | Retail + corporate banking |

---

## Compliance included

Every DPX settlement returns:

- **FATF R16 VoP** — on-chain Verification of Payee
- **MiCA** — settlement rail and EURC both MiCA-compliant
- **SFDR PAI** — ESG block per transaction for SFDR fund-level reporting
- **AML6** — behavioural profiling + sanctions screening
- **Travel Rule** — IVMS 101 records for payments ≥ €3,000

---

## Status

DPX FusionFabric app registration is the prerequisite. Until the marketplace listing is live, direct H2H connections are available for any Finastra bank that contacts DPX directly.

Contact [case@untitledfinancial.com](mailto:case@untitledfinancial.com) or [register for beta access](/beta).

---

## Further reading

- [Integration API reference](/api/integration-api)
- [SFDR & CSRD Compliance](/protocol/sfdr-csrd)
- [European Institution Quickstart](/guides/european-institutions)
- [TIS Integration](/integrations/tis)
- [Kyriba Integration](/integrations/kyriba)
