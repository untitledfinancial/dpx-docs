---
title: TIS (Treasury Intelligence Solutions)
description: Connect DPX to TIS as an H2H bank endpoint — ISO 20022 pain.001 from TIS payment runs routes directly to the DPX settlement rail. Common in DACH and EU corporate treasuries.
---

TIS is a cloud-based enterprise payment factory used by 500+ corporates across Germany, the Netherlands, Switzerland, and broader Europe. It sits between ERP systems (SAP, Oracle, Dynamics) and banks, normalizing payment formats and routing outbound payments across 11,000+ bank connections via SWIFT, EBICS, H2H, and direct API.

DPX integrates as a **bank endpoint** within TIS — treated identically to a bank H2H connection. When a treasury team initiates a cross-border payment in TIS and selects DPX as the routing bank, TIS delivers the payment file to DPX's Integration API. The rest of the flow — oracle gating, ESG scoring, on-chain settlement — is handled by DPX automatically.

---

## How it works

```
TIS payment run (from SAP / Oracle / Dynamics)
    │
    │  ISO 20022 pain.001
    │  H2H connection → DPX endpoint
    ▼
POST https://integration.untitledfinancial.com/payments/initiate
    │
    ├── Compliance Oracle (VoP, AML, sanctions)
    ├── Stability Oracle (macro gate)
    ├── ESG Oracle (SFDR PAI indicators)
    └── Settlement → DPX rail (USDC / EURC on Base)
    │
    ▼
pacs.002 → TIS → write-back to ERP
```

No TMS change required. TIS users initiate payments from their existing interface — DPX appears as a bank destination.

---

## Setup in TIS

### 1. Add DPX as a bank connection

In TIS, navigate to **Administration → Bank Connections → New H2H Connection**:

| Field | Value |
|---|---|
| Connection name | `DPX Settlement Rail` |
| Connection type | `H2H (REST API)` |
| Base URL | `https://integration.untitledfinancial.com` |
| Payment endpoint | `/payments/initiate` |
| Authentication | Bearer token |
| Token | `<your DPX institution key>` |
| Supported format | `ISO 20022 pain.001.001.09` |
| Response format | `ISO 20022 pacs.002.001.10` |
| Status callback | `<your TIS inbound webhook URL>` |

Contact [case@untitledfinancial.com](mailto:case@untitledfinancial.com) to receive your DPX institution key.

### 2. Define a payment route

In TIS, create a payment routing rule that directs cross-border payments above your threshold to the DPX connection:

| Condition | Route to |
|---|---|
| Currency ≠ sending currency (cross-border FX) | DPX Settlement Rail |
| Amount > €10,000 + cross-border | DPX Settlement Rail |
| Destination country outside SEPA zone | DPX Settlement Rail |

### 3. Tag payments for ESG routing (optional)

TIS supports custom payment fields that pass through to the beneficiary bank. Map these to DPX's optional metadata:

| TIS custom field | DPX Integration API field | Purpose |
|---|---|---|
| `dpx_esg_score` | `esgScore` | Pre-supply ESG score if available |
| `dpx_settlement_asset` | `settlementAsset` | `USDC` or `EURC` (defaults to USDC) |

---

## Payment format

TIS delivers ISO 20022 pain.001 — DPX accepts it directly. No transformation required.

```json
{
  "tmsReference":   "TIS-2026-00421",
  "amount":         "250000.00",
  "currency":       "USD",
  "settlementAsset": "EURC",
  "creditor": {
    "name":          "Recipient GmbH",
    "lei":           "529900ODI3047E2LIV03",
    "walletAddress": "0x..."
  },
  "debtor": {
    "name": "Your Company",
    "lei":  "YOUR_LEI"
  },
  "remittanceInfo":         "Invoice TIS-2026-00421",
  "requestedExecutionDate": "2026-06-21",
  "callbackUrl": "https://your-tis-instance/dpx/status"
}
```

DPX also accepts raw pain.001 XML if TIS is configured to send native format:

```bash
POST https://integration.untitledfinancial.com/payments/initiate
Content-Type: application/xml
Authorization: Bearer <key>

<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">
  <CstmrCdtTrfInitn>
    ...
  </CstmrCdtTrfInitn>
</Document>
```

---

## Response and write-back

DPX returns a `dpxPaymentId` immediately on receipt. TIS polls the status endpoint or receives a callback:

**Immediate response:**
```json
{ "dpxPaymentId": "93e89fe0-a29f-40a5-b204-57d3dffc8812" }
```

**Callback on settlement:**
```json
{
  "dpxPaymentId": "93e89fe0-...",
  "tmsReference": "TIS-2026-00421",
  "status":       "SETTLED",
  "settlement": {
    "txHash":       "0x7f3a...",
    "network":      "base-mainnet",
    "amount":       "250000.00",
    "exchangeRate": "1.0842",
    "fee":          "337.50",
    "settlementAsset": "EURC"
  },
  "esg": {
    "score": 74,
    "sfdr": {
      "article8Compatible": true,
      "paiIndicators": { "..." }
    }
  },
  "compliance": {
    "fatfR16Compliant": true,
    "micaCompliant":    true,
    "regulatoryNote":   "FATF R16 VoP satisfied — settlement compliant."
  }
}
```

Store `txHash` in TIS as the external bank reference for audit purposes. The `esg.sfdr` block is a source record for SFDR PAI disclosure — ESRS-mappable fields included.

---

## Regulatory classification

**DPX is not a bank or PSD2 payment institution.** The "bank endpoint" label in TIS is a technical classification within TIS's connectivity UI — it means any H2H counterparty, not a licensed credit institution.

DPX's regulatory position:

| Question | Answer |
|---|---|
| Does DPX hold client funds? | No — DPX never holds fiat or crypto |
| Does DPX transmit money? | No — DPX returns execution parameters; the caller executes on-chain |
| Does DPX need PSD2 authorization? | No — DPX is infrastructure, not a payment institution under PSD2 Article 4 |
| What is DPX's regulatory classification? | MiCA CASP (crypto-asset service provider) — settlement infrastructure |
| Is the settlement asset MiCA-compliant? | Yes — USDC and EURC are both MiCA-compliant |

When configuring DPX in TIS, label the connection as **"Settlement Rail / Payment Service"** in any internal documentation or compliance register, not "bank." The H2H connection type is a TIS technical term; the regulatory relationship is vendor-to-infrastructure.

If your compliance team requires a formal statement of DPX's regulatory status for onboarding, contact [case@untitledfinancial.com](mailto:case@untitledfinancial.com).

---

## EBICS note

TIS supports EBICS for bank connectivity across DACH markets. DPX does not implement EBICS — use the H2H REST connection described above. If your TIS configuration requires EBICS for regulatory or bank-mandate reasons, contact [case@untitledfinancial.com](mailto:case@untitledfinancial.com) to discuss options.

---

## Why TIS + DPX

| Without DPX | With DPX |
|---|---|
| SWIFT correspondent routing (2–5 days, ~2–5% fees) | On-chain settlement (~30s, ~2% all-in) |
| No ESG data at payment time | SFDR PAI indicators per transaction |
| Manual compliance queue | Automated VoP + AML at every payment |
| No audit trail beyond SWIFT MT | Immutable on-chain record, external auditor verifiable |

TIS already normalizes payment formats from your ERP. DPX replaces the bank leg for cross-border flows — your treasury workflow stays the same, the settlement rail changes.

---

## Compliance included

Every DPX settlement includes:

- **FATF R16 VoP** — Verification of Payee on-chain for every payment
- **MiCA** — Settlement rail and EURC asset both MiCA-compliant
- **SFDR PAI** — ESG data block per transaction for fund-level disclosure
- **Travel Rule** — IVMS 101 records auto-generated for payments ≥ €3,000
- **AML6** — Behavioural profiling + sanctions screening, no human queue

---

## Get connected

1. Request a DPX institution key — [case@untitledfinancial.com](mailto:case@untitledfinancial.com) or [beta access page](/beta)
2. Add DPX as an H2H bank connection in TIS using the setup above
3. Run a sandbox payment — oracle, ESG, and compliance calls are always live; settlement is simulated until production

---

## Further reading

- [Integration API reference](/api/integration-api)
- [SFDR & CSRD Compliance](/protocol/sfdr-csrd)
- [European Institution Quickstart](/guides/european-institutions)
- [Kyriba Integration](/integrations/kyriba)
- [SAP TRM Integration](/integrations/sap-trm)
