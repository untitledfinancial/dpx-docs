---
title: Compliance for AI agents
description: How to add AML screening, sanctions checks, and FATF R16 counterparty verification to an autonomous agent in a single tool call — no compliance team required.
---

When an AI agent moves money, compliance is not optional. AML screening, sanctions checks, and counterparty verification are legal requirements in virtually every jurisdiction where real value changes hands. Most developers either skip them (assuming they'll add it later) or spend months building a system that still isn't defensible.

DPX exposes the full compliance stack as a single tool call. Your agent runs it before every settlement. Clean payments proceed automatically. Flagged or blocked payments halt before anything moves.

---

## What compliance an agent actually needs

For cross-border payments and settlement, the relevant requirements are:

| Requirement | What it means in practice |
|---|---|
| **AML screening** | Check the counterparty against known money laundering risk signals |
| **Sanctions screening** | Verify the recipient isn't on OFAC, EU, UN, or FATF watchlists |
| **FATF R.16** | The "travel rule" — for transfers above threshold, verify beneficial ownership |
| **PEP screening** | Flag politically exposed persons who require enhanced due diligence |
| **UBO chain** | Trace beneficial ownership up to 3 levels to catch shell company structures |

Building this from scratch means licensing data feeds from multiple providers, maintaining watchlist updates, writing a scoring model, and keeping it current as regulations change. That's a compliance team's full-time job.

---

## The single call that replaces all of it

```typescript
const result = await fetch('https://agent.untitledfinancial.com/flow-check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount:             85000,
    fromCurrency:       'USD',
    toCurrency:         'EUR',
    recipientAddress:   process.env.RECIPIENT_ADDRESS,
    counterpartyName:   'Acme Supplier GmbH',
    counterpartyLei:    'EXAMPLE_LEI_00000000000', // optional but recommended
  }),
}).then(r => r.json());

console.log(result.decision);  // "PROCEED" | "HOLD" | "BLOCKED"
console.log(result.reason);    // populated when not PROCEED
```

`flow-check` runs oracle stability, AML/sanctions screening, ESG scoring, and stablecoin routing in parallel and returns a single decision. Your agent acts on the decision — no parsing, no scoring, no false-positive management.

**If `PROCEED`:** the response also includes a ready-to-use `settleBody` — pass it directly to `/settle`, no additional parameters needed.

**If `HOLD`:** a compliance signal needs human review. Route to a queue. Nothing moves.

**If `BLOCKED`:** hard stop. Payment is to a sanctioned entity or fails AML threshold. Log it, halt, escalate.

---

## Counterparty verification (VoP)

For payments where you have a wallet address and a claimed business name, run VoP first to verify the identity claim before committing funds:

```typescript
import { wrapFetchWithPayment, createSigner } from 'x402-fetch';

const signer    = await createSigner('base', process.env.PRIVATE_KEY);
const fetchX402 = wrapFetchWithPayment(fetch, signer);

const vop = await fetchX402('https://compliance.untitledfinancial.com/vop/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    walletAddress:  process.env.RECIPIENT_ADDRESS,
    submittedName:  'Acme Supplier GmbH',
  }),
}).then(r => r.json());

console.log(vop.result);       // "VERIFIED" | "NOT_REGISTERED" | "MISMATCH"
console.log(vop.proceedSafe);  // boolean — safe to settle?

if (!vop.proceedSafe) {
  throw new Error(`VoP failed: ${vop.message}`);
}
```

This is an x402 call — your agent pays ~$0.001 USDC per check. The payment happens automatically; you just get the result.

`NOT_REGISTERED` is not the same as blocked — it means the wallet isn't in the verified registry, which is normal for counterparties who haven't onboarded. `proceedSafe` reflects whether that's a reason to halt given the payment size and corridor.

---

## UBO chain and beneficial ownership

For larger settlements or high-risk corridors, screen the full beneficial ownership chain:

```typescript
// Via MCP (Claude Desktop / Cursor)
// Tool: compliance.ubo_chain
// Input: { lei: "COUNTERPARTY_LEI", depth: 3 }
// Returns: ownership chain + sanctions screen at each node, FATF R.16 attestation

// Via REST
const ubo = await fetch('https://compliance.untitledfinancial.com/ubo-chain', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ lei: 'COUNTERPARTY_LEI', depth: 3 }),
}).then(r => r.json());

console.log(ubo.chain);       // array of ownership nodes
console.log(ubo.fatfR16);     // FATF R.16 attestation object
console.log(ubo.anyBlocked);  // boolean — true if any node is sanctioned
```

---

## PEP screening

If your counterparty is an individual rather than a legal entity:

```typescript
// Via MCP: compliance.pep_screen
// Input: { name: "Full Name", country: "DE" }

const pep = await fetch('https://compliance.untitledfinancial.com/pep-screen', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Jane Smith', country: 'DE' }),
}).then(r => r.json());

console.log(pep.isPep);       // boolean
console.log(pep.riskLevel);   // "LOW" | "MEDIUM" | "HIGH"
console.log(pep.eddRequired); // true if enhanced due diligence is triggered
```

---

## Full agent pattern

The recommended pattern for any agent that moves money:

```typescript
async function settleWithCompliance(invoice: Invoice) {
  // 1. Single pre-flight: oracle + compliance + routing
  const check = await flowCheck(invoice);

  if (check.decision === 'BLOCKED') {
    await notify('compliance-queue', { invoice, reason: check.reason, action: 'BLOCKED' });
    throw new Error(`Blocked: ${check.reason}`);
  }

  if (check.decision === 'HOLD') {
    await notify('compliance-queue', { invoice, reason: check.reason, action: 'NEEDS_REVIEW' });
    return { status: 'held', reason: check.reason };
  }

  // 2. Settle — use the ready body from flow-check
  const settled = await settle(check.settleBody);
  return settled;
}
```

PROCEED payments never touch a human. HOLD payments route to a queue. BLOCKED payments are logged and halted. This is how you build a compliant agent without a compliance team.

---

## What the screening covers

DPX's compliance layer runs against:

- **Sanctions watchlists** — OFAC SDN, EU Consolidated, UN Consolidated, FATF high-risk jurisdictions
- **AML signals** — transaction pattern risk, corridor risk, beneficial ownership flags
- **PEP datasets** — politically exposed persons per FATF R.12/13
- **Legal entity registries** — active entity status, FATF R.16 UBO attestation

The underlying data is maintained continuously. Your agent calls the endpoint — it doesn't manage watchlist updates, false-positive tuning, or data freshness. That stays with the protocol.

---

## Using MCP instead of REST

All compliance tools are available in the MCP server for Claude Desktop and Cursor:

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

In a session:
- `compliance.screen` — AML + sanctions on a counterparty
- `compliance.ubo_chain` — beneficial ownership + FATF R.16
- `compliance.pep_screen` — PEP screening for individuals
- `ramp.compliance_screen` — pre-screen before issuing an Agent Card
- `flow_check` — everything in one call

---

## Note on regulatory scope

DPX provides programmatic access to screening data and generates attestations based on that data. It does not provide legal advice, and a compliance tool call does not substitute for counsel in regulated activities. For activities requiring a money transmitter license, bank partnership, or formal AML program, consult a compliance attorney. DPX is infrastructure — what you build on it is your responsibility.

---

## Related

- [Add payments to your agent](/guides/agent-payments) — full settlement loop with VoP built in
- [x402 reference](/integrations/x402) — how micropayment-gated compliance calls work
- [MCP tools](/integrations/mcp) — all 71 tools including full compliance suite
