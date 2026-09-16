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
      lastUpdated: true,
      components: {
        Banner:    './src/components/Banner.astro',
        Footer:    './src/components/Footer.astro',
        PageTitle: './src/components/PageTitle.astro',
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
            { label: 'AI Agent Prompts',  slug: 'agent-prompts' },
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
          label: 'Guides',
          items: [
            { label: 'For AI builders',            slug: 'guides/for-ai-builders' },
            { label: 'Trust and verification',     slug: 'guides/trust-and-verification' },
            { label: 'Agent-to-agent payments',    slug: 'guides/agent-to-agent-payments' },
            { label: 'AP automation agent',        slug: 'guides/ap-automation' },
            { label: 'Get paid via DPX',           slug: 'guides/get-paid-via-dpx' },
            { label: 'Computer use payments',      slug: 'guides/computer-use-payments' },
            { label: 'Agent frameworks',           slug: 'guides/agent-frameworks' },
            { label: 'Add payments to your agent', slug: 'guides/agent-payments' },
            { label: 'Multi-agent payments',       slug: 'guides/multi-agent-payments' },
            { label: 'Compute procurement',        slug: 'guides/compute-procurement' },
            { label: 'Compliance for agents',      slug: 'guides/compliance-for-agents' },
            { label: 'Error handling',             slug: 'guides/error-handling' },
            { label: 'x402 — agent payments',      slug: 'integrations/x402' },
            { label: 'x402 intelligence signals',  slug: 'guides/x402-intelligence' },
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
          label: 'Changelog',
          items: [
            { label: 'Changelog', slug: 'changelog' },
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
            { label: 'Reports',             slug: 'api/reports' },
          ],
        },
        {
          label: 'Agent Integrations & SDKs',
          items: [
            { label: 'MCP — Claude',            slug: 'integrations/mcp' },
            { label: 'GPT Actions',             slug: 'integrations/gpt-actions' },
            { label: 'LangChain',               slug: 'integrations/langchain' },
            { label: 'CrewAI',                  slug: 'integrations/crewai' },
            { label: 'OpenAI Assistants',        slug: 'integrations/openai-assistants' },
            { label: 'Vapi Voice Agents',        slug: 'integrations/vapi' },
            { label: 'Coinbase AgentKit',        slug: 'integrations/coinbase-agentkit' },
            { label: 'Circle Wallets',           slug: 'integrations/circle' },
            { label: 'REST API',                slug: 'integrations/rest-api' },
            { label: 'dpx-x402 middleware',     slug: 'integrations/dpx-x402' },
          ],
        },
        // Platform Integrations — not live yet, keeping content in place for later
        // {
        //   label: 'Platform Integrations',
        //   items: [
        //     { label: 'Stripe',                  slug: 'integrations/stripe' },
        //     { label: 'Amazon Bedrock',           slug: 'integrations/amazon-bedrock' },
        //     { label: 'Google Vertex AI',         slug: 'integrations/google-vertex' },
        //     { label: 'n8n',                     slug: 'integrations/n8n' },
        //     { label: 'Relevance AI',             slug: 'integrations/relevance-ai' },
        //     { label: 'Microsoft Power Automate', slug: 'integrations/power-automate' },
        //     { label: 'Salesforce Agentforce',    slug: 'integrations/salesforce' },
        //   ],
        // },
        {
          label: 'Treasury Systems',
          items: [
            { label: 'Kyriba',                      slug: 'integrations/kyriba' },
            { label: 'SAP TRM',                      slug: 'integrations/sap-trm' },
            { label: 'Crypto Card Settlement',      slug: 'integrations/crypto-card-settlement' },
            { label: 'Webhook Events',              slug: 'integrations/webhooks' },
            { label: 'Compliance Event Webhooks',   slug: 'integrations/compliance-webhooks' },
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
            { label: 'Agent Transaction Compliance', slug: 'protocol/agent-transaction-compliance' },
            { label: 'UCP Settlement Handler',  slug: 'protocol/ucp-settlement-handler' },
            { label: 'Governance',             slug: 'protocol/governance' },
            { label: 'AI & Climate',           slug: 'protocol/ai-climate-impact' },
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
