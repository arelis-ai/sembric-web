// Verifies every internal link and asset reference in the built site resolves to a file, and every #fragment to an
// element id on its target page. External links are listed but not fetched.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(process.cwd(), 'dist');
const origin = 'https://sembric.app.arelis.digital';
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
const files = walk(dist);
const pages = files.filter((file) => file.endsWith('.html'));
const markdown = files.filter((file) => file.endsWith('.md') || file.endsWith('.txt'));

const target = (path) => {
  if (path === '/') return join(dist, 'index.html');
  const direct = join(dist, path);
  if (existsSync(direct) && statSync(direct).isFile()) return direct;
  const page = join(dist, path, 'index.html');
  return existsSync(page) ? page : undefined;
};
const ids = new Map();
const idsOf = (file) => {
  if (!ids.has(file))
    ids.set(file, new Set([...readFileSync(file, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return ids.get(file);
};

const broken = [];
const external = new Set();
let checked = 0;
const check = (from, raw) => {
  const ref = raw.replaceAll('&amp;', '&');
  if (/^(mailto:|tel:)/.test(ref)) return;
  if (/^https?:\/\//.test(ref) && !ref.startsWith(origin)) return void external.add(ref);
  const local = ref.startsWith(origin) ? ref.slice(origin.length) || '/' : ref;
  const [pathPart, fragment] = local.split('#');
  const path = pathPart || null;
  checked += 1;
  const file = path === null ? from : target(path.split('?')[0]);
  if (!file) return void broken.push(`${from.replace(dist, '')} → ${ref}`);
  if (fragment && file.endsWith('.html') && !idsOf(file).has(fragment))
    broken.push(`${from.replace(dist, '')} → ${ref} (missing #${fragment})`);
};

for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  for (const match of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) check(page, match[1]);
}
for (const file of markdown) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) check(file, match[1]);
}
const sitemap = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) check(join(dist, 'sitemap.xml'), match[1]);

if (broken.length) {
  console.error(`Broken links (${broken.length}):\n${broken.join('\n')}`);
  process.exit(1);
}
console.log(
  `Links OK: ${checked} internal references across ${pages.length} pages and ${markdown.length} text files resolve; ${external.size} external links not fetched (${[...external].join(', ')}).`,
);
