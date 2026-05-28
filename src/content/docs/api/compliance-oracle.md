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

| Score | Tier | Settlement surcharge |
|---|---|---|
| 85–100 | `EXCELLENT` | +0.00% |
| 70–84 | `GOOD` | +0.10% |
| 50–69 | `AVERAGE` | +0.25% |
| 30–49 | `BELOW_AVERAGE` | +0.40% |
| 0–29 | `POOR` | +0.50% |

**AI narration** (`?narrate=true`) — adds a `narration` string field: 2–3 sentences covering the overall picture, main pillar driver, and any notable risk or strength. ~$0.001 per call, 8s timeout, omitted on failure.

---

### GET /esg/score/wallet/:wallet

Returns the ESG score for a wallet's registered entity. Wallet must be registered with a LEI.

```bash
curl "https://compliance.untitledfinancial.com/esg/score/wallet/0xabc...?narrate=true"
```

Returns `404` if the wallet is not registered or has no LEI.
