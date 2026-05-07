---
title: MCP — Connect Claude
description: Connect Claude Desktop, Cursor, or any MCP-compatible host to DPX. Price settlements, check stability, execute cross-border and domestic settlements, check local rail health, and retrieve ESG scores natively in conversation.
---

The DPX MCP server v2.1 gives Claude Desktop and Cursor native access to the full DPX settlement lifecycle — from oracle checks to live settlement execution. Supports both **cross-border** and **domestic (intra-country)** settlements. No browser, no API calls, no copy-paste. Claude can price, evaluate conditions, check local payment rail health, and execute settlements directly in conversation.

## Prerequisites

- [Node.js](https://nodejs.org) 18 or later
- Claude Desktop or Cursor (any MCP-compatible host)

## Install

```bash
cd /path/to/dpx-protocol/dpx-mcp
npm install
```

## Configure Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "dpx": {
      "command": "node",
      "args": ["/absolute/path/to/dpx-protocol/dpx-mcp/index.js"],
      "env": {
        "STABILITY_ORACLE_URL": "https://stability.untitledfinancial.com",
        "SETTLEMENT_AGENT_URL": "https://agent.untitledfinancial.com",
        "SANDBOX_MODE": "true"
      }
    }
  }
}
```

Replace `/absolute/path/to/dpx-protocol/dpx-mcp/index.js` with your actual path. Restart Claude Desktop — **DPX** appears in the MCP toolbar with 11 tools.

:::note[Sandbox mode]
`SANDBOX_MODE: "true"` means `settle` runs real calculations with no on-chain execution. Set to `"false"` only when you are ready for live settlements with real USDC.
:::

## Configure Cursor

**Settings → MCP → Add Server**:

```json
{
  "dpx": {
    "command": "node",
    "args": ["/absolute/path/to/dpx-protocol/dpx-mcp/index.js"],
    "env": {
      "STABILITY_ORACLE_URL": "https://stability.untitledfinancial.com",
      "SETTLEMENT_AGENT_URL": "https://agent.untitledfinancial.com",
      "SANDBOX_MODE": "true"
    }
  }
}
```

## Available tools (11)

| Tool | What it does |
|---|---|
| `get_manifest` | DPX capabilities, supported assets, contract addresses |
| `get_quote` | Binding fee quote — core, FX, ESG, license, net amount (300s TTL) |
| `get_esg_score` | Live E/S/G scores for a wallet address |
| `get_reliability` | Oracle stability status — STABLE / CAUTION / UNSTABLE (cross-border and domestic) |
| `get_oracle_status` | Full 9-layer oracle signal with AI briefing |
| `get_fee_schedule` | Complete fee table with volume tiers |
| `verify_fees` | Confirm off-chain quote matches on-chain router |
| `compare_to_competitors` | DPX vs Stripe, Wise, SWIFT, bank wire |
| `get_rail_status` | **Live health of local payment rails** — PIX, SEPA, FedACH, CHAPS, UPI, PromptPay |
| `settle` | **Execute a settlement** — cross-border or domestic — oracle + rail check → on-chain |
| `get_settlement_status` | Look up any settlement by ID |

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
  2. get_quote → 1.385% all-in, net $98,615, quoteId dpx_abc...
  3. settle → { status: "sandbox", settlementId: "dpx_7f8a...",
                netAmount: 98615, reasoning: "Oracle stable, executing" }
```

### Domestic (intra-country)
```
You: "Check rail health and settle $500K USD→USD domestic to 0x... sandbox"

Claude calls:
  1. get_rail_status (region: "us") → FedACH: OPERATIONAL
  2. get_reliability → STABLE (91/100)
  3. get_quote (hasFx: false) → 0.86% all-in (no FX fee), net $495,700
  4. settle → { status: "sandbox", settlementId: "dpx_9c2e...",
                netAmount: 495700, reasoning: "Rail operational, oracle stable" }
```

No browser. No API call. No manual fee calculation. The full loop in one prompt.

## Transport

stdio (JSON-RPC 2.0). All tool logging goes to stderr; stdout is reserved for the protocol stream.
