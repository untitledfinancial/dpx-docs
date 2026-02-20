---
title: Storacha — Verifiable Storage
description: Every DPX oracle run and settlement receipt is saved to IPFS + Filecoin via Storacha. The CID is embedded in on-chain events so any agent or auditor can independently verify a settlement without trusting DPX.
---

DPX uses [Storacha](https://storacha.network) (built on IPFS + Filecoin) to create an immutable, independently verifiable audit trail for every oracle run and settlement. You already have an account — plug in two environment variables and it works automatically.

## Why this matters

Every settlement produces a receipt with a content-addressed CID. That CID is:

- Written into the on-chain `Settlement` event
- Retrievable by anyone at `https://<cid>.ipfs.w3s.link`
- Pinned to Filecoin for long-term persistence

This means a sovereign wealth fund's compliance team — or an autonomous AI auditor — can verify any DPX settlement without relying on DPX's own servers.

## What gets saved

| Event | When saved | Contents |
|---|---|---|
| **Oracle result** | After every Stability Oracle run (hourly) | Full 6-tier output, stability score, peg deviation, confidence |
| **ESG result** | After every ESG Oracle run (hourly) | E, S, G scores, composite average, current fee |
| **Settlement receipt** | After every on-chain settlement | quoteId, txHash, recipient, amounts, fee breakdown |
| **Redistribution proof** | After each ESG impact payment | txHash, per-program amounts, period dates |

## Setup (one time)

### 1. Get your credentials

```bash
# Install the w3 CLI
npm install -g @web3-storage/w3cli

# Log in with your existing Storacha account
npx w3 login your@email.com

# Create a space for DPX data (or use an existing space)
npx w3 space create dpx-oracle-data

# Generate a signing key
npx w3 key create
# → outputs: MgCa...  (copy this)

# Generate a delegation proof
npx w3 delegation create <DID-from-above> --can 'store/add' --can 'upload/add' | base64
# → outputs: base64 string (copy this)
```

### 2. Add to `.env` in both oracle directories

```sh
STORACHA_KEY=MgCa...        # from w3 key create
STORACHA_PROOF=...base64    # from w3 delegation create | base64
```

Both `stability-oracle/.env` and `esg-oracle/.env` need these variables.

### 3. Test the connection

```bash
node storachaClient.js test
# ✓ Success!
#   CID: bafybeig...
#   URL: https://bafybeig....ipfs.w3s.link
```

## Retrieve any record

Every saved record is accessible by CID. No API key required — IPFS is public.

```bash
# Retrieve a settlement receipt
curl https://bafybeig....ipfs.w3s.link | jq .

# Or in a browser — just open the URL
```

The JSON includes `type`, `timestamp`, `chainId`, and the full data payload.

## Response fields

When Storacha is configured, the oracle API includes IPFS fields on every response:

```json
{
  "status": "SUCCESS",
  "stability": { "currentScore": 94 },
  "ipfsCid": "bafybeig...",
  "ipfsUrl": "https://bafybeig....ipfs.w3s.link"
}
```

Agents can cache the `ipfsCid` and hand it to compliance systems for verification.

## Use in settlement events

The settler automatically saves a receipt to Storacha after every `router.settle()` call. The returned object includes `receiptCid` and `receiptUrl`:

```js
const result = await settle(recipient, amountDPX, true, quoteId);
// result.receiptCid → "bafybeig..."
// result.receiptUrl → "https://bafybeig....ipfs.w3s.link"
// result.txHash     → "0x..."
// result.explorerUrl → "https://basescan.org/tx/0x..."
```

## Graceful degradation

Storacha is **optional**. If `STORACHA_KEY` and `STORACHA_PROOF` are not set:

- Both oracles start and run normally
- Settlement execution works normally
- IPFS saving is silently skipped
- No errors are thrown

You can add Storacha credentials at any time without restarting.

## Source

```
Stability-Oracle/stability-oracle/storachaClient.js
ESG-Oracle/esg-oracle/storachaClient.js  (copy)
```
