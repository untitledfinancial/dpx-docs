---
title: AI compute procurement intelligence
description: DPX intelligence tools for AI compute desks — semiconductor supply chain risk, energy, sovereign exposure, disruption cascade simulation, and macro timing for large capital commitments.
---

Managing large-scale AI compute spend involves the same signal layers that DPX already monitors for cross-border settlement: commodity markets, supply chain disruption, sovereign and geopolitical risk, energy costs, and macro conditions. The `compute.*` MCP tools expose these signals framed for compute procurement decisions.

## The compute desk problem

A compute desk buying $100M+ of GPUs, building data centers, or negotiating long-term chip supply agreements needs to answer:

- Is now the right time to commit to a large order, or will prices fall in 90 days?
- What happens to my supply chain if TSMC fab capacity drops 30%?
- Which jurisdictions are safe for data center investment given current geopolitical conditions?
- Is energy cheap and available in the markets where I'm building?
- Are shipping lanes to key supplier regions clear?

These are intelligence questions, not payment questions — but DPX's oracle infrastructure already monitors all of them.

---

## MCP tools

Add to your Claude Desktop or Cursor config:

```json
{
  "mcpServers": {
    "dpx": {
      "command": "npx",
      "args": ["-y", "@untitledfinancial/dpx-mcp"],
      "env": {
        "INTELLIGENCE_API_KEY": "your_key_here"
      }
    }
  }
}
```

### `compute.supply_chain`

Semiconductor and AI compute supply chain risk — 30–90 day lead signals across chip fabrication, advanced packaging, memory, rare earth inputs, and logistics chokepoints.

```
compute.supply_chain
```

Returns: risk score (0–100), active alerts by segment (fab / packaging / memory / rare earth / logistics), recommended procurement actions, AI narrative.

**When to use:** Before placing large GPU or ASIC orders. When evaluating TSMC/Samsung/ASML concentration risk. When monitoring CoWoS/HBM packaging constraints.

---

### `compute.energy`

Energy cost and availability for AI data center procurement — power grid stress, renewable capacity, natural gas pricing, carbon costs, and energy transition risk by jurisdiction.

```
compute.energy
```

Returns: energy stress score, jurisdiction rankings (US/EU/APAC), cost trajectory (30/60/90d), recommended hedging windows.

**When to use:** When evaluating data center locations. When negotiating long-term power purchase agreements. When assessing energy cost exposure for new compute capacity.

---

### `compute.sovereign_risk`

Sovereign and geopolitical risk for compute infrastructure — jurisdiction-level assessment across Taiwan, South Korea, Japan, Netherlands, Singapore, US, and China.

```
compute.sovereign_risk
```

Returns: stability score per jurisdiction, active geopolitical alerts, cross-strait risk level, export control change probability (90d), recommended diversification actions.

**When to use:** When stress-testing supply chain dependencies. Before committing to single-source procurement from Taiwan-based fabs. When evaluating export control exposure.

---

### `compute.cascade`

Simulate what happens downstream when a specific chokepoint fails. Returns cascade sequence, time-to-impact per supply chain tier, cost impact estimates, and recommended hedges.

```
compute.cascade shock="TSMC N3 fab offline 60 days" magnitude=80
compute.cascade shock="ASML EUV embargo expanded" magnitude=70
compute.cascade shock="Taiwan Strait closure" magnitude=90
compute.cascade shock="CoWoS packaging capacity -40%" magnitude=60
compute.cascade shock="rare earth export quota cut 30%" magnitude=65
```

Returns: ordered cascade sequence (which suppliers/sectors affected and when), estimated price impact, procurement hedge recommendations, alternative sourcing options.

**When to use:** Supply chain stress testing. Procurement contingency planning. Board-level risk briefings.

---

### `compute.shipping`

Shipping and logistics stress for AI hardware — container availability, port congestion (Rotterdam, Singapore, LA/Long Beach, Kaohsiung), air freight rates, customs delays.

```
compute.shipping
```

Returns: shipping stress score (0–100), per-route alerts, estimated delay by corridor, recommended logistics windows.

**When to use:** Planning GPU cluster delivery timelines. Assessing whether spot hardware orders will arrive on schedule.

---

### `compute.macro_timing`

Macro conditions for large capital commitments — credit conditions, FX risk for cross-border procurement (USD/TWD, USD/JPY, USD/EUR), inflation trajectory for construction and energy costs.

```
compute.macro_timing
```

Returns: macro stress score, credit spread conditions, FX regime per pair, commitment window recommendation (now / delay 30d / delay 90d).

**When to use:** Before signing multi-hundred-million-dollar supply agreements. Before announcing data center build programs. When assessing whether to lock in pricing now or wait.

---

### `compute.commodity`

Commodity intelligence for compute inputs — rare earths (neodymium, dysprosium, gallium, germanium), industrial metals (copper, cobalt), and energy commodities (natural gas, silicon).

```
compute.commodity
```

Returns: spot pricing trends, supply concentration risk by country, 30/60/90d outlook, active alerts.

**When to use:** Assessing cost risk in long-term supply agreements. Evaluating supplier ESG exposure in rare earth sourcing.

---

## Example agent session

In Claude Desktop with DPX MCP configured:

```
You: I need to assess whether now is a good time to commit to a $500M GPU 
     order from TSMC and sign a 3-year supply agreement.

Claude: I'll check supply chain conditions, macro timing, and sovereign risk.

→ compute.supply_chain
→ compute.macro_timing  
→ compute.sovereign_risk
→ compute.cascade shock="TSMC fab capacity -20%" magnitude=75

Based on current signals:
- Supply chain: CoWoS packaging is constrained (alert: 6-8 week lead time 
  extension active). Locking in now captures current allocation before 
  Q3 demand surge.
- Macro: Credit conditions are favorable for large capital commitments. 
  USD/TWD is stable — no FX hedging urgency.
- Sovereign: Cross-strait risk elevated vs 6-month baseline but below 
  threshold for supply chain restructuring recommendation.
- Cascade simulation: TSMC -20% capacity causes ~40% GPU price increase 
  within 45 days. Securing allocation now is the hedge.

Recommendation: Proceed with commitment. The supply allocation risk 
outweighs the macro case for delay.
```

---

## Connecting payments to procurement

Once your agent makes a procurement decision, DPX handles the settlement — same tools, same session. Cross-border payments to TSMC (TWD), ASML (EUR), or Samsung (KRW) route through the DPX settlement rail with full compliance documentation.

```
compute.macro_timing          → check conditions
settlement.quote              → price the cross-border payment
compliance.screen             → screen the counterparty
settlement.execute            → move funds
```

This closes the loop from intelligence to execution in a single agent session.

---

## Setup

**MCP (Claude Desktop / Cursor)**

```json
{
  "mcpServers": {
    "dpx": {
      "command": "npx",
      "args": ["-y", "@untitledfinancial/dpx-mcp"],
      "env": {
        "INTELLIGENCE_API_KEY": "your_key_here"
      }
    }
  }
}
```

Get an intelligence API key: [docs.untitledfinancial.com/beta](/beta)

**REST**

All `compute.*` tools call `intelligence.untitledfinancial.com` directly:

```bash
curl https://intelligence.untitledfinancial.com/v1/intelligence/supply-chain \
  -H "X-API-Key: your_key"

curl https://intelligence.untitledfinancial.com/v1/intelligence/cascade \
  -X POST \
  -H "X-API-Key: your_key" \
  -H "Content-Type: application/json" \
  -d '{"shock": "TSMC N3 fab offline 60 days", "magnitude": 80}'
```

---

## Related

- [For AI builders](/guides/for-ai-builders) — payment tools alongside these intelligence tools
- [Intelligence API](/api/intelligence-api) — full endpoint reference
- [Commodity Forecast](/api/commodity-forecast) — 11-symbol climate-driven outlook
