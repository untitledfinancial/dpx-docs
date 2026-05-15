---
title: Fee Model
description: DPX fee structure, unit economics, ESG redistribution mechanics, and licensing residual — reference data for treasury teams and integration partners.
---

## Fee structure

| Component | Rate | Notes |
|---|---|---|
| Core transfer | 0.85% | Every settlement |
| FX conversion | 0.40% | Cross-currency settlements only |
| ESG fee | 0.00–0.50% | Live from oracle — varies by counterparty score |
| License | 0.01% | Hardcoded in token contract — on-chain enforced |
| **Typical all-in** | **1.385%** | Score 75, cross-border |
| **Floor all-in** | **0.86%** | Score 100, same-currency |

Fees are governed on-chain. The 0.01% license fee is permanently encoded into the DPX Token contract and cannot be disabled by governance.

---

## Unit economics

Cost per $1M settled at various scenarios:

| Scenario | Rate | Cost per $1M |
|---|---|---|
| Same-currency, ESG score 100 | 0.86% | $8,600 |
| Same-currency, ESG score 75 | 0.975% | $9,750 |
| Cross-border, ESG score 75 *(typical)* | 1.385% | $13,850 |
| Cross-border, ESG score 50 | 1.635% | $16,350 |
| Cross-border, ESG score 25 | 1.760% | $17,600 |

---

## Fee comparison by volume

DPX at the typical 1.385% rate versus common legacy rail benchmarks:

| Annual Volume | DPX (1.385%) | Bank Wire (~4%) | Industry Avg (~6.35%) | Convera (~2.5%) |
|---|---|---|---|---|
| $10M | $138.5K | $400K | $635K | $250K |
| $100M | $1.385M | $4M | $6.35M | $2.5M |
| $500M | $6.925M | $20M | $31.75M | $12.5M |
| $1B | $13.85M | $40M | $63.5M | $25M |
| $5B | $69.25M | $200M | $317.5M | $125M |

*Legacy rate sources: World Bank Remittance Prices Worldwide Q1 2025 (global avg 6.49%, banks 13.64%); BofA/Wells Fargo/Chase FX markups estimated 2.5–6% (NerdWallet, FNBO SWIFT GPI case study 2025); Convera 1.5–4% (FXCompared 2025).*

---

## Competitive context

| Provider | Typical rate | Notes |
|---|---|---|
| Bank Wire (commercial) | 2.50–6.00% | |
| SWIFT Correspondent (SME) | 3.00–8.00% | |
| Convera / Corporate FX | 1.50–4.00% | |
| **DPX (typical)** | **1.385%** | Includes compliance, stability oracle, ESG |
| Wise Business | 0.33–0.59% | No compliance layer, no oracle, no ESG redistribution |
| Ripple ODL | 0.15–0.30% | No compliance layer, no oracle, no ESG redistribution |

---

## ESG redistribution

The ESG fee component is not retained as protocol revenue. It routes on-chain to verified impact pools via `ESGRedistribution` at `0x4F3741252847E4F07730c4CEC3018b201Ac6ce87`.

Distribution at default allocation weights:

| Program | Allocation |
|---|---|
| Ocean Conservation | 30% |
| Renewable Energy | 25% |
| Forest Preservation | 20% |
| Climate Action | 15% |
| Clean Water | 10% |

At $1B annual volume with counterparty ESG score 75, approximately $1.25M/year routes to these programs. All redistribution events are on-chain and verifiable on Base Blockscout.

---

## License fee mechanics

The 0.01% license fee is hardcoded into the DPX Token contract at `0x7A62dEcF6936675480F0991A2EF4a0d6f1023891` and enforced at the ERC-20 transfer level.

- Survives any acquisition, dissolution, or change of control
- Requires an on-chain governance vote to modify
- Accrues to the designated license address on every settlement automatically

| Annual Volume | License residual |
|---|---|
| $100M | $10K/year |
| $1B | $100K/year |
| $10B | $1M/year |
| $100B | $10M/year |

---

## Sources

- World Bank Remittance Prices Worldwide Q1 2025
- a16z Crypto: State of Crypto 2024
- McKinsey Global Payments Report 2022
- NerdWallet, FNBO SWIFT GPI case study 2025
- FXCompared, Wise comparison 2025
