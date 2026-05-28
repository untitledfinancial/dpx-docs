---
title: Coinbase AgentKit
description: Run the full DPX settlement loop inside a Coinbase AgentKit agent using a CDP-managed MPC wallet or a Viem private key.
---

Connect a Coinbase AgentKit agent to DPX for oracle-gated, compliance-screened settlement on Base. AgentKit handles the wallet layer; DPX handles discovery, pricing, compliance, and settlement.

AgentKit has native x402 support — the DPX Intelligence API is plug-and-play with no custom middleware.

## Installation

```bash
npm install @coinbase/agentkit viem x402-fetch dotenv
```

Node v22+ required (`nvm use 22`).

## Quickstart

Clone the reference integration and run it:

```bash
git clone https://github.com/untitledfinancial/dpx-agent-public
cd dpx-agent
npm install
cp .env.example .env
# add credentials (see below)
npm run agentkit
```

## Configuration

Two wallet modes — pick one:

### Viem mode (private key)

```bash
# .env
PRIVATE_KEY=0x...          # your Base wallet private key
RECIPIENT_ADDRESS=0x...    # counterparty wallet (optional — runs discovery only if omitted)
SANDBOX=true               # true = no on-chain tx (default)
```

### Coinbase CDP managed wallet

```bash
# .env
CDP_API_KEY_ID=...         # portal.cdp.coinbase.com → API Keys
CDP_API_KEY_SECRET=...
CDP_WALLET_SECRET=...      # portal.cdp.coinbase.com/products/server-wallet/accounts
SANDBOX=true
```

## What runs on every execution

| Step | Call | Notes |
|------|------|-------|
| Discover | `GET /manifest` | Agent finds DPX cold — no config needed |
| Oracle check | `GET /reliability` | Stability conditions across 10 signal layers |
| Quote | `GET /quote?amountUsd=N` | Binding fee breakdown, valid 300s |
| Intelligence | `POST /intelligence/macro-stress` | x402 micropayment — USDC on Base |
| Compliance | `POST /vop/verify` | x402 micropayment — GLEIF + FATF R16 |
| Settle | `POST /settle` | Oracle-gated, compliance-cleared execution |

## Example output

```
CDP Wallet   0x96ea0d8bcF5bc4007D5919EA2a134c3a347dE8eb
AgentKit     initialized ✓

── Discovery ─────────────────────────────────
Name         DPX Settlement Agent
Version      2.0.0
Network      Base (chainId 8453)
Assets       USDC, EURC, USDT
Capabilities quote, settle, webhook, status

── Stability Oracle ──────────────────────────
Status       STABLE  (score: 88/100)

── Quote ─────────────────────────────────────
Amount       $50,000 gross
Fees         98.5 bps
Net          $49,507.5
Quote ID     dpx-1779983270959-pc87sl  (valid 300s)

── Intelligence (x402 micropayment) ──────────
Macro stress 14/100
Summary      Low systemic stress. Credit spreads tight, liquidity normal.

  Wallet:      Coinbase CDP (managed)
  AgentKit:    initialized ✓
  Manifest:    discovered cold ✓
  Oracle:      STABLE (88/100) ✓
  x402:        macro-stress paid ✓
  Settlement:  executed ✓
```

## Sandbox vs live

```bash
# Force through oracle check for sandbox testing
FORCE_ORACLE=true npm run agentkit

# Go live — real USDC settlement on Base
SANDBOX=false RECIPIENT_ADDRESS=0x... npm run agentkit
```

Sandbox mode runs all oracle and compliance checks live — only the on-chain transaction is skipped. One env var change to go live.

## x402 micropayments

Steps 4 and 5 (Intelligence and VoP) are live x402 payments on Base mainnet. Your wallet signs automatically on 402 response. Requires a small USDC balance on Base.

AgentKit's native x402 action provider means DPX plugs in without any custom payment logic.

## Further reading

- [AgentKit docs](https://docs.cdp.coinbase.com/agentkit/docs/welcome)
- [DPX REST API](/integrations/rest-api)
- [Stability Oracle](/api/stability-oracle)
- [Intelligence API](/api/intelligence-api)
