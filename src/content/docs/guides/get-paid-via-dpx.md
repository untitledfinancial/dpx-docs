---
title: Get paid via DPX
description: A short, no-jargon guide for a vendor, contractor, or counterparty asked to receive a payment through DPX instead of a wire or ACH.
---

Someone has asked to pay you through DPX instead of a bank wire, ACH, or card. This page explains what that means, in plain terms, and how to check it's real before you agree to anything.

You don't need a DPX account, an app, a login, or any relationship with DPX at all. You only need one thing: **a wallet address.**

---

## What actually happens

1. You share a wallet address — any standard Ethereum-compatible address works (Coinbase Wallet, MetaMask, or any exchange account that supports withdrawals to an external address).
2. The payer sends the agreed amount, denominated in USDC, EURC, or DPX Token, on Base — a low-cost, widely used blockchain network.
3. The transfer settles in seconds and is visible immediately, to anyone, at [basescan.org](https://basescan.org) — the public block explorer for Base.
4. If you want it as regular currency, any major exchange (Coinbase, Kraken, etc.) will let you deposit and convert to USD, EUR, or your local currency, the same way you'd handle any other stablecoin deposit.

That's the entire process on your end. DPX doesn't hold your funds at any point, doesn't require you to sign up for anything, and doesn't see any of your business information beyond the wallet address you choose to share.

---

## Why this instead of a wire or ACH

- **No bank cutoff times or multi-day holds** — it settles when the transaction confirms, not on a banking calendar.
- **No correspondent-bank chain for cross-border payments** — nothing to get stuck in transit between intermediary banks.
- **You can verify it yourself, independently** — a wire confirmation is a screenshot you have to trust; a Base mainnet transaction is public and checkable by anyone in about a minute, with no need to ask DPX or the payer anything.

---

## Verifying a payment before or after it happens

Anyone can check a transaction directly on [basescan.org](https://basescan.org) by searching the transaction hash or your own wallet address. You'll see:

- The exact amount and asset (USDC, EURC, or DPX Token)
- The sender and recipient addresses
- The timestamp and confirmation status

No login, no API key, no request to DPX required — this is public blockchain data, not something DPX controls or could alter after the fact.

---

## Frequently asked

**Do I need to install anything?**
Only a wallet, if you don't already have one. Coinbase Wallet and MetaMask are both free, widely used, and take a few minutes to set up. If you already have an account with a crypto exchange, you likely already have an address you can use.

**Is this a cryptocurrency investment?**
No. USDC and EURC are stablecoins — each is designed to track the US dollar or euro 1:1, not to fluctuate in value. You're receiving the same value you'd receive by wire, just over a different rail.

**What if I want to convert it to cash right away?**
Deposit it to any exchange that supports USDC/EURC withdrawals and convert immediately. This typically takes minutes, not days.

**Can I confirm the payment came from who I think it did?**
Yes — the transaction is signed by the sender's own wallet, and that wallet address is visible on Basescan. Confirm the sending address matches what you were told to expect before treating the payment as legitimate, the same diligence you'd apply to a wire's originating account.

**What is DPX, exactly?**
A settlement rail — infrastructure that routes the payment, not a bank or a platform you interact with. It doesn't hold funds at any point in the process; the payer's own wallet sends directly to yours.

---

## Related

- [Trust and verification](/guides/trust-and-verification) — a real, independently verifiable settlement, start to finish
- [Agent-to-agent payments](/guides/agent-to-agent-payments) — for a counterparty whose own systems are automating this
