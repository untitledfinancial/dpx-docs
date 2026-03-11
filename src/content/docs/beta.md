---
title: Beta Access
description: DPX is in beta. Pricing, ESG scoring, and stability monitoring are fully live. Request access to settlement execution and join the waitlist for early institutional partners.
---

import { Card, CardGrid } from '@astrojs/starlight/components';

DPX is currently in **private beta**. The pricing, ESG, and stability APIs are fully live and require no signup. Settlement execution on Base mainnet is available for vetted early partners while the protocol is finalized.

## What's live right now — no signup needed

<CardGrid>
  <Card title="Stability Oracle" icon="approve-check">
    Live stability scores, peg monitoring, 6-tier oracle. GET /reliability, /quote, /verify-fees — available now at no cost.
  </Card>
  <Card title="ESG Scoring" icon="approve-check">
    Live E, S, G scores from 6 institutional data sources. GET /esg-score — available now.
  </Card>
  <Card title="Fee Quotes" icon="approve-check">
    Exact fee breakdowns with quoteId. Works with sandbox=true for testing without settlement.
  </Card>
  <Card title="MCP / Agent APIs" icon="approve-check">
    Claude Desktop, ChatGPT Actions, LangChain, n8n — all integrations fully documented and usable today.
  </Card>
</CardGrid>

## Try it now — sandbox mode

All pricing endpoints support `?sandbox=true`. You get real fee calculations with clearly labelled mock settlement data. No wallet, no token, no contract needed.

```bash
# Get a real quote in sandbox mode
curl "https://stability.untitledfinancial.com/quote?amountUsd=1000000&hasFx=true&esgScore=75&sandbox=true"

# Get live ESG score (always live, no sandbox flag needed)
curl "https://esg.untitledfinancial.com/esg-score"

# Check stability before a settlement
curl "https://stability.untitledfinancial.com/reliability"
```

## What requires beta access

- **On-chain settlement execution** via `DPXSettlementRouter` on Base mainnet
- **Whitelisted settlement wallet** setup
- **Volume discount tier** assignment
- **ESG redistribution receipts** for your settlements

## Request beta access

Fill out the form below or email directly. We prioritise:

1. **AI agent frameworks** integrating DPX as a settlement primitive
2. **Fintechs** embedding cross-border settlement in their products
3. **Asset managers** wanting on-chain ESG audit trails
4. **Sovereign / institutional** treasuries needing programmable settlement rails

**Jurisdictions:** Currently onboarding partners operating under US (FinCEN/OCC), UK (FCA), and EU (MiCA) regulatory frameworks.

---

<div style="max-width: 520px; margin: 2rem 0; padding: 2rem; background: var(--sl-color-bg-sidebar); border-radius: 12px; border: 1px solid var(--sl-color-hairline);">

**Request Beta Access**

Send your request to **beta@untitledfinancial.com** with:

- Your name and organization
- Use case (what you're building or settling)
- Estimated monthly volume
- Integration type (AI agent, fintech embed, institutional treasury)

**Response time:** 1–2 business days

</div>

---

## While you wait

Everything you need to integrate is already live:

- [Agent Quick Start](/agent-quickstart) — the full 5-step settlement loop with sandbox mode
- [Stability Oracle API](/api/stability-oracle) — all endpoints, parameters, response examples
- [ESG Oracle API](/api/esg-oracle) — ESG scoring and redistribution detail
- [MCP — Connect Claude](/integrations/mcp) — Claude Desktop native integration
- [GPT Actions](/integrations/gpt-actions) — ChatGPT Custom GPT setup

## Roadmap to mainnet

| Milestone | Status |
|---|---|
| Stability Oracle v6.0 (25+ sources, cross-body, policy manager) | ✅ Live |
| ESG Oracle (6 institutional sources, redistribution) | ✅ Live |
| Agent integrations (MCP, GPT Actions, LangChain, n8n) | ✅ Live |
| Documentation site | ✅ Live |
| Storacha verifiable audit trail | ✅ Live |
| DPXSettlementRouter deployment | 🔄 In progress |
| Beta partner settlement testing | 🔄 Accepting applications |
| Public mainnet launch | 📅 TBD |
