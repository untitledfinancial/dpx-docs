---
title: How to set up your agent wallet and call /settle
description: Wallet setup, funding, and end-to-end settlement — from oracle check through on-chain execution. No API key required.
---

DPX is sender-funded: when your agent calls `/settle`, DPX returns execution parameters and your agent runs `approve()` + `router.settle()` on-chain from its own wallet. DPX never holds or moves funds on your behalf.

This guide walks through every step from a blank wallet to a confirmed settlement.

---

## What you need

- An EVM wallet on **Base** (chainId 8453) with:
  - **USDC** equal to your settlement amount (goes to the recipient)
  - A small **ETH** buffer for gas (~$0.01 covers 5 settlements at Base rates)
  - A **small USDC buffer** for the x402 intelligence fee (0.5 bps of settlement amount, floor $0.001, cap $5.00)
- Node 18+

```bash
npm install ethers x402-fetch
```

---

## Setting up your wallet

**1. Create a self-custody EVM wallet**

Any wallet that gives you the private key works: Coinbase Wallet, MetaMask, or generate one programmatically:

```typescript
import { ethers } from 'ethers';
const wallet = ethers.Wallet.createRandom();
console.log(wallet.address);    // your wallet address
console.log(wallet.privateKey); // store this securely — never commit it
```

**2. Get USDC on Base**

Buy USDC on an exchange and withdraw to your wallet on the Base network, or bridge from another chain. Your wallet must hold enough USDC to cover the gross settlement amount (after DPX fees).

**3. Get ETH on Base for gas**

Bridge a small amount of ETH to Base. Each settlement is two transactions: `approve()` + `settle()`. Gas on Base is typically under $0.01 total.

**4. Configure your environment**

```bash
export SETTLEMENT_WALLET_PRIVATE_KEY=0x...  # your wallet private key
export RECIPIENT_ADDRESS=0x...              # where settlement net lands
```

---

## The settlement flow

Every settlement runs through five stages:

```
oracle check (free) → fee quote (free) → POST /settle (x402 fee) → approve() → settle()
```

The first two are informational. The x402 fee is paid automatically by `x402-fetch`. The last two are on-chain transactions your wallet signs and broadcasts.

---

## Step 1 — Oracle gate

Check whether global conditions are safe before committing. Free, no auth.

```typescript
const oracle = await fetch('https://stability.untitledfinancial.com/reliability')
  .then(r => r.json());

// { status: "STABLE", score: 91, reasoning: "Yield curve normal, FX stress low." }

if (oracle.status === 'UNSTABLE') {
  throw new Error('Oracle UNSTABLE — hold and retry');
}
```

---

## Step 2 — Get a binding quote

Returns fees, net amount, and a `quoteId` valid for 300 seconds. Pass the `quoteId` to `/settle` to lock in the rate.

```typescript
const { quote } = await fetch(
  'https://agent.untitledfinancial.com/quote?amountUsd=10000&hasFx=false'
).then(r => r.json());

console.log(quote.fees.total.bps);    // 85
console.log(quote.settlement.netUsd); // 9915
console.log(quote.quoteId);           // "dpx_a1b2c3..."
```

---

## Step 3 — POST /settle (x402 intelligence fee)

`/settle` is gated by a small x402 payment that covers oracle signal + AI reasoning. `x402-fetch` handles the 402 → sign → retry cycle automatically — your code just calls fetch.

```typescript
import { createSigner, wrapFetchWithPayment } from 'x402-fetch';

const signer    = await createSigner('base', process.env.SETTLEMENT_WALLET_PRIVATE_KEY);
const fetchX402 = wrapFetchWithPayment(fetch, signer, BigInt(1 * 10 ** 6)); // $1 cap

const result = await fetchX402('https://agent.untitledfinancial.com/settle', {
  method:  'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount:              10000,
    sourceCurrency:      'USD',
    destinationCurrency: 'USD',
    recipientAddress:    process.env.RECIPIENT_ADDRESS,
    purpose:             'agent-payment',
    referenceId:         `ref-${Date.now()}`,
    quoteId:             quote.quoteId,
    sandbox:             false,  // true to test without broadcasting
  }),
}).then(r => r.json());

// result.status === 'authorized'
// result.execution has everything you need for the on-chain calls
```

A `status` of `'authorized'` means DPX has verified the counterparty, checked compliance, and computed the execution params. Other statuses:

| status | meaning |
|---|---|
| `authorized` | Ready to execute on-chain |
| `sandbox` | Dry run — no on-chain calls needed |
| `held` | Oracle flagged the corridor — retry when conditions clear |
| `review` | Compliance escalation — check `complianceScreen` in the response |
| `failed` | Sanctions block or hard validation failure |

---

## Step 4 — approve()

Authorize the DPX router to pull the settlement amount from your wallet. Nothing moves yet — this is a standard ERC-20 approval.

```typescript
import { ethers } from 'ethers';

const { execution } = result;
const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
const wallet   = new ethers.Wallet(process.env.SETTLEMENT_WALLET_PRIVATE_KEY, provider);

const erc20  = new ethers.Interface(['function approve(address,uint256) returns (bool)']);
const approveTx = await wallet.sendTransaction({
  to:   execution.tokenAddress,
  data: erc20.encodeFunctionData('approve', [
    execution.routerAddress,
    execution.grossAmountRaw,  // in USDC token decimals (6)
  ]),
});
await approveTx.wait();
console.log('approved:', approveTx.hash);
```

---

## Step 5 — router.settle()

Pulls funds, runs final oracle checks, and nets the amount to the recipient. The router ABI is returned by `/settle` in `execution.abi` — you don't need to hardcode it.

```typescript
const router = new ethers.Interface(execution.abi);
const settleTx = await wallet.sendTransaction({
  to:   execution.routerAddress,
  data: router.encodeFunctionData('settle', [
    execution.recipient,
    execution.grossAmountRaw,
    execution.isCrossCurrency,
    execution.quoteIdBytes32,
    execution.tokenAddress,
  ]),
});
const receipt = await settleTx.wait();
console.log('settled:', settleTx.hash);
console.log('explorer: https://base.blockscout.com/tx/' + settleTx.hash);
```

---

## Full reference client

A complete, runnable script is in the DPX protocol repo:

```bash
git clone https://github.com/untitledfinancial/dpx-protocol
cd dpx-protocol/examples

SETTLEMENT_WALLET_PRIVATE_KEY=0x... \
RECIPIENT_ADDRESS=0x... \
npx ts-node quickstart-settle.ts
```

To test the full flow without real funds:

```bash
SANDBOX=true \
SETTLEMENT_WALLET_PRIVATE_KEY=0x... \
RECIPIENT_ADDRESS=0x... \
npx ts-node quickstart-settle.ts
```

Oracle checks and compliance screening run live even in sandbox mode — only the on-chain transactions are skipped.

---

## Try the oracle without a wallet

Before setting up a wallet at all, run the live oracle demo — no payment required:

```
GET https://agent.untitledfinancial.com/try?amount=10000&from=USD&to=USD
```

Returns the full oracle response your agent would get on a real `/settle` call.

---

## Using MCP instead of REST

If you're building with Claude Desktop or Cursor, the MCP server wraps the full flow as tool calls:

```json
{
  "mcpServers": {
    "dpx": {
      "command": "npx",
      "args": ["@untitledfinancial/dpx-mcp"]
    }
  }
}
```

Then in your session: `settlement.quote` → `settlement.execute`. The MCP layer handles oracle checks, x402 payment, and returns the execution params — on-chain signing still happens on your side.

---

## Next steps

- [Agent Quick Start](/agent-quickstart) — all parameters documented
- [x402 reference](/integrations/x402) — micropayment mechanics
- [MCP tools reference](/integrations/mcp)
- [Error handling](/guides/error-handling) — held, review, and failed statuses
