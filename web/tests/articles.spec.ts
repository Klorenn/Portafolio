import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

type Article = { url: string; title: string; desc: string; img: string; date: string; kind: string };
const articles: Article[] = JSON.parse(readFileSync('src/data/articles.json', 'utf8'));

const PER = 12;
const total = articles.length;
const boletines = articles.filter((a) => a.kind === 'boletin').length;
const pages = Math.ceil(total / PER);

const routes = [
  { path: '/articles/', home: '/', lang: 'es', other: '/en/articles/', homeAnchor: '/#work', pageOf: (n: number) => `Página ${n} de ${pages}`, newsletters: 'Boletines' },
  { path: '/en/articles/', home: '/en/', lang: 'en', other: '/articles/', homeAnchor: '/en/#work', pageOf: (n: number) => `Page ${n} of ${pages}`, newsletters: 'Newsletters' },
];

for (const r of routes) {
  test.describe(`archive ${r.path}`, () => {
    test('returns 200 with correct html lang and canonical', async ({ page }) => {
      const res = await page.goto(r.path);
      expect(res?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', r.lang);
      await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', new RegExp(`${r.path}$`));
    });

    test('shows total count in the lead and 12 cards on page 1', async ({ page }) => {
      await page.goto(r.path);
      await expect(page.locator('.sec-head p')).toContainText(String(total));
      await expect(page.locator('.acard:not([hidden])')).toHaveCount(PER);
      await expect(page.locator('.apage-info')).toContainText(r.pageOf(1));
    });

    test('cards are single external links', async ({ page }) => {
      await page.goto(r.path);
      const card = page.locator('.acard:not([hidden])').first();
      await expect(card.locator('a')).toHaveCount(1);
      await expect(card.locator('a')).toHaveAttribute('target', '_blank');
      await expect(card.locator('a')).toHaveAttribute('rel', /noopener/);
      await expect(card.locator('img')).toHaveAttribute('loading', 'lazy');
    });

    test('without JS all cards render', async ({ browser }) => {
      const ctx = await browser.newContext({ javaScriptEnabled: false });
      const page = await ctx.newPage();
      await page.goto(r.path);
      await expect(page.locator('.acard')).toHaveCount(total);
      await expect(page.locator('.acard:visible')).toHaveCount(total);
      await ctx.close();
    });

    test('pager goes to page 2 and updates URL', async ({ page }) => {
      await page.goto(r.path);
      await page.locator('.apager button[data-page="2"]:not([aria-label*="iguiente"]):not([aria-label^="Next"])').click();
      await expect(page).toHaveURL(/[?&]page=2/);
      await expect(page.locator('.apage-info')).toContainText(r.pageOf(2));
      await expect(page.locator('.acard:not([hidden])')).toHaveCount(PER);
      const first = await page.locator('.acard:not([hidden]) h3').first().textContent();
      expect(first?.trim()).toBe(articles[PER].title.trim());
    });

    test('Newsletters filter shows only newsletters with correct count', async ({ page }) => {
      await page.goto(r.path);
      await page.locator('.atabs[data-group="type"] button', { hasText: r.newsletters }).click();
      await expect(page).toHaveURL(/type=boletin/);
      await expect(page.locator('.acount')).toContainText(String(boletines));
      const kinds = await page.locator('.acard:not([hidden])').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.kind));
      expect(kinds.length).toBe(Math.min(PER, boletines));
      expect(new Set(kinds)).toEqual(new Set(['boletin']));
    });

    test('year filter works', async ({ page }) => {
      await page.goto(r.path + '?year=2024');
      const n = articles.filter((a) => a.date.startsWith('2024')).length;
      await expect(page.locator('.acard:not([hidden])')).toHaveCount(n);
      await expect(page.locator('.acount')).toContainText(String(n));
    });

    test('search narrows results and empty state shows', async ({ page }) => {
      await page.goto(r.path);
      await page.locator('#aq').fill('binance');
      const expected = articles.filter((a) => a.title.toLowerCase().includes('binance')).length;
      expect(expected).toBeGreaterThan(0);
      await expect(page.locator('.acard:not([hidden])')).toHaveCount(Math.min(PER, expected));
      await expect(page).toHaveURL(/q=binance/);
      await page.locator('#aq').fill('zzzzqqqq');
      await expect(page.locator('.acard:not([hidden])')).toHaveCount(0);
      await expect(page.locator('.aempty')).toBeVisible();
    });

    test('?page=3 deep link loads page 3', async ({ page }) => {
      await page.goto(r.path + '?page=3');
      await expect(page.locator('.apage-info')).toContainText(r.pageOf(3));
      const first = await page.locator('.acard:not([hidden]) h3').first().textContent();
      expect(first?.trim()).toBe(articles[PER * 2].title.trim());
    });

    test('nav: home anchors, articles link, lang toggle', async ({ page }) => {
      await page.goto(r.path);
      const hrefs = await page.locator('nav.site-nav .nlinks a').evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).getAttribute('href')));
      expect(hrefs).toContain(r.homeAnchor);
      await expect(page.locator('nav.site-nav a.nart')).toHaveAttribute('aria-current', 'page');
      const otherLang = r.lang === 'es' ? 'en' : 'es';
      await expect(page.locator(`nav.site-nav a[data-lang][hreflang="${otherLang}"]`)).toHaveAttribute('href', r.other);
    });

    for (const w of [360, 768, 1440]) {
      test(`no horizontal overflow at ${w}px`, async ({ page }) => {
        await page.setViewportSize({ width: w, height: 900 });
        await page.goto(r.path);
        await page.waitForLoadState('load');
        const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
        expect(o.sw).toBeLessThanOrEqual(o.cw);
      });
    }

    test('home "more articles" button links to the archive', async ({ page }) => {
      await page.goto(r.home);
      const btn = page.locator('.more a.btn');
      await expect(btn).toHaveAttribute('href', r.path);
      await expect(btn).not.toHaveAttribute('target', '_blank');
      await expect(page.locator('.more .mono')).toContainText(String(total));
    });
  });
}
