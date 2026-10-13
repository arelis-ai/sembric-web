import { breadcrumbTrail, type Route } from '../routes';
import { SITE, absoluteUrl } from '../site';

const ORG_ID = `${SITE.origin}/#organization`;
const WEBSITE_ID = `${SITE.origin}/#website`;
const SOFTWARE_ID = `${SITE.origin}/#software`;

export const ogImagePath = (route: Route) =>
  `/og/${route.path === '/' ? 'home' : route.path.slice(1).replace(/\//g, '-')}.png`;

/** One schema.org graph per page: publisher, site, product, the page itself, its breadcrumbs and any FAQ. */
export function structuredData(route: Route) {
  const url = absoluteUrl(route.path);
  const trail = breadcrumbTrail(route);
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: SITE.publisher.name,
      url: SITE.publisher.url,
      email: SITE.contactEmail,
      logo: { '@type': 'ImageObject', url: `${SITE.origin}/icon-512.png`, width: 512, height: 512 },
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: `${SITE.origin}/`,
      name: SITE.name,
      description: SITE.summary,
      inLanguage: SITE.language,
      publisher: { '@id': ORG_ID },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': SOFTWARE_ID,
      name: SITE.name,
      url: `${SITE.origin}/`,
      description: SITE.summary,
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'Data governance for AI agents',
      operatingSystem: 'Web',
      publisher: { '@id': ORG_ID },
      featureList: [
        'Read-only discovery of existing warehouse tables and views',
        'Field classification with data steward review',
        'Independent certification of aggregate data products and governed views',
        'Model Context Protocol server and typed REST API with no SQL route',
        'Audit of every agent query, answered or refused',
        'Connectors for BigQuery, Snowflake, Trino, Databricks, PostgreSQL and MySQL',
      ],
    },
    {
      '@type': route.pageType,
      '@id': `${url}#webpage`,
      url,
      name: route.title,
      description: route.description,
      inLanguage: SITE.language,
      dateModified: SITE.updated,
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': SOFTWARE_ID },
      breadcrumb: { '@id': `${url}#breadcrumb` },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: `${SITE.origin}${ogImagePath(route)}`,
        width: 1200,
        height: 630,
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: trail.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.label,
        item: absoluteUrl(crumb.href),
      })),
    },
  ];
  if (route.faq?.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      url,
      isPartOf: { '@id': WEBSITE_ID },
      mainEntity: route.faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

/** JSON for a <script type="application/ld+json"> block, with `<` escaped so no text can close the element. */
export const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');
