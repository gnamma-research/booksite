const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const root=path.resolve(process.env.BAHR_DIR||path.join(__dirname,'../site'));
const url=process.env.BAHR_URL||'http://127.0.0.1:8766/';
const out=process.env.BAHR_QA_OUTPUT||'qa-artifacts';
fs.mkdirSync(out,{recursive:true});
const ctx={};ctx.window=ctx;vm.createContext(ctx);
const load=k=>{vm.runInContext(fs.readFileSync(path.join(root,'data',k+'.js'),'utf8'),ctx);return ctx.BAHR_DATA[k];};
const catalog=load('catalog'),meta=load('edition');
const records=meta.chunks.flatMap(load);
const checks=[];
function pass(name){checks.push(name);console.log('PASS '+name);}
(async()=>{
 assert.equal(records.length,389);
 for(const f of meta.downloads){assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f.path))).digest('hex'),f.sha256);}
 pass('All edition downloads retain their source hashes');
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('response',r=>{if(r.url().startsWith(url)&&r.status()>=400)errors.push(r.status()+' '+r.url());});
 const go=async route=>{await page.goto(url+'#/'+route);await page.waitForFunction(()=>!document.querySelector('.loading'));};
 const overflow=async name=>{const detail=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,items:[...document.querySelectorAll('body *')].filter(n=>{const b=n.getBoundingClientRect();return b.width&&b.right>innerWidth+1}).slice(0,12).map(n=>({tag:n.tagName,id:n.id,class:n.className,width:n.getBoundingClientRect().width,right:n.getBoundingClientRect().right}))}));if(detail.scroll>detail.width+1){console.error(name,JSON.stringify(detail));await page.screenshot({path:path.join(out,'overflow.png')});}assert(detail.scroll<=detail.width+1,name+' horizontal overflow');};
 await go('home');await page.locator('.chapter').first().waitFor();
 assert.equal(await page.locator('.chapter').count(),4);
 await page.screenshot({path:path.join(out,'home-desktop.png')});
 pass('Home has all four surahs');
 for(const r of records){
  await go('read/'+r.id);await page.locator('#unit-'+r.id).waitFor();
  const actual=await page.locator('.ar-column p').allTextContents();
  assert.deepEqual(actual,r.ar.split('\n').filter(s=>s.trim()));
  assert.equal(await page.locator('.en-column section').count(),r.segments.length);
 }
 pass('All 389 passages render with complete source Arabic and all English segments');
 await page.locator('[data-action="contents"]').last().click();
 assert.equal(await page.locator('.toc-link').count(),389);
 await page.locator('#contents-query').fill('2:255');
 assert(await page.locator('.toc-link').count()>0);
 await page.locator('#sheet-close').click();
 pass('Contents includes every passage and filters by verse');
 await go('read/preface');
 await page.locator('[data-tier="study"]').click();
 await page.locator('[data-action="passage-notes"]').click();
 await page.locator('#sheet[open]').waitFor();
 assert((await page.locator('#sheet-body').innerText()).includes('Translator annotations'));
 await page.locator('#sheet-close').click();
 assert(await page.locator('#unit-preface').isVisible());
 pass('Passage apparatus opens and returns to the text');
 const routes=[['notes','note','id'],['reports','report','id'],['sources','source','note_id']];
 for(const [key,route,field] of routes){
  for(const item of load(key)){
   await go(route+'/'+item[field]);await page.locator('#sheet[open]').waitFor();
   const body=await page.locator('#sheet-body').innerText();
   assert(!/not found|No current annotation matches/.test(body),route+' '+item[field]);
  }
  pass('Every '+key+' route opens ('+ctx.BAHR_DATA[key].length+')');
 }
 for(const route of ['study','indices','dictionary','research','editions','desk','about']){
  await go(route);assert(!(await page.locator('main').innerText()).includes('Unable to open'));
 }
 await go('dictionary');await page.locator('.dictionary-card').first().click();
 await page.locator('#sheet[open]').waitFor();
 assert((await page.locator('#sheet-body').innerText()).includes('Historical source excerpts'));
 const occurrence=page.locator('#sheet-body a[href^="#/read/"]').first();
 const target=await occurrence.getAttribute('href');await occurrence.click();
 await page.waitForFunction(h=>location.hash===h,target);
 const anchor=new URLSearchParams(target.split('?')[1]).get('at');
 await page.locator('[id="'+anchor+'"]').waitFor();
 pass('Dictionary occurrence returns to its exact text anchor');
 await go('search');await page.locator('#search-query').fill('mercy');await page.locator('#search-form button').click();
 await page.waitForFunction(()=>document.querySelector('#search-results .result-count'));
 assert(await page.locator('#search-results .result').count()>0);pass('Full-edition search returns results');
 await go('read/preface');await page.locator('[data-action="save"]').first().click();
 await page.locator('#annotation-text').fill('Browser verification note');await page.locator('#annotation-form button[type="submit"]').click();
 await go('desk');assert((await page.locator('#desk-items').innerText()).includes('Browser verification note'));
 await page.reload();assert((await page.locator('#desk-items').innerText()).includes('Browser verification note'));
 pass('Reading Desk saves notes and preserves them across reload');
 await go('read/preface');await page.locator('[data-language="ar"]').click();
 assert(!await page.locator('.ar-column').isVisible());assert(await page.locator('.en-column').isVisible());
 await page.locator('[data-language="en"]').click();assert(await page.locator('.en-column').isVisible());
 await page.locator('#sheet-close').click();await page.locator('[data-language="ar"]').click();
 pass('Language controls always retain at least one visible language');
 const viewports=[{width:1440,height:1000},{width:390,height:844},{width:844,height:390},{width:320,height:568}];
 for(const viewport of viewports){
  await page.setViewportSize(viewport);
  for(const theme of ['horizon','light','night','manuscript']){
   await go('read/preface');await page.locator('[data-action="settings"]').click();
   await page.locator('button[data-theme="'+theme+'"]').click();
   assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
   await overflow('settings '+viewport.width+' '+theme);
   await page.locator('#sheet-close').click();
   await overflow('reader '+viewport.width+' '+theme);
   const controls=await page.locator('#topbar button:visible').evaluateAll(nodes=>nodes.map(n=>{const b=n.getBoundingClientRect();return {x:b.x,right:b.right,w:b.width,h:b.height};}));
   assert(controls.every(b=>b.x>=-1&&b.right<=viewport.width+1&&b.w>=30&&b.h>=40));
   if(theme==='horizon'||theme==='night')await page.screenshot({path:path.join(out,'reader-'+viewport.width+'-'+theme+'.png')});
  }
  for(const route of ['home','study','indices','dictionary','research','editions']){await go(route);await overflow(route+' '+viewport.width);}
 }
 pass('All four themes and reader tools fit desktop, phone portrait and landscape');
 await page.setViewportSize({width:390,height:844});await go('read/preface');
 for(let i=0;i<3;i++){await page.locator('[data-action="focus"]').click();await overflow('focus '+i);assert(await page.locator('[data-action="settings"]').isVisible());}
 await page.locator('[data-action="settings"]').click();await page.locator('[data-setting="scope"]').selectOption('continuous');
 await page.locator('#sheet-close').click();await page.waitForFunction(()=>document.querySelectorAll('.passage').length===6);
 await page.locator('[data-action="load-more"]').click();await page.waitForFunction(()=>document.querySelectorAll('.passage').length===12);
 pass('Continuous reading appends complete passages');
 assert.deepEqual(errors,[]);pass('No uncaught browser errors or failed reader requests');
 await context.close();
 const offlineContext=await browser.newContext();const offlinePage=await offlineContext.newPage();
 await offlinePage.goto(url+'#/editions');await offlinePage.locator('[data-action="offline"]').waitFor();
 await offlinePage.evaluate(()=>navigator.serviceWorker.ready);await offlinePage.locator('[data-action="offline"]').click();
 await offlinePage.waitForFunction(()=>document.querySelector('#offline-status')?.textContent.includes('complete reader is saved'),{},{timeout:120000});
 await offlineContext.setOffline(true);await offlinePage.goto(url+'#/read/'+catalog[catalog.length-1].id);
 await offlinePage.locator('#unit-'+catalog[catalog.length-1].id).waitFor();
 pass('Offline cache opens the final passage without network access');
 await browser.close();
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({passed:checks.length,checks,passages:389,annotations:209,reports:48,sources:352},null,2));
})().catch(e=>{console.error(e);process.exit(1);});
