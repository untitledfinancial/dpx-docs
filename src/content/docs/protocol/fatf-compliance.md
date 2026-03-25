---
title: FATF & Travel Rule Compliance
description: How DPX aligns with FATF Recommendations 15 and 16 (Travel Rule), Virtual Asset Service Provider requirements, and what this means for institutional counterparties.
---

The Financial Action Task Force (FATF) sets the global standard for anti-money laundering (AML) and counter-terrorism financing (CFT). Every institutional counterparty operating in a FATF member jurisdiction — all G20 countries, the EU, UK, and 200+ others — is required to comply with FATF Recommendations.

**This page explains DPX's position on the two FATF requirements institutional clients ask about first.**

## FATF Recommendation 15 — Virtual Assets

FATF Recommendation 15 (updated October 2021) requires that Virtual Asset Service Providers (VASPs) be regulated, licensed, or registered in their jurisdiction, and subject to AML/CFT controls equivalent to those applied to traditional financial institutions.

**DPX's position:**

DPX is a **settlement protocol**, not a custodial VASP. It does not hold customer funds, operate wallets on behalf of clients, or facilitate peer-to-peer anonymous transfers. Settlement flows are:

- Initiated by the counterparty's own wallet
- Routed through `DPXSettlementRouter` (non-custodial — contract never holds funds)
- Settled directly to the beneficiary address on Base mainnet
- Fully traceable on-chain with block explorer verification

DPX's institutional clients and integration partners are responsible for their own VASP registration and AML/KYC obligations in their respective jurisdictions. DPX does not replace or bypass those obligations — it operates as the settlement execution layer beneath them.

## FATF Recommendation 16 — The Travel Rule

FATF Recommendation 16 (the "Travel Rule") requires that VASPs transmit originator and beneficiary information alongside virtual asset transfers above a threshold (USD/EUR 1,000 in most jurisdictions).

The Travel Rule applies to VASPs — entities that transfer virtual assets on behalf of customers. Because DPX is non-custodial and does not transfer assets on behalf of third parties, it does not independently trigger Travel Rule obligations.

**However:** institutional clients integrating DPX who are themselves VASPs must ensure their Travel Rule compliance stack passes required information through any DPX-routed settlement. DPX is designed to be compatible with the major Travel Rule solutions:

| Solution | Compatibility |
|---|---|
| Notabene | Compatible — pass IVMS 101 payload before settlement |
| Sygna Bridge | Compatible — settlement executes after VASP-to-VASP handshake |
| TRM Labs | Compatible — on-chain address screening pre-settlement |
| Chainalysis KYT | Compatible — transaction monitoring post-settlement |

The on-chain settlement receipt (IPFS-linked, produced by `ESGRedistribution`) provides an immutable audit record that satisfies record-keeping requirements under Travel Rule implementations.

## IVMS 101 — Identity Data Standard

FATF recommends the InterVASP Messaging Standard (IVMS 101) for structuring identity data transmitted under the Travel Rule. DPX's settlement flow is structured to allow IVMS 101 payloads to be attached to the originating transaction by the sending VASP before the `DPXSettlementRouter` call is executed. No modification to DPX's on-chain contracts is required.

## Jurisdictional Summary

| Jurisdiction | Framework | DPX Alignment |
|---|---|---|
| United States | FinCEN Travel Rule (>$3,000 threshold) | Non-custodial model; client VASP handles MSB obligations |
| European Union | MiCA Title IV + FATF Rec 16 (>EUR 1,000) | Protocol-level MiCA alignment; VASP clients use IVMS 101 |
| United Kingdom | FCA PS21/24 + JMLSG Guidance | Non-custodial; FCA-authorised client handles Travel Rule |
| Singapore | MAS PSA Part 3 | Non-custodial; client PSP handles Travel Rule |
| UAE / ADGM | VARA VASP Regulations | Compatible with VARA-licensed client VASPs |

## What to tell your compliance team

DPX does not:
- Hold or control customer funds at any point
- Act as a money transmitter or payment service provider on behalf of clients
- Replace the AML/KYC obligations of the integrating institution

DPX does:
- Execute settlement on-chain with full transaction traceability
- Produce immutable IPFS receipts for every settlement event
- Support pre-settlement address screening via compatible KYT/KYC providers
- Operate under governance policies set by `PolicyManager` with on-chain auditability

## Further reading

- [FATF Recommendation 15 — Virtual Assets (2021)](https://www.fatf-gafi.org/en/topics/virtual-assets.html)
- [FATF Guidance for VASPs (2023)](https://www.fatf-gafi.org/content/dam/fatf-gafi/guidance/Guidance-RBA-VA-VASPs.pdf)
- [IVMS 101 Standard](https://intervasp.org/)
- [Regulatory Positioning](/protocol/regulatory) — MiCA, FCA, Basel III alignment
