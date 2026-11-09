/* Tahdhīb Stage108 cumulative browser QA: 126 notes, nine independent metric bars.
 * Desktop and 390px phone in Chromium and WebKit; source-status labels required. */
import {chromium,webkit} from 'playwright';
const base=process.env.TAHDHIB_QA_BASE||'http://127.0.0.1:8765/';
const dir='texts/al-taftazani/tahdhib-al-mantiq/edition/';
const errs=[],need=(x,msg)=>{if(!x)throw Error(msg)};
for(const [engine,type] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await type.launch({headless:true});
 try{
  for(const viewport of [{width:1280,height:850},{width:390,height:844}]){
   const context=await browser.newContext({viewport,reducedMotion:'reduce'});
   const page=await context.newPage(),pageErrors=[];
   page.on('pageerror',e=>pageErrors.push(e.message));
   try{
    await page.goto(new URL(dir+'progress.html',base).href,{waitUntil:'networkidle',timeout:60000});
    need(await page.locator('#metrics progress').count()===9,'Not nine source-graded metric bars');
    const bars=await page.locator('#metrics progress').evaluateAll(xs=>xs.map(x=>[Number(x.value),Number(x.max)]));
    const expected=[[19,19],[110,110],[0,110],[52,274],[0,274],[122,126],[54,126],[46,46],[0,46]];
    need(JSON.stringify(bars)===JSON.stringify(expected),'Wrong bar denominators '+JSON.stringify(bars));
    need(await page.locator('#stages .stage').count()===7,'Stage 102–108 history incomplete');
    const states=await page.locator('#note-state').textContent();
    need(states.includes('Partial notes: 1, 25, 82, 90.'),'Four unresolved notes hidden: '+states);
    need(await page.locator('a[href*="hwn001-126.md"]').count()>=1,'Cumulative 126-note Markdown not linked');
    await page.goto(new URL(dir+'hawashi-numbered-notes.html',base).href,{waitUntil:'networkidle',timeout:60000});
    need(await page.locator('#notes .note').count()===126,'Not 126 unique numbered notes');
    need(await page.locator('#notes .grid .ar').count()===126,'Arabic full/locator field missing');
    need(await page.locator('#notes .grid .en').count()===126,'English note field missing');
    need(await page.locator('#notes a[href*="/12170/"]').count()>=126,'Original source links incomplete');
    need(await page.locator('#notes .source-notice .ar').count()===6,'Six separately attributed Arabic unnumbered glosses missing');
    need(await page.locator('#notes .source-notice .en').count()===6,'Six separate unnumbered English glosses missing');
    const a114=await page.locator('#HWN-114 .grid .ar').textContent();
    const a126=await page.locator('#HWN-126 .grid .ar').textContent();
    need(a114.length>150 && a126.length<a114.length,'Source-complete Arabic and locator-only Arabic not distinguished');
    await page.locator('#filter').selectOption('complete_searchable_note');
    need(await page.locator('#notes .note').count()===122,'Wrong full-first-pass English note count');
    await page.locator('#filter').selectOption('partial_translation');
    need(await page.locator('#notes .note').count()===4,'Four incomplete notes must remain filterable');
    await page.locator('#filter').selectOption('all');
    await page.locator('#search').fill('HWN-126');
    need(await page.locator('#notes .note').count()===1,'Note126 source-index search failed');
    await page.locator('#search').fill('');
    need(await page.locator('#notes .note').count()===126,'Clearing search lost notes');
    const widths=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,view:document.documentElement.clientWidth}));
    need(widths.scroll<=widths.view+3,'Mobile or desktop horizontal overflow '+JSON.stringify(widths));
    need(!pageErrors.length,'JavaScript exceptions '+pageErrors.join(' | '));
    console.log('PASS',engine,viewport.width,'126 H notes; 122/4 English; 54 full searchable Arabic; 6 unnumbered glosses; 9 progress bars');
   }catch(e){errs.push(engine+' '+viewport.width+' '+e.message);console.error('FAIL',errs.at(-1))}
   finally{await context.close()}
  }
 }finally{await browser.close()}
}
if(errs.length)process.exit(1);
console.log('PASS Stage108 cumulative bilingual note reader and progress dashboard');
