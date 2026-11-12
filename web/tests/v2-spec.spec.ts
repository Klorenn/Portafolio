import { test, expect } from '@playwright/test';

const routes = [
  { path: '/', lang: 'es' },
  { path: '/en/', lang: 'en' },
];
const LIME = 'rgb(232, 245, 66)';

async function settle(page: Page) {
  await page.goto(page.url() === 'about:blank' ? '/' : page.url());
}

for (const r of routes) {
  for (const vw of [1440, 390]) {
    test.describe(`v2 spec ${r.path} @${vw}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: vw, height: 900 });
      });

      test('(a) only Pixelify Sans and Space Grotesk are used / loaded', async ({ page }) => {
        const fontReqs: string[] = [];
        page.on('request', (q) => { if (/silkscreen|jersey/i.test(q.url())) fontReqs.push(q.url()); });
        await page.goto(r.path);
        await page.waitForLoadState('load');
        await page.evaluate(() => document.fonts.ready);
        expect(fontReqs).toEqual([]);
        const bad = await page.evaluate(() => {
          const ok = new Set(['Pixelify Sans', 'Space Grotesk']);
          const out: string[] = [];
          const all = Array.from(document.body.querySelectorAll<HTMLElement>('*'));
          for (const el of all) {
            const cs = getComputedStyle(el);
            if (el.getClientRects().length === 0 || cs.visibility === 'hidden') continue;
            const hasText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && (n.textContent ?? '').trim());
            if (!hasText && !(el instanceof HTMLInputElement)) continue;
            const first = cs.fontFamily.split(',')[0].trim().replace(/^["']|["']$/g, '');
            if (!ok.has(first)) out.push(`${el.tagName}.${el.className}: ${cs.fontFamily}`);
          }
          const faces = Array.from(document.fonts).map((f) => f.family.replace(/^["']|["']$/g, ''));
          for (const f of faces) if (!ok.has(f)) out.push(`@font-face ${f}`);
          return out;
        });
        expect(bad).toEqual([]);
      });

      test('(b) lime only on clickable elements, logo 0, hero illustration', async ({ page }) => {
        await page.goto(r.path);
        await page.waitForLoadState('load');
        const bad = await page.evaluate((LIME) => {
          const clickable = 'a, button, [role="button"], .to-top, .stage, .logo, .g-giant';
          const out: string[] = [];
          const props = ['color', 'backgroundColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'outlineColor'] as const;
          for (const el of Array.from(document.body.querySelectorAll<HTMLElement>('*'))) {
            if (el.closest(clickable)) continue;
            for (const pseudo of [null, '::before', '::after']) {
              const cs = getComputedStyle(el, pseudo);
              if (pseudo && cs.content === 'none') continue;
              if (el.getClientRects().length === 0) continue;
              for (const p of props) {
                if (cs[p] !== LIME) continue;
                if (p === 'color' && !Array.from(el.childNodes).some((n) => n.nodeType === 3 && (n.textContent ?? '').trim()) && !pseudo) continue;
                if (p.startsWith('border') && parseFloat(cs[p.replace('Color', 'Width') as 'borderTopWidth']) === 0) continue;
                if (p === 'outlineColor' && cs.outlineStyle === 'none') continue;
                out.push(`${el.tagName}.${el.className}${pseudo ?? ''} ${p}`);
              }
              if (cs.boxShadow.includes(LIME)) out.push(`${el.tagName}.${el.className}${pseudo ?? ''} boxShadow`);
            }
          }
          return out;
        }, LIME);
        expect(bad).toEqual([]);
      });

      test('(c) stats read 4 / 15 / 10 / 2', async ({ page }) => {
        await page.goto(r.path);
        const n = await page.locator('.kpis b').allTextContents();
        expect(n.map((s) => s.trim())).toEqual(['4', '15', '11', '2']);
      });

      test('(e) no horizontal overflow', async ({ page }) => {
        for (const p of [r.path, r.lang === 'es' ? '/articles/' : '/en/articles/']) {
          await page.goto(p);
          await page.waitForLoadState('load');
          const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
          expect(o.sw, p).toBeLessThanOrEqual(o.cw);
        }
      });

      test('contrast AA for text against solid backgrounds', async ({ page }) => {
        await page.goto(r.path);
        await page.waitForLoadState('load');
        const fails = await page.evaluate(() => {
          type RGBA = [number, number, number, number];
          const parse = (s: string): RGBA => {
            const m = s.match(/[\d.]+/g)!.map(Number);
            return [m[0], m[1], m[2], m.length > 3 ? m[3] : 1];
          };
          const over = (f: RGBA, b: RGBA): RGBA => [f[0] * f[3] + b[0] * (1 - f[3]), f[1] * f[3] + b[1] * (1 - f[3]), f[2] * f[3] + b[2] * (1 - f[3]), 1];
          const lum = (c: RGBA) => {
            const k = c.slice(0, 3).map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
            return 0.2126 * k[0] + 0.7152 * k[1] + 0.0722 * k[2];
          };
          const out: string[] = [];
          const seen = new Set<string>();
          for (const el of Array.from(document.body.querySelectorAll<HTMLElement>('*'))) {
            const cs = getComputedStyle(el);
            if (el.getClientRects().length === 0 || cs.visibility === 'hidden') continue;
            const r = el.getBoundingClientRect();
            if (r.width < 4 || r.height < 4) continue;
            if (!Array.from(el.childNodes).some((n) => n.nodeType === 3 && (n.textContent ?? '').trim())) continue;
            // effective background: walk up; bail out (skip) if an image/gradient is hit
            let bg: RGBA = [20, 20, 20, 1];
            const stack: RGBA[] = [];
            let skip = false;
            for (let n: HTMLElement | null = el; n; n = n.parentElement) {
              const s = getComputedStyle(n);
              if (s.backgroundImage !== 'none') { skip = true; break; }
              const c = parse(s.backgroundColor);
              if (c[3] > 0) { stack.push(c); if (c[3] === 1) break; }
            }
            if (skip) continue;
            for (let i = stack.length - 1; i >= 0; i--) bg = over(stack[i], bg);
            const fg = over(parse(cs.color), bg);
            const L1 = lum(fg), L2 = lum(bg);
            const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
            const size = parseFloat(cs.fontSize);
            const large = size >= 24 || (size >= 18.66 && parseInt(cs.fontWeight) >= 700);
            const need = large ? 3 : 4.5;
            if (ratio < need) {
              const key = `${el.tagName}.${el.className}`;
              if (seen.has(key)) continue;
              seen.add(key);
              out.push(`${key} "${(el.textContent ?? '').trim().slice(0, 24)}" ${ratio.toFixed(2)} < ${need} (${cs.color} on rgb(${bg.slice(0, 3).map(Math.round)}))`);
            }
          }
          return out;
        });
        expect(fails).toEqual([]);
      });
    });
  }

  test(`(d) no text under 14px at 1440 ${r.path}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(r.path);
    await page.waitForLoadState('load');
    const small = await page.evaluate(() => {
      const out: string[] = [];
      for (const el of Array.from(document.body.querySelectorAll<HTMLElement>('*'))) {
        const cs = getComputedStyle(el);
        if (el.getClientRects().length === 0 || cs.visibility === 'hidden') continue;
        const b = el.getBoundingClientRect();
        if (b.width < 4 || b.height < 4) continue;
        if (!Array.from(el.childNodes).some((n) => n.nodeType === 3 && (n.textContent ?? '').trim())) continue;
        if (parseFloat(cs.fontSize) < 14) out.push(`${el.tagName}.${el.className} ${cs.fontSize} "${(el.textContent ?? '').trim().slice(0, 20)}"`);
      }
      return out;
    });
    expect(small).toEqual([]);
  });

  test(`brands 2x2 on desktop, 1 column on mobile ${r.path}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(r.path);
    const cards = page.locator('.rebrands > article');
    await expect(cards).toHaveCount(5);
    const boxes = await cards.evaluateAll((els) => els.map((e) => { const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y + scrollY), w: Math.round(b.width), h: Math.round(b.height) }; }));
    expect(boxes[0].x).toBe(boxes[2].x);
    expect(boxes[1].x).toBeGreaterThan(boxes[0].x);
    expect(boxes[0].y).toBe(boxes[1].y);
    expect(boxes[2].y).toBeGreaterThan(boxes[0].y);
    expect(boxes[0].w).toBe(boxes[1].w);
    // odd last card: same width, centered on its own row
    const last = boxes[4];
    expect(last.y).toBeGreaterThan(boxes[2].y);
    expect(last.w).toBe(boxes[0].w);
    expect(Math.abs(last.x + last.w / 2 - (boxes[0].x + boxes[1].x + boxes[1].w) / 2)).toBeLessThanOrEqual(2);
    expect(await page.locator('.rb .shot').first().evaluate((e) => e.getBoundingClientRect().height)).toBeCloseTo(380, 0);
    expect(await page.locator('.rb .meta span:nth-child(2)').count()).toBe(0);
    await page.setViewportSize({ width: 390, height: 900 });
    const m = await cards.evaluateAll((els) => els.map((e) => { const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y) }; }));
    expect(new Set(m.map((b) => b.x)).size).toBe(1);
  });
}
