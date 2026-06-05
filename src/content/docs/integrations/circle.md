---
title: Circle Developer Wallets
description: Use a Circle developer-controlled wallet as the funding source for DPX oracle-gated USDC settlement on Base.
---

Connect a Circle programmable wallet to DPX for compliance-screened USDC settlement. Circle handles the wallet custody layer; DPX handles discovery, pricing, oracle gating, and settlement.

## Installation

```bash
npm install @circle-fin/developer-controlled-wallets x402-fetch dotenv
```

## Quickstart

```bash
git clone https://github.com/untitledfinancial/dpx-agent-public
cd dpx-agent
npm install
cp .env.example .env
# add Circle credentials (see below)
npm run circle
```

## Configuration

```bash
# .env
CIRCLE_API_KEY=...          # app-sandbox.circle.com → Developer → API Keys
CIRCLE_ENTITY_SECRET=...    # generate locally (see below)
CIRCLE_WALLET_SET_ID=...    # optional — saved from first run to reuse wallet set

RECIPIENT_ADDRESS=0x...     # counterparty wallet (optional)
SANDBOX=true                # true = no on-chain tx (default)
PRIVATE_KEY=0x...           # optional — needed for x402 micropayments
```

## Generate an entity secret

The entity secret is a local encryption key for your Circle wallet. Generate it once and store it permanently:

```bash
node -e "
const m = require('@circle-fin/developer-controlled-wallets');
console.log('Entity secret:', m.generateEntitySecret());
"
```

Save the output as `CIRCLE_ENTITY_SECRET` in your `.env`. Then register it in the Circle portal:

1. Go to **app-sandbox.circle.com** → **Entity Secret Ciphertext**
2. Follow the registration flow using your API key and the generated secret

## What runs on every execution

| Step | Call | Notes |
|------|------|-------|
| Initialize | Circle SDK init | Provisions a developer-controlled EVM wallet on Base |
| Discover | `GET /manifest` | Agent finds DPX cold — no config needed |
| Oracle check | `GET /reliability` | Stability conditions across 9 signal layers |
| Quote | `GET /quote?amountUsd=N` | Binding fee breakdown, valid 300s |
| Intelligence | `POST /intelligence/macro-stress` | x402 micropayment — requires `PRIVATE_KEY` |
| Compliance | `POST /vop/verify` | GLEIF registry + FATF R16 screening |
| Settle | `POST /settle` | Oracle-gated, compliance-cleared execution |

## Example output

```
Circle Wallet  0x3a8F9e2D1c5B7f4A0E6d2c9b8a1f3e5d7c2a4b6
Wallet ID    a1b2c3d4-e5f6-7890-abcd-ef1234567890
Circle SDK   initialized ✓

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
Quote ID     dpx-1779983270959-ab12cd  (valid 300s)

  Wallet:      Circle Developer Controlled (0x3a8F9e2D...)
  Circle SDK:  initialized ✓
  Manifest:    discovered cold ✓
  Oracle:      STABLE (88/100) ✓
  x402:        macro-stress paid ✓
  Settlement:  executed ✓
```

## Sandbox vs live

```bash
# Force through oracle check for sandbox testing
FORCE_ORACLE=true npm run circle

# Go live — real USDC settlement on Base
SANDBOX=false RECIPIENT_ADDRESS=0x... npm run circle
```

## Circle sandbox environment

All credentials from **app-sandbox.circle.com** are sandbox credentials. The Circle sandbox runs against testnet infrastructure — no real USDC moves.

To switch to Circle production, replace your API key with one from **app.circle.com** and update the Circle SDK base URL if required.

## Further reading

- [Circle Developer Docs](https://developers.circle.com/w3s/docs)
- [DPX REST API](/integrations/rest-api)
- [Stability Oracle](/api/stability-oracle)
- [Coinbase AgentKit integration](/integrations/coinbase-agentkit)
