import { chromium } from 'playwright';

const base = process.env.TAHDHIB_QA_BASE || 'http://127.0.0.1:8765/';
const browser = await chromium.launch({ headless: true });
const failures = [];
const assert = (condition, message) => { if (!condition) throw Error(message); };
async function check(kind, viewport) {
  const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  const route = kind === 'kalam' ?
    'texts/al-taftazani/tahdhib-al-kalam/edition/' :
    'texts/al-taftazani/tahdhib-al-mantiq/edition/';
  await page.goto(new URL(route, base).href, { waitUntil: 'networkidle' });
  assert(await page.locator('#passages .clause').count() === (kind === 'kalam' ? 6 : 1) ||
    await page.locator('#passages .clause').count() > 0, kind + ': content missing');
  assert(await page.locator('[data-view="both"][aria-pressed="true"]').count() === 1, 'bad initial parallel mode');
  await page.locator('[data-view="ar"]').click();
  assert(await page.locator('#passages.view-ar').count() === 1, 'Arabic view not selected');
  await page.locator('[data-view="en"]').click();
  assert(await page.locator('#passages.view-en').count() === 1, 'English view not selected');
  await page.locator('[data-view="both"]').click();
  await page.locator('#theme').click();
  assert(await page.locator('html[data-theme="dark"]').count() === 1, 'dark mode failed');
  await page.locator('#theme').click();
  assert(await page.locator('html[data-theme="sepia"]').count() === 1, 'sepia failed');
  await page.locator('#larger').click();
  assert(await page.evaluate(() => Number(getComputedStyle(document.documentElement).getPropertyValue('--reader-scale'))) > 1, 'font scale failed');
  await page.locator('#focus').click();
  assert(await page.locator('body[data-focus="1"]').count() === 1, 'focus 1 failed');
  await page.locator('#focus').click();
  assert(await page.locator('body[data-focus="2"]').count() === 1, 'focus 2 failed');
  await page.locator('#focus').click();
  assert(await page.locator('body[data-focus="3"]').count() === 1, 'focus 3 failed');
  assert(await page.locator('#passages .clause').count() === (kind === 'kalam' ? 1044 : 19), 'continuous view coverage mismatch');
  await page.locator('#focus').click();
  assert(await page.locator('body[data-focus="0"]').count() === 1, 'normal focus restoration failed');
  const firstId = kind === 'kalam' ? 'u-KAL-015-01' : 'u-L-01';
  assert(await page.locator('#' + firstId).count() === 1, 'first cited clause missing');
  await page.locator('#' + firstId + ' .icon-action').first().click();
  assert(await page.locator('#' + firstId + ' .icon-action[aria-pressed="true"]').count() === 1, 'bookmark failed');
  await page.locator('#export').click();
  assert(await page.locator('#export-modal:not([hidden])').count() === 1, 'export modal failed');
  await page.locator('#export-close').click();
  assert(await page.locator('#export-modal[hidden]').count() === 1, 'export close failed');
  await page.locator('#dock-next').click();
  assert(await page.locator('#page-number').textContent() === (kind === 'kalam' ? '16' : '2'), 'dock next failed');
  await page.locator('#dock-prev').click();
  assert(await page.locator('#page-number').textContent() === (kind === 'kalam' ? '15' : '1'), 'dock previous failed');
  await page.locator('#search').fill(kind === 'kalam' ? 'العلم' : 'القياس');
  assert((await page.locator('.search-hit').count()) > 0, 'Arabic search failed');
  const overflow = await page.evaluate(() => ({
    width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth
  }));
  assert(overflow.scrollWidth <= overflow.width + 3, 'horizontal overflow ' + JSON.stringify(overflow));
  assert(errors.length === 0, 'runtime exceptions: ' + errors.join('; '));
  console.log('PASS', kind, viewport.width + 'x' + viewport.height);
  await ctx.close();
}
try {
 for (const kind of ['logic', 'kalam']) {
   for (const viewport of [{width:1440,height:900},{width:390,height:844},{width:844,height:390}]) {
     try { await check(kind, viewport); }
     catch (error) { failures.push(kind + ' ' + viewport.width + 'x' + viewport.height + ' ' + error.message); }
   }
 }
} finally { await browser.close(); }
if (failures.length) { for (const message of failures) console.error('FAIL', message); process.exit(1); }
console.log('All six reader layout/function test combinations passed');
