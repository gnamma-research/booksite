'use strict';
/* Whole scholarly task journey: H source -> original citation -> return ->
 * English publisher note -> Qur'an note / scoped Hadith -> search and return.
 * Exercise independent local browser contexts only. No external links visited;
 * no personal records, search strings, or logs are transmitted off localhost.
 * WebKit on Linux approximates, but does not certify, native iPhone Safari.
 */
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'../..');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript',
 '.json':'application/json','.css':'text/css','.svg':'image/svg+xml',
 '.woff2':'font/woff2','.woff':'font/woff','.webp':'image/webp'};
const server=http.createServer((req,res)=>{
 let p;
 try{
  const url=new URL(req.url,'http://127.0.0.1');
  p=path.resolve(ROOT,'.'+decodeURIComponent(url.pathname));
  if(!p.startsWith(ROOT+path.sep))throw Error('Path escapes fixture root');
  if(fs.statSync(p).isDirectory())p=path.join(p,'index.html');
  res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream'});
  fs.createReadStream(p).on('error',()=>res.end()).pipe(res);
 }catch(_){res.writeHead(404);res.end('Not found');}
});
const data=[];
async function exercise(name,engine,width,lang,base){
 const mobile=width<600;
 const browser=await engine.launch({headless:true,...(name==='chromium'?{args:['--no-sandbox']}:{})});
 const context=await browser.newContext({viewport:{width,height:844},isMobile:mobile,
  hasTouch:mobile,deviceScaleFactor:mobile?2:1,reducedMotion:'reduce',
  serviceWorkers:'block',acceptDownloads:true});
 await context.addInitScript((readerLang)=>{
  localStorage.setItem('daruri-reader-v2',JSON.stringify({
   n:'31',lang:readerLang,vowels:false,showNotes:true,focusMode:false
  }));
 },lang);
 const page=await context.newPage();
 page.setDefaultTimeout(25000);
 const errors=[],events=[],started=Date.now();
 page.on('pageerror',err=>errors.push(String(err.message)));
 const log=label=>{events.push(label);console.log('PASS '+name+' '+label);};
 try{
  await page.goto(base+'#section=31',{waitUntil:'domcontentloaded'});
  const prefix='#reader .passage-'+(lang==='english'?'en':'ar');
  const opener=page.locator(prefix+' .gn-hadith-inline-marker[data-note-target="HAD-R031"]').first();
  await opener.waitFor({state:'visible'});
  await opener.focus();
  const originalHash=await page.evaluate(()=>location.hash);
  await opener.click();
  const note=page.locator('#gn-scholar-layer .gn-note-entry[data-note-id="HAD-R031"]');
  await note.waitFor({state:'visible'});
  assert.equal(await note.locator('.gn-hadith-compact-sources, .gn-hadith-source-text-link').count(),0);
  assert.equal(await note.locator('.gn-hadith-short-summary').count(),1);
  assert.match(await note.locator('.gn-hadith-context summary').innerText(),/Read Hadith.*2 reports/i);
  assert.equal(await note.locator('[data-hadith-report]').count(),0);
  log('H opens exactly one concise source note in '+lang);

  await note.locator('.gn-hadith-context > summary').click();
  await note.locator('[data-hadith-report]').first().waitFor();
  const reportCards=note.locator('[data-hadith-report]');
  assert.equal(await reportCards.count(),2,'Two distinct source reports remain distinct');
  const ids=await reportCards.evaluateAll(nodes=>nodes.map(x=>x.dataset.hadithReport));
  assert.deepEqual(ids,['muslim:360a','abudawud:492']);
  const sourceUrls=await note.locator('.gn-hadith-report-heading a').evaluateAll(nodes=>nodes.map(x=>x.href));
  assert.deepEqual(sourceUrls,['https://sunnah.com/muslim:360a','https://sunnah.com/abudawud:492']);
  for(let i=0;i<2;i++){
   const card=reportCards.nth(i);
   assert.equal(await card.locator('a[href]').count(),1,'One primary link per report');
   assert.equal(await card.locator('.gn-hadith-biblio').count(),1,'Compact bibliography present');
   assert.equal(await card.locator('.gn-hadith-english').count(),1,'Full English report present');
  }
  assert.equal(await note.locator('.gn-hadith-outbound').count(),0);
  log('H report headings are precise single citations; Arabic and English retained');

  await page.locator('#gn-scholar-layer button[data-gn-close]').click();
  await page.locator('#gn-scholar-layer').waitFor({state:'detached'});
  assert.equal(await page.evaluate(()=>location.hash),originalHash);
  assert.ok(await opener.evaluate(el=>document.activeElement===el),
   'Closing H should return keyboard focus to the originating H symbol');
  log('H closes to exact invoking symbol without changing passage');

  const enNote=page.locator('#reader .passage-en .gn-note-en-ref[data-note-target="N015"]').first();
  await enNote.waitFor({state:'attached'});
  if(await enNote.isVisible()){
   await enNote.click();
   await page.locator('#infoOverlay:not([hidden])').waitFor();
   assert.match(await page.locator('#detailTitle').innerText(),/N015/);
   await page.locator('#detailContent [data-close-reference]').click();
   assert.equal(await page.evaluate(()=>location.hash),originalHash);
   log('English publisher note opens independently and returns to passage');
  }else log('English publisher note exists; language hides it in this mode');

  await page.goto(base+'#section=64',{waitUntil:'domcontentloaded'});
  await page.locator('#reader .passage-grid').first().waitFor();
  const qRef=page.locator('#reader .quran-source-ref[data-note-target="QUR-R064-Q005"]').first();
  const qOpener=(await qRef.count()&&await qRef.isVisible())
   ?qRef:page.locator('#reader [data-gn-notes-open]').first();
  await qOpener.click();
  const qNote=page.locator('#gn-scholar-layer .gn-note-entry[data-note-id="QUR-R064-Q005"]');
  await qNote.waitFor();
  const related=qNote.locator('.gn-hadith-related');
  assert.equal(await related.count(),1,'One scoped related Hadith disclosure');
  await related.locator('summary').click();
  await related.locator('[data-hadith-report]').first().waitFor();
  assert.deepEqual(await related.locator('[data-hadith-report]').evaluateAll(
   items=>items.map(x=>x.dataset.hadithReport)),['abudawud:788']);
  assert.equal(await related.locator('.gn-hadith-report-heading a').getAttribute('href'),
   'https://sunnah.com/abudawud:788');
  log('Qur\'an note shows only its subject-related Hadith evidence');
  await page.locator('#gn-scholar-layer button[data-gn-close]').click();
  await page.locator('#gn-scholar-layer').waitFor({state:'detached'});
  assert.equal(await page.evaluate(()=>location.hash),'#section=64');
  log('Qur\'an and related Hadith return to their starting section');

  await page.locator('#searchBtn').click();
  await page.locator('#gns-query').fill('qiyas');
  const first=page.locator('.gns-result').first();
  await first.waitFor();
  await first.click();
  await page.locator('#gns-return-bar [data-gns-return="1"]').waitFor();
  await page.locator('#gns-return-bar [data-gns-return="1"]').click();
  await page.locator('#gns-query').waitFor({state:'visible'});
  assert.equal(await page.locator('#gns-query').inputValue(),'qiyas');
  log('Search result returns to its original query and result context');

  assert.deepEqual(errors,[],'Page errors: '+errors.join('; '));
  return{name,language:lang,viewport:width,outcome:'pass',seconds:(Date.now()-started)/1000,
   checks:events};
 }finally{await context.close();await browser.close();}
}
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port+'/daruri/';
 try{
  data.push(await exercise('chromium',chromium,1150,'parallel',base));
  data.push(await exercise('webkit',webkit,390,'english',base));
  console.log('PASS: two complete, local-only scholarly source journeys in desktop and mobile-style browsers.');
 }finally{
  server.close();
  const dir=path.join(__dirname,'scholarly-journey-artifacts');fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'qa-results.json'),JSON.stringify({
   kind:'synthetic browser regression, not real-user research',created:'2026-10-23',runs:data
  },null,2));
 }
})().catch(err=>{console.error(err);process.exitCode=1;});
