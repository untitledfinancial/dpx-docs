// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import markdoc from '@astrojs/markdoc';

export default defineConfig({
  site: 'https://docs.untitledfinancial.com',
  integrations: [
    markdoc(),
    starlight({
      title: 'DPX Docs',
      description: 'Programmable stablecoin settlement rails — agent-native API, ESG-weighted fees, and 6-tier stability oracle on Base mainnet.',
      components: {
        Banner:  './src/components/Banner.astro',
        Footer:  './src/components/Footer.astro',
      },
      logo: {
        src: './src/assets/dpx-logo.png',
        replacesTitle: false,
        alt: 'DPX',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/untitledfinancial' },
      ],
      customCss: ['./src/styles/custom.css'],
      defaultLocale: 'en',
      expressiveCode: {
        themes: ['github-light'],
      },
      head: [
        // Google Fonts — Cormorant Garamond + Inter
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' } },
        { tag: 'link', attrs: { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;700&display=swap' } },
        // Agent discovery — these tell crawlers and LLMs where to find structured data
        { tag: 'link', attrs: { rel: 'alternate', type: 'application/json', href: '/openapi.json', title: 'DPX OpenAPI Spec' } },
      ],
      sidebar: [
        {
          label: 'Start Here',
          items: [
            { label: 'What is DPX?',       slug: 'index' },
            { label: '🔑 Beta Access',     slug: 'beta' },
            { label: 'Agent Quick Start',  slug: 'agent-quickstart' },
            { label: 'Run the Oracles',    slug: 'running' },
          ],
        },
        {
          label: 'Fees & Pricing',
          items: [
            { label: 'Fee Structure',      slug: 'fees' },
            { label: 'Financial Model',    slug: 'financial-model' },
          ],
        },
        {
          label: 'API Reference',
          items: [
            { label: 'Stability Oracle',   slug: 'api/stability-oracle' },
            { label: 'ESG Oracle',         slug: 'api/esg-oracle' },
          ],
        },
        {
          label: 'AI Agents',
          items: [
            { label: 'MCP — Claude',       slug: 'integrations/mcp' },
            { label: 'GPT Actions',        slug: 'integrations/gpt-actions' },
            { label: 'LangChain',          slug: 'integrations/langchain' },
            { label: 'n8n',                slug: 'integrations/n8n' },
            { label: 'Storacha — Storage', slug: 'integrations/storacha' },
          ],
        },
        {
          label: 'Treasury Systems',
          items: [
            { label: 'REST API — Any TMS', slug: 'integrations/rest-api' },
            { label: 'Kyriba',             slug: 'integrations/kyriba',  badge: { text: 'Coming Soon', variant: 'caution' } },
            { label: 'SAP TRM',            slug: 'integrations/sap-trm', badge: { text: 'Coming Soon', variant: 'caution' } },
            { label: 'Webhook Events',     slug: 'integrations/webhooks', badge: { text: 'Coming Soon', variant: 'caution' } },
          ],
        },
        {
          label: 'Protocol',
          items: [
            { label: 'Stability Oracle',   slug: 'protocol/stability-oracle' },
            { label: 'ESG Oracle',         slug: 'protocol/esg-oracle' },
            { label: 'Smart Contracts',    slug: 'protocol/contracts' },
          ],
        },
      ],
    }),
  ],
});
