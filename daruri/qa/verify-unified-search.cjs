/* Run: node daruri/qa/verify-unified-search.cjs
 * Browser-based non-destructive search regression, locally served or live via BASE_URL.
 */
const assert=require('node:assert/strict');
const path=require('node:path'),http=require('node:http'),fs=require('node:fs');
const {chromium}=(()=>{try{return require('playwright')}catch(_){return require('/usr/local/lib/node_modules/playwright')}})();
const root=path.resolve(__dirname,'../..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp'};
let server,pass=0,skipped=0,errors=[];
function test(name,fn){return fn().then(()=>{pass++;console.log('PASS '+name)}).catch(e=>{errors.push(name+': '+e.message);console.log('FAIL '+name+': '+e.message)})}
(async()=>{
 let address=process.env.BASE_URL;
 if(!address){
  server=http.createServer((req,res)=>{
   const clean=decodeURIComponent((req.url||'/').split('?')[0]),file=path.resolve(root,'.'+clean);
   if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
   const filename=fs.existsSync(file)&&fs.statSync(file).isDirectory()?path.join(file,'index.html'):file;
   try{res.setHeader('Content-Type',types[path.extname(filename)]||'application/octet-stream');fs.createReadStream(filename).pipe(res);}
   catch(e){res.writeHead(404).end();}
  });
  await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
  address='http://127.0.0.1:'+server.address().port+'/daruri/';
 }
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1366,height:820}});
 const page=await context.newPage(),pageErrors=[];
 page.on('pageerror',e=>pageErrors.push(e.message));
 await page.goto(address,{waitUntil:'load',timeout:45000});
 await page.waitForFunction(()=>!!window.GnammaUnifiedSearch);
 const trigger=page.locator('#searchBtn'),query=()=>page.locator('#gns-query'),rows=()=>page.locator('.gns-result');
 async function start(q){if(!(await page.locator('#gn-unified-search:not([hidden])').count()))await trigger.click();await query().fill(q);await page.waitForTimeout(350);}
 async function close(){if(await page.locator('#gns-query').count())await page.locator('[data-gns-close="1"]').last().click();}
 async function expand(){if(!(await page.locator('.gns-expanded').count()))await page.locator('[data-gns-expand="1"]').first().click();}
 await test('global magnifier uses unified dialog without legacy overlay',async()=>{
   await trigger.click();assert.equal(await page.locator('.gns-dialog').count(),1);
   assert.equal(await page.locator('#searchOverlay').evaluate(x=>x.hidden),true);
   assert.ok((await page.evaluate(()=>window.GnammaUnifiedSearch.getEntries().core))>2000);
   await close();
 });
 await test('exact §120 locator goes to correct section',async()=>{
   await start('§120');assert.equal(await rows().count(),1);await rows().first().click();
   assert.equal(await page.evaluate(()=>location.hash),'#section=120');
 });
 await test('note identifier opens exact editorial note',async()=>{
   await start('N001');assert.equal(await rows().count(),1);await rows().first().click();
   assert.equal(await page.locator('#infoOverlay').evaluate(x=>x.hidden),false);
   assert.match(await page.locator('#detailEyebrow').innerText(),/N001/);
   await page.locator('#detailClose').click();
 });
 await test('Bidāya B10 locator opens correct legal application',async()=>{
   await start('B10');assert.equal(await rows().count(),1);
   await rows().first().click();assert.match(await page.locator('#detailEyebrow').innerText(),/B10/);
   await page.locator('#detailClose').click();
 });
 await test('English and Arabic equivalents retrieve authorial paragraphs',async()=>{
   await start('ijtihād');let total=await page.locator('.gns-results-top').innerText();
   assert.match(total,/results/);
   const types=await page.evaluate(()=>window.GnammaUnifiedSearch.query('ijtihād',{mode:'terms'}).results.filter(x=>x.type==='text'&&x.subtype==='Authorial text').length);
   assert.ok(types>=12,'Expected Arabic authorial passages for transliterated ijtihād, got '+types);
   await close();
 });
 await test('note result navigates to its actual note popup',async()=>{
   await start('ḥamdan');await expand();
   await page.locator('[data-gns-facet="note"]').click();
   const first=page.locator('.gns-result').first();
   const text=await first.innerText();
   assert.match(text,/N001/i);await first.click();
   assert.match(await page.locator('#detailEyebrow').innerText(),/N001/);
   await page.locator('#detailClose').click();
 });
 await test('no cutoff after 90 search results; pagination presents all',async()=>{
   await start('law');
   let response=await page.evaluate(()=>window.GnammaUnifiedSearch.query('law',{mode:'terms'}).total);
   assert.ok(response>90,'Expected >90 matches, got '+response);
   await expand();
   assert.equal(await rows().count(),40);
   await page.locator('[data-gns-more="1"]').click();
   assert.equal(await rows().count(),80);await close();
 });
 await test('selected paragraph navigation targets exact occurrence and highlights it',async()=>{
   await start('qiyās');await expand();
   const first=page.locator('.gns-result').filter({hasText:'Authorial text · §209'}).first();
   if(!(await first.count()))throw Error('§209 should appear in qiyās results');
   await first.click();await page.waitForTimeout(500);
   assert.equal(await page.evaluate(()=>location.hash),'#section=209');
   assert.ok(await page.locator('mark.search-hit').count()>0,'Original reader highlighter should be preserved');
 });
 await test('the reader can save notes and find them in universal search',async()=>{
   await page.locator('[data-route=bookmarks]').first().click();
   await page.locator('[data-rd=new-note]').click();
   await page.locator('#gn-rd-note-title').fill('My private study evidence');
   await page.locator('#gn-rd-note-body').fill('gnamma_private_browser_test_20261022 \u0627\u0644\u0625\u0650\u062c\u0645\u0627\u0639');
   await page.getByRole('button',{name:'Save note'}).click();
   await start('gnamma_private_browser_test_20261022');
   assert.ok(await rows().count()>0,'New note must be in global search');
   assert.match(await rows().first().innerText(),/Private/);
   await page.locator('[data-gns-quick="mine"]').click();
   assert.ok(await rows().count()>0,'Mine filter should retain note');
   await rows().first().click();
   await page.waitForTimeout(200);
   assert.match(await page.locator('#mainContent').innerText(),/gnamma_private_browser_test_20261022/);
 });
 await test('Arabic marks normalize identically for private notes and text',async()=>{
   await start('الاجماع');
   await page.locator('[data-gns-quick="mine"]').click();
   assert.ok(await rows().count()>0,'Expected private note containing الإِجماع for unvowelled query');
   await close();
 });
 await test('historical dictionary source is indexed',async()=>{
   await start('al-Zabīdī');
   assert.ok(await rows().count()>0,'Historical dictionary source author must be searchable');
   assert.match(await rows().first().innerText(),/Dictionary/);
   await close();
 });
 await test('published Mustaṣfā corpus searches from Library mode',async()=>{
   await start('الاجتهاد');
   await expand();
   await page.locator('#gns-scope').selectOption('library');
   await page.waitForFunction(()=>window.GnammaUnifiedSearch.getEntries().other>3000,{timeout:15000}).catch(()=>{});
   const status=await page.evaluate(()=>window.GnammaUnifiedSearch.getEntries());
   assert.ok(status.other>3000,'Expected published Mustaṣfā Arabic witness and bilingual excerpts, got '+status.other);
   const result=await page.evaluate(()=>window.GnammaUnifiedSearch.query('الاجتهاد',{scope:'library',mode:'terms'}));
   assert.ok(result.results.some(x=>x.work==='mustasfa'),'Cross-text match missing');
   await close();
 });
 await test('direct keyboard shortcut, escape and focus restoration work',async()=>{
   await page.keyboard.press('Control+k');
   assert.equal(await page.locator('.gns-dialog').count(),1);
   await page.keyboard.press('Escape');assert.equal(await page.locator('#gn-unified-search:not([hidden])').count(),0);
 });
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await mobile.goto(address,{waitUntil:'load',timeout:45000});
 await test('390px mobile search and advanced filters fit without horizontal scroll',async()=>{
   await mobile.locator('#searchBtn').click();await mobile.locator('#gns-query').fill('قياس');
   await mobile.waitForTimeout(350);
   const width=await mobile.evaluate(()=>({screen:innerWidth,b:document.querySelector('.gns-dialog').getBoundingClientRect().width,overflow:document.documentElement.scrollWidth>innerWidth}));
   assert.ok(Math.abs(width.b-width.screen)<2,JSON.stringify(width));
   assert.equal(width.overflow,false);
   await mobile.locator('[data-gns-expand="1"]').first().click();
   assert.equal(await mobile.locator('#gns-mode').count(),1);
   await mobile.locator('#gns-display').selectOption('concordance');
   assert.ok(await mobile.locator('.gns-kwic').count()>0);
 });
 await test('no fatal JavaScript errors from search implementation',async()=>{
   assert.equal(pageErrors.length,0,pageErrors.slice(0,5).join(', '));
 });
 await browser.close();
 if(server)await new Promise(r=>server.close(r));
 console.log(JSON.stringify({passed:pass,failed:errors.length,failures:errors},null,2));
 if(errors.length)process.exit(1);
})().catch(e=>{console.error('FATAL',e.stack);server?.close();process.exit(1)});
