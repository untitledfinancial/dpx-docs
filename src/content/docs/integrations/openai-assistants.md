---
title: OpenAI Assistants API
description: Add DPX tools to any OpenAI Assistant using function calling.
---

Add DPX settlement intelligence to any OpenAI Assistant via the function calling interface.

## Installation

```bash
pip install openai requests
```

## Define the tools

```python
DPX_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "check_oracle_stability",
            "description": "Check current DPX oracle stability. Returns STABLE, CAUTION, or UNSTABLE with score and reasoning. Call before any settlement.",
            "parameters": { "type": "object", "properties": {}, "required": [] }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_settlement_quote",
            "description": "Get a binding DPX fee quote. Returns core fee, FX fee, ESG fee, all-in rate, and net amount. Valid 300 seconds.",
            "parameters": {
                "type": "object",
                "properties": {
                    "amountUsd": { "type": "number", "description": "Settlement amount in USD" },
                    "hasFx":     { "type": "boolean", "description": "true for cross-currency settlement" },
                    "esgScore":  { "type": "number", "description": "Counterparty ESG score 0-100" }
                },
                "required": ["amountUsd"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_esg_score",
            "description": "Get live ESG score for a counterparty wallet address. Score 0-100.",
            "parameters": {
                "type": "object",
                "properties": {
                    "address": { "type": "string", "description": "Ethereum wallet address (0x...)" }
                },
                "required": ["address"]
            }
        }
    }
]
```

## Create the assistant

```python
import openai, os

client = openai.OpenAI(api_key=os.environ["OPENAI_API_KEY"])

assistant = client.beta.assistants.create(
    name="DPX Treasury Assistant",
    instructions="""You are a DPX treasury intelligence assistant.

For any settlement or pricing request:
1. Call check_oracle_stability — if UNSTABLE, advise the user to wait
2. If a counterparty wallet is known, call get_esg_score
3. Call get_settlement_quote with amount, FX flag, and ESG score
4. Present: oracle status, ESG standing, fee breakdown, net recipient amount""",
    model="gpt-4o",
    tools=DPX_TOOLS
)
```

## Handle tool calls

```python
import requests, json, time

DPX_STABILITY = "https://stability.untitledfinancial.com"
DPX_ESG       = "https://esg.untitledfinancial.com"

def call_dpx_tool(name: str, args: dict) -> dict:
    if name == "check_oracle_stability":
        return requests.get(f"{DPX_STABILITY}/reliability").json()
    if name == "get_settlement_quote":
        return requests.get(f"{DPX_STABILITY}/quote", params=args).json()
    if name == "get_esg_score":
        return requests.get(f"{DPX_ESG}/esg-score",
                            params={"address": args["address"]}).json()
    return {"error": "unknown_tool"}

def process_run(thread_id, run_id):
    while True:
        run = client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run_id)
        if run.status == "requires_action":
            tool_calls = run.required_action.submit_tool_outputs.tool_calls
            outputs = [
                {"tool_call_id": tc.id,
                 "output": json.dumps(call_dpx_tool(tc.function.name,
                                                    json.loads(tc.function.arguments)))}
                for tc in tool_calls
            ]
            client.beta.threads.runs.submit_tool_outputs(
                thread_id=thread_id, run_id=run_id, tool_outputs=outputs)
        elif run.status in ("completed", "failed", "cancelled", "expired"):
            break
        time.sleep(1)
```

## Full setup script

A complete runnable script including the run loop is available at:
[github.com/untitledfinancial/dpx-integrations/tree/main/openai-assistants](https://github.com/untitledfinancial/dpx-integrations/tree/main/openai-assistants)

No API key required for oracle and pricing endpoints.
