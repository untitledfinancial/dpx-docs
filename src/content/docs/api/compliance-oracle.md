---
title: Compliance Oracle API
description: AML screening, Verification of Payee (VoP), and ESG scoring — FATF R16, SEPA VoP, MiCA, GENIUS Act. No human queues.
---

Multi-layer compliance oracle running before every payment: sanctions screening, behavioural analysis, counterparty network risk, and Verification of Payee (FATF R16). Signal weights self-calibrate per cohort. Ambiguous decisions route through an AI reasoning layer. No human queues.

**Base URL:** `https://compliance.untitledfinancial.com`

:::note
Institutions using the [Integration API](/api/integration-api) do not need to call these endpoints directly — AML screening, VoP, and ESG scoring all run automatically on every `POST /payments/initiate`. This reference is for direct integrations.
:::

---

## POST /vop/verify — VoP check

Verify the identity of a payment counterparty before settlement. Costs `$0.075 USDC` via [x402](https://x402.org) on Base mainnet — pay via the `X-PAYMENT` header.

```bash
curl -X POST https://compliance.untitledfinancial.com/vop/verify \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: <base64-x402-payload>" \
  -d '{
    "walletAddress": "0xabc...",
    "submittedName": "Deutsche Bank AG",
    "submittedLei":  "7LTWFZYICNSX8D621K86"
  }'
```

**Request fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `walletAddress` | string | Yes | Wallet address of the counterparty |
| `submittedName` | string | Yes | Name as submitted by the payment initiator |
| `submittedLei` | string | No | LEI of the counterparty (bypasses name matching if matched) |

**Response:**

```json
{
  "requestId":      "550e8400-e29b-41d4-a716-446655440000",
  "result":         "LEI_MATCH",
  "proceedSafe":    true,
  "score":          100,
  "resolvedBy":     "LEI_EXACT_MATCH",
  "registeredName": "Deutsche Bank Aktiengesellschaft",
  "registeredLei":  "7LTWFZYICNSX8D621K86",
  "leiStatus":      "ACTIVE",
  "message":        "LEI verified and active. Identity confirmed.",
  "attestation": {
    "fatfR16Compliant": true,
    "regulatoryNote":   "FATF R16 VoP satisfied via GLEIF-verified LEI exact match."
  }
}
```

**Resolution tiers:**

| Result | Score | Proceeds? | Meaning |
|---|---|---|---|
| `LEI_MATCH` | 100 | ✅ | LEI matched exactly — name check skipped |
| `VERIFIED` | 90–100 | ✅ | Strong name match |
| `PROCEED_HIGH_CONFIDENCE` | 75–89 | ✅ | Good match, minor discrepancy noted |
| `PROCEED_FLAGGED` | 55–74 | ✅ | Moderate match, flagged in attestation + AI assessment |
| `PROCEED_UNVERIFIED` | 35–54 | ✅ | Low match, marked unverified + AI assessment |
| `NOT_REGISTERED` | — | ✅ | Wallet not in registry — no identity to verify |
| `LEI_INACTIVE` | 100 | ✅ | LEI matched but lapsed — warns counterparty |
| `BLOCKED` | <35 | ❌ | Name mismatch below threshold — payment blocked |

The only hard block is `BLOCKED` — when names are so dissimilar the payment is likely misdirected. Every other result proceeds, with the degree of confidence recorded in the attestation.

**Gray zone AI assessment** — `PROCEED_FLAGGED` and `PROCEED_UNVERIFIED` results include a `grayZoneReasoning` field:

```json
{
  "grayZoneReasoning": {
    "assessment":            "LIKELY_CORRECT",
    "confidence":            "HIGH",
    "likelyCause":           "Legal suffix difference — 'GmbH' vs 'GmbH & Co. KG'",
    "rationale":             "The submitted name is a common shortened form of the registered legal name, consistent with standard German entity naming conventions.",
    "proceedRecommendation": "PROCEED",
    "processedAt":           1748123456
  }
}
```

| Field | Values | Meaning |
|---|---|---|
| `assessment` | `LIKELY_CORRECT` / `UNCERTAIN` / `LIKELY_WRONG` | AI judgment on whether the discrepancy is a legitimate name variant |
| `confidence` | `HIGH` / `MEDIUM` / `LOW` | Confidence in the assessment |
| `likelyCause` | string | Short phrase — most probable reason for the discrepancy |
| `rationale` | string | 1–2 sentence explanation |
| `proceedRecommendation` | `PROCEED` / `PROCEED_WITH_CAUTION` / `MANUAL_REVIEW` | Compliance recommendation |

Advisory only — never overrides `proceedSafe`. Timeout fallback: field omitted if AI call fails.

---

## GET /vop/lookup/:wallet — Entity lookup

Free. Returns the registered entity for a wallet address.

```bash
curl https://compliance.untitledfinancial.com/vop/lookup/0xabc...
```

**Response:**

```json
{
  "walletAddress": "0xabc...",
  "legalName":     "Deutsche Bank Aktiengesellschaft",
  "lei":           "7LTWFZYICNSX8D621K86",
  "leiStatus":     "ACTIVE",
  "aliases":       ["Deutsche Bank", "DB"],
  "registeredAt":  1747267200
}
```

Returns `404` if the wallet is not registered.

---

## GET /vop/history/:wallet — Audit history

Free. Returns the last 50 VoP checks for a wallet.

```bash
curl https://compliance.untitledfinancial.com/vop/history/0xabc...
```

---

## GET /lei/:lei — LEI lookup

Free. Returns GLEIF data + all wallets registered under a given LEI.

```bash
curl https://compliance.untitledfinancial.com/lei/7LTWFZYICNSX8D621K86
```

---

## POST /register — Register a wallet (admin)

Bearer-authenticated with `ORACLE_SIGNING_KEY`. LEI is optional — omit it to register as `SELF_DECLARED`. Provide it to verify against GLEIF and register as `GLEIF_VERIFIED`.

**Registration types:**

| Type | LEI required | VoP score | Use case |
|---|---|---|---|
| `SELF_DECLARED` | No | Up to 100 (name match) | Self-onboarding without LEI |
| `GLEIF_VERIFIED` | Yes | Up to 100 (LEI match) | Full institutional verification |

You can register as `SELF_DECLARED` now and upgrade to `GLEIF_VERIFIED` later by resubmitting with an LEI.

```bash
# SELF_DECLARED — no LEI required
curl -X POST https://compliance.untitledfinancial.com/register \
  -H "Authorization: Bearer <signing-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0xabc...",
    "legalName":     "Acme Corp",
    "country":       "US",
    "aliases":       ["Acme"]
  }'

# GLEIF_VERIFIED — with LEI
curl -X POST https://compliance.untitledfinancial.com/register \
  -H "Authorization: Bearer <signing-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0xabc...",
    "lei":           "7LTWFZYICNSX8D621K86",
    "legalName":     "Deutsche Bank AG",
    "aliases":       ["Deutsche Bank", "DB"]
  }'
```

---

## DELETE /register/:wallet — Deactivate (admin)

Bearer-authenticated. Marks the registration inactive — does not delete audit records.

---

## GET /.well-known/x402 — Payment discovery

Machine-readable x402 payment requirements for autonomous agents. Call once and cache.

```json
{
  "version": 1,
  "endpoints": {
    "POST /vop/verify": {
      "price":        { "amount": "75000", "currency": "USDC", "decimals": 6 },
      "network":      "base",
      "facilitator":  "https://x402.org/facilitator"
    },
    "POST /stream/open": {
      "variableAmount": true,
      "minUsdc":        0.01,
      "maxUsdc":        10000,
      "unitTypes":      ["second", "token", "call", "byte"],
      "network":        "base",
      "facilitator":    "https://x402.org/facilitator",
      "description":    "Open a streaming micropayment session. Pay upfront for a credit bucket; service ticks units against the balance."
    }
  }
}
```

---

## GET /openapi.json — OpenAPI 3.1 spec

Machine-readable schema.

---

## Compliance coverage

| Regulation | Status |
|---|---|
| FATF R16 (June 2025) | ✅ Satisfied when LEI match or score ≥ 75 |
| SEPA VoP (Oct 2025) | ✅ Name matching + LEI verification |
| EU MiCA Article 68 | ✅ Travel Rule identity verification |
| US GENIUS Act | ✅ Stablecoin transfer identity requirements |
| MiFID II | ✅ Counterparty identity audit trail |

---

## x402 payment (agents)

VoP checks are priced at **$0.075 USDC** per call. The `X-PAYMENT` header carries a base64-encoded payment payload — settlement is verified atomically by the Coinbase x402 facilitator before the result is returned.

Query `/.well-known/x402` to get payment requirements programmatically.

For agents integrated via the [Integration API](/api/integration-api), this cost is bundled into the integration fee — no separate x402 payment required.

---

## AML Oracle

Five compliance layers run before every payment. Internal-only — called by the Integration API; direct access requires `X-Internal-Key`.

### POST /aml/screen

Screen a wallet before settlement. Returns a risk score, risk tier, action, and full signal breakdown.

```bash
curl -X POST https://compliance.untitledfinancial.com/aml/screen \
  -H "X-Internal-Key: <internal-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet":       "0xabc...",
    "counterparty": "0xdef...",
    "amount":       50000,
    "currency":     "USDC",
    "paymentId":    "pay_xyz",
    "direction":    "SEND"
  }'
```

**Response:**

```json
{
  "wallet":      "0xabc...",
  "riskScore":   18,
  "riskTier":    "LOW",
  "action":      "PROCEED",
  "signals":     [],
  "sanctions":   { "hit": false },
  "profile": {
    "maturity":    "ESTABLISHED",
    "txCount":     247,
    "txVolumeAvg": 42000,
    "riskScore":   12
  },
  "paymentId":  "pay_xyz",
  "checkedAt":  1748123456
}
```

**Risk tiers and actions:**

| Score | Tier | Action |
|---|---|---|
| 0–24 | `LOW` | `PROCEED` |
| 25–49 | `MEDIUM` | `PROCEED` |
| 50–74 | `HIGH` | `FLAG` → AI reasoning pass |
| 75–100 | `CRITICAL` | `BLOCK` (immediate) |

Sanctions hit always → `BLOCK` regardless of behavioural score.

**FLAG tier — AI reasoning pass**

When `action` is `FLAG` (riskScore 50–74), the response includes a `reasoning` field from an AI reasoning pass:

```json
{
  "reasoning": {
    "recommendation": "PROCEED_WITH_REVIEW",
    "confidence":     "HIGH",
    "rationale":      "Single marginal signal on a mature wallet with 247 prior transactions. Pattern is not consistent with structuring or layering.",
    "keyFactors":     ["established profile", "single low-severity signal", "no sanctions exposure"],
    "processedAt":    1748123456
  }
}
```

If `recommendation` is `ESCALATE_TO_BLOCK`, `action` is overridden to `BLOCK` in the response. Advisory otherwise.

**Signal weights — autonomous cohort calibration**

Signals are scored using per-cohort weights that calibrate independently based on observed payment data:

| Cohort | Calibration behaviour |
|---|---|
| `UNKNOWN` | +15% across most signals — no prior history |
| `NEW` | +25% across most signals — early caution |
| `DEVELOPING` | Global baseline weights |
| `ESTABLISHED` | −25% velocity, −40% new counterparty, −20% amount anomaly |

Weekly cron adjusts weights via triple-check gate: sample size ≥ 100 global / 25 per cohort, ≥ 20% relative drift, sanctions-correlated signals protected from reduction. Full calibration history in `aml_calibration_log` and `aml_cohort_calibration_log`.

---

### GET /aml/profile/:wallet

Returns the behavioural profile for a wallet — maturity, rolling stats, risk score.

```bash
curl https://compliance.untitledfinancial.com/aml/profile/0xabc... \
  -H "X-Internal-Key: <internal-key>"
```

**Profile maturity:**

| Maturity | Threshold |
|---|---|
| `UNKNOWN` | No prior transactions |
| `NEW` | < 10 transactions |
| `DEVELOPING` | 10–99 transactions |
| `ESTABLISHED` | ≥ 100 transactions |

---

### GET /aml/events/:wallet

Returns the last 50 AML events (WARNING and above) for a wallet.

```bash
curl https://compliance.untitledfinancial.com/aml/events/0xabc... \
  -H "X-Internal-Key: <internal-key>"
```

---

## ESG Scoring

Entity-level ESG scores are computed by the Compliance Oracle and applied automatically on every payment. Direct access is free.

### GET /esg/score/:lei

Returns live E, S, G scores for an entity by LEI. Cache TTL: 7 days.

```bash
# Basic — returns score JSON
curl "https://compliance.untitledfinancial.com/esg/score/7LTWFZYICNSX8D621K86?name=Deutsche+Bank+AG"

# With AI narration — adds plain-language interpretation field
curl "https://compliance.untitledfinancial.com/esg/score/7LTWFZYICNSX8D621K86?name=Deutsche+Bank+AG&narrate=true"
```

**Parameters:**

| Parameter | Required | Description |
|---|---|---|
| `name` | Yes (unless entity is registered) | Legal name — used for regulatory data lookups |
| `country` | No | ISO 2-letter country code (default: `US`) |
| `leiStatus` | No | GLEIF LEI status (default: `ISSUED`) |
| `refresh` | No | `true` to bypass cache and recompute |
| `narrate` | No | `true` to add AI plain-language narration |

**Response:**

```json
{
  "lei":           "7LTWFZYICNSX8D621K86",
  "entityName":    "Deutsche Bank Aktiengesellschaft",
  "composite":     74,
  "environmental": 71,
  "social":        68,
  "governance":    85,
  "feeTier":       "GOOD",
  "feeSurcharge":  0.001,
  "coverage":      "FULL",
  "computedAt":    1748123456,
  "expiresAt":     1748728256,
  "fromCache":     false,
  "narration":     "Deutsche Bank scores 74/100, placing it in the Good tier. Governance is the strongest pillar — active LEI, strong regulatory standing, and a compliant jurisdiction. Environmental and social scores are solid but leave room for improvement, with the social pillar slightly below governance on occupational and labour metrics."
}
```

**ESG fee surcharge tiers:**

| Score | Tier | ESG fee |
|---|---|---|
| 85–100 | `EXCELLENT` | Lowest |
| 70–84 | `GOOD` | Low |
| 50–69 | `AVERAGE` | Moderate |
| 30–49 | `BELOW_AVERAGE` | Elevated |
| 0–29 | `POOR` | Maximum |

**AI narration** (`?narrate=true`) — adds a `narration` string field: 2–3 sentences covering the overall picture, main pillar driver, and any notable risk or strength. ~$0.001 per call, 8s timeout, omitted on failure.

---

### GET /esg/score/wallet/:wallet

Returns the ESG score for a wallet's registered entity. Wallet must be registered with a LEI.

```bash
curl "https://compliance.untitledfinancial.com/esg/score/wallet/0xabc...?narrate=true"
```

Returns `404` if the wallet is not registered or has no LEI.

---

## Beneficial Ownership & PEP Screening

### POST /compliance/ubo-chain

Traverse the GLEIF beneficial ownership chain up to 3 levels (subject → direct parent → ultimate parent), with optional intermediates, and screen every node against the OpenSanctions global sanctions database. Returns FATF R.16 UBO attestation.

```bash
curl -X POST https://compliance.untitledfinancial.com/compliance/ubo-chain \
  -H "Content-Type: application/json" \
  -d '{
    "lei": "7LTWFZYICNSX8D621K86",
    "deep": true
  }'
```

| Field | Type | Description |
|---|---|---|
| `lei` | string | 20-char GLEIF LEI of the subject entity |
| `deep` | boolean | Include intermediate ownership nodes (default false) |

**Response fields:**

| Field | Description |
|---|---|
| `result` | `CLEAR` / `REVIEW_REQUIRED` / `BLOCKED` |
| `chain` | Array of ownership nodes — each with LEI, name, role, jurisdiction, and sanctions screen result |
| `sanctionsMatches` | Matches at OpenSanctions score ≥ 0.70 |
| `fatfAttestation` | FATF R.16 UBO attestation — beneficial owners identified, sanctions status, jurisdiction risk |
| `cachedAt` | KV cache timestamp (24h TTL) |

Results are KV-cached per LEI for 24 hours. Requires re-run after ownership structure changes.

:::note[OpenSanctions licensing]
The OpenSanctions PEP and sanctions datasets require a commercial license for production use. DPX Compliance Oracle includes access under the DPX platform agreement for approved beta partners.
:::

---

### POST /compliance/pep-screen

Screen an individual against the OpenSanctions PEP (Politically Exposed Person) dataset. Required for FATF R.12/13 Enhanced Due Diligence triggers.

```bash
curl -X POST https://compliance.untitledfinancial.com/compliance/pep-screen \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mario Draghi",
    "country": "IT",
    "position": "Former ECB President"
  }'
```

| Field | Type | Description |
|---|---|---|
| `name` | string | Full name of the individual |
| `country` | string | ISO-2 country code (optional — narrows results) |
| `position` | string | Known title or role (optional — used for match confidence) |

**Response fields:**

| Field | Description |
|---|---|
| `riskLevel` | `HIGH` / `MEDIUM` / `LOW` / `NONE` |
| `pepMatches` | Matches at OpenSanctions score ≥ 0.60, with position, country, and match confidence |
| `eddRequired` | true if FATF R.12/13 EDD is triggered |
| `fatfR12` | FATF R.12 attestation |
| `cachedAt` | KV cache timestamp (6h TTL) |

---

## Regulatory Calendar

### GET /compliance/regulatory-calendar

Upcoming and in-effect regulatory obligations across MiCA, SFDR, CSRD, GENIUS Act, and FATF. Static reference updated with each DPX release.

```bash
curl https://compliance.untitledfinancial.com/compliance/regulatory-calendar
```

Returns 16 events with: framework, event name, effective date, jurisdictions, summary, and `dpxAlignment` — the specific DPX feature addressing each obligation.

**Frameworks covered:**

| Framework | Coverage |
|---|---|
| MiCA | Article 45 whitepaper, Article 72 ESG, Article 109 authorisation |
| SFDR | Article 8/9 fund classification, PAI indicators |
| CSRD | Audit trail, double materiality, value chain |
| GENIUS Act | Stablecoin reserve, monthly attestation, VASP registration |

---

## KYA — Know Your Agent

Agent identity layer for the DPX settlement network. KYA maps AI agent actions back to a verifiable legal entity, satisfying FATF R.16 (Travel Rule originator identification) without document collection or manual review queues.

### Compliance model

FATF R.16 requires identifying the *originator* — the human or legal entity instructing a payment. An AI agent is a payment initiation mechanism, not the originator (same as a payment terminal or automated cash management system). The owner entity registered with KYA is the originator. Three registration tiers scale compliance burden with settlement risk:

| Tier | Requirements | Daily cap | Verification |
|---|---|---|---|
| ANONYMOUS | Agent name only | $1K | None — instant |
| REGISTERED | Name + email (self-attested) | $25K | None — instant |
| VERIFIED | Active GLEIF LEI | No platform cap | Automatic GLEIF API lookup — no documents |

**Legal basis:**
- **FATF R.16** — owner entity registration satisfies originator identification requirement
- **MiCA Art. 45 / 72** — LEI explicitly accepted as entity identification
- **GENIUS Act** — business entity attestation + payment stablecoin framework compliance satisfied at REGISTERED+

### POST /agent/register

Register an agent. The tier is determined automatically from the fields provided.

```bash
# ANONYMOUS — instant, no fields required beyond name
curl -X POST https://compliance.untitledfinancial.com/agent/register \
  -H "Content-Type: application/json" \
  -d '{ "name": "procurement-agent-v1", "framework": "custom" }'

# REGISTERED — add ownerEntity + ownerEmail
curl -X POST https://compliance.untitledfinancial.com/agent/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "treasury-agent",
    "ownerEntity": "Acme Corp",
    "ownerEmail": "treasury@acme.com",
    "framework": "custom",
    "protocols": ["x402", "ap2"]
  }'

# VERIFIED — add a GLEIF LEI. DPX calls the public GLEIF API and confirms ACTIVE status.
# No documents. No manual review. LEI issuers (LOUs) have already done identity verification.
curl -X POST https://compliance.untitledfinancial.com/agent/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "treasury-agent",
    "ownerEntity": "Acme Corp",
    "ownerEmail": "treasury@acme.com",
    "ownerLei": "7LTWFZYICNSX8D621K86",
    "framework": "custom",
    "protocols": ["x402", "ap2"],
    "mandate": {
      "maxNotionalUsd": 5000000,
      "dailyCapUsd": 10000000,
      "currencyPairs": ["USD|EUR", "USD|GBP"],
      "esgFloor": 50
    }
  }'
```

**Response (VERIFIED):**
```json
{
  "agentId": "agt_Xy9...",
  "kyaLevel": "VERIFIED",
  "kyaScore": 85,
  "status": "ACTIVE",
  "tierCaps": { "maxNotionalUsd": 5000000, "dailyCapUsd": 10000000 },
  "leiVerified": true,
  "leiEntityName": "Acme Corporation",
  "tierNote": "LEI 7LTWFZYICNSX8D621K86 confirmed ACTIVE via GLEIF. Owner identity verified. No documents required. Institutional caps apply — mandate governs.",
  "mandate": { "mandateId": "mnd_...", "ap2Compatible": true, ... }
}
```

### POST /agent/:id/verify

Returns a signed 1-hour credential with effective spend caps and FATF attestation. Attach as `X-Agent-Credential` header on `/settle` requests.

```bash
curl -X POST https://compliance.untitledfinancial.com/agent/agt_Xy9.../verify
```

```json
{
  "verified": true,
  "kyaLevel": "VERIFIED",
  "kyaScore": 85,
  "credential": {
    "agentId": "agt_Xy9...",
    "issuedAt": 1751299200000,
    "expiresAt": 1751302800000,
    "mandateId": "mnd_...",
    "attestation": {
      "kyaLevel": "VERIFIED",
      "ownerVerified": true,
      "mandateActive": true,
      "fatfCompliant": true,
      "dailyCapUsd": 10000000,
      "maxNotionalUsd": 5000000
    },
    "signature": "HMAC-SHA256 signed, 1h TTL"
  }
}
```

### POST /agent/mandate

Create or update a spend mandate for a REGISTERED or VERIFIED agent. ANONYMOUS agents must upgrade first. REGISTERED agent caps are clamped to the $25K tier limit; VERIFIED agents set their own with no platform ceiling.

```bash
curl -X POST https://compliance.untitledfinancial.com/agent/mandate \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agt_Xy9...",
    "maxNotionalUsd": 500000,
    "dailyCapUsd": 2000000,
    "counterpartyWhitelist": ["7LTWFZYICNSX8D621K86"],
    "esgFloor": 45,
    "ap2Compatible": true
  }'
```

### GET /agent/:id

Retrieve agent record, current KYA level, score, and mandate.

```bash
curl https://compliance.untitledfinancial.com/agent/agt_Xy9...
```

### DELETE /agent/:id

Revoke an agent. Credential verification will return `REVOKED` immediately.

```bash
curl -X DELETE https://compliance.untitledfinancial.com/agent/agt_Xy9...
```

### Upgrading tiers

Tiers upgrade at registration time by providing additional fields. To upgrade an existing agent, re-register — a new `agentId` is issued. The registration response includes a `_next` field explaining the upgrade path when the agent is below VERIFIED.

To obtain a GLEIF LEI for your organization: [gleif.org](https://www.gleif.org/en/lei/search) — LEIs are issued by Local Operating Units (LOUs), typically within 1–3 business days. Many financial institutions can also obtain an LEI on behalf of a client.

---

## POST /vendor-risk — Composite vendor risk score

Single call that runs compliance screening and ESG scoring in parallel and returns a composite 0–100 risk score. Replaces separate calls to `/compliance/screen` and `/esg/score` for vendor onboarding or pre-payment diligence workflows.

```bash
curl -X POST https://compliance.untitledfinancial.com/vendor-risk \
  -H "Content-Type: application/json" \
  -d '{
    "name":    "Berlin Supplier GmbH",
    "lei":     "549300TRUWO2CD2G5692",
    "wallet":  "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "country": "DE",
    "amount":  85000
  }'
```

**Request fields:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Vendor or entity name |
| `lei` | string | No | Legal Entity Identifier (improves accuracy) |
| `wallet` | string | No | On-chain wallet address |
| `country` | string | No | ISO 3166-1 alpha-2 country code |
| `amount` | number | No | Transaction amount in USD (used for context in scoring) |

**Response:**

```json
{
  "vendorRiskScore": 82,
  "riskTier": "LOW",
  "recommendation": "Proceed — low risk. Standard monitoring applies.",
  "entity": { "name": "Berlin Supplier GmbH", "lei": "549300TRUWO2CD2G5692" },
  "breakdown": {
    "complianceScore": 100,
    "esgScore": 74,
    "complianceWeight": 0.65,
    "esgWeight": 0.35
  },
  "compliance": {
    "verdict": "APPROVED",
    "signals": [],
    "sanctions": false,
    "pep": false,
    "fatfBlacklist": false
  },
  "esg": {
    "score": 74,
    "tier": "MODERATE",
    "source": "esg.untitledfinancial.com"
  },
  "generatedAt": "2026-07-02T21:30:00Z",
  "refreshAt": "2026-07-03T21:30:00Z"
}
```

**Risk tiers:**

| Score | Tier | Recommendation |
|---|---|---|
| ≥ 80 | `LOW` | Proceed — standard monitoring |
| 60–79 | `MODERATE` | Proceed with enhanced monitoring |
| 35–59 | `ELEVATED` | Manual review recommended |
| < 35 | `HIGH` | Block or escalate |

**Scoring formula:** `vendorRiskScore = (complianceScore × 0.65) + (esgScore × 0.35)`

Compliance scores: BLOCKED = 0, FLAGGED = 35, APPROVED = 100. Deductions applied for sanctions exposure, PEP linkage, and FATF grey/blacklist status. ESG defaults to 50 (neutral) when no wallet or LEI is supplied.

No API key required. No x402 payment required.

---

## Embeddable widgets

Three self-contained HTML widgets for checkout and onboarding flows. No API key, no backend — paste into any page.

| Widget | URL | What it does |
|---|---|---|
| Sanctions check | `GET /widget/sanctions` | Input a wallet address or entity name — returns APPROVED/FLAGGED/BLOCKED with risk signals |
| ESG score badge | `GET /widget/esg` | Input a company name or LEI — returns score 0–100 with E/S/G breakdown |
| Corridor stability | `GET /widget/corridors` | Displays live OPTIMAL/CAUTION/ADVERSE badges for all USD corridors |

```html
<!-- Sanctions check widget -->
<iframe src="https://compliance.untitledfinancial.com/widget/sanctions"
  width="100%" height="320" style="border:none;border-radius:8px"></iframe>

<!-- Corridor health widget -->
<iframe src="https://stability.untitledfinancial.com/widget/corridors"
  width="100%" height="320" style="border:none;border-radius:8px"></iframe>

<!-- ESG lookup widget -->
<iframe src="https://esg.untitledfinancial.com/widget/esg"
  width="100%" height="360" style="border:none;border-radius:8px"></iframe>
```

Or open each URL directly to preview the standalone HTML before embedding.

| FATF | R.15 (VASP), R.16 (VoP), R.12/13 (PEP/EDD) |
