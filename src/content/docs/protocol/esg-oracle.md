---
title: ESG Oracle
description: How the DPX ESG Oracle scores counterparties across Environmental, Social, and Governance dimensions using 8 real-world data sources — including human rights and gender equity metrics — and how 100% of ESG fee revenue is redistributed to verified on-chain impact programs.
---

> **Proprietary technology.** The ESG Oracle scoring methodology, weighting model, redistribution logic, and source code are proprietary intellectual property of Untitled_ LuxPerpetua Technologies, Inc. API access is available to approved beta partners. Self-hosting requires a separate license agreement — contact [beta@untitledfinancial.com](mailto:beta@untitledfinancial.com).

The DPX ESG Oracle produces live E, S, G scores from 8 real-world institutional data sources. Those scores flow directly into settlement fees: a higher score means a lower fee. 100% of ESG fee revenue is redistributed to verified on-chain impact programs — making every DPX settlement a direct contributor to measurable environmental and social outcomes.

The Social (S) dimension includes **human rights metrics** (child labour, labour rights enforcement, safety from violence) and a **gender equity sub-score** (women in management, earnings parity, gender-responsive institutions) — making DPX the first stablecoin settlement rail with human rights and gender equity embedded directly in its fee structure.

---

## Data Sources

The oracle pulls from 8 institutional data sources across the three ESG dimensions:

### Environmental (E)
| Source | API | Metrics |
|---|---|---|
| **World Bank** | `api.worldbank.org` | CO2 emissions (metric tons per capita) — `EN.ATM.CO2E.PC` |
| **Climate Monitor** | `climatemonitor.info/api` | Live CO2 levels (ppm), CH4 levels (ppb) |

### Social (S)
| Source | API | Metrics |
|---|---|---|
| **UN SDG API** | `unstats.un.org/SDGAPI` | SDG 4.1.1 — education; SDG 3 — health |
| **UN SDG API — Human Rights** | `unstats.un.org/SDGAPI` | SDG 8.7.1 — child labour; SDG 16.1.3 — safety from violence; SDG 16.b.1 — non-discrimination; SDG 8.8.2 — labour rights compliance |
| **UN SDG API — Gender Equity** | `unstats.un.org/SDGAPI` | SDG 5.5.2 — women in management; SDG 5.c.1 — gender-responsive budgeting; SDG 8.5.1 — earnings parity |

### Governance (G)
| Source | API | Metrics |
|---|---|---|
| **IMF** | `dataservices.imf.org` | Consumer Price Index (CPI) — economic stability proxy |
| **OECD** | `sdmx.oecd.org` | GDP data — economic governance indicator |
| **SEC EDGAR** | `data.sec.gov` | Corporate governance disclosures (XBRL company facts) |

---

## Social Score Composition

The Social (S) score is a proprietary weighted composite across four sub-dimensions, drawing on OHCHR Universal Periodic Review frameworks, WEF Gender Gap Index methodology, and UN SDG data standards:

| Sub-dimension | Source | What it captures |
|---|---|---|
| Human Rights | UN SDG 8.7, 16.1, 16.b | Child labour, safety from violence, non-discrimination, labour rights compliance |
| Education | UN SDG 4.1.1 | Long-run human capital development |
| Gender Equity | UN SDG 5.5, 5.c, 8.5 | Women in management, earnings parity, gender-responsive institutional frameworks |
| Health | UN SDG 3 | Population wellbeing baseline |

The weighting model is proprietary intellectual property. Full methodology documentation is available to approved institutional partners under NDA — contact [beta@untitledfinancial.com](mailto:beta@untitledfinancial.com).

---

## Fee Formula

```
esgFee = (100 - avgScore) / 200
```

| Score | Fee | Tier |
|---|---|---|
| 100 | 0.000% | Excellent |
| 90 | 0.050% | Excellent |
| 75 | 0.125% | Good |
| 50 | 0.250% | Average |
| 25 | 0.375% | Below Average |
| 0 | 0.500% | Poor |

The on-chain contract, oracle, and API always apply the same formula consistently.

---

## ESG Redistribution Mechanism

**100% of ESG fee revenue is redistributed to verified on-chain impact programs.** This is enforced by the `DPXSettlementRouter` contract — it is not discretionary.

### Distribution

| Program | Share | Rationale |
|---|---|---|
| Ocean Conservation | 30% | Largest share — oceans absorb ~30% of CO2 |
| Renewable Energy | 25% | Direct emissions reduction |
| Forest Preservation | 20% | Carbon sequestration and biodiversity |
| Climate Action | 15% | Broad climate mitigation programs |
| Clean Water | 10% | Social / SDG 6 alignment |

### How it works on-chain

1. Counterparty's E, S, G scores are fetched from the oracle at settlement time
2. `DPXSettlementRouter.settle()` computes `esgFee = (100 - avgScore) / 200`
3. The ESG fee amount is transferred to the redistribution contract
4. The redistribution contract routes funds to five verified program addresses according to fixed percentage weights
5. Each redistribution is recorded in a Storacha (IPFS) proof with: tx hash, per-program amounts, period dates, and total redistributed

The program addresses and percentage splits are set at contract deployment and can only be changed via on-chain governance — not by Untitled Financial unilaterally.

### Impact at scale

| Annual Volume | ESG Fee Pool (score 75) | Per Program |
|---|---|---|
| $100M | $125K | $37.5K (Ocean) / $31.25K (Renewable) |
| $1B | $1.25M | $375K (Ocean) / $312.5K (Renewable) |
| $5B | $6.25M | $1.875M (Ocean) / $1.5625M (Renewable) |
| $12B (Year 10) | $15M+ | $4.5M+ (Ocean) / $3.75M+ (Renewable) |

Every redistribution is verifiable on-chain and on IPFS. Any agent, auditor, or regulator can independently confirm funds reached the programs.

---

## Live Endpoint

```bash
GET https://esg.untitledfinancial.com/esg-score
```

Returns the current E, S, G scores, composite average, active fee rate, and tier label. Use `scores.average` as the `esgScore` parameter in settlement quotes on the Stability Oracle.

---

