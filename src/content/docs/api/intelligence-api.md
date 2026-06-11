---
title: Intelligence API
description: Per-call macro, climate, geopolitical, ESG, and systemic risk intelligence — x402 micropayments and API key access on intelligence.untitledfinancial.com.
---

Standalone per-call data product. 23 intelligence endpoints covering climate, planetary health, credit stress, supply chain, energy transition, entity ESG, financial shock cascades, structural geopolitical instability, commodity markets, sovereign debt, physical water risk, financial network topology, G10/EM currency stress, TNFD-aligned nature risk, butterfly effect cascade, tectonic structural stress, aftershock secondary waves, contagion network simulation, resonance phase alignment detection, gender-economic risk and opportunity signals, shipping and logistics stress, and FX settlement corridor intelligence.

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
| `POST /v1/intelligence/butterfly` | $0.50 | no-cache | Macro |
| `GET /v1/intelligence/tectonic` | $0.50 | 6h | Macro |
| `POST /v1/intelligence/aftershock` | $0.50 | no-cache | Macro |
| `POST /v1/intelligence/contagion` | $0.50 | no-cache | Macro |
| `GET /v1/intelligence/resonance` | $0.50 | 3h | Macro |
| `GET /v1/intelligence/gender-risk` | $0.50 | 12h | Structural |
| `GET /v1/intelligence/shipping-stress` | $0.25 | 4h | Physical |
| `GET /v1/intelligence/fx-settlement` | $0.25 | 1h | Financial |

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

## POST /v1/intelligence/butterfly — $0.50

**Butterfly Effect Cascade Intelligence**

Models how an initial perturbation propagates through the interconnected web of climate, geopolitical, economic, and commodity systems. Pass an origin event and magnitude; receive a time-ordered cascade chain showing which downstream systems are hit, in what sequence, with what attenuated signal strength — plus an AI synthesis of the highest-impact transmission paths.

**25 nodes across 4 domains:**

| Domain | Nodes |
|---|---|
| Climate | drought, flood, carbon price shock, wildfire, coastal/sea-level stress, heatwave |
| Geopolitical | sanctions regime, armed conflict, trade tariffs, regime change, election shock, port blockade |
| Economic | central bank rate decision, inflation shock, sovereign debt stress, banking stress, currency crisis, recession |
| Commodity | crude oil, natural gas, grain/food, rare earth/lithium, copper, water scarcity, fertilizer |

**Node discovery:** `GET /v1/intelligence/butterfly` returns all valid node IDs and descriptions.

**Request:**

```bash
# Discover valid origin nodes
curl https://intelligence.untitledfinancial.com/v1/intelligence/butterfly \
  -H "X-API-Key: your-key"

# Run a cascade
curl -X POST https://intelligence.untitledfinancial.com/v1/intelligence/butterfly \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "geo.conflict",
    "eventType": "Middle East escalation — Strait of Hormuz threat",
    "magnitude": 75,
    "horizonHours": 168
  }'
```

**Parameters:**

| Field | Type | Required | Description |
|---|---|---|---|
| `origin` | string | ✓ | Node ID (e.g. `geo.conflict`, `climate.drought`, `macro.rate_decision`) |
| `eventType` | string | ✓ | Free-text description of the specific event |
| `magnitude` | number | ✓ | Shock intensity 1–100. 100 = maximum plausible shock. 40–60 = significant but not extreme. |
| `horizonHours` | number | — | Time horizon in hours (1–720). Default: 168 (1 week). |

```json
{
  "origin": {
    "id": "geo.conflict",
    "label": "Armed Conflict Escalation",
    "domain": "geopolitical",
    "description": "Active conflict or significant military escalation in a resource region"
  },
  "eventType": "Middle East escalation — Strait of Hormuz threat",
  "inputMagnitude": 75,
  "horizonHours": 168,
  "cascade": [
    {
      "node": { "id": "commodity.oil", "label": "Crude Oil Price Shock", "domain": "commodity" },
      "magnitude": 67.5,
      "arrivalHours": 1,
      "via": ["geo.conflict"],
      "mechanism": "Supply disruption in energy-producing region, risk premium spike"
    },
    {
      "node": { "id": "commodity.gas", "label": "Natural Gas Supply Disruption", "domain": "commodity" },
      "magnitude": 56.3,
      "arrivalHours": 2,
      "via": ["geo.conflict"],
      "mechanism": "Pipeline infrastructure at risk, transit routes disrupted"
    },
    {
      "node": { "id": "macro.inflation", "label": "Inflation Shock", "domain": "economic" },
      "magnitude": 48.8,
      "arrivalHours": 12,
      "via": ["geo.conflict", "commodity.oil"],
      "mechanism": "Energy cost pass-through to transport, manufacturing, food"
    }
  ],
  "synthesis": "The armed conflict escalation transmits primarily through the energy complex...",
  "computedAt": "2026-06-08T14:00:00.000Z"
}
```

---

## GET /v1/intelligence/tectonic — $0.50

**Tectonic Stress Intelligence**

Maps the slow-moving structural forces that are invisible until they rupture. Where butterfly traces an acute shock over hours, tectonic tracks latent pressure building over years and identifies how close each fault line is to its threshold.

**22 fault lines across 5 domains:**

| Domain | Fault Lines |
|---|---|
| Demographic | G7 population aging, structural labour shortage, EM urbanisation stress, pension system solvency |
| Fiscal | Global debt supercycle, central bank credibility erosion, dollar reserve dominance erosion, wealth inequality ratchet |
| Environmental | Desertification / land degradation, aquifer / groundwater depletion, permafrost thaw / methane release, biodiversity / ecosystem collapse |
| Infrastructure | Physical infrastructure decay, electrical grid fragility, digital infrastructure concentration, water / sanitation infrastructure failure |
| Geopolitical (structural) | Western alliance fragmentation, institutional legitimacy erosion, nuclear proliferation risk, resource nationalism / weaponisation, global demographic power imbalance |

**Request:**

```bash
curl https://intelligence.untitledfinancial.com/v1/intelligence/tectonic \
  -H "X-API-Key: your-key"
```

**Response (abbreviated):**

```json
{
  "summary": {
    "byStatus": { "RUPTURED": 0, "CRITICAL": 3, "ELEVATED": 8, "BUILDING": 9, "STABLE": 2 },
    "avgStress": 57,
    "mostUrgent": ["Pension System Solvency", "Global Debt Supercycle", "G7 Population Aging"],
    "regime": "ELEVATED_STRESS"
  },
  "faultLines": [
    {
      "node": {
        "id": "fiscal.debt_supercycle",
        "label": "Global Debt Supercycle",
        "domain": "fiscal",
        "baselineStress": 71,
        "accumulationRate": 2.2,
        "threshold": 88
      },
      "currentStress": 78.4,
      "yearsToRupture": 4.4,
      "status": "ELEVATED",
      "transferredFrom": ["demo.aging_g7"]
    }
  ],
  "ruptureSequence": [
    { "nodeId": "demo.pension_solvency", "label": "Pension System Solvency", "domain": "demographic", "yearsToRupture": 2.7 },
    { "nodeId": "fiscal.debt_supercycle", "label": "Global Debt Supercycle", "domain": "fiscal", "yearsToRupture": 4.4 }
  ],
  "synthesis": "The most advanced fault lines are concentrated in the fiscal-demographic nexus...",
  "generatedAt": "2026-06-11T00:00:00.000Z"
}
```

**Regime classifications:** `CASCADING_RUPTURE` (≥3 ruptured) → `PRE_RUPTURE` (≥4 critical) → `ELEVATED_STRESS` (avg ≥65) → `BUILDING` (avg ≥50) → `STABLE`

---

## POST /v1/intelligence/aftershock — $0.50

**Aftershock Intelligence**

Models the secondary waves that follow a primary cascade event. The 2008 financial crisis caused an immediate cascade; the sovereign debt crisis of 2010–12 was its aftershock. COVID supply shock of 2021 was the aftershock of 2020 stimulus. This endpoint maps that secondary structure.

**Three-wave model:**

| Wave | Horizon | Characterisation |
|---|---|---|
| Wave 1 | 0–72h | Immediate secondary effects — panic buying, capital controls, retaliatory sanctions, displacement |
| Wave 2 | 1–4 weeks | Policy response distortions — reserve releases that create rebounds, stimulus that overshoots, austerity that triggers unrest |
| Wave 3 | 1–6 months | Structural realignments permanently locked in — supply chain reconfiguration, energy transition acceleration, alliance restructuring, reserve currency shifts |

**Request:**

```bash
curl -X POST https://intelligence.untitledfinancial.com/v1/intelligence/aftershock \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "geo.conflict",
    "eventType": "Middle East escalation — Strait of Hormuz disruption",
    "magnitude": 75,
    "elapsedHours": 48,
    "horizonHours": 4320
  }'
```

**Parameters:**

| Field | Type | Required | Description |
|---|---|---|---|
| `origin` | string | ✓ | Node ID of the primary event — same IDs as butterfly endpoint |
| `eventType` | string | ✓ | Description of the original event |
| `magnitude` | number | ✓ | Original shock intensity 1–100 |
| `elapsedHours` | number | — | Hours elapsed since the primary event. Default: 24 |
| `horizonHours` | number | — | Forward analysis horizon in hours. Default: 4320 (6 months) |

**Response (abbreviated):**

```json
{
  "primaryEvent": {
    "origin": "geo.conflict",
    "eventType": "Middle East escalation — Strait of Hormuz disruption",
    "inputMagnitude": 75,
    "elapsedHours": 48
  },
  "summary": {
    "totalAftershocks": 9,
    "amplified": 4,
    "rebounds": 2,
    "structural": 3
  },
  "waves": {
    "wave1": {
      "label": "Immediate (0–72h)",
      "count": 2,
      "events": [
        {
          "node": { "id": "social.hoarding", "label": "Panic Buying / Hoarding Behaviour" },
          "magnitude": 52.5,
          "offsetHours": 6,
          "type": "amplified",
          "mechanism": "Consumer panic buying amplifies commodity shortages beyond supply disruption"
        }
      ]
    },
    "wave2": { "label": "Policy response (1–4 weeks)", "count": 4, "events": [ "..." ] },
    "wave3": { "label": "Structural realignment (1–6 months)", "count": 3, "events": [ "..." ] }
  },
  "synthesis": "The conflict's secondary wave structure is now dominated by the policy response layer...",
  "computedAt": "2026-06-11T00:00:00.000Z"
}
```

**Event types:** `amplified` = continued or intensified pressure; `rebound` = stabilisation driven by policy or market correction; `structural` = permanent change regardless of near-term stabilisation.

---

## POST /v1/intelligence/contagion — $0.50

**Contagion Intelligence**

Epidemiological R-value model for macro-financial shock network propagation. Where butterfly maps the path of a shock, contagion models whether that shock self-amplifies or is contained — using the same mechanics as epidemiology: exposure density, resilience (immunity), viral load, and transmission rates between nodes.

**30 nodes across 6 domains:**

| Domain | Nodes |
|---|---|
| Financial | US banking, EU banking, EM banking, shadow banking / non-bank finance, sovereign bond markets, FX markets, crypto / DeFi |
| Real Economy | US economy, China economy, EU economy, EM economies, global trade / supply chains |
| Commodity | Energy markets, food / agricultural markets, critical minerals, shipping lanes |
| Policy | US Federal Reserve, ECB, IMF / World Bank, G20 coordination |
| Social | Political stability, consumer confidence, labour markets, social cohesion |
| Infrastructure | Digital / financial infrastructure, energy grid, transport / logistics, water / sanitation |

**GET** `/v1/intelligence/contagion` — free node discovery  
**POST** `/v1/intelligence/contagion` — paid simulation ($0.50)

**Request:**

```bash
# Node discovery (free)
curl https://intelligence.untitledfinancial.com/v1/intelligence/contagion \
  -H "X-API-Key: your-key"

# Run simulation
curl -X POST https://intelligence.untitledfinancial.com/v1/intelligence/contagion \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "fin.us_banking",
    "magnitude": 70,
    "epochs": 8,
    "interventionStrength": 0
  }'
```

**Parameters:**

| Field | Type | Required | Description |
|---|---|---|---|
| `origin` | string | ✓ | Origin node ID — GET endpoint for valid values |
| `magnitude` | number | ✓ | Initial shock intensity 1–100 |
| `epochs` | number | — | Weeks to simulate (1–12). Default: 8 |
| `interventionStrength` | number | — | Policy intervention effectiveness 0–1 (0 = none, 0.5 = moderate, 1.0 = maximum). Default: 0 |

**Response (abbreviated):**

```json
{
  "origin": { "id": "fin.us_banking", "label": "US Banking System", "domain": "financial" },
  "regime": "SPREADING",
  "summary": {
    "peakSystemR": 1.42,
    "peakAtWeek": 3,
    "finalSystemR": 0.78,
    "finalActive": 4,
    "finalRecovered": 11,
    "contained": true
  },
  "superspreaders": [
    { "id": "fin.fx_markets", "label": "FX / Currency Markets", "outboundPotential": 8.9 },
    { "id": "com.energy_markets", "label": "Global Energy Markets", "outboundPotential": 8.4 }
  ],
  "epochs": [
    { "epoch": 1, "systemR": 1.42, "activeInfections": 5, "newInfections": 4, "recovered": 0 }
  ],
  "synthesis": "The US banking shock peaked at R=1.42 in week 3, crossing the epidemic threshold...",
  "computedAt": "2026-06-11T00:00:00.000Z"
}
```

**Regime classifications:** `PANDEMIC` (peak R ≥ 2.5) → `EPIDEMIC` (≥ 1.5) → `SPREADING` (≥ 1.0) → `CONTAINED` (≥ 0.5) → `SUPPRESSED` (< 0.5)

---

## GET /v1/intelligence/resonance — $0.50

**Resonance Intelligence**

Detects when multiple independent cycles are oscillating in phase — amplifying each other rather than cancelling. A 40mph wind that oscillates at the Tacoma Narrows Bridge's natural frequency was enough to collapse it. Macro systems have natural frequencies too: the credit cycle, the dollar cycle, ENSO, the commodity supercycle, the conflict cycle. When these align, ordinary-magnitude forces combine into non-linear outcomes.

**28 oscillating signals across 5 domains:**

| Domain | Signals |
|---|---|
| Financial | Credit cycle, dollar cycle, volatility regime, EM capital flow cycle, leverage cycle, real estate / property cycle, dollar doom loop |
| Economic | Business cycle, inflation cycle, fiscal impulse, productivity wave, labour vs capital share cycle, debt-deflation spiral risk |
| Geopolitical | Hegemonic power transition, conflict cycle, nationalism / globalisation pendulum, sanctions cycle, institutional legitimacy cycle |
| Climate | ENSO (El Niño / La Niña), Atlantic Multidecadal Oscillation, Arctic amplification trend, South Asian monsoon variability, global drought cycle |
| Commodity | Commodity supercycle, oil price cycle, food price cycle, industrial metals / green transition cycle |

**Request:**

```bash
curl https://intelligence.untitledfinancial.com/v1/intelligence/resonance \
  -H "X-API-Key: your-key"
```

**Response (abbreviated):**

```json
{
  "summary": {
    "systemResonanceScore": 62,
    "regime": "HIGH_RESONANCE",
    "resonantPairs": 14,
    "clusters": 3,
    "criticalClusters": 1,
    "approachingAlignment": 5
  },
  "clusters": [
    {
      "id": "cluster_1",
      "signals": ["fin.credit_cycle", "fin.leverage_cycle", "econ.business_cycle"],
      "labels": ["Global Credit Cycle", "Financial Leverage Cycle", "Global Business Cycle"],
      "domains": ["financial", "economic"],
      "avgPhaseDiff": 18.4,
      "combinedAmplitude": 65,
      "amplificationFactor": 2.3,
      "historicalAnalogs": ["2008 Global Financial Crisis", "2020 COVID crash"],
      "dangerLevel": "HIGH"
    }
  ],
  "approachingAlignment": [
    {
      "signalA": "cli.enso", "signalB": "com.food_price_cycle",
      "currentDiff": 48.2, "quartersToAlignment": 3,
      "mechanism": "ENSO disruption is the primary driver of food price spikes — in-phase = food crisis"
    }
  ],
  "synthesis": "The current resonance configuration is dominated by a fiscal-financial cluster...",
  "generatedAt": "2026-06-11T00:00:00.000Z"
}
```

**Regime classifications:** `RESONANCE_CASCADE` (score ≥ 80) → `HIGH_RESONANCE` (≥ 60) → `ELEVATED_RESONANCE` (≥ 40) → `MODERATE_RESONANCE` (≥ 20) → `LOW_RESONANCE`

---

## GET /v1/intelligence/gender-risk — $0.50

**Gender Risk & Opportunity Intelligence**

Maps the structural relationship between gender-based violence, legal discrimination against women, and economic/financial outcomes — across 18 countries and 6 regions. The signal runs in two directions, and both are returned.

**Risk signal:** High GBV prevalence suppresses female labour force participation → productivity loss → GDP drag (modelled at 1.3–3.7% of GDP). Economic stress (unemployment, savings collapse) feeds back into elevated domestic violence rates — a measurable, markets-relevant loop. Countries with Women Business and Law Index below 70 show an average 1.2pp higher sovereign spread vs peers at the same income level.

**Opportunity signal:** Countries improving on GBV indicators, closing LFPR gender gaps, and strengthening women's legal rights generate investable growth signals. Rising female LFPR precedes GDP growth; improving Law Index correlates with FDI inflows; financial inclusion of women expands consumer credit markets. The largest untapped labour reserve in the global economy is women not yet in the workforce.

**Data sources:**
- WHO GHO `SDGIPV12M` — SDG 5.2.1 intimate partner violence prevalence (past 12 months, 2023)
- World Bank WDI — Female and Male LFPR (`SL.TLF.CACT.FE/MA.ZS`)
- World Bank WDI — Women Business and the Law Index (`SG.LAW.INDX`, 0–100)
- World Bank WDI — Women in Parliament % (`SG.GEN.PARL.ZS`)
- World Bank WDI — GDP per capita (`NY.GDP.PCAP.CD`), Gini coefficient (`SI.POV.GINI`)
- FRED — US female LFPR, unemployment rate, CPI, consumer sentiment (economic stress feedback)

**Countries covered:** India, Bangladesh, Pakistan, Nigeria, Ethiopia, Kenya, DRC, Tanzania, Brazil, Mexico, Colombia, Philippines, Indonesia, South Africa, USA, UK, Germany, Australia

**Request:**

```bash
curl https://intelligence.untitledfinancial.com/v1/intelligence/gender-risk \
  -H "X-API-Key: your-key"
```

**Response (abbreviated):**

```json
{
  "globalSummary": {
    "avgGBVRiskScore": 58,
    "avgOpportunityScore": 44,
    "countriesAtCritical": 4,
    "countriesWithStrongOpportunity": 3,
    "gdpDragEstimateGlobal": "2.4% of GDP (1.9–3.2% range)",
    "economicStressFeedbackRisk": "ELEVATED",
    "regime": "HIGH_RISK"
  },
  "countryProfiles": [
    {
      "iso3": "ETH",
      "name": "Ethiopia",
      "region": "Sub-Saharan Africa",
      "incomeGroup": "low",
      "ipvPrevalence": 37.0,
      "womenLawIndex": 51,
      "femaleLFPR": 72.4,
      "maleLFPR": 88.1,
      "lfprGenderGap": 15.7,
      "gbvRiskScore": 78.2,
      "opportunityScore": 31.4,
      "riskStatus": "CRITICAL",
      "opportunityStatus": "LIMITED",
      "estimatedGDPDragPct": 3.1,
      "primaryTransmissions": ["productivity_loss", "healthcare_fiscal_drag", "legal_discrimination"],
      "opportunityDrivers": ["emerging_market_growth_leverage", "reform_upside_potential"]
    }
  ],
  "financialCorrelations": {
    "labourSuppression": {
      "score": 62,
      "mechanism": "Gender-based violence suppresses female labour force participation...",
      "gdpImpactPct": "1.6% estimated output gap from LFPR suppression"
    },
    "gdpDrag": {
      "globalEstimatePct": 2.4,
      "rangeMin": 1.3,
      "rangeMax": 3.7,
      "methodology": "UN Women / World Bank methodology: direct costs + indirect productivity effects"
    },
    "economicStressFeedback": {
      "usUnemploymentRate": 4.3,
      "usConsumerSentiment": 49.8,
      "feedbackRisk": "ELEVATED",
      "feedbackNarrative": "Current economic conditions elevate stress-driven domestic violence risk..."
    }
  },
  "opportunitySignals": {
    "topOpportunityCountries": [
      { "iso3": "DEU", "name": "Germany", "opportunityScore": 78.3, "drivers": ["strong_legal_framework", "high_female_labour_participation", "political_representation"] }
    ],
    "marketThesis": "Countries moving from CONSTRAINED to EMERGING opportunity status represent the highest-beta growth signal in gender economics..."
  },
  "synthesis": "Four-paragraph intelligence briefing...",
  "generatedAt": "2026-06-11T00:00:00.000Z"
}
```

**Risk score thresholds:** `CRITICAL` (≥ 75) → `HIGH` (≥ 60) → `ELEVATED` (≥ 45) → `BUILDING` (≥ 30) → `LOW`

**Opportunity score thresholds:** `STRONG` (≥ 75) → `EMERGING` (≥ 60) → `MODERATE` (≥ 45) → `LIMITED` (≥ 30) → `CONSTRAINED`

**Cache:** 12h — underlying data updates annually; US economic stress feeds are live.

---

## GET /v1/intelligence/shipping-stress — $0.25

Composite view of global freight market conditions across ocean, air, truck, and rail. Tracks energy-driven shipping costs and 8 key global trade routes with disruption status. Includes a `settlementRelevance` section mapping logistics conditions to cross-border payment corridor risk — invoice delay risk, trade finance stress, and affected corridors.

**Data sources:** FRED (Brent crude: DCOILBRENTEU) · EIA (US diesel: PET.EMD_EPD2D_PTE_NUS_DPG.W)

**Cache:** 4h

```json
{
  "generatedAt": "2026-06-11T12:00:00Z",
  "compositeScore": 58,
  "regime": "MODERATELY_STRESSED",
  "energyCost": { "brentUsd": 82.4, "dieselUsdPerGallon": 3.91, "signal": "ELEVATED" },
  "keyRoutes": [
    { "route": "Trans-Pacific (Asia→US West Coast)", "status": "DISRUPTED", "disruption": "Port congestion + labor action risk" },
    { "route": "Transatlantic (Europe→US East Coast)", "status": "NORMAL" }
  ],
  "freightModes": {
    "ocean": { "score": 62, "signal": "ELEVATED" },
    "air":   { "score": 44, "signal": "NORMAL" },
    "truck": { "score": 71, "signal": "STRESSED" }
  },
  "settlementRelevance": {
    "invoiceDelayRisk": "MODERATE",
    "tradeFinanceStress": "BUILDING",
    "affectedCorridors": ["USD/CNY", "USD/KRW", "EUR/USD goods-backed"]
  }
}
```

---

## GET /v1/intelligence/fx-settlement — $0.25

Live FX corridor risk assessment across 10 currency pairs with per-pair settlement advice, volatility proxy, and liquidity depth classification. Returns regional block rollup (G4, Americas, Asia-Pacific), overall risk regime, DXY position, and recommended actions for treasury teams.

**Data sources:** FRED spot rate series (10 pairs) · DTWEXBGS (DXY trade-weighted USD index)

**Cache:** 1h

```json
{
  "generatedAt": "2026-06-11T14:00:00Z",
  "overallRisk": "MODERATE",
  "dxy": { "value": 104.2, "signal": "STRONG_USD", "30dChange": "+1.8%" },
  "corridors": {
    "USD/EUR": { "spotRate": 0.924, "risk": "MODERATE", "advice": "Execute — within normal range", "volatilityProxy": "LOW" },
    "USD/JPY": { "spotRate": 157.4, "risk": "HIGH", "advice": "Delay if possible — intervention risk", "volatilityProxy": "ELEVATED" }
  },
  "bestCorridors": ["USD/CHF", "USD/EUR", "USD/GBP"],
  "worstCorridors": ["USD/JPY", "USD/BRL", "USD/CNY"],
  "regionalBlocks": {
    "G4": { "risk": "MODERATE", "summary": "EUR stable, JPY stressed, GBP normal, CHF strong" },
    "AsiaPacific": { "risk": "HIGH", "summary": "JPY intervention risk, CNY PBOC pressure" }
  },
  "recommendedActions": [
    "Prioritise EUR and CHF corridors this week",
    "Delay JPY settlements >$500K pending BOJ intervention signal"
  ]
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
