---
title: EURC Settlement
description: EUR-denominated stablecoin settlement on Base mainnet using EURC — Circle's MiCA-compliant Euro stablecoin. The European settlement path for DPX.
---

EURC is Circle's Euro-pegged stablecoin on Base mainnet — a MiCA-compliant e-money token issued by Circle Internet Financial Europe SAS under French EMI licensing. For European institutions settling in EUR, EURC is the native settlement asset on DPX.

---

## Why EURC matters for European settlement

USDC is USD-denominated. For European institutions, cross-border settlement in USD introduces FX exposure on every transaction. EURC eliminates that exposure for EUR-denominated flows:

| | USDC settlement | EURC settlement |
|---|---|---|
| Denomination | USD | EUR |
| FX exposure | USD/EUR rate risk | None for EUR-native flows |
| MiCA status | Non-EU issuer (US) | MiCA-compliant (Circle EU, French EMI) |
| SEPA alignment | Indirect (USD → EUR conversion) | Direct EUR denomination |
| Regulatory recognition | GENIUS Act (US) | MiCA Article 48 e-money token |

---

## EURC on Base mainnet

| Property | Value |
|---|---|
| Contract | `0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42` |
| Network | Base mainnet (chainId 8453) |
| Issuer | Circle Internet Financial Europe SAS |
| Regulatory status | MiCA e-money token |
| Decimals | 6 |
| Peg | 1 EURC = 1 EUR |

---

## Settlement flow

EURC settlement follows the same flow as USDC — the settlement asset is specified in the request:

```bash
curl -X POST https://integration.untitledfinancial.com/payments/initiate \
  -H "Authorization: Bearer <key>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount":           "100000.00",
    "currency":         "EUR",
    "settlementAsset":  "EURC",
    "creditor": {
      "name":          "European Counterparty GmbH",
      "lei":           "529900ODI3047E2LIV03",
      "walletAddress": "0x..."
    },
    "debtor": {
      "name": "Ordering Corp BV",
      "lei":  "724500VKKSH9QOLTFR81"
    }
  }'
```

The settlement response includes the EURC contract address and the Base mainnet transaction hash:

```json
{
  "id": "dpx-e2a8f1...",
  "status": "SETTLED",
  "settlementAsset": "EURC",
  "settlementContract": "0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42",
  "network": "base-mainnet",
  "txHash": "0x...",
  "amount": "100000.00",
  "currency": "EUR",
  "compliance": {
    "fatfR16Compliant": true,
    "micaCompliant": true
  }
}
```

---

## Fee structure for EUR flows

The DPX fee structure applies identically to EURC settlements. Since EURC is a same-currency EUR flow (no FX conversion required for EUR-to-EUR), the FX fee component is zero:

| Fee component | EUR-to-EUR (EURC) | EUR-to-USD (USDC) |
|---|---|---|
| Core settlement | Applies | Applies |
| FX fee | Not applicable | Applies |
| ESG surcharge | Dynamic, oracle-based | Dynamic, oracle-based |
| License fee | Applies | Applies |
| **Typical all-in** | Lower (no FX component) | Standard cross-currency |

---

## MiCA compliance

EURC is issued under MiCA Title III (e-money tokens). For European institutions required to use MiCA-compliant settlement assets under Articles 48–58, EURC on Base satisfies:

- **Authorisation**: Circle EU holds French EMI authorisation
- **Reserve backing**: 1:1 EUR reserves in segregated accounts
- **Redemption**: Mandatory at par on demand
- **Transparency**: Regular reserve attestations published
- **Prudential requirements**: Own funds requirements met by issuer

DPX settlement using EURC includes `"micaCompliant": true` in the compliance attestation block, referencing both the settlement rail's MiCA compliance and the asset's issuer authorisation.

---

## Acquiring EURC

EURC is available on Base mainnet via:

- **Circle Mint** — institutional issuance directly from Circle (requires Circle business account)
- **Coinbase Exchange** — EURC/USD and EURC/EUR pairs
- **Uniswap on Base** — EURC/USDC pool on Base mainnet
- **Bridge.xyz** — institutional cross-chain liquidity

For institutions holding EUR in a European bank account, Circle Mint is the primary issuance path: deposit EUR via SEPA transfer, receive EURC on Base at 1:1.

---

## EURC in the MCP server

When using DPX via the MCP server (Claude Desktop, Cursor), specify EURC in the settlement tool:

```
settle(
  amount: 100000,
  currency: "EUR",
  settlementAsset: "EURC",
  creditorWallet: "0x...",
  creditorLei: "529900ODI3047E2LIV03"
)
```

The MCP server passes `settlementAsset: "EURC"` to the Settlement Agent, which routes to the EURC contract on Base mainnet.

---

## Further reading

- [Regulatory Positioning](/protocol/regulatory) — MiCA, SFDR, FCA coverage
- [SFDR & CSRD Compliance](/protocol/sfdr-csrd) — ESG reporting for European institutions
- [Fee Structure](/fees) — Full fee table with volume tiers
- [REST API](/integrations/rest-api) — Direct integration
