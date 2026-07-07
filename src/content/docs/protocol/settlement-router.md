---
title: DPXSettlementRouter
description: DPXSettlementRouter v2.0 — single entry point for all DPX settlement flows on Base mainnet.
---

**Version:** 2.0
**Address:** `0xe333551E18ef0471A71d7e8e761212766aa5AD4f`
**Network:** Base Mainnet (chainId 8453)

---

## Overview

The DPXSettlementRouter is the single entry point for all DPX settlement flows. It enforces the full fee structure before executing token transfers. Agents and TMS integrations call `settle()` — never the token contract directly.

---

## How It Works

1. Sender approves the router: `usdc.approve(routerAddress, amount)` (or EURC/USDT)
2. Sender calls `settle(recipient, grossAmount, isCrossCurrency, quoteId)`
3. Router pulls `grossAmount` from sender
4. Router computes fees (core + FX + ESG + license)
5. Router distributes fees to respective wallets
6. Router sends net amount to recipient

---

## Functions

### settle()

```solidity
function settle(
    address recipient,
    uint256 grossAmount,
    bool isCrossCurrency,
    bytes32 quoteId
) external returns (uint256 netAmount)
```

Executes a settlement. Pulls `grossAmount` from the caller, deducts all fees, and sends `netAmount` to `recipient`. The `quoteId` is the identifier returned by the Stability Oracle `/quote` endpoint — used for on-chain/off-chain fee reconciliation.

### previewFees()

```solidity
function previewFees(
    uint256 grossAmount,
    bool isCrossCurrency,
    address company
) external view returns (
    uint256 coreFee,
    uint256 fxFee,
    uint256 esgFee,
    uint256 licenseFee,
    uint256 totalFees,
    uint256 netAmount,
    uint256 esgScore,
    uint256 esgFeeBps
)
```

Read-only fee preview. Returns the full fee breakdown for a prospective settlement. The Stability Oracle `/verify-fees` endpoint calls this function to confirm on-chain fees match the oracle quote before settlement execution.

---

## Fee Structure

| Fee | Applies to | Destination |
|---|---|---|
| Core | Every settlement | feeCollector |
| FX | Cross-currency only | feeCollector |
| ESG | Every settlement — dynamic, oracle-based | ESGRedistribution |
| License | Every settlement — fixed, in token contract | licensingWallet |

The ESG fee is computed from the company's weighted aggregate score across all active ESGOracle providers. A score of 100 produces a zero ESG fee; a score of 0 produces the maximum ESG fee.

---

## Constructor Parameters

| Parameter | Address |
|---|---|
| `_dpxToken` | `0x7A62dEcF6936675480F0991A2EF4a0d6f1023891` |
| `_esgScoring` | `0x4F3741252847E4F07730c4CEC3018b201Ac6ce87` |
| `_feeCollector` | configured via env |
| `_esgRedistribution` | `0x4F3741252847E4F07730c4CEC3018b201Ac6ce87` |
| `_licensingWallet` | configured via env |

---

## Contract Connections

- DPXSettlementRouter pulls tokens from sender via `DPX Token.transferFrom`
- DPXSettlementRouter calls `ESGRedistribution.aggregatedScore` to determine the ESG fee
- ESGRedistribution calls `ESGOracle.getESGScore` per provider to compute the weighted average
- DPX Token calls `StabilityFeeController.computeFee` on each transfer
- PolicyManager governs StabilityFeeController parameters
- BasketPegManager feeds into PolicyManager for basket-driven fee policy

---

## Integration Pattern

```bash
# 1. Get a quote
curl "https://stability.untitledfinancial.com/quote?amountUsd=1000000&hasFx=true&esgScore=75"

# 2. Verify on-chain fees match
curl "https://stability.untitledfinancial.com/verify-fees?amountUsd=1000000&hasFx=true&esgScore=75"
# Confirm feesMatch: true before proceeding

# 3. Approve the router (on-chain)
# dpxToken.approve("0xe333551E18ef0471A71d7e8e761212766aa5AD4f", grossAmount)

# 4. Execute settlement (on-chain)
# router.settle(recipient, grossAmount, isCrossCurrency, quoteId)
```

---

## API Endpoints (Stability Oracle)

The DPXSettlementRouter is accessible via REST API at `https://stability.untitledfinancial.com`. No authentication required.

### GET /esg-score
Returns the on-chain ESG score for a company address.

```
GET /esg-score?address=0x<recipient-address>
```

Returns: weighted aggregate score (0–100), ESG fee in bps, fee impact.

### POST /prepare-settle
Returns unsigned transaction data for the TMS to sign and broadcast.

```json
{
  "recipient": "0xRecipientAddress",
  "amount": "1000000000000000000000",
  "isCrossCurrency": true,
  "quoteId": "0xabc123..."
}
```

Returns: `step1_approve` and `step2_settle` transaction objects with `to` and `data` fields ready to sign.

### GET /api/settle-status
Check status of a submitted settlement.

```
GET /api/settle-status?txHash=0xabc123...
```

Returns: `PENDING`, `SUCCESS`, or `FAILED` with block number and Blockscout explorer link.

### Full TMS Integration Flow

1. `GET /quote?amountUsd=1000000&hasFx=true` — preview fees
2. `POST /prepare-settle` — get unsigned tx data
3. TMS signs and broadcasts `step1_approve`, waits for confirmation
4. TMS signs and broadcasts `step2_settle`
5. `GET /api/settle-status?txHash=...` — confirm settlement
