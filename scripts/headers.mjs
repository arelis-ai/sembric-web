// Single source of truth for the site's response headers. scripts/render-nginx.mjs turns them into the nginx snippet
// the container serves, and scripts/serve.mjs applies the same values to local previews and end-to-end tests.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

/** SHA-256 (base64) of the single inline script every page carries: the pre-paint theme script. */
export function inlineScriptHash(html) {
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
  if (scripts.length !== 1) throw new Error(`expected exactly one inline script, found ${scripts.length}`);
  return createHash('sha256').update(scripts[0]).digest('base64');
}

export const contentSecurityPolicy = (scriptHash) =>
  [
    "default-src 'none'",
    `script-src 'self' 'sha256-${scriptHash}'`,
    "style-src 'self'",
    "img-src 'self'",
    "font-src 'self'",
    // Same-origin fetches only; Lighthouse and some agents read /robots.txt from the page context.
    "connect-src 'self'",
    "manifest-src 'self'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    "require-trusted-types-for 'script'",
  ].join('; ');

export const securityHeaders = (scriptHash) => [
  ['Strict-Transport-Security', 'max-age=63072000; includeSubDomains'],
  ['Content-Security-Policy', contentSecurityPolicy(scriptHash)],
  ['X-Content-Type-Options', 'nosniff'],
  ['Referrer-Policy', 'strict-origin-when-cross-origin'],
  [
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), browsing-topics=()',
  ],
  ['Cross-Origin-Opener-Policy', 'same-origin'],
  ['X-Frame-Options', 'DENY'],
];

export const CACHE = {
  immutable: 'public, max-age=31536000, immutable',
  day: 'public, max-age=86400',
  revalidate: 'public, max-age=0, must-revalidate',
};

/** Cache policy by path; keep in step with the location blocks in nginx/default.conf. */
export const cacheControl = (path) =>
  path.startsWith('/assets/')
    ? CACHE.immutable
    : /^\/(og\/|icon-|apple-touch-icon|favicon)/.test(path)
      ? CACHE.day
      : CACHE.revalidate;

export const distScriptHash = (distDir) => inlineScriptHash(readFileSync(`${distDir}/index.html`, 'utf8'));
