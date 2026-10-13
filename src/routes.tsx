import type { ReactNode } from 'react';
import { AGENTS_FAQ, HOME_FAQ, PRODUCT_FAQ, SECURITY_FAQ } from './content/faqs';
import { INTEGRATIONS } from './content/integrations';
import type { Faq } from './content/types';
import { Agents } from './pages/Agents';
import { About, Contact, NotFound, Privacy } from './pages/Company';
import { Home } from './pages/Home';
import { IntegrationPage, Integrations } from './pages/Integrations';
import { Product } from './pages/Product';
import { Security } from './pages/Security';

export interface Route {
  path: string;
  /** Full document title, at most 60 characters. */
  title: string;
  /** Meta description, 70–160 characters. */
  description: string;
  /** Short label used in breadcrumbs, llms.txt and the OG image eyebrow. */
  label: string;
  parent?: string;
  pageType: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage';
  faq?: Faq[];
  /** Section of llms.txt this page is listed under. */
  group: 'Product' | 'Integrations' | 'Company' | 'Optional';
  render: () => ReactNode;
}

export const ROUTES: Route[] = [
  {
    path: '/',
    title: 'Sembric: governed, certified data for AI agents',
    description:
      'Sembric sits between your warehouse and your AI agents. Classify fields, certify aggregates and views, and let agents query only certified data over MCP.',
    label: 'Home',
    pageType: 'WebPage',
    faq: HOME_FAQ,
    group: 'Product',
    render: () => <Home />,
  },
  {
    path: '/product',
    title: 'How Sembric works: discover, classify, certify | Sembric',
    description:
      'The Sembric workflow: discover existing tables, steward field classification, certify data products and governed views independently, then enforce every query.',
    label: 'Product',
    pageType: 'WebPage',
    faq: PRODUCT_FAQ,
    group: 'Product',
    render: () => <Product />,
  },
  {
    path: '/security',
    title: 'Security model: your source stays in charge | Sembric',
    description:
      'How Sembric protects warehouse data from AI agents: per-role source identities, no SQL, fail-closed checks, revocable keys, full audit and honest cost limits.',
    label: 'Security',
    pageType: 'WebPage',
    faq: SECURITY_FAQ,
    group: 'Product',
    render: () => <Security />,
  },
  {
    path: '/agents',
    title: 'MCP server and API for AI agents | Sembric',
    description:
      'Connect Claude Code or any MCP client to Sembric: eight read-only tools, revocable keys or OIDC tokens, typed filters and time grains, every call audited.',
    label: 'Agents and MCP',
    pageType: 'WebPage',
    faq: AGENTS_FAQ,
    group: 'Product',
    render: () => <Agents />,
  },
  {
    path: '/integrations',
    title: 'Integrations: BigQuery, Snowflake, Trino and more | Sembric',
    description:
      'Governed AI agent access for BigQuery, Snowflake, Trino, Databricks, PostgreSQL and MySQL, with a customer identity per role and source policies preserved.',
    label: 'Integrations',
    pageType: 'CollectionPage',
    group: 'Integrations',
    render: () => <Integrations />,
  },
  ...INTEGRATIONS.map((integration): Route => ({
    path: `/integrations/${integration.slug}`,
    title: `Governed ${integration.name} access for AI agents | Sembric`,
    description: integration.description,
    label: integration.name,
    parent: '/integrations',
    pageType: 'WebPage',
    faq: integration.faq,
    group: 'Integrations',
    render: () => <IntegrationPage slug={integration.slug} />,
  })),
  {
    path: '/about',
    title: 'About Sembric: why agents need certified data | Sembric',
    description:
      'Why Sembric exists: agents should get answers people have vouched for, while customer data stays in its source and the warehouse stays authoritative.',
    label: 'About',
    pageType: 'AboutPage',
    group: 'Company',
    render: () => <About />,
  },
  {
    path: '/contact',
    title: 'Request a Sembric pilot | Sembric',
    description:
      'Start a Sembric pilot on your own warehouse: connect one source, certify a first data product or governed view, and query it from an agent over MCP.',
    label: 'Request a pilot',
    pageType: 'ContactPage',
    group: 'Company',
    render: () => <Contact />,
  },
  {
    path: '/privacy',
    title: 'Website privacy notice | Sembric',
    description:
      'Sembric’s website sets no cookies and runs no trackers. Learn what our hosting logs, how the theme preference is stored and how we use email you send us.',
    label: 'Privacy',
    pageType: 'WebPage',
    group: 'Optional',
    render: () => <Privacy />,
  },
];

export const NOT_FOUND: Route = {
  path: '/404',
  title: 'Page not found | Sembric',
  description:
    'The page you asked for does not exist. Find Sembric’s product, security, integrations and agent pages here.',
  label: 'Not found',
  pageType: 'WebPage',
  group: 'Optional',
  render: () => <NotFound />,
};

export const routeByPath = (path: string) => ROUTES.find((route) => route.path === path);

export const breadcrumbTrail = (route: Route) => {
  const trail: { href: string; label: string }[] = [{ href: '/', label: 'Home' }];
  if (route.path === '/') return trail;
  if (route.parent) {
    const parent = routeByPath(route.parent);
    if (parent) trail.push({ href: parent.path, label: parent.label });
  }
  trail.push({ href: route.path, label: route.label });
  return trail;
};
