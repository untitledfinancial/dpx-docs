---
title: Changelog
description: Notable fixes and additions to DPX, dated.
---

## 2026-11-11

- **Added `GET /v1/intelligence/schema`** — a free, machine-readable description of every Intelligence endpoint: price, output fields, and the quality contract it is held to. See [Endpoint schema and quality contract](/api/intelligence-api#endpoint-schema-and-quality-contract).

## 2026-11-09

- **Revoking an agent now minimizes its record.** The contact email, mandate, public key and attestation detail are deleted, the agent leaves the public directory, and a tombstone is kept (agent id, owner entity, wallet, the tier it held, when and by whom it was revoked). The id keeps answering `REVOKED` rather than 404, and a revoked agent cannot receive a new mandate or attestation. Retention of the tombstone is configurable.
- **`GET /agent/{id}` no longer returns the owner's contact email** — it reports whether one is on file. Agent ids are discoverable, so the email should not have been public.
- **Added an operator-only purge** (`DELETE /agent/{id}?purge=1`) for test data and mistakes; it refuses to delete an agent that has settlements on record.

## 2026-11-08

- **Added `GET /agent/{id}/authority`** — one read-only answer to what an agent may do right now: its effective KYA tier, tier-clamped mandate, the Policy Engine policies held under its `agentId` or registered wallet, and the combined limits (lowest cap wins). It states what is enforced at settlement (the mandate) and what is advisory (policies). Also available as the MCP tool `agent.authority`.
- **Added a per-agent settlement audit export** — `GET https://agent.untitledfinancial.com/audit/agent/{agentId}` returns each settlement decided under that `X-Agent-Id` with the tier, mandate, policy and screening decisions recorded at the time, whether the payer was the agent's registered wallet, and a SHA-256 export digest. JSON or CSV; readable only with a signature from the agent's registered wallet. Also available as `agent.audit_export`. Settlements are now stored with their agent attribution; earlier settlements are not included.
- **Added agent risk signals on `/settle`** — four explainable checks over an agent's own history (payer is not its registered wallet, repeated payments just under its cap, a large payment soon after a new mandate, a first-time recipient with an outlier amount) returned as `riskAssessment.signals` and recorded in the audit export. Reported only by default; none blocks a payment.
- **Added registration-abuse controls** — an overall hourly cap on agent registrations, a 30-day lifetime for anonymous agents with no registered wallet, and a public directory listing now requires a registered wallet. Directory entries carry `identityBasis` (`self_declared` or `issuer_attested`).
- **MCP server now lists 113 tools.**

## 2026-11-07

- **An LEI alone no longer grants VERIFIED.** A LEI is a public identifier, so registering with an active LEI records a claim at REGISTERED tier. VERIFIED requires an attestation from a trusted issuer naming the agent and the LEI, and lapses when that credential expires. Agents recorded as VERIFIED without an attestation are treated as REGISTERED.
- **Changes to an agent now need its wallet's signature** — registering a `walletAddress`, creating a mandate, revoking, and submitting an attestation. Message formats are served at `GET /agent/auth-spec`. The MCP tools `agent.kya_register` and `agent.mandate_create` pass the signature through.
- **Policy Engine writes now need a wallet signature** (or an operator admin key) — creating a policy, delegating, revoking a delegation, and recording a receipt. An agent's id in the engine is its wallet address for these writes. The MCP tools `policy.create`, `policy.delegate` and `receipt.create` pass the signature through.

## 2026-11-06

- **Added four AI-sector risk endpoints to the Intelligence API** — [`vol-positioning`](/api/intelligence-api#get-v1intelligencevol-positioning), [`minsky-regime`](/api/intelligence-api#get-v1intelligenceminsky-regime), [`supplier-exposure`](/api/intelligence-api#get-v1intelligencesupplier-exposure) and [`counterparty-stress`](/api/intelligence-api#get-v1intelligencecounterparty-stress). They measure the concentration of debt-funded AI infrastructure from public data: index volatility and Nasdaq-100 futures positioning (daily, with an `asOf` replay that uses only data published by that date), debt-service class and buildout funding of listed filers computed from SEC XBRL, a citation-backed read of a supplier's customer concentration and commitments, and a caller-assumption what-if on contracted backlog. Every filing-derived value carries its accession number and source sentence. Private companies cannot be observed through these sources, and none of the endpoints forecasts a price or an outcome.
- **Fixed free-tier calls with query parameters returning another request's answer** — the free-tier delay served the previous different response for an endpoint, which is only correct for an endpoint with a single answer. The new endpoints now return live data for any request that carries query parameters.

## 2026-09-16 (later, same day)

- **Added [Get paid via DPX](/guides/get-paid-via-dpx)** — a plain-language page for a vendor, contractor, or counterparty asked to receive a payment via DPX instead of a wire or ACH. No DPX account or MCP knowledge assumed; addresses the practical questions a first-time recipient actually has (wallet setup, converting to cash, verifying the sender independently on Basescan).

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
