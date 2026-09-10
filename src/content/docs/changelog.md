---
title: Changelog
description: Notable fixes and additions to DPX, dated.
---

## 2026-09-10

- **Added `agent-to-agent-invoice` to the A2A discovery card** — the invoice settlement flow (`POST /invoice` → `POST /invoice/:id/pay`) previously had no dedicated entry in `.well-known/agent.json`, so an orchestrating agent scanning the card for it would find nothing.
- **Added a machine-callable AP2 trust-bootstrap endpoint** (`POST /trust/request-issuer-status`) — any agent or platform can now request bilateral trusted-issuer status without first finding a human to email. Requests queue for human review; nothing is trusted automatically.

## 2026-09-09

- **Fixed a router asset-configuration issue** affecting real (non-sandbox) settlements in USDC and EURC on `DPXSettlementRouter`. Confirmed and corrected via direct on-chain verification.
- **Fixed an x402 response-format issue** on the invoice-pay endpoint (`POST /invoice/:id/pay`) — the 402 payment-required response now conforms to spec at the top level, matching standard x402 client libraries.
- Completed the first fully end-to-end, non-sandbox agent-to-agent settlement on Base mainnet following the fixes above — see [Trust and verification](/guides/trust-and-verification) for the receipt.

## 2026-09-06

- Closed the on-chain settlement execution gap in `@dpx/sdk` — added `buildSettlementTransactions()`, which builds the `approve()` + `router.settle()` calldata from a `/settle` response.
- Corrected the Intelligence API's documented paid-endpoint count (32, not 23 — the discovery manifest under-reports; source code is authoritative).
