---
title: Oracle Data API
description: Real-time and predictive intelligence from the DPX Stability Oracle, ESG Oracle, and Compliance Oracle — available as a standalone data product for treasury teams, hedge funds, and asset managers. Per-call via x402 or monthly subscription.
---

The DPX Oracle Data API exposes the full signal stack as a programmable data feed — no settlement required. Buy individual signals per call or subscribe for unlimited monthly access. All endpoints return structured JSON with confidence scores and AI synthesis reasoning.

## What's included

### Stability Oracle — macro conditions across 9 signal layers

The Stability Oracle continuously models global conditions across climate, commodities, FX, macro, bonds, geopolitical risk, capital flows, and USD structural health. Every response includes a composite score (0–100), a regime status (STABLE / CAUTION / UNSTABLE), and a confidence-scored AI synthesis layer.

```bash
curl https://stability.untitledfinancial.com/api/status
```

**What you get:**
- Composite stability score + status
- Temperature anomaly across 9 global stations (Open-Meteo)
- US Drought Severity and Coverage Index (USDM)
- Active wildfire and severe storm counts (NASA EONET)
- Global disaster alert score (GDACS)
- WTI crude stress tier
- CPI, GDP, unemployment from FRED
- 2Y/10Y bond yields + yield curve status + recession signal
- Geopolitical risk level + EPU index
- USD structural health score (25+ signals)
- 30/60/90-day regime transition probabilities
- AI synthesis: reasoning, confidence, outlook, alerts

**Intelligence briefing** (deeper synthesis, x402-gated):

```bash
curl https://stability.untitledfinancial.com/intelligence
# Returns: 402 Payment Required with USDC payment instructions
# Cost: 0.001 USDC per call on Base mainnet
```

---

### ESG Oracle — entity scoring across 8 institutional sources

Live E/S/G scores for any company by LEI, name, domain, or ticker. Sources: SEC EDGAR, OSHA, BLS SOII, EU E-PRTR, ESMA, World Bank WGI, GLEIF, SFDR PAI indicators.

```bash
# By LEI
curl "https://compliance.untitledfinancial.com/esg/score?lei=7LTWFZYICNSX8D621K86"

# By name (no LEI required)
curl "https://compliance.untitledfinancial.com/esg/lookup?q=Volkswagen+AG"

# Batch — up to 50 entities, returns ranked by composite score
curl -X POST https://compliance.untitledfinancial.com/esg/batch \
  -H "Content-Type: application/json" \
  -d '{ "entities": [{"lei": "..."}, {"name": "Exxon Mobil"}] }'

# Portfolio — up to 200 entities, MiCA Article 72 flags, worst offenders
curl -X POST https://compliance.untitledfinancial.com/esg/portfolio \
  -H "Content-Type: application/json" \
  -d '{ "entities": [...] }'
```

**Use cases:** counterparty due diligence, SFDR Article 8/9 fund screening, CSRD supply chain audit, MiCA Article 72 pre-clearance, quarterly portfolio ESG review.

---

### Compliance Oracle — entity risk screening

Sanctions, PEP, UBO chain, and FATF country risk in a single call. Replaces Refinitiv World-Check, Dow Jones Risk, and Comply Advantage for the majority of screening use cases.

```bash
curl -X POST https://compliance.untitledfinancial.com/compliance/screen \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dpx_sub_..." \
  -d '{
    "name": "Acme GmbH",
    "lei": "7LTWFZYICNSX8D621K86",
    "country": "DE",
    "amount": 250000,
    "currency": "USD"
  }'
```

**Returns:** APPROVED / FLAGGED / BLOCKED, humanRequired boolean, FATF R.16 attestation, risk score 0–100. See [Compliance Screening API](/products/compliance-api) for full documentation.

---

### Corridor Intelligence — per-pair settlement timing

Settlement recommendation for any currency pair — SETTLE\_NOW / DELAY\_24H / DELAY\_48H — with liquidity score, cascade penalty, and FX session timing.

```bash
curl -X POST https://stability.untitledfinancial.com/stability/corridor \
  -H "Content-Type: application/json" \
  -d '{ "sourceCurrency": "USD", "targetCurrency": "BRL", "amountUsd": 500000 }'
```

---

## Access

### Per-call (x402)

Intelligence briefing: 0.001 USDC/call. All other endpoints: free at the protocol layer, or metered at the MCP layer. No API key required for protocol endpoints.

### Subscription API key

A subscription key bypasses per-call payment prompts and enables volume access across all oracle endpoints, the compliance API, and the MCP server.

| Tier | Monthly (USDC) | Calls/month | Entities/batch |
|---|---|---|---|
| Analyst | 50 | 5,000 | 50 |
| Professional | 200 | 25,000 | 200 |
| Institutional | 800 | Unlimited | Unlimited |

```bash
# Subscribe and receive an API key
curl -X POST https://compliance.untitledfinancial.com/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "professional",
    "email": "treasury@yourfirm.com",
    "paymentTxHash": "0x..."  
  }'
# Returns: { "apiKey": "dpx_sub_...", "tier": "professional", "expiresAt": "..." }
```

Include on any request:
```
X-API-Key: dpx_sub_...
```

Or as a Bearer token on the MCP server:
```json
{ "env": { "SETTLEMENT_AGENT_URL": "https://agent.untitledfinancial.com", "MCP_API_KEY": "dpx_sub_..." } }
```

---

## MCP access

All oracle data is also available via the [DPX MCP server](/integrations/mcp) — 56 tools covering the full oracle stack. Point Claude Desktop or Cursor at `mcp.untitledfinancial.com` with your subscription key for native in-conversation access.

```
oracle.stability       — composite score + status
oracle.status          — full 9-layer signal breakdown
oracle.rails           — local payment rail health
oracle.mycelium        — network topology + crisis detection
esg.score              — entity ESG score by LEI
esg.lookup             — ESG score by name, domain, or ticker
esg.batch              — up to 50 entities
esg.portfolio          — up to 200 entities
stability.corridor     — per-pair settlement timing
stability.stablecoin_route — optimal stablecoin for any corridor
```

---

## Example: quarterly counterparty ESG review (Python)

```python
import requests

API_KEY = "dpx_sub_..."
BASE    = "https://compliance.untitledfinancial.com"

counterparties = [
    {"name": "Supplier A GmbH", "lei": "..."},
    {"name": "Vendor B Ltd",    "lei": "..."},
    # up to 200
]

resp = requests.post(
    f"{BASE}/esg/portfolio",
    json={"entities": counterparties},
    headers={"X-API-Key": API_KEY},
)
portfolio = resp.json()

print(f"Composite ESG: {portfolio['composite']['score']}")
print(f"MiCA Art.72 flags: {portfolio['micaFlags']}")
print(f"Worst offenders: {portfolio['worstOffenders'][:3]}")
```

---

## Data freshness

| Signal | Update frequency |
|---|---|
| Stability Oracle composite | Hourly |
| Climate signals (EONET, GDACS, USDM) | Hourly |
| ESG scores | Weekly recalibration + on-demand |
| Sanctions / PEP | OpenSanctions dataset — updated daily |
| GLEIF / LEI data | Real-time GLEIF API |
| Bond yields / macro (FRED) | Daily |
| FX rates | Real-time (4 cross-validated APIs) |
| Corridor recommendations | On-demand — computed at request time |
