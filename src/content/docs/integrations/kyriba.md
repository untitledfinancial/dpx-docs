---
title: Kyriba
description: Two integration modes — DPX as a Kyriba Connect Marketplace connector (SPI), and Kyriba pushing ISO 20022 pain.001 directly to the DPX Integration API.
---

DPX integrates with Kyriba in two modes:

| Mode | Who initiates | Best for |
|---|---|---|
| **[Payment Initiation SPI](#payment-initiation-service-spi)** | Kyriba calls DPX | Kyriba Connect Marketplace certified connector — Kyriba-native flow |
| **[Direct Integration API](#direct-integration-api)** | Kyriba calls DPX | Custom setup, non-Marketplace deployments |

Both modes accept ISO 20022 pain.001, return pacs.002, and include full FATF R16 / MiCA / GENIUS Act compliance attestation.

**Base URL:** `https://integration.untitledfinancial.com`

---

## Payment Initiation Service SPI

DPX implements the **Kyriba Payment Initiation Service SPI v1.0.0** — the certified connector contract from the Kyriba Connect Marketplace. Kyriba acts as the client; DPX acts as the server.

Base path: `/bank-connectivity/payment-initiation/v1`

### Architecture

```
Kyriba payment run
    │
    │  Kyriba-Context JWT (tenant identity)
    │  Encrypted pain.001 payload (AES-256-GCM)
    ▼
POST /bank-connectivity/payment-initiation/v1/bank/dpx-settlement-rail/payments
    │
    ├── JWT verification (Kyriba-Context header)
    ├── Payload decryption (AES-256-GCM)
    ├── pain.001 parse (XML or JSON)
    ├── VoP → Compliance Oracle
    ├── FX rate → Stability Oracle
    └── Settle → DPX rail (USDC on Base)
    │
    ▼
201 { "id": "dpx-payment-uuid" }
    │
    │  Kyriba polls for status
    ▼
GET /bank-connectivity/payment-initiation/v1/bank/dpx-settlement-rail/payments/{id}/status
    │
    ▼
202 { status: { format: "pacs.002.001.10", payload: { ... } } }
```

### SPI endpoints

#### GET /banks

Kyriba discovery — returns DPX's identity as a registered payment service provider. No authentication required.

```bash
curl https://integration.untitledfinancial.com/bank-connectivity/payment-initiation/v1/banks
```

```json
{
  "metadata": { "total": 1, "count": 1, "limit": 100, "offset": 0 },
  "results": [{
    "id":    "dpx-settlement-rail",
    "name":  "dpx-settlement-rail",
    "title": "DPX Settlement Rail — Untitled_ LuxPerpetua Technologies, Inc."
  }]
}
```

#### POST /bank/{bankNameOrId}/payments

Submit a payment initiation. `bankNameOrId` must be `dpx-settlement-rail`.

**Required headers:**

| Header | Description |
|---|---|
| `Kyriba-Context` | JWT identifying the Kyriba tenant (see [Authentication](#spi-authentication)) |
| `Idempotency-Key` | Unique per-payment key — duplicate submissions return the original payment ID |
| `Content-Type` | `application/json` |

**Request body:**

```json
{
  "remittance": {
    "format":    "pain.001.001.09",
    "subFormat": "XML",
    "payload": {
      "encryption": {
        "algorithm":     "AES-256-GCM",
        "keyName":       "dpx-default",
        "initialVector": "<base64-encoded 12-byte IV>"
      },
      "body": {
        "content":         "<base64-encoded encrypted pain.001>",
        "contentEncoding": "base64"
      }
    }
  }
}
```

**Sandbox mode** (no `KYRIBA_ENCRYPTION_KEY` set): pass an unencrypted base64 pain.001 with no `encryption` block.

**Response 201:**

```json
{ "id": "93e89fe0-a29f-40a5-b204-57d3dffc8812" }
```

#### GET /bank/{bankNameOrId}/payments/{paymentId}/status

Poll for payment status. Returns a pacs.002 in the Kyriba SPI envelope.

**Required headers:** `Kyriba-Context` JWT

**Response 202:**

```json
{
  "status": {
    "format": "pacs.002.001.10",
    "payload": {
      "body": {
        "content":         "<base64-encoded pacs.002>",
        "contentEncoding": "base64"
      }
    }
  }
}
```

In production (with `KYRIBA_ENCRYPTION_KEY` set), the payload is AES-256-GCM encrypted. In sandbox, it is plain base64.

Decode the content to get the full pacs.002:

```json
{
  "Document": {
    "FIToFIPmtStsRpt": {
      "GrpHdr": { "MsgId": "DPX-93E89FE0", "CreDtTm": "2026-05-15T..." },
      "TxInfAndSts": [{
        "OrgnlEndToEndId": "KYRIBA-REF-001",
        "TxSts": "ACCP",
        "SplmtryData": [{
          "Envlp": {
            "connector":       "dpx-settlement-rail",
            "DPXPaymentId":    "93e89fe0-...",
            "network":         "base-mainnet",
            "settlementAsset": "USDC",
            "txHash":          "0x...",
            "fatfR16Compliant": true,
            "micaCompliant":    true
          }
        }]
      }]
    }
  }
}
```

**pacs.002 status codes:**

| `TxSts` | Meaning |
|---|---|
| `ACCP` | Settled — `txHash` present |
| `PDNG` | In progress |
| `RJCT` | Blocked — `rejectReason` present |

### SPI authentication

The `Kyriba-Context` header is a JWT signed by Kyriba identifying the tenant. DPX verifies:

- JWT structure (3 parts)
- Expiry (`exp` claim)
- HMAC-SHA256 signature against `KYRIBA_JWT_SECRET` (production only; structure-only in sandbox)

**JWT claims:**

| Claim | Description |
|---|---|
| `iss` | `https://<tenant>.treasury-factory.com/gateway` |
| `sub` | `<clientId>@<tenantId>` |
| `aud` | `dpx-settlement-rail` |
| `kid` | Key name used for signing |
| `exp` | Expiry timestamp |
| `jti` | Unique token identifier (32 hex chars) |
| `payload_hash` | SHA-256 of the unencrypted pain.001 |

### Payload encryption

Production deployments use **AES-256-GCM** to encrypt the pain.001 payload before transmission. The shared key (`KYRIBA_ENCRYPTION_KEY`) is a 64-character hex string (32 bytes) exchanged during Kyriba connector certification.

```
Kyriba                                   DPX
  │                                        │
  │  AES-256-GCM encrypt(pain.001, key)   │
  │ ──────────────────────────────────── ▶ │
  │                                        │  AES-256-GCM decrypt(body.content, key)
  │                                        │  → plain pain.001 XML / JSON
  │                                        │  → processPayment()
  │                                        │
  │  AES-256-GCM decrypt(pacs.002 body)   │
  │ ◀ ────────────────────────────────── │
  │                                        │  AES-256-GCM encrypt(pacs.002, key)
```

**Secrets to configure** (via `wrangler secret put`):

| Secret | Description |
|---|---|
| `KYRIBA_JWT_SECRET` | HMAC-SHA256 key — provided by Kyriba during certification |
| `KYRIBA_ENCRYPTION_KEY` | 64-char hex AES-256 key — generate: `openssl rand -hex 32` |

### Idempotency

The `Idempotency-Key` header deduplicates submissions. If Kyriba retries a payment with the same key, DPX returns the original payment ID without reprocessing:

```
First call:  Idempotency-Key: KYRIBA-REF-001  →  201 { "id": "abc123" }
Retry:       Idempotency-Key: KYRIBA-REF-001  →  201 { "id": "abc123" }  (no duplicate)
```

### Sandbox testing

Test the full SPI flow without production credentials:

```bash
# 1. Build a mock JWT (structure only — no secret required in sandbox)
HEADER=$(echo -n '{"alg":"HS256","typ":"JWT"}' | base64 | tr -d '=' | tr '+/' '-_')
PAYLOAD=$(echo -n '{
  "iss":"https://sandbox.treasury-factory.com/gateway",
  "sub":"test@sandbox",
  "aud":"dpx-settlement-rail",
  "kid":"sandbox-key-1",
  "exp":'$(($(date +%s)+3600))',
  "iat":'$(date +%s)',
  "jti":"aabbccddeeff00112233445566778899",
  "payload_hash":"abc123"
}' | base64 | tr -d '=' | tr '+/' '-_')
JWT="$HEADER.$PAYLOAD.sandbox-sig"

# 2. Base64-encode a pain.001 XML (unencrypted sandbox payload)
PAIN=$(base64 < pain001.xml)

# 3. Submit
curl -X POST \
  https://integration.untitledfinancial.com/bank-connectivity/payment-initiation/v1/bank/dpx-settlement-rail/payments \
  -H "Content-Type: application/json" \
  -H "Kyriba-Context: $JWT" \
  -H "Idempotency-Key: SANDBOX-$(date +%s)" \
  -d '{
    "remittance": {
      "format": "pain.001.001.09",
      "subFormat": "XML",
      "payload": {
        "body": { "content": "'$PAIN'", "contentEncoding": "base64" }
      }
    }
  }'
```

---

## Direct Integration API

For non-Marketplace or custom deployments, Kyriba can push pain.001 directly to the DPX Integration API using a bearer token.

### Architecture

```
Kyriba payment run
    │
    │  ISO 20022 pain.001 (JSON or XML)
    │  Authorization: Bearer <institution-key>
    ▼
POST https://integration.untitledfinancial.com/payments/initiate
    │
    ├── VoP check → Compliance Oracle
    ├── FX rate  → Stability Oracle
    └── Settle   → DPX rail (USDC on Base)
    │
    ▼
pacs.002 response + webhook callback to Kyriba
```

### Setup

#### 1. Get an institution API key

Contact DPX to receive your institution bearer token.

#### 2. Configure a Kyriba payment type

In Kyriba, navigate to **Administration → Payment Types → New**:

| Field | Value |
|---|---|
| Name | `DPX Settlement` |
| Method | `HTTP Request (REST)` |
| URL | `https://integration.untitledfinancial.com/payments/initiate` |
| Auth type | Bearer token |
| Token | `<your-institution-key>` |
| Content-Type | `application/json` |

#### 3. Field mapping

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

#### 4. Example request

```bash
curl -X POST https://integration.untitledfinancial.com/payments/initiate \
  -H "Authorization: Bearer <key>" \
  -H "Content-Type: application/json" \
  -d '{
    "tmsReference": "KYRIBA-2026-0042",
    "amount":       "250000.00",
    "currency":     "USD",
    "settlementAsset": "USDC",
    "creditor": {
      "name":          "Acme Global Corp",
      "lei":           "5493001KJTIIGC8Y1R12",
      "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9Db96590c32E8"
    },
    "debtor": {
      "name":          "Ordering Corp",
      "lei":           "213800WSGIIZCXF1P572",
      "walletAddress": "0x1234567890123456789012345678901234567890"
    },
    "remittanceInfo": "Invoice INV-2026-0042",
    "callbackUrl":   "https://your-kyriba-instance/dpx/callback"
  }'
```

#### 5. Webhook callback

Set `callbackUrl` to your Kyriba inbound endpoint. DPX POSTs the full settlement result there on completion, signed with `X-DPX-Signature` (HMAC-SHA256).

See [Webhook Events](/integrations/webhooks) for the full payload schema.

### ISO 20022 pain.001

The Integration API also accepts raw pain.001 JSON directly:

```bash
curl -X POST https://integration.untitledfinancial.com/payments/initiate \
  -H "Authorization: Bearer <key>" \
  -H "Content-Type: application/json" \
  -d '{
    "Document": {
      "CstmrCdtTrfInitn": { "..." }
    }
  }'
```

---

## Compliance included

Every DPX settlement — via SPI or direct — includes a full compliance block:

```json
"compliance": {
  "fatfR16Compliant": true,
  "micaCompliant":    true,
  "geniusCompliant":  true,
  "regulatoryNote":   "FATF R16 VoP satisfied — settlement compliant."
}
```

FinCEN Travel Rule records (IVMS 101) are automatically generated for all payments ≥ $3,000 and stored for 5 years. See [FinCEN Travel Rule](/protocol/fincen-travel-rule).

---

## Further reading

- [Integration API reference](/api/integration-api)
- [Webhook Events](/integrations/webhooks)
- [FATF & Travel Rule](/protocol/fatf-compliance)
- [FinCEN Travel Rule](/protocol/fincen-travel-rule)
