# Deploy DPX Docs — Full Guide
## GoDaddy domain → Cloudflare Pages (Free)

This gets `docs.dpx.finance` live in about 15 minutes.

---

## Step 1 — Initialize git and push to GitHub

Run these commands in your terminal:

```bash
cd /Users/victoriacase/Documents/GitHub/dpx-docs

# Initialize git
git init
git add .
git commit -m "Initial DPX docs site — Astro + Starlight"

# Create a new repo on GitHub (do this in the browser first)
# → github.com → New repository → name: dpx-docs → Private or Public → Create
# Then come back and run:

git remote add origin https://github.com/YOUR_USERNAME/dpx-docs.git
git branch -M main
git push -u origin main
```

> Replace `YOUR_USERNAME` with your GitHub username.

---

## Step 2 — Connect to Cloudflare Pages

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Click **Create a project**
3. Click **Connect to Git** → authorize GitHub if prompted
4. Select your **dpx-docs** repository → click **Begin setup**
5. Set build settings:

| Setting | Value |
|---|---|
| Project name | `dpx-docs` |
| Production branch | `main` |
| Framework preset | `Astro` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version (env var) | `18` |

   To set Node version: scroll to **Environment variables** → Add variable → `NODE_VERSION` = `18`

6. Click **Save and Deploy**

Cloudflare will pull your repo, run `npm run build`, and publish the `dist` folder. First deploy takes ~2 minutes.

---

## Step 3 — Add your custom domain in Cloudflare Pages

Once the first deploy is done:

1. In your Cloudflare Pages project → click **Custom domains** tab
2. Click **Set up a custom domain**
3. Type: `docs.dpx.finance`
4. Click **Continue**
5. Cloudflare will show you the DNS record to add. It will look like:

```
Type:  CNAME
Name:  docs
Value: dpx-docs.pages.dev
```

---

## Step 4 — Add the CNAME in GoDaddy

1. Log in to [godaddy.com](https://godaddy.com)
2. Go to **My Products** → find `dpx.finance` → click **DNS**
3. Scroll to the **CNAME** section → click **Add**
4. Fill in:

| Field | Value |
|---|---|
| Type | CNAME |
| Name | docs |
| Value | dpx-docs.pages.dev |
| TTL | 1 Hour (default) |

5. Click **Save**

> DNS changes can take 1–48 hours to propagate globally, but usually work within 5–10 minutes.

---

## Step 5 — Verify SSL in Cloudflare Pages

Back in Cloudflare Pages:

1. Go to your project → **Custom domains**
2. Watch `docs.dpx.finance` status change from **Initializing** → **Active**
3. Cloudflare issues a free SSL certificate automatically — no action needed

Once Active, visit **https://docs.dpx.finance** — your docs are live.

---

## What's deployed

| URL | Page |
|---|---|
| `docs.dpx.finance` | Hero landing page |
| `docs.dpx.finance/agent-quickstart` | 5-step settlement loop |
| `docs.dpx.finance/running` | How to start oracles |
| `docs.dpx.finance/fees` | Fee structure |
| `docs.dpx.finance/financial-model` | Financial model |
| `docs.dpx.finance/api/stability-oracle` | Stability Oracle API reference |
| `docs.dpx.finance/api/esg-oracle` | ESG Oracle API reference |
| `docs.dpx.finance/integrations/mcp` | MCP / Claude Desktop |
| `docs.dpx.finance/integrations/gpt-actions` | GPT Actions |
| `docs.dpx.finance/integrations/langchain` | LangChain |
| `docs.dpx.finance/integrations/n8n` | n8n workflows |
| `docs.dpx.finance/integrations/storacha` | Storacha verifiable storage |
| `docs.dpx.finance/protocol/stability-oracle` | Oracle architecture |
| `docs.dpx.finance/protocol/esg-oracle` | ESG oracle |
| `docs.dpx.finance/protocol/contracts` | Smart contracts |
| `docs.dpx.finance/llms.txt` | LLM navigation index |
| `docs.dpx.finance/llms-full.txt` | Full compiled docs |
| `docs.dpx.finance/openapi.json` | OpenAPI 3.0 schema |
| `docs.dpx.finance/.well-known/ai-plugin.json` | Agent plugin manifest |
| `docs.dpx.finance/sitemap-index.xml` | Sitemap |
| `docs.dpx.finance/robots.txt` | Crawler permissions |

---

## Future deploys (automatic)

Every time you push to `main`, Cloudflare automatically rebuilds and redeploys. No manual steps.

```bash
# Make changes, then:
git add .
git commit -m "Update docs"
git push
# → Cloudflare deploys automatically in ~90 seconds
```

---

## Cloudflare Pages free tier limits

| Limit | Free tier |
|---|---|
| Builds per month | 500 |
| Bandwidth | Unlimited |
| Custom domains | Unlimited |
| SSL certificates | Automatic, free |
| Team members | 1 |

No credit card required.

---

## Other subdomains you may want later

Once your DNS is in Cloudflare (not just GoDaddy), you can add more records for the oracle APIs:

| Subdomain | Points to |
|---|---|
| `docs.dpx.finance` | Cloudflare Pages |
| `stability.dpx.finance` | Your Stability Oracle server |
| `esg.dpx.finance` | Your ESG Oracle server |

For the oracle servers, use an **A record** pointing to your server IP, or a **CNAME** if you're deploying to Railway / Render / Fly.io.
