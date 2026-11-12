import { test, expect } from '@playwright/test';

const routes = [
  { path: '/', lang: 'es' },
  { path: '/en/', lang: 'en' },
];
const SECTION_IDS = ['home', 'about', 'work', 'featured', 'contact'];

for (const r of routes) {
  test.describe(`route ${r.path}`, () => {
    test('returns 200 with correct html lang', async ({ page }) => {
      const res = await page.goto(r.path);
      expect(res?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', r.lang);
    });

    test('has 5 nav links pointing to existing section ids', async ({ page }) => {
      await page.goto(r.path);
      const links = page.locator('nav.site-nav .nlinks a[data-section]');
      await expect(links).toHaveCount(5);
      const hrefs = await links.evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).getAttribute('href')));
      expect(hrefs).toEqual(SECTION_IDS.map((id) => `#${id}`));
      for (const id of SECTION_IDS) await expect(page.locator(`#${id}`)).toHaveCount(1);
    });

    test('external links use rel noopener', async ({ page }) => {
      await page.goto(r.path);
      const ext = await page.locator('a[href^="http"]').evaluateAll((els) =>
        els.map((e) => ({ href: (e as HTMLAnchorElement).href, rel: e.getAttribute('rel') ?? '', target: e.getAttribute('target') })),
      );
      expect(ext.length).toBeGreaterThan(5);
      for (const l of ext) {
        expect(l.rel, l.href).toContain('noopener');
        expect(l.target, l.href).toBe('_blank');
      }
    });

    for (const w of [360, 390, 768, 1440]) {
      test(`no horizontal overflow at ${w}px`, async ({ page }) => {
        await page.setViewportSize({ width: w, height: 900 });
        await page.goto(r.path);
        await page.waitForLoadState('load');
        const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
        expect(o.sw).toBeLessThanOrEqual(o.cw);
      });
    }

    test('mobile burger menu opens, locks scroll, closes on Esc and link click', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 800 });
      await page.goto(r.path);
      const burger = page.locator('.burger');
      const menu = page.locator('#menu');
      await expect(menu).toBeHidden();
      await burger.click();
      await expect(menu).toBeVisible();
      await expect(burger).toHaveAttribute('aria-expanded', 'true');
      expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden');
      await page.keyboard.press('Escape');
      await expect(menu).toBeHidden();
      await burger.click();
      await menu.locator('a[href="#work"]').click();
      await expect(menu).toBeHidden();
      expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden');
    });

    test('VHS shelf arrows and filters work', async ({ page }) => {
      await page.goto(r.path);
      const title = page.locator('.vhs .vc b');
      const first = await title.textContent();
      await page.locator('.vhs .va-next').click();
      await expect(title).not.toHaveText(first ?? '');
      await page.locator('.vhs .vtabs button').nth(3).click(); // brands
      const visible = await page.locator('.vhs .vitem:not([hidden])').count();
      expect(visible).toBeGreaterThan(0);
      expect(visible).toBeLessThan(9);
    });

    test('VHS: clicking a spine pulls it out and exposes its project link', async ({ page }) => {
      await page.goto(r.path);
      const spine = page.locator('.vhs .vitem[data-id="loot"]');
      await spine.scrollIntoViewIfNeeded();
      await spine.click();
      await expect(page.locator('.vhs .vc b')).toHaveText('Loot');
      await expect(spine).toHaveClass(/is-active/);
      const link = page.locator('.vhs .vlink');
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', 'https://www.findloot.xyz/');
      const popup = page.waitForEvent('popup');
      await spine.click();
      expect((await popup).url()).toContain('findloot.xyz');
    });
  });
}

test('language toggle links between routes', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.lng a[hreflang="en"]').first()).toHaveAttribute('href', /\/en\/$/);
  await page.goto('/en/');
  await expect(page.locator('.lng a[hreflang="es"]').first()).toHaveAttribute('href', /\/$/);
});

test('404 route renders', async ({ page }) => {
  const res = await page.goto('/no-existe');
  expect(res?.status()).toBe(404);
  await expect(page.locator('.code')).toHaveText('404');
  await expect(page.locator('main a.btn')).toHaveAttribute('href', /\/$/);
});
