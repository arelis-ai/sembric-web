import { SiteFooter, SiteHeader } from './components/Chrome';
import { TrailContext } from './components/ui';
import { breadcrumbTrail, type Route } from './routes';
import { ogImagePath, serializeJsonLd, structuredData } from './seo/jsonld';
import { SITE, absoluteUrl, markdownPath } from './site';

/**
 * Applies the saved or system colour theme before first paint and marks the document as script-capable. The CSP
 * allows exactly this script by hash; tests/csp.test.ts fails if it changes without the Content-Security-Policy.
 */
export const THEME_SCRIPT =
  "(function(){var d=document.documentElement;d.classList.add('js');var t='dark';try{var s=localStorage.getItem('sembric-theme');t=s==='light'||s==='dark'?s:window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}catch(e){}d.dataset.theme=t})();";

export interface BuildAssets {
  css: string[];
  js: string;
  fontPreloads: string[];
}

export function Document({
  route,
  assets,
  notFound = false,
}: {
  route: Route;
  assets: BuildAssets;
  notFound?: boolean;
}) {
  const canonical = absoluteUrl(route.path);
  const ogImage = `${SITE.origin}${ogImagePath(route)}`;
  const ogAlt = `${route.label} — ${SITE.name}, ${SITE.tagline.toLowerCase()}`;
  return (
    <html lang={SITE.language} data-theme="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{route.title}</title>
        <meta name="description" content={route.description} />
        {notFound ? (
          <meta name="robots" content="noindex, follow" />
        ) : (
          <>
            <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
            <link rel="canonical" href={canonical} />
            <link
              rel="alternate"
              type="text/markdown"
              href={markdownPath(route.path)}
              title={`${route.label} (Markdown)`}
            />
          </>
        )}
        <link rel="describedby" type="text/plain" href="/llms.txt" title="llms.txt" />
        <meta name="color-scheme" content="dark light" />
        <meta name="theme-color" content="#0b0f14" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#f5f7f9" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE.name} />
        <meta property="og:locale" content="en_US" />
        <meta property="og:title" content={route.title} />
        <meta property="og:description" content={route.description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={ogAlt} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={route.title} />
        <meta name="twitter:description" content={route.description} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content={ogAlt} />
        {assets.fontPreloads.map((href) => (
          <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />
        ))}
        {assets.css.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script type="module" src={assets.js} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData(route)) }}
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader path={route.path} />
        <main id="main" tabIndex={-1}>
          <TrailContext.Provider value={notFound ? [] : breadcrumbTrail(route)}>{route.render()}</TrailContext.Provider>
        </main>
        <SiteFooter path={notFound ? '/' : route.path} />
        <p className="sr-only" aria-live="polite" data-live-region />
      </body>
    </html>
  );
}
