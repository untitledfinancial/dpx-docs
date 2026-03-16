---
title: Multi-Tenant Setup
description: Deploy DPX settlement intelligence for multiple institutional clients — each with isolated configuration, dedicated monitoring, and white-label reporting.
---

The DPX platform supports multiple institutional clients on a single deployment. Each client operates in a fully isolated environment — independent monitoring thresholds, dedicated notification routing, and white-label reporting identity. One platform, many clients.

---

## How Client Isolation Works

Each client account is identified by a unique API key. When a request is made, the platform resolves the client configuration and:

- Routes alerts and reports to the **client's designated contacts and systems**
- Applies **client-specific monitoring sensitivity** thresholds
- Delivers reports and outreach under the **client's brand identity**
- Keeps all operational data **fully isolated** per client account

Scheduled monitoring runs independently for each active client — oracle health checks, compliance logs, and investor reports each operate on per-client cadences.

---

## Client Configuration

Each client account is configured with the following settings:

**Branding**
- Company name and product name (used in all client-facing outputs)
- Primary contact email

**Monitoring thresholds**
- Peg deviation sensitivity (emergency / high / medium alert levels)
- MiCA Article 36 compliance reporting (on/off)
- Basel III Group classification tracking (on/off)

**Notification preferences**
- Designated channels for protocol operations, sales activity, and investor reporting
- Minimum alert severity (suppresses noise below a defined threshold)

**Sales configuration**
- Target prospect segments
- Outreach sender identity

**Investor reporting**
- Report recipients
- TCFD 4-pillar reporting (on/off)
- Report brand name

---

## Getting Started

To set up a client account, contact [beta@untitledfinancial.com](mailto:beta@untitledfinancial.com). Accounts are provisioned with an API key and initial configuration during onboarding.

---

## Authentication

All platform endpoints (except `/health`) require an API key passed in the request header:

```bash
X-API-Key: your_api_key_here
```

---

## Alert Severity Levels

Each client can set a minimum severity threshold to filter operational noise:

| Severity | Indicator | Typical use |
|---|---|---|
| `ok` | ✅ | Confirmation — outreach sent, compliance pass |
| `low` | 🔵 | Minor informational event |
| `medium` | 🟡 | Anomaly detected, system self-correcting |
| `high` | 🔴 | Stability risk, operator awareness required |
| `emergency` | 🚨 | Critical — peg breach, MiCA violation, halt |

A bank monitoring for compliance purposes might configure `low`. A client that only wants actionable alerts sets `high`.

---

## Data Isolation

All operational data — protocol snapshots, decision history, prospect records, and relationship data — is fully isolated per client. No client can access another client's data.
