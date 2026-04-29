---
title: Mercury
description: Route Mercury payments to DPX settlements automatically via webhook or polling.
---

import { Aside } from '@astrojs/starlight/components';

<Aside type="caution" title="Sandbox only">
The Mercury integration is currently in sandbox mode. The connector and webhook endpoint are fully built and tested. Live activation requires your Mercury API key and `MERCURY_WEBHOOK_SECRET` configured in the Settlement Agent.
</Aside>

DPX integrates directly with [Mercury](https://mercury.com) — connecting Mercury's banking layer to DPX's settlement and oracle layer. When a Mercury payment is tagged for DPX routing, it flows automatically through oracle verification, Claude reasoning, and on-chain settlement.

## How it works

```
Mercury payment.sent
  → DPX /mercury-webhook
    → HMAC signature verified
      → Oracle check + Claude reasoning
        → router.settle() on Base mainnet
          → Settlement receipt logged
```

Mercury handles the banking side (ACH, wires, balances). DPX handles the stablecoin settlement side (oracle intelligence, ESG scoring, on-chain execution).

## Setup

### 1. Install Mercury CLI

```bash
curl -sSf https://cli.mercury.com/install.sh | sh
mercury login
```

### 2. Register the DPX webhook

```bash
mercury webhook create \
  --url https://agent.untitledfinancial.com/mercury-webhook \
  --events payment.sent
```

Copy the **signing secret** from the output.

### 3. Add secrets to the Settlement Agent

```bash
cd dpx-agents/settlement-agent

wrangler secret put MERCURY_WEBHOOK_SECRET
# Paste the signing secret from step 2

wrangler secret put MERCURY_DEFAULT_RECIPIENT
# Paste the on-chain wallet address for unspecified recipients
```

### 4. Tag payments for DPX routing

Include a DPX tag in the Mercury payment note or metadata:

| Method | Example |
|---|---|
| Note / memo | `"Intercompany Q2 dpx:0xYourWalletAddress"` |
| Payment metadata | `dpx_recipient = 0xYourWalletAddress` |
| Metadata flag | `dpx_route = true` (uses `MERCURY_DEFAULT_RECIPIENT`) |

Payments without a DPX tag are acknowledged but not routed — Mercury receives a `200 OK` with `action: ignored`.

## Payment routing

The `/mercury-webhook` endpoint on the Settlement Agent:

1. **Verifies** the `Mercury-Signature` HMAC-SHA256 header
2. **Filters** to `payment.sent` events only
3. **Converts** Mercury cents → USD
4. **Extracts** the on-chain recipient from metadata, note, or default
5. **Routes** to the standard DPX settlement flow — oracle check, Claude decision, on-chain execution

## Cross-currency settlements

To route a Mercury USD payment to a EUR settlement, add `destination_currency` to the payment metadata:

```
destination_currency = EUR
```

DPX will apply FX fee (0.40%) and route through EURC on Base.

## Polling (alternative to webhook)

For environments where webhooks aren't available, the Mercury watcher polls for new transactions every 10 seconds:

```bash
export MERCURY_API_KEY=your_key
export DPX_AGENT_URL=https://agent.untitledfinancial.com
export DPX_DEFAULT_RECIPIENT=0xYourAddress

npm run watch
# from dpx-agents/mercury/
```

The watcher picks up payments containing `dpx:0x...` in the note field and routes them identically to the webhook flow.

## Mercury CLI reference

```bash
mercury account list                    # Check balances
mercury payment create                  # Initiate a payment
mercury transaction list                # Recent transactions
mercury webhook list                    # View registered webhooks
mercury webhook delete <id>             # Remove a webhook
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `MERCURY_WEBHOOK_SECRET` | Yes (webhook) | Signing secret from Mercury webhook registration |
| `MERCURY_DEFAULT_RECIPIENT` | Recommended | Fallback on-chain address for `dpx_route=true` payments |
| `MERCURY_API_KEY` | Yes (watcher) | Mercury API key for polling mode |

## What happens on HOLD

If the oracle is in CAUTION or UNSTABLE, Claude will HOLD the settlement:

```json
{
  "settlementId": "dpx_abc123",
  "status": "held",
  "reasoning": "CAUTION conditions with $500,000 exceeds $100K threshold. Flagging for review.",
  "oracleScore": 81
}
```

The Mercury payment is already sent — DPX logs the hold. Resubmit when oracle returns STABLE, using the same `referenceId`.

## Resources

- [Mercury CLI repo →](https://github.com/MercuryTechnologies/mercury-cli)
- [Mercury sandbox →](https://sandbox.mercury.com)
- [DPX Settlement Agent →](/protocol/settlement-agent)
- [Oracle conditions →](/protocol/stability-oracle)
