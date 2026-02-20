---
title: ESG Oracle
description: How the DPX ESG Oracle calculates live environmental, social, and governance scores that feed directly into settlement fees.
---

The DPX ESG Oracle provides live E, S, G scores that feed directly into settlement fees. A higher ESG score means a lower fee — creating a direct financial incentive for environmentally and socially responsible counterparties.

## Score components

| Component | Description |
|---|---|
| Environmental (E) | Carbon footprint, energy sourcing, climate impact |
| Social (S) | Labor practices, community impact, diversity |
| Governance (G) | Transparency, board structure, compliance |

The three scores are averaged equally: `avgScore = (E + S + G) / 3`

## Fee formula

```
esgFee = (100 - avgScore) / 200
```

This is a linear formula. At score 100 the ESG fee is 0%. At score 0 it is 0.50%. The formula is identical in:

- `esg-oracle/routes/agentEndpoints.js` (Node.js)
- `stability-oracle/routes/agentEndpoints.js` (Node.js)
- `DPXSettlementRouter.sol` (on-chain)

## Score tiers

| Score | ESG Fee | Tier |
|---|---|---|
| 90–100 | 0.000–0.050% | Excellent |
| 75–89 | 0.055–0.125% | Good |
| 50–74 | 0.130–0.250% | Average |
| 25–49 | 0.255–0.375% | Below Average |
| 0–24 | 0.380–0.500% | Poor |

## Redistribution

100% of ESG fee revenue is redistributed to verified on-chain impact programs. The distribution is encoded in the `DPXSettlementRouter` contract and cannot be changed without an on-chain governance action.

| Program | Share |
|---|---|
| Ocean Conservation | 30% |
| Renewable Energy | 25% |
| Forest Preservation | 20% |
| Climate Action | 15% |
| Clean Water | 10% |

## Architecture

```
esg-oracle/
  server.js            ← HTTP server, port 3001
  normalize.js         ← score normalization module
  routes/
    agentEndpoints.js  ← /manifest, /esg-score, /quote, /reliability
```

## Live endpoint

```bash
curl localhost:3001/esg-score
```

Returns the current E, S, G scores, the composite average, the active fee, and the tier label. Use `scores.average` as the `esgScore` parameter in settlement quotes.
