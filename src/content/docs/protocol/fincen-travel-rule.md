---
title: FinCEN Travel Rule (US)
description: How DPX implements the Bank Secrecy Act Travel Rule (31 CFR §103.33) for US-regulated stablecoin settlements — IVMS 101, $3,000 threshold, 5-year retention, and examiner access.
---

The Bank Secrecy Act (BSA) Travel Rule requires financial institutions — including Virtual Asset Service Providers (VASPs) acting as money services businesses — to collect, retain, and transmit specific identity information on fund transmittals of **$3,000 or more**.

DPX implements this natively. Every payment processed through the Integration API automatically generates a compliant Travel Rule record at settlement time, stored in a 5-year retention ledger and available to regulators on demand.

## Regulatory basis

| Regulation | Requirement |
|---|---|
| 31 CFR §103.33(g) | Collect and transmit originator + beneficiary information on transmittals ≥ $3,000 |
| 31 CFR §103.38 | Retain records for 5 years |
| FinCEN Guidance FIN-2019-G001 | Applies BSA Travel Rule to convertible virtual currencies and stablecoins |
| FATF Recommendation 16 | International equivalent — DPX also satisfies this via VoP (see [FATF & Travel Rule](/protocol/fatf-compliance)) |

**Key difference from FATF R16:** The US threshold is $3,000 (FATF is $1,000), and US rules specifically require the transmittor's **physical address** — not just a national ID or date of birth.

## How it works

Travel Rule processing runs **automatically and non-blocking** on every payment. It never delays or blocks the settlement response.

### Processing sequence

```
POST /payments/initiate
  │
  ├── VoP check (Compliance Oracle)
  ├── FX rate (Stability Oracle)
  ├── Settlement (Base mainnet)
  ├── D1 record written
  │
  └── ctx.waitUntil() — parallel, after response sent
        ├── Travel Rule (this page)
        └── Webhook delivery
```

### Threshold check

DPX converts the payment amount to USD using the live exchange rate from the Stability Oracle:

- **USD payments**: amount used directly
- **Non-USD payments**: `amount × exchangeRate` (EUR, GBP supported)
- **Threshold**: `$3,000.00 USD`
- **Below threshold**: record still created, status `EXEMPT` — clean paper trail for examiners

### IVMS 101 message

All Travel Rule records use **IVMS 101 v1.0** — the InterVASP Messaging Standard for structuring identity data. Each record contains:

```json
{
  "originator": {
    "originatorPersons": [{
      "legalPerson": {
        "name": { "nameIdentifier": [{ "legalPersonName": "Sender Corp", "legalPersonNameIdentifierType": "LEGL" }] },
        "nationalIdentification": { "nationalIdentifier": "LEI...", "nationalIdentifierType": "LEIX" }
      }
    }],
    "accountNumber": ["0xSenderWalletAddress"]
  },
  "beneficiary": {
    "beneficiaryPersons": [{
      "legalPerson": {
        "name": { "nameIdentifier": [{ "legalPersonName": "Recipient Corp", "legalPersonNameIdentifierType": "LEGL" }] },
        "nationalIdentification": { "nationalIdentifier": "LEI...", "nationalIdentifierType": "LEIX" }
      }
    }],
    "accountNumber": ["0xRecipientWalletAddress"]
  },
  "originatorVASP": {
    "vasp": { "name": { "nameIdentifier": [{ "legalPersonName": "Untitled_ LuxPerpetua Technologies, Inc." }] } }
  },
  "beneficiaryVASP": {
    "vasp": { "name": { "nameIdentifier": [{ "legalPersonName": "Recipient Corp" }] } }
  },
  "transferAmount": {
    "transferAmount": "5000.00",
    "transferCurrency": "USD"
  }
}
```

**LEI enrichment**: If the payment instruction includes a creditor or debtor LEI, it is embedded as `nationalIdentifier` with type `LEIX` (GLEIF registration authority `RA000598`). This satisfies the US requirement for counterparty identification without relying on physical address alone.

### Record status lifecycle

| Status | Meaning |
|---|---|
| `EXEMPT` | Below $3,000 threshold — record stored, Travel Rule not triggered |
| `PENDING` | Threshold met, transmission queued |
| `SENT` | IVMS 101 successfully delivered to counterparty VASP endpoint |
| `STORED` | No counterparty endpoint known — record retained, available to examiners on request |
| `FAILED` | Delivery attempted and failed — record retained regardless |

**Note:** `STORED` is the default for most payments today. As the DPX counterparty VASP directory expands (via TRISA/Notabene integration), more records will automatically transition to `SENT`.

### 5-year retention

Every Travel Rule record includes a `retainUntil` timestamp — exactly 5 years from creation, per 31 CFR §103.38. Records are stored in Cloudflare D1 and are not automatically deleted.

```
retainUntil: created_at + (5 × 365.25 × 24 × 60 × 60 seconds)
```

## Examiner access

Three endpoints are available to FinCEN examiners and compliance teams:

### GET /travel-rule/:paymentId

Retrieve the full IVMS 101 record for a specific payment.

```bash
curl https://integration.untitledfinancial.com/travel-rule/{paymentId} \
  -H "Authorization: Bearer {api_key}"
```

**Response:**

```json
{
  "id": "474051cf-df47-4f92-8573-7ea4f096c9e0",
  "paymentId": "93e89fe0-a29f-40a5-b204-57d3dffc8812",
  "direction": "OUTBOUND",
  "applies": true,
  "amountUsd": "5000.00",
  "thresholdUsd": 3000,
  "status": "STORED",
  "createdAt": 1778856588,
  "retainUntil": 1936644588,
  "notes": "No beneficiary VASP Travel Rule endpoint found. Record retained for examiner access.",
  "ivms101": { "...": "full IVMS 101 message" },
  "regulation": "31 CFR §103.33 (FinCEN Travel Rule)",
  "retentionRequirement": "31 CFR §103.38 (5 years)"
}
```

### GET /travel-rule/export

Bulk export for FinCEN examinations. Returns all records in a date range.

```bash
curl "https://integration.untitledfinancial.com/travel-rule/export?from=1700000000&to=1800000000&status=STORED" \
  -H "Authorization: Bearer {master_key}"
```

**Query parameters:**

| Parameter | Description | Default |
|---|---|---|
| `from` | Start epoch (seconds) | `0` |
| `to` | End epoch (seconds) | now |
| `status` | Filter by status (`EXEMPT`, `PENDING`, `SENT`, `STORED`, `FAILED`) | all |
| `limit` | Records per page (max 500) | `100` |
| `offset` | Pagination offset | `0` |

### POST /travel-rule/receive

Receive inbound IVMS 101 messages from counterparty VASPs. No bearer auth required — authenticated via `X-DPX-Signature` HMAC-SHA256.

```
POST /travel-rule/receive
X-DPX-Signature: {hmac-sha256}
X-IVMS101-Version: 1.0
X-Travel-Rule-Payment-Id: {optional — links record to a DPX payment}
Content-Type: application/json

{ ...ivms101 message... }
```

Inbound records are stored with direction `INBOUND` and retained for 5 years.

## What institutions need to provide

DPX automatically handles Travel Rule record creation. To maximise IVMS 101 data quality, include these fields in payment instructions:

| Field | Why it matters |
|---|---|
| `debtor.lei` | Identifies the sending legal entity (LEIX) — satisfies originator identification |
| `debtor.name` | Legal entity name of the sending institution |
| `debtor.walletAddress` | Originator account number (wallet) |
| `creditor.lei` | Identifies the receiving legal entity — satisfies beneficiary identification |
| `creditor.name` | Legal entity name of the receiving institution |
| `creditor.walletAddress` | Beneficiary account number (wallet) |

Payments submitted without LEI will still generate IVMS 101 records, using the legal entity name alone for identification.

## Counterparty VASP transmission

DPX will attempt to deliver the IVMS 101 message to the beneficiary VASP's Travel Rule endpoint when one is known. Endpoint resolution order:

1. **Explicit endpoint** — future: passed by TMS in payment instruction
2. **DPXEntityRegistry lookup** — on-chain registry by LEI (in development)
3. **TRISA / Notabene directory** — federated VASP lookup (roadmap)

Until counterparty endpoints are resolved, records are retained as `STORED` and made available to regulators on request — which satisfies the BSA record-keeping obligation even when transmission is not possible.

## Integration with FATF R16

The DPX Travel Rule module builds on top of the existing **Verification of Payee (VoP)** system:

- **FATF R16 VoP** runs pre-settlement — verifies wallet-to-entity identity match
- **FinCEN Travel Rule** runs post-settlement — generates and transmits the IVMS 101 record

Both produce independent audit records. The VoP attestation is written on-chain (`DPXVerificationOfPayee`); the Travel Rule record is written to the 5-year D1 ledger. A FinCEN examiner can request both.

See [FATF & Travel Rule](/protocol/fatf-compliance) for the international compliance layer.

## Jurisdictional coverage

| Jurisdiction | Threshold | DPX Coverage |
|---|---|---|
| United States | $3,000 USD | ✅ Native — this page |
| European Union (MiCA / FATF) | €1,000 | ✅ Via FATF R16 VoP |
| United Kingdom | £1,000 | ✅ Via FATF R16 VoP |
| Singapore | SGD 1,500 | ✅ Via FATF R16 VoP |

## Roadmap

| Feature | Status |
|---|---|
| IVMS 101 generation + D1 storage | ✅ Live |
| Examiner export endpoint | ✅ Live |
| Inbound VASP receive endpoint | ✅ Live |
| GLEIF LEI registration (DPX VASP identity) | 🔄 Pending |
| TRISA directory integration | 📋 Roadmap |
| Notabene integration | 📋 Roadmap |
| Automatic counterparty endpoint resolution by LEI | 📋 Roadmap |
| FinCEN BSA E-Filing (SAR/CTR) | 📋 Roadmap |

## Further reading

- [31 CFR §103.33 — Recordkeeping requirements](https://www.ecfr.gov/current/title-31/subtitle-B/chapter-X/part-1020/subpart-D/section-1020.410)
- [FinCEN Guidance FIN-2019-G001 — Application of BSA to CVCs](https://www.fincen.gov/sites/default/files/2019-05/FinCEN%20Guidance%20CVC%20FINAL%20508.pdf)
- [IVMS 101 Standard — intervasp.org](https://intervasp.org/)
- [FATF & Travel Rule](/protocol/fatf-compliance) — international VoP and FATF R16
- [Regulatory Positioning](/protocol/regulatory) — MiCA, GENIUS Act, CLARITY Act alignment
