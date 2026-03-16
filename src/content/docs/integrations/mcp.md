---
title: MCP — Connect Claude
description: Connect Claude Desktop, Cursor, or any MCP-compatible host to DPX using the Model Context Protocol. Price settlements, check stability, and retrieve ESG scores natively in conversation.
---

The DPX MCP server gives Claude Desktop and Cursor native access to all pricing, stability, and ESG endpoints. No browser, no copy-paste — Claude can price settlements, check peg health, and compare fees directly in conversation using live protocol data.

## Prerequisites

- [Node.js](https://nodejs.org) 18 or later
- Claude Desktop or Cursor (any MCP-compatible host)
- DPX MCP package — available to beta partners ([request access](/beta))

## Install

```bash
npm install -g @untitledfinancial/dpx-mcp
```

Or clone and build locally (for beta partners with repo access):

```bash
git clone https://github.com/untitledfinancial/dpx-mcp
cd dpx-mcp
npm install && npm run build
```

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
        "ESG_ORACLE_URL": "https://esg.untitledfinancial.com"
      }
    }
  }
}
```

If you cloned the repo locally, replace the `command`/`args` with:

```json
{
  "mcpServers": {
    "dpx": {
      "command": "node",
      "args": ["/absolute/path/to/dpx-mcp/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop. You should see **DPX** listed under MCP in the toolbar.

## Configure Cursor

In Cursor: **Settings → MCP → Add Server** and paste:

```json
{
  "dpx": {
    "command": "npx",
    "args": ["-y", "@untitledfinancial/dpx-mcp"],
    "env": {
      "STABILITY_ORACLE_URL": "https://stability.untitledfinancial.com",
      "ESG_ORACLE_URL": "https://esg.untitledfinancial.com"
    }
  }
}
```

## Verify the connection

Ask Claude:

> *"Use the DPX tools to get me a quote for a $1M cross-border settlement"*

You should see Claude call `get_quote` and return a full fee breakdown with a `quoteId`.

## Available tools

| Tool | Description |
|---|---|
| `get_manifest` | Protocol capabilities and contract addresses |
| `get_quote` | Full fee breakdown for a settlement |
| `get_esg_score` | Live E, S, G scores and current fee |
| `get_reliability` | Stability signals and peg health |
| `get_fee_schedule` | Complete fee table with volume tiers |
| `verify_fees` | Confirm on-chain fees match quote |
| `get_oracle_status` | Raw oracle output |
| `compare_to_competitors` | DPX vs Stripe, Wise, SWIFT |

## Example prompts

Once connected, you can ask Claude:

- *"Price a $2M cross-border settlement at our current ESG score"*
- *"Is the oracle stable enough to proceed with a $10M settlement today?"*
- *"How do our fees compare to Stripe for a $500K transfer?"*
- *"Get a quote and tell me the quoteId — I'll need it for execution"*
- *"What's our current ESG score and how much would improving it by 10 points save on a $5M monthly volume?"*

## Transport

The MCP server uses **stdio transport** (JSON-RPC 2.0). All tool logging goes to stderr; stdout is reserved for the protocol.

## Source

Available to beta partners. [Request access →](/beta)
