/* Stage112 Tahdhīb H source-graded UI QA: FOUR independent historical chapter note sequences,
   15 research progress bars, 324 unique cards, 10 separately attributed unnumbered glosses.
   Chromium + WebKit desktop and small iPhone viewport. */
import {chromium,webkit} from 'playwright';
const root='texts/al-taftazani/tahdhib-al-mantiq/edition/';
const base=process.env.TAHDHIB_QA_BASE||'http://127.0.0.1:8765/';
const errors=[],assert=(v,msg)=>{if(!v)throw Error(msg)};
for(const [name,type] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await type.launch({headless:true});
 try{
  for(const viewport of [{width:1280,height:850},{width:390,height:844}]){
   const ctx=await browser.newContext({viewport,reducedMotion:'reduce'});
   const page=await ctx.newPage(),exceptions=[];
   page.on('pageerror',e=>exceptions.push(e.message));
   try{
    await page.goto(new URL(root+'progress.html',base).href,{waitUntil:'networkidle',timeout:60000});
    assert(await page.locator('#metrics progress').count()===15,'Not fifteen distinct progress metrics');
    const values=await page.locator('#metrics progress').evaluateAll(xs=>xs.map(x=>[Number(x.value),Number(x.max)]));
    const want=[[19,19],[110,110],[0,110],[52,274],[0,274],[136,140],[54,140],[66,82],[0,82],[59,91],[0,91],[5,11],[0,11],[46,46],[0,46]];
    assert(JSON.stringify(values)===JSON.stringify(want),'Incorrect Stage112 metrics '+JSON.stringify(values));
    assert(await page.locator('#stages .stage').count()===11,'Missing immutable Stages 102–112');
    const texts=await Promise.all(['#note-state','#intro-state','#dalala-state','#mafahim-state'].map(p=>page.locator(p).textContent()));
    for(const [i,part] of ['136/140','66/82','59/91','5/11'].entries())
      assert(texts[i].includes(part),'Missing section completion '+part+': '+texts[i]);
    assert(texts[3].includes('0/11')&&texts[2].includes('0/91'),'Arabic source status not visible');
    assert(await page.locator('a[href*="hawashi-all-sections-cumulative-stage112.md"]').count()>=1,'Full four-section working corpus absent from progress');
    await page.goto(new URL(root+'hawashi-numbered-notes.html',base).href,{waitUntil:'networkidle',timeout:60000});
    assert(await page.locator('#notes .note').count()===324,'Not 324 unique history-numbered H note cards');
    assert(await page.locator('#notes .section-title').count()===4,'Four historical source section headings required');
    const heads=[['HWN-001','127'],['HWN-INTRO-001','165'],['HWN-DALALA-001','188'],['HWN-MAFAHIM-001','216']];
    for(const [id,pageno] of heads){
      assert(await page.locator('#'+id).count()===1,'Lost local note1 ID '+id);
      const url=await page.locator('#'+id+' .meta a').first().getAttribute('href');
      assert(url.includes('/'+pageno),'Wrong original Qum printed source for '+id);
    }
    assert(await page.locator('#notes .grid .ar').count()===324,'Missing Arabic working text/locator');
    assert(await page.locator('#notes .grid .en').count()===324,'Missing English first-pass/partial fields');
    assert(await page.locator('#notes .source-notice .ar').count()===10,'Ten extra Arabic unnumbered quotations not separated');
    assert(await page.locator('#notes .source-notice .en').count()===10,'Ten extra English unnumbered quotations not separated');
    const fullAr=await page.locator('#HWN-114 .grid .ar').textContent();
    const locator=await page.locator('#HWN-MAFAHIM-004 .grid .ar').textContent();
    assert(fullAr.length>150&&locator.length<fullAr.length,'Full digitized Arabic and short locator note grades conflated');
    await page.locator('#filter').selectOption('complete_searchable_note');
    assert(await page.locator('#notes .note').count()===266,'Complete English first-pass must be 266');
    await page.locator('#filter').selectOption('partial_translation');
    assert(await page.locator('#notes .note').count()===58,'Partial English must be 58');
    await page.locator('#filter').selectOption('all');
    const sections=[['H-PREFACE',140,136,4],['H-INTRO',82,66,16],['H-DALALA',91,59,32],['H-MAFAHIM',11,5,6]];
    for(const [id,total,full,part] of sections){
      await page.locator('#section-select').selectOption(id);
      assert(await page.locator('#notes .note').count()===total,'Wrong source count '+id);
      assert(await page.locator('#notes .section-title').count()===1,'Unwanted extra source headings '+id);
      await page.locator('#filter').selectOption('complete_searchable_note');
      assert(await page.locator('#notes .note').count()===full,'Wrong complete source notes '+id);
      await page.locator('#filter').selectOption('partial_translation');
      assert(await page.locator('#notes .note').count()===part,'Wrong partial source notes '+id);
      await page.locator('#filter').selectOption('all');
    }
    await page.locator('#search').fill('HWN-MAFAHIM-011');
    assert(await page.locator('#notes .note').count()===1,'New concepts ID search failed');
    await page.locator('#search').fill('');
    assert(await page.locator('#notes .note').count()===11,'Search clear lost Concepts source notes');
    await page.locator('#section-select').selectOption('all');
    assert(await page.locator('#notes .note').count()===324,'Four-section reset did not restore full reader');
    const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,visible:document.documentElement.clientWidth}));
    assert(width.scroll<=width.visible+3,'Reader overflows screen '+JSON.stringify(width));
    assert(exceptions.length===0,'Browser exceptions '+exceptions.join(' | '));
    console.log('PASS',name,viewport.width,'4 locally numbered H sections, 324 records, 266 complete /58 partial English, 15 metrics');
   }catch(e){errors.push(name+' '+viewport.width+' '+e.message);console.error('FAIL',errors.at(-1))}
   finally{await ctx.close()}
  }
 }finally{await browser.close()}
}
if(errors.length)process.exit(1);
console.log('PASS Stage112 four-section H reader and cumulative research dashboard');
