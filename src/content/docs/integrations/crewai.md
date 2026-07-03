---
title: CrewAI
description: Autonomous invoice settlement using a two-agent CrewAI crew — single flow-check pre-flight, then execution.
---

Connect CrewAI agents to DPX for autonomous settlement workflows. The reference implementation uses a two-agent crew: a Flow Check Agent runs a single pre-flight call that covers AML screening, ESG scoring, oracle stability, and stablecoin routing in parallel — then a Settlement Agent executes using the result.

## Reference agent

The complete reference implementation is in the DPX Python SDK:

```bash
git clone https://github.com/untitledfinancial/dpx-protocol
cd dpx-protocol/dpx-python-sdk
pip install crewai httpx
python examples/crewai_settlement_agent.py
```

The agent runs the full lifecycle against a sample invoice (USD → EUR, $85K):

1. **Flow Check Agent** — calls `GET /flow-check` once. Returns `PROCEED`, `HOLD`, or `BLOCKED`. On HOLD or BLOCKED, halts with reason. On PROCEED, outputs the recommended token and a ready-to-use settle body.
2. **Settlement Agent** — executes via `POST /settle` using the token and settle body from flow-check.

Set `SANDBOX=false` to execute on Base mainnet. DPX returns execution parameters — the caller's wallet calls `approve()` + `router.settle()` on-chain.

## Crew structure

```python
from crewai import Agent, Task, Crew, Process

flow_check_agent = Agent(
    role="Pre-Settlement Compliance & Routing Officer",
    goal="Run /flow-check. BLOCKED or HOLD = stop. PROCEED = pass token and settle body to settlement agent.",
    tools=[FlowCheckTool()],
)

settlement_agent = Agent(
    role="Settlement Execution Agent",
    goal="Execute settlement using the token and settle body from flow-check.",
    tools=[ExecuteSettlementTool()],
)

crew = Crew(
    agents=[flow_check_agent, settlement_agent],
    tasks=[flow_check_task, settlement_task],
    process=Process.sequential,
)
result = crew.kickoff()
```

## Tools

| Tool | Endpoint | Auth |
|---|---|---|
| `flow_check` | `agent.untitledfinancial.com/flow-check` | None |
| `execute_settlement` | `agent.untitledfinancial.com/settle` | x402 (sandbox: none) |

`/flow-check` runs AML screening, ESG scoring, oracle stability, and stablecoin routing in a single parallel call — replacing what was previously 3 separate API calls. No API key required. Settlement in live mode requires an x402 USDC payment on Base mainnet.

## flow-check response

```json
{
  "decision": "PROCEED",
  "ready": true,
  "token": "EURC",
  "tokenRationale": "EURC eliminates FX conversion for EUR destination",
  "estimatedNetUsd": 84820.50,
  "settleBody": {
    "amount": 85000,
    "sourceCurrency": "USD",
    "destinationCurrency": "EUR",
    "token": "EURC"
  }
}
```

On `BLOCKED`: includes `blockReason`. On `HOLD`: includes `holdReason` and oracle status. Any BRL corridor also includes a `regulatoryWarning` with the BCB Resolution 561 deadline.

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
