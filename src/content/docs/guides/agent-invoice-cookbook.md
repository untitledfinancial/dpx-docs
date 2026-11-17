---
title: Agent-to-agent invoice cookbook
description: A worked example of one agent invoicing another over DPX MCP and the second agent checking and paying it, with a script you can run.
---

This is a complete, runnable example of agent-to-agent invoicing: **Agent A** (the seller) creates an invoice, **Agent B** (the buyer) reads it, decides whether it is acceptable, and pays it. It uses three tools on the DPX MCP server: `invoice.create`, `invoice.get` and `invoice.pay`.

The script is [`/examples/agent-invoice.mjs`](/examples/agent-invoice.mjs). It needs Node 18 or later and no wallet for the first run.

## The flow

```
Agent A                         DPX MCP                          Agent B
  │  invoice.create  ───────────▶  invoiceId, payUrl, expiresAt
  │  (send invoiceId to B)  ─────────────────────────────────────▶
  │                                  ◀──────── invoice.get (free) ──┤  check status, amount, expiry
  │                                  ◀──────── invoice.pay ─────────┤  settlement runs
  │  invoice.get  ───────────────▶  status: PAID
```

## Step 1: Agent A creates the invoice

`invoice.create` is free. Only `amount` is required. Useful fields:

| Field | Meaning |
|---|---|
| `amount` | Amount in the source currency |
| `currency`, `destinationCurrency` | Source and destination currency codes (both default to USD) |
| `description` | What the invoice is for |
| `externalReference` | Your own identifier, so you can match the payment to your records |
| `recipientAddress` | The payee wallet, if you want it fixed on the invoice |

The response includes `invoiceId`, a `payUrl`, a `viewUrl`, `status: "OPEN"`, and `expiresAt` (24 hours after creation). Agent A sends the `invoiceId` to Agent B by whatever channel the two agents share.

## Step 2: Agent B reads before paying

`invoice.get` is free and returns the same record. An agent should not pay blindly. Before paying, check that:

- `status` is `OPEN` (an invoice can also be `PAID` or `EXPIRED`),
- `amount` and the currency pair are what you expect for this counterparty,
- `expiresAt` is in the future,
- `externalReference` matches an order you recognise.

If any check fails, stop. The example script exits without paying.

## Step 3: Agent B pays

`invoice.pay` retrieves the invoice, runs settlement, and marks it `PAID` on success. It takes `invoiceId`, `recipientAddress` (required if the invoice does not already have one) and `sandbox`.

- **Sandbox is the default.** With `sandbox: true` the call returns a simulated receipt. Set `sandbox: false` only when you intend a live settlement.
- **Live mode is sender-funded.** DPX returns the execution parameters; Agent B then performs the on-chain approval and settlement from its own wallet and pays its own gas. DPX does not hold or move Agent B's funds.
- **The tool call itself is paid per call over x402.** Without a payment attached, the server answers `402` with the exact requirement (network, asset, amount, recipient). Build a payment from that requirement with any x402 client and send it in the `X-PAYMENT` header. The script prints the requirement and, if you set `X_PAYMENT`, retries with it.

## Step 4: Agent A confirms

Agent A calls `invoice.get` again. Once the settlement completes, `status` is `PAID`.

## What has been verified

The `invoice.create` and `invoice.get` steps and the `402` requirement from `invoice.pay` were run against the live server when this page was written. The paid retry and the live-mode on-chain settlement were not run as part of writing this page, because they require a funded wallet; test them in sandbox first.

## Related

- [Agent-to-agent payments](/guides/agent-to-agent-payments)
- [x402 payments](/integrations/x402)
- [Error handling](/guides/error-handling)
