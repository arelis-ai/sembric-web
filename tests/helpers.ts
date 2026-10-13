import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const DIST = join(process.cwd(), 'dist');

export function readDist(path: string) {
  const file = join(DIST, path);
  if (!existsSync(file)) throw new Error(`dist/${path} is missing; run npm run build first`);
  return readFileSync(file, 'utf8');
}

export const htmlFile = (path: string) => (path === '/' ? 'index.html' : `${path.slice(1)}/index.html`);

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#x27': "'", '#39': "'" };
export const decode = (value: string) => value.replace(/&(amp|lt|gt|quot|#x27|#39);/g, (_, name) => ENTITIES[name]);

/** All values of `attr` on tags matching `<tag ... key="value" ...>`. */
export function tagAttr(html: string, tag: string, key: string, value: string, attr: string) {
  const tags = html.match(new RegExp(`<${tag}\\b[^>]*>`, 'g')) ?? [];
  return tags
    .filter((found) => found.includes(`${key}="${value}"`))
    .map((found) => found.match(new RegExp(`\\s${attr}="([^"]*)"`))?.[1])
    .filter((found): found is string => found !== undefined)
    .map(decode);
}

export const metaName = (html: string, name: string) => tagAttr(html, 'meta', 'name', name, 'content');
export const metaProperty = (html: string, property: string) => tagAttr(html, 'meta', 'property', property, 'content');

export function jsonLd(html: string) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  return blocks.map((block) => JSON.parse(block[1]) as { '@context': string; '@graph': Record<string, any>[] });
}

/** Width and height from a PNG's IHDR chunk. */
export function pngSize(path: string) {
  const buffer = readFileSync(join(DIST, path));
  if (buffer.toString('ascii', 1, 4) !== 'PNG') throw new Error(`${path} is not a PNG`);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

export const visibleText = (html: string) =>
  decode(
    html
      .replace(/<script[\s\S]*?<\/script>/g, ' ')
      .replace(/<style[\s\S]*?<\/style>/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' '),
  );
