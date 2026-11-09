/* Stage106 cumulative bilingual notes + nine source-graded progress bars.
 * Chromium & WebKit, desktop + iPhone width. No inference of page completion. */
import { chromium, webkit } from 'playwright';
const base=process.env.TAHDHIB_QA_BASE||'http://127.0.0.1:8765/';
const dir='texts/al-taftazani/tahdhib-al-mantiq/edition/';
const errors=[],expect=(x,msg)=>{if(!x)throw Error(msg)};
for(const [engine,type] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await type.launch({headless:true});
 try{
  for(const viewport of [{width:1280,height:850},{width:390,height:844}]){
   const context=await browser.newContext({viewport,reducedMotion:'reduce'});
   const page=await context.newPage(),exceptions=[];
   page.on('pageerror',e=>exceptions.push(e.message));
   try{
    await page.goto(new URL(dir+'progress.html',base).href,{waitUntil:'networkidle',timeout:60000});
    expect((await page.locator('#metrics progress').count())===9,'Expected nine distinct progress bars');
    const values=await page.locator('#metrics progress').evaluateAll(nodes=>nodes.map(x=>[Number(x.value),Number(x.max)]));
    const expected=[[19,19],[110,110],[0,110],[52,274],[0,274],[53,55],[32,55],[46,46],[0,46]];
    expect(JSON.stringify(values)===JSON.stringify(expected),'Inaccurate research progress '+JSON.stringify(values));
    expect((await page.locator('#stages .stage').count())===5,'Need historical Stages 102–106');
    const noteStatus=await page.locator('#note-state').textContent();
    expect(noteStatus.includes('Partial notes: 1, 25.'),'Unresolved notes omitted from dashboard: '+noteStatus);
    expect((await page.locator('a[href*="hwn001-055.md"]').count())>=1,'Cumulative Markdown not discoverable');
    await page.goto(new URL(dir+'hawashi-numbered-notes.html',base).href,{waitUntil:'networkidle',timeout:60000});
    expect((await page.locator('#notes .note').count())===55,'Not 55 consecutive numbered notes');
    expect((await page.locator('#notes .grid .ar').count())===55,'Missing Arabic source/locator fields');
    expect((await page.locator('#notes .grid .en').count())===55,'Missing English text fields');
    expect((await page.locator('#notes a[href*="/12170/"]').count())>=55,'Missing original Qum source links');
    expect((await page.locator('#notes .source-notice .ar').count())===2,'Two unnumbered Arabic glosses not rendered');
    expect((await page.locator('#notes .source-notice .en').count())===2,'Two unnumbered English glosses not rendered');
    const arabic55=await page.locator('#HWN-055 .grid .ar').textContent();
    expect(arabic55.length>700,'Note55 full Arabic working transcription not loaded');
    const arabic1=await page.locator('#HWN-001 .grid .ar').textContent();
    expect(arabic1.length<arabic55.length/2,'Note1 should remain Arabic locator only');
    await page.locator('#filter').selectOption('complete_searchable_note');
    expect((await page.locator('#notes .note').count())===53,'Expected 53 complete first-pass notes');
    await page.locator('#filter').selectOption('partial_translation');
    expect((await page.locator('#notes .note').count())===2,'Expected exactly two incomplete numbered notes');
    await page.locator('#filter').selectOption('all');
    await page.locator('#search').fill('HWN-055');
    expect((await page.locator('#notes .note').count())===1,'Search by exact id failed');
    await page.locator('#search').fill('');
    expect((await page.locator('#notes .note').count())===55,'Clear search did not restore notes');
    const widths=await page.evaluate(()=>({actual:document.documentElement.scrollWidth,visible:document.documentElement.clientWidth}));
    expect(widths.actual<=widths.visible+3,'Horizontal overflow '+JSON.stringify(widths));
    expect(exceptions.length===0,'JavaScript errors '+exceptions.join(' | '));
    console.log('PASS',engine,viewport.width,'55 bilingual notes; 53/2; 32 Arabic source transcriptions; 2 unnumbered glosses; 9 progress bars');
   }catch(e){errors.push(engine+' '+viewport.width+' '+e.message);console.error('FAIL',errors.at(-1))}
   finally{await context.close()}
  }
 }finally{await browser.close()}
}
if(errors.length)process.exit(1);
console.log('PASS Stage106 cumulative research and bilingual reader QA');
