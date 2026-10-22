/* Navigation/romanization regression: independent temporary browser storage. */
const {chromium}=(()=>{try{return require('playwright')}catch{return require('/usr/local/lib/node_modules/playwright')}})();
const path=require('path'),fs=require('fs'),http=require('http'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.webp':'image/webp'};
(async()=>{
 const server=http.createServer((req,res)=>{
  try{const url=new URL(req.url,'http://localhost'),p=path.resolve(root,'.'+decodeURIComponent(url.pathname));
   if(!p.startsWith(root+path.sep))throw Error('path');
   const file=fs.statSync(p).isDirectory()?path.join(p,'index.html'):p;
   res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
   fs.createReadStream(file).on('error',()=>res.writeHead(404).end()).pipe(res);
  }catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port+'/daruri/';
 const b=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await b.newPage({viewport:{width:1366,height:870}});
 page.setDefaultTimeout(7500);
 const errors=[],out=[];
 page.on('pageerror',e=>errors.push(e.message));
 async function check(name,fn){
  try{await fn();out.push(['PASS',name]);console.log('PASS',name);}
  catch(e){out.push(['FAIL',name,e.message]);console.log('FAIL',name,e.message.slice(0,700));}
 }
 async function search(q){
  if(!(await page.locator('.gns-dialog').count()))await page.locator('#searchBtn').click();
  await page.locator('#gns-query').fill(q);
  await page.waitForTimeout(350);
 }
 async function returnFromBar(){
  await page.locator('#gns-return-bar [data-gns-return="1"]').click();
  await page.locator('#gns-query').waitFor({state:'visible'});
 }
 async function expand(){
  if(!(await page.locator('.gns-expanded').count()))await page.locator('[data-gns-expand="1"]').first().click();
 }
 async function selectFacet(facet){
  await expand();await page.locator('[data-gns-facet="'+facet+'"]').click();
 }
 async function close(){if(await page.locator('.gns-dialog').count())await page.locator('.gns-dialog [data-gns-close]').click();}
 await page.goto(base+'#section=1',{waitUntil:'load'});
 await check('plain spelling and doubled vowels',async()=>{
  const d=await page.evaluate(()=>{
   const o={};for(const q of ['ijtihad','ijtihaad','qiyas','qiyaas','ijma','ijmaa','usool','usul','sunnah','sunna','3illa','taqlid','tawaatur']){
    o[q]=window.GnammaUnifiedSearch.query(q,{mode:'terms'}).total;
   }return o;
  });
  console.log('COUNTS',JSON.stringify(d));
  for(const q of ['ijtihaad','qiyaas','ijmaa','usool','sunnah','3illa'])assert.ok(d[q]>0,'Missing '+q);
  assert.equal(d.qiyaas,d.qiyas);assert.equal(d.ijtihaad,d.ijtihad);
  await search('ij');
  assert.match(await page.locator('.gns-listpane').innerText(),/ijtihād|ijmā/i);
 });
 await check('source paragraph returns to exact filtered results and scroll position',async()=>{
  await search('qiyas');await selectFacet('text');
  const pane=page.locator('#gns-listpane');await pane.evaluate(e=>{e.scrollTop=250});
  const before=await pane.evaluate(e=>e.scrollTop);
  const chosen=page.locator('.gns-result').filter({hasText:'Authorial text · §209'}).first();
  await chosen.click();await page.waitForTimeout(250);
  assert.equal(await page.locator('#gns-return-bar').count(),1);
  await returnFromBar();
  assert.equal(await page.locator('#gns-query').inputValue(),'qiyas');
  assert.equal(await page.locator('[data-gns-facet="text"]').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('.gns-expanded').count(),1);
  assert.ok((await pane.evaluate(e=>e.scrollTop))>0,'scroll offset not restored; had '+before);
  await close();assert.equal(await page.evaluate(()=>location.hash),'#section=1');
 });
 await check('source note popup returns to search, not reading',async()=>{
  await search('N001');await page.locator('.gns-result').first().click();
  const back=page.locator('#infoOverlay [data-gns-return]');
  await back.waitFor({state:'visible'});
  assert.match(await back.innerText(),/search results/i);
  await back.click();
  assert.equal(await page.locator('#gns-query').inputValue(),'N001');
  await close();
 });
 await check('Bidāya application popup returns to search',async()=>{
  await search('B10');await page.locator('.gns-result').first().click();
  const back=page.locator('#infoOverlay [data-gns-return]');
  await back.waitFor({state:'visible'});await back.click();
  assert.equal(await page.locator('#gns-query').inputValue(),'B10');
  await close();
 });
 await check('historical dictionary return restores results and category',async()=>{
  await search('al-Zabīdī');await selectFacet('dictionary');
  await page.locator('.gns-result').first().click();
  await page.waitForURL(/dictionary\.html/);
  const back=page.locator('[data-reader-return]');
  assert.match(await back.innerText(),/search results/i);
  await back.click();
  await page.waitForURL(/#section=1|#gns-results/);
  await page.locator('#gns-query').waitFor({state:'visible'});
  assert.equal(await page.locator('#gns-query').inputValue(),'al-Zabīdī');
  assert.equal(await page.locator('[data-gns-facet=dictionary]').getAttribute('aria-pressed'),'true');
  await close();
 });
 await check('dictionary source section navigates to text and search return persists',async()=>{
  await search('al-Zabīdī');await page.locator('.gns-result').first().click();
  await page.waitForURL(/dictionary\.html/);
  const source=page.locator('[data-read-section]').first();
  await source.click();await page.waitForURL(/\/daruri\/index.html#section=/);
  const returnBtn=page.locator('#gns-return-bar [data-gns-return]');
  await returnBtn.waitFor({state:'visible'});await returnBtn.click();
  await page.locator('#gns-query').waitFor({state:'visible'});
  assert.equal(await page.locator('#gns-query').inputValue(),'al-Zabīdī');
  await close();
 });
 await check('study guide search result returns to results',async()=>{
  await search('Q10');await page.locator('.gns-result').first().click();
  await page.locator('#gns-return-bar').waitFor({state:'visible'});
  await returnFromBar();
  assert.equal(await page.locator('#gns-query').inputValue(),'Q10');
  await close();
 });
 await check('concept index search result returns to results',async()=>{
  await search('Consensus');await selectFacet('concept');
  await page.locator('.gns-result').first().click();
  await page.locator('#gns-return-bar').waitFor({state:'visible'});
  await returnFromBar();
  assert.equal(await page.locator('#gns-query').inputValue(),'Consensus');
  await close();
 });
 await check('al-Mustasfa search result returns to cross-book filtered results',async()=>{
  await search('اجتهاد');await expand();
  await page.locator('#gns-scope').selectOption('library');
  await page.waitForFunction(()=>window.GnammaUnifiedSearch.getEntries().other>3000,{timeout:17000}).catch(()=>{});
  await page.locator('[data-gns-facet=other]').click();
  assert.ok(await page.locator('.gns-result').count()>0);
  await page.locator('.gns-result').first().click();
  await page.waitForURL(/\/al-mustasfa\//);
  await page.locator('#gns-return-bar [data-gns-return]').waitFor({state:'visible'});
  await page.locator('#gns-return-bar [data-gns-return]').click();
  await page.waitForURL(/\/daruri\/index.html/);
  await page.locator('#gns-query').waitFor({state:'visible'});
  assert.equal(await page.locator('#gns-query').inputValue(),'اجتهاد');
  assert.equal(await page.locator('#gns-scope').inputValue(),'library');
  assert.equal(await page.locator('[data-gns-facet=other]').getAttribute('aria-pressed'),'true');
  await close();
 });
 await check('glossary definition opens exact term then returns to results',async()=>{
  await search('qiyās');await selectFacet('dictionary');
  const row=page.locator('.gns-result').filter({hasText:'Technical definition'}).first();
  assert.ok(await row.count()>0,'Expected technical glossary result');
  await row.click();
  await page.locator('#infoOverlay [data-gns-return]').waitFor({state:'visible'});
  assert.match(await page.locator('#detailEyebrow').innerText(),/DICTIONARY|LEXICAL/i);
  await page.locator('#infoOverlay [data-gns-return]').click();
  assert.equal(await page.locator('#gns-query').inputValue(),'qiyās');
  assert.equal(await page.locator('[data-gns-facet=dictionary]').getAttribute('aria-pressed'),'true');
  await close();
 });
 await check('personal note search returns to the same source-filtered results',async()=>{
  await page.locator('[data-route=bookmarks]').first().click();
  await page.locator('[data-rd=new-note]').click();
  await page.locator('#gn-rd-note-title').fill('Research hypothesis');
  await page.locator('#gn-rd-note-body').fill('gns_return_private_annotation_20261022: principle and extension');
  await page.getByRole('button',{name:'Save note'}).click();
  await search('gns_return_private_annotation_20261022');await selectFacet('personal');
  const first=page.locator('.gns-result').first();
  assert.ok(await first.count()>0);
  await first.click();
  await page.locator('#gns-return-bar').waitFor({state:'visible'});
  assert.match(await page.locator('#mainContent').innerText(),/Research hypothesis/);
  await returnFromBar();
  assert.equal(await page.locator('#gns-query').inputValue(),'gns_return_private_annotation_20261022');
  assert.equal(await page.locator('[data-gns-facet=personal]').getAttribute('aria-pressed'),'true');
  await close();
 });
 await check('ordinary dictionary visits retain Back to reading',async()=>{
  const normal=await b.newPage({viewport:{width:1350,height:830}});
  await normal.goto(base+'dictionary.html#view=all&term=qiy%C4%81s',{waitUntil:'load'});
  const btn=normal.locator('[data-reader-return]');
  assert.match(await btn.innerText(),/Back to reading/i);
  await btn.click();
  await normal.waitForURL(/\/daruri\/index.html#section=/);
  assert.equal(await normal.locator('#gns-return-bar').count(),0);
  await normal.close();
 });
 await check('dismiss search return works without deleting personal data',async()=>{
  await search('qiyas');await page.locator('.gns-result').first().click();
  await page.locator('#gns-return-bar [data-gns-return-dismiss]').click();
  assert.equal(await page.locator('#gns-return-bar').count(),0);
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('gnamma-unified-search-return-v2')),null);
 });
 await check('no fatal javascript errors',async()=>assert.deepEqual(errors,[]));
 const mobile=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await mobile.goto(base+'#section=1',{waitUntil:'load'});
 await check('mobile return affordance is in viewport',async()=>{
  await mobile.locator('#searchBtn').click();await mobile.locator('#gns-query').fill('ijtihaad');
  await mobile.waitForTimeout(350);await mobile.locator('.gns-result').first().click();
  const x=await mobile.locator('#gns-return-bar').boundingBox();
  assert.ok(x&&x.x>=0&&x.x+x.width<=392,JSON.stringify(x));
 });
 const small=await b.newPage({viewport:{width:320,height:690},isMobile:true,hasTouch:true});
 await small.goto(base+'#section=1',{waitUntil:'load'});
 await check('320px phone has visible return control without horizontal overflow',async()=>{
  await small.locator('#searchBtn').click();
  await small.locator('#gns-query').fill('qiyaas');
  await small.waitForTimeout(350);
  await small.locator('.gns-result').first().click();
  const geometry=await small.evaluate(()=>{
   const e=document.querySelector('#gns-return-bar'),r=e?.getBoundingClientRect();
   return {viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
     x:r?.x,width:r?.width,y:r?.y,bottom:r?.bottom};
  });
  assert.ok(geometry.width&&geometry.x>=0&&geometry.x+geometry.width<=geometry.viewport+1,JSON.stringify(geometry));
  assert.ok(geometry.scrollWidth<=geometry.viewport+1,JSON.stringify(geometry));
  assert.ok(geometry.bottom<=690,JSON.stringify(geometry));
 });
 await small.close();
 await b.close();await new Promise(ok=>server.close(ok));
 console.log(JSON.stringify({pass:out.filter(x=>x[0]==='PASS').length,failures:out.filter(x=>x[0]==='FAIL')},null,2));
 process.exit(out.some(x=>x[0]==='FAIL')?1:0);
})().catch(e=>{console.error('FATAL',e.stack);process.exit(1)});
