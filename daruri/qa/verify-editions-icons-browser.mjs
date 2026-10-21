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
  assert.ok(groups>=selects-1,'Short-choice toolbars are enhanced; one PDF language selector is manually controlled');
  const visiblePanels=()=>page.locator('.gn-editions [role="tabpanel"]').evaluateAll(
    panels=>panels.filter(p=>!p.hidden && getComputedStyle(p).display!=='none').map(p=>p.id));
  assert.equal(await page.getByRole('tablist',{name:'Edition level'}).getByRole('tab').count(),3,
    'Exactly three accessible edition tabs');
  assert.deepEqual(await visiblePanels(),['gn-ed-reading'],'Default is Reading, not three stacked panels');
  const readingTab=page.getByRole('tab',{name:'Reading edition'});
  const studyTab=page.getByRole('tab',{name:'Study edition'});
  const referenceTab=page.getByRole('tab',{name:'Reference edition'});
  assert.equal(await readingTab.getAttribute('aria-selected'),'true');
  assert.equal(await studyTab.getAttribute('tabindex'),'-1');
  assert.equal(await page.locator('.gn-ed-edition-nav .gn-ed-personal-action').getAttribute('href'),'personal-export.html');
  assert.equal(await compact.locator('select:not(.gn-ed-native-select)').count(),4,
    'Major part and lesson lists remain accessible native selectors in both custom tiers');
  assert.ok(await compact.locator('.gn-ed-icon-option').count()>=50);
  assert.equal(await compact.locator('.gn-ed-icon-label').count(),0,'No option captions inside icon buttons');
  const symbols=await page.evaluate(()=>{
    const targets=[...document.querySelectorAll(
      '.gn-ed-icon-option, .gn-ed-tablist [role=tab], .gn-ed-personal-action, .gn-ed-pdf-actions a, .gn-ed-study-custom > summary, .gn-ed-actions button'
    )];
    return {nonSvgChildren:targets.filter(e=>[...e.children].some(c=>c.tagName.toLowerCase()!=='svg')).length,
      unnamed:targets.filter(e=>!e.getAttribute('aria-label') && !e.closest('.gn-ed-icon-options')).length,
      visibleInstructions:[...document.querySelectorAll('.gn-editions .gn-ed-intro, .gn-editions .gn-ed-small, .gn-editions .gn-ed-extra, .gn-editions .gn-ed-card > p')].filter(e=>e.getBoundingClientRect().width>20 && e.getBoundingClientRect().height>15).length,
      markers:document.querySelectorAll('.gn-ed-field-marker').length};
  });
  assert.equal(symbols.nonSvgChildren,0,'All toolbar choices and actions are SVG-only');
  assert.equal(symbols.unnamed,0,'All non-radio icon controls have accessible names');
  assert.equal(symbols.visibleInstructions,0,'No explanatory paragraphs appear');
  assert.ok(symbols.markers>=10,'Every custom control has a category icon');
  const readyReading=page.locator('[data-ep-published="reading"]');
  const en=readyReading.getByRole('button',{name:'Include English text'});
  const ar=readyReading.getByRole('button',{name:'Include Arabic text'});
  const marks=readyReading.getByRole('button',{name:'Arabic vowel marks'});
  const currentPDF=()=>readyReading.locator('[data-ep-ready-download]').getAttribute('href');
  assert.equal(await en.getAttribute('aria-pressed'),'true');
  assert.equal(await ar.getAttribute('aria-pressed'),'true');
  assert.equal(await marks.getAttribute('aria-pressed'),'true');
  assert.equal(await marks.isVisible(),true,'Vowel control is visible when both languages are on');
  assert.match(await currentPDF(),/reading-bilingual-titles-off\.pdf$/);
  assert.match(await page.locator('[data-ep-info-detail]').textContent(),/76 A4 pages/);
  await marks.click();
  assert.equal(await marks.getAttribute('aria-pressed'),'false');
  assert.match(await currentPDF(),/reading-bilingual-unvowelled-titles-off\.pdf$/);
  assert.equal(await page.locator('[data-ep-info-value]').textContent(),'Unvowelled');
  await en.click();
  assert.equal(await en.getAttribute('aria-pressed'),'false');
  assert.equal(await ar.isDisabled(),true,'Last active language cannot be turned off');
  assert.match(await currentPDF(),/reading-arabic-titles-off\.pdf$/);
  await marks.click();
  assert.match(await currentPDF(),/reading-arabic-vowelled-titles-off\.pdf$/);
  await en.click();
  assert.match(await currentPDF(),/reading-bilingual-titles-off\.pdf$/);
  await ar.click();
  assert.equal(await marks.isVisible(),false,'Vowel switch hides when Arabic is turned off');
  assert.match(await currentPDF(),/reading-english-titles-off\.pdf$/);
  assert.equal(await page.locator('[data-ep-info-value]').textContent(),'English only');
  assert.match(await page.locator('[data-ep-info-detail]').textContent(),/43 A4 pages/);
  await en.focus();
  await page.keyboard.press('Space');
  assert.equal(await en.getAttribute('aria-pressed'),'true',
    'At least one language stays selected under keyboard Space');
  await ar.click();
  assert.equal(await marks.isVisible(),true,'Vowel switch comes back with Arabic');
  assert.equal(await marks.getAttribute('aria-pressed'),'true','Vowel preference survives English-only selection');
  await marks.click();
  assert.match(await currentPDF(),/reading-bilingual-unvowelled-titles-off\.pdf$/);
  await readyReading.locator('[data-ep-icon-kind="editorial"]').getByRole('radio',{name:/On/}).click();
  assert.match(await currentPDF(),/reading-bilingual-unvowelled-titles-on\.pdf$/);
  assert.equal(await page.locator('.gn-ed-status [data-ep-info-kind]').textContent(),'Editorial titles');
  assert.equal(await readyReading.locator('[data-ep-ready-lang]').inputValue(),'bilingual-unvowelled');
  assert.equal(await readyReading.locator('[data-ep-ready-titles]').inputValue(),'on');
  await marks.focus();
  await page.keyboard.press('Space');
  assert.match(await currentPDF(),/reading-bilingual-titles-on\.pdf$/,
    'Vowel mark toggle supports keyboard Space');
  await marks.click();
  assert.match(await currentPDF(),/reading-bilingual-unvowelled-titles-on\.pdf$/);
  await studyTab.focus();
  assert.equal(await page.locator('[data-ep-info-value]').textContent(),'Study');
  assert.deepEqual(await visiblePanels(),['gn-ed-reading'],'Tab focus alone does not change edition');
  await studyTab.click();
  assert.deepEqual(await visiblePanels(),['gn-ed-study'],'Study hides Reading and Reference');
  assert.equal(await page.locator('[data-ep-info-value]').textContent(),'Study');
  assert.equal(await studyTab.getAttribute('aria-selected'),'true');
  assert.equal(await readingTab.getAttribute('tabindex'),'-1');
  assert.equal(await page.locator('[data-ep-published="study"] [data-ep-ready-download]').getAttribute('href')!==null,true);
  const studyPDF=page.locator('[data-ep-published="study"]');
  await studyPDF.locator('[data-ep-icon-kind="editorial"]').getByRole('radio',{name:/On/}).click();
  assert.match(await studyPDF.locator('[data-ep-ready-download]').getAttribute('href'),/study-bilingual-titles-on\.pdf$/);
  await studyTab.focus();
  await page.keyboard.press('ArrowRight');
  assert.deepEqual(await visiblePanels(),['gn-ed-reference'],'ArrowRight selects Reference');
  assert.equal(await referenceTab.getAttribute('aria-selected'),'true');
  assert.match(await page.locator('#gn-ed-reference .gn-ed-pdf-actions a').first().getAttribute('href'),/daruri\.pdf/);
  assert.equal(await page.locator('#gn-ed-reference .gn-ed-study-custom').count(),0,
    'No custom printing in fixed scholarly reference edition');
  await page.keyboard.press('Home');
  assert.deepEqual(await visiblePanels(),['gn-ed-reading'],'Home selects Reading');
  assert.equal(await readingTab.getAttribute('aria-selected'),'true');
  assert.equal(await readyReading.locator('[data-ep-ready-lang]').inputValue(),'bilingual-unvowelled',
    'Previously selected vowelled/unvowelled bilingual choice is retained');
  assert.equal(await readyReading.locator('[data-ep-ready-titles]').inputValue(),'on');
  await page.keyboard.press('End');
  assert.deepEqual(await visiblePanels(),['gn-ed-reference'],'End selects Reference');
  await page.keyboard.press('ArrowLeft');
  assert.deepEqual(await visiblePanels(),['gn-ed-study'],'ArrowLeft selects Study');
  assert.equal(await studyPDF.locator('[data-ep-ready-titles]').inputValue(),'on','Study selections persist');
  await readingTab.click();
  assert.deepEqual(await visiblePanels(),['gn-ed-reading']);
  assert.equal(new URL(page.url()).hash,'#editions','Tab changes stay inside the reader route');
  await readyReading.getByRole('button',{name:'Arabic vowel marks'}).focus();
  const readingDrawer=page.locator('.gn-ed-reading-custom');
  assert.equal(await readingDrawer.locator('.gn-ed-paper').isVisible(),false,'Reading excerpt is hidden until custom print opens');
  assert.equal(await page.locator('#gn-ed-study .gn-ed-study-custom .gn-ed-paper').isVisible(),false,'Study excerpt is initially hidden');
  assert.ok(!(await readingDrawer.getAttribute('open')), 'Custom printing starts collapsed');
  await page.screenshot({path:path.join(out,'editions-desktop.png'),fullPage:true});
  await studyTab.click();
  await page.screenshot({path:path.join(out,'editions-study-desktop.png'),fullPage:true});
  await referenceTab.click();
  await page.screenshot({path:path.join(out,'editions-reference-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await readingTab.click();
  await page.screenshot({path:path.join(out,'editions-mobile.png'),fullPage:true});
  await studyTab.click();
  await page.screenshot({path:path.join(out,'editions-study-mobile.png'),fullPage:true});
  await referenceTab.click();
  await page.screenshot({path:path.join(out,'editions-reference-mobile.png'),fullPage:true});
  await page.setViewportSize({width:1200,height:900});
  await readingTab.click();
  await readingDrawer.locator(':scope > summary').click();
  const custom=page.locator('[data-ep-tier="reading"]');
  const sample=custom.locator('.gn-ed-preview-details');
  assert.ok(!(await sample.getAttribute('open')), 'Print preview starts collapsed');
  assert.equal(await sample.locator('.gn-ed-paper').isVisible(),false);
  await sample.locator('summary').click();
  assert.equal(await sample.locator('.gn-ed-paper').isVisible(),true,'Preview can be opened');
  await sample.locator('summary').click();
  assert.equal(await sample.locator('.gn-ed-paper').isVisible(),false,'Preview can be closed');
  assert.equal(await custom.locator('[data-ep-control="language"]').inputValue(),'bilingual',
    'Custom printing inherits both Reading languages');
  assert.equal(await custom.locator('[data-ep-control="vowels"]').isChecked(),false,
    'Custom printing inherits the unvowelled choice');
  await custom.locator('[data-ep-icon-kind="language"]').getByRole('radio',{name:'English only'}).click();
  assert.equal(await readyReading.locator('[data-ep-ready-lang]').inputValue(),'english',
    'Changing advanced language synchronizes the published Reading controls');
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
  assert.deepEqual(await visiblePanels(),['gn-ed-reading'],'One selected panel after customisation');
  assert.ok(geometry.minHeight>=42,'Touch controls are comfortably sized: '+JSON.stringify(geometry));
  assert.equal(await page.locator('.gn-ed-top').evaluate(
    el=>getComputedStyle(el).position),'sticky','Selection status stays available when scrolling custom options');
  await page.setViewportSize({width:320,height:700});
  const narrow=await page.evaluate(()=>Math.round(document.documentElement.scrollWidth-window.innerWidth));
  assert.ok(narrow<=2,'No overflow at 320px viewport: '+narrow);
  assert.ok(!errors.some(s=>/editions-icons|GnammaEditions/.test(s)),'No Editions JS errors: '+errors.join('; '));
  console.log('PASS: EN/AR independent switches, conditional vowels, both bilingual print variants, disabled last language, keyboard state, three tabs, advanced sync and 320/390px mobile layouts '+JSON.stringify(geometry));
} finally {
  await context.close();
  await browser.close();
}
