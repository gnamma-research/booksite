/* Independent UI check of the new same-page later-gloss companion.
 * Runs in the existing pinned Tahdhīb browser workflow environment. */
import {chromium, webkit} from 'playwright';
const base=process.env.TAHDHIB_QA_BASE||'http://127.0.0.1:8766/';
const path='texts/al-taftazani/tahdhib-al-mantiq/edition/';
const failures=[];
const check=(v,msg)=>{if(!v)throw Error(msg)};
for(const [engine,type] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await type.launch({headless:true});
 try{
  for(const viewport of [{width:1280,height:850},{width:390,height:844}]){
   const context=await browser.newContext({viewport,reducedMotion:'reduce'});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   try{
    await page.goto(new URL(path,base).href,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>window.GnammaTahdhibFourLayers?.open,{timeout:30000});
    check(await page.locator('.gn-quiet-about').count()===1,'Scholarly notes were not collapsed under one control');
    check(await page.locator('main#main > section.source-note').count()===0,'Editorial source notes interrupt reading');
    const overlay=page.locator('#gn-h-panel');
    check(await overlay.isHidden(),'Historical H companion should be initially collapsed');
    await page.locator('.gn-h-trigger').click();
    await page.waitForFunction(()=>window.GnammaTahdhibFourLayers.counts().loaded===1090,{timeout:60000});
    check(await overlay.isVisible(),'Historical H companion did not open');
    check(await page.evaluate(()=>window.GnammaTahdhibFourLayers.counts().stage130EnglishRevisions)===21,
      'Expected all 21 preferred Stage130 H English overlays; baseline Arabic and previous draft must remain intact');
    const coverage=await page.evaluate(()=>window.GnammaTahdhibFourLayers.counts());
    check(coverage.stage131DefinitionCorrections===11,
      'All 11 Stage131 definition English corrections must be applied, got '+coverage.stage131DefinitionCorrections);
    check(coverage.stage131SkippedPatches.length===0,
      'Every Stage131 source English snippet must match its old baseline: '+coverage.stage131SkippedPatches.join(', '));
    check(coverage.stage132EnglishRevisions===13,
      'Expected 13 source-facing Stage132 English translations, got '+coverage.stage132EnglishRevisions);
    check(coverage.stage132SkippedPatches.length===0,
      'Stage132 historical identity/attribution mismatch: '+coverage.stage132SkippedPatches.join(', '));
    await page.locator('#gn-h-panel .gn-h-select').selectOption('H-CONTRAPOSITION');
    await page.locator('#gn-h-panel .gn-h-search').fill('HWN-CONTRAPOSITION-012');
    check(await page.locator('#gn-h-HWN-CONTRAPOSITION-012 .gn-h-english').innerText().then(t=>t.includes('particular negative')&&t.includes('broader than the subject')),
      'Fuller historical contraposition reasoning not loaded');
    check(await page.locator('#gn-h-HWN-CONTRAPOSITION-012 .gn-h-older-english').count()===1,
      'Older contraposition English must remain accessible in collapsed note');
    await page.locator('#gn-h-panel .gn-h-select').selectOption('H-INDUCTION');
    await page.locator('#gn-h-panel .gn-h-search').fill('HWN-INDUCTION-027');
    check(await page.locator('#gn-h-HWN-INDUCTION-027 .gn-h-english').innerText().then(t=>t.includes('al-Ghazālī')&&t.includes('concomitance')),
      'Fuller induction causal-inference English not loaded');
    await page.locator('#gn-h-panel .gn-h-search').fill('');
    await page.locator('#gn-h-panel .gn-h-select').selectOption('all');
    await page.locator('#gn-h-panel .gn-h-select').selectOption('H-DEFINITION');
    await page.locator('#gn-h-panel .gn-h-search').fill('HWN-DEFINITION-019');
    const defined=await page.locator('#gn-h-HWN-DEFINITION-019 .gn-h-english').innerText();
    check(defined.includes('forty-nine-cell definition matrix'),'Stage131 Q258 table apparatus reference missing');
    check(await page.locator('#gn-h-HWN-DEFINITION-019 .gn-h-older-english').count()===1,
      'Stage131 original definition English must be preserved in a closed note');
    await page.locator('#gn-h-panel .gn-h-search').fill('');
    await page.locator('#gn-h-panel .gn-h-select').selectOption('H-PREFACE');
    await page.locator('#gn-h-panel .gn-h-search').fill('HWN-047');
    check(await page.locator('#gn-h-HWN-047 .gn-h-english').innerText().then(t=>t.includes('ʿiṣma')&&t.includes('Luṭf')),
      'Stage130 full English must restore separate divine-grace concepts in HWN-047');
    check(await page.locator('#gn-h-HWN-047 .gn-h-older-english').count()===1,
      'Prior first-pass English must remain available as collapsed apparatus');
    await page.locator('#gn-h-panel .gn-h-search').fill('');
    await page.locator('#gn-h-panel .gn-h-select').selectOption('all');
    check(await page.locator('#gn-h-panel .gn-h-entry').count()===12,'Expected 12 visible paginated entries');
    check((await page.locator('#gn-h-panel .gn-h-entry').first().locator('a').count())>=1,'No original printed source locator link');
    await page.locator('#gn-h-panel .gn-h-select').selectOption('H-SCIENCES');
    check(await page.locator('#gn-h-panel .gn-h-counter').innerText().then(t=>t.includes('86 matches')),'Should show 86 science glosses');
    await page.locator('#gn-h-panel .gn-h-search').fill('HWN-SCIENCES-086');
    check(await page.locator('#gn-h-panel .gn-h-entry').count()===1,'Final gloss not found by precise note ID');
    check(await page.locator('#gn-h-HWN-SCIENCES-086').count()===1,'Final note identity mismatch');
    await page.locator('#gn-h-panel .gn-h-search').fill('');
    await page.locator('#gn-h-panel .gn-h-select').selectOption('all');
    check(await page.locator('#gn-h-panel .gn-h-counter').innerText().then(t=>t.includes('1033 matches')),'Modern editorial references incorrectly mixed with H continuous reading');
    await page.locator('#gn-h-panel .gn-h-tab').nth(1).click();
    check(await page.locator('#gn-h-panel .gn-h-counter').innerText().then(t=>t.includes('1090 matches')),'Optional modern references not accessible');
    await page.keyboard.press('Escape');
    check(await overlay.isHidden(),'Escape did not close H panel');
    check(!errors.length,'JavaScript error: '+errors.join(' | '));
    const width=await page.evaluate(()=>({s:document.documentElement.scrollWidth,w:innerWidth}));
    check(width.s<=width.w+5,'Viewport overflow '+JSON.stringify(width));
    console.log('PASS',engine,viewport.width,'four-layer quiet reader, source notes collapsed, 1090 H positions, 57 modern refs separate');
   }catch(err){failures.push(engine+' '+viewport.width+': '+err.message);console.error('FAIL',failures.at(-1))}
   finally{await context.close()}
  }
 }finally{await browser.close()}
}
if(failures.length)process.exitCode=1;
