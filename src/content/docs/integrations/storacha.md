---
title: Verifiable Storage — Settlement Receipts
description: DPX settlement receipts are verified via on-chain transaction hash (Basescan) and a Cloudflare D1 audit log. No external storage provider required.
---

:::note[IPFS layer removed]
The IPFS/Storacha storage layer has been removed. It is not needed. Every settlement is verifiable via its on-chain transaction hash — independently auditable on Basescan without relying on DPX infrastructure.
:::

## How settlement receipts work

Every DPX settlement produces two independent audit artifacts:

| Artifact | Where | Who can verify |
|---|---|---|
| **On-chain tx hash** | Base mainnet (Basescan) | Anyone — no API key, no trust required |
| **D1 audit log entry** | Cloudflare D1 (`dpx-settlements`) | DPX operators + institutional partners |

The tx hash is embedded in the settlement response and emitted in the `Settlement` event on-chain. Any agent, compliance team, or auditor can verify a settlement at `https://basescan.org/tx/<txHash>` without relying on DPX's servers.

## Settlement response

```json
{
  "status": "SUCCESS",
  "txHash": "0xabc123...",
  "explorerUrl": "https://basescan.org/tx/0xabc123...",
  "quoteId": "quote_...",
  "recipient": "0x...",
  "amountDPX": "1000000000000000000",
  "fees": { "total": { "pct": 1.385, "bps": 138.5 } }
}
```

## D1 audit log

The Settlement Agent writes a record to Cloudflare D1 after every successful settlement. Fields logged:

- `quote_id`, `tx_hash`, `recipient`, `amount_dpx`
- `fee_total_pct`, `stability_score`, `esg_score`
- `claude_decision` (EXECUTE / HOLD / REJECT), `claude_reasoning`
- `created_at` (ISO timestamp)

## ESG redistribution verification

ESG fee redistribution flows through a Safe Wallet multi-sig (`0x4F3741252847E4F07730c4CEC3018b201Ac6ce87`). Every redistribution transaction is on-chain and independently verifiable — no external storage required.
