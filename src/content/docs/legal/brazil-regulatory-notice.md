---
title: Brazil — Regulatory Notice
description: Regulatory disclosures for Brazilian users and integrators of the DPX Protocol API, including BCB licensing status, Resolution 561 stablecoin restrictions, COAF, and tax reporting obligations.
---

import { Aside } from '@astrojs/starlight/components';

<Aside type="caution" title="Important — Read Before Production Deployment in Brazil">
Untitled_ LuxPerpetua Technologies, Inc. is incorporated in the United States. DPX is **not** licensed, authorized, or registered with the Banco Central do Brasil (BCB), the Comissão de Valores Mobiliários (CVM), the Conselho de Controle de Atividades Financeiras (COAF), or any other Brazilian regulatory authority.
</Aside>

This page summarizes the Brazilian regulatory context relevant to use of the DPX API. It is provided for information only and does not constitute legal advice. Brazilian users should obtain independent legal counsel before using DPX in any commercially regulated capacity.

## Critical deadlines

| Date | Requirement |
|---|---|
| **October 1, 2026** | BCB Resolution 561 effective — eFX-licensed institutions may not use stablecoins (including USDC) to settle the international leg of cross-border payments without separate SPSAV authorization |
| **October 30, 2026** | BCB Resolution 520 Art. 23 — BCB-authorized SPSAVs prohibited from transacting with non-authorized virtual asset service providers |
| **May 31, 2027** | Last date for entities that had Brazilian customers before February 2, 2026 to apply retroactively for SPSAV authorization |

## BCB licensing and VASP framework

Brazilian law (Law 14.478/2022, regulated by BCB Resolutions 519, 520, 521 — effective February 2, 2026) requires entities that habitually provide virtual asset services to hold authorization as an **SPSAV** (Sociedade Prestadora de Serviços de Ativos Virtuais). SPSAV authorization covers three modalities: intermediation (trading), custody, and brokerage.

DPX provides settlement oracle intelligence and execution parameters — it does not custody assets, intermediate trading, or act as a broker. Whether this constitutes a regulated virtual asset service under Brazilian law has not been determined by ruling. If your use of the DPX API involves providing regulated virtual asset services to Brazilian End Users, you must hold or partner with a BCB-authorized SPSAV.

Entities providing commercial cross-border payment services without BCB authorization may be subject to enforcement under Law 12.865/2013.

## BCB Resolution 561 — stablecoin restriction for eFX operators

BCB Resolution 561 (April 2026, effective **October 1, 2026**) prohibits Brazilian payment institutions and banks operating under the eFX regulatory framework from using stablecoins to settle the international leg of cross-border payments, unless they also hold SPSAV authorization.

<Aside type="danger" title="eFX operators">
If your institution holds an eFX authorization but not SPSAV authorization, use of the DPX API for stablecoin-denominated cross-border settlement may not be permissible after October 1, 2026. Confirm your authorization status with Brazilian counsel before this date.
</Aside>

Licensed SPSAVs are exempt from this restriction and may continue to use USDC for international settlement.

## BCB Resolution 520 — authorized VASP counterparty restriction

BCB Resolution 520, Article 23 (effective **October 30, 2026**) prohibits BCB-authorized SPSAVs from transacting with non-authorized virtual asset service providers. If you are a Brazilian SPSAV, or if your End Users are Brazilian SPSAVs, you are responsible for confirming that use of the DPX API satisfies this counterparty requirement under applicable BCB guidance before October 30, 2026.

## IOF (Imposto sobre Operações Financeiras)

Cross-border remittances by Brazilian residents are subject to IOF at applicable rates (currently **0.38%** for different-owner transfers under the eFX framework). The IOF obligation attaches to the Brazilian party at the point of the BRL foreign exchange conversion.

Untitled_ does not collect or remit IOF. You are solely responsible for ensuring IOF is properly assessed and remitted on your users' transactions.

BCB Resolution 521 (effective February 2026) treats stablecoin purchases, sales, and exchanges by Brazilian residents as foreign exchange operations subject to BCB reporting requirements. The IOF treatment of USDC transactions remains under active regulatory development — monitor Finance Ministry guidance.

## Crypto asset reporting — IN RFB 1.888/2019 and DeCripto (IN RFB 2.291/2025)

Brazilian individuals and legal entities transacting in virtual assets with a total monthly value exceeding **R$30,000** (approximately USD 5,900 at current rates) are required to report those transactions to the Receita Federal do Brasil (RFB). Reportable information includes:

- Transaction type and virtual asset category
- Quantity of assets transacted
- Counterparty identity — including the name and country of foreign counterparties such as Untitled_
- Transaction value in BRL

Brazil participates in the OECD Crypto-Asset Reporting Framework (CARF), under which this data may be shared with foreign tax authorities, including the U.S. Internal Revenue Service.

**BCB Resolution 521** separately requires BCB-licensed institutions to report stablecoin transactions monthly.

## AML obligations and COAF

Brazilian payment institutions and licensed virtual asset service providers are subject to anti-money laundering obligations under Law 9.613/1998 and BCB Circular 3.978/2020, including customer due diligence, transaction monitoring, and Suspicious Activity Reports to COAF. These obligations attach to the Brazilian-licensed institution, not to Untitled_.

By integrating DPX, you represent that your Application complies with all applicable Brazilian AML law, including any COAF reporting obligations that arise from your users' transactions.

## Tax treatment — USDC received by Brazilian entities

USDC and other stablecoins received by Brazilian legal entities are treated as financial assets for tax purposes. Receipts and gains on conversion to BRL are subject to:

- **IRPJ** (Imposto de Renda Pessoa Jurídica): 25%
- **CSLL** (Contribuição Social sobre o Lucro Líquido): 9%
- Combined effective rate: approximately 34%

Brazilian users are solely responsible for applicable tax treatment of USDC received via DPX settlements.

## PIX and international settlement

PIX is a domestic Brazilian payment rail (BRL only). International PIX does not exist as a standardized product. For BRL→USD corridors, PIX handles the domestic BRL disbursement leg; DPX provides the USD settlement authorization rail (the international leg). These are distinct rails operated by different parties.

BCB Resolution 561 restricts eFX-licensed intermediaries from using stablecoins for the international leg after October 1, 2026, regardless of whether PIX is used domestically.

## User acknowledgment

By accessing the DPX API from Brazil or using it to serve Brazilian End Users, you:

1. Represent that you have obtained independent Brazilian legal advice regarding your obligations under Law 14.478/2022, BCB Resolutions 519–521 and 561, Law 9.613/1998, and IN RFB 1.888/2019 / IN RFB 2.291/2025.
2. Represent that you hold all required authorizations for your use case.
3. Agree to indemnify Untitled_ against any claims, penalties, or regulatory actions arising from your use of the DPX API in Brazil.

Full terms: [Developer API Agreement →](/legal/developer-terms)

---

*This page reflects the regulatory environment as of June 2026. Brazilian fintech regulation is evolving rapidly. Confirm current requirements with Brazilian counsel before deployment.*
