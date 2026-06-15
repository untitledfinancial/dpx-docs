---
title: Fee Structure
description: DPX fee components, volume discount tiers, and competitive positioning against bank wire, SWIFT, and fintech rails.
---

DPX uses a four-component fee structure. All fees are enforced on-chain via the `DPXSettlementRouter` contract on Base mainnet (chainId 8453). There is no off-chain billing, no hidden FX markup, and no fees deducted in transit.

## Components

| Component | Applies to |
|---|---|
| Core transfer | Every settlement |
| FX conversion | Cross-currency only |
| ESG fee | Every settlement — calculated live from oracle |
| License | Every settlement — fixed, in token contract |

All rates are published on-chain. No rate can be changed without a governance transaction through `PolicyManager`.

## ESG Fee

The ESG fee is calculated live by the ESG Oracle using a **proprietary scoring methodology**. Higher score means a lower fee. **100% of ESG fees are redistributed to verified on-chain impact pools** — they are not revenue to Untitled_.

The scoring methodology, weighting model, and calculation logic are proprietary intellectual property of Untitled_ LuxPerpetua Technologies, Inc. Methodology documentation is available to approved institutional partners under NDA — apply via the [beta access page](/beta).

## Volume Discount Tiers

Volume discounts apply to the **core fee only**. FX and ESG fees are not discounted.

| Tier | Monthly Notional | Core Fee | FX Fee | All-In (cross-border, ESG 75) |
|---|---|---|---|---|
| Standard | < $500K | 1.50% | 0.40% | ~2.035% |
| Growth | $500K – $5M | 1.00% | 0.30% | ~1.525% |
| Institutional | $5M – $25M | 0.60% | 0.20% | ~0.975% |
| Enterprise | $25M – $100M | 0.30% | 0.15% | ~0.625% |
| Sovereign | $100M+ | Negotiated | — | ~10–25 bps |

Volume is tracked per API key against a rolling 30-day window. Tier upgrades apply automatically on the next quote after a threshold is crossed. Tier downgrades apply at the start of the following billing period.

### Committed volume agreements

Clients who pre-commit to a monthly notional floor receive the corresponding tier rate immediately, regardless of current volume. Committed volume agreements are available at Growth tier and above — contact [case@untitledfinancial.com](mailto:case@untitledfinancial.com).

### Batch settlement discount

Platforms routing multiple B2B payments can batch settlements into a single on-chain transaction. Gas costs are consolidated and the savings passed back as a flat per-batch reduction. Relevant for platforms with high transaction frequency and lower average notional per payment.

### ESG fee reduction path

The ESG fee (0–0.50%) already scales with counterparty score. Clients with consistently high-scoring counterparty networks — verified supply chains, institutional counterparties with published ESG reporting — can negotiate a capped ESG fee floor independent of individual transaction scores.

## Fee floor at scale

DPX's marginal cost per transaction is near zero: gas on Base mainnet costs $0.01–0.05, Cloudflare Workers cost fractions of a cent, and oracle and compliance infrastructure is fixed regardless of volume. Unlike correspondent banking — where per-hop fees are structurally unavoidable — DPX has genuine pricing flexibility at scale.

The practical fee floor, covering gas, oracle data, and compliance infrastructure, is approximately **10–15 basis points** on any notional amount.

## ESG Impact Redistribution

100% of ESG fees flow automatically to verified on-chain impact pools via `ESGRedistribution` (`0x4F3741252847E4F07730c4CEC3018b201Ac6ce87`).

| Pool | Share | Aligns with |
|---|---|---|
| Ocean Conservation | 30% | TCFD, GFANZ, SFDR PAI |
| Renewable Energy | 25% | IRA, GFANZ, SFDR PAI |
| Forest Preservation | 20% | TCFD, UN PRI, CSRD/ESRS |
| Climate Action | 15% | Paris Agreement, SFDR |
| Clean Water | 10% | UN SDG 6, OHCHR |

Every redistribution event is recorded on-chain via the `RedistributionExecuted` event — auditable by any counterparty, regulator, or SFDR-reporting fund without relying on DPX infrastructure.

## Competitive Context

World Bank Remittance Prices Q1 2025: global average **6.49%** · banks specifically **13.64%**.

| Provider | Typical All-In | What you get |
|---|---|---|
| Commercial bank wire (BofA / Wells / Chase) | 2.50–6.00% | Opaque FX markup, T+2–5, no audit trail |
| SWIFT correspondent chain (SME / mid-market) | 3.00–8.00% | Multi-hop fees, short-payment risk, no on-chain receipt |
| PayPal Business international | 7.00–8.50% | Consumer-grade, not programmable |
| Convera / WU Business | 1.50–4.00% | FX margin embedded, non-transparent |
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
