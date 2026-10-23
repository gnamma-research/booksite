/* One-off, isolated Playwright check of the actual public GitHub Pages search.
 * Zero authenticated user storage, no Reader data writes, no model downloads.
 */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const [label,width,height] of [['iPhone',390,844],['small-phone',320,700],['desktop',1366,820]]){
   const ctx=await browser.newContext({viewport:{width,height},isMobile:width<=390,hasTouch:width<=390});
   const page=await ctx.newPage(),scriptErrors=[];
   page.on('pageerror',e=>scriptErrors.push(e.message));
   const url='https://gnamma-research.github.io/booksite/daruri/?live-qiyas-qa=20261023-qiyas-forms1-'+width;
   await page.goto(url,{waitUntil:'domcontentloaded',timeout:100000});
   await page.waitForFunction(()=>!!window.GnammaUnifiedSearch&&!!window.GnammaMorphology,
     null,{timeout:100000});
   await page.locator('#searchBtn').click();
   await page.locator('#gns-query').fill('qiyas');
   await page.waitForFunction(()=>document.querySelector('.gns-morph-assist')?.textContent.includes('أقيسة'),
     null,{timeout:30000});
   console.log('PASS',label,'normal qiyas search surfaces أقيسة in word-form suggestion');
   await page.locator('[data-gns-morph-pick="morph-lemma"]').first().click();
   await page.waitForFunction(()=>{
     const api=window.GnammaUnifiedSearch;
     if(api?.getState().mode!=='morph-lemma')return false;
     const results=api.query('qiyas',{mode:'morph-lemma'}).results;
     return results.some(x=>x.id==='passage:223:0'&&x.matched?.term==='أقيسة');
   },null,{timeout:35000});
   const meta=await page.evaluate(()=>{
     const result=window.GnammaUnifiedSearch.query('qiyas',{mode:'morph-lemma'}).results;
     const hit=result.find(x=>x.id==='passage:223:0');
     return {count:result.length,firstId:result[0]?.id,
       firstTerm:result[0]?.matched?.term,matchedTerm:hit?.matched?.term,
       paragraphForms:hit?.matched?.forms,
       highlighted:document.querySelector('.gns-result .gns-row-excerpt mark')?.textContent,
       preview:document.querySelector('.gns-result .gns-morph-in-paragraph')?.textContent,
       scroll:document.documentElement.scrollWidth,viewport:innerWidth,
       scriptVersion:window.GnammaUnifiedSearch.version,
       unverifiedRelease:!!window.GnammaContextualMorphAssets};
   });
   assert.equal(meta.matchedTerm,'أقيسة',JSON.stringify(meta));
   assert.ok(meta.paragraphForms?.includes('أقيسة'),JSON.stringify(meta));
   assert.equal(meta.firstId,'passage:223:0',JSON.stringify(meta));
   assert.equal(meta.firstTerm,'أقيسة',JSON.stringify(meta));
   assert.equal(meta.highlighted,'أقيسة',JSON.stringify(meta));
   assert.ok(meta.scroll<=meta.viewport+1,JSON.stringify(meta));
   assert.equal(meta.unverifiedRelease,false,'Unreviewed AI candidate indexing must remain off');
   assert.equal(scriptErrors.length,0,'Unexpected page errors: '+scriptErrors.join('; '));
   console.log('PASS',label,'§223 first, plural highlighted, other forms preserved; no overflow',
      JSON.stringify(meta));
   await ctx.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
