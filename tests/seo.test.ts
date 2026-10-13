import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { NOT_FOUND, ROUTES } from '../src/routes';
import { SITE, absoluteUrl, markdownPath } from '../src/site';
import { DIST, htmlFile, jsonLd, metaName, metaProperty, pngSize, readDist, tagAttr, visibleText } from './helpers';

const REQUIRED_PATHS = [
  '/',
  '/product',
  '/security',
  '/integrations',
  '/integrations/bigquery',
  '/integrations/snowflake',
  '/integrations/trino',
  '/integrations/databricks',
  '/integrations/postgresql',
  '/integrations/mysql',
  '/agents',
  '/about',
  '/contact',
  '/privacy',
];

const AI_AGENTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot',
  'Google-Extended',
];

describe('route coverage', () => {
  it('prerenders every required page', () => {
    expect(ROUTES.map((route) => route.path).sort()).toEqual([...REQUIRED_PATHS].sort());
    for (const path of REQUIRED_PATHS) expect(existsSync(join(DIST, htmlFile(path))), path).toBe(true);
  });

  it('gives every page a unique title and description within search-result limits', () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const route of ROUTES) {
      const html = readDist(htmlFile(route.path));
      const title = html.match(/<title>([^<]*)<\/title>/g) ?? [];
      expect(title, route.path).toHaveLength(1);
      expect(route.title.length, `${route.path} title length`).toBeLessThanOrEqual(60);
      expect(route.title.length).toBeGreaterThanOrEqual(25);
      const [description] = metaName(html, 'description');
      expect(description, route.path).toBe(route.description);
      expect(description.length, `${route.path} description length`).toBeGreaterThanOrEqual(70);
      expect(description.length, `${route.path} description length`).toBeLessThanOrEqual(160);
      titles.add(route.title);
      descriptions.add(description);
    }
    expect(titles.size).toBe(ROUTES.length);
    expect(descriptions.size).toBe(ROUTES.length);
  });
});

describe.each(ROUTES.map((route) => [route.path, route] as const))('%s', (path, route) => {
  const html = readDist(htmlFile(path));
  const canonical = absoluteUrl(path);

  it('declares language, one h1, indexing and a canonical URL', () => {
    expect(html).toMatch(/^<!doctype html><html lang="en"/);
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(metaName(html, 'robots')[0]).toMatch(/^index, follow/);
    expect(tagAttr(html, 'link', 'rel', 'canonical', 'href')).toEqual([canonical]);
  });

  it('has complete Open Graph and Twitter card tags with a 1200×630 image', () => {
    expect(metaProperty(html, 'og:title')).toEqual([route.title]);
    expect(metaProperty(html, 'og:description')).toEqual([route.description]);
    expect(metaProperty(html, 'og:url')).toEqual([canonical]);
    expect(metaProperty(html, 'og:type')).toEqual(['website']);
    const [image] = metaProperty(html, 'og:image');
    expect(image.startsWith(`${SITE.origin}/og/`)).toBe(true);
    expect(pngSize(image.replace(SITE.origin, '').slice(1))).toEqual({ width: 1200, height: 630 });
    expect(metaProperty(html, 'og:image:alt')[0].length).toBeGreaterThan(10);
    expect(metaName(html, 'twitter:card')).toEqual(['summary_large_image']);
    expect(metaName(html, 'twitter:image')).toEqual([image]);
    expect(metaName(html, 'twitter:title')).toEqual([route.title]);
  });

  it('links a Markdown copy that exists and starts with the page heading', () => {
    expect(tagAttr(html, 'link', 'type', 'text/markdown', 'href')).toEqual([markdownPath(path)]);
    const markdown = readDist(markdownPath(path).slice(1));
    expect(markdown.startsWith('# ')).toBe(true);
    expect(markdown).toContain(`Canonical URL: ${canonical}`);
  });

  it('carries Organization, WebSite, SoftwareApplication, BreadcrumbList and matching FAQPage JSON-LD', () => {
    const blocks = jsonLd(html);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]['@context']).toBe('https://schema.org');
    const graph = blocks[0]['@graph'];
    const types = graph.map((node) => node['@type']);
    for (const type of ['Organization', 'WebSite', 'SoftwareApplication', 'BreadcrumbList', route.pageType]) {
      expect(types, type).toContain(type);
    }
    const breadcrumbs = graph.find((node) => node['@type'] === 'BreadcrumbList')!;
    expect(breadcrumbs.itemListElement.at(-1).item).toBe(canonical);
    expect(breadcrumbs.itemListElement[0].item).toBe(`${SITE.origin}/`);
    const faq = graph.find((node) => node['@type'] === 'FAQPage');
    if (route.faq?.length) {
      expect(faq?.mainEntity).toHaveLength(route.faq.length);
      const text = visibleText(html);
      for (const item of route.faq) {
        expect(text, item.q).toContain(item.q);
        expect(text, item.a).toContain(item.a);
      }
    } else {
      expect(faq).toBeUndefined();
    }
  });

  it('uses no inline style attributes, which the Content-Security-Policy would block', () => {
    expect(html).not.toMatch(/\sstyle="/);
  });
});

describe('not-found page', () => {
  const html = readDist('404.html');
  it('is excluded from indexing and has no canonical URL', () => {
    expect(metaName(html, 'robots')).toEqual(['noindex, follow']);
    expect(tagAttr(html, 'link', 'rel', 'canonical', 'href')).toEqual([]);
    expect(html).toContain(NOT_FOUND.title);
  });
});

describe('crawler files', () => {
  it('lists exactly the canonical pages in sitemap.xml with lastmod', () => {
    const sitemap = readDist('sitemap.xml');
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    expect(locs.sort()).toEqual(ROUTES.map((route) => absoluteUrl(route.path)).sort());
    expect(sitemap.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g)).toHaveLength(ROUTES.length);
  });

  it('allows search engines and every named AI crawler in robots.txt', () => {
    const robots = readDist('robots.txt');
    expect(robots).toMatch(/^User-agent: \*\nAllow: \/$/m);
    for (const agent of AI_AGENTS) expect(robots).toMatch(new RegExp(`^User-agent: ${agent}$`, 'm'));
    expect(robots).not.toMatch(/^Disallow:/m);
    expect(robots).toContain(`Sitemap: ${SITE.origin}/sitemap.xml`);
  });

  it('publishes llms.txt in the llmstxt.org shape with every page', () => {
    const llms = readDist('llms.txt');
    const lines = llms.split('\n');
    expect(lines[0]).toBe('# Sembric');
    expect(lines.find((line) => line.startsWith('> '))).toBeDefined();
    expect(llms).toMatch(/^## Optional$/m);
    for (const route of ROUTES) expect(llms).toContain(`(${SITE.origin}${markdownPath(route.path)})`);
  });

  it('publishes llms-full.txt with the text of every page', () => {
    const full = readDist('llms-full.txt');
    for (const route of ROUTES) {
      const heading = readDist(markdownPath(route.path).slice(1)).split('\n')[0];
      expect(full).toContain(heading);
    }
  });

  it('publishes an RFC 9116 security.txt that has not expired', () => {
    const security = readDist('.well-known/security.txt');
    expect(security).toMatch(/^Contact: mailto:/m);
    const expires = new Date(security.match(/^Expires: (.+)$/m)![1]);
    expect(expires.getTime()).toBeGreaterThan(Date.now());
    expect(expires.getTime()).toBeLessThan(Date.now() + 366 * 24 * 60 * 60 * 1000);
  });
});
