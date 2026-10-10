---
title: Data lineage and methodology
description: Where each Intelligence API endpoint's data comes from, how it is computed, and what it does not cover. Verified against the source, not marketing copy.
---

This page lists the external data each Intelligence API module actually calls, and the stated limits of each output. It was compiled from the module source on 2026-10-10 and is meant for diligence and procurement reviews.

Two rules apply throughout:

- **Free public data.** Every upstream source below is a free or public API. DPX does not resell licensed ratings or proprietary vendor datasets.
- **Estimates are labelled as estimates.** Where an output uses a static reference table or a neutral fallback, the response says so in its `methodology` and `limitations` fields.

## Upstream sources by endpoint

| Endpoint | External sources called |
|---|---|
| `macro-stress` | FRED (St. Louis Fed) |
| `currency-stress` | FRED |
| `fx-settlement` | FRED |
| `sovereign-debt` | FRED · European Commission data |
| `commodity` | FRED · a public Ethereum RPC node |
| `shipping-stress` | U.S. EIA · FRED |
| `energy-transition` | U.S. EIA |
| `supply-chain` | Open-Meteo · NOAA Tides and Currents · USGS water services · German WSV Pegelonline · New York Fed |
| `climate` | Open-Meteo (historical archive) |
| `climate-pulse` | Open-Meteo (forecast and archive) |
| `earth-systems` | NASA GISS · NOAA GML (CO₂, CH₄) · NASA FIRMS · Open-Meteo marine · NSIDC sea ice |
| `water-risk` | NOAA NCEI |
| `biodiversity` | IUCN Red List · World Bank · FRED |
| `cascade` | ACLED · GDELT · FRED · World Bank · IMF · ArcGIS-hosted layers |
| `instability` | FRED · U.S. BEA · European Commission · ECB · IMF |
| `mycelium` | FRED · IMF · BIS |
| `political-risk` | FRED · World Bank · the published Caldara-Iacoviello geopolitical risk index |
| `gender-risk` | FRED · World Bank · WHO Global Health Observatory |
| `esg/:address` | GLEIF · U.S. EPA ECHO · U.S. OSHA |
| `defi-glossary` / `defi-research` | BIS · ECB · Federal Reserve · FSB · SWIFT · EUR-Lex · MIT Digital Currency Initiative |
| `48h-call` | DPX Commodity Forecast service |
| `butterfly` | DPX Settlement Agent service |

Modules not listed here (`composite`, `synthesis`, `transition-risk`, `tectonic`, `aftershock`, `contagion`, `resonance`, `sfdr-dashboard`, `financed-emissions`, `taxonomy-alignment`, `tnfd-report`, `causal-graph`) contain no external data hosts of their own in the source. They compose other DPX signals or apply reference tables.

## How outputs are computed

| Output type | Endpoints | What that means |
|---|---|---|
| Direct indicator readings | `macro-stress`, `currency-stress`, `energy-transition`, `earth-systems` | Public time series read and scored; the underlying numbers come from the cited source. |
| Composed scores | `composite`, `synthesis`, `instability`, `cascade` | Weighted combinations of the signals above. The weights are DPX's own and are not a third-party standard. |
| Simulation and propagation models | `butterfly`, `tectonic`, `aftershock`, `contagion`, `resonance` | DPX's own models. Outputs are scenario signals, not forecasts of record. |
| Reference-table estimates | `financed-emissions`, `taxonomy-alignment` | Sector factors from a static, order-of-magnitude table. Not a licensed PCAF, EPA or DEFRA database. |
| Packaged pre-screens | `tnfd-report`, `sfdr-dashboard` | Existing signals arranged into a disclosure framework. Macro level, not entity or facility level. |

## Known limits worth stating up front

- **Sector-based endpoints trust the caller.** `financed-emissions` and `taxonomy-alignment` use a sector you supply. It is not verified against a registry, and when omitted the result is marked low confidence or `NOT_ASSESSED`.
- **`financed-emissions` attribution is fixed at 1.0.** True PCAF attribution needs the counterparty's total balance-sheet exposure, which DPX does not have.
- **`taxonomy-alignment` does not assess DNSH.** `dnshAssessed` is always `false`. Only Climate Change Mitigation is classified.
- **`tnfd-report` is macro-level.** It reuses the biodiversity, water-risk and supply-chain signals. If one of them is unavailable at request time its index falls back to a neutral 50 and the report says so.
- **Entity ESG (`esg/:address`) covers what the public registries cover.** Entity resolution uses GLEIF, and the environmental and safety signals come from EPA ECHO and OSHA records. Entities outside those registries may return a partial result.
- **Upstream outages can degrade a result.** Several modules continue with the inputs that responded or fall back to a neutral value. Check the response fields rather than assuming a fully populated score.

## Corrections to earlier documentation

On 2026-10-10 the source was compared with the published endpoint pages. The `biodiversity` page previously listed GBIF, NASA MODIS land cover and USGS land-use change as data sources. The module's code makes three external calls (IUCN Red List species counts, a World Bank forest-area indicator, and a FRED series) and none to GBIF, MODIS or USGS. The endpoint page has been corrected to match.

## Compliance screening coverage

The Compliance Oracle screens names (and, separately, wallet addresses) against government sanctions lists held in DPX's own index, and screens individuals for politically exposed person (PEP) status through Wikidata. Counts below were read from the production index on 2026-10-10.

| List | Entries | Programs | Most recent update in index |
|---|---|---|---|
| OFAC SDN | 19,534 | 68 | 2026-10-09 |
| UK Sanctions List | 5,878 | 31 | 2026-10-08 |
| UN Security Council | 1,011 | 1 | 2026-09-28 |

What this does **not** cover:

- **The EU consolidated list is not included.** Automated access to it is not available to DPX today, so entities listed only by the EU are not screened.
- **Matching is name-token overlap against the normalized name.** There is no phonetic or transliteration matching, so variant spellings of the same name may be missed.
- **PEP screening uses Wikidata only.** It is not a commercial PEP database, and it does not include adverse-media screening.
- **Entry counts are rows in DPX's name index.** They may not equal the number of distinct listed parties.

Treat DPX screening as a first line for agent-payment flows. It does not replace a regulated institution's own sanctions program.

## Verifying a claim yourself

- The `methodology` and `limitations` fields in each response restate the points above for that call.
- `GET /v1/intelligence/ledger` is free and shows the prediction ledger. Predictions resolve over 30, 60 and 90-day horizons and are scored as they do. At the time of writing, no predictions have resolved yet, so the ledger shows pending items and no accuracy figures. Check it directly instead of relying on this page.
- `GET /.well-known/x402` lists every paid endpoint and price currently served.
