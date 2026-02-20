---
title: LangChain — Python Tools
description: Use DPX as LangChain tools in Python agents.
---

The DPX LangChain tools let any Python agent price settlements, check stability, and retrieve ESG scores using the standard `@tool` decorator pattern.

## Installation

```bash
pip install langchain langchain-openai httpx
```

## Tool file

```
/Users/victoriacase/Documents/GitHub/DPX-Dashborad/dpx-agents/langchain_tools.py
```

## Available tools

| Tool | Description |
|---|---|
| `dpx_get_manifest` | Protocol capabilities and contract addresses |
| `dpx_get_quote` | Full fee breakdown for a settlement |
| `dpx_get_esg_score` | Live E, S, G scores |
| `dpx_get_reliability` | Stability signals |
| `dpx_verify_fees` | On-chain fee verification |
| `dpx_get_fee_schedule` | Complete fee table |
| `dpx_compare_fees` | DPX vs Stripe, Wise, SWIFT |

## Usage

```python
from langchain_tools import dpx_tools
from langchain_openai import ChatOpenAI
from langchain.agents import create_tool_calling_agent, AgentExecutor

llm = ChatOpenAI(model="gpt-4o")
agent = create_tool_calling_agent(llm, dpx_tools, prompt)
executor = AgentExecutor(agent=agent, tools=dpx_tools)

result = executor.invoke({
    "input": "Price a $2M cross-border settlement with ESG score 75"
})
```

## MCP adapter (recommended for production)

For production LangChain deployments, use the MCP adapter instead of direct HTTP tools. This gives you automatic schema updates whenever the protocol changes.

```python
from langchain_mcp_adapters.client import MultiServerMCPClient

client = MultiServerMCPClient({
    "dpx": {
        "command": "node",
        "args": ["/path/to/dpx-mcp/index.js"],
        "transport": "stdio"
    }
})

tools = await client.get_tools()
```

## Environment

```sh
STABILITY_ORACLE_URL=http://localhost:3000
ESG_ORACLE_URL=http://localhost:3001
```
