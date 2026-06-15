---
title: CrewAI
description: Use DPX settlement tools inside CrewAI agents and multi-agent crews.
---

Connect CrewAI agents to DPX oracle and settlement endpoints. Install the published package or define tools directly using the `@tool` decorator.

## Installation

```bash
pip install dpx-crewai
# or install CrewAI and define tools manually:
pip install crewai crewai-tools httpx
```

## Using dpx-crewai (PyPI package)

```python
from dpx_crewai import get_dpx_tools
from crewai import Agent, Task, Crew

tools = get_dpx_tools()

treasury_agent = Agent(
    role="Treasury Intelligence Specialist",
    goal="Evaluate settlement conditions and provide fee-accurate routing recommendations.",
    backstory="You monitor macro stability, ESG standing, and fee structure for cross-border B2B settlements.",
    tools=tools,
    verbose=True
)

task = Task(
    description="Check oracle stability, get the ESG score for wallet 0xABC, and quote a $1.5M cross-border settlement.",
    expected_output="Oracle status, ESG score, full fee breakdown, and net recipient amount.",
    agent=treasury_agent
)

crew = Crew(agents=[treasury_agent], tasks=[task], verbose=True)
result = crew.kickoff()
print(result)
```

## Manual tool definition

```python
import httpx
from crewai.tools import tool

STABILITY_URL = "https://stability.untitledfinancial.com"
ESG_URL       = "https://esg.untitledfinancial.com"

@tool("DPX Oracle Stability Check")
def dpx_oracle_check() -> dict:
    """Check current macro stability. Returns STABLE, CAUTION, or UNSTABLE with score and reasoning. Call before any settlement."""
    return httpx.get(f"{STABILITY_URL}/reliability").json()

@tool("DPX Settlement Quote")
def dpx_settlement_quote(amount_usd: float, has_fx: bool = False, esg_score: int = 75) -> dict:
    """Get a binding fee quote for a DPX settlement. Returns core, FX, ESG fees, all-in rate, and net amount. Valid 300 seconds."""
    return httpx.get(f"{STABILITY_URL}/quote", params={
        "amountUsd": amount_usd,
        "hasFx": str(has_fx).lower(),
        "esgScore": esg_score
    }).json()

@tool("DPX ESG Score")
def dpx_esg_score(address: str) -> dict:
    """Get live ESG score for a counterparty wallet address. Score 0-100 — higher is lower compliance fee."""
    return httpx.get(f"{ESG_URL}/esg-score", params={"address": address}).json()
```

## Multi-agent crew example

```python
from crewai import Agent, Task, Crew, Process

compliance_agent = Agent(
    role="Compliance Analyst",
    goal="Screen counterparty ESG standing and flag any AML concerns.",
    tools=[dpx_esg_score],
)

treasury_agent = Agent(
    role="Treasury Operator",
    goal="Price and route cross-border settlements efficiently.",
    tools=[dpx_oracle_check, dpx_settlement_quote],
)

crew = Crew(
    agents=[compliance_agent, treasury_agent],
    tasks=[compliance_task, settlement_task],
    process=Process.sequential
)
```

## Available tools

| Tool | Endpoint |
|---|---|
| Oracle stability | `stability.untitledfinancial.com/reliability` |
| Settlement quote | `stability.untitledfinancial.com/quote` |
| ESG score | `esg.untitledfinancial.com/esg-score` |
| Rail health | `stability.untitledfinancial.com/rail-status` |
| Protocol manifest | `stability.untitledfinancial.com/manifest` |

## PyPI

```
https://pypi.org/project/dpx-crewai/
```

No API key required for oracle and pricing endpoints.
