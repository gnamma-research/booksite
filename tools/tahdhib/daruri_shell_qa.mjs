/* Live-browser regression for the NEW common public Tahdhīb reader shell.
 * Existing source-critical Study/Flow and logic tests remain independent. */
import {chromium, webkit} from 'playwright';

const origin=process.env.TAHDHIB_QA_BASE||'http://127.0.0.1:8765/';
const routes={kalam:'texts/al-taftazani/tahdhib-al-kalam/edition/',logic:'texts/al-taftazani/tahdhib-al-mantiq/edition/'};
const assert=(c,msg)=>{if(!c)throw Error(msg)};
const failures=[];
async function check(browser,name,kind,viewport){
 const context=await browser.newContext({viewport,reducedMotion:'reduce',isMobile:viewport.width<600,hasTouch:viewport.width<600});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url=new URL(routes[kind],origin).href;
 try{
  await page.goto(url,{waitUntil:'networkidle',timeout:60000});
  const n=kind==='kalam'?1044:19;
  const nav=page.locator('#gn-daruri-toolbar');
  assert(await nav.isVisible(),'Darūrī-style top controls missing');
  for(const label of ['Contents','Read','Study','Immersive','Search','Saved','Notes','Dictionary','Subject index','Visuals','Editions','Help'])
    assert(await nav.locator('button[aria-label="'+label+'"]').count()===1,'Missing top action: '+label);
  assert(!(await page.locator('.main > .toolbar').isVisible()),'Duplicate legacy toolbar still visible in public view');
  assert(await page.locator('body[data-reading-style="flow"]').count()===1,'Must open in continuous Read mode');
  const semantic=page.locator('#flow-passages .gn-flow-unit,#flow-passages .gn-source-heading [data-clause-id]');
  assert(await semantic.count()===n*2,'Source units missing or duplicated in flow');
  assert(await page.locator('#passages[hidden]').count()===1,'Study cards should be hidden in Read');
  assert(await page.locator('#flow-passages .clause').count()===0,'Read has boxed clauses');
  const last=page.locator('#flow-passages .gn-flow-section').last();
  await last.scrollIntoViewIfNeeded();
  const bottom=await last.boundingBox();assert(bottom!==null,'Cannot reach final continuous section');
  const scrolled=await page.evaluate(()=>window.scrollY);
  assert(scrolled>250,'Continuous text did not scroll vertically to final section');
  await nav.locator('button[aria-label="Immersive"]').click();
  assert(await page.locator('body[data-reading-style="immersive"]').count()===1,'Immersive mode not activated');
  assert(await semantic.count()===n*2,'Immersive lost clauses');
  assert(await page.locator('#flow-passages:not([hidden])').count()===1,'Immersive flow hidden or paginated');
  await nav.locator('button[aria-label="Read"]').click();
  assert(await page.locator('body[data-reading-style="flow"]').count()===1,'Read did not restore');
  await nav.locator('button[data-gn-lang="ar"]').click();
  assert(await page.locator('#flow-passages[data-view="ar"]').count()===1,'Arabic only failed');
  await nav.locator('button[data-gn-lang="en"]').click();
  assert(await page.locator('#flow-passages[data-view="en"]').count()===1,'English only failed');
  await nav.locator('button[data-gn-lang="both"]').click();
  assert(await page.locator('#flow-passages[data-view="both"]').count()===1,'Parallel language failed');
  await nav.locator('button[aria-label="Visuals"]').click();
  const visual=page.locator('#gn-daruri-overlay:not([hidden])');
  assert(await visual.isVisible(),'Visuals did not open');
  await visual.locator('select[aria-label="Page layout"]').selectOption('ar-left');
  assert(await page.locator('body[data-gn-order="ar-left"]').count()===1,'Arabic-left layout failed');
  await visual.locator('select[aria-label="Page style"]').selectOption('book');
  assert(await page.locator('body[data-gn-page-style="book"]').count()===1,'Book page style failed');
  await visual.locator('select[aria-label="Appearance"]').selectOption('dark');
  assert(await page.locator('html[data-theme="dark"]').count()===1,'Dark appearance failed');
  await visual.locator('select[aria-label="Arabic font"]').selectOption('scheherazade');
  assert(await page.locator('html[data-arabic-font="scheherazade"]').count()===1,'Arabic font choice failed');
  await visual.locator('button[aria-label="Close"]').click();
  assert(await page.locator('#gn-daruri-overlay[hidden]').count()===1,'Visuals dismissal failed');
  // Read content must remain scrollable and annotatable after settings changes.
  const sample=kind==='kalam'?'KAL-015.04':'L.02';
  const flowId='flow-u-'+sample.replaceAll('.','-');
  await page.locator('#'+flowId).click();
  assert(await page.locator('#gn-inline-toolbar:not([hidden])').count()===1,'Inline reading action missing');
  const bookmark=page.locator('#gn-inline-toolbar button[aria-label="Bookmark '+sample+'"]');
  assert(await bookmark.count()===1,'Bookmark action missing for '+sample);
  await bookmark.click();
  assert((await page.evaluate(id=>window.GnammaTahdhibReader.getBookmarked().includes(id),sample)),'Bookmark was not stored');
  await nav.locator('button[aria-label="Saved"]').click();
  assert(await page.locator('#gn-daruri-overlay:not([hidden]) .gn-daruri-saved-item').count()>0,'Reading Desk did not list saved passage');
  await page.locator('#gn-daruri-overlay button[aria-label="Close"]').click();
  await nav.locator('button[aria-label="Dictionary"]').click();
  assert(await page.locator('#gn-terms-overlay:not([hidden]) .gn-terms-entry').count()>0,'Dictionary failed');
  await page.locator('.gn-terms-close').click();
  await nav.locator('button[aria-label="Subject index"]').click();
  assert(await page.locator('#gn-subject-overlay:not([hidden]) .gn-subject-entry').count()>0,'Subject index failed');
  await page.locator('.gn-subject-close').click();
  await nav.locator('button[aria-label="Help"]').click();
  assert((await page.locator('#gn-daruri-overlay').textContent()).includes('uninterrupted'),'Help explains continuous reading incorrectly');
  await page.locator('#gn-daruri-overlay button[aria-label="Close"]').click();
  await nav.locator('button[aria-label="Study"]').click();
  assert(await page.locator('body[data-reading-style="study"]').count()===1,'Study mode did not activate');
  assert(await page.locator('#passages:not([hidden]) article.clause').count()>0,'Study source apparatus missing');
  await nav.locator('button[aria-label="Read"]').click();
  assert(await semantic.count()===n*2,'Read after Study no longer contains the entire text');
  // Refresh must preserve the same book-specific settings and saved marks.
  await page.reload({waitUntil:'networkidle'});
  assert(await page.locator('body[data-reading-style="flow"]').count()===1,'Mode persistence lost');
  assert(await page.locator('body[data-gn-order="ar-left"]').count()===1,'Layout persistence lost');
  assert((await page.evaluate(id=>window.GnammaTahdhibReader.getBookmarked().includes(id),sample)),'Saved bookmark did not persist');
  const overflow=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  assert(overflow.scroll<=overflow.width+3,'Horizontal body overflow '+JSON.stringify(overflow));
  assert(errors.length===0,'Browser exceptions: '+errors.join(' | '));
  console.log('PASS',name,kind,viewport.width+'x'+viewport.height, 'public shell, 100% source coverage, settings and saved controls');
 } finally{await context.close()}
}
for(const [name,driver] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await driver.launch({headless:true});
 try{
  for(const kind of ['kalam','logic']){
   for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
    try{await check(browser,name,kind,viewport)}
    catch(e){const t=name+' '+kind+' '+viewport.width+'x'+viewport.height+': '+e.message;failures.push(t);console.error('FAIL',t)}
   }
  }
 }finally{await browser.close()}
}
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('PASS all new Darūrī-style Tahdhīb shell regressions');
