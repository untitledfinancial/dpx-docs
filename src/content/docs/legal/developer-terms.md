---
title: Developer API Agreement
description: Terms governing programmatic access to DPX Protocol APIs, oracle services, and developer tooling.
---

import { Aside } from '@astrojs/starlight/components';

<Aside type="caution" title="Legal Notice">
This Agreement governs all programmatic access to DPX protocol APIs, oracle services, and developer tooling. By accessing any DPX API endpoint you accept these terms in full. Review with qualified legal counsel before production deployment in a regulated financial services context.
</Aside>

**Effective:** March 2026 · **Version:** 1.0 · **Untitled_ LuxPerpetua Technologies, Inc.**

Full HTML version: [untitledfinancial.com/developer-terms](https://untitledfinancial.com/developer-terms)

---

## 1. Definitions

| Term | Meaning |
|---|---|
| **API** | DPX Stability Oracle API, ESG Oracle API, Settlement Router API, and any other programmatic interface made available by Untitled_ |
| **Application** | Software you build, operate, or distribute that calls the API |
| **Credentials** | API keys, client IDs, client secrets, JWT signing keys, or bearer tokens issued to you |
| **DPX Protocol** | The smart contract system on Base mainnet including DPX token, StabilityFeeController, BasketPegManager, ESGCompliance, ESGRedistribution, PolicyManager, and DPXSettlementRouter |
| **ESG Data** | Environmental, social, and governance scores returned by the ESG Oracle API |
| **Oracle Data** | All data returned by any DPX API endpoint |
| **Settlement Transaction** | Any on-chain transaction routed through the DPXSettlementRouter contract |
| **Integrator / you** | The entity or individual accepting this Agreement |
| **End User** | Any person or legal entity that accesses or benefits from your Application |
| **Untitled_** | Untitled_ LuxPerpetua Technologies, Inc. |

---

## 2. License Grant

Subject to compliance with this Agreement, Untitled_ grants you a **limited, non-exclusive, non-transferable, revocable licence** to:

- Access and call the API to build and operate your Application
- Display Oracle Data within your Application (with attribution per Section 7)
- Reference DPX fee quotes in user-facing pricing for the quote validity window (300 seconds)
- Submit Settlement Transactions via the DPXSettlementRouter on behalf of End Users who have provided explicit informed consent

All rights not expressly granted are reserved.

---

## 3. Restrictions

You must not:

- Resell, sublicense, or white-label API access without a separate written agreement
- Use the API to route or facilitate transactions that circumvent AML, CTF, or sanctions obligations
- Misrepresent Oracle Data as investment advice, regulatory certification, or audited financial information
- Reverse-engineer the oracle scoring methodology beyond what is disclosed in the Documentation
- Exceed documented rate limits or impose unreasonable load on the infrastructure
- Scrape or republish Oracle Data to competing oracle or data services
- Transmit malicious code or conduct denial-of-service attacks
- Use the API for any purpose prohibited by applicable law

---

## 4. API Access and Credentials

### Rate Limits

| Endpoint | Default | Notes |
|---|---|---|
| `GET /reliability` | 60 req/min | Unauthenticated |
| `GET /health` | 60 req/min | Unauthenticated |
| `GET /quote` | 30 req/min | Quotes valid 300s |
| `GET /esg-score` | 20 req/min | Per company address |
| `GET /manifest` | 10 req/min | Cache recommended |
| Settlement Router | Gas limits apply | No API-layer rate limit |

You are responsible for the security of your Credentials. Notify Untitled_ immediately upon actual or suspected compromise via the contact form at [untitledfinancial.com](https://untitledfinancial.com).

### Autonomous Systems

**Operators are responsible for all actions taken by autonomous systems — including AI agents, automated scripts, and orchestration frameworks — operating under their Credentials.** An action taken by an agent under your API key is an action taken by you. This responsibility is unconditional and is not diminished by the degree of autonomy, the complexity of the agent system, or the absence of human review on any individual transaction.

You must ensure that:
- Any autonomous system operating under your Credentials complies with these terms in full
- Appropriate circuit-breaker controls, spending limits, and oversight mechanisms are in place
- You can suspend or revoke agent access promptly in the event of compromise or unexpected behaviour
- The scope of permissions granted to any agent is limited to what is necessary for its intended function

---

## 5. Compliance Obligations

### 5.1 Regulatory Status
You represent that you hold all licences required to operate your Application in each jurisdiction.

### 5.2 AML / KYC
You are responsible for implementing KYC and AML procedures for your End Users in accordance with applicable law, including the FATF Recommendations, EU Anti-Money Laundering Directives, and the U.S. Bank Secrecy Act.

### 5.3 Travel Rule
Where the FATF Travel Rule applies to Settlement Transactions, you are responsible for collecting, transmitting, and retaining originator and beneficiary information as required.

### 5.4 Sanctions
You must screen all End Users and transaction counterparties against applicable sanctions lists (OFAC SDN, EU Consolidated List, UN Security Council lists) before initiating any Settlement Transaction.

### 5.5 Record Keeping
Retain records of all Settlement Transactions for a minimum of five (5) years.

### 5.6 Brazil — Specific Regulatory Notice

<Aside type="caution" title="Brazilian Users — Read Before Production Deployment">
Untitled_ LuxPerpetua Technologies, Inc. is incorporated in the United States and is **not** licensed, authorized, or registered with the Banco Central do Brasil (BCB), the Comissão de Valores Mobiliários (CVM), the Conselho de Controle de Atividades Financeiras (COAF), or any other Brazilian regulatory authority.
</Aside>

If you are a Brazilian resident or legal entity, or if your Application serves Brazilian End Users, you are solely responsible for compliance with Brazilian law, including:

**BCB licensing (BCB Resolutions 519, 520, 521 — effective February 2, 2026):**
Brazil requires that entities habitually providing virtual asset services (including intermediation, brokerage, or custody of virtual assets) hold authorization as an SPSAV (Sociedade Prestadora de Serviços de Ativos Virtuais). If your use of the DPX API constitutes a regulated virtual asset service under Law 14.478/2022, you must hold or partner with a BCB-authorized SPSAV before operating commercially. Entities providing commercial cross-border payment services without BCB authorization may be subject to enforcement action under Law 12.865/2013.

**Stablecoin restrictions for eFX operators (BCB Resolution 561 — effective October 1, 2026):**
Brazilian payment institutions and banks operating under the eFX regulatory framework are prohibited from using stablecoins (including USDC) to settle the international leg of cross-border payments unless they also hold SPSAV authorization. If your institution is an eFX participant without SPSAV authorization, use of the DPX settlement API for cross-border flows may not be permissible after October 1, 2026.

**Counterparty restriction (BCB Resolution 520, Art. 23 — effective October 30, 2026):**
BCB-authorized SPSAVs are prohibited from transacting with non-authorized virtual asset service providers after October 30, 2026. If you are a Brazilian SPSAV, or if your End Users are Brazilian SPSAVs, you are responsible for confirming that use of the DPX API satisfies this counterparty requirement under applicable BCB guidance.

**IOF (Imposto sobre Operações Financeiras):**
Cross-border remittances by Brazilian residents are subject to IOF at applicable rates (currently 0.38% for different-owner transfers). The IOF obligation attaches to the Brazilian party at the point of the BRL foreign exchange conversion. Untitled_ does not collect or remit IOF. You are responsible for ensuring IOF is properly collected and remitted on your users' transactions.

**Stablecoin treatment as foreign exchange (BCB Resolution 521 — effective February 2026):**
BCB Resolution 521 treats purchases, sales, and exchanges of stablecoins by Brazilian residents as foreign exchange operations subject to BCB reporting requirements. Brazilian-licensed institutions are required to report stablecoin transactions monthly. If your application enables Brazilian users to acquire, transfer, or hold USDC, applicable reporting obligations under Resolution 521 and BCB Circular 3.978/2020 attach to you and your users.

**Crypto transaction reporting (IN RFB 1.888/2019; IN RFB 2.291/2025 — DeCripto):**
Brazilian individuals and legal entities transacting in virtual assets with a total monthly value exceeding **R$30,000** (approximately USD 5,900) are required to report those transactions to the Receita Federal do Brasil (RFB). Reportable information includes transaction type, asset type and quantity, counterparty identity (including the name and country of foreign counterparties such as Untitled_), and transaction value in BRL. Brazil participates in the OECD Crypto-Asset Reporting Framework (CARF), under which this data may be shared with foreign tax authorities including the U.S. Internal Revenue Service.

**AML and COAF:**
Brazilian payment institutions and licensed virtual asset service providers are subject to AML obligations under Law 9.613/1998 and BCB Circular 3.978/2020, including customer due diligence, transaction monitoring, and reporting to COAF. These obligations attach to the Brazilian-licensed institution, not to Untitled_. You represent that your Application is operated in full compliance with applicable Brazilian AML law.

By accessing the DPX API from Brazil or using it to serve Brazilian End Users, you represent that you have obtained independent Brazilian legal advice and hold all required authorizations, and you indemnify Untitled_ against any claims, penalties, or regulatory actions arising from your use of the API in Brazil.

---

## 6. ESG Data — Specific Terms

<Aside type="note">
ESG Data is algorithmically derived from publicly available sources. It is **not** investment advice, an ESG rating within the meaning of any regulation, or an audit/certification.
</Aside>

- **No investment advice.** ESG scores do not constitute financial advice or regulatory certification.
- **Source limitations.** Scores may be subject to lag, revision, or provider outages. Display appropriate uncertainty disclosures.
- **SFDR / GFANZ.** If you use ESG Data for SFDR disclosures or GFANZ reporting, additional verification steps are your responsibility.

---

## 7. Attribution

Where your Application displays Oracle Data in a user-facing context, include:

> *"Powered by DPX Protocol — untitledfinancial.com"*

---

## 8. Settlement Finality and On-Chain Risks

<Aside type="danger" title="Irreversibility">
Settlement Transactions are **irreversible** once confirmed on the Base blockchain. Verify all transaction parameters before submission. Untitled_ has no ability to reverse confirmed transactions.
</Aside>

- **Smart contract risk.** No smart contract system is free from risk. You acknowledge inherent risks of blockchain-based systems.
- **Fee quotes.** Quotes expire after 300 seconds. Untitled_ is not liable for differences between quoted and executed fees arising from quote expiry.

---

## 9. Fee Structure

| Component | Applies |
|---|---|
| Core settlement | All settlements |
| FX basket | Cross-currency only |
| ESG-linked | Based on company score — 100% redistributed to impact pools |
| License fee | Every DPX token transfer (on-chain, immutable) |

API oracle access is currently provided at no charge under a fair use policy. Untitled_ reserves the right to introduce access fees with 60 days' written notice.

---

## 10. Intellectual Property

DPX smart contracts are licensed under **BUSL-1.1**. The oracle scoring methodology and API interfaces are proprietary. Feedback you provide may be used by Untitled_ without restriction or compensation.

---

## 11. Data Privacy

- API usage telemetry is collected for operational purposes and is not sold to third parties.
- Settlement Transaction data is publicly visible on the Base blockchain. Inform End Users accordingly.
- For EU/EEA personal data processing, contact Untitled_ via the contact form at [untitledfinancial.com](https://untitledfinancial.com) to request a Data Processing Agreement.

---

## 12–15. Warranties, Liability, Indemnification

- **Warranties:** API and Oracle Data provided "as is" without warranty of any kind.
- **Liability cap:** Untitled_'s aggregate liability is capped at amounts paid in the preceding 12 months or USD $100, whichever is greater.
- **Indemnification:** You indemnify Untitled_ against claims arising from your Application, breach of this Agreement, or violation of law.

---

## 16. Termination

- You may terminate by ceasing API use and destroying Credentials.
- Untitled_ may suspend immediately for breach, suspected fraud, or regulatory risk.
- 30 days' notice given for other terminations.
- Compliance, liability, IP, and indemnification sections survive termination.

---

## 17. Changes

Material changes notified with ≥30 days' notice. Continued use after effective date = acceptance.

---

## 18. Governing Law

Delaware law governs. Disputes resolved by JAMS arbitration if not resolved informally within 30 days.

---

## 19. Contact

**Untitled_ LuxPerpetua Technologies, Inc.**
Attn: Legal / Developer Relations
[untitledfinancial.com](https://untitledfinancial.com)
