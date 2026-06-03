---
title: SWIFT Compatibility
description: DPX speaks ISO 20022 natively — pain.001 in, pacs.002 out. How DPX fits alongside SWIFT's messaging infrastructure as an on-chain settlement rail.
---

SWIFT is a **messaging network** — it carries payment instructions between banks using standardised message formats. It does not move money itself. The actual movement of funds happens through correspondent banking chains: a series of bilateral accounts between intermediary banks. Those correspondent chains are where DPX operates, not at the SWIFT messaging layer.

Understanding this distinction matters because DPX and SWIFT are not competing infrastructure — they operate at different layers of the same payment stack.

---

## The two layers of international payment

```
Instruction layer          Settlement layer
─────────────────          ────────────────
SWIFT message (ISO 20022)  Correspondent banks (traditional)
pain.001 instruction   →   4–5 hops · 2–5 days · 2–5% fees
                       
                       OR

SWIFT message (ISO 20022)  DPX on Base mainnet (on-chain)
pain.001 instruction   →   1 hop · ~30 seconds · ~2% all-in
```

DPX accepts the same ISO 20022 message formats that SWIFT member banks generate — pain.001 for payment initiation, pacs.002 for settlement confirmation. A corporate treasury or bank already sending SWIFT payments can route those same instructions to DPX without changing their upstream systems.

---

## ISO 20022 native

DPX is built on ISO 20022 end-to-end. Both integration modes accept pain.001 and return pacs.002:

### Payment initiation (pain.001.001.09)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>CORP-2026-0042</MsgId>
      <CreDtTm>2026-06-03T14:00:00Z</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <CtrlSum>250000.00</CtrlSum>
      <InitgPty><Nm>Ordering Corp</Nm></InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>PMTINF-001</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <CdtTrfTxInf>
        <PmtId><EndToEndId>E2E-2026-0042</EndToEndId></PmtId>
        <Amt><InstdAmt Ccy="USD">250000.00</InstdAmt></Amt>
        <Cdtr><Nm>Acme Global Corp</Nm></Cdtr>
        <CdtrAcct>
          <!-- Wallet address in IBAN-style identifier -->
          <Id><Othr><Id>0x742d35Cc6634C0532925a3b8D4C9Db96590c32E8</Id></Othr></Id>
        </CdtrAcct>
      </CdtTrfTxInf>
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>
```

### Settlement confirmation (pacs.002.001.10)

DPX returns a pacs.002 with an extended `SplmtryData` block carrying the on-chain settlement details:

```json
{
  "Document": {
    "FIToFIPmtStsRpt": {
      "GrpHdr": {
        "MsgId": "DPX-CORP-2026-0042",
        "CreDtTm": "2026-06-03T14:00:31Z"
      },
      "TxInfAndSts": [{
        "OrgnlEndToEndId": "E2E-2026-0042",
        "TxSts": "ACCP",
        "SplmtryData": [{
          "Envlp": {
            "DPXPaymentId":    "93e89fe0-a29f-40a5-b204-57d3dffc8812",
            "network":         "base-mainnet",
            "chainId":         8453,
            "settlementAsset": "USDC",
            "txHash":          "0x7a8f...",
            "settlementTime":  "PT31S",
            "fatfR16Compliant": true,
            "micaCompliant":    true,
            "esgScore":        74,
            "iso20022": {
              "msgType":    "pacs.002.001.10",
              "clrSys":     "DPX-BASE",
              "sttlmMtd":   "INDA",
              "sttlmDt":    "2026-06-03"
            }
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

---

## Where DPX fits in SWIFT infrastructure

### For corporates with SWIFT connectivity

Corporates using SWIFT for treasury payments (via SWIFTNet or a SWIFT Service Bureau) can add DPX as an alternative settlement channel:

```
Corporate ERP / TMS
    │
    │  pain.001 (ISO 20022)
    ▼
SWIFT messaging layer  ──────────────────────────────────────────────►  Correspondent banking
                                                                         (existing flow)
    │
    │  pain.001 (same message)
    ▼
DPX Integration API  ───────────────────────────────────────────────►  Base mainnet settlement
https://integration.untitledfinancial.com/payments/initiate              (~30 seconds, ~2% all-in)
```

No changes to upstream systems. The same pain.001 that goes to SWIFT can be routed to DPX for eligible corridors.

### For banks with GPI deployments

SWIFT gpi (Global Payments Innovation) adds end-to-end tracking and same-day settlement to correspondent chains. DPX offers a complementary path for cases where gpi's cost or speed doesn't meet requirements:

| | SWIFT gpi | DPX |
|---|---|---|
| Settlement time | Same day (hours) | ~30 seconds |
| Transparency | Full tracking | On-chain, public |
| Cost | 2–5% all-in (corridor-dependent) | ~2.035% all-in |
| Corridors | 200+ countries | USDC/EURC on Base |
| Compliance | Bank-managed | On-chain, automated |
| ESG reporting | Not native | Embedded per-transaction |

### For financial institutions evaluating ISO 20022 migration

SWIFT's ISO 20022 migration (completing 2025) standardises all SWIFT cross-border messages on the pain/pacs format DPX already uses natively. Institutions building ISO 20022-compliant payment infrastructure can add DPX without format translation.

---

## SWIFT App Market

DPX is pursuing listing on the SWIFT App Market — the marketplace where SWIFT member banks discover payment tools and fintech integrations. A SWIFT App Market listing provides:

- Discovery by 11,000+ SWIFT member institutions globally
- Credibility signal for institutional procurement teams
- Structured access to SWIFT's partner ecosystem

For financial institutions already in the SWIFT ecosystem, DPX appears as a certified, vetted integration option alongside treasury management tools, FX tools, and compliance products.

---

## Compliance alignment

DPX's compliance stack maps to SWIFT's correspondent banking compliance requirements:

| SWIFT Requirement | DPX Equivalent |
|---|---|
| SWIFT KYC Registry | GLEIF LEI verification via VoP check |
| Sanctions screening | AML Oracle (OFAC/EU sanctions, 24h TTL cache) |
| FATF Recommendation 16 | VoP compliance attestation on every payment |
| Travel Rule (≥$3K) | IVMS 101 records, 5-year retention |
| Transaction monitoring | Behavioural profiling, z-score anomaly detection |
| pacs.002 confirmation | Native — returned for every settled payment |

---

## Further reading

- [Kyriba Integration](/integrations/kyriba) — TMS-native payment initiation via ISO 20022
- [REST API](/integrations/rest-api) — Direct integration for any system
- [FATF & Travel Rule](/protocol/fatf-compliance) — SWIFT-compatible compliance
- [European Institution Quickstart](/guides/european-institutions)
