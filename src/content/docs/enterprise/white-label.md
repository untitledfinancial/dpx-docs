---
title: White-Label Configuration
description: Deploy DPX settlement intelligence under your institution's brand — monitoring reports, investor communications, and client-facing outputs carry your identity.
---

Every client-facing output from the DPX platform can be delivered under the licensing institution's brand. The underlying protocol logic, ESG oracle scoring, and settlement rails remain unchanged — the presentation layer adapts to each client's identity.

---

## What Gets Branded

| Output | Example |
|---|---|
| Operational alerts and reports | Sender identity reflects your institution's product name |
| Investor pulse reports | Report header carries your brand and contact details |
| Prospect outreach | Sent from your designated sender name and email address |
| Deal room responses | AI-assisted answers are attributed to your treasury intelligence product |

---

## Configuration

Brand identity is set during account provisioning and can be updated at any time:

- **Company name** — legal name used in formal and compliance contexts
- **Product name** — appears in all operational outputs and client communications
- **Contact email** — primary contact for investor reports and outreach replies
- **Outreach sender name** — name shown in prospect outreach email headers
- **Report title** — header for weekly investor pulse reports

---

## Notification Delivery

Operational alerts and reports route to your institution's designated contact systems. Supported delivery includes standard webhook integrations and email. Delivery configuration is handled during onboarding — contact [beta@untitledfinancial.com](mailto:beta@untitledfinancial.com).

---

## Human Oversight and Escalation

The DPX platform is designed for human-in-the-loop operations. Monitoring surfaces signals and flags conditions for review — material decisions and escalations are routed to designated human operators at defined thresholds.

| Severity | Response |
|---|---|
| Low / Medium | Logged and surfaced for operator review |
| High | Flagged to designated operators for assessment |
| Emergency | Immediate operator notification; operations suspended pending human decision |

Your institution maintains full oversight and a complete audit trail over all DPX-related decisions.

---

## What Is Not Configurable

The following are protocol-level properties and cannot be modified by individual clients:

- ESG Oracle scoring methodology and weighting model (proprietary IP)
- Settlement fee formula and on-chain enforcement
- Smart contract addresses and Base mainnet deployment
- MiCA Article 36 reserve thresholds (regulatory requirement)
- ESG fee redistribution program allocations (on-chain governance only)

---

## Licensing

White-label deployment is available to approved institutional partners under a license agreement.

[Request access →](mailto:beta@untitledfinancial.com)
