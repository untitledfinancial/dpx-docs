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

## Stablecoin routing and compliance tools

```python
AGENT_URL      = "https://agent.untitledfinancial.com"
COMPLIANCE_URL = "https://compliance.untitledfinancial.com"

@tool
def dpx_route(amount: float, from_currency: str, to_currency: str) -> dict:
    """Rank USDC, EURC, and USDT for this currency pair. Returns recommended token and settleBody."""
    return httpx.get(f"{AGENT_URL}/route", params={
        "amount": amount, "from": from_currency, "to": to_currency
    }).json()

@tool
def dpx_screen_counterparty(address: str, lei: str = "") -> dict:
    """AML/sanctions/FATF screen. Returns APPROVED, FLAGGED, or BLOCKED with risk signals."""
    params = {"address": address}
    if lei:
        params["lei"] = lei
    return httpx.get(f"{COMPLIANCE_URL}/compliance/screen", params=params).json()

@tool
def dpx_vendor_risk(name: str, address: str = "", lei: str = "") -> dict:
    """Composite 0–100 vendor risk score (65% compliance + 35% ESG). Returns tier: LOW/MODERATE/ELEVATED/HIGH."""
    return httpx.post(f"{COMPLIANCE_URL}/vendor-risk", json={
        "name": name, "wallet": address, "lei": lei
    }).json()
```

## LangGraph reference agent

A typed state-graph implementation is in the DPX Python SDK:

```bash
git clone https://github.com/untitledfinancial/dpx-protocol
cd dpx-protocol/dpx-python-sdk
pip install langgraph langchain-anthropic httpx
python examples/langgraph_settlement_agent.py
```

The graph runs: `screen → [BLOCKED → end] → esg_score → route → settle → done`

```python
from langgraph.graph import StateGraph, END

builder = StateGraph(SettlementState)
builder.add_node("screen",    node_screen)
builder.add_node("esg_score", node_esg_score)
builder.add_node("route",     node_route)
builder.add_node("settle",    node_settle)
builder.add_node("blocked",   node_blocked)

builder.set_entry_point("screen")
builder.add_conditional_edges("screen", route_after_screen,
    {"blocked": "blocked", "esg_score": "esg_score"})
builder.add_edge("esg_score", "route")
builder.add_edge("route",     "settle")
builder.add_edge("settle",    END)
builder.add_edge("blocked",   END)
```

No API key required for compliance, ESG, or routing nodes. Settlement node requires x402 payment in live mode (`SANDBOX=false`).

## Available tools

| Tool | Endpoint | Auth |
|---|---|---|
| `dpx_get_quote` | `stability.untitledfinancial.com/quote` | None |
| `dpx_get_reliability` | `stability.untitledfinancial.com/reliability` | None |
| `dpx_get_esg_score` | `stability.untitledfinancial.com/esg/score` | None |
| `dpx_get_manifest` | `stability.untitledfinancial.com/manifest` | None |
| `dpx_verify_fees` | `stability.untitledfinancial.com/verify-fees` | None |
| `dpx_route` | `agent.untitledfinancial.com/route` | None |
| `dpx_screen_counterparty` | `compliance.untitledfinancial.com/compliance/screen` | None |
| `dpx_vendor_risk` | `compliance.untitledfinancial.com/vendor-risk` | None |

## MCP adapter (recommended for Claude)

For LangChain agents that need to call Claude or run alongside Claude Desktop, use the [MCP integration](/integrations/mcp) instead — it gives schema updates automatically and works natively with all MCP-compatible hosts.

## Environment

```sh
STABILITY_ORACLE_URL=https://stability.untitledfinancial.com
ESG_ORACLE_URL=https://esg.untitledfinancial.com
```

Both endpoints are public. No API key required for pricing and monitoring.
