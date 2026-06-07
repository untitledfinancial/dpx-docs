---
title: Intelligence API
description: Per-call macro, climate, geopolitical, ESG, and systemic risk intelligence — x402 micropayments and API key access on intelligence.untitledfinancial.com.
---

Standalone per-call data product. 15 intelligence endpoints covering climate, planetary health, credit stress, supply chain, energy transition, entity ESG, financial shock cascades, structural geopolitical instability, commodity markets, sovereign debt, physical water risk, financial network topology, G10/EM currency stress, and TNFD-aligned nature risk.

**Base URL:** `https://intelligence.untitledfinancial.com`

**Auth:** x402 micropayments (USDC on Base) or API key — both accepted on every paid endpoint.

---

## Authentication

### x402 — crypto-native, no account required

Call any paid endpoint without headers. You'll receive a `402 Payment Required` with `paymentRequirements`. Attach a signed USDC payment as the `X-PAYMENT` header and retry.

```bash
# Step 1 — get payment requirements
curl https://intelligence.untitledfinancial.com/v1/intelligence/cascade
# → 402 with paymentRequirements

# Step 2 — pay and retry
import { withPaymentInterceptor } from 'x402-fetch';
import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';

const wallet = createWalletClient({ chain: base, transport: http() });
const fetchWithPayment = withPaymentInterceptor(fetch, wallet);

const res = await fetchWithPayment(
  'https://intelligence.untitledfinancial.com/v1/intelligence/cascade'
);
```

Payment asset: USDC (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`) on Base mainnet.

### API key — traditional

Pass `X-API-Key: <your-key>` on any paid endpoint. Rate limit headers returned on every response: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

```bash
curl https://intelligence.untitledfinancial.com/v1/intelligence/instability \
  -H "X-API-Key: your-key-here"
```

---

## Pricing

| Endpoint | Price | Cache | Category |
|---|---|---|---|
| `/v1/intelligence/macro-stress` | $0.15 | 1h | Financial |
| `/v1/intelligence/climate` | $0.25 | 24h | Climate |
| `/v1/intelligence/climate-pulse` | $0.25 | 3h | Climate |
| `/v1/intelligence/supply-chain` | $0.25 | 6h | Physical |
| `/v1/intelligence/energy-transition` | $0.25 | 24h | Physical |
| `/v1/intelligence/esg/:address` | $0.25 | 6h | Compliance |
| `/v1/intelligence/commodity` | $0.25 | 6h | Financial |
| `/v1/intelligence/sovereign-debt` | $0.25 | 12h | Financial |
| `/v1/intelligence/water-risk` | $0.25 | 12h | Physical |
| `/v1/intelligence/earth-systems` | $0.50 | 48h | Planetary |
| `/v1/intelligence/instability` | $0.50 | 24h | Geopolitical |
| `/v1/intelligence/mycelium` | $0.50 | 6h | Systemic |
| `/v1/intelligence/currency-stress` | $0.25 | 3h | Financial |
| `/v1/intelligence/biodiversity` | $0.25 | 24h | Compliance |
| `/v1/intelligence/cascade` | $0.75 | 2h | Financial |

Oracle feeds are **free** — no payment required.

---

## GET /v1/intelligence/climate — $0.25

50-year structural precipitation shift analysis across 10 global agricultural zones. Compares 2021–2023 vs 1972–1974 (ERA5 baseline). Maps anomalies to commodity exposure, food inflation cascades, migration pressure, and basket implications.

**Data source:** Open-Meteo Historical Archive (ERA5 reanalysis, 1940–present)

**Regions:** US Great Plains, US Corn Belt, Amazon/Cerrado, Sahel, South Asia (Ganges), Southeast Asia (Mekong), Murray-Darling, Central Asia (Aral Basin), East Africa, Mediterranean

**Response headers:** `X-DPX-Climate-Score` · `X-DPX-Cache-Hit` · `X-DPX-Generated`

```json
{
  "generatedAt": "2026-05-15T12:00:00Z",
  "cacheHit": false,
  "summary": {
    "globalFoodSystemRisk": "ELEVATED",
    "regionsAtRisk": 4,
    "criticalCommodities": ["wheat", "corn", "rice"],
    "cascadeSignals": ["Food inflation lead signal: ACTIVE"]
  },
  "regions": [
    {
      "name": "Sahel",
      "precipitationShiftPct": -31.2,
      "classification": "CRITICAL",
      "commodities": ["millet", "sorghum"]
    }
  ],
  "transmission": {
    "foodInflationPressure": "HIGH",
    "migrationPressure": "ELEVATED"
  }
}
```

---

## GET /v1/intelligence/earth-systems — $0.50

Planetary health dashboard with 50–100 year historical context. Earth Health Index (0–100) and proximity assessment for 9 known climate tipping points.

**Data sources:** NASA GISTEMP v4 (temp anomaly, 1880–present) · NOAA GML (CO₂ + CH₄, Mauna Loa) · NSIDC Arctic Sea Ice Index v3

**Response headers:** `X-DPX-Earth-Health-Index` · `X-DPX-Cache-Hit` · `X-DPX-Generated`

```json
{
  "sustainability": {
    "earthHealthIndex": 61,
    "planetaryStatus": "ELEVATED",
    "tippingPointAlert": "3 of 9 tipping points at HIGH or IMMINENT proximity"
  },
  "atmosphere": {
    "co2": { "currentPpm": 424.5, "signal": "CRITICAL" },
    "temperature": { "currentAnomalyC": 1.29, "distanceToParisC": 0.21 }
  },
  "tippingPoints": [
    { "name": "West Antarctic Ice Sheet", "proximityRisk": "IMMINENT", "threshold": "1.5°C" }
  ]
}
```

---

## GET /v1/intelligence/macro-stress — $0.15

Credit regime classification using 5 FRED series. Composite stress index (0–100) with lead signals for FX and commodity implications.

**FRED series:** BAMLC0A0CM (IG spreads) · BAMLH0A0HYM2 (HY spreads) · TEDRATE (TED spread) · VIXCLS (VIX) · DRTSCILM (C&I tightening)

**Regimes:** `EXPANSION` · `LATE_CYCLE` · `STRESS` · `CRISIS`

**Response headers:** `X-DPX-Stress-Index` · `X-DPX-Regime`

```json
{
  "stressIndex": 42,
  "regime": "LATE_CYCLE",
  "components": {
    "igSpread": { "value": 1.32, "signal": "WATCH" },
    "hySpread": { "value": 4.85, "signal": "ELEVATED" },
    "vix": { "value": 22.1, "signal": "WATCH" }
  },
  "leadSignals": {
    "fxImplication": "USD strength pressure on EM carries",
    "lookAheadWeeks": 6
  }
}
```

---

## GET /v1/intelligence/supply-chain — $0.25

Global shipping lane bottleneck scoring. NY Fed GSCPI combined with live water level data from four critical chokepoints.

**Data sources:** NY Fed GSCPI · WSV Pegelonline (Rhine/Kaub) · USGS (Mississippi/Memphis) · Open-Meteo (Panama Canal watershed) · NOAA CO-OPS (Great Lakes)

**Response headers:** `X-DPX-GSCPI` · `X-DPX-Regime`

```json
{
  "gscpiZScore": 1.24,
  "regime": "MODERATELY_STRESSED",
  "waterLevels": {
    "rhineKaub": { "levelCm": 112, "status": "LOW_WATER", "bottleneckRisk": "HIGH" },
    "mississippi": { "levelCm": 890, "status": "NORMAL", "bottleneckRisk": "LOW" }
  },
  "goodsInflationLeadSignal": "BUILDING — 4-6 week lag to CPI goods component"
}
```

---

## GET /v1/intelligence/energy-transition — $0.25

Structural energy shift intelligence. US renewable generation share, fossil demand curve trajectory, and grid carbon intensity by region.

**Data source:** EIA Electric Power Operational Data

```json
{
  "renewableSharePct": 23.4,
  "renewableTrend": "ACCELERATING",
  "fossilDemandCurve": "DECLINING",
  "signal": "ON_TRACK",
  "gridCarbonIntensity": { "us": 386, "eu": 241, "global": 436, "unit": "gCO2/kWh" }
}
```

---

## GET /v1/intelligence/esg/:address — $0.25

Entity-level ESG score from public compliance records. Pass any Ethereum address or 20-character GLEIF LEI.

**Data sources:** GLEIF (legal registration) · EPA ECHO (environmental violations + penalties) · OSHA (workplace incidents + citations)

**Weights:** Environmental 40% · Governance 35% · Social 25%

**Response headers:** `X-DPX-ESG-Score` · `X-DPX-ESG-Tier`

```bash
curl https://intelligence.untitledfinancial.com/v1/intelligence/esg/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984 \
  -H "X-API-Key: your-key"
```

```json
{
  "esgScore": 68,
  "tier": "ACCEPTABLE",
  "components": {
    "environmental": { "score": 72, "violations": 0, "riskLevel": "LOW" },
    "governance": { "score": 65, "riskLevel": "MODERATE" },
    "social": { "score": 70, "incidents": 1, "riskLevel": "LOW" }
  },
  "flags": [],
  "recommendedTier": "TIER_1 — preferred terms"
}
```

---

## GET /v1/intelligence/cascade — $0.75

**Shock Cascade — 7-layer financial shock propagation model**

Models how exogenous shocks move through the global financial system across 7 interconnected layers. Identifies what is already priced in, surfaces unpriced downstream effects, and tracks 8 episodic cascade scenarios.

**7 propagation layers:**

| Layer | Name | Key signals |
|---|---|---|
| L1 | Geopolitical / Exogenous Shock | Conflict events, sanctions, policy shocks |
| L2 | Energy & Commodities | Brent, WTI, gold, natural gas |
| L3 | Trade & Shipping | Baltic Dry Index, GSCPI, shipping lanes |
| L4 | Inflation & Monetary Policy | Breakevens, inflation expectations |
| L5 | Currency & Capital Flows | DXY, EM stress |
| L6 | Credit & Financial Conditions | IG/HY spreads, VIX |
| L7 | Risk Assets & DeFi | Crypto-finance correlation |

**Cascade types detected:**

| Type | Entry | Trigger |
|---|---|---|
| `MIDDLE_EAST_OIL_SHOCK` | L2 | Oil spike >12% + gold flight + shipping disruption |
| `TRADE_WAR_ESCALATION` | L3 | GSCPI >1.5 + Baltic Dry collapse + currency stress |
| `FINANCIAL_CONTAGION` | L6 | HY spreads >600bps + VIX >35 + EM currency stress |
| `FOOD_SUPPLY_CRISIS` | L2 | Climate shock + shipping lane compression + commodity spike |
| `ENERGY_TRANSITION_DISRUPTION` | L2 | Fossil supply disruption + accelerating renewable share |
| `EM_CURRENCY_CRISIS` | L5 | DXY surge >5% + EM debt stress + capital flight |
| `CENTRAL_BANK_POLICY_SHOCK` | L4 | Surprise rate pivot or yield curve inversion |
| `SOVEREIGN_DEBT_CRISIS` | L6 | Spread blowout >600bps + debt-to-GDP threshold + contagion |

**FRED series:** DCOILBRENTEU · DCOILWTICO · GOLDAMGBD228NLBM · DHHNGSP · BDIY · DTWEXBGS · T10YIE · EXPINF1YR

**Response headers:** `X-DPX-Systemic-Risk` · `X-DPX-Cascade-Status` · `X-DPX-Active-Cascades` · `X-DPX-Cache-Hit` · `X-DPX-Generated`

```json
{
  "generatedAt": "2026-05-15T12:00:00Z",
  "nervousSystem": {
    "systemicRiskScore": 67,
    "overallStatus": "ACTIVE_CASCADE",
    "activeCascadeCount": 1,
    "layers": [
      { "layer": 2, "name": "L2 — Energy & Commodities", "status": "SHOCK" },
      { "layer": 3, "name": "L3 — Trade & Shipping", "status": "ELEVATED" }
    ]
  },
  "activeCascades": [
    {
      "type": "MIDDLE_EAST_OIL_SHOCK",
      "label": "Oil Supply Shock — Brent up 14%",
      "confidence": "HIGH",
      "entryLayer": 2,
      "propagation": [
        { "layer": 2, "status": "ACTIVE", "pricedIn": true, "typicalLag": "hours" },
        { "layer": 3, "status": "FORMING", "pricedIn": false, "typicalLag": "days",
          "leadSignal": "Baltic Dry sustained move + GSCPI uptick" },
        { "layer": 4, "status": "EXPECTED", "pricedIn": false, "typicalLag": "4-8 weeks",
          "leadSignal": "10yr breakeven crossing 2.7%" }
      ],
      "unpricedEffects": ["Shipping cost transmission to goods CPI (4-6 week lag)"],
      "historicalAnalog": "2022 Russia-Ukraine energy shock",
      "timelineNarrative": "T+0: Energy repriced. T+1-2 weeks: tanker rerouting. T+4-8 weeks: breakeven move."
    }
  ],
  "unpricedRisks": ["Goods CPI second-derivative not yet in 10yr breakeven"],
  "systemicNarrative": "SYSTEMIC RISK: 67/100. Active cascade: Oil Supply Shock entering trade layer.",
  "earlyWarningSignals": ["Watch Baltic Dry for L3 activation"]
}
```

---

## GET /v1/intelligence/instability — $0.50

**Instability Origins — persistent structural instability intelligence**

Tracks major economies operating in a regime-level instability-generation mode. Unlike Shock Cascade (episodic events with resolution paths), these are structural states — they raise the baseline risk floor and amplify every cascade that fires while active.

**4 structural actors monitored:**

| Actor | Mode | Always present? | Trigger |
|---|---|---|---|
| United States | `TRADE_POLICY_VOLATILITY_AND_DOLLAR_WEAPONIZATION` | When score ≥ 20 | EPU + trade vol + fiscal |
| China | `EXPORT_CONTROLS_AND_CAPITAL_MANAGEMENT` | No | CNY/USD >7.25 or 30d depreciation >2% |
| Russia | `ENERGY_WEAPONIZATION_AND_SANCTIONS_EVASION` | Yes (since 2022-02-24) | Permanent; intensity from energy prices |
| European Union | `FISCAL_FRAGMENTATION_AND_POLITICAL_POLARIZATION` | No | BTP-Bund spread >200bps or EUR 30d decline >3% |

**US composite scores:**

| Score | Range | Composition |
|---|---|---|
| `usInstabilityScore` | 0–100 | EPU index (40%) + trade policy volatility (20%) + dollar weaponization (20%) + EPU trend (20%) |
| `fiscalDominanceScore` | 0–100 | Debt/GDP (40%) + deficit trend (30%) + inflation expectations (30%) |

**Data sources:**

| Series | Actor | Signal |
|---|---|---|
| USEPUINDXM | US | Baker-Bloom-Davis Economic Policy Uncertainty Index |
| BOPGSTB | US | Goods trade balance — tariff shock visible in 6-month swing |
| MTSDS133FMS | US | Monthly federal deficit — trend: DETERIORATING / STABLE / IMPROVING |
| GFDEGDP | US | Federal debt as % of GDP — fiscal dominance threshold >100% |
| DTWEXBGS | US | Trade-weighted USD — dollar weaponization signal |
| GOLDAMGBD228NLBM | US | London gold fix — reserve diversification signal |
| EXPINF1YR | US | 1yr inflation expectations |
| DEXCHUS | China | CNY/USD rate — PBOC intervention / capital pressure proxy |
| DCOILBRENTEU | Russia | Brent crude — energy weaponization intensity proxy |
| DHHNGSP | Russia | Henry Hub natgas — energy market stress co-signal |
| IRLTLT01ITM156N | EU | Italy 10yr yield — BTP-Bund spread numerator |
| IRLTLT01DEZ156N | EU | Germany 10yr yield — BTP-Bund spread denominator |
| DEXUSEU | EU | EUR/USD — currency stress signal |

**US structural scenarios:**

| Type | Trigger |
|---|---|
| `US_POLICY_INSTABILITY` | EPU HIGH or EXTREME + usInstabilityScore ≥ 30 |
| `US_FISCAL_DOMINANCE_RISK` | Debt/GDP >100% + deficit deteriorating or inflation >2.5% + fiscalDominanceScore ≥ 30 |

**Intensity levels:**

| Level | Condition |
|---|---|
| `ACUTE` | usInstabilityScore ≥ 70 or fiscalDominanceScore ≥ 70 |
| `ELEVATED` | ≥ 45 on either score |
| `MODERATE` | ≥ 20 on either score |
| `LOW` | Below thresholds |
| `NONE` | No data available |

**Response headers:** `X-DPX-US-Instability` · `X-DPX-Fiscal-Dominance` · `X-DPX-Instability-Intensity` · `X-DPX-Cache-Hit` · `X-DPX-Generated`

```json
{
  "generatedAt": "2026-05-15T12:00:00Z",
  "usInstabilityScore": 74,
  "fiscalDominanceScore": 58,
  "overallIntensity": "ACUTE",
  "origins": [
    {
      "actor": "United States",
      "mode": "TRADE_POLICY_VOLATILITY_AND_DOLLAR_WEAPONIZATION",
      "intensity": "ACUTE",
      "ongoingSince": "2025-01-20",
      "keySignals": [
        "EPU index: 312 (EXTREME)",
        "Debt/GDP: 124.3%",
        "Federal deficit trend: DETERIORATING",
        "DXY 30d: +3.2%",
        "Gold 30d: +8.1%"
      ],
      "absorptionOutlook": "LOW",
      "historicalComparisons": [
        "2018-19 trade war — EPU peaked 250+",
        "1971 Nixon shock — unilateral USD regime change",
        "2022 SWIFT exclusion — reserve diversification acceleration"
      ]
    },
    {
      "actor": "Russia",
      "mode": "ENERGY_WEAPONIZATION_AND_SANCTIONS_EVASION",
      "intensity": "MODERATE",
      "ongoingSince": "2022-02-24",
      "keySignals": [
        "Sanctions regime ongoing since Feb 2022",
        "Brent crude: $82.4/bbl",
        "Brent 30d: +4.1%"
      ],
      "absorptionOutlook": "LOW"
    }
  ],
  "scenarios": [
    {
      "type": "US_POLICY_INSTABILITY",
      "label": "US Policy Instability — Regime-Level Uncertainty Export",
      "confidence": "HIGH",
      "entryLayer": 1,
      "propagation": [
        { "layer": 1, "status": "ACTIVE", "pricedIn": true,
          "evidence": "EPU at 312 — classified EXTREME" },
        { "layer": 3, "status": "FORMING", "pricedIn": false,
          "leadSignal": "US import price index, container rerouting (China→Vietnam→US)" },
        { "layer": 4, "status": "FORMING", "pricedIn": false,
          "leadSignal": "Core goods CPI acceleration" }
      ],
      "unpricedEffects": [
        "Full tariff pass-through to consumer goods CPI (3-6 month lag)",
        "Central bank reserve diversification reducing USD demand structurally"
      ],
      "historicalAnalog": "2025 Trump tariff escalation, 2018 trade war, 1971 Nixon shock",
      "timelineNarrative": "Persistent regime. Trade pass-through develops 1-3 months. Currency/capital effects forming. Resolution requires multi-quarter policy consistency."
    }
  ],
  "dataAsOf": {
    "epuDate": "2026-04-01",
    "tradeDate": "2026-04-15",
    "deficitDate": "2026-04-30"
  },
  "systemicNarrative": "US at ACUTE instability (74/100). Fiscal dominance elevated (58/100). Russia permanent sanctions regime at MODERATE energy intensity. Both structural — no near-term resolution path.",
  "watchList": [
    "FOMC communications for 'unusual uncertainty' language",
    "TIC data for foreign UST holding drawdowns",
    "BRICS trade settlement in non-USD currencies"
  ]
}
```

---

## GET /v1/intelligence/climate-pulse — $0.25

Near-real-time temperature anomaly and drought conditions across 8 US economic regions. Updated every 3 hours. Maps conditions to commodity supply, energy demand, and labor productivity impacts.

**Regions:** Pacific Northwest · California · Southwest · Mountain West · Great Plains · Midwest · Southeast · Northeast

**Response headers:** `X-DPX-Climate-Signal` · `X-DPX-Heat-Regions` · `X-DPX-Drought-Regions` · `X-DPX-Cache-Hit` · `X-DPX-Generated`

```json
{
  "generatedAt": "2026-06-06T14:00:00Z",
  "cacheHit": false,
  "summary": {
    "overallSignal": "WATCH",
    "regionsWithHeatAnomaly": 3,
    "regionsWithDrought": 2,
    "commoditySignal": "BUILDING — grain and energy demand pressure",
    "laborProductivityImpact": "MODERATE"
  },
  "regions": [
    {
      "name": "Southwest",
      "tempAnomaly": 2.8,
      "droughtSeverity": "EXTREME",
      "commodityImpact": ["citrus", "almonds", "solar generation"],
      "signal": "ALERT"
    }
  ]
}
```

---

## GET /v1/intelligence/commodity — $0.25

Multi-commodity stress index covering energy, agricultural, and critical mineral markets. Returns regime classification, per-commodity analysis, cross-commodity correlation, and a forward inflation lead signal.

**Commodities:** Oil (Brent/WTI) · Natural gas · Gold · Wheat · Corn · Copper

**Regimes:** `CALM` · `MODERATE` · `STRESSED` · `CRISIS`

**Response headers:** `X-DPX-Commodity-Stress` · `X-DPX-Commodity-Regime` · `X-DPX-Cache-Hit` · `X-DPX-Generated`

```json
{
  "generatedAt": "2026-06-06T12:00:00Z",
  "cacheHit": false,
  "stressIndex": 58,
  "regime": "STRESSED",
  "commodities": {
    "oil": { "value": 91.2, "signal": "ELEVATED", "monthlyChange": "+8.4%" },
    "gold": { "value": 2340, "signal": "WATCH", "flightToSafety": true },
    "wheat": { "value": 612, "signal": "STRESSED", "droughtExposure": "HIGH" },
    "copper": { "value": 4.82, "signal": "NORMAL", "demandRegime": "MODERATE" }
  },
  "crossCommoditySignal": "Energy-agriculture correlation elevated — stagflation risk building",
  "inflationLeadSignal": "ACTIVE — 4-6 week lag to CPI goods component",
  "narrative": "Energy and agricultural complex under simultaneous stress. Gold flight-to-safety signal active."
}
```

---

## GET /v1/intelligence/sovereign-debt — $0.25

Debt sustainability and default risk assessment for major sovereigns. Returns debt/GDP trajectories, fiscal deficit trends, yield dynamics, systemic contagion risk, and settlement corridor impact.

**Sovereigns:** United States · European Union · United Kingdom · Japan

**Response headers:** `X-DPX-Sovereign-Regime` · `X-DPX-Cache-Hit` · `X-DPX-Generated`

```json
{
  "generatedAt": "2026-06-06T06:00:00Z",
  "cacheHit": false,
  "systemicSignals": {
    "globalDebtRegime": "FISCAL_STRESS",
    "contagionRisk": "MODERATE",
    "settlementImpact": "USD and JPY corridors carry elevated sovereign risk premium"
  },
  "sovereigns": {
    "US": {
      "debtToGdp": 124.3,
      "fiscalDeficitTrend": "DETERIORATING",
      "yieldDynamic": "BEAR_STEEPENING",
      "sustainabilityScore": 38,
      "signal": "WATCH"
    },
    "Japan": {
      "debtToGdp": 261.0,
      "fiscalDeficitTrend": "STABLE",
      "yieldDynamic": "YCC_PRESSURE",
      "sustainabilityScore": 28,
      "signal": "ELEVATED"
    }
  },
  "narrative": "US and Japan present the largest sovereign debt risks. UK deficit consolidating. EU periphery spread stable but fragile."
}
```

---

## GET /v1/intelligence/water-risk — $0.25

Physical water stress across 6 major economic regions. Drought severity, sector-level exposure mapping, TNFD-aligned physical risk rating, and forward supply chain impact signals.

**Regions:** US Southwest · US Midwest · Western Europe · South Asia · East Asia · Sub-Saharan Africa

**Sectors assessed:** Agriculture · Semiconductors · Beverages · Energy

**Response headers:** `X-DPX-Water-Stress` · `X-DPX-TNFD-Rating` · `X-DPX-Cache-Hit` · `X-DPX-Generated`

```json
{
  "generatedAt": "2026-06-06T06:00:00Z",
  "cacheHit": false,
  "globalStressIndex": 62,
  "regions": {
    "usSouthwest": {
      "droughtSeverity": "EXTREME",
      "stressScore": 84,
      "sectors": {
        "agriculture": "CRITICAL",
        "semiconductors": "HIGH",
        "beverages": "HIGH"
      }
    },
    "southAsia": {
      "droughtSeverity": "MODERATE",
      "stressScore": 58,
      "sectors": { "agriculture": "HIGH", "energy": "MODERATE" }
    }
  },
  "tnfdAlignment": {
    "physicalRiskRating": "HIGH",
    "disclosureRecommendation": "Material physical risk — TNFD LEAP process recommended for water-dependent portfolios"
  },
  "narrative": "US Southwest and South Asia driving elevated global water stress. Semiconductor and agricultural supply chains most exposed."
}
```

---

## GET /v1/intelligence/mycelium — $0.50

**Mycelium Network Oracle — financial system network topology**

Models the global financial system as a living network and detects crisis formation from network topology before it surfaces in market data, typically 6–14 weeks ahead.

**The biological model:** In nature, mycelium threads connect trees, transfer nutrients, propagate stress signals, and reroute around dead zones. The fruiting body (the visible mushroom) is the *last* thing to appear — the crisis you see is the end product of underground processes that began weeks earlier. This oracle maps that structure to financial markets.

| Mycelium | Financial System |
|---|---|
| Nodes | Markets, economies, sectors, funding markets |
| Threads | Capital flow channels, correspondent banking, trade finance |
| Nutrient flow | Liquidity |
| Stress signal | Spread widening, FX stress, credit tightening |
| Dead zones | Sanctioned corridors, failed correspondent networks |
| Fruiting body | The visible crisis — the last thing to surface |

**What makes this distinct from Shock Cascade:** Cascade is reactive — what happens when a shock hits. Mycelium is structural — the health of the network before anything happens. It detects which threads are thinning, where dead zones are forming, and which nodes are under stress 6–14 weeks before the crisis surfaces in market data.

**6 network nodes monitored:**
- US Treasury / Interbank Funding
- EM Dollar Funding
- European Sovereign / Fiscal Nodes
- Global Trade Finance
- Crypto/DeFi Bridge to Traditional Finance
- Asian Capital Flows

**Network regimes:** `HEALTHY` · `THINNING` · `STRESSED_CONNECTIVITY` · `DEAD_ZONE_FORMING` · `FRUITING_BODY_IMMINENT`

**Data sources:** FRED (funding markets, credit spreads, FX) · BIS SDMX API (credit-to-GDP gaps for US/EU/CN) · IMF DOTS (bilateral trade volumes for US/CN)

**Response headers:** `X-DPX-Network-Health` · `X-DPX-Network-Regime` · `X-DPX-Fruiting-Body-Risk` · `X-DPX-Lead-Time-Weeks` · `X-DPX-Cache-Hit` · `X-DPX-Generated`

```json
{
  "generatedAt": "2026-06-06T12:00:00Z",
  "cacheHit": false,
  "networkHealth": 61,
  "regime": "STRESSED_CONNECTIVITY",
  "nodes": {
    "usTreasuryFunding": {
      "name": "US Treasury / Interbank Funding",
      "connectivity": 84,
      "nutrientFlow": "ADEQUATE",
      "stressSignal": "NORMAL",
      "status": "ROBUST",
      "context": "TED spread 0.28% — interbank funding healthy"
    },
    "emDollarFunding": {
      "name": "EM Dollar Funding",
      "connectivity": 42,
      "nutrientFlow": "RESTRICTED",
      "stressSignal": "ELEVATED",
      "status": "THINNING",
      "deadZones": ["RUSSIA_SWIFT_EXCLUSION", "IRAN_CORRESPONDENT_NETWORK"],
      "context": "DXY at 107.2 — dollar elevated; EM funding threads thinning"
    }
  },
  "threadHealth": {
    "thinningThreads": [
      "EM Dollar Funding → Global Trade Finance",
      "DeFi Liquidity → TradFi Risk Markets"
    ],
    "deadZones": ["RUSSIA_SWIFT_EXCLUSION", "IRAN_CORRESPONDENT_NETWORK"],
    "newConnections": [
      "India UPI → Southeast Asia Payment Corridors",
      "Stablecoin Corridors → Cross-Border Settlement (DPX, USDC)"
    ]
  },
  "fruitingBodyRisk": {
    "probability": 0.34,
    "leadTimeWeeks": 10,
    "mostLikelyType": "EM_CURRENCY_CRISIS",
    "underground": "Dollar funding stress in EM corridors has been building for 8 weeks — visible only as modest FX volatility. Network topology suggests fruiting body forming.",
    "historicalAnalog": "2013 Taper Tantrum — EM dollar funding stress preceded visible currency moves by 6–10 weeks"
  },
  "networkNarrative": "Financial mycelium showing thinning threads in EM dollar funding (connectivity 42/100) and stress in DeFi-TradFi bridge. US Treasury node robust. Pattern matches pre-stress network topology seen before 2013 Taper Tantrum."
}
```

---

## GET /v1/intelligence/currency-stress — $0.25

G10 and EM currency stress assessment. Returns a dollar regime classification, per-currency stress signals, capital flow direction by corridor, and settlement corridor impact for cross-border payments.

**Currencies:** USD · EUR · GBP · JPY · CHF · CAD · AUD · NZD · SEK · NOK + 10 major EM pairs

**Data sources:** FRED (DTWEXBGS, DEXUSEU, DEXJPUS, DEXCHUS, DEXUSUK) · Open-Meteo FX proxies · IMF/BIS capital flow indicators

**Response headers:** `X-DPX-Dollar-Regime` · `X-DPX-Currency-Stress` · `X-DPX-Cache-Hit` · `X-DPX-Generated`

```json
{
  "generatedAt": "2026-06-07T09:00:00Z",
  "cacheHit": false,
  "dollarRegime": "STRONG_USD",
  "stressIndex": 61,
  "g10": {
    "EUR": { "signal": "WATCH", "30dChange": "-1.8%", "capitalFlowDirection": "OUTFLOW" },
    "JPY": { "signal": "STRESSED", "30dChange": "-3.2%", "interventionRisk": "HIGH" },
    "GBP": { "signal": "NORMAL", "30dChange": "-0.4%", "capitalFlowDirection": "STABLE" }
  },
  "emergingMarkets": {
    "CNY": { "signal": "WATCH", "pbocPressure": "ELEVATED" },
    "BRL": { "signal": "STRESSED", "carryRisk": "HIGH" }
  },
  "settlementCorridorImpact": {
    "USD_EUR": "ELEVATED_FX_COST — strong dollar widening corridor spread",
    "USD_JPY": "VOLATILE — intervention risk within 2-3 weeks",
    "USD_EM": "HIGH — EM outflows creating settlement friction"
  },
  "narrative": "Dollar regime: STRONG_USD. JPY stress elevated with BOJ intervention risk. EM corridor friction highest since Q1 2025."
}
```

---

## GET /v1/intelligence/biodiversity — $0.25

TNFD-aligned nature risk assessment. Returns IUCN Red List species threat signals by sector exposure, habitat integrity indices, and SFDR PAI 7 biodiversity-sensitive area data for portfolio compliance.

**Data sources:** IUCN Red List API (open) · GBIF species occurrence (open) · NASA MODIS land cover · USGS land use change

**Frameworks:** TNFD LEAP · SFDR PAI 7 · CSRD ESRS E4

**Response headers:** `X-DPX-Biodiversity-Risk` · `X-DPX-TNFD-Rating` · `X-DPX-Cache-Hit` · `X-DPX-Generated`

```json
{
  "generatedAt": "2026-06-07T00:00:00Z",
  "cacheHit": false,
  "globalBiodiversityIndex": 42,
  "tnfdRating": "HIGH",
  "iucnSignals": {
    "criticallyEndangered": 847,
    "endangered": 4218,
    "trend": "DETERIORATING",
    "hotspots": ["Amazon Basin", "Southeast Asia", "Sub-Saharan Africa"]
  },
  "sectorDependencyMatrix": {
    "agriculture": { "dependencyScore": 91, "exposureLevel": "CRITICAL" },
    "pharmaceuticals": { "dependencyScore": 78, "exposureLevel": "HIGH" },
    "financialServices": { "dependencyScore": 34, "exposureLevel": "MODERATE" }
  },
  "sfdPai7": {
    "biodiversitySensitiveAreaExposure": "ELEVATED",
    "disclosureFlag": true,
    "affectedRegions": ["Amazon", "Congo Basin", "Indo-Burma"]
  },
  "narrative": "Global biodiversity index at 42/100. Agriculture and pharma supply chains carry critical nature dependency risk. SFDR PAI 7 disclosure flag active for Amazon and Congo Basin exposure."
}
```

---

## Free oracle feeds

Scalar integer feeds for on-chain consumption. No payment required. All values scaled ×100. Designed for Chainlink Functions, API3 dAPI, and smart contract integration.

```bash
GET /v1/oracle-feed              # list all feeds
GET /v1/oracle-feed/:slug        # get specific feed
```

| Slug | Description | Scale |
|---|---|---|
| `stability-score` | DPX stablecoin stability score (0–100) | ×100 |
| `earth-health-index` | Earth Health Index — planetary health (0–100) | ×100 |
| `co2-ppm` | Atmospheric CO₂ in parts per million | ×100 |
| `temperature-anomaly` | Global temperature anomaly vs pre-industrial (°C) | ×100 |
| `arctic-sea-ice` | Arctic September minimum sea ice extent (Mkm²) | ×100 |
| `macro-stress-index` | Credit regime stress index (0–100) | ×100 |
| `supply-chain-pressure` | NY Fed GSCPI z-score | ×100 |
| `renewable-share` | US renewable electricity generation share (%) | ×100 |
| `systemic-risk` | Cross-layer cascade risk score (0–100) | ×100 |
| `us-instability-score` | US structural instability composite (0–100) | ×100 |
| `fiscal-dominance-risk` | US fiscal dominance risk composite (0–100) | ×100 |

```bash
curl https://intelligence.untitledfinancial.com/v1/oracle-feed/systemic-risk
```

```json
{
  "feed": "systemic-risk",
  "value": 6700,
  "scale": 100,
  "unit": "risk×100",
  "signal": "ACTIVE_CASCADE",
  "asOf": "2026-05-15T10:00:00Z",
  "cacheHit": true
}
```

Response headers include `X-DPX-Feed-Value`, `X-DPX-Feed-Signal`, `X-DPX-Feed-Scale`, and `Cache-Control: public, max-age=3600` — readable directly by Chainlink Functions without JSON parsing.

---

## Free meta endpoints

| Endpoint | Description |
|---|---|
| `GET /health` | Worker liveness, KV status, endpoint index |
| `GET /.well-known/x402` | x402 payment discovery manifest |
| `GET /v1/oracle-feed` | List all oracle feed slugs |
| `GET /openapi.yaml` | OpenAPI 3.1 specification |

---

## Machine discovery

| URL | Format |
|---|---|
| `https://intelligence.untitledfinancial.com/openapi.yaml` | OpenAPI 3.1 |
| `https://intelligence.untitledfinancial.com/.well-known/x402` | x402 manifest |
| `https://intelligence.untitledfinancial.com/v1/oracle-feed` | Feed registry |
