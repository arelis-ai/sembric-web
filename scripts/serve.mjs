// Local static server that mirrors nginx/default.conf: clean URLs, trailing-slash redirects, a real 404 status,
// Markdown for Accept: text/markdown and the production security headers. Usage: node scripts/serve.mjs [port]   (default 4173, serves ./dist)
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { cacheControl, distScriptHash, securityHeaders } from './headers.mjs';

const port = Number(process.argv[2] ?? process.env.PORT ?? 4173);
const dist = join(process.cwd(), 'dist');
const headers = securityHeaders(distScriptHash(dist)).filter(([name]) => name !== 'Strict-Transport-Security');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'text/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

const resolve = (path, markdown) => {
  const preferred = markdown ? [path === '/' ? '/index.md' : `${path}.md`] : [];
  const candidates = [...preferred, path, `${path}/index.html`].map((candidate) => normalize(join(dist, candidate)));
  return candidates.find((file) => file.startsWith(dist) && existsSync(file) && statSync(file).isFile());
};

createServer((request, response) => {
  const path = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  headers.forEach(([name, value]) => response.setHeader(name, value));
  if (path.length > 1 && path.endsWith('/')) {
    response.writeHead(301, { Location: path.slice(0, -1) }).end();
    return;
  }
  const hidden = /\/\.(?!well-known\/)/.test(path);
  const markdown = /text\/markdown/i.test(request.headers.accept ?? '');
  const file = hidden ? undefined : resolve(path, markdown);
  response.setHeader('Vary', 'Accept');
  const target = file ?? join(dist, '404.html');
  response.writeHead(file ? 200 : 404, {
    'Content-Type': TYPES[extname(target)] ?? 'application/octet-stream',
    'Cache-Control': cacheControl(path),
  });
  response.end(request.method === 'HEAD' ? undefined : readFileSync(target));
}).listen(port, '127.0.0.1', () => console.log(`Serving dist on http://127.0.0.1:${port}`));
