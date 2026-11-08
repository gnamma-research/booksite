const { chromium, webkit } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const dir='texts/al-zamakhshari/al-kashshaf';
const base='http://127.0.0.1:8767/'+dir+'/';
const edition=JSON.parse(fs.readFileSync(path.join(dir,'edition.json'),'utf8'));
const out='qa-kashshaf';fs.mkdirSync(out,{recursive:true});
const results=[];
const tidy=s=>s.replace(/\s+/g,' ').trim();
async function run(browserType,name){
  const browser=await browserType.launch();
  try {
    const context=await browser.newContext({viewport:{width:1440,height:960}});
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(String(e)));
    for(const book of edition.books){
      const url=base+'surah-'+String(book.number).padStart(3,'0')+'.html';
      await page.goto(url);await page.waitForLoadState('networkidle');
      assert.equal(await page.locator('.segment').count(),book.segments.length);
      const ids=await page.locator('.segment').evaluateAll(es=>es.map(e=>e.id));
      assert.equal(new Set(ids).size,ids.length);
      for(const s of book.segments){
        const actual=await page.locator('[id="'+s.id+'"] .prose').innerText();
        assert.equal(tidy(actual),tidy(s.text),'Text preservation '+s.id);
      }
      results.push({browser:name,surah:book.number,segments:book.segments.length,completeText:true});
    }
    await page.goto(base+'surah-097.html');
    const layers=page.locator('.reader-controls [data-action="layers"]');
    await layers.click();assert.equal(await layers.getAttribute('aria-pressed'),'false');
    assert.equal(await page.locator('.tibi-layer:visible').count(),0);
    assert.ok(await page.locator('.kashshaf:visible').count()>0);
    await page.reload();assert.equal(await layers.getAttribute('aria-pressed'),'false');
    await page.goto(base+'surah-104.html');assert.equal(await layers.getAttribute('aria-pressed'),'false');
    await page.goto(base+'surah-099.html#T099.09');
    assert.equal(await layers.getAttribute('aria-pressed'),'true');
    assert.ok(await page.locator('[id="T099.09"]').isVisible());
    await page.locator('.reader-controls [data-action="save"]').click();
    await page.locator('.reader-controls [data-action="contents"]').click();
    assert.ok(await page.locator('#saved-list .saved-item').count()>0);
    await page.locator('#sheet [data-action="close"]').click();
    await layers.click();
    await page.locator('.reader-controls [data-action="search"]').click();
    await page.locator('#search-input').fill('T099.09');
    await page.locator('#search-results a').first().waitFor();
    await page.locator('#search-results a').first().click();
    assert.equal(await layers.getAttribute('aria-pressed'),'true');
    assert.match(page.url(),/#T099\.09$/);
    await page.locator('.reader-controls [data-action="settings"]').click();
    await page.locator('#theme-select').selectOption('night');
    await page.getByRole('button',{name:'Increase text size'}).click();
    await page.locator('#sheet [data-action="close"]').click();
    await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),'night');
    assert.match(await page.locator('html').getAttribute('style'),/21px/);
    await page.locator('.reader-controls [data-action="settings"]').click();
    await page.locator('#theme-select').selectOption('sea');
    await page.locator('#sheet [data-action="close"]').click();
    await page.goto(base+'surah-097.html');
    for(const size of [{width:1440,height:960},{width:320,height:700},{width:375,height:812},{width:390,height:844},{width:430,height:932},{width:844,height:390}]){
      await page.setViewportSize(size);
      await page.evaluate(()=>document.fonts.ready);
      const fits=await page.evaluate(()=>({page:document.documentElement.scrollWidth<=innerWidth+1,toolbar:[...document.querySelectorAll('.reader-controls button')].every(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1;})}));
      assert.ok(fits.page,'No horizontal overflow '+name+' '+size.width);
      assert.ok(fits.toolbar,'All controls fit '+name+' '+size.width);
      await page.screenshot({path:out+'/'+name+'-'+size.width+'x'+size.height+'.png'});
    }
    await page.goto(base+'surah-001.html');
    assert.match(await page.locator('.chapter-heading .coverage').innerText(),/I:687–770 remains untranslated/);
    assert.equal(await page.locator('.partial-marker').count(),1);
    for(const file of ['complete-reading-copy.txt','Kashshaf-Tibi-C06-Translations.zip','coverage.json'])assert.equal((await context.request.get(base+file)).status(),200);
    const noJS=await browser.newContext({javaScriptEnabled:false});const raw=await noJS.newPage();
    for(const n of [97,104,95,99,101]){
      await raw.goto(base+'surah-'+String(n).padStart(3,'0')+'.html');
      const book=edition.books.find(b=>b.number===n);
      assert.equal(await raw.locator('.segment').count(),book.segments.length);
      assert.ok(await raw.locator('.tibi-layer').first().isVisible());
    }
    await noJS.close();assert.deepEqual(errors,[]);
    results.push({browser:name,layerPersistence:true,deepLinks:true,searchRevealsTibi:true,bookmarks:true,settings:true,noJavaScriptContent:true,responsiveWidths:[320,375,390,430,844,1440],pageErrors:errors});
    await context.close();
  } finally {await browser.close();}
}
(async()=>{try{await run(chromium,'chromium');await run(webkit,'webkit');fs.writeFileSync(out+'/results.json',JSON.stringify({status:'passed',results},null,2));console.log('PASS: 19 complete chapter pages, both engines, layer controls, search, bookmarks, persistence, no-JavaScript content, responsive layouts.');}catch(e){fs.writeFileSync(out+'/results.json',JSON.stringify({status:'failed',error:String(e),stack:e.stack,results},null,2));throw e;}})();
