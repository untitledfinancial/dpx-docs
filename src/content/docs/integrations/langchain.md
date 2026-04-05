---
title: LangChain — Python Tools
description: Use DPX pricing and stability endpoints as LangChain tools in Python agents.
---

Connect any LangChain agent to DPX by wrapping the oracle REST endpoints with the `@tool` decorator. No SDK or API key required — all pricing endpoints are public.

## Installation

```bash
pip install langchain langchain-openai httpx
```

## Define the tools

```python
import httpx
from langchain_core.tools import tool

STABILITY_URL = "https://stability.untitledfinancial.com"
ESG_URL = "https://esg.untitledfinancial.com"

@tool
def dpx_get_quote(amount_usd: float, has_fx: bool = False, esg_score: int = 75) -> dict:
    """Get a binding DPX fee quote for a settlement. Returns core, FX, ESG, and license components plus a quoteId valid for 300 seconds."""
    r = httpx.get(f"{STABILITY_URL}/quote", params={
        "amountUsd": amount_usd,
        "hasFx": str(has_fx).lower(),
        "esgScore": esg_score
    })
    return r.json()

@tool
def dpx_get_reliability() -> dict:
    """Check current peg stability and oracle health before a large settlement. Returns stability score, peg deviation, and confidence level."""
    return httpx.get(f"{STABILITY_URL}/reliability").json()

@tool
def dpx_get_esg_score() -> dict:
    """Get live Environmental, Social, and Governance scores from the DPX ESG Oracle. Returns E, S, G sub-scores and the current ESG fee component."""
    return httpx.get(f"{ESG_URL}/esg-score").json()

@tool
def dpx_get_manifest() -> dict:
    """Get the DPX protocol manifest — contract addresses, fee configuration, and supported capabilities."""
    return httpx.get(f"{STABILITY_URL}/manifest").json()

@tool
def dpx_verify_fees() -> dict:
    """Verify that the current fee quote matches on-chain enforcement via the deployed smart contracts."""
    return httpx.get(f"{STABILITY_URL}/verify-fees").json()

dpx_tools = [
    dpx_get_quote,
    dpx_get_reliability,
    dpx_get_esg_score,
    dpx_get_manifest,
    dpx_verify_fees,
]
```

## Wire into an agent

```python
from langchain_openai import ChatOpenAI
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate

llm = ChatOpenAI(model="gpt-4o")

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a treasury intelligence assistant with access to DPX settlement pricing tools."),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

agent = create_tool_calling_agent(llm, dpx_tools, prompt)
executor = AgentExecutor(agent=agent, tools=dpx_tools, verbose=True)

result = executor.invoke({
    "input": "Price a $2M cross-border settlement with ESG score 75 and check if stability is healthy enough to proceed."
})
print(result["output"])
```

## Available tools

| Tool | Description |
|---|---|
| `dpx_get_quote` | Full fee breakdown — core, FX, ESG, license + quoteId |
| `dpx_get_reliability` | Stability score, peg deviation, oracle confidence |
| `dpx_get_esg_score` | Live E, S, G scores and current ESG fee |
| `dpx_get_manifest` | Contract addresses and protocol capabilities |
| `dpx_verify_fees` | On-chain fee verification |

## MCP adapter (recommended for Claude)

For LangChain agents that need to call Claude or run alongside Claude Desktop, use the [MCP integration](/integrations/mcp) instead — it gives schema updates automatically and works natively with all MCP-compatible hosts.

## Environment

```sh
STABILITY_ORACLE_URL=https://stability.untitledfinancial.com
ESG_ORACLE_URL=https://esg.untitledfinancial.com
```

Both endpoints are public. No API key required for pricing and monitoring.
