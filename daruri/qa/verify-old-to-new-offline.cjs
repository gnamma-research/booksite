'use strict';
/* Isolated local browser upgrade: OLD cached reader -> NEW revisioned worker ->
 * offline reload. Never requests live site or private user data. The test server
 * delivers tiny synthetic HTML/JS to measure the actual authored SW lifecycle. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),http=require('node:http');
const {chromium,webkit}=require('playwright');
const ROOT=path.resolve(__dirname,'..'),REPO=ROOT.parent;
const OUT=path.join(__dirname,'cache-audit-artifacts');fs.mkdirSync(OUT,{recursive:true});
const OLD="daruri13-lesson12-method-20261024",NEW="20261025-audit-cache1";
const OLD_SW=cp.execFileSync('git',['show','6e0580e482a55ffea272771da6c4f08f248ce139:daruri/sw.js'],{cwd:REPO,encoding:'utf8'});
const NEW_SW=fs.readFileSync(path.join(ROOT,'sw.js'),'utf8');
if(OLD_SW===NEW_SW)throw Error('No updated service worker in staged rollout');
let phase="old";
const results=[],failures=[],requests=[];
function html(){
 const rev=phase==='old'?'20261023-qiyas-forms1':NEW;
 const worker=phase==='old'?OLD:NEW;
 return '<!doctype html><html><head><meta charset="utf-8"><title>Gnamma offline upgrade audit</title></head><body>'+
  '<h1 id="qa-state">Reader upgrade '+phase+'</h1>'+
  '<script src="gnamma-word-context.js?v='+rev+'"></script>'+
  '<script>navigator.serviceWorker.register("sw.js?v='+worker+'").catch(e=>{document.body.dataset.registrationError=String(e)})</script>'+
  '</body></html>';
}
const server=http.createServer((req,res)=>{
 let url;try{url=new URL(req.url,'http://localhost')}catch(_){res.writeHead(400);res.end();return;}
 const p=url.pathname,asset=p.split('/').pop();
 requests.push({phase,path:p,query:url.search});
 const rootPage=(p==='/daruri/'||p==='/daruri/index.html');
 let type='text/plain; charset=utf-8',body='';
 if(rootPage){type='text/html; charset=utf-8';body=html();}
 else if(p==='/daruri/sw.js'){type='text/javascript; charset=utf-8';body=phase==='old'?OLD_SW:NEW_SW;}
 else if(asset==='gnamma-word-context.js'){type='text/javascript; charset=utf-8';body='window.__qaReaderAsset="'+phase+'";';}
 else if(/\.(?:js|mjs)$/.test(asset)){type='text/javascript; charset=utf-8';body='/* synthetic cached library */';}
 else if(/\.(?:css)$/.test(asset)){type='text/css; charset=utf-8';body='/* synthetic style */';}
 else if(/\.(?:html)$/.test(asset)){type='text/html; charset=utf-8';body='<p>Offline reader test</p>';}
 else if(/\.(?:json|webmanifest)$/.test(asset)){type='application/json';body='{}';}
 else if(/\.(?:svg)$/.test(asset)){type='image/svg+xml';body='<svg xmlns="http://www.w3.org/2000/svg"></svg>';}
 else if(/\.(?:ttf|woff2|png|pdf|webp|zip)$/.test(asset)){
  // Optional non-code assets can fail; the loader should keep the core book.
  res.writeHead(404,{'cache-control':'no-store'});res.end();return;
 }
 else{type='text/plain';body='ok';}
 res.writeHead(200,{'content-type':type,'cache-control':'no-store','content-length':Buffer.byteLength(body)});res.end(body);
});
async function workerState(page){
 return page.evaluate(async()=>{
  const r=await navigator.serviceWorker.getRegistration();
  return {secure:isSecureContext,available:'serviceWorker' in navigator,
   controller:navigator.serviceWorker.controller?.scriptURL||'',
   active:r?.active?.scriptURL||'',waiting:r?.waiting?.scriptURL||'',
   installing:r?.installing?.scriptURL||'',
   caches:await caches.keys()};
 });
}
async function waitForActive(page,revision,label){
 const deadline=Date.now()+60000;
 while(Date.now()<deadline){
  const status=await workerState(page);
  if(status.active.includes(revision))return;
  await page.waitForTimeout(400);
 }
 throw Error('Service worker '+label+' did not finish installation: '+JSON.stringify(await workerState(page)));
}
async function waitForControl(page,label,revision,origin){
 const controlled=async()=>page.waitForFunction(rev=>
  !!navigator.serviceWorker.controller?.scriptURL.includes(rev),
  revision,{timeout:12000}).then(()=>true).catch(()=>false);
 if(await controlled())return;
 // The WebKit context may not acquire a controller on the first reload;
 // navigate to a fresh same-scope URL before calling this a site regression.
 for(let i=0;i<3;i++){
  await page.goto(origin+'/daruri/index.html?qaControllerRetry='+label+'-'+i,
   {waitUntil:'domcontentloaded',timeout:25000});
  if(await controlled())return;
 }
 throw Error('SW '+label+' active but page not controlled after scoped navigation: '+
   JSON.stringify(await workerState(page)));
}
async function check(api,name,origin){
 phase='old';
 const browser=await api.launch({headless:true,...(name==='chromium'?{args:['--no-sandbox']}:{})});
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'allow'});
 const page=await ctx.newPage();
 page.on('pageerror',e=>console.log('PAGE ERROR '+name+' '+e.message));
 try{
  await page.goto(origin+'/daruri/',{waitUntil:'domcontentloaded',timeout:60000});
  await waitForActive(page,OLD,'old');
  await page.reload({waitUntil:'domcontentloaded',timeout:60000});
  await waitForControl(page,'old',OLD,origin);
  const old=await page.evaluate(async()=>{
   localStorage.setItem('gnamma-qa-private-sentinel','preserve without touching private reader notes');
   const cachesList=await caches.keys();
   const key='gnamma-word-context.js?v=20261023-qiyas-forms1';
   const response=await caches.match(key);
   return {asset:window.__qaReaderAsset,keys:cachesList,oldResource:await response?.text()};
  });
  assert.equal(old.asset,'old','Initial local snapshot was not loaded');
  assert(old.keys.some(k=>k.includes(OLD)),'Old cache was not installed');
  assert(old.oldResource?.includes('__qaReaderAsset="old"'),'Old library was not precached');
  phase='new';
  await page.reload({waitUntil:'domcontentloaded',timeout:60000});
  await waitForActive(page,NEW,'new');
  await waitForControl(page,'new',NEW,origin);
  await page.reload({waitUntil:'domcontentloaded',timeout:60000});
  const updated=await page.evaluate(async()=>{
   const all=await caches.keys();
   const resource=await caches.match('gnamma-word-context.js?v=20261025-audit-cache1');
   return {asset:window.__qaReaderAsset,keys:all,
    newResource:await resource?.text(),
    sentinel:localStorage.getItem('gnamma-qa-private-sentinel')};
  });
  assert.equal(updated.asset,'new','New online page did not load');
  assert(updated.keys.some(k=>k.includes(NEW)),'New offline cache did not install');
  assert(!updated.keys.some(k=>k.includes(OLD)),'Old cache was not retired');
  assert(updated.newResource?.includes('__qaReaderAsset="new"'),'New library absent in new cache');
  assert.equal(updated.sentinel,'preserve without touching private reader notes','Local browser user data cleared');
  await ctx.setOffline(true);
  await page.reload({waitUntil:'domcontentloaded',timeout:60000});
  const offline=await page.evaluate(()=>({asset:window.__qaReaderAsset,
   worker:navigator.serviceWorker.controller?.scriptURL||'',
   title:document.getElementById('qa-state')?.textContent||'',
   sentinel:localStorage.getItem('gnamma-qa-private-sentinel')}));
  assert.equal(offline.asset,'new','Offline reload resurrected the old pre-release script');
  assert(offline.worker.includes(NEW),'Wrong worker controls offline reader');
  assert.equal(offline.sentinel,updated.sentinel,'Offline upgrade erased local state');
  results.push({engine:name,old,updated,offline});
  console.log('PASS UPGRADE '+name+' old->new->offline, no private data loss');
 }catch(e){const message=String(e.stack||e).slice(0,3000);
  const state=await workerState(page).catch(()=>({unavailable:true}));
  failures.push({engine:name,error:message,state});
  console.log('FAIL UPGRADE '+name+' '+message+' STATE '+JSON.stringify(state));
 }finally{await ctx.close();await browser.close();}
}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{
  const base='http://127.0.0.1:'+server.address().port;
  await check(chromium,'chromium',base);
  await check(webkit,'webkit',base);
 }finally{
  server.close();
  fs.writeFileSync(path.join(OUT,'old-to-new-offline.json'),JSON.stringify({results,failures,requestCounts:requests.reduce((acc,r)=>{
   acc[r.phase]=(acc[r.phase]||0)+1;return acc;},{})},null,2));
  console.log('UPGRADE SUMMARY '+JSON.stringify({passed:results.length,failed:failures.length,errors:failures.map(x=>({engine:x.engine,error:x.error.slice(0,500)}))}));
 }
 if(failures.length)process.exitCode=1;
})().catch(e=>{server.close();console.error(e.stack||e);process.exitCode=1;});
