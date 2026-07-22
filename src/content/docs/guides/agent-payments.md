---
title: How to add payments to your AI agent
description: A step-by-step guide for developers adding payment capability to an AI agent — oracle gate, fee quote, x402 intelligence, counterparty verification, and settlement. No API key required.
---

Most AI agents hit a wall when they need to move money. You can reason, plan, and call any API — but the payment step sends you back to a human. This guide shows you how to close that loop.

By the end you'll have an agent that:
- Checks whether global conditions are safe to settle
- Gets a binding fee quote
- Pays for live intelligence via x402
- Verifies the counterparty
- Executes a settlement — fully autonomous, no human required

---

## Before you start

You need:
- A Base wallet with a small USDC balance (for x402 payments in steps 3–4)
- Node 18+ or Python 3.10+
- No API key, no account, no onboarding

```bash
git clone https://github.com/untitledfinancial/dpx-agent-public
cd dpx-agent-public
npm install
cp .env.example .env
```

Set your wallet and recipient in `.env`:
```
PRIVATE_KEY=0x...
RECIPIENT_ADDRESS=0x...
SANDBOX=true
```

---

## Step 1 — Oracle gate

Before your agent commits to a payment, check whether conditions are right to settle. The oracle monitors global conditions across climate, macro, FX, and geopolitical signals and returns a simple verdict: `STABLE`, `CAUTION`, or `UNSTABLE`.

```typescript
const oracle = await fetch('https://stability.untitledfinancial.com/reliability')
  .then(r => r.json());

console.log(oracle.status);   // "STABLE"
console.log(oracle.score);    // 91
console.log(oracle.reasoning); // "Yield curve normal, FX stress low."

if (oracle.status === 'UNSTABLE') {
  // Hold and retry later — don't settle into bad conditions
  throw new Error('Oracle UNSTABLE — holding.');
}
```

This call is free. Your agent should always run it before committing.

---

## Step 2 — Get a binding quote

Request a fee breakdown before executing. The quote is binding for 300 seconds and returns a `quoteId` you'll use in the settle call.

```typescript
const { quote } = await fetch(
  `https://agent.untitledfinancial.com/quote?amountUsd=50000&hasFx=false`
).then(r => r.json());

console.log(quote.fees.total.bps);       // 85
console.log(quote.settlement.netUsd);    // 49575
console.log(quote.quoteId);              // "dpx_a1b2c3..."
```

The fee is ~0.85% for same-currency, ~1.25% cross-currency. ESG score adjusts it in real time.

---

## Step 3 — Buy live intelligence (x402)

This is where x402 comes in. Your agent pays a small amount of USDC to get a live macro-stress signal — current conditions, confidence score, and AI reasoning. The `x402-fetch` library handles the payment automatically.

```typescript
import { createSigner, wrapFetchWithPayment } from 'x402-fetch';

const signer    = await createSigner('base', process.env.PRIVATE_KEY);
const fetchX402 = wrapFetchWithPayment(fetch, signer);

const intel = await fetchX402(
  'https://intelligence.untitledfinancial.com/v1/intelligence/macro-stress'
).then(r => r.json());

console.log(intel.score);     // 14
console.log(intel.reasoning); // "Low systemic stress. Credit spreads tight."
```

When the server returns HTTP 402, `fetchX402` signs a USDC transfer on Base and retries automatically. Your agent never sees the payment mechanics — it just gets the data.

Cost: ~$0.001 USDC per call.

---

## Step 4 — Verify the counterparty

Before releasing funds, verify the recipient through the compliance layer. This checks identity against legal entity registries and screens for FATF R16 compliance.

```typescript
const vop = await fetchX402('https://compliance.untitledfinancial.com/vop/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    walletAddress: process.env.RECIPIENT_ADDRESS,
    submittedName: 'Acme Corp',
  }),
}).then(r => r.json());

console.log(vop.result);      // "NOT_REGISTERED" or "VERIFIED"
console.log(vop.proceedSafe); // true

if (!vop.proceedSafe) {
  throw new Error(`Counterparty blocked: ${vop.message}`);
}
```

---

## Step 5 — Settle

All checks passed. Execute the settlement.

```typescript
const settled = await fetch('https://agent.untitledfinancial.com/settle', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount:              50000,
    sourceCurrency:      'USD',
    destinationCurrency: 'USD',
    recipientAddress:    process.env.RECIPIENT_ADDRESS,
    purpose:             'agent-payment',
    referenceId:         `a2a-${Date.now()}`,
    quoteId:             quote.quoteId,
    sandbox:             true, // set false to go live
  }),
}).then(r => r.json());

console.log(settled.status);   // "executed"
console.log(settled.txHash);   // on-chain confirmation (when sandbox: false)
```

**To go live:** change `sandbox: true` to `sandbox: false`. Fund your wallet with USDC on Base equal to the gross settlement amount.

---

## Full working example

The complete loop — clone, configure, run:

```bash
git clone https://github.com/untitledfinancial/dpx-agent-public
cd dpx-agent-public
npm install && cp .env.example .env
# edit .env with your wallet
npm start
```

Python version also available in the same repo.

---

## Adding it to an existing agent

If your agent is already built, the settlement loop is a single function call:

```typescript
// After your agent decides a payment is needed
const result = await runSettlement({
  amount: invoiceAmount,
  recipient: supplierWallet,
  sandbox: false,
});

if (result.txHash) {
  // Payment confirmed on-chain
  agent.log(`Settled: https://base.blockscout.com/tx/${result.txHash}`);
}
```

---

## Using MCP instead of REST

If you're building with Claude Desktop or Cursor, use the MCP server — your agent calls DPX tools the same way it calls any other tool:

```json
{
  "mcpServers": {
    "dpx": {
      "command": "npx",
      "args": ["@untitledfinancial/dpx-mcp"]
    }
  }
}
```

Then in your session:
```
settlement.quote → settlement.execute → compliance.screen
```

No HTTP, no auth setup, no x402 library to install. The MCP layer handles it.

---

## What the oracle is doing

Every call to `/reliability` runs a 9-layer signal pipeline: climate conditions, commodity markets, macroeconomic indicators, FX movements, yield curve signals, geopolitical risk. The output isn't just a status flag — it includes structured reasoning and a confidence score your agent can act on.

This is the key difference between DPX and a payment API: the intelligence is built into the rail. Your agent doesn't have to implement risk logic — it delegates to the oracle and acts on the verdict.

---

## Next steps

- [Agent Quick Start](/agent-quickstart) — full loop with all parameters documented
- [x402 reference](/integrations/x402) — how micropayments work for agents
- [MCP tools](/integrations/mcp) — 72 tools for Claude Desktop and Cursor
- [Framework examples](/guides/framework-examples) — LangGraph and CrewAI integrations
