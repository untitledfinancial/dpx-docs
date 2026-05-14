---
title: Kyriba
description: Connect DPX settlement rails to Kyriba treasury management — ISO 20022 pain.001 output routes directly to the DPX Integration API.
---

Kyriba connects to DPX through the [Integration API](/api/integration-api) — no custom connector or middleware required. Kyriba already emits ISO 20022 pain.001, which the Integration API accepts natively.

**Base URL:** `https://integration.untitledfinancial.com`

---

## How it works

```
Kyriba payment run
    │
    │  ISO 20022 pain.001 (JSON or XML→JSON)
    ▼
POST https://integration.untitledfinancial.com/payments/initiate
    │
    ├── VoP check → Compliance Oracle (automatic)
    ├── FX rate  → Stability Oracle (automatic)
    └── Settle   → DPX rail (USDC on Base)
    │
    ▼
pacs.002 response + webhook callback to Kyriba
```

Kyriba posts the payment instruction, DPX handles VoP, FX, and settlement, and returns a full compliance attestation (FATF R16, MiCA, GENIUS Act) with the transaction hash.

---

## Setup

### 1. Get an institution API key

Contact DPX to receive your institution bearer token.

### 2. Configure a Kyriba payment type

In Kyriba, navigate to **Administration → Payment Types → New**:

| Field | Value |
|---|---|
| Name | `DPX Settlement` |
| Method | `HTTP Request (REST)` |
| URL | `https://integration.untitledfinancial.com/payments/initiate` |
| Auth type | Bearer token |
| Token | `<your-institution-key>` |
| Content-Type | `application/json` |

### 3. Map Kyriba fields to the Integration API

Kyriba can emit pain.001 JSON directly. The Integration API accepts it without transformation. If your Kyriba version emits XML, use Kyriba's built-in JSON transformation or pass through Kyriba Integration Suite.

**Minimum field map:**

| Kyriba output | Integration API field |
|---|---|
| Transaction reference | `tmsReference` |
| Instructed amount | `amount` |
| Currency | `currency` |
| Beneficiary name | `creditor.name` |
| Beneficiary LEI | `creditor.lei` |
| Beneficiary wallet / account | `creditor.walletAddress` |
| Ordering customer LEI | `debtor.lei` |
| Remittance information | `remittanceInfo` |
| Requested execution date | `requestedExecutionDate` |
| Kyriba callback URL | `callbackUrl` |

### 4. Configure the webhook callback

Set `callbackUrl` to your Kyriba inbound webhook endpoint. DPX will POST the full settlement result there on completion, with an HMAC-SHA256 signature in `X-DPX-Signature`.

---

## Payment flow in Kyriba

1. Treasurer approves a payment in Kyriba
2. Kyriba triggers the DPX payment type on approval
3. Integration API runs VoP — if `BLOCKED`, DPX returns status `BLOCKED` and Kyriba holds the payment
4. FX rate fetched from Stability Oracle
5. Settlement executes on Base (USDC)
6. DPX POSTs pacs.002 callback to Kyriba with `txHash`, compliance attestation, and final amounts
7. Kyriba marks the payment settled and stores the transaction hash

---

## Testing

Use a `tmsReference` with a `TEST-` prefix in your sandbox environment. The Integration API will simulate VoP and settlement without submitting on-chain.

```bash
curl -X POST https://integration.untitledfinancial.com/payments/initiate \
  -H "Authorization: Bearer <key>" \
  -H "Content-Type: application/json" \
  -d '{
    "tmsReference": "TEST-KYRIBA-001",
    "amount": "100000.00",
    "currency": "USD",
    "settlementAsset": "USDC",
    "creditor": {
      "name": "Test Beneficiary",
      "lei":  "7LTWFZYICNSX8D621K86",
      "walletAddress": "0xabc..."
    },
    "debtor": {
      "name": "Test Ordering Party",
      "lei":  "549300TRUWO2CD2G5692",
      "walletAddress": "0xdef..."
    }
  }'
```

---

## Compliance included

Every DPX settlement response includes a `compliance` block — no additional Kyriba compliance configuration needed:

```json
"compliance": {
  "fatfR16Compliant": true,
  "micaCompliant":    true,
  "geniusCompliant":  true,
  "regulatoryNote":   "FATF R16 VoP satisfied — settlement compliant."
}
```

This satisfies FATF R16 Travel Rule requirements for cross-border payments and can be stored in Kyriba's audit trail.

---

## Full API reference

→ [Integration API](/api/integration-api)  
→ [Webhook Events](/integrations/webhooks)
