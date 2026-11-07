/* Standalone source-aware later-hawashi companion: no fabricated fully translated pages
 * and no changes to the main Tahdhīb reader's two text-layer choices. */
import {chromium,webkit} from 'playwright';
const base=process.env.TAHDHIB_QA_BASE||'http://127.0.0.1:8765/';
const root='texts/al-taftazani/tahdhib-al-mantiq/edition/';
const failures=[];
function assert(v,msg){if(!v)throw Error(msg)}
async function check(kind,driver,width){
 const browser=await driver.launch({headless:true});
 const ctx=await browser.newContext({viewport:{width,height:width<700?844:900},reducedMotion:'reduce'});
 const page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(new URL(root+'hawashi-companion.html',base).href,{waitUntil:'networkidle'});
  const count=await page.locator('#reader-pages .hw-page').count();
  assert(count===52,'Exactly 52 separately attributable sampled page cards needed, received '+count);
  const api=await page.evaluate(()=>window.GnammaHawashiCompanion);
  assert(api?.sourcePages===52&&api?.firstPage===127&&api?.lastPage===178,'Source range/pagination incorrectly assembled');
  assert(api?.fullPageTranslations===0&&api?.excerptOnly===true&&api?.unverifiedManuscripts===true,'Misleading completeness/certification claim');
  assert(await page.locator('#toc-pages .hw-toc-link').count()===52,'Contents links incomplete');
  const ids=await page.locator('#reader-pages .hw-page').evaluateAll(els=>els.map(e=>e.id));
  assert(ids.length===52&&new Set(ids).size===52&&ids[0]==='page-127'&&ids.at(-1)==='page-178','Not contiguous or unique printed-page IDs');
  for(const id of ['page-141','page-163']){
   assert(ids.includes(id),'Previously inaccessible source page not recovered: '+id);
  }
  assert(await page.locator('#reader-pages .hw-source').count()===52,'Source-page outgoing links absent');
  assert(await page.locator('#reader-pages .hw-arabic[dir="rtl"]').count()===52,'Arabic originals missing');
  assert(await page.locator('#reader-pages .hw-english').count()===52,'Individual passage English translations missing');
  assert(await page.locator('#reader-pages .hw-analysis').count()===52,'Independent editorial analysis missing');
  const sourceLinks=await page.locator('#reader-pages .hw-source').evaluateAll(els=>els.map(e=>e.href));
  assert(sourceLinks.every((url,i)=>url.includes('/book_content/b/12170/'+(127+i)+'?lang=ar')),'Printed-source per-page URLs incorrect');
  assert((await page.locator('#reader-status').textContent()).includes('0 complete-page certifications'),'Incompleteness disclosure absent');
  await page.locator('#range-select').selectOption('2');
  assert(await page.locator('#reader-pages .hw-page').count()===13,'Range 156–168 must include recovered page 163');
  await page.locator('#reader-search').fill('163');
  assert(await page.locator('#reader-pages .hw-page').count()===1,'Page search did not narrow to p163');
  assert(await page.locator('#reader-pages #page-163').count()===1,'Page 163 source card not retrievable');
  await page.locator('#clear-search').click();
  assert(await page.locator('#reader-pages .hw-page').count()===52,'Clear search failed');
  await page.locator('#toggle-menu').click();
  assert(await page.locator('#reader-menu:not([hidden]) #toc-pages a').count()===52,'Compact navigation missing');
  await page.locator('#close-menu').click();
  assert(await page.locator('#reader-menu[hidden]').count()===1,'Menu did not close');
  await page.locator('#toggle-english').click();
  assert(await page.locator('body[data-languages="en"]').count()===1,'English-only view unavailable');
  const hidden=await page.locator('.hw-arabic').first().evaluate(el=>getComputedStyle(el).display);
  assert(hidden==='none','English-only view still shows Arabic');
  await page.locator('#toggle-english').click();
  assert(await page.locator('body[data-languages="both"]').count()===1,'Bilingual display was not restored');
  const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth}));
  assert(size.scroll<=size.width+3,'Companion has horizontal overflow '+JSON.stringify(size));
  assert(errors.length===0,'Companion Javascript errors: '+errors.join(' | '));
  console.log('PASS hawashi companion',kind,width,'52 sampled pages, honest attribution and compact mobile layout');
 }finally{await ctx.close();await browser.close()}
}
for(const [kind,driver] of [['chromium',chromium],['webkit',webkit]]){
 for(const width of [390,1440]){
  try{await check(kind,driver,width)}catch(e){failures.push(kind+' '+width+' '+e.message);console.error('FAIL',kind,width,e.message)}
 }
}
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('PASS all four later-hawashi companion checks');
