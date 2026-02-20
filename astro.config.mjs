// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import markdoc from '@astrojs/markdoc';

export default defineConfig({
  site: 'https://docs.dpx.finance',
  integrations: [
    markdoc(),
    starlight({
      title: 'DPX Docs',
      description: 'Programmable stablecoin settlement rails — agent-native API, ESG-weighted fees, and 6-tier stability oracle on Base mainnet.',
      logo: {
        light: './src/assets/dpx-logo-light.svg',
        dark:  './src/assets/dpx-logo-dark.svg',
        replacesTitle: false,
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/untitledfinancial' },
        { icon: 'email',  label: 'Email',  href: 'mailto:victoria@dpx.finance' },
      ],
      editLink: {
        baseUrl: 'https://github.com/untitledfinancial/dpx-docs/edit/main/',
      },
      customCss: ['./src/styles/custom.css'],
      head: [
        // Agent discovery — these tell crawlers and LLMs where to find structured data
        { tag: 'link', attrs: { rel: 'alternate', type: 'application/json', href: '/openapi.json', title: 'DPX OpenAPI Spec' } },
      ],
      sidebar: [
        {
          label: 'Start Here',
          items: [
            { label: 'What is DPX?',       slug: 'index' },
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
          label: 'Integrations',
          items: [
            { label: 'MCP — Claude',       slug: 'integrations/mcp' },
            { label: 'GPT Actions',        slug: 'integrations/gpt-actions' },
            { label: 'LangChain',          slug: 'integrations/langchain' },
            { label: 'n8n',                slug: 'integrations/n8n' },
            { label: 'Storacha — Storage', slug: 'integrations/storacha' },
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
