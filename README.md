# DPX Docs

Documentation site for DPX — programmable stablecoin settlement rails, AI-powered oracles, and ESG-weighted fees on Base mainnet. Built with [Astro Starlight](https://starlight.astro.build).

## Project structure

```
.
├── public/              # llms.txt, openapi.json, ai-plugin.json, static assets
├── src/
│   ├── assets/
│   ├── components/      # Banner.astro, Footer.astro
│   ├── content/docs/    # all doc pages — routed by file path
│   └── content.config.ts
├── astro.config.mjs      # sidebar nav lives here
└── package.json
```

## Commands

All commands run from the root of the project:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build production site to `./dist/`               |
| `npm run preview`         | Preview a production build locally               |
| `npm run deploy`          | Build + deploy via Storacha/IPFS                 |
| `npm run deploy:cf`       | Build + deploy via Cloudflare Pages               |

See [DEPLOY.md](./DEPLOY.md) for full deployment instructions.
