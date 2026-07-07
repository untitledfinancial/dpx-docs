---
title: MCP — Connect Claude
description: Connect Claude Desktop, Cursor, or any MCP-compatible host to DPX. Price settlements, check stability, execute cross-border and domestic settlements, check local rail health, retrieve ESG scores, run spend analysis, and route Mercury payments natively in conversation.
---

The DPX MCP server gives Claude Desktop, Cursor, and any MCP-compatible host native access to the full DPX settlement lifecycle — from oracle checks to live settlement execution. 71 tools covering settlement, oracle queries, ESG scoring, analytics, Ramp card integration, Mercury banking, compliance screening, network topology intelligence, butterfly effect cascade analysis, shipping stress, FX corridor intelligence, macro intelligence briefings, multi-stablecoin routing, AP2-compatible agent mandate management, and KYA (Know Your Agent) identity. Supports both **cross-border** and **domestic (intra-country)** settlements. No browser, no API calls, no copy-paste.

**Also available on [Smithery](https://smithery.ai/server/@untitledfinancial/dpx-mcp)** — install with one click from the Smithery marketplace.

**Also compatible with [ElevenLabs Conversational AI](/integrations/elevenlabs)** — point any ElevenLabs voice agent at `https://mcp.untitledfinancial.com/mcp` with SSE transport to access all 71 tools mid-conversation.

## Prerequisites

- [Node.js](https://nodejs.org) 18 or later
- Claude Desktop or Cursor (any MCP-compatible host)

## Install

```bash
npx @untitledfinancial/dpx-mcp
```

Or install from [Smithery](https://smithery.ai/server/@untitledfinancial/dpx-mcp) with one click.

## Configure Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "dpx": {
      "command": "npx",
      "args": ["-y", "@untitledfinancial/dpx-mcp"],
      "env": {
        "STABILITY_ORACLE_URL": "https://stability.untitledfinancial.com",
        "SETTLEMENT_AGENT_URL": "https://agent.untitledfinancial.com",
        "SANDBOX_MODE": "true"
      }
    }
  }
}
```

Restart Claude Desktop — **DPX** appears in the MCP toolbar with 71 tools.

:::note[Sandbox mode]
`SANDBOX_MODE: "true"` means `settle` runs real calculations with no on-chain execution. Set to `"false"` only when you are ready for live settlements with real USDC.
:::

## Configure Cursor

**Settings → MCP → Add Server**:

```json
{
  "dpx": {
    "command": "npx",
    "args": ["-y", "@untitledfinancial/dpx-mcp"],
    "env": {
      "STABILITY_ORACLE_URL": "https://stability.untitledfinancial.com",
      "SETTLEMENT_AGENT_URL": "https://agent.untitledfinancial.com",
      "SANDBOX_MODE": "true"
    }
  }
}
```

## Available tools (71)

### Settlement & Oracle

| Tool | What it does |
|---|---|
| `protocol.manifest` | DPX capabilities, supported assets, contract addresses |
| `settlement.quote` | Binding fee quote — core, FX, ESG, license, net amount (300s TTL) |
| `settlement.execute` | **Execute a settlement** — cross-border or domestic — oracle + rail check → on-chain |
| `settlement.status` | Look up any settlement by ID |
| `oracle.stability` | Oracle stability status — STABLE / CAUTION / UNSTABLE (cross-border and domestic) |
| `oracle.status` | Full 9-layer Stability Oracle v9.0 signal — ESG Oracle is separate |
| `oracle.rails` | **Live health of local payment rails** — PIX, SEPA, FedACH, CHAPS, UPI, PromptPay |
| `oracle.intelligence` | MPP-gated macro intelligence briefing — 0.001 USDC/call on Base mainnet |
| `oracle.mycelium` | **Mycelium Network Oracle** — financial system network topology, crisis detection 6–14 weeks ahead |

### Fees & Analytics

| Tool | What it does |
|---|---|
| `fees.schedule` | Complete fee table with volume tiers |
| `fees.verify` | Confirm off-chain quote matches on-chain router |
| `fees.compare` | DPX vs bank wire, SWIFT, and other rails |
| `analytics.overview` | Protocol-level analytics overview |
| `dpx.metrics` | Live DPX protocol metrics |
| `protocol.investment_context` | Structured investment memo for AI due diligence agents |

### ESG

| Tool | What it does |
|---|---|
| `esg.score` | Live E/S/G scores for a wallet address or LEI — includes SFDR PAI indicators |
| `esg.lookup` | Resolve a company name, domain, or ticker to a LEI via GLEIF and return the full ESG score — no LEI required |
| `esg.batch` | Screen up to 50 entities in one call (LEIs or names), results ranked by composite score |
| `esg.watch` | Register an entity for ongoing ESG monitoring — fires a webhook when score shifts by ≥ N points |
| `esg.portfolio` | Score an entire counterparty portfolio (up to 200 entities) — composite E/S/G, MiCA Article 72 status, SFDR PAI flags, worst offenders |
| `oracle.governance` | Live governance score for any entity by LEI or name — GLEIF + World Bank WGI, tier and MiCA compliance flag |
| `intelligence.tectonic` | Structural fault stress across 22 nodes — demographic, fiscal, environmental, infrastructure, geopolitical; years to rupture per fault line |
| `intelligence.aftershock` | Secondary wave modeling after a primary cascade — three waves covering immediate effects, policy rebounds, and structural lock-in |
| `intelligence.contagion` | Network contagion simulation across 30 nodes — R-value trajectory, superspreaders, containment forecast |
| `intelligence.resonance` | Detects when macro signals are oscillating in phase across 28 signals, amplifying toward systemic crisis |
| `intelligence.gender_risk` | GBV risk + economic opportunity scores for 18 countries — LFPR gaps, legal index, FRED stress feedback |
| `intelligence.subscribe` | Register a webhook for macro signal threshold alerts — stability, cascade, macro stress, climate, or FX |
| `intelligence.subscription.get` | Check subscription status and last signal score |
| `intelligence.subscription.delete` | Cancel an intelligence subscription |
| `esg.trend` | Historical ESG composite trend for a LEI — direction, delta, and score history |
| `compliance.ubo_chain` | GLEIF beneficial ownership chain (up to 3 levels) + sanctions screen at each node — FATF R.16 UBO attestation |
| `compliance.pep_screen` | Screen an individual against the OpenSanctions PEP dataset — FATF R.12/13 EDD trigger |
| `compliance.regulatory_calendar` | Upcoming and in-effect compliance obligations: MiCA, SFDR, CSRD, GENIUS Act, FATF |
| `stability.corridor` | Corridor-specific stability score for any currency pair — regulatory flags + FX session liquidity + cascade penalty. Returns SETTLE_NOW / DELAY_24H / DELAY_48H |
| `stability.settlement_window` | Optimal 4-hour execution windows over 72h horizon — ranked by corridor stability, liquidity, cascade decay, counterparty ESG tier (if LEI provided) |
| `stability.stablecoin_route` | Multi-stablecoin routing — recommends optimal stablecoin path (USDC, EURC, BRLA, MXNC, NGNC, AEDX, PYUSD…) for any currency pair. Flags blocked routes (e.g. USDT under MiCA, BRLA before Oct 2026 deadline) |

### Agent Identity & Mandates (KYA / AP2)

| Tool | What it does |
|---|---|
| `agent.kya_register` | KYA — Know Your Agent. Three tiers, no documents ever. **ANONYMOUS** (name only, $1K/day): instant. **REGISTERED** (name + email, $25K/day): instant self-attestation. **VERIFIED** (provide a GLEIF LEI): DPX confirms ACTIVE status via the public GLEIF API and grants VERIFIED instantly — no documents, no manual review. LEI issuers have already done identity verification; DPX inherits it. VERIFIED agents get institutional caps, FATF R.16 attestation on every settlement, and full AP2 mandate support |
| `agent.mandate_create` | Create or update an AP2-compatible spend mandate for a REGISTERED or VERIFIED agent — max notional, daily cap, counterparty whitelist, currency pair restrictions, ESG floor, expiry. REGISTERED caps are clamped to the $25K tier limit; VERIFIED agents set their own. Enforced at settlement time |
| `agent.kya_verify` | Verify a registered agent and receive a signed 1-hour credential with effective spend caps and FATF R.16 compliance attestation. Attach as X-Agent-Credential header on settlement requests |

### Integration

| Tool | What it does |
|---|---|
| `integration.verify` | Verify a DPX integration is correctly configured |
| `integration.status` | Check live status of a connected DPX integration |

### Treasury

| Tool | What it does |
|---|---|
| `treasury.yield_route` | Auto-yield routing — compare sUSDS, Mercury Treasury, and other yield options for idle balances |

### Ramp Integration

| Tool | What it does |
|---|---|
| `ramp.compliance_screen` | Pre-screen a counterparty before issuing an Agent Card — sanctions, PEP, FATF country risk, UBO chain. Returns APPROVED / FLAGGED / BLOCKED with `humanRequired` boolean. Removes human review for clean payments (~95%). APPROVED: proceed automatically. BLOCKED: halt. FLAGGED: route to queue |
| `ramp.connect` | Connect a Ramp corporate card account via OAuth |
| `ramp.spend_analysis` | Analyse Ramp wire + international bill volume — surfaces DPX settlement opportunity |
| `ramp.agent_card` | Create a scoped Ramp Agent Card (single-use, merchant-capped) |
| `ramp.settle` | Agent Card + DPX settlement in one call — returns pacs.002 + SFDR PAI indicators |

### Mercury Banking

| Tool | What it does |
|---|---|
| `mercury.accounts` | List all Mercury accounts with live balances |
| `mercury.transactions` | List recent transactions for a Mercury account — DPX-tagged payments flagged |
| `mercury.send` | Initiate a payment — ACH, domestic wire, or international wire — with optional DPX routing |
| `mercury.ach_authorize` | Compliance pre-screening via DPX AML oracle before ACH execution — APPROVED / FLAGGED / BLOCKED |
| `mercury.sweep` | Yield routing analysis for idle Mercury balances — evaluates sUSDS deployment viability, expected net yield, and exit timing. Analysis only; does not move funds. |

### SWIFT

| Tool | What it does |
|---|---|
| `swift.gpi_track` | Track a DPX settlement via SWIFT gpi-compatible status — returns pacs.002 payload a SWIFT member bank submits to the gpi Tracker |

### Market Intelligence

| Tool | What it does |
|---|---|
| `market.cascade` | **Butterfly Effect Cascade** — model how a macro shock propagates through 24 interconnected nodes across climate, geopolitical, economic, and commodity domains |
| `market.shipping` | **Shipping & Logistics Stress** — freight conditions, trade route disruptions, invoice delay risk, and corridor impact |
| `market.fx` | **FX Settlement Corridor Intelligence** — per-pair execution risk for 10 major USD corridors with settlement advice |

## Example prompts

**Pricing and analysis:**
- *"Price a $2M cross-border settlement at ESG score 75"*
- *"Price a $500K domestic USD settlement — what's the all-in fee with no FX?"*
- *"Compare our fees to Stripe and SWIFT for a $500K transfer"*
- *"What's the Sovereign tier volume discount and what does it save us monthly?"*

**Oracle and conditions:**
- *"Is the oracle stable enough to execute a $5M settlement today?"*
- *"What is the current stability score and what's driving it?"*
- *"Are there any active war mitigation protocols affecting the basket?"*

**Local rail health:**
- *"Is PIX operational before I send this Brazil payment?"*
- *"Check SEPA and FedACH health — I have settlements going to both today"*
- *"What's the status of all payment rails in Asia right now?"*

**Mercury banking:**
- *"Show my Mercury balances and flag any DPX-tagged transactions"*
- *"Run ACH compliance screening on this payment before I send it"*
- *"Pay $50,000 to our EU supplier via DPX — route through Mercury"*

**Ramp:**
- *"Analyse my Ramp spend and tell me how much I'd save routing wires through DPX"*
- *"Screen this vendor payment before issuing the Agent Card — Acme GmbH, Germany, $250,000, LEI 7LTWFZYICNSX8D621K86"*
- *"Create an Agent Card for $15,000 and settle to 0x... via DPX"*

**Market intelligence:**
- *"Model a Strait of Hormuz disruption at magnitude 70 — what cascades and when?"*
- *"What's the Mycelium network health score and is there a fruiting body risk forming?"*
- *"Check FX corridor risk for USD/JPY and USD/BRL before I execute these settlements"*

**Settlement execution (sandbox):**
- *"Get a quote and execute a $100,000 intercompany settlement to 0x1E05... in sandbox mode"*
- *"Check oracle and rail conditions, then settle $500K USD domestic to 0x... with reference INV-2026-001"*
- *"Execute the full settlement flow for our Q2 intercompany transfer — $2M, USD→USD, sandbox"*

**Status and audit:**
- *"Look up settlement dpx_a1b2c3... and show me the full receipt"*
- *"What was the oracle status when that settlement executed?"*

## The full settlement flow in Claude

### Cross-border
```
You: "Check oracle conditions and execute a $100,000 intercompany settlement 
to 0x<recipient-address> in sandbox mode"

Claude calls:
  1. oracle.stability → STABLE (88/100), IMPROVING
  2. settlement.quote → quoted fee, net amount, quoteId dpx_abc...
  3. settlement.execute → { status: "sandbox", settlementId: "dpx_7f8a...",
                netAmount: 98615, reasoning: "Oracle stable, executing" }
```

### Domestic (intra-country)
```
You: "Check rail health and settle $500K USD→USD domestic to 0x... sandbox"

Claude calls:
  1. oracle.rails (region: "us") → FedACH: OPERATIONAL
  2. oracle.stability → STABLE (91/100)
  3. settlement.quote (hasFx: false) → quoted fee (no FX component), net amount
  4. settlement.execute → { status: "sandbox", settlementId: "dpx_9c2e...",
                netAmount: 495700, reasoning: "Rail operational, oracle stable" }
```

### Mercury + DPX
```
You: "Pay $50,000 to our EU supplier via DPX"

Claude calls:
  1. mercury.accounts → finds available balance
  2. oracle.stability → confirms STABLE conditions
  3. settlement.quote → binding fee quote, 300s TTL
  4. mercury.send → initiates wire tagged dpx:0x...
     → DPX webhook → oracle + AI synthesis → quoteId returned
     → caller executes router.settle() on Base
```

No browser. No API call. No manual fee calculation. The full loop in one prompt.

## Transport

stdio (JSON-RPC 2.0). All tool logging goes to stderr; stdout is reserved for the protocol stream.

---

### Commodity Forecast (5 tools)

| Tool | Description |
|---|---|
| `forecast.commodity_outlook` | Climate-driven price pressure signal for a commodity — BULLISH/BEARISH/NEUTRAL with 30/60/90-day horizons, regional stressor breakdown, and FRED price reference. Covers WHEAT, CORN, SOYB, COFFEE, COCOA, COTTON, SUGAR, WTI, NG, COPPER, LUMBER |
| `forecast.portfolio_stress` | Climate stress test for a multi-commodity portfolio (up to 20 positions). Returns aggregate climate score, stressed positions, and hedge candidates |
| `forecast.scenario` | What-if scenario analysis. Apply a named scenario (La Niña, Gulf hurricane, Black Sea disruption, Brazil frost, etc.) or custom stressor multipliers to any commodity set |
| `forecast.production_regions` | All ~40 global production regions ranked by current climate risk score with affected commodity list |
| `forecast.calendar` | Seasonal climate event calendar — 12 critical annual windows (hurricane season, corn pollination, frost risk, ENSO influence periods) sorted by urgency |

### Multi-stablecoin Routing (1 tool)

| Tool | Description |
|---|---|
| `route` | Ranks USDC, EURC, and USDT for any amount + currency pair. EURC is recommended for EUR destinations — eliminates cross-currency conversion. Returns all three options with rationale and a ready-to-use `/settle` body for the top-ranked token. Free. |

### Agentic Operations (6 tools)

| Tool | Description |
|---|---|
| `flow_check` | **Single pre-flight call** — runs oracle check, compliance screen, and stablecoin routing in parallel. Returns `decision` (PROCEED/HOLD/BLOCKED), recommended token, estimated net received, and a ready-to-use `settleBody`. Replaces the 3-step agent loop. |
| `batch_settle` | Submit up to 50 settlements in one call. Runs concurrently — one failure does not block others. Returns `summary` (total/succeeded/failed) and per-item results. |
| `invoice.create` | Create an agent-to-agent invoice. Returns an `invoiceId` and `payUrl`. Agent B calls `invoice.pay` to settle. Expires after configurable TTL (default 24h). Free. |
| `invoice.get` | Retrieve an invoice by ID — check status (OPEN/PAID/EXPIRED), amount, and expiry before paying. Free. |
| `invoice.pay` | Pay an invoice by ID. Retrieves the invoice, executes settlement, and marks it PAID. In sandbox mode returns a simulated receipt; live mode returns on-chain execution parameters. |
| `settle.subscribe` | Register a webhook callback for `settlement.completed` events. Delivers HMAC-signed POSTs with 3× retry. Returns `webhookSecret` once — store immediately. Free. |

### FX Intelligence (3 tools)

| Tool | Description |
|---|---|
| `fx.rate` | Live mid-market rate for any currency pair. Returns mid, bid, ask, implied spread, daily volatility %, and regulatory corridor flags. Sourced from central bank rates — no API key, no cost. Free. |
| `fx.cost_certainty` | All-in settlement cost quote: exact amount received in target currency after rail fees, 48h FX cost variance expressed in dollars, corridor stability overlay, and optimal execution window. Answers "if I send $X, what does my counterparty receive net of everything?" |
| `fx.corridors` | All 60+ corridors ranked OPTIMAL → ADVERSE with current stability score, daily volatility estimate, and regulatory flags. Compare corridors before choosing a payment route. Free. |

**Example prompts:**

```
"What is the USD/BRL rate right now and what are the regulatory risks for this corridor?"

"If I send $2M USD to a Brazilian supplier, how many BRL do they receive after all fees, and how certain is that number over the next 48 hours?"

"Which LATAM corridors are most stable for a large payment this week?"

"Compare USD/MXN, USD/BRL, and USD/COP for a $500K payment — which has the lowest FX cost uncertainty?"
```

**Example prompts:**

```
"What is the climate outlook for wheat over the next 90 days?"

"Stress-test my commodity portfolio: 30% wheat, 25% corn, 20% soybeans, 15% coffee, 10% sugar under a La Niña scenario"

"What happens to copper if the Atacama enters severe drought?"

"Which commodity production regions are under the most climate stress right now?"

"What seasonal climate events should I be watching for July through September?"
```
