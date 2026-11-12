import { chromium } from '@playwright/test';
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:4321/');
await page.addStyleTag({ content: '*{scroll-behavior:auto!important}' });
const shots = [
  ['btn-lime', '.hero .btn-lime'], ['btn-ghost', '.hero .btn-ghost'], ['nav-link', '.nlinks a[data-section="about"]'],
  ['work-card', '.work >> nth=1'], ['contact-card', '.g-info .ci'], ['stack-tile', '.stk >> nth=2'],
  ['loot-card', '.feat'], ['rebrand-card', '.rb >> nth=0'],
];
for (const [name, sel] of shots) {
  console.log(name); const el = page.locator(sel).first();
  await el.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(700);
  const box = await el.boundingBox();
  const pad = 40;
  const clip = { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad - 10), width: Math.min(1440, box.width + pad * 2), height: Math.min(900, box.height + pad * 2 + 10) };
  await page.screenshot({ path: `screenshots/hover/${name}-before.png`, clip });
  await el.hover();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `screenshots/hover/${name}-hover.png`, clip });
}
// VHS selected spine
const vhs = page.locator('.vhs');
await vhs.scrollIntoViewIfNeeded(); await page.waitForTimeout(800);
await page.mouse.move(0, 0);
await vhs.screenshot({ path: 'screenshots/hover/vhs-selected.png' });
await page.locator('.vitem:not(.is-active):not([hidden])').nth(1).hover(); await page.waitForTimeout(600);
await vhs.screenshot({ path: 'screenshots/hover/vhs-hover-other.png' });
// footer bar desktop + mobile
await page.locator('.g-bar').scrollIntoViewIfNeeded(); await page.waitForTimeout(600);
await page.locator('.gft .wrap').screenshot({ path: 'screenshots/hover/footer-desktop.png' });
await page.setViewportSize({ width: 390, height: 800 }); await page.waitForTimeout(300);
await page.locator('.g-bar').scrollIntoViewIfNeeded(); await page.waitForTimeout(600);
await page.locator('.g-bar').screenshot({ path: 'screenshots/hover/footer-mobile.png' });
await b.close();
