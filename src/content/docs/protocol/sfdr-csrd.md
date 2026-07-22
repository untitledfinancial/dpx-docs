---
title: SFDR & CSRD Compliance
description: How DPX supports EU Sustainable Finance Disclosure Regulation (SFDR) and Corporate Sustainability Reporting Directive (CSRD) requirements — ESG output formats, per-transaction sustainability data, and audit trail.
---

The EU Sustainable Finance Disclosure Regulation ([SFDR](https://alternativeassetliteracy.com/glossary.html#sfdr)) and Corporate Sustainability Reporting Directive (CSRD) create mandatory reporting requirements for fund managers and corporates operating in Europe. DPX produces transaction-level ESG data in formats that map directly to these obligations — making every DPX settlement a source record for sustainability reporting.

---

## What SFDR and CSRD require

**SFDR** (effective 2021, Level 2 RTS in force 2023) requires:
- Asset managers and financial advisers to disclose how they integrate sustainability risks
- Article 8 funds to demonstrate they promote environmental or social characteristics
- Article 9 funds to demonstrate sustainable investment as their objective
- Principal Adverse Impact (PAI) indicators at the portfolio and product level

**CSRD** (in force 2024–2028 phased rollout) requires:
- Large companies and listed SMEs to report sustainability impacts, risks, and opportunities
- Double materiality assessments — financial materiality AND impact materiality
- Reporting against ESRS (European Sustainability Reporting Standards)
- Assurance by an external auditor

Both require **transaction-level data** — the ability to demonstrate that specific financial activities either support or do not undermine sustainability objectives. This is where DPX enters.

---

## What DPX provides

Every DPX settlement produces a compliance record that includes:

### Per-transaction ESG fields

```json
{
  "settlement": {
    "id": "dpx-93e89fe0",
    "txHash": "0x...",
    "timestamp": "2026-06-03T14:22:00Z",
    "amount": "250000.00",
    "currency": "USD",
    "settlementAsset": "USDC"
  },
  "esg": {
    "score": 74,
    "tier": "GOOD",
    "settlementSurcharge": "0.10%",
    "components": {
      "environmental": 71,
      "social": 76,
      "governance": 75
    },
    "sfdr": {
      "adverseImpactFlag": false,
      "paiIndicators": {
        "ghgEmissions": "BELOW_THRESHOLD",
        "carbonFootprint": "MODERATE",
        "biodiversityRisk": "LOW",
        "waterUsage": "MODERATE",
        "wasteGeneration": "LOW",
        "socialViolations": false,
        "boardGenderDiversity": "COMPLIANT",
        "controversialWeapons": false
      },
      "article8Compatible": true,
      "article9Compatible": false,
      "taxonomyAligned": false
    },
    "dataSourceCount": 8,
    "lastUpdated": "2026-06-03T14:00:00Z"
  },
  "compliance": {
    "fatfR16Compliant": true,
    "micaCompliant": true,
    "geniusCompliant": true
  }
}
```

### PAI indicator mapping

DPX maps its ESG scoring dimensions to the SFDR Annex I Principal Adverse Impact indicators:

| SFDR PAI Indicator | DPX Source | Field |
|---|---|---|
| GHG Emissions (Indicator 1) | World Bank CO2 per capita | `esg.sfdr.paiIndicators.ghgEmissions` |
| Carbon Footprint (Indicator 2) | Climate Monitor CO2 ppm | `esg.sfdr.paiIndicators.carbonFootprint` |
| Biodiversity (Indicator 7) | Earth systems tipping point proximity | `esg.sfdr.paiIndicators.biodiversityRisk` |
| Water (Indicator 8) | Supply chain water level signals | `esg.sfdr.paiIndicators.waterUsage` |
| Hazardous Waste (Indicator 9) | EPA ECHO violation data | `esg.sfdr.paiIndicators.wasteGeneration` |
| Social Violations (Indicator 10) | UN SDG 8.8 labour rights | `esg.sfdr.paiIndicators.socialViolations` |
| Board Gender Diversity (Indicator 13) | UN SDG 5.5.2 women in management | `esg.sfdr.paiIndicators.boardGenderDiversity` |
| Controversial Weapons (Indicator 14) | Sanctions / industry classification | `esg.sfdr.paiIndicators.controversialWeapons` |

### CSRD double materiality

For CSRD reporting, DPX provides both dimensions:

- **Impact materiality**: The environmental and social impacts of the counterparty's activity — captured in the E and S score components
- **Financial materiality**: The ESG risk exposure to the institution — reflected in the settlement surcharge rate

These map directly to ESRS E1 (climate), E3 (water), S1 (own workforce), S4 (consumers), G1 (governance).

---

## Using ESG data for fund reporting

### Article 8 fund managers

For funds promoting environmental or social characteristics, DPX settlement records can demonstrate that:
- Counterparties meet a minimum ESG score threshold (configurable per fund mandate)
- PAI indicators are within acceptable ranges for the fund's disclosed policy
- Transactions are routed away from counterparties with active social or environmental violations

```bash
# Get ESG score for a counterparty before settlement
GET https://esg.untitledfinancial.com/esg-score?lei=5493001KJTIIGC8Y1R12

# Response includes sfdr block
{
  "score": 74,
  "sfdr": {
    "article8Compatible": true,
    "paiIndicators": { ... }
  }
}
```

### Article 9 fund managers

For funds with sustainable investment as their objective, the ESG Oracle's `article9Compatible` flag indicates whether a counterparty meets the threshold for sustainable investment classification under SFDR Article 2(17). This requires:
- Composite ESG score ≥ 80
- No active PAI violations
- Taxonomy alignment flag (requires counterparty NACE code mapping)

### Corporate treasuries (CSRD)

Under CSRD, large corporates must report on their own value chain sustainability impacts. DPX settlement records provide:
- Counterparty ESG profiles for Scope 3 supply chain disclosures
- Transaction-level ESG data for ESRS E1 (climate) and S4 (value chain) reporting
- On-chain audit trail auditable by external assurance providers

---

## Audit trail

Every DPX settlement produces an immutable on-chain record. For SFDR/CSRD assurance purposes:

| Record | Location | Access |
|---|---|---|
| Settlement transaction | Base mainnet | `txHash` on Basescan |
| VoP compliance attestation | `DPXVerificationOfPayee` contract | On-chain, verifiable by any auditor |
| ESG score at settlement time | Compliance Oracle D1 | API: `GET /vop/history/:wallet` |
| PAI indicators at settlement time | ESG Oracle D1 | API: `GET /esg-score?lei=:lei` |

Because ESG scores are recorded at settlement time and the `txHash` is on-chain, auditors can independently verify the ESG profile applied to any historical transaction.

---

## Full PAI report — all 18 Annex I indicators

Generate a complete SFDR Annex I Principal Adverse Impact report for a portfolio of up to 50 entities (by LEI). Returns all 18 mandatory PAI indicators with status, thresholds, and data notes.

```bash
POST https://compliance.untitledfinancial.com/sfdr/pai-report
Content-Type: application/json

{
  "leis": ["529900ODI3047E2LIV03", "7LTWFZYICNSX8D621K86"],
  "portfolioName": "Q2 2026 EU Fund",
  "reportingPeriod": "2026-Q2",
  "currency": "EUR"
}
```

Returns all 18 Annex I indicators across climate/environment (1–14) and social (15–18):

| Indicators | Category | Examples |
|---|---|---|
| 1–6 | GHG & Carbon | GHG intensity, carbon footprint, fossil fuel exposure |
| 7–9 | Biodiversity & Resources | Biodiversity-sensitive areas, water, hazardous waste |
| 10–11 | Social — Business | UNGC violations, controversial weapons |
| 12–14 | Social — Workforce | Board gender diversity, pay gap, OSHA safety |
| 15–18 | Additional mandatory | Country-level violations, sovereign bond ESG |

Each indicator returns a `status` field: `WITHIN_THRESHOLD`, `REVIEW`, `ELEVATED_RISK`, `DATA_REQUIRED`, or `NOT_APPLICABLE`. The summary includes an `overallStatus` and a count of elevated risk flags.

```json
{
  "portfolioName": "Q2 2026 EU Fund",
  "reportingPeriod": "2026-Q2",
  "generatedAt": "2026-07-02T10:00:00Z",
  "summary": {
    "totalIndicators": 18,
    "computed": 14,
    "requiresAdditionalData": 3,
    "elevatedRiskFlags": 1,
    "overallStatus": "REVIEW"
  },
  "indicators": [
    {
      "id": 1,
      "name": "GHG Emissions",
      "annex": "Annex I, Table 1, Indicator 1",
      "status": "WITHIN_THRESHOLD",
      "value": "42.3 tCO2e/M€ invested"
    }
  ]
}
```

No auth or API key required for the report endpoint. Supports up to 50 LEIs per call.

## Free SFDR PAI pre-assessment

Before committing to a full SFDR screen, retrieve a free partial PAI pre-assessment for any counterparty:

```bash
GET https://compliance.untitledfinancial.com/sfdr/report?lei=529900ODI3047E2LIV03
```

Returns ESG-derivable indicators immediately — GHG, carbon footprint, biodiversity, water, waste, board gender diversity. Sanctions, AML, and UNGC compliance are marked `REQUIRES_FULL_SCREEN`.

```json
{
  "lei":    "529900ODI3047E2LIV03",
  "report": "partial",
  "paiIndicators": {
    "ghgEmissions":         "BELOW_THRESHOLD",
    "carbonFootprint":      "MODERATE",
    "biodiversityRisk":     "LOW",
    "boardGenderDiversity": "COMPLIANT",
    "sanctionsCheck":       "REQUIRES_FULL_SCREEN",
    "ungcCompliance":       "REQUIRES_FULL_SCREEN"
  },
  "upgrade": "POST /sfdr/screen ($10 x402) — full Annex I with screeningId for regulatory documentation"
}
```

No auth or API key required. The full screen (`POST /sfdr/screen`, $10 via x402) returns complete Annex I with a `screeningId` suitable for regulatory documentation and external audit.

---

## Integration for European institutions

To integrate DPX ESG data into your SFDR/CSRD reporting workflow:

1. **Pre-trade ESG screening** — call `GET /esg-score?lei=:lei` before initiating settlement to get SFDR PAI indicators for the counterparty
2. **Settlement execution** — the ESG score is automatically embedded in every settlement response
3. **Reporting export** — use the `esg.sfdr` block in settlement records as a source record for PAI disclosure
4. **Audit support** — reference `txHash` and the `DPXVerificationOfPayee` contract for external assurance

For SFDR reporting templates or CSRD data mapping documentation, contact [case@untitledfinancial.com](mailto:case@untitledfinancial.com) or apply via the [beta access page](/beta).

---

## Further reading

- [ESG Oracle](/protocol/esg-oracle) — full scoring methodology and data sources
- [Regulatory Positioning](/protocol/regulatory) — MiCA, FCA, Basel III, GENIUS Act
- [Compliance Oracle](/api/compliance-oracle) — AML, VoP, FATF R16
- [European Institution Quickstart](/guides/european-institutions)
