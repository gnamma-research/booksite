/* Stage 104 durable progress + note reader browser QA (Chromium / WebKit).
 * Checks content, filters, source links, 8 progress bars, accessible mobile layout. */
import { chromium, webkit } from 'playwright';
const base=process.env.TAHDHIB_QA_BASE||'http://127.0.0.1:8765/';
const sub='texts/al-taftazani/tahdhib-al-mantiq/edition/';
const errors=[];
const expect=(ok,msg)=>{if(!ok)throw Error(msg)};
for(const [name,browserType] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await browserType.launch({headless:true});
 try{
  for(const viewport of [{width:1280,height:850},{width:390,height:844}]){
   const ctx=await browser.newContext({viewport,reducedMotion:'reduce'}),page=await ctx.newPage(),exceptions=[];
   page.on('pageerror',e=>exceptions.push(e.message));
   try{
    await page.goto(new URL(sub+'progress.html',base).href,{waitUntil:'networkidle',timeout:60000});
    expect(await page.locator('#metrics progress').count()===8,'Not eight progress bars');
    const vals=await page.locator('#metrics progress').evaluateAll(list=>list.map(x=>[Number(x.value),Number(x.max)]));
    expect(JSON.stringify(vals)===JSON.stringify([[19,19],[110,110],[0,110],[52,274],[0,274],[12,18],[46,46],[0,46]]),'Incorrect stage 104 progress totals: '+JSON.stringify(vals));
    expect((await page.locator('#stages .stage').count())===3,'Missing cumulative stages 102-104');
    expect((await page.locator('#note-state').textContent()).includes('1, 2, 8, 9, 12, 15'),'Incomplete notes not surfaced in progress dashboard');
    expect(exceptions.length===0,'Progress browser errors '+exceptions.join(' | '));
    await page.goto(new URL(sub+'hawashi-numbered-notes.html',base).href,{waitUntil:'networkidle',timeout:60000});
    expect(await page.locator('#notes .note').count()===18,'Note reader not displaying 18 note records');
    expect((await page.locator('#notes .ar').count())===18,'Missing original Arabic locator lemmata');
    expect((await page.locator('#notes .en').count())===18,'Missing English translations');
    expect((await page.locator('#notes a[href*="/12170/"]').count())>=18,'No source-page links');
    await page.locator('#filter').selectOption('complete_searchable_note');
    expect(await page.locator('#notes .note').count()===12,'Complete-note filter incorrectly counted');
    await page.locator('#filter').selectOption('partial_translation');
    expect(await page.locator('#notes .note').count()===6,'Partial-note filter incorrectly counted');
    await page.locator('#filter').selectOption('all');
    await page.locator('#search').fill('HWN-009');
    expect(await page.locator('#notes .note').count()===1,'Exact note ID search failed');
    await page.locator('#search').fill('');
    expect(await page.locator('#notes .note').count()===18,'Clear search did not restore notes');
    const w=await page.evaluate(()=>({actual:document.documentElement.scrollWidth,visible:document.documentElement.clientWidth}));
    expect(w.actual<=w.visible+3,'Reader horizontal overflow: '+JSON.stringify(w));
    expect(exceptions.length===0,'Note reader JS errors '+exceptions.join(' | '));
    console.log('PASS',name,viewport.width,'8 stage metrics, three stages, 18 notes (12 complete/6 partial), source links, mobile');
   }catch(e){errors.push(name+' '+viewport.width+' '+e.message);console.error('FAIL',errors.at(-1))}
   finally{await ctx.close()}
  }
 }finally{await browser.close()}
}
if(errors.length)process.exit(1);
console.log('PASS Stage104 cumulative handoff and progress reader QA');
