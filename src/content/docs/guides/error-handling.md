---
title: Error handling for agents
description: How to handle every failure state in the DPX settlement loop — BLOCKED, HOLD, UNSTABLE, VoP mismatches, expired quotes, and empty wallets.
---

Every step in the settlement loop can return a non-success state. This page covers what each one means and what your agent should do.

---

## flow_check decisions

`flow_check` runs AML, sanctions, and FATF R16 in parallel and returns one of three decisions.

### PROCEED

Safe to settle. The response includes a ready-to-use `settleBody` — pass it directly to `/settle`.

```typescript
if (check.decision === 'PROCEED') {
  const settled = await settle(check.settleBody);
}
```

### HOLD

A compliance signal needs human review. Nothing is wrong with the counterparty definitively — but something flagged that a human should look at before funds move.

```typescript
if (check.decision === 'HOLD') {
  await queue.push({ invoice, reason: check.reason, action: 'NEEDS_REVIEW' });
  return { status: 'held', reason: check.reason };
}
```

**Do not retry automatically.** Route to a review queue and wait for a human to clear it.

### BLOCKED

Hard stop. The counterparty is on a sanctions list, fails AML thresholds, or is otherwise ineligible. Nothing moves.

```typescript
if (check.decision === 'BLOCKED') {
  await log.write({ invoice, reason: check.reason, action: 'BLOCKED', timestamp: Date.now() });
  throw new Error(`Payment blocked: ${check.reason}`);
}
```

**Never retry a BLOCKED payment.** Log it, halt the agent's payment flow, and escalate. Retrying a blocked payment against a sanctioned counterparty increases regulatory exposure.

---

## Oracle states

### UNSTABLE

Global conditions are wrong for settlement. The oracle detected meaningful risk across one or more signal layers. The agent should hold and retry later.

```typescript
if (oracle.status === 'UNSTABLE') {
  await sleep(60 * 60 * 1000); // wait 1 hour
  return run(); // retry
}
```

Do not settle into UNSTABLE conditions — the oracle gate exists specifically to prevent this.

### CAUTION

Conditions are degraded but not critical. Your agent can proceed or wait depending on urgency and amount.

```typescript
if (oracle.status === 'CAUTION') {
  log(`Oracle CAUTION: ${oracle.reasoning}`);
  // For large amounts or high-risk corridors: wait for STABLE
  // For small amounts or time-sensitive: proceed and log
}
```

Always log the `reasoning` field — it describes which signal layer is elevated and why.

### Mid-execution flip

If the oracle flips to UNSTABLE between your gate check and settlement execution, the settle endpoint will return an error with `oracleStatus: "UNSTABLE"` in the response body. Handle it the same as a gate failure.

```typescript
const settled = await settle(body);
if (settled.oracleStatus === 'UNSTABLE') {
  // Oracle flipped mid-execution — hold and retry
}
```

---

## VoP (counterparty verification) results

### VERIFIED

Wallet address matches the submitted name in the legal entity registry. Clean to proceed.

### NOT_REGISTERED

The wallet is not in the registry. This is normal — most counterparties have not onboarded. Check `proceedSafe`:

```typescript
if (vop.result === 'NOT_REGISTERED') {
  if (!vop.proceedSafe) throw new Error(`VoP: ${vop.message}`);
  // proceedSafe: true — proceed, log the NOT_REGISTERED status
  log(`Counterparty not in registry — proceeding: ${vop.message}`);
}
```

`proceedSafe` reflects whether the unregistered status is a reason to halt given the payment size and corridor. For most normal payments it will be `true`.

### MISMATCH

The wallet address exists in the registry but the submitted name does not match the registered entity. This is a potential fraud signal.

```typescript
if (vop.result === 'MISMATCH') {
  // Do not proceed — name/wallet mismatch is a red flag
  await notify('compliance-queue', { invoice, result: 'MISMATCH', message: vop.message });
  throw new Error(`VoP MISMATCH — halting: ${vop.message}`);
}
```

Never auto-proceed on a MISMATCH. Escalate to a human.

---

## x402 payment failures

### Empty wallet

If your Base wallet has insufficient USDC, `x402-fetch` will throw before the payment completes.

```
Error: Insufficient balance for x402 payment
```

Refill your wallet with USDC on Base mainnet. Minimum ~$0.01 covers many test runs. For production, maintain a float based on expected call volume (~$0.001 per intelligence or VoP call).

### Max payment ceiling exceeded

If the server requests more than your configured per-call ceiling, `x402-fetch` refuses to sign.

```typescript
const fetchX402 = wrapFetchWithPayment(fetch, signer, BigInt(1 * 10 ** 6)); // $1 max
```

If a legitimate endpoint requires more than your ceiling, increase it. If an unexpected endpoint requests more than expected, treat it as a misconfiguration or malicious server — do not raise the ceiling blindly.

---

## Quote expiry

Quotes are valid for 300 seconds. If your agent takes longer than that between fetching the quote and calling `/settle`, the settlement will be rejected.

```typescript
const { quote } = await getQuote(amount);
const quoteAge = Date.now() - quote.fetchedAt;

if (quoteAge > 270_000) { // re-fetch with 30s buffer
  return run(); // re-fetch quote and retry
}

await settle({ ...body, quoteId: quote.quoteId });
```

For agents with slow compliance or approval steps between quote and settle, re-fetch the quote immediately before calling `/settle` rather than reusing a cached one.

---

## Full error-handling pattern

```typescript
async function settleWithErrorHandling(invoice: Invoice) {
  // 1 — Oracle gate
  const oracle = await getOracleStatus();
  if (oracle.status === 'UNSTABLE') {
    return { status: 'deferred', reason: 'oracle_unstable', retryAfter: '1h' };
  }

  // 2 — Quote
  const { quote } = await getQuote(invoice.amount);

  // 3 — Compliance
  const check = await flowCheck(invoice);
  if (check.decision === 'BLOCKED') {
    await logAndEscalate(invoice, check.reason, 'BLOCKED');
    throw new Error(`Blocked: ${check.reason}`);
  }
  if (check.decision === 'HOLD') {
    await routeToQueue(invoice, check.reason);
    return { status: 'held', reason: check.reason };
  }

  // 4 — VoP
  const vop = await verifyCounterparty(invoice.recipientAddress, invoice.counterpartyName);
  if (vop.result === 'MISMATCH') {
    await routeToQueue(invoice, 'vop_mismatch');
    throw new Error(`VoP MISMATCH: ${vop.message}`);
  }

  // 5 — Settle (quote re-check)
  if (Date.now() - quote.fetchedAt > 270_000) {
    return settleWithErrorHandling(invoice); // re-run with fresh quote
  }

  const settled = await settle({ ...check.settleBody, quoteId: quote.quoteId });

  if (settled.oracleStatus === 'UNSTABLE') {
    return { status: 'deferred', reason: 'oracle_flipped_unstable' };
  }

  return settled;
}
```

---

## Related

- [Add payments to your agent](/guides/agent-payments) — the full 5-step loop
- [Compliance for agents](/guides/compliance-for-agents) — what BLOCKED and HOLD mean in detail
- [x402 reference](/integrations/x402) — wallet setup and payment mechanics
