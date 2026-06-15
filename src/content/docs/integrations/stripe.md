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

Full agent script: [github.com/untitledfinancial/dpx-integrations/blob/main/stripe/agent-toolkit.py](https://github.com/untitledfinancial/dpx-integrations/blob/main/stripe/agent-toolkit.py)

---

### Pattern 2 — Stripe webhook → DPX settlement

Stripe fires `payment_intent.succeeded` → a Cloudflare Worker catches it → runs a DPX oracle check → queues the cross-border disbursement.

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

The Worker verifies the Stripe signature, checks the DPX oracle, gets a quote, and queues settlement. Deploy to Cloudflare Workers, then set in Stripe Dashboard → Developers → Webhooks.

Full Worker: [github.com/untitledfinancial/dpx-integrations/blob/main/stripe/webhook-bridge.js](https://github.com/untitledfinancial/dpx-integrations/blob/main/stripe/webhook-bridge.js)

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

Full script: [github.com/untitledfinancial/dpx-integrations/blob/main/stripe/connect-payout.py](https://github.com/untitledfinancial/dpx-integrations/blob/main/stripe/connect-payout.py)

---

## Endpoints

| Purpose | URL |
|---|---|
| Oracle stability | `https://stability.untitledfinancial.com/reliability` |
| Fee quote | `https://stability.untitledfinancial.com/quote` |
| ESG score | `https://esg.untitledfinancial.com/esg-score` |

No API key required for oracle and pricing endpoints. Settlement execution requires a DPX integration key — contact [case@untitledfinancial.com](mailto:case@untitledfinancial.com).
