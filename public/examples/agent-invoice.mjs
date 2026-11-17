// Agent A invoices Agent B over DPX MCP, and Agent B checks and pays it.
// Run: node agent-invoice.mjs            (needs Node 18+; no wallet; stops at the payment requirement)
//      X_PAYMENT=<base64 payment> node agent-invoice.mjs   (retries the pay step with an x402 payment you built)
const MCP = 'https://mcp.untitledfinancial.com/mcp';

// One JSON-RPC call to a DPX MCP tool. Returns the HTTP status, the tool result when there is one, and the raw body otherwise.
async function tool(name, args, extraHeaders = {}) {
  const res = await fetch(MCP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', ...extraHeaders },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } }),
  });
  const text = await res.text();
  const json = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);                    // the server may answer as plain JSON or as an event stream
  const out = json.result?.content?.[0]?.text;
  return { status: res.status, result: out ? JSON.parse(out) : null, raw: json };
}

// ── Agent A (the seller) creates the invoice. invoice.create is free. ──
const created = await tool('invoice.create', {
  amount: 25,                                   // amount in the source currency
  currency: 'USD',
  destinationCurrency: 'USD',
  description: 'Data enrichment batch 42',
  externalReference: 'order-42',                // your own id, so you can match the payment to your books
});
const { invoiceId } = created.result;
console.log('A created', invoiceId, 'expires', created.result.expiresAt);

// ── Agent B (the buyer) reads the invoice before paying. invoice.get is free. ──
const seen = (await tool('invoice.get', { invoiceId })).result;
const ok = seen.status === 'OPEN' && seen.amount === 25 && Date.parse(seen.expiresAt) > Date.now();
console.log('B sees', seen.status, seen.amount, seen.currency, ok ? '(acceptable)' : '(do not pay)');
if (!ok) process.exit(1);

// ── Agent B pays. invoice.pay is paid per call over x402; sandbox defaults to true, so this simulates the settlement. ──
const payArgs = { invoiceId, recipientAddress: '0x0000000000000000000000000000000000000001', sandbox: true };  // use the seller's real address in live mode
const first = await tool('invoice.pay', payArgs);
if (first.status === 402) {
  // No payment attached yet: the response carries the exact x402 requirement (network, asset, amount, payTo) to build a payment from.
  console.log('B was asked to pay:', first.raw.x402 ?? first.raw);
  if (!process.env.X_PAYMENT) { console.log('Set X_PAYMENT to a payment built from that requirement, then run again.'); process.exit(0); }
  const paid = await tool('invoice.pay', payArgs, { 'X-PAYMENT': process.env.X_PAYMENT });
  console.log('B paid:', paid.status, paid.result ?? paid.raw);
} else {
  console.log('B paid:', first.status, first.result ?? first.raw);
}

// ── Agent A confirms. Once the payment settles, the status changes from OPEN to PAID. ──
console.log('A sees', (await tool('invoice.get', { invoiceId })).result.status);
