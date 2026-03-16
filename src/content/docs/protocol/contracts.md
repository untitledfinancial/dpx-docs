---
title: Smart Contracts
description: All 6 DPX on-chain contracts deployed on Base mainnet (chainId 8453) — addresses, roles, ABIs, and key functions.
---

DPX is deployed on **Base mainnet** (chainId 8453). All 6 contracts are verified on Basescan. The settlement router enforces all fees on-chain — agents cannot submit settlements at rates different from what the oracle quoted.

Contract addresses are also returned by the `/manifest` endpoint and are always canonical.

---

## Deployed Contracts

| Contract | Address | Role |
|---|---|---|
| DPX Token | `0x7A62dEcF6936675480F0991A2EF4a0d6f1023891` | ERC-20 stablecoin · 0.01% license fee on every transfer |
| StabilityFeeController | `0xda8aA06cDa9D06001554d948dA473EBe5282Ea17` | PID-controlled stability mechanism |
| BasketPegManager | `0xB5071fA48B92e3652701053eEd8826ab94014AaA` | Multi-currency basket · USD / EUR / GBP / JPY / CNY |
| ESGCompliance | `0x7717e89bC45cBD5199b44595f6E874ac62d79786` | On-chain ESG score storage and verification |
| ESGRedistribution | `0x4F3741252847E4F07730c4CEC3018b201Ac6ce87` | Impact pool · Ocean / Renewable / Forest / Climate / Water |
| PolicyManager | `0x741f3179786d9f72e134BdC699D6604eaB250D6E` | Governance · basket and fee policy control |

**Basescan:** [basescan.org](https://basescan.org) → search any address above to verify deployment and inspect transactions.

---

## DPX Token

**Address:** `0x7A62dEcF6936675480F0991A2EF4a0d6f1023891`

Standard ERC-20 with a protocol license fee enforced on every transfer. The license fee (1 bps / 0.01%) is immutable and cannot be disabled — it funds protocol development and is separate from settlement fees.

| Function | Description |
|---|---|
| `transfer(to, amount)` | Standard ERC-20 transfer — license fee applied automatically |
| `approve(spender, amount)` | Standard ERC-20 approval |
| `balanceOf(address)` | Token balance query |

---

## StabilityFeeController

**Address:** `0xda8aA06cDa9D06001554d948dA473EBe5282Ea17`

PID (Proportional-Integral-Derivative) controlled stability mechanism. Monitors peg deviation and adjusts fee parameters in response to real-time stability signals from the oracle. Works in conjunction with the PolicyManager — the PolicyManager sets governance bounds; the StabilityFeeController operates within them.

| Function | Description |
|---|---|
| `settle(recipient, amount, isCrossCurrency, quoteId)` | Execute a settlement — enforces fees on-chain |
| `previewFees(amountUsd, hasFx, esgScore)` | Off-chain fee preview (used by `/verify-fees`) |
| `setFeeRates(coreBps, fxBps, esgDivisor)` | Admin: update fee rates |
| `setFeeCollector(address)` | Admin: update treasury address |

### Fee parameters (current)

| Parameter | Value |
|---|---|
| `coreFeeBps` | 85 |
| `fxFeeBps` | 40 |
| `esgDivisor` | 200 |
| `ESG_MAX_BPS` | 50 |
| License fee | 1 bps (enforced in DPX Token) |

### Fee computation (on-chain)

```solidity
uint256 coreFee = (amount * coreFeeBps) / 10_000;
uint256 fxFee   = isCrossCurrency ? (amount * fxFeeBps) / 10_000 : 0;
uint256 esgBps  = (100 - esgScore) / esgDivisor;
uint256 esgFee  = (amount * esgBps) / 10_000;
uint256 total   = coreFee + fxFee + esgFee;
```

This matches the off-chain oracle formula exactly. The `/verify-fees` endpoint calls `previewFees()` to confirm agreement before settlement.

---

## BasketPegManager

**Address:** `0xB5071fA48B92e3652701053eEd8826ab94014AaA`

Manages the multi-currency basket backing DPX. Tracks weights across USD, EUR, GBP, JPY, and CNY. Computes the on-chain basket value and compares to oracle-reported value — if divergence exceeds peg tolerance, a peg alert is raised.

Basket adjustments are proposed by the Stability Oracle's recommendation engine and executed only after PolicyManager governance approval.

| Currency | Role |
|---|---|
| USD | Primary reserve anchor |
| EUR | European exposure |
| GBP | UK exposure |
| JPY | Asia-Pacific exposure |
| CNY | Emerging market exposure |

---

## ESGCompliance

**Address:** `0x7717e89bC45cBD5199b44595f6E874ac62d79786`

On-chain storage and verification of ESG scores. The ESG Oracle posts scores here after each evaluation cycle. The StabilityFeeController reads from this contract at settlement time to compute the ESG fee component — ensuring the fee applied on-chain matches the oracle's latest verified score.

Scores are posted per-counterparty and include E, S, and G sub-scores alongside the composite average.

---

## ESGRedistribution

**Address:** `0x4F3741252847E4F07730c4CEC3018b201Ac6ce87`

Receives 100% of ESG fee revenue from the StabilityFeeController and distributes to five verified on-chain impact programs. Distribution weights are set at deployment and can only be changed via PolicyManager governance — not unilaterally.

| Program | Share | Address |
|---|---|---|
| Ocean Conservation | 30% | Verified on-chain |
| Renewable Energy | 25% | Verified on-chain |
| Forest Preservation | 20% | Verified on-chain |
| Climate Action | 15% | Verified on-chain |
| Clean Water | 10% | Verified on-chain |

Every redistribution is recorded with: tx hash, per-program amounts, period dates, and total redistributed — stored on Storacha (IPFS) for independent verification.

---

## PolicyManager

**Address:** `0x741f3179786d9f72e134BdC699D6604eaB250D6E`

On-chain governance for basket and fee policy. The Stability Oracle's recommendation engine proposes adjustments — the PolicyManager enforces hard constraints on those proposals:

- Maximum adjustment magnitude per cycle
- Cooling periods between successive changes
- Circuit breaker: halts all adjustments under extreme instability conditions
- Quorum requirements for program address changes

The PolicyManager is the only contract authorised to update ESGRedistribution program addresses or BasketPegManager currency weights.

---

## Hybrid Architecture

DPX uses a hybrid fee enforcement model:

- **License fee (0.01%)** — enforced in the DPX Token contract on every transfer
- **Core, FX, and ESG fees** — enforced in StabilityFeeController
- **Basket integrity** — enforced in BasketPegManager
- **ESG redistribution** — enforced in ESGRedistribution (not discretionary)

This separation allows settlement router fees to be updated via PolicyManager governance without touching the token contract.

---

## Deploy / Source

```
dpx-protocol/dpx-deploy/contracts/DPXToken.sol
dpx-protocol/dpx-deploy/contracts/StabilityFeeController.sol
dpx-protocol/dpx-deploy/contracts/BasketPegManager.sol
dpx-protocol/dpx-deploy/contracts/ESGCompliance.sol
dpx-protocol/dpx-deploy/contracts/ESGRedistribution.sol
dpx-protocol/dpx-deploy/contracts/PolicyManager.sol
dpx-protocol/dpx-deploy/deployRouter.sh
Stability-Oracle/stability-oracle/routes/settlerClient.js
```
