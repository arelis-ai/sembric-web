import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
// @ts-expect-error plain ESM helper without types
import { cacheControl, contentSecurityPolicy, inlineScriptHash, securityHeaders } from '../scripts/headers.mjs';
import { THEME_SCRIPT } from '../src/Document';
import { ROUTES } from '../src/routes';
import { htmlFile, readDist } from './helpers';

const themeHash = createHash('sha256').update(THEME_SCRIPT).digest('base64');

describe('Content-Security-Policy', () => {
  it('allows the theme script by hash on every page, and nothing inline otherwise', () => {
    for (const route of ROUTES) expect(inlineScriptHash(readDist(htmlFile(route.path))), route.path).toBe(themeHash);
    expect(inlineScriptHash(readDist('404.html'))).toBe(themeHash);
    const csp = contentSecurityPolicy(themeHash) as string;
    expect(csp).toContain(`script-src 'self' 'sha256-${themeHash}'`);
    expect(csp).not.toContain('unsafe-inline');
    expect(csp).not.toContain('unsafe-eval');
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("default-src 'none'");
  });

  it('ships the same headers in the nginx snippet the container serves', () => {
    const snippet = readFileSync(join(process.cwd(), 'dist-nginx', 'security-headers.conf'), 'utf8');
    for (const [name, value] of securityHeaders(themeHash) as [string, string][]) {
      expect(snippet).toContain(`add_header ${name} "${value}" always;`);
    }
    for (const name of [
      'Strict-Transport-Security',
      'X-Content-Type-Options',
      'Referrer-Policy',
      'Permissions-Policy',
    ]) {
      expect(snippet).toContain(`add_header ${name} `);
    }
  });
});

describe('cache policy', () => {
  it('caches hashed assets forever and revalidates documents', () => {
    expect(cacheControl('/assets/entry-client-abc.js')).toContain('immutable');
    expect(cacheControl('/og/home.png')).toBe('public, max-age=86400');
    expect(cacheControl('/product')).toBe('public, max-age=0, must-revalidate');
    expect(cacheControl('/llms.txt')).toBe('public, max-age=0, must-revalidate');
  });

  it('matches the location blocks in nginx/default.conf', () => {
    const conf = readFileSync(join(process.cwd(), 'nginx', 'default.conf'), 'utf8');
    expect(conf).toContain('add_header Cache-Control "public, max-age=31536000, immutable" always;');
    expect(conf).toContain('add_header Cache-Control "public, max-age=86400" always;');
    expect(conf).toContain('add_header Cache-Control "public, max-age=0, must-revalidate" always;');
    expect(conf.match(/include \/etc\/nginx\/snippets\/security-headers\.conf;/g)?.length).toBeGreaterThanOrEqual(5);
  });
});
