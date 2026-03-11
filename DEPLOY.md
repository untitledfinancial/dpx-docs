# Deploy DPX Docs

Two options. Storacha is primary (Web3-native, your existing account). Cloudflare Pages is the fallback if you need faster load times later.

---

## Option A — Storacha + IPFS (Primary)
**`docs.untitledfinancial.xyz`** — decentralized, verifiable, free, on-brand

Every deploy produces a permanent CID. You update one DNS TXT record in GoDaddy. Done.

### Step 1 — Get credentials (one-time)

```bash
# Install w3 CLI
npm install -g @web3-storage/w3cli

# Log into your existing Storacha account
npx w3 login your@email.com

# See your spaces
npx w3 space ls

# Set the space you want to use
npx w3 space use <your-space-name>

# Generate a signing key — copy the output
npx w3 key create

# Generate a delegation proof — copy the base64 output
npx w3 delegation create <DID-from-above> --can 'store/add' --can 'upload/add' | base64
```

### Step 2 — Add to `.env` in dpx-docs/

```sh
STORACHA_KEY=MgCa...        # from w3 key create
STORACHA_PROOF=...base64    # from w3 delegation create | base64
```

### Step 3 — Deploy

```bash
cd /Users/victoriacase/Documents/GitHub/dpx-docs
npm run deploy
```

This builds the site, uploads all files to Storacha, and prints the exact DNS record to set.

Output will look like:
```
CID:      bafybeig...
IPFS URL: https://bafybeig....ipfs.w3s.link

NEXT: Update GoDaddy DNS

  Name:   _dnslink.docs
  Value:  dnslink=/ipfs/bafybeig...
  TTL:    600
```

### Step 4 — Update GoDaddy DNS

1. Go to GoDaddy → **untitledfinancial.xyz** → **DNS**
2. Add a **TXT** record:

| Field | Value |
|---|---|
| Type | TXT |
| Name | `_dnslink.docs` |
| Value | `dnslink=/ipfs/<CID-from-output>` |
| TTL | 600 (10 min) |

3. Wait 1–10 minutes for propagation

### Step 5 — Access your site

| URL | Notes |
|---|---|
| `https://docs.untitledfinancial.xyz` | Via IPFS gateway (after DNS propagates) |
| `https://<cid>.ipfs.w3s.link` | Direct — works immediately, no DNS needed |

### Future deploys

Every time you update content:

```bash
npm run deploy          # build + upload + prints new CID
# Then update _dnslink.docs TXT record in GoDaddy with the new CID
```

The old CID stays on IPFS forever — every version of your docs is permanently archived.

---

## Option B — Cloudflare Pages (Fallback)
**`docs.untitledfinancial.com`** — faster, auto-deploys on git push

Use this if load speed becomes a concern. The Storacha IPFS gateway can be slower on first load.

### Step 1 — Push to GitHub

```bash
cd /Users/victoriacase/Documents/GitHub/dpx-docs
git remote add origin https://github.com/YOUR_USERNAME/dpx-docs.git
git push -u origin main
```

### Step 2 — Connect Cloudflare Pages

1. [pages.cloudflare.com](https://pages.cloudflare.com) → **Create a project** → **Connect to Git**
2. Select `dpx-docs`
3. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variable: `NODE_VERSION` = `18`
4. Deploy

### Step 3 — GoDaddy CNAME

In GoDaddy → **untitledfinancial.com** → DNS → Add CNAME:

| Name | Value |
|---|---|
| `docs` | `dpx-docs.pages.dev` |

Then in Cloudflare Pages → Custom domains → add `docs.untitledfinancial.com`

SSL is automatic. Future deploys: `git push` → auto-redeploy in ~90 seconds.

---

## What's deployed (all pages)

| Path | Content |
|---|---|
| `/` | Hero landing page |
| `/beta` | Beta access and waitlist |
| `/agent-quickstart` | 5-step settlement loop + sandbox |
| `/running` | How to start oracles |
| `/fees` | Fee structure |
| `/financial-model` | Financial model |
| `/api/stability-oracle` | Stability Oracle API reference |
| `/api/esg-oracle` | ESG Oracle API reference |
| `/integrations/mcp` | Claude Desktop / MCP |
| `/integrations/gpt-actions` | ChatGPT Custom GPT |
| `/integrations/langchain` | LangChain Python tools |
| `/integrations/n8n` | n8n workflows |
| `/integrations/storacha` | Storacha verifiable storage |
| `/protocol/stability-oracle` | Oracle v6.0 architecture |
| `/protocol/esg-oracle` | ESG oracle + redistribution |
| `/protocol/contracts` | Smart contracts |
| `/llms.txt` | LLM navigation index |
| `/llms-full.txt` | Full compiled docs |
| `/openapi.json` | OpenAPI 3.0 schema |
| `/.well-known/ai-plugin.json` | Agent plugin manifest |
| `/sitemap-index.xml` | Sitemap |
| `/robots.txt` | Crawler permissions |

---

## Skip-build deploy (fastest)

If you've already run `npm run build` and just want to re-upload the existing `dist/`:

```bash
npm run deploy:skip-build
```

## Setup help

```bash
npm run deploy:setup
```

Prints the full credential setup walkthrough.
