---
title: Fee Structure
description: DPX fee components, ESG fee formula, volume discount tiers, scenario examples, and competitive positioning.
---

DPX uses a four-component fee structure. All fees are enforced on-chain via the `DPXSettlementRouter` contract on Base mainnet.

## Components

| Component | Rate | Applies to |
|---|---|---|
| Core transfer | **0.85%** | Every settlement |
| FX conversion | **0.40%** | Cross-currency only |
| ESG fee | **0.00–0.50%** | Every settlement — live from oracle |
| License | **0.01%** | Every settlement — fixed |

## ESG Fee Formula

```
fee = (100 - avgESGScore) / 200
```

The ESG fee is calculated live from the ESG Oracle and varies with the counterparty's E, S, G scores. A higher score means a lower fee. 100% of ESG fees are redistributed to verified on-chain impact programs.

| Score | Fee | Tier |
|---|---|---|
| 100 | 0.000% | Excellent |
| 90 | 0.050% | Excellent |
| 75 | 0.125% | Good |
| 50 | 0.250% | Average |
| 25 | 0.375% | Below Average |
| 0 | 0.500% | Poor |

## Scenario Totals

| Scenario | Total Rate | Per $1M |
|---|---|---|
| Best case — score 100, same-currency | **0.86%** | $8,600 |
| Typical — score 75, cross-border | **1.385%** | $13,850 |
| Average — score 50, cross-border | **1.51%** | $15,100 |
| Worst case — score 0, cross-border | **1.76%** | $17,600 |

## Volume Discount Tiers

Applied to core fee only. FX and ESG fees are not discounted.

| Tier | Monthly Volume | Core Discount | Effective All-In (score 75, FX) |
|---|---|---|---|
| Standard | < $100K | 0% | 1.385% |
| Growth | $100K–$1M | 10% | 1.300% |
| Institutional | $1M–$10M | 20% | 1.215% |
| Sovereign | $10M+ | 30% | 1.130% |

## ESG Redistribution

100% of ESG fees flow to verified on-chain impact programs:

| Program | Share |
|---|---|
| Ocean Conservation | 30% |
| Renewable Energy | 25% |
| Forest Preservation | 20% |
| Climate Action | 15% |
| Clean Water | 10% |

At $5B annual volume (Sovereign tier), the ESG pool generates **$6.25M/year** in verified on-chain impact.

## Competitive Positioning

| Provider | Typical Rate | Per $1M |
|---|---|---|
| SWIFT / Bank Wire | 2.00–5.00% | $20K–$50K |
| Stripe Stablecoin | 1.50% | $15,000 |
| **DPX (typical)** | **1.385%** | **$13,850** |
| Wise (cross-border) | 0.40–1.50% | ~$9,500 typical |

DPX saves ~$1,150/million vs Stripe stablecoin. The premium over Wise reflects instant settlement, on-chain auditability, ESG scoring, and 6-tier stability oracle — capabilities Wise does not offer.

## Get a live quote

```bash
GET localhost:3000/quote?amountUsd=1000000&hasFx=true&esgScore=75
```

See [API Reference](/api/stability-oracle) for full parameter documentation.
