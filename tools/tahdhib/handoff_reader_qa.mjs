/* Tahdhīb Stage111 UI QA: three *historically independent* local H note series,
 * 13 honest evidence-graded research goals; Chromium/WebKit desktop and phone. */
import {chromium,webkit} from 'playwright';
const base=process.env.TAHDHIB_QA_BASE||'http://127.0.0.1:8765/';
const root='texts/al-taftazani/tahdhib-al-mantiq/edition/';
const errs=[],check=(v,msg)=>{if(!v)throw new Error(msg)};
for(const [engine,browserType] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await browserType.launch({headless:true});
 try{
  for(const viewport of [{width:1280,height:850},{width:390,height:844}]){
   const context=await browser.newContext({viewport,reducedMotion:'reduce'});
   const page=await context.newPage(),exceptions=[];
   page.on('pageerror',e=>exceptions.push(e.message));
   try{
    await page.goto(new URL(root+'progress.html',base).href,{waitUntil:'networkidle',timeout:60000});
    check(await page.locator('#metrics progress').count()===13,'Expected 13 source-graded research progress bars');
    const metrics=await page.locator('#metrics progress').evaluateAll(nodes=>nodes.map(n=>[Number(n.value),Number(n.max)]));
    const target=[[19,19],[110,110],[0,110],[52,274],[0,274],[136,140],[54,140],[66,82],[0,82],[14,20],[0,20],[46,46],[0,46]];
    check(JSON.stringify(metrics)===JSON.stringify(target),'Wrong research metrics '+JSON.stringify(metrics));
    check(await page.locator('#stages .stage').count()===10,'Expected Stages 102–111');
    const p=await page.locator('#note-state').textContent(),i=await page.locator('#intro-state').textContent(),d=await page.locator('#dalala-state').textContent();
    check(p.includes('136/140')&&p.includes('1, 25, 82, 90'),'Preface source grade missing: '+p);
    check(i.includes('66/82')&&i.includes('0/82'),'Introduction source grade missing: '+i);
    check(d.includes('14/20')&&d.includes('0/20')&&d.includes('1, 12, 13, 14, 15, 18'),'Signification source grade missing: '+d);
    check(await page.locator('a[href*="hawashi-all-sections-cumulative-stage111.md"]').count()>=1,'New combined 3-section Markdown not linked');
    await page.goto(new URL(root+'hawashi-numbered-notes.html',base).href,{waitUntil:'networkidle',timeout:60000});
    check(await page.locator('#notes .note').count()===242,'Expected 242 unique historical note IDs');
    check(await page.locator('#notes .section-title').count()===3,'Expected three separate source chapter headings');
    for(const [id,pageNumber] of [['HWN-001',127],['HWN-INTRO-001',165],['HWN-DALALA-001',188]]){
      check(await page.locator('#'+id).count()===1,'Missing separate historical note1 '+id);
      const url=await page.locator('#'+id+' .meta a').first().getAttribute('href');
      check(url.includes('/'+pageNumber),'Wrong historically numbered source page for '+id+': '+url);
    }
    check(await page.locator('#notes .grid .ar').count()===242,'Missing Arabic source/locator fields');
    check(await page.locator('#notes .grid .en').count()===242,'Missing English translated/partial note fields');
    check(await page.locator('#notes .source-notice .ar').count()===9,'Expected nine separate unnumbered Arabic quotations');
    check(await page.locator('#notes .source-notice .en').count()===9,'Expected nine separate unnumbered English quotations');
    const fullAr=await page.locator('#HWN-114 .grid .ar').textContent();
    const locator=await page.locator('#HWN-DALALA-019 .grid .ar').textContent();
    check(fullAr.length>150&&locator.length<fullAr.length,'Arabic full vs locator source status lost');
    await page.locator('#filter').selectOption('complete_searchable_note');
    check(await page.locator('#notes .note').count()===216,'Complete first-pass English total must be 216');
    await page.locator('#filter').selectOption('partial_translation');
    check(await page.locator('#notes .note').count()===26,'Incomplete historical notes total must be 26');
    await page.locator('#filter').selectOption('all');
    for(const [id,count,full,part] of [['H-PREFACE',140,136,4],['H-INTRO',82,66,16],['H-DALALA',20,14,6]]){
      await page.locator('#section-select').selectOption(id);
      check(await page.locator('#notes .note').count()===count,'Wrong section count for '+id);
      check(await page.locator('#notes .section-title').count()===1,'Multiple source headings when filtering '+id);
      await page.locator('#filter').selectOption('complete_searchable_note');
      check(await page.locator('#notes .note').count()===full,'Wrong complete English for '+id);
      await page.locator('#filter').selectOption('partial_translation');
      check(await page.locator('#notes .note').count()===part,'Wrong incomplete English for '+id);
      await page.locator('#filter').selectOption('all');
    }
    await page.locator('#search').fill('HWN-DALALA-020');
    check(await page.locator('#notes .note').count()===1,'ID search for historical signification note 20 failed');
    await page.locator('#search').fill('');
    check(await page.locator('#notes .note').count()===20,'Search clear should restore signification chapter');
    await page.locator('#section-select').selectOption('all');
    check(await page.locator('#notes .note').count()===242,'Reset to all sections failed');
    const widths=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
    check(widths.scroll<=widths.client+3,'Horizontal overflow '+JSON.stringify(widths));
    check(exceptions.length===0,'Browser errors '+exceptions.join(' | '));
    console.log('PASS',engine,viewport.width,'3 historical H numbering series,242 notes,216/26 English,54 digital Arabic,9 unnumbered,13 research metrics');
   }catch(e){errs.push(engine+' '+viewport.width+' '+e.message);console.error('FAIL',errs.at(-1))}
   finally{await context.close()}
  }
 }finally{await browser.close()}
}
if(errs.length)process.exit(1);
console.log('PASS Stage111 three-section Tahdhīb research reader and cumulative progress');
