---
title: n8n — Workflow Automation
description: Use DPX inside n8n workflows to automate settlement pricing and stability checks.
---

Connect DPX to n8n using the **HTTP Request** node. n8n's no-code interface lets you build settlement workflows, trigger alerts on peg deviations, and route transactions based on live ESG scores.

## Workflow: Price a settlement

### Nodes

1. **Trigger** — Webhook, Schedule, or any upstream node
2. **HTTP Request** — GET `/esg-score` from ESG Oracle
3. **Set** — Extract `scores.average` into a variable
4. **HTTP Request** — GET `/quote` with `amountUsd`, `hasFx=true`, `esgScore`
5. **HTTP Request** — GET `/reliability`
6. **IF** — Branch on `isHealthy` and `stability.currentScore >= 90`
7. **HTTP Request** — POST to your settlement system with `quoteId`

## HTTP Request node config — Get quote

| Field | Value |
|---|---|
| Method | GET |
| URL | `http://localhost:3000/quote` |
| Query Parameters | `amountUsd`, `hasFx`, `esgScore` |
| Authentication | None |
| Response Format | JSON |

## HTTP Request node config — Check reliability

| Field | Value |
|---|---|
| Method | GET |
| URL | `http://localhost:3000/reliability` |
| Authentication | None |
| Response Format | JSON |

## Example: Peg alert workflow

1. **Schedule Trigger** — every 5 minutes
2. **HTTP Request** — GET `localhost:3000/reliability`
3. **IF** — `{{ $json.peg.deviationBps }} >= 50`
4. **Slack / Email** — Send alert with deviation value
5. **Else** — No action

## Self-hosted n8n

If running n8n locally, both oracle URLs are reachable at `localhost:3000` and `localhost:3001`.

For n8n Cloud, deploy the oracles to a public URL (e.g. `https://stability.dpx.finance`) and use that as the base URL in your HTTP Request nodes.

## Credentials

No API keys required. All DPX pricing and discovery endpoints are public.
