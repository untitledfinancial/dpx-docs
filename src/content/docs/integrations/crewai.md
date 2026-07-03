---
title: CrewAI
description: Autonomous invoice settlement using a two-agent CrewAI crew — compliance screen, ESG score, stablecoin routing, and execution.
---

Connect CrewAI agents to DPX for autonomous settlement workflows. The reference implementation uses a two-agent crew: a Compliance Officer screens the counterparty and scores ESG standing, then a Settlement Agent selects the optimal stablecoin route and executes.

## Reference agent

The complete reference implementation is in the DPX Python SDK:

```bash
git clone https://github.com/untitledfinancial/dpx-protocol
cd dpx-protocol/dpx-python-sdk
pip install crewai httpx
python examples/crewai_settlement_agent.py
```

The agent runs the full lifecycle against a sample invoice (USD → EUR, $85K):

1. **Compliance Agent** — screens the counterparty via `POST /compliance/screen`, fetches ESG score from `GET /esg/score`. Halts if BLOCKED.
2. **Settlement Agent** — calls `GET /route` to select the optimal stablecoin (EURC for EUR destinations), then executes via `POST /settle`.

Set `SANDBOX=false` to execute on Base mainnet. DPX returns execution parameters — the caller's wallet calls `approve()` + `router.settle()` on-chain.

## Crew structure

```python
from crewai import Agent, Task, Crew, Process

compliance_agent = Agent(
    role="Compliance Officer",
    goal="Screen the counterparty for AML, sanctions, and FATF risk. Fetch ESG score. Block if BLOCKED.",
    tools=[ScreenCounterpartyTool(), GetEsgScoreTool()],
)

settlement_agent = Agent(
    role="Settlement Execution Agent",
    goal="Select the optimal stablecoin route and execute the settlement.",
    tools=[GetRoutingTool(), ExecuteSettlementTool()],
)

crew = Crew(
    agents=[compliance_agent, settlement_agent],
    tasks=[compliance_task, settlement_task],
    process=Process.sequential,
)
result = crew.kickoff()
```

## Tools

| Tool | Endpoint | Auth |
|---|---|---|
| `screen_counterparty` | `compliance.untitledfinancial.com/compliance/screen` | None |
| `get_esg_score` | `stability.untitledfinancial.com/esg/score` | None |
| `get_stablecoin_route` | `agent.untitledfinancial.com/route` | None |
| `execute_settlement` | `agent.untitledfinancial.com/settle` | x402 (sandbox: none) |

No API key required for compliance, ESG, and routing endpoints. Settlement in live mode requires an x402 payment (USDC on Base mainnet).

## Routing logic

`GET /route` returns all three stablecoin options ranked:

- **EURC** is recommended when destination currency is EUR — eliminates cross-currency conversion and the associated FX fee
- **USDC** is ranked #2 for highest on-chain liquidity
- **USDT** is ranked #3 as an alternative when USDC liquidity is constrained

The response includes a `settleBody` ready to POST directly to `/settle`.

## Environment variables

```bash
SANDBOX=true    # set to false for live execution on Base mainnet
```

No `ANTHROPIC_API_KEY` or other credentials required for oracle/pricing/compliance endpoints.

## PyPI

```
pip install dpx-sdk
```

The `dpx_sdk.DPX` client wraps all endpoints synchronously. See [LangChain](/integrations/langchain) for LangGraph-based orchestration.
