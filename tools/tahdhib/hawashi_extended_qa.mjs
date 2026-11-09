/* Extended companion source-page QA: do not confuse later hawashi with original Yazdī.
 * Checks 54 printed positions, 52 explicitly partial translations,
 * two structural pages, and mobile overflow in Chromium + WebKit. */
import {chromium,webkit} from 'playwright';
const base=process.env.TAHDHIB_QA_BASE||'http://127.0.0.1:8765/';
const route='texts/al-taftazani/tahdhib-al-mantiq/edition/hawashi-q125-178.html';
const errors=[];
function require(x,msg){if(!x)throw Error(msg)}
for(const [engine,browserType] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await browserType.launch({headless:true});
 try{
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
   const ctx=await browser.newContext({viewport,reducedMotion:'reduce'});
   const page=await ctx.newPage(),exceptions=[];
   page.on('pageerror',e=>exceptions.push(e.message));
   try{
    await page.goto(new URL(route,base).href,{waitUntil:'networkidle',timeout:60000});
    require(await page.locator('#pages section.page').count()===54,'Not 54 distinct source positions');
    require(await page.locator('#pages section.page[data-page="125"]').count()===1,'Section heading missing');
    require(await page.locator('#pages section.page[data-page="126"]').count()===1,'Blank page omitted');
    require(await page.locator('#pages section.page .arabic').count()===52,'Wrong number of source excerpt translations');
    require(await page.locator('#pages section.page .english').count()===52,'Wrong number of English selections');
    require(await page.locator('#chooser option').count()===30,'Source page navigation missing');
    const hrefs=await page.locator('#pages section.page .meta a').evaluateAll(a=>a.map(x=>x.href));
    require(hrefs.length===54&&hrefs.every((url,i)=>url.includes('/12170/'+(i+125))),'Source page links not accurate');
    require((await page.locator('main').textContent()).includes('NOT a complete translation of the later glosses'),'Partial translation disclaimer missing');
    const widths=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,view:document.documentElement.clientWidth}));
    require(widths.scroll<=widths.view+3,'Mobile horizontal overflow: '+JSON.stringify(widths));
    await page.locator('#chooser').selectOption('178');
    require(await page.locator('#chooser').inputValue()==='178','Last source page not selectable');
    await page.locator('#previous').click();
    require(await page.locator('#chooser').inputValue()==='177','Previous page navigation failed');
    await page.locator('#next').click();
    require(await page.locator('#chooser').inputValue()==='178','Next page navigation failed');
    require(exceptions.length===0,'JavaScript errors: '+exceptions.join(' | '));
    console.log('PASS',engine,viewport.width,'54 source positions; 52 partial translations; two structural pages');
   }catch(e){errors.push(engine+' '+viewport.width+' '+e.message);console.error('FAIL',errors.at(-1))}
   finally{await ctx.close()}
  }
 }finally{await browser.close()}
}
if(errors.length)process.exit(1);
console.log('PASS all later ḥawāshī companion reader checks');
