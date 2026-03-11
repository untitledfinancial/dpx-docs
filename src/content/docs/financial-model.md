---
title: Financial Model
description: DPX buildout costs, margins, client scenarios, and 10-year revenue projection.
---

## Fee structure

| Component | Rate | Applies to |
|---|---|---|
| Core transfer | **0.85%** (85 bps) | Every settlement |
| FX conversion | **0.40%** (40 bps) | Cross-currency only |
| ESG fee | **0.00–0.50%** | Every settlement — live from oracle |
| License | **0.01%** (1 bp) | Every settlement — fixed |
| **Typical all-in** | **1.385%** | Score 75, cross-border |

## Competitive positioning

| Provider | Typical Rate | Per $1M |
|---|---|---|
| SWIFT / Bank Wire | 2.00–5.00% | $20K–$50K |
| Stripe stablecoin | 1.50% | $15,000 |
| **DPX (typical)** | **1.385%** | **$13,850** |
| Wise (cross-border) | 0.40–1.50% | ~$9,500 typical |
| Ripple ODL | 0.20–0.50% | $2K–$5K |

DPX saves $1,150/million vs Stripe stablecoin. The premium over Wise reflects instant settlement, on-chain auditability, ESG scoring + redistribution, and a 6-tier stability oracle.

## Buildout cost milestones

| Phase | Milestone | Cost | Cumulative |
|---|---|---|---|
| 1 | Core protocol + oracle MVP | $850K | $850K |
| 2 | Security audit + Base mainnet deploy | $450K | $1.3M |
| 3 | Agent integrations (MCP, GPT Actions, LangChain) | $280K | $1.58M |
| 4 | Documentation + developer portal | $120K | $1.7M |
| 5 | Regulatory + legal framework | $600K | $2.3M |
| 6 | Institutional sales + BD | $1.2M | $3.5M |
| 7 | ESG program infrastructure | $800K | $4.3M |
| 8 | Scale engineering + redundancy | $2.1M | $6.4M |
| 9 | Global compliance (5 jurisdictions) | $2.5M | $8.9M |
| 10 | Reserve fund (6 months OpEx) | $2.456M | $11.356M |

**Total buildout: $11.356M**

## Annual operating expenses (at scale)

| Item | Annual Cost |
|---|---|
| Engineering (8 FTE) | $1.6M |
| Compliance & Legal | $800K |
| Infrastructure | $400K |
| BD & Sales | $700K |
| ESG program management | $400K |
| G&A | $300K |
| **Total OpEx** | **$4.2M** |

## Margin by volume tier

| Annual Volume | Gross Revenue (1.385%) | OpEx | Net Operating Income | NOI Margin |
|---|---|---|---|---|
| $100M | $1.385M | $4.2M | ($2.815M) | — |
| $500M | $6.925M | $4.2M | $2.725M | 39% |
| $1B | $13.85M | $4.5M | $9.35M | 67% |
| $5B | $69.25M | $5.5M | $63.75M | 92% |
| $10B | $138.5M | $7M | $131.5M | 95% |

**Break-even: ~$340M annual volume**

## Client scenarios

### Sovereign Wealth Fund — $5B/year
- Tier: Sovereign (30% core discount), all-in 1.13%
- Annual fees to DPX: $56.5M
- Annual NOI (after OpEx share): ~$52.3M

### Large Asset Manager — $1B/year
- Tier: Institutional (20% core discount), all-in 1.215%
- Annual fees to DPX: $12.15M
- Annual NOI: ~$9.35M

### Mid-size Asset Manager — $200M/year
- Tier: Growth (10% core discount), all-in 1.30%
- Annual fees to DPX: $2.6M
- Annual NOI: ~$900K

### Fintech Platform — $500M/year
- Tier: Institutional, all-in 1.215%
- Annual fees to DPX: $6.075M
- Annual NOI: ~$3.5M

### AI Agent Network — $50M/year
- Tier: Standard, all-in 1.385%
- Annual fees to DPX: $692K
- Annual NOI: ~$200K (early contribution to fixed cost coverage)

## 10-client portfolio (illustrative)

Assuming 2 Sovereign + 3 Institutional + 3 Growth + 2 Standard clients:

| Metric | Value |
|---|---|
| Combined annual volume | ~$12.5B |
| Gross revenue | ~$154M |
| Operating expenses | ~$7.5M |
| **Net operating income** | **~$146.5M** |
| NOI margin | **95%** |

## 10-year revenue projection

| Year | Annual Volume | Gross Revenue | NOI | Cumulative NOI |
|---|---|---|---|---|
| 1 | $50M | $692K | ($3.5M) | ($3.5M) |
| 2 | $150M | $2.1M | ($2.1M) | ($5.6M) |
| 3 | $400M | $5.54M | $1.3M | ($4.3M) |
| 4 | $800M | $11.08M | $7.0M | $2.7M |
| 5 | $1.5B | $20.8M | $16.8M | $19.5M |
| 6 | $2.5B | $34.6M | $30.6M | $50.1M |
| 7 | $4B | $55.4M | $51.4M | $101.5M |
| 8 | $6B | $83.1M | $78.1M | $179.6M |
| 9 | $9B | $124.7M | $119.7M | $299.3M |
| 10 | $12B | $166.2M | $160.2M | $459.5M |

**Payback on $11.356M buildout: Year 4** (cumulative NOI turns positive)

## ESG impact at scale

At $5B annual volume (Sovereign tier), the ESG fee pool generates **$6.25M/year** distributed to:

| Program | Annual Impact |
|---|---|
| Ocean Conservation (30%) | $1.875M |
| Renewable Energy (25%) | $1.5625M |
| Forest Preservation (20%) | $1.25M |
| Climate Action (15%) | $937.5K |
| Clean Water (10%) | $625K |

At $12B annual volume (Year 10): **$15M+/year** in verified on-chain impact.

---

Full model: `dpx-protocol/FINANCIAL_MODEL.md`
