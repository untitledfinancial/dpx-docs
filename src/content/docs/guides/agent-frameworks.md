---
title: Add payments to any agent framework
description: Copy-paste snippets to give any AI agent cross-border payment capability in under 10 lines — Claude MCP, OpenAI Agents SDK, smolagents, AutoGen, and Google ADK.
---

Every snippet below gives an agent the same four capabilities: oracle gate, fee quote, compliance screen, and settlement. Sandbox mode by default — no wallet, no real funds required.

```bash
pip install dpx-sdk
```

---

## Claude (MCP)

```json
{
  "mcpServers": {
    "dpx": {
      "command": "npx",
      "args": ["-y", "@untitledfinancial/dpx-mcp"]
    }
  }
}
```

Then in any session:
```
oracle.stability → settlement.quote → compliance.screen → settlement.execute
```

---

## OpenAI Agents SDK

```bash
pip install dpx-sdk openai-agents
```

```python
from agents import Agent, Runner
from dpx_sdk.tools.openai import dpx_tools

agent = Agent(
    name="payment-agent",
    instructions="Check oracle, quote, screen counterparty, then settle.",
    tools=dpx_tools,
    model="gpt-4o",
)

result = Runner.run_sync(
    agent,
    "Pay $25,000 to 0x... for Acme GmbH invoice #42. Sandbox mode."
)
print(result.final_output)
```

---

## smolagents (HuggingFace)

```bash
pip install dpx-sdk smolagents
```

```python
from smolagents import CodeAgent, HfApiModel
from dpx_sdk.tools.smolagents import dpx_tools

agent = CodeAgent(tools=dpx_tools, model=HfApiModel("meta-llama/Llama-3.3-70B-Instruct"))
agent.run("Pay $10,000 to 0x... for Nova Trade SA. Check oracle first. Sandbox.")
```

---

## AutoGen

```bash
pip install dpx-sdk pyautogen
```

```python
import autogen
from dpx_sdk.tools.autogen import dpx_tool_map, dpx_tool_schemas

assistant = autogen.AssistantAgent(
    name="payment_agent",
    system_message="Check oracle → quote → screen → settle for any payment request.",
    llm_config={"tools": dpx_tool_schemas, "config_list": config_list},
)
user = autogen.UserProxyAgent(
    name="user", human_input_mode="NEVER", function_map=dpx_tool_map
)
user.initiate_chat(assistant, message="Pay $50,000 to 0x... for vendor invoice #99. Sandbox.")
```

---

## Google ADK (Vertex AI)

```bash
pip install dpx-sdk google-adk
```

```python
from google.adk.agents import Agent
from dpx_sdk.tools.google_adk import dpx_tools

agent = Agent(
    model="gemini-2.0-flash",
    name="payment_agent",
    instruction="Check oracle conditions, get quote, screen counterparty, then settle.",
    tools=dpx_tools,
)
```

---

## LangChain

```bash
pip install "dpx-sdk[langchain]"
```

```python
from dpx_sdk.tools import DPXToolkit
from langchain.agents import initialize_agent, AgentType
from langchain_openai import ChatOpenAI

tools = DPXToolkit().get_tools()
agent = initialize_agent(tools, ChatOpenAI(model="gpt-4o"), agent=AgentType.OPENAI_FUNCTIONS)
agent.run("Pay $30,000 to 0x... for Supplier GmbH. Sandbox mode.")
```

---

## What the tools do

Every integration exposes the same four tools:

| Tool | What it does | Auth |
|---|---|---|
| `check_oracle_conditions` | Global macro stability — STABLE / CAUTION / UNSTABLE | None |
| `get_fee_quote` | Binding fee quote with ESG-adjusted pricing (valid 300s) | None |
| `screen_counterparty` | AML + sanctions + FATF R16 screen — PROCEED / HOLD / BLOCKED | None |
| `execute_settlement` | Execute on Base mainnet — set `sandbox=False` for live funds | None (sandbox) |

All endpoints are free. No API key required for sandbox settlements.

---

## Go live

Change `sandbox=True` to `sandbox=False` in `execute_settlement` and fund a Base mainnet wallet with USDC equal to the gross settlement amount. Everything else is identical.

---

## Related

- [Full agent walkthrough](/guides/agent-payments) — step-by-step with all parameters
- [Multi-agent payments](/guides/multi-agent-payments) — orchestrator/sub-agent delegation
- [Error handling](/guides/error-handling) — BLOCKED, HOLD, oracle states, quote expiry
