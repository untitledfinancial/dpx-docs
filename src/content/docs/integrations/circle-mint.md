---
title: Circle Mint — Fiat On-Ramp
description: Convert USD or EUR bank deposits into USDC or EURC at 1:1 via Circle Mint, then settle cross-border in seconds through DPX on Base mainnet.
---

Circle Mint is Circle's institutional issuance service — it converts USD or EUR held in a bank account into USDC or EURC at exactly 1:1. For corporate treasuries that want to settle cross-border payments through DPX but hold fiat today, Circle Mint is the on-ramp.

**Circle Mint + DPX = fiat-in, fiat-out cross-border settlement at ~2% all-in, settling in seconds.**

The receiving counterparty never needs to touch stablecoins. DPX handles the on-chain leg; Circle Mint handles the fiat conversion at both ends if needed.

---

## How it works

```
Your treasury (USD/EUR in bank)
    │
    │  SEPA / ACH / wire
    ▼
Circle Mint
    │  1:1 issuance
    │  USDC (USD) or EURC (EUR)
    ▼
Your wallet on Base mainnet
    │
    │  POST /payments/initiate (DPX Integration API)
    │  or MCP: settle()
    ▼
DPX Settlement Rail
    │  Stability Oracle gate
    │  Compliance / VoP
    │  ~30 second settlement
    ▼
Recipient wallet on Base
    │
    │  (Optional) Circle Mint redemption
    │  USDC/EURC → USD/EUR bank transfer
    ▼
Recipient's bank account
```

The fiat legs (deposit and redemption) are Circle Mint. The on-chain settlement leg is DPX. Both are independent and composable — you can use either without the other.

---

## Circle Mint setup

Circle Mint requires a Circle business account. Apply at [circle.com/en/circle-mint](https://www.circle.com/en/circle-mint).

**What you need:**
- Circle business account (KYB verification)
- Bank account linked to Circle (SEPA for EUR, ACH/wire for USD)
- Wallet address on Base mainnet to receive USDC or EURC

**Minimum issuance:** $50,000 USD equivalent  
**Settlement time (fiat → stablecoin):** 1–2 business days for first issuance; same-day for established accounts  
**Redemption (stablecoin → fiat):** Same-day for USDC; 1–2 business days for EURC via SEPA

---

## EUR flows — EURC

For EUR-denominated settlement, use EURC (Circle's MiCA-compliant Euro stablecoin):

```bash
# Deposit EUR via SEPA to Circle Mint → receive EURC on Base
# Then settle via DPX with settlementAsset: "EURC"

curl -X POST https://integration.untitledfinancial.com/payments/initiate \
  -H "Authorization: Bearer <key>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount":           "500000.00",
    "currency":         "EUR",
    "settlementAsset":  "EURC",
    "creditor": {
      "lei":           "529900ODI3047E2LIV03",
      "walletAddress": "0x..."
    }
  }'
```

EURC settlement avoids FX exposure — the FX fee does not apply to same-currency EUR flows. Get a live quote for the current all-in rate.

---

## USD flows — USDC

For USD-denominated or cross-currency settlement:

```bash
curl -X POST https://integration.untitledfinancial.com/payments/initiate \
  -H "Authorization: Bearer <key>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount":           "1000000.00",
    "currency":         "USD",
    "settlementAsset":  "USDC",
    "creditor": {
      "lei":           "5493001KJTIIGC8Y1R12",
      "walletAddress": "0x..."
    }
  }'
```

---

## Kyriba integration

For Kyriba users, the full stablecoin payment flow works inside your existing TMS:

1. **Fund your wallet** — Circle Mint converts your bank balance to USDC/EURC on Base
2. **Initiate payment in Kyriba** — Kyriba sends an ISO 20022 pain.001 to DPX via the SPI connector
3. **DPX settles** — compliance check, oracle gate, on-chain settlement in ~30 seconds
4. **pacs.002 returned to Kyriba** — settlement confirmation with `txHash` for audit

No new interfaces for your treasury team. The stablecoin conversion and on-chain settlement happen invisibly within the existing Kyriba payment workflow.

---

## Comparison: DPX + Circle Mint vs. Fipto

| | DPX + Circle Mint | Fipto |
|---|---|---|
| Settlement time | ~30 seconds on-chain | ~10 minutes |
| Fiat on-ramp | Circle Mint (institutional) | Proprietary |
| Stablecoins | USDC + EURC (explicit) | "Fully audited" (unnamed) |
| ESG reporting | SFDR PAI per transaction | None |
| Compliance | On-chain VoP, FATF R16, AML6 | Licensed PI (France/Luxembourg) |
| ISO 20022 | Native pain.001/pacs.002 | Via Kyriba wrapper |
| Pricing | Quoted on-chain before settlement | Opaque |
| MiCA (EURC) | ✅ | Not specified |

---

## Further reading

- [EURC Settlement](/integrations/eurc) — MiCA-compliant EUR settlement
- [Kyriba Integration](/integrations/kyriba) — TMS-native payment flow
- [Circle Developer Wallets](/integrations/circle) — for developers building agents
- [SFDR & CSRD Compliance](/protocol/sfdr-csrd) — ESG reporting from settlements
