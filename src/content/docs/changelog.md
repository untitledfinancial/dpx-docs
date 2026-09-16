---
title: Changelog
description: Notable fixes and additions to DPX, dated.
---

## 2026-09-16

- **Added a UCP payment handler** — the DPX settlement rail is now declarable as a payment handler under Google's Universal Commerce Protocol (`com.untitledfinancial.agent`, handler `dpx_settlement`), reusing the existing `/quote` and `/settle` endpoints unchanged. A Business (supplier/vendor) declares the handler in its own `/.well-known/ucp` profile; a Platform (typically a buyer's procurement agent) pays with it. Framed for B2B procurement, not consumer checkout — see [UCP Settlement Handler](/protocol/ucp-settlement-handler). First implementation; not yet referenced by a live Business profile or run against UCP's conformance suite.
- **Corrected two naming collisions found while researching this, one real and one not:** `dpx-virtuals-acp` is Virtuals Protocol's unrelated "Agent Commerce Protocol" — genuinely not the industry "ACP" (OpenAI/Stripe's Agentic Commerce Protocol) that Visa's Intelligent Commerce Connect routes; DPX has no ACP integration, by deliberate choice (researched and dropped 2026-08-28 as a retail-checkout-only fit). The `/.well-known/mpp.json` file on the Stability Oracle/Settlement Agent is likewise an unrelated, pre-existing schema — but DPX *does* have genuine, spec-correct MPP (Stripe/Tempo's Machine Payments Protocol) support: `dpx-mcp-remote` returns a real `WWW-Authenticate: Payment` challenge header (mpp.dev/protocol/challenges) on every x402-gated tool's 402 response, confirmed live. That part was built and working since 2026-08-28 — it just lives on a different service than the file with the matching name.

## 2026-09-14

- **Bridged KYA agent identity to W3C DID Core + Verifiable Credentials** — `POST /agent/:id/verify` now also returns `verifiableCredential`, a VC-JWT signed with an asymmetric key resolvable at `https://compliance.untitledfinancial.com/.well-known/did.json`. A third party can now verify a DPX KYA credential independently, with no callback to DPX — the original HMAC-signed `credential` field could only ever be checked by DPX itself. See [Compliance for Autonomous Agent Transactions](/protocol/agent-transaction-compliance).
- **Added opt-in counterparty discovery** — `GET /agents/directory` lists agents that explicitly set `discoverable: true` at registration (default `false`). Solves a real gap: there was previously no way for one agent to discover that another, unrelated agent accepted DPX settlement before initiating a transaction.
- **Added invoice reconciliation** — `POST /invoice` accepts optional `externalReference` and `lineItems`; `GET /invoice/:id/reconciliation` joins a paid invoice with its full on-chain settlement record for AP/ERP matching.
- **Added recipient verification via test payment** — `POST /settle/verify-recipient` lets a paying agent confirm the on-chain counterparty is correct using a real, tiny ($0.01–$1) direct transfer before committing to a full settlement. DPX never holds funds at any point — it only checks the chain and reports what it finds.
- **Fixed the MCP/Compliance subscription system, which had never actually run** — `POST /subscribe` wrote to a KV binding name (`ORACLE_KV`) that didn't match the one actually bound (`COMPLIANCE_KV`), so an issued key was never persisted; separately, `POST /compliance/screen` never checked subscription keys at all despite its own documentation describing that it should. Both fixed; added a `free` tier (500 compliance screens/month, no payment) to `POST /subscribe` in the process. See [MCP Subscriptions](/products/mcp-subscriptions).
- **Fixed `GET /subscribe/status`'s `remaining` field**, which never actually subtracted usage due to a key-naming mismatch between the `limits` and `usage` objects — it always reported the full limit regardless of real usage.

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
