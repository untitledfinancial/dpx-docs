---
title: DPX Intelligence — x402-Gated Signal API
description: 22 live intelligence endpoints covering macro stress, climate, sovereign debt, FX corridors, cascade risk, supply chain, and more. Agents pay $0.15–$0.75 USDC per signal via x402 on Base — no account, no API key, no subscription.
---

DPX Intelligence is a standalone signal API. Agents pay micropayments via x402 to access structured intelligence on macro conditions, climate systems, FX corridors, cascade risk, supply chain stress, sovereign debt, and more. No account, no API key, no subscription — each signal purchase is a discrete USDC payment on Base mainnet.

DPX Intelligence is a separate product from DPX Settlement. Signals can be bought and used for any purpose: investment research, risk management, agent decision-making, or data pipelines. Settlement through DPX is not required.

## How x402 works

```
1. Agent calls an intelligence endpoint
   GET /v1/intelligence/macro-stress

2. Server responds: 402 Payment Required
   {
     "x402Version": 2,
     "accepts": [{
       "scheme": "exact",
       "network": "eip155:8453",
       "amount": "150000",       ← $0.15 USDC (6 decimals)
       "asset": "0x8335...",     ← USDC on Base mainnet
       "payTo": "0x160e..."      ← DPX fee collector
     }]
   }

3. Agent signs EIP-3009 TransferWithAuthorization
   → X-Payment: <signed token>

4. Agent retries with payment header
   GET /v1/intelligence/macro-stress
   X-Payment: <signed token>

5. Server verifies and responds
   → 200: { regime: "ELEVATED_RISK", score: 72, ... }
```

No intermediary holds funds. The transfer is authorized directly from the agent's wallet to the DPX fee collector — the intelligence response is delivered once the on-chain transfer is verified.

## Endpoint catalogue

```bash
# Full catalogue — no payment required
curl https://intelligence.untitledfinancial.com/
```

| Endpoint | Price | Signal |
|---|---|---|
| `/v1/intelligence/macro-stress` | $0.15 | Credit regime classification: STABLE / ELEVATED_RISK / CRISIS. HY spreads, TED spread, VIX, curve inversion. |
| `/v1/intelligence/climate` | $0.15 | Climate system state — temperature anomaly, drought index, wildfire risk, CO₂ trajectory. |
| `/v1/intelligence/climate-pulse` | $0.25 | Real-time climate pulse — 30-day event density, active alerts by region, seasonal alignment. |
| `/v1/intelligence/earth-systems` | $0.25 | Earth systems composite — ocean heat, arctic sea ice, ENSO phase, global energy balance. |
| `/v1/intelligence/supply-chain` | $0.25 | Global supply chain pressure index — semiconductor, shipping, port congestion, inventory stress. |
| `/v1/intelligence/energy-transition` | $0.25 | Energy transition risk and opportunity — renewable capacity, fossil fuel phase-out trajectory, grid stress. |
| `/v1/intelligence/esg/:address` | $0.25 | ESG intelligence for a specific wallet or LEI — live score, controversy flags, sector benchmark. |
| `/v1/intelligence/cascade` | $0.75 | Cascade simulation — payment failure propagation model. Most comprehensive signal. |
| `/v1/intelligence/instability` | $0.35 | Instability origins — identifies the primary driver of current systemic stress. |
| `/v1/intelligence/commodity` | $0.25 | Commodity price regime — stress index across metals, agriculture, and energy. |
| `/v1/intelligence/sovereign-debt` | $0.25 | Sovereign risk tier — EM debt rollover stress, fiscal trajectory, DSA flags, 18 jurisdictions. |
| `/v1/intelligence/water-risk` | $0.25 | Water stress by region — freshwater scarcity, drought severity, agricultural water demand. |
| `/v1/intelligence/mycelium` | $0.50 | Network topology — systemic risk nodes, crisis propagation paths, credit-to-GDP gaps. |
| `/v1/intelligence/currency-stress` | $0.25 | Currency stress across 40 pairs — spot volatility, forward pressure, liquidity depth. |
| `/v1/intelligence/biodiversity` | $0.25 | Biodiversity and nature risk — TNFD/SFDR PAI 7, deforestation exposure, ecosystem stress. |
| `/v1/intelligence/shipping-stress` | $0.25 | Freight stress — route disruptions, port congestion, rerouting costs, invoice delay risk. |
| `/v1/intelligence/fx-settlement` | $0.25 | FX corridor stability — execution risk, 24h volatility, settlement timing, corridor flags. |
| `POST /v1/intelligence/butterfly` | $0.50 | Butterfly event — highest cascade-potential macro signal of the current window. |
| `/v1/intelligence/tectonic` | $0.50 | Tectonic shift — slow-moving structural change detection across macro and climate systems. |
| `POST /v1/intelligence/aftershock` | $0.50 | Aftershock — secondary stress signals following a primary event. |
| `POST /v1/intelligence/contagion` | $0.50 | Contagion pathways — cross-asset, cross-market spread probability. |
| `/v1/intelligence/resonance` | $0.50 | Resonance — phase alignment detection when normally-uncorrelated signals move together. |
| `/v1/intelligence/gender-risk` | $0.50 | Gender risk and opportunity by jurisdiction — GBV prevalence, LFPR gap, Women Business and Law Index, 18 countries. Dual output: suppression risk + reform upside. |

## Free oracle feeds

These 11 endpoints are always free — no x402 payment required. They are on-chain ready.

```bash
curl https://intelligence.untitledfinancial.com/v1/oracle/systemic-risk
curl https://intelligence.untitledfinancial.com/v1/oracle/macro-stress-index
curl https://intelligence.untitledfinancial.com/v1/oracle/co2-ppm
curl https://intelligence.untitledfinancial.com/v1/oracle/temperature-anomaly
# ... and 7 more
```

Free feeds: `systemic-risk` · `us-instability-score` · `fiscal-dominance-risk` · `co2-ppm` · `temperature-anomaly` · `macro-stress-index` · `arctic-sea-ice` · `supply-chain-pressure` · `grid-carbon-intensity` · `energy-transition-score` · `earth-health-index`

## Python — buying a signal

```python
import httpx, json, time, os
from eth_account import Account
from eth_account.messages import encode_structured_data

INTEL = "https://intelligence.untitledfinancial.com"
AGENT_KEY = os.environ["AGENT_PRIVATE_KEY"]  # funded Base wallet

def buy_intelligence(endpoint: str) -> dict:
    url = f"{INTEL}{endpoint}"

    # Step 1: probe
    r = httpx.get(url)
    if r.status_code == 200:
        return r.json()
    if r.status_code != 402:
        raise RuntimeError(f"Unexpected {r.status_code}")

    req          = r.json()
    acpt         = req["accepts"][0]
    amount       = int(acpt["amount"])
    pay_to       = acpt["payTo"]
    asset        = acpt["asset"]
    account      = Account.from_key(AGENT_KEY)
    valid_after  = int(time.time()) - 10
    valid_before = int(time.time()) + 300
    nonce        = os.urandom(32).hex()

    # Step 2: sign EIP-3009 TransferWithAuthorization
    structured = {
        "types": {
            "EIP712Domain": [
                {"name": "name",              "type": "string"},
                {"name": "version",           "type": "string"},
                {"name": "chainId",           "type": "uint256"},
                {"name": "verifyingContract", "type": "address"},
            ],
            "TransferWithAuthorization": [
                {"name": "from",         "type": "address"},
                {"name": "to",           "type": "address"},
                {"name": "value",        "type": "uint256"},
                {"name": "validAfter",   "type": "uint256"},
                {"name": "validBefore",  "type": "uint256"},
                {"name": "nonce",        "type": "bytes32"},
            ],
        },
        "primaryType": "TransferWithAuthorization",
        "domain": {
            "name": "USD Coin", "version": "2",
            "chainId": 8453, "verifyingContract": asset,
        },
        "message": {
            "from": account.address, "to": pay_to,
            "value": amount, "validAfter": valid_after,
            "validBefore": valid_before,
            "nonce": bytes.fromhex(nonce),
        },
    }
    signed = account.sign_message(encode_structured_data(structured))

    x_payment = json.dumps({
        "x402Version": 2, "scheme": "exact", "network": "eip155:8453",
        "payload": {
            "signature": signed.signature.hex(),
            "from": account.address, "to": pay_to,
            "value": str(amount),
            "validAfter": str(valid_after), "validBefore": str(valid_before),
            "nonce": "0x" + nonce,
        },
    })

    # Step 3: retry with payment
    r2 = httpx.get(url, headers={"X-Payment": x_payment})
    r2.raise_for_status()
    return r2.json()

# Example: macro stress signal — $0.15 USDC
signal = buy_intelligence("/v1/intelligence/macro-stress")
print(signal["regime"])       # STABLE | ELEVATED_RISK | CRISIS
print(signal["score"])        # 0–100
print(signal["recommendation"])
```

## MCP — via Claude Desktop or Cursor

The `get_intelligence` MCP tool handles the x402 flow internally. Set a funded wallet key once; call from any conversation.

```json
{
  "mcpServers": {
    "dpx": {
      "command": "npx",
      "args": ["-y", "@untitledfinancial/dpx-mcp"],
      "env": {
        "AGENT_PRIVATE_KEY": "your-funded-base-wallet-private-key"
      }
    }
  }
}
```

In conversation: `Get the macro stress signal.` → Claude calls `get_intelligence`, pays via x402, and returns the structured response.

## Signal response format

All endpoints return a consistent base structure:

```json
{
  "regime":         "ELEVATED_RISK",
  "score":          72,
  "confidence":     0.87,
  "drivers": ["HY spread widening", "TED spread 38bps"],
  "recommendation": "...",
  "outlook":        "...",
  "updatedAt":      "2026-07-25T14:00:00Z",
  "horizon":        "30d"
}
```

Endpoint-specific fields are added on top — `cascadeDepth` and `failureProbability` for cascade; `riskTier` and `flags` for sovereign debt; `gbvRiskScore` and `opportunityScore` for gender-risk.

## Wallet requirements

The agent wallet must:
- Be on Base mainnet (chainId 8453)
- Hold USDC at the Base USDC contract (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Hold a small amount of ETH for gas

No registration, no KYC, no whitelisting. Any funded Base wallet works.

## Prediction ledger

Every forecast is stored at the time it is made and scored against the realized outcome when the horizon arrives. Accuracy accumulates over time and feeds back into signal weights via weekly recalibration.

```bash
# View live prediction ledger
GET /v1/intelligence/ledger

# Regime transition probabilities at 30/60/90-day horizons
GET /v1/intelligence/transition-risk
```

## Webhooks — subscribe to events

Register a webhook URL to receive signals on event rather than polling:

```bash
# Subscribe to Butterfly events
POST /intelligence/subscribe
{
  "event": "butterfly",
  "url": "https://your-agent.example.com/webhook",
  "secret": "your-hmac-secret"
}
```

HMAC-signed delivery with 3× retry (5s/30s/120s). Available for butterfly, aftershock, and regime change events.

## Related

- [Intelligence API reference](/api/intelligence-api) — complete endpoint documentation with response schemas
- [x402 protocol](/integrations/x402) — how machine-to-machine payments work on Base
- [MCP server](/integrations/mcp) — 78 tools including `get_intelligence` for Claude Desktop
- [DPX Settlement](/agent-quickstart) — the separate settlement product, for agents that execute payments
- [Anthropic cookbook](https://github.com/anthropics/anthropic-cookbook/tree/main/third_party/DPX) — `intelligence_gated_settlement.ipynb` — runnable notebook using DPX Intelligence with an optional settlement flow
