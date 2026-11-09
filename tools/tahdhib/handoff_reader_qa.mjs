/* Tahdhīb Stage111 bilingual later-H reader and progress verification.
 * THREE locally numbered historical note sequences: Preface, Introduction, Signification.
 * 242 distinct source-linked cards, 13 independent metrics, Chromium & WebKit mobile/desktop. */
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
   const page=await ctx.newPage(),pageErrors=[];
   page.on('pageerror',e=>pageErrors.push(e.message));
   try{
    await page.goto(new URL(dir+'progress.html',base).href,{waitUntil:'networkidle',timeout:60000});
    need(await page.locator('#metrics progress').count()===13,'Expected 13 evidence-graded metric bars');
    const bars=await page.locator('#metrics progress').evaluateAll(nodes=>nodes.map(x=>[Number(x.value),Number(x.max)]));
    const expected=[[19,19],[110,110],[0,110],[52,274],[0,274],[136,140],[54,140],[66,82],[0,82],[14,20],[0,20],[46,46],[0,46]];
    need(JSON.stringify(bars)===JSON.stringify(expected),'Wrong progress counts: '+JSON.stringify(bars));
    need(await page.locator('#stages .stage').count()===10,'Missing Stage102–111 cumulative index');
    const s1=await page.locator('#note-state').textContent();
    const s2=await page.locator('#intro-state').textContent();
    const s3=await page.locator('#dalala-state').textContent();
    need(s1.includes('136/140')&&s1.includes('1, 25, 82, 90'),'Bad Preface note ledger '+s1);
    need(s2.includes('66/82')&&s2.includes('50, 58, 64, 68, 71, 73, 75, 77')&&s2.includes('0/82'),'Bad Intro note ledger '+s2);
    need(s3.includes('14/20')&&s3.includes('1, 12, 13, 14, 15, 18')&&s3.includes('0/20'),'Bad Signification ledger '+s3);
    need(await page.locator('a[href*="hawashi-all-sections-cumulative-stage111.md"]').count()>=1,'Three-section cumulative Markdown link missing');
    await page.goto(new URL(dir+'hawashi-numbered-notes.html',base).href,{waitUntil:'networkidle',timeout:60000});
    need(await page.locator('#notes .note').count()===242,'Expected 242 unique source-linked notes');
    need(await page.locator('#notes .section-title').count()===3,'Historical source headings missing');
    for(const id of ['HWN-001','HWN-INTRO-001','HWN-DALALA-001']){
     need(await page.locator('#'+id).count()===1,'Not uniquely indexed historical note1: '+id);
    }
    const urls=await Promise.all(['HWN-001','HWN-INTRO-001','HWN-DALALA-001'].map(async id=>
      await page.locator('#'+id+' .meta a').first().getAttribute('href')));
    need(urls[0].includes('/127')&&urls[1].includes('/165')&&urls[2].includes('/188'),
      'Three identically numbered historical note1 source pages collapsed: '+JSON.stringify(urls));
    need(await page.locator('#notes .grid .ar').count()===242,'Arabic source field/locator missing');
    need(await page.locator('#notes .grid .en').count()===242,'English text field missing');
    need(await page.locator('#notes .source-notice .ar').count()===9,'Nine distinct UNNUMBERED Arabic quotations not rendered');
    need(await page.locator('#notes .source-notice .en').count()===9,'Nine distinct UNNUMBERED English glosses not rendered');
    need(await page.locator('#notes a[href*="/12170/"]').count()>=242,'Original Qum source-page links missing');
    const fullArabic=await page.locator('#HWN-114 .grid .ar').textContent();
    const locator=await page.locator('#HWN-DALALA-018 .grid .ar').textContent();
    need(fullArabic.length>150&&locator.length<fullArabic.length,'Short Arabic locator and full working Arabic text conflated');
    await page.locator('#filter').selectOption('complete_searchable_note');
    need(await page.locator('#notes .note').count()===216,'Wrong aggregate complete first-pass English count');
    await page.locator('#filter').selectOption('partial_translation');
    need(await page.locator('#notes .note').count()===26,'Wrong aggregate partial English count');
    await page.locator('#filter').selectOption('all');

    await page.locator('#section-select').selectOption('H-PREFACE');
    need(await page.locator('#notes .note').count()===140,'Preface section selection wrong');
    await page.locator('#filter').selectOption('complete_searchable_note');
    need(await page.locator('#notes .note').count()===136,'Preface complete count wrong');
    await page.locator('#filter').selectOption('partial_translation');
    need(await page.locator('#notes .note').count()===4,'Preface partial count wrong');
    await page.locator('#filter').selectOption('all');

    await page.locator('#section-select').selectOption('H-INTRO');
    need(await page.locator('#notes .note').count()===82,'Introduction note count wrong');
    await page.locator('#filter').selectOption('complete_searchable_note');
    need(await page.locator('#notes .note').count()===66,'Intro first-pass complete count wrong');
    await page.locator('#filter').selectOption('partial_translation');
    need(await page.locator('#notes .note').count()===16,'Intro partial count wrong');
    await page.locator('#filter').selectOption('all');

    await page.locator('#section-select').selectOption('H-DALALA');
    need(await page.locator('#notes .note').count()===20,'Signification note count wrong');
    await page.locator('#filter').selectOption('complete_searchable_note');
    need(await page.locator('#notes .note').count()===14,'Signification complete count wrong');
    await page.locator('#filter').selectOption('partial_translation');
    need(await page.locator('#notes .note').count()===6,'Signification partial count wrong');
    await page.locator('#filter').selectOption('all');
    await page.locator('#search').fill('HWN-DALALA-020');
    need(await page.locator('#notes .note').count()===1,'Third section stable ID search failed');
    await page.locator('#search').fill('');
    need(await page.locator('#notes .note').count()===20,'Clearing search lost local Signification notes');
    await page.locator('#section-select').selectOption('all');
    need(await page.locator('#notes .note').count()===242,'Resetting three sections lost cards');
    const widths=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,view:document.documentElement.clientWidth}));
    need(widths.scroll<=widths.view+3,'Horizontal overflow '+JSON.stringify(widths));
    need(!pageErrors.length,'Browser errors '+pageErrors.join(' | '));
    console.log('PASS',engine,viewport.width,'three distinct H section numbering systems, 242 cards, 216/26 status, 13 bars, nine unnumbered quotations');
   }catch(e){errors.push(engine+' '+viewport.width+' '+e.message);console.error('FAIL',errors.at(-1))}
   finally{await ctx.close()}
  }
 }finally{await browser.close()}
}
if(errors.length)process.exit(1);
console.log('PASS Tahdhīb Stage111 full H cumulative source-grade/browser QA');
