---
title: SAP Treasury & Risk Management
description: Connect DPX settlement rails to SAP TRM — ISO 20022 pain.001 output from SAP payment runs routes directly to the DPX Integration API.
---

SAP TRM connects to DPX through the [Integration API](/api/integration-api) via SAP Integration Suite (formerly Cloud Platform Integration) or BTP. SAP already emits ISO 20022 pain.001 from payment programs — the Integration API accepts it without transformation.

**Base URL:** `https://integration.untitledfinancial.com`

---

## How it works

```
SAP payment program (F110 / manual payment order)
    │
    │  ISO 20022 pain.001 (via SAP Integration Suite / BTP)
    ▼
POST https://integration.untitledfinancial.com/payments/initiate
    │
    ├── VoP check → Compliance Oracle (automatic)
    ├── FX rate  → Stability Oracle (automatic)
    └── Settle   → DPX rail (USDC on Base)
    │
    ▼
pacs.002 response + webhook to SAP (settlement confirmation write-back)
```

---

## Setup options

### Option A — SAP Integration Suite (iFlow)

Create an iFlow in SAP Integration Suite that:
1. Subscribes to SAP payment events (F110 batch or individual payment orders)
2. Transforms the payment message to pain.001 JSON (or passes it through if already JSON)
3. POSTs to `https://integration.untitledfinancial.com/payments/initiate` with your bearer token
4. Receives the pacs.002 response and writes the `txHash` and `status` back to SAP

**Outbound HTTP adapter configuration:**

| Field | Value |
|---|---|
| URL | `https://integration.untitledfinancial.com/payments/initiate` |
| Method | POST |
| Authentication | OAuth2 / Bearer token |
| Token header | `Authorization: Bearer <institution-key>` |
| Content-Type | `application/json` |

### Option B — SAP BTP REST adapter

Use the SAP BTP REST service binding with a custom HTTP destination pointing to `https://integration.untitledfinancial.com`.

### Option C — Direct HTTP (smaller deployments)

SAP's `SMICM` + HTTP client (function module `HTTP_POST`) can call the Integration API directly from ABAP without middleware.

---

## Field mapping

| SAP / pain.001 field | Integration API field |
|---|---|
| `EndToEndId` or SAP payment reference | `tmsReference` |
| `InstdAmt.value` | `amount` |
| `InstdAmt.Ccy` | `currency` |
| `Cdtr.Nm` | `creditor.name` |
| `CdtrAgt.FinInstnId.LEI` or `Cdtr.Id.OrgId.LEI` | `creditor.lei` |
| Beneficiary wallet (custom field or `CdtrAcct.Id.Othr`) | `creditor.walletAddress` |
| `Dbtr.Id.OrgId.LEI` | `debtor.lei` |
| `RmtInf.Ustrd` | `remittanceInfo` |
| `ReqdExctnDt.Dt` | `requestedExecutionDate` |

---

## Write-back to SAP

Configure a callback URL pointing to your SAP inbound webhook endpoint. DPX POSTs the settlement result on completion:

```json
{
  "dpxPaymentId": "a4f2c8d1-...",
  "tmsReference": "SAP-F110-20260514-001",
  "status":       "SETTLED",
  "settlement": {
    "txHash":       "0x7f3a...",
    "amount":       "250000.00",
    "exchangeRate": "1.0842",
    "fee":          "337.50"
  },
  "compliance": {
    "fatfR16Compliant": true,
    "regulatoryNote":   "FATF R16 VoP satisfied — settlement compliant."
  }
}
```

Store `txHash` in the SAP payment document as the external bank reference for audit trail purposes.

---

## FATF R16 compliance write-back

The `compliance.fatfR16Compliant` flag confirms that VoP was satisfied for the payment. Store this alongside the SAP document to satisfy Travel Rule audit requirements without any additional compliance workflow.

---

## Testing

```bash
curl -X POST https://integration.untitledfinancial.com/payments/initiate \
  -H "Authorization: Bearer <key>" \
  -H "Content-Type: application/json" \
  -d '{
    "tmsReference": "TEST-SAP-F110-001",
    "amount": "250000.00",
    "currency": "EUR",
    "settlementAsset": "USDC",
    "creditor": {
      "name": "Deutsche Bank AG",
      "lei":  "7LTWFZYICNSX8D621K86",
      "walletAddress": "0xabc..."
    },
    "debtor": {
      "name": "Test Company",
      "lei":  "549300TRUWO2CD2G5692",
      "walletAddress": "0xdef..."
    }
  }'
```

---

## Full API reference

→ [Integration API](/api/integration-api)  
→ [Webhook Events](/integrations/webhooks)
