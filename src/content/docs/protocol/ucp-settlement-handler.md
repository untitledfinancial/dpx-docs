---
title: UCP Settlement Handler
description: DPX's payment handler for Google's Universal Commerce Protocol (UCP) — how a business accepts DPX stablecoin settlement inside a UCP checkout, and how a platform pays with it.
---

* **Handler name:** `com.untitledfinancial.agent`
* **Handler ID:** `dpx_settlement`
* **Version:** `2026-09-16`
* **Schema:** [`.well-known/ucp/dpx_settlement_handler.schema.json`](https://agent.untitledfinancial.com/.well-known/ucp/dpx_settlement_handler.schema.json)
* **DPX's own profile:** [`.well-known/ucp`](https://agent.untitledfinancial.com/.well-known/ucp)

[UCP](https://ucp.dev/) is Google's open-source (Apache 2.0) standard for agent-to-agent commerce — product discovery, checkout, and post-purchase tracking, built to interoperate with A2A, MCP, and AP2. It's also one of the four protocols Visa's Intelligent Commerce Connect routes, alongside TAP, MPP, and ACP.

This page documents how DPX participates: as a **payment handler**, not as a Business (merchant/catalog) or a Platform (checkout-orchestrating agent). A Business — a supplier, vendor, or counterparty being paid — declares this handler in its own `/.well-known/ucp` profile to accept DPX settlement; a Platform — most often a buyer's own procurement or purchasing agent — discovers it and pays with it. Nothing here requires DPX's involvement in the actual product/checkout flow beyond the payment leg.

**A note on scope:** this is a first, self-declared implementation. It hasn't yet been referenced by a live Business profile, and it hasn't been run against UCP's own conformance/example validator. Everything below is real and load-bearing — the schema is genuinely spec-shaped and the endpoints genuinely work — but "spec-shaped" isn't the same claim as "certified."

---

## Why B2B, not consumer checkout

DPX's primary use case is agent-to-agent and cross-border B2B settlement, not consumer retail. UCP itself isn't consumer-specific — Visa's own framing of Intelligent Commerce Connect explicitly extends to "B2B AI buying — procurement and bill pay," and UCP's checkout primitive doesn't care whether the buyer is a person or a company. In this handler's terms:

* **Business** = the supplier, vendor, or counterparty being paid — the party that already appears in a DPX invoice or settlement today.
* **Platform** = the buyer's own procurement/purchasing agent, orchestrating the checkout on the buyer's behalf.
* **DPX** = the Processor — the same role a card tokenizer or PSP plays in other UCP payment handlers, except non-custodial and stablecoin-settled.

This is deliberately the same shape as DPX's existing agent-to-agent invoice flow ([Agent-to-agent payments](/guides/agent-to-agent-payments)) — UCP is a second, standards-based way to reach the same settlement rail, not a new product.

---

## Participants

| Participant | Role | Prerequisites |
|---|---|---|
| **Business** | Advertises this handler in its own `/.well-known/ucp` profile, with its own settlement wallet address in `config.recipientAddress`. Learns a payment completed via DPX's existing webhook/reconciliation mechanisms — no new integration needed. | A Base-mainnet wallet address to receive settlement. |
| **Platform** | Discovers the handler, fetches a binding quote from DPX, submits it as the checkout instrument. | None — `GET /quote` requires no auth or registration. |
| **DPX (Processor)** | Issues the quote, and — if AP2 is also negotiated — verifies the payment mandate. Never holds funds. | N/A |

```text
+----------+                    +---------------------+                +------------+
| Platform |                    |         DPX          |                | Business   |
|(Procure- |                    |      (Processor)      |                |(Supplier)  |
| ment agt)|                    +----------+-----------+                +-----+------+
     |                                      |                                  |
     |  1. GET .well-known/ucp (Business)   |                                  |
     |-------------------------------------------------------------------------->
     |  2. dpx_settlement handler found, config.recipientAddress read           |
     |<--------------------------------------------------------------------------
     |  3. GET /quote?recipient=...&amount=...&token=USDC                       |
     |------------------------------------->|                                  |
     |  4. Binding quote (300s TTL)          |                                  |
     |<-------------------------------------|                                  |
     |  5. POST checkout complete, instrument = quote as credential             |
     |-------------------------------------------------------------------------->
     |                                       |  6. Platform's own wallet signs  |
     |                                       |     approve() + router.settle()  |
     |                                       |     on-chain — DPX/Business never|
     |                                       |     hold funds                   |
     |  7. Business observes payment via existing webhook / reconciliation      |
     |<--------------------------------------------------------------------------
```

---

## Business Integration

### Prerequisites

None beyond having a Base-mainnet wallet address to receive settlement. There is no DPX account to create, no API key, and no approval step — this is the same "no vendor onboarding" posture as the rest of DPX's discoverability surface.

### Handler declaration

Add the handler to your own `/.well-known/ucp` profile's `payment_handlers`:

```json
{
  "ucp": {
    "version": "2026-09-16",
    "payment_handlers": {
      "com.untitledfinancial.agent": [
        {
          "id": "dpx_settlement",
          "version": "2026-09-16",
          "spec": "https://docs.untitledfinancial.com/protocol/ucp-settlement-handler",
          "schema": "https://agent.untitledfinancial.com/.well-known/ucp/dpx_settlement_handler.schema.json",
          "available_instruments": [
            { "type": "dpx_stablecoin_settlement", "constraints": { "properties": { "token": { "enum": ["USDC", "EURC"] } } } }
          ],
          "config": {
            "network": "base-mainnet",
            "chainId": 8453,
            "acceptedTokens": ["USDC", "EURC"],
            "recipientAddress": "0xYourSettlementWalletAddress"
          }
        }
      ]
    }
  }
}
```

### Processing payments

There is nothing to process. Once `router.settle()` confirms on-chain, the Business's `recipientAddress` balance increases directly — same as any other DPX settlement. Use the existing [webhook subscription](/integrations/webhooks) or [invoice reconciliation](/guides/agent-to-agent-payments#reconciling-a-paid-invoice-against-your-own-records) endpoint to observe it programmatically; neither is UCP-specific, both already exist.

---

## Platform Integration

### Prerequisites

None. `GET /quote` is unauthenticated.

### Payment protocol

**Step 1 — Discover the handler.** Fetch the Business's `/.well-known/ucp` and find `com.untitledfinancial.agent` under `payment_handlers`. Read `config.recipientAddress` and `config.acceptedTokens`.

**Step 2 — Get a binding quote.**

```bash
curl "https://agent.untitledfinancial.com/quote?recipient=0xBusinessRecipientAddress&amount=5000&token=USDC"
```

Returns a quote valid for 300 seconds, including `quoteId`, `quoteIdBytes32`, `routerAddress`, `tokenAddress`, and `grossAmountRaw` — this is DPX's existing, unmodified quote response.

**Step 3 — Submit the checkout instrument.**

```json
POST /checkout-sessions/{checkout_id}/complete
Content-Type: application/json

{
  "payment": {
    "instruments": [
      {
        "id": "instr_1",
        "handler_id": "dpx_settlement",
        "type": "dpx_stablecoin_settlement",
        "credential": {
          "type": "dpx_settlement_quote",
          "quoteId": "...",
          "quoteIdBytes32": "0x...",
          "routerAddress": "0xe333551E18ef0471A71d7e8e761212766aa5AD4f",
          "tokenAddress": "0x...",
          "grossAmountRaw": "5000000000",
          "expiresAt": "2026-09-16T18:51:00.000Z"
        }
      }
    ]
  }
}
```

**Step 4 — Execute on-chain.** The Platform's own wallet (whoever is actually paying — the buyer's procurement agent's wallet, not DPX's and not the Business's) calls `USDC.approve(routerAddress, grossAmountRaw)` then `router.settle(...)`, exactly as in the standard [sender-funded settlement flow](/guides/trust-and-verification). A quote submitted after `expiresAt` **MUST** be treated as expired and re-fetched — DPX will not silently re-quote a stale instrument.

### With AP2 also negotiated

If the Business and Platform also negotiate UCP's [AP2 mandate extension](https://ucp.dev/latest/specification/payment/extensions/ap2-mandates), the resulting `ap2.checkout_mandate` can be submitted alongside this instrument, or directly to `POST /settle` as `body.mandate` — DPX's existing AP2 mandate verifier (`ap2-mandate.ts`) checks the SD-JWT signature and cross-checks the payee and amount against the live quote before treating it as authorization. See [AP2 capability document](https://agent.untitledfinancial.com/.well-known/ap2.json) for the full mandate format.

---

## Trust & identity

UCP payment handlers generally assume some form of verifiable agent identity — the same underlying concern Visa's Trusted Agent Protocol (signed-header identity, RFC 9421) and Microsoft's Entra Agent ID (a dedicated identity object per deployed agent) both address, in their respective ecosystems. DPX doesn't implement either of those directly today, but addresses the same concern through infrastructure it already has:

* **KYA (Know Your Agent)** — a three-tier agent identity system (`ANONYMOUS` / `REGISTERED` / `VERIFIED`) with owner-LEI-backed verification. See [Compliance for Autonomous Agent Transactions](/protocol/agent-transaction-compliance).
* **W3C DID + Verifiable Credentials** — a `VERIFIED`-tier agent's identity resolves independently at [`compliance.untitledfinancial.com/.well-known/did.json`](https://compliance.untitledfinancial.com/.well-known/did.json), and `POST /agent/:id/verify` returns a VC-JWT any third party can check without calling DPX back. See [Compliance Oracle API](/api/compliance-oracle).

The practical difference from TAP/Entra Agent ID: those are directory- or header-based (a merchant or platform checks a request against a network-operated registry); DPX's approach is independently, cryptographically verifiable by any party holding the DID document — no callback, no registry lookup required. Functionally comparable trust, different mechanism.

---

## Security considerations

| Requirement | Description |
|---|---|
| **Non-custodial, always** | DPX and the Business never hold or move funds at any point in this flow. The Platform's own wallet signs and broadcasts every on-chain transaction. This is not specific to UCP — it's DPX's architecture everywhere. |
| **Quote expiry is enforced** | `expiresAt` is 300 seconds from issuance. An expired credential must be rejected, not re-priced silently. |
| **`recipientAddress` is the Business's own** | DPX never assigns or holds a settlement address on a Business's behalf — it's supplied by the Business itself when declaring the handler. |
| **No new trust surface** | This handler doesn't introduce a new signing key, custody model, or authorization path beyond what `/quote`, `/settle`, and (optionally) AP2 mandate verification already provide. |

---

## References

* Handler schema: [`.well-known/ucp/dpx_settlement_handler.schema.json`](https://agent.untitledfinancial.com/.well-known/ucp/dpx_settlement_handler.schema.json)
* DPX's UCP profile: [`.well-known/ucp`](https://agent.untitledfinancial.com/.well-known/ucp)
* UCP specification: [ucp.dev](https://ucp.dev/)
* Related: [Agent-to-agent payments](/guides/agent-to-agent-payments), [Compliance for Autonomous Agent Transactions](/protocol/agent-transaction-compliance), [Trust and verification](/guides/trust-and-verification)
