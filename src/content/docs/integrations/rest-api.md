---
title: REST API — Any TMS
description: Connect any treasury management system to DPX via REST API.
---

DPX exposes a standard REST API over HTTPS. Any treasury management system with HTTP request capability can integrate directly — no SDK required.

## Base URLs

| Service | URL |
|---|---|
| Stability Oracle | `https://stability.untitledfinancial.com` |
| ESG Oracle | `https://esg.untitledfinancial.com` |

## Authentication

No API keys required. All pricing and discovery endpoints are public.

## Core endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/manifest` | GET | Protocol discovery — capabilities, fees, contracts |
| `/quote` | GET / POST | Fee breakdown for a transaction |
| `/verify-fees` | GET | Confirm on-chain fees match quote |
| `/reliability` | GET | Stability signals before large settlements |
| `/fee-schedule` | GET | Full fee table |
| `/esg-score` | GET | Live ESG scores (ESG Oracle) |

## Minimal integration pattern

1. **Price** — `GET /quote?amountUsd=VALUE&hasFx=true&esgScore=SCORE`
2. **Verify** — confirm `feesMatch: true` from `/verify-fees`
3. **Check stability** — confirm `isHealthy: true` from `/reliability`
4. **Execute** — submit `quoteId` to the settlement router

## Webhook / event support

Coming soon — see [Webhook Events](/integrations/webhooks).

## Full API reference

- [Stability Oracle API](/api/stability-oracle)
- [ESG Oracle API](/api/esg-oracle)
