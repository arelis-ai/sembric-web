// Site-wide facts. Every product statement on this site must be traceable to the Sembric repository's AGENTS.md or docs.
export const SITE = {
  origin: 'https://sembric.app.arelis.digital',
  name: 'Sembric',
  tagline: 'The governed data layer for AI agents',
  summary:
    'Sembric is a governed data layer between customer-owned warehouses or lakehouses and AI agents. It discovers existing tables and views, lets your team classify fields and certify aggregate data products or governed views, and exposes only those certified surfaces to agents through a typed API and MCP.',
  publisher: { name: 'Arelis AI', url: 'https://arelis.digital' },
  contactEmail: 'contact@arelis.digital',
  language: 'en',
  /** Content revision date shown in the sitemap and Markdown copies. Update when page content changes. */
  updated: '2026-10-14',
} as const;

export const pilotMailto = `mailto:${SITE.contactEmail}?subject=${encodeURIComponent('Sembric pilot request')}`;

export const absoluteUrl = (path: string) => (path === '/' ? `${SITE.origin}/` : `${SITE.origin}${path}`);

/** The Markdown copy of a page: `/` → `/index.md`, `/product` → `/product.md`. */
export const markdownPath = (path: string) => (path === '/' ? '/index.md' : `${path}.md`);

export const MCP_TOOLS = [
  ['sembric_list_products', 'List the certified aggregate data products granted to the caller’s role.'],
  ['sembric_describe_product', 'Read a product’s definition, caveats, declared dimensions and their types.'],
  ['sembric_query_product', 'Query a product by up to three declared dimensions, typed filters and a bounded limit.'],
  ['sembric_list_views', 'List the certified governed views granted to the caller’s role.'],
  ['sembric_describe_view', 'Read a view’s approved columns, fixed restrictions and caveats.'],
  ['sembric_query_view', 'Read approved columns with typed filters; fixed row restrictions always apply.'],
  ['sembric_list_concepts', 'List business concepts grounded by surfaces the caller can see.'],
  ['sembric_get_ontology', 'Read typed relationships between those concepts.'],
] as const;
