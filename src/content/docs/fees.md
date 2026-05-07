---
title: Fee Structure
description: DPX fee components, volume discount tiers, scenario examples, and competitive positioning against bank wire, SWIFT, and fintech rails.
---

DPX uses a four-component fee structure. All fees are enforced on-chain via the `DPXSettlementRouter` contract on Base mainnet (chainId 8453). There is no off-chain billing, no hidden FX markup, and no fees deducted in transit.

## Components

| Component | Rate | Applies to |
|---|---|---|
| Core transfer | **0.85%** (85 bps) | Every settlement |
| FX conversion | **0.40%** (40 bps) | Cross-currency only |
| ESG fee | **0.00–0.50%** | Every settlement — calculated live from oracle |
| License | **0.01%** (1 bp) | Every settlement — fixed, in token contract |

All rates are published on-chain. No rate can be changed without a governance transaction through `PolicyManager`.

## ESG Fee

The ESG fee is calculated live by the ESG Oracle using a **proprietary scoring methodology**. Higher score means a lower fee. The component ranges from **0.00%** (best) to **0.50%** (worst). **100% of ESG fees are redistributed to verified on-chain impact pools** — they are not revenue to Untitled_.

The scoring methodology, weighting model, and calculation logic are proprietary intellectual property of Untitled_ LuxPerpetua Technologies, Inc. Methodology documentation is available to approved institutional partners under NDA — apply via the [beta access page](/beta).

## Scenario Totals

| Scenario | Core | FX | ESG | License | **Total** | Per $1M |
|---|---|---|---|---|---|---|
| Best case — score 100, same-currency | 0.85% | — | 0.000% | 0.01% | **0.86%** | $8,600 |
| Typical — score 75, cross-border | 0.85% | 0.40% | live | 0.01% | **1.385%** | $13,850 |
| Average — score 50, cross-border | 0.85% | 0.40% | live | 0.01% | **~1.510%** | ~$15,100 |
| Worst case — score 0, cross-border | 0.85% | 0.40% | live | 0.01% | **~1.760%** | ~$17,600 |

## Volume Discount Tiers

Discounts apply to the **core fee only**. FX and ESG fees are not discounted.

| Tier | Monthly Volume | Core Discount | Effective Core | All-In (score 75, FX) |
|---|---|---|---|---|
| Standard | < $100K | 0% | 0.85% | 1.385% |
| Growth | $100K – $1M | 10% | 0.765% | 1.300% |
| Institutional | $1M – $10M | 20% | 0.680% | 1.215% |
| Sovereign | $10M+ | 30% | 0.595% | 1.130% |

At Sovereign tier, the all-in rate for a typical cross-border settlement (score 75) is **1.130%** — well below the G20/FSB 2027 target of 1% all-in, which no mainstream payment gateway currently achieves across all corridors.

## ESG Impact Redistribution

100% of ESG fees flow automatically to verified on-chain impact pools via `ESGRedistribution` (`0x4F3741252847E4F07730c4CEC3018b201Ac6ce87`).

| Pool | Share | Aligns with |
|---|---|---|
| Ocean Conservation | 30% | TCFD, GFANZ, SFDR PAI |
| Renewable Energy | 25% | IRA, GFANZ, SFDR PAI |
| Forest Preservation | 20% | TCFD, UN PRI, CSRD/ESRS |
| Climate Action | 15% | Paris Agreement, SFDR |
| Clean Water | 10% | UN SDG 6, OHCHR |

Every redistribution event is recorded on-chain via the `RedistributionExecuted` event — auditable by any counterparty, regulator, or SFDR-reporting fund without relying on DPX infrastructure. At $5B annual volume (Sovereign tier), the ESG pool generates approximately **$6.25M/year** in on-chain-verified impact.

## Competitive Context

World Bank Remittance Prices Q1 2025: global average **6.49%** · banks specifically **13.64%**.

| Provider | Typical All-In | What you get |
|---|---|---|
| Commercial bank wire (BofA / Wells / Chase) | 2.50–6.00% | Opaque FX markup, T+2–5, no audit trail |
| SWIFT correspondent chain (SME / mid-market) | 3.00–8.00% | Multi-hop fees, short-payment risk, no on-chain receipt |
| PayPal Business international | 7.00–8.50% | Consumer-grade, not programmable |
| Convera / WU Business | 1.50–4.00% | FX margin embedded, non-transparent |
| **DPX — typical (score 75, cross-border)** | **1.385%** | On-chain enforcement, ESG scoring, 9-layer oracle, MiCA/FCA/Basel III positioning |
| Wise Business *(published)* | 0.33–0.59% | Best-in-class FX rate — no ESG, no oracle, no compliance layer |
| Ripple ODL *(estimated)* | 0.15–0.30% | Blockchain settlement rail — no ESG, no stability oracle, no regulatory positioning |

DPX is not the cheapest on raw rate. It is the only settlement rail that combines programmable execution, live ESG scoring with on-chain impact redistribution, a 9-layer stability oracle with 30–90 day early warning signals, and structural alignment with MiCA, FCA PSR, and Basel III Group 1b — in a single non-custodial on-chain product.

## Get a live quote

```bash
# Typical institutional settlement
curl "https://stability.untitledfinancial.com/quote?amountUsd=1000000&hasFx=true&esgScore=75"

# Best-case same-currency
curl "https://stability.untitledfinancial.com/quote?amountUsd=1000000&hasFx=false&esgScore=100"

# Sandbox mode — real calculations, no settlement
curl "https://stability.untitledfinancial.com/quote?amountUsd=5000000&hasFx=true&esgScore=75&sandbox=true"
```

Quotes are binding for **300 seconds** and include a `quoteId` for on-chain verification via `/verify-fees`.

See [API Reference](/api/stability-oracle) for full parameter documentation.
