---
title: Coinbase Prime — Institutional On-Ramp
description: Use Coinbase Prime for institutional fiat-to-USDC conversion and custody, then route settlements through DPX on Base mainnet.
---

Coinbase Prime is Coinbase's institutional prime brokerage — it handles fiat-to-crypto conversion, custody, and direct Base mainnet access for institutional clients. For corporate treasuries and financial institutions that need a regulated on-ramp to USDC before settling through DPX, Prime is the institutional-grade path.

**Coinbase Prime + DPX:** Prime converts your fiat to USDC, DPX handles the cross-border settlement. Both are compliant, both are Base-native.

---

## Why Coinbase Prime for DPX

| Capability | Relevance to DPX |
|---|---|
| Fiat→USDC conversion | Fund your settlement wallet from USD/EUR bank accounts |
| Direct Base mainnet access | USDC lands directly in your Base wallet, ready for DPX |
| SOC 2 Type II / SOC 1 | Audit-ready custody for regulated institutions |
| Sub-account structure | Separate settlement wallets per entity or corridor |
| Prime API | Automate funding, sweeps, and position management |
| Coinbase Commerce | Accept stablecoin payments from counterparties |

---

## Architecture

```
Corporate bank account (USD / EUR)
    │
    │  Wire / ACH / SEPA
    ▼
Coinbase Prime
    │  Fiat → USDC / EURC conversion
    │  Held in Prime custody
    ▼
Prime API → withdraw to Base wallet
    │
    ▼
Your settlement wallet on Base mainnet
    │
    │  DPX Integration API or MCP
    ▼
DPX Settlement Rail
    │  Compliance → Oracle → On-chain
    ▼
Recipient wallet (~30 seconds)
```

---

## Setting up Coinbase Prime

1. **Apply at** [prime.coinbase.com](https://prime.coinbase.com) — institutional onboarding, KYB required
2. **Fund your Prime account** via wire transfer or ACH (USD) or SEPA (EUR via EURC)
3. **Convert to USDC or EURC** — instant within Prime at market rate
4. **Withdraw to Base** — Prime supports direct Base mainnet withdrawals; specify your DPX settlement wallet address
5. **Execute settlements** via DPX Integration API or MCP

---

## Prime API — automated funding

For high-frequency or automated settlement flows, use the Prime API to fund your settlement wallet programmatically:

```javascript
// Withdraw USDC from Prime to your Base settlement wallet
const response = await fetch('https://api.prime.coinbase.com/v1/portfolios/{portfolio_id}/withdraw', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CB-ACCESS-KEY': process.env.PRIME_API_KEY,
    // + PRIME_API_SECRET, PRIME_API_PASSPHRASE signing
  },
  body: JSON.stringify({
    amount:       '1000000.00',
    currency:     'USDC',
    payment_method: {
      type:    'blockchain',
      address: '0xYOUR_DPX_SETTLEMENT_WALLET',
      network: 'base'
    }
  })
});

// Then immediately initiate DPX settlement
const settlement = await fetch('https://integration.untitledfinancial.com/payments/initiate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.DPX_API_KEY}`,
    'Content-Type':  'application/json'
  },
  body: JSON.stringify({
    amount:          '1000000.00',
    currency:        'USD',
    settlementAsset: 'USDC',
    creditor: {
      lei:           '5493001KJTIIGC8Y1R12',
      walletAddress: '0xRECIPIENT_WALLET'
    }
  })
});
```

---

## EURC via Coinbase

For EUR-denominated flows, Coinbase Prime supports EURC on Base. The workflow is identical but uses EURC, eliminating FX exposure on the DPX settlement leg:

- DPX all-in rate for EURC (EUR-to-EUR): lower, as no FX fee applies
- Versus Fipto / correspondent banking: **2–5%**
- Get a live quote at [/demo](/demo)

---

## Custody and compliance

Coinbase Prime provides:
- **SOC 2 Type II** audited custody
- **FinCEN-registered** Money Services Business
- **NYDFS BitLicense** holder
- **MiFID II** compliant for EU institutional clients
- **Segregated client assets** — your USDC is not commingled with Coinbase's own funds

Combined with DPX's on-chain compliance stack (VoP, AML oracle, FATF R16), the full flow from fiat to settled cross-border payment is audit-ready at every layer.

---

## Auto-sweep: USDC fee collector

DPX collects settlement fees in USDC at the configured fee collector address. If you are running high-volume settlements, configure a Coinbase Prime sweep to automatically repatriate accumulated USDC back to fiat:

```javascript
// Cron: sweep fee collector balance back to Prime daily
// Prime API: deposit from Base wallet
```

---

## Further reading

- [Circle Mint — Fiat On-Ramp](/integrations/circle-mint) — alternative on-ramp via Circle
- [EURC Settlement](/integrations/eurc) — EUR-denominated settlement
- [Coinbase AgentKit](/integrations/coinbase-agentkit) — for AI agent settlement flows
- [REST API](/integrations/rest-api) — direct integration reference
- [Kyriba Integration](/integrations/kyriba) — TMS-native flow
