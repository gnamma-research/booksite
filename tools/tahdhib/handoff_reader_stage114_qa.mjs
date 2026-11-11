/* Stage114 GNAMMA reader: direct verification of the published 1,090-entry first-pass draft.
 * This is separate from the unchanged Stage113 historical test, which runs on its archive.
 */
import {chromium,webkit} from 'playwright';
const base=process.env.TAHDHIB_QA_BASE||'http://127.0.0.1:8765/';
const root='texts/al-taftazani/tahdhib-al-mantiq/edition/';
let failures=[];
const check=(value,message)=>{if(!value)throw new Error(message)};
for(const [engine,browserType] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await browserType.launch({headless:true});
 try{
  for(const viewport of [{width:1280,height:840},{width:390,height:844}]){
   const context=await browser.newContext({viewport,reducedMotion:'reduce'});
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   try{
    await page.goto(new URL(root+'hawashi-numbered-notes.html',base).href,{waitUntil:'networkidle',timeout:60000});
    await page.waitForFunction(()=>window.TahdhibAudit?.total===1090,{timeout:30000});
    const audit=await page.evaluate(()=>window.TahdhibAudit);
    check(audit.sections===14,'Expected 14 historical local numbering series');
    for(const [status,count] of [['first_pass_draft',738],['inherited_first_pass',291],['modern_editorial_reference',57],['translated_visible_text_missing_table',4]]){
      check(audit.statuses[status]===count,'Wrong source grade '+status+': '+audit.statuses[status]);
    }
    check(await page.locator('#entries article.note').count()===40,'First pagination page must contain 40 records');
    check(await page.locator('a[href="progress.html"]').count()>=1,'Research progress not linked');
    await page.request.get(new URL(root+'progress-stage114.html',base).href).then(res=>check(res.ok(),'Stage114 status page not accessible'));
    check(await page.locator('a[href="hawashi-numbered-notes-stage113-archive.html"]').count()>=1,'Stage113 reader archive not linked');
    await page.locator('#section').selectOption('H-SCIENCES');
    check(await page.evaluate(()=>window.TahdhibAudit.getMatches())===86,'Final Sciences section must contain 86 records');
    await page.locator('#search').fill('HWN-SCIENCES-086');
    await page.waitForFunction(()=>window.TahdhibAudit.getMatches()===1);
    check(await page.locator('#HWN-SCIENCES-086').count()===1,'Final Qum395 gloss not reachable');
    await page.locator('#search').fill('');
    await page.waitForFunction(()=>window.TahdhibAudit.getMatches()===86);
    await page.locator('#section').selectOption('all');
    await page.locator('#status').selectOption('modern_editorial_reference');
    check(await page.evaluate(()=>window.TahdhibAudit.getMatches())===57,'Must show 57 reference-only entries');
    await page.locator('#status').selectOption('translated_visible_text_missing_table');
    check(await page.evaluate(()=>window.TahdhibAudit.getMatches())===4,'Must show four missing-table entries');
    await page.locator('#status').selectOption('english');
    check(await page.evaluate(()=>window.TahdhibAudit.getMatches())===1033,'Prose-rendered group must be 1,029 + four table-gap entries');
    await page.locator('#status').selectOption('all');
    check(await page.evaluate(()=>window.TahdhibAudit.getMatches())===1090,'All records should restore');
    const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,visible:document.documentElement.clientWidth}));
    check(width.scroll<=width.visible+5,'Horizontal overflow '+JSON.stringify(width));
    check(errors.length===0,'Browser exceptions '+errors.join(' | '));
    console.log('PASS',engine,viewport.width,'GNAMMA Stage114: 1090 notes,14 sections,1029 English,4 table gaps,57 references');
   }catch(e){failures.push(engine+' '+viewport.width+' '+e.message);console.error('FAIL',failures.at(-1))}
   finally{await context.close()}
  }
 }finally{await browser.close()}
}
if(failures.length)process.exit(1);
console.log('PASS Stage114 published H reader');
