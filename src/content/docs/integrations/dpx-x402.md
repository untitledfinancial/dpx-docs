---
title: dpx-x402 — x402 Payment Middleware
description: Gate any API endpoint behind USDC micropayments on Base mainnet. Drop-in middleware for Cloudflare Workers, Hono, Next.js, and Express. Agents pay automatically — no account, no API key, no subscription.
---

`@untitledfinancial/dpx-x402` is a server middleware package that gates any API endpoint behind x402 USDC micropayments on Base mainnet. The caller is always an autonomous agent — no human approves the payment, no human is in the loop.

```bash
npm install @untitledfinancial/dpx-x402
```

## How it works

An agent calls your endpoint. If no payment is attached, your server returns a `402 Payment Required` with USDC payment details. The agent signs an EIP-3009 transfer from its funded wallet and retries. Your server verifies the signature on-chain and responds. The entire loop is machine-to-machine.

```
Agent → GET /your-endpoint
Server → 402: { amount: "150000", asset: USDC, payTo: "0x..." }

Agent signs EIP-3009 TransferWithAuthorization
Agent → GET /your-endpoint  (X-Payment: <signed token>)
Server verifies → 200: { your data }  (X-Payment-Response: receipt)
```

## Cloudflare Workers / Hono

```typescript
import { Hono } from 'hono'
import { DPX } from '@untitledfinancial/dpx-x402/hono'

const app = new Hono()
const dpx = DPX.create({
  recipient: '0xYourWalletAddress',
  secretKey: process.env.DPX_SECRET_KEY!,
})

// Gate a route — $0.15 USDC per call
app.get('/signal', dpx.hono.charge({ amount: '0.15' }), (c) =>
  c.json({ regime: 'STABLE', score: 42 })
)

export default app
```

## Next.js App Router

```typescript
// app/api/signal/route.ts
import { DPX } from '@untitledfinancial/dpx-x402/nextjs'

const dpx = DPX.create({
  recipient: '0xYourWalletAddress',
  secretKey: process.env.DPX_SECRET_KEY!,
})

export const GET = dpx.charge({ amount: '0.15' })(() =>
  Response.json({ regime: 'STABLE', score: 42 })
)
```

## Express / Node.js

```typescript
import express from 'express'
import { DPX } from '@untitledfinancial/dpx-x402/express'

const app = express()
const dpx = DPX.create({
  recipient: '0xYourWalletAddress',
  secretKey: process.env.DPX_SECRET_KEY!,
})

app.get('/signal', dpx.node.charge({ amount: '0.15' }), (req, res) => {
  res.json({ regime: 'STABLE', score: 42 })
})
```

## Manual mode (raw Fetch API)

Compatible with any Fetch API-based framework — Deno, Bun, or any custom handler.

```typescript
import { DPX } from '@untitledfinancial/dpx-x402'

const dpx = DPX.create({
  recipient: '0xYourWalletAddress',
  secretKey: process.env.DPX_SECRET_KEY!,
})

export async function handler(request: Request): Promise<Response> {
  return dpx.charge({ amount: '0.15' })(
    () => Response.json({ regime: 'STABLE', score: 42 })
  )(request)
}
```

## Configuration

```typescript
DPX.create({
  // Required
  recipient: '0x...',             // Address that receives USDC payments
  secretKey: process.env.SECRET!, // For signing receipts — keep server-side, never log

  // Optional
  currency:             '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base (default)
  network:              'base',   // 'base' (default) or 'base-sepolia' for testnet
  waitForConfirmation:  true,     // Wait for on-chain confirmation (default: true)
                                  // Set false for optimistic low-latency responses
})
```

### Per-route overrides

Amount, currency, and recipient can be overridden per route — useful for tiered pricing or per-product wallets:

```typescript
dpx.charge({
  amount:    '0.75',          // Different price for a more expensive signal
  currency:  '0x...',         // EURC for EUR-denominated routes
  recipient: '0x...',         // Per-product wallet
})
```

## What agents receive

Every verified response includes an `X-Payment-Response` header with a receipt:

```json
{
  "paid": true,
  "from": "0x<agent-wallet>",
  "to": "0x<your-wallet>",
  "amount": "0.15",
  "currency": "0x833589...",
  "network": "eip155:8453",
  "verifiedAt": "2026-07-25T14:00:00Z"
}
```

## Testnet

Set `network: 'base-sepolia'` and fund your agent wallet with testnet USDC from the [Circle faucet](https://faucet.circle.com/).

## How verification works

`dpx-x402` verifies payments without a mandatory RPC call:

1. Parses the `X-Payment` header (JSON)
2. Recovers the signer from the EIP-712 signature using viem
3. Confirms signer matches `from`, `to` matches `recipient`, `value` ≥ required amount, and timing is valid
4. Optionally checks USDC balance on-chain (configurable)

Signature verification is cryptographic and requires no network call — suitable for Cloudflare Workers edge deployments.

## Payment methods

`dpx-x402` accepts USDC on Base mainnet via EIP-3009 `TransferWithAuthorization` by default. Any agent with a funded Base wallet can pay — no new token, no onboarding required.

For EUR-denominated routes, override `currency` with the EURC contract address on Base.

## Agent-side implementation

If you are building the agent that calls an `dpx-x402`-gated endpoint, see:

- [DPX Intelligence guide](/guides/x402-intelligence) — complete Python signing example and x402 client code
- [x402 protocol reference](/integrations/x402) — full EIP-3009 flow and signing spec

## npm

```bash
npm install @untitledfinancial/dpx-x402
```

[View on npm →](https://www.npmjs.com/package/@untitledfinancial/dpx-x402)
