---
title: Run the Oracles
description: Start both DPX oracles and verify they are live.
---

Both oracles must be running for the full DPX agent stack to work. The Stability Oracle (port 3000) handles pricing and settlement. The ESG Oracle (port 3001) provides live ESG scores.

## Prerequisites

- Node.js 18+
- Both repos cloned and dependencies installed

```bash
# Stability Oracle
cd ~/Documents/GitHub/Stability-Oracle/stability-oracle
npm install

# ESG Oracle
cd ~/Documents/GitHub/ESG-Oracle/esg-oracle
npm install
```

## Start both with one command

From the repo root:

```bash
bash start-dpx.sh
```

This starts both oracles concurrently and prints all agent endpoint URLs.

## Start individually

```bash
# Terminal 1 — Stability Oracle
cd stability-oracle
npm start          # node server.js on port 3000

# Terminal 2 — ESG Oracle
cd esg-oracle
npm start          # node server.js on port 3001
```

## Verify both are live

```bash
curl localhost:3000/health
# {"status":"healthy","oracle":"SUCCESS","network":"base"}

curl localhost:3001/health
# {"status":"healthy","esgOracle":"SUCCESS"}
```

## Environment variables

Create `.env` in the Stability Oracle directory for on-chain settlement:

```sh
ROUTER_ADDRESS=0x...          # DPXSettlementRouter on Base
SETTLER_PRIVATE_KEY=0x...     # Wallet with DPX balance
RPC_URL=https://mainnet.base.org
```

The pricing and discovery endpoints work without `.env`. Settlement requires all three variables.

## Quick agent test

Once both oracles are running, run the full 5-step loop:

```bash
# Step 1 — Discover
curl localhost:3000/manifest | jq '.onboarding.humanRequired'
# false

# Step 2 — ESG score
curl localhost:3001/esg-score | jq '.scores.average'
# 77

# Step 3 — Quote
curl "localhost:3000/quote?amountUsd=1000000&hasFx=true&esgScore=77" | jq '.fees.total'

# Step 4 — Verify on-chain
curl "localhost:3000/verify-fees?amountUsd=1000000&hasFx=true&esgScore=77" | jq '.feesMatch'
# true

# Step 5 — Reliability
curl localhost:3000/reliability | jq '.isHealthy'
# true
```

All five steps passing means the stack is ready for agent settlement.
