---
title: Compliance Oracle API
description: Verification of Payee (VoP) endpoint reference — FATF R16, SEPA VoP, MiCA, GENIUS Act. No human queues.
---

FATF Recommendation 16 compliant VoP for every payment. Automatic resolution — no human queues, no blocked payments for ambiguity.

**Base URL:** `https://compliance.untitledfinancial.com`

:::note
Institutions using the [Integration API](/api/integration-api) do not need to call this directly — VoP runs automatically on every `POST /payments/initiate`. This reference is for direct integrations.
:::

---

## POST /vop/verify — VoP check

Verify the identity of a payment counterparty before settlement. Costs `$0.075 USDC` via [x402](https://x402.org) on Base mainnet — pay via the `X-PAYMENT` header.

```bash
curl -X POST https://compliance.untitledfinancial.com/vop/verify \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: <base64-x402-payload>" \
  -d '{
    "walletAddress": "0xabc...",
    "submittedName": "Deutsche Bank AG",
    "submittedLei":  "7LTWFZYICNSX8D621K86"
  }'
```

**Request fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `walletAddress` | string | Yes | Wallet address of the counterparty |
| `submittedName` | string | Yes | Name as submitted by the payment initiator |
| `submittedLei` | string | No | LEI of the counterparty (bypasses name matching if matched) |

**Response:**

```json
{
  "requestId":      "550e8400-e29b-41d4-a716-446655440000",
  "result":         "LEI_MATCH",
  "proceedSafe":    true,
  "score":          100,
  "resolvedBy":     "LEI_EXACT_MATCH",
  "registeredName": "Deutsche Bank Aktiengesellschaft",
  "registeredLei":  "7LTWFZYICNSX8D621K86",
  "leiStatus":      "ACTIVE",
  "message":        "LEI verified and active. Identity confirmed.",
  "attestation": {
    "fatfR16Compliant": true,
    "regulatoryNote":   "FATF R16 VoP satisfied via GLEIF-verified LEI exact match."
  }
}
```

**Resolution tiers:**

| Result | Score | Proceeds? | Meaning |
|---|---|---|---|
| `LEI_MATCH` | 100 | ✅ | LEI matched exactly — name check skipped |
| `VERIFIED` | 90–100 | ✅ | Strong name match |
| `PROCEED_HIGH_CONFIDENCE` | 75–89 | ✅ | Good match, minor discrepancy noted |
| `PROCEED_FLAGGED` | 55–74 | ✅ | Moderate match, flagged in attestation |
| `PROCEED_UNVERIFIED` | 35–54 | ✅ | Low match, marked unverified |
| `NOT_REGISTERED` | — | ✅ | Wallet not in registry — no identity to verify |
| `LEI_INACTIVE` | 100 | ✅ | LEI matched but lapsed — warns counterparty |
| `BLOCKED` | <35 | ❌ | Name mismatch below threshold — payment blocked |

The only hard block is `BLOCKED` — when names are so dissimilar the payment is likely misdirected. Every other result proceeds, with the degree of confidence recorded in the attestation.

---

## GET /vop/lookup/:wallet — Entity lookup

Free. Returns the registered entity for a wallet address.

```bash
curl https://compliance.untitledfinancial.com/vop/lookup/0xabc...
```

**Response:**

```json
{
  "walletAddress": "0xabc...",
  "legalName":     "Deutsche Bank Aktiengesellschaft",
  "lei":           "7LTWFZYICNSX8D621K86",
  "leiStatus":     "ACTIVE",
  "aliases":       ["Deutsche Bank", "DB"],
  "registeredAt":  1747267200
}
```

Returns `404` if the wallet is not registered.

---

## GET /vop/history/:wallet — Audit history

Free. Returns the last 50 VoP checks for a wallet.

```bash
curl https://compliance.untitledfinancial.com/vop/history/0xabc...
```

---

## GET /lei/:lei — LEI lookup

Free. Returns GLEIF data + all wallets registered under a given LEI.

```bash
curl https://compliance.untitledfinancial.com/lei/7LTWFZYICNSX8D621K86
```

---

## POST /register — Register a wallet (admin)

Bearer-authenticated with `ORACLE_SIGNING_KEY`. Verifies the LEI against GLEIF before registering.

```bash
curl -X POST https://compliance.untitledfinancial.com/register \
  -H "Authorization: Bearer <signing-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0xabc...",
    "lei":           "7LTWFZYICNSX8D621K86",
    "legalName":     "Deutsche Bank AG",
    "aliases":       ["Deutsche Bank", "DB"]
  }'
```

---

## DELETE /register/:wallet — Deactivate (admin)

Bearer-authenticated. Marks the registration inactive — does not delete audit records.

---

## GET /.well-known/x402 — Payment discovery

Machine-readable x402 payment requirements for autonomous agents. Call once and cache.

```json
{
  "version": 1,
  "endpoints": {
    "POST /vop/verify": {
      "price": { "amount": "75000", "currency": "USDC", "decimals": 6 },
      "network": "base",
      "facilitator": "https://x402.org/facilitator"
    }
  }
}
```

---

## GET /openapi.json — OpenAPI 3.1 spec

Machine-readable schema.

---

## Compliance coverage

| Regulation | Status |
|---|---|
| FATF R16 (June 2025) | ✅ Satisfied when LEI match or score ≥ 75 |
| SEPA VoP (Oct 2025) | ✅ Name matching + LEI verification |
| EU MiCA Article 68 | ✅ Travel Rule identity verification |
| US GENIUS Act | ✅ Stablecoin transfer identity requirements |
| MiFID II | ✅ Counterparty identity audit trail |

---

## x402 payment (agents)

VoP checks are priced at **$0.075 USDC** per call. The `X-PAYMENT` header carries a base64-encoded payment payload — settlement is verified atomically by the Coinbase x402 facilitator before the result is returned.

Query `/.well-known/x402` to get payment requirements programmatically.

For agents integrated via the [Integration API](/api/integration-api), this cost is bundled into the integration fee — no separate x402 payment required.
