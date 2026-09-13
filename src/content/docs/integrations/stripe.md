---
title: Stripe
description: Use DPX alongside Stripe — card billing via Stripe, cross-border B2B settlement via DPX.
---

Stripe and DPX handle different layers of the payments stack. Stripe owns consumer and card billing. DPX handles cross-border B2B settlement when card rails are the wrong instrument.

## Routing logic

```
Consumer payment, card charge, subscription, invoice, refund → Stripe
B2B cross-border, cross-currency, or large notional (>$10K)  → DPX
```

## Stripe App

**⚠️ Built, not yet published.** The **DPX B2B Settlement** app (v0.2.0) is built and uploaded to Stripe but was never submitted for marketplace review — verified 2026-09-13: the marketplace listing does not exist yet. The description below is the intended functionality once it's live. Use Patterns 1–3 below for a working integration today.

**What the app does:**
- Detects B2B cross-border payments in PaymentIntent and Invoice views
- Runs a live oracle stability check — PROCEED / CAUTION / HOLD — on every eligible payment
- Scores counterparties for ESG risk (SFDR PAI indicators)
- Surfaces settlement quotes with full fee breakdown
- Home panel shows live rail status and FX stress conditions across key corridors

**Permissions:** read-only on PaymentIntents, Invoices, Customers, Treasury accounts, and Transfers. No write access from the UI — settlement execution stays in your control.

**Post-install:** the app redirects to this page. Set `metadata.dpx_route=true` on any payment you want routed (see Pattern 2 below).

---

## Three integration patterns

### Pattern 1 — Combined agent (Stripe Agent Toolkit + DPX)

Run Stripe and DPX tools in the same AI agent. The agent routes automatically based on payment type.

```bash
pip install stripe-agent-toolkit openai requests
```

```python
from stripe_agent_toolkit.openai.toolkit import StripeAgentToolkit
import requests, json, openai, os

stripe_toolkit = StripeAgentToolkit(
    secret_key=os.environ["STRIPE_SECRET_KEY"],
    configuration={"actions": {
        "payment_links": {"create": True},
        "invoices":      {"create": True, "update": True},
        "customers":     {"create": True, "read": True},
    }}
)

DPX_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "dpx_oracle_check",
            "description": "Check DPX macro stability before any cross-border B2B settlement. Returns STABLE, CAUTION, or UNSTABLE.",
            "parameters": {"type": "object", "properties": {}, "required": []}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "dpx_settlement_quote",
            "description": "Get a binding DPX fee quote for a B2B cross-border settlement.",
            "parameters": {
                "type": "object",
                "properties": {
                    "amountUsd": {"type": "number"},
                    "hasFx":     {"type": "boolean"},
                    "esgScore":  {"type": "number"}
                },
                "required": ["amountUsd"]
            }
        }
    }
]

all_tools = stripe_toolkit.get_tools() + DPX_TOOLS
```

---

### Pattern 2 — Stripe webhook → DPX settlement

**⚠️ Planned, not yet deployed.** The design below (`DPX Settlement Bridge`) describes the intended integration — the endpoint is not currently live. Verified 2026-09-13: `webhook.untitledfinancial.com` resolves in DNS but has no origin server behind it (Cloudflare 522 on every path). Documented here for the design, not as something to point real Stripe events at today. Use Pattern 1 or Pattern 3 for a working integration in the meantime.

Once built: Stripe fires events → the DPX Settlement Bridge Worker catches them → runs an oracle check → fetches execution params and logs to KV.

**Intended endpoint (not live):** `https://webhook.untitledfinancial.com/stripe/webhook`

Flag payments for DPX routing when creating the payment intent:

```python
stripe.PaymentIntent.create(
    amount=85000000,  # cents
    currency="usd",
    metadata={
        "dpx_route":            "true",
        "counterparty_wallet":  "0xSupplierWallet",
        "target_currency":      "EUR",
        "esg_score":            "82"
    }
)
```

The Worker verifies the Stripe signature (HMAC-SHA256, 5-minute replay window), checks the DPX oracle, calls `/flow-estimate`, writes execution params back to Stripe metadata, and logs the event to KV.

**Webhook configuration (Stripe Dashboard → Developers → Webhooks):**
- Scope: **Your account** (not Connected accounts)
- URL: `https://webhook.untitledfinancial.com/stripe/webhook`
- Events: `payment_intent.created`, `payment_intent.succeeded`, `invoice.finalized`, `invoice.paid`, `payout.created`

**KV audit log:** every routed event is stored for 30 days. Retrieve with:

```bash
GET https://webhook.untitledfinancial.com/stripe/events/<stripe_event_id>
```

**Health check:**
```bash
GET https://webhook.untitledfinancial.com/stripe/health
```

On `payment_intent.succeeded` with `dpx_route=true`, DPX writes back to Stripe PI metadata:

```json
{
  "dpx_status":         "authorized",
  "dpx_oracle_status":  "PROCEED",
  "dpx_router_address": "0xe333551E18ef0471A71d7e8e761212766aa5AD4f",
  "dpx_quote_expires":  "1750000000",
  "dpx_net_amount":     "499500"
}
```

The next step is always caller-executed: call `approve()` + `router.settle()` on Base mainnet using the returned execution params. DPX does not move funds.

---

### Pattern 3 — Stripe Connect + DPX payout

For marketplace platforms: collect from buyers via Stripe, disburse to international suppliers via DPX instead of Stripe Connect native payouts.

Stripe Connect payouts require suppliers to have Stripe accounts and don't reach many markets. DPX reaches any wallet address in any currency corridor.

```python
# Retrieve net amount after Stripe fees and platform cut
charge = stripe.Charge.retrieve(stripe_charge_id)
disbursement_usd = (charge.amount / 100) - stripe_fee - platform_cut

# Oracle check, then DPX quote, then settlement.execute
oracle = requests.get("https://stability.untitledfinancial.com/reliability").json()
quote  = requests.get("https://stability.untitledfinancial.com/quote",
                      params={"amountUsd": disbursement_usd, "hasFx": True}).json()
```

---

## Endpoints

| Purpose | URL |
|---|---|
| Oracle stability | `https://stability.untitledfinancial.com/reliability` |
| Fee quote | `https://stability.untitledfinancial.com/quote` |
| ESG score | `https://esg.untitledfinancial.com/esg-score` |
| Webhook bridge *(planned, not yet deployed — see Pattern 2)* | `https://webhook.untitledfinancial.com/stripe/webhook` |

No API key required for oracle and pricing endpoints. Settlement execution requires a DPX integration key — contact [case@untitledfinancial.com](mailto:case@untitledfinancial.com).
