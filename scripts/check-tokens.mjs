// Proves the site's design tokens match the Sembric portal. Usage: node scripts/check-tokens.mjs <path-to-portal-theme.css>
import { readFileSync } from 'node:fs';

const block = (css) => {
  const start = css.indexOf(':root {');
  const lightStart = css.indexOf(":root[data-theme='light'] {");
  const end = css.indexOf('}', lightStart);
  if (start < 0 || lightStart < 0 || end < 0) throw new Error('token blocks not found');
  return css.slice(start, end + 1);
};

const portalPath = process.argv[2];
if (!portalPath) {
  console.error('usage: node scripts/check-tokens.mjs <sembric>/apps/web/src/theme.css');
  process.exit(2);
}
const site = block(readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8'));
const portal = block(readFileSync(portalPath, 'utf8'));
if (site !== portal) {
  console.error('Design tokens differ from the portal.');
  process.exit(1);
}
console.log(`Design tokens identical to the portal (${site.split('\n').length} lines).`);
