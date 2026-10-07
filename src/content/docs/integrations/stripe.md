---
title: Stripe
description: Use DPX alongside Stripe — card billing and agentic commerce via Stripe, agent-to-agent B2B settlement and compliance via DPX.
---

Stripe and DPX sit at different layers of the agent-payments stack, and that's deliberate — DPX is built to compose with the rail Stripe is assembling (Open USD, Tempo, Machine Payments Protocol, Universal Commerce Protocol), not to replace it. Stripe's 2026 stack gives agents a settlement network and a payment-authorization protocol. It does not yet publish FATF R.16 travel-rule attestation, sanctions/AML screening wired into payment authorization, KYA (Know Your Agent) identity tiers with GLEIF LEI verification, or ESG/SFDR-linked compliance anywhere in its public materials. That's exactly DPX's depth, and it's protocol-level — an agent settling value over OUSD, Tempo, or MPP today can independently layer DPX's mandate/compliance checks on top without either side needing to integrate with the other first.

The practical routing split below still holds for day-to-day use: Stripe owns consumer and card billing. DPX handles agent-to-agent and cross-border B2B settlement — the cases Stripe's card rails were never built for, and where compliance screening on the payment itself matters most. DPX settles in USDC/EURC today and also has its own token deployed on Base mainnet; it is not a single-stablecoin rail.

## Routing logic

```
Consumer payment, card charge, subscription, invoice, refund → Stripe
B2B cross-border, cross-currency, or large notional (>$10K)  → DPX
```

## Stripe App

**⚠️ Built and live for DPX's own account, not yet marketplace-listed.** The **DPX B2B Settlement** app (v0.2.0) is built, and its webhook bridge (Pattern 2 below) is deployed and live — verified: `https://webhook.untitledfinancial.com/stripe/health` returns 200. Two things still block a public listing: `stripe-app.json` has `distribution_type: "private"` (a Stripe App setting, nothing to do with DPX's own privacy — it just means only accounts DPX explicitly invites can install it), and the webhook's multi-tenant OAuth path (per-merchant Stripe account credentials) is coded but not yet configured in the Stripe Dashboard — so today the app only writes back correctly to DPX's own account, not an installing merchant's. Use Patterns 1–3 below for a working integration today; Pattern 2 is live, not hypothetical.

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

**Live for DPX's own Stripe account.** Stripe fires events → the DPX Settlement Bridge Worker catches them → runs an oracle check → fetches execution params and logs to KV. Verified live: health check returns 200, event lookup correctly 404s on an unknown event ID (not a dead route). A different company cannot yet point its own Stripe account at this endpoint and get correct metadata write-back — that requires the multi-tenant OAuth path, which is written but not yet configured (see the Stripe App note above). Contact [case@untitledfinancial.com](mailto:case@untitledfinancial.com) if you want this wired to your own account ahead of the public OAuth flow going live.

**Endpoint:** `https://webhook.untitledfinancial.com/stripe/webhook`

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
| Webhook bridge *(live for DPX's own account; multi-tenant OAuth not yet configured — see Pattern 2)* | `https://webhook.untitledfinancial.com/stripe/webhook` |

No API key required for oracle and pricing endpoints. Settlement execution requires a DPX integration key — contact [case@untitledfinancial.com](mailto:case@untitledfinancial.com).
