---
title: For AI builders
description: Task-oriented examples for adding DPX to any AI agent — pay a vendor, screen a counterparty, route by ESG score, delegate spend to sub-agents, and gate on oracle conditions.
---

DPX is designed to be called by agents, not configured by humans. Every capability is available as an MCP tool call, a REST endpoint, or an x402-gated intelligence fetch. This page shows the five most common tasks an AI agent needs to perform with money — and the exact calls to make.

---

## Task 1 — Pay a vendor

An agent needs to pay a supplier invoice autonomously. Three calls: quote → compliance gate → settle.

**MCP (Claude Desktop / Cursor)**

```
settlement.quote amount=50000 currency=USD hasFx=false
compliance.screen address=0xRecipient name="Acme GmbH"
settlement.execute quoteId=<from_quote> recipient=0xRecipient sandbox=false
```

**REST**

```typescript
// 1. Quote
const { quote } = await fetch(
  'https://agent.untitledfinancial.com/quote?amountUsd=50000&hasFx=false'
).then(r => r.json());

// 2. Gate
const check = await fetch('https://compliance.untitledfinancial.com/flow-check', {
  method: 'POST',
  body: JSON.stringify({ amount: 50000, recipient: '0xRecipient', name: 'Acme GmbH' }),
}).then(r => r.json());

if (check.decision !== 'PROCEED') throw new Error(check.reason);

// 3. Settle
const result = await fetch('https://agent.untitledfinancial.com/settle', {
  method: 'POST',
  body: JSON.stringify({ ...check.settleBody, quoteId: quote.quoteId, sandbox: false }),
}).then(r => r.json());

console.log(result.txHash); // on-chain confirmation
```

---

## Task 2 — Screen a counterparty before funds move

Run AML, sanctions, and FATF R16 in a single call before any payment is initiated.

**MCP**

```
compliance.screen address=0xCounterparty name="Nova Trade SA" lei=5493...
```

**REST**

```typescript
const screen = await fetch('https://compliance.untitledfinancial.com/flow-check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount:    100_000,
    currency:  'USD',
    recipient: '0xCounterparty',
    name:      'Nova Trade SA',
    lei:       '5493001KJTIIGC8Y1R12',
  }),
}).then(r => r.json());

// screen.decision: "PROCEED" | "HOLD" | "BLOCKED"
// screen.reason: plain-language explanation
// screen.settleBody: ready-to-use /settle payload (if PROCEED)
```

A `BLOCKED` response means a hard sanctions or AML hit — do not retry, log and escalate. A `HOLD` means a compliance signal requires human review before funds move.

---

## Task 3 — Route by ESG score

An agent needs to find the best settlement path for a counterparty and apply the ESG-adjusted fee.

**MCP**

```
esg.score entity="Acme GmbH" lei=7LTW...
settlement.quote amountUsd=1000000 hasFx=true esgScore=<from_esg>
stability.stablecoin_route from=USD to=EUR amount=1000000
```

**REST**

```typescript
// 1. Get live ESG score
const esg = await fetch('https://esg.untitledfinancial.com/score?lei=7LTWFZYICNSX8D621K86')
  .then(r => r.json());

console.log(esg.score);        // 74
console.log(esg.feePct);       // 0.0013 (13 bps — sliding scale from score)

// 2. Quote with ESG score baked in
const { quote } = await fetch(
  `https://stability.untitledfinancial.com/quote?amountUsd=1000000&hasFx=true&esgScore=${esg.score}`
).then(r => r.json());

// 3. Find best stablecoin for the corridor
const route = await fetch('https://stability.untitledfinancial.com/stability/stablecoin-route', {
  method: 'POST',
  body: JSON.stringify({ from: 'USD', to: 'EUR', amount: 1_000_000 }),
}).then(r => r.json());

console.log(route.recommended); // "EURC" — no FX exposure for EUR destinations
```

ESG fees are on a sliding scale: score 100 → 0 bps, score 0 → 50 bps. 100% of ESG fees are redistributed to on-chain impact programs.

---

## Task 4 — Delegate spend to sub-agents

An orchestrator agent needs to let procurement sub-agents pay invoices autonomously within a budget.

**MCP**

```
policy.create agent_id=orchestrator max_per_tx=10000 max_per_day=50000
policy.delegate parent=orchestrator child=sub-agent-a max_per_tx=5000 max_total=15000
policy.check agent_id=sub-agent-a delegation_id=<del_id> amount=4000
policy.receipt agent_id=sub-agent-a delegation_id=<del_id> tx_hash=0x...
policy.ledger session_id=<session>
```

**REST (abbreviated)**

```typescript
// Orchestrator creates policy
const policy = await post('https://policy.untitledfinancial.com/policy', {
  agent_id: 'orchestrator', max_per_tx: 10_000, max_per_day: 50_000,
});

// Delegate to sub-agent
const delegation = await post('https://policy.untitledfinancial.com/delegate', {
  parent_agent_id: 'orchestrator',
  child_agent_id:  'sub-agent-a',
  policy_id:       policy.id,
  max_per_tx:      5_000,
  max_total:       15_000,
});

// Sub-agent checks before spending
const check = await post('https://policy.untitledfinancial.com/policy/check', {
  agent_id: 'sub-agent-a', delegation_id: delegation.id, amount: 4_000,
});

// check.decision: "ALLOW" | "HOLD" | "BLOCK"
```

Full walkthrough: [Multi-agent payments →](/guides/multi-agent-payments)

---

## Task 5 — Gate on oracle conditions

Before any large settlement, check whether global conditions are right. The oracle monitors climate, macro, FX, and geopolitical signals and returns a plain verdict.

**MCP**

```
oracle.stability
```

**REST**

```typescript
const oracle = await fetch('https://stability.untitledfinancial.com/reliability')
  .then(r => r.json());

// oracle.status: "STABLE" | "CAUTION" | "UNSTABLE"
// oracle.score: 0–100
// oracle.reasoning: "Yield curve inverted but FX stress low. Commodity markets stable."

if (oracle.status === 'UNSTABLE') {
  // Hold and retry — do not settle into bad conditions
  return { deferred: true, retryAfter: '1h' };
}

if (oracle.status === 'CAUTION') {
  // Log reasoning and proceed for time-sensitive payments
  log(`Oracle CAUTION: ${oracle.reasoning}`);
}
```

For the full intelligence signal with AI reasoning and confidence score, use the x402-gated endpoint at `intelligence.untitledfinancial.com` (~$0.001/call).

---

## MCP quick reference

| Task | Tool |
|---|---|
| Get oracle status | `oracle.stability` |
| Get a binding fee quote | `settlement.quote` |
| Execute settlement | `settlement.execute` |
| Screen a counterparty | `compliance.screen` |
| Get ESG score | `esg.score` |
| Batch ESG on a supplier list | `esg.batch` |
| Find best stablecoin for a corridor | `stability.stablecoin_route` |
| Get optimal settlement window | `stability.settlement_window` |
| Create spending policy | `policy.create` |
| Delegate to sub-agent | `policy.delegate` |
| Check authorization | `policy.check` |
| Record receipt | `policy.receipt` |
| Audit session ledger | `policy.ledger` |
| Route via Mercury | `mercury.send` |
| Analyze Ramp spend | `ramp.spend_analysis` |

Full tool reference: [MCP — 76 tools →](/integrations/mcp)

---

## Set up MCP in Claude Desktop

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

No API key required for discovery, pricing, and sandbox settlements. For live settlements, fund a Base wallet with USDC and set `SANDBOX_MODE=false`.

Remote MCP (no local install):

```json
{
  "mcpServers": {
    "dpx": {
      "url": "https://mcp.untitledfinancial.com/mcp",
      "transport": "http"
    }
  }
}
```

---

## Related

- [Agent Quick Start](/agent-quickstart) — full autonomous loop with all parameters
- [Add payments to your agent](/guides/agent-payments) — step-by-step REST walkthrough
- [Multi-agent payments](/guides/multi-agent-payments) — Policy Engine and delegation chains
- [Error handling](/guides/error-handling) — every failure state and retry logic
