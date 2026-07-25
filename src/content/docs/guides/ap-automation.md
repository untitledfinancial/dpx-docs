---
title: AP automation agent
description: Drop-in Claude Project configuration for autonomous accounts payable — oracle-gated, compliance-screened, fully auditable. No human in the loop unless a payment is flagged.
---

A Claude Project configured with DPX MCP tools becomes a fully autonomous AP agent. Drop in the system prompt, connect the MCP server, and point it at your invoice queue. It handles the oracle check, compliance screen, and settlement for every invoice — and escalates the ones that need human review.

---

## Setup — 3 steps

### 1. Add DPX to Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "dpx": {
      "command": "npx",
      "args": ["-y", "@untitledfinancial/dpx-mcp"],
      "env": {
        "SANDBOX_MODE": "true"
      }
    }
  }
}
```

Restart Claude Desktop.

### 2. Create a Claude Project

In Claude Desktop → Projects → New Project. Paste this as the project instructions:

```
You are an accounts payable automation agent. Your job is to process vendor invoices and execute payments without human involvement unless a payment is flagged.

For every invoice:
1. Check oracle conditions via oracle.stability — if UNSTABLE, defer all payments
2. Get a fee quote via settlement.quote
3. Screen the counterparty — if BLOCKED, reject. If HOLD, escalate to human.
4. If PROCEED: execute via settlement.execute with the quoteId from step 2
5. Record every receipt

Never pay without the oracle check. Never proceed if BLOCKED. Always use the quoteId from the quote — never skip it. Sandbox mode is on unless explicitly told otherwise.

After each run, report: paid / deferred / escalated / blocked with receipts.
```

### 3. Run it

Paste your invoice list into the project chat:

```
Process these invoices:
- INV-0042: Acme GmbH, $25,000, 0xd8dA..., vendor-invoice
- INV-0043: Nova Trade SA, $12,500, 0x742d..., vendor-invoice
- INV-0044: Unknown Vendor, $8,000, [no wallet address]
```

---

## What Claude does

```
1. oracle.stability          → CAUTION (score 78) — proceed
2. settlement.quote          → quoteId=dpx-..., fee=$408, net=$24,592
3. flow-check (INV-0042)     → PROCEED
4. settlement.execute        → dpx_abc123 ✅
5. settlement.quote          → quoteId=dpx-..., fee=$204, net=$12,296
6. flow-check (INV-0043)     → PROCEED
7. settlement.execute        → dpx_def456 ✅
8. INV-0044: no wallet address → escalate ⚠️

AP Run — 2026-07-24
━━━━━━━━━━━━━━━━━━━━━
✅ Paid:       2 invoices  $37,500
⚠️  Escalated: 1 invoice   (missing wallet address)

Receipts:
- INV-0042  Acme GmbH      $25,000  dpx_abc123  STABLE/0.96
- INV-0043  Nova Trade SA  $12,500  dpx_def456  STABLE/0.94
```

---

## With a spend policy

If sub-agents are running payment batches under an orchestrator's approval, add a policy check before each settlement:

```
Before paying any invoice, call policy.check with the amount and policy_id [pol-xyz789].
Only proceed if the response is APPROVED. Record every payment against the policy after settlement.
```

The policy engine enforces the cap cryptographically — no invoice can exceed it regardless of what the agent is told.

---

## Go live

Change `SANDBOX_MODE` to `"false"` in the MCP config and ensure the sending wallet has USDC balance equal to the gross amount of each invoice.

```json
"env": { "SANDBOX_MODE": "false" }
```

Everything else is identical. The same receipts, the same compliance screens, the same oracle gate — now with real settlement on Base mainnet.

---

## What runs automatically on every payment

| Check | Trigger |
|---|---|
| Oracle gate | Blocks if global macro conditions are UNSTABLE |
| AML + sanctions | Screens both addresses on every invoice |
| FATF R16 Travel Rule | Applied at settlement time |
| ESG score | Adjusts fee — higher ESG score = lower fee |
| AI decision | `EXECUTE / HOLD / BLOCK` with confidence score and chain-of-thought trace |

Every receipt includes the full reasoning trace. Every settlement is recorded on Base mainnet.

---

## Computer use variant

If invoices arrive as PDFs, emails, or vendor portal UIs, use `computer_use.pay` instead:

```
I can see a payment approval screen for Acme GmbH, $25,000, due today.
The wallet address shown is 0xd8dA...
```

Claude calls `computer_use.pay` with the screen context, runs the full 4-step flow, and returns a receipt — without you typing card details or credentials into the UI.

---

## Related

- [Agent-to-agent payments](/guides/agent-to-agent-payments) — invoice protocol for machine-issued invoices
- [Multi-agent payments](/guides/multi-agent-payments) — orchestrator/sub-agent delegation with spend limits
- [Computer use payment interception](/guides/computer-use-payments) — completing payments found in UIs
