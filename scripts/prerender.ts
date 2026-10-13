// Renders every route to static HTML and derives the machine-readable surfaces from the same source: Markdown copies,
// llms.txt, llms-full.txt, sitemap.xml, robots.txt, security.txt, Open Graph images, icons and gzip variants.
import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import TurndownService from 'turndown';
// @ts-expect-error turndown-plugin-gfm ships without types
import { gfm } from 'turndown-plugin-gfm';
import type * as Server from '../src/entry-server';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const server: typeof Server = await import(pathToFileURL(join(root, 'dist-ssr', 'entry-server.js')).href);
const { ROUTES, NOT_FOUND, SITE, absoluteUrl, markdownPath, ogImagePath, renderDocument, renderMain } = server;

function write(path: string, content: string | Buffer) {
  const target = join(dist, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
}

// --- Assets from the client build -------------------------------------------------------------------------------
const manifest = JSON.parse(readFileSync(join(dist, '.vite', 'manifest.json'), 'utf8')) as Record<
  string,
  { file: string; css?: string[]; isEntry?: boolean }
>;
const entry = Object.values(manifest).find((chunk) => chunk.isEntry);
if (!entry) throw new Error('client entry missing from the Vite manifest');
const assetFiles = readdirSync(join(dist, 'assets'));
const preload = (pattern: RegExp) => {
  const file = assetFiles.find((name) => pattern.test(name));
  if (!file) throw new Error(`font for preload not found: ${pattern}`);
  return `/assets/${file}`;
};
const assets: Server.BuildAssets = {
  js: `/${entry.file}`,
  css: (entry.css ?? []).map((file) => `/${file}`),
  fontPreloads: [preload(/^inter-latin-400-normal-.*\.woff2$/), preload(/^inter-latin-700-normal-.*\.woff2$/)],
};
rmSync(join(dist, '.vite'), { recursive: true, force: true });

// --- HTML ---------------------------------------------------------------------------------------------------------
const htmlPath = (path: string) => (path === '/' ? 'index.html' : `${path.slice(1)}/index.html`);
for (const route of ROUTES) write(htmlPath(route.path), renderDocument(route, assets));
write('404.html', renderDocument(NOT_FOUND, assets, true));

// --- Markdown copies ------------------------------------------------------------------------------------------------
const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });
turndown.use(gfm);
turndown.remove(['button', 'script', 'style']);
// Drop decorative and purely visual elements; diagrams keep their figcaption, which describes them in words.
turndown.addRule('decorative', {
  filter: (node) => {
    const element = node as HTMLElement;
    return (
      element.nodeName.toLowerCase() === 'svg' ||
      element.getAttribute?.('aria-hidden') === 'true' ||
      element.getAttribute?.('data-md') === 'skip'
    );
  },
  replacement: () => '',
});

const markdownFor = (route: Server.Route) => {
  const html = renderMain(route).replace(/href="\/(?!\/)/g, `href="${SITE.origin}/`);
  const body = turndown.turndown(html).trim().replace(/\)\[/g, ') · [').split('\n');
  const h1 = body.findIndex((line) => line.startsWith('# '));
  const [title] = body.splice(h1, 1);
  const lead = body.splice(0, h1).filter((line) => line.trim());
  return [
    title,
    '',
    `> ${route.description}`,
    '',
    `Canonical URL: ${absoluteUrl(route.path)}`,
    ...(lead.length ? ['', ...lead] : []),
    '',
    body.join('\n').trim(),
    '',
    '---',
    '',
    `Last updated ${SITE.updated}. Published by ${SITE.publisher.name} (${SITE.publisher.url}).`,
    '',
  ].join('\n');
};
const markdown = new Map(ROUTES.map((route) => [route.path, markdownFor(route)]));
for (const route of ROUTES) write(markdownPath(route.path).slice(1), markdown.get(route.path)!);

// --- llms.txt and llms-full.txt -----------------------------------------------------------------------------------
const groups = ['Product', 'Integrations', 'Company', 'Optional'] as const;
const llms = [
  `# ${SITE.name}`,
  '',
  `> ${SITE.summary}`,
  '',
  'Key facts for agents and assistants:',
  '',
  '- Customer data stays in its source warehouse or lakehouse; Sembric does not ingest, copy or transform it.',
  '- No agent route accepts SQL. Agents query certified surfaces with declared fields, typed filters and bounded limits.',
  '- Certification requires a data steward’s classification review and an independent reviewer who runs expected-answer checks under every granted role; certificates expire after 30 days by default.',
  '- Agents connect over the Model Context Protocol (HTTP) or a typed REST API with revocable Sembric keys or OIDC tokens.',
  '- Every agent query is audited, answered or refused.',
  '- Connectors: BigQuery, Snowflake, Trino, Databricks, PostgreSQL and MySQL. Sembric is available for pilots.',
  `- Contact: ${SITE.contactEmail}`,
  '',
  ...groups.flatMap((group) => {
    const links = ROUTES.filter((route) => route.group === group).map(
      (route) => `- [${route.label}](${SITE.origin}${markdownPath(route.path)}): ${route.description}`,
    );
    if (group === 'Optional')
      links.push(`- [Full site text](${SITE.origin}/llms-full.txt): Every page above in one Markdown file.`);
    return [`## ${group}`, '', ...links, ''];
  }),
].join('\n');
write('llms.txt', llms);
write(
  'llms-full.txt',
  [
    `# ${SITE.name}: full site text`,
    '',
    `> ${SITE.summary}`,
    '',
    ...ROUTES.map((route) => markdown.get(route.path)!),
  ].join('\n\n---\n\n'),
);

// --- sitemap.xml, robots.txt, security.txt, web manifest ----------------------------------------------------------
write(
  'sitemap.xml',
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...ROUTES.map((route) => `  <url><loc>${absoluteUrl(route.path)}</loc><lastmod>${SITE.updated}</lastmod></url>`),
    '</urlset>',
    '',
  ].join('\n'),
);

// Search engines and AI agents are welcome. Each AI crawler and fetcher is named explicitly so the intent is clear.
const AI_AGENTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Google-Agent',
  'Applebot-Extended',
  'CCBot',
  'meta-externalagent',
  'MistralAI-User',
];
write(
  'robots.txt',
  [
    '# Sembric welcomes search engines and AI agents. Markdown copies of every page are listed in /llms.txt.',
    'User-agent: *',
    'Allow: /',
    '',
    ...AI_AGENTS.map((agent) => `User-agent: ${agent}`),
    'Allow: /',
    '',
    `Sitemap: ${SITE.origin}/sitemap.xml`,
    '',
  ].join('\n'),
);

const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
expires.setUTCHours(0, 0, 0, 0);
write(
  '.well-known/security.txt',
  [
    `Contact: mailto:${SITE.contactEmail}`,
    `Expires: ${expires.toISOString().replace('.000Z', 'Z')}`,
    'Preferred-Languages: en',
    `Canonical: ${SITE.origin}/.well-known/security.txt`,
    '',
  ].join('\n'),
);

write(
  'site.webmanifest',
  JSON.stringify(
    {
      name: SITE.name,
      short_name: SITE.name,
      description: SITE.tagline,
      start_url: '/',
      display: 'browser',
      background_color: '#0b0f14',
      theme_color: '#0b0f14',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      ],
    },
    null,
    2,
  ),
);

// --- Icons and Open Graph images ----------------------------------------------------------------------------------
const favicon = readFileSync(join(root, 'public', 'favicon.svg'), 'utf8');
const png = (svg: string, width: number) => new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();
write('apple-touch-icon.png', png(favicon, 180));
write('icon-192.png', png(favicon, 192));
write('icon-512.png', png(favicon, 512));

const font = (pkg: string, file: string) => readFileSync(join(root, 'node_modules', '@fontsource', pkg, 'files', file));
const fonts = [
  { name: 'Inter', data: font('inter', 'inter-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
  { name: 'Inter', data: font('inter', 'inter-latin-700-normal.woff'), weight: 700 as const, style: 'normal' as const },
  {
    name: 'JetBrains Mono',
    data: font('jetbrains-mono', 'jetbrains-mono-latin-500-normal.woff'),
    weight: 500 as const,
    style: 'normal' as const,
  },
];
type Node = { type: string; props: Record<string, unknown> };
const h = (
  type: string,
  style: Record<string, unknown>,
  children?: unknown,
  extra: Record<string, unknown> = {},
): Node => ({
  type,
  props: { style, children, ...extra },
});
const faviconData = `data:image/svg+xml;base64,${Buffer.from(favicon).toString('base64')}`;
const ogTitle = (route: Server.Route) =>
  route.path === '/'
    ? 'Give AI agents certified answers, not warehouse access.'
    : route.title.replace(/ \| Sembric$/, '');

async function ogImage(route: Server.Route) {
  const tree = h(
    'div',
    {
      width: 1200,
      height: 630,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '64px 72px',
      backgroundColor: '#0b0f14',
      backgroundImage:
        'radial-gradient(ellipse 900px 520px at 85% 0%, rgba(227,175,0,0.20), rgba(11,15,20,0)), linear-gradient(rgba(33,38,44,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(33,38,44,0.55) 1px, transparent 1px)',
      backgroundSize: '1200px 630px, 56px 56px, 56px 56px',
      color: '#eff2f5',
      fontFamily: 'Inter',
    },
    [
      h('div', { display: 'flex', alignItems: 'center', gap: 18 }, [
        h('img', { width: 56, height: 56 }, undefined, { src: faviconData, width: 56, height: 56 }),
        h('div', { fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em' }, 'Sembric'),
        h(
          'div',
          {
            marginLeft: 'auto',
            display: 'flex',
            padding: '8px 18px',
            border: '1px solid #343a42',
            borderRadius: 999,
            color: '#9fa5ac',
            fontSize: 20,
          },
          'Available for pilots',
        ),
      ]),
      h('div', { display: 'flex', flexDirection: 'column', gap: 22 }, [
        h(
          'div',
          {
            fontFamily: 'JetBrains Mono',
            fontSize: 22,
            color: '#e3af00',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          },
          route.path === '/' ? 'The governed data layer for AI agents' : route.label,
        ),
        h(
          'div',
          { fontSize: 64, fontWeight: 700, lineHeight: 1.06, letterSpacing: '-0.035em', maxWidth: 1000 },
          ogTitle(route),
        ),
      ]),
      h('div', { display: 'flex', justifyContent: 'space-between', color: '#9fa5ac', fontSize: 22 }, [
        h('div', { fontFamily: 'JetBrains Mono' }, SITE.origin.replace('https://', '')),
        h('div', {}, 'Certified answers · No SQL · Data stays in your warehouse'),
      ]),
    ],
  );
  const svg = await satori(tree as never, { width: 1200, height: 630, fonts });
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}
for (const route of [...ROUTES]) write(ogImagePath(route).slice(1), await ogImage(route));

// --- Precompressed variants for nginx gzip_static -----------------------------------------------------------------
const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.svg', '.md', '.txt', '.xml', '.json', '.webmanifest']);
let compressed = 0;
const walk = (dir: string) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (COMPRESSIBLE.has(extname(name)) && statSync(path).size > 1024) {
      writeFileSync(`${path}.gz`, gzipSync(readFileSync(path), { level: 9 }));
      compressed += 1;
    }
  }
};
walk(dist);
rmSync(join(root, 'dist-ssr'), { recursive: true, force: true });
console.log(
  `Prerendered ${ROUTES.length} routes + 404, ${markdown.size} Markdown copies, ${ROUTES.length} OG images; gzipped ${compressed} files.`,
);
