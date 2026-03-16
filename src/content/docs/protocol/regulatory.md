---
title: Regulatory Positioning
description: DPX protocol compliance across EU MiCA, SFDR, CSRD, UK FCA/PRA, and US OCC frameworks — and what each means for institutional holders and counterparties.
---

DPX was designed to meet institutional regulatory requirements across all three major markets. This page summarises the relevant frameworks and DPX's position under each.

---

## European Union

### MiCA — Markets in Crypto-Assets Regulation

MiCA Title III entered full application in June 2024. It establishes the authorisation and operating requirements for stablecoin issuers in the EU.

DPX's reserve structure is designed to comply with **MiCA Article 36** requirements, including:
- Minimum 30% liquid asset reserve
- Independent custody of reserve assets
- Prohibition on lending reserve assets
- Redemption at par on demand

For EU institutions evaluating stablecoin settlement rails, MiCA authorisation status is the primary due diligence filter. DPX's reserve architecture addresses this requirement at the protocol level — it is not a configuration option.

---

### SFDR — Sustainable Finance Disclosure Regulation

EU fund managers with **Article 8** (ESG-promoting) or **Article 9** (ESG-objective) fund designations are required under SFDR Regulatory Technical Standards to:
- Source and disclose **Principal Adverse Impact (PAI)** indicators
- Report sustainability-related information on an ongoing basis
- Align investment processes with stated ESG objectives

DPX's ESG Oracle directly produces the data required for PAI disclosure. The oracle draws from 8 institutional sources across Environmental, Social, and Governance dimensions — including UN SDG human rights and gender equity metrics — and outputs structured data compatible with major LP reporting platforms.

For Article 8 and Article 9 fund managers, the oracle feed eliminates manual PAI data sourcing. All four TCFD pillars are output in machine-readable format.

---

### CSRD — Corporate Sustainability Reporting Directive

CSRD requires **double materiality reporting** — covering both the financial impact of ESG risks on the company *and* the company's impact on the environment and society. Reporting is aligned with ESRS (European Sustainability Reporting Standards).

Large EU companies are subject to CSRD from FY2024 (phased by company size through FY2026). DPX's ESG data output covers both ESRS environmental and social dimensions, including the social sub-indicators most commonly flagged in double materiality gap analyses: human rights, labour rights, gender pay equity, and health.

---

### PSD2 / PSD3 and SEPA Instant

EU payment institutions operating under PSD2 and the updated PSD3 open finance framework face:
- SEPA Instant mandatory adoption (EU Regulation 2024/886 — deadline passed January 2025)
- Cross-border payment cost reduction obligations under G20 roadmap targets
- Enhanced transaction record-keeping under PSD2 Article 94

DPX provides a programmable settlement layer with full on-chain audit trail, designed for compliance with EU payment institution record-keeping requirements. Cross-border settlement costs are reduced measurably from the 6.3% global average toward the G20 target of below 3% by 2027.

---

## United Kingdom

### FCA Regulatory Framework

DPX's architecture is compatible with the FCA's approach to digital asset settlement under the **Financial Services and Markets Act 2023** and FCA Innovation Pathways.

For UK-regulated entities, the FCA Innovation Pathways provides a structured regulatory entry route. FCA-authorised payment institutions and e-money institutions can engage with DPX settlement infrastructure within the existing regulatory perimeter.

**FCA PSR 2023** — The Payment Systems Regulator's 2023 review sets specific cross-border payment cost reduction targets aligned with UK G20 commitments. UK payment institutions are subject to FCA monitoring on cross-border pricing. DPX settlement directly addresses the PSR cost trajectory.

---

### UK TCFD — Mandatory Reporting

**FCA PS21/24** made TCFD reporting mandatory for:
- UK-listed companies (premium and standard segment) — from 2022
- Large AUM asset managers and FCA-regulated life insurers — from 2022–2023 (phased)
- UK-regulated pension schemes — from 2022

DPX's ESG Oracle outputs all four TCFD pillars — **Governance, Strategy, Risk Management, Metrics & Targets** — in machine-readable format. This eliminates the manual data sourcing step that currently drives compliance costs for most affected institutions.

---

### PRA and Basel III Capital Treatment

Under the **PRA's implementation of the Basel III final standard** (CP16/22 and subsequent policy statements), cryptoassets are classified into two groups for capital purposes:

| Group | Treatment | Criteria |
|---|---|---|
| **Group 1b** | Maximum 2% add-on to RWA | Backed stablecoin meeting stabilisation criteria |
| **Group 2b** | 1,250% risk weight | All other cryptoassets |

DPX qualifies for **Group 1b** treatment, meaning institutional holders are **not** subject to the 1,250% risk weight applied to most cryptoassets. For PRA-regulated banks, this difference in capital treatment is material at scale.

Your risk team can reference PRA CP16/22 and PRA PS17/22 for the full capital treatment framework.

---

## United States

### OCC Interpretive Letter #1179

The OCC issued Interpretive Letter #1179 in January 2021, confirming that **US national banks and federal savings associations may hold reserve assets for stablecoin issuers** and use stablecoins to facilitate payment transactions.

US national banks are already legally authorised to engage with DPX. No additional regulatory clearance is required at the federal level for OCC-regulated institutions. DPX's reserve structure additionally meets MiCA Article 36 requirements — providing EU-equivalent compliance status for internationally-active US institutions.

---

### Basel III — US Implementation

US implementation of Basel III final standard (effective January 2025 for large US banks under Federal Reserve / OCC rules) aligns with the international Group 1b / Group 2b classification framework. DPX's Group 1b qualification applies to US institutional holders under the same capital treatment logic as the EU and UK.

---

## Cross-Market: ESG Reporting Alignment

DPX's ESG data output is aligned with the reporting frameworks most commonly required across all three markets:

| Framework | Market | DPX Coverage |
|---|---|---|
| TCFD four pillars | UK (mandatory), EU (SFDR RTS), US (voluntary / SEC pending) | ✅ All four pillars, machine-readable |
| SFDR PAI indicators | EU (mandatory for Art. 8/9 funds) | ✅ E, S, G dimensions via 8 institutional sources |
| CSRD / ESRS | EU (mandatory for large companies) | ✅ E and S dimensions, including human rights and gender equity |
| UN PRI | Global (5,000+ signatories) | ✅ ESG data feed compatible with PRI reporting workflows |
| GRI Standards | Global | ✅ Social and governance indicators aligned with GRI 400 series |

---

## Contact

For regulatory due diligence enquiries, legal opinion requests, or to arrange a compliance briefing for your institution's legal or risk team — contact [beta@untitledfinancial.com](mailto:beta@untitledfinancial.com).
