---
title: DPX Intelligence — Agent Use Cases and Signal Guide
description: What enterprise agents use DPX Intelligence signals for, which endpoints answer which autonomous decisions, and how agents pay for them via x402 on Base mainnet.
---

DPX Intelligence is a signal API built for autonomous agents embedded in enterprise products. The caller is always software — a treasury automation agent, a procurement system, an AP pipeline, a risk platform — making decisions in production without a human in the loop.

Agents pay micropayments via x402 to access structured intelligence on macro conditions, climate systems, FX corridors, cascade risk, supply chain stress, sovereign debt, and more. The entire flow — 402 response, EIP-3009 signature, payment verification, signal delivery — is machine-to-machine. No human reviews the payment. No human interprets the response. The agent acts on it directly.

No account, no API key, no subscription. Each signal purchase is a discrete USDC payment on Base mainnet, initiated and completed by the agent.

**DPX Intelligence is a separate product from DPX Settlement.** Signals can be embedded in any enterprise agent product — payment routing, procurement automation, vendor risk assessment, portfolio monitoring, ESG reporting pipelines. The agent does not need to use DPX Settlement to use DPX Intelligence.

---

## What enterprise agents use these signals for

Enterprise agents are embedded in systems that execute consequential decisions at scale: releasing vendor payments, routing cross-border transfers, approving procurement, flagging counterparty risk, generating ESG disclosures. These decisions used to require a risk analyst. With DPX Intelligence, the agent handles them autonomously.

The agent's product logic calls a signal endpoint, receives structured JSON, and branches based on the response — hold the payment, proceed, reduce notional, escalate to a human queue, or update a client-facing report. No human is involved in that loop unless the agent's own policy routes to one.

DPX Intelligence gives enterprise agents the machine-readable equivalent of what a risk desk would assemble: macro regime, corridor stability, counterparty jurisdiction risk, cascade simulation, supply chain pressure, climate exposure. Each signal is purpose-built to answer a specific class of autonomous decision.

---

## Signal use cases by decision type

### "Should this payment proceed right now?"

**Endpoint:** `macro-stress` ($0.15)

Your agent is running in an AP automation or treasury product. Before it releases a large payment, it needs to know whether the current macro environment makes that safe. A STABLE regime means normal conditions — the agent proceeds. ELEVATED_RISK (widening HY spreads, elevated VIX, TED spread stress) means the agent holds, reduces notional, or routes to a human approval queue per its policy. CRISIS means the agent halts all non-critical payments and waits for regime change.

```json
→ { "regime": "ELEVATED_RISK", "score": 72,
    "drivers": ["HY spread widening", "TED spread 38bps"],
    "recommendation": "Proceed with caution — monitor credit spreads" }
```

**When to call:** at the start of every payment evaluation above a threshold defined in your agent's policy. Typically the first signal your agent buys — cheapest, broadest coverage, answers the go/no-go question before buying anything else.

---

### "Is this cross-border corridor safe right now?"

**Endpoint:** `fx-settlement` ($0.25)

Your agent is routing a cross-border payment in a treasury or FX product. It needs to know whether the corridor is stable, liquid, and executing at expected cost — before committing. High volatility or thin liquidity means the net received amount is uncertain; the agent may delay, split the payment, or choose an alternate corridor. The signal returns 24h volatility, corridor stability classification, execution risk, and the optimal execution window.

```json
→ { "corridor": "USD/EUR", "stability": "CAUTION",
    "executionRisk": "MODERATE", "volatility24h": "0.41%",
    "recommendation": "Execute before NY close — liquidity thins after 4pm ET" }
```

**When to call:** before every cross-border payment your agent routes. Combine with `sovereign-debt` for EM destinations.

---

### "Is this counterparty's jurisdiction stable?"

**Endpoint:** `sovereign-debt` ($0.25)

Your agent is processing a payment to an emerging market counterparty in a procurement or vendor management product. Before releasing funds, it needs the sovereign risk profile of that jurisdiction — rollover stress, DSA flags, fiscal trajectory. High sovereign risk means the counterparty faces funding pressure that increases the probability of delayed delivery or disputed terms. Your agent uses this to shorten payment terms, require escrow, or flag the payment for review.

```json
→ { "riskTier": "HIGH", "score": 81,
    "flags": ["Debt rollover stress Q3", "IMF program active", "FX reserves declining"],
    "recommendation": "EM counterparty under sovereign pressure — shorten payment terms" }
```

**When to call:** before paying any EM counterparty, before your agent extends Net 30/60/90 terms, or when the counterparty's jurisdiction is material to delivery risk.

---

### "If this payment fails, what breaks?"

**Endpoint:** `cascade` ($0.75)

Your agent is executing a strategically important payment in a treasury or settlement product — large notional, critical vendor, or the first payment in a chain where downstream counterparties are waiting. Before releasing, your agent needs to know the blast radius if it fails. The cascade simulation models failure propagation: how many counterparties are affected, at what depth, and with what probability. Your agent uses this to decide whether to proceed, require escrow, stagger the payment, or hold pending confirmation.

```json
→ { "cascadeRisk": "MODERATE", "failureProbability": 0.12,
    "cascadeDepth": 3, "affectedCounterparties": 7,
    "recommendation": "Proceed but hold escrow — moderate downstream exposure" }
```

**When to call:** when your agent classifies a payment as strategic or high-dependency. Most expensive signal — wire it into the payment policy for payments above a defined notional threshold, not every payment.

---

### "Will this vendor deliver, given current supply chain stress?"

**Endpoint:** `supply-chain` ($0.25)

Your agent is running inside a procurement or vendor management product. Before it approves a vendor payment, it needs to know whether current supply chain conditions make timely delivery probable. Elevated pressure — semiconductor shortages, logistics backlogs, port congestion — increases the risk that a paid vendor cannot perform on schedule. Your agent uses this to adjust payment terms, require delivery milestones before releasing funds, or flag the vendor for manual review.

```json
→ { "pressureIndex": 68, "regime": "ELEVATED",
    "hotspots": ["Semiconductor: lead times +6 weeks", "APAC port congestion"],
    "recommendation": "Tech vendor payment acceptable — build in delivery buffer" }
```

**When to call:** before your agent approves any payment to a tech, manufacturing, or goods vendor. Pair with `shipping-stress` when the goods have to physically move.

---

### "Is this shipment-linked invoice safe to pay?"

**Endpoint:** `shipping-stress` ($0.25)

Your agent is processing invoices in an AP automation product. When an invoice is tied to physical goods, your agent needs to know whether those goods are actually in transit before releasing payment. Elevated shipping stress — route disruptions, port congestion, rerouting — means the goods may not arrive on the expected schedule. Your agent uses this to hold payment pending delivery confirmation, extend terms, or trigger a delivery status check before proceeding.

```json
→ { "globalStress": "HIGH", "score": 74,
    "hotspots": ["Red Sea rerouting: +10 days avg", "Rotterdam congestion: 4d delay"],
    "invoiceDelayRisk": "ELEVATED — verify delivery before payment release" }
```

**When to call:** before your agent releases payment on any goods-linked invoice, or when evaluating whether to extend payment terms due to delivery uncertainty.

---

### "What's driving this period of instability?"

**Endpoint:** `instability` ($0.35)

Your agent already knows conditions are elevated from `macro-stress`. Now it needs to understand the cause — because different drivers call for different product responses. A monetary policy driver means your agent should shorten payment durations. A geopolitical driver means your agent should flag EM counterparties in affected corridors. A commodity shock means your agent should reassess goods-linked invoices. The driver determines which part of your agent's policy tree executes.

```json
→ { "primaryDriver": "MONETARY_POLICY", "confidence": 0.83,
    "narrative": "Fed trajectory uncertainty driving term premium widening",
    "recommendation": "Shorten duration exposure — policy path remains unclear" }
```

**When to call:** when `macro-stress` returns ELEVATED_RISK or CRISIS and your agent's policy tree branches differently based on the cause.

---

### "Are these elevated signals independent or correlated?"

**Endpoint:** `resonance` ($0.50)

Your agent has purchased multiple signals and several are elevated. Before it applies additive risk logic — treating each signal as an independent risk — it needs to know whether they're actually moving together. When macro stress, FX volatility, and sovereign pressure are phase-aligned, the environment warrants heightened caution: this is systemic, not idiosyncratic. Your agent uses resonance to decide whether to compound its policy responses or treat them independently.

```json
→ { "phaseAlignment": "HIGH", "alignedSignals": ["macro-stress", "fx-settlement", "sovereign-debt"],
    "interpretation": "Correlated stress — systemic event probability elevated",
    "recommendation": "Treat concurrent signals as amplified, not independent" }
```

**When to call:** when your agent has purchased multiple signals and two or more are simultaneously elevated. Determines whether your agent's policy compounds the responses or treats each signal in isolation.

---

### "What's the highest-risk event in the current window?"

**Endpoint:** `butterfly` (POST, $0.50)

Your agent runs a scheduled risk review — daily, weekly — for a treasury or risk management product. It needs to identify the single event with the highest cascade potential in the current window: the one that, if it triggers, will have the widest downstream effect on your client's payment exposure. Your agent uses this to reschedule batch payments, reduce large-notional exposure ahead of the event, or generate a risk brief for the client's dashboard.

```json
→ { "event": "Fed FOMC decision", "cascadePotential": "HIGH",
    "probability": 0.34, "affectedCorridors": ["USD/EM", "USD/EUR"],
    "recommendation": "Reduce large payment exposure before Thursday 2pm ET" }
```

**When to call:** on your agent's scheduled risk review cycle, before it releases a batch of large payments, or when it needs to prioritize which risk to act on across a client portfolio.

---

### "What are the climate risks affecting this counterparty or sector?"

**Endpoint:** `climate` ($0.15) · `climate-pulse` ($0.25) · `earth-systems` ($0.25)

Your agent is embedded in a product serving clients with physical-world exposure — agricultural procurement, energy sector payments, real estate, or any supply chain tied to climate-sensitive geographies. Before releasing payment to a counterparty in an affected region, your agent needs to know whether current climate conditions create delivery risk or operational disruption. `earth-systems` provides the structural picture — ENSO phase, ocean heat content, arctic conditions — that your agent uses for longer-horizon decisions. `climate-pulse` provides the 30-day event density your agent uses for near-term scheduling.

```json
→ { "temperatureAnomaly": "+1.6°C", "droughtIndex": "SEVERE",
    "wildfireRisk": "ELEVATED — western US and southern EU",
    "recommendation": "Agricultural counterparties in affected regions: elevated delivery risk" }
```

**When to call:** before your agent pays any agricultural, energy, or real estate sector counterparty; or when your agent is generating SFDR/CSRD ESG-linked transaction data for a client.

---

### "What's the biodiversity and nature risk for this counterparty?"

**Endpoint:** `biodiversity` ($0.25)

Your agent is running inside an ESG reporting or compliance product for an institutional client with SFDR Article 8/9 obligations. Before it records a payment, it needs to assess TNFD and SFDR PAI 7 exposure for the counterparty. Your agent uses this to populate the client's mandatory sustainability disclosure, flag counterparties that require enhanced due diligence, or apply the appropriate ESG fee tier.

```json
→ { "tnfdRisk": "MODERATE", "paiScore": 42,
    "drivers": ["Deforestation exposure: palm oil supply chain", "Water stress: SEA operations"],
    "recommendation": "Disclose PAI 7 flag — SFDR Article 8/9 reporting required" }
```

**When to call:** before your agent records any payment for a client with SFDR/CSRD obligations, or when counterparty nature-risk disclosure is required by the client's mandate.

---

### "Does this counterparty's jurisdiction require a gender risk disclosure?"

**Endpoint:** `gender-risk` ($0.50)

Your agent is processing a payment for a client whose ESG mandate requires gender risk assessment by counterparty jurisdiction. Before recording the transaction, your agent needs GBV prevalence, female labor force participation gaps, and legal barrier data for the destination jurisdiction — structured for disclosure. The signal returns a suppression risk score and an opportunity score for reform upside, across 18 countries.

```json
→ { "gbvRiskScore": 71, "opportunityScore": 38,
    "jurisdiction": "PK",
    "drivers": ["GBV prevalence 28%", "Female LFPR 21%", "WBL index 46/100"],
    "recommendation": "Elevated gender risk — flag for ESG reporting and client disclosure" }
```

**When to call:** when your agent is processing payments for clients with gender-lens ESG mandates, or when the destination jurisdiction is in scope for gender risk disclosure under your client's reporting requirements.

---

## Which signals to combine

| Agent task | Signals to buy | Total cost |
|---|---|---|
| Large domestic payment | `macro-stress` | $0.15 |
| Cross-border developed market | `macro-stress` + `fx-settlement` | $0.40 |
| Cross-border EM counterparty | `macro-stress` + `fx-settlement` + `sovereign-debt` | $0.65 |
| Goods-linked invoice | `supply-chain` + `shipping-stress` | $0.50 |
| Strategic or high-dependency payment | `macro-stress` + `cascade` | $0.90 |
| Full risk picture, stressed environment | `macro-stress` + `instability` + `resonance` | $1.00 |
| ESG-mandated client, EM counterparty | `sovereign-debt` + `biodiversity` + `gender-risk` | $1.00 |
| Weekly risk review | `butterfly` + `macro-stress` | $0.65 |

---

## x402 payment flow

The entire flow is machine-to-machine. Your agent's product code executes every step — no human approves the payment, no human is in the loop between the signal request and the response.

```
1. Your agent calls the endpoint
   GET /v1/intelligence/macro-stress

2. Server: 402 Payment Required
   { "x402Version": 2, "accepts": [{
     "amount": "150000",       ← $0.15 USDC (6 decimals)
     "asset": "0x8335...",     ← USDC on Base mainnet
     "payTo": "0x160e...",     ← DPX fee collector
     "network": "eip155:8453"
   }]}

3. Your agent signs EIP-3009 TransferWithAuthorization
   using its funded wallet private key (set once at deploy)
   → X-Payment: <signed token>

4. Your agent retries with X-Payment header
   → 200: { regime: "ELEVATED_RISK", score: 72, ... }

5. Your agent acts on the response — no human involved
```

The private key is a one-time deployment configuration. After that, your agent handles all payments autonomously — including during off-hours, high-volume batch runs, and scheduled risk reviews.

## Buying a signal — Python

```python
import httpx, json, time, os
from eth_account import Account
from eth_account.messages import encode_structured_data

INTEL     = "https://intelligence.untitledfinancial.com"
AGENT_KEY = os.environ["AGENT_PRIVATE_KEY"]  # funded Base wallet, set once at deploy

def buy_intelligence(endpoint: str) -> dict:
    url = f"{INTEL}{endpoint}"
    r   = httpx.get(url)
    if r.status_code == 200:
        return r.json()
    if r.status_code != 402:
        raise RuntimeError(f"Unexpected {r.status_code}")

    acpt         = r.json()["accepts"][0]
    amount       = int(acpt["amount"])
    pay_to       = acpt["payTo"]
    asset        = acpt["asset"]
    account      = Account.from_key(AGENT_KEY)
    valid_after  = int(time.time()) - 10
    valid_before = int(time.time()) + 300
    nonce        = os.urandom(32).hex()

    signed = account.sign_message(encode_structured_data({
        "types": {
            "EIP712Domain": [
                {"name": "name",              "type": "string"},
                {"name": "version",           "type": "string"},
                {"name": "chainId",           "type": "uint256"},
                {"name": "verifyingContract", "type": "address"},
            ],
            "TransferWithAuthorization": [
                {"name": "from",        "type": "address"},
                {"name": "to",          "type": "address"},
                {"name": "value",       "type": "uint256"},
                {"name": "validAfter",  "type": "uint256"},
                {"name": "validBefore", "type": "uint256"},
                {"name": "nonce",       "type": "bytes32"},
            ],
        },
        "primaryType": "TransferWithAuthorization",
        "domain": {"name": "USD Coin", "version": "2", "chainId": 8453, "verifyingContract": asset},
        "message": {
            "from": account.address, "to": pay_to, "value": amount,
            "validAfter": valid_after, "validBefore": valid_before,
            "nonce": bytes.fromhex(nonce),
        },
    }))

    x_payment = json.dumps({
        "x402Version": 2, "scheme": "exact", "network": "eip155:8453",
        "payload": {
            "signature": signed.signature.hex(),
            "from": account.address, "to": pay_to, "value": str(amount),
            "validAfter": str(valid_after), "validBefore": str(valid_before),
            "nonce": "0x" + nonce,
        },
    })

    r2 = httpx.get(url, headers={"X-Payment": x_payment})
    r2.raise_for_status()
    return r2.json()


# Agent logic: buy what's relevant, act on the response
macro = buy_intelligence("/v1/intelligence/macro-stress")
if macro["regime"] == "CRISIS":
    agent.halt_all_payments()
elif macro["regime"] == "ELEVATED_RISK":
    agent.reduce_payment_threshold(factor=0.5)
# else: STABLE — proceed normally
```

## Signal response format

All endpoints return a consistent base structure:

```json
{
  "regime":         "ELEVATED_RISK",
  "score":          72,
  "confidence":     0.87,
  "drivers":        ["HY spread widening", "TED spread 38bps"],
  "recommendation": "...",
  "outlook":        "...",
  "updatedAt":      "2026-07-25T14:00:00Z",
  "horizon":        "30d"
}
```

Endpoint-specific fields are added on top — `cascadeDepth` and `failureProbability` for cascade; `riskTier` and `flags` for sovereign debt; `gbvRiskScore` and `opportunityScore` for gender-risk.

## Free oracle feeds

These 11 feeds require no x402 payment and are suitable for high-frequency polling:

`systemic-risk` · `us-instability-score` · `fiscal-dominance-risk` · `co2-ppm` · `temperature-anomaly` · `macro-stress-index` · `arctic-sea-ice` · `supply-chain-pressure` · `grid-carbon-intensity` · `energy-transition-score` · `earth-health-index`

```bash
curl https://intelligence.untitledfinancial.com/v1/oracle/macro-stress-index
```

## Webhooks — event-driven agents

Rather than polling, agents can register to receive signals on event:

```bash
POST /intelligence/subscribe
{ "event": "butterfly", "url": "https://your-agent/webhook", "secret": "hmac-secret" }
```

HMAC-signed delivery with 3× retry. Available for: `butterfly`, `aftershock`, regime change.

## Wallet setup

Your agent's wallet must hold USDC on Base mainnet (chainId 8453) and a small ETH balance for gas. No registration, no KYC, no whitelisting. Any funded Base wallet works.

Set `AGENT_PRIVATE_KEY` once as a deployment secret — your agent reads it at startup and uses it for all x402 payments autonomously. For enterprise deployments, use a dedicated agent wallet funded via automated top-up rather than a shared hot wallet.

## Related

- [Intelligence API reference](/api/intelligence-api) — complete endpoint documentation with response schemas
- [x402 protocol](/integrations/x402) — how machine-to-machine payments work on Base
- [DPX Settlement](/agent-quickstart) — the separate settlement product, for agents that execute payments
- [Anthropic cookbook](https://github.com/anthropics/anthropic-cookbook/tree/main/third_party/DPX) — `intelligence_gated_settlement.ipynb` — runnable notebook
