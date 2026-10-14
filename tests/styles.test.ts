import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ROUTES } from '../src/routes';
import { DIST, htmlFile, readDist } from './helpers';

const source = readFileSync(join(process.cwd(), 'src', 'styles', 'site.css'), 'utf8');
const built = readdirSync(join(DIST, 'assets'))
  .filter((file) => file.endsWith('.css'))
  .map((file) => readDist(`assets/${file}`))
  .join('\n');

describe('stylesheet', () => {
  it('keeps the unprefixed backdrop-filter that Chromium and Firefox need after minification', () => {
    expect(built).toMatch(/[;{]backdrop-filter:/);
  });

  it('sets no text smaller than 12px', () => {
    const sizes = [...source.matchAll(/font-size:\s*([\d.]+)px/g)].map((match) => Number(match[1]));
    expect(sizes.length).toBeGreaterThan(10);
    expect(sizes.filter((size) => size < 12)).toEqual([]);
  });

  it('honours reduced motion, forced colours, higher contrast and print', () => {
    for (const query of ['prefers-reduced-motion: reduce', 'forced-colors: active', 'prefers-contrast: more', 'print'])
      expect(source).toContain(`@media (${query})`.replace('(print)', 'print'));
  });
});

describe('page structure', () => {
  const sectionIds = (html: string) => [...html.matchAll(/<section id="([^"]+)"/g)].map((match) => match[1]);

  it('gives long pages an "On this page" navigation that lists their sections in order', () => {
    // The home page is a narrative read top to bottom; its header already links every topic page.
    for (const route of ROUTES.filter((route) => route.path !== '/')) {
      const html = readDist(htmlFile(route.path));
      const ids = sectionIds(html);
      const nav = html.match(/<nav class="page-nav"[\s\S]*?<\/nav>/)?.[0];
      if (ids.length < 6) continue;
      expect(nav, `${route.path} has ${ids.length} sections`).toBeDefined();
      const targets = [...nav!.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
      expect(targets.length, route.path).toBeGreaterThanOrEqual(5);
      for (const target of targets) expect(ids, `${route.path} → #${target}`).toContain(target);
      expect(
        targets.map((target) => ids.indexOf(target)),
        route.path,
      ).toEqual([...targets.map((target) => ids.indexOf(target))].sort((a, b) => a - b));
    }
  });

  it('puts breadcrumbs inside the page hero on every page below the home page', () => {
    for (const route of ROUTES.filter((route) => route.path !== '/')) {
      const hero = readDist(htmlFile(route.path)).match(/<section class="page-hero"[\s\S]*?<\/section>/)?.[0];
      expect(hero, route.path).toContain('aria-label="Breadcrumb"');
    }
  });

  it('keeps chrome out of the Markdown copies', () => {
    for (const route of ROUTES) {
      const markdown = readDist(route.path === '/' ? 'index.md' : `${route.path.slice(1)}.md`);
      expect(markdown, route.path).not.toContain('On this page');
      expect(markdown, route.path).not.toMatch(/^- \[Home\]/m);
    }
  });
});
