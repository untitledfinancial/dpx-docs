---
title: Smart Contracts
description: All 10 DPX on-chain contracts deployed on Base mainnet (chainId 8453) — addresses, roles, ABIs, and key functions.
---

DPX is deployed on **Base mainnet** (chainId 8453). All contracts are verified on Sourcify / Base Blockscout. The settlement router enforces all fees on-chain — agents cannot submit settlements at rates different from what the oracle quoted.

Contract addresses are also returned by the `/manifest` endpoint and are always canonical.

---

## Deployed Contracts

### Settlement & Stability

| Contract | Address | Role |
|---|---|---|
| DPX Token (V3) | `0x7A62dEcF6936675480F0991A2EF4a0d6f1023891` | Upgradeable ERC-20 · 0.01% license fee on every transfer |
| StabilityFeeController | `0xda8aA06cDa9D06001554d948dA473EBe5282Ea17` | PID-controlled stability mechanism |
| BasketPegManager | `0xB5071fA48B92e3652701053eEd8826ab94014AaA` | Multi-currency basket · USD / EUR / GBP / JPY / CNY |
| ESGOracle | `0x7717e89bC45cBD5199b44595f6E874ac62d79786` | On-chain ESG score storage · 6 providers · per-company scoring |
| ESGRedistribution | `0x4F3741252847E4F07730c4CEC3018b201Ac6ce87` | Bad-actor fee redistribution · 10 industry buckets |
| PolicyManager | `0x741f3179786d9f72e134BdC699D6604eaB250D6E` | Governance · basket and fee policy control |
| DPXSettlementRouter v2.0 | `0xe333551E18ef0471A71d7e8e761212766aa5AD4f` | Single settlement entry point · enforces all fees on-chain |

### Compliance (deployed 2026-05-14)

| Contract | Address | Role |
|---|---|---|
| DPXEntityRegistry | `0xF18313e708cFf6d80b6123De972290246543cC94` | On-chain wallet → LEI registry · source of truth for VoP |
| DPXVerificationOfPayee | `0xB594604c8b46C7EcFa19C485B35F43A04f6DAcbf` | On-chain VoP attestations · FATF R16 · called by settlement contracts |
| DPXCompliance | `0x2F05608dbb71E96e308487DD30F7f59822c66e2B` | Composite compliance primitive · FATF R16 / MiCA / GENIUS Act |

**Base Blockscout:** [base.blockscout.com](https://base.blockscout.com) → search any address above to verify deployment and inspect transactions.

---

## DPX Token (V3)

**Address:** `0x7A62dEcF6936675480F0991A2EF4a0d6f1023891`

Upgradeable ERC-20 (`DOVPAXBRANCHUpgradeableV3`) with a protocol license fee enforced on every transfer. The license fee (1 bps / 0.01%) is immutable and cannot be disabled — it funds protocol development and is separate from settlement fees.

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
| `computeFee(sender, recipient, amount)` | Returns `(feeAmount, licenseFeeAmount)` for a transfer |

### Fee parameters (current)

| Parameter | Value |
|---|---|
| `coreFeeBps` | 85 |
| `fxFeeBps` | 40 |
| `esgDivisor` | 200 |
| `ESG_MAX_BPS` | 50 |
| License fee | 1 bps (enforced in DPX Token) |

---

## DPXSettlementRouter v2.0

**Address:** `0xe333551E18ef0471A71d7e8e761212766aa5AD4f`

The single entry point for all DPX settlements. Enforces the full fee structure (core + FX + ESG + license) before executing the token transfer. Agents and TMS integrations call `settle()` — never the token contract directly.

| Function | Description |
|---|---|
| `settle(recipient, grossAmount, isCrossCurrency, quoteId)` | Execute a settlement — enforces all fees on-chain |
| `previewFees(grossAmount, isCrossCurrency)` | Off-chain fee preview — call before submitting settlement |
| `setFeeRates(coreFeeBps, fxFeeBps)` | Admin: update fee rates |
| `setFeeCollector(address)` | Admin: update treasury address |
| `setESGRedistribution(address)` | Admin: update redistribution contract address |

### Fee computation (on-chain)

```solidity
uint256 coreFee = (grossAmount * coreFeeBps) / 10_000;   // 0.85%
uint256 fxFee   = isCrossCurrency ? (grossAmount * fxFeeBps) / 10_000 : 0;  // 0.40%
uint256 esgBps  = (100 - avgEsgScore) * ESG_MAX_BPS / 100;  // 0.00–0.50%
uint256 esgFee  = (grossAmount * esgBps) / 10_000;
uint256 net     = grossAmount - coreFee - fxFee - esgFee;
```

The `/verify-fees` endpoint calls `previewFees()` to confirm on-chain fees match the oracle quote before settlement execution.

---

## BasketPegManager

**Address:** `0xB5071fA48B92e3652701053eEd8826ab94014AaA`

Manages the multi-currency basket backing DPX. Tracks weights across USD, EUR, GBP, JPY, and CNY. Computes the on-chain basket value and compares to oracle-reported value — if divergence exceeds peg tolerance, a peg alert is raised.

Basket adjustments are proposed by the Stability Oracle's recommendation engine and executed only after PolicyManager governance approval.

Currency weights are modelled on IMF SDR pool recommendations.

| Currency | Role |
|---|---|
| USD | Primary reserve anchor |
| EUR | European exposure |
| GBP | UK exposure |
| JPY | Asia-Pacific exposure |
| CNY | Emerging market exposure |

---

## ESGOracle

**Address:** `0x7717e89bC45cBD5199b44595f6E874ac62d79786`

On-chain storage and verification of ESG scores. The ESG Oracle service posts scores here after each evaluation cycle. Scores are stored per-company, per-provider — enabling weighted aggregation across multiple authoritative sources.

**Current configuration:**

| Setting | Value |
|---|---|
| Oracle updater | `0x4fb89aC30e70f041CebaF814C08a1A2cf3f808C1` |
| Registered providers | WorldBank · UN · ClimateMonitor · IMF · OECD · SEC |

| Function | Description |
|---|---|
| `getESGScore(provider, company)` | Score for a specific company from a specific provider (0–100) |
| `listProviders()` | All registered data providers |
| `getAllScores(company)` | All provider scores for a company |
| `setESGScore(provider, company, score)` | Oracle updater: post a new score |
| `batchSetScores(provider, companies[], scores[])` | Oracle updater: bulk score update |

---

## ESGRedistribution

**Address:** `0x4F3741252847E4F07730c4CEC3018b201Ac6ce87`

Redistributes fees from bad actors (companies with aggregated ESG score ≤ threshold) to a consolidated on-chain impact wallet. Weighted score is computed across all enabled providers — a company must score ≤ 40 across WorldBank, UN, ClimateMonitor, IMF, OECD, and SEC before redistribution is triggered.

**Registered providers (weights):**

| Provider | Weight | Status |
|---|---|---|
| WorldBank | 40 | Active |
| UN | 30 | Active |
| ClimateMonitor | 30 | Active |
| IMF | 20 | Active |
| OECD | 20 | Active |
| SEC | 20 | Active |

**Industry buckets (all route to consolidated impact wallet):**

FossilFuels · Energy · Manufacturing · Agriculture · Technology · Finance · Consumer · Healthcare · RealEstate · Transportation

| Function | Description |
|---|---|
| `aggregatedScore(company)` | Weighted average ESG score for a company (0–100) |
| `isBelowThreshold(company)` | Returns true if company qualifies for redistribution |
| `redistributeERC20(token, company, amount)` | Redistribute ERC20 fees from a bad actor |
| `setCompanyIndustry(company, industry)` | Map a company address to an industry bucket |
| `registerProvider(name, weight, enabled)` | Add or update a scoring provider |

Every redistribution is recorded on-chain via `RedistributionExecuted` event — auditable by any counterparty, regulator, or auditor.

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
- **Core, FX, and ESG fees** — enforced in DPXSettlementRouter
- **ESG scoring** — stored in ESGOracle, aggregated in ESGRedistribution
- **Bad-actor redistribution** — enforced in ESGRedistribution (not discretionary)
- **Basket integrity** — enforced in BasketPegManager
- **Governance bounds** — enforced in PolicyManager

This separation allows settlement router fees to be updated via PolicyManager governance without touching the token contract. Integrators interact with the router only — never the token contract directly.

---

---

## DPXEntityRegistry

**Address:** `0xF18313e708cFf6d80b6123De972290246543cC94`  
**Verified:** [Sourcify](https://repo.sourcify.dev/8453/0xF18313e708cFf6d80b6123De972290246543cC94)

On-chain mirror of the Compliance Oracle's entity registry. Any protocol can call it to confirm wallet → LEI mappings without going through the oracle API.

| Function | Description |
|---|---|
| `isRegistered(wallet)` | Returns true if wallet has an active registration |
| `getEntity(wallet)` | Returns full Entity struct (LEI, name, country, timestamps) |
| `getWalletsForLei(lei)` | All wallets registered under a given LEI |
| `register(wallet, lei, name, country)` | Admin: register a new entity |
| `deactivate(wallet, reason)` | Admin: deactivate a registration |
| `updateLeiStatus(wallet, active)` | Admin: sync LEI status from GLEIF |

---

## DPXVerificationOfPayee

**Address:** `0xB594604c8b46C7EcFa19C485B35F43A04f6DAcbf`  
**Verified:** [Sourcify](https://repo.sourcify.dev/8453/0xB594604c8b46C7EcFa19C485B35F43A04f6DAcbf)

Issues on-chain VoP attestations after each oracle check. Settlement contracts call `verify()` before executing transfers. The Compliance Oracle worker acts as the RELAYER — after each VoP check it calls `recordAttestation()` with the result.

| Function | Description |
|---|---|
| `verify(wallet)` | Returns latest `(proceedSafe, score, result, timestamp)` for a wallet |
| `hasRecentAttestation(wallet, maxAge)` | True if a valid attestation exists within `maxAge` seconds |
| `recordAttestation(requestId, wallet, name, score, result, proceedSafe)` | Relayer: record a new VoP result |
| `walletHistory(wallet)` | Array of all requestIds for a wallet |

---

## DPXCompliance

**Address:** `0x2F05608dbb71E96e308487DD30F7f59822c66e2B`  
**Verified:** [Sourcify](https://repo.sourcify.dev/8453/0x2F05608dbb71E96e308487DD30F7f59822c66e2B)

Composite compliance primitive — the single integration point for any external protocol (DEX, lending market, DAO treasury, TMS) that needs a FATF R16 / MiCA / GENIUS Act proof on-chain.

| Function | Description |
|---|---|
| `checkCompliance(wallet, amount, currency)` | Returns full `ComplianceStatus` struct |
| `checkComplianceBatch(wallets[], amounts[], currency)` | Batch compliance check for multi-leg settlements |

**ComplianceStatus fields:**

| Field | Type | Description |
|---|---|---|
| `approved` | bool | True if FATF R16 satisfied |
| `fatfR16Satisfied` | bool | LEI active + VoP score ≥ 75 |
| `leiActive` | bool | Entity registered and active in DPXEntityRegistry |
| `vopPassed` | bool | Latest VoP proceedSafe + score ≥ 75 |
| `vopScore` | uint8 | Raw VoP score (0–100) |
| `attestedAt` | uint64 | Timestamp of last VoP attestation |
| `regulatoryNote` | string | Human-readable compliance summary |

---

## Deploy / Source

```
dpx-protocol/dpx-deploy/contracts/DPXToken.sol
dpx-protocol/dpx-deploy/contracts/StabilityFeeController.sol
dpx-protocol/dpx-deploy/contracts/BasketPegManager.sol
dpx-protocol/dpx-deploy/contracts/ESGOracle.sol
dpx-protocol/dpx-deploy/contracts/ESGRedistribution.sol
dpx-protocol/dpx-deploy/contracts/PolicyManager.sol
dpx-protocol/dpx-deploy/contracts/DPXSettlementRouter.sol
Stability-Oracle/stability-oracle/routes/settlerClient.js
```
