---
title: Reliability and status
description: What DPX reports about its own availability, how failures are handled, and what is and is not committed today.
---

This page states what DPX measures and publishes about reliability, and what it does not yet commit to. It is written for technical and procurement reviews.

## What is published

| Item | Where |
|---|---|
| Live service status and latency | [status.untitledfinancial.com](https://status.untitledfinancial.com) (machine-readable at `/api`) |
| Oracle uptime and update cadence | `GET /reliability` on the [Stability Oracle](/api/stability-oracle/) and the [ESG Oracle](/api/esg-oracle/) |
| Prediction ledger | `GET /v1/intelligence/ledger` (free) |
| Payment discovery and current prices | `GET /.well-known/x402` on the Intelligence API |

On 2026-10-10 the two oracle `/reliability` endpoints reported 99.17% (Stability Oracle) and 98.74% (ESG Oracle) uptime, each with an hourly update cadence. These are figures the services report about themselves, not an independent measurement, and they will have changed by the time you read this. Query the endpoints for current values.

## What is not committed today

- **There is no published service-level agreement.** DPX does not currently publish an availability target with service credits, a support response time, or a maintenance-window policy. Availability and support commitments for institutional customers would be set out in a written agreement.
- **No third-party security attestation is claimed.** DPX does not currently claim a SOC 2 or ISO 27001 attestation. Ask for the current security documentation before relying on any control.

## How failures are handled

These behaviors are implemented in code and can be verified:

- **Paid tool calls fail closed.** On the MCP server, if a payment verifies but the facilitator does not confirm settlement, the result is withheld and the call returns a 402. It does not return data for an unconfirmed payment.
- **Unpaid calls get a usable response.** A paid MCP tool called without payment returns a 402 with the exact x402 requirements, and the free-key signup call for callers that cannot pay per request.
- **Settlement is sender-funded.** DPX authorizes a settlement and returns the execution parameters; the sender signs and broadcasts the on-chain transaction. DPX does not hold or move a customer's funds on their behalf.
- **Screening fails closed.** If the compliance oracle is unreachable or returns an invalid response during a settlement check, the settlement is not authorized.
- **Data sources can fail independently.** Intelligence modules call free public APIs. When one is unavailable, a module may continue with the remaining inputs or use a documented neutral value. See [Data lineage and methodology](/guides/data-lineage/) for each endpoint's sources and limits.

## Reporting a problem

Incorrect or stale data in a response is worth reporting even when the call succeeded. Include the endpoint, the timestamp from the response (`generatedAt`), and the request you made.
