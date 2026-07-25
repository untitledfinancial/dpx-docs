---
title: DPX Intelligence — Agent Use Cases and Signal Guide
description: Why autonomous agents pull DPX Intelligence signals, which endpoints answer which decisions, and how to pay for them via x402 on Base mainnet.
---

DPX Intelligence is a signal API for autonomous agents. Agents pay micropayments via x402 to access structured intelligence on macro conditions, climate systems, FX corridors, cascade risk, supply chain stress, sovereign debt, and more — then act on the response without human involvement.

No account, no API key, no subscription. Each signal purchase is a discrete USDC payment on Base mainnet, made and verified entirely by the agent.

**DPX Intelligence is a separate product from DPX Settlement.** Signals can be used for any agent decision — payment routing, procurement, risk assessment, portfolio analysis, vendor evaluation, or research. An agent does not need to use DPX Settlement to use DPX Intelligence.

---

## Why agents pull these signals

Autonomous agents make decisions that previously required a human analyst: should we pay this counterparty now or wait? Is this corridor safe for a large transfer? What's the cascade risk if this payment fails? Does this vendor operate in a high-risk jurisdiction?

DPX Intelligence gives agents the same structured, machine-readable context that a risk analyst would assemble — delivered as a 402-gated API call, paid in USDC, returned as structured JSON the agent can reason about directly.

Each signal addresses a specific class of agent decision.

---

## Signal use cases by decision type

### "Should this payment proceed right now?"

**Endpoint:** `macro-stress` ($0.15)

An agent executing a large payment needs to know whether the current macro environment is safe for large cash movements. A STABLE regime means normal conditions — proceed. ELEVATED_RISK means widening credit spreads, elevated VIX, TED spread stress — the agent may hold, reduce notional, or escalate for review. CRISIS means the agent should halt and wait.

```json
→ { "regime": "ELEVATED_RISK", "score": 72,
    "drivers": ["HY spread widening", "TED spread 38bps"],
    "recommendation": "Proceed with caution — monitor credit spreads" }
```

**When to call:** before any payment above a threshold the agent's policy defines. Typically the first signal an agent buys — cheapest, broadest signal, highest coverage.

---

### "Is this cross-border corridor safe right now?"

**Endpoint:** `fx-settlement` ($0.25)

An agent routing a cross-border payment needs to know whether the FX corridor is stable, liquid, and executing at expected cost. High volatility or low liquidity means the agent gets less certainty on the net received amount. The signal includes 24h volatility, corridor stability classification, execution risk, and the best execution window.

```json
→ { "corridor": "USD/EUR", "stability": "CAUTION",
    "executionRisk": "MODERATE", "volatility24h": "0.41%",
    "recommendation": "Execute before NY close — liquidity thins after 4pm ET" }
```

**When to call:** any time an agent is routing a cross-border payment or comparing corridor options. Combine with `sovereign-debt` for EM destinations.

---

### "Is this counterparty's jurisdiction stable?"

**Endpoint:** `sovereign-debt` ($0.25)

An agent paying a counterparty in an emerging market needs to know the sovereign risk profile of that jurisdiction — rollover stress, DSA flags, fiscal trajectory. High sovereign risk means the counterparty itself faces funding pressure, increasing the probability of delayed delivery or disputes.

```json
→ { "riskTier": "HIGH", "score": 81,
    "flags": ["Debt rollover stress Q3", "IMF program active", "FX reserves declining"],
    "recommendation": "EM counterparty under sovereign pressure — shorten payment terms" }
```

**When to call:** before paying an EM counterparty, before extending Net 30/60/90 terms, or before any payment where the counterparty's jurisdiction matters to delivery risk.

---

### "If this payment fails, what breaks?"

**Endpoint:** `cascade` ($0.75)

An agent executing a strategically important payment — large notional, critical vendor, first payment in a settlement chain — needs to know what happens downstream if it fails. The cascade simulation models failure propagation across the counterparty network: how many counterparties are affected, at what depth, and with what probability.

```json
→ { "cascadeRisk": "MODERATE", "failureProbability": 0.12,
    "cascadeDepth": 3, "affectedCounterparties": 7,
    "recommendation": "Proceed but hold escrow — moderate downstream exposure" }
```

**When to call:** before payments the agent classifies as strategic or high-dependency. Most expensive signal — agents should call it selectively.

---

### "Will this vendor deliver, given current supply chain stress?"

**Endpoint:** `supply-chain` ($0.25)

An agent approving a vendor payment needs to know whether current supply chain conditions make timely delivery probable. Elevated supply chain pressure — semiconductor shortages, port congestion, logistics backlogs — increases the risk that a paid vendor cannot perform.

```json
→ { "pressureIndex": 68, "regime": "ELEVATED",
    "hotspots": ["Semiconductor: lead times +6 weeks", "APAC port congestion"],
    "recommendation": "Tech vendor payment acceptable — build in delivery buffer" }
```

**When to call:** before paying a tech, manufacturing, or goods vendor. Pair with `shipping-stress` when the goods have to physically move.

---

### "Is this shipment-linked invoice safe to pay?"

**Endpoint:** `shipping-stress` ($0.25)

An agent processing an invoice tied to physical goods delivery needs to know whether the goods are actually moving. Elevated shipping stress — route disruptions, port congestion, rerouting — means the agent should verify delivery status before releasing payment or factor delay risk into payment terms.

```json
→ { "globalStress": "HIGH", "score": 74,
    "hotspots": ["Red Sea rerouting: +10 days avg", "Rotterdam congestion: 4d delay"],
    "invoiceDelayRisk": "ELEVATED — verify delivery before payment release" }
```

**When to call:** before releasing payment on goods-linked invoices, or when an agent is evaluating whether to extend payment terms because of delivery uncertainty.

---

### "What's driving this period of instability?"

**Endpoint:** `instability` ($0.35)

An agent operating in a volatile environment needs to understand the root cause of stress — not just that conditions are elevated, but whether the driver is monetary policy, geopolitical escalation, credit stress, or commodity shock. Different drivers call for different agent responses.

```json
→ { "primaryDriver": "MONETARY_POLICY", "confidence": 0.83,
    "narrative": "Fed trajectory uncertainty driving term premium widening",
    "recommendation": "Shorten duration exposure — policy path remains unclear" }
```

**When to call:** when `macro-stress` returns ELEVATED_RISK or CRISIS and the agent needs to reason about the cause rather than just the level.

---

### "Are normally-unrelated signals moving together?"

**Endpoint:** `resonance` ($0.50)

An agent observing multiple elevated signals needs to know whether they're independent or synchronized. When macro stress, FX volatility, and sovereign pressure all move together, that correlation is itself a signal — it suggests a systemic event rather than idiosyncratic noise. Resonance detection tells the agent whether the current environment warrants heightened caution.

```json
→ { "phaseAlignment": "HIGH", "alignedSignals": ["macro-stress", "fx-settlement", "sovereign-debt"],
    "interpretation": "Correlated stress — systemic event probability elevated",
    "recommendation": "Treat concurrent signals as amplified, not independent" }
```

**When to call:** when multiple paid signals are simultaneously elevated and the agent needs to assess whether to treat them as additive risk.

---

### "What's the highest-risk event in the current window?"

**Endpoint:** `butterfly` (POST, $0.50)

An agent running a daily or weekly risk review needs to identify the single event with the highest cascade potential in the current window — the one that, if it triggers, has the widest downstream effects. The butterfly signal does this synthesis across all monitored signal layers.

```json
→ { "event": "Fed FOMC decision", "cascadePotential": "HIGH",
    "probability": 0.34, "affectedCorridors": ["USD/EM", "USD/EUR"],
    "recommendation": "Reduce large payment exposure before Thursday 2pm ET" }
```

**When to call:** periodic risk reviews, before scheduling large batch payments, or when an agent needs to prioritize which risk to act on.

---

### "What are the climate risks affecting this counterparty or sector?"

**Endpoint:** `climate` ($0.15) · `climate-pulse` ($0.25) · `earth-systems` ($0.25)

An agent making payments linked to agriculture, energy, real estate, or physical infrastructure needs to understand current climate conditions. Climate stress affects commodity prices, insurance availability, and counterparty operational continuity. Earth-systems provides the deeper structural picture — ENSO phase, ocean heat, arctic conditions — that drives longer-horizon climate signal direction.

```json
→ { "temperatureAnomaly": "+1.6°C", "droughtIndex": "SEVERE",
    "wildfireRisk": "ELEVATED — western US and southern EU",
    "recommendation": "Agricultural counterparties in affected regions: elevated delivery risk" }
```

**When to call:** before payments to agricultural, energy, or real estate sector counterparties; for any agent doing SFDR/CSRD ESG-linked payment analysis.

---

### "What's the biodiversity and nature risk for this counterparty?"

**Endpoint:** `biodiversity` ($0.25)

An agent required to assess TNFD or SFDR PAI 7 compliance for a counterparty needs structured nature-risk data. The biodiversity signal maps ecosystem stress, deforestation exposure, and nature-dependency risk by sector and geography.

```json
→ { "tnfdRisk": "MODERATE", "paiScore": 42,
    "drivers": ["Deforestation exposure: palm oil supply chain", "Water stress: SEA operations"],
    "recommendation": "Disclose PAI 7 flag — SFDR Article 8/9 reporting required" }
```

**When to call:** for ESG-aware agents, before any payment where SFDR/CSRD counterparty disclosure is required.

---

### "Is this jurisdiction safe for a female-founded or gender-sensitive business?"

**Endpoint:** `gender-risk` ($0.50)

An agent routing payments to a counterparty in a jurisdiction with elevated gender-based risk — GBV prevalence, suppressed female labor force participation, legal barriers — needs to flag this for ESG-aware clients. The signal returns both a suppression risk score and an opportunity score for reform upside, across 18 countries.

```json
→ { "gbvRiskScore": 71, "opportunityScore": 38,
    "jurisdiction": "PK",
    "drivers": ["GBV prevalence 28%", "Female LFPR 21%", "WBL index 46/100"],
    "recommendation": "Elevated gender risk — flag for ESG reporting and client disclosure" }
```

**When to call:** for agents serving ESG-mandated clients, or any agent making payments to jurisdictions where gender risk is a disclosure or assessment requirement.

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

```
1. Agent calls endpoint
   GET /v1/intelligence/macro-stress

2. Server: 402 Payment Required
   { "x402Version": 2, "accepts": [{
     "amount": "150000",       ← $0.15 USDC (6 decimals)
     "asset": "0x8335...",     ← USDC on Base
     "payTo": "0x160e...",     ← DPX fee collector
     "network": "eip155:8453"
   }]}

3. Agent signs EIP-3009 TransferWithAuthorization
   → X-Payment: <signed token>

4. Agent retries with X-Payment header
   → 200: { regime: "ELEVATED_RISK", score: 72, ... }
```

No human approves the payment. No human manages credentials at transaction time. The agent's funded wallet, private key, and signing logic handle every step autonomously.

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

## Wallet requirements

The agent wallet must hold USDC on Base mainnet (chainId 8453) and a small ETH balance for gas. No registration, KYC, or whitelisting. Any funded Base wallet works. Set the private key once at deploy time — the agent handles all payments autonomously from there.

## Related

- [Intelligence API reference](/api/intelligence-api) — complete endpoint documentation with response schemas
- [x402 protocol](/integrations/x402) — how machine-to-machine payments work on Base
- [DPX Settlement](/agent-quickstart) — the separate settlement product, for agents that execute payments
- [Anthropic cookbook](https://github.com/anthropics/anthropic-cookbook/tree/main/third_party/DPX) — `intelligence_gated_settlement.ipynb` — runnable notebook
