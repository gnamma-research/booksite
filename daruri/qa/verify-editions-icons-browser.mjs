/* Browser-based Editions QA. Runs against the actual Daruri static site served
   at localhost:8123; never sends personal notes to external services. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

const BASE='http://127.0.0.1:8123/daruri/#editions';
const out=path.resolve('test-artifacts');
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1200,height:900},reducedMotion:'reduce'});
const page=await context.newPage();
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
try {
  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('[data-ep-published="reading"]:not([hidden])',{timeout:25000});
  await page.waitForSelector('.gn-editions .gn-ed-icon-options',{timeout:12000});
  const compact=page.locator('.gn-editions');
  const selects=await compact.locator('select').count();
  const groups=await compact.locator('.gn-ed-icon-options').count();
  assert.ok(selects>=14,'Existing editor selectors retained');
  assert.ok(groups>=selects,'Short-choice toolbars and binary toggles remain enhanced');
  assert.equal(await compact.locator('select:not(.gn-ed-native-select)').count(),4,
    'Major part and lesson lists remain accessible native selectors in both custom tiers');
  assert.ok(await compact.locator('.gn-ed-icon-option').count()>60);
  assert.equal(await page.locator('[data-ep-published="reading"] .gn-ed-icon-options[data-ep-icon-kind="language"] [role=radio]').count(),4);
  const readyReading=page.locator('[data-ep-published="reading"]');
  await readyReading.locator('[data-ep-icon-kind="language"]').getByRole('radio',{name:'English only'}).click();
  assert.match(await readyReading.locator('[data-ep-ready-download]').getAttribute('href'),/reading-english-titles-off\.pdf$/);
  await readyReading.locator('[data-ep-icon-kind="editorial"]').getByRole('radio',{name:/On/}).click();
  assert.match(await readyReading.locator('[data-ep-ready-download]').getAttribute('href'),/reading-english-titles-on\.pdf$/);
  await readyReading.locator('[data-ep-icon-kind="language"]').getByRole('radio',{name:'Arabic fully vowelled'}).click();
  assert.match(await readyReading.locator('[data-ep-ready-download]').getAttribute('href'),/reading-arabic-vowelled-titles-on\.pdf$/);
  // Radio arrows should select the next visible option.
  const language=readyReading.locator('[data-ep-icon-kind="language"]');
  const selected=language.getByRole('radio',{checked:true});
  await selected.focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await language.getByRole('radio',{checked:true}).count(),1,'Keyboard arrow selects a single option');
  const readingDrawer=page.locator('.gn-ed-reading-custom');
  assert.ok(!(await readingDrawer.getAttribute('open')), 'Custom printing starts collapsed');
  await page.screenshot({path:path.join(out,'editions-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.join(out,'editions-mobile.png'),fullPage:true});
  await page.setViewportSize({width:1200,height:900});
  await readingDrawer.locator('summary').click();
  const custom=page.locator('[data-ep-tier="reading"]');
  await custom.locator('[data-ep-icon-kind="language"]').getByRole('radio',{name:'English only'}).click();
  assert.equal(await custom.locator('[data-ep-icon-kind="columns"] [role=radio]:not([hidden])').count(),2,
    'Side-by-side bilingual layouts are hidden for English-only');
  await custom.locator('[data-ep-icon-kind="scope"]').getByRole('radio',{name:'One major part'}).click();
  assert.equal(await custom.locator('[data-ep-icon-kind="part"]').count(),0,
    'Five-part selector remains native rather than a wall of icons');
  await custom.locator('select[data-ep-control="part"]').selectOption('derivation');
  assert.match(await custom.locator('[data-ep-count="reading"]').textContent(),/82 numbered source sections/);
  const titles=custom.locator('.gn-ed-toggle').filter({hasText:'Include editorial section titles'});
  await titles.locator('[data-ep-icon-kind="editorial"]').getByRole('radio',{name:'On'}).click();
  assert.equal(await titles.locator('[role=radio][aria-checked=true]').count(),1);
  assert.ok(await custom.locator('.gn-ed-paper .gn-ep-editorial').count()>=1);
  const vowels=custom.locator('.gn-ed-vowels .gn-ed-icon-options');
  assert.equal(await vowels.locator('[role=radio]').count(),2);
  // Returning to the route should not accumulate delegated listeners or duplicate selectors.
  await page.screenshot({path:path.join(out,'editions-custom-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.join(out,'editions-custom-mobile.png'),fullPage:true});
  const geometry=await page.evaluate(()=>{
    const region=document.querySelector('.gn-editions');
    const bounds=region?.getBoundingClientRect();
    const buttons=[...document.querySelectorAll('.gn-editions .gn-ed-icon-option')].filter(e=>!e.hidden&&e.getClientRects().length);
    const minHeight=Math.min(...buttons.map(e=>e.getBoundingClientRect().height));
    return {overflow:Math.round(document.documentElement.scrollWidth-window.innerWidth),
      contentOverflow:bounds?Math.round(bounds.right-window.innerWidth):0,minHeight,buttons:buttons.length};
  });
  assert.ok(geometry.overflow<=2,'No mobile horizontal overflow: '+JSON.stringify(geometry));
  assert.ok(geometry.minHeight>=42,'Touch controls are comfortably sized: '+JSON.stringify(geometry));
  assert.ok(!errors.some(s=>/editions-icons|GnammaEditions/.test(s)),'No Editions JS errors: '+errors.join('; '));
  console.log('PASS: published PDFs, icon selectors, keyboard input, title/vowel toggles, source-scoped print selection and 390px mobile layout '+JSON.stringify(geometry));
} finally {
  await context.close();
  await browser.close();
}
