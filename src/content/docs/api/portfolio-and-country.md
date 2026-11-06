---
title: Portfolio and country reports
description: Holdings in, a source-labelled sustainability report out — plus country-level E/S/G scores and a single-issuer evidence panel. Every figure carries its source, vintage and limits.
---

These endpoints turn identifiers and exposures into a sustainability report an analyst or an agent can use directly. They are built on public data and state, in every response, what each figure is and what it is not.

**Base URL:** `https://intelligence.untitledfinancial.com` · **Auth:** x402 (USDC on Base) or API key.

## Endpoints

| Endpoint | Purpose |
|---|---|
| `POST /v1/intelligence/portfolio` | Up to 50 USD holdings in, report out |
| `GET /v1/intelligence/portfolio/run/:runId` | Fetch a stored run. `?format=csv` for an audit file, `?compareTo=<earlierRunId>` for changes between two runs |
| `POST /v1/intelligence/portfolio/watch` | Re-run a stored portfolio nightly; signed webhook on material change (API key, paid tier) |
| `DELETE /v1/intelligence/portfolio/watch/:id` | Stop watching |
| `GET /v1/intelligence/entity/evidence` | The same evidence for one issuer |
| `GET /v1/intelligence/country-profile?country=DEU` | Country-level E/S/G percentile scores |

Identifiers that cannot be matched to a legal entity are returned as unresolved and are not charged. If none resolve, the call returns `422` and nothing is charged.

## Request

```json
{
  "name": "Book A",
  "currency": "USD",
  "holdings": [
    { "id": "US0378331005", "value": 2000000 },
    { "id": "NO0010096985", "value": 1500000, "sector": "oil_gas", "evicUsd": 90000000000 },
    { "id": "7203", "idType": "TICKER", "exchange": "JT", "value": 750000 }
  ],
  "carbonPricesUsd": [50, 100, 200],
  "scenarios": [
    { "name": "Imported path", "source": "scenario set and retrieval date", "carbonPriceUsdPerT": { "2030": 120, "2040": 250 } }
  ]
}
```

- **Values are USD.** Other currencies are rejected, not converted.
- **`id`** can be an ISIN, CUSIP, FIGI, ticker, CIK or LEI. ISINs and LEIs resolve worldwide. A non-US ticker needs `exchange` (an OpenFIGI exchange code such as `JT`, `LN`, `GR`).
- **Sector.** Best supplied by you (`sector` or `naics`). When omitted it is suggested from the SEC SIC code for US registrants, or from industry codes in Wikidata (ISIC/NACE) for companies elsewhere, and the source is labelled on the holding with a lower confidence. A holding with no sector from any of these gets no emissions estimate and is left out of emissions totals. It is never given a default.
- **`evicUsd` / `revenueUsd`** switch a holding to enterprise-value attribution (exposure ÷ enterprise value, capped at 1).
- **`scenarios`** are carbon-price paths you supply (up to 5, 1–12 years each, 2025–2100, USD per tCO2e). DPX supplies no scenario data and does not verify what you import; the report records the `source` you give.

## Response

Each report carries a `runId` (stored 30 days), a `vintage` stamp, and `dataVintage` describing the data behind it.

- **Per holding:** resolution (type, confidence, method, sources); legal entity (LEI, name, legal-address country); sector and where it came from; sector-average financed emissions with a low–high range and intensity; a sector-level taxonomy screen; country scores; sanctions screening; company-reported emissions where available; and `flags`.
- **Rollup:** coverage by value for each kind of data, financed emissions total and range, weighted-average carbon intensity, fossil-fuel exposure, taxonomy shares, country exposure, sanctions counts, top contributors, carbon-price sensitivity and scenario paths. **Every rollup states the share of portfolio value it covers.**

### Four kinds of emissions evidence, kept apart

1. **Sector-average estimate** (all holdings with a sector). US EPA supply-chain factors, median of the sector's industries, applied to the exposure. A screening figure, not company data. Non-US issuers use US-industry factors and are flagged `FACTOR_BASIS_US_INDUSTRY`.
2. **Company-reported emissions** (US facilities). From the US EPA Greenhouse Gas Reporting Program: direct emissions that facilities above the reporting threshold are legally required to report, by highest-level US parent company with reported ownership percentages. With `evicUsd` the report also gives the holding's attributed share. Scope 1 only, US facilities only; a foreign group's US subsidiary is listed under its own name; EPA notes ownership percentage does not necessarily equal the share of emissions a parent is responsible for. No match says nothing about a company's emissions.
3. **Regional direct estimate** (EU member states and a few European countries). Eurostat air-emissions accounts divided by output for the holding's sector in its legal-address country, applied to the same exposure. Direct (scope 1) emissions only, so it has a different basis from the US cradle-to-gate factors in (1). It covers electricity, gas and steam, which the US source does not. A branch average for that country, not company data.
4. **Scenario analysis** (your carbon-price paths). Financed emissions × price per year, with emissions held constant. A gross notional figure, not a stress test.

These are shown side by side and **never added together**.

## Country profile

`GET /v1/intelligence/country-profile?country=DEU` returns environmental, social and governance percentile scores for about 200 economies from World Bank open data (WDI and WGI). Each indicator is ranked among all countries with fresh data; scores are relative, not absolute. Because wealth and these indicators correlate strongly, every score is also given relative to the country's World Bank income group (`incomeGroupScore`). This is a country-level view, not a score of any company.

## Runs, history and watches

Runs are stored for 30 days under an unguessable id and are readable only by the account that created them, so treat the id as a secret. `?compareTo=` lists changes between two runs; `?format=csv` returns an audit file with the vintage, data sources and per-holding screening timestamps.

A watch re-runs a stored portfolio nightly and sends a signed `POST` only when a change is material (defaults: financed emissions ±10%, carbon intensity ±10%, country score ±5 points, a new sanctions review or block, a newly unresolved holding). Deliveries carry `X-DPX-Timestamp` and `X-DPX-Signature: sha256=HMAC(secret, "<timestamp>.<body>")`. Webhooks must be https on a public domain name. The nightly job has a fixed budget, so very large workloads may be checked less often than daily.

## Limits

1. Sector-average estimates are the weakest tier of PCAF data quality. They do not replace company-reported emissions.
2. The EPA factors describe US industries in 2022 dollars (cradle-to-gate, scopes not separable) and do not cover electricity generation.
3. Derived sectors are coarse suggestions: a registrant's activity code describes the company as a whole, and a company with no usable code gets none.
4. Parent links used in sanctions screening are accounting-consolidation relationships, not ownership percentages, so the 50%-ownership rule is not evaluated.
5. The sanctions name index covers OFAC, UK and UN lists; the EU list is not included, and matching is token overlap without phonetic or transliteration matching.
6. Country scores describe the entity's legal-address country, not where it operates.
7. Taxonomy classification and fossil-fuel exposure are sector-derived indicators, not activity or revenue data.
8. Tickers and CIKs resolve by name matching and can fail; prefer ISIN or LEI.
9. No service-level agreement is offered.
