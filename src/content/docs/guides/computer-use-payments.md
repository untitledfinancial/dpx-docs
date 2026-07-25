---
title: Computer use payment interception
description: When Claude's computer use session encounters a payment form, vendor portal, or invoice approval UI — route it through DPX instead of re-entering credentials or waiting for human approval.
---

Claude's computer use capability lets it navigate UIs, fill forms, and complete tasks on screen. The one step that used to break the loop: payment. Entering card details, bank credentials, or triggering a wire from a vendor portal requires human re-entry — or does it.

`computer_use.pay` closes that gap. When Claude sees a payment on screen, it calls this tool instead of typing into the form. DPX runs the compliance screen and settlement autonomously. The agent returns a receipt.

---

## The problem it solves

Without DPX:
```
Claude navigates vendor portal → finds "Approve Payment" → amount $25,000
→ needs credentials / human approval → loop breaks → task incomplete
```

With DPX:
```
Claude navigates vendor portal → finds "Approve Payment" → amount $25,000
→ calls computer_use.pay with screen context + amount + recipient
→ DPX settles → receipt returned → task complete
```

---

## Setup

Add DPX to Claude Desktop:

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

---

## System prompt addition

Add this to any computer use system prompt:

```
When you encounter a payment, wire transfer, invoice approval, or checkout
on screen, do not type credentials or click "Pay" yourself.

Instead, call computer_use.pay with:
- screen_context: describe exactly what you see (vendor name, invoice number, UI)
- amount: the dollar amount shown
- recipient_address: the wallet address if visible (0x...)
- purpose: vendor-invoice / contractor-payment / procurement / subscription
- counterparty_name: the vendor name shown on screen

DPX will run compliance screening and settle the payment. You will receive
a receipt with a settlement ID. Record this in your task output and continue.

If flow-check returns HOLD, stop and escalate to the user.
If flow-check returns BLOCKED, do not attempt to pay by any other means.
```

---

## Example — vendor portal

Claude is completing a procurement task and reaches a payment approval screen:

**Claude sees:**
```
Vendor: Acme GmbH
Invoice: #INV-2026-0042
Amount: $25,000.00 USD
Payment method: [wallet / bank transfer]
Recipient: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
[APPROVE PAYMENT]
```

**Claude calls:**
```json
{
  "tool": "computer_use.pay",
  "inputs": {
    "screen_context": "Vendor portal payment approval — Acme GmbH invoice INV-2026-0042 for $25,000 USD. Recipient wallet shown.",
    "amount": 25000,
    "recipient_address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "purpose": "vendor-invoice",
    "counterparty_name": "Acme GmbH",
    "sandbox": true
  }
}
```

**DPX returns:**
```json
{
  "decision": "EXECUTED",
  "settlementId": "dpx_abc123...",
  "status": "sandbox",
  "netUsd": 24591.46,
  "feeUsd": 408.54,
  "aiDecision": "EXECUTE",
  "aiConfidence": 0.96,
  "screen_context": "Vendor portal payment approval — Acme GmbH..."
}
```

Claude records the receipt and continues the task.

---

## What runs automatically

`computer_use.pay` runs the full 4-step flow internally:

| Step | What happens |
|---|---|
| Oracle gate | Aborts if global conditions UNSTABLE — returns `ABORTED` with reason |
| Fee quote | Gets binding quote (300s TTL) for the exact amount |
| Compliance screen | AML + sanctions + FATF R16 — returns PROCEED / HOLD / BLOCKED |
| Settlement | Executes on Base mainnet with the quoteId — returns receipt |

If any step returns a stop signal, the tool returns `decision: ABORTED / HOLD / BLOCKED` with a clear reason. Claude does not attempt the payment by any other means.

---

## No wallet address on screen?

If the vendor portal shows only a bank account number, IBAN, or email — use `settlement.nl` instead:

```json
{
  "tool": "settlement.nl",
  "inputs": {
    "instruction": "Pay Acme GmbH $25,000 for invoice INV-2026-0042. Bank account: DE89 3704 0044 0532 0130 00. Purpose: vendor-invoice.",
    "recipient_address": "0x...",
    "sandbox": true
  }
}
```

DPX's AI synthesis layer parses the instruction and executes.

---

## Related

- [AP automation agent](/guides/ap-automation) — batch invoice processing with the same tools
- [Agent-to-agent payments](/guides/agent-to-agent-payments) — machine-issued invoices paid autonomously
- [For AI builders](/guides/for-ai-builders) — full MCP tool reference
