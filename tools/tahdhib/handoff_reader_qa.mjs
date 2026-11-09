/* Tahdhīb Stage110 browser regression: TWO historically restarted numbered H sections.
 * 189 distinct notes, 11 progress bars, separate source/translation certification.
 * Chromium + WebKit, desktop + phone widths. */
import {chromium,webkit} from 'playwright';
const base=process.env.TAHDHIB_QA_BASE||'http://127.0.0.1:8765/';
const dir='texts/al-taftazani/tahdhib-al-mantiq/edition/';
const errors=[];
const need=(x,msg)=>{if(!x)throw Error(msg)};
for(const [engine,type] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await type.launch({headless:true});
 try{
  for(const viewport of [{width:1280,height:850},{width:390,height:844}]){
   const ctx=await browser.newContext({viewport,reducedMotion:'reduce'});
   const page=await ctx.newPage(),exceptions=[];
   page.on('pageerror',e=>exceptions.push(e.message));
   try{
    await page.goto(new URL(dir+'progress.html',base).href,{waitUntil:'networkidle',timeout:60000});
    need(await page.locator('#metrics progress').count()===11,'Expected eleven independent research progress bars');
    const bars=await page.locator('#metrics progress').evaluateAll(xs=>xs.map(p=>[Number(p.value),Number(p.max)]));
    const expected=[[19,19],[110,110],[0,110],[52,274],[0,274],[136,140],[54,140],[41,49],[0,49],[46,46],[0,46]];
    need(JSON.stringify(bars)===JSON.stringify(expected),'Inaccurate research progress '+JSON.stringify(bars));
    need(await page.locator('#stages .stage').count()===9,'Missing historical stage 102–110');
    const preface=await page.locator('#note-state').textContent();
    const intro=await page.locator('#intro-state').textContent();
    need(preface.includes('136/140')&&preface.includes('1, 25, 82, 90'),'Incorrect H-PREFACE summary '+preface);
    need(intro.includes('H-INTRO')&&intro.includes('41/49')&&intro.includes('2, 7, 10, 19, 20, 23, 30, 42')&&intro.includes('0/49'),'Incorrect H-INTRO summary '+intro);
    need(await page.locator('a[href*="hawashi-all-sections-cumulative-stage110.md"]').count()>=1,'Both-section complete Markdown missing');
    need(exceptions.length===0,'Progress page JS errors '+exceptions.join(' | '));
    await page.goto(new URL(dir+'hawashi-numbered-notes.html',base).href,{waitUntil:'networkidle',timeout:60000});
    need(await page.locator('#notes .note').count()===189,'Not exactly 189 unique numbered cards across two H sections');
    need(await page.locator('#notes .section-title').count()===2,'Missing distinct preface and introduction headings');
    need(await page.locator('#HWN-001').count()===1&&await page.locator('#HWN-INTRO-001').count()===1,'Numbering restart corrupted one of the two historically distinct note1 items');
    const prefaceSource=await page.locator('#HWN-001 .meta a').first().getAttribute('href');
    const introSource=await page.locator('#HWN-INTRO-001 .meta a').first().getAttribute('href');
    need(prefaceSource.includes('/127')&&introSource.includes('/165'),'Section note1 source URLs conflated');
    need(await page.locator('#notes .grid .ar').count()===189,'Missing Arabic source or locator fields');
    need(await page.locator('#notes .grid .en').count()===189,'Missing English renderings');
    need(await page.locator('#notes .source-notice .ar').count()===8,'Expected eight distinctly attributed UNNUMBERED Arabic quotations');
    need(await page.locator('#notes .source-notice .en').count()===8,'Expected eight separately attributed unnumbered English excerpts');
    const original=await page.locator('#HWN-114 .grid .ar').textContent();
    const newIntro=await page.locator('#HWN-INTRO-014 .grid .ar').textContent();
    need(original.length>150&&newIntro.length<original.length,'Full digitally searchable Arabic vs new short Arabic locator distinction lost');
    await page.locator('#filter').selectOption('complete_searchable_note');
    need(await page.locator('#notes .note').count()===177,'Combined complete first-pass English count wrong');
    await page.locator('#filter').selectOption('partial_translation');
    need(await page.locator('#notes .note').count()===12,'Combined incomplete English note count wrong');
    await page.locator('#filter').selectOption('all');
    await page.locator('#section-select').selectOption('H-PREFACE');
    need(await page.locator('#notes .note').count()===140,'Preface section filter wrong');
    need(await page.locator('#notes .section-title').count()===1,'Preface filter should show one heading');
    await page.locator('#filter').selectOption('partial_translation');
    need(await page.locator('#notes .note').count()===4,'Preface incomplete note filter wrong');
    await page.locator('#filter').selectOption('all');
    await page.locator('#section-select').selectOption('H-INTRO');
    need(await page.locator('#notes .note').count()===49,'Introduction locally numbered section filter wrong');
    await page.locator('#filter').selectOption('complete_searchable_note');
    need(await page.locator('#notes .note').count()===41,'Intro complete note count wrong');
    await page.locator('#filter').selectOption('partial_translation');
    need(await page.locator('#notes .note').count()===8,'Intro partial note count wrong');
    await page.locator('#filter').selectOption('all');
    await page.locator('#search').fill('HWN-INTRO-049');
    need(await page.locator('#notes .note').count()===1,'Search by new local note49 ID failed');
    await page.locator('#search').fill('');
    need(await page.locator('#notes .note').count()===49,'Clearing search failed to restore introduction');
    await page.locator('#section-select').selectOption('all');
    need(await page.locator('#notes .note').count()===189,'Restoring both sections failed');
    const widths=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,view:document.documentElement.clientWidth}));
    need(widths.scroll<=widths.view+3,'Horizontal overflow '+JSON.stringify(widths));
    need(exceptions.length===0,'Browser JS exceptions '+exceptions.join(' | '));
    console.log('PASS',engine,viewport.width,'two H numbering series, 140+49 notes, 136/4 and 41/8 English; 11 honest metrics; 8 unnumbered');
   }catch(e){errors.push(engine+' '+viewport.width+' '+e.message);console.error('FAIL',errors.at(-1))}
   finally{await ctx.close()}
  }
 }finally{await browser.close()}
}
if(errors.length)process.exit(1);
console.log('PASS Stage110 source-graded, dual-section Tahdhīb reader and progress dashboard');
