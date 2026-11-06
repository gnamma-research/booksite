/* Live source-coverage and Darūrī-equivalent navigation checks for both Tahdhīb readers.
 * Logic has one compact 56px rail and exactly two matn/sharḥ display choices;
 * kalām keeps its own existing common shell. */
import {chromium,webkit} from 'playwright';
const base=process.env.TAHDHIB_QA_BASE||'http://127.0.0.1:8765/';
const routes={logic:'texts/al-taftazani/tahdhib-al-mantiq/edition/',kalam:'texts/al-taftazani/tahdhib-al-kalam/edition/'};
const failures=[];
function assert(x,message){if(!x)throw Error(message)}
async function run(engine,browser,kind,viewport){
 const ctx=await browser.newContext({viewport,reducedMotion:'reduce',hasTouch:viewport.width<900});
 const page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(new URL(routes[kind],base).href,{waitUntil:'networkidle',timeout:60000});
  const isLogic=kind==='logic',count=isLogic?19:1044;
  const originals=page.locator('#flow-passages .gn-flow-unit,#flow-passages .gn-source-heading [data-clause-id]');
  assert(await originals.count()===count*2,'Original Arabic–English source units changed');
  assert(await page.locator('body[data-reading-style="flow"]').count()===1,'Not in unbroken flow mode');
  assert(await page.locator('#flow-passages .gn-flow-section').count()>0,'No continuous source flow');
  if(isLogic){
   const rail=page.locator('#gn-logic-rail');
   assert(await rail.isVisible(),'Compact logic top rail missing');
   assert(!(await page.locator('#gn-daruri-toolbar').isVisible()),'Oversized original top toolbar still visible');
   const sizes=await rail.evaluate(el=>({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,scroll:el.scrollWidth,client:el.clientWidth}));
   assert(sizes.height>=53&&sizes.height<=57,'Top rail is not Darūrī 56px: '+JSON.stringify(sizes));
   assert(sizes.scroll<=sizes.client+3,'Horizontal toolbar scroll: '+JSON.stringify(sizes));
   assert(await page.locator('#gn-logic-rail .gn-logic-group').count()===3,'Topbar not organized in three groups');
   assert(await page.locator('#flow-passages .gn-logic-editorial-header').count()===19,'19 bilingual editorial division titles absent');
   assert(await page.locator('#flow-passages .gn-logic-editorial-ar[lang="ar"]').count()===19,'Editorial Arabic headings absent');
   assert(await page.locator('#gn-logic-rail .gn-logic-tile').count()===1,'Darūrī tile missing');
   assert(await page.evaluate(()=>window.GnammaYazdiLayer?.entryCount)===177,'Translation count must be exactly 177');
   const menu=page.locator('#gn-logic-rail [aria-label="Menu and contents"]');
   await menu.click();
   assert(await page.locator('#gn-logic-scrim:not([hidden]) .gn-logic-menu-group').count()===4,'Reader menu not consolidated');
   assert(await page.locator('#gn-logic-scrim .gn-logic-menu-item').count()>=12,'Missing menu items');
   await page.locator('#gn-logic-scrim .gn-logic-menu-item').filter({hasText:'Commentary topic guide'}).click();
   assert(await page.locator('#gn-logic-scrim:not([hidden]) .gn-logic-outline-chapter').count()===19,'Indian commentary division concordance missing');
   assert(await page.locator('#gn-logic-scrim .gn-logic-outline-item').count()===76,'Indian printed 76 subtopics missing');
   await page.locator('#gn-logic-scrim [aria-label="Close"]').click();
   assert(await page.locator('#gn-logic-scrim[hidden]').count()===1,'Menu close failed');
   await rail.locator('[aria-label="Text layers: Matn or Matn and commentary"]').click();
   const group=page.locator('#gn-logic-scrim:not([hidden]) [role="radiogroup"]');
   assert(await group.count()===1,'No two-state text layer control');
   assert(await group.locator('[role="radio"]').count()===2,'Unexpected third sharh-only mode');
   assert((await group.locator('[role="radio"]').first().getAttribute('aria-checked'))==='true','Matn not default');
   await group.locator('[role="radio"]').nth(1).click();
   assert(await page.locator('body[data-yazdi="on"]').count()===1,'Matn + sharh did not enable commentary');
   assert(await page.locator('#flow-passages .gn-yazdi-layer').count()===19,'Not all divisions have represented commentary');
   assert(await page.evaluate(()=>window.GnammaYazdiLayer?.continuousPages)===8,'Continuous L03 source page register must have eight pages');
   assert(await page.locator('#flow-passages .gn-yazdi-layer[data-contiguous-unit="L.03"]').count()===1,'L03 must render an uninterrupted working main-commentary source');
   assert(await page.locator('#flow-passages .gn-yazdi-contiguous-page').count()===8,'All Qum p22–29 page blocks must render once');
   assert(await page.locator('#flow-passages .gn-yazdi-contiguous-page[data-q-page="24"] .gn-yazdi-critical-crux').count()===1,'Questionable Qum p24 reading must be flagged');
   assert(await page.locator('#flow-passages [data-yazdi-id="YZ-23.01"]').count()===0,'Redundant archival selected excerpts must not repeat continuous translation');
   assert(await page.locator('#flow-passages .gn-yazdi-excerpt').count()===174,'Visible corpus should replace 11 redundant L03 selections with 8 full source page blocks');
   assert(await page.locator('#flow-passages .gn-yazdi-variant:not(.gn-yazdi-critical-crux)').count()===9,'Nine Q/I13 printed comparison dossiers missing');
   assert(await page.locator('#flow-passages .gn-yazdi-second-print').count()===17,'I13 printed links must match 17 separately identified passages');
   const v=page.locator('#flow-passages .gn-yazdi-variant').first();
   await v.locator('summary').click();
   assert(await v.locator('.gn-yazdi-variant-row').count()===2,'Compare Q/I13 readings missing');
   assert((await v.textContent()).includes('not')||await v.locator('.gn-yazdi-variant-status').count()===1,'Printed comparison lacks source qualification');
   const en=page.locator('#flow-passages .gn-yazdi-en').first(),ar=page.locator('#flow-passages .gn-yazdi-ar').first();
   assert((await en.textContent()).includes('begins with praise'),'Translated first paragraph does not match source');
   assert((await ar.textContent()).trim().length>10,'Original Arabic missing');
   const links=await page.locator('#flow-passages .gn-yazdi-excerpt > .gn-yazdi-source:not(.gn-yazdi-second-print)').evaluateAll(xs=>xs.map(a=>a.href));
   assert(links.length===174&&links.every(x=>x.includes('/book_content/b/12170/')||x.includes('najafdesertlibrary.com/book/')),'Commentary pagination broken');
   await rail.locator('[aria-label="English"]').click();
   assert(await page.locator('#flow-passages[data-view="ar"]').count()===1,'Switching English off did not leave Arabic only');
   assert(await en.evaluate(el=>getComputedStyle(el).display)==='none','Arabic-only view leaks English commentary');
   await rail.locator('[aria-label="English"]').click();
   assert(await page.locator('#flow-passages[data-view="both"]').count()===1,'Re-enabling English failed');
   await rail.locator('[aria-label="Arabic"]').click();
   assert(await page.locator('#flow-passages[data-view="en"]').count()===1,'Switching Arabic off did not leave English only');
   await rail.locator('[aria-label="Arabic"]').click();
   assert(await page.locator('#flow-passages[data-view="both"]').count()===1,'Bilingual re-enable failed');
   await rail.locator('[aria-label="Text layers: Matn or Matn and commentary"]').click();
   await page.locator('#gn-logic-scrim [role="radio"]').first().click();
   assert(await page.locator('body[data-yazdi="off"]').count()===1,'Matn-only selection did not disable commentary');
   assert(!(await page.locator('#flow-passages .gn-yazdi-layer').first().isVisible()),'Matn-only still displays the commentary');
   await rail.locator('[aria-label="Text layers: Matn or Matn and commentary"]').click();
   await page.locator('#gn-logic-scrim [role="radio"]').nth(1).click();
   await page.evaluate(()=>window.GnammaTahdhibExperience.setMode('study'));
   await page.evaluate(()=>window.GnammaTahdhibReader.go(2));
   assert(await page.locator('#passages:not([hidden]) .gn-yazdi-layer[data-yazdi-unit="L.02"]').count()===1,'Study mode commentary not source aligned');
   await page.evaluate(()=>window.GnammaTahdhibExperience.setMode('flow'));
   assert(await page.locator('#flow-passages .gn-yazdi-excerpt').count()===174,'Full commentary flow was lost on restore');
   await page.reload({waitUntil:'networkidle'});
   assert(await page.locator('body[data-yazdi="on"]').count()===1,'Selected commentary layer not persisted');
   assert(await page.locator('#flow-passages .gn-yazdi-excerpt').count()===174,'Continuous source pages missing after refresh');
   const critical=await ctx.newPage();await critical.goto(new URL(routes.logic+'critical-status.html',base).href,{waitUntil:'networkidle'});
   assert(await critical.locator('#count').textContent()==='177','Edition coverage page out of sync');
   assert(await critical.locator('#divisions').textContent()==='19/19','Division coverage page out of sync');
   assert(await critical.locator('#coverage tr').count()===19,'Critical edition register must list 19 divisions');
   assert(await critical.locator('#parallel-witnesses tr').count()===9,'Published critical register must expose nine Q/I13 comparisons');
   assert(await critical.locator('#continuous-l03 tr').count()===8,'Critical dashboard does not report all continuous Qum source pages');
   await critical.close();
  }else{
   assert(await page.locator('#gn-logic-rail').count()===0,'Logic-only compact toolbar leaked into kalām');
   assert(await page.locator('#gn-daruri-toolbar').isVisible(),'Kalām original common toolbar missing');
   await page.locator('#gn-daruri-toolbar [aria-label="Layers"]').click();
   assert(await page.locator('#gn-daruri-overlay a').filter({hasText:'Taqrīb al-Marām'}).count()===1,'Kalām Sanandajī companion lost');
   assert(await page.locator('#gn-daruri-overlay input[aria-label="Show translated commentary by Mullā al-Yazdī"]').count()===0,'Yazdī must not appear in kalām');
   await page.locator('#gn-daruri-overlay [aria-label="Close"]').click();
  }
  const width=await page.evaluate(()=>({view:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  assert(width.scroll<=width.view+3,'Horizontal page overflow: '+JSON.stringify(width));
  assert(errors.length===0,'Page JS errors: '+errors.join(' | '));
  console.log('PASS',engine,kind,viewport.width+'x'+viewport.height,'source & Darūrī parity');
 }finally{await ctx.close()}
}
for(const [engine,driver] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await driver.launch({headless:true});
 try{
  for(const kind of ['logic','kalam']){
   for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
    try{await run(engine,browser,kind,viewport)}catch(e){const msg=engine+' '+kind+' '+viewport.width+': '+e.message;failures.push(msg);console.error('FAIL',msg)}
   }
  }
 }finally{await browser.close()}
}
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log('PASS all 8 source-commentary / compact-parity browser regressions');
