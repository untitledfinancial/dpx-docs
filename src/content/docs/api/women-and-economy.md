---
title: Women and economic position
description: Country-level indicators of women's economic position, and company-reported pay gap and board data for individual issuers. Every figure carries its source, year, scope and limits, and a missing record is never filled in.
---

These endpoints answer two questions with public data: where women stand economically in a country, and what a specific company has reported about its own workforce, pay and board. They are built to be read by an analyst or an agent without guessing what a number means: every figure names its source, its year, the legal entity it covers, and whether it was measured, reported, modelled or derived.

**Base URL:** `https://intelligence.untitledfinancial.com` · **Auth:** x402 (USDC on Base) or API key.

## What this is not

- It does not measure women's wealth. Gender-split wealth is not measured globally. The closest measured series, women's ownership of houses and land, comes from household surveys that exist only for some low- and middle-income countries, and is reported as such.
- It is not a score of a company, and there is no single "women score" anywhere in these responses. Pillars and indicators are shown separately.
- It is not a legal-rights index. The Women, Business and the Law index is not yet integrated, and every country response says so.

## Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /v1/intelligence/women-country?country=KEN` | One country: financial access, participation and leadership, and asset ownership, with values, years and percentiles |
| `GET /v1/intelligence/women-entity?lei=…` | One issuer (`isin`, `cusip`, `figi`, `ticker` with `exchange`, `cik` or `lei`): its own reported pay gap and board record, and its subsidiaries' pay gap records |
| `POST /v1/intelligence/portfolio` | The same evidence for up to 50 holdings, with a `women` block per holding and in the rollup. See [Portfolio and country reports](/api/portfolio-and-country/) |
| `GET /v1/intelligence/entity/sfdr-dashboard?lei=…` | SFDR indicators 12 (unadjusted gender pay gap) and 13 (board gender diversity), filled from the records below |

Identifiers that cannot be matched to a legal entity return `422` and are not charged. A country code that matches nothing, or a data source that cannot be reached, also returns without charge.

## Country: `women-country`

Three pillars, each the mean of its available indicator scores, shown beside the raw values. A pillar needs at least half of its indicators.

| Pillar | Indicators | Basis |
|---|---|---|
| Financial access | Women with a financial-institution or mobile-money account; the gap between men's and women's account ownership (same survey year only) | Survey |
| Participation and leadership | Female-to-male labour-force participation ratio; female share of senior and middle management; firms with a female top manager; firms with female participation in ownership; women in national parliament | Modelled estimate, administrative, survey |
| Asset ownership | Women who do not own a house; women who do not own land | Household survey, low- and middle-income countries only |

For each indicator the response gives the value, the survey year, the unit, its basis, a global percentile (100 is better for women) and a percentile within the country's income group. Indicators older than their allowed age are excluded and listed under `missing` with a reason (`NO_DATA`, `STALE` or `SOURCE_UNAVAILABLE`). A country with no household survey gets no asset-ownership pillar rather than an estimate.

`quality` states how complete the response is, which sources were used and which indicators are missing. `notIntegrated` lists what a complete profile would contain and this one does not.

## Issuer: `women-entity`

The identifier is resolved to a legal entity (LEI), and that LEI is looked up in two indexes of statutory, employer-reported data. Each index joins a regulator's public file to GLEIF, and says what it covers.

### United Kingdom: gender pay gap

UK employers with 250 or more staff must publish their gender pay gap each year. A record gives the mean and median hourly gap, the bonus gaps, the share of each pay quartile that is women, and the employer's size band.

- A positive gap means women are paid less on average. It compares all men with all women in the entity, not like-for-like roles.
- A record covers **one legal entity's UK employees** for one April pay period. It is not a group or global figure.
- `status` is `REPORTED` when the entity itself filed, `REPORTED_BY_SUBSIDIARIES` when UK employing subsidiaries linked to it in GLEIF filed instead, or `NOT_REPORTED`.
- Subsidiary records are listed as filed and summarised only as a range. They are never averaged into a group figure: the source gives headcount only as a size band, so a fair weighting is not possible.

### Australia: workforce and governing body

Australian employers with 100 or more staff report to the Workplace Gender Equality Agency every year. A record gives women and men counts for all employees, for managers and for executive-level occupations, and the gender composition of the employer's governing body.

- A governing body is the chair plus the members excluding the chair, which is how the Agency's questionnaire counts them. `womenSharePct` is women as a share of that total.
- The ratio is produced only when **exactly one chair** is recorded. Co-chairs or a missing chair make the board size ambiguous, so the counts are returned with status `CHAIR_COUNT_NOT_ONE` and no ratio. If the employer left any of the four counts blank, the status is `COUNTS_MISSING`, which is different from `NOT_REPORTED` (no record at all).
- The public file contains no pay gap figures, so none are reported for Australia.

### Reading `NOT_REPORTED`

Most issuers return `NOT_REPORTED` for both regimes. That is a statement about coverage, not about the company: it may be outside the regime, below its size threshold, or have a registration number that could not be matched to an LEI with the legal names agreeing. The response says which regime was checked. `boardGenderDiversity` follows the same rule: `NOT_REPORTED` where no record exists, and a country figure is never substituted for a company's board.

## SFDR indicators

In the SFDR sustainability indicator list (Annex I, Table 1), indicator 12 is the average unadjusted gender pay gap and indicator 13 is board gender diversity. In the dashboard:

- **Indicator 12** is the entity's own UK **mean** hourly gap, because the indicator is defined from average earnings. It is `DISCLOSED` only when the entity itself filed one report. Subsidiary-only coverage, several records, or no record leave it `UNAVAILABLE`, with the records or their range in `detail`.
- **Indicator 13** is women as a share of the entity's own board, from the Australian record, and `UNAVAILABLE` otherwise.
- Country-level participation data appears as a separate context indicator, `GENDER_GAP_COUNTRY_CONTEXT`. It is never used as the value of either indicator.
- Risk bands on these two indicators are display bands, not regulatory thresholds.

## Portfolio

Each holding gets its UK pay gap status (figures only when its own LEI filed one report), its board status, and its country's pillar scores. The rollup reports an investment-weighted mean of the pay gap and of the board share over the holdings that have a usable record, always with `reportedValuePct`, the share of portfolio value it covers. Holdings without a record are counted and excluded; no value is assumed for them. The audit CSV carries the same fields.

## Data sources and licences

| Source | Used for | Licence |
|---|---|---|
| World Bank Open Data (Global Findex, World Development Indicators, Enterprise Surveys, Demographic and Health Surveys, ILO and Inter-Parliamentary Union series) | Country indicators | The World Bank licenses datasets under CC BY 4.0 by default; series from third-party providers can carry other labelled terms, which are cited in the World Bank's own metadata |
| UK Government gender pay gap service | UK pay gap records | Open Government Licence v3.0 |
| Workplace Gender Equality Agency, WGEA Dataset (data.gov.au) | Australian workforce and governing body records | Creative Commons Attribution 3.0 Australia |
| GLEIF | Identifiers, legal names, parent links | Open data |

Records from the UK and Australian sources are joined to LEIs by DPX, and the agencies do not endorse DPX or its products. Attribution text is returned with every response that uses them.

## Limits

- Two disclosure regimes are integrated. Pay gap data exists only for the United Kingdom and board data only for Australia.
- Each record covers one legal entity. Nothing here is a group, global or like-for-like figure.
- Only employers whose registration number has an LEI with a matching legal name can be matched. The `coverage` block in each response gives the size of each index.
- The UK and Australian indexes are rebuilt when each regulator publishes a new year, so the snapshot year in each response is the one to read.
- Survey series publish every few years. The year on each indicator is part of its meaning.
- Percentile scores are relative: they move when other countries move, and income level correlates with most of these indicators, so read the income-group percentile beside the global one.

## Superseded: `gender-risk`

`GET /v1/intelligence/gender-risk` is superseded by `women-country`, which uses measured indicators for about 190 countries. It remains available for its modelled violence-prevalence and GDP-drag views of 18 countries, and answers with `Deprecation` and `Link: …; rel="successor-version"` headers.
