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
   assert(await page.locator('#flow-passages .gn-yazdi-layer[data-contiguous-unit="L.03"] .gn-yazdi-contiguous-page').count()===8,'All Qum p22–29 page blocks must render once');
   assert(await page.locator('#flow-passages .gn-yazdi-contiguous-page[data-q-page="24"] .gn-yazdi-critical-crux').count()===1,'Questionable Qum p24 reading must be flagged');
   assert(await page.locator('#flow-passages [data-yazdi-id="YZ-23.01"]').count()===0,'Redundant archival selected excerpts must not repeat continuous translation');
   assert(await page.evaluate(()=>window.GnammaYazdiLayer?.additionalContinuousPages)===8,'New Qum pp.30–37 must have eight distinct printed pages');
   assert(await page.evaluate(()=>window.GnammaYazdiLayer?.additionalContinuousBlocks)===10,'Qum pp.30–37 must have ten nonduplicating editorial segments');
   for(const unit of ['L.04','L.05','L.06']){
    assert(await page.locator('#flow-passages .gn-yazdi-layer[data-contiguous-unit="'+unit+'"]').count()===1,'Missing complete searchable main commentary in '+unit);
   }
   assert(await page.locator('#flow-passages .gn-yazdi-contiguous-page').count()===62,'Expected 47 earlier and 15 new consecutive source blocks');
   assert(await page.locator('#flow-passages [data-yazdi-id="YZ-30.01"]').count()===0,'Qum main pp.30–37 must not repeat archive selections');
   assert(await page.locator('#flow-passages .gn-yazdi-contiguous-page[data-q-page="37"] .gn-yazdi-critical-crux').count()===1,'Q37 unresolved source-layout boundary must be visible');
   assert(await page.locator('#flow-passages .gn-yazdi-contiguous-page[data-q-page="31"]').count()===2,'Q31 split between L04 and L05 was lost');
   assert(await page.locator('#flow-passages .gn-yazdi-contiguous-page[data-q-page="35"]').count()===2,'Q35 split between L05 and L06 was lost');
   assert(await page.evaluate(()=>window.GnammaYazdiLayer?.speciesContinuousPages)===9,'Qum species/differentia run must contain nine printed main-text pages');
   assert(await page.locator('#flow-passages .gn-yazdi-layer[data-contiguous-unit="L.07"] .gn-yazdi-contiguous-page').count()===9,'L07 main شرح pages 39–47 not shown exactly once');
   assert(await page.locator('#flow-passages .gn-yazdi-contiguous-page[data-q-page="38"]').count()===0,'Marginal-only Qum p38 must never enter main commentary');
   assert(await page.locator('#flow-passages .gn-yazdi-contiguous-page[data-q-page="39"]').count()===1,'Q39 main commentary missing');
   assert(await page.locator('#flow-passages .gn-yazdi-contiguous-page[data-q-page="47"]').count()===1,'Q47 close of accident classification missing');
    assert(await page.evaluate(()=>window.GnammaYazdiLayer?.logicalUniversalPages)===2,'Q48-49 logical universals main text missing');
    assert(await page.evaluate(()=>window.GnammaYazdiLayer?.definitionPages)===2,'Q50-51 defining accounts main text missing');
    assert(await page.evaluate(()=>window.GnammaYazdiLayer?.propositionPages)===5,'Q54-58 propositions main text missing');
    assert(await page.evaluate(()=>window.GnammaYazdiLayer?.modalPages)===6,'Q59–64 main commentary modal text incomplete');
    assert(await page.evaluate(()=>window.GnammaYazdiLayer?.conditionalPages)===5,'Q65–69 main commentary on conditionals incomplete');
    assert(await page.evaluate(()=>window.GnammaYazdiLayer?.contradictionPages)===4,'Q70–73 main al-Yazdī contradiction missing');
    assert(await page.evaluate(()=>window.GnammaYazdiLayer?.conversionPages)===7,'Q74–80 main al-Yazdī simple conversion missing');
    assert(await page.evaluate(()=>window.GnammaYazdiLayer?.contrapositionPages)===4,'Q81–84 main al-Yazdī contraposition missing');
    for(const [unit,count] of [['L.13',4],['L.14',7],['L.15',4]]){
     assert(await page.locator('#flow-passages .gn-yazdi-layer[data-contiguous-unit="'+unit+'"] .gn-yazdi-contiguous-page').count()===count,'Missing consecutive main commentary in '+unit);
    }
    for(const oldId of ['YZ-70.01','YZ-72.01','YZ-74.01','YZ-76.01','YZ-81.01']){
     assert(await page.locator('#flow-passages [data-yazdi-id="'+oldId+'"]').count()===0,'Duplicated archived source excerpt '+oldId);
    }
    assert(await page.locator('#flow-passages .gn-yazdi-contiguous-page[data-q-page="73"]').count()===1,'Q73 compound negation continuation missing');
    assert(await page.locator('#flow-passages .gn-yazdi-contiguous-page[data-q-page="79"]').count()===1,'Q79 Yazdī objection missing');
    assert(await page.locator('#flow-passages .gn-yazdi-contiguous-page[data-q-page="84"]').count()===1,'Q84 witness proof completion missing');
    assert(await page.locator('#flow-passages .gn-yazdi-contiguous-page[data-q-page="85"]').count()===0,'Q85 heading must not appear as al-Yazdī commentary');
    const q81=await page.locator('#flow-passages .gn-yazdi-contiguous-page[data-q-page="81"] .gn-yazdi-ar').textContent();
    assert(q81.includes('القدماء')&&q81.includes('المتأخرون'),'Early versus later contraposition textual distinction missing');
    for(const [unit,n] of [['L.11',6],['L.12',5]]){
     assert(await page.locator('#flow-passages .gn-yazdi-layer[data-contiguous-unit="'+unit+'"] .gn-yazdi-contiguous-page').count()===n,'Missing consecutive commentary for '+unit);
    }
    for(const oldId of ['YZ-59.01','YZ-62.01','YZ-65.01','YZ-68.01']){
     assert(await page.locator('#flow-passages [data-yazdi-id="'+oldId+'"]').count()===0,'Older selected excerpt repeated in place of continuous translation: '+oldId);
    }
    const q63=await page.locator('#flow-passages .gn-yazdi-contiguous-page[data-q-page="63"] .gn-yazdi-ar').textContent();
    assert(q63.includes('ستة عشر')&&q63.includes('التسعة الباقية'),"Modal source 16/3/4/9 count missing");
    const q65=await page.locator('#flow-passages .gn-yazdi-contiguous-page[data-q-page="65"] .gn-yazdi-ar').textContent();
    assert(!q65.includes('أقسام الشرطية'),'Printed chapter rubric imported as al-Yazdī prose');
    assert(await page.locator('#flow-passages .gn-yazdi-contiguous-page[data-q-page="69"]').count()===1,'Complete conditional section p69 missing');
    assert(await page.locator('#flow-passages .gn-yazdi-contiguous-page[data-q-page="70"]').count()===0,'Following contradiction chapter p70 improperly included');
    for(const [unit,count] of [['L.08',2],['L.09',2],['L.10',5]]){
     assert(await page.locator('#flow-passages .gn-yazdi-layer[data-contiguous-unit="'+unit+'"] .gn-yazdi-contiguous-page').count()===count,'Unexpected Q48-58 blocks in '+unit);
    }
    for(const id of ['YZ-49.01','YZ-50.01','YZ-56.01']){
     assert(await page.locator('#flow-passages [data-yazdi-id="'+id+'"]').count()===0,'Overlapping archival translation repeated: '+id);
    }
    assert(await page.locator('#flow-passages .gn-yazdi-contiguous-page[data-q-page="52"],#flow-passages .gn-yazdi-contiguous-page[data-q-page="53"]').count()===0,'Q52 blank or Q53 heading falsely translated');
    assert(await page.locator('#flow-passages .gn-yazdi-contiguous-page[data-q-page="55"]').count()===1,'Short al-Yazdī main Q55 clause missing');
    const q55ar=await page.locator('#flow-passages .gn-yazdi-contiguous-page[data-q-page="55"] .gn-yazdi-ar').textContent();
    assert(q55ar.includes('فلا دور')&&!q55ar.includes('المحقق الشريف'),'Q55 imported later marginalia or missed the main sentence');
   assert(await page.locator('#flow-passages [data-yazdi-id="YZ-46.01"]').count()===0,'Overlapping selected commentary must not repeat p46 full reading');
   assert(await page.locator('#flow-passages .gn-yazdi-excerpt').count()===116,'Visible main commentary should replace 123 archived samples with 62 continuous blocks');
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
   assert(links.length===116&&links.every(x=>x.includes('/book_content/b/12170/')||x.includes('najafdesertlibrary.com/book/')),'Commentary pagination broken');
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
   assert(await page.locator('#flow-passages .gn-yazdi-excerpt').count()===116,'Continuous Q22–84 commentary flow lost on restore');
   await page.reload({waitUntil:'networkidle'});
   assert(await page.locator('body[data-yazdi="on"]').count()===1,'Selected commentary layer not persisted');
   assert(await page.locator('#flow-passages .gn-yazdi-excerpt').count()===116,'Continuous Q22–84 commentary missing after refresh');
   const critical=await ctx.newPage();await critical.goto(new URL(routes.logic+'critical-status.html',base).href,{waitUntil:'networkidle'});
   assert(await critical.locator('#count').textContent()==='177','Edition coverage page out of sync');
   assert(await critical.locator('#divisions').textContent()==='19/19','Division coverage page out of sync');
   assert(await critical.locator('#coverage tr').count()===19,'Critical edition register must list 19 divisions');
   assert(await critical.locator('#parallel-witnesses tr').count()===9,'Published critical register must expose nine Q/I13 comparisons');
   assert(await critical.locator('#continuous-l03 tr').count()===8,'Critical dashboard does not report all continuous Qum source pages');
   assert(await critical.locator('#continuous-universals tr').count()===10,'Critical register lost the ten Q30–37 source blocks');
   assert(await critical.locator('#continuous-l07 tr').count()===9,'Critical edition dashboard omitted the nine Q39–47 continuous source pages');
    assert(await critical.locator('#continuous-q48-51 tr').count()===4,'Critical dashboard lost Q48-51 source pages');
    assert(await critical.locator('#continuous-q54-58 tr').count()===5,'Critical dashboard lost Q54-58 source pages');
    assert(await critical.locator('#continuous-q59-64 tr').count()===6,'Critical register must show six modal text pages');
    assert(await critical.locator('#continuous-q65-69 tr').count()===5,'Critical register must show five conditional pages');
    assert(await critical.locator('#continuous-q70-73 tr').count()===4,'Critical dashboard must list four contradiction source pages');
    assert(await critical.locator('#continuous-q74-80 tr').count()===7,'Critical dashboard must list seven simple-conversion source pages');
    assert(await critical.locator('#continuous-q81-84 tr').count()===4,'Critical dashboard must list four contraposition source pages');
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
