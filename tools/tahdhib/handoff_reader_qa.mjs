/* Tahdhīb Stage107 browser verification: 110 numbered H glosses and nine independent progress bars.
 * Chromium/WebKit desktop/iPhone, no manuscript-or-page completion inflation. */
import {chromium,webkit} from 'playwright';
const base=process.env.TAHDHIB_QA_BASE||'http://127.0.0.1:8765/';
const prefix='texts/al-taftazani/tahdhib-al-mantiq/edition/';
const errors=[],require=(x,msg)=>{if(!x)throw Error(msg)};
for(const [engine,browserType] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await browserType.launch({headless:true});
 try{
  for(const viewport of [{width:1280,height:850},{width:390,height:844}]){
   const ctx=await browser.newContext({viewport,reducedMotion:'reduce'});
   const page=await ctx.newPage(),exceptions=[];
   page.on('pageerror',e=>exceptions.push(e.message));
   try{
    await page.goto(new URL(prefix+'progress.html',base).href,{waitUntil:'networkidle',timeout:60000});
    require(await page.locator('#metrics progress').count()===9,'Expected exactly 9 differently scoped progress bars');
    const vals=await page.locator('#metrics progress').evaluateAll(nodes=>nodes.map(p=>[Number(p.value),Number(p.max)]));
    const want=[[19,19],[110,110],[0,110],[52,274],[0,274],[106,110],[52,110],[46,46],[0,46]];
    require(JSON.stringify(vals)===JSON.stringify(want),'Wrong research bar counts '+JSON.stringify(vals));
    require(await page.locator('#stages .stage').count()===6,'Missing Stage102–107 history');
    const state=await page.locator('#note-state').textContent();
    require(state.includes('Partial notes: 1, 25, 82, 90.'),'Incomplete notes hidden from dashboard: '+state);
    require(await page.locator('a[href*="hwn001-110.md"]').count()>=1,'Cumulative 110-note Markdown link missing');
    require(exceptions.length===0,'Dashboard errors '+exceptions.join('|'));
    await page.goto(new URL(prefix+'hawashi-numbered-notes.html',base).href,{waitUntil:'networkidle',timeout:60000});
    require(await page.locator('#notes .note').count()===110,'Expected 110 unique numbered notes');
    require(await page.locator('#notes .grid .ar').count()===110,'Missing Arabic fields or locators');
    require(await page.locator('#notes .grid .en').count()===110,'Missing English note renderings');
    require(await page.locator('#notes a[href*="/12170/"]').count()>=110,'Original page source links omitted');
    require(await page.locator('#notes .source-notice .ar').count()===5,'Unnumbered Arabic separately attributed passages not displayed');
    require(await page.locator('#notes .source-notice .en').count()===5,'Unnumbered English passages not displayed');
    const ar75=await page.locator('#HWN-075 .grid .ar').textContent();
    const ar110=await page.locator('#HWN-110 .grid .ar').textContent();
    require(ar75.length>100 && ar110.length<ar75.length,'Full searchable Arabic and locator-only Arabic confused');
    await page.locator('#filter').selectOption('complete_searchable_note');
    require(await page.locator('#notes .note').count()===106,'Wrong completed numbered-note count');
    await page.locator('#filter').selectOption('partial_translation');
    require(await page.locator('#notes .note').count()===4,'Four unresolved notes must remain visible');
    await page.locator('#filter').selectOption('all');
    await page.locator('#search').fill('HWN-110');
    require(await page.locator('#notes .note').count()===1,'Search note110 failed');
    await page.locator('#search').fill('');
    require(await page.locator('#notes .note').count()===110,'Search reset lost previous notes');
    const widths=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,view:document.documentElement.clientWidth}));
    require(widths.scroll<=widths.view+3,'Horizontal overflow: '+JSON.stringify(widths));
    require(exceptions.length===0,'Browser exceptions: '+exceptions.join(' | '));
    console.log('PASS',engine,viewport.width,'110 unique H notes, 106 complete English, 4 partial; 52 full searchable Arabic; 5 unnumbered; 9 bars');
   }catch(e){errors.push(engine+' '+viewport.width+': '+e.message);console.error('FAIL',errors.at(-1))}
   finally{await ctx.close()}
  }
 }finally{await browser.close()}
}
if(errors.length)process.exit(1);
console.log('PASS Stage107 cumulative bilingual reader and progress QA');
