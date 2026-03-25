---
title: DPXSettlementRouter
description: DPXSettlementRouter v1.2 — single entry point for all DPX settlement flows on Base mainnet.
---

**Version:** 1.2
**Address:** `0x7d2b0Cea5A2d19369548F59C6B8EEe9Fe3495c97`
**Network:** Base Mainnet (chainId 8453)

---

## Overview

The DPXSettlementRouter is the single entry point for all DPX settlement flows. It enforces the full fee structure before executing token transfers. Agents and TMS integrations call `settle()` — never the token contract directly.

---

## How It Works

1. Sender approves the router: `dpxToken.approve(routerAddress, amount)`
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

| Fee | Basis Points | Rate | Destination |
|---|---|---|---|
| Core | 85 bps | 0.85% | feeCollector (`0x160e920012fb4bae2e465c1ed8815c5fd51b5ce0`) |
| FX | 40 bps | 0.40% | feeCollector (cross-currency only) |
| ESG | 0–50 bps | 0–0.50% | ESGRedistribution (dynamic, oracle-based) |
| License | 1 bp | 0.01% | licensingWallet (`0x0259a1735BAEDeD02e4784A9E28eCCe85c5a99ef`) |

The ESG fee is computed from the company's weighted aggregate score across all active ESGOracle providers. A score of 100 produces a 0 bps ESG fee; a score of 0 produces the maximum 50 bps.

---

## Constructor Parameters

| Parameter | Address |
|---|---|
| `_dpxToken` | `0x7A62dEcF6936675480F0991A2EF4a0d6f1023891` |
| `_esgScoring` | `0x4F3741252847E4F07730c4CEC3018b201Ac6ce87` |
| `_feeCollector` | `0x160e920012fb4bae2e465c1ed8815c5fd51b5ce0` |
| `_esgRedistribution` | `0x4F3741252847E4F07730c4CEC3018b201Ac6ce87` |
| `_licensingWallet` | `0x0259a1735BAEDeD02e4784A9E28eCCe85c5a99ef` |

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
# dpxToken.approve("0x7d2b0Cea5A2d19369548F59C6B8EEe9Fe3495c97", grossAmount)

# 4. Execute settlement (on-chain)
# router.settle(recipient, grossAmount, isCrossCurrency, quoteId)
```

---

## API Endpoints (Stability Oracle)

The DPXSettlementRouter is accessible via REST API at `https://stability.dpx.finance`. No authentication required.

### GET /esg-score
Returns the on-chain ESG score for a company address.

```
GET /esg-score?address=0x1E05306A20A738917EFa010f5BE3fb5EE7290dD8
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
