---
title: ElevenLabs Conversational AI
description: "Connect any ElevenLabs voice agent to DPX — counterparty verification, ESG scoring, settlement execution, and macro intelligence mid-conversation. Two integration paths: MCP server (no code) or webhook tools (granular)."
---

ElevenLabs voice agents can call DPX tools mid-conversation to verify counterparties, check ESG standing, query macro risk conditions, and execute settlements — without a human in the loop at any step.

Two paths: connect DPX's MCP server directly (no code, all 23 tools), or define individual DPX endpoints as webhook tools (granular, per-tool control).

---

## Live deployment

DPX runs a production ElevenLabs Conversational AI agent — **DPX Treasury Intelligence** — embedded on the docs site. It demonstrates all capabilities described on this page in a live environment.

**Widget:** Embedded site-wide via `<elevenlabs-convai>` in the docs footer. The voice orb appears on every page at `docs.untitledfinancial.com`.

**Agent ID:** `agent_7001kv3zgy26fjhtnm7devgv3kch`

**Voice:** Eric — Smooth, Trustworthy (Primary)

**Knowledge base:** Full crawl of `docs.untitledfinancial.com` at depth 3 — auto-indexed so the agent can answer questions about any DPX protocol detail without hallucinating specifics.

**Content Safety:** All 7 categories active (Sexual, Violence, Harassment, Self Harm, Profanity, Politics and Religion, Medical and Legal Information).

**Conversation logging:** All post-call transcripts and metadata are written to `dpx-conversations` (Cloudflare D1) via webhook at `https://api.untitledfinancial.com/elevenlabs/webhook`. HMAC-SHA256 signature verification on every payload.

**Allowlist:** `docs.untitledfinancial.com`, `untitledfinancial.com` — connections from other origins are rejected.

### Embedding the widget

Drop this into any page or layout component:

```html
<elevenlabs-convai agent-id="agent_7001kv3zgy26fjhtnm7devgv3kch"></elevenlabs-convai>
<script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>
```

The widget renders as a floating voice orb. No additional styling required — it positions itself in the bottom-right corner by default.

---

**DPX MCP endpoint:** `https://mcp.untitledfinancial.com/mcp`  
**Transport:** SSE (Server-Sent Events)  
**Auth:** Bearer token

> **Limitation:** MCP tool integrations are not available for ElevenLabs accounts on Zero Retention Mode or HIPAA compliance mode. Those accounts should use the [webhook path](#path-2--webhook-tools-granular) instead.

---

## Why this matters

A voice agent that can autonomously trigger compliance checks and settlement is a different category of product from one that can only talk about them. ElevenLabs agents with DPX tools can:

- Verify a counterparty identity before proceeding with a transaction — mid-sentence
- Check current macro conditions and surface a settlement recommendation
- Execute a cross-border payment and confirm the on-chain attestation — all in one call
- Run ESG screening before routing a payment

Every step is attested on-chain. The voice agent produces the same audit trail as a human treasury team.

---

## Path 1 — MCP server (recommended)

Connect DPX as an MCP server. ElevenLabs discovers all 23 tools automatically — no manual endpoint definition required.

### Dashboard setup

1. In your ElevenLabs workspace, go to **Agents → [your agent] → Tools → MCP Servers**
2. Click **Add Custom MCP Server**
3. Configure:

| Field | Value |
|---|---|
| Name | `DPX Protocol` |
| Server URL | `https://mcp.untitledfinancial.com/mcp` |
| Transport | `SSE` |
| Secret token | Your DPX API key (stored as a workspace secret) |

4. Click **Test Connection** — ElevenLabs will discover all 23 tools and display them
5. Set **Approval policy** (see below)
6. Optionally configure per-tool overrides (timeout, speech behaviour)

### Approval policy

| Policy | When to use |
|---|---|
| **Always Ask** (ElevenLabs default) | Recommended for rollout — agent requests human permission before each tool call |
| **Fine-Grained** | Auto-approve read-only tools (oracle, ESG, quote), require approval for settlement execution |
| **No Approval** | Production autonomous agents where full automation is intended |

**Recommended fine-grained setup for DPX:**

| Tool | Setting |
|---|---|
| `oracle.stability`, `oracle.rails`, `oracle.status` | Auto-approve |
| `esg.score`, `analytics.overview`, `dpx.metrics` | Auto-approve |
| `settlement.quote`, `fees.schedule`, `fees.verify` | Auto-approve |
| `market.cascade`, `market.fx`, `market.shipping` | Auto-approve |
| `settlement.execute` | Require approval |

### Response timeout

DPX intelligence endpoints fetch from multiple signal sources in parallel — on a cache miss this can take 15–20 seconds. Set `response_timeout_secs` at the MCP server level or per-tool:

```
Default:  30s   (ElevenLabs default — may time out on cache miss)
Recommended: 60s  (covers worst-case parallel signal fetch)
Maximum:  120s
Minimum:  5s
```

Set this in **Agent → Tools → MCP Servers → [DPX] → Server Settings → Response timeout**.

For the `settlement.execute` tool specifically, set a higher per-tool override (120s) to account for on-chain confirmation time.

### Speech behaviour during tool calls

DPX tool calls can take several seconds. Configure `pre_tool_speech` so the agent acknowledges the request while waiting:

| Setting | Behaviour |
|---|---|
| `auto` (recommended) | Agent speaks before tool call if recent latency was high |
| `force` | Agent always speaks before calling the tool |
| `off` | Silent while fetching |

For settlement flows, `force` is recommended — callers on the phone need acknowledgement that the agent is working, not silence for 15 seconds.

Example pre-tool speech to set in the agent prompt:
```
When calling any DPX tool, first say something brief to acknowledge the request:
"Checking conditions now..." / "Pulling that up..." / "Running the verification..."
```

### Response mocks (for testing)

ElevenLabs supports `response_mocks` on MCP tool overrides — you can test your agent's response logic without hitting the live DPX API:

```json
{
  "tool_name": "oracle.stability",
  "response_mocks": [
    {
      "mock_response": "{\"status\":\"STABLE\",\"score\":88,\"summary\":\"Credit conditions stable. FX volatility within normal range.\"}",
      "trigger": "always"
    }
  ]
}
```

---

## Path 2 — Webhook tools (granular)

For accounts on Zero Retention Mode, HIPAA mode, or where you want explicit control over which DPX endpoints the agent can reach. Define individual DPX endpoints as webhook tools.

### VoP — Verification of Payee

```json
{
  "type": "webhook",
  "name": "verify_counterparty",
  "description": "Verify a counterparty's identity before settlement. Returns registry status, ESG score, and compliance clearance.",
  "url": "https://integration.untitledfinancial.com/vop/verify",
  "method": "GET",
  "query_params": {
    "walletAddress": {
      "type": "string",
      "description": "Counterparty wallet address or LEI"
    }
  },
  "auth_connection": {
    "type": "bearer",
    "secret_name": "DPX_API_KEY"
  }
}
```

### ESG Score

```json
{
  "type": "webhook",
  "name": "get_esg_score",
  "description": "Get live ESG score for a counterparty. Score 0–100. Higher score = lower compliance fee.",
  "url": "https://esg.untitledfinancial.com/esg-score",
  "method": "GET",
  "query_params": {
    "entity": {
      "type": "string",
      "description": "Wallet address or LEI"
    }
  },
  "auth_connection": {
    "type": "bearer",
    "secret_name": "DPX_API_KEY"
  }
}
```

### Stability Oracle

```json
{
  "type": "webhook",
  "name": "check_settlement_conditions",
  "description": "Get current macro stability and settlement recommendation. Returns STABLE/CAUTION/UNSTABLE with AI reasoning.",
  "url": "https://stability.untitledfinancial.com/reliability",
  "method": "GET",
  "auth_connection": {
    "type": "bearer",
    "secret_name": "DPX_API_KEY"
  }
}
```

### Fee Quote

```json
{
  "type": "webhook",
  "name": "get_settlement_quote",
  "description": "Get a binding fee quote for a settlement. Valid for 300 seconds.",
  "url": "https://stability.untitledfinancial.com/quote",
  "method": "GET",
  "query_params": {
    "amountUsd": { "type": "number", "description": "Settlement amount in USD" },
    "hasFx":     { "type": "boolean", "description": "True if cross-currency" },
    "esgScore":  { "type": "number", "description": "Counterparty ESG score 0–100" }
  },
  "auth_connection": {
    "type": "bearer",
    "secret_name": "DPX_API_KEY"
  }
}
```

---

## Example voice agent system prompt

```
You are a DPX treasury intelligence assistant for cross-border payment operations.

Before executing any settlement:
1. Call verify_counterparty to confirm registry status and compliance clearance
2. Call get_esg_score to retrieve the counterparty's live ESG score
3. Call check_settlement_conditions to confirm oracle is STABLE
4. Call get_settlement_quote with the amount, FX flag, and ESG score
5. Confirm the fee breakdown with the caller before proceeding to execute

If the oracle returns CAUTION, inform the caller and ask whether to proceed.
If the oracle returns UNSTABLE, do not proceed — inform the caller and suggest retrying in 1 hour.

When calling any tool, first acknowledge verbally: "Checking conditions now..." or similar.
Tool calls may take 15–20 seconds on fresh data — always speak first so the caller knows you are working.

For macro risk queries, summarise the AI reasoning in plain language.
Keep responses concise — callers are in active treasury operations.
```

---

## Example conversations

### Settlement pre-clearance

```
Caller: "We need to send $2 million to our Tokyo counterpart. Can you check conditions?"

Agent: "Checking conditions now — one moment..."

Agent calls: check_settlement_conditions
→ STABLE · score 88 · "Credit conditions stable. FX volatility within normal range."

Agent calls: verify_counterparty (Tokyo wallet)
→ Registry: VERIFIED · Compliance: CLEAR · ESG: 72

Agent calls: get_settlement_quote (amountUsd: 2000000, hasFx: true, esgScore: 72)
→ Core: 1.50% · FX: 0.40% · ESG: 0.14% · Total: ~2.04% · Net: $1,959,200

Agent: "Oracle is stable. Counterparty verified and clear. All-in rate is 2.04%.
        Net amount to Tokyo: $1,959,200. Shall I proceed?"
```

### Macro risk briefing

```
Caller: "What's the current macro environment before our board call?"

Agent: "Pulling that up now..."

Agent calls: check_settlement_conditions
→ CAUTION · score 71 · "Elevated credit spreads and JPY volatility. Monitor USD/JPY corridor."

Agent: "The oracle is at CAUTION — score 71. Credit spreads are elevated and
        the JPY corridor is showing volatility. I'd recommend delaying any
        large JPY-denominated settlements until conditions normalise.
        All other corridors are currently clear."
```

---

## Available tools via MCP

All 23 DPX tools are available when connected via MCP. Most relevant for voice agent use cases:

| Tool | Voice use case |
|---|---|
| `oracle.stability` | "Is it safe to settle right now?" |
| `esg.score` | "What's their ESG standing?" |
| `settlement.quote` | "What's the all-in fee?" |
| `settlement.execute` | "Execute the settlement" |
| `settlement.status` | "What's the status of that payment?" |
| `oracle.rails` | "Is SEPA operational?" |
| `market.cascade` | "What are the macro risks if oil spikes?" |
| `market.fx` | "Which corridors should we avoid today?" |
| `oracle.mycelium` | "Any systemic financial network stress?" |

Full tool reference: [MCP Integration →](/integrations/mcp)

---

## 11ai — ElevenLabs' native voice assistant

ElevenLabs ships a consumer voice assistant called **11ai** that is built on MCP natively. It launches with integrations for Perplexity, Linear, Slack, Notion, and Google Calendar, with new integrations added weekly. Custom MCP servers are supported — which means DPX can be connected to 11ai today using the same config above.

As the DPX MCP server establishes track record, integration with the 11ai featured integration list is a distribution channel worth pursuing.

---

## Guardrails

ElevenLabs provides built-in guardrails for Conversational AI agents. Recommended configuration for DPX-connected agents:

| Guardrail | Setting | Why |
|---|---|---|
| **Focus** | Enabled | Keeps the agent on treasury operations — prevents it from wandering into unrelated topics mid-call |
| **Manipulation / Prompt Injection** | Enabled | Blocks callers from overriding agent behaviour through conversational instructions |
| **Content Safety** | All 7 categories | Required for public-facing agents — covers Sexual, Violence, Harassment, Self Harm, Profanity, Politics and Religion, Medical and Legal Information |
| **Custom** | Optional | Add domain-specific rules (e.g. "never confirm a settlement amount without calling get_quote first") |

Configure guardrails at **Agent → Security → Guardrails**. The Focus and Manipulation/Prompt Injection guardrails are the minimum recommended for any agent that can trigger financial operations. Content Safety (all 7 categories) is enabled on the DPX Treasury Intelligence agent.

---

## Testing

ElevenLabs provides a built-in test runner on the Tests tab of each agent. These test definitions cover the four core DPX tool calls — copy them into a new Tool Invocation test on your agent.

### Test 1 — Stability check

Verifies the agent calls `check_stability` when asked about settlement conditions.

| Field | Value |
|---|---|
| Type | Tool invocation |
| Tool | `check_stability` → Should have been called |
| User message | "Check if conditions are stable for a $1M payment" |

### Test 2 — ESG score lookup

Verifies the agent calls `get_esg_score` when given a wallet address.

| Field | Value |
|---|---|
| Type | Tool invocation |
| Tool | `get_esg_score` → Should have been called |
| User message | "What's the ESG score for 0x1234abcd5678ef90?" |

### Test 3 — Rail availability

Verifies the agent calls `check_rails` when asked about corridor health.

| Field | Value |
|---|---|
| Type | Tool invocation |
| Tool | `check_rails` → Should have been called |
| User message | "Are the payment rails available for sending to Japan?" |

All three tests run against the live DPX endpoints. Rail and stability checks respond in under 5 seconds. ESG lookups complete in under 3 seconds. Run all tests from **Agent → Tests → Run All Tests** before pushing any agent change to production.

---

## Auth

Store your DPX API key as a workspace secret in ElevenLabs:

1. **ElevenLabs workspace → Settings → Secrets**
2. Add secret: name `DPX_API_KEY`, value: your DPX integration key
3. Reference as `secret_name: "DPX_API_KEY"` in MCP or webhook configs — ElevenLabs injects it as `Authorization: Bearer <key>`

DPX accepts the key as either `Authorization: Bearer <key>` or `X-API-Key: <key>`.

---

## Platform plan note

ElevenLabs MCP server integration (Path 1 above — all 23 tools via SSE) requires an ElevenLabs paid plan. Free-tier accounts are limited to webhook tools (Path 2). If you see "MCP Servers" greyed out in the Tools tab, a plan upgrade is required.

ElevenLabs charges separately for their platform. DPX API usage is independent of ElevenLabs plan tier.

---

## Related

- [MCP Integration — full tool list](/integrations/mcp)
- [Agent Quick Start](/agent-quickstart)
- [Stability Oracle API](/api/stability-oracle)
- [Agent-to-Agent Payments](/use-cases/agent-economy)
