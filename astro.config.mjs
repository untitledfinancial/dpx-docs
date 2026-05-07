// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import markdoc from '@astrojs/markdoc';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://docs.untitledfinancial.com',
  integrations: [
    sitemap(),
    markdoc(),
    starlight({
      title: 'DPX Docs',
      description: 'Programmable stablecoin settlement rails — AI-powered oracles, ESG-weighted fees, and 9-layer stability intelligence on Base mainnet.',
      favicon: {
        href: '/favicon.png',
        type: 'image/png',
      },
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
        { tag: 'link', attrs: { rel: 'alternate', type: 'application/json', href: '/openapi.json', title: 'DPX OpenAPI Spec' } },
      ],
      sidebar: [
        {
          label: 'Start Here',
          items: [
            { label: 'What is DPX?',      slug: 'index' },
            { label: 'Agent Quick Start', slug: 'agent-quickstart' },
            { label: 'Sandbox',            slug: 'sandbox' },
          ],
        },
        {
          label: 'Live Data',
          items: [
            { label: '⚡ Fee Calculator',  slug: 'demo',  badge: { text: 'Live', variant: 'tip' } },
            { label: 'Fee Structure',      slug: 'fees' },
            { label: 'Savings Model',      slug: 'financial-model' },
          ],
        },
        {
          label: 'API Reference',
          items: [
            { label: 'Stability Oracle',  slug: 'api/stability-oracle' },
            { label: 'ESG Oracle',        slug: 'api/esg-oracle' },
          ],
        },
        {
          label: 'Agent Integrations',
          items: [
            { label: 'MCP — Claude',      slug: 'integrations/mcp' },
            { label: 'GPT Actions',       slug: 'integrations/gpt-actions' },
            { label: 'LangChain',         slug: 'integrations/langchain' },
            { label: 'REST API',          slug: 'integrations/rest-api' },
          ],
        },
        {
          label: 'Treasury Systems',
          items: [
            { label: 'Kyriba',            slug: 'integrations/kyriba',   badge: { text: 'Coming Soon', variant: 'caution' } },
            { label: 'SAP TRM',           slug: 'integrations/sap-trm',  badge: { text: 'Coming Soon', variant: 'caution' } },
            { label: 'Webhook Events',    slug: 'integrations/webhooks', badge: { text: 'Coming Soon', variant: 'caution' } },
          ],
        },
        {
          label: 'Protocol',
          items: [
            { label: 'Stability Oracle',       slug: 'protocol/stability-oracle' },
            { label: 'ESG Oracle',             slug: 'protocol/esg-oracle' },
            { label: 'Smart Contracts',        slug: 'protocol/contracts' },
            { label: 'Regulatory Positioning', slug: 'protocol/regulatory' },
            { label: 'FATF & Travel Rule',     slug: 'protocol/fatf-compliance' },
            { label: 'Governance',             slug: 'protocol/governance' },
          ],
        },
        {
          label: 'Enterprise',
          items: [
            { label: 'Multi-Tenant Setup',   slug: 'enterprise/multi-tenant' },
            { label: 'ESG for Institutions', slug: 'esg-institutional' },
          ],
        },
      ],
    }),
  ],
});
