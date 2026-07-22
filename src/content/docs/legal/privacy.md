---
title: Privacy & Data Handling
description: How DPX processes transaction data, what reaches the AI synthesis layer, and how data minimization is applied across all oracle endpoints.
---

import { Aside } from '@astrojs/starlight/components';

<Aside type="note" title="Implicit Agreement">
By calling any DPX API endpoint, you acknowledge this notice. No separate registration step is required. The machine-readable form of this notice is available at every oracle's `/.well-known/agent-terms.json`.
</Aside>

**Effective:** 2026-07-22 · **Untitled_ LuxPerpetua Technologies, Inc.**

---

## What DPX processes

DPX processes the following data categories during settlement routing and compliance screening:

| Data | Purpose | External AI? |
|---|---|---|
| Wallet addresses (sender, recipient) | Sanctions screening, AML behavioral analysis | Truncated only (first 6 + last 4 chars) |
| Transaction amounts | Fee calculation, volume tier assignment, AML velocity | No |
| ESG parameters | Fee tier determination, SFDR documentation | No |
| Entity names | Verification of Payee name-matching | Yes — public legal name only |
| LEI numbers | GLEIF registry lookup | No — status only passed to AI |
| API metadata (timestamps, IPs, paths) | Security, rate limiting | No |

DPX does not process personal identification information for natural persons, bank account numbers, IBAN or SWIFT credentials, or internal business data beyond what is necessary to execute and screen the transaction.

---

## AI synthesis layer — data minimization

The AI synthesis layer is used for three narrow purposes. In each case, the minimum necessary data is transmitted:

### Stability oracle commentary
Receives aggregated market signals only — stability scores, macro indicators, yield curve data, geopolitical risk indices. No operator data, no client data, no wallet addresses.

### ESG score narration
Receives aggregated ESG component scores (0–100) and the registered legal entity name where narration is requested. No transaction amounts, wallet addresses, or operator identifiers.

### AML flag triage (FLAG band only)
Receives truncated wallet addresses (`0xABCD…5678`), computed risk scores, and behavioral signal descriptions. Full wallet addresses are **never transmitted** to any external AI provider. The AI reasons about signal patterns, not about specific wallet identities.

The AI synthesis layer has no read or write access to internal databases during transaction processing. It receives only what is listed above and returns a structured decision or narrative.

---

## Sanctions and compliance screening

Every transaction is screened against the OFAC Specially Designated Nationals list before settlement executes. Screening results are retained as part of the compliance log. The SDN list is refreshed daily from the official U.S. Treasury source.

---

## Data retention

| Data type | Retention |
|---|---|
| Transaction and compliance logs | 7 years (BSA/AML requirement) |
| API request metadata | 12 months |
| Behavioral analysis profiles | 24 hours rolling window |
| Screening decisions | 7 years |

---

## Third-party disclosure

DPX does not sell, license, or share operator or transaction data with third parties for commercial purposes. Data is shared with external services only where required for:

- Compliance screening (OFAC, GLEIF, OpenSanctions)
- AI synthesis as described above
- Legal compulsion under applicable law

---

## Machine-readable form

This notice is available in structured JSON at every oracle endpoint:

```
GET https://stability.untitledfinancial.com/.well-known/agent-terms.json
GET https://esg.untitledfinancial.com/.well-known/agent-terms.json
GET https://compliance.untitledfinancial.com/.well-known/agent-terms.json
```

Every API response includes an `X-DPX-Terms` header pointing to the canonical terms URL, and a `_legal` field in structured responses linking to this notice and the operator agreement.

---

## Contact

All inquiries are handled via the contact form at [untitledfinancial.com](https://untitledfinancial.com). There is no direct email support.
