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
      favicon: '/favicon.png',
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
          label: 'Use Cases',
          items: [
            { label: 'Agent-to-Agent Payments', slug: 'use-cases/agent-economy' },
          ],
        },
        {
          label: 'European Institutions',
          items: [
            { label: 'Quickstart',          slug: 'guides/european-institutions' },
            { label: 'SFDR & CSRD',         slug: 'protocol/sfdr-csrd' },
            { label: 'EURC Settlement',     slug: 'integrations/eurc' },
            { label: 'SWIFT Compatibility', slug: 'integrations/swift' },
            { label: 'Kyriba',              slug: 'integrations/kyriba' },
            { label: 'SAP TRM',             slug: 'integrations/sap-trm' },
          ],
        },
        {
          label: 'Live Data',
          items: [
            { label: '⚡ Fee Calculator',  slug: 'demo' },
          ],
        },
        {
          label: 'API Reference',
          items: [
            { label: 'Integration API',     slug: 'api/integration-api' },
            { label: 'Stability Oracle',    slug: 'api/stability-oracle' },
            { label: 'Intelligence API',    slug: 'api/intelligence-api' },
            // { label: 'Oracle Feeds — Free', slug: 'api/oracle-feeds' },
            { label: 'ESG Oracle',          slug: 'api/esg-oracle' },
            { label: 'Compliance Oracle',   slug: 'api/compliance-oracle' },
            { label: 'Commodity Forecast',  slug: 'api/commodity-forecast' },
          ],
        },
        {
          label: 'Agent Integrations & SDKs',
          items: [
            { label: 'MCP — Claude',            slug: 'integrations/mcp' },
            { label: 'ElevenLabs Voice Agents',  slug: 'integrations/elevenlabs' },
            { label: 'GPT Actions',             slug: 'integrations/gpt-actions' },
            { label: 'LangChain',               slug: 'integrations/langchain' },
            { label: 'CrewAI',                  slug: 'integrations/crewai' },
            { label: 'OpenAI Assistants',        slug: 'integrations/openai-assistants' },
            { label: 'Vapi Voice Agents',        slug: 'integrations/vapi' },
            { label: 'Coinbase AgentKit',        slug: 'integrations/coinbase-agentkit' },
            { label: 'Circle Wallets',           slug: 'integrations/circle' },
            { label: 'REST API',                slug: 'integrations/rest-api' },
          ],
        },
        {
          label: 'Platform Integrations',
          items: [
            { label: 'Stripe',                  slug: 'integrations/stripe' },
            { label: 'Amazon Bedrock',           slug: 'integrations/amazon-bedrock' },
            { label: 'Google Vertex AI',         slug: 'integrations/google-vertex' },
            { label: 'n8n',                     slug: 'integrations/n8n' },
            { label: 'Relevance AI',             slug: 'integrations/relevance-ai' },
            { label: 'Microsoft Power Automate', slug: 'integrations/power-automate' },
            { label: 'Salesforce Agentforce',    slug: 'integrations/salesforce' },
          ],
        },
        {
          label: 'Treasury Systems',
          items: [
            { label: 'Kyriba',            slug: 'integrations/kyriba' },
            { label: 'SAP TRM',           slug: 'integrations/sap-trm' },
            { label: 'Webhook Events',    slug: 'integrations/webhooks' },
          ],
        },
        {
          label: 'Protocol',
          items: [
            { label: 'Stability Oracle',       slug: 'protocol/stability-oracle' },
            { label: 'ESG Oracle',             slug: 'protocol/esg-oracle' },
            { label: 'Smart Contracts',        slug: 'protocol/contracts' },
            { label: 'Regulatory Positioning', slug: 'protocol/regulatory' },
            { label: 'SFDR & CSRD',            slug: 'protocol/sfdr-csrd' },
            { label: 'FATF & Travel Rule',     slug: 'protocol/fatf-compliance' },
            { label: 'FinCEN Travel Rule (US)', slug: 'protocol/fincen-travel-rule' },
            { label: 'Governance',             slug: 'protocol/governance' },
          ],
        },
        {
          label: 'Products',
          items: [
            { label: 'Oracle Data API',         slug: 'products/oracle-data' },
            { label: 'Compliance Screening API', slug: 'products/compliance-api' },
            { label: 'MCP Subscriptions',        slug: 'products/mcp-subscriptions' },
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
