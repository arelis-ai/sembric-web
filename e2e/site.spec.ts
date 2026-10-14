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

test('the mobile menu closes on Escape, on an outside click and returns focus', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile navigation only');
  await page.goto('/product');
  const menu = page.locator('.mobile-nav');
  const toggle = menu.locator('summary');
  await toggle.click();
  await expect(menu).toHaveAttribute('open', '');
  await expect(menu.getByRole('link', { name: 'Product' })).toHaveAttribute('aria-current', 'page');
  await page.keyboard.press('Escape');
  await expect(menu).not.toHaveAttribute('open', '');
  await expect(toggle).toBeFocused();
  await toggle.click();
  const panel = await menu.locator('nav').boundingBox();
  await page.mouse.click(8, (panel?.y ?? 0) + (panel?.height ?? 0) + 40);
  await expect(menu).not.toHaveAttribute('open', '');
});

test('the in-page navigation jumps to a section and marks it as current', async ({ page }) => {
  await page.goto('/security');
  const nav = page.getByRole('navigation', { name: 'On this page' });
  await nav.getByRole('link', { name: 'Audit' }).click();
  await expect(page).toHaveURL(/#audit$/);
  await expect(nav.getByRole('link', { name: 'Audit' })).toHaveAttribute('aria-current', 'location');
  await expect(nav).toBeInViewport();
  const top = await page.locator('#audit-title').evaluate((title) => title.getBoundingClientRect().top);
  const navBottom = await nav.evaluate((element) => element.getBoundingClientRect().bottom);
  expect(top).toBeGreaterThan(navBottom);
  expect(top - navBottom).toBeLessThan(160);
});

test('the contact page offers a pre-filled email and copies the address', async ({ page, browserName, isMobile }) => {
  test.skip(browserName !== 'chromium' || isMobile, 'clipboard permissions are granted in desktop Chromium');
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/contact');
  const email = page.getByRole('link', { name: 'Email a pilot request' }).first();
  const href = decodeURIComponent((await email.getAttribute('href')) ?? '');
  expect(href).toMatch(/^mailto:[^?]+\?subject=Sembric pilot request&body=/);
  expect(href).toContain('Which warehouse or engine holds the data');
  expect(href).toContain('Please do not include credentials or customer data');
  const copy = page.locator('[data-copy-target="contact-email"]');
  await expect(copy).toHaveAccessibleName('Copy address');
  await copy.click();
  await expect(copy).toHaveText('Copied');
  await expect(page.locator('[data-live-region]')).toHaveText('Copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('contact@arelis.digital');
});

test('the comparison table stacks into labelled cards on small screens', async ({ page, isMobile }) => {
  await page.goto('/');
  const label = page.locator('.compare-table .compare-label').first();
  if (isMobile) await expect(label).toBeVisible();
  else await expect(label).toBeHidden();
  expect(await page.locator('.compare-table').evaluate((table) => table.scrollWidth <= table.clientWidth + 1)).toBe(
    true,
  );
});

test('no page scrolls sideways at 320px', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 720 } });
  const page = await context.newPage();
  for (const route of ROUTES) {
    await page.goto(route.path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, route.path).toBeLessThanOrEqual(0);
  }
  await context.close();
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
