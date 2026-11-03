import {chromium,webkit} from 'playwright';
import fs from 'node:fs';
const base=process.env.TAHDHIB_QA_BASE||'http://127.0.0.1:8765/';
const expect=(value,msg)=>{if(!value)throw Error(msg)};
fs.mkdirSync('qa/tahdhib-native',{recursive:true});
const results=[];
for(const [engine,driver] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await driver.launch({headless:true});
 try{for(const kind of ['kalam','logic'])for(const size of [{width:1440,height:900},{width:390,height:844},{width:844,height:390}]){
  const route='texts/al-taftazani/tahdhib-al-'+(kind==='logic'?'mantiq':'kalam')+'/edition/';
  const context=await browser.newContext({viewport:size,reducedMotion:'reduce',hasTouch:size.width<900});
  await context.addInitScript(kind=>{try{
   const id=kind==='kalam'?'KAL-015.04':'L.02';
   const key='gnamma-tahdhib-reader-v2-'+(kind==='logic'?'division':'kalam');
   if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify({page:kind==='kalam'?15:1,bookmarks:[id]}));
   const nk='gnamma-tahdhib-private-notes-v1-'+kind;
   if(!localStorage.getItem(nk))localStorage.setItem(nk,JSON.stringify({[id]:{body:'LEGACY_QA_NOTE',highlight:true}}));
  }catch{}},kind);
  const page=await context.newPage();page.setDefaultTimeout(12000);const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
   await page.goto(new URL(route,base).href,{waitUntil:'networkidle',timeout:60000});
   await page.waitForFunction(()=>window.TahdhibNative&&window.GnammaCopyLinks);
   const count=kind==='kalam'?1044:19;
   expect(await page.locator('#reader .passage-grid').count()===count,'Continuous view did not load every passage');
   const source=await page.evaluate(async()=>{const t=await(await fetch('data.js')).text();return JSON.parse(t.slice(t.indexOf('=')+1).replace(/;\s*$/,''))});
   const data=await page.evaluate(()=>window.TahdhibNative.book);
   expect(JSON.stringify(data.sections.flatMap(s=>s.segments.map(x=>[x.unitId,x.ar,x.en])))===JSON.stringify(source.units.map(u=>[u.id,u.ar,u.en])),'Canonical Arabic, English or IDs changed');
   const displayed=await page.locator('#reader .passage-ar').allTextContents();
   expect(displayed.length===count,'Wrong Arabic passage count');
   expect(displayed.every((s,i)=>s===source.units[i].ar),'Displayed source Arabic altered');
   expect((await page.evaluate(()=>window.TahdhibNative.desk.records())).some(r=>r.body==='LEGACY_QA_NOTE'),'Old notes not migrated');
   const legacyBefore=await page.evaluate(kind=>localStorage.getItem('gnamma-tahdhib-private-notes-v1-'+kind),kind);
   await page.locator('#reader .passage-grid').last().scrollIntoViewIfNeeded();
   expect(await page.evaluate(()=>scrollY)>200,'Final passage not reachable by uninterrupted scroll');
   await page.evaluate(()=>window.TahdhibNative.goSection('1'));
   expect(await page.locator('#gn-daruri-toolbar').count()===0,'Separate imitation toolbar remains');
   await page.locator('#settingsBtn').click();
   expect(await page.locator('#settingsOverlay').isVisible(),'Native Visuals did not open');
   for(const attr of ['data-page-style-choice','data-arabic-font-choice','data-english-font-choice'])expect(await page.locator('#settingsOverlay ['+attr+']').count()>=3,'Missing native visual choices '+attr);
   expect(await page.locator('#settingsOverlay [data-palette]').count()===6,'Missing native photographic/colour palettes');
   await page.locator('#settingsOverlay [data-palette="nasrid"]').click();
   await page.locator('#settingsClose').click();
   await page.locator('#readerSaveAction').click();
   await page.evaluate(()=>window.TahdhibNative.navigate('bookmarks'));
   await page.waitForSelector('[data-rd="new-note"]');
   expect((await page.evaluate(()=>window.TahdhibNative.desk.records())).length>0,'Bookmark not saved');
   await page.locator('[data-rd="new-note"]').click();
   await page.locator('#gn-rd-note-body').fill('Native Tahdhīb QA personal note.');
   await page.locator('[data-rd="save-note"]').click();
   expect((await page.evaluate(()=>window.TahdhibNative.desk.records())).some(r=>r.body==='Native Tahdhīb QA personal note.'),'Private note not saved');
   const backup=await page.evaluate(()=>JSON.parse(window.TahdhibNative.desk.backup()));
   expect(backup.format==='gnamma-tahdhib-'+kind+'-reading-desk','Book-specific backup identity missing');
   expect(backup.items.length>=2,'Backup omitted annotations');
   for(const routeName of ['home','contents','study','glossary','index','applications','help']){
    await page.evaluate(r=>window.TahdhibNative.navigate(r),routeName);await page.waitForTimeout(80);
    const text=await page.locator('#mainContent').innerText();
    expect(!/Ibn Rushd|Bou Akl|al-ʿAlawī|1994|§1–258|302 subject/.test(text),'Foreign-book scholarly content leaked into '+routeName);
   }
   await page.evaluate(()=>window.TahdhibNative.navigate('editions'));
   await page.waitForFunction(()=>document.querySelector('.native-pdf-status')?.textContent.includes('All three'));
   expect(await page.locator('.native-pdfs a').count()===3,'Wrong canonical PDF count');
   for(const href of await page.locator('.native-pdfs a').evaluateAll(a=>a.map(x=>x.getAttribute('href')))){
    const response=await context.request.head(new URL(href,new URL(route,base)).href);expect(response.ok(),'PDF link unavailable '+href);
   }
   const id=kind==='kalam'?'KAL-077.03':'L.16';
   await page.goto(new URL(route+'#u-'+id.replaceAll('.','-'),base).href,{waitUntil:'networkidle'});
   expect((await page.evaluate(()=>location.hash)).includes('paragraph='+id),'Legacy permanent clause link did not map');
   expect(await page.evaluate(()=>window.GnammaCopyLinks.parseHash().id)===id,'Native paragraph IDs are not canonical Tahdhīb IDs');
   expect((await page.evaluate(()=>window.TahdhibNative.desk.records())).some(r=>r.body==='Native Tahdhīb QA personal note.'),'Saved notes lost after navigation/reload');
   expect(await page.evaluate(kind=>localStorage.getItem('gnamma-tahdhib-private-notes-v1-'+kind),kind)===legacyBefore,'Legacy notes overwritten during migration');
   if(kind==='kalam')expect(data.notes.some(n=>n.kind==='crux'&&n.text.includes('KAL-077.03')),'Uncertain p.77 silently certified');
   await page.evaluate(()=>window.GnammaReaderModes.setMode('reading'));
   expect(await page.locator('#reader .passage-grid').count()>0,'Normal native reading broken');
   await page.evaluate(()=>window.GnammaReaderModes.setMode('continuous'));
   expect(await page.locator('#reader .passage-grid').count()===count,'Mode transition lost complete text');
   const overflow=await page.evaluate(()=>({w:document.documentElement.clientWidth,s:document.documentElement.scrollWidth}));
   expect(overflow.s<=overflow.w+3,'Horizontal body overflow '+JSON.stringify(overflow));
   expect(errors.length===0,'Runtime errors: '+errors.join(' | '));
   await page.screenshot({path:'qa/tahdhib-native/'+engine+'-'+kind+'-'+size.width+'.png'});
   results.push({engine,kind,viewport:size,status:'PASS',units:count});console.log('PASS NATIVE',engine,kind,size.width+'x'+size.height);
  }catch(e){results.push({engine,kind,viewport:size,status:'FAIL',error:e.message});console.error('FAIL NATIVE',engine,kind,size.width,e.message);await page.screenshot({path:'qa/tahdhib-native/FAIL-'+engine+'-'+kind+'-'+size.width+'.png'}).catch(()=>{});}
  finally{await context.close()}
 }}finally{await browser.close()}
}
fs.writeFileSync('qa/tahdhib-native/results.json',JSON.stringify(results,null,2));
if(results.some(r=>r.status==='FAIL'))process.exit(1);
console.log('PASS all 12 native Daruri/Tahdhib browser combinations; corpus, source links, native menus, private notes, PDFs and migration');
