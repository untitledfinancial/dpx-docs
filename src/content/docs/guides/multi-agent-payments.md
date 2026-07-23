---
title: Multi-agent payments and delegated authorization
description: How to build orchestrator/sub-agent payment systems using the DPX Policy Engine — spend limits, delegation chains, and cryptographically-enforced receipts.
---

The DPX Policy Engine lets an orchestrator agent delegate payment authority to sub-agents with explicit, cryptographically-enforced limits. Sub-agents can only spend within what they were delegated. Every transaction is recorded as a signed receipt trail that the orchestrator can audit at any time.

## The pattern

```
Orchestrator
  ├── creates policy (max $10K/tx, $50K/day)
  └── delegates to sub-agents (each capped at $5K/tx, $15K total)
        ├── Sub-agent A → $4K invoice → ALLOW → receipt recorded
        ├── Sub-agent B → $4K invoice → ALLOW → receipt recorded
        └── Sub-agent C → $8K invoice → BLOCK (lifetime ceiling reached)

Orchestrator queries ledger → full session spend graph
```

No sub-agent can exceed its delegation. No delegation can exceed the parent policy. The engine enforces this cryptographically — not through configuration files or honor systems.

---

## Step 1 — Orchestrator creates a spending policy

```typescript
const policy = await fetch('https://policy.untitledfinancial.com/policy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agent_id:              'orchestrator-agent',
    name:                  'Q3 Procurement Policy',
    max_per_tx:            10_000,   // $10K ceiling per transaction
    max_per_day:           50_000,   // $50K daily rolling limit
    require_hold_above:    8_000,    // human review above $8K
    require_oracle_stable: false,    // allow CAUTION, block UNSTABLE
  }),
}).then(r => r.json());

console.log(policy.id); // "pol_..."
```

The policy ID is the root of the authorization tree. Every delegation and receipt traces back to it.

---

## Step 2 — Delegate to sub-agents

Each sub-agent gets its own delegation with explicit per-tx and lifetime caps. A sub-agent's caps cannot exceed the parent policy.

```typescript
const delegation = await fetch('https://policy.untitledfinancial.com/delegate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    parent_agent_id: 'orchestrator-agent',
    child_agent_id:  'sub-agent-procurement-a',
    policy_id:       policy.id,
    max_per_tx:      5_000,    // $5K per transaction
    max_total:       15_000,   // $15K total across all transactions
  }),
}).then(r => r.json());

console.log(delegation.id); // "del_..."
```

Delegate to multiple sub-agents in parallel:

```typescript
const [delegA, delegB, delegC] = await Promise.all([
  createDelegation('sub-agent-procurement-a', policy.id),
  createDelegation('sub-agent-procurement-b', policy.id),
  createDelegation('sub-agent-procurement-c', policy.id),
]);
```

---

## Step 3 — Sub-agent checks policy before spending

Before a sub-agent executes any payment, it checks whether the spend is authorized:

```typescript
const check = await fetch('https://policy.untitledfinancial.com/policy/check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agent_id:      'sub-agent-procurement-a',
    delegation_id: delegA.id,
    amount:        4_000,
    currency:      'USD',
    purpose:       'vendor-invoice',
    session_id:    sessionId,
  }),
}).then(r => r.json());

if (check.decision === 'ALLOW') {
  // proceed to settlement
} else if (check.decision === 'HOLD') {
  // above require_hold_above threshold — needs human review
} else {
  // BLOCK — over delegation ceiling or policy violation
  console.error(check.reason);
}
```

Decisions:
- `ALLOW` — within delegation limits, proceed
- `HOLD` — amount exceeds `require_hold_above`, route to human review queue
- `BLOCK` — over per-tx cap or lifetime ceiling, do not proceed

---

## Step 4 — Record a receipt after settlement

Once the settlement executes, the sub-agent records a signed receipt. This closes the authorization loop and updates the lifetime spend counter.

```typescript
const receipt = await fetch('https://policy.untitledfinancial.com/receipt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agent_id:      'sub-agent-procurement-a',
    delegation_id: delegA.id,
    session_id:    sessionId,
    amount:        4_000,
    currency:      'USD',
    tx_hash:       settled.txHash,
    purpose:       'vendor-invoice',
    recipient:     recipientAddress,
  }),
}).then(r => r.json());

console.log(receipt.id);          // "rec_..."
console.log(receipt.lifetime_used); // 4000 — running total for this delegation
```

The receipt is signed by the Policy Engine and is tamper-evident. You cannot record a receipt without a prior ALLOW decision for the same session and amount.

---

## Step 5 — Orchestrator audits the session ledger

At any point the orchestrator can pull the full spend graph for a session:

```typescript
const ledger = await fetch(
  `https://policy.untitledfinancial.com/ledger/${sessionId}`
).then(r => r.json());

console.log(ledger.total_spent);    // 8000
console.log(ledger.tx_count);       // 2
console.log(ledger.receipts);       // array of signed receipts
```

Each entry in `receipts` includes the sub-agent ID, amount, tx hash, timestamp, and HMAC signature. The orchestrator can verify any receipt independently.

---

## Full working example

```bash
git clone https://github.com/untitledfinancial/dpx-agent-public
cd dpx-agent-public
npm install && cp .env.example .env
npx ts-node examples/delegation_demo.ts
```

Expected output:
```
Sub-agent A → $4,000 → ALLOW  ✓
Sub-agent B → $4,000 → ALLOW  ✓
Sub-agent C → $8,000 → BLOCK  (lifetime ceiling reached after $8K)
Ledger: $8,000 moved in 2 transactions
```

---

## Policy Engine endpoints

| Endpoint | Description |
|---|---|
| `POST /policy` | Create a root policy |
| `GET /policy/:id` | Retrieve policy by ID |
| `GET /policy/agent/:agent_id` | All policies for an agent |
| `POST /delegate` | Delegate authority to a sub-agent |
| `GET /delegate/:id` | Retrieve delegation |
| `DELETE /delegate/:id` | Revoke delegation immediately |
| `POST /policy/check` | Check whether a spend is authorized |
| `POST /receipt` | Record a signed receipt post-settlement |
| `GET /receipt/session/:id` | All receipts for a session |
| `GET /ledger/:session_id` | Full spend graph for a session |

Base URL: `https://policy.untitledfinancial.com`

---

## When to use the Policy Engine

**Procurement agents** — an orchestrator approves a budget; sub-agents pay individual invoices autonomously within it.

**Payroll agents** — orchestrator sets a monthly payroll envelope; sub-agents pay individual contractors without human approval per payment.

**Treasury ops** — a controller agent sets corridor limits; execution agents route payments within those limits and the ledger provides the audit trail.

**Multi-tenant platforms** — each tenant gets their own policy tree. Sub-agent spend is isolated per-tenant and auditable independently.

---

## Related

- [Add payments to your agent](/guides/agent-payments) — the base settlement loop
- [Error handling](/guides/error-handling) — HOLD and BLOCK responses
- [MCP tools](/integrations/mcp) — `policy.*` tools for MCP-native orchestration
