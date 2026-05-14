---
title: Webhook Events
description: Receive real-time DPX settlement callbacks from the Integration API — HMAC-signed, 4-attempt retry, full compliance payload.
---

The DPX Integration API delivers outbound webhook callbacks on every payment event. Supply a `callbackUrl` in your payment request and DPX POSTs the full settlement result to your endpoint on completion.

---

## How it works

Include `callbackUrl` in any `POST /payments/initiate` request:

```json
{
  "tmsReference": "TMS-20260514-001",
  "amount":       "250000.00",
  ...
  "callbackUrl":  "https://tms.yourcompany.com/webhooks/dpx"
}
```

DPX fires the callback asynchronously after settlement — your `POST /payments/initiate` response returns immediately with initial status; the callback delivers the final result.

---

## Retry schedule

| Attempt | Delay after previous |
|---|---|
| 1 | Immediate (at settlement) |
| 2 | 5 seconds |
| 3 | 30 seconds |
| 4 | 5 minutes |

After 4 failed attempts, `webhook_status` is set to `FAILED` in the audit log. Poll `GET /payments/:id` to retrieve the result at any time.

---

## Event payload

DPX POSTs the full `PaymentResult` object to your `callbackUrl`:

```json
{
  "dpxPaymentId": "a4f2c8d1-9e4b-4f2a-b8c1-2d3e4f5a6b7c",
  "tmsReference": "TMS-20260514-001",
  "status":       "SETTLED",
  "submittedAt":  1747267200,
  "settledAt":    1747267215,

  "settlement": {
    "txHash":       "0x7f3a1b2c...",
    "amount":       "250000.00",
    "currency":     "USD",
    "asset":        "USDC",
    "network":      "base-mainnet",
    "exchangeRate": "1.0000",
    "fee":          "337.50"
  },

  "vop": {
    "requestId":   "550e8400-e29b-41d4-a716-446655440000",
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

**Status values in callbacks:**

| Status | Meaning |
|---|---|
| `SETTLED` | On-chain settlement confirmed |
| `BLOCKED` | VoP name mismatch — payment not sent |
| `FAILED` | Settlement rail error |

---

## Signature verification

Every callback includes two headers:

```
X-DPX-Signature: <hmac-sha256-hex>
X-DPX-PaymentId: <dpxPaymentId>
```

Verify the signature before processing the payload:

```typescript
// Node.js / Cloudflare Workers
async function verifySignature(body: string, signature: string, key: string): Promise<boolean> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'],
  );
  const sigBytes = new Uint8Array(signature.match(/.{2}/g)!.map(b => parseInt(b, 16)));
  return crypto.subtle.verify('HMAC', cryptoKey, sigBytes, enc.encode(body));
}
```

```python
# Python
import hmac, hashlib

def verify_signature(body: bytes, signature: str, key: str) -> bool:
    expected = hmac.new(key.encode(), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
```

Contact DPX to receive your `WEBHOOK_SIGNING_KEY`.

---

## BLOCKED payments

When VoP returns a score below the threshold, the payment is blocked before settlement. The callback still fires with `status: "BLOCKED"`:

```json
{
  "status": "BLOCKED",
  "vop": {
    "result":      "BLOCKED",
    "proceedSafe": false,
    "score":       18,
    "message":     "Name does not match registered entity."
  },
  "compliance": {
    "fatfR16Compliant": false,
    "regulatoryNote":   "Settlement blocked — VoP name mismatch below minimum threshold."
  },
  "error": "Name does not match registered entity."
}
```

---

## Inbound webhooks (trigger settlements)

Any external system can also POST payment instructions to the Integration API to trigger a settlement. See the [Integration API reference](/api/integration-api) for the full request format.

For Mercury banking customers, dedicated inbound webhook handling is available — see the [Mercury integration guide](/integrations/mercury).

---

## Polling (no callbackUrl)

If you prefer polling over callbacks, omit `callbackUrl` and poll `GET /payments/:id`:

```bash
curl https://integration.untitledfinancial.com/payments/a4f2c8d1-... \
  -H "Authorization: Bearer <key>"
```

Or look up by your TMS reference:

```bash
curl "https://integration.untitledfinancial.com/payments?tmsReference=TMS-20260514-001" \
  -H "Authorization: Bearer <key>"
```
