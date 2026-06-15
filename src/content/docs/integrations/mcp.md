---
title: MCP — Connect Claude
description: Connect Claude Desktop, Cursor, or any MCP-compatible host to DPX. Price settlements, check stability, execute cross-border and domestic settlements, check local rail health, and retrieve ESG scores natively in conversation.
---

The DPX MCP server v2.5.0 gives Claude Desktop, Cursor, and any MCP-compatible host native access to the full DPX settlement lifecycle — from oracle checks to live settlement execution. 23 tools covering settlement, oracle queries, ESG scoring, analytics, Ramp card integration, compliance screening, network topology intelligence, butterfly effect cascade analysis, shipping stress, FX corridor intelligence, and macro intelligence briefings. Supports both **cross-border** and **domestic (intra-country)** settlements. No browser, no API calls, no copy-paste. Claude can price, evaluate conditions, check local payment rail health, and execute settlements directly in conversation.

**Also available on [Smithery](https://smithery.ai/server/@untitledfinancial/dpx-mcp)** — install with one click from the Smithery marketplace.

**Also compatible with [ElevenLabs Conversational AI](/integrations/elevenlabs)** — point any ElevenLabs voice agent at `https://mcp.untitledfinancial.com/mcp` with SSE transport to access all 23 tools mid-conversation.

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

Restart Claude Desktop — **DPX** appears in the MCP toolbar with 23 tools.

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

## Available tools (23)

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
| `esg.score` | Live E/S/G scores for a wallet address |

### Ramp Integration

| Tool | What it does |
|---|---|
| `ramp.connect` | Connect a Ramp corporate card account |
| `ramp.spend_analysis` | Analyse Ramp card spend patterns |
| `ramp.agent_card` | Issue or configure a Ramp agent card |
| `ramp.settle` | Settle a Ramp card transaction via DPX |

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

**Market intelligence:**
- *"Model a Strait of Hormuz disruption at magnitude 70 — what cascades and when?"*
- *"What's the Mycelium network health score and is there a fruiting body risk forming?"*
- *"Check FX corridor risk for USD/JPY and USD/BRL before I execute these settlements"*
- *"Are there any freight disruptions that could create invoice delay risk on my Asia-Pacific corridor?"*

**Settlement execution (sandbox):**
- *"Get a quote and execute a $100,000 intercompany settlement to 0x1E05... in sandbox mode"*
- *"Check oracle and rail conditions, then settle $500K USD domestic to 0x... with reference INV-2026-001"*
- *"Execute the full settlement flow for our Q2 intercompany transfer — $2M, USD→USD, sandbox"*
- *"Check SEPA health and execute a €250K EUR→EUR domestic settlement to 0x..."*

**Status and audit:**
- *"Look up settlement dpx_a1b2c3... and show me the full receipt"*
- *"What was the oracle status when that settlement executed?"*

## The full settlement flow in Claude

### Cross-border
```
You: "Check oracle conditions and execute a $100,000 intercompany settlement 
to 0x1E05306A20A738917EFa010f5BE3fb5EE7290dD8 in sandbox mode"

Claude calls:
  1. get_reliability → STABLE (88/100), IMPROVING
  2. get_quote → quoted fee, net amount, quoteId dpx_abc...
  3. settle → { status: "sandbox", settlementId: "dpx_7f8a...",
                netAmount: 98615, reasoning: "Oracle stable, executing" }
```

### Domestic (intra-country)
```
You: "Check rail health and settle $500K USD→USD domestic to 0x... sandbox"

Claude calls:
  1. get_rail_status (region: "us") → FedACH: OPERATIONAL
  2. get_reliability → STABLE (91/100)
  3. get_quote (hasFx: false) → quoted fee (no FX component), net amount
  4. settle → { status: "sandbox", settlementId: "dpx_9c2e...",
                netAmount: 495700, reasoning: "Rail operational, oracle stable" }
```

No browser. No API call. No manual fee calculation. The full loop in one prompt.

## Transport

stdio (JSON-RPC 2.0). All tool logging goes to stderr; stdout is reserved for the protocol stream.
