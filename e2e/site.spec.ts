import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { ROUTES } from '../src/routes';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

/** Scrolls through the page so scroll-revealed sections are shown before auditing. */
async function revealAll(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(700);
}

for (const route of ROUTES) {
  for (const theme of ['dark', 'light'] as const) {
    test(`${route.path} (${theme}) renders and has no WCAG 2.2 AA violations`, async ({ page }) => {
      const errors = collectErrors(page);
      await page.emulateMedia({ colorScheme: theme });
      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page).toHaveTitle(route.title);
      await revealAll(page);
      const results = await new AxeBuilder({ page })
        .withTags(WCAG_TAGS)
        .options({ rules: { 'target-size': { enabled: true } } })
        .analyze();
      const ran = [...results.passes, ...results.violations, ...results.incomplete, ...results.inapplicable].map(
        (rule) => rule.id,
      );
      expect(ran).toContain('target-size');
      expect(ran).toContain('color-contrast');
      expect(
        results.violations.map(
          (violation) => `${violation.id}: ${violation.nodes.map((node) => node.target).join(' | ')}`,
        ),
      ).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
}

test('unknown paths return a real 404 page', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('This page isn’t certified');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
});

test('trailing slashes redirect to the canonical URL', async ({ page }) => {
  const response = await page.goto('/product/');
  expect(new URL(page.url()).pathname).toBe('/product');
  expect(response?.status()).toBe(200);
});

test('the theme toggle switches and remembers the theme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const toggle = page.locator('[data-theme-toggle]');
  await expect(toggle).toHaveAttribute('aria-label', 'Switch to light theme');
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(toggle).toHaveAttribute('aria-label', 'Switch to dark theme');
});

test('agent console tabs follow the ARIA keyboard pattern', async ({ page }) => {
  await page.goto('/');
  const answered = page.getByRole('tab', { name: 'Answered' });
  await answered.focus();
  await page.keyboard.press('ArrowRight');
  const refused = page.getByRole('tab', { name: 'Refused' });
  await expect(refused).toBeFocused();
  await expect(refused).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#panel-refused')).toBeVisible();
  await expect(page.locator('#panel-answered')).toBeHidden();
});

test('pages are complete without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('certified answers');
  for (const id of ['answered', 'refused', 'withdrawn']) await expect(page.locator(`#panel-${id}`)).toBeVisible();
  await expect(page.locator('.faq-item')).toHaveCount(6);
  await context.close();
});

test('reduced motion shows every section without animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const hidden = await page.$$eval(
    '.reveal',
    (items) => items.filter((item) => getComputedStyle(item).opacity !== '1').length,
  );
  expect(hidden).toBe(0);
  const animated = await page.$eval('.flow-pulse', (path) => getComputedStyle(path).animationName);
  expect(animated).toBe('none');
});

test('the mobile menu opens and navigates', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile navigation only');
  await page.goto('/');
  await page.locator('.mobile-nav summary').click();
  await page.locator('.mobile-nav').getByRole('link', { name: 'Security' }).click();
  await expect(page).toHaveURL(/\/security$/);
});

test('Markdown copies and crawler files are served with the right types', async ({ request }) => {
  const checks: [string, RegExp][] = [
    ['/index.md', /^text\/markdown/],
    ['/llms.txt', /^text\/plain/],
    ['/llms-full.txt', /^text\/plain/],
    ['/robots.txt', /^text\/plain/],
    ['/sitemap.xml', /xml/],
    ['/.well-known/security.txt', /^text\/plain/],
    ['/site.webmanifest', /manifest\+json/],
  ];
  for (const [path, type] of checks) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()['content-type'], path).toMatch(type);
  }
});

test('agents that accept Markdown get the Markdown copy at the same URL', async ({ request }) => {
  for (const [path, heading] of [
    ['/', '# Give AI agents certified answers'],
    ['/security', '# A security model built around your source'],
  ]) {
    const response = await request.get(path, { headers: { Accept: 'text/markdown, text/html, */*' } });
    expect(response.status(), path).toBe(200);
    expect(response.headers()['content-type'], path).toMatch(/^text\/markdown/);
    expect(response.headers()['vary'], path).toMatch(/Accept/);
    expect((await response.text()).startsWith(heading), path).toBe(true);
    const html = await request.get(path, { headers: { Accept: 'text/html' } });
    expect(html.headers()['content-type'], path).toMatch(/^text\/html/);
  }
});
