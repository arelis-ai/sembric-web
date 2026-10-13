import { renderToStaticMarkup } from 'react-dom/server';
import { Document, THEME_SCRIPT, type BuildAssets } from './Document';
import { NOT_FOUND, ROUTES, breadcrumbTrail, type Route } from './routes';
import { ogImagePath } from './seo/jsonld';
import { MCP_TOOLS, SITE, absoluteUrl, markdownPath } from './site';

export { MCP_TOOLS, NOT_FOUND, ROUTES, SITE, THEME_SCRIPT, absoluteUrl, breadcrumbTrail, markdownPath, ogImagePath };
export type { BuildAssets, Route };

/** The complete HTML document for a route. Pages are static: no hydration markers, no client React. */
export function renderDocument(route: Route, assets: BuildAssets, notFound = false) {
  return `<!doctype html>${renderToStaticMarkup(<Document route={route} assets={assets} notFound={notFound} />)}`;
}

/** Only the page body (without site chrome), used to derive the page's Markdown copy. */
export function renderMain(route: Route) {
  return renderToStaticMarkup(<>{route.render()}</>);
}
