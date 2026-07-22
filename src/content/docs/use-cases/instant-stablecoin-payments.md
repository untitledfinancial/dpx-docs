---
title: Instant Stablecoin Payments
description: Cross-border settlement in seconds using USDC or EURC on Base mainnet — how DPX delivers instant stablecoin payments for corporate treasuries and financial institutions.
---

[Stablecoin](https://alternativeassetliteracy.com/glossary.html#stablecoin) payments are becoming standard infrastructure for corporate treasury. Kyriba, the world's leading treasury management platform, has launched a dedicated **Global Payments, FX & Stablecoin** category in its marketplace. DPX is the settlement rail purpose-built for this use case.

---

## What instant stablecoin payments means in practice

A corporate treasury in London needs to pay a supplier in Singapore. Traditionally:

```
Traditional correspondent chain:
London bank → Correspondent A → Correspondent B → Singapore bank
3–5 days · $15,000–$30,000 in fees on a $1M payment · No real-time tracking
```

With DPX:

```
DPX stablecoin settlement:
Kyriba pain.001 → DPX → Base mainnet → Recipient wallet
~30 seconds · ~$20,000 all-in on $1M · On-chain txHash, publicly verifiable
```

Same treasury team. Same Kyriba interface. No crypto knowledge required.

---

## The full stack

DPX combines three things no other stablecoin rail provides together:

**1. Instant settlement**
USDC and EURC settle on Base mainnet in ~30 seconds. There are no correspondent hops. The settlement is final and on-chain from the moment it executes.

**2. Built-in compliance**
Every payment runs Verification of Payee (FATF R16), AML screening against OFAC/EU/UN/UK sanctions lists, and behavioural risk profiling — automatically, before settlement executes. The compliance attestation is baked into the pacs.002 response.

**3. ESG reporting**
Every settlement produces transaction-level ESG data for SFDR and CSRD reporting. European fund managers and corporates under mandatory sustainability disclosure frameworks can use DPX settlement records directly as source data — no separate data pipeline needed.

No other instant stablecoin payment rail provides all three.

---

## Supported assets and corridors

| Asset | Currency | Chain | Regulatory status |
|---|---|---|---|
| USDC | USD | Base mainnet | GENIUS Act (US) |
| EURC | EUR | Base mainnet | MiCA e-money token (EU) |

**Any currency pair** is supported at the fiat edges — your treasury converts to USDC/EURC at the on-ramp, DPX settles on-chain, the recipient redeems at their bank. The on-chain leg is always USDC or EURC.

---

## Fiat on-ramps

Two institutional paths to convert fiat into USDC/EURC for DPX settlement:

| Provider | Currency | Min size | Time to fund |
|---|---|---|---|
| **Circle Mint** | USD → USDC, EUR → EURC | $50K | Same-day (established) |
| **Coinbase Prime** | USD → USDC, EUR → EURC | Institutional | Same-day |

Both provide segregated custody, regulatory compliance, and direct Base mainnet withdrawals. See [Circle Mint](/integrations/circle-mint) and [Coinbase Prime](/integrations/coinbase-prime).

---

## How it integrates into existing workflows

### Kyriba users

DPX implements the **Kyriba Payment Initiation Service SPI** — the certified connector standard from Kyriba Connect Marketplace. Your treasury team initiates payments from Kyriba's existing payment run. DPX appears as a selectable rail alongside SWIFT and ACH.

```
Kyriba payment run
→ Select DPX Settlement Rail
→ pain.001 sent to DPX
→ Compliance + Oracle gate
→ Settled in ~30s
→ pacs.002 returned to Kyriba
```

### SAP TRM users

DPX connects to SAP Treasury & Risk Management via SAP Integration Suite. See [SAP TRM Integration](/integrations/sap-trm).

### Direct API

Any system generating ISO 20022 pain.001 can route directly to the DPX Integration API. No format translation required.

### AI agents

DPX is the only cross-border settlement rail with a native MCP server and x402 agent payment support. AI agents (Claude, GPT, LangChain) can discover, price, and execute settlements autonomously. See [Agent Quick Start](/agent-quickstart).

---

## Pricing

| Fee component | Notes |
|---|---|
| Core settlement | Applied to all settlements |
| FX fee | Cross-currency only; zero for EURC-to-EURC |
| ESG surcharge | Based on counterparty ESG score — 100% redistributed to verified impact |
| License fee | Embedded in token contract |

All rates are published on-chain and quoted before settlement. Volume discounts apply from $100K/month. See [Fee Structure](/fees) or [get a live quote](/demo).

---

## DPX vs. the alternative

| | DPX | Fipto (Kyriba) | SWIFT correspondent | Bank wire |
|---|---|---|---|---|
| Settlement time | ~30 seconds | ~10 minutes | 2–5 days | 1–3 days |
| All-in cost | See live quote | Not disclosed | 2–5% | 2–5% |
| ESG reporting | ✅ SFDR PAI per transaction | ❌ | ❌ | ❌ |
| On-chain audit trail | ✅ txHash, public | ❌ | ❌ | ❌ |
| MiCA-compliant asset | ✅ EURC | Not specified | N/A | N/A |
| ISO 20022 native | ✅ pain.001 / pacs.002 | Via wrapper | ✅ | Bank-dependent |
| Pricing transparency | On-chain, quoted pre-settlement | Opaque | Opaque | Opaque |
| AI / agent native | ✅ MCP + x402 | ❌ | ❌ | ❌ |

---

## Get started

**Kyriba users:** Contact DPX to begin SPI certification — your Kyriba account manager can also initiate the DPX connector onboarding.

**Direct integration:** Apply via the [beta access page](/beta) to receive an institution API key and begin sandbox testing.

**Sandbox:** All endpoints are available in sandbox mode with no USDC required. ESG, oracle, and compliance calls run live against real data.

---

## Further reading

- [European Institution Quickstart](/guides/european-institutions)
- [Kyriba Integration](/integrations/kyriba)
- [Circle Mint — Fiat On-Ramp](/integrations/circle-mint)
- [Coinbase Prime](/integrations/coinbase-prime)
- [SFDR & CSRD Compliance](/protocol/sfdr-csrd)
- [EURC Settlement](/integrations/eurc)
