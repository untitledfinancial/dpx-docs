---
title: REST API — Any TMS
description: Connect any treasury management system to DPX via REST API — pricing, compliance, FX rates, and settlement.
---

DPX exposes a standard REST API over HTTPS. Any treasury management system with HTTP request capability can integrate directly — no SDK required.

## Base URLs

| Service | URL | Auth |
|---|---|---|
| **Integration API** | `https://integration.untitledfinancial.com` | Bearer token |
| Stability Oracle | `https://stability.untitledfinancial.com` | None |
| ESG Oracle | `https://esg.untitledfinancial.com` | None |
| Compliance Oracle | `https://compliance.untitledfinancial.com` | x402 (VoP) / Bearer (admin) |

**For institutional payments — use the Integration API.** It calls the Compliance and Stability oracles automatically on every settlement. You don't need to integrate the oracles separately.

## Integration API — payment endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/payments/initiate` | POST | Submit a payment (ISO 20022 or DPX native) |
| `/payments/batch` | POST | Submit up to 50 payments |
| `/payments/:id` | GET | Retrieve payment by DPX ID |
| `/payments?tmsReference=` | GET | Retrieve payment by TMS reference |
| `/rates/:currency` | GET | Live FX rate |
| `/health` | GET | Service health + oracle status |
| `/manifest` | GET | MCP tool manifest |

## Stability Oracle — pricing and conditions

| Endpoint | Method | Purpose |
|---|---|---|
| `/quote` | GET / POST | Fee breakdown for a transaction |
| `/reliability` | GET | Stability signals before large settlements |
| `/fee-schedule` | GET | Full fee table |
| `/manifest` | GET | Protocol capabilities |

## ESG Oracle — scoring

| Endpoint | Method | Purpose |
|---|---|---|
| `/esg-score` | GET | Live E/S/G scores and current fee |
| `/fee-schedule` | GET | ESG fee table |
| `/quote` | GET / POST | ESG fee for a specific transaction |

## Integration pattern

### Simple payment (Integration API)

```bash
# Submit payment — VoP + FX + settlement all run automatically
curl -X POST https://integration.untitledfinancial.com/payments/initiate \
  -H "Authorization: Bearer <institution-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "tmsReference": "TMS-20260514-001",
    "amount":       "250000.00",
    "currency":     "USD",
    "settlementAsset": "USDC",
    "creditor": {
      "name":          "Deutsche Bank AG",
      "lei":           "7LTWFZYICNSX8D621K86",
      "walletAddress": "0xabc..."
    },
    "debtor": {
      "walletAddress": "0xdef..."
    },
    "callbackUrl": "https://tms.yourcompany.com/webhooks/dpx"
  }'
```

### Pre-flight check (optional)

Check oracle conditions before submitting large settlements:

```bash
# 1. Check stability
curl https://stability.untitledfinancial.com/reliability

# 2. Get fee quote
curl "https://stability.untitledfinancial.com/quote?amountUsd=1000000&hasFx=true&esgScore=75"

# 3. Submit payment
curl -X POST https://integration.untitledfinancial.com/payments/initiate ...
```

## TMS-specific guides

- [Kyriba](/integrations/kyriba) — ISO 20022 pain.001 direct integration
- [SAP TRM](/integrations/sap-trm) — SAP Integration Suite / BTP
- [Webhooks](/integrations/webhooks) — outbound settlement callbacks

## Full API references

- [Integration API](/api/integration-api)
- [Stability Oracle API](/api/stability-oracle)
- [ESG Oracle API](/api/esg-oracle)
- [Compliance Oracle API](/api/compliance-oracle)
