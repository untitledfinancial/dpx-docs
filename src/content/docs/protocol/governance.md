---
title: Protocol Governance
description: How DPX protocol parameters are governed on-chain by the company, with full public auditability.
---

DPX protocol parameters — fee rates, basket weights, ESG redistribution allocations, and oracle configurations — are governed on-chain by the company through `PolicyManager`. No parameter can be changed silently or off-chain. Every change is publicly verifiable on Base mainnet.

## How it works

All protocol parameters are controlled by `PolicyManager` (`0x741f3179786d9f72e134BdC699D6604eaB250D6E`). No fee rate, basket weight, redistribution allocation, or oracle authorization can be changed without a transaction through this contract.

**What PolicyManager controls:**

| Parameter | Current value | Contract |
|---|---|---|
| Core transfer fee | 0.85% (85 bps) | PolicyManager → StabilityFeeController |
| FX conversion fee | 0.40% (40 bps) | PolicyManager → StabilityFeeController |
| ESG redistribution allocations | Ocean 30% / Renewable 25% / Forest 20% / Climate 15% / Water 10% | PolicyManager → ESGRedistribution |
| Basket currency weights | USD / EUR / GBP / JPY / CNY · based on IMF SDR pool recommendations | PolicyManager → BasketPegManager |
| Oracle authorisation | ESG Oracle wallet address | PolicyManager → ESGCompliance |

Every parameter change is:
- Executed as an on-chain transaction (Base mainnet, chainId 8453)
- Permanently timestamped in block history
- Publicly verifiable by any counterparty, regulator, or auditor — no login required

This is the institutional governance standard: **no off-chain admin panels, no backdoors, no silent parameter changes.**

## Transparency

All contracts are verified on Base Blockscout. Any change to any protocol parameter can be independently confirmed:

```bash
# Check current fee configuration
cast call 0x741f3179786d9f72e134BdC699D6604eaB250D6E "getFeeConfig()" --rpc-url https://mainnet.base.org

# Check basket weights
cast call 0xB5071fA48B92e3652701053eEd8826ab94014AaA "getBasketWeights()" --rpc-url https://mainnet.base.org

# Check authorised ESG oracle address
cast call 0x7717e89bC45cBD5199b44595f6E874ac62d79786 "oracle()" --rpc-url https://mainnet.base.org
```

## Why on-chain governance matters for institutions

Institutional counterparties, regulators, and SFDR-reporting funds need to verify that the protocol they're settling through is operating as documented. On-chain governance means:

- **Auditors** can verify fee rates and redistribution allocations without relying on the company's word
- **Compliance teams** can confirm MiCA/FCA/Basel III-relevant parameters haven't changed
- **ESG reporting funds** (GFANZ/SFDR Article 8/9) can independently confirm impact pool allocations match their disclosures

## Parameter change process

1. Company prepares and reviews proposed change
2. Transaction submitted through `PolicyManager` from company multisig
3. Change is visible on-chain immediately — any counterparty can verify
4. DPX documentation and API responses are updated to reflect new parameters

Major changes (new fee components, new basket currencies, redistribution reallocation above 5%) are announced to beta partners at least 14 days before taking effect.

## Related

- [Smart Contracts](/protocol/contracts) — all contract addresses and ABIs
- [Regulatory Positioning](/protocol/regulatory) — MiCA, FCA, Basel III alignment
- [FATF & Travel Rule](/protocol/fatf-compliance) — AML/CFT compliance architecture
