---
title: Integration API
description: ISO 20022 bridge to DPX settlement — the entry point for treasury management systems and institutional payment flows.
---

The DPX Integration API is the entry point for institutional treasury systems. It speaks ISO 20022 today and is simultaneously wired for agent-to-agent payments.

**Base URL:** `https://integration.untitledfinancial.com`

**Authentication:** `Authorization: Bearer <institution-key>`

Every payment automatically runs VoP (via the Compliance Oracle), fetches the live FX rate (via the Stability Oracle), settles on the DPX rail, and returns a full compliance attestation. No separate oracle integration required.

:::note[Live — end-to-end verified 2026-05-14]
Full stack tested on Base mainnet. VoP returned score 100 (EXACT_NORMALIZED). FATF R16, MiCA, and GENIUS Act compliance flags confirmed. ISO 20022 pacs.002 returned on every response.
:::

---

## POST /payments/initiate

Submit a payment. Accepts ISO 20022 pain.001 (JSON encoding) or DPX native format.

**Rate limit:** 1,000 requests/minute per key

### DPX native format

```bash
curl -X POST https://integration.untitledfinancial.com/payments/initiate \
  -H "Authorization: Bearer <key>" \
  -H "Content-Type: application/json" \
  -d '{
    "tmsReference":    "TMS-20260514-001",
    "amount":          "250000.00",
    "currency":        "USD",
    "settlementAsset": "USDC",
    "creditor": {
      "name":          "Deutsche Bank AG",
      "lei":           "7LTWFZYICNSX8D621K86",
      "walletAddress": "0xabc...",
      "accountRef":    "DE89370400440532013000"
    },
    "debtor": {
      "name":          "Acme Corp",
      "lei":           "549300TRUWO2CD2G5692",
      "walletAddress": "0xdef..."
    },
    "remittanceInfo":  "INV-2026-0042",
    "requestedExecutionDate": "2026-05-14",
    "callbackUrl":     "https://tms.acmecorp.com/webhooks/dpx"
  }'
```

### ISO 20022 pain.001 format

The API accepts the JSON encoding of ISO 20022 pain.001 (CustomerCreditTransferInitiation) exactly as Kyriba, SAP, and Oracle Treasury emit it. No transformation required.

```json
{
  "Document": {
    "CstmrCdtTrfInitn": {
      "GrpHdr": {
        "MsgId":    "ACME20260514001",
        "CreDtTm":  "2026-05-14T09:00:00Z",
        "NbOfTxs":  "1",
        "InitgPty": { "Nm": "Acme Corp" }
      },
      "PmtInf": [{
        "PmtMtd":       "TRF",
        "ReqdExctnDt":  { "Dt": "2026-05-14" },
        "Dbtr":         { "Nm": "Acme Corp", "Id": { "OrgId": { "LEI": "549300TRUWO2CD2G5692" } } },
        "CdtTrfTxInf": [{
          "PmtId":  { "EndToEndId": "TMS-20260514-001" },
          "Amt":    { "InstdAmt": { "Ccy": "USD", "value": "250000.00" } },
          "Cdtr":   { "Nm": "Deutsche Bank AG", "Id": { "OrgId": { "LEI": "7LTWFZYICNSX8D621K86" } } },
          "CdtrAcct": { "Id": { "Othr": { "Id": "0xabc..." } } }
        }]
      }]
    }
  }
}
```

### Response

```json
{
  "dpxPaymentId": "a4f2c8d1-...",
  "tmsReference": "TMS-20260514-001",
  "status":       "SETTLED",
  "submittedAt":  1747267200,
  "settledAt":    1747267215,
  "settlement": {
    "txHash":       "0x7f3a...",
    "amount":       "250000.00",
    "currency":     "USD",
    "asset":        "USDC",
    "network":      "base-mainnet",
    "exchangeRate": "1.0000",
    "fee":          "337.50"
  },
  "vop": {
    "requestId":   "550e8400-...",
    "result":      "LEI_MATCH",
    "proceedSafe": true,
    "score":       100,
    "resolvedBy":  "LEI_EXACT_MATCH",
    "message":     "LEI verified and active. Identity confirmed."
  },
  "compliance": {
    "fatfR16Compliant": true,
    "micaCompliant":    true,
    "geniusCompliant":  true,
    "regulatoryNote":   "FATF R16 VoP satisfied — settlement compliant."
  }
}
```

**Payment statuses:**

| Status | Meaning |
|---|---|
| `SETTLED` | On-chain settlement confirmed |
| `PENDING` | Queued — not yet processed |
| `BLOCKED` | VoP name mismatch — payment not sent |
| `FAILED` | Settlement rail error |

**Idempotency:** Requests with the same `tmsReference` return the cached result — safe to retry without double-sending.

---

## POST /payments/batch

Submit up to 50 payments in a single request. Each payment is processed independently with its own idempotency key.

```json
{
  "payments": [
    { "tmsReference": "REF-001", ... },
    { "tmsReference": "REF-002", ... }
  ]
}
```

Returns an array of `PaymentResult` objects in the same order.

---

## GET /payments/:id

Retrieve a payment by DPX payment ID.

```bash
curl https://integration.untitledfinancial.com/payments/a4f2c8d1-... \
  -H "Authorization: Bearer <key>"
```

---

## GET /payments?tmsReference=:ref

Retrieve a payment by your TMS reference.

```bash
curl "https://integration.untitledfinancial.com/payments?tmsReference=TMS-20260514-001" \
  -H "Authorization: Bearer <key>"
```

---

## GET /rates/:currency

Live FX rate from the Stability Oracle for a given currency vs USD.

```bash
curl https://integration.untitledfinancial.com/rates/EUR
# { "currency": "EUR", "rate": "1.0842", "updatedAt": 1747267200 }
```

No authentication required.

---

## GET /health

Returns Integration API status plus upstream oracle health.

```json
{
  "status":           "ok",
  "complianceOracle": "ok",
  "stabilityOracle":  "ok",
  "db":               "ok"
}
```

---

## GET /manifest

MCP tool manifest — machine-readable tool definitions for agent integrations. Returns all endpoints as MCP-compatible tool schemas. Agents call this once to discover available tools.

---

## Webhooks

Supply a `callbackUrl` in your payment request to receive outbound callbacks. DPX POSTs the full `PaymentResult` to your URL on settlement (or failure).

**Signature verification:**

```
X-DPX-Signature: <hmac-sha256-hex>
X-DPX-PaymentId: <dpxPaymentId>
```

Verify: `HMAC-SHA256(body, WEBHOOK_SIGNING_KEY)` — contact DPX for your key.

**Retry schedule:** immediate → 5 seconds → 30 seconds → 5 minutes (4 attempts total).

See the full [Webhooks guide](/integrations/webhooks) for event schemas and verification examples.

---

## ISO 20022 field mapping

Key mappings from pain.001 to DPX native:

| pain.001 field | DPX field |
|---|---|
| `GrpHdr.MsgId` or `PmtId.EndToEndId` | `tmsReference` |
| `InstdAmt.value` | `amount` |
| `InstdAmt.Ccy` | `currency` |
| `Cdtr.Nm` | `creditor.name` |
| `CdtrAcct.Id.Othr.Id` | `creditor.walletAddress` |
| `CdtrAgt.FinInstnId.LEI` or `Cdtr.Id.OrgId.LEI` | `creditor.lei` |
| `Dbtr.Nm` | `debtor.name` |
| `DbtrAcct.Id.Othr.Id` | `debtor.walletAddress` |
| `Dbtr.Id.OrgId.LEI` | `debtor.lei` |
| `RmtInf.Ustrd` | `remittanceInfo` |
| `ReqdExctnDt.Dt` | `requestedExecutionDate` |

The response is returned as a pacs.002 envelope (FIToFIPaymentStatusReport) with DPX compliance extension fields when the request was in pain.001 format.

---

## MCP tools (agent integration)

Every endpoint is also an MCP tool. Call `GET /manifest` to get tool schemas, then invoke them with the same bearer auth. The same API works for both TMS systems and autonomous payment agents.

See the [MCP integration guide](/integrations/mcp) for setup instructions.
