---
title: Smart Contracts
description: DPX on-chain contracts on Base mainnet — token, settlement router, and fee enforcement.
---

DPX is deployed on **Base mainnet** (chainId 8453). The settlement router enforces all fees on-chain, ensuring agents cannot submit settlements at rates different from what the oracle quoted.

## Contracts

| Contract | Role |
|---|---|
| DPX Token | ERC-20 stablecoin with license fee enforcement |
| DPXSettlementRouter | Fee calculation, settlement execution, ESG redistribution |

Contract addresses are returned by the `/manifest` endpoint and are always canonical.

## DPXSettlementRouter

The settlement router is the entry point for all on-chain settlements. It:

1. Accepts gross amount and a `quoteId`
2. Computes fees on-chain using the same formula as the oracle
3. Transfers net amount to the recipient
4. Routes ESG fees to verified impact programs
5. Routes license fees to the protocol treasury

### Key functions

| Function | Description |
|---|---|
| `settle(recipient, amount, isCrossCurrency, quoteId)` | Execute a settlement |
| `previewFees(amountUsd, hasFx, esgScore)` | Off-chain fee preview (used by /verify-fees) |
| `setFeeRates(coreBps, fxBps, esgDivisor)` | Admin: update fee rates |
| `setFeeCollector(address)` | Admin: update treasury address |

### Fee parameters (current)

| Parameter | Value |
|---|---|
| `coreFeeBps` | 85 |
| `fxFeeBps` | 40 |
| `esgDivisor` | 200 |
| `ESG_MAX_BPS` | 50 |
| License fee | 1 bps (enforced in token contract) |

### Fee computation (on-chain)

```solidity
uint256 coreFee = (amount * coreFeeBps) / 10_000;
uint256 fxFee   = isCrossCurrency ? (amount * fxFeeBps) / 10_000 : 0;
uint256 esgBps  = (100 - esgScore) / esgDivisor;  // esgDivisor = 200
uint256 esgFee  = (amount * esgBps) / 10_000;
uint256 total   = coreFee + fxFee + esgFee;
```

This matches the off-chain oracle formula exactly. The `/verify-fees` endpoint calls `previewFees()` to confirm agreement before settlement.

## Hybrid architecture

DPX uses a hybrid fee enforcement model:

- **License fee (0.01%)** is enforced in the DPX token contract on every transfer
- **Core, FX, and ESG fees** are enforced in `DPXSettlementRouter`

This separation allows the settlement router fees to be updated via governance without touching the token contract.

## Deploy the router

```bash
cd dpx-deploy
chmod +x deployRouter.sh
./deployRouter.sh
```

Then add to `.env`:

```sh
ROUTER_ADDRESS=0x...    # Address from deploy output
```

## Source

```
DPX-Dashborad/dpx-deploy/contracts/DPXSettlementRouter.sol
DPX-Dashborad/dpx-deploy/deployRouter.sh
Stability-Oracle/stability-oracle/routes/settlerClient.js
```
