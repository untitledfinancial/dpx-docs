---
title: Webhook Events
description: Receive DPX settlement events via webhook.
---

Webhook / event-driven integration is coming soon.

This will allow your treasury system to receive real-time notifications for settlement confirmations, oracle stability changes, and ESG score updates — without polling.

## Planned events

| Event | Trigger |
|---|---|
| `settlement.confirmed` | On-chain settlement transaction confirmed |
| `quote.expired` | `quoteId` validity window elapsed |
| `oracle.alert` | Stability score drops below threshold |
| `peg.alert` | Peg deviation exceeds 50 bps |
| `esg.updated` | ESG oracle run completes |

## Get early access

[Request beta access →](/beta)

In the meantime, you can poll `/reliability` on a schedule — see the [n8n peg alert workflow](/integrations/n8n) for an example.
