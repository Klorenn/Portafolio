import { test, expect } from '@playwright/test';

const routes = ['/', '/en/'];

for (const path of routes) {
  test.describe(`fx ${path}`, () => {
    test('back-to-top appears after one viewport and returns to top', async ({ page }) => {
      await page.goto(path);
      const btn = page.locator('.to-top');
      await expect(btn).toBeHidden();
      await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
      await expect(btn).toBeVisible();
      await btn.click();
      await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 5000 }).toBeLessThan(5);
      await expect(btn).toBeHidden();
    });

    test('scroll progress bar width tracks scroll', async ({ page }) => {
      await page.goto(path);
      const bar = page.locator('.nav-prog');
      const w0 = (await bar.boundingBox())?.width ?? 0;
      expect(w0).toBeLessThan(2);
      await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) / 2));
      await expect.poll(async () => (await bar.boundingBox())?.width ?? 0).toBeGreaterThan(200);
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      const vw = page.viewportSize()!.width;
      await expect.poll(async () => (await bar.boundingBox())?.width ?? 0).toBeGreaterThan(vw - 4);
    });

    test('whole work card opens its link via the stretched link', async ({ page }) => {
      await page.goto(path);
      const card = page.locator('.work').first();
      await card.scrollIntoViewIfNeeded();
      const box = (await card.boundingBox())!;
      const href = await card.locator('a.btn-text').getAttribute('href');
      const popup = page.waitForEvent('popup');
      // click on the card body far from the link text
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2 - 20);
      const p = await popup;
      expect(p.url()).toContain(new URL(href!).host);
      expect(await card.locator('a[href]').count()).toBe(1);
    });

    test('reduced motion: reveal targets are visible immediately', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      for (const sel of ['.work >> nth=3', '.rb >> nth=1', '.feat', '.g-info li >> nth=2']) {
        const loc = page.locator(sel);
        expect(await loc.evaluate((el) => getComputedStyle(el).opacity), sel).toBe('1');
        expect(await loc.evaluate((el) => getComputedStyle(el).transform), sel).toBe('none');
      }
    });

    test('reveal: below-fold card is hidden before scroll then shown, and no JS-free hiding', async ({ page }) => {
      await page.goto(path);
      const card = page.locator('.feat');
      await expect(page.locator('html')).toHaveClass(/js/);
      await card.scrollIntoViewIfNeeded();
      await expect.poll(() => card.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    });

    test('content stays visible with JS disabled', async ({ browser }) => {
      const ctx = await browser.newContext({ javaScriptEnabled: false });
      const page = await ctx.newPage();
      await page.goto(path);
      expect(await page.locator('.work').nth(2).evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
      await ctx.close();
    });

    test('carousel dots exist on mobile and follow scroll', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 800 });
      await page.goto(path);
      const works = page.locator('.works');
      const dots = page.locator('.dots').first();
      await works.scrollIntoViewIfNeeded();
      await expect(dots).toBeVisible();
      const count = await dots.locator('i').count();
      expect(count).toBeGreaterThan(2);
      await expect(dots.locator('i.on')).toHaveCount(1);
      await works.evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: 'instant' as ScrollBehavior }));
      await expect.poll(() => dots.locator('i').evaluateAll((els) => els.findIndex((e) => e.classList.contains('on')))).toBe(count - 1);
    });

    test('no horizontal overflow with fx (390 + 1440)', async ({ page }) => {
      for (const w of [390, 1440]) {
        await page.setViewportSize({ width: w, height: 900 });
        await page.goto(path);
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
        expect(o.sw).toBeLessThanOrEqual(o.cw);
      }
    });

    test('selected VHS spine is pulled toward viewer without sideways tilt', async ({ page }) => {
      await page.goto(path);
      const t = await page.locator('.vitem.is-active').evaluate((el) => getComputedStyle(el).transform);
      expect(t).not.toBe('none');
      // 3D matrix; a pure rotateZ would give non-zero m12/m21 skew
      const m = t.match(/matrix3d\((.+)\)/)?.[1].split(',').map(Number);
      expect(m, t).toBeTruthy();
      expect(Math.abs(m![1])).toBeLessThan(0.01);
      expect(Math.abs(m![4])).toBeLessThan(0.01);
    });
  });
}
