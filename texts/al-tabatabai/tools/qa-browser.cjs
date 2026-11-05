/*
 * Browser regression for the Gnamma Hikma three-book reader.
 * Run with a local server rooted at the repository:
 *   python3 -m http.server 8767 --bind 127.0.0.1 &
 *   npm install --no-save --package-lock=false playwright@1.58.0
 *   node texts/al-tabatabai/tools/qa-browser.cjs
 */
'use strict';
const { chromium, webkit } = require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const base=process.env.HIKMA_QA_BASE||'http://127.0.0.1:8767/texts/al-tabatabai/';
const output=process.env.HIKMA_QA_OUTPUT||'hikma-qa-artifacts';
fs.mkdirSync(output,{recursive:true});
let count=0;
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function ready(page){
  await page.locator('#reading-content article.passage').first().waitFor({state:'attached',timeout:35000});
  await page.waitForFunction(()=>document.querySelector('#reading-content article.passage .text-body p')?.textContent.trim().length>4);
}
async function check(label, fn){
  try{await fn();count++;console.log('PASS '+label)}
  catch(e){console.error('FAIL '+label+': '+e.stack);throw e}
}
async function run(browserType){
  const browser=await browserType.launch({headless:true});
  const errors=[];
  try{
    const ctx=await browser.newContext({viewport:{width:1365,height:900},reducedMotion:'reduce'});
    const page=await ctx.newPage();
    page.on('pageerror',error=>errors.push(error.message));
    await check(browserType.name()+' three-book landing',async()=>{
      await page.goto(base,{waitUntil:'domcontentloaded'});
      await ready(page);
      assert.equal(await page.locator('#reading-view').inputValue(),'continuous');
      assert.equal(await page.evaluate(()=>document.documentElement.dataset.order),'arabic-first');
      assert.equal(await page.locator('body').getAttribute('data-book'),'combined');
      assert.ok((await page.locator('#reading-content article.passage').count())>=25);
      assert.ok((await page.locator('.hikma-part-tabs button').count())===3);
    });
    await check(browserType.name()+' authorial opening tabs',async()=>{
      await page.locator('[data-part-jump="passage-B-INTRO"]').click();
      await page.locator('#passage-B-INTRO').waitFor({state:'attached'});
      assert.match(await page.locator('#current-location').textContent(),/Bidāy/);
      assert.equal(await page.locator('[data-part-jump="passage-B-INTRO"]').getAttribute('aria-current'),'true');
      await page.locator('[data-part-jump="passage-N-INTRO"]').click();
      await page.locator('#passage-N-INTRO').waitFor({state:'attached',timeout:35000});
      assert.match(await page.locator('#current-location').textContent(),/Nihāy/);
      await page.goBack();await page.locator('#passage-B-INTRO').waitFor({state:'attached'});
    });
    await check(browserType.name()+' bilingual control, focus and chapter navigation',async()=>{
      await page.locator('button[data-language="english"]').click();
      assert.equal(await page.evaluate(()=>document.documentElement.dataset.language),'english');
      await page.locator('#reading-view').selectOption('focus');
      assert.equal(await page.locator('#reading-view').inputValue(),'focus');
      const before=await page.locator('#current-location').textContent();
      await page.locator('#next-chapter').click();
      const after=await page.locator('#current-location').textContent();
      assert.notEqual(before,after);
      await page.locator('button[data-language="bilingual"]').click();
    });
    await check(browserType.name()+' cross-book search and glossary',async()=>{
      const field=page.locator('#book-search');
      await field.fill('الموجود');
      await page.waitForTimeout(350);
      assert.ok((await page.locator('#reading-content article.passage').count())>0);
      assert.ok((await page.locator('#search-summary').textContent()).includes('matching'));
      await page.locator('#clear-filters').click();
      await page.locator('#glossary-open').click();
      assert.equal(await page.locator('#glossary-dialog').evaluate(el=>el.open),true);
      await page.locator('#glossary-search').fill('quiddity');
      assert.ok((await page.locator('#glossary-list article.glossary-entry').count())>0);
      await page.locator('#glossary-dialog [data-close-dialog]').click();
    });
    await check(browserType.name()+' local bookmarks and notes',async()=>{
      await page.locator('[data-part-jump="passage-M-P-01"]').click();
      await page.locator('#passage-M-P-01').waitFor({state:'attached'});
      const passage=page.locator('#passage-M-P-01');
      await passage.locator('[data-bookmark]').click();
      assert.equal(await passage.locator('[data-bookmark]').getAttribute('aria-pressed'),'true');
      await passage.locator('[data-note]').click();
      await page.locator('#note-text').fill('A regression-test note');
      await page.locator('#note-form button[type="submit"]').click();
      assert.ok((await page.locator('#saved-count').textContent()).trim()==='1');
      await page.reload();await ready(page);
      assert.equal(await page.locator('#passage-M-P-01 [data-bookmark]').getAttribute('aria-pressed'),'true');
      assert.ok((await page.locator('#saved-count').textContent()).trim()==='1');
    });
    await check(browserType.name()+' print layout switch',async()=>{
      await page.evaluate(()=>{window.print=()=>{window.__pdfTriggered=document.body.dataset.pdfMode;};});
      await page.locator('#pdf-print').click();
      assert.equal(await page.locator('#pdf-layout-dialog').evaluate(el=>el.open),true);
      await page.locator('#pdf-layout-dialog input[value="reference"]').check();
      await page.locator('#pdf-confirm').click();
      assert.equal(await page.evaluate(()=>window.__pdfTriggered),'reference');
      assert.ok(await page.locator('body').getAttribute('data-pdf-mode')==='reference');
      await page.evaluate(()=>{window.dispatchEvent(new Event('afterprint'));});
      assert.equal(await page.locator('body').getAttribute('data-pdf-mode'),null);
    });
    if(browserType.name()==='chromium'){
      await check('A4 study PDF generation',async()=>{
        await page.locator('#pdf-print').click();
        await page.locator('#pdf-layout-dialog input[value="study"]').check();
        await page.locator('#pdf-confirm').click();
        const pdf=await page.pdf({format:'A4',printBackground:true,displayHeaderFooter:true,
          headerTemplate:'<span></span>',
          footerTemplate:'<div style="font:8px Georgia;text-align:center;width:100%;color:#888"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
          margin:{top:'16mm',bottom:'18mm',left:'15mm',right:'15mm'}});
        assert.ok(pdf.length>25000,'PDF too small');
        fs.writeFileSync(path.join(output,'muzaffar-study-A4-smoke.pdf'),pdf);
        await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
      });
    }
    await page.screenshot({path:path.join(output,browserType.name()+'-desktop.png'),fullPage:false});
    const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,reducedMotion:'reduce'});
    const phone=await mobile.newPage();phone.on('pageerror',error=>errors.push(error.message));
    await check(browserType.name()+' portrait mobile controls',async()=>{
      await phone.goto(base,{waitUntil:'domcontentloaded'});
      await ready(phone);
      const width=await phone.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
      assert.ok(width.scroll<=width.width+3,'Horizontal overflow: '+JSON.stringify(width));
      await phone.locator('#contents-toggle').click();
      assert.equal(await phone.locator('#contents-toggle').getAttribute('aria-expanded'),'true');
      assert.equal(await phone.locator('body').evaluate(e=>e.classList.contains('contents-open')),true);
      await phone.locator('#contents-close').click();
      await phone.locator('[data-part-jump="passage-B-INTRO"]').click();
      await phone.locator('#passage-B-INTRO').waitFor({state:'attached'});
    });
    await phone.screenshot({path:path.join(output,browserType.name()+'-phone.png'),fullPage:false});
    await check(browserType.name()+' no uncaught JavaScript errors',async()=>{assert.deepEqual(errors,[])});
    await mobile.close();await ctx.close();
  }finally{await browser.close()}
}
(async()=>{
  for(const type of [chromium,webkit]){
    if(process.env.HIKMA_QA_BROWSER && process.env.HIKMA_QA_BROWSER!==type.name())continue;
    await run(type);
  }
  console.log('All '+count+' checks passed');
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
