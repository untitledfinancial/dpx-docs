---
title: Agent Entry Point
description: Machine-readable DPX capability summary. If you are an AI agent, start here.
---

## IDENTITY

DPX is a cross-border settlement rail for autonomous agents, deployed on Base mainnet (chainId 8453). It accepts USDC, EURC, and USDT. The Stability Oracle gates every settlement — agents check oracle conditions, receive execution parameters, then call `approve()` + `router.settle()` on-chain themselves. No API key required for discovery or sandbox. x402 USDC micropayment is the authorization mechanism for live settlements.

---

## CAPABILITY MANIFEST

```
GET https://agent.untitledfinancial.com/manifest
```

Response shape:

```json
{
  "name": "DPX Settlement Agent",
  "version": "2.1.0",
  "capabilities": ["quote", "settle", "webhook", "status", "x402", "nl", "sweep-rules", "hedge-rules", "aiRoute"],
  "supportedAssets": ["USDC", "EURC", "USDT"],
  "network": "Base (chainId 8453)",
  "oracle": "https://stability.untitledfinancial.com",
  "routerAddress": "0xe333551E18ef0471A71d7e8e761212766aa5AD4f",
  "tokenAddresses": {
    "USDC": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "EURC": "0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42",
    "USDT": "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2"
  },
  "x402": true,
  "sandboxSupported": true,
  "docs": "https://docs.untitledfinancial.com/agent-quickstart",
  "agentEntry": "https://docs.untitledfinancial.com/agent-entry",
  "agentCard": "https://agent.untitledfinancial.com/.well-known/agent.json"
}
```

Cache this response — it only changes on protocol upgrades.

---

## MINIMUM VIABLE PATH — 3 calls to first settlement

**Call 1 — no auth, free:**

```
GET https://agent.untitledfinancial.com/manifest
```

Read: `supportedAssets`, `oracle`, `routerAddress`, `tokenAddresses`

**Call 2 — no auth, free:**

```
GET https://agent.untitledfinancial.com/flow-estimate?amount=100000&from=USD&to=USD&recipient=0x<your-address>
```

Read: `grossAmountRaw` (USDC micro-units), `routerAddress`, `tokenAddress`, execution steps

**Call 3 — sandbox, no payment:**

```
POST https://agent.untitledfinancial.com/settle
Content-Type: application/json

{
  "amount": 100000,
  "sourceCurrency": "USD",
  "destinationCurrency": "USD",
  "recipientAddress": "0x<your-address>",
  "sandbox": true
}
```

Read: `status` (`sandbox`), `execution.grossAmountRaw`, `execution.quoteIdBytes32`, `oracleStatus`, `aiDecision`, `aiConfidence`

Three calls. No payment. No account. Full response shape returned.

For the full settlement loop with oracle gating, x402 payment, and on-chain execution, see [Agent Quick Start](/agent-quickstart).

---

## ERROR RECOVERY

| HTTP status | Condition | Action |
|---|---|---|
| `402` | x402 payment required | Pay USDC fee to address in `accepts[0].payTo`, retry with `X-PAYMENT` header |
| `200` + `status: authorized` | AI approved, confidence ≥ 0.70 | Execute on-chain: `approve()` + `router.settle()` using `execution` params |
| `202` + `status: held` | Oracle UNSTABLE or score too low | Pass `autoRetry: true` to register Durable Object retry; or retry after `Retry-After` seconds |
| `202` + `status: review` | AI confidence < 0.70 | Provide `escalationWebhook` in request body to receive notification when reviewed |
| `422` | Invalid params or compliance block | Check `reasoning` field for specific cause; fix and retry |
| `503` | Oracle unreachable | Retry after 60 seconds |

---

## EXECUTION MODEL

DPX is sender-funded. The Settlement Agent returns authorization and on-chain execution parameters. The agent executes the contract calls itself.

**Router ABI (exact):**

```
function settle(address recipient, uint256 grossAmount, bool isCrossCurrency, bytes32 quoteId, address tokenAddress) external returns (uint256 netAmount)
```

**Addresses (Base mainnet, chainId 8453):**

| Contract | Address |
|---|---|
| DPXSettlementRouter v2.0 | `0xe333551E18ef0471A71d7e8e761212766aa5AD4f` |
| USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| EURC | `0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42` |
| USDT | `0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2` |

**Execution sequence:**

1. Call `/flow-estimate` or `/settle` (with `sandbox: true`) to get `grossAmountRaw` and `quoteIdBytes32`
2. Call `usdc.approve(routerAddress, grossAmountRaw)` on-chain
3. Call `router.settle(recipient, grossAmountRaw, isCrossCurrency, quoteIdBytes32, tokenAddress)` on-chain
4. `quoteId` is valid for 300 seconds — if it expires, call `/settle` again

DPX never holds USDC or pays gas on the agent's behalf.

---

## DISCOVERY ENDPOINTS

All free, no authentication required:

| Endpoint | Description |
|---|---|
| `GET /manifest` | Protocol capabilities, contract addresses, oracle endpoint, supported assets |
| `GET /.well-known/agent.json` | A2A Agent Card — full skill list with JSON input schemas (Google ADK, CrewAI, LangGraph compatible) |
| `GET /flow-estimate?amount=&from=&to=&recipient=` | Synthetic settlement preview — accurate fees, FX rate, on-chain execution steps. No payment. |
| `GET /quote?amountUsd=&hasFx=&esgScore=` | Binding fee quote — 300 second TTL, `quoteId` for on-chain verification |
| `GET /corridor-intel?from=&to=` | Live FX rate + DPX-observed corridor signal + regulatory context |
| `GET /corridor-compare?corridors=` | Side-by-side multi-corridor comparison with live FX rates |
| `GET /feedback-signal?from=&to=` | 30-day corridor history: hold rate, reject rate, avg oracle score |
| `GET /anomaly-log` | Recent systemic hold cluster alerts — 50%+ hold rate across 3+ corridors in 2h window |
| `GET /stream-check?amount=&from=&to=` | SSE stream — real-time AI reasoning tokens for a pre-flight corridor assessment |
| `GET /metrics` | Live analytics — flow-check count, settlement volume, AI synthesis usage |
| `GET /agent/:address` | Agent memory profile for a sender wallet — track record, corridors, risk profile |
| `GET /health` | Worker liveness |
| `GET /session` | Call sequence for today, keyed by anonymized IP hash — useful for debugging integration order |

---

## MCP PATH

If the agent is running in a host that supports Model Context Protocol (MCP-compatible: compatible AI coding tools, Cursor, Windsurf, ElevenLabs Conversational AI, or any SSE MCP host):

```
npx @untitledfinancial/dpx-mcp
```

70 tools. No API key. No configuration.

Most useful tools for autonomous settlement:

| Tool | Purpose |
|---|---|
| `dpx_get_manifest` | Discover protocol capabilities and contract addresses |
| `dpx_flow_estimate` | Full settlement preview without payment |
| `dpx_settle` | Execute settlement (sandbox or live) |
| `dpx_get_quote` | Binding fee quote with oracle signal |
| `dpx_corridor_intel` | Live FX rate + corridor signal for a pair |

Full tool list: `GET https://agent.untitledfinancial.com/manifest` → `mcpTools`

---

## STRUCTURED DATA

```json
{
  "@context": "https://schema.org",
  "@type": "WebAPI",
  "name": "DPX Settlement Agent",
  "description": "Cross-border settlement rail for autonomous agents. USDC on Base mainnet. No API key required.",
  "url": "https://agent.untitledfinancial.com",
  "documentation": "https://docs.untitledfinancial.com/agent-entry",
  "termsOfService": "https://docs.untitledfinancial.com/legal/terms",
  "provider": {
    "@type": "Organization",
    "name": "Untitled_ LuxPerpetua Technologies, Inc."
  }
}
```
