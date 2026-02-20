---
title: MCP — Connect Claude
description: Connect Claude Desktop to DPX using the Model Context Protocol (MCP).
---

The DPX MCP server gives Claude Desktop native access to all pricing, stability, and ESG endpoints. No browser required — Claude can price settlements and check stability directly in conversation.

## Setup

### 1. Install dependencies

```bash
cd ~/Documents/GitHub/DPX-Dashborad/dpx-mcp
npm install
```

### 2. Add to Claude Desktop config

Open `~/Library/Application Support/Claude/claude_desktop_config.json` and add:

```json
{
  "mcpServers": {
    "dpx": {
      "command": "node",
      "args": ["/Users/victoriacase/Documents/GitHub/DPX-Dashborad/dpx-mcp/index.js"],
      "env": {
        "STABILITY_ORACLE_URL": "http://localhost:3000",
        "ESG_ORACLE_URL": "http://localhost:3001"
      }
    }
  }
}
```

### 3. Restart Claude Desktop

The DPX tools will appear in Claude's tool list.

## Available tools

| Tool | Description |
|---|---|
| `get_manifest` | Protocol capabilities and contract addresses |
| `get_quote` | Full fee breakdown for a settlement |
| `get_esg_score` | Live E, S, G scores and current fee |
| `get_reliability` | Stability signals and peg health |
| `get_fee_schedule` | Complete fee table |
| `verify_fees` | Confirm on-chain fees match quote |
| `get_oracle_status` | Raw oracle output |
| `compare_to_competitors` | DPX vs Stripe, Wise, SWIFT |

## Example prompts

Once connected, you can ask Claude:

- *"Price a $2M cross-border settlement at our current ESG score"*
- *"Is the oracle stable enough to proceed with a $10M settlement today?"*
- *"How do our fees compare to Stripe for a $500K transfer?"*
- *"Get a quote and tell me the quoteId — I'll need it for execution"*

## Transport

The MCP server uses **stdio transport** (JSON-RPC 2.0). All tool logging goes to stderr; stdout is reserved for the protocol.

## Source

```
/Users/victoriacase/Documents/GitHub/DPX-Dashborad/dpx-mcp/index.js
```
