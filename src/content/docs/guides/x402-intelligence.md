---
title: x402 Intelligence — Agents Paying for Signals
description: How autonomous agents pay micropayments for DPX intelligence signals before making settlement decisions. 23 endpoints, $0.15–$0.75 USDC per call, no account or API key required.
---

Agents that settle large payments benefit from real-world context before they commit. DPX exposes 23 live intelligence endpoints — macro stress, sovereign debt, FX corridors, cascade risk, shipping, climate, and more — all gated by x402 micropayments. An agent calls an endpoint, receives a `402 Payment Required` with USDC details, signs a transfer, retries, and gets a structured signal it can reason about.

There is no subscription, no API key, and no account. Each signal purchase is a discrete on-chain payment on Base mainnet.

## How the payment works

```
1. Agent calls intelligence endpoint
   GET /v1/intelligence/macro-stress

2. Server responds with 402 and payment requirements
   {
     "x402Version": 2,
     "accepts": [{
       "scheme": "exact",
       "network": "eip155:8453",
       "amount": "150000",           ← $0.15 USDC (6 decimal places)
       "asset": "0x8335...",         ← USDC on Base
       "payTo": "0x160e..."          ← DPX fee collector
     }]
   }

3. Agent signs EIP-3009 TransferWithAuthorization
   → X-Payment: <signed token>

4. Agent retries with X-Payment header
   GET /v1/intelligence/macro-stress
   X-Payment: <signed token>

5. Server verifies on-chain and responds
   → 200: { regime: "ELEVATED_RISK", score: 72, ... }
```

The signed transfer authorizes USDC to move from the agent's wallet to DPX — no intermediary, no escrow, no human approval. Settlement is on-chain; the intelligence response is delivered once the transfer is verified.

## Endpoint catalogue

All 23 endpoints are available at `intelligence.untitledfinancial.com`. No authentication is required for the catalogue itself.

```bash
curl https://intelligence.untitledfinancial.com/
```

| Endpoint | Price | Signal |
|---|---|---|
| `/v1/intelligence/macro-stress` | $0.15 | Credit regime classification — STABLE / ELEVATED_RISK / CRISIS. Covers HY spreads, TED spread, VIX, curve inversion. |
| `/v1/intelligence/sovereign-debt` | $0.25 | Sovereign risk tier for counterparty jurisdictions. EM rollover stress, fiscal trajectory, DSA flags. |
| `/v1/intelligence/fx-settlement` | $0.25 | FX corridor stability and execution risk for cross-border payments. Includes 24h volatility, liquidity depth, settlement timing. |
| `/v1/intelligence/cascade` | $0.75 | Full cascade simulation — payment failure propagation across counterparty network. Most expensive signal; most comprehensive. |
| `/v1/intelligence/shipping-stress` | $0.25 | Global freight stress, route disruptions, port congestion, invoice delay risk for goods-linked payments. |
| `/v1/intelligence/supply-chain` | $0.25 | Semiconductor, energy, and industrial supply chain stress. Useful for tech and manufacturing vendor payments. |
| `/v1/intelligence/climate` | $0.50 | Physical climate risk score for counterparty locations. Flood, heat, drought, storm exposure. |
| `/v1/intelligence/currency-stress` | $0.25 | Spot and forward currency stress across 40 pairs. Useful for any non-USD corridor. |
| `/v1/intelligence/mycelium` | $0.50 | Network topology analysis — identifies systemic risk nodes and crisis propagation paths. |
| `/v1/intelligence/resonance` | $0.50 | Phase alignment detection across macro signals — identifies when normally-uncorrelated signals are moving together. |
| `/v1/intelligence/geopolitical` | $0.35 | Sanctions trajectory, conflict escalation indices, export control risk for counterparty jurisdictions. |
| `/v1/intelligence/liquidity` | $0.25 | Short-term funding stress across money markets, repo, and overnight lending. |
| `/v1/intelligence/credit-spread` | $0.20 | IG and HY credit spread regime — investment grade and high yield spread compression or widening. |
| `/v1/intelligence/real-estate` | $0.35 | Commercial and residential real estate stress. Relevant for real estate vendor or escrow payments. |
| `/v1/intelligence/energy` | $0.30 | Energy price stress and supply risk. Relevant for energy-sector counterparties and commodity-linked payments. |
| `/v1/intelligence/emerging-markets` | $0.35 | EM-specific composite — combines FX, sovereign, inflation, and capital flow signals for EM corridors. |
| `/v1/intelligence/inflation` | $0.20 | Inflation regime and CPI trajectory. Relevant for long-tenor or indexed payment structures. |
| `/v1/intelligence/bank-stress` | $0.40 | Banking sector stress — deposit flight indicators, CDS spreads, interbank funding. |
| `/v1/intelligence/commodity` | $0.30 | Commodity price volatility and supply shock risk across metals, agriculture, energy. |
| `/v1/intelligence/political-risk` | $0.35 | Election-cycle risk, regulatory change probability, and government stability by jurisdiction. |
| `/v1/intelligence/cbdc` | $0.25 | Central bank digital currency deployment status and interoperability signals for EM jurisdictions. |
| `/v1/intelligence/cyber-risk` | $0.40 | Financial sector cyber threat landscape — relevant for high-value wire transfers. |
| `/v1/intelligence/predictive-composite` | $0.75 | 30/60/90-day regime transition probabilities across all signal layers. The full predictive model output. |

## Choosing which signals to buy

Agents should buy signals that are material to the specific payment — not all of them. Each call costs USDC from the agent's wallet.

| Payment type | Recommended signals |
|---|---|
| Domestic USD, low notional | None required. Oracle conditions check is free. |
| Domestic USD, >$100K | `macro-stress` ($0.15) |
| Cross-border, developed market | `macro-stress` + `fx-settlement` ($0.40) |
| Cross-border, EM counterparty | `macro-stress` + `fx-settlement` + `sovereign-debt` ($0.65) |
| EM + large notional | Add `emerging-markets` + `currency-stress` ($1.25 total) |
| Strategic or sensitive payment | `cascade` ($0.75) — full propagation simulation |
| Goods-linked payment | Add `shipping-stress` ($0.25) |
| Energy/commodity vendor | Add `energy` or `commodity` ($0.30) |
| When macro signals look correlated | `resonance` ($0.50) — detect whether signals are artificially synchronized |

Total intelligence spend per settlement: typically $0.15–$1.50 USDC for a complete picture.

## Python — buying a signal

```python
import httpx, json, time, os
from eth_account import Account
from eth_account.messages import encode_structured_data

INTEL = "https://intelligence.untitledfinancial.com"
AGENT_KEY = os.environ["AGENT_PRIVATE_KEY"]  # funded Base wallet

def buy_intelligence(endpoint: str) -> dict:
    url = f"{INTEL}{endpoint}"

    # Step 1: probe for payment requirements
    r = httpx.get(url)
    if r.status_code == 200:
        return r.json()
    if r.status_code != 402:
        raise RuntimeError(f"Unexpected {r.status_code}")

    req   = r.json()
    acpt  = req["accepts"][0]
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


# Buy macro stress signal — $0.15 USDC
signal = buy_intelligence("/v1/intelligence/macro-stress")
print(signal)
# { "regime": "ELEVATED_RISK", "score": 72,
#   "drivers": ["HY spread widening", "TED spread 38bps", "VIX 24"],
#   "recommendation": "Proceed with caution — monitor credit spreads" }
```

## MCP — via Claude Desktop or Cursor

The `get_intelligence` MCP tool handles the full x402 flow internally. Configure once, call from any conversation:

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

Then in a Claude conversation:

```
Before we approve this vendor payment, buy the macro stress and FX corridor signals.
```

Claude calls `get_intelligence` for each endpoint, pays the x402 fees from the configured wallet, and reasons about the response before recommending whether to settle.

## Agent-gated settlement pattern

The standard pattern: buy relevant signals first, then check the oracle, get a quote, screen the counterparty, and settle. The intelligence signals inform — but do not replace — the oracle gate and compliance screen.

```python
import anthropic, httpx, json

client = anthropic.Anthropic()
ORACLE = "https://stability.untitledfinancial.com"
AGENT  = "https://agent.untitledfinancial.com"

tools = [
    {
        "name": "buy_intelligence",
        "description": "Buy a DPX intelligence signal via x402 ($0.15–$0.75 USDC). "
                       "Returns structured signal data for settlement reasoning.",
        "input_schema": {
            "type": "object",
            "properties": {
                "endpoint": {"type": "string"},
                "reason":   {"type": "string"}
            },
            "required": ["endpoint", "reason"]
        }
    },
    # ... oracle, quote, compliance, settle tools
]

def run(task):
    messages = [{"role": "user", "content": task}]
    system = """
    You are a settlement agent. Before executing any large payment:
    1. Buy relevant intelligence signals (choose based on payment type and counterparty)
    2. Check oracle conditions
    3. Get a fee quote
    4. Screen the counterparty
    5. Execute if all signals are acceptable

    Reason explicitly about what each intelligence signal tells you and
    whether it changes your settlement recommendation.
    """
    while True:
        resp = client.messages.create(
            model="claude-sonnet-5", max_tokens=4096,
            system=system, tools=tools, messages=messages
        )
        if resp.stop_reason == "end_turn":
            return next(b.text for b in resp.content if b.type == "text")
        # dispatch tool calls ...
```

## Signal response format

All intelligence endpoints return structured JSON with consistent fields:

```json
{
  "regime":         "ELEVATED_RISK",     // STABLE | CAUTION | ELEVATED_RISK | CRISIS
  "score":          72,                  // 0–100, higher = more stress
  "confidence":     0.87,               // model confidence 0–1
  "drivers": [
    "HY spread widening",
    "TED spread 38bps",
    "VIX at 24"
  ],
  "recommendation": "Proceed with caution — monitor credit spreads",
  "outlook":        "Stress likely to persist 2–4 weeks absent Fed intervention",
  "updatedAt":      "2026-07-25T14:00:00Z",
  "horizon":        "30d"               // forward-looking horizon for this signal
}
```

Endpoint-specific fields are added on top of this base structure — `corridor`, `stability`, `executionRisk` for FX; `riskTier`, `flags` for sovereign debt; `cascadeDepth`, `failureProbability` for cascade.

## Wallet requirements

The agent wallet must:
- Be on Base mainnet (chainId 8453)
- Hold USDC at the USDC contract on Base
- Hold a small amount of ETH for gas (typically $0.01–$0.05 per session)

The minimum useful balance for a session of intelligence queries is $5 USDC. The wallet address has no other requirements — no registration, no KYC, no whitelisting.

For production deployments, use a dedicated agent wallet funded via automated top-up rather than a hot wallet used for other purposes.

## Related

- [x402 — agent payments](/integrations/x402) — full protocol reference and payment flow
- [Intelligence API reference](/api/intelligence-api) — all 23 endpoints with complete response schemas
- [Agent Quick Start](/agent-quickstart) — full settlement loop with oracle gate and compliance
- [MCP server](/integrations/mcp) — 78 tools including `get_intelligence` for Claude Desktop
- [Anthropic cookbook](https://github.com/anthropics/anthropic-cookbook/tree/main/third_party/DPX) — `intelligence_gated_settlement.ipynb` — runnable notebook demonstrating the full flow
