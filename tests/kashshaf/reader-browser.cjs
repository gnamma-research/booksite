const {chromium,webkit}=require('playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const dir='texts/al-zamakhshari/al-kashshaf',base='http://127.0.0.1:8767/'+dir+'/';
const edition=JSON.parse(fs.readFileSync(dir+'/edition.json','utf8'));
const out='qa-kashshaf';fs.mkdirSync(out,{recursive:true});const results=[];
async function run(type,name){
 const browser=await type.launch(),context=await browser.newContext({viewport:{width:1440,height:960}}),page=await context.newPage();
 const errors=[],failures=[];page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base))failures.push(r.status()+' '+r.url());});
 const open=async hash=>{await page.goto(base+hash);await page.waitForFunction(()=>window.BahrReader&&window.BahrUI);await page.waitForTimeout(250);};
 const read=async id=>{await open('#/read/'+id);await page.locator('[data-record="'+id+'"].passage').waitFor();};
 try{
  await read('K097.05');assert.equal(await page.locator('.author-layer').count(),3);
  const menu=await page.locator('.primary-nav [data-nav]').evaluateAll(es=>es.map(e=>({route:e.dataset.nav,text:e.textContent.trim(),icon:e.querySelector('use')?.getAttribute('href')})));
  const buttons=await page.locator('#readingControls button').evaluateAll(es=>es.map(e=>({label:e.getAttribute('aria-label'),icon:e.querySelector('use')?.getAttribute('href')})));
  const bahr=await context.newPage();await bahr.goto('http://127.0.0.1:8767/texts/ibn-ajiba/al-bahr-al-madid/#/read/fatiha_1');await bahr.waitForFunction(()=>window.BahrUI);
  assert.deepEqual(menu,await bahr.locator('.primary-nav [data-nav]').evaluateAll(es=>es.map(e=>({route:e.dataset.nav,text:e.textContent.trim(),icon:e.querySelector('use')?.getAttribute('href')}))));
  assert.deepEqual(buttons,await bahr.locator('#readingControls button').evaluateAll(es=>es.map(e=>({label:e.getAttribute('aria-label'),icon:e.querySelector('use')?.getAttribute('href')}))));await bahr.close();
  // The navigation shelf opens and closes without changing the passage or language.
  if(await page.locator('#leftNav').isVisible())await page.locator('[data-ui="menu-close"]').click();
  await page.locator('#menuBtn').click();assert.ok(await page.locator('#leftNav').isVisible());
  await page.locator('[data-ui="menu-close"]').click();assert.equal(await page.locator('#leftNav').isVisible(),false);
  assert.equal(await page.locator('.passage').getAttribute('data-record'),'K097.05');
  results.push({browser:name,menuAndToolbarMatchBahr:true,shelfToggle:true});
  for(const r of edition.records){
   assert.ok(r.verses.length);assert.ok(r.layers[0].author==='kashshaf');
   for(const s of r.layers){assert.ok(s.ar.length>0);assert.ok(s.text.length>0);}
  }
  assert.equal(edition.records.flatMap(r=>r.layers).length,277);
  const initialQ=await page.locator('.quran-arabic').innerText();
  assert.ok(await page.locator('.q-en').isVisible());
  await page.locator('[data-language="ar"]').click();assert.equal(await page.locator('.ar-column:visible').count(),0);assert.ok(await page.locator('.quran-arabic').isVisible());assert.equal(await page.locator('.quran-arabic').innerText(),initialQ);
  assert.ok(await page.locator('.en-column .ar-term,.en-column .lexical').count()>0);
  await page.locator('[data-setting="tibi"]').first().uncheck();assert.equal(await page.locator('.tibi-layer:visible').count(),0);assert.equal(await page.locator('.kashshaf-layer:visible').count(),1);
  await page.reload();await page.locator('.passage').waitFor();assert.equal(await page.locator('.tibi-layer:visible').count(),0);
  await page.locator('[data-language="ar"]').click();await page.locator('[data-language="en"]').click();assert.equal(await page.locator('.en-column:visible').count(),0);assert.equal(await page.locator('.q-en:visible').count(),0);assert.ok(await page.locator('.quran-arabic').isVisible());assert.equal(await page.locator('.quran-arabic').innerText(),initialQ);
  await page.locator('[data-setting="tibi"]').first().check();assert.equal(await page.locator('.tibi-layer:visible').count(),2);
  await page.locator('[data-language="en"]').click();assert.ok(await page.locator('.ar-column:visible').count()>0);assert.ok(await page.locator('.en-column:visible').count()>0);
  await page.locator('[data-setting="tibi"]').first().uncheck();await open('#/read/K097.05?at=T097.05');await page.waitForFunction(()=>BahrReader.prefs.tibi);assert.ok(await page.locator('.tibi-layer:visible').count()>0);
  results.push({browser:name,arabicEnglishBoth:true,quranAlwaysArabic:true,layerPersistenceAndLinkedReveal:true});
  await page.locator('#settingsBtn').click();await page.locator('#sheet[open]').waitFor();assert.ok(await page.locator('#sheet [data-setting="tibi"]').count());await page.locator('#sheet-close').click();
  await page.locator('#location-button').click();await page.locator('#jumpOverlay[open]').waitFor();assert.ok(await page.locator('#jumpResults [data-section]').count()>0);await page.locator('#jumpClose').click();
  await page.locator('#readerSaveAction').click();await page.waitForFunction(()=>BahrReader.desk.some(x=>x.type==='bookmark'));
  await open('#/contents');assert.equal(await page.locator('.contents-part').count(),19);assert.equal(await page.locator('.toc-link').count(),123);
  await open('#/dictionary');await page.locator('.dictionary-card').first().waitFor();assert.equal(await page.locator('.dictionary-card').count(),edition.review.dictionary_entries);await page.locator('.dictionary-card').first().click();await page.locator('#sheet[open]').waitFor();await page.locator('#sheet-close').click();
  for(const route of ['indices','research','study','desk','help','about']){await open('#/'+route);assert.ok((await page.locator('#main').innerText()).length>100);}
  await open('#/search?q=الكوثر');await page.waitForFunction(()=>document.querySelector('#search-results')?.textContent.length>30);assert.ok(await page.locator('#search-results a[href*="/read/"]').count()>0);
  await open('#/search?q=abundance');await page.waitForFunction(()=>document.querySelector('#search-results')?.textContent.length>30);assert.ok(await page.locator('#search-results a[href*="/read/"]').count()>0);
  results.push({browser:name,contents:true,sectionPicker:true,bookmarks:true,referenceMenus:true,arabicEnglishSearch:true});
  await open('#/editions');await page.locator('[data-feature="prepare-book"]').waitFor();
  await page.locator('#print-custom summary').click();await page.locator('#print-start').selectOption('41');await page.locator('#print-end').selectOption('41');
  await page.locator('[data-print-tier="reference"]').click();await page.locator('[data-feature="prepare-book"]').click();await page.locator('#bahr-print-frame').waitFor();
  const print=page.frameLocator('#bahr-print-frame');await print.locator('.quran-arabic').waitFor();assert.equal(await print.locator('.passage').count(),1);assert.ok(await print.locator('.print-appendix').count()>=4);await page.locator('[data-feature="close-print"]').click();
  await read('K112.05');await page.evaluate(()=>BahrReader.setPrefs({ar:true,en:true,tibi:true,marks:'source'},true));
  for(const size of [{width:1440,height:960},{width:320,height:700},{width:390,height:844},{width:844,height:390}]){await page.setViewportSize(size);await page.evaluate(()=>document.fonts.ready);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow '+name+' '+size.width);await page.screenshot({path:out+'/'+name+'-'+size.width+'.png'});}
  await page.setViewportSize({width:1440,height:960});await page.evaluate(()=>BahrUI.readingMode('continuous'));await page.waitForFunction(()=>document.querySelectorAll('.passage').length===123,{timeout:30000});
  assert.equal(await page.locator('.author-layer').count(),277);assert.equal(await page.locator('.quran-context').count(),123);
  assert.ok(await page.locator('.quran-basmala').count()>0);
  assert.equal(await page.locator('.quran-arabic .ayah').first().getAttribute('data-verse'),'1:1');
  assert.ok(await page.locator('.quran-arabic').evaluateAll(es=>es.every(e=>e.textContent.includes('﴿')&&e.textContent.includes('﴾'))));
  assert.ok(await page.locator('.passage').evaluateAll(es=>es.every(e=>{const q=e.querySelector('.quran-context'),l=e.querySelector('.author-layer');return Boolean(q.compareDocumentPosition(l)&Node.DOCUMENT_POSITION_FOLLOWING)})));
  const texts=await page.locator('.author-layer').evaluateAll(es=>es.map(e=>{const copy=e.querySelector('.en-column').cloneNode(true);copy.querySelectorAll('.source-lemma,h3,button:not(.lexical),.personal-paragraph-tools,.scholarly-anchor').forEach(x=>x.remove());return {id:e.dataset.sourceId,text:[...copy.querySelectorAll('p[data-anchor]')].map(p=>p.textContent).join('\n\n')};}));
  // Added Arabic gloss spans leave a separator behind when removed; compare every non-whitespace character.
  const normal=s=>s.replace(/\s+/g,'');for(const s of edition.records.flatMap(r=>r.layers)){assert.equal(normal(texts.find(x=>x.id===s.id).text),normal(s.text),'Preserved complete English '+s.id);}
  const arabic=await page.locator('.author-layer').evaluateAll(es=>es.map(e=>({id:e.dataset.sourceId,text:[...e.querySelectorAll('.ar-column p[data-anchor]')].map(p=>p.textContent).join('\n\n')})));
  for(const s of edition.records.flatMap(r=>r.layers)){assert.equal(normal(arabic.find(x=>x.id===s.id).text),normal(s.ar),'Complete Arabic '+s.id);assert.equal(s.review.new_scan_collation,false);}
  assert.deepEqual(edition.review.arabic_lacunae,['T113.06']);
  await page.goto(base+'review-register.html#K001.12');assert.ok(await page.locator('[id="K001.12"]').getAttribute('open')!==null);assert.match(await page.locator('[id="K001.12"]').innerText(),/kingship/);
  const noJS=await browser.newContext({javaScriptEnabled:false}),plain=await noJS.newPage();for(const book of edition.books){await plain.goto(base+'plain/surah-'+String(book.number).padStart(3,'0')+'.html');assert.equal(await plain.locator('.author-layer').count(),edition.records.filter(r=>r.s===book.number).flatMap(r=>r.layers).length);assert.ok(await plain.locator('.quran-arabic').first().isVisible());}await noJS.close();
  for(const file of ['downloads/Kashshaf-Tibi-C07.html','downloads/Kashshaf-Tibi-C07.txt','arabic-alignment-audit.json'])assert.equal((await context.request.get(base+file)).status(),200);
  assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);results.push({browser:name,all277EnglishSectionsPreserved:true,all277ArabicSectionsPresent:true,static19CompleteSurahs:true,print:true,responsive:true,pageErrors:errors,failedRequests:failures});
 }catch(e){await page.screenshot({path:out+'/'+name+'-failure.png',fullPage:false});fs.writeFileSync(out+'/'+name+'-failure.html',await page.content());fs.writeFileSync(out+'/'+name+'-errors.json',JSON.stringify({errors,failures}));throw e;}finally{await browser.close();}
}
(async()=>{try{await run(chromium,'chromium');await run(webkit,'webkit');fs.writeFileSync(out+'/results.json',JSON.stringify({status:'passed',results},null,2));console.log('PASS: bilingual Quran-first reader, complete 277 sections, shared menu parity, both browser engines.');}catch(e){fs.writeFileSync(out+'/results.json',JSON.stringify({status:'failed',error:String(e),stack:e.stack,results},null,2));throw e;}})();
