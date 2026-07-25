---
title: Agent-to-agent payments
description: How two autonomous agents can exchange value end-to-end — no human, no bank account, no API key.
---

The invoice protocol makes agent-to-agent payment a two-call operation. Agent A creates an invoice. Agent B pays it. Both sides are autonomous — no human approval, no shared credentials, no out-of-band coordination.

This is the clearest expression of what DPX is for.

---

## How it works

```
Agent A                              Agent B
  │                                    │
  ├─ POST /invoice ──────────────────► │  (invoiceId returned)
  │                                    │
  │  ◄── share invoiceId via any channel (message, webhook, shared state)
  │                                    │
  │                         GET /invoice/{id}
  │                                    │  (verify amount + description)
  │                                    │
  │                        POST /invoice/{id}/pay
  │                                    │
  │  ◄── receipt (settlementId, txHash, aiDecision)
```

No wallet needed for Agent A. No API key needed for Agent B. The compliance screen and oracle gate run automatically at pay time.

---

## MCP — no HTTP wiring needed

If both agents are running with the DPX MCP server:

```json
{
  "mcpServers": {
    "dpx": { "command": "npx", "args": ["-y", "@untitledfinancial/dpx-mcp"] }
  }
}
```

Agent A:
```
Create an invoice for $5,000 USD payable to 0x... for data processing services rendered.
```

Agent B (receives the invoiceId):
```
Check invoice dpx-inv-abc123 and pay it if the amount and description look legitimate.
```

---

## REST

### Agent A — create invoice

```bash
curl -X POST https://agent.untitledfinancial.com/invoice \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "recipientAddress": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "description": "Data processing services — batch job #2026-0042",
    "currency": "USD"
  }'
```

Response:
```json
{
  "invoiceId": "dpx-inv-abc123",
  "amount": 5000,
  "currency": "USD",
  "description": "Data processing services — batch job #2026-0042",
  "recipientAddress": "0xd8...",
  "payUrl": "https://agent.untitledfinancial.com/invoice/dpx-inv-abc123/pay",
  "status": "pending",
  "expiresAt": "2026-07-25T20:00:00.000Z"
}
```

### Agent B — pay invoice

```bash
curl -X POST https://agent.untitledfinancial.com/invoice/dpx-inv-abc123/pay \
  -H "Content-Type: application/json" \
  -d '{
    "payerAddress": "0x1234...",
    "sandbox": true
  }'
```

Response:
```json
{
  "settlementId": "dpx_abc123...",
  "status": "sandbox",
  "netAmount": 4917.5,
  "aiDecision": "EXECUTE",
  "aiConfidence": 0.96,
  "txHash": null
}
```

---

## Python — full agent-to-agent loop

```python
import httpx

AGENT = "https://agent.untitledfinancial.com"

# Agent A: issue invoice
invoice = httpx.post(f"{AGENT}/invoice", json={
    "amount": 5000,
    "recipientAddress": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "description": "Data processing services — batch job #2026-0042",
    "currency": "USD",
}).json()

invoice_id = invoice["invoiceId"]
print(f"Invoice created: {invoice_id}")

# --- invoiceId passed to Agent B via any channel ---

# Agent B: verify and pay
details = httpx.get(f"{AGENT}/invoice/{invoice_id}").json()
print(f"Amount: ${details['amount']} — {details['description']}")

receipt = httpx.post(f"{AGENT}/invoice/{invoice_id}/pay", json={
    "payerAddress": "0x1234567890123456789012345678901234567890",
    "sandbox": True,
}).json()

print(f"Paid: {receipt['settlementId']}  decision={receipt['aiDecision']}")
```

---

## With spend policy (multi-agent systems)

When Agent B is a sub-agent operating under an orchestrator's spend limit, add a policy check before paying:

```python
import httpx

POLICY = "https://policy.untitledfinancial.com"
AGENT  = "https://agent.untitledfinancial.com"

# Orchestrator created this policy; sub-agent received policy_id
policy_id = "pol-xyz789"

# 1. Check policy before paying
check = httpx.post(f"{POLICY}/policy/{policy_id}/check", json={
    "amount": 5000,
    "purpose": "vendor-invoice",
}).json()

if check["decision"] != "APPROVED":
    print(f"Blocked by policy: {check['reason']}")
else:
    # 2. Pay the invoice
    receipt = httpx.post(f"{AGENT}/invoice/{invoice_id}/pay", json={
        "payerAddress": "0x...",
        "sandbox": True,
    }).json()

    # 3. Record against policy ledger
    httpx.post(f"{POLICY}/policy/{policy_id}/record", json={
        "amount": 5000,
        "settlementId": receipt["settlementId"],
        "purpose": "vendor-invoice",
    })
    print(f"Paid and recorded: {receipt['settlementId']}")
```

---

## What DPX runs automatically at pay time

Agent B doesn't need to run any checks manually. At `POST /invoice/{id}/pay` DPX runs:

| Check | What it does |
|---|---|
| Oracle gate | Blocks settlement if global conditions are UNSTABLE |
| AML screen | Sanctions + graph risk on both addresses |
| FATF R16 | Travel Rule compliance |
| ESG score | Adjusts fee based on counterparty ESG score |
| AI decision | `aiDecision: EXECUTE / HOLD / BLOCK` with confidence + reasoning |

Everything is in the receipt.

---

## Related

- [Multi-agent payments](/guides/multi-agent-payments) — Policy Engine walkthrough for orchestrator/sub-agent spend limits
- [For AI builders](/guides/for-ai-builders) — Full task-oriented MCP reference
- [Agent frameworks](/guides/agent-frameworks) — Same flow for OpenAI Agents SDK, smolagents, AutoGen, Google ADK
