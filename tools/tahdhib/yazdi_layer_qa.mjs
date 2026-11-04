/* Source and UI regression for the optional Mullā al-Yazdī commentary layer. */
import {chromium,webkit} from 'playwright';
const base=process.env.TAHDHIB_QA_BASE||'http://127.0.0.1:8765/';
const routes={logic:'texts/al-taftazani/tahdhib-al-mantiq/edition/',kalam:'texts/al-taftazani/tahdhib-al-kalam/edition/'};
const failures=[];
function assert(x,msg){if(!x)throw Error(msg)}
async function test(engine,browser,kind,viewport){
 const ctx=await browser.newContext({viewport,reducedMotion:'reduce',hasTouch:viewport.width<900});
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(new URL(routes[kind],base).href,{waitUntil:'networkidle',timeout:60000});
  const count=kind==='logic'?19:1044;
  assert(await page.locator('#gn-daruri-toolbar button[aria-label="Books"]').count()===1,'Shared Books menu absent');
  assert(await page.locator('#gn-daruri-toolbar button[aria-label="Layers"]').count()===1,'Shared Layers menu absent');
  assert(await page.locator('#gn-daruri-toolbar button[aria-label="Visuals"]').count()===1,'Daruri Visuals menu absent');
  assert(await page.locator('#gn-daruri-toolbar button[aria-label="Saved"]').count()===1,'Reading Desk absent');
  const native=page.locator('#flow-passages .gn-flow-unit,#flow-passages .gn-source-heading [data-clause-id]');
  assert(await native.count()===count*2,'Original aligned clauses changed');
  await page.locator('#gn-daruri-toolbar button[aria-label="Books"]').click();
  for(const name of ['Logic · Tahdhīb al-Manṭiq','Kalām · Tahdhīb al-Kalām','Uṣūl al-fiqh · al-Ḍarūrī']){
   assert(await page.locator('#gn-daruri-overlay a').filter({hasText:name}).count()===1,'Book missing: '+name)
  }
  await page.locator('#gn-daruri-overlay button[aria-label="Close"]').click();
  await page.locator('#gn-daruri-toolbar button[aria-label="Layers"]').click();
  if(kind==='logic'){
   assert(await page.evaluate(()=>!!window.GnammaYazdiLayer),'Yazdi translator layer missing');
   assert(await page.evaluate(()=>window.GnammaYazdiLayer.entryCount)===71,'Source-checked translation count mismatch');
   const checkbox=page.locator('#gn-daruri-overlay input[aria-label="Show translated commentary by Mullā al-Yazdī"]');
   assert(await checkbox.count()===1,'Translation layer checkbox missing');
   assert(!(await checkbox.isChecked()),'Unrequested commentary enabled by default');
   await checkbox.check();
   assert(await page.locator('body[data-yazdi="on"]').count()===1,'Commentary toggle does not activate display');
   await page.locator('#gn-daruri-overlay button[aria-label="Close"]').click();
   assert(await page.locator('#flow-passages .gn-yazdi-layer').count()===9,'Selected divisions missing');
   assert(await page.locator('#flow-passages .gn-yazdi-excerpt').count()===71,'Translated passages missing');
   assert(await page.locator('#flow-passages .gn-yazdi-ar').first().textContent()!=='','Arabic original missing');
   assert((await page.locator('#flow-passages .gn-yazdi-en').first().textContent()).includes('three matters'),'English translation missing');
   assert(await page.locator('#flow-passages .gn-yazdi-layer[data-yazdi-unit="L.10"]').count()===0,'Invented text for untranslated division');
   const links=await page.locator('#flow-passages .gn-yazdi-source').evaluateAll(xs=>xs.map(a=>a.href));
   assert(links.length===71&&links.every(x=>x.includes('/book_content/b/12170/')),'Source pagination disconnected');
   await page.locator('#gn-daruri-toolbar [data-gn-lang="ar"]').click();
   const hidden=await page.evaluate(()=>getComputedStyle(document.querySelector('#flow-passages .gn-yazdi-en')).display);
   assert(hidden==='none','Arabic-only mode leaks English commentary');
   await page.locator('#gn-daruri-toolbar [data-gn-lang="both"]').click();
   await page.locator('#gn-daruri-toolbar button[aria-label="Study"]').click();
   await page.evaluate(()=>window.GnammaTahdhibReader.go(2));
   assert(await page.locator('#passages:not([hidden]) .gn-yazdi-layer[data-yazdi-unit="L.02"]').count()===1,'Study commentary not aligned');
   await page.locator('#gn-daruri-toolbar button[aria-label="Read"]').click();
   assert(await page.locator('#flow-passages .gn-yazdi-excerpt').count()===71,'Continuous reading lost commentary');
   await page.reload({waitUntil:'networkidle'});
   assert(await page.locator('body[data-yazdi="on"]').count()===1,'User-selected layer was not preserved');
   assert(await page.locator('#flow-passages .gn-yazdi-excerpt').count()===71,'Commentary source not restored on refresh');
  }else{
   assert(await page.locator('#gn-daruri-overlay a').filter({hasText:'Read Taqrīb al-Marām'}).count()===1,'Kalām companion commentary missing');
   assert(await page.locator('#gn-daruri-overlay input[aria-label="Show translated commentary by Mullā al-Yazdī"]').count()===0,'Yazdi incorrectly offered for Kalām');
   await page.locator('#gn-daruri-overlay button[aria-label="Close"]').click();
  }
  const overflow=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  assert(overflow.scroll<=overflow.width+3,'Horizontal body overflow '+JSON.stringify(overflow));
  assert(errors.length===0,'Browser errors: '+errors.join(' | '));
  console.log('PASS',engine,kind,viewport.width+'x'+viewport.height, 'cross-book parity and source-layer integrity');
 }finally{await ctx.close()}
}
for(const [engine,driver] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await driver.launch({headless:true});
 try{
  for(const kind of ['logic','kalam']){
   for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
    try{await test(engine,browser,kind,viewport)}
    catch(e){failures.push(engine+' '+kind+' '+viewport.width+': '+e.message);console.error('FAIL',failures.at(-1))}
   }
  }
 }finally{await browser.close()}
}
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('PASS all 8 Yazdi/Daruri shared reader regressions');
