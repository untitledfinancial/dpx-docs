---
title: Client Savings Model
description: How much your organization saves by settling on DPX instead of legacy rails — unit economics, market benchmarks, and ESG redistribution by volume.
---

## The problem DPX solves

Cross-border institutional payments average **6.35% in fees** and take up to five days to settle (World Bank Q1 2025; a16z Crypto 2024). DPX delivers settlement at **1.385% typical all-in** — roughly **one-fifth the industry average cost** — with instant on-chain finality on Base mainnet.

---

## Fee structure

| Component | Rate | Applies to |
|---|---|---|
| Core transfer | **0.85%** | Every settlement |
| FX conversion | **0.40%** | Cross-currency only |
| ESG fee | **0.00–0.50%** | Every settlement — live from oracle |
| License | **0.01%** | Every settlement — on-chain enforced |
| **Typical all-in** | **1.385%** | Score 75, cross-border |
| **Best case all-in** | **0.86%** | Score 100, same-currency |

Fees are set by on-chain governance. The 0.01% license fee is permanently hardcoded into the token contract and accrues to the license holder in perpetuity, independent of company ownership.

---

## Client savings at 1.385%

These are the savings a client realises by switching from legacy rails to DPX. At 1.385% typical, DPX is not "half" the legacy cost — it is roughly **one-fifth**. The savings are larger than earlier projections.

| Annual Volume | DPX Cost (1.385%) | vs Bank Wire (4% mid) | vs Industry Avg (6.35%) | vs Convera (2.5%) |
|---|---|---|---|---|
| $10M | $138.5K | Save $261.5K | Save $497K | Save $111.5K |
| $100M | $1.385M | Save $2.615M | Save $4.965M | Save $1.115M |
| $500M | $6.925M | Save $13.075M | Save $24.825M | Save $5.575M |
| $1B | $13.85M | Save $26.15M | Save $49.65M | Save $11.15M |
| $5B | $69.25M | Save $130.75M | Save $248.25M | Save $55.75M |

**A $1B institutional fund switching from average bank wire rails to DPX saves ~$26M per year. Against the 6.35% global average, that savings exceeds $49M.**

*Sources: World Bank Remittance Prices Worldwide Q1 2025 (global avg 6.49%, banks 13.64%); BofA/Wells Fargo/Chase FX markups estimated 2.5–6% (NerdWallet, FNBO SWIFT GPI case study 2025); Convera 1.5–4% (FXCompared 2025).*

---

## Competitive positioning

| Provider | Typical Rate | Per $1B |
|---|---|---|
| Bank Wire (commercial) | 2.50–6.00% | $25M–$60M |
| SWIFT Correspondent (SME) | 3.00–8.00% | $30M–$80M |
| Convera / Corporate FX | 1.50–4.00% | $15M–$40M |
| **DPX (typical)** | **1.385%** | **$13.85M** |
| Wise Business | 0.33–0.59% | ~$4.5M |
| Ripple ODL | 0.15–0.30% | ~$2.5M |

DPX is priced at the low end of institutional FX rails with a compliance, stability, and ESG layer that no fintech rail currently offers. Wise and Ripple are cheaper on raw rate — they provide no on-chain ESG redistribution, no 9-layer stability oracle, no MiCA/FCA/Basel III compliance documentation, and no agent-native programmability.

---

## Market size

| Market | Size | Source |
|---|---|---|
| Total global cross-border payments (TAM) | $150T/year | McKinsey Global Payments 2022 |
| Programmable institutional flows (SAM) | $10–20T/year | a16z Crypto 2024 |
| Enterprise treasury + B2B stablecoin SOM | $55–125B/year | a16z; Statista 2024 |
| Treasury management software market | <$15B/year | Statista |

Stablecoins processed **$15.6T in 2024** — on par with Visa. Monthly adjusted stablecoin volume reached **$702B in early 2025**, up 49% year-over-year (a16z Crypto State of Crypto 2024).

0.5% of the $15.6T stablecoin market at DPX's 1.385% rate generates **~$1.1B/year** in fees. It takes a small number of high-volume institutional relationships to reach meaningful scale.

---

## Unit economics per $1M settled

| Scenario | Rate | DPX Revenue |
|---|---|---|
| Same-currency, score 100 | 0.86% | $8,600 |
| Same-currency, score 75 | 0.975% | $9,750 |
| Cross-border, score 75 *(typical)* | 1.385% | $13,850 |
| Cross-border, score 50 | 1.635% | $16,350 |
| Cross-border, score 25 | 1.760% | $17,600 |

---

## Illustrative client scenarios

*Pre-revenue. These scenarios are illustrative based on publicly available market data.*

### Enterprise treasury client (Kyriba-scale)

A single large enterprise treasury moving $1B/year in cross-border settlements.

| Metric | Value |
|---|---|
| Annual volume | $1B |
| Current rail cost (bank wire, ~4%) | $40M |
| DPX cost (typical 1.385%) | $13.85M |
| **Annual savings** | **$26.15M** |
| ESG fees redistributed to verified impact | $1.25M/year |

### Fintech platform embedding DPX

A B2B fintech processing cross-border payments for SMEs, embedding DPX as its settlement layer.

| Metric | Value |
|---|---|
| Annual volume | $200M |
| Current rail cost (~4%) | $8M |
| DPX cost (1.385%) | $2.77M |
| **Annual savings** | **$5.23M** |
| ESG redistribution pool | $250K/year |

### AI agent treasury workflow

Autonomous treasury agents running settlement workflows via the oracle API.

| Metric | Value |
|---|---|
| Annual volume | $50M |
| Current rail cost (~4%) | $2M |
| DPX cost (1.385%) | $692K |
| **Annual savings** | **$1.31M** |

---

## ESG redistribution model

The ESG fee component is not retained as protocol revenue — it flows on-chain to verified impact pools via `ESGRedistribution` (`0x4F3741252847E4F07730c4CEC3018b201Ac6ce87`).

**At $1B annual volume (counterparty ESG score 75):**

| Program | Rate | Annual Impact |
|---|---|---|
| Ocean Conservation | 30% | $375K |
| Renewable Energy | 25% | $312K |
| Forest Preservation | 20% | $250K |
| Climate Action | 15% | $188K |
| Clean Water | 10% | $125K |
| **Total redistributed** | | **$1.25M/year** |

At $10B annual volume: **$12.5M+/year** redistributed — entirely on-chain, verifiable on Base Blockscout by any counterparty or auditor.

---

## Licensing residual mechanics

The 0.01% fee is hardcoded into the DPX token contract at `0x7A62dEcF6936675480F0991A2EF4a0d6f1023891` and enforced at the ERC-20 transfer level. It:

- Survives any acquisition, dissolution, or change of control
- Requires an on-chain governance vote to modify
- Accrues to the designated license address on every settlement, automatically

| Annual Volume | License Residual (in perpetuity) |
|---|---|
| $100M | $10K/year |
| $1B | $100K/year |
| $10B | $1M/year |
| $100B | $10M/year |

---

## Sources

- a16z Crypto: State of Crypto 2024 — stablecoin volume $15.6T, Visa parity
- World Bank Remittance Prices Worldwide Q1 2025 — global avg 6.49%, banks 13.64%
- McKinsey Global Payments Report 2022 — $150T cross-border TAM
- Statista: stablecoin market, ESG ETF market, global remittance data
- NerdWallet, FNBO SWIFT GPI case study 2025 — commercial bank wire FX markup range
- FXCompared, Wise comparison 2025 — Convera rate estimate
- Wise pricing page, Wise Mission Update Q4 2025 — 0.33–0.59% published all-in
