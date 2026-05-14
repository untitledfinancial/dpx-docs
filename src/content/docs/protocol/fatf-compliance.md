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

FATF Recommendation 16 (the "Travel Rule") requires that VASPs transmit originator and beneficiary information alongside virtual asset transfers above a threshold (USD/EUR 1,000 in most jurisdictions). The June 2025 expansion extended R16 to cover crypto wallet transfers, requiring **Verification of Payee (VoP)** — confirming the identity of the entity behind a wallet address before settlement.

### DPX Compliance Oracle — VoP built in

DPX satisfies FATF R16 VoP through the **DPX Compliance Oracle** (`compliance.untitledfinancial.com`), which runs automatically on every payment processed by the Integration API. No separate Travel Rule solution required for DPX-routed settlements.

**How it works:**

1. Every `POST /payments/initiate` triggers a VoP check against the Compliance Oracle before settlement executes
2. The oracle resolves the counterparty wallet against a GLEIF-verified LEI registry
3. A compliance attestation is returned with every settlement response:

```json
"compliance": {
  "fatfR16Compliant": true,
  "micaCompliant":    true,
  "geniusCompliant":  true,
  "regulatoryNote":   "FATF R16 VoP satisfied — settlement compliant."
}
```

4. Every attestation is recorded on-chain via `DPXVerificationOfPayee` (`0xB594604c8b46C7EcFa19C485B35F43A04f6DAcbf`) — immutable, auditable, verifiable by any regulator

**VoP resolution tiers:**

| Result | Score | Settlement | FATF R16 |
|---|---|---|---|
| `LEI_MATCH` | 100 | ✅ Proceeds | ✅ Satisfied |
| `VERIFIED` | 90–100 | ✅ Proceeds | ✅ Satisfied |
| `PROCEED_HIGH_CONFIDENCE` | 75–89 | ✅ Proceeds | ✅ Satisfied |
| `PROCEED_FLAGGED` | 55–74 | ✅ Proceeds | ⚠️ Noted |
| `NOT_REGISTERED` | — | ✅ Proceeds | ⚠️ Unverified |
| `BLOCKED` | <35 | ❌ Blocked | ❌ Failed |

No human review queues. All resolution is automatic.

**On-chain contracts (Base mainnet):**

| Contract | Address | Role |
|---|---|---|
| DPXEntityRegistry | `0xF18313e708cFf6d80b6123De972290246543cC94` | Wallet → LEI registry |
| DPXVerificationOfPayee | `0xB594604c8b46C7EcFa19C485B35F43A04f6DAcbf` | VoP attestations |
| DPXCompliance | `0x2F05608dbb71E96e308487DD30F7f59822c66e2B` | Composite compliance check |

For institutions that use the Travel Rule solutions below for other flows, DPX remains compatible:

| Solution | Compatibility |
|---|---|
| Notabene | Compatible — pass IVMS 101 payload before settlement |
| Sygna Bridge | Compatible — settlement executes after VASP-to-VASP handshake |
| TRM Labs | Compatible — on-chain address screening pre-settlement |
| Chainalysis KYT | Compatible — transaction monitoring post-settlement |

The on-chain settlement receipt (verifiable on Base Blockscout) provides an immutable audit record satisfying record-keeping requirements under all major Travel Rule implementations.

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
- Produce immutable on-chain records for every settlement event, verifiable on Base Blockscout
- Support pre-settlement address screening via compatible KYT/KYC providers
- Operate under governance policies set by `PolicyManager` with on-chain auditability

## Further reading

- [FATF Recommendation 15 — Virtual Assets (2021)](https://www.fatf-gafi.org/en/topics/virtual-assets.html)
- [FATF Guidance for VASPs (2023)](https://www.fatf-gafi.org/content/dam/fatf-gafi/guidance/Guidance-RBA-VA-VASPs.pdf)
- [IVMS 101 Standard](https://intervasp.org/)
- [Regulatory Positioning](/protocol/regulatory) — MiCA, FCA, Basel III alignment
