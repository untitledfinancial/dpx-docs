---
title: Compliance Screening API
description: Sanctions, PEP, UBO chain, and FATF country risk in a single API call. Replaces Refinitiv World-Check, Dow Jones Risk, and Comply Advantage for most enterprise screening use cases. APPROVED / FLAGGED / BLOCKED with FATF R.16 attestation.
---

The DPX Compliance Screening API runs five checks in parallel and returns a single decision — APPROVED, FLAGGED, or BLOCKED — with a `humanRequired` boolean. APPROVED payments proceed automatically, no human review queue. This removes the operational overhead that currently gates the majority of international payments at most institutions.

**One endpoint. Five checks. Instant decision. FATF R.16 attestation included.**

## The problem it solves

Most compliance screening today works like this: payment gets queued → analyst opens three tabs (World-Check, internal sanctions list, GLEIF) → manually cross-references → approves or escalates → logs the decision. That queue is the bottleneck that keeps international payments slow.

DPX runs the same checks in a single API call, returns a structured decision in under 3 seconds, and generates a compliance receipt suitable for audit. For the ~95% of payments that are clean, the human never needs to be involved.

## Endpoint

```
POST https://compliance.untitledfinancial.com/compliance/screen
```

**Authentication:** `X-API-Key: dpx_sub_...` (subscription key) or per-call via x402. See [Oracle Data API](/products/oracle-data) for subscription options.

## Request

```json
{
  "name": "Acme GmbH",
  "lei": "7LTWFZYICNSX8D621K86",
  "country": "DE",
  "sourceCountry": "US",
  "amount": 250000,
  "currency": "USD",
  "paymentType": "vendor_payment",
  "individual": false,
  "reference": "INV-2026-0441"
}
```

| Field | Required | Description |
|---|---|---|
| `name` | Yes | Legal name of entity or individual |
| `lei` | No | GLEIF LEI — enables UBO chain check and FATF R.16 originator identification |
| `country` | No | ISO 3166-1 alpha-2 destination country |
| `sourceCountry` | No | Source country. Defaults to `US` |
| `amount` | No | Transaction amount. Enables CTR-equivalent ($10K) and large-payment ($100K) flags |
| `currency` | No | ISO 4217 currency code. Defaults to `USD` |
| `paymentType` | No | `vendor_payment` \| `payroll` \| `contractor` \| `intercompany` \| `other`. `payroll` and `contractor` automatically trigger PEP screen |
| `individual` | No | `true` triggers PEP screen |
| `reference` | No | Your internal reference ID — returned in response for reconciliation |

## Response

```json
{
  "decision": "APPROVED",
  "humanRequired": false,
  "riskScore": 12,
  "reasons": [
    "All checks passed — no sanctions matches, country risk standard, amount within threshold."
  ],
  "reference": "INV-2026-0441",
  "checks": {
    "fatfCountry": {
      "source": "STANDARD",
      "destination": "STANDARD"
    },
    "amountFlags": [
      "CTR-equivalent threshold ($250,000 ≥ $10,000)"
    ],
    "sanctions": {
      "matched": false,
      "score": 8
    },
    "pep": {
      "checked": false,
      "matched": false
    },
    "uboChain": {
      "checked": true,
      "levels": 2,
      "sanctionsAtNode": null
    }
  },
  "attestations": {
    "fatfR16": {
      "satisfied": true,
      "basis": "LEI 7LTWFZYICNSX8D621K86 provided — originator identification satisfied under FATF R.16"
    },
    "micaArt72": {
      "compatible": true,
      "note": "ESG data available via /esg/score — Article 72 PAI indicators on request"
    },
    "geniusAct": {
      "note": "USDC and EURC are permitted payment stablecoins under the GENIUS Act"
    }
  },
  "_action": "Proceed — no human review required.",
  "processingMs": 1843,
  "screenedAt": "2026-06-30T14:22:11.000Z"
}
```

## Decision logic

| Decision | Condition | humanRequired | Action |
|---|---|---|---|
| APPROVED | All checks pass | `false` | Proceed automatically |
| FLAGGED | PEP match, FATF grey-list, large amount without LEI, partial sanctions | `true` | Route to compliance queue |
| BLOCKED | Sanctions match ≥70%, UBO chain sanctions node, FATF blacklist country | `false` | Halt. Do not notify counterparty. Log for SAR review |

## Checks performed

### 1. FATF country risk

Checks source and destination country against the current FATF blacklist (North Korea, Iran, Myanmar) and grey-list (30+ jurisdictions). Blacklist → BLOCKED. Grey-list → FLAGGED with enhanced due diligence note.

### 2. Amount threshold flags

- **$10,000+**: CTR-equivalent flag (informational — returned in `amountFlags`, does not change decision alone)
- **$100,000+ without LEI**: FATF R.16 originator identification is incomplete at this amount → FLAGGED

### 3. OpenSanctions global sanctions screen

Name-based fuzzy search against the OpenSanctions consolidated global dataset (UN, OFAC, EU, SECO, DFAT, and 40+ other lists). Match ≥70% → BLOCKED. Score 45–69% → FLAGGED with partial match note.

### 4. PEP screen (when applicable)

OpenSanctions PEP dataset. Triggered when `individual: true`, `paymentType: "payroll"`, or `paymentType: "contractor"`. Match ≥60% → FLAGGED. FATF R.12/13 EDD note included.

### 5. GLEIF UBO chain (when LEI provided)

Traverses GLEIF beneficial ownership up to 2 levels (entity + ultimate parent). Runs sanctions screen at each node. If any node matches → BLOCKED with specific node identified in response. This satisfies FATF R.16 UBO verification without manual document collection.

## FATF R.16 attestation

When a GLEIF LEI is provided, the response includes a machine-readable FATF R.16 attestation confirming originator identification is satisfied. This can be attached to your settlement instruction, ACH file, or audit trail.

LEI issuers (GLEIF LOUs) have already performed identity verification on the registered entity. DPX inherits that verification — no documents required.

## Pricing

| Volume | Price per screen |
|---|---|
| 0–10,000/month | $0.01 |
| 10,001–100,000/month | $0.008 |
| 100,001+/month | $0.005 |

Subscription keys include volume-tier pricing automatically. See [Oracle Data API](/products/oracle-data#subscription-api-key) for subscription options.

## Code examples

### Python

```python
import requests

def screen(name, lei=None, country=None, amount=None, payment_type="vendor_payment"):
    resp = requests.post(
        "https://compliance.untitledfinancial.com/compliance/screen",
        json={
            "name": name,
            "lei": lei,
            "country": country,
            "amount": amount,
            "paymentType": payment_type,
        },
        headers={"X-API-Key": "dpx_sub_..."},
    )
    result = resp.json()
    
    if result["decision"] == "APPROVED":
        print(f"✅ Approved — proceed with payment (risk score: {result['riskScore']})")
    elif result["decision"] == "FLAGGED":
        print(f"⚠️  Flagged — route to compliance queue: {result['reasons']}")
    elif result["decision"] == "BLOCKED":
        print(f"🚫 Blocked — halt payment: {result['reasons']}")
    
    return result

# Vendor payment with LEI
screen("Acme GmbH", lei="7LTWFZYICNSX8D621K86", country="DE", amount=250000)

# Individual contractor payroll (triggers PEP screen)
screen("Maria Santos", country="BR", amount=8000, payment_type="contractor")
```

### Node.js / TypeScript

```typescript
const DPX_API_KEY = process.env.DPX_API_KEY!;

async function complianceScreen(params: {
  name: string;
  lei?: string;
  country?: string;
  amount?: number;
  paymentType?: string;
}): Promise<{ decision: string; humanRequired: boolean; reasons: string[] }> {
  const resp = await fetch('https://compliance.untitledfinancial.com/compliance/screen', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': DPX_API_KEY },
    body:    JSON.stringify(params),
  });
  return resp.json();
}

// Before any international payment
const result = await complianceScreen({
  name:        'Supplier Corp',
  lei:         '7LTWFZYICNSX8D621K86',
  country:     'SG',
  amount:      150_000,
  paymentType: 'vendor_payment',
});

if (result.decision === 'APPROVED' && !result.humanRequired) {
  await executePayment(); // safe to automate
}
```

## Comparison

| | DPX Compliance API | Refinitiv World-Check | Dow Jones Risk | Comply Advantage |
|---|---|---|---|---|
| Setup | API key, instant | Contract + onboarding (weeks) | Contract + onboarding | Contract + onboarding |
| Response time | &lt;3 seconds | Batch/async | Batch/async | API, variable |
| UBO chain | Automatic (GLEIF) | Manual lookup | Manual lookup | Limited |
| FATF R.16 attestation | Machine-readable, included | Not included | Not included | Not included |
| PEP screen | Included | Included | Included | Included |
| Price | $0.005–$0.01/screen | $5,000–$50,000+/year | $5,000–$30,000+/year | $1,500–$10,000+/year |
| humanRequired flag | Yes — removes queue for clean payments | No | No | No |

## Related endpoints

- [`/compliance/ubo-chain`](/api/compliance-oracle#post-complianceubo-chain) — standalone UBO traversal with full node detail
- [`/compliance/pep-screen`](/api/compliance-oracle#post-compliancepep-screen) — standalone PEP screen
- [`/compliance/regulatory-calendar`](/api/compliance-oracle#get-complianceregulatory-calendar) — upcoming compliance obligations
- [`/ramp/compliance-screen`](/api/compliance-oracle) — Ramp Agent Card pre-screen variant
