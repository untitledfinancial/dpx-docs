---
title: European Institution Quickstart
description: Getting DPX running for European banks, asset managers, and corporate treasuries — ISO 20022, EURC settlement, SFDR ESG data, and MiCA compliance.
---

This guide covers the fastest path to a working DPX integration for European institutions — banks, asset managers, insurance companies, and corporate treasuries operating under EU and UK regulatory frameworks.

---

## What European institutions get from DPX

| Capability | What it provides |
|---|---|
| **ISO 20022 native** | pain.001 in, pacs.002 out — no format translation required |
| **EURC settlement** | EUR-denominated on-chain settlement, no FX exposure for EUR flows |
| **SFDR ESG data** | PAI indicators per transaction, Article 8/9 compatibility flags |
| **MiCA compliance** | Settlement rail and asset (EURC) both MiCA-compliant |
| **AML6 compliance** | AML Oracle: sanctions screening, behavioural profiling, FATF R16 VoP |
| **CSRD audit trail** | Immutable on-chain records, external auditor verifiable |
| **Kyriba connector** | Native SPI for Kyriba-using treasury teams |
| **SAP TRM** | Direct integration via SAP Integration Suite |

---

## Step 1 — Run a preflight check (no auth required)

Before any setup, verify DPX is accessible and the oracle is healthy:

```bash
# Protocol manifest — capabilities, contracts, oracle status
curl https://api.untitledfinancial.com/manifest

# Oracle health — stability score, settlement gate
curl https://api.untitledfinancial.com/reliability

# ESG preflight for your counterparty (LEI required)
curl "https://esg.untitledfinancial.com/esg-score?lei=YOUR_COUNTERPARTY_LEI"

# Fee quote — EUR 250K, cross-border with FX
curl "https://api.untitledfinancial.com/quote?amountUsd=280000&hasFx=false&esgScore=74"
```

---

## Step 2 — Choose your integration path

### Option A — Kyriba (recommended for treasury teams)

If your institution uses Kyriba as its TMS, DPX integrates as a certified Kyriba Connect Marketplace connector. Your treasury team initiates payments from Kyriba's existing interface — no new systems required.

1. Submit a Kyriba SPI test payment to confirm API compatibility:
```bash
curl -X GET https://integration.untitledfinancial.com/bank-connectivity/payment-initiation/v1/banks
```
2. Run sandbox payment flows — see [Kyriba Integration](/integrations/kyriba)
3. Request Kyriba marketplace certification — contact DPX for the process

### Option B — SAP TRM

For institutions running SAP Treasury & Risk Management, DPX connects via SAP Integration Suite or direct ABAP. See [SAP TRM Integration](/integrations/sap-trm).

### Option C — Direct REST API (pain.001)

For any TMS or in-house system already generating ISO 20022:

```bash
curl -X POST https://integration.untitledfinancial.com/payments/initiate \
  -H "Authorization: Bearer <institution-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "tmsReference":   "YOUR-REF-2026-001",
    "amount":         "250000.00",
    "currency":       "EUR",
    "settlementAsset": "EURC",
    "creditor": {
      "name":          "Recipient Entity GmbH",
      "lei":           "529900ODI3047E2LIV03",
      "walletAddress": "0x..."
    },
    "debtor": {
      "name": "Your Institution",
      "lei":  "YOUR_LEI"
    }
  }'
```

### Option D — MCP (AI-assisted treasury)

For teams using Claude or other MCP-compatible AI assistants:

```
# Add to Claude Desktop config
{
  "mcpServers": {
    "dpx": {
      "command": "npx",
      "args": ["-y", "@untitledfinancial/dpx-mcp"]
    }
  }
}
```

Then in Claude: *"Get a fee quote for EUR 250,000 cross-border settlement with LEI 529900ODI3047E2LIV03"*

---

## Step 3 — ESG preflight for SFDR compliance

Before settlement, retrieve the counterparty's ESG profile for SFDR PAI indicator disclosure:

```bash
GET https://esg.untitledfinancial.com/esg-score?lei=529900ODI3047E2LIV03
```

Response includes:
- Composite E/S/G scores
- SFDR PAI indicators (GHG emissions, carbon footprint, social violations, gender diversity)
- Article 8/9 compatibility flags
- Settlement surcharge rate

Store the `sfdr` block as a source record for your SFDR product-level PAI disclosure. See [SFDR & CSRD Compliance](/protocol/sfdr-csrd) for full field mapping.

---

## Step 4 — Execute settlement

Once preflight passes and ESG data is captured:

```bash
# EUR-to-EUR (no FX fee)
POST /payments/initiate
{
  "amount": "250000.00",
  "currency": "EUR",
  "settlementAsset": "EURC",
  ...
}

# EUR-to-USD (FX fee applies)
POST /payments/initiate
{
  "amount": "250000.00",
  "currency": "EUR",
  "settlementAsset": "USDC",
  ...
}
```

The response includes:
- `txHash` — Base mainnet transaction, verifiable on Basescan
- `esg` block — E/S/G scores and SFDR PAI indicators at settlement time
- `compliance` block — FATF R16, MiCA, AML status
- `pacs.002` — ISO 20022 settlement confirmation

---

## Step 5 — Compliance records

For regulatory purposes, every DPX settlement produces three auditable records:

| Record | How to access | Regulatory use |
|---|---|---|
| On-chain settlement | `txHash` on [Basescan](https://basescan.org) | External audit, proof of settlement |
| VoP attestation | `DPXVerificationOfPayee` contract on Base | FATF R16, AML6, Travel Rule |
| ESG at settlement time | `GET /vop/history/:wallet` | SFDR/CSRD PAI disclosure, CSRD audit |

---

## Regulatory coverage

| Framework | Coverage |
|---|---|
| **MiCA** (EU) | Settlement rail + EURC asset — both MiCA-compliant |
| **SFDR** (EU) | PAI indicators per transaction, Article 8/9 flags |
| **CSRD** (EU) | Double materiality data, ESRS-mapped fields |
| **AML6** (EU) | Behavioural profiling, sanctions screening, 24h cache |
| **FATF R16** | VoP on every payment — on-chain attestation |
| **FCA** (UK) | See [Regulatory Positioning](/protocol/regulatory) |
| **Travel Rule** | IVMS 101 records for payments ≥ $3,000 / €3,000 |

---

## Sandbox environment

All endpoints are available in sandbox mode — no USDC/EURC required. Settlement calls return simulated pacs.002 confirmations with realistic data.

```bash
# Sandbox flag is set server-side — no config required
# ESG, compliance, and oracle calls are always live
# Settlement execution is simulated until executor wallet is funded
```

---

## Get access

To receive an institution API key and begin integration testing:

- Apply via the [beta access page](/beta)
- Or request Kyriba marketplace certification directly through your Kyriba account manager

---

## Further reading

- [SFDR & CSRD Compliance](/protocol/sfdr-csrd)
- [EURC Settlement](/integrations/eurc)
- [SWIFT Compatibility](/integrations/swift)
- [Kyriba Integration](/integrations/kyriba)
- [SAP TRM Integration](/integrations/sap-trm)
- [Regulatory Positioning](/protocol/regulatory)
